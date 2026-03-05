const express = require('express');
const db = require('../lib/db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Helper: reshape flat DB row → nested difficulty object
function nest(row) {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    easy:   { score: row.score_easy,   wins: row.wins_easy,   losses: row.losses_easy,   draws: row.draws_easy,   streak: row.streak_easy   },
    medium: { score: row.score_medium, wins: row.wins_medium, losses: row.losses_medium, draws: row.draws_medium, streak: row.streak_medium },
    hard:   { score: row.score_hard,   wins: row.wins_hard,   losses: row.losses_hard,   draws: row.draws_hard,   streak: row.streak_hard   },
    // Combined totals for "All" tab convenience
    total: {
      score:  row.score_easy   + row.score_medium   + row.score_hard,
      wins:   row.wins_easy    + row.wins_medium    + row.wins_hard,
      losses: row.losses_easy  + row.losses_medium  + row.losses_hard,
      draws:  row.draws_easy   + row.draws_medium   + row.draws_hard,
    },
  };
}

// GET /scores?difficulty=easy|medium|hard  (or no param = all)
router.get('/', authenticate, (req, res) => {
  const { difficulty } = req.query;
  const d = ['easy','medium','hard'].includes(difficulty) ? difficulty : null;

  const rows = db.prepare(`
    SELECT id, name, avatar,
           score_easy, score_medium, score_hard,
           wins_easy,  wins_medium,  wins_hard,
           losses_easy, losses_medium, losses_hard,
           draws_easy,  draws_medium,  draws_hard,
           streak_easy, streak_medium, streak_hard
    FROM users
  `).all();

  let result = rows.map(nest);

  if (d) {
    // Filter: only include players who have played this difficulty
    result = result.filter(p => (p[d].wins + p[d].losses + p[d].draws) > 0);
    result.sort((a, b) => b[d].score - a[d].score);
  } else {
    result.sort((a, b) => b.total.score - a.total.score);
  }

  res.json(result);
});

module.exports = router;
