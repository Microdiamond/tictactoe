require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRouter   = require('./routes/auth');
const gameRouter   = require('./routes/game');
const scoresRouter = require('./routes/scores');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth',   authRouter);
app.use('/game',   gameRouter);
app.use('/scores', scoresRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend running at http://localhost:${PORT}`);
  console.log(`   Auth:   GET  http://localhost:${PORT}/auth/google`);
  console.log(`   Scores: GET  http://localhost:${PORT}/scores`);
});
