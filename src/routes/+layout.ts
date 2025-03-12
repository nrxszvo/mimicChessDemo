import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const resp = await fetch('/api/ongoing');
	const { nowPlaying } = await resp.json();
	return { mimicActive: nowPlaying };
};
