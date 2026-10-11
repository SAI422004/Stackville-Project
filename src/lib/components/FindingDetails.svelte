<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
	import { computeWordDiff, resolveFindingSpans } from '../utils/annotations';
	import CommentEditor from './CommentEditor.svelte';

	let finding = $derived(reviewStore.currentFinding);
	let status = $derived(finding ? reviewStore.getFindingStatus(finding.id) : 'pending');
	let isEditApplied = $derived(finding ? reviewStore.isEditApplied(finding.id) : false);

	let diffMode = $state<'inline' | 'split'>('inline');
	let copySuccess = $state(false);

	let currIndex = $derived(
		finding ? reviewStore.filteredFindings.findIndex((f) => f.id === finding.id) : -1
	);

	let wordDiff = $derived.by(() => {
		if (!finding || !finding.suggestedEdit) return [];
		const orig = finding.anchor?.quote || '';
		return computeWordDiff(orig, finding.suggestedEdit);
	});

	let anchorSpans = $derived.by(() => {
		if (!finding) return [];
		return resolveFindingSpans(finding, reviewStore.paragraphsMap);
	});

	let isCrossParagraph = $derived.by(() => {
		if (!finding?.anchor) return false;
		return (
			!!finding.anchor.endParagraphId &&
			finding.anchor.endParagraphId !== finding.anchor.paragraphId
		);
	});

	let isQuoteFallback = $derived.by(() => {
		return anchorSpans.some((s) => s.status === 'quote-fallback');
	});

	let isNullAnchor = $derived(!finding?.anchor);

	function handleJumpToDoc() {
		if (finding?.anchor) {
			reviewStore.scrollToParagraph(finding.anchor.paragraphId);
			reviewStore.mobileTab = 'document';
		}
	}

	function handleCopyQuote() {
		if (finding?.anchor?.quote) {
			navigator.clipboard.writeText(finding.anchor.quote);
			copySuccess = true;
			setTimeout(() => (copySuccess = false), 2000);
		}
	}
</script>

<aside aria-label="Finding Details" class="flex flex-col h-full bg-white border-l border-slate-200">
	{#if !finding}
		<!-- Empty State: No Finding Selected -->
		<div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
			<div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4 shadow-2xs">
				<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
				</svg>
			</div>
			<h3 class="text-base font-bold text-slate-900 mb-1">No Finding Selected</h3>
			<p class="text-xs text-slate-500 max-w-xs mb-6">
				Select any finding from the left panel or click on any highlighted clause in the contract to view AI analysis, suggested edits, and actions.
			</p>
			{#if reviewStore.allFindings.length > 0}
				<button
					type="button"
					onclick={() => reviewStore.selectFinding(reviewStore.allFindings[0].id, { scrollToDoc: true })}
					class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
				>
					View First Finding (f-01)
				</button>
			{/if}
		</div>
	{:else}
		<!-- Header / Identity -->
		<div class="p-4 border-b border-slate-200 bg-slate-50/60 shrink-0">
			<div class="flex items-center justify-between gap-2 mb-2">
				<div class="flex items-center gap-2 flex-wrap">
					<span class="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">
						{finding.id}
					</span>

					<!-- Severity Badge -->
					{#if finding.severity === 'high'}
						<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
							<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
							High Risk
						</span>
					{:else if finding.severity === 'medium'}
						<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
							<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
							Medium Risk
						</span>
					{:else}
						<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
							<span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
							Low Risk
						</span>
					{/if}

					<span class="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
						{finding.category}
					</span>
				</div>

				<!-- Review Status Badge -->
				<div>
					{#if status === 'accepted'}
						<span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
							<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							Accepted
						</span>
					{:else if status === 'dismissed'}
						<span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
							<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
							Dismissed
						</span>
					{:else}
						<span class="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
							<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
							Pending Decision
						</span>
					{/if}
				</div>
			</div>

			<!-- Title -->
			<h2 class="text-sm font-bold text-slate-900 leading-snug">
				{finding.title}
			</h2>

			<!-- Confidence Meter -->
			<div class="mt-2 flex items-center justify-between text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
				<span>Agent Confidence:</span>
				<div class="flex items-center gap-2">
					<div class="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
						<div
							class="bg-indigo-600 h-full rounded-full"
							style="width: {finding.confidence * 100}%"
						></div>
					</div>
					<span class="font-bold text-slate-800">{Math.round(finding.confidence * 100)}%</span>
				</div>
			</div>
		</div>

		<!-- Scrollable Details Body -->
		<div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
			<!-- Anchor Information / Location Card -->
			<div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
				<div class="flex items-center justify-between mb-1">
					<span class="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Document Location</span>
					{#if !isNullAnchor}
						<button
							type="button"
							onclick={handleJumpToDoc}
							class="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
						>
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
							<span>Jump to Text</span>
						</button>
					{/if}
				</div>

				{#if isNullAnchor}
					<!-- Document-level Finding -->
					<div class="flex items-start gap-2 bg-indigo-50/70 border border-indigo-200 rounded-lg p-2.5 text-indigo-950">
						<svg class="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div>
							<div class="font-semibold text-xs text-indigo-900">Document-Level Finding</div>
							<div class="text-[11px] text-indigo-800/90 mt-0.5">
								This finding is not anchored to a single clause because it identifies missing obligations (such as security, compliance, or audit provisions) that should be incorporated into the agreement.
							</div>
						</div>
					</div>
				{:else if isCrossParagraph}
					<!-- Cross-paragraph Finding -->
					<div class="space-y-1 font-mono text-[11px] text-slate-700">
						<div class="flex items-center gap-1.5 text-indigo-700 font-sans font-semibold">
							<svg class="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
							</svg>
							<span>Cross-Paragraph Span</span>
						</div>
						<div>From: <span class="font-bold">{finding.anchor?.paragraphId}</span> (offset {finding.anchor?.start})</div>
						<div>To: <span class="font-bold">{finding.anchor?.endParagraphId}</span> (offset {finding.anchor?.end})</div>
					</div>
				{:else}
					<!-- Normal Single-paragraph Anchor -->
					<div class="space-y-1 font-mono text-[11px] text-slate-700">
						<div>Paragraph: <span class="font-bold">{finding.anchor?.paragraphId}</span></div>
						<div>Character Offsets: <span class="text-slate-500">[{finding.anchor?.start} .. {finding.anchor?.end}]</span></div>
					</div>
				{/if}

				{#if isQuoteFallback}
					<!-- Quote mismatch fallback notice -->
					<div class="mt-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded p-2 flex items-start gap-1.5">
						<svg class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
						</svg>
						<span>Character offsets differed slightly from document text; anchor was safely auto-aligned using exact quote matching.</span>
					</div>
				{/if}
			</div>

			<!-- Explanation ("Why this matters") -->
			<div>
				<h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
					<svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Why This Matters</span>
				</h3>
				<div class="bg-indigo-50/40 border border-indigo-100/80 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans">
					{finding.explanation}
				</div>
			</div>

			<!-- Quoted Contract Text -->
			{#if finding.anchor?.quote}
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
							Referenced Document Text
						</h3>
						<button
							type="button"
							onclick={handleCopyQuote}
							class="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
						>
							{#if copySuccess}
								<span class="text-emerald-600 font-medium">Copied!</span>
							{:else}
								<span>Copy Quote</span>
							{/if}
						</button>
					</div>
					<blockquote class="bg-slate-50 border-l-4 border-indigo-400 p-3 rounded-r-xl text-xs text-slate-700 italic font-serif leading-relaxed">
						"{finding.anchor.quote}"
					</blockquote>
				</div>
			{/if}

			<!-- Suggested Edit Section -->
			<div>
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
						<svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						<span>Suggested Revision</span>
					</h3>

					{#if finding.suggestedEdit}
						<div class="flex items-center gap-1 text-[10px] bg-slate-100 p-0.5 rounded">
							<button
								type="button"
								onclick={() => (diffMode = 'inline')}
								class="px-2 py-0.5 rounded cursor-pointer {diffMode === 'inline' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500'}"
							>
								Diff
							</button>
							<button
								type="button"
								onclick={() => (diffMode = 'split')}
								class="px-2 py-0.5 rounded cursor-pointer {diffMode === 'split' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500'}"
							>
								Clean
							</button>
						</div>
					{/if}
				</div>

				{#if finding.suggestedEdit}
					<div class="space-y-2">
						{#if diffMode === 'inline'}
							<!-- Inline Word-by-Word Diff View -->
							<div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-serif leading-relaxed">
								{#each wordDiff as token}
									{#if token.type === 'unchanged'}
										<span>{token.value}</span>
									{:else if token.type === 'removed'}
										<del class="bg-rose-100 text-rose-800 line-through decoration-rose-500 px-0.5 rounded mx-0.5 font-normal">
											{token.value}
										</del>
									{:else if token.type === 'added'}
										<ins class="bg-emerald-100 text-emerald-900 font-semibold no-underline px-0.5 rounded mx-0.5 border-b-2 border-emerald-500">
											{token.value}
										</ins>
									{/if}
								{/each}
							</div>
						{:else}
							<!-- Clean Replacement View -->
							<div class="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 font-serif leading-relaxed">
								{finding.suggestedEdit}
							</div>
						{/if}

						<div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
							<div class="flex items-center gap-2">
								<span class="inline-flex items-center gap-1 text-rose-700">
									<span class="w-2 h-2 rounded bg-rose-200 border border-rose-400"></span> Redline removal
								</span>
								<span class="inline-flex items-center gap-1 text-emerald-700">
									<span class="w-2 h-2 rounded bg-emerald-200 border border-emerald-400"></span> Proposed addition
								</span>
							</div>

							<button
								type="button"
								onclick={() => reviewStore.toggleApplyEdit(finding.id)}
								class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
							>
								{isEditApplied ? '✓ Applied in Document' : 'Apply to Document'}
							</button>
						</div>
					</div>
				{:else}
					<!-- Graceful Null Suggested Edit State -->
					<div class="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
						<span class="text-xs text-slate-500 italic block">
							No specific suggested edit provided for this finding.
						</span>
						<span class="text-[11px] text-slate-400 mt-1 block">
							Reviewer may formulate custom negotiation points or delete/replace clause manually.
						</span>
					</div>
				{/if}
			</div>

			<!-- Reviewer Note / Comment Editor Component -->
			<CommentEditor findingId={finding.id} />
		</div>

		<!-- Review Actions Bar (Sticky Bottom) -->
		<div class="p-4 border-t border-slate-200 bg-slate-50/90 shrink-0 space-y-2">
			<!-- Primary Accept / Dismiss Buttons -->
			<div class="grid grid-cols-2 gap-2.5">
				<button
					type="button"
					onclick={() => reviewStore.acceptFinding(finding.id)}
					class="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-white transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 {
						status === 'accepted'
							? 'bg-emerald-700 ring-2 ring-emerald-500 ring-offset-1'
							: 'bg-emerald-600 hover:bg-emerald-700'
					}"
					title="Accept finding and proposed change (A)"
				>
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
					<span>Accept Finding [A]</span>
				</button>

				<button
					type="button"
					onclick={() => reviewStore.dismissFinding(finding.id)}
					class="w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 {
						status === 'dismissed'
							? 'bg-slate-800 text-white ring-2 ring-slate-500 ring-offset-1'
							: 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
					}"
					title="Dismiss finding without changes (D)"
				>
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
					<span>Dismiss Finding [D]</span>
				</button>
			</div>

			<!-- Reset Status to Pending if already decided -->
			{#if status !== 'pending'}
				<div class="text-center pt-1">
					<button
						type="button"
						onclick={() => reviewStore.resetFindingStatus(finding.id)}
						class="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
					>
						Reset decision back to Pending
					</button>
				</div>
			{/if}

			<!-- Bottom Navigation: Prev / Next -->
			<div class="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
				<button
					type="button"
					onclick={() => reviewStore.prevFinding()}
					class="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer p-1"
					title="Previous Finding (K)"
				>
					<span>← Previous [K]</span>
				</button>

				<span class="text-[11px] font-mono">
					{currIndex >= 0 ? currIndex + 1 : 1} of {reviewStore.filteredFindings.length}
				</span>

				<button
					type="button"
					onclick={() => reviewStore.nextFinding()}
					class="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer p-1"
					title="Next Finding (J)"
				>
					<span>Next [J] →</span>
				</button>
			</div>
		</div>
	{/if}
</aside>
