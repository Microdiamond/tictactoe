import { useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';

const RESULT_CONFIG = {
  win:  { emoji: '🎉', title: 'You Win!',    cls: 'modal-win',  msg: 'Great job! You defeated the bot.' },
  loss: { emoji: '💀', title: 'You Lost!',   cls: 'modal-loss', msg: 'The bot won this round. Try again!' },
  draw: { emoji: '🤝', title: "It's a Draw!", cls: 'modal-draw', msg: "Well played! No winner this time." },
};

export default function WinModal({ onPlayAgain }) {
  const { result, bonusEarned, score, streak, gameStatus } = useGame();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (gameStatus === 'ended' && dialogRef.current) {
      dialogRef.current.showModal?.();
    }
  }, [gameStatus]);

  if (!result || gameStatus !== 'ended') return null;

  const cfg = RESULT_CONFIG[result];

  return (
    <div className="modal-overlay" onClick={onPlayAgain}>
      <div className={`modal ${cfg.cls}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-emoji">{cfg.emoji}</div>
        <h2 className="modal-title">{cfg.title}</h2>
        <p className="modal-msg">{cfg.msg}</p>

        {bonusEarned && (
          <div className="bonus-badge">
            ⭐ Bonus +1 for 3-win streak!
          </div>
        )}

        <div className="modal-score">
          Score: <strong>{score > 0 ? `+${score}` : score}</strong>
          {result === 'win' && streak > 0 && (
            <span className="modal-streak"> · Streak: {streak}</span>
          )}
        </div>

        <button className="btn btn-primary btn-lg" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}
