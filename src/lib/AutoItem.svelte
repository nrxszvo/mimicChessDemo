<script lang="ts">
	let { highlighted, itemLabel, onclick, handle = $bindable() } = $props();
</script>

<li
	class="top-full right-0 left-0 z-99 cursor-pointer list-none border-b-1 border-solid border-blue-500 p-2 hover:bg-blue-500 hover:text-gray-100"
	class:bg-blue-500={highlighted}
	class:text-gray-100={highlighted}
	class:bg-gray-100={!highlighted}
	class:text-blue-500={!highlighted}
>
	<button bind:this={handle} tabindex="0" class="h-full w-full cursor-pointer" {onclick}>
		{@html itemLabel}
	</button>
</li>
