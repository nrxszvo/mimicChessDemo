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
		if (rec && rec.owner == whoami && !rec.xata_id.substr(0, 3) == 'pgn') {
			mygames.push(game);
		}
	}

	const onlineBots = [];
	const onlinePromise = fetch('https://lichess.org/api/bot/online', {
		method: 'GET',
		headers: { Authorization: `Bearer: ${MIMIC_TOKEN}` }
	}).then((resp) => {
		const stream = readStream('onlinebots', resp, (msg) => {
			if (!msg.type) {
				onlineBots.push(msg);
			}
		});
		return stream.closePromise;
	});

	let knownBots, botNames;
	const knownPromise = xata.db.bot.getAll().then((kb) => {
		knownBots = kb;
		botNames = knownBots.map((bot) => bot.xata_id);
	});

	await Promise.all([onlinePromise, knownPromise]);

	for (let bot of onlineBots) {
		if (!botNames.includes(bot.username)) {
			let rec = await xata.db.bot.create(bot.username, {
				available: true,
				blitz: bot.perfs.blitz.rating,
				bio: bot.profile.bio
			});
			knownBots.push(rec);
		}
	}
	const availableBots = knownBots.filter((bot) => bot.available);

	return { whoami, mygames, availableBots };
};
