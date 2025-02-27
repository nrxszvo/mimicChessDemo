<script lang="ts">
	import NavButton from './NavButton.svelte';
	import { auth } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { login } from '$lib/login';

	let logoutInitiated = $state(false);
	const logout = async () => {
		if ($auth.me) {
			await $auth.logout();
			$auth.me = undefined;
			goto('/');
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
		<p class="inline-block font-light">
			<span class="text-slate-300 group-hover:text-slate-100">lichess</span><span
				class="text-gray-400 group-hover:text-slate-300">.org</span
			>
		</p>
	{/if}
</NavButton>
