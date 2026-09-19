import { useState, useEffect } from 'react';
import Board from './Board';
import ModeSelect from './ModeSelect';
import SymbolSelect from './SymbolSelect';
import MoveHistory from './MoveHistory';
import OnlineSetup from './OnlineSetup';
import OnlineGame from './OnlineGame';
import { calculateWinner, isDraw, getMove, applyMove, nextToVanish, getInfiniteMove } from '../utils/gameLogic';
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
  const [infinite, setInfinite] = useState(false);       // classic vs. "3 pieces max, oldest vanishes"
  const [firstPlayer, setFirstPlayer] = useState('X');  // who starts the current game
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), queues: { X: [], O: [] } }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [score, setScore] = useState(loadScore);
  const [onlineInfo, setOnlineInfo] = useState(null); // { code, mySymbol }

  const currentEntry = history[currentMove];
  const currentSquares = currentEntry.squares;
  const currentQueues = currentEntry.queues;
  const otherSymbol = firstPlayer === 'X' ? 'O' : 'X';
  const currentPlayer = currentMove % 2 === 0 ? firstPlayer : otherSymbol;
  const aiSymbol = humanSymbol === 'X' ? 'O' : 'X';

  const winnerInfo = calculateWinner(currentSquares);
  const draw = isDraw(currentSquares);
  const gameOver = Boolean(winnerInfo) || draw;
  const vanishIndex = infinite && !gameOver ? nextToVanish(currentQueues, currentPlayer, infinite) : null;

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

  function recordMove(nextEntry, placedSymbol) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextEntry];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const result = calculateWinner(nextEntry.squares);
    if (result) {
      bumpScore(result.winner);
      playWinSound();
      fireConfetti();
    } else if (isDraw(nextEntry.squares)) {
      bumpScore('draw');
      playDrawSound();
    } else {
      playMoveSound(placedSymbol);
    }
  }

  function startNewGame() {
    setHistory([{ squares: Array(9).fill(null), queues: { X: [], O: [] } }]);
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

  function handlePlay(index) {
    if (gameOver || currentSquares[index] !== null) return;
    if (mode === 'ai' && currentPlayer !== humanSymbol) return;

    const { squares: nextSquares, queues: nextQueues } = applyMove(
      currentSquares, currentQueues, index, currentPlayer, infinite,
    );
    recordMove({ squares: nextSquares, queues: nextQueues }, currentPlayer);
  }

  useEffect(() => {
    if (!isAiTurn) return undefined;

    const timer = setTimeout(() => {
      const best = infinite
        ? getInfiniteMove(currentSquares, currentQueues, aiSymbol, humanSymbol, difficulty)
        : getMove(currentSquares, aiSymbol, humanSymbol, difficulty);
      if (best === -1) return;
      const { squares: nextSquares, queues: nextQueues } = applyMove(
        currentSquares, currentQueues, best, aiSymbol, infinite,
      );
      recordMove({ squares: nextSquares, queues: nextQueues }, aiSymbol);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiTurn, currentSquares, currentQueues, aiSymbol, humanSymbol, difficulty, infinite]);

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
  }, [screen, currentSquares, currentQueues, gameOver, mode, currentPlayer, humanSymbol, infinite]);

  function handleSelectMode(selectedMode, infiniteOn) {
    setMode(selectedMode);
    setInfinite(infiniteOn);
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

  function handleOnlineReady(code, mySymbol) {
    setOnlineInfo({ code, mySymbol });
    setScreen('onlineGame');
  }

  function handleLeaveOnline() {
    setOnlineInfo(null);
    setScreen('mode');
  }

  if (screen === 'mode') {
    return <ModeSelect onSelectMode={handleSelectMode} onPlayOnline={() => setScreen('onlineSetup')} />;
  }

  if (screen === 'symbol') {
    return <SymbolSelect onConfirm={handleConfirmSetup} onBack={() => setScreen('mode')} />;
  }

  if (screen === 'onlineSetup') {
    return <OnlineSetup onReady={handleOnlineReady} onBack={() => setScreen('mode')} />;
  }

  if (screen === 'onlineGame' && onlineInfo) {
    return (
      <OnlineGame
        code={onlineInfo.code}
        mySymbol={onlineInfo.mySymbol}
        onLeave={handleLeaveOnline}
      />
    );
  }

  return (
    <section className="screen">
      <p className="status">{statusText()}</p>
      {mode === 'ai' && <p className="difficulty-badge">Difficulty: {difficulty}</p>}
      {infinite && <p className="difficulty-badge">Infinite Mode — max 3 pieces each</p>}

      <Board
        squares={currentSquares}
        onPlay={handlePlay}
        disabled={gameOver || (mode === 'ai' && currentPlayer !== humanSymbol)}
        winningLine={winnerInfo ? winnerInfo.line : []}
        fadingIndex={vanishIndex}
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