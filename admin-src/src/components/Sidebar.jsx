import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

// Regrouped 2026-08-28: the old split (TỔNG QUAN / NỘI DUNG THI / LUYỆN VIẾT
// / HỌC SINH) mixed content-authoring with student-monitoring and scattered
// the analytics across four separate entries. Now: overview, one student-
// monitoring hub (/monitoring — tabs for history, full mock test, and the
// per-skill stats pages), all content authoring together, then billing +
// system. Old stats routes still resolve for bookmarks; the sidebar just
// points at the hub.
const NAV = [
  { section: 'TỔNG QUAN' },
  { to: '/dashboard',          icon: '📊', label: 'Dashboard' },
  { to: '/users',              icon: '👥', label: 'Người dùng' },
  { to: '/courses',            icon: '🎓', label: 'Khóa học' },
  { section: 'THEO DÕI HỌC SINH' },
  { to: '/monitoring',         icon: '📈', label: 'Theo dõi luyện tập', mockBadge: true },
  { to: '/writing-grades',     icon: '✍️', label: 'Chấm bài Writing', badge: true },
  { to: '/messages',           icon: '✉️', label: 'Hộp thư', messagesBadge: true },
  { section: 'NỘI DUNG' },
  { to: '/passages',           icon: '📖', label: 'Bài đọc (Passages)' },
  { to: '/reading-tests',      icon: '📋', label: 'Bộ đề Reading' },
  { to: '/listening-tests',    icon: '🎧', label: 'Đề Listening' },
  { to: '/listening-sections', icon: '🎵', label: 'Bài lẻ Listening' },
  { to: '/writing-tests',      icon: '✏️', label: 'Đề Writing' },
  { to: '/speaking',           icon: '🎤', label: 'Speaking' },
  { to: '/vocabulary',         icon: '🟩', label: 'Từ vựng (Units)' },
  { to: '/vocabulary-lessons', icon: '🏫', label: 'Vocabulary Lessons' },
  { to: '/essential-grammar',  icon: '📘', label: 'Essential Grammar' },
  { to: '/writing-practice',   icon: '🖊️', label: 'Writing Practice' },
  { to: '/task1-exercises',    icon: '📉', label: 'Task 1 Grammar' },
  { to: '/task2-exercises',    icon: '📝', label: 'Task 2 Writing' },
  { to: '/task2-templates',    icon: '📄', label: 'Task 2 Templates' },
  { section: 'TÀI CHÍNH & HỆ THỐNG' },
  { to: '/upgrade-requests',   icon: '⭐', label: 'Yêu cầu nâng cấp', upgradeBadge: true },
  { to: '/tuition',            icon: '💰', label: 'Học phí', tuitionBadge: true },
  { to: '/review-bypass',      icon: '🎫', label: 'Mã bỏ qua Review' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineExpanded, setOnlineExpanded] = useState(false);
  const [pendingGrades, setPendingGrades] = useState(0);
  const [pendingUpgrades, setPendingUpgrades] = useState(0);
  const [pendingTuition, setPendingTuition] = useState(0);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [mockViolations, setMockViolations] = useState(0);

  useEffect(() => {
    function fetchOnline() {
      apiFetch('/admin/online-users').then(d => setOnlineUsers((d.users || []).filter(u => u.role !== 'admin'))).catch(() => {});
    }
    function fetchPending() {
      // /admin/writing-history now paginates (default 30/page) instead of
      // returning every attempt, so counting off d.attempts would undercount
      // as soon as there are more than one page of submissions — use the
      // dedicated counts endpoint instead, which aggregates over the whole
      // collection regardless of page size.
      apiFetch('/admin/writing-history/counts').then(d => {
        const c = d.counts || {};
        setPendingGrades((c.pending || 0) + (c.ai_done || 0));
      }).catch(() => {});
    }
    function fetchUpgrades() {
      apiFetch('/admin/upgrade-requests?status=pending&limit=1').then(d => setPendingUpgrades(d.total || 0)).catch(() => {});
    }
    function fetchTuition() {
      apiFetch('/tuition/admin-summary').then(d => setPendingTuition(d.unpaidStudentCount || 0)).catch(() => {});
    }
    function fetchMessages() {
      apiFetch('/admin/messages/unread-count').then(d => setPendingMessages(d.count || 0)).catch(() => {});
    }
    function fetchMockViolations() {
      apiFetch('/admin/mock-tests?limit=1&violatedOnly=1').then(d => setMockViolations(d.violatedTotal || 0)).catch(() => {});
    }
    fetchOnline();
    fetchPending();
    fetchUpgrades();
    fetchTuition();
    fetchMessages();
    fetchMockViolations();
    const id = setInterval(() => { fetchOnline(); fetchPending(); fetchUpgrades(); fetchTuition(); fetchMessages(); fetchMockViolations(); }, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay open" onClick={onClose} />
      )}
      <nav className={`sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <img src="/img/big_logo.png" alt="Daniel Hà English Education" style={{ height: 52, width: 'auto', display: 'block', borderRadius: 8, background: 'rgba(255,255,255,.92)', padding: '4px 10px', marginBottom: 6 }} />
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Đóng menu" title="Đóng">✕</button>
          </div>
          <div className="sidebar-logo-sub">ADMIN PANEL</div>
          {onlineUsers.length > 0 && (
            <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(34,197,94,.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,.2)' }}>
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--green)', fontWeight: 700, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 5px #22c55e' }} />
                {onlineUsers.length} đang online
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 3,
                ...(onlineExpanded ? { maxHeight: 220, overflowY: 'auto', paddingRight: 2 } : {}),
              }}>
                {(onlineExpanded ? onlineUsers : onlineUsers.slice(0, 5)).map(u => (
                  <Link
                    key={u._id}
                    to={`/students/${u._id}`}
                    onClick={onClose}
                    title={`Xem hồ sơ ${u.username}`}
                    style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textDecoration: 'none' }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</span>
                  </Link>
                ))}
              </div>
              {onlineUsers.length > 5 && (
                <button
                  onClick={() => setOnlineExpanded(v => !v)}
                  style={{
                    marginTop: 4, paddingLeft: 10, background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 10, color: 'var(--green)', fontWeight: 700, textDecoration: 'underline',
                  }}
                >
                  {onlineExpanded ? 'Thu gọn' : `Xem thêm ${onlineUsers.length - 5}`}
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {NAV.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section-label">{item.section}</div>;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && pendingGrades > 0 && (
                  <span className="nav-badge">{pendingGrades > 99 ? '99+' : pendingGrades}</span>
                )}
                {item.upgradeBadge && pendingUpgrades > 0 && (
                  <span className="nav-badge">{pendingUpgrades > 99 ? '99+' : pendingUpgrades}</span>
                )}
                {item.tuitionBadge && pendingTuition > 0 && (
                  <span className="nav-badge">{pendingTuition > 99 ? '99+' : pendingTuition}</span>
                )}
                {item.messagesBadge && pendingMessages > 0 && (
                  <span className="nav-badge">{pendingMessages > 99 ? '99+' : pendingMessages}</span>
                )}
                {item.mockBadge && mockViolations > 0 && (
                  <span className="nav-badge" title="Lượt thi thử bị đánh dấu vi phạm proctoring">
                    ⚠️ {mockViolations > 99 ? '99+' : mockViolations}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="user-avatar">{(user?.username || 'A')[0].toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.username || 'Admin'}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="btn-logout" onClick={logout} title="Đăng xuất">⏻</button>
          </div>
        </div>
      </nav>
    </>
  );
}
