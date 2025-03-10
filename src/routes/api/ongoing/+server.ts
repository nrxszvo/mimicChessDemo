import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MIMIC_TOKEN } from '$env/static/private';

const formData = (data: any): FormData => {
	const formData = new FormData();
	for (const k of Object.keys(data)) formData.append(k, data[k]);
	return formData;
};

export const GET: RequestHandler = async () => {
	let response = await fetch(`https://lichess.org/api/account/playing`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${MIMIC_TOKEN}`
		}
	});

	if (response.ok) {
		//decode and re-encode to work around svelekit bug
		const data = await response.json();
		return json(data);
	} else {
		error(response.status, response.statusText);
	}
};
