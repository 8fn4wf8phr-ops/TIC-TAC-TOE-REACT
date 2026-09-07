import Game from './components/Game';
import { useTheme } from './hooks/useTheme';
import { useSound } from './hooks/useSound';
import { Analytics } from '@vercel/analytics/react';
import './App.css';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { soundOn, toggleSound } = useSound();

  return (
    <div className="app">
      <div className="topbar">
        <h1>Tic-Tac-Toe</h1>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={toggleSound} aria-label="Toggle sound effects">
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      <Game />
      <Analytics />
    </div>
  );
}
