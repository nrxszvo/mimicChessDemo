import type { LayoutServerLoad } from './$types';
import { getXata } from '$lib/getXata';
import hash from 'object-hash';
import { MIMIC_TOKEN } from '$env/static/private';
import { readStream } from '$lib/ndJsonStream';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	let whoami = cookies.get('whoami', { path: '/' });
	if (!whoami) {
		whoami = hash(new Date());
		console.log('created whoami', whoami);
		cookies.set('whoami', whoami, { path: '/' });
	}

	const xata = getXata();

	const mygames = [];
	let resp = await fetch(`/api/ongoing`);
	const data = await resp.json();
	for (let game of data.nowPlaying) {
		const rec = await xata.db.game.read(game.gameId);
		if (rec && rec.owner == whoami) {
			mygames.push(game);
		}
	}

	resp = await fetch('https://lichess.org/api/bot/online', {
		method: 'GET',
		headers: { Authorization: `Bearer: ${MIMIC_TOKEN}` }
	});
	const onlineBots = [];
	const stream = readStream('onlinebots', resp, (msg) => onlineBots.push(msg));
	await stream.closePromise;

	const knownBots = await xata.db.bot.getAll();
	const botNames = knownBots.map((bot) => bot.xata_id);
	for (let bot of onlineBots) {
		if (!botNames.includes(bot.username)) {
			let rec = await xata.db.bot.create(bot.username, { available: true });
			knownBots.push(rec);
		}
	}
	const availableBots = knownBots.filter((bot) => bot.available).map((bot) => bot.xata_id);

	return { whoami, mygames, availableBots };
};
