import { Chess, SQUARES } from 'chess.js';
import { goto } from '$app/navigation';
import { readStream } from '$lib/ndJsonStream';
import { login } from '$lib/login';
import { auth, ongoing } from '$lib/stores';
import { get } from 'svelte/store';
import type { Game } from '$lib/game.svelte';
import { createCtrl } from '$lib/game.svelte';

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
		console.log('sending gamestart for ' + msg.game.id);
		{
			let promise = fetch(`${URL}/gameStart/${msg.game.id}`);
			promise.then((resp) => {
				resp.json().then((res) => {
					if (res.gameStart.accepted) {
						stream.cancel();
						goto(`/game/${msg.game.gameId}`);
					} else {
						console.log('gameStart declined: ' + res.gameStart.decline_reason);
					}
				});
			});
		}
	} else {
		console.log('gamestart cb ignoring message of type ' + msg.type);
	}
};

const handleChallenge = async (msg: Game, stream: Stream, gscb: () => void) => {
	if (msg.type == 'challenge') {
		console.log('sending challenge for ' + msg.challenge.id);
		let promise = fetch(`${URL}/challenge`, {
			method: 'POST',
			headers: { 'Content-type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify(msg)
		});
		promise.then((resp) => {
			resp.json().then((res) => {
				if (!res.challenge.accepted) {
					stream.cancel();
					gscb('numActive');
					console.log('challenge declined: ' + res.challenge.decline_reason);
				}
				console.log(res);
			});
		});
	} else if (msg.type == 'challengeDeclined') {
		stream.cancel();
		gscb('declined');
	} else if (msg.type == 'gameStart') {
		handleGameStart(msg, stream);
	} else {
		console.log('challenge cb ignoring message of type ' + msg.type);
	}
};

export const challengeBot = async (bot: string, gscb: (string) => void) => {
	console.log('opening event stream');
	const start = new Date();
	const stream = await fetch('/api/openStream', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ api: 'stream/event' })
	});
	const end = new Date();
	console.log('openstream took ' + (end.getTime() - start.getTime()) + ' ms');
	console.log('reading event stream');
	readStream(
		'challenge-stream',
		stream,
		(msg: Game, stream: ReadableStream) => handleChallenge(msg, stream, gscb),
		true
	);
	console.log('opening challenge stream');
	const chlng = await fetch('/api/challengeBot', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ bot })
	});
	if (!chlng.ok) {
		gscb('declined');
	}
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
	console.log('logging in...');
	await login();
	console.log('init user stream...');
	await initUserStream();
	const config = {
		rated: false,
		'clock.limit': 10 * 60,
		'clock.increment': 0
	};
	console.log('challenging mimic...');
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
	readStream(
		'challenge-stream',
		stream,
		(msg: Game, stream: ReadableStream) => handleChallenge(msg, stream, () => {}),
		true
	);
	console.log('done');
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
	gameId: string,
	color: 'black' | 'white' | null,
	ctrlType: 'game' | 'watch',
	fetch
) => {
	return await createCtrl(gameId, color, ctrlType, get(auth), fetch, 'getGameCtrl');
};
