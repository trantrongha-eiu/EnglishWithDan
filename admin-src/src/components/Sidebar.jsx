import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const NAV = [
  { section: 'TỔNG QUAN' },
  { to: '/admin/dashboard',       icon: '📊', label: 'Dashboard' },
  { to: '/admin/users',           icon: '👥', label: 'Người dùng' },
  { to: '/admin/access-codes',    icon: '🔑', label: 'Mã truy cập' },
  { to: '/admin/courses',         icon: '🎓', label: 'Khóa học' },
  { section: 'NỘI DUNG THI' },
  { to: '/admin/passages',        icon: '📖', label: 'Bài đọc (Passages)' },
  { to: '/admin/reading-tests',   icon: '📋', label: 'Bộ đề Reading' },
  { to: '/admin/listening-tests', icon: '🎧', label: 'Đề Listening' },
  { to: '/admin/writing-tests',   icon: '✏️', label: 'Đề Writing' },
  { to: '/admin/speaking',        icon: '🎤', label: 'Speaking' },
  { to: '/admin/vocabulary',      icon: '🟩', label: 'Từ vựng (Units)' },
  { section: 'LUYỆN VIẾT' },
  { to: '/admin/writing-practice', icon: '🖊️', label: 'Writing Practice' },
  { to: '/admin/task1-exercises',  icon: '📉', label: 'Task 1 Grammar' },
  { to: '/admin/task2-exercises',  icon: '📝', label: 'Task 2 Writing' },
  { section: 'HỌC SINH' },
  { to: '/admin/history',         icon: '🕓', label: 'Lịch sử làm bài' },
  { to: '/admin/vocab-activity',  icon: '📈', label: 'Hoạt động từ vựng' },
  { to: '/admin/messages',        icon: '✉️', label: 'Hộp thư' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    function fetchOnline() {
      apiFetch('/admin/online-users').then(d => setOnlineUsers(d.users || [])).catch(() => {});
    }
    fetchOnline();
    const id = setInterval(fetchOnline, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay open" onClick={onClose} />
      )}
      <nav className={`sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">EnglishWithDan</div>
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
