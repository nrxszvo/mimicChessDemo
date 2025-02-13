<script lang="ts">
	import type { GameCtrl } from '$lib/game.svelte';

	let { ctrl }: GameCtrl = $props();

	let welo = $state('tbd');
	let belo = $state('tbd');
	const eloCallback = (info) => {
		welo = info.welo;
		belo = info.belo;
	};
	ctrl.registerEloCB(eloCallback);
</script>

<div class="flex flex-row items-center justify-center">
	<span class="px-5">White Elo: {welo}</span>
	<span class="px-5">Black Elo: {belo}</span>
</div>
