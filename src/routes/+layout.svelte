<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { goto } from '$app/navigation';
	import NavButton from '$lib/NavButton.svelte';

	let { children }: LayoutProps = $props();
</script>

<div class="h-screen dark:bg-stone-800 dark:text-gray-200">
	<div class="flex flex-row items-center justify-around pt-4 pb-2">
		<NavButton onclick={() => goto('/')}>home</NavButton>
		<NavButton onclick={() => goto('/about')}>about</NavButton>
	</div>
	<hr class="h-px border-0 bg-gray-200" />
	{@render children()}
</div>
