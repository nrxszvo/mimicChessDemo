import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MIMIC_TOKEN } from '$env/static/private';

export const POST: RequestHandler = async ({ fetch, request }) => {
	const { api } = await request.json();
	const response = await fetch(`https://lichess.org/api/${api}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${MIMIC_TOKEN}`
		}
	});
	if (response.ok) {
		return response;
	} else {
		error(response.status, response.statusText);
	}
};
