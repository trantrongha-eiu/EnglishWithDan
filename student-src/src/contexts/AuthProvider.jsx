import { useState, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token] = useState(() => localStorage.getItem('token'));

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
    () => ({ user, token, isLoggedIn, logout, isAdmin, isTeacher }),
    [user, token, isLoggedIn, logout, isAdmin, isTeacher],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
