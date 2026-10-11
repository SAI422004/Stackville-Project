import type {
	Finding,
	ResolvedAnchorSpan,
	AnnotationSegment,
	Severity,
	WordDiffToken
} from '../types';

/**
 * Resolves an anchor for a finding against the loaded paragraph map.
 * Supports:
 * - Normal single-paragraph anchors with exact offsets
 * - Broken/shifted offsets with safe quote-search fallback (e.g. f-20)
 * - Cross-paragraph spans across startParagraph and endParagraph (e.g. f-02)
 * - Document-level findings with anchor: null (e.g. f-09)
 */
export function resolveFindingSpans(
	finding: Finding,
	paragraphsMap: Map<string, string>
): ResolvedAnchorSpan[] {
	if (!finding.anchor) {
		return [];
	}

	const { paragraphId, start, end, quote, endParagraphId } = finding.anchor;
	const isCrossPara = endParagraphId && endParagraphId !== paragraphId;

	if (isCrossPara) {
		const spans: ResolvedAnchorSpan[] = [];
		const startText = paragraphsMap.get(paragraphId);
		const endText = paragraphsMap.get(endParagraphId);

		if (startText !== undefined) {
			const safeStart = Math.max(0, Math.min(start, startText.length));
			spans.push({
				paragraphId,
				start: safeStart,
				end: startText.length,
				isStartParagraph: true,
				isEndParagraph: false,
				status: 'cross-paragraph',
				resolvedQuote: startText.slice(safeStart)
			});
		}

		if (endText !== undefined) {
			const safeEnd = Math.max(0, Math.min(end, endText.length));
			spans.push({
				paragraphId: endParagraphId,
				start: 0,
				end: safeEnd,
				isStartParagraph: false,
				isEndParagraph: true,
				status: 'cross-paragraph',
				resolvedQuote: endText.slice(0, safeEnd)
			});
		}

		return spans;
	}

	// Single-paragraph anchor
	const paraText = paragraphsMap.get(paragraphId);
	if (paraText === undefined) {
		return [];
	}

	const safeStart = Math.max(0, Math.min(start, paraText.length));
	const safeEnd = Math.max(safeStart, Math.min(end, paraText.length));
	const exactSlice = paraText.slice(safeStart, safeEnd);

	// Check if exact slice matches quote
	if (!quote || exactSlice === quote) {
		return [
			{
				paragraphId,
				start: safeStart,
				end: safeEnd,
				isStartParagraph: true,
				isEndParagraph: true,
				status: 'exact-match',
				resolvedQuote: exactSlice
			}
		];
	}

	// Mismatched quote fallback: Search if the intended quote is present elsewhere in this paragraph
	const quoteIndex = paraText.indexOf(quote);
	if (quoteIndex !== -1) {
		return [
			{
				paragraphId,
				start: quoteIndex,
				end: quoteIndex + quote.length,
				isStartParagraph: true,
				isEndParagraph: true,
				status: 'quote-fallback',
				resolvedQuote: quote
			}
		];
	}

	// Fallback: If quote cannot be found anywhere in the paragraph, use the character offsets safely
	return [
		{
			paragraphId,
			start: safeStart,
			end: safeEnd,
			isStartParagraph: true,
			isEndParagraph: true,
			status: 'unmatched',
			resolvedQuote: exactSlice
		}
	];
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
	high: 3,
	medium: 2,
	low: 1
};

/**
 * Slices a paragraph's plain text into non-overlapping contiguous segments.
 * Correctly handles overlapping spans from multiple findings without duplicating text.
 */
export function buildParagraphSegments(
	paragraphId: string,
	text: string,
	findings: Finding[],
	paragraphsMap: Map<string, string>,
	activeFindingId: string | null
): AnnotationSegment[] {
	if (!text) {
		return [];
	}

	// Collect all spans on this paragraph
	interface ActiveSpan {
		findingId: string;
		severity: Severity;
		start: number;
		end: number;
	}

	const activeSpans: ActiveSpan[] = [];
	const boundariesSet = new Set<number>([0, text.length]);

	for (const finding of findings) {
		const spans = resolveFindingSpans(finding, paragraphsMap);
		for (const span of spans) {
			if (span.paragraphId === paragraphId && span.end > span.start) {
				const clampedStart = Math.max(0, Math.min(span.start, text.length));
				const clampedEnd = Math.max(clampedStart, Math.min(span.end, text.length));

				if (clampedEnd > clampedStart) {
					activeSpans.push({
						findingId: finding.id,
						severity: finding.severity,
						start: clampedStart,
						end: clampedEnd
					});
					boundariesSet.add(clampedStart);
					boundariesSet.add(clampedEnd);
				}
			}
		}
	}

	const boundaries = Array.from(boundariesSet).sort((a, b) => a - b);
	const segments: AnnotationSegment[] = [];

	for (let i = 0; i < boundaries.length - 1; i++) {
		const bStart = boundaries[i];
		const bEnd = boundaries[i + 1];

		if (bEnd <= bStart) continue;

		const segmentText = text.slice(bStart, bEnd);
		// Find which finding spans cover this interval
		const matching = activeSpans.filter((s) => s.start <= bStart && s.end >= bEnd);
		const findingIds = Array.from(new Set(matching.map((m) => m.findingId)));

		let dominantSeverity: Severity | undefined = undefined;
		if (findingIds.length > 0) {
			// If active finding is here, its severity takes visual precedence
			const activeMatch = matching.find((m) => m.findingId === activeFindingId);
			if (activeMatch) {
				dominantSeverity = activeMatch.severity;
			} else {
				// Otherwise highest severity
				matching.sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]);
				dominantSeverity = matching[0].severity;
			}
		}

		segments.push({
			id: `${paragraphId}-seg-${bStart}-${bEnd}`,
			start: bStart,
			end: bEnd,
			text: segmentText,
			findingIds,
			hasOverlap: findingIds.length > 1,
			isActive: activeFindingId !== null && findingIds.includes(activeFindingId),
			dominantSeverity
		});
	}

	return segments;
}

/**
 * Word-level diff computation using Longest Common Subsequence (LCS).
 * Used to render clean visual additions and deletions in the Suggested Edit view.
 */
export function computeWordDiff(original: string, suggested: string): WordDiffToken[] {
	if (!original && !suggested) return [];
	if (!original) return [{ type: 'added', value: suggested }];
	if (!suggested) return [{ type: 'removed', value: original }];

	// Split by words and whitespace preservation
	const tokenize = (str: string): string[] => {
		const tokens: string[] = [];
		const regex = /(\s+|[^\s]+)/g;
		let match;
		while ((match = regex.exec(str)) !== null) {
			tokens.push(match[0]);
		}
		return tokens;
	};

	const wordsA = tokenize(original);
	const wordsB = tokenize(suggested);

	const m = wordsA.length;
	const n = wordsB.length;

	// LCS dynamic programming table
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (wordsA[i - 1] === wordsB[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1] + 1;
			} else {
				dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
			}
		}
	}

	// Backtrack to build diff
	const result: WordDiffToken[] = [];
	let i = m;
	let j = n;

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
			result.unshift({ type: 'unchanged', value: wordsA[i - 1] });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			result.unshift({ type: 'added', value: wordsB[j - 1] });
			j--;
		} else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
			result.unshift({ type: 'removed', value: wordsA[i - 1] });
			i--;
		}
	}

	// Merge adjacent tokens of the same type for cleaner rendering
	const merged: WordDiffToken[] = [];
	for (const token of result) {
		const prev = merged[merged.length - 1];
		if (prev && prev.type === token.type) {
			prev.value += token.value;
		} else {
			merged.push({ ...token });
		}
	}

	return merged;
}

/**
 * Calculates overall risk level and breakdown from findings.
 */
export function calculateDocumentRisk(findings: Finding[]): {
	overall: Severity;
	score: number;
	highCount: number;
	mediumCount: number;
	lowCount: number;
	totalCount: number;
} {
	let highCount = 0;
	let mediumCount = 0;
	let lowCount = 0;

	for (const f of findings) {
		if (f.severity === 'high') highCount++;
		else if (f.severity === 'medium') mediumCount++;
		else if (f.severity === 'low') lowCount++;
	}

	const totalCount = findings.length;
	// Risk score calculation: High * 10 + Medium * 3 + Low * 1
	const score = highCount * 10 + mediumCount * 3 + lowCount * 1;

	let overall: Severity = 'low';
	if (highCount >= 3 || score >= 40) {
		overall = 'high';
	} else if (highCount >= 1 || score >= 20) {
		overall = 'medium';
	}

	return {
		overall,
		score,
		highCount,
		mediumCount,
		lowCount,
		totalCount
	};
}
