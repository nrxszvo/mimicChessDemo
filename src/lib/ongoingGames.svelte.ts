import { goto } from '$app/navigation';
import type { Game } from '$lib/interfaces';
import { createGameCtrl, createWatchCtrl } from '$lib/game.svelte';
import { Auth } from '$lib/auth';
import { loading } from '$lib/stores';
import { get } from 'svelte/store';

export default class OngoingGames {
	games: { [key: string]: Game } = $state({});
	autoStart: Set<string> = new Set();

	onStart = (game: Game, auth: Auth) => {
		this.remove(game);
		if (game.compat.board) {
			let createFn;
			if (game.opponent.username == 'BOT mimicTestBot') {
				createFn = () => createGameCtrl(game.gameId, game.color, auth);
			} else {
				createFn = () => createWatchCtrl(game.gameId, game.color);
			}
			createFn().then((ctrl) => {
				game.ctrl = ctrl;
				this.games[game.gameId] = game;
				if (!this.autoStart.has(game.id)) {
					if (!game.hasMoved) {
						goto(`/game/${game.gameId}`);
						loading.set(false);
					}
				}
				this.autoStart.add(game.id);
			});
		} else console.log(`Skipping game ${game.gameId}, not board compatible`);
	};

	onFinish = (game: Game) => {
		this.remove(game);
	};

	empty = () => {
		this.games = {};
	};

	private remove = (game: Game) => {
		delete this.games[game.gameId];
	};
}
