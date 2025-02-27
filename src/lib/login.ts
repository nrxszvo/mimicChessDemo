import { get } from 'svelte/store';
import { auth } from '$lib/stores';
import { Auth } from '$lib/auth';

export const login = async () => {
	if (!get(auth)) {
		auth.set(new Auth());
		await get(auth).init();
	}
	if (!get(auth).me) {
		await get(auth).login();
	}
};
