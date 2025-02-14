<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameCtrl } from '$lib/game.svelte';
	import { createMeter } from '$lib/eloMeter.svelte';

	let { params, elo } = $props();
	let [m, s] = params;
	const fmtElo = (m, s) => m.toString() + ' +/- ' + s.toString();

	let name = elo == 'belo' ? 'Black Elo' : 'White Elo';
	let meter;
	onMount(() => {
		meter = createMeter(elo, name);
	});
	$effect(() => {
		meter.update(params, name);
	});
</script>

<span class="inline-block align-middle">
	<span id={elo}></span>
	<div class="text-center">
		<div class="text-sm">{name}</div>
		<div class="text-xs">(predicted)</div>
		<div>{params[0]}</div>
	</div>
</span>
