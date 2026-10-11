<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
</script>

{#if reviewStore.showKeyboardShortcuts}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-200 pb-3">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-mono font-bold text-sm">
						⌘
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">Keyboard Shortcuts</h3>
						<p class="text-xs text-slate-500">Speed up your review workflow</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => reviewStore.showKeyboardShortcuts = false}
					class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="Close shortcuts dialog"
				>
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>

			<!-- Shortcuts List -->
			<div class="space-y-2 text-xs divide-y divide-slate-100">
				<div class="flex items-center justify-between pt-1">
					<span class="text-slate-700">Next Finding</span>
					<div class="flex items-center gap-1 font-mono">
						<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">J</kbd>
						<span class="text-slate-400">or</span>
						<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">↓</kbd>
					</div>
				</div>

				<div class="flex items-center justify-between pt-2">
					<span class="text-slate-700">Previous Finding</span>
					<div class="flex items-center gap-1 font-mono">
						<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">K</kbd>
						<span class="text-slate-400">or</span>
						<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">↑</kbd>
					</div>
				</div>

				<div class="flex items-center justify-between pt-2">
					<span class="text-slate-700">Accept Selected Finding</span>
					<kbd class="px-2 py-1 bg-emerald-50 border border-emerald-300 rounded font-semibold text-emerald-800 font-mono">A</kbd>
				</div>

				<div class="flex items-center justify-between pt-2">
					<span class="text-slate-700">Dismiss Selected Finding</span>
					<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800 font-mono">D</kbd>
				</div>

				<div class="flex items-center justify-between pt-2">
					<span class="text-slate-700">Scroll to Text Location</span>
					<kbd class="px-2 py-1 bg-indigo-50 border border-indigo-300 rounded font-semibold text-indigo-800 font-mono">G</kbd>
				</div>

				<div class="flex items-center justify-between pt-2">
					<span class="text-slate-700">Open Export Dialog</span>
					<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800 font-mono">E</kbd>
				</div>

				<div class="flex items-center justify-between pt-2">
					<span class="text-slate-700">Close Dialogs / Deselect</span>
					<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800 font-mono">Esc</kbd>
				</div>

				<div class="flex items-center justify-between pt-2">
					<span class="text-slate-700">Show this Help Modal</span>
					<kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800 font-mono">?</kbd>
				</div>
			</div>

			<!-- Footer -->
			<div class="pt-3 border-t border-slate-200 text-center">
				<button
					type="button"
					onclick={() => reviewStore.showKeyboardShortcuts = false}
					class="w-full py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
				>
					Got It
				</button>
			</div>
		</div>
	</div>
{/if}
