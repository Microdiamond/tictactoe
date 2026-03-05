import { useGame } from '../store/gameStore';

export default function Header() {
  const { user, logout } = useGame();

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">✕ ○</span>
        <span className="header-title">TicTacToe</span>
      </div>
      {user && (
        <div className="header-user">
          <img src={user.avatar} alt={user.name} className="header-avatar" referrerPolicy="no-referrer" />
          <span className="header-name">{user.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
