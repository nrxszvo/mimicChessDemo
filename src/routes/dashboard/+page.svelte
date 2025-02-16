<script lang="ts">
	import { onMount } from 'svelte';
	import { loading, auth, ongoing, eventStream } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { Stream } from '$lib/ndJsonStream';
	import NavButton from '$lib/NavButton.svelte';
	import GamePreview from '$lib/GamePreview.svelte';
	import Link from '$lib/Link.svelte';

	onMount(async () => {
		if (!$eventStream) {
			$eventStream = await $auth.openStream('/api/stream/event', {}, (msg) => {
				switch (msg.type) {
					case 'gameStart':
						$ongoing.onStart(msg.game, $auth);
						break;
					case 'gameFinish':
						$ongoing.onFinish(msg.game);
						break;
					default:
						console.warn(`Unprocessed message of type ${msg.type}`, msg);
				}
			});
		}
	});
	const formData = (data: any): FormData => {
		const formData = new FormData();
		for (const k of Object.keys(data)) formData.append(k, data[k]);
		return formData;
	};
	const challengeStockfish = async () => {
		const body = await $auth.fetchBody('/api/challenge/ai', {
			method: 'post',
			body: formData({
				level: 4,
				'clock.limit': 60 * 3,
				'clock.increment': 2
			})
		});
	};
	const startGame = async () => {
		$loading = true;
		const config = {
			username: 'mimicTestBot',
			rated: false,
			'clock.limit': 10 * 60,
			'clock.increment': 0
		};
		const challenge = await $auth.openStream(
			`/api/challenge/${config.username}`,
			{
				method: 'post',
				body: formData({ ...config, keepAliveStream: true })
			},
			(_) => {}
		);
		await challenge.closePromise;
	};
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
			human-like moves to play in each position, conditioned on a target Elo rating and time
			control
		</li>
		<li>
			Learn more about how Mimic was built <Link href="/about" text="here" />
		</li>
	</ul>
</div>
<div class="flex flex-col items-center justify-evenly">
	<div class="relative m-16 w-full">
		{#if $ongoing.games.length == 0}
			<NavButton
				onclick={startGame}
				name={'Challenge Mimic to a 10+0 game!'}
				customStyle="px-4! py-2! absolute left-1/2 -translate-1/2 drop-shadow-xl border hover:border-2 border-blue-500 hover:text-blue-500! hover:bg-gray-100"
			/>
			<NavButton
				onclick={challengeStockfish}
				name={'Watch Mimic play against Stockfish Level 8!'}
				customStyle="px-4! py-2! absolute left-1/2 top-20 -translate-1/2 drop-shadow-xl border hover:border-2 border-blue-500 hover:text-blue-500! hover:bg-gray-100"
			/>
		{/if}
		{#each $ongoing.games as game}
			<GamePreview {game} />
		{/each}
	</div>
</div>
