import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import ScoreBar from '../components/ScoreBar';
import DifficultySelector from '../components/DifficultySelector';
import WinModal from '../components/WinModal';
import Header from '../components/Header';
import { useGame } from '../store/gameStore';
import { getGameResult, checkWinner } from '../lib/gameLogic';
import { getMove } from '../lib/bot';

export default function GamePage() {
  const navigate = useNavigate();
  const {
    user,
    board, setBoard,
    difficulty,
    gameStatus, setGameStatus,
    applyResult, resetGame, startGame,
    winPattern,
  } = useGame();

  const [isThinking, setIsThinking] = useState(false); // bot "thinking" indicator
  const [statusMsg, setStatusMsg] = useState('Choose difficulty and press Start');

  // ─── Redirect to login if not authenticated ───────────────────────────────
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // ─── Bot move trigger ─────────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    // Count X's and O's — bot plays after player (X)
    const xCount = board.filter((v) => v === 'X').length;
    const oCount = board.filter((v) => v === 'O').length;

    // Bot's turn: O should have fewer marks than X
    if (xCount <= oCount) return;

    // Check if game already over
    if (getGameResult(board)) return;

    setIsThinking(true);
    setStatusMsg('Bot is thinking...');

    const timer = setTimeout(() => {
      const move = getMove(board, difficulty);
      if (move === null) return;

      const next = [...board];
      next[move] = 'O';
      setBoard(next);

      const { winner, pattern } = checkWinner(next);
      if (winner === 'O') {
        applyResult('loss', pattern);
        setStatusMsg('Bot wins! 💀');
      } else {
        const result = getGameResult(next);
        if (result === 'draw') {
          applyResult('draw', null);
          setStatusMsg("It's a draw! 🤝");
        } else {
          setStatusMsg('Your turn!');
        }
      }
      setIsThinking(false);
    }, 400); // small delay for natural feel

    return () => clearTimeout(timer);
  }, [board, gameStatus]);

  // ─── Player move ─────────────────────────────────────────────────────────
  const handleCellClick = useCallback((index) => {
    if (gameStatus !== 'playing' || isThinking) return;
    if (board[index]) return;

    const next = [...board];
    next[index] = 'X';
    setBoard(next);

    const { winner, pattern } = checkWinner(next);
    if (winner === 'X') {
      applyResult('win', pattern);
      setStatusMsg('You win! 🎉');
    } else {
      const result = getGameResult(next);
      if (result === 'draw') {
        applyResult('draw', null);
        setStatusMsg("It's a draw! 🤝");
      } else {
        setStatusMsg("Bot's turn...");
      }
    }
  }, [board, gameStatus, isThinking, applyResult, setBoard]);

  const handleStart = () => {
    startGame();
    setStatusMsg('Your turn!');
  };

  const handlePlayAgain = () => {
    startGame();
    setStatusMsg('Your turn!');
  };

  const isPlaying = gameStatus === 'playing';
  const isEnded = gameStatus === 'ended';

  return (
    <div className="page">
      <Header />
      <main className="game-main">
        <ScoreBar />

        <div className="game-container">
          <div className="game-top">
            <DifficultySelector disabled={isPlaying && board.some(v => v !== null)} />
          </div>

          <div className="status-bar">
            <span className={`status-msg ${isThinking ? 'status-thinking' : ''}`}>
              {statusMsg}
            </span>
          </div>

          <Board
            board={board}
            onCellClick={handleCellClick}
            winPattern={winPattern}
            disabled={!isPlaying || isThinking}
          />

          <div className="game-actions">
            {!isPlaying && !isEnded && (
              <button className="btn btn-primary btn-lg" onClick={handleStart} id="start-btn">
                🎮 Start Game
              </button>
            )}
            {isEnded && (
              <button className="btn btn-secondary" onClick={handlePlayAgain} id="play-again-btn">
                Play Again
              </button>
            )}
          </div>
        </div>

        <div className="game-bottom">
          <div className="game-legend">
            <span className="legend-x">You = X</span>
            <span className="legend-o">Bot = O</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leaderboard')} id="leaderboard-btn">
              🏆
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/menu')} id="menu-btn">
              ← Menu
            </button>
          </div>
        </div>
      </main>

      {isEnded && <WinModal onPlayAgain={handlePlayAgain} />}
    </div>
  );
}
