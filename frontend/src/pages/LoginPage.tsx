import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { email, password, fullName } : { email, password };
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      navigate('/');
    } catch {
      setError('No se pudo autenticar. Verifica datos o servidor.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        {isRegister && (
          <input
            className="w-full rounded bg-slate-800 p-2"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        <input className="w-full rounded bg-slate-800 p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          className="w-full rounded bg-slate-800 p-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="w-full rounded bg-cyan-600 p-2 font-semibold hover:bg-cyan-500">Continuar</button>
        <button type="button" onClick={() => setIsRegister((v) => !v)} className="w-full text-sm text-slate-400">
          {isRegister ? '¿Ya tienes cuenta? Login' : '¿No tienes cuenta? Regístrate'}
        </button>
      </form>
    </main>
  );
};
