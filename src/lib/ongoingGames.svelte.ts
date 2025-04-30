import { goto } from '$app/navigation';
import type { Game } from '$lib/interfaces';
import type { GameCtrl } from '$lib/game.svelte';
import { createCtrl } from '$lib/game.svelte';
import { login } from '$lib/login';
//import { Auth } from '$lib/auth';
import { challengeBot, challengeMimic } from '$lib/utils';
import { PUBLIC_MIMIC_BOT } from '$env/static/public';

export function createOngoingGames() {
	let games: GameCtrl[] = $state([]);
	let autoStart: Set<string> = new Set();

	const indexOf = (gameId: string) => {
		for (let i = 0; i < games.length; i++) {
			if (games[i].game.id == gameId) {
				return i;
			}
		}
		return -1;
	};

	const deleteGame = (gameId: string) => {
		const idx = indexOf(gameId);
		if (idx >= 0) {
			games.splice(idx, 1);
		}
	};

	const numActive = () => {
		return games.filter((g) => g.status == 'started').length;
	};

	const syncActive = async (game: Game, auth: Auth, fetch) => {
		if (indexOf(game.gameId) == -1) {
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
			games.push(ctrl);
		}
	};

	return {
		indexOf,
		get games() {
			return games;
		},
		get numActive() {
			return numActive();
		},
		syncActive,
		deleteGame
	};
}
