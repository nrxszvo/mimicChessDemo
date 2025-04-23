import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MIMIC_TOKEN } from '$env/static/private';

const formData = (data: any): FormData => {
	const formData = new FormData();
	for (const k of Object.keys(data)) formData.append(k, data[k]);
	return formData;
};

export const POST: RequestHandler = async ({ request, fetch }) => {
	const { bot } = await request.json();
	const config = {
		rated: false,
		'clock.limit': 3 * 60,
		'clock.increment': 0
	};
	let response = await fetch(`https://lichess.org/api/challenge/${bot}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${MIMIC_TOKEN}`
		},
		body: formData({ ...config, keepAliveStream: true })
	});
	if (response.ok) {
		return response;
	} else {
		error(response.status, response.statusText);
	}
};
