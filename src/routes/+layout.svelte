<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { goto } from '$app/navigation';
	import { createOngoingGames } from '$lib/ongoingGames.svelte';
	import NavButton from '$lib/NavButton.svelte';
	import { ongoing, auth } from '$lib/stores';
	import { onMount } from 'svelte';

	let { data, children }: LayoutProps = $props();

	$ongoing = createOngoingGames();
	onMount(async () => {
		await $ongoing.syncActive(data.mimicActive, $auth);
	});
</script>

<div class="h-screen dark:bg-stone-800 dark:text-gray-200">
	<div class="flex flex-row items-center justify-around pt-4 pb-2">
		<NavButton onclick={() => goto('/')}>dashboard</NavButton>
		<NavButton onclick={() => goto('/about')}>about</NavButton>
	</div>
	<hr class="h-px border-0 bg-gray-200" />
	{@render children()}
</div>
