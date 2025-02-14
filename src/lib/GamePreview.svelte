<script lang="ts">
	import { onMount } from 'svelte';
	import { Chessground } from 'svelte-chessground';

	let { game } = $props();
	let ctrl = game.ctrl;
	let chessground;
	onMount(async () => {
		chessground.set(ctrl.chessgroundConfig());
		ctrl.setGround(chessground);
	});
</script>

<a href={`/game/${game.gameId}`}>
	<span
		><span>{game.opponent.username}</span><span>{game.opponent.rating}</span><span
			><Chessground bind:this={chessground} /></span
		></span
	></a
>
