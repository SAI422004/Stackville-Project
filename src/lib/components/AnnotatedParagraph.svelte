<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
	import type { Paragraph, Finding } from '../types';
	import { buildParagraphSegments } from '../utils/annotations';

	let { paragraph }: { paragraph: Paragraph } = $props();

	let activeFindingId = $derived(reviewStore.selectedFindingId);
	let allFindings = reviewStore.allFindings;
	let paragraphsMap = reviewStore.paragraphsMap;

	// Calculate segments for this paragraph
	let segments = $derived(
		buildParagraphSegments(paragraph.id, paragraph.text, allFindings, paragraphsMap, activeFindingId)
	);

	// Get all findings that anchor to this paragraph
	let paragraphFindings = $derived.by(() => {
		const list: Finding[] = [];
		for (const seg of segments) {
			for (const fid of seg.findingIds) {
				const f = allFindings.find((item) => item.id === fid);
				if (f && !list.some((existing) => existing.id === f.id)) {
					list.push(f);
				}
			}
		}
		return list;
	});

	let hasFindings = $derived(paragraphFindings.length > 0);
	let isTargeted = $derived(reviewStore.highlightTargetParagraphId === paragraph.id);

	function handleSegmentClick(segFindingIds: string[]) {
		if (segFindingIds.length === 0) return;

		// If active finding is already in the segment and there are multiple, cycle to the next one
		if (activeFindingId && segFindingIds.includes(activeFindingId) && segFindingIds.length > 1) {
			const idx = segFindingIds.indexOf(activeFindingId);
			const nextIdx = (idx + 1) % segFindingIds.length;
			reviewStore.selectFinding(segFindingIds[nextIdx], { mobileView: 'details' });
		} else {
			reviewStore.selectFinding(segFindingIds[0], { mobileView: 'details' });
		}
	}
</script>

<div
	id={paragraph.id}
	class="relative group py-2.5 px-3 -mx-3 rounded-xl transition-all duration-300 {
		isTargeted ? 'bg-indigo-50/60 ring-2 ring-indigo-400/50 shadow-xs' : 'hover:bg-slate-50/60'
	}"
>
	<!-- Paragraph Row with Gutter and Text -->
	<div class="flex items-start gap-3">
		<!-- Left Gutter: Paragraph Number & Severity Dots -->
		<div class="shrink-0 w-14 pt-0.5 select-none flex flex-col items-start gap-1">
			<span class="font-mono text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
				§ {paragraph.number}
			</span>

			{#if hasFindings}
				<div class="flex items-center gap-1 flex-wrap" title="{paragraphFindings.length} issue(s) in this paragraph">
					{#each paragraphFindings as pf (pf.id)}
						<button
							type="button"
							onclick={() => reviewStore.selectFinding(pf.id, { mobileView: 'details' })}
							class="w-2 h-2 rounded-full cursor-pointer transition-transform hover:scale-125 {
								pf.id === activeFindingId ? 'ring-2 ring-indigo-500 scale-125' : ''
							} {
								pf.severity === 'high' ? 'bg-rose-500' : pf.severity === 'medium' ? 'bg-amber-500' : 'bg-sky-500'
							}"
							title="{pf.id}: {pf.title} ({pf.severity})"
							aria-label="Finding {pf.id}"
						></button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Paragraph Body Text with Highlights -->
		<div class="flex-1 text-sm leading-relaxed text-slate-800 font-serif">
			{#each segments as seg (seg.id)}
				{#if seg.findingIds.length === 0}
					<span>{seg.text}</span>
				{:else}
					<!-- Highlighted finding span -->
					{@const primaryFinding = allFindings.find(f => f.id === seg.findingIds[0])}
					{@const isActive = seg.isActive}
					{@const sev = seg.dominantSeverity}
					{@const hasOverlap = seg.hasOverlap}

					<button
						type="button"
						onclick={() => handleSegmentClick(seg.findingIds)}
						class="inline text-left p-0 bg-transparent border-0 font-inherit cursor-pointer focus:outline-none"
						title="{primaryFinding ? `${primaryFinding.id}: ${primaryFinding.title}` : ''} (Click to inspect)"
						aria-label="Annotation for finding {seg.findingIds.join(', ')}"
					>
						<mark
							class="px-1 py-0.5 rounded transition-all duration-150 inline relative group/mark {
								isActive
									? 'ring-2 ring-indigo-600 ring-offset-1 font-semibold bg-indigo-100 text-indigo-950 shadow-xs z-10'
									: sev === 'high'
										? 'bg-rose-100/90 text-rose-950 border-b-2 border-rose-500 hover:bg-rose-200'
										: sev === 'medium'
											? 'bg-amber-100/90 text-amber-950 border-b-2 border-amber-500 hover:bg-amber-200'
											: 'bg-sky-100/90 text-sky-950 border-b-2 border-sky-500 hover:bg-sky-200'
							}"
						>
							<span>{seg.text}</span>

							{#if hasOverlap}
								<span
									class="ml-1 inline-flex items-center px-1 py-0.2 rounded text-[10px] font-sans font-bold bg-purple-600 text-white shadow-2xs"
									title="Multiple findings overlap here: {seg.findingIds.join(', ')}. Click to cycle."
								>
									+{seg.findingIds.length}
								</span>
							{/if}
						</mark>
					</button>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Cross-paragraph or Quote-fallback indicator notes -->
	{#if paragraphFindings.some(f => f.anchor?.endParagraphId && f.anchor.endParagraphId !== f.anchor.paragraphId)}
		<div class="ml-17 mt-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5 flex items-center gap-1.5 w-fit font-sans">
			<svg class="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
			</svg>
			<span>Cross-paragraph finding span continues across paragraphs (§ 3.4 → § 3.5)</span>
		</div>
	{/if}
</div>
