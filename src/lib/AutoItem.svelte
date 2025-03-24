<script lang="ts">
	let { parent, highlighted, item, onclick, handle = $bindable(), entered } = $props();

	let me: Element | undefined = $state();
	let top = $state(0);
	$effect(() => {
		if (highlighted) {
			top =
				me && parent
					? me.getBoundingClientRect().top -
						parent.getBoundingClientRect().top +
						me.getBoundingClientRect().height / 2
					: 0;
		}
	});
</script>

<li
	class="group border-chessgreen top-full right-0 left-0 cursor-pointer list-none border-b-1 border-solid dark:bg-stone-800"
	class:bg-chessgreen={highlighted}
	class:text-white={highlighted}
	class:bg-white={!highlighted}
	class:text-chessgreen={!highlighted}
	onmouseenter={entered}
	bind:this={me}
>
	<button bind:this={handle} tabindex="0" class="h-full w-full cursor-pointer p-2" {onclick}>
		{item.bot}
	</button>
	<div
		class="absolute left-45 z-100 hidden max-h-40 w-full -translate-y-1/2 overflow-scroll rounded-lg border border-white bg-white px-4 py-2 font-mono text-sm text-black drop-shadow-xl group-hover:block group-hover:bg-stone-100"
		style:top="{top}px"
	>
		<p class="mb-2"><span class="me-1 italic">rating:</span><span>{item.rating}</span></p>
		<p><span class="me-1 italic">bio:</span><span> {item.bio}</span></p>
	</div>
</li>
