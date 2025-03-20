<script lang="ts">
	let { highlighted, item, onclick, handle = $bindable(), entered } = $props();
</script>

<li
	class="group border-chessgreen top-full right-0 left-0 cursor-pointer list-none border-b-1 border-solid dark:bg-stone-800"
	class:bg-chessgreen={highlighted}
	class:text-white={highlighted}
	class:bg-white={!highlighted}
	class:text-chessgreen={!highlighted}
	onmouseenter={entered}
>
	<button bind:this={handle} tabindex="0" class="h-full w-full cursor-pointer p-2" {onclick}>
		{item.bot}
	</button>
	<div
		class="invisible absolute top-5 left-45 max-h-40 w-full overflow-y-hidden rounded-lg border border-white bg-white px-4 py-2 font-mono text-sm text-black drop-shadow-xl group-hover:visible group-hover:bg-stone-100"
	>
		<p class="pb-2">rating: {item.rating}</p>
		<p>{item.bio}</p>
	</div>
</li>
