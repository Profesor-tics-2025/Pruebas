import { createContext, useContext, useMemo, useState } from 'react';

type User = { id: string; email: string; fullName: string; role: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (token: string, user: NonNullable<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User>(JSON.parse(localStorage.getItem('user') || 'null'));

  const value = useMemo(
    () => ({
      user,
      token,
      login: (newToken: string, newUser: NonNullable<User>) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
      },
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
};
