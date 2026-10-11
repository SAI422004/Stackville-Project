import type {
	Contract,
	Finding,
	FindingsPayload,
	ReviewItemState,
	ReviewStateMap,
	ReviewStatus,
	Severity,
	SeverityFilter,
	StatusFilter,
	SortOption
} from '../types';
import { calculateDocumentRisk, resolveFindingSpans } from '../utils/annotations';
import rawFindings from '../data/findings.json';
import rawContract from '../data/sample-contract.json';

const isBrowser = typeof window !== 'undefined';
const STORAGE_KEY = 'northwind_ai_document_review_state_v1';

class ReviewStore {
	contract = rawContract as Contract;
	allFindings: Finding[] = (rawFindings as FindingsPayload).findings;
	agentMetadata = (rawFindings as FindingsPayload).agent;

	// State
	reviewState = $state<ReviewStateMap>({});
	selectedFindingId = $state<string | null>(null);
	severityFilter = $state<SeverityFilter>('all');
	statusFilter = $state<StatusFilter>('all');
	categoryFilter = $state<string>('all');
	searchQuery = $state<string>('');
	sortBy = $state<SortOption>('document');
	mobileTab = $state<'findings' | 'document' | 'details'>('findings');
	appliedEdits = $state<Record<string, boolean>>({});
	showKeyboardShortcuts = $state<boolean>(false);
	showExportModal = $state<boolean>(false);
	highlightTargetParagraphId = $state<string | null>(null);

	// Paragraph lookup map
	paragraphsMap = new Map<string, string>();
	paragraphSectionMap = new Map<string, { sectionNumber: string; sectionHeading: string }>();

	constructor() {
		this.initParagraphsMap();
		this.loadFromStorage();
		// Auto-select the first high severity finding by default if none selected
		if (!this.selectedFindingId && this.allFindings.length > 0) {
			const firstHigh = this.allFindings.find((f) => f.severity === 'high');
			this.selectedFindingId = firstHigh ? firstHigh.id : this.allFindings[0].id;
		}
	}

	private initParagraphsMap() {
		for (const section of this.contract.sections) {
			for (const p of section.paragraphs) {
				this.paragraphsMap.set(p.id, p.text);
				this.paragraphSectionMap.set(p.id, {
					sectionNumber: section.number,
					sectionHeading: section.heading
				});
			}
		}
	}

	private loadFromStorage() {
		if (!isBrowser) return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed && typeof parsed === 'object') {
					this.reviewState = parsed.reviewState || {};
					if (parsed.appliedEdits && typeof parsed.appliedEdits === 'object') {
						this.appliedEdits = parsed.appliedEdits;
					}
				}
			}
		} catch (e) {
			console.error('Failed to load review state from localStorage:', e);
		}
	}

	private persistToStorage() {
		if (!isBrowser) return;
		try {
			const data = {
				reviewState: this.reviewState,
				appliedEdits: this.appliedEdits,
				timestamp: new Date().toISOString()
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch (e) {
			console.error('Failed to save review state to localStorage:', e);
		}
	}

	getFindingStatus(findingId: string): ReviewStatus {
		return this.reviewState[findingId]?.status || 'pending';
	}

	getFindingComment(findingId: string): { comment?: string; updatedAt?: string } {
		const item = this.reviewState[findingId];
		return {
			comment: item?.comment,
			updatedAt: item?.commentUpdatedAt
		};
	}

	isEditApplied(findingId: string): boolean {
		return !!this.appliedEdits[findingId];
	}

	// Actions
	selectFinding(id: string | null, opts: { scrollToDoc?: boolean; mobileView?: 'document' | 'details' } = {}) {
		this.selectedFindingId = id;

		if (id) {
			const finding = this.allFindings.find((f) => f.id === id);
			if (finding && finding.anchor) {
				this.highlightTargetParagraphId = finding.anchor.paragraphId;
				if (opts.scrollToDoc) {
					this.scrollToParagraph(finding.anchor.paragraphId);
				}
			}
			if (opts.mobileView) {
				this.mobileTab = opts.mobileView;
			}
		}
	}

	scrollToParagraph(paragraphId: string) {
		if (!isBrowser) return;
		this.highlightTargetParagraphId = paragraphId;
		setTimeout(() => {
			const el = document.getElementById(paragraphId);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}, 50);
	}

	acceptFinding(id: string, advanceNext = true) {
		const current = this.reviewState[id] || { status: 'pending' };
		this.reviewState[id] = {
			...current,
			status: 'accepted'
		};
		this.persistToStorage();
		if (advanceNext) {
			this.nextFinding();
		}
	}

	dismissFinding(id: string, advanceNext = true) {
		const current = this.reviewState[id] || { status: 'pending' };
		this.reviewState[id] = {
			...current,
			status: 'dismissed'
		};
		this.persistToStorage();
		if (advanceNext) {
			this.nextFinding();
		}
	}

	resetFindingStatus(id: string) {
		const current = this.reviewState[id];
		if (current) {
			this.reviewState[id] = {
				...current,
				status: 'pending'
			};
			this.persistToStorage();
		}
	}

	setComment(id: string, comment: string) {
		const current = this.reviewState[id] || { status: 'pending' };
		const trimmed = comment.trim();
		if (trimmed) {
			this.reviewState[id] = {
				...current,
				comment: trimmed,
				commentUpdatedAt: new Date().toISOString()
			};
		} else {
			// Empty comment deletes it
			const { comment: _, commentUpdatedAt: __, ...rest } = current;
			this.reviewState[id] = rest as ReviewItemState;
		}
		this.persistToStorage();
	}

	deleteComment(id: string) {
		const current = this.reviewState[id];
		if (current && current.comment) {
			const { comment: _, commentUpdatedAt: __, ...rest } = current;
			this.reviewState[id] = rest as ReviewItemState;
			this.persistToStorage();
		}
	}

	toggleApplyEdit(id: string) {
		this.appliedEdits[id] = !this.appliedEdits[id];
		this.persistToStorage();
	}

	resetAllReviewState() {
		this.reviewState = {};
		this.appliedEdits = {};
		if (isBrowser) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	nextFinding() {
		const list = this.filteredFindings;
		if (list.length === 0) return;
		const currentIndex = list.findIndex((f) => f.id === this.selectedFindingId);
		const nextIndex = currentIndex >= 0 && currentIndex < list.length - 1 ? currentIndex + 1 : 0;
		this.selectFinding(list[nextIndex].id, { scrollToDoc: true });
	}

	prevFinding() {
		const list = this.filteredFindings;
		if (list.length === 0) return;
		const currentIndex = list.findIndex((f) => f.id === this.selectedFindingId);
		const prevIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
		this.selectFinding(list[prevIndex].id, { scrollToDoc: true });
	}

	// Computed Getters
	get currentFinding(): Finding | null {
		if (!this.selectedFindingId) return null;
		return this.allFindings.find((f) => f.id === this.selectedFindingId) || null;
	}

	get allCategories(): string[] {
		const cats = new Set<string>();
		for (const f of this.allFindings) {
			cats.add(f.category);
		}
		return Array.from(cats).sort();
	}

	get stats() {
		const total = this.allFindings.length;
		let accepted = 0;
		let dismissed = 0;

		for (const f of this.allFindings) {
			const st = this.getFindingStatus(f.id);
			if (st === 'accepted') accepted++;
			else if (st === 'dismissed') dismissed++;
		}

		const reviewed = accepted + dismissed;
		const remaining = total - reviewed;
		const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;
		const isComplete = total > 0 && remaining === 0;

		return {
			total,
			reviewed,
			accepted,
			dismissed,
			remaining,
			percent,
			isComplete
		};
	}

	get riskSummary() {
		return calculateDocumentRisk(this.allFindings);
	}

	get filteredFindings(): Finding[] {
		let list = [...this.allFindings];

		// Severity filter
		if (this.severityFilter !== 'all') {
			list = list.filter((f) => f.severity === this.severityFilter);
		}

		// Status filter
		if (this.statusFilter !== 'all') {
			list = list.filter((f) => this.getFindingStatus(f.id) === this.statusFilter);
		}

		// Category filter
		if (this.categoryFilter !== 'all') {
			list = list.filter((f) => f.category === this.categoryFilter);
		}

		// Search query
		if (this.searchQuery.trim()) {
			const q = this.searchQuery.toLowerCase().trim();
			list = list.filter(
				(f) =>
					f.title.toLowerCase().includes(q) ||
					f.explanation.toLowerCase().includes(q) ||
					f.category.toLowerCase().includes(q) ||
					f.id.toLowerCase().includes(q) ||
					(f.anchor?.quote && f.anchor.quote.toLowerCase().includes(q))
			);
		}

		// Sort
		const severityWeight: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
		if (this.sortBy === 'severity') {
			list.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
		} else if (this.sortBy === 'status') {
			const statusWeight = (id: string) => {
				const st = this.getFindingStatus(id);
				if (st === 'pending') return 3;
				if (st === 'accepted') return 2;
				return 1;
			};
			list.sort((a, b) => statusWeight(b.id) - statusWeight(a.id));
		} else if (this.sortBy === 'confidence') {
			list.sort((a, b) => b.confidence - a.confidence);
		}
		// 'document' preserves original AI agent order which naturally matches document order

		return list;
	}

	get findingsByParagraph(): Map<string, Finding[]> {
		const map = new Map<string, Finding[]>();
		for (const f of this.allFindings) {
			const spans = resolveFindingSpans(f, this.paragraphsMap);
			for (const s of spans) {
				const current = map.get(s.paragraphId) || [];
				if (!current.some((item) => item.id === f.id)) {
					current.push(f);
					map.set(s.paragraphId, current);
				}
			}
		}
		return map;
	}
}

export const reviewStore = new ReviewStore();
