<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
	import type { Finding } from '../types';

	let { finding, isSelected }: { finding: Finding; isSelected: boolean } = $props();

	let status = $derived(reviewStore.getFindingStatus(finding.id));
	let commentInfo = $derived(reviewStore.getFindingComment(finding.id));
	let hasComment = $derived(!!commentInfo.comment);
	let isEditApplied = $derived(reviewStore.isEditApplied(finding.id));

	function handleClick() {
		reviewStore.selectFinding(finding.id, { scrollToDoc: true, mobileView: 'details' });
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}

	let anchorText = $derived(() => {
		if (!finding.anchor) return 'Document-level';
		if (finding.anchor.endParagraphId && finding.anchor.endParagraphId !== finding.anchor.paragraphId) {
			return `${finding.anchor.paragraphId} → ${finding.anchor.endParagraphId}`;
		}
		return `${finding.anchor.paragraphId}`;
	});
</script>

<div
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeyDown}
	class="w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-indigo-500 {
		isSelected
			? 'bg-indigo-50/90 border-indigo-400 shadow-sm ring-1 ring-indigo-300'
			: 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
	}"
>
	<!-- Top Row: Severity, Category, Status -->
	<div class="flex items-center justify-between gap-2 mb-1.5">
		<div class="flex items-center gap-1.5 flex-wrap">
			<!-- Severity Badge -->
			{#if finding.severity === 'high'}
				<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
					<svg class="w-3 h-3 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					High
				</span>
			{:else if finding.severity === 'medium'}
				<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
					<svg class="w-3 h-3 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					Medium
				</span>
			{:else}
				<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
					<svg class="w-3 h-3 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
					Low
				</span>
			{/if}

			<!-- Category Tag -->
			<span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
				{finding.category}
			</span>
		</div>

		<!-- Status Badge -->
		<div>
			{#if status === 'accepted'}
				<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
					<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
					</svg>
					Accepted
				</span>
			{:else if status === 'dismissed'}
				<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
					<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
					Dismissed
				</span>
			{:else}
				<span class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
					<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
					Pending
				</span>
			{/if}
		</div>
	</div>

	<!-- Title -->
	<h3 class="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
		{finding.title}
	</h3>

	<!-- Bottom Row: Anchor & Metadata badges -->
	<div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t {isSelected ? 'border-indigo-200/60' : 'border-slate-100'}">
		<!-- Location -->
		<div class="flex items-center gap-1 font-mono text-[10px] text-slate-500" title="Location in document">
			<svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
			</svg>
			<span class="truncate max-w-[130px]">{anchorText()}</span>
		</div>

		<!-- Badges: Confidence, Comment, Edit -->
		<div class="flex items-center gap-1.5">
			{#if hasComment}
				<span class="inline-flex items-center text-indigo-600" title="Reviewer comment added">
					<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
					</svg>
				</span>
			{/if}

			{#if finding.suggestedEdit}
				<span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100" title="Suggested edit available">
					Edit
				</span>
			{/if}

			<span class="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
				{Math.round(finding.confidence * 100)}%
			</span>
		</div>
	</div>
</div>
