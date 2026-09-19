import { useEffect, useRef, useState } from 'react';
import Board from './Board';
import { calculateWinner, isDraw, nextToVanish } from '../utils/gameLogic';
import { subscribeToRoom, playOnlineMove, rematchOnlineRoom } from '../utils/onlineGame';
import { playMoveSound, playWinSound, playDrawSound } from '../utils/sounds';
import { fireConfetti } from '../utils/confetti';

export default function OnlineGame({ code, mySymbol, onLeave }) {
  const [room, setRoom] = useState(null);
  const prevSquaresRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(code, setRoom);
    return unsubscribe;
  }, [code]);

  // Plays the matching sound effect whenever the synced board actually
  // changes — for either player, since a move made in the other tab
  // arrives here as a snapshot update too.
  useEffect(() => {
    if (!room) return;
    const prev = prevSquaresRef.current;
    prevSquaresRef.current = room.squares;
    if (!prev) return; // first snapshot: nothing to compare against
    if (JSON.stringify(prev) === JSON.stringify(room.squares)) return; // no change
    if (room.squares.every((s) => s === null)) return; // board was reset (rematch)

    const winnerInfo = calculateWinner(room.squares);
    const draw = isDraw(room.squares);

    if (winnerInfo) {
      playWinSound();
      fireConfetti();
    } else if (draw) {
      playDrawSound();
    } else {
      // room.turn has already flipped to the next player by this point, so
      // whoever just moved is the other symbol.
      playMoveSound(room.turn === 'X' ? 'O' : 'X');
    }
  }, [room]);

  if (!room) {
    return (
      <section className="screen">
        <p className="status">Connecting…</p>
      </section>
    );
  }

  const winnerInfo = calculateWinner(room.squares);
  const draw = isDraw(room.squares);
  const gameOver = Boolean(winnerInfo) || draw;
  const vanishIndex = room.infinite && !gameOver
    ? nextToVanish(room.queues, room.turn, room.infinite)
    : null;
  const opponentConnected = Boolean(room.players.X && room.players.O);
  const isMyTurn = opponentConnected && room.turn === mySymbol && !gameOver;

  function handlePlay(index) {
    if (!isMyTurn || room.squares[index] !== null) return;
    playOnlineMove(code, room, index, mySymbol);
  }

  function handleRematch() {
    rematchOnlineRoom(code, room.firstPlayer);
  }

  function statusText() {
    if (!opponentConnected) return 'Waiting for opponent to reconnect…';
    if (winnerInfo) return winnerInfo.winner === mySymbol ? 'You win! 🎉' : 'Opponent wins';
    if (draw) return "It's a draw";
    return isMyTurn ? 'Your turn' : "Opponent's turn";
  }

  return (
    <section className="screen">
      <p className="status">{statusText()}</p>
      <p className="difficulty-badge">
        Online — You are {mySymbol}{room.infinite ? ' · Infinite Mode' : ''}
      </p>

      <Board
        squares={room.squares}
        onPlay={handlePlay}
        disabled={!isMyTurn}
        winningLine={winnerInfo ? winnerInfo.line : []}
        fadingIndex={vanishIndex}
      />

      <div className="room-code-display">
        <span className="room-code-label">Room:</span>
        <span className="room-code">{code}</span>
      </div>

      <div className="game-actions">
        <button className="btn-secondary" onClick={handleRematch} disabled={!gameOver}>
          Rematch
        </button>
      </div>
      <button className="text-btn back-btn change-mode-btn" onClick={onLeave}>
        &larr; Leave Room
      </button>
    </section>
  );
}