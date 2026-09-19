// Firebase initialization for online multiplayer (Firestore).
// The values below are public client identifiers, not secrets — Firestore
// access is controlled by security rules, not by hiding this config.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCr4_tTRrOPZCPj6sB7_QflA9pZWzbHiGc',
  authDomain: 'tic-tac-toe-react-d5069.firebaseapp.com',
  projectId: 'tic-tac-toe-react-d5069',
  storageBucket: 'tic-tac-toe-react-d5069.firebasestorage.app',
  messagingSenderId: '462796605156',
  appId: '1:462796605156:web:24365227034bb6cf280ef1',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);