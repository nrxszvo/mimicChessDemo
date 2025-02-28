<script lang="ts">
	import AutoItem from '$lib/AutoItem.svelte';
	import { clickOutside } from './utils';
	import { onMount } from 'svelte';

	let { bots, challengeBot, disabled } = $props();

	let clicked = $state(false);
	let filteredItems: any[] = $state([]);
	const filterItems = () => {
		filteredItems = [];
		bots.forEach((b: any) => {
			if (b.username.toLowerCase().startsWith(inputValue.toLowerCase())) {
				filteredItems.push({
					bot: b.username,
					handle: null,
					id: filteredItems.length
				});
			}
		});
	};

	let searchInput: any = $state(null); // use with bind:this to focus element
	let inputValue = $state('');

	let hiLiteIndex: number = $state(-1);

	const navigateList = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown' && hiLiteIndex != filteredItems.length - 1) {
			hiLiteIndex += 1;
			filteredItems[hiLiteIndex].handle.focus();
			filteredItems[hiLiteIndex].handle.blur();
		} else if (e.key === 'ArrowUp' && hiLiteIndex != -1) {
			hiLiteIndex -= 1;
			if (hiLiteIndex == -1) searchInput.focus();
			else {
				filteredItems[hiLiteIndex].handle.focus();
				filteredItems[hiLiteIndex].handle.blur();
			}
		} else if (e.key === 'Enter' && hiLiteIndex != -1) {
			clicked = false;
			const bot = filteredItems[hiLiteIndex].bot;
			challengeBot(bot);
		} else {
			return;
		}
	};
</script>

<svelte:window onkeydown={navigateList} />
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="relative flex flex-col items-center justify-center">
	<div
		class="border border-blue-500 px-4 py-2 drop-shadow-xl"
		class:hover:cursor-pointer={!disabled}
		class:hover:bg-gray-300={!disabled}
		class:bg-gray-300={clicked}
		class:hover:text-blue-500={!disabled}
		class:text-blue-500={clicked}
		class:text-gray-500={disabled}
		onclick={() => {
			console.log('div clicked');
			clicked = !clicked;
			if (clicked) filterItems();
		}}
		use:clickOutside={() => {
			clicked = false;
			filteredItems = [];
			inputValue = '';
			hiLiteIndex = -1;
		}}
	>
		Watch Mimic play against Maia bot on Lichess
	</div>
	{#if clicked}
		<!-- svelte-ignore a11y_autofocus -->
		<div class="absolute top-10 left-1/2 z-12 inline-block -translate-x-1/2 border">
			<div class="flex">
				<input
					autocomplete="off"
					id="item-input"
					class="w-0 min-w-fit flex-grow border-b-1 p-2 text-center text-blue-500 caret-blue-500 placeholder:italic enabled:hover:cursor-pointer"
					class:bg-gray-300={clicked}
					class:outline-none={clicked}
					placeholder="search by bot name"
					type="text"
					bind:this={searchInput}
					bind:value={inputValue}
					oninput={filterItems}
					autofocus={true}
					{disabled}
				/>
			</div>
			<ul class="max-h-[300px] w-full min-w-fit overflow-y-scroll">
				{#each filteredItems as item (item)}
					<AutoItem
						itemLabel={item.bot}
						onclick={() => {
							clicked = false;
							challengeBot(item.bot);
						}}
						highlighted={item.id == hiLiteIndex}
						bind:handle={item.handle}
						entered={() => (hiLiteIndex = item.id)}
					/>
				{/each}
			</ul>
		</div>
	{/if}
</div>
