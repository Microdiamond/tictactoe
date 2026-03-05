import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useGame } from '../store/gameStore';

const API = import.meta.env.VITE_API_URL;

const TABS = [
  { key: 'all',    label: 'All',    emoji: '📋' },
  { key: 'easy',   label: 'Easy',   emoji: '🌱' },
  { key: 'medium', label: 'Medium', emoji: '🔥' },
  { key: 'hard',   label: 'Hard',   emoji: '💀' },
];

export default function MenuPage() {
  const navigate = useNavigate();
  const { user, scores, wins, losses, draws, streaks, difficulty, players } = useGame();
  const [activeTab, setActiveTab] = useState('all');

  // "Me" row in leaderboard — All tab uses combined total, others use that difficulty
  const meScore  = activeTab === 'all'
    ? (scores?.easy ?? 0) + (scores?.medium ?? 0) + (scores?.hard ?? 0)
    : (scores?.[activeTab] ?? 0);
  const meWins   = activeTab === 'all'
    ? (wins?.easy ?? 0) + (wins?.medium ?? 0) + (wins?.hard ?? 0)
    : (wins?.[activeTab] ?? 0);
  const meLosses = activeTab === 'all'
    ? (losses?.easy ?? 0) + (losses?.medium ?? 0) + (losses?.hard ?? 0)
    : (losses?.[activeTab] ?? 0);
  const meDraws  = activeTab === 'all'
    ? (draws?.easy ?? 0) + (draws?.medium ?? 0) + (draws?.hard ?? 0)
    : (draws?.[activeTab] ?? 0);
  const meStreak = activeTab === 'all'
    ? Math.max(streaks?.easy ?? 0, streaks?.medium ?? 0, streaks?.hard ?? 0)
    : (streaks?.[activeTab] ?? 0);

  // Stats shown in the stat pills (left panel)
  const score       = meScore;
  const totalWins   = meWins;
  const totalLosses = meLosses;
  const totalDraws  = meDraws;
  const streak      = meStreak;

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // Merge current user into list and sort
  // Players from API now have nested {easy,medium,hard,total} format
  const getStats = (p) => {
    if (p.isMe) return { score: p.score, wins: p.wins, losses: p.losses, draws: p.draws };
    if (activeTab === 'all') return p.total ?? { score: 0, wins: 0, losses: 0, draws: 0 };
    return p[activeTab] ?? { score: 0, wins: 0, losses: 0, draws: 0 };
  };

  const allPlayers = user
    ? [
        { id: 'me', name: user.name, avatar: user.avatar,
          score: meScore, wins: meWins, losses: meLosses, draws: meDraws, isMe: true },
        ...players.filter(p => p.id !== user.id),
      ]
    : players;

  const sorted = [...allPlayers]
    .map(p => ({ ...p, ...getStats(p) }))
    .sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(p => p.isMe) + 1;

  const rankLabel = (i) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  return (
    <div className="page">
      <Header />
      <main className="menu-main">
        <div className="blob blob-purple" />
        <div className="blob blob-pink" />

        <div className="menu-layout">
          {/* ── LEFT PANEL ─────────────────────────────── */}
          <div className="menu-left">
            <div className="player-hero">
              <div className="player-hero-glow" />
              <img src={user?.avatar} alt={user?.name} className="player-hero-avatar" referrerPolicy="no-referrer" />
              <div className="player-hero-info">
                <span className="player-hero-label">Signed in as</span>
                <span className="player-hero-name">{user?.name}</span>
              </div>
            </div>

            <div className="player-stats">
              <div className="stat-pill stat-score">
                <span className="stat-pill-val">{score >= 0 ? `+${score}` : score}</span>
                <span className="stat-pill-label">Score</span>
              </div>
              <div className="stat-pill stat-wins">
                <span className="stat-pill-val">{totalWins}</span>
                <span className="stat-pill-label">Wins</span>
              </div>
              <div className="stat-pill stat-streak">
                <span className="stat-pill-val">{streak}</span>
                <span className="stat-pill-label">Streak</span>
              </div>
              <div className="stat-pill stat-rank">
                <span className="stat-pill-val">#{myRank || '—'}</span>
                <span className="stat-pill-label">Rank</span>
              </div>
            </div>

            <button className="play-cta" onClick={() => navigate('/game')} id="start-game-menu-btn">
              <div className="play-cta-bg" />
              <span className="play-cta-icon">🎮</span>
              <div className="play-cta-text">
                <span className="play-cta-title">Start Playing</span>
                <span className="play-cta-sub">vs AI Bot · Easy / Medium / Hard</span>
              </div>
              <span className="play-cta-arrow">→</span>
            </button>
          </div>

          {/* ── RIGHT PANEL — Leaderboard ──────────────── */}
          <div className="menu-right">
            <div className="lb-header">
              <h2 className="lb-title">🏆 Leaderboard</h2>
              <span className="lb-badge">{sorted.length} players</span>
            </div>

            <div className="lb-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`lb-tab ${activeTab === tab.key ? 'lb-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="lb-list">
              {sorted.length === 0 ? (
                <div className="lb-empty">No players on this difficulty yet</div>
              ) : sorted.map((p, i) => (
                <div key={p.id} className={`lb-row ${p.isMe ? 'lb-row-me' : ''}`}>
                  <span className="lb-rank">{rankLabel(i)}</span>
                  <img src={p.avatar} alt={p.name} className="lb-avatar" referrerPolicy="no-referrer" />
                  <span className="lb-name">{p.name}{p.isMe ? ' ★' : ''}</span>
                  <span className={`lb-score ${p.score > 0 ? 'pos' : p.score < 0 ? 'neg' : ''}`}>
                    {p.score > 0 ? `+${p.score}` : p.score}
                  </span>
                  <div className="lb-micro">
                    <span className="micro-w">{p.wins}W</span>
                    <span className="micro-l">{p.losses}L</span>
                    <span className="micro-d">{p.draws}D</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
