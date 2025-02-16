<script lang="ts">
	import Link from "$lib/Link.svelte';
</script>

<p class="pb-4 indent-8">
	The architecture and optimization procedure are inspired by recent approaches to building Large
	Language Models. The architecture is a transformer derived from the <Link
		text="Llama 3"
		href="https://github.com/meta-llama/llama-models/blob/main/models/llama3/reference_impl/model.py"
	/> codebase. During training the model is asked to predict the next move in games between human players
	of all different Elo ratings, under time controls ranging from 3 minutes to 3 hours. Additionally,
	the model is asked to predict the mean and variance parameters of a Gaussian distribution over the
	Elo rating for each player. Read more about the
</p>
<Link href="https://github.com/nrxszvo/mimicChess" text="GitHub repo" />
