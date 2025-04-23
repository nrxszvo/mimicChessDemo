import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MIMIC_TOKEN } from '$env/static/private';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const { challengeId } = await request.json();
	let response = await fetch(`https://lichess.org/api/challenge/${challengeId}/cancel`, {
		method: 'POST',
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
