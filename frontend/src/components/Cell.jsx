import { useEffect, useState } from 'react';

export default function Cell({ value, index, onClick, isWinning, disabled }) {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (value) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  const cls = [
    'cell',
    value === 'X' ? 'cell-x' : value === 'O' ? 'cell-o' : '',
    isWinning ? 'cell-winning' : '',
    pop ? 'cell-pop' : '',
    !value && !disabled ? 'cell-hover' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={cls}
      onClick={() => !value && !disabled && onClick(index)}
      disabled={!!value || disabled}
      aria-label={`Cell ${index + 1}: ${value ?? 'empty'}`}
    >
      <span className="cell-symbol">{value}</span>
    </button>
  );
}
