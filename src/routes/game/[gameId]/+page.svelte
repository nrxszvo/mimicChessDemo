<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { opposite } from 'chessops';
	import type { WatchCtrl, GameCtrl } from '$lib/game.svelte';
	import { onMount } from 'svelte';
	import { ongoing } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import EloBox from '$lib/EloBox.svelte';
	import Player from '$lib/Player.svelte';
	import GameButtons from '$lib/GameButtons.svelte';

	let { data }: PageProps = $props();
	let ctrl: WatchCtrl | GameCtrl | null = $state(null);
	if (!Object.hasOwn($ongoing.games, data.gameId)) {
		goto('/dashboard');
	} else {
		ctrl = $ongoing.games[data.gameId].ctrl;
	}
	let chessground: Chessground;
	onMount(() => {
		chessground.set(ctrl?.chessgroundConfig());
		ctrl?.setGround(chessground);
	});
</script>

{#if ctrl}
	<div class="inline-block table">
		<div class="inline-block table-row">
			<EloBox params={ctrl.welo} elo="welo" />
			<span class="inline-block table-cell align-middle">
				<Player {ctrl} color={opposite(ctrl.pov)} />
				<div class="mx-auto size-[450px] md:size-[500px]">
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
{/if}
