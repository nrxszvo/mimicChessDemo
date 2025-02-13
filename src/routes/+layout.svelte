<script lang="ts">
	import '../app.css';
	let { children } = $props();

	import { onMount } from 'svelte';
	import { Auth } from '$lib/auth';
	import OngoingGames from '$lib/ongoingGames.svelte';
	import NavButton from '$lib/NavButton.svelte';
	import { auth, ongoing, eventStream } from '$lib/stores';
	import { goto } from '$app/navigation';

	let promise = $state(null);
	if (!$auth) {
		$auth = new Auth();
		promise = $auth.init();
	}
	if (!$ongoing) {
		$ongoing = new OngoingGames();
	}
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
		const challenge = await $auth.openStream(
			`/api/challenge/${config.username}`,
			{
				method: 'post',
				body: formData({ ...config, keepAliveStream: true })
			},
			(_) => {}
		);
		await challenge.closePromise;
	};
</script>

{#await promise then}
	<div class="mt-4 flex flex-row items-center justify-around">
		<NavButton disabled={!$eventStream} onclick={startGame} name={'Challenge MimicTestBot!'} />
		<NavButton onclick={() => goto('/dashboard')} name={'Dashbord'} />
	</div>
	<div class="relative flex items-center py-5">
		<div class="flex-grow border-t border-gray-400"></div>
	</div>
	<div>
		{@render children()}
	</div>
{/await}
