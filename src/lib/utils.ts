import { goto } from '$app/navigation';
import { readStream } from '$lib/ndJsonStream';
import { login } from '$lib/login';
import { auth, ongoing, challengeIds } from '$lib/stores';
import { get } from 'svelte/store';
import type { Game } from '$lib/game.svelte';
import { createCtrl } from '$lib/game.svelte';
import { PUBLIC_SERVER, PUBLIC_MIMIC_BOT } from '$env/static/public';

const debug_print = (...msgs) => {
	if (false) {
		console.log(msgs);
	}
};

export function clickOutside(elem, cb) {
	const onClick = (event) => {
		if (!elem.contains(event.target)) {
			cb();
		}
	};
	document.body.addEventListener('click', onClick);
	return {
		update(newCb) {
			cb = newCb;
		},
		destroy() {
			document.body.removeEventListener('click', onClick);
		}
	};
}

const getDestBot = (msg: any) => {
	if (
		['challenge', 'challengeDeclined', 'challengeCanceled'].includes(msg.type)
	) {
		return msg.challenge.destUser.name;
	} else if (['gameStart', 'gameFinish'].includes(msg.type)) {
		return msg.game.opponent.username.substr(4);
	} else {
		return 'none';
	}
};

const WAIT_TIME = 10000;
const MAX_WAIT_TIME = 20000;
export const handleChallenge = (msg: Game, bot: string, gscb: () => void) => {
	const destBot = getDestBot(msg);
	if (destBot == bot) {
		if (msg.type == 'challenge') {
			fetch(`${PUBLIC_SERVER}/challenge`, {
				method: 'POST',
				headers: {
					'Content-type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify(msg)
			})
				.catch((e) => {
					gscb('server');
				})
				.then((resp) => {
					if (resp.ok) {
						resp.json().then((res) => {
							if (!res.challenge.accepted) {
								if (res.challenge.decline_reason == 'max_games') {
									gscb('numActive');
								}
							}
						});
					} else {
						gscb('server');
					}
				});
		} else if (msg.type == 'challengeDeclined') {
			gscb('declined');
		} else if (msg.type == 'gameStart') {
			fetch(`${PUBLIC_SERVER}/gameStart/${msg.game.id}`).then((resp) => {
				resp.json().then((res) => {
					if (res.gameStart.accepted) {
						gscb('accepted', msg.game.id);
					}
				});
			});
		}
	} else {
		if (msg.type != 'ping') {
			debug_print(
				`${bot}-events: ignoring message for ${destBot} of type ${msg.type}`
			);
		}
	}
};

const openEventStream = async (fetch) => {
	return await fetch('/api/openStream', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ api: 'stream/event' })
	});
};

export const challengeBot = async (
	bot: string,
	gscb: (string) => void,
	eventStream: Stream | null = null,
	fetchFn = fetch
) => {
	let botResponded = false;
	const gscbWrapper = (
		reason: string,
		gameId: string | undefined = undefined
	) => {
		botResponded = true;
		gscb(reason, gameId);
	};

	const handler = (msg: Game) => handleChallenge(msg, bot, gscbWrapper);

	const initEventStream = async () => {
		if (eventStream && eventStream.alive) {
			eventStream.updateHandler(handler);
		} else {
			const start = new Date();
			let resp = await openEventStream(fetchFn);
			eventStream = readStream(bot + '-events', resp, handler);
			eventStream.closePromise.then(() => {
				const now = new Date();
				if (!botResponded && now.getTime() - start.getTime() < WAIT_TIME) {
					debug_print('reopening bot-events');
					openEventStream(fetchFn).then((resp) => initEventStream(resp));
				}
			});
		}
		setTimeout(() => {
			if (!botResponded) {
				if (Object.hasOwn(get(challengeIds), bot)) {
					const { id, start } = get(challengeIds)[bot];
					debug_print(bot + '-events: no response');
					fetchFn('/api/cancelChallenge', {
						method: 'POST',
						headers: { 'Content-type': 'application/json' },
						body: JSON.stringify({ challengeId: id })
					});
				} else {
					debug_print(bot + '-events: max wait time');
				}
				gscb('noResponse');
			}
		}, WAIT_TIME);

		return eventStream;
	};

	const initChallengeStream = async () => {
		const chlng = await fetchFn('/api/challengeBot', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ bot })
		});
		const chlngStream = readStream('challenge-stream', chlng, (msg: any) => {
			if (msg.id) {
				get(challengeIds)[bot] = { id: msg.id, start: new Date() };
			} else if (msg.message && msg.message == 'Too Many Requests') {
				gscb('requests');
			} else if (msg.done) {
				botResponded = true;
			}
		});
	};

	try {
		const resp = await fetch(`${PUBLIC_SERVER}/isAvailable`);
		if (resp.ok) {
			const { available } = await resp.json();
			if (available) {
				eventStream = await initEventStream();
				initChallengeStream();
			} else {
				gscb('numActive');
			}
		}
	} catch {
		gscb('server');
	}

	return eventStream;
};

const initUserStream = async () => {
	const userStream = await get(auth).openStream(
		'/api/stream/event',
		{},
		(msg) => {
			switch (msg.type) {
				case 'gameStart':
					get(ongoing).onStart(msg.game, get(auth));
					break;
				case 'gameFinish':
					get(ongoing).onFinish(msg.game);
					break;
				case 'challenge':
					break;
				default:
					console.warn(`Unprocessed message of type ${msg.type}`, msg);
			}
		}
	);
};

const formData = (data: any): FormData => {
	const formData = new FormData();
	for (const k of Object.keys(data)) formData.append(k, data[k]);
	return formData;
};

export const challengeMimic = async () => {
	debug_print('logging in...');
	await login();
	debug_print('init user stream...');
	await initUserStream();
	const config = {
		rated: false,
		'clock.limit': 10 * 60,
		'clock.increment': 0
	};
	debug_print('challenging mimic...');
	const challenge = await get(auth).openStream(
		`/api/challenge/${PUBLIC_MIMIC_BOT}`,
		{
			method: 'post',
			body: formData({ ...config, keepAliveStream: true })
		},
		() => {}
	);
	const stream = await fetchFn('/api/openStream', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ api: 'stream/event' })
	});
	readStream('challenge-stream', stream, (msg: Game, stream: ReadableStream) =>
		handleChallenge(msg, stream, () => {})
	);
	debug_print('done');
};

export const getMyActive = async () => {
	if (get(auth).me) {
		const { nowPlaying } = await get(auth).fetchBody(
			'/api/account/playing',
			{}
		);
		return nowPlaying.reduce((o, g) => (o[g.gameId] = g), {});
	} else {
		return {};
	}
};

export const getGameCtrl = async (
	gameInfo: any,
	color: 'black' | 'white' | null,
	ctrlType: 'game' | 'watch',
	fetch
) => {
	return await createCtrl(
		gameInfo,
		color,
		ctrlType,
		get(auth),
		fetch,
		'getGameCtrl'
	);
};
