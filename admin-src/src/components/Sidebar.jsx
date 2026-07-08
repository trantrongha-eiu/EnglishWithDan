import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const NAV = [
  { section: 'TỔNG QUAN' },
  { to: '/dashboard',       icon: '📊', label: 'Dashboard' },
  { to: '/users',              icon: '👥', label: 'Người dùng' },
  { to: '/upgrade-requests',   icon: '⭐', label: 'Yêu cầu nâng cấp', upgradeBadge: true },
  { to: '/courses',            icon: '🎓', label: 'Khóa học' },
  { section: 'NỘI DUNG THI' },
  { to: '/passages',        icon: '📖', label: 'Bài đọc (Passages)' },
  { to: '/reading-tests',   icon: '📋', label: 'Bộ đề Reading' },
  { to: '/listening-tests',    icon: '🎧', label: 'Đề Listening' },
  { to: '/listening-sections', icon: '🎵', label: 'Bài lẻ Listening' },
  { to: '/writing-tests',   icon: '✏️', label: 'Đề Writing' },
  { to: '/speaking',        icon: '🎤', label: 'Speaking' },
  { to: '/vocabulary',      icon: '🟩', label: 'Từ vựng (Units)' },
  { section: 'LUYỆN VIẾT' },
  { to: '/writing-practice', icon: '🖊️', label: 'Writing Practice' },
  { to: '/task1-exercises',  icon: '📉', label: 'Task 1 Grammar' },
  { to: '/task2-exercises',  icon: '📝', label: 'Task 2 Writing' },
  { to: '/task2-templates', icon: '📄', label: 'Task 2 Templates' },
  { to: '/writing-samples', icon: '📋', label: 'Bài mẫu Writing' },
  { section: 'HỌC SINH' },
  { to: '/history',         icon: '🕓', label: 'Lịch sử làm bài' },
  { to: '/writing-grades',  icon: '✍️', label: 'Chấm bài Writing', badge: true },
  { to: '/vocab-activity',  icon: '📈', label: 'Hoạt động từ vựng' },
  { to: '/messages',        icon: '✉️', label: 'Hộp thư' },
  { to: '/tuition',         icon: '💰', label: 'Học phí', tuitionBadge: true },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [pendingGrades, setPendingGrades] = useState(0);
  const [pendingUpgrades, setPendingUpgrades] = useState(0);
  const [pendingTuition, setPendingTuition] = useState(0);

  useEffect(() => {
    function fetchOnline() {
      apiFetch('/admin/online-users').then(d => setOnlineUsers((d.users || []).filter(u => u.role !== 'admin'))).catch(() => {});
    }
    function fetchPending() {
      apiFetch('/admin/writing-history').then(d => {
        const n = (d.attempts || []).filter(a => a.gradingStatus === 'pending' || a.gradingStatus === 'ai_done').length;
        setPendingGrades(n);
      }).catch(() => {});
    }
    function fetchUpgrades() {
      apiFetch('/admin/upgrade-requests?status=pending&limit=1').then(d => setPendingUpgrades(d.total || 0)).catch(() => {});
    }
    function fetchTuition() {
      apiFetch('/tuition/admin-summary').then(d => setPendingTuition(d.unpaidStudentCount || 0)).catch(() => {});
    }
    fetchOnline();
    fetchPending();
    fetchUpgrades();
    fetchTuition();
    const id = setInterval(() => { fetchOnline(); fetchPending(); fetchUpgrades(); fetchTuition(); }, 60_000);
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
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: '#22c55e', fontWeight: 700, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 5px #22c55e' }} />
                {onlineUsers.length} đang online
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {onlineUsers.slice(0, 5).map(u => (
                  <div key={u._id} style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</span>
                  </div>
                ))}
                {onlineUsers.length > 5 && (
                  <div style={{ fontSize: 10, color: '#86efac', fontWeight: 600, paddingLeft: 10 }}>+{onlineUsers.length - 5} khác</div>
                )}
              </div>
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
