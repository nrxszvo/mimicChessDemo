<script lang="ts">
	import type { GameCtrl } from '$lib/game.svelte';
	import NavButton from '$lib/NavButton.svelte';

	let { ctrl }: GameCtrl = $props();
	let state = $state(ctrl.status);
	const confirm = (e) => {
		state = 'confirm';
		e.stopPropagation();
	};
	const resign = async () => {
		await ctrl.resign();
		state = 'inactive';
	};
</script>

<div class="flex flex-row items-center justify-center">
	{#if state == 'started'}
		<NavButton
			name={'Resign'}
			onclick={confirm}
			customStyle={'shadow-xl shadow-grey-300 font-mono'}
		/>
	{:else if state == 'confirm'}
		<NavButton
			name="Resign"
			onclick={resign}
			onclickoutside={() => (state = ctrl.status)}
			customStyle="bg-red-400 shadow shadow-red-500/50 border-black border-2 font-mono"
		/>
	{:else}
		<p class="rounded-xl p-2 font-mono text-xl shadow shadow-gray-200">
			{ctrl.status == 'resign' ? ctrl.pov + ' resigned' : ctrl.status}
		</p>
	{/if}
</div>
