<script lang="ts">
	import { onMount } from 'svelte';
	import { Chessground } from 'svelte-chessground';
	import { opposite } from 'chessops';
	import DeleteIcon from '$lib/DeleteIcon.svelte';
	import { ongoing } from '$lib/stores';

	let { ctrl } = $props();
	let chessground: any;
	onMount(async () => {
		chessground.set(ctrl.chessgroundConfig());
		ctrl.setGround(chessground);
	});
	let showDelete = $state(false);
	const removeMe = () => {
		$ongoing.deleteGame(ctrl.game.id);
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->

<div
	class="relative mx-4 w-[128px]"
	onmouseenter={() => (showDelete = true)}
	onmouseleave={() => (showDelete = false)}
>
	{#if showDelete}
		<DeleteIcon onclick={removeMe} />
	{/if}
	<a href={`/game/${ctrl.game.id}`}>
		<div class="flex items-center justify-between">
			<span class="font-sans font-light">{ctrl.game[opposite(ctrl.pov)].name}</span>
			<span class="font-mono">{ctrl.game[opposite(ctrl.pov)].rating}</span>
		</div>
		<div class="relative z-1">
			<Chessground bind:this={chessground} config={{ coordinates: false }} />
		</div>
		<div class="flex items-center justify-between">
			<span class="font-sans font-light">{ctrl.game[ctrl.pov].name}</span>
			<span class="font-mono">{ctrl.game[ctrl.pov].rating}</span>
		</div>
	</a>
</div>
