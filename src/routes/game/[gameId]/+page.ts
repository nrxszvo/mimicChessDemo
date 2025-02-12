import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	if (params.gameId) {
		return { gameId: params.gameId };
	} else {
		error(404, 'not found');
	}
};
