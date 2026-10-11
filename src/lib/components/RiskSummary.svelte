<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
	import type { Severity } from '../types';

	let risk = $derived(reviewStore.riskSummary);
	let activeSeverity = $derived(reviewStore.severityFilter);

	function filterBySeverity(sev: Severity | 'all') {
		if (reviewStore.severityFilter === sev) {
			reviewStore.severityFilter = 'all';
		} else {
			reviewStore.severityFilter = sev;
		}
	}
</script>

<div class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-slate-700/60 mb-4">
	<!-- Top Risk Badge & Score -->
	<div class="flex items-center justify-between gap-3 mb-3">
		<div class="flex items-center gap-2">
			<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs bg-rose-500/20 text-rose-300 border border-rose-500/40">
				<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
				Overall Risk: {risk.overall.toUpperCase()}
			</span>
		</div>
		<div class="text-xs text-slate-300 font-medium">
			Risk Index: <span class="text-white font-bold">{risk.score} pts</span>
		</div>
	</div>

	<!-- Severity Counts Grid (Clickable Filters) -->
	<div class="grid grid-cols-4 gap-2 mb-3">
		<!-- Total -->
		<button
			type="button"
			onclick={() => filterBySeverity('all')}
			class="bg-white/5 hover:bg-white/10 transition-all rounded-xl p-2 text-left border cursor-pointer {activeSeverity === 'all' ? 'border-indigo-400 bg-white/10 ring-1 ring-indigo-400/40' : 'border-white/10'}"
			title="Show all findings"
		>
			<span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total</span>
			<span class="text-lg font-bold text-white leading-tight block">{risk.totalCount}</span>
			<span class="text-[10px] text-slate-400">Issues</span>
		</button>

		<!-- High -->
		<button
			type="button"
			onclick={() => filterBySeverity('high')}
			class="bg-rose-950/40 hover:bg-rose-900/50 transition-all rounded-xl p-2 text-left border cursor-pointer {activeSeverity === 'high' ? 'border-rose-400 bg-rose-900/60 ring-1 ring-rose-400/40' : 'border-rose-500/20'}"
			title="Filter by High severity"
		>
			<span class="text-[10px] font-semibold text-rose-300 uppercase tracking-wider block flex items-center gap-1">
				<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
				High
			</span>
			<span class="text-lg font-bold text-rose-100 leading-tight block">{risk.highCount}</span>
			<span class="text-[10px] text-rose-300/80">Critical</span>
		</button>

		<!-- Medium -->
		<button
			type="button"
			onclick={() => filterBySeverity('medium')}
			class="bg-amber-950/40 hover:bg-amber-900/50 transition-all rounded-xl p-2 text-left border cursor-pointer {activeSeverity === 'medium' ? 'border-amber-400 bg-amber-900/60 ring-1 ring-amber-400/40' : 'border-amber-500/20'}"
			title="Filter by Medium severity"
		>
			<span class="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
				<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
				Med
			</span>
			<span class="text-lg font-bold text-amber-100 leading-tight block">{risk.mediumCount}</span>
			<span class="text-[10px] text-amber-300/80">Moderate</span>
		</button>

		<!-- Low -->
		<button
			type="button"
			onclick={() => filterBySeverity('low')}
			class="bg-sky-950/40 hover:bg-sky-900/50 transition-all rounded-xl p-2 text-left border cursor-pointer {activeSeverity === 'low' ? 'border-sky-400 bg-sky-900/60 ring-1 ring-sky-400/40' : 'border-sky-500/20'}"
			title="Filter by Low severity"
		>
			<span class="text-[10px] font-semibold text-sky-300 uppercase tracking-wider block flex items-center gap-1">
				<span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
				Low
			</span>
			<span class="text-lg font-bold text-sky-100 leading-tight block">{risk.lowCount}</span>
			<span class="text-[10px] text-sky-300/80">Minor</span>
		</button>
	</div>

	<!-- Top Risk Categories Pills -->
	<div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
		<span class="text-slate-400 text-[11px]">Primary Concerns:</span>
		<div class="flex items-center gap-1.5 flex-wrap">
			<span class="text-[10px] font-medium bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded-md border border-rose-500/30">
				Liability (4)
			</span>
			<span class="text-[10px] font-medium bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded-md border border-rose-500/30">
				Data Protection (4)
			</span>
			<span class="text-[10px] font-medium bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-md border border-amber-500/30">
				Termination (2)
			</span>
		</div>
	</div>
</div>
