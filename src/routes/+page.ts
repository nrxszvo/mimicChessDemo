export const ssr = false;
import type { PageLoad } from './$types';
import { ongoing, auth } from '$lib/stores';
import { get } from 'svelte/store';
import { createOngoingGames } from '$lib/ongoingGames.svelte';

export const load: PageLoad = async ({ fetch }) => {
	if (!get(ongoing)) {
		ongoing.set(createOngoingGames());
	}
	fetch(`/api/ongoing`).then((resp) => {
		resp.json().then((data) => {
			get(ongoing).syncActive(data.nowPlaying, get(auth), fetch);
		});
	});
};
