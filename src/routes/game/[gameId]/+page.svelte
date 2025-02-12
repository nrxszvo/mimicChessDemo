<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Chess } from 'chess.js';
	import { toDests, playOtherSide } from '$lib/utils';
	import { GameCtrl } from '$lib/game';

	import { onMount } from 'svelte';
	import { auth } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PagePros = $props();
	let ctrl: GameCtrl = $state(null);
	const chess = new Chess();
	let chessground;

	let welo = $state('tbd');
	let belo = $state('tbd');
	const eloCallback = (info) => {
		welo = info.welo;
		belo = info.belo;
	};
	onMount(async () => {
		if ($auth && $auth.me) {
			ctrl = await GameCtrl.open(data.gameId, $auth);
			chessground.set(ctrl.chessgroundConfig());
			ctrl.setGround(chessground);
			ctrl.registerEloCallBack(eloCallback);
		} else goto('/game');
	});
</script>

<div>White Elo: {welo}</div>
<div>Black Elo: {belo}</div>
<div class="size-[450px] md:size-[768px]">
	<Chessground bind:this={chessground} />
</div>
