import type { Actions } from './$types';
import { getXata } from '$lib/getXata';
import { fail } from '@sveltejs/kit';
import { PUBLIC_SERVER } from '$env/static/public';

export const actions = {
	uploadPgn: async ({ request, cookies }) => {
		const formdata = await request.formData();
		let pgn = formdata.get('pgn');
		const regex = /.*lichess.org\/(.{8})[/]*.*/;
		const m = pgn.match(regex);
		if (m) {
			const gameId = m[1];
			const resp = await fetch(`https://lichess.org/game/export/${gameId}`);
			pgn = await resp.text();
		}
		const resp = await fetch(`${PUBLIC_SERVER}/analyzePgn`, {
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
