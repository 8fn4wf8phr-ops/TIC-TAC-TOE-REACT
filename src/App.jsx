import Game from './components/Game';
import { useTheme } from './hooks/useTheme';
import './App.css';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <div className="topbar">
        <h1>Tic-Tac-Toe</h1>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <Game />
    </div>
  );
}
