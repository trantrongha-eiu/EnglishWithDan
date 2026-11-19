import { useState, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';

const readUser = () => JSON.parse(localStorage.getItem('user') || 'null');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token] = useState(() => localStorage.getItem('token'));

  // The profile page changes the cached user (name, avatar) without a page load
  const refreshUser = useCallback(() => {
    setUser((prev) => {
      const next = readUser();
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
    window.location.href = '/login.html';
  }, []);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isLoggedIn = !!token;

  const value = useMemo(
    () => ({ user, token, isLoggedIn, logout, refreshUser, isAdmin, isTeacher }),
    [user, token, isLoggedIn, logout, refreshUser, isAdmin, isTeacher],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
