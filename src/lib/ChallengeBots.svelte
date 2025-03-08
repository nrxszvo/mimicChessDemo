<script lang="ts">
	import { onMount } from 'svelte';
	import { readStream } from '$lib/ndJsonStream';
	import { onlineBots } from '$lib/stores';
	import Autocomplete from './Autocomplete.svelte';
	import { challengeBot } from '$lib/utils';

	let { bot = $bindable(), gameState = $bindable() } = $props();

	const callChallengeBot = async (cbot: string) => {
		gameState = 'loading';
		const setChallengeDeclined = () => {
			gameState = 'challengeDeclined';
			bot = cbot;
		};
		await challengeBot(cbot, setChallengeDeclined);
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
