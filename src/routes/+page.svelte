<script lang="ts">
	import { onMount } from 'svelte';
	import { reviewStore } from '../lib/stores/reviewStore.svelte';
	import Header from '../lib/components/Header.svelte';
	import FindingsPanel from '../lib/components/FindingsPanel.svelte';
	import DocumentViewer from '../lib/components/DocumentViewer.svelte';
	import FindingDetails from '../lib/components/FindingDetails.svelte';
	import ExportModal from '../lib/components/ExportModal.svelte';
	import KeyboardShortcutsModal from '../lib/components/KeyboardShortcutsModal.svelte';
	import ReviewCompleteBanner from '../lib/components/ReviewCompleteBanner.svelte';

	function handleGlobalKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLElement | null;
		if (
			target &&
			(target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.isContentEditable)
		) {
			return;
		}

		if (e.key === 'j' || e.key === 'ArrowDown') {
			e.preventDefault();
			reviewStore.nextFinding();
		} else if (e.key === 'k' || e.key === 'ArrowUp') {
			e.preventDefault();
			reviewStore.prevFinding();
		} else if (e.key === 'a' || e.key === 'A') {
			if (reviewStore.selectedFindingId) {
				e.preventDefault();
				reviewStore.acceptFinding(reviewStore.selectedFindingId);
			}
		} else if (e.key === 'd' || e.key === 'D') {
			if (reviewStore.selectedFindingId) {
				e.preventDefault();
				reviewStore.dismissFinding(reviewStore.selectedFindingId);
			}
		} else if (e.key === 'g' || e.key === 'G') {
			if (reviewStore.currentFinding?.anchor) {
				e.preventDefault();
				reviewStore.scrollToParagraph(reviewStore.currentFinding.anchor.paragraphId);
			}
		} else if (e.key === 'e' || e.key === 'E') {
			e.preventDefault();
			reviewStore.showExportModal = true;
		} else if (e.key === '?') {
			e.preventDefault();
			reviewStore.showKeyboardShortcuts = !reviewStore.showKeyboardShortcuts;
		} else if (e.key === 'Escape') {
			reviewStore.showExportModal = false;
			reviewStore.showKeyboardShortcuts = false;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeyDown);
		};
	});
</script>

<svelte:head>
	<title>AI Document Review | {reviewStore.contract.title}</title>
	<meta
		name="description"
		content="Production-grade AI legal document review experience for Master Services Agreement risk analysis, clause navigation, and redline decisioning."
	/>
</svelte:head>

<div class="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
	<!-- Top Navigation and Status Header -->
	<Header />

	<!-- Review Complete Banner (Triggers when 24/24 resolved) -->
	<ReviewCompleteBanner />

	<!-- Main 3-Area Review Interface (Desktop 3-Panel, Tablet/Mobile Responsive) -->
	<div class="flex-1 flex min-h-0 overflow-hidden">
		<!-- Left Area: Findings Navigation & Risk Filter Panel -->
		<div
			class="w-full lg:w-[360px] xl:w-[390px] shrink-0 h-full border-r border-slate-200 {reviewStore.mobileTab !== 'findings' ? 'hidden lg:block' : 'block'}"
		>
			<FindingsPanel />
		</div>

		<!-- Center Area: Contract Document Viewer with Highlighting -->
		<div
			class="flex-1 h-full min-w-0 {reviewStore.mobileTab !== 'document' ? 'hidden lg:block' : 'block'}"
		>
			<DocumentViewer />
		</div>

		<!-- Right Area: Selected Finding Details & Review Decision Actions -->
		<div
			class="w-full lg:w-[380px] xl:w-[420px] shrink-0 h-full border-l border-slate-200 {reviewStore.mobileTab !== 'details' ? 'hidden lg:block' : 'block'}"
		>
			<FindingDetails />
		</div>
	</div>

	<!-- Export & Audit Modal -->
	<ExportModal />

	<!-- Keyboard Shortcuts Cheat Sheet Modal -->
	<KeyboardShortcutsModal />
</div>
