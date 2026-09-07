export default function Square({ value, onClick, disabled, isWinning }) {
  const classes = [
    'cell',
    value === 'X' ? 'mark-x' : value === 'O' ? 'mark-o' : '',
    isWinning ? 'winning-cell' : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {value}
    </button>
  );
}
