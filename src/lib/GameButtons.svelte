<script lang="ts">
	import type { GameCtrl } from '$lib/game.svelte';
	import NavButton from '$lib/NavButton.svelte';

	let { ctrl }: GameCtrl = $props();
	let clicked = $state(false);
	const confirm = (e) => {
		clicked = true;
		e.stopPropagation();
	};
	const resign = async () => {
		await ctrl.resign();
	};
</script>

<div class="inline-block table-cell text-center align-middle">
	{#if ctrl.status == 'started'}
		{#if clicked}
			<NavButton
				name="Resign"
				onclick={resign}
				onclickoutside={() => (clicked = false)}
				customStyle="bg-red-400 shadow shadow-red-500/50 border-black border-2 font-mono"
			/>
		{:else}
			<NavButton
				name={'Resign'}
				onclick={confirm}
				customStyle={'shadow-xl shadow-grey-300 font-mono'}
			/>
		{/if}
	{:else}
		<p class="rounded-xl p-2 font-mono text-xl">
			{ctrl.status == 'resign' ? ctrl.pov + ' resigned' : ctrl.status}
		</p>
	{/if}
</div>
