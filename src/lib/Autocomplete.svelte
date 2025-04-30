<script lang="ts">
	import AutoItem from '$lib/AutoItem.svelte';
	import { clickOutside } from './utils';

	let { bots, challengeBot, disabled } = $props();

	let clicked = $state(false);
	let hovered = $state(false);
	let filteredItems: any[] = $state([]);
	const filterItems = (initRandom: boolean) => {
		filteredItems = [];
		bots.forEach((b: any) => {
			if (b.xata_id.toLowerCase().startsWith(inputValue.toLowerCase())) {
				filteredItems.push({
					bot: b.xata_id,
					rating: b.blitz,
					bio: b.bio,
					handle: null,
					id: filteredItems.length,
					scrollTo: false
				});
			}
		});
		let idx;
		if (initRandom) {
			idx = Math.floor(filteredItems.length * Math.random());
			filteredItems[idx].scrollTo = true;
		}
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

	let dropdown: Element | undefined = $state();
	let top = $derived(dropdown ? dropdown.getBoundingClientRect().height : 0);
	let dropdownHeight = $derived(
		dropdown
			? window.innerHeight - 3 * dropdown.getBoundingClientRect().height
			: 0
	);
</script>

<svelte:window onkeydown={navigateList} />
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	use:clickOutside={() => {
		clicked = false;
		filteredItems = [];
		inputValue = '';
		hiLiteIndex = -1;
	}}
	class="mx-2 flex flex-col items-center justify-center"
	onmouseleave={() => (hovered = false)}
>
	<div
		class="bg-chessgreen overflow-hidden rounded px-4 py-2 text-white hover:cursor-pointer hover:drop-shadow-xl"
		class:text-gray-500={disabled}
		onclick={() => {
			clicked = true;
			filterItems(true);
		}}
		onmouseenter={() => {
			/*hovered = true;
			filterItems();*/
		}}
	>
		Challenge another bot to play against Mimic on Lichess!
	</div>
	{#if (clicked || hovered) && !disabled}
		<div
			class="border-chessgreen absolute top-0 left-1/2 z-12 inline-block -translate-x-1/2 border"
			bind:this={dropdown}
			style:top="{top}px"
		>
			<div class="flex">
				<input
					autocomplete="off"
					id="item-input"
					class="text-chessgreen caret-chessgreen w-0 min-w-fit flex-grow border-b-1 bg-white p-2 text-center outline-none placeholder:italic enabled:hover:cursor-pointer"
					placeholder="search for a bot"
					type="text"
					bind:this={searchInput}
					bind:value={inputValue}
					oninput={() => filterItems(false)}
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
						scrollTo={item.scrollTo}
						bind:handle={item.handle}
						entered={() => {
							hiLiteIndex = item.id;
						}}
						parent={dropdown}
					/>
				{/each}
			</ul>
		</div>
	{/if}
</div>
