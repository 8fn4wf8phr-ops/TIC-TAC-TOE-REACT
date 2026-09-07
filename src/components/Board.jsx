import { useRef } from 'react';
import Square from './Square';

function row(i) { return Math.floor(i / 3); }
function col(i) { return i % 3; }

export default function Board({ squares, onPlay, disabled, winningLine = [] }) {
  const cellRefs = useRef([]);

  function focusCell(index) {
    const el = cellRefs.current[index];
    if (el) el.focus();
  }

  function handleKeyDown(e, index) {
    const r = row(index);
    const c = col(index);
    let nextIndex = null;

    if (e.key === 'ArrowRight') nextIndex = r * 3 + ((c + 1) % 3);
    else if (e.key === 'ArrowLeft') nextIndex = r * 3 + ((c + 2) % 3);
    else if (e.key === 'ArrowDown') nextIndex = ((r + 1) % 3) * 3 + c;
    else if (e.key === 'ArrowUp') nextIndex = ((r + 2) % 3) * 3 + c;

    if (nextIndex !== null) {
      e.preventDefault();
      focusCell(nextIndex);
    }
  }

  return (
    <div className="board">
      {squares.map((value, i) => (
        <Square
          key={i}
          ref={(el) => { cellRefs.current[i] = el; }}
          value={value}
          onClick={() => onPlay(i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled || value !== null}
          isWinning={winningLine.includes(i)}
          label={`Row ${row(i) + 1}, column ${col(i) + 1}${value ? `, ${value}` : ', empty'}`}
        />
      ))}
    </div>
  );
}
