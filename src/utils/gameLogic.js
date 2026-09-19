// Pure, framework-agnostic Tic-Tac-Toe logic shared by the Board and the AI.

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

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

export function getRandomMove(squares) {
  const empty = [];
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) empty.push(i);
  }
  if (empty.length === 0) return -1;
  return empty[Math.floor(Math.random() * empty.length)];
}

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

export function getSmartRandomMove(squares, ai, human) {
  const empty = [];
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) empty.push(i);
  }

  for (const i of empty) {
    const board = squares.slice();
    board[i] = ai;
    if (calculateWinner(board)?.winner === ai) return i;
  }

  for (const i of empty) {
    const board = squares.slice();
    board[i] = human;
    if (calculateWinner(board)?.winner === human) return i;
  }

  return getRandomMove(squares);
}

export function getMove(squares, ai, human, difficulty = 'hard') {
  if (difficulty === 'easy') {
    return Math.random() < 0.25
      ? getBestMove(squares, ai, human)
      : getSmartRandomMove(squares, ai, human);
  }
  if (difficulty === 'medium') {
    return Math.random() < 0.65
      ? getBestMove(squares, ai, human)
      : getSmartRandomMove(squares, ai, human);
  }
  return getBestMove(squares, ai, human);
}

export const MAX_PIECES = 3;

export function applyMove(squares, queues, index, symbol, infinite) {
  const nextSquares = squares.slice();
  const nextQueues = { X: [...queues.X], O: [...queues.O] };
  let vanished = null;

  if (infinite) {
    const queue = nextQueues[symbol];
    if (queue.length >= MAX_PIECES) {
      vanished = queue.shift();
      nextSquares[vanished] = null;
    }
  }

  nextSquares[index] = symbol;
  nextQueues[symbol] = [...nextQueues[symbol], index];
  return { squares: nextSquares, queues: nextQueues, vanished };
}

export function nextToVanish(queues, symbol, infinite) {
  if (!infinite) return null;
  const q = queues[symbol];
  return q && q.length >= MAX_PIECES ? q[0] : null;
}

function getInfiniteHeuristicMove(squares, queues, ai, human) {
  const empty = [];
  for (let i = 0; i < 9; i++) if (squares[i] === null) empty.push(i);
  if (empty.length === 0) return -1;

  for (const i of empty) {
    const { squares: b } = applyMove(squares, queues, i, ai, true);
    if (calculateWinner(b)?.winner === ai) return i;
  }

  for (const i of empty) {
    const { squares: b } = applyMove(squares, queues, i, human, true);
    if (calculateWinner(b)?.winner === human) return i;
  }

  const preference = [4, 0, 2, 6, 8, 1, 3, 5, 7].filter((i) => empty.includes(i));
  const safe = preference.filter((i) => {
    const { squares: b, queues: q2 } = applyMove(squares, queues, i, ai, true);
    for (let j = 0; j < 9; j++) {
      if (b[j] === null) {
        const { squares: b2 } = applyMove(b, q2, j, human, true);
        if (calculateWinner(b2)?.winner === human) return false;
      }
    }
    return true;
  });

  return safe[0] ?? preference[0];
}

function getInfiniteWinBlockMove(squares, queues, ai, human) {
  const empty = [];
  for (let i = 0; i < 9; i++) if (squares[i] === null) empty.push(i);

  for (const i of empty) {
    const { squares: b } = applyMove(squares, queues, i, ai, true);
    if (calculateWinner(b)?.winner === ai) return i;
  }
  for (const i of empty) {
    const { squares: b } = applyMove(squares, queues, i, human, true);
    if (calculateWinner(b)?.winner === human) return i;
  }
  return getRandomMove(squares);
}

export function getInfiniteMove(squares, queues, ai, human, difficulty = 'hard') {
  if (difficulty === 'easy') {
    return Math.random() < 0.25
      ? getInfiniteHeuristicMove(squares, queues, ai, human)
      : getInfiniteWinBlockMove(squares, queues, ai, human);
  }
  if (difficulty === 'medium') {
    return Math.random() < 0.65
      ? getInfiniteHeuristicMove(squares, queues, ai, human)
      : getInfiniteWinBlockMove(squares, queues, ai, human);
  }
  return getInfiniteHeuristicMove(squares, queues, ai, human);
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