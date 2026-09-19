import { useEffect, useRef, useState } from 'react';
import { createRoom, joinRoom, subscribeToRoom, getClientId } from '../utils/onlineGame';

// Handles creating or joining an online room and waiting for the second
// player, then hands off to OnlineGame via onReady once both are present.
export default function OnlineSetup({ onReady, onBack }) {
  const [view, setView] = useState('choose'); // 'choose' | 'create' | 'join' | 'waiting'
  const [infinite, setInfinite] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  function watchForOpponent(code) {
    unsubscribeRef.current = subscribeToRoom(code, (room) => {
      if (!room) return;
      if (room.players.X && room.players.O) {
        const mySymbol = room.players.X === getClientId() ? 'X' : 'O';
        if (unsubscribeRef.current) unsubscribeRef.current();
        onReady(code, mySymbol);
      }
    });
  }

  async function handleCreate() {
    setBusy(true);
    setError('');
    try {
      const code = await createRoom(infinite);
      setRoomCode(code);
      setView('waiting');
      watchForOpponent(code);
    } catch (err) {
      setError(err.message || 'Could not create a room. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setBusy(true);
    setError('');
    try {
      const code = await joinRoom(joinCode);
      setRoomCode(code);
      setView('waiting');
      watchForOpponent(code);
    } catch (err) {
      setError(err.message || 'Could not join that room. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      /* Clipboard access can fail silently in some browsers; the code is
         still visible on screen to copy by hand. */
    }
  }

  function cancelWaiting() {
    if (unsubscribeRef.current) unsubscribeRef.current();
    onBack();
  }

  if (view === 'waiting') {
    return (
      <section className="screen">
        <p className="screen-title">Waiting for opponent…</p>
        <div className="room-code-display">
          <span className="room-code">{roomCode}</span>
          <button className="btn-secondary" onClick={copyCode}>Copy Code</button>
        </div>
        <p className="kbd-hint">
          Share this code with the other player. The game starts automatically
          once they join.
        </p>
        <button className="text-btn back-btn" onClick={cancelWaiting}>&larr; Cancel</button>
      </section>
    );
  }

  if (view === 'join') {
    return (
      <section className="screen">
        <p className="screen-title">Join a room</p>
        <form onSubmit={handleJoin} className="join-form">
          <input
            className="room-code-input"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            maxLength={5}
            autoFocus
          />
          <button className="btn-wide" type="submit" disabled={busy}>
            {busy ? 'Joining…' : 'Join'}
          </button>
        </form>
        {error && <p className="online-error">{error}</p>}
        <button className="text-btn back-btn" onClick={() => setView('choose')}>&larr; Back</button>
      </section>
    );
  }

  if (view === 'create') {
    return (
      <section className="screen">
        <p className="screen-title">Create a room</p>
        <label className="infinite-toggle">
          <input
            type="checkbox"
            checked={infinite}
            onChange={(e) => setInfinite(e.target.checked)}
          />
          <span>
            Infinite Mode
            <span className="infinite-hint">Max 3 pieces each — oldest vanishes, no draws</span>
          </span>
        </label>
        <button className="btn-wide" onClick={handleCreate} disabled={busy}>
          {busy ? 'Creating…' : 'Create Room'}
        </button>
        {error && <p className="online-error">{error}</p>}
        <button className="text-btn back-btn" onClick={() => setView('choose')}>&larr; Back</button>
      </section>
    );
  }

  return (
    <section className="screen">
      <p className="screen-title">Play Online</p>
      <div className="stacked-buttons">
        <button className="btn-wide" onClick={() => setView('create')}>Create Room</button>
        <button className="btn-wide" onClick={() => setView('join')}>Join Room</button>
      </div>
      <button className="text-btn back-btn" onClick={onBack}>&larr; Back</button>
    </section>
  );
}