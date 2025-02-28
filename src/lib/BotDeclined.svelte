<script lang="ts">
	import { clickOutside } from './utils';
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	let { bot, gameState = $bindable() } = $props();

	const onClickOutside = () => {
		gameState = 'normal';
	};

	let elem: HTMLElement;
	onMount(() => {
		elem = document.createElement('div');
		elem.classList.add('absolute', 'w-full', 'h-full', 'top-0', 'left-0', 'bg-stone-900/80');
		document.body.appendChild(elem);
	});
	onDestroy(() => {
		try {
			document.body.removeChild(elem);
		} catch (err) {}
	});
</script>

<div
	transition:fade={{ duration: 100 }}
	use:clickOutside={onClickOutside}
	class="absolute top-1/2 left-1/2 w-[300px] -translate-1/2 border border-red-500 bg-black px-4 py-2 text-center text-gray-300 drop-shadow-2xl"
>
	{bot} is not accepting challenges right now. Please try a different bot.
</div>
