// Firestore-backed online multiplayer: room creation/joining, and syncing
// moves between two browsers via a shared "rooms" collection.
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { applyMove } from './gameLogic';

// Excludes 0/O/1/I so a shared code is never ambiguous to read aloud or type.
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CLIENT_ID_KEY = 'ttt-client-id';

// A stable per-browser identifier, so a player can be recognized as X or O
// without needing an account. Persists across visits in this browser.
export function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function randomRoomCode(length = 5) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function emptyRoomState(infinite) {
  return {
    status: 'waiting',
    infinite,
    squares: Array(9).fill(null),
    queues: { X: [], O: [] },
    turn: 'X',
    firstPlayer: 'X',
    players: { X: getClientId(), O: null },
    createdAt: serverTimestamp(),
  };
}

// Creates a new room with a short, shareable code, retrying on the rare
// chance of a collision. Resolves to the room code.
export async function createRoom(infinite) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomRoomCode();
    const ref = doc(db, 'rooms', code);
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      await setDoc(ref, emptyRoomState(infinite));
      return code;
    }
  }
  throw new Error('Could not generate a free room code — please try again.');
}

// Joins an existing room as O. Throws a descriptive error if the room
// doesn't exist, already has two players, or is the caller's own room.
export async function joinRoom(rawCode) {
  const code = rawCode.trim().toUpperCase();
  const ref = doc(db, 'rooms', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('No room found with that code.');

  const room = snap.data();
  const myId = getClientId();

  if (room.players.X === myId) {
    throw new Error("You can't join your own room from this browser.");
  }
  if (room.players.O && room.players.O !== myId) {
    throw new Error('That room already has two players.');
  }

  if (!room.players.O) {
    await updateDoc(ref, { 'players.O': myId, status: 'playing' });
  }
  return code;
}

// Subscribes to live updates for a room. Calls `callback` with the room's
// data (or null if it no longer exists) on every change. Returns a function
// that unsubscribes.
export function subscribeToRoom(code, callback) {
  const ref = doc(db, 'rooms', code);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// Plays a move in an online room: applies the same vanish-aware move logic
// used locally, then syncs the result to Firestore for both players.
export async function playOnlineMove(code, room, index, symbol) {
  const { squares: nextSquares, queues: nextQueues } = applyMove(
    room.squares, room.queues, index, symbol, room.infinite,
  );
  const ref = doc(db, 'rooms', code);
  await updateDoc(ref, {
    squares: nextSquares,
    queues: nextQueues,
    turn: symbol === 'X' ? 'O' : 'X',
  });
}

// Starts a fresh game in the same room, alternating who goes first.
export async function rematchOnlineRoom(code, previousFirstPlayer) {
  const nextFirst = previousFirstPlayer === 'X' ? 'O' : 'X';
  const ref = doc(db, 'rooms', code);
  await updateDoc(ref, {
    squares: Array(9).fill(null),
    queues: { X: [], O: [] },
    turn: nextFirst,
    firstPlayer: nextFirst,
  });
}