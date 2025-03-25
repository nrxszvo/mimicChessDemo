import type { Actions } from './$types';
import { getXata } from '$lib/getXata';
import { fail } from '@sveltejs/kit';

const URL = 'https://michaelhorgan.me';
//const URL = 'http://localhost:8080';

export const actions = {
	uploadPgn: async ({ request, cookies }) => {
		const formdata = await request.formData();
		const pgn = formdata.get('pgn');
		const resp = await fetch(`${URL}/analyzePgn`, {
			method: 'post',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify(pgn)
		});
		if (resp.ok) {
			const data = await resp.json();
			if (data.success) {
				const xata = getXata();
				const whoami = cookies.get('whoami', { path: '.' });
				await xata.db.game.createOrUpdate(data.gameId, {
					owner: whoami,
					moves: data.moves.join(),
					welos: data.welos.join(),
					belos: data.belos.join(),
					whiteName: data.white,
					whiteElo: parseInt(data.whiteElo),
					blackName: data.black,
					blackElo: parseInt(data.blackElo)
				});
				return { success: true, gameId: data.gameId };
			} else {
				return fail(400, { message: data.reason });
			}
		} else {
			return fail(400, { message: resp.statusText });
		}
	}
} satisfies Actions;
