<script lang="ts">
	let { href, text } = $props();
</script>

<a class="text-blue-500 underline" target="_blank" ref="noopener noreferrer" {href}>{text}</a>
