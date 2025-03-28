<script lang="ts">
	import img from '$lib/images/icon.png';
	let { children } = $props();
</script>

<div class="h-24">
	<img src={img} class="inline-block size-8 align-middle" alt="mimicChess Icon" />
	<p class="inline-block py-8 ps-2 align-middle font-mono text-2xl sm:text-4xl">
		{@render children()}
	</p>
</div>
