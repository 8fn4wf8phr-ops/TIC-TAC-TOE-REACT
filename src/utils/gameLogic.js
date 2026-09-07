// Pure, framework-agnostic Tic-Tac-Toe logic shared by the Board and the AI.

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Returns { winner: 'X' | 'O', line: [a,b,c] } | null
export function calculateWinner(squares) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return null;
}

export function isDraw(squares) {
  return squares.every((s) => s !== null) && !calculateWinner(squares);
}

// Returns the index of the best move for `ai`, or -1 if the board is full.
export function getBestMove(squares, ai, human) {
  let bestScore = -Infinity;
  let move = -1;
  const board = squares.slice();

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = ai;
      const score = minimax(board, 0, false, ai, human);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing, ai, human) {
  const winnerInfo = calculateWinner(board);
  if (winnerInfo) {
    if (winnerInfo.winner === ai) return 10 - depth;
    if (winnerInfo.winner === human) return depth - 10;
  }
  if (isDraw(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = ai;
        best = Math.max(best, minimax(board, depth + 1, false, ai, human));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = human;
        best = Math.min(best, minimax(board, depth + 1, true, ai, human));
        board[i] = null;
      }
    }
    return best;
  }
}
