import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();

  useEffect(() => {
    if (token) return;
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = '/login.html?next=' + next;
  }, [token]);

  if (!token) return null;
  return children;
}
