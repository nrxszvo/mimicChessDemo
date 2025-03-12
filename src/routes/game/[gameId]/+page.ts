export const ssr = false;
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getGameCtrl } from '$lib/utils';
import { ongoing } from '$lib/stores';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ fetch, params }) => {
	let { gameId } = params;
	let ctrl;
	if (Object.hasOwn(get(ongoing).games, gameId)) {
		ctrl = get(ongoing).games[gameId];
	} else {
		ctrl = await getGameCtrl(gameId, 'white', 'watch', fetch);
		get(ongoing).games[gameId] = ctrl;
	}
	return { ctrl };
};
