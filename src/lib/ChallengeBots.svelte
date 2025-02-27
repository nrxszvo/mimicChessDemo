<script lang="ts">
	import { onMount } from 'svelte';
	import { readStream } from '$lib/ndJsonStream';
	import { onlineBots } from '$lib/stores';
	import Autocomplete from './Autocomplete.svelte';
	import type { Game } from '$lib/interfaces';
	import { auth, ongoing, eventStream } from '$lib/stores';
	import { challengeBot } from '$lib/utils';

	let { loading = $bindable() } = $props();

	let challengeState = $state('none');

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
			case 'challenge':
				fetch(url, {
					mode: 'no-cors',
					method: 'POST',
					headers: { 'Content-type': 'application/json' },
					body: JSON.stringify(msg)
				});
				break;
			case 'challengeDeclined':
				challengeState = 'declined';
				break;
			default:
				console.warn(`Unprocessed message of type ${msg.type}`, msg);
		}
	};

	const initEventStream = async () => {
		if (!$eventStream) {
			loading = true;
			const resp = await fetch('/api/openStream', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({ api: 'stream/event' })
			});
			$eventStream = readStream('botevents', resp, cb, true);
			loading = false;
		}
	};
	initEventStream();

	const callChallengeBot = async (bot: string) => {
		loading = true;
		challengeState = 'pending';
		await challengeBot(bot);
		setTimeout(() => (loading = false), 5000);
	};

	const getOnlineBots = async () => {
		if ($onlineBots.length == 0) {
			const resp = await fetch('/api/openStream', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({ api: 'bot/online' })
			});
			readStream(
				'onlinebots',
				resp,
				(msg) => ($onlineBots = [...$onlineBots, msg]),
				false,
				false
			);
		}
	};
	onMount(async () => getOnlineBots());
</script>

{#if challengeState == 'declined'}
	<div class="absolute top-1/2 left-1/2 -translate-1/2">
		This bot is not currently accepting challenges. Please try a different bot.
	</div>
{/if}
<Autocomplete bots={$onlineBots} challengeBot={callChallengeBot} disabled={loading} />
