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
	pov: String;
	playing: Boolean;
	status: String;
	game: Game;
	lastUpdateAt: () => Date;
	welo: Array;
	belo: Array;
	resign: () => Promise;
	watchOnly: boolean;
}

export function createCtrl(gameId: string, color: Color): WatchCtrl {
	let status = $state('init');
	let welo = $state(null);
	let belo = $state(null);
	let pov = color;
	let game: Game;
	let chess = Chess.default();
	let lastMove;
	let ground: CgApi;
	let lastUpdateAt: Date;

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

	const onUpdate = () => {
		const setup =
			game.initialFen == 'startpos' ? defaultSetup() : parseFen(game.initialFen).unwrap();
		chess = Chess.fromSetup(setup).unwrap();
		const moves = game.state.moves.split(' ').filter((m: string) => m);
		moves.forEach((uci: string) => chess.play(parseUci(uci)!));
		lastMove = moves[moves.length - 1];
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
		viewOnly: true,
		draggable: {
			enabled: false
		},
		selectable: {
			enabled: false
		},
		movable: {
			free: false
		}
	});

	const timeOf = (color: Color) => game.state[`${color[0]}time`];

	return {
		handle,
		chessgroundConfig,
		timeOf,
		game,
		pov,
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
		watchOnly: true
	};
}

export async function createWatchCtrl(gameId: string, color: Color) {
	let ctrl = createCtrl(gameId, color);

	const handler = (msg: any) => {
		if (!ctrl.game) {
			ctrl.game = msg;
		}
		ctrl.handle(msg);
	};

	const stream = await fetch('/api/openStream', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ api: `bot/game/stream/${gameId}` })
	});

	readStream('botgame', stream, handler);

	return ctrl;
}

export async function createGameCtrl(gameId: string, color: Color, auth: Auth) {
	const watch = await createWatchCtrl(gameId, color);
	const handler = (msg: any) => {
		if (!watch.game) {
			watch.game = msg;
		}
		watch.handle(msg);
	};
	await auth.openStream(`/api/board/game/stream/${gameId}`, {}, handler);

	const chessgroundConfig = () => ({
		orientation: watch.pov,
		fen: makeFen(watch.chess.toSetup()),
		lastMove: watch.lastMove,
		turnColor: watch.chess.turn,
		check: !!watch.chess.isCheck(),
		movable: {
			free: false,
			color: watch.status == 'started' ? watch.pov : undefined,
			dests: chessgroundDests(watch.chess)
		},
		events: {
			move: userMove
		}
	});

	const userMove = async (orig: Key, dest: Key) => {
		watch.ground?.set({ turnColor: opposite(watch.pov) });
		await auth.fetchBody(`/api/board/game/${watch.game.id}/move/${orig}${dest}`, {
			method: 'post'
		});
	};

	const resign = async () => {
		await auth.fetchBody(`/api/board/game/${watch.game.id}/resign`, {
			method: 'post'
		});
	};

	return {
		chessgroundConfig,
		timeOf: watch.timeOf,
		resign,
		get pov() {
			return watch.pov;
		},
		get playing() {
			return watch.status == 'started';
		},
		get status() {
			return watch.status;
		},
		get game() {
			return watch.game;
		},
		set game(g) {
			watch.game = g;
		},
		get chess() {
			return watch.chess;
		},
		get lastUpdateAt() {
			return watch.lastUpdateAt;
		},
		setGround: (cg: CgApi) => (watch.ground = cg),
		get welo() {
			return watch.welo;
		},
		get belo() {
			return watch.belo;
		},
		watchOnly: false
	};
}
