<script lang="ts">
	import { auth } from '$lib/stores';
	import { onMount } from 'svelte';

	let {
		challengeBot,
		buttonStyle = '',
		dropdownStyle = ''
	}: { [key: string]: ((bot: string) => Promise<void>) | string } = $props();
	let bots = $state([]);
	const getOnlineBots = async () => {
		await $auth.openStream(`/api/bot/online`, {}, (msg) => {
			bots.push(msg);
		});
	};
	onMount(async () => getOnlineBots());
</script>

<details class={`dropdown ${buttonStyle}`}>
	<summary class="m-1">Challenge Bot</summary>
	<ul class={`menu dropdown-content rounded-box z-[1] block h-52 w-52 ${dropdownStyle}`}>
		{#each bots as bot}
			<li><a onclick={() => challengeBot(bot.username)}>{bot.username}</a></li>
		{/each}
	</ul>
</details>
