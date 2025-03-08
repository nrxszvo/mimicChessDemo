import { Chess, SQUARES } from 'chess.js';
import { readStream } from '$lib/ndJsonStream';
import { login } from '$lib/login';
import { auth, ongoing, userStream } from '$lib/stores';
import { get } from 'svelte/store';

// Find all legal moves
export function toDests(chess) {
	const dests = new Map();
	SQUARES.forEach((s) => {
		const ms = chess.moves({ square: s, verbose: true });
		if (ms.length)
			dests.set(
				s,
				ms.map((m) => m.to)
			);
	});
	return dests;
}

// Play a move and toggle whose turn it is
export function playOtherSide(chessground, chess) {
	return (orig, dest) => {
		chess.move({ from: orig, to: dest });
		const color = chess.turn() == 'w' ? 'white' : 'black';
		chessground.set({
			turnColor: color,
			movable: {
				color: color,
				dests: toDests(chess)
			}
		});
	};
}

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

export const challengeBot = async (bot: string) => {
	const resp = await fetch('/api/challengeBot', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ bot })
	});
	if (resp.ok) {
		const stream = readStream('challengebot', resp, () => {});
		await stream.closePromise;
	} else {
		throw new Error(resp.error);
	}
};

const initUserStream = async () => {
	if (!get(userStream)) {
		userStream.set(
			await get(auth).openStream('/api/stream/event', {}, (msg) => {
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
			})
		);
	}
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
