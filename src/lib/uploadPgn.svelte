<script lang="ts">
	import Link from '$lib/Link.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionResult } from './$types';

	const displayAnalysis = async () => {
		return async ({ result }: { result: ActionResult }) => {
			switch (result.type) {
				case 'success':
					goto(`/game/${result.data.gameId}`);
					break;
				case 'failure':
				default:
					console.error(result.data.error);
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
	<div>
		<form method="POST" action="?/uploadPgn" use:enhance={displayAnalysis}>
			<textarea
				id="pgn"
				name="pgn"
				class="rounded-lg border border-stone-300 text-center"
				autocomplete="off"
				placeholder="paste PGN here"
			></textarea>
			<button
				class="bg-chessgreen border-chessgreen rounded-lg border px-2 py-0 text-white hover:cursor-pointer hover:drop-shadow-xl"
				>analyze</button
			>
		</form>
	</div>
</div>
