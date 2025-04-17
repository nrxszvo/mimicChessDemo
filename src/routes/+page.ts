export const ssr = false;
import type { PageLoad } from './$types';
import { ongoing, auth } from '$lib/stores';
import { get } from 'svelte/store';
import { createOngoingGames } from '$lib/ongoingGames.svelte';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { mygames, availableBots } = await parent();
	if (!get(ongoing)) {
		ongoing.set(createOngoingGames());
	}
	mygames.then(games => games.forEach((game) => get(ongoing).syncActive(game, get(auth), fetch)));

	return { availableBots };
};
