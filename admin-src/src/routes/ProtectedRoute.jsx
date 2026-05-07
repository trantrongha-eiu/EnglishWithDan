import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role = 'teacher' }) {
  const { user, token, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: 'var(--text2)' }}>Đang kiểm tra quyền truy cập...</div>;

  const allowed = token && user && (
    role === 'teacher'
      ? ['teacher', 'admin'].includes(user.role)
      : user.role === 'admin'
  );

  if (!allowed) {
    window.location.href = '/login.html';
    return null;
  }
  return children;
}
