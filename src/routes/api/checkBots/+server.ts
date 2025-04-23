import type { RequestHandler } from './$types';
import { knownBots } from '$lib/server';
import { MIMIC_TOKEN } from '$env/static/private';
import { challengeBot } from '$lib/utils';
import { PUBLIC_SERVER } from '$env/static/public';

const checkBots = async (bots: any[], games: any[], fetch) => {
	const resolved: { [key: string]: boolean } = {};
	let stream: Stream | null = null;

	for (const b of bots) {
		const bot = b.xata_id;
		for (let game of games) {
			if (game.opponent == bot) {
				continue;
			}
		}
		while (true) {
			console.log(bot);
			resolved[bot] = false;
			let challengeResult = '';
			const challengeCb = (reason: string) => {
				console.log(bot, reason);
				challengeResult = reason;
				if (reason == 'accepted') {
					fetch('/api/setBotAvailable', {
						method: 'POST',
						headers: { 'Content-type': 'application/json' },
						body: JSON.stringify({ bot: bot, available: true })
					});
				}
				resolved[bot] = true;
			};

			while (true) {
				const resp = await fetch(`{PUBLIC_SERVER}/isAvailable`, {
					headers: { Accept: 'application/json' }
				});
				const { available } = await resp.json();
				if (available) {
					stream = await challengeBot(bot, challengeCb, stream, fetch);
					break;
				} else {
					await new Promise((r) => setTimeout(r, 10000));
				}
			}

			while (!resolved[bot]) {
				await new Promise((r) => setTimeout(r, 1000));
			}

			if (challengeResult == 'numActive') {
				await new Promise((r) => setTimeout(r, 5000));
			} else {
				break;
			}
		}
	}
};

export const POST: RequestHandler = async ({ request, fetch }) => {
	let { filterBots } = await request.json();
	let response = await fetch(`https://lichess.org/api/account/playing`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${MIMIC_TOKEN}`
		}
	});
	if (!response.ok) {
		return error(response.status, response.statusText);
	}

	const data = await response.json();
	const games = data.nowPlaying;
	let bots = await knownBots();
	if (filterBots) {
		bots = bots.filter((b) => !b.available);
	}
	checkBots(bots, games, fetch);
	return new Response();
};
