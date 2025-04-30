<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { ctrl, color } = $props();

	let p = $derived(ctrl.game ? ctrl.game[color] : { name: '', rating: '' });
	let curTime: string | null = $state(null);

	const realTime = () => {
		if (ctrl.status != 'invalid game') {
			const time = ctrl.timeOf(color);
			const decay =
				color == ctrl.turn &&
				(ctrl.chess.fullmoves > 1 || ctrl.seeking) &&
				ctrl.playing
					? ctrl.lastUpdateAt - Date.now()
					: 0;
			const millis = time + (decay || 0);
			if (millis > 0) {
				const date = new Date(millis);
				const min = date.getUTCMinutes();
				const sec = date.getUTCSeconds();
				curTime = pad2(min) + ':' + pad2(sec);
				if (min == 0 && sec < 10) {
					curTime +=
						'.' + Math.floor(date.getUTCMilliseconds() / 100).toString();
				}
			} else {
				curTime = '00:00.0';
			}
		}
	};
	const pad2 = (num: number) => (num < 10 ? '0' : '') + num;

	let clockInterval: ReturnType<typeof setInterval>;
	onMount(() => {
		clockInterval = setInterval(realTime, 100);
	});
	onDestroy(() => {
		clearInterval(clockInterval);
	});
</script>

<div class="flex items-center justify-evenly">
	<div class="w-0 flex-grow font-sans *:px-1">
		<span class="text-md font-light md:text-[32px]">{p.name}</span><span
			>{p.rating}</span
		>
	</div>
	<div><span class="text-md font-mono md:text-[24px]">{curTime}</span></div>
</div>
