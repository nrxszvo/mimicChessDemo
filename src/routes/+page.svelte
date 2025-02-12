<script lang="ts">
	import { onMount } from 'svelte';
	import { Auth } from '$lib/auth';
	import { auth } from '$lib/stores';
	import { goto } from '$app/navigation';
	import ongoingGames from '$lib/ongoingGames';

	$auth = new Auth();

	onMount(async () => {
		await $auth.init();
		if ($auth.me) {
			goto('/game');
		}
	});
</script>

<a class="btn" href="/login">Login with Lichess</a>
