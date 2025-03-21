<script lang="ts">
	import { ongoing } from '$lib/stores';
	//import ChallengeMimic from '$lib/ChallengeMimic.svelte';
	import ChallengeBots from '$lib/ChallengeBots.svelte';
	import GamePreview from '$lib/GamePreview.svelte';
	import Link from '$lib/Link.svelte';
	import Spinner from '$lib/Spinner.svelte';
	import BotDeclined from '$lib/BotDeclined.svelte';

	let { data } = $props();
	let gameState = $state('normal');
	let challengeDeclined: string | null = $state(null);
	let bot: string | null = $state(null);
</script>

<div class="mx-8 sm:mx-16">
	<p class="py-8 font-mono text-2xl sm:text-4xl">Mimic Chess Bot</p>
	<ul class="list-inside list-none font-[Georgia] text-lg *:mb-4 *:px-1 *:py-2">
		<li>
			Mimic is a chess bot trained exclusively on games between human opponents from the <Link
				href="https://database.lichess.org/"
				text="Lichess database"
			/>
		</li>
		<li>
			Given no explicit knowledge of chess rules or strategy, it learns to predict the most
			human-like moves to play in each position
		</li>
		<li>
			Learn more about how Mimic was built <Link href="/about" text="here" notab={true} />
		</li>
	</ul>
</div>
<div class="relative flex flex-col items-center justify-evenly">
	<div class="mt-8 mb-4">
		<ChallengeBots
			availableBots={data.availableBots}
			bind:bot
			bind:gameState
			bind:challengeDeclined
		/>
	</div>
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
	{#each $ongoing.gamesArr as ctrl (ctrl)}
		{#if ctrl.status == 'started'}
			<GamePreview {ctrl} />
		{/if}
	{/each}
</div>
