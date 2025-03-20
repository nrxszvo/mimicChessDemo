<script lang="ts">
	import Link from '$lib/Link.svelte';
</script>

<div class="mx-8 font-[Georgia] sm:mx-16">
	<p class="pt-8 font-mono text-2xl sm:text-4xl">About Mimic</p>
	<div class="pt-4 pb-8">
		<Link href="https://github.com/nrxszvo/mimicChess" text="GitHub repo" />
	</div>
	<p class="px-2 pb-2">
		Mimic is a transformer neural network based on the <Link
			text="Llama 3"
			href="https://github.com/meta-llama/llama-models/blob/main/models/llama3/reference_impl/model.py"
		/> codebase that is trained on ~100 million games from the <Link
			href="https://database.lichess.org/"
			text="Lichess database"
		/>. During training the model is given a sequence of moves from real games between humans
		and is asked to predict the next move in the game, mirroring the "pre-training" phase of the
		training procedure for large language models. Additionally, the model is asked to predict
		the mean and variance parameters of a Gaussian distribution over the
		<Link href="https://en.wikipedia.org/wiki/Elo_rating_system" text="Elo rating" /> for each player.
	</p>

	<p class="pt-4 text-2xl">Dataset</p>
	<div class="px-2 pt-4 pb-2">
		<p class="pb-2">
			The dataset consists of approximately 100 million rated chess games between human
			oppnonents from the <Link
				href="https://database.lichess.org"
				text="Lichess database"
			/>.
		</p>
		<p class="pb-4 text-sm">
			(Scripts to download and parse the database into the training set format can be found <Link
				href="https://github.com/nrxszvo/mimicChess/blob/main/pgn/download_and_parse_lichess.py"
				text="here"
			/>)
		</p>
		<p>
			Because a primary goal of the network is to predict each player's Elo rating
			independently given only the moves played so far in the current game, games are chosen
			so as to approximately balance the distribution of Elo rating pairs, where a pair
			consists of each player's Elo rating in a given game.
		</p>
		<p class="py-4">
			To track the distribution of Elo rating pairs (the combination of each player's rating),
			Elo ratings are quantized into one of six groups:
		</p>
		<p class="text-sans pb-2 text-center font-mono">
			&lt; 1400 | 1400-1800 | 1800-2000 | 2000-2200 | 2200-2400 | &gt; 2400
		</p>
		<p class="py-4">Game data is then filtered according to the following criteria:</p>
		<ul class="list-decimal ps-8">
			<li>
				Balancing the distribution of Elo pairs
				<p class="py-2 ps-4 text-sm">
					Games are chosen such that the 6x6 2d histogram of Elo group pairs is
					approximately uniform, with ~10 million games per pair, or ~360 million total
					games
				</p>
			</li>
			<li>
				Time controls
				<p class="py-2 ps-4 text-sm">
					Clock bases ranging from 3 minutes to 3 hours, with any increment, are included
				</p>
			</li>
			<li>
				Time remaining
				<p class="py-2 ps-4 text-sm">
					Moves made with fewer than 30 seconds on the respective player's clock are
					excluded due to the presumed increasing randomness of move choice as a player's
					time remaining decreases
				</p>
			</li>
		</ul>
	</div>
	<p class="pt-4 text-2xl">Data Format</p>
	<p class="px-2 pt-4 pb-2">
		Prior to being input to the transformer network, the move data from each game is tokenized
		into individual player moves, where each possible position for each piece is represented by
		a unique token. Specifically:
	</p>
	<p class="py-2 ps-8">
		There are 32 total pieces (16 white, 16 black) and 64 squares, for a total of 32*64 = 2048
		possible unique tokens.
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
