import { useState, useEffect } from 'react';
import Board from './Board';
import ModeSelect from './ModeSelect';
import SymbolSelect from './SymbolSelect';
import MoveHistory from './MoveHistory';
import { calculateWinner, isDraw, getMove } from '../utils/gameLogic';
import { playMoveSound, playWinSound, playDrawSound } from '../utils/sounds';
import { fireConfetti } from '../utils/confetti';

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
  const [difficulty, setDifficulty] = useState('hard'); // 'easy' | 'medium' | 'hard'
  const [firstPlayer, setFirstPlayer] = useState('X');  // who starts the current game
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [score, setScore] = useState(loadScore);

  const currentSquares = history[currentMove];
  const otherSymbol = firstPlayer === 'X' ? 'O' : 'X';
  const currentPlayer = currentMove % 2 === 0 ? firstPlayer : otherSymbol;
  const aiSymbol = humanSymbol === 'X' ? 'O' : 'X';

  const winnerInfo = calculateWinner(currentSquares);
  const draw = isDraw(currentSquares);
  const gameOver = Boolean(winnerInfo) || draw;

  const isLatestMove = currentMove === history.length - 1;
  const isAiTurn = mode === 'ai' && !gameOver && currentPlayer === aiSymbol && isLatestMove;
  const canUndo = history.length > 1 && isLatestMove && !isAiTurn;

  function bumpScore(key) {
    setScore((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      try { localStorage.setItem('ttt-react-score', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  // Applies a completed move to history/currentMove, plays the matching
  // sound effect, and — if that move finished the game — updates the
  // scoreboard and fires the win effects. Called directly from the click
  // handler and from the AI's move callback, never from an effect body, so
  // state updates stay tied to the action that caused them.
  function recordMove(nextSquares, placedSymbol) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const result = calculateWinner(nextSquares);
    if (result) {
      bumpScore(result.winner);
      playWinSound();
      fireConfetti();
    } else if (isDraw(nextSquares)) {
      bumpScore('draw');
      playDrawSound();
    } else {
      playMoveSound(placedSymbol);
    }
  }

  function startNewGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  function handleUndo() {
    if (!canUndo) return;
    const stepsBack = mode === 'ai' && history.length > 2 ? 2 : 1;
    const nextLen = Math.max(1, history.length - stepsBack);
    setHistory(history.slice(0, nextLen));
    setCurrentMove(nextLen - 1);
  }

  function handleRematch() {
    setFirstPlayer((p) => (p === 'X' ? 'O' : 'X'));
    startNewGame();
  }

  // Clicking a square while reviewing a past move plays from there and
  // discards the moves that came after it (classic "branching" behavior).
  function handlePlay(index) {
    if (gameOver || currentSquares[index] !== null) return;
    if (mode === 'ai' && currentPlayer !== humanSymbol) return;

    const nextSquares = currentSquares.slice();
    nextSquares[index] = currentPlayer;
    recordMove(nextSquares, currentPlayer);
  }

  // Let the AI take its turn automatically.
  useEffect(() => {
    if (!isAiTurn) return undefined;

    const timer = setTimeout(() => {
      const best = getMove(currentSquares, aiSymbol, humanSymbol, difficulty);
      if (best === -1) return;
      const nextSquares = currentSquares.slice();
      nextSquares[best] = aiSymbol;
      recordMove(nextSquares, aiSymbol);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiTurn, currentSquares, aiSymbol, humanSymbol, difficulty]);

  // Global number-key shortcut (1-9) to play a square, active on the game screen.
  useEffect(() => {
    if (screen !== 'game') return undefined;

    function handleKey(e) {
      if (e.key < '1' || e.key > '9') return;
      e.preventDefault();
      handlePlay(Number(e.key) - 1);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, currentSquares, gameOver, mode, currentPlayer, humanSymbol]);

  function handleSelectMode(selectedMode) {
    setMode(selectedMode);
    setFirstPlayer('X');
    if (selectedMode === '2p') {
      setHumanSymbol('X');
      startNewGame();
      setScreen('game');
    } else {
      setScreen('symbol');
    }
  }

  function handleConfirmSetup(symbol, selectedDifficulty) {
    setHumanSymbol(symbol);
    setDifficulty(selectedDifficulty);
    setFirstPlayer('X');
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
    return <SymbolSelect onConfirm={handleConfirmSetup} onBack={() => setScreen('mode')} />;
  }

  return (
    <section className="screen">
      <p className="status">{statusText()}</p>
      {mode === 'ai' && <p className="difficulty-badge">Difficulty: {difficulty}</p>}

      <Board
        squares={currentSquares}
        onPlay={handlePlay}
        disabled={gameOver || (mode === 'ai' && currentPlayer !== humanSymbol)}
        winningLine={winnerInfo ? winnerInfo.line : []}
      />

      <p className="kbd-hint">Tip: arrow keys + Enter, or press 1–9, to play a square.</p>

      <div className="game-actions">
        <button className="btn-secondary" onClick={handleUndo} disabled={!canUndo}>Undo</button>
        <button className="btn-secondary" onClick={startNewGame}>Restart</button>
        <button className="btn-secondary" onClick={handleRematch}>Rematch</button>
      </div>
      <button className="text-btn back-btn change-mode-btn" onClick={() => setScreen('mode')}>
        &larr; Change Mode
      </button>

      <div className="scoreboard">
        <span>X: <strong>{score.X || 0}</strong></span>
        <span>O: <strong>{score.O || 0}</strong></span>
        <span>Draws: <strong>{score.draw || 0}</strong></span>
      </div>

      <MoveHistory history={history} currentMove={currentMove} onJumpTo={setCurrentMove} />
    </section>
  );
}
