<script lang="ts">
	import { GameCtrl } from '$lib/game.svelte';
	import NavButton from '$lib/NavButton.svelte';
	let { ctrl }: GameCtrl = $props();
</script>

<div class="flex flex-row items-center justify-center">
	<NavButton name={'Resign'} onclick={async () => await ctrl.resign()} disabled={!ctrl.playing} />
</div>
