<script lang="ts">
	let { disabled, onclick, onclickoutside = () => void 0, name, customStyle } = $props();

	let btnstyle =
		'rounded border border-double px-2 py-1 enabled:hover:cursor-pointer disabled:text-gray-500';

	function clickOutside(element, callbackFunction) {
		function onClick(event) {
			if (!element.contains(event.target)) {
				callbackFunction();
			}
		}

		document.body.addEventListener('click', onClick);

		return {
			update(newCallbackFunction) {
				callbackFunction = newCallbackFunction;
			},
			destroy() {
				document.body.removeEventListener('click', onClick);
			}
		};
	}
</script>

<button use:clickOutside={onclickoutside} class={`${customStyle} ${btnstyle}`} {disabled} {onclick}
	>{name}</button
>
