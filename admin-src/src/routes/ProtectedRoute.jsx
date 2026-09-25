import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role = 'teacher' }) {
  // Phase 5 audit finding: this used to re-derive the same role check
  // AuthContext already computes as isAdmin/isTeacher, as a separate,
  // slightly differently-shaped copy of the same logic. Consuming the
  // context's own booleans means there's exactly one place that decides
  // what "is staff" / "is admin" means.
  const { token, loading, isAdmin, isTeacher } = useAuth();
  const allowed = token && (role === 'teacher' ? isTeacher : isAdmin);
  // A signed-in teacher opening an admin-only page (Học phí, Yêu cầu nâng
  // cấp) is NOT a session problem — show "no permission" instead of the
  // login redirect, which looked exactly like being logged out.
  const forbidden = !allowed && token && isTeacher && role === 'admin';

  // Navigating away is a side effect, not something to do during render —
  // belongs in an effect regardless of the fact that the full-page redirect
  // below unmounts everything anyway.
  useEffect(() => {
    if (loading || allowed || forbidden) return;
    // Redirect-back support (Phase 4 routing): remember the admin route
    // that was open (HashRouter, so window.location.hash already has the
    // form "#/writing-grades") so login.html can send the user straight
    // back here after re-authenticating instead of always to /admin/.
    const hash = window.location.hash || '';
    const next = encodeURIComponent('/admin/' + hash);
    window.location.href = '/login.html?next=' + next;
  }, [loading, allowed, forbidden]);

  if (loading) return <div style={{ padding: 40, color: 'var(--text2)' }}>Đang kiểm tra quyền truy cập...</div>;
  if (forbidden) {
    return (
      <div className="empty-state" role="alert" style={{ maxWidth: 460, margin: '60px auto' }}>
        <div className="empty-state-icon" aria-hidden="true">🔒</div>
        <div className="empty-state-title">Chỉ quản trị viên được truy cập trang này</div>
        <div className="empty-state-text">Tài khoản giáo viên không có quyền quản lý học phí và gói Premium.</div>
        <div style={{ marginTop: 14 }}><Link to="/dashboard" className="btn btn-primary">Về Dashboard</Link></div>
      </div>
    );
  }
  if (!allowed) return null;
  return children;
}
