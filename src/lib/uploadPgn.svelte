<script lang="ts">
	import Link from '$lib/Link.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionResult } from './$types';
	import BotDeclined from '$lib/BotDeclined.svelte';
	import Spinner from '$lib/Spinner.svelte';

	let challengeDeclined: string | undefined = $state();
	let loading = $state(false);
	let reason = $state();
	const displayAnalysis = async () => {
		loading = true;
		return async ({ result }: { result: ActionResult }) => {
			loading = false;
			switch (result.type) {
				case 'success':
					goto(`/game/${result.data.gameId}`);
					break;
				case 'failure':
				default:
					challengeDeclined = 'server';
					reason = result.data.message;
					console.error(result);
					break;
			}
		};
	};
</script>

<div class="border-chessgreen flex flex-col items-center rounded-xl border p-4">
	<div class="mb-2">
		Upload a game in <Link
			href="https://en.wikipedia.org/wiki/Portable_Game_Notation"
			text="PGN"
		/> notation for analysis:
	</div>
	<form
		class="flex items-center"
		method="POST"
		action="?/uploadPgn"
		use:enhance={displayAnalysis}
	>
		<textarea
			id="pgn"
			name="pgn"
			class="rounded-lg border border-stone-300 text-center"
			autocomplete="off"
			placeholder="paste PGN here"
		></textarea>
		<button
			class="bg-chessgreen border-chessgreen ms-2 rounded-lg border px-2 py-0 text-white hover:cursor-pointer hover:drop-shadow-xl"
			>analyze</button
		>
	</form>
</div>

<div class="absolute top-1/2 left-1/2 z-12 -translate-1/2">
	{#if loading}
		<Spinner dim="48" />
	{/if}

	{#if challengeDeclined}
		<BotDeclined bind:challengeDeclined bot="" {reason} />
	{/if}
</div>
