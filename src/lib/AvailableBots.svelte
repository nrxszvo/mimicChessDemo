<script lang="ts">
	import { onMount } from 'svelte';
	import { readStream } from '$lib/ndJsonStream';

	let {
		challengeBot,
		buttonStyle = '',
		dropdownStyle = ''
	}: { [key: string]: ((bot: string) => Promise<void>) | string } = $props();
	let bots: any[] = $state([]);
	const getOnlineBots = async () => {
		const resp = await fetch('/api/openStream', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ api: 'bot/online' })
		});
		readStream('onlinebots', resp, (msg) => bots.push(msg));
	};
	onMount(async () => getOnlineBots());
</script>

<details class={`dropdown ${buttonStyle}`}>
	<summary class="m-1">Watch Mimic play against another Bot</summary>
	<ul class={`menu dropdown-content rounded-box z-[1] block h-52 w-52 ${dropdownStyle}`}>
		{#each bots as bot}
			<li><a onclick={() => challengeBot(bot.username)}>{bot.username}</a></li>
		{/each}
	</ul>
</details>
