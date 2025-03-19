<script lang="ts">
	import Link from '$lib/Link.svelte';
</script>

<div class="mx-8 sm:mx-16">
	<p class="py-8 font-mono text-2xl sm:text-4xl">About Mimic</p>

	<div class="ps-4 font-[Georgia] *:pb-2 sm:ps-8">
		<Link href="https://github.com/nrxszvo/mimicChess" text="GitHub repo" />
		<p class="pt-4 indent-8">
			Mimic is a transformer neural network based on the <Link
				text="Llama 3"
				href="https://github.com/meta-llama/llama-models/blob/main/models/llama3/reference_impl/model.py"
			/> codebase that is trained on ~100 million games from the <Link
				href="https://database.lichess.org/"
				text="Lichess database"
			/>. During training the model is given a sequence of moves from real games between
			humans and is asked to predict the next move in the game, mirroring the "pre-training"
			phase of the training procedure for modern chat bots such as ChatGPT. Additionally, the
			model is asked to predict the mean and variance parameters of a Gaussian distribution
			over the Elo rating for each player.
		</p>
		<p>...TBC...</p>
	</div>
</div>
