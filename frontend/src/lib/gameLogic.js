// Win patterns for a 3x3 Tic-tac-toe board
export const WIN_PATTERNS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left col
  [1, 4, 7], // middle col
  [2, 5, 8], // right col
  [0, 4, 8], // diagonal
  [2, 4, 6], // anti-diagonal
];

/**
 * Check if there's a winner on the board.
 * @param {Array} board - 9-element array, values: 'X' | 'O' | null
 * @returns {{ winner: 'X'|'O'|null, pattern: number[]|null }}
 */
export function checkWinner(board) {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], pattern };
    }
  }
  return { winner: null, pattern: null };
}

/**
 * Check if the game is a draw (all cells filled, no winner).
 * @param {Array} board
 * @returns {boolean}
 */
export function isDraw(board) {
  return board.every((cell) => cell !== null) && !checkWinner(board).winner;
}

/**
 * Get indices of empty cells.
 * @param {Array} board
 * @returns {number[]}
 */
export function getAvailableCells(board) {
  return board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
}

/**
 * Get the game result: 'win' | 'loss' | 'draw' | null (ongoing)
 * from the perspective of 'X' (the player).
 * @param {Array} board
 * @returns {'win'|'loss'|'draw'|null}
 */
export function getGameResult(board) {
  const { winner } = checkWinner(board);
  if (winner === 'X') return 'win';
  if (winner === 'O') return 'loss';
  if (isDraw(board)) return 'draw';
  return null;
}
