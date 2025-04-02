<script lang="ts">
	import Link from '$lib/Link.svelte';
	import Title from '$lib/Title.svelte';
	import pre_training_elo_hist from '$lib/images/pre_training_elo_hist.png';
	import finetuning_elo_hist from '$lib/images/finetuning_elo_hist.png';
</script>

<div class="mx-8 font-[Georgia] sm:mx-16">
	<Title>About Mimic</Title>
	<div class="pb-8">
		<Link href="https://github.com/nrxszvo/mimicChess">GitHub repo</Link>
	</div>
	<p id="intro" class="px-2 pb-2">
		Mimic is a transformer neural network based on the <Link
			href="https://github.com/meta-llama/llama-models/blob/main/models/llama3/reference_impl/model.py"
			>Llama 3</Link
		> codebase that is trained on ~200 million games from the <Link
			href="https://database.lichess.org/">Lichess database</Link
		>. During training the model is given a sequence of moves from real games between humans and
		is asked to predict the next move in the game, mirroring the "pre-training" phase of the
		training procedure for large language models. Additionally, the model is asked to predict
		the mean and variance parameters of a Gaussian distribution over the
		<Link href="https://en.wikipedia.org/wiki/Elo_rating_system">Elo rating</Link> for each player.
	</p>
	<p id="dataset" class="pt-4 text-2xl">Datasets</p>
	<div class="px-2 pt-4 pb-2">
		<p class="pb-2">
			The training phase is divided into two stages, "pre-training" and "fine-tuning". In the
			pre-training stage, the model is trained on a large, unbalanced dataset consisting of
			approximately 220 million rated chess games, or ~13 billion moves (one move means a move
			by one player), between human oppnonents from the <Link
				href="https://database.lichess.org">Lichess database</Link
			>.
		</p>
		<p class="pb-4 text-center text-sm">
			(Scripts to download and parse the database into the training set format can be found <Link
				href="https://github.com/nrxszvo/mimicChess/blob/main/lib/dataset/download_and_parse_lichess.py"
				>here</Link
			>
			)
		</p>

		<p>
			The vast majority of games from this dataset occur between players of similar Elo
			ratings, with the majority of those ratings falling in the range 1000 to 2200.
			Therefore, during the pre-training stage the network primarily learns:
		</p>
		<ul class="ps-8">
			<li>a) the rules of chess, i.e. how to make legal moves, and</li>
			<li>
				b) the distribution over moves between players of similar skill levels in the
				beginner to intermediate range.
			</li>
		</ul>
		<figure class="py-4 text-center">
			<img
				class="inline-block w-[384px] sm:w-[512px]"
				src={pre_training_elo_hist}
				alt="pre-training Elo histogram"
			/>
			<figcaption>Pre-training data 2-d histogram of Elo rating match-ups</figcaption>
		</figure>
		<p>
			But because a primary goal of the network is to model each player's skill level
			independently, given only the moves played so far in the current game, such a highly
			unbalanced dataset is not sufficient. By the end of the pre-training phase, the network
			will almost always predict that each player has a similar Elo rating, irrespective of
			the actual moves played in the game. The fine-tuning stage addresses this limitation by
			training the network on a much smaller and more balanced set of games derived from the
			pre-training dataset. The games are selected so as to approximately balance the number
			of games in each "Elo rating pair" category. The categories are the pairwise combination
			of the following Elo ranges:
		</p>
		<div class="pt-4">
			<table class="text-sans mx-auto font-mono">
				<tbody
					><tr class="*:border *:border-stone-300 *:px-4 *:py-2"
						><td>&lt; 1400</td><td>1400-1800</td><td>1800-2000</td><td>2000-2200</td><td
							>2200-2400</td
						><td>&gt; 2400</td></tr
					></tbody
				>
			</table>
		</div>
		<p class="pt-4">
			The fine-tuning datasets consists of ~12 million games, or ~745 million moves. Due to
			limitations of data between players at opposite ends of the Elo rating range (i.e. games
			between beginners and advanced players), the dataset is not perfectly well balanced. A
			cap of 500,000 games is placed on each Elo rating pair, however, the pairs at the
			opposite ends of the Elo rating range have significantly fewer than 500,000 games in the
			entire Lichess database.
		</p>
		<figure class="py-4 text-center">
			<img
				class="inline-block w-[384px] sm:w-[512px]"
				src={finetuning_elo_hist}
				alt="fine-tuning Elo histogram"
			/>
			<figcaption>Fine-tuning data 2-d histogram of Elo rating match-ups</figcaption>
		</figure>
		<p class="py-4">
			For both datasets, game data is also filtered according to the following criteria:
		</p>
		<ul class="list-decimal ps-8">
			<li>
				Time controls
				<p class="py-2 ps-4">
					Clock bases ranging from 10 minutes to 3 hours, with any increment, are
					included. Very short games are excluded due to the presumption that move
					distributions are altered significantly by very tight time controls
				</p>
			</li>
			<li>
				Time remaining
				<p class="py-2 ps-4">
					Moves made with fewer than 60 seconds on the respective player's clock are
					excluded due to the presumption that move choice becomes increasingly random as
					a player's time remaining decreases.
				</p>
			</li>
		</ul>
	</div>
	<p id="dataformat" class="pt-4 text-2xl">Data Format</p>
	<p class="pt-4 pb-2">
		Prior to being input to the transformer network, the move data from each game is tokenized
		into individual player moves, where each possible position for each piece is represented by
		a unique token. Specifically:
	</p>
	<p class="py-2 ps-8">
		There are 32 total pieces (16 white, 16 black) and 64 squares, for a total of 32*64 = 2048
		unique tokens.
	</p>
	<p class="py-2 ps-8">
		In reality, not all of these 2048 positions represent legal moves (for example, light
		squared bishops will never occupy dark squares and vice versa), so a fraction of these
		tokens are never used. From this fraction, five are repurposed to cover the special cases:
	</p>
	<p class="py-2 ps-8">
		Four are used to denote the four possible castling procedures (king-side and queen-side for
		white and black)
	</p>
	<p class="py-2 ps-8">One is used to denote the start-of-game before any moves have been made</p>
	<p class="py-2 text-sm">
		Note: A short-coming of this format is that it does not provide a straight-forward way to
		represent the type of piece chosen when a pawn is promoted. During inference game play, it
		is assumed that the engine chooses a queen for promotion, however, it is possible that the
		engine may internally intend for a promotion to be a knight, in which case an illegal move
		exception can occur.
	</p>
	<p id="architecture" class="pt-4 text-2xl">Architecture</p>
	<p class="pt-4 pb-2">
		Mimic's transformer architecture is directly derived from <Link
			href="https://arxiv.org/abs/2407.21783">Llama 3</Link
		>. Its key hyper parameters include:
	</p>
	<ul class="list-decimal ps-8">
		<li>
			A decoder-only transformer with an internal dimension of 1024, 16 layers, 32 query
			heads, 8 key-value heads, and a vocabulary size of 2048
		</li>
		<li>
			<Link href="https://arxiv.org/abs/2305.13245">Grouped-query attention</Link> is used to reduce
			the number of key-value heads and thereby reduce complexity
		</li>
		<li>
			A context window of up to 150 tokens representing 75 full moves is used during training,
			however during inference the context window may be unbounded
		</li>
		<li>
			<Link href="https://arxiv.org/abs/2104.09864">Rotary position embeddings</Link> with the
			standard base frequency of 10,000 are used to encode the order of moves
		</li>
	</ul>

	<p id="training" class="pt-4 text-2xl">Training Procedure</p>
	<p class="pt-4 pb-2">
		The training procedure for Mimic also closely follows the methods used in the pre-training
		stage of Llama 3.
	</p>
	<p class="pb-2">
		For Mimic's pre-training stage, the learning rate schedule consists of 25,000 warm-up steps
		to a value of 3.e-4, followed by a cosine-annealing schedule from 3.e-4 to 3.e-6 over the
		course of 975,000 steps, for a total of 1,000,000 steps during the pre-training stage. For
		the fine-tuning stage, the learning rate is held constant at 3.e-6 for 100,000 steps.
	</p>
	<p class="pb-2">
		A batch size of 256 with a maximum sequence length of 150 is chosen as the optimal balance
		among model size, batch size, and sequence length, given the available RAM on the GPU
		(GH-200) used for training. (In a more ideal scenario with a larger budget for training,
		increasing most or all of the key hyper parameters--model dimension, batch size, max
		sequence length--could very well result in improved model performance. Unfortunately budget
		for this project did not allow for such experiments.)
	</p>
	<p id="analysis" class="pt-4 text-2xl">Analysis</p>
	<p class="p-8 text-center">...WIP...</p>
</div>
