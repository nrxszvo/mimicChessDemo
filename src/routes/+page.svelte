<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores';
	import { goto } from '$app/navigation';

	onMount(async () => {
		if ($auth.me) {
			goto('/dashboard');
		}
	});
</script>

<a class="btn" href="/login">Login with Lichess</a>
