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
		const idx = get(ongoing).indexOf(gameId);
		if (idx >= 0) {
			ctrl = games[idx];
		} else {
			ctrl = await getGameCtrl(gameInfo, 'white', 'watch', fetch);
			games.push(ctrl);
		}
	}
	return { ctrl };
};
