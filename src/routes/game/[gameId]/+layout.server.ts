import type { LayoutServerLoad } from './$types';
import { getXata } from '$lib/getXata';

export const load: LayoutServerLoad = async ({ params, cookies }) => {
	const { gameId } = params;
	const whoami = cookies.get('whoami', { path: '../..' });
	const xata = getXata();
	let rec = await xata.db.game.read(gameId);
	let isMyGame: boolean;
	if (rec) {
		isMyGame = rec.owner == whoami;
	} else {
		isMyGame = true;
		rec = await xata.db.game.create(gameId, { owner: whoami });
	}
	let { xata_id, ...rem } = rec;
	const gameInfo = { gameId: xata_id, ...rem };
	return { gameInfo, isMyGame };
};
