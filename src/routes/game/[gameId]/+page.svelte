<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { opposite } from 'chessops';
	import type { GameCtrl } from '$lib/game.svelte';
	import type { PageProps } from './$types';
	import { ongoing } from '$lib/stores';
	import { goto } from '$app/navigation';
	import EloBox from '$lib/EloBox.svelte';
	import Player from '$lib/Player.svelte';
	import Result from '$lib/Result.svelte';
	import Rematch from '$lib/Rematch.svelte';
	import Resign from '$lib/Resign.svelte';
	import Spinner from '$lib/Spinner.svelte';

	let { data }: PageProps = $props();
	let ctrl: GameCtrl | null = $derived($ongoing.games[data.gameId]);
	let loading = $state(false);
	let chessground: Chessground | null = $state(null);

	$effect(() => {
		if (!Object.hasOwn($ongoing.games, data.gameId)) {
			goto('/');
		} else {
			chessground?.set(ctrl?.chessgroundConfig());
			ctrl?.setGround(chessground);
			loading = false;
		}
	});
</script>

{#if ctrl != null}
	<div class="mx-auto inline-block table max-w-[412px]">
		<div class="inline-block table-row">
			<EloBox params={ctrl.welo} elo="welo" />
			<span class="inline-block table-cell align-middle">
				<div class="relative mx-auto w-[200px] md:w-[500px]">
					<Player {ctrl} color={opposite(ctrl.pov)} />
					<Chessground bind:this={chessground} />
					<Player {ctrl} color={ctrl.pov} />
					<Result {ctrl} {loading} />
					{#if loading}
						<div class="absolute top-1/2 left-1/2 z-11 -translate-1/2">
							<Spinner dim="48" />
						</div>
					{/if}
				</div>
			</span>
			<EloBox params={ctrl.belo} elo="belo" />
		</div>
		<div class="inline-block table-row">
			<div class="table-cell"></div>
			<div class="inline-block table-cell text-center align-middle">
				{#if !ctrl.watchOnly && ctrl.status == 'started'}
					<Resign {ctrl} />
				{:else if ctrl.status != 'started'}
					<Rematch {ctrl} bind:loading />
				{/if}
			</div>
		</div>
	</div>
{/if}
