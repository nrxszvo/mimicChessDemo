<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { opposite } from 'chessground/util';
	import { Chess } from 'chess.js';

	import { onMount, onDestroy } from 'svelte';
	import { auth, ongoing } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import EloBox from '$lib/EloBox.svelte';
	import Player from '$lib/Player.svelte';
	import GameButtons from '$lib/GameButtons.svelte';
	import NavButton from '$lib/NavButton.svelte';

	let { data }: PageProps = $props();

	const chess = new Chess();
	let chessground;
	let game = $ongoing.games.filter((g) => g.gameId == data.gameId)[0];
	if (!game) {
		goto('/dashboard');
	}
	let ctrl = game.ctrl;

	onMount(async () => {
		chessground.set(ctrl.chessgroundConfig());
		ctrl.setGround(chessground);
	});
</script>

<div class="mx-auto inline-block table">
	<div class="inline-block table-row">
		<EloBox params={ctrl.welo} elo="welo" />
		<span class="inline-block table-cell align-middle">
			<Player {ctrl} color={opposite(ctrl.pov)} />
			<div class="size-[450px] md:size-[500px]">
				<Chessground bind:this={chessground} />
			</div>
			<Player {ctrl} color={ctrl.pov} />
		</span>
		<EloBox params={ctrl.belo} elo="belo" />
	</div>
	<div class="inline-block table-row">
		<div class="table-cell"></div>
		<GameButtons {ctrl} />
	</div>
</div>
