import { useState, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  // localStorage is synchronous, so there's nothing to "wait" for — lazy
  // initializers read it once on mount, no effect/loading-flicker needed.
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token] = useState(() => localStorage.getItem('token'));
  const loading = false;

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Was missing 'lastLoginAt' — asymmetric with the public site's
    // AuthService.logout(), which clears it too (Phase 5 audit finding).
    // Harmless to leave stale, but this keeps both apps' definition of
    // "a cleared session" identical since they share the same localStorage.
    localStorage.removeItem('lastLoginAt');
    window.location.href = '/login.html';
  }, []);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  // Memoized so the ~23 consumers of useAuth()/useContext(AuthContext) don't
  // all re-render whenever AuthProvider itself re-renders for an unrelated
  // reason — previously a fresh object (and a fresh logout function) on
  // every render defeated any possible bail-out for consumers.
  const value = useMemo(
    () => ({ user, token, loading, logout, isAdmin, isTeacher }),
    [user, token, loading, logout, isAdmin, isTeacher]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
