<script lang="ts">
	import Autocomplete from './Autocomplete.svelte';
	import { challengeBot } from '$lib/utils';
	import type { Stream } from '$lib/ndJsonStream';
	import { goto } from '$app/navigation';

	let {
		knownBots,
		bot = $bindable(),
		gameState = $bindable(),
		challengeDeclined = $bindable()
	} = $props();

	let eventStream: Stream | null = null;

	const callChallengeBot = async (cbot: string) => {
		gameState = 'loading';
		const challengeCallback = (
			result: string,
			gameId: string | undefined = undefined
		) => {
			gameState = 'normal';
			if (eventStream) {
				eventStream.updateHandler(() => {});
			}
			if (result == 'accepted') {
				goto(`/game/${gameId}`);
			} else {
				challengeDeclined = result;
				bot = cbot;
			}
		};
		eventStream = await challengeBot(cbot, challengeCallback, eventStream);
	};
	const availableBots = knownBots.filter((b: any) => b.available);
</script>

<Autocomplete
	bots={availableBots}
	challengeBot={callChallengeBot}
	disabled={gameState == 'loading'}
/>
