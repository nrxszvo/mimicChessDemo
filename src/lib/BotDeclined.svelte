<script lang="ts">
	import { clickOutside } from './utils';
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	let { bot, challengeDeclined = $bindable(), reason = undefined } = $props();

	const onClickOutside = () => {
		challengeDeclined = null;
	};
	let message: string = $state('');
	switch (challengeDeclined) {
		case 'declined':
			message = `${bot} is not accepting challenges right now. Please try a different bot.`;
			break;
		case 'numActive':
			message =
				'Mimic is busy playing other games at the moment; please try again later';
			break;
		case 'noResponse':
			message = `${bot} took too long to respond; the challenge has been canceled`;
			break;
		case 'server':
			message = "Mimic's server is down right now; please try again later";
			break;
		case 'server-pgn':
			message = reason
				? reason
				: 'The server was not able to process this pgn; the pgn format may not be supported, or the server may be down right now';
			break;
		case 'requests':
			message =
				'lichess is not accepting challenges right now; please try again later';
			break;
		default:
			message = '';
	}
	let elem: HTMLElement;
	onMount(() => {
		elem = document.createElement('div');
		elem.classList.add(
			'absolute',
			'z-1',
			'w-full',
			'h-full',
			'top-0',
			'left-0',
			'bg-stone-900/80'
		);
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
	class="absolute top-1/2 left-1/2 w-[300px] -translate-1/2 rounded border bg-black px-4 py-2 text-center text-gray-300 drop-shadow-2xl"
>
	{message}
</div>
