<script lang="ts">
	import { clickOutside } from '$lib/utils';

	let {
		children,
		disabled = false,
		onclick,
		onclickoutside = () => void 0,
		customStyle = ''
	} = $props();

	let btnstyle =
		'px-2 py-1/2 rounded hover:bg-gray-100 enabled:hover:cursor-pointer disabled:text-gray-500';
</script>

<button
	use:clickOutside={onclickoutside}
	class={`${customStyle} ${btnstyle}`}
	{disabled}
	{onclick}
	>{@render children?.()}
</button>
