<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';
	import AnnotatedParagraph from './AnnotatedParagraph.svelte';

	let contract = reviewStore.contract;
	let allFindings = reviewStore.allFindings;

	// Calculate findings count per section
	let sectionFindingsMap = $derived.by(() => {
		const map = new Map<string, number>();
		for (const sec of contract.sections) {
			let count = 0;
			for (const p of sec.paragraphs) {
				const findingsInPara = allFindings.filter((f) => {
					if (!f.anchor) return false;
					return (
						f.anchor.paragraphId === p.id ||
						f.anchor.endParagraphId === p.id
					);
				});
				count += findingsInPara.length;
			}
			map.set(sec.id, count);
		}
		return map;
	});

	function scrollToSection(secId: string) {
		const el = document.getElementById(secId);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<main class="flex flex-col h-full bg-slate-100/70 overflow-hidden">
	<!-- Sticky Section Navigator Bar -->
	<nav aria-label="Sections Table of Contents" class="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0 shadow-2xs">
		<span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
			Sections:
		</span>
		{#each contract.sections as section (section.id)}
			{@const count = sectionFindingsMap.get(section.id) || 0}
			<button
				type="button"
				onclick={() => scrollToSection(section.id)}
				class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all shrink-0 cursor-pointer"
				title="Jump to Section {section.number}: {section.heading} ({count} issues)"
			>
				<span>{section.number}. {section.heading}</span>
				{#if count > 0}
					<span class="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center">
						{count}
					</span>
				{/if}
			</button>
		{/each}
	</nav>

	<!-- Document Body Canvas -->
	<div class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
		<article class="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 md:p-10 mb-12">
			<!-- Contract Preamble Header -->
			<header class="border-b border-slate-200 pb-6 mb-8 text-center">
				<div class="inline-block text-[11px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-3">
					Legal Services Agreement
				</div>
				<h2 class="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight uppercase mb-4">
					{contract.title}
				</h2>

				<!-- Parties and Metadata Box -->
				<div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 max-w-xl mx-auto">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
						<div>
							<span class="font-semibold text-slate-500 block">Customer:</span>
							<span class="font-bold text-slate-800 text-sm">
								{contract.parties.find(p => p.role === 'Customer')?.name || 'Northwind Analytics, Inc.'}
							</span>
						</div>
						<div>
							<span class="font-semibold text-slate-500 block">Vendor:</span>
							<span class="font-bold text-slate-800 text-sm">
								{contract.parties.find(p => p.role === 'Vendor')?.name || 'Brightline Data Solutions LLC'}
							</span>
						</div>
						<div>
							<span class="font-semibold text-slate-500 block">Effective Date:</span>
							<span class="font-medium text-slate-800">{contract.effectiveDate}</span>
						</div>
						<div>
							<span class="font-semibold text-slate-500 block">Contract Reference:</span>
							<span class="font-mono text-slate-700">{contract.id}</span>
						</div>
					</div>
				</div>
			</header>

			<!-- Sections Rendering -->
			<div class="space-y-8">
				{#each contract.sections as section (section.id)}
					<section id={section.id} class="scroll-mt-14">
						<!-- Section Heading -->
						<div class="border-b border-slate-200/80 pb-2 mb-4 flex items-center justify-between">
							<h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
								<span class="text-indigo-600 font-mono text-sm">Section {section.number}</span>
								<span>·</span>
								<span>{section.heading}</span>
							</h3>
							{#if (sectionFindingsMap.get(section.id) || 0) > 0}
								<span class="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
									{sectionFindingsMap.get(section.id)} finding(s)
								</span>
							{/if}
						</div>

						<!-- Section Paragraphs -->
						<div class="space-y-2">
							{#each section.paragraphs as paragraph (paragraph.id)}
								<AnnotatedParagraph {paragraph} />
							{/each}
						</div>
					</section>
				{/each}
			</div>

			<!-- Contract Footer -->
			<footer class="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
				<p>End of Master Services Agreement ({contract.id}) · {contract.sections.length} Sections · 42 Paragraphs</p>
			</footer>
		</article>
	</div>
</main>
