<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { goto } from '$app/navigation';
	import { createOngoingGames } from '$lib/ongoingGames.svelte';
	import NavButton from '$lib/NavButton.svelte';
	import { ongoing, auth } from '$lib/stores';
	import { onMount } from 'svelte';
	import { getActive } from '$lib/utils';

	$ongoing = createOngoingGames();
	onMount(async () => {
		const active = await getActive();
		await $ongoing.syncActive(active, $auth);
	});
</script>

<div class="h-screen bg-stone-800 text-gray-200">
	<div class="flex flex-row items-center justify-around pt-4 pb-2">
		<NavButton onclick={() => goto('/')}>dashboard</NavButton>
		<NavButton onclick={() => goto('/about')}>about</NavButton>
	</div>
	<hr class="h-px border-0 bg-gray-200" />
	{@render children()}
</div>
