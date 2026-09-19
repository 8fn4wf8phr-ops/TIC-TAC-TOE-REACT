import { useState } from 'react';

export default function ModeSelect({ onSelectMode }) {
  const [infinite, setInfinite] = useState(false);

  return (
    <section className="screen">
      <p className="screen-title">Choose a mode</p>
      <div className="stacked-buttons">
        <button className="btn-wide" onClick={() => onSelectMode('2p', infinite)}>
          Two Players
        </button>
        <button className="btn-wide" onClick={() => onSelectMode('ai', infinite)}>
          Vs. Computer
        </button>
      </div>

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
    </section>
  );
}

