import { writable } from 'svelte/store';

export const auth = writable(null);
export const ongoing = writable(null);
export const eventStream = writable(null);
export const loading = writable(false);
