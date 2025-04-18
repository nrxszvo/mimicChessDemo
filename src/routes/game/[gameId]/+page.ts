export const ssr = false;
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getGameCtrl } from '$lib/utils';
import type { GameCtrl } from '$lib/game.svelte';
import { ongoing } from '$lib/stores';
import { get } from 'svelte/store';
import { createOngoingGames } from '$lib/ongoingGames.svelte';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const { gameInfo, isMyGame } = await parent();
	const { gameId } = params;
	let ctrl: GameCtrl | null = null;

	if (isMyGame) {
		if (!get(ongoing)) {
			ongoing.set(createOngoingGames());
		}
		const games = get(ongoing).games;
		if (Object.hasOwn(games, gameId)) {
			ctrl = games[gameId];
		} else {
			ctrl = await getGameCtrl(gameInfo, 'white', 'watch', fetch);
			games[gameId] = ctrl;
		}
	}
	return { ctrl };
};
