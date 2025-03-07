<script lang="ts">
	import { onMount } from 'svelte';
	import { readStream } from '$lib/ndJsonStream';
	import { onlineBots } from '$lib/stores';
	import Autocomplete from './Autocomplete.svelte';
	import type { Game } from '$lib/interfaces';
	import { auth, ongoing, eventStream } from '$lib/stores';
	import { challengeBot } from '$lib/utils';

	let { bot = $bindable(), gameState = $bindable() } = $props();

	const cb = async (msg: Game) => {
		switch (msg.type) {
			case 'gameStart':
				console.log('sending gamestart');
				{
					let promise = fetch(`https://michaelhorgan.me/gameStart/${msg.game.id}`);
					promise.then((resp) => {
						resp.json().then((res) => console.log(res));
					});
				}
				$ongoing.onStart(msg.game, $auth);
				break;
			case 'gameFinish':
				$ongoing.onFinish(msg.game);
				break;
			case 'ping':
				break;
			case 'challenge':
				{
					console.log('sending challenge');
					let promise = fetch('https://michaelhorgan.me/challenge', {
						method: 'POST',
						headers: { 'Content-type': 'application/json', Accept: 'application/json' },
						body: JSON.stringify(msg)
					});
					promise.then((resp) => {
						resp.json().then((res) => {
							console.log(res);
						});
					});
				}
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

	const callChallengeBot = async (cbot: string) => {
		gameState = 'loading';
		try {
			await challengeBot(cbot);
		} catch (error) {
			bot = cbot;
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
