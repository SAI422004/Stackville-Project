<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
	import type { SeverityFilter, StatusFilter, SortOption } from '../types';

	let hasActiveFilters = $derived(
		reviewStore.severityFilter !== 'all' ||
		reviewStore.statusFilter !== 'all' ||
		reviewStore.categoryFilter !== 'all' ||
		reviewStore.searchQuery.trim() !== ''
	);

	function resetFilters() {
		reviewStore.severityFilter = 'all';
		reviewStore.statusFilter = 'all';
		reviewStore.categoryFilter = 'all';
		reviewStore.searchQuery = '';
	}
</script>

<div class="space-y-3 mb-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
	<!-- Search Bar -->
	<div class="relative">
		<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
		<input
			type="text"
			bind:value={reviewStore.searchQuery}
			placeholder="Search findings, clauses, or keywords..."
			class="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
		/>
		{#if reviewStore.searchQuery}
			<button
				type="button"
				onclick={() => reviewStore.searchQuery = ''}
				class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
				title="Clear search"
			>
				<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Status Filter (All, Unreviewed, Accepted, Dismissed) -->
	<div>
		<div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
			<span>Review Status</span>
			{#if hasActiveFilters}
				<button
					type="button"
					onclick={resetFilters}
					class="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium normal-case cursor-pointer"
				>
					Reset filters
				</button>
			{/if}
		</div>
		<div class="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-lg">
			{#each [
				{ id: 'all', label: 'All' },
				{ id: 'pending', label: 'Pending' },
				{ id: 'accepted', label: 'Accepted' },
				{ id: 'dismissed', label: 'Dismissed' }
			] as item}
				<button
					type="button"
					onclick={() => reviewStore.statusFilter = item.id as StatusFilter}
					class="py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer {reviewStore.statusFilter === item.id ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
				>
					{item.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Severity Filter Buttons -->
	<div>
		<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
			Severity
		</div>
		<div class="flex items-center gap-1.5">
			<button
				type="button"
				onclick={() => reviewStore.severityFilter = 'all'}
				class="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg border transition-all cursor-pointer {reviewStore.severityFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"
			>
				All
			</button>
			<button
				type="button"
				onclick={() => reviewStore.severityFilter = 'high'}
				class="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 {reviewStore.severityFilter === 'high' ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-current"></span>
				High
			</button>
			<button
				type="button"
				onclick={() => reviewStore.severityFilter = 'medium'}
				class="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 {reviewStore.severityFilter === 'medium' ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'}"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-current"></span>
				Med
			</button>
			<button
				type="button"
				onclick={() => reviewStore.severityFilter = 'low'}
				class="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 {reviewStore.severityFilter === 'low' ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'}"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-current"></span>
				Low
			</button>
		</div>
	</div>

	<!-- Category & Sort Dropdowns -->
	<div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
		<div>
			<label for="category-select" class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
			<select
				id="category-select"
				bind:value={reviewStore.categoryFilter}
				class="w-full text-[11px] py-1 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium cursor-pointer"
			>
				<option value="all">All Categories ({reviewStore.allCategories.length})</option>
				{#each reviewStore.allCategories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="sort-select" class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sort By</label>
			<select
				id="sort-select"
				bind:value={reviewStore.sortBy}
				class="w-full text-[11px] py-1 px-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium cursor-pointer"
			>
				<option value="document">Document Flow</option>
				<option value="severity">Severity (High → Low)</option>
				<option value="status">Status (Pending First)</option>
				<option value="confidence">Confidence Score</option>
			</select>
		</div>
	</div>
</div>
