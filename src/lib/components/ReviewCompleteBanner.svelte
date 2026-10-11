<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';

	let stats = $derived(reviewStore.stats);
	let dismissed = $state(false);

	let showBanner = $derived(stats.isComplete && !dismissed);
</script>

{#if showBanner}
	<div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-4 shadow-md sticky top-16 z-20 animate-in slide-in-from-top-4 duration-300">
		<div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
			<div class="flex items-center gap-3 text-center sm:text-left">
				<div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
					<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<h3 class="text-sm font-bold tracking-tight">Review Complete! All 24 findings have been resolved</h3>
					<p class="text-xs text-emerald-100">
						Decisions recorded: <span class="font-bold text-white">{stats.accepted} accepted</span>, <span class="font-bold text-white">{stats.dismissed} dismissed</span>. Your document review is ready for export.
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 shrink-0">
				<button
					type="button"
					onclick={() => reviewStore.showExportModal = true}
					class="px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 rounded-lg shadow-sm transition-colors cursor-pointer"
				>
					Export Report
				</button>
				<button
					type="button"
					onclick={() => dismissed = true}
					class="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
					title="Dismiss notification"
					aria-label="Dismiss banner"
				>
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}
