<script lang="ts">
	import { challengeMimic } from '$lib/utils';

	let { gameState = $bindable() } = $props();
	const callChallengeMimic = async () => {
		gameState = 'loading';
		await challengeMimic();
		setTimeout(() => (gameState = 'normal'), 5000);
	};
</script>

<button
	disabled={gameState == 'loading'}
	onclick={callChallengeMimic}
	class="border border-blue-500 px-6 py-2 text-gray-100 drop-shadow-xl enabled:hover:cursor-pointer enabled:hover:bg-gray-300 enabled:hover:text-blue-500 disabled:text-gray-500"
	>Challenge Mimic to a 10+0 game!
	<p class="text-xs">(requires lichess account)</p></button
>
