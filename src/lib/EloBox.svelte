<script lang="ts">
	import { onMount } from 'svelte';
	import { createMeter, defParams } from '$lib/eloMeter.svelte';

	let { params, elo, w, h } = $props();

	let name = elo == 'belo' ? 'Black Elo' : 'White Elo';
	let meter: any;

	onMount(() => {
		meter = createMeter(elo, name, 180, 400);
	});
	$effect(() => {
		if (!params) {
			params = defParams;
		}
		if (!w) w = 500;
		if (!h) h = 400;
		let width = Math.min(180, (window.screen.width - w) / 2);
		let height = Math.min(400, 0.8 * h);
		meter.update(params, name, width, height);
	});
</script>

<span class="inline-block table-cell align-middle">
	<span id={elo}></span>
	<div class="text-center">
		<div class="text-sm">{name}</div>
		<div class="text-xs">(predicted)</div>
		{#if params}
			<div>{Math.round(params.m)}</div>
		{/if}
	</div>
</span>
