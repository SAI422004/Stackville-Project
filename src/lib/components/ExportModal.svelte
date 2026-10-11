<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';

	let stats = $derived(reviewStore.stats);
	let contract = reviewStore.contract;
	let allFindings = reviewStore.allFindings;
	let copySuccess = $state(false);

	function generateMarkdownReport(): string {
		const date = new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		let md = `# Legal Review Report: ${contract.title}\n`;
		md += `**Date:** ${date}\n`;
		md += `**Document ID:** ${contract.id}\n`;
		md += `**Customer:** ${contract.parties.find((p) => p.role === 'Customer')?.name || 'Northwind Analytics, Inc.'}\n`;
		md += `**Vendor:** ${contract.parties.find((p) => p.role === 'Vendor')?.name || 'Brightline Data Solutions LLC'}\n\n`;

		md += `## Executive Summary\n`;
		md += `- **Total AI Findings:** ${stats.total}\n`;
		md += `- **Accepted Changes:** ${stats.accepted}\n`;
		md += `- **Dismissed Issues:** ${stats.dismissed}\n`;
		md += `- **Pending Issues:** ${stats.remaining}\n`;
		md += `- **Completion Status:** ${stats.isComplete ? 'COMPLETE' : 'IN PROGRESS'}\n\n`;

		md += `## Detailed Findings & Review Decisions\n\n`;

		for (const f of allFindings) {
			const st = reviewStore.getFindingStatus(f.id);
			const comment = reviewStore.getFindingComment(f.id).comment;
			const anchorLoc = f.anchor
				? f.anchor.endParagraphId && f.anchor.endParagraphId !== f.anchor.paragraphId
					? `Paragraphs ${f.anchor.paragraphId} to ${f.anchor.endParagraphId}`
					: `Paragraph ${f.anchor.paragraphId}`
				: 'Document-Level Finding';

			md += `### [${st.toUpperCase()}] ${f.id}: ${f.title}\n`;
			md += `- **Severity:** ${f.severity.toUpperCase()}\n`;
			md += `- **Category:** ${f.category}\n`;
			md += `- **Location:** ${anchorLoc}\n`;
			md += `- **Confidence:** ${Math.round(f.confidence * 100)}%\n\n`;
			md += `**Analysis:**\n${f.explanation}\n\n`;

			if (f.anchor?.quote) {
				md += `> **Contract Language:** "${f.anchor.quote}"\n\n`;
			}

			if (f.suggestedEdit) {
				md += `**Proposed Edit:**\n\`\`\`\n${f.suggestedEdit}\n\`\`\`\n\n`;
			}

			if (comment) {
				md += `**Reviewer Note:**\n_${comment}_\n\n`;
			}

			md += `---\n\n`;
		}

		return md;
	}

	function handleCopyMarkdown() {
		const md = generateMarkdownReport();
		navigator.clipboard.writeText(md);
		copySuccess = true;
		setTimeout(() => (copySuccess = false), 2500);
	}

	function handleDownloadMarkdown() {
		const md = generateMarkdownReport();
		const blob = new Blob([md], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `review-report-${contract.id}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleDownloadJSON() {
		const auditData = {
			contract: contract.id,
			generatedAt: new Date().toISOString(),
			stats: stats,
			reviewDecisions: allFindings.map((f) => ({
				findingId: f.id,
				title: f.title,
				severity: f.severity,
				category: f.category,
				status: reviewStore.getFindingStatus(f.id),
				comment: reviewStore.getFindingComment(f.id).comment || null,
				commentUpdatedAt: reviewStore.getFindingComment(f.id).updatedAt || null,
				isEditApplied: reviewStore.isEditApplied(f.id)
			}))
		};

		const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `review-audit-${contract.id}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

{#if reviewStore.showExportModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-slate-200 pb-3">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
					</div>
					<div>
						<h3 class="text-base font-bold text-slate-900">Export Review Report</h3>
						<p class="text-xs text-slate-500">Download or copy complete review audit and findings summary</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => reviewStore.showExportModal = false}
					class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
					aria-label="Close export dialog"
				>
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>

			<!-- Review Summary Snapshot -->
			<div class="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
				<div>
					<span class="text-[10px] text-slate-500 font-semibold uppercase block">Reviewed</span>
					<span class="text-base font-bold text-slate-900">{stats.reviewed} / {stats.total}</span>
				</div>
				<div>
					<span class="text-[10px] text-emerald-600 font-semibold uppercase block">Accepted</span>
					<span class="text-base font-bold text-emerald-600">{stats.accepted}</span>
				</div>
				<div>
					<span class="text-[10px] text-slate-600 font-semibold uppercase block">Dismissed</span>
					<span class="text-base font-bold text-slate-700">{stats.dismissed}</span>
				</div>
				<div>
					<span class="text-[10px] text-amber-600 font-semibold uppercase block">Remaining</span>
					<span class="text-base font-bold text-amber-600">{stats.remaining}</span>
				</div>
			</div>

			<!-- Export Options -->
			<div class="space-y-2.5">
				<!-- Option 1: Copy Markdown -->
				<button
					type="button"
					onclick={handleCopyMarkdown}
					class="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
							</svg>
						</div>
						<div>
							<div class="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
								{copySuccess ? '✓ Copied Markdown to Clipboard!' : 'Copy Formatted Markdown Report'}
							</div>
							<div class="text-[11px] text-slate-500">
								Formatted with sections, analysis, contract quotes, and decisions ready for email or Slack.
							</div>
						</div>
					</div>
					<span class="text-xs font-semibold text-indigo-600">Copy</span>
				</button>

				<!-- Option 2: Download Markdown File -->
				<button
					type="button"
					onclick={handleDownloadMarkdown}
					class="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
							</svg>
						</div>
						<div>
							<div class="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
								Download Markdown File (.md)
							</div>
							<div class="text-[11px] text-slate-500">
								Save full legal report document locally for archival or documentation.
							</div>
						</div>
					</div>
					<span class="text-xs font-semibold text-indigo-600">Download</span>
				</button>

				<!-- Option 3: Download JSON Audit Trail -->
				<button
					type="button"
					onclick={handleDownloadJSON}
					class="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
							</svg>
						</div>
						<div>
							<div class="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
								Download Audit Trail JSON
							</div>
							<div class="text-[11px] text-slate-500">
								Machine-readable state export containing status, timestamps, and notes.
							</div>
						</div>
					</div>
					<span class="text-xs font-semibold text-indigo-600">Export JSON</span>
				</button>
			</div>

			<!-- Footer -->
			<div class="flex justify-end pt-2 border-t border-slate-200">
				<button
					type="button"
					onclick={() => reviewStore.showExportModal = false}
					class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
