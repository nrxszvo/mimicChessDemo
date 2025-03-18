import type { PageServerLoad } from './$types';
import { getXata } from '$lib/getXata';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { gameId } = params;
	const whoami = cookies.get('whoami', { path: '../..' });
	const xata = getXata();
	const rec = await xata.db.game.read(gameId);
	let isMyGame: boolean;
	if (rec) {
		isMyGame = rec.owner == whoami;
	} else {
		isMyGame = true;
		await xata.db.game.create(gameId, { owner: whoami });
	}
	return { isMyGame };
};
