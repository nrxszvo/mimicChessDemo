import type { Actions } from './$types';
import { getXata } from '$lib/getXata';

//const URL = 'https://michaelhorgan.me';
const URL = 'http://localhost:8080';

export const actions = {
	uploadPgn: async ({ request, cookies }) => {
		const formdata = await request.formData();
		const pgn = formdata.get('pgn');
		const resp = await fetch(`${URL}/analyzePgn`, {
			method: 'post',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify(pgn)
		});
		const data = await resp.json();
		const xata = getXata();
		const whoami = cookies.get('whoami', { path: '.' });
		await xata.db.game.createOrUpdate(data.gameId, {
			owner: whoami,
			move: data.moves.join(),
			welo: data.welos.join(),
			belo: data.belos.join()
		});
		return { gameId: data.gameId };
	}
} satisfies Actions;
