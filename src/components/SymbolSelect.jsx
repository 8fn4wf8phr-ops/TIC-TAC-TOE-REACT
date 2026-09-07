import { useState } from 'react';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

export default function SymbolSelect({ onConfirm, onBack }) {
  const [symbol, setSymbol] = useState('X');
  const [difficulty, setDifficulty] = useState('hard');

  return (
    <section className="screen">
      <p className="screen-title">Play as...</p>
      <div className="choice-row">
        <button
          className={`btn-choice${symbol === 'X' ? ' selected' : ''}`}
          onClick={() => setSymbol('X')}
        >
          X (go first)
        </button>
        <button
          className={`btn-choice${symbol === 'O' ? ' selected' : ''}`}
          onClick={() => setSymbol('O')}
        >
          O (go second)
        </button>
      </div>

      <p className="screen-title">Difficulty</p>
      <div className="choice-row">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            className={`btn-choice${difficulty === d.key ? ' selected' : ''}`}
            onClick={() => setDifficulty(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <button className="btn-wide" onClick={() => onConfirm(symbol, difficulty)}>
        Start Game
      </button>
      <button className="text-btn back-btn" onClick={onBack}>
        &larr; Back
      </button>
    </section>
  );
}
