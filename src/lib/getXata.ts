import { XataClient } from '$lib/xata';
import { XATA_API_KEY } from '$env/static/private';

let instance: XataClient | undefined = undefined;

export const getXata = () => {
	if (instance) return instance;
	instance = new XataClient({ apiKey: XATA_API_KEY, branch: 'main' });
	return instance;
};
