<script lang="ts">
	import { clickOutside } from '$lib/utils';
	import type { GameCtrl } from '$lib/game.svelte';

	let { ctrl }: { [key: string]: GameCtrl } = $props();
	let clicked = $state(false);
	const confirm = (e: Event) => {
		clicked = true;
		e.stopPropagation();
	};
	const resign = async () => {
		await ctrl.resign();
		clicked = false;
	};
</script>

{#if clicked}
	<button
		onclick={resign}
		use:clickOutside={() => (clicked = false)}
		class="py-1/2 border-4 border-double border-black bg-red-400 px-2 font-mono text-gray-300 shadow shadow-red-500/50 hover:text-gray-100 enabled:hover:cursor-pointer disabled:text-gray-500"
		>Resign</button
	>
{:else}
	<button
		onclick={confirm}
		class="py-1/2 shadow-grey-300 my-1 border px-2 font-mono text-gray-300 shadow-xl hover:text-gray-100 enabled:hover:cursor-pointer disabled:text-gray-500"
		>Resign</button
	>
{/if}
