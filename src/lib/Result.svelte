<script lang="ts">
	let { ctrl, loading } = $props();

	const status = () => {
		if (['resign', 'mate'].includes(ctrl.status)) {
			return ctrl.game.state.winner + ' won';
		} else {
			return ctrl.status;
		}
	};
</script>

{#if !(ctrl.status == 'started' || loading)}
	<div class="absolute top-1/2 left-1/2 z-11 -translate-1/2">
		<p class="bg-stone-500/95 px-2 py-2 font-mono text-sm sm:px-4 sm:text-xl">
			{status()}
		</p>
	</div>
{/if}
