import type { Game } from '$lib/interfaces';
import type { Api as CgApi } from 'chessground/api';
import type { Config as CgConfig } from 'chessground/config';
import type { Stream } from '$lib/ndJsonStream';
import type { Color, Key } from 'chessground/types';

import { readStream } from '$lib/ndJsonStream';
import { opposite, parseUci } from 'chessops/util';
import { Chess, defaultSetup } from 'chessops';
import { makeFen, parseFen } from 'chessops/fen';
import { chessgroundDests } from 'chessops/compat';

export interface BoardCtrl {
	chess: Chess;
	ground?: CgApi;
	chessgroundConfig: () => CgConfig;
	setGround: (cg: CgApi) => void;
}

export interface GameCtrl extends BoardCtrl {
	timeOf: (color) => number;
	pov: Color;
	playing: Boolean;
	status: string;
	game: Game;
	lastUpdateAt: () => Date;
	welo: Array;
	belo: Array;
	userMove: (orig: Key, dest: Key) => void;
	resign: () => Promise;
	watchOnly: boolean;
}

export async function createCtrl(
	gameId: string,
	color: Color,
	ctrlType: 'game' | 'watch',
	auth: Auth,
	fetch,
	name: string
): GameCtrl {
	let status = $state('init');
	let welo = $state(null);
	let belo = $state(null);
	let pov = color;
	let game = $state(null);
	let chess = Chess.default();
	let lastMove = null;
	let ground = null;
	let lastUpdateAt = null;
	const viewOnly = ctrlType == 'watch';

	const handle = (msg: any) => {
		switch (msg.type) {
			case 'gameFull':
				game = msg;
				status = game.state.status;
				onUpdate();
				break;
			case 'gameState':
				game.state = msg;
				status = game.state.status;
				onUpdate();
				break;
			case 'chatLine':
				if (msg.username == 'mimicTestBot') {
					let info = JSON.parse(msg.text);
					welo = info.weloParams;
					belo = info.beloParams;
				}
				break;
			default:
				console.error(`Unknown message type: ${msg.type}`, msg);
		}
	};

	const setPov = (game: Game) => {
		if (game.white.title == 'BOT' && game.black.title == 'BOT') {
			if (game.white.name == 'mimicTestBot') {
				return 'white';
			} else {
				return 'black';
			}
		} else if (game.white.title == 'BOT') {
			return 'black';
		} else {
			return 'white';
		}
	};

	const handler = (msg: any, stream: ReadableStream) => {
		if (!game) {
			game = msg;
			pov = setPov(game);
		}
		handle(msg);
	};

	async function initWatchStream(gameId: string, fetch) {
		const resp = await fetch('/api/openStream', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ api: `bot/game/stream/${gameId}` })
		});
		const stream = readStream(name + '-botgame', resp, handler, false, true);
		/*
		stream.closePromise.then(() => {
			if (status == 'started') initWatchStream(gameId, fetch);
		});
	   */
	}

	async function initGameStream(gameId: string, auth: Auth) {
		await auth.openStream(`/api/board/game/stream/${gameId}`, {}, handler, false, false);
	}

	const onUpdate = () => {
		const setup =
			game.initialFen == 'startpos' ? defaultSetup() : parseFen(game.initialFen).unwrap();
		chess = Chess.fromSetup(setup).unwrap();
		const moves = game.state.moves.split(' ').filter((m: string) => m);
		moves.forEach((uci: string) => chess.play(parseUci(uci)!));
		let lastMove = moves[moves.length - 1];
		lastMove = lastMove && [lastMove.substr(0, 2) as Key, lastMove.substr(2, 2) as Key];
		lastUpdateAt = Date.now();
		ground?.set(chessgroundConfig());
		if (chess.turn == pov) ground?.playPremove();
	};

	const chessgroundConfig = () => ({
		orientation: pov,
		fen: makeFen(chess.toSetup()),
		lastMove: lastMove,
		turnColor: chess.turn,
		check: !!chess.isCheck(),
		viewOnly: viewOnly,
		draggable: {
			enabled: !viewOnly
		},
		selectable: {
			enabled: !viewOnly
		},
		movable: {
			free: false,
			color: status == 'started' ? pov : undefined,
			dests: chessgroundDests(chess)
		},
		events: {
			move: viewOnly ? null : userMove
		}
	});

	const timeOf = (color: Color) => game.state[`${color[0]}time`];

	const userMove = async (orig: Key, dest: Key) => {
		if (!viewOnly) {
			ground?.set({ turnColor: opposite(pov) });
			await auth.fetchBody(`/api/board/game/${game.id}/move/${orig}${dest}`, {
				method: 'post'
			});
		}
	};

	const resign = async () => {
		if (!viewOnly) {
			await auth.fetchBody(`/api/board/game/${game.id}/resign`, {
				method: 'post'
			});
		}
	};

	if (viewOnly) {
		await initWatchStream(gameId, fetch);
	} else {
		await initGameStream(gameId, auth);
	}

	return {
		chessgroundConfig,
		timeOf,
		get game() {
			return game;
		},
		get pov() {
			return pov;
		},
		get playing() {
			return status == 'started';
		},
		get status() {
			return status;
		},
		get chess() {
			return chess;
		},
		get lastUpdateAt() {
			return lastUpdateAt;
		},
		setGround: (cg: CgApi) => (ground = cg),
		get welo() {
			return welo;
		},
		get belo() {
			return belo;
		},
		userMove,
		resign,
		get watchOnly() {
			return viewOnly;
		}
	};
}
