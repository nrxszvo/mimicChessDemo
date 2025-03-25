import { Chess, SQUARES } from 'chess.js';
import { goto } from '$app/navigation';
import { readStream } from '$lib/ndJsonStream';
import { login } from '$lib/login';
import { auth, ongoing } from '$lib/stores';
import { get } from 'svelte/store';
import type { Game } from '$lib/game.svelte';
import { createCtrl } from '$lib/game.svelte';

const debug_print = (...msgs) => {
	if (false) {
		console.log(msgs);
	}
};

export function clickOutside(element, callbackFunction) {
	function onClick(event) {
		if (!element.contains(event.target)) {
			callbackFunction();
		}
	}
	document.body.addEventListener('click', onClick);
	return {
		update(newCallbackFunction) {
			callbackFunction = newCallbackFunction;
		},
		destroy() {
			document.body.removeEventListener('click', onClick);
		}
	};
}

const URL = 'https://michaelhorgan.me';
//const URL = 'http://localhost:8080';
const handleGameStart = async (msg: Game, stream: ReadableStream) => {
	if (msg.type == 'gameStart') {
		debug_print('sending gamestart to Mimic for ' + msg.game.id);
		{
			let promise = fetch(`${URL}/gameStart/${msg.game.id}`);
			promise.then((resp) => {
				resp.json().then((res) => {
					if (res.gameStart.accepted) {
						debug_print('game started; canceling');
						stream.cancel();
						goto(`/game/${msg.game.gameId}`);
					} else {
						debug_print('Mimic declined gameStart: ' + res.gameStart.decline_reason);
					}
				});
			});
		}
	} else {
		debug_print('bot-events: ignoring message of type ' + msg.type);
	}
};

export const handleChallenge = async (msg: Game, stream: Stream, gscb: () => void, start: Date) => {
	if (msg.type == 'challenge') {
		debug_print('sending challenge to Mimic for ' + msg.challenge.id);
		const promise = fetch(`${URL}/challenge`, {
			method: 'POST',
			headers: { 'Content-type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify(msg)
		});
		promise
			.catch((e) => {
				stream.cancel();
				gscb('server');
			})
			.then((resp) => {
				if (resp.ok) {
					resp.json().then((res) => {
						if (!res.challenge.accepted) {
							if (res.challenge.decline_reason == 'max_games') {
								debug_print('max games; canceling');
								stream.cancel();
								gscb('numActive');
							}
							debug_print(
								'Mimic declined challenge: ' + res.challenge.decline_reason
							);
						}
					});
				} else {
					stream.cancel();
					gscb('server');
				}
			});
	} else if (msg.type == 'challengeDeclined') {
		debug_print('challenge declined; canceling');
		stream.cancel();
		gscb('declined');
	} else if (msg.type == 'gameStart') {
		handleGameStart(msg, stream);
	} else {
		const now = new Date();
		if (now.getTime() - start.getTime() > 10000) {
			debug_print('bot-events: no response, canceling');
			stream.cancel();
			gscb('noResponse');
		}
		debug_print('bot-events: ignoring message of type ' + msg.type);
	}
};

export const challengeBot = async (bot: string, gscb: (string) => void) => {
	debug_print('opening bot-events stream');
	const openStream = async () => {
		return await fetch('/api/openStream', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ api: 'stream/event' })
		});
	};
	let resp = await openStream();

	const start = new Date();
	let botResponded = false;
	const gscbWrapper = (reason: string) => {
		botResponded = true;
		gscb(reason);
	};

	const initEventStream = (resp) => {
		const stream = readStream(
			'bot-events',
			resp,
			(msg: Game, stream: ReadableStream) => handleChallenge(msg, stream, gscbWrapper, start),
			true
		);
		stream.closePromise.then(() => {
			const now = new Date();
			if (!botResponded && now.getTime() - start.getTime() < 10000) {
				debug_print('reopening bot-events');
				openStream().then((resp) => initEventStream(resp));
			}
		});
	};
	initEventStream(resp);

	const initChallengeStream = async () => {
		const chlng = await fetch('/api/challengeBot', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ bot })
		});
		const chlngStream = readStream('challenge-stream', chlng, (msg: any) => {
			if (msg.done) {
				debug_print('challenge-stream done: ' + msg.done);
				botResponded = true;
			}
		});
	};
	initChallengeStream();
};

const initUserStream = async () => {
	const userStream = await get(auth).openStream('/api/stream/event', {}, (msg) => {
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
	});
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
		'/api/challenge/mimicTestBot',
		{
			method: 'post',
			body: formData({ ...config, keepAliveStream: true })
		},
		() => {}
	);
	const stream = await fetch('/api/openStream', {
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
		const { nowPlaying } = await get(auth).fetchBody('/api/account/playing', {});
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
	return await createCtrl(gameInfo, color, ctrlType, get(auth), fetch, 'getGameCtrl');
};
