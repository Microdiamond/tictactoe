import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './store/gameStore';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useGame();
  if (authLoading) return <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)'}}>Loading...</div>;
  return user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AppRoutes />
      </GameProvider>
    </BrowserRouter>
  );
}
