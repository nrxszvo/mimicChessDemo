<script lang="ts">
	import NavButton from './NavButton.svelte';
	import { Auth } from '$lib/auth';
	import { auth, loading } from '$lib/stores';
	import { goto } from '$app/navigation';

	const login = async () => {
		$loading = true;
		if (!$auth) {
			$auth = new Auth();
			await $auth.init();
		}
		if (!$auth.me) {
			await $auth.login();
		}
		$loading = false;
	};
	let logoutInitiated = $state(false);
	const logout = async () => {
		if ($auth.me) {
			$loading = true;
			await $auth.logout();
			$auth.me = undefined;
			goto('/');
			$loading = false;
		}
	};
	const confirm = () => (logoutInitiated = true);
	const handleClick = () => {
		if ($auth) {
			if ($auth.me) {
				if (logoutInitiated) {
					logout();
				} else {
					confirm();
				}
			} else {
				login();
			}
		} else {
			login();
		}
	};
</script>

<NavButton
	onclick={handleClick}
	onclickoutside={() => (logoutInitiated = false)}
	customStyle="relative group"
>
	{#if $auth?.me}
		{#if logoutInitiated}
			logout?
		{:else}
			{$auth?.me?.username}
		{/if}
	{:else}
		login with
		<p class="inline-block ps-1 font-light group-hover:font-bold">
			<span class="text-slate-300 group-hover:text-blue-500">lichess</span><span
				class="text-gray-400 group-hover:text-blue-500">.org</span
			>
		</p>
	{/if}
</NavButton>
