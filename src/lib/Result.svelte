<script lang="ts">
	let { ctrl, loading } = $props();

	const status = () => {
		if (['resign', 'mate', 'outoftime'].includes(ctrl.status)) {
			return ctrl.game.winner + ' won';
		} else {
			return ctrl.status;
		}
	};
</script>

{#if !(['started', 'init'].includes(ctrl.status) || loading)}
	<div class="absolute top-1/2 left-1/2 z-11 -translate-1/2">
		<p class="bg-stone-500/95 px-4 py-2 font-mono text-xl">
			{status()}
		</p>
	</div>
{/if}
