<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { ctrl, color } = $props();

	let game = $derived(ctrl.game);
	let p = $derived(game ? game[color] : { name: 'tbd', rating: 'tbd' });
	let curTime: string | null = $state(null);

	const realTime = () => {
		const time = ctrl.timeOf(color);
		const decay =
			color == ctrl.chess.turn && ctrl.chess.fullmoves > 1 && ctrl.playing
				? ctrl.lastUpdateAt - Date.now()
				: 0;
		const millis = time + (decay || 0);
		if (millis > 0) {
			const date = new Date(millis);
			const min = date.getUTCMinutes();
			const sec = date.getUTCSeconds();
			curTime = pad2(min) + ':' + pad2(sec);
			if (min == 0 && sec < 10) {
				curTime += '.' + Math.floor(date.getUTCMilliseconds() / 100).toString();
			}
		} else {
			curTime = '00:00.0';
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

<div class="flex items-center justify-around">
	<div class="w-0 flex-grow *:px-2 *:font-sans">
		<span class="text-[calc(1.425rem+2.1vw)] font-light">{p.name}</span><span>{p.rating}</span>
	</div>
	<div><span class="font-mono text-[32px]">{curTime}</span></div>
</div>
