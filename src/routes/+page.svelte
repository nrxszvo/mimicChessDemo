<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, loading } from '$lib/stores';
	import { goto } from '$app/navigation';

	if ($auth.me) {
		goto('/dashboard');
	}
	const login = async () => {
		$loading = true;
		await $auth.login();
		$loading = false;
	};
</script>

<div class="flex h-1/2 flex-col items-center justify-evenly">
	<p class="font-mono text-4xl">Mimic Chess Bot - Demo</p>
	<button
		class="group flex items-center rounded-xl border px-2 py-1 text-sm text-gray-300 hover:cursor-pointer hover:text-gray-500"
		onclick={login}
		>login with
		<p class="ps-1 text-3xl font-light">
			<span class="text-slate-300 group-hover:text-blue-500">lichess</span><span
				class="text-gray-400 group-hover:text-blue-500">.org</span
			>
		</p>
	</button>
</div>
