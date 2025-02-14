<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { ctrl, color } = $props();

	const p = ctrl.game[color];
	let curTime = $state(null);

	const realTime = () => {
		const time = ctrl.timeOf(color);
		const decay =
			color == ctrl.chess.turn && ctrl.chess.fullmoves > 1 && ctrl.playing
				? ctrl.lastUpdateAt - Date.now()
				: 0;
		const millis = time + (decay || 0);
		const date = new Date(millis);
		curTime =
			pad2(date.getUTCMinutes()) +
			':' +
			pad2(date.getUTCSeconds()) +
			'.' +
			Math.floor(date.getUTCMilliseconds() / 100).toString();
	};
	const pad2 = (num: number) => (num < 10 ? '0' : '') + num;

	let clockInterval;
	onMount(() => {
		clockInterval = setInterval(realTime, 100);
	});
	onDestroy(() => {
		clearInterval(clockInterval);
	});
</script>

<div class="flex flex-row items-center justify-around">
	<div class="w-0 flex-grow *:px-2 *:font-sans">
		<span class="text-[calc(1.425rem+2.1vw)] font-light">{p.name}</span><span>{p.rating}</span>
	</div>
	<div><span class="font-mono text-[32px]">{curTime}</span></div>
</div>
