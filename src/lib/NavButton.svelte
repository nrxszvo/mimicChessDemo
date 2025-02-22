<script lang="ts">
	let { disabled = false, onclick, onclickoutside = () => void 0, customStyle = '' } = $props();

	let btnstyle =
		'px-2 py-1/2 text-gray-300 hover:text-gray-100 enabled:hover:cursor-pointer disabled:text-gray-500';

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
	><slot /></button
>
