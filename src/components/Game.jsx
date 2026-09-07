import { useState, useEffect } from 'react';
import Board from './Board';
import ModeSelect from './ModeSelect';
import SymbolSelect from './SymbolSelect';
import MoveHistory from './MoveHistory';
import { calculateWinner, isDraw, getBestMove } from '../utils/gameLogic';

function loadScore() {
  try {
    const saved = JSON.parse(localStorage.getItem('ttt-react-score') || '');
    if (saved) return saved;
  } catch {
    /* ignore malformed/missing data */
  }
  return { X: 0, O: 0, draw: 0 };
}

export default function Game() {
  const [screen, setScreen] = useState('mode'); // 'mode' | 'symbol' | 'game'
  const [mode, setMode] = useState('2p');        // '2p' | 'ai'
  const [humanSymbol, setHumanSymbol] = useState('X');
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [score, setScore] = useState(loadScore);

  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;
  const currentPlayer = xIsNext ? 'X' : 'O';
  const aiSymbol = humanSymbol === 'X' ? 'O' : 'X';

  const winnerInfo = calculateWinner(currentSquares);
  const draw = isDraw(currentSquares);
  const gameOver = Boolean(winnerInfo) || draw;

  const isLatestMove = currentMove === history.length - 1;
  const isAiTurn = mode === 'ai' && !gameOver && currentPlayer === aiSymbol && isLatestMove;

  function bumpScore(key) {
    setScore((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      try { localStorage.setItem('ttt-react-score', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  // Applies a completed move to history/currentMove, and — if that move
  // finished the game — updates the scoreboard. Called directly from the
  // click handler and from the AI's move callback, never from an effect
  // body, so state updates stay tied to the action that caused them.
  function recordMove(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const result = calculateWinner(nextSquares);
    if (result) {
      bumpScore(result.winner);
    } else if (isDraw(nextSquares)) {
      bumpScore('draw');
    }
  }

  // Let the AI take its turn automatically.
  useEffect(() => {
    if (!isAiTurn) return undefined;

    const timer = setTimeout(() => {
      const best = getBestMove(currentSquares, aiSymbol, humanSymbol);
      if (best === -1) return;
      const nextSquares = currentSquares.slice();
      nextSquares[best] = aiSymbol;
      recordMove(nextSquares);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiTurn, currentSquares, aiSymbol, humanSymbol]);

  // Clicking a square while reviewing a past move plays from there and
  // discards the moves that came after it (classic "branching" behavior).
  function handlePlay(index) {
    if (gameOver || currentSquares[index] !== null) return;
    if (mode === 'ai' && currentPlayer !== humanSymbol) return;

    const nextSquares = currentSquares.slice();
    nextSquares[index] = currentPlayer;
    recordMove(nextSquares);
  }

  function startNewGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  function handleSelectMode(selectedMode) {
    setMode(selectedMode);
    if (selectedMode === '2p') {
      setHumanSymbol('X');
      startNewGame();
      setScreen('game');
    } else {
      setScreen('symbol');
    }
  }

  function handleSelectSymbol(symbol) {
    setHumanSymbol(symbol);
    startNewGame();
    setScreen('game');
  }

  function statusText() {
    if (winnerInfo) {
      if (mode === 'ai') {
        return winnerInfo.winner === humanSymbol ? 'You win! 🎉' : 'Computer wins';
      }
      return `${winnerInfo.winner} wins! 🎉`;
    }
    if (draw) return "It's a draw";
    if (mode === 'ai') {
      return currentPlayer === humanSymbol ? 'Your turn' : "Computer's turn";
    }
    return `${currentPlayer}'s turn`;
  }

  if (screen === 'mode') {
    return <ModeSelect onSelectMode={handleSelectMode} />;
  }

  if (screen === 'symbol') {
    return <SymbolSelect onSelectSymbol={handleSelectSymbol} onBack={() => setScreen('mode')} />;
  }

  return (
    <section className="screen">
      <p className="status">{statusText()}</p>

      <Board
        squares={currentSquares}
        onPlay={handlePlay}
        disabled={gameOver || (mode === 'ai' && currentPlayer !== humanSymbol)}
        winningLine={winnerInfo ? winnerInfo.line : []}
      />

      <div className="game-actions">
        <button className="btn-secondary" onClick={startNewGame}>Restart</button>
        <button className="btn-secondary" onClick={() => setScreen('mode')}>Change Mode</button>
      </div>

      <div className="scoreboard">
        <span>X: <strong>{score.X || 0}</strong></span>
        <span>O: <strong>{score.O || 0}</strong></span>
        <span>Draws: <strong>{score.draw || 0}</strong></span>
      </div>

      <MoveHistory history={history} currentMove={currentMove} onJumpTo={setCurrentMove} />
    </section>
  );
}
