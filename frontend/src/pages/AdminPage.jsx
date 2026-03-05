import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useGame } from '../store/gameStore';

export default function AdminPage() {
  const navigate = useNavigate();
  const { leaderboard, user, score, totalWins, totalLosses, totalDraws } = useGame();

  // Merge current user's live stats into leaderboard (mock)
  const allPlayers = user
    ? [
        {
          id: 'me',
          name: user.name + ' (You)',
          avatar: user.avatar,
          score,
          wins: totalWins,
          losses: totalLosses,
          draws: totalDraws,
          isMe: true,
        },
        ...leaderboard,
      ]
    : leaderboard;

  const sorted = [...allPlayers].sort((a, b) => b.score - a.score);

  const rankEmoji = (i) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  return (
    <div className="page">
      <Header />
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">🏆 Leaderboard</h1>
          <p className="admin-subtitle">All player scores</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/game')} id="back-to-game-btn">
            ← Back to Game
          </button>
        </div>

        <div className="leaderboard-table-wrap">
          <table className="leaderboard-table" id="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Draws</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={p.id} className={p.isMe ? 'row-me' : ''}>
                  <td className="rank-cell">{rankEmoji(i)}</td>
                  <td className="player-cell">
                    <img src={p.avatar} alt={p.name} className="table-avatar" />
                    <span>{p.name}</span>
                  </td>
                  <td className={`score-cell ${p.score > 0 ? 'pos' : p.score < 0 ? 'neg' : ''}`}>
                    {p.score > 0 ? `+${p.score}` : p.score}
                  </td>
                  <td className="stat-cell wins">{p.wins}</td>
                  <td className="stat-cell losses">{p.losses}</td>
                  <td className="stat-cell draws">{p.draws}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="admin-note">
          * Scores update in real-time. Backend persistence coming in Phase 2.
        </p>
      </main>
    </div>
  );
}
