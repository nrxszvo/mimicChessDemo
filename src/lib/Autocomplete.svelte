<script lang="ts">
	import AutoItem from '$lib/AutoItem.svelte';
	import { clickOutside } from './utils';

	let { bots, challengeBot, disabled } = $props();

	let clicked = $state(false);
	let hovered = $state(false);
	let filteredItems: any[] = $state([]);
	const filterItems = () => {
		filteredItems = [];
		bots.forEach((b: any) => {
			if (b.xata_id.toLowerCase().startsWith(inputValue.toLowerCase())) {
				filteredItems.push({
					bot: b.xata_id,
					rating: b.blitz,
					bio: b.bio,
					handle: null,
					id: filteredItems.length
				});
			}
		});
	};

	let searchInput: any = $state(null);
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
			hovered = false;
			const bot = filteredItems[hiLiteIndex].bot;
			challengeBot(bot);
		} else {
			return;
		}
	};

	let parent: Element | undefined = $state();
	let dropdown: Element | undefined = $state();
	let dropdownHeight = $derived(
		dropdown
			? window.innerHeight -
					dropdown.getBoundingClientRect().top -
					dropdown.getBoundingClientRect().height
			: 0
	);
</script>

<svelte:window onkeydown={navigateList} />
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	bind:this={parent}
	use:clickOutside={() => {
		clicked = false;
		filteredItems = [];
		inputValue = '';
		hiLiteIndex = -1;
	}}
	class="relative flex flex-col items-center justify-center"
	onmouseleave={() => (hovered = false)}
>
	<div
		class="bg-chessgreen overflow-hidden rounded px-4 py-2 text-white drop-shadow-xl"
		class:hover:cursor-pointer={(clicked || hovered) && !disabled}
		class:text-gray-500={disabled}
		onclick={() => {
			clicked = true;
		}}
		onmouseenter={() => {
			hovered = true;
			filterItems();
		}}
	>
		Watch Mimic play against another bot on Lichess
	</div>
	{#if (clicked || hovered) && !disabled}
		<div
			class="border-chessgreen absolute top-10 left-1/2 z-12 inline-block -translate-x-1/2 border"
			bind:this={dropdown}
		>
			<div class="flex">
				<input
					autocomplete="off"
					id="item-input"
					class="text-chessgreen caret-chessgreen w-0 min-w-fit flex-grow border-b-1 bg-white p-2 text-center outline-none placeholder:italic enabled:hover:cursor-pointer dark:bg-stone-800"
					placeholder="search for a bot"
					type="text"
					bind:this={searchInput}
					bind:value={inputValue}
					oninput={filterItems}
					{disabled}
				/>
			</div>
			<ul
				class="w-full min-w-fit overflow-x-hidden overflow-y-scroll"
				style:max-height="{dropdownHeight}px"
			>
				{#each filteredItems as item (item)}
					<AutoItem
						{item}
						onclick={(e: Event) => {
							e.stopPropagation();
							clicked = false;
							hovered = false;
							challengeBot(item.bot);
						}}
						highlighted={item.id == hiLiteIndex}
						bind:handle={item.handle}
						entered={() => {
							hiLiteIndex = item.id;
						}}
						{parent}
					/>
				{/each}
			</ul>
		</div>
	{/if}
</div>
