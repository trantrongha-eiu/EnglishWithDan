import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();

  useEffect(() => {
    if (token) return;
    const next = encodeURIComponent('/app/' + window.location.hash);
    window.location.href = '/login.html?next=' + next;
  }, [token]);

  if (!token) return null;
  return children;
}
