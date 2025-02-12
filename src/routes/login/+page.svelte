<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores';

	onMount(async () => {
		if (!$auth.me) {
			await $auth.login();
		}
		goto('/game');
	});
</script>
