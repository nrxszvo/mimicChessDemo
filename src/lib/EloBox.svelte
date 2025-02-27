<script lang="ts">
	import { onMount } from 'svelte';
	import { createMeter } from '$lib/eloMeter.svelte';

	let { params, elo } = $props();

	let name = elo == 'belo' ? 'Black Elo' : 'White Elo';
	let meter: any;
	onMount(() => {
		meter = createMeter(elo, name);
	});
	$effect(() => {
		if (params) {
			meter.update(params, name);
		}
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
