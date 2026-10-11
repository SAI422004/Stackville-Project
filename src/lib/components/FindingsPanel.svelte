<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
	import RiskSummary from './RiskSummary.svelte';
	import FindingFilters from './FindingFilters.svelte';
	import FindingCard from './FindingCard.svelte';

	let findings = $derived(reviewStore.filteredFindings);
	let selectedId = $derived(reviewStore.selectedFindingId);
</script>

<aside class="flex flex-col h-full bg-slate-50/80 border-r border-slate-200">
	<!-- Scrollable content area -->
	<div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
		<!-- Overall Risk Summary Card -->
		<RiskSummary />

		<!-- Filters & Search -->
		<FindingFilters />

		<!-- List Header -->
		<div class="flex items-center justify-between px-1 py-1 text-xs">
			<div class="flex items-center gap-1.5 font-bold text-slate-700">
				<span>Findings</span>
				<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
					{findings.length}
				</span>
			</div>
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => reviewStore.prevFinding()}
					class="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer"
					title="Previous finding (K or ↑)"
					aria-label="Previous finding"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
					</svg>
				</button>
				<button
					type="button"
					onclick={() => reviewStore.nextFinding()}
					class="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer"
					title="Next finding (J or ↓)"
					aria-label="Next finding"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Findings List -->
		{#if findings.length === 0}
			<div class="bg-white rounded-xl border border-slate-200 p-8 text-center">
				<div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h4 class="text-sm font-semibold text-slate-800 mb-1">No matching findings</h4>
				<p class="text-xs text-slate-500 mb-4 max-w-[200px] mx-auto">
					No findings match your current filter and search criteria.
				</p>
				<button
					type="button"
					onclick={() => {
						reviewStore.severityFilter = 'all';
						reviewStore.statusFilter = 'all';
						reviewStore.categoryFilter = 'all';
						reviewStore.searchQuery = '';
					}}
					class="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-200"
				>
					Reset all filters
				</button>
			</div>
		{:else}
			<div class="space-y-2.5">
				{#each findings as finding (finding.id)}
					<FindingCard
						{finding}
						isSelected={selectedId === finding.id}
					/>
				{/each}
			</div>
		{/if}
	</div>
</aside>
