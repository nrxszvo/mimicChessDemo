<script lang="ts">
	let { ctrl } = $props();

	let moves = $state(ctrl.sanMoves);
	let prevMoves = $state('');
	let lastMove = $state('');
	let nextMoves = $state('');

	$effect(() => {
		let idx = ctrl.nDisplayMoves - 1;
		let moveNum = Math.floor(idx / 2) + 1;
		prevMoves = '';
		lastMove = '';
		nextMoves = '';
		if (idx >= 0) {
			if (idx == 0) {
				prevMoves = `${moveNum}.`;
				lastMove = `${moves[idx]}`;
			} else if (idx == 1) {
				prevMoves = `${moveNum}. ${moves[idx - 1]}`;
				lastMove = `${moves[idx]}`;
			} else if (idx == 2) {
				prevMoves = `${moveNum - 1}. ${moves[idx - 2]} ${moves[idx - 1]} ${moveNum}.`;
				lastMove = `${moves[idx]}`;
			} else if (idx % 2 == 0) {
				prevMoves = `${moves[idx - 3]} ${moveNum - 1}. ${moves[idx - 2]} ${moves[idx - 1]} ${moveNum}.`;
				lastMove = `${moves[idx]}`;
			} else {
				prevMoves = `${moveNum - 1}. ${moves[idx - 3]} ${moves[idx - 2]} ${moveNum}. ${moves[idx - 1]}`;
				lastMove = `${moves[idx]}`;
			}
			let i = idx + 1;
			let update = ' ';
			while (i < Math.min(moves.length, idx + 3)) {
				if (i % 2 == 0) {
					moveNum++;
					update += `${moveNum}. `;
				}
				update += `${moves[i++]} `;
			}
			nextMoves = update;
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->

<div class="flex items-center justify-center">
	<div class="inline-block hover:cursor-pointer" onclick={() => ctrl.arrowLeft()}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
		</svg>
	</div>
	<div class="inline-block min-w-48 text-center">
		<span class="pe-1">{prevMoves}</span><span class="bg-chessgreen/50 rounded">{lastMove}</span
		><span class="ps-1">{nextMoves}</span>
	</div>
	<div class="inline-block hover:cursor-pointer" onclick={() => ctrl.arrowRight()}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
		</svg>
	</div>
</div>
