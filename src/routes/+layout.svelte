<script lang="ts">
	import '../app.css';
	let { children } = $props();

	import { onMount } from 'svelte';
	import { Auth } from '$lib/auth';
	import OngoingGames from '$lib/ongoingGames.svelte';
	import NavButton from '$lib/NavButton.svelte';
	import { auth, ongoing, loading } from '$lib/stores';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/Spinner.svelte';

	let promise = null;
	if (!$auth) {
		$loading = true;
		$auth = new Auth();
		promise = $auth.init();
		promise.then(() => {
			$loading = false;
			if (!$auth.me) goto('/');
		});
	}
	if (!$ongoing) {
		$ongoing = new OngoingGames();
	}

	const logout = async () => {
		if ($auth.me) {
			$loading = true;
			await $auth.logout();
			$auth.me = undefined;
			goto('/');
			$loading = false;
		}
	};
</script>

<div class="h-screen bg-stone-800 text-gray-200">
	{#if $loading}
		<div class="relative h-full w-full">
			<Spinner customStyle="left-1/2 top-1/2 -translate-1/2" dim="48" />
		</div>
	{:else}
		{#await promise then}
			{#if $auth && $auth.me}
				<div class="flex flex-row items-center justify-around pt-4 pb-2">
					<NavButton onclick={() => goto('/dashboard')} name={'dashboard'} />
					<NavButton onclick={logout} name={$auth.me.username} customStyle="relative" />
				</div>
				<div class="relative flex items-center py-2">
					<div class="flex-grow border-t border-gray-400"></div>
				</div>
			{/if}
			<div class="h-full">
				{@render children()}
			</div>
		{/await}
	{/if}
</div>
