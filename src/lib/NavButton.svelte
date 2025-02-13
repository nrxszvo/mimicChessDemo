<script lang="ts">
	const btnstyle =
		'rounded border border-double px-2 py-1 enabled:hover:cursor-pointer disabled:text-gray-500';

	let { disabled, onclick, name } = $props();
</script>

<button class={btnstyle} {disabled} {onclick}>{name}</button>
