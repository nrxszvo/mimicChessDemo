<script lang="ts">
	let { ctrl } = $props();

	const colorToName = (color) => {
		return ctrl.game[color].name;
	};
	const status = () => {
		if (['resign', 'mate'].includes(ctrl.status)) {
			return colorToName(ctrl.game.state.winner) + ' won';
		} else {
			return ctrl.status;
		}
	};
</script>

{#if ctrl.status != 'started'}
	<div class="absolute top-1/2 left-1/2 z-11 -translate-1/2">
		<p
			class="bg-stone-800/75 px-2 py-2 font-mono text-sm text-gray-100 sm:px-4 sm:text-xl dark:bg-stone-300/75 dark:text-black"
		>
			{status()}
		</p>
	</div>
{/if}
