<script lang="ts">
	import type { GameCtrl } from '$lib/game.svelte';
	import Rematch from '$lib/Rematch.svelte';
	import Resign from '$lib/Resign.svelte';

	let { ctrl }: { [key: string]: GameCtrl } = $props();
</script>

<div class="inline-block table-cell text-center align-middle">
	{#if !ctrl.watchOnly && ctrl.status == 'started'}
		<Resign {ctrl} />
	{:else if ctrl.status != 'started'}
		<Rematch {ctrl} />
	{/if}
</div>
