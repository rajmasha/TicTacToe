
var app = new Vue({
	el: '#app',
	data: {
		menuUserSymbol: 'X',
		menuFirstTurn: 'user',
		gameOn: false,
		winner: null,
		firstTurn: 'X',
		turn: 'X',
		user: 'X',
		cpu: 'O',
		movesPlayed: 0,
		board: ['', '', '', '', '', '', '', '', ''],
		win_cell: [false, false, false, false, false, false, false, false, false],
		cell_scores: ['', '', '', '', '', '', '', '', ''],
		moveHistory: [],
		x_points: 0,
		o_points: 0,
		showModal: true,
		wins: [
				[0, 1, 2],
				[3, 4, 5],
				[6, 7, 8],
				[0, 3, 6],
				[1, 4, 7],
				[2, 5, 8],
				[0, 4, 8],
				[2, 4, 6]
			],
	},

	computed: {
		printInfo()
		{
			if (this.gameOn)
				return (this.turn == this.user ? 'Your Turn: <span class="highlight font-weight-bold">'+ this.user + '</span>' : '<span class="highlight font-weight-bold">CPU Turn: '+ this.cpu + '</span>');

			if (this.winner)
				return (this.winner == this.user ? '<span class="highlight font-weight-bold">You</span> Win' : '<span class="highlight font-weight-bold">CPU</span> Wins');
			else
				return 'It\'s a ' + '<span class="highlight font-weight-bold">Draw</span>';;
		},

	},

	methods: {

		startGame()
		{
			this.user = this.menuUserSymbol;
			this.cpu = this.menuUserSymbol == 'X' ? 'O' : 'X';
			this.firstTurn = this.menuFirstTurn == 'user' ? this.user : this.cpu;
			this.fullReset();
			this.turn = this.firstTurn;

			if (this.isCpuTurn(this.firstTurn))
				this.playCPU();
		},


		restart()
		{
			this.reset();
			this.turn = this.firstTurn;

			if (this.isCpuTurn(this.firstTurn))
				this.playCPU();
		},


		playAgain()
		{
			this.firstTurn = this.firstTurn == 'X' ? 'O' : 'X';
			this.reset();
			this.turn = this.firstTurn;

			if (this.isCpuTurn(this.firstTurn))
				this.playCPU();
		},


		reset()
		{
			this.gameOn = true;
			this.winner = null;
			this.movesPlayed = 0;
			this.board = ['', '', '', '', '', '', '', '', ''];
			this.win_cell = [false, false, false, false, false, false, false, false, false];
			this.cell_scores = ['', '', '', '', '', '', '', '', ''];
			this.moveHistory = this.firstTurn == 'O' ? ['-'] : [];
		},


		fullReset()
		{
			this.showModal = false;
			this.x_points = 0;
			this.o_points = 0;
			this.reset();
		},


		isCpuTurn(turn)
		{
			if (turn == this.cpu)
				return true;

			return false;
		},


		makeMove(i)
		{
			if (this.gameOn && !this.board[i] && this.turn == this.user)
			{
				this.board.splice(i, 1, this.user);
				this.postMoveProcessing(i);
				this.playCPU();
			}

		},


		postMoveProcessing(move)
		{
			this.movesPlayed += 1;
			this.moveHistory.push(move+1);

			let evaluation = this.evaluateGame(this.board);

			if (evaluation.isGameOver)
			{
				// if there is a winner (gameScore != 0)
				if (evaluation.gameScore != 0)
					this.declareWinner(evaluation);
				else
					this.gameOn = false;
			}

			this.turn = (this.turn == this.cpu) ? this.user : this.cpu;
		},


		declareWinner(evaluation)
		{
			this.gameOn = false;
			this.winner = this.turn;

			// Set "win_cell array" positions to true to highlight the winning cells
			this.win_cell[this.wins[evaluation.winRow][0]] = this.win_cell[this.wins[evaluation.winRow][1]] = this.win_cell[this.wins[evaluation.winRow][2]] = true;

			if (this.winner == 'X')
				this.x_points += 1;
			else
				this.o_points += 1;
		},


		goodRandomFirstMove()
		{
			goodMoves = [0, 2, 4, 6, 8];
			return goodMoves[Math.floor(Math.random() * goodMoves.length)];
		},


		playCPU()
		{
			if (!this.gameOn)
				return;

			// if CPU first turn select a good random move
			if (this.movesPlayed == 0)
			{
				let firstMove = this.goodRandomFirstMove();
				this.board.splice(firstMove, 1, this.cpu);
				this.postMoveProcessing(firstMove);

				return;
			}

			let score = 0;
			let bestScore = -10000;
			let move = null;

			for (let i=0; i<9; i++)
			{
				if (!this.board[i])
				{
					this.board.splice(i, 1, this.turn);
					score = this.miniMax(this.board, false, 0);
					this.board.splice(i, 1, '');

					this.cell_scores.splice(i, 1, score);

					if (score > bestScore)
					{
						bestScore = score;
						move = i;
					}
					else if (score == bestScore)
					{
						// Randomize moves if they are of same value
						if (Math.floor(Math.random() * 2) == 1)
							move = i;
					}
				}
			}

			this.board.splice(move, 1, this.cpu);
			this.postMoveProcessing(move);
		},


		miniMax(grid, maximizingPlayer, depth)
		{
			let evaluation = this.evaluateGame(grid);

			if (evaluation.isGameOver)
			{
				if (maximizingPlayer)
					return -evaluation.gameScore + depth;

				return evaluation.gameScore - depth;
			}

			let score = 0;
			let bestScore = -10000;
			let turn = maximizingPlayer ? this.cpu : this.user;

			for (let i=0; i<9; i++)
			{
				if (!grid[i])
				{
					grid.splice(i, 1, turn);
					score = this.miniMax(grid, !maximizingPlayer, depth+1);
					grid.splice(i, 1, '');

					if (score > bestScore)
						bestScore = score;
				}
			}

			return -bestScore;
		},


		evaluateGame(grid)
		{
			// Return {True, GameScore} if someone wins
			for (let j = 0; j < 8; j++)
			{
				// Check each row of "wins array" and compare with grid
				if (grid[this.wins[j][0]] != '' && grid[this.wins[j][0]] == grid[this.wins[j][1]] && grid[this.wins[j][0]] == grid[this.wins[j][2]])
				{
					if (grid[this.wins[j][0]] == this.cpu)
						return {isGameOver: true, gameScore: 10, winRow: j};
					else
						return {isGameOver: true, gameScore: -10, winRow: j};
				}
			}

			// To check if Board is full or not
			for (let j = 0; j < 9; j++)
				if (grid[j] == '') return {isGameOver: false, gameScore: 0, winRow: -1};

			// Return {True, 0} if Tie
			return {isGameOver: true, gameScore: 0, winRow: -1};
		},

	}
})
