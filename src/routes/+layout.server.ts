import type { LayoutServerLoad } from './$types';
import { getXata } from '$lib/getXata';
import hash from 'object-hash';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	let whoami = cookies.get('whoami', { path: '/' });
	if (!whoami) {
		whoami = hash(new Date());
		console.log('created whoami', whoami);
		cookies.set('whoami', whoami, { path: '/' });
	}
	const xata = getXata();
	const mygames = [];
	const resp = await fetch(`/api/ongoing`);
	const data = await resp.json();
	for (let game of data.nowPlaying) {
		const rec = await xata.db.game.read(game.gameId);
		if (rec && rec.owner == whoami) {
			mygames.push(game);
		}
	}
	return { whoami, mygames };
};
