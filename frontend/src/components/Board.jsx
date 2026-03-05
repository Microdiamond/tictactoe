import Cell from './Cell';

export default function Board({ board, onCellClick, winPattern, disabled }) {
  return (
    <div className="board" role="grid" aria-label="Tic-tac-toe board">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          onClick={onCellClick}
          isWinning={winPattern?.includes(index) ?? false}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
