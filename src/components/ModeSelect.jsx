export default function ModeSelect({ onSelectMode }) {
  return (
    <section className="screen">
      <p className="screen-title">Choose a mode</p>
      <div className="stacked-buttons">
        <button className="btn-wide" onClick={() => onSelectMode('2p')}>
          Two Players
        </button>
        <button className="btn-wide" onClick={() => onSelectMode('ai')}>
          Vs. Computer
        </button>
      </div>
    </section>
  );
}
