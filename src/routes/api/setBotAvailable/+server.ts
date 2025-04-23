import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getXata } from '$lib/getXata';

export const POST: RequestHandler = async ({ request }) => {
	const { bot, available } = await request.json();
	const xata = getXata();
	await xata.db.bot.update(bot, { available });
	return new Response();
};
