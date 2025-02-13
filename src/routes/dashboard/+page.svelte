<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, ongoing, eventStream } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { Stream } from '$lib/ndJsonStream';
	import NavButton from '$lib/NavButton.svelte';

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
</script>

<div class="flex flex-row items-center justify-center">
	{#if $ongoing.games.length}
		{#each $ongoing.games as game}
			<NavButton onclick={() => goto(`/game/${game.gameId}`)} name={game.gameId} />
		{/each}
	{:else}
		<div>No games yet...</div>
	{/if}
</div>
