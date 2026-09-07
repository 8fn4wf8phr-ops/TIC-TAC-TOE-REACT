export default function Square({ value, onClick, onKeyDown, disabled, isWinning, label, ref }) {
  const classes = [
    'cell',
    value === 'X' ? 'mark-x' : value === 'O' ? 'mark-o' : '',
    isWinning ? 'winning-cell' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-disabled={disabled}
      aria-label={label}
      tabIndex={0}
    >
      {value}
    </button>
  );
}
