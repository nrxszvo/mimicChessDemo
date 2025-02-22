<script lang="ts">
	import { loading, auth, ongoing, eventStream } from '$lib/stores';
	import { Auth } from '$lib/auth';
	import type { Game } from '$lib/interfaces';
	import NavButton from '$lib/NavButton.svelte';
	import GamePreview from '$lib/GamePreview.svelte';
	import Link from '$lib/Link.svelte';
	import AvailableBots from '$lib/AvailableBots.svelte';
	import { readStream } from '$lib/ndJsonStream';
	import Spinner from '$lib/Spinner.svelte';

	const cb = (msg: Game) => {
		const url = new URL('http://localhost:5001');
		switch (msg.type) {
			case 'gameStart':
				fetch(url, {
					mode: 'no-cors',
					method: 'POST',
					headers: { 'Content-type': 'application/json' },
					body: JSON.stringify(msg)
				});
				$ongoing.onStart(msg.game, $auth);
				break;
			case 'gameFinish':
				$ongoing.onFinish(msg.game);
				break;
			case 'ping':
				fetch(url, {
					mode: 'no-cors',
					method: 'POST',
					headers: { 'Content-type': 'application/json' },
					body: JSON.stringify(msg)
				});
				break;
			default:
				console.warn(`Unprocessed message of type ${msg.type}`, msg);
		}
	};

	const initEventStream = async () => {
		if (!$eventStream) {
			$loading = true;
			const resp = await fetch('/api/openStream', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({ api: 'stream/event' })
			});
			$eventStream = readStream('botevents', resp, cb, true);
			$loading = false;
		}
	};
	initEventStream();

	const formData = (data: any): FormData => {
		const formData = new FormData();
		for (const k of Object.keys(data)) formData.append(k, data[k]);
		return formData;
	};

	const challengeBot = async (bot: string) => {
		const resp = await fetch('/api/challengeBot', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ bot })
		});
		const stream = readStream('challengebot', resp, () => {});
		await stream.closePromise;
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

	const login = async () => {
		$loading = true;
		if (!$auth) {
			$auth = new Auth();
			await $auth.init();
		}
		if (!$auth.me) {
			await $auth.login();
		}
		$loading = false;
	};

	const challengeMimic = async () => {
		login();
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
			human-like moves to play in each position, conditioned on a target Elo rating and an
			time control category
		</li>
		<li>
			Learn more about how Mimic was built <Link href="/about" text="here" />
		</li>
	</ul>
</div>
<div class="flex flex-col items-center justify-evenly">
	<div class="relative m-16 w-full">
		{#if $loading}
			<Spinner customStyle="left-1/2 top-40 -translate-1/2" dim="48" />
		{:else}
			<NavButton
				onclick={challengeMimic}
				customStyle="px-4! py-2! absolute left-1/2 -translate-1/2 drop-shadow-xl border hover:border-2 border-blue-500 hover:text-blue-500! hover:bg-gray-100"
				>Challenge Mimic to a 10+0 game!
				<p class="text-xs">(requires lichess account)</p></NavButton
			>
			<AvailableBots
				{challengeBot}
				buttonStyle="absolute top-20 left-1/2 -translate-1/2 border border-blue-500 px-4 py-1 drop-shadow-xl hover:border-2 hover:bg-gray-100 hover:text-blue-500"
				dropdownStyle="overflow-y-scroll p-2 drop-shadow-xl bg-gray-100"
			/>
		{/if}
	</div>
	{#each Object.entries($ongoing.games) as [_, game]}
		<GamePreview {game} />
	{/each}
</div>
