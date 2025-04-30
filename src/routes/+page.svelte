<script lang="ts">
	import { ongoing } from '$lib/stores';
	//import ChallengeMimic from '$lib/ChallengeMimic.svelte';
	import ChallengeBots from '$lib/ChallengeBots.svelte';
	import GamePreview from '$lib/GamePreview.svelte';
	import Link from '$lib/Link.svelte';
	import Spinner from '$lib/Spinner.svelte';
	import BotDeclined from '$lib/BotDeclined.svelte';
	import UploadPgn from '$lib/uploadPgn.svelte';
	import Title from '$lib/Title.svelte';

	let { data } = $props();
	let gameState = $state('normal');
	let challengeDeclined: string | null = $state(null);
	let bot: string | null = $state(null);

	const admin = false;
	let filterBots = $state(false);
	let randomizeBots = $state(false);
	const checkBots = () => {
		fetch('/api/checkBots', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ filterBots, randomizeBots })
		});
	};
</script>

<div class="mx-8 sm:mx-16">
	<Title>Mimic Chess Bot</Title>
	<ul class="list-inside list-none font-[Georgia] text-lg *:mb-4 *:px-1 *:py-2">
		<li>
			Mimic is a chess bot trained exclusively on games between human opponents
			from the <Link href="https://database.lichess.org/">Lichess database</Link
			>
		</li>
		<li>
			Given no explicit knowledge of chess rules or strategy, it learns to
			predict the most human-like moves to play in each position
		</li>
		<li>
			With each new move, it also outputs predictions over the distribution of
			each player's Elo rating, given only the moves so far from the current
			game
		</li>
		<li>
			Learn more about how Mimic was built <Link href="/about" notab={true}
				>here</Link
			>
		</li>
	</ul>
</div>
<div class="flex flex-col items-center justify-evenly">
	{#await data.knownBots}
		<Spinner dim="48" />
		Loading data from lichess.org...
	{:then knownBots}
		<div class="my-4">
			<ChallengeBots
				{knownBots}
				bind:bot
				bind:gameState
				bind:challengeDeclined
			/>
		</div>
		<div class="mt-4 mb-8"><UploadPgn /></div>
	{/await}
	<!--
	<div class="mt-4 mb-8">
		<ChallengeMimic bind:gameState />
	</div>
	-->
	<div class="absolute top-1/2 left-1/2 z-12 -translate-1/2">
		{#if gameState == 'loading'}
			<Spinner dim="48" />
		{/if}
		{#if challengeDeclined}
			<BotDeclined bind:challengeDeclined {bot} />
		{/if}
	</div>
</div>
<hr class="h-px w-full border-0 bg-gray-200" />
<div class="my-4 flex w-full justify-center">
	{#each $ongoing.games as ctrl (ctrl)}
		{#if !['init', 'aborted', 'invalid game'].includes(ctrl.status)}
			<GamePreview {ctrl} />
		{/if}
	{/each}
</div>
{#if admin}
	<div class="text-center">
		<button
			class="rounded border border-black px-2 hover:cursor-pointer"
			onclick={checkBots}>checkBots</button
		>
		<input
			class="m-1"
			bind:checked={filterBots}
			type="checkbox"
			name="filterBots"
		/><label for="filterBots">filterBots</label>
		<input
			class="m-1"
			bind:checked={randomizeBots}
			type="checkbox"
			name="randomizeBots"
		/><label for="randomizeBots">randomizeBots</label>
	</div>
{/if}
