export default function SymbolSelect({ onSelectSymbol, onBack }) {
  return (
    <section className="screen">
      <p className="screen-title">Play as...</p>
      <div className="stacked-buttons">
        <button className="btn-wide" onClick={() => onSelectSymbol('X')}>
          X (go first)
        </button>
        <button className="btn-wide" onClick={() => onSelectSymbol('O')}>
          O (go second)
        </button>
      </div>
      <button className="text-btn back-btn" onClick={onBack}>
        &larr; Back
      </button>
    </section>
  );
}
