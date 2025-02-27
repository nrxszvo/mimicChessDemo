<script lang="ts">
	import { ongoing } from '$lib/stores';
	import ChallengeMimic from '$lib/ChallengeMimic.svelte';
	import ChallengeBots from '$lib/ChallengeBots.svelte';
	import GamePreview from '$lib/GamePreview.svelte';
	import Link from '$lib/Link.svelte';
	import Spinner from '$lib/Spinner.svelte';

	let loading = $state(false);
</script>

<div class="mx-16">
	<p class="py-4 font-mono text-4xl">Mimic Chess Bot</p>
	<ul class="list-inside list-disc indent-8">
		<li>
			Mimic is a chess bot trained exclusively on games between human opponents from the <Link
				href="https://database.lichess.org/"
				text="Lichess database"
			/>
		</li>
		<li>
			Given no explicit knowledge of chess rules or stratgey, it learns to predict the most
			human-like moves to play in each position, conditioned on a target Elo rating and a time
			control category
		</li>
		<li>
			Learn more about how Mimic was built <Link href="/about" text="here" />
		</li>
	</ul>
</div>
<div class="m-4">
	<div class="relative flex flex-col items-center justify-evenly">
		<div class="mt-4 mb-2">
			<ChallengeMimic bind:loading />
		</div>
		<div class="mt-2 mb-4">
			<ChallengeBots bind:loading />
		</div>
		{#if loading}
			<div class="absolute top-1/2 left-1/2 -translate-1/2">
				<Spinner dim="48" />
			</div>
		{/if}
	</div>
	<hr class="h-px w-full border-0 bg-gray-200" />
	<div class="my-4 flex w-full justify-center">
		{#each Object.entries($ongoing.games) as [_, game]}
			<GamePreview {game} />
		{/each}
	</div>
</div>
