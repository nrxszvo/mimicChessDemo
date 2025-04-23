import type { LayoutServerLoad } from './$types';
import { getXata } from '$lib/getXata';
import hash from 'object-hash';
import { MIMIC_TOKEN } from '$env/static/private';
import { readStream } from '$lib/ndJsonStream';
import { knownBots } from '$lib/server';

const myGames = async (whoami) => {
	const games = [];
	let response = await fetch(`https://lichess.org/api/account/playing`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${MIMIC_TOKEN}`
		}
	});
	if (response.ok) {
		const xata = getXata();
		const data = await response.json();
		for (let game of data.nowPlaying) {
			const rec = await xata.db.game.read(game.gameId);
			if (rec && rec.owner == whoami) {
				games.push(game);
			}
		}
	}
	return games;
};

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	let whoami = cookies.get('whoami', { path: '/' });
	if (!whoami) {
		whoami = hash(new Date());
		cookies.set('whoami', whoami, { path: '/' });
	}

	return { whoami, mygames: myGames(whoami), knownBots: knownBots() };
};
