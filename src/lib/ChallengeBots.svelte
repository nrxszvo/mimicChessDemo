<script lang="ts">
	import Autocomplete from './Autocomplete.svelte';
	import { challengeBot } from '$lib/utils';

	let {
		availableBots,
		bot = $bindable(),
		gameState = $bindable(),
		challengeDeclined = $bindable()
	} = $props();

	const callChallengeBot = async (cbot: string) => {
		gameState = 'loading';
		const setChallengeDeclined = (reason: string) => {
			gameState = 'normal';
			challengeDeclined = reason;
			bot = cbot;
			if (reason == 'declined') {
				availableBots.splice(availableBots.indexOf(cbot), 1);
				availableBots = [...availableBots];
				fetch('/api/disableBot', {
					method: 'POST',
					headers: { 'Content-type': 'application/json' },
					body: JSON.stringify({ bot: bot })
				});
			}
		};
		await challengeBot(cbot, setChallengeDeclined);
	};
</script>

<Autocomplete
	bots={availableBots}
	challengeBot={callChallengeBot}
	disabled={gameState == 'loading'}
/>
