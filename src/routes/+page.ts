export const ssr = false;
import type { PageLoad } from './$types';
import { ongoing, auth } from '$lib/stores';
import { get } from 'svelte/store';
import { createOngoingGames } from '$lib/ongoingGames.svelte';

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(`/api/ongoing`);
	const data = await resp.json();
	if (!get(ongoing)) {
		ongoing.set(createOngoingGames());
	}
	await get(ongoing).syncActive(data.nowPlaying, get(auth), fetch);
};
