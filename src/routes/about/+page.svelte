<script lang="ts">
	import Link from '$lib/Link.svelte';
	import Title from '$lib/Title.svelte';
	import pre_training_elo_hist from '$lib/images/pre_training_elo_hist.png';
	import finetuning_elo_hist from '$lib/images/finetuning_elo_hist.png';
</script>

<div class="mx-8 font-[Georgia] sm:mx-16">
	<Title>About Mimic</Title>
	<div class="pb-8">
		<Link href="https://github.com/nrxszvo/mimicChess" text="GitHub repo" />
	</div>
	<p id="intro" class="px-2 pb-2">
		Mimic is a transformer neural network based on the <Link
			text="Llama 3"
			href="https://github.com/meta-llama/llama-models/blob/main/models/llama3/reference_impl/model.py"
		/> codebase that is trained on ~30 million games from the <Link
			href="https://database.lichess.org/"
			text="Lichess database"
		/>. During training the model is given a sequence of moves from real games between humans
		and is asked to predict the next move in the game, mirroring the "pre-training" phase of the
		training procedure for large language models. Additionally, the model is asked to predict
		the mean and variance parameters of a Gaussian distribution over the
		<Link href="https://en.wikipedia.org/wiki/Elo_rating_system" text="Elo rating" /> for each player.
	</p>
	<p id="dataset" class="pt-4 text-2xl">Datasets</p>
	<div class="px-2 pt-4 pb-2">
		<p class="pb-2">
			The training phase is divided into two stages, "pre-training" and "fine-tuning". In the
			pre-training stage, the model is trained on a large, unbalanced dataset consisting of
			approximately 220 million rated chess games, or 6.5 billion moves, between human
			oppnonents from the <Link
				href="https://database.lichess.org"
				text="Lichess database"
			/>.
		</p>
		<p class="pb-4 text-center text-sm">
			(Scripts to download and parse the database into the training set format can be found <Link
				href="https://github.com/nrxszvo/mimicChess/blob/main/pgn/download_and_parse_lichess.py"
				text="here"
			/>)
		</p>

		<p>
			The vast majority of games from this dataset occur between players of similar Elo
			ratings, with the majority of those ratings falling in the range 1000 to 2200.
			Therefore, during the pre-training stage the network primarily learns A) the rules of
			chess, i.e. how to make legal moves, and B) the distribution over moves between players
			of similar skill levels in the beginner to intermediate range.
		</p>
		<figure class="py-4 text-center">
			<img
				class="inline-block w-[384px] sm:w-[512px]"
				src={pre_training_elo_hist}
				alt="pre-training Elo histogram"
			/>
			<figcaption>Pre-training data 2-d histogram of Elo rating match-ups</figcaption>
		</figure>
		<p>
			Because a primary goal of the network is to predict each player's Elo rating
			independently given only the moves played so far in the current game, during the
			fine-tuning stage, the network is trained on a more balanced set of games selected from
			the pre-training dataset. The games are selected so as to approximately balance the
			number of games in each "Elo rating pair" category. The categories are the pairwise
			combination of the following Elo ranges:
		</p>
		<p class="text-sans py-2 text-center font-mono">
			&lt; 1400 | 1400-1800 | 1800-2000 | 2000-2200 | 2200-2400 | &gt; 2400
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
				<p class="py-2 ps-4 text-sm">
					Clock bases ranging from 10 minutes to 3 hours, with any increment, are
					included. Very short games are omitted due to the presumption that move
					distributions shift significantly with tighter time control.
				</p>
			</li>
			<li>
				Time remaining
				<p class="py-2 ps-4 text-sm">
					Moves made with fewer than 60 seconds on the respective player's clock are
					excluded due to the presumption that move choice becomes increasingly random as
					a player's time remaining decreases.
				</p>
			</li>
		</ul>
	</div>
	<p id="dataformat" class="pt-4 text-2xl">Data Format</p>
	<p class="px-2 pt-4 pb-2">
		Prior to being input to the transformer network, the move data from each game is tokenized
		into individual player moves, where each possible position for each piece is represented by
		a unique token. Specifically:
	</p>
	<p class="py-2 ps-8">
		There are 32 total pieces (16 white, 16 black) and 64 squares, for a total of 32*64 = 2048
		unique tokens.
	</p>
	<p>
		In reality, not all of these 2048 positions represent legal moves (for example, light
		squared bishops will never occupy dark squares and vice versa), so a fraction of these
		tokens are never used. From this fraction, five are repurposed to cover the special cases:
	</p>
	<ul class="list-disc ps-8 *:pt-1">
		<li>
			Four are used to denote the four possible castling procedures (king-side and queen-side
			for white and black)
		</li>
		<li>One is used to denote the start-of-game before any moves have been made.</li>
	</ul>
	<p class="px-4 py-2 indent-4 text-sm">
		Note: A short-coming of this format is that it does not provide a straight-forward way to
		represent the type of piece chosen when a pawn is promoted. During inference game play, it
		is assumed that the engine chooses a queen for promotion, however, it is possible that the
		engine may internally intend for a promotion to be a knight, in which case an illegal move
		exception can occur. In practice, this appears to occur in less than 0.01% of games.
	</p>
	<p class="p-8 text-center">...WIP...</p>
</div>
