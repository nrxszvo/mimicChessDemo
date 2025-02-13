import type { Game } from '$lib/interfaces';
import type { Api as CgApi } from 'chessground/api';
import type { Config as CgConfig } from 'chessground/config';
import type { Stream } from '$lib/ndJsonStream';
import type { Color, Key } from 'chessground/types';
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

export async function createGameCtrl(gameId: string, auth: Auth) {
	let status = $state('init');
	let pov;
	let game: Game;
	let chess = Chess.default();
	let lastMove;
	let ground: CgApi;
	let eloCb;
	let lastUpdateAt: Date;

	const handler = (msg: any) => {
		if (!game) {
			game = msg;
			pov = game.black.id == auth.me?.id ? 'black' : 'white';
		}
		handle(msg);
	};
	await auth.openStream(`/api/board/game/stream/${gameId}`, {}, handler);

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
				const toEstStr = (data) => {
					let [m, s] = data;
					return m.toString() + ' +/- ' + s.toString();
				};
				if (eloCb) {
					let info = JSON.parse(msg.text);
					eloCb({
						welo: toEstStr(info.WhiteElo),
						belo: toEstStr(info.BlackElo)
					});
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
		movable: {
			free: false,
			color: status == 'started' ? pov : undefined,
			dests: chessgroundDests(chess)
		},
		events: {
			move: userMove
		}
	});
	const timeOf = (color: Color) => game.state[`${color[0]}time`];

	const userMove = async (orig: Key, dest: Key) => {
		ground?.set({ turnColor: opposite(pov) });
		await auth.fetchBody(`/api/board/game/${game.id}/move/${orig}${dest}`, {
			method: 'post'
		});
	};
	const resign = async () => {
		await auth.fetchBody(`/api/board/game/${game.id}/resign`, {
			method: 'post'
		});
	};

	return {
		onUpdate,
		chessgroundConfig,
		timeOf,
		userMove,
		resign,
		get pov() {
			return pov;
		},
		get playing() {
			return status == 'started';
		},
		get game() {
			return game;
		},
		get chess() {
			return chess;
		},
		get lastUpdateAt() {
			return lastUpdateAt;
		},
		registerEloCB: (cb) => (eloCb = cb),
		setGround: (cg: CgApi) => (ground = cg)
	};
}

export class GameCtrl implements BoardCtrl {
	game: Game;
	pov: Color;
	chess: Chess = Chess.default();
	lastMove?: [Key, Key];
	lastUpdateAt: number = Date.now();
	ground?: CgApi;
	redrawInterval: ReturnType<typeof setInterval>;
	whiteEloEst: any = 'tbd';
	blackEloEst: any = 'tbd';

	constructor(
		game: Game,
		readonly stream: Stream,
		auth: Auth
	) {
		this.game = game;
		this.auth = auth;
		this.pov = this.game.black.id == auth.me?.id ? 'black' : 'white';
		this.onUpdate();
	}

	onUnmount = () => {
		this.stream.close();
	};

	private onUpdate = () => {
		const setup =
			this.game.initialFen == 'startpos'
				? defaultSetup()
				: parseFen(this.game.initialFen).unwrap();
		this.chess = Chess.fromSetup(setup).unwrap();
		const moves = this.game.state.moves.split(' ').filter((m: string) => m);
		moves.forEach((uci: string) => this.chess.play(parseUci(uci)!));
		const lastMove = moves[moves.length - 1];
		this.lastMove = lastMove && [lastMove.substr(0, 2) as Key, lastMove.substr(2, 2) as Key];
		this.lastUpdateAt = Date.now();
		this.ground?.set(this.chessgroundConfig());
		if (this.chess.turn == this.pov) this.ground?.playPremove();
	};

	timeOf = (color: Color) => this.game.state[`${color[0]}time`];

	userMove = async (orig: Key, dest: Key) => {
		this.ground?.set({ turnColor: opposite(this.pov) });
		await this.auth.fetchBody(`/api/board/game/${this.game.id}/move/${orig}${dest}`, {
			method: 'post'
		});
	};

	resign = async () => {
		await this.auth.fetchBody(`/api/board/game/${this.game.id}/resign`, {
			method: 'post'
		});
	};

	get playing() {
		return this.game.state.status == 'started';
	}

	chessgroundConfig = () => ({
		orientation: this.pov,
		fen: makeFen(this.chess.toSetup()),
		lastMove: this.lastMove,
		turnColor: this.chess.turn,
		check: !!this.chess.isCheck(),
		movable: {
			free: false,
			color: this.playing ? this.pov : undefined,
			dests: chessgroundDests(this.chess)
		},
		events: {
			move: this.userMove
		}
	});

	setGround = (cg: CgApi) => (this.ground = cg);

	static open = (id: string, auth: Auth): Promise<GameCtrl> =>
		new Promise<GameCtrl>(async (resolve) => {
			let ctrl: GameCtrl;
			let stream: Stream;
			const handler = (msg: any) => {
				if (ctrl) ctrl.handle(msg);
				else {
					// Gets the gameFull object from the first message of the stream,
					// make a GameCtrl from it, then forward the next messages to the ctrl
					ctrl = new GameCtrl(msg, stream, auth);
					resolve(ctrl);
				}
			};
			stream = await auth.openStream(`/api/board/game/stream/${id}`, {}, handler);
		});

	registerEloCB = (cb) => (this.eloCb = cb);

	private handle = (msg: any) => {
		switch (msg.type) {
			case 'gameFull':
				this.game = msg;
				this.onUpdate();
				break;
			case 'gameState':
				this.game.state = msg;
				this.onUpdate();
				break;
			case 'chatLine':
				const toEstStr = (data) => {
					let [m, s] = data;
					return m.toString() + ' +/- ' + s.toString();
				};
				if (this.eloCb) {
					var info = JSON.parse(msg.text);
					this.eloCb({
						welo: toEstStr(info.WhiteElo),
						belo: toEstStr(info.BlackElo)
					});
				}
				break;
			default:
				console.error(`Unknown message type: ${msg.type}`, msg);
		}
	};
}
