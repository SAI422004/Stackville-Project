export type Severity = 'high' | 'medium' | 'low';
export type ReviewStatus = 'pending' | 'accepted' | 'dismissed';

export interface Party {
	role: string;
	name: string;
}

export interface Paragraph {
	id: string;
	number: string;
	text: string;
}

export interface Section {
	id: string;
	number: string;
	heading: string;
	paragraphs: Paragraph[];
}

export interface Contract {
	id: string;
	title: string;
	effectiveDate: string;
	parties: Party[];
	sections: Section[];
}

export interface Anchor {
	paragraphId: string;
	start: number;
	end: number;
	quote?: string;
	endParagraphId?: string;
}

export interface Finding {
	id: string;
	severity: Severity;
	category: string;
	title: string;
	explanation: string;
	confidence: number;
	anchor: Anchor | null;
	suggestedEdit: string | null;
}

export interface FindingsPayload {
	agent?: {
		name?: string;
		version?: string;
		analyzedAt?: string;
		model?: string;
	};
	findings: Finding[];
}

export interface ReviewItemState {
	status: ReviewStatus;
	comment?: string;
	commentUpdatedAt?: string;
	isEditApplied?: boolean;
}

export type ReviewStateMap = Record<string, ReviewItemState>;

export type AnchorResolutionStatus =
	| 'exact-match'
	| 'quote-fallback'
	| 'cross-paragraph'
	| 'unmatched'
	| 'null-anchor';

export interface ResolvedAnchorSpan {
	paragraphId: string;
	start: number;
	end: number;
	isStartParagraph: boolean;
	isEndParagraph: boolean;
	status: AnchorResolutionStatus;
	resolvedQuote: string;
}

export interface AnnotationSegment {
	id: string;
	start: number;
	end: number;
	text: string;
	findingIds: string[];
	hasOverlap: boolean;
	isActive: boolean;
	dominantSeverity?: Severity;
}

export interface WordDiffToken {
	type: 'added' | 'removed' | 'unchanged';
	value: string;
}

export type SeverityFilter = 'all' | 'high' | 'medium' | 'low';
export type StatusFilter = 'all' | 'pending' | 'accepted' | 'dismissed';
export type SortOption = 'document' | 'severity' | 'status' | 'confidence';
