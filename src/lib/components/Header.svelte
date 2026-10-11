<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';

	let stats = $derived(reviewStore.stats);
	let contract = reviewStore.contract;

	function handleReset() {
		if (confirm('Are you sure you want to reset all review statuses and comments?')) {
			reviewStore.resetAllReviewState();
		}
	}
</script>

<header class="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
			<!-- Product & Document Identity -->
			<div class="flex items-center gap-3.5">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-sm ring-1 ring-indigo-500/20">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<div>
					<div class="flex items-center gap-2">
						<span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
							AI Review Agent
						</span>
						<span class="text-xs text-slate-400">·</span>
						<span class="text-xs text-slate-500 font-medium">Northwind Analytics</span>
					</div>
					<h1 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
						{contract.title}
						<span class="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
							Vendor: {contract.parties.find(p => p.role === 'Vendor')?.name || 'Brightline Data'}
						</span>
					</h1>
				</div>
			</div>

			<!-- Review Progress & Quick Actions -->
			<div class="flex items-center gap-4 flex-wrap">
				<!-- Progress Badge & Bar -->
				<div class="bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 flex items-center gap-3">
					<div class="flex flex-col min-w-[130px]">
						<div class="flex justify-between items-center text-xs mb-1">
							<span class="font-semibold text-slate-700">{stats.reviewed} / {stats.total} Reviewed</span>
							<span class="font-bold text-indigo-600">{stats.percent}%</span>
						</div>
						<div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
							<div
								class="bg-emerald-500 h-full transition-all duration-300"
								style="width: {(stats.accepted / (stats.total || 1)) * 100}%"
								title="{stats.accepted} Accepted"
							></div>
							<div
								class="bg-slate-400 h-full transition-all duration-300"
								style="width: {(stats.dismissed / (stats.total || 1)) * 100}%"
								title="{stats.dismissed} Dismissed"
							></div>
						</div>
					</div>

					<div class="flex items-center gap-1.5 text-xs border-l border-slate-200 pl-3">
						<span class="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200" title="Accepted findings">
							<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
							{stats.accepted}
						</span>
						<span class="inline-flex items-center gap-1 text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200" title="Dismissed findings">
							<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
							{stats.dismissed}
						</span>
						<span class="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200" title="Remaining to review">
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{stats.remaining}
						</span>
					</div>
				</div>

				<!-- Header Actions -->
				<div class="flex items-center gap-2">
					<button
						onclick={() => reviewStore.showExportModal = true}
						class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
						title="Export review report (Markdown, JSON, Print)"
					>
						<svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>Export</span>
					</button>

					<button
						onclick={() => reviewStore.showKeyboardShortcuts = true}
						class="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
						title="Keyboard shortcuts (?)"
						aria-label="Keyboard shortcuts"
					>
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</button>

					<button
						onclick={handleReset}
						class="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-300 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
						title="Reset review progress"
						aria-label="Reset review progress"
					>
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Tab Navigation Bar (Visible on mobile/tablet screens) -->
		<div class="mt-3 pt-2 border-t border-slate-200 lg:hidden flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
			<button
				onclick={() => reviewStore.mobileTab = 'findings'}
				class="flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer {reviewStore.mobileTab === 'findings' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
			>
				Findings ({reviewStore.filteredFindings.length})
			</button>
			<button
				onclick={() => reviewStore.mobileTab = 'document'}
				class="flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer {reviewStore.mobileTab === 'document' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
			>
				Document Viewer
			</button>
			<button
				onclick={() => reviewStore.mobileTab = 'details'}
				class="flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer {reviewStore.mobileTab === 'details' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
			>
				Finding Details {reviewStore.currentFinding ? `(${reviewStore.currentFinding.id})` : ''}
			</button>
		</div>
	</div>
</header>
