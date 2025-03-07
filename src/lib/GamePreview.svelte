<script lang="ts">
	import { onMount } from 'svelte';
	import { Chessground } from 'svelte-chessground';

	let { game } = $props();
	let ctrl = game.ctrl;
	let chessground: any;
	onMount(async () => {
		chessground.set(ctrl.chessgroundConfig());
		ctrl.setGround(chessground);
	});
</script>

<div class="mx-4 w-[128px]">
	<a href={`/game/${game.gameId}`}>
		<div class="flex items-center justify-between">
			<span class="font-sans font-light">{game.opponent.username.substring(4)}</span>
			<span class="font-mono">{game.opponent.rating}</span>
		</div>
		<div class="relative z-1">
			<Chessground bind:this={chessground} config={{ coordinates: false }} />
		</div>
		<div class="flex items-center justify-between">
			<span class="font-sans font-light">{ctrl.game[ctrl.pov].name}</span>
			<span class="font-mono">{ctrl.game[ctrl.pov].rating}</span>
		</div>
	</a>
</div>
