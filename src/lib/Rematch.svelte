<script lang="ts">
	import { ongoing } from '$lib/stores';
	let { ctrl, loading = $bindable() } = $props();
	const rematch = async () => {
		loading = true;
		await $ongoing.rematch(ctrl.game.id);
	};
</script>

<button
	disabled={loading}
	class="py-1/2 border px-2 text-gray-300 hover:text-gray-100 enabled:hover:cursor-pointer disabled:text-gray-500"
	onclick={rematch}>Rematch</button
>
