import { useGame } from '../store/gameStore';

export default function ScoreBar() {
  const { score, streak } = useGame();

  const streakDots = [0, 1, 2].map((i) => (
    <span
      key={i}
      className={`streak-dot ${i < streak ? 'streak-dot-active' : ''}`}
    />
  ));

  return (
    <div className="score-bar">
      <div className="score-item">
        <span className="score-label">Score</span>
        <span className={`score-value ${score > 0 ? 'score-positive' : score < 0 ? 'score-negative' : ''}`}>
          {score > 0 ? `+${score}` : score}
        </span>
      </div>

      <div className="score-divider" />

      <div className="score-item">
        <span className="score-label">Win Streak</span>
        <div className="streak-dots">{streakDots}</div>
        <span className="streak-hint">3 in a row = +1 bonus!</span>
      </div>
    </div>
  );
}
