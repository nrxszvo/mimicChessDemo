<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores';
	import ongoingGames from '$lib/ongoingGames';
	import { goto } from '$app/navigation';

	var stream;
	var games = new ongoingGames();

	onMount(async () => {
		if ($auth && $auth.me) {
			await (stream === null || stream === void 0 ? void 0 : stream.close());
			games.empty();
			stream = await $auth.openStream('/api/stream/event', {}, (msg) => {
				switch (msg.type) {
					case 'gameStart':
						games.onStart(msg.game);
						break;
					case 'gameFinish':
						games.onFinish(msg.game);
						break;
					default:
						console.warn(`Unprocessed message of type ${msg.type}`, msg);
				}
			});
		} else goto('/');
	});

	const formData = (data: any): FormData => {
		const formData = new FormData();
		for (const k of Object.keys(data)) formData.append(k, data[k]);
		return formData;
	};
	const startGame = async () => {
		const config = {
			username: 'mimicTestBot',
			rated: false,
			'clock.limit': 10 * 60,
			'clock.increment': 0
		};
		const stream = await $auth.openStream(
			`/api/challenge/${config.username}`,
			{
				method: 'post',
				body: formData({ ...config, keepAliveStream: true })
			},
			(_) => {}
		);
		await stream.closePromise;
	};
	const btnstyle = 'rounded border border-double px-2 py-1 hover:cursor-pointer';
</script>

<button class={btnstyle} on:click={startGame}>New Game</button>
{#each games.games as game}
	<button class={btnstyle} on:click={() => goto(`/game/${game.gameId}`)}>{game.gameId}</button>
{/each}
