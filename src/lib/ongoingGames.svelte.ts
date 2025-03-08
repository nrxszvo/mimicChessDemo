import { goto } from '$app/navigation';
import type { Game } from '$lib/interfaces';
import { createCtrl } from '$lib/game.svelte';
import { Auth } from '$lib/auth';
import { challengeBot, challengeMimic } from '$lib/utils';

export function createOngoingGames() {
	let games: { [key: string]: Game } = $state({});
	let finished: { [key: string]: Game } = {};
	let autoStart: Set<string> = new Set();

	const rematch = async (gameId) => {
		const game = finished[gameId];
		if (game.opponent.username == 'BOT mimicTestBot') {
			await challengeMimic();
		} else {
			const bot = game.opponent.username.substring(4);
			await challengeBot(bot);
		}
	};

	const onStart = (game: Game, auth: Auth) => {
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
				games[game.gameId] = game;
				if (!autoStart.has(game.id)) {
					if (!game.hasMoved) {
						goto(`/game/${game.gameId}`);
					}
				}
				autoStart.add(game.id);
			});
		} else console.log(`Skipping game ${game.gameId}, not board compatible`);
	};

	const onFinish = (game: Game) => {
		if (Object.hasOwn(games, game.gameId)) {
			finished[game.gameId] = games[game.gameId];
		}
	};

	return {
		get games() {
			return games;
		},
		rematch,
		onStart,
		onFinish
	};
}
