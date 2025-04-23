import { getXata } from '$lib/getXata';
import { MIMIC_TOKEN } from '$env/static/private';
import { readStream } from '$lib/ndJsonStream';

export const knownBots = async () => {
	const xata = getXata();
	const onlineBots = [];
	const onlinePromise = fetch('https://lichess.org/api/bot/online', {
		method: 'GET',
		headers: { Authorization: `Bearer: ${MIMIC_TOKEN}` }
	}).then((resp) => {
		if (resp.ok) {
			const stream = readStream('onlinebots', resp, (msg) => {
				if (!msg.type) {
					onlineBots.push(msg);
				}
			});
			return stream.closePromise;
		} else {
			return Promise.resolve();
		}
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
				available: false,
				blitz: bot.perfs.blitz.rating,
				bio: bot.profile.bio
			});
			knownBots.push(rec);
		}
	}
	return knownBots;
};
