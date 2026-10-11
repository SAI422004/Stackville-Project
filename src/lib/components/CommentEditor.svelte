<script lang="ts">
	import { reviewStore } from '../stores/reviewStore.svelte';

	let { findingId }: { findingId: string } = $props();

	let commentInfo = $derived(reviewStore.getFindingComment(findingId));
	let hasComment = $derived(!!commentInfo.comment);

	let isEditing = $state(false);
	let draftComment = $state('');

	function startEdit() {
		draftComment = commentInfo.comment || '';
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
		draftComment = '';
	}

	function saveComment() {
		reviewStore.setComment(findingId, draftComment);
		isEditing = false;
	}

	function deleteComment() {
		if (confirm('Delete this comment?')) {
			reviewStore.deleteComment(findingId);
			isEditing = false;
		}
	}
</script>

<div class="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5">
	<div class="flex items-center justify-between mb-2">
		<div class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
			<svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
			</svg>
			<span>Reviewer Note / Comment</span>
		</div>

		{#if hasComment && !isEditing}
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={startEdit}
					class="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
				>
					Edit
				</button>
				<span class="text-slate-300">·</span>
				<button
					type="button"
					onclick={deleteComment}
					class="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
				>
					Delete
				</button>
			</div>
		{/if}
	</div>

	{#if isEditing}
		<div class="space-y-2">
			<textarea
				bind:value={draftComment}
				rows="3"
				placeholder="Add legal analysis, negotiation strategy, or internal instructions..."
				class="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 font-sans resize-none"
			></textarea>
			<div class="flex justify-end gap-2">
				<button
					type="button"
					onclick={cancelEdit}
					class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg cursor-pointer"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={saveComment}
					class="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs cursor-pointer"
				>
					Save Comment
				</button>
			</div>
		</div>
	{:else if hasComment}
		<div class="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans">
			{commentInfo.comment}
		</div>
		{#if commentInfo.updatedAt}
			<div class="mt-1 text-[10px] text-slate-400">
				Saved on {new Date(commentInfo.updatedAt).toLocaleDateString()} at {new Date(commentInfo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
			</div>
		{/if}
	{:else}
		<button
			type="button"
			onclick={startEdit}
			class="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
		>
			<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add Reviewer Note</span>
		</button>
	{/if}
</div>
