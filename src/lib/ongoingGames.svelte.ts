import { goto } from '$app/navigation';
import type { Game } from '$lib/interfaces';
import { createGameCtrl } from '$lib/game.svelte';
import { Auth } from '$lib/auth';

export default class OngoingGames {
	games: Game[] = $state([]);
	autoStart: Set<string> = new Set();

	onStart = (game: Game, auth: Auth) => {
		this.remove(game);
		if (game.compat.board) {
			//GameCtrl.open(game.gameId, auth).then((ctrl) => {
			createGameCtrl(game.gameId, auth).then((ctrl) => {
				game.ctrl = ctrl;
				this.games.push(game);
				if (!this.autoStart.has(game.id)) {
					if (!game.hasMoved) goto(`/game/${game.gameId}`);
				}
				this.autoStart.add(game.id);
			});
		} else console.log(`Skipping game ${game.gameId}, not board compatible`);
	};

	onFinish = (game: Game) => {
		this.remove(game);
	};

	empty = () => {
		this.games = [];
	};

	private remove = (game: Game) => {
		this.games = this.games.filter((g) => g.gameId != game.id);
	};
}
