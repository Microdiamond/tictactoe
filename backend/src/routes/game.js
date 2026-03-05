const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../lib/db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// POST /game/result — record game, update per-difficulty score/streak/bonus
router.post('/result', authenticate, (req, res) => {
  const { result, difficulty } = req.body;

  if (!['win', 'loss', 'draw'].includes(result))
    return res.status(400).json({ error: 'Invalid result' });
  if (!['easy', 'medium', 'hard'].includes(difficulty))
    return res.status(400).json({ error: 'Invalid difficulty' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const d = difficulty; // 'easy' | 'medium' | 'hard'
  let score   = user[`score_${d}`];
  let wins    = user[`wins_${d}`];
  let losses  = user[`losses_${d}`];
  let draws   = user[`draws_${d}`];
  let streak  = user[`streak_${d}`];
  let bonusEarned = false;

  if (result === 'win') {
    score  += 1;
    wins   += 1;
    streak += 1;
    if (streak === 3) {
      score += 1;       // bonus
      bonusEarned = true;
      streak = 0;
    }
  } else if (result === 'loss') {
    score  -= 1;
    losses += 1;
    streak  = 0;
  } else {
    draws += 1;
    // draw: streak unchanged
  }

  db.prepare(`
    UPDATE users SET
      score_${d}=?, wins_${d}=?, losses_${d}=?, draws_${d}=?, streak_${d}=?
    WHERE id=?
  `).run(score, wins, losses, draws, streak, user.id);

  db.prepare(`
    INSERT INTO games (id, user_id, result, difficulty, bonus_earned)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), user.id, result, d, bonusEarned ? 1 : 0);

  res.json({ score, wins, losses, draws, streak, bonusEarned, difficulty: d });
});

module.exports = router;
