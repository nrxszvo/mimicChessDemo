export const ssr = false;
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getGameCtrl } from '$lib/utils';
import { ongoing } from '$lib/stores';
import { get } from 'svelte/store';
import { createOngoingGames } from '$lib/ongoingGames.svelte';

export const load: PageLoad = async ({ fetch, params }) => {
	let { gameId } = params;
	let ctrl;
	if (!get(ongoing)) {
		ongoing.set(createOngoingGames());
	}
	const games = get(ongoing).games;
	if (Object.hasOwn(games, gameId)) {
		ctrl = games[gameId];
	} else {
		ctrl = await getGameCtrl(gameId, 'white', 'watch', fetch);
		games[gameId] = ctrl;
	}
	return { ctrl };
};
