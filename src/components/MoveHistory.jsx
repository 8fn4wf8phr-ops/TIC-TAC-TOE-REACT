export default function MoveHistory({ history, currentMove, onJumpTo }) {
  return (
    <div className="move-history">
      <p className="move-history-title">Moves</p>
      <ol className="move-list">
        {history.map((_, move) => {
          const label = move === 0 ? 'Game start' : `Move #${move}`;
          const isCurrent = move === currentMove;
          return (
            <li key={move}>
              <button
                className={`move-btn${isCurrent ? ' current' : ''}`}
                onClick={() => onJumpTo(move)}
                disabled={isCurrent}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
