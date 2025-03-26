<script lang="ts">
	import { opposite } from 'chessops/util';
	import { challengeBot, challengeMimic } from '$lib/utils';

	let {
		bot = $bindable(),
		ctrl,
		loading = $bindable(),
		challengeDeclined = $bindable()
	} = $props();

	const rematch = async () => {
		loading = true;
		const opponent = ctrl.game[opposite(ctrl.pov)];
		const challengeDeclinedCallback = (reason: string) => {
			loading = false;
			challengeDeclined = reason;
			bot = opponent.name;
		};
		if (opponent.name == 'mimicTestBot') {
			await challengeMimic();
		} else {
			await challengeBot(opponent.name, challengeDeclinedCallback);
		}
	};
</script>

<button
	disabled={loading}
	class="py-1/2 border px-2 hover:bg-gray-100 enabled:hover:cursor-pointer disabled:text-gray-500"
	onclick={rematch}>Rematch</button
>
