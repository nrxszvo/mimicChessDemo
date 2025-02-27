import { goto } from '$app/navigation';
import type { Game } from '$lib/interfaces';
import { createCtrl } from '$lib/game.svelte';
import { Auth } from '$lib/auth';
import { challengeBot, challengeMimic } from '$lib/utils';

export default class OngoingGames {
	games: { [key: string]: Game } = {};
	finished: { [key: string]: Game } = {};
	autoStart: Set<string> = new Set();

	rematch = async (gameId) => {
		const game = this.finished[gameId];
		if (game.opponent.username == 'BOT mimicTestBot') {
			await challengeMimic();
		} else {
			const bot = game.opponent.username.substring(4);
			await challengeBot(bot);
		}
	};

	onStart = (game: Game, auth: Auth) => {
		if (game.compat.board) {
			let ctrlType;
			if (game.opponent.username == 'BOT mimicTestBot') {
				ctrlType = 'game';
			} else if (game.opponent.username.substring(0, 3) == 'BOT') {
				ctrlType = 'watch';
			} else {
				console.warn(`Ignoring gameStart for ${game.opponent.username}`);
				return;
			}

			createCtrl(game.gameId, game.color, ctrlType, auth).then((ctrl) => {
				game.ctrl = ctrl;
				this.games[game.gameId] = game;
				if (!this.autoStart.has(game.id)) {
					if (!game.hasMoved) {
						goto(`/game/${game.gameId}`);
					}
				}
				this.autoStart.add(game.id);
			});
		} else console.log(`Skipping game ${game.gameId}, not board compatible`);
	};

	onFinish = (game: Game) => {
		if (Object.hasOwn(this.games, game.gameId)) {
			this.finished[game.gameId] = this.games[game.gameId];
			this.remove(game);
		}
	};

	empty = () => {
		this.games = {};
		this.finished = {};
	};

	private remove = (game: Game) => {
		let { [game.gameId]: omit, ...remaining } = this.games;
		this.games = remaining;
	};
}
