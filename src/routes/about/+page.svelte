<script lang="ts">
	import Link from '$lib/Link.svelte';
</script>

<div class="mx-8 sm:mx-16">
	<p class="pt-8 font-mono text-2xl sm:text-4xl">About Mimic</p>
	<div class="pt-4 pb-8">
		<Link href="https://github.com/nrxszvo/mimicChess" text="GitHub repo" />
	</div>
	<div
		class="font-[Georgia] *:rounded-xl *:bg-linear-to-bl *:from-stone-50 *:to-white *:px-2 *:pt-4 *:pb-2 *:indent-8"
	>
		<p class="">
			Mimic is a transformer neural network based on the <Link
				text="Llama 3"
				href="https://github.com/meta-llama/llama-models/blob/main/models/llama3/reference_impl/model.py"
			/> codebase that is trained on ~100 million games from the <Link
				href="https://database.lichess.org/"
				text="Lichess database"
			/>. During training the model is given a sequence of moves from real games between
			humans and is asked to predict the next move in the game, mirroring the "pre-training"
			phase of the training procedure for large language models. Additionally, the model is
			asked to predict the mean and variance parameters of a Gaussian distribution over the
			<Link href="https://en.wikipedia.org/wiki/Elo_rating_system" text="Elo rating" /> for each
			player.
		</p>
		<p>...TBC...</p>
	</div>
</div>
