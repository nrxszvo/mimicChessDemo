import { goto } from '$app/navigation';
import type { Game } from '$lib/interfaces';
import type { GameCtrl } from '$lib/game.svelte';
import { createCtrl } from '$lib/game.svelte';
import { login } from '$lib/login';
//import { Auth } from '$lib/auth';
import { challengeBot, challengeMimic } from '$lib/utils';
import { PUBLIC_MIMIC_BOT } from '$env/static/public';

export function createOngoingGames() {
	let games: { [key: string]: GameCtrl } = $state({});
	let autoStart: Set<string> = new Set();

	const deleteGame = (gameId: string) => {
		delete games[gameId];
	};

	const gamesArr = () => {
		return Object.entries(games).map((e) => e[1]);
	};

	const numActive = () => {
		return gamesArr().filter((g) => g.status == 'started').length;
	};

	const syncActive = async (game: Game, auth: Auth, fetch) => {
		if (!Object.hasOwn(games, game.gameId)) {
			let ctrlType;
			if (game.opponent.username == `BOT ${PUBLIC_MIMIC_BOT}`) {
				await login();
				ctrlType = 'game';
			} else if (game.opponent.username.substring(0, 3) == 'BOT') {
				ctrlType = 'watch';
			} else {
				return;
			}
			const ctrl = await createCtrl(
				game,
				game.color,
				ctrlType,
				auth,
				fetch,
				'syncActive'
			);
			games[game.gameId] = ctrl;
		}
	};

	return {
		get games() {
			return games;
		},
		get gamesArr() {
			return gamesArr();
		},
		get numActive() {
			return numActive();
		},
		syncActive,
		deleteGame
	};
}
