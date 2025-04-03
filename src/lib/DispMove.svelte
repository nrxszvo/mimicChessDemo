<script module>
	export type DispMoveType = {
		cur?: string;
		moveNum?: number;
		white?: string;
		black?: string;
	};
</script>

<script lang="ts">
	let { dm }: { dm: DispMoveType } = $props();
</script>

<div class="mx-auto flex max-w-48 items-center justify-between">
	<span class:invisible={!dm.moveNum || dm.moveNum <= 0}>{`${dm.moveNum}. `}</span>
	<span class:invisible={!dm.white} class="rounded" class:bg-chessgreen={dm.cur == 'white'}
		>{dm.white}</span
	>
	<span class:invisible={!dm.black} class="rounded" class:bg-chessgreen={dm.cur == 'black'}
		>{dm.black}</span
	>
</div>
