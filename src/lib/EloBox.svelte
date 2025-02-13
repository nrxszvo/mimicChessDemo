<script lang="ts">
	import type { GameCtrl } from '$lib/game.svelte';

	let { ctrl }: GameCtrl = $props();
	const fmtElo = (m, s) => m.toString() + ' +/- ' + s.toString();
</script>

<div class="flex flex-row items-center justify-center">
	<span class="px-5">White Elo: {fmtElo(...ctrl.welo)}</span>
	<span class="px-5">Black Elo: {fmtElo(...ctrl.belo)}</span>
</div>
