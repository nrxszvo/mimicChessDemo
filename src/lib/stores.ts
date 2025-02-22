import { writable } from 'svelte/store';
import type { Auth } from '$lib/auth';
import type { OngoingGames } from '$lib/ongoingGames.svelte';
import type { Stream } from '$lib/ndJsonStream';

export const auth = writable<Auth>(null);
export const ongoing = writable<OngoingGames>(null);
export const eventStream = writable<Stream>(null);
export const loading = writable<boolean>(false);
