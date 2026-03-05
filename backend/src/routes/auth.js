const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../lib/db');

const router = express.Router();

// ─── Passport Google Strategy ────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:4000/auth/google/callback',
}, (_accessToken, _refreshToken, profile, done) => {
  const googleId = profile.id;
  const name     = profile.displayName;
  const email    = profile.emails?.[0]?.value ?? '';
  const avatar   = profile.photos?.[0]?.value ?? '';

  // Upsert user
  let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
  if (!user) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO users (id, google_id, name, email, avatar)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, googleId, name, email, avatar);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  done(null, user);
}));

// ─── Routes ──────────────────────────────────────────────────────────────────

// Step 1: Redirect to Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google callback → set JWT cookie → redirect to app
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/?error=auth` }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, name: req.user.name, email: req.user.email, avatar: req.user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${process.env.CLIENT_URL}/menu`);
  }
);

// GET /auth/me — return current user + stats
router.get('/me', require('../middleware/authenticate'), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id, name: user.name, email: user.email, avatar: user.avatar,
    easy:   { score: user.score_easy,   wins: user.wins_easy,   losses: user.losses_easy,   draws: user.draws_easy,   streak: user.streak_easy   },
    medium: { score: user.score_medium, wins: user.wins_medium, losses: user.losses_medium, draws: user.draws_medium, streak: user.streak_medium },
    hard:   { score: user.score_hard,   wins: user.wins_hard,   losses: user.losses_hard,   draws: user.draws_hard,   streak: user.streak_hard   },
  });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
