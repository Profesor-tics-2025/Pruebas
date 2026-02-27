import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <h1 className="text-lg font-bold">AI Video Platform</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/">Dashboard</Link>
          <Link to="/docs">Documentación</Link>
          <span className="text-slate-400">{user?.fullName}</span>
          <button onClick={logout} className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600">
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
};
