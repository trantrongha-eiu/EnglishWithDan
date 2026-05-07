import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    setToken(t);
    setUser(u);
    setLoading(false);
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, isAdmin, isTeacher }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
