import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

const GameContext = createContext(null);
const INITIAL_BOARD = Array(9).fill(null);
const API = import.meta.env.VITE_API_URL;
const MODE = import.meta.env.VITE_BACKEND_MODE || 'node';
const isFirebase = MODE === 'firebase';

export function GameProvider({ children }) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Game state ────────────────────────────────────────────────────────────
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStatus, setGameStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [winPattern, setWinPattern] = useState(null);
  const [bonusEarned, setBonusEarned] = useState(false);

  // ─── Score state ──────────────────────────────────────────────────────────
  const [scores,  setScores]  = useState({ easy: 0, medium: 0, hard: 0 });
  const [wins,    setWins]    = useState({ easy: 0, medium: 0, hard: 0 });
  const [losses,  setLosses]  = useState({ easy: 0, medium: 0, hard: 0 });
  const [draws,   setDraws]   = useState({ easy: 0, medium: 0, hard: 0 });
  const [streaks, setStreaks]  = useState({ easy: 0, medium: 0, hard: 0 });
  const [bonusHistory, setBonusHistory] = useState([]);
  const [players, setPlayers] = useState([]); // Leaderboard data

  // Derived for active difficulty
  const score       = scores[difficulty]  ?? 0;
  const streak      = streaks[difficulty] ?? 0;
  const totalWins   = wins[difficulty]    ?? 0;
  const totalLosses = losses[difficulty]  ?? 0;
  const totalDraws  = draws[difficulty]   ?? 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const loadStats = useCallback((data) => {
    setScores({ easy: data.easy?.score ?? 0,   medium: data.medium?.score ?? 0,   hard: data.hard?.score ?? 0 });
    setWins({   easy: data.easy?.wins ?? 0,    medium: data.medium?.wins ?? 0,    hard: data.hard?.wins ?? 0 });
    setLosses({ easy: data.easy?.losses ?? 0,  medium: data.medium?.losses ?? 0,  hard: data.hard?.losses ?? 0 });
    setDraws({  easy: data.easy?.draws ?? 0,   medium: data.medium?.draws ?? 0,   hard: data.hard?.draws ?? 0 });
    setStreaks({ easy: data.easy?.streak ?? 0, medium: data.medium?.streak ?? 0, hard: data.hard?.streak ?? 0 });
  }, []);

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setGameStatus('idle');
    setResult(null);
    setWinPattern(null);
    setBonusEarned(false);
  }, []);

  const startGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setGameStatus('playing');
    setResult(null);
    setWinPattern(null);
    setBonusEarned(false);
  }, []);

  // ─── API / Firebase Logic ─────────────────────────────────────────────────

  // 1. Initial Load
  useEffect(() => {
    if (isFirebase) {
      const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setUser({ id: fbUser.uid, name: fbUser.displayName, email: fbUser.email, avatar: fbUser.photoURL });
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) loadStats(userDoc.data());
          else {
            // New user in Firebase
            const initData = { name: fbUser.displayName, avatar: fbUser.photoURL, easy: {}, medium: {}, hard: {} };
            await setDoc(doc(db, 'users', fbUser.uid), initData);
          }
        } else setUser(null);
        setAuthLoading(false);
      });
      // Leaderboard listener
      const q = query(collection(db, 'users'), limit(50));
      const unsubPlayers = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPlayers(list);
      });
      return () => { unsubAuth(); unsubPlayers(); };
    } else {
      // Node.js Mode
      fetch(`${API}/auth/me`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setUser({ id: data.id, name: data.name, email: data.email, avatar: data.avatar });
            loadStats(data);
          }
        })
        .finally(() => setAuthLoading(false));
      
      // Node.js Leaderboard
      fetch(`${API}/scores`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then(setPlayers);
    }
  }, [loadStats]);

  // 2. Login
  const login = useCallback(async () => {
    if (isFirebase) {
      await signInWithPopup(auth, googleProvider);
    } else {
      window.location.href = `${API}/auth/google`;
    }
  }, []);

  // 3. Logout
  const logout = useCallback(async () => {
    if (isFirebase) await signOut(auth);
    else await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    
    setUser(null);
    setScores({ easy: 0, medium: 0, hard: 0 });
    setWins({   easy: 0, medium: 0, hard: 0 });
    setLosses({ easy: 0, medium: 0, hard: 0 });
    setDraws({  easy: 0, medium: 0, hard: 0 });
    setStreaks({ easy: 0, medium: 0, hard: 0 });
    resetGame();
  }, [resetGame]);

  // 4. Apply Result
  const applyResult = useCallback(async (outcome, pattern = null) => {
    setResult(outcome);
    setWinPattern(pattern);
    setGameStatus('ended');

    if (isFirebase && user) {
      const d = difficulty;
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      const data = userDoc.data() || {};
      const stats = data[d] || { score: 0, wins: 0, losses: 0, draws: 0, streak: 0 };
      
      if (outcome === 'win') {
        stats.score += 1;
        stats.wins += 1;
        stats.streak += 1;
      } else if (outcome === 'loss') {
        stats.score = Math.max(0, stats.score - 1);
        stats.losses += 1;
        stats.streak = 0;
      } else {
        stats.draws += 1;
      }

      let bonus = false;
      if (stats.streak >= 3) {
        stats.score += 1;
        stats.streak = 0;
        bonus = true;
      }

      await setDoc(userRef, { ...data, [d]: stats }, { merge: true });
      loadStats({ ...data, [d]: stats });
      setBonusEarned(bonus);
      if (bonus) setBonusHistory(h => [...h, new Date().toISOString()]);
      
    } else if (!isFirebase) {
      try {
        const res = await fetch(`${API}/game/result`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: outcome, difficulty }),
        });
        if (res.ok) {
          const data = await res.json();
          const d = data.difficulty;
          setScores(s  => ({ ...s,  [d]: data.score }));
          setWins(w    => ({ ...w,  [d]: data.wins }));
          setLosses(l  => ({ ...l,  [d]: data.losses }));
          setDraws(dr  => ({ ...dr, [d]: data.draws }));
          setStreaks(st => ({ ...st, [d]: data.streak }));
          setBonusEarned(data.bonusEarned);
          if (data.bonusEarned) setBonusHistory(h => [...h, new Date().toISOString()]);
        }
      } catch { /* offline fallback omitted for brevity */ }
    }
  }, [difficulty, user, loadStats]);

  return (
    <GameContext.Provider value={{
      user, authLoading, login, logout,
      score, streak, totalWins, totalLosses, totalDraws,
      scores, wins, losses, draws, streaks,
      players,
      bonusHistory, bonusEarned,
      board, setBoard,
      difficulty, setDifficulty,
      gameStatus, setGameStatus,
      result, winPattern,
      applyResult, resetGame, startGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
