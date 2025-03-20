import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getXata } from '$lib/getXata';

export const POST: RequestHandler = async ({ request }) => {
	const { gameId } = await request.json();
	const xata = getXata();
	const rec = await xata.db.game.read(gameId);
	return json(rec);
};
