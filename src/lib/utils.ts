import { Chess, SQUARES } from 'chess.js';
import { readStream } from '$lib/ndJsonStream';
import { login } from '$lib/login';
import { auth, ongoing } from '$lib/stores';
import { get } from 'svelte/store';
import type { Game } from '$lib/game.svelte';

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

const cb = async (msg: Game, gscb: () => void) => {
	switch (msg.type) {
		case 'gameStart':
			console.log('sending gamestart');
			{
				let promise = fetch(`https://michaelhorgan.me/gameStart/${msg.game.id}`);
				promise.then((resp) => {
					resp.json().then((res) => console.log(res));
				});
			}
			get(ongoing).onStart(msg.game, get(auth));
			break;
		case 'gameFinish':
			get(ongoing).onFinish(msg.game);
			break;
		case 'ping':
			break;
		case 'challenge':
			{
				console.log('sending challenge');
				let promise = fetch('https://michaelhorgan.me/challenge', {
					method: 'POST',
					headers: { 'Content-type': 'application/json', Accept: 'application/json' },
					body: JSON.stringify(msg)
				});
				promise.then((resp) => {
					resp.json().then((res) => {
						console.log(res);
					});
				});
			}
			break;
		case 'challengeDeclined':
			gscb();
			break;
		default:
			console.warn(`Unprocessed message of type ${msg.type}`, msg);
	}
};

export const challengeBot = async (bot: string, gscb: () => void) => {
	const stream = await fetch('/api/openStream', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ api: 'stream/event' })
	});
	readStream('botevents', stream, (msg) => cb(msg, gscb), true);

	const chlng = await fetch('/api/challengeBot', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ bot })
	});
	if (chlng.ok) {
		const stream = readStream('challengebot', chlng, () => {});
		await stream.closePromise;
	} else {
		gscb();
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
	await challenge.closePromise;
	console.log('done');
};
