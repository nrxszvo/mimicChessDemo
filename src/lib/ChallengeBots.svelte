<script lang="ts">
	import { onMount } from 'svelte';
	import { readStream } from '$lib/ndJsonStream';
	import { onlineBots } from '$lib/stores';
	import Autocomplete from './Autocomplete.svelte';
	import type { Game } from '$lib/interfaces';
	import { auth, ongoing, eventStream } from '$lib/stores';
	import { challengeBot } from '$lib/utils';

	let { bot = $bindable(), gameState = $bindable() } = $props();

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
				bot = msg.challenge.destUser.name;
				gameState = 'challengeDeclined';
				break;
			default:
				console.warn(`Unprocessed message of type ${msg.type}`, msg);
		}
	};

	const initEventStream = async () => {
		if (!$eventStream) {
			gameState = 'loading';
			const resp = await fetch('/api/openStream', {
				method: 'POST',
				headers: { 'Content-type': 'application/json' },
				body: JSON.stringify({ api: 'stream/event' })
			});
			$eventStream = readStream('botevents', resp, cb, true);
			gameState = 'normal';
		}
	};
	initEventStream();

	const callChallengeBot = async (bot: string) => {
		gameState = 'loading';
		try {
			await challengeBot(bot);
		} catch (error) {
			gameState = 'challengeDeclined';
		}
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
				(msg) => {
					if (msg.username.includes('maia')) {
						$onlineBots = [...$onlineBots, msg];
					}
				},
				false,
				false
			);
		}
	};
	onMount(async () => getOnlineBots());
</script>

<Autocomplete
	bots={$onlineBots}
	challengeBot={callChallengeBot}
	disabled={gameState == 'loading'}
/>
