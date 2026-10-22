import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('phishguard_token');
    const savedUser = localStorage.getItem('phishguard_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('phishguard_token');
        localStorage.removeItem('phishguard_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('phishguard_token', res.token);
    localStorage.setItem('phishguard_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });

    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('phishguard_token', res.token);
    localStorage.setItem('phishguard_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('phishguard_token');
    localStorage.removeItem('phishguard_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}