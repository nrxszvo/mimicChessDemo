import { get } from 'svelte/store';
import { loading, auth } from '$lib/stores';
import { Auth } from '$lib/auth';

export const login = async () => {
	loading.set(true);
	if (!get(auth)) {
		auth.set(new Auth());
		await get(auth).init();
	}
	if (!get(auth).me) {
		await get(auth).login();
	}
	loading.set(false);
};
