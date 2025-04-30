<script lang="ts">
	let { href, children, notab = false } = $props();
</script>

{#if notab}
	<a class="text-chessgreen underline" {href}>{@render children()}</a>
{:else}
	<a
		class="text-chessgreen underline"
		target="_blank"
		rel="noopener noreferrer"
		{href}>{@render children()}</a
	>
{/if}
