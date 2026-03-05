const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', '..', 'tictactoe.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    google_id   TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    avatar      TEXT,

    -- Per-difficulty scores
    score_easy   INTEGER DEFAULT 0,
    score_medium INTEGER DEFAULT 0,
    score_hard   INTEGER DEFAULT 0,

    -- Per-difficulty wins/losses/draws
    wins_easy    INTEGER DEFAULT 0,
    wins_medium  INTEGER DEFAULT 0,
    wins_hard    INTEGER DEFAULT 0,

    losses_easy  INTEGER DEFAULT 0,
    losses_medium INTEGER DEFAULT 0,
    losses_hard  INTEGER DEFAULT 0,

    draws_easy   INTEGER DEFAULT 0,
    draws_medium INTEGER DEFAULT 0,
    draws_hard   INTEGER DEFAULT 0,

    streak_easy   INTEGER DEFAULT 0,
    streak_medium INTEGER DEFAULT 0,
    streak_hard   INTEGER DEFAULT 0,

    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS games (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    result       TEXT NOT NULL,
    difficulty   TEXT NOT NULL,
    bonus_earned INTEGER DEFAULT 0,
    played_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

module.exports = db;
