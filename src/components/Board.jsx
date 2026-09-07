import Square from './Square';

export default function Board({ squares, onPlay, disabled, winningLine = [] }) {
  return (
    <div className="board">
      {squares.map((value, i) => (
        <Square
          key={i}
          value={value}
          onClick={() => onPlay(i)}
          disabled={disabled || value !== null}
          isWinning={winningLine.includes(i)}
        />
      ))}
    </div>
  );
}
