<script lang="ts">
	import DispMove from '$lib/DispMove.svelte';
	import type { DispMoveType } from '$lib/DispMove.svelte';

	let { ctrl } = $props();

	let moves = $derived(ctrl.sanMoves);

	let dms: { prev: DispMoveType; cur: DispMoveType; next: DispMoveType } =
		$state({
			prev: {},
			cur: {},
			next: {}
		});

	$effect(() => {
		const idx = ctrl.nDisplayMoves - 1;
		let widx, bidx;
		if (idx % 2 == 0) {
			widx = idx;
			bidx = idx + 1;
		} else {
			widx = idx - 1;
			bidx = idx;
		}

		let moveNum = Math.floor(idx / 2) + 1;
		let prev: DispMoveType = {};
		let cur: DispMoveType = {};
		let next: DispMoveType = {};
		if (moves.length > 2 && idx > 1) {
			const prevIdx = widx - 2;
			prev = {
				moveNum: moveNum - 1,
				white: `${moves[prevIdx]} `,
				black: `${moves[prevIdx + 1]} `
			};
		}
		if (idx >= 0 && moves.length > 0) {
			cur = {
				cur: idx == widx ? 'white' : 'black',
				moveNum: moveNum,
				white: `${moves[widx]} `
			};
			if (bidx < moves.length) {
				cur.black = `${moves[bidx]} `;
			}
		}
		if (moves.length > bidx + 1) {
			next = { moveNum: moveNum + 1, white: `${moves[bidx + 1]} ` };
			if (moves.length > bidx + 2) {
				next.black = `${moves[bidx + 2]} `;
			}
		}
		dms = { prev, cur, next };
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->

<div class="flex items-center justify-center">
	<div
		class="inline-block hover:cursor-pointer"
		onclick={() => ctrl.arrowLeft()}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-12"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M15.75 19.5 8.25 12l7.5-7.5"
			/>
		</svg>
	</div>
	<div class="table w-0 flex-grow table-fixed text-center">
		<DispMove dm={dms.prev} />
		<DispMove dm={dms.cur} />
		<DispMove dm={dms.next} />
	</div>
	<div
		class="inline-block hover:cursor-pointer"
		onclick={() => ctrl.arrowRight()}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-12"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m8.25 4.5 7.5 7.5-7.5 7.5"
			/>
		</svg>
	</div>
</div>
