<script lang="ts">
	let { href, text, notab = false } = $props();
</script>

{#if notab}
	<a class="text-chessgreen underline" {href}>{text}</a>
{:else}
	<a class="text-chessgreen underline" target="_blank" rel="noopener noreferrer" {href}>{text}</a>
{/if}
