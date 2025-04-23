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
	const demo = 'https://lichess.org/EBF2RhrW';
	let userInput: string | undefined = $state();

	const ondblclick = (e: Event) => {
		if (!userInput) {
			userInput = demo;
		}
	};
	const onblur = () => {
		if (userInput == demo) userInput = undefined;
	};

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
					if (result.data.message == 'Service Unavailable') {
						challengeDeclined = 'server';
					} else {
						challengeDeclined = 'server-pgn';
						reason = result.data.message;
					}
					console.error(result);
					break;
			}
		};
	};
</script>

<div
	class="border-chessgreen bg-chessgreen/5 mx-2 flex flex-col items-center rounded-xl border p-4"
>
	<div class="mb-2 text-center">
		Paste a raw <Link href="https://en.wikipedia.org/wiki/Portable_Game_Notation">pgn</Link> or
		<Link href="https://lichess.org">lichess</Link> game URL below to estimate each player's Elo rating
		by position:
	</div>
	<form
		class="flex w-full items-center"
		method="POST"
		action="?/uploadPgn"
		use:enhance={displayAnalysis}
	>
		<textarea
			id="pgn"
			name="pgn"
			class="grow rounded-lg border border-stone-300 bg-white text-center placeholder:italic"
			autocomplete="off"
			placeholder="e.g. &quot;https://lichess.org/EBF2RhrW&quot;"
			bind:value={userInput}
			{ondblclick}
		></textarea>
		<button
			class="bg-chessgreen border-chessgreen ms-2 flex-none rounded-lg border px-2 py-0 text-white hover:cursor-pointer hover:drop-shadow-xl"
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
