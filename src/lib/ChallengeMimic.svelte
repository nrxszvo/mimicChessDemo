<script lang="ts">
	import { challengeMimic } from '$lib/utils';

	let { loading = $bindable() } = $props();
	const callChallengeMimic = async () => {
		loading = true;
		await challengeMimic();
		setTimeout(() => (loading = false), 5000);
	};
</script>

<button
	disabled={loading}
	onclick={callChallengeMimic}
	class="py-1/2 border border-blue-500 px-2 text-gray-300 drop-shadow-xl enabled:hover:cursor-pointer enabled:hover:bg-gray-300 enabled:hover:text-blue-500 disabled:text-gray-500"
	>Challenge Mimic to a 10+0 game!
	<p class="text-xs">(requires lichess account)</p></button
>
