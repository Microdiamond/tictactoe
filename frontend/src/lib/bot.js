import { getAvailableCells, checkWinner, isDraw } from './gameLogic';

// ─── Easy Bot ───────────────────────────────────────────────────────────────
/** Random move from available cells */
export function easyBot(board) {
  const cells = getAvailableCells(board);
  if (cells.length === 0) return null;
  return cells[Math.floor(Math.random() * cells.length)];
}

// ─── Medium Bot ──────────────────────────────────────────────────────────────
/** Try to find a winning move for `player`, returns index or null */
function findWinningMove(board, player) {
  const cells = getAvailableCells(board);
  for (const idx of cells) {
    const next = [...board];
    next[idx] = player;
    if (checkWinner(next).winner === player) return idx;
  }
  return null;
}

/** Win if possible → block player → else random */
export function mediumBot(board) {
  return (
    findWinningMove(board, 'O') ??
    findWinningMove(board, 'X') ??
    easyBot(board)
  );
}

// ─── Hard Bot (Minimax) ──────────────────────────────────────────────────────
function minimax(board, isMaximizing) {
  const { winner } = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (isDraw(board)) return 0;

  const cells = getAvailableCells(board);

  if (isMaximizing) {
    let best = -Infinity;
    for (const idx of cells) {
      const next = [...board];
      next[idx] = 'O';
      best = Math.max(best, minimax(next, false));
    }
    return best;
  } else {
    let best = Infinity;
    for (const idx of cells) {
      const next = [...board];
      next[idx] = 'X';
      best = Math.min(best, minimax(next, true));
    }
    return best;
  }
}

/** Perfect play — bot never loses */
export function hardBot(board) {
  const cells = getAvailableCells(board);
  if (cells.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = cells[0];

  for (const idx of cells) {
    const next = [...board];
    next[idx] = 'O';
    const score = minimax(next, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }
  return bestMove;
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────
export function getMove(board, difficulty) {
  switch (difficulty) {
    case 'easy':   return easyBot(board);
    case 'medium': return mediumBot(board);
    case 'hard':   return hardBot(board);
    default:       return easyBot(board);
  }
}
