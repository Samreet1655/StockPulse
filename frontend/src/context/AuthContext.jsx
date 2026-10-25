import { createContext, useContext, useState } from 'react';
import api from '../services/api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('sp_user')); } catch { return null; } });
  const persist = ({ user, token }) => { localStorage.setItem('sp_token', token); localStorage.setItem('sp_user', JSON.stringify(user)); setUser(user); return user; };
  const login = async (body) => persist((await api.post('/auth/login', body)).data.data);
  const register = async (body) => persist((await api.post('/auth/register', body)).data.data);
  const logout = () => { localStorage.removeItem('sp_token'); localStorage.removeItem('sp_user'); setUser(null); };
  return <Ctx.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>{children}</Ctx.Provider>;
}
