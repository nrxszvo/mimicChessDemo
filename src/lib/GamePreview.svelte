<script lang="ts">
	import { onMount } from 'svelte';
	import { Chessground } from 'svelte-chessground';
	import { opposite } from 'chessops';

	let { ctrl } = $props();
	let chessground: any;
	onMount(async () => {
		chessground.set(ctrl.chessgroundConfig());
		ctrl.setGround(chessground);
	});
</script>

<div class="mx-4 w-[128px]">
	<a href={`/game/${ctrl.game.id}`}>
		<div class="flex items-center justify-between">
			<span class="font-sans font-light">{ctrl.game.players[opposite(ctrl.pov)].name}</span>
			<span class="font-mono">{ctrl.game[opposite(ctrl.pov)].rating}</span>
		</div>
		<div class="relative z-1">
			<Chessground bind:this={chessground} config={{ coordinates: false }} />
		</div>
		<div class="flex items-center justify-between">
			<span class="font-sans font-light">{ctrl.game.players[ctrl.pov].name}</span>
			<span class="font-mono">{ctrl.game[ctrl.pov].rating}</span>
		</div>
	</a>
</div>
