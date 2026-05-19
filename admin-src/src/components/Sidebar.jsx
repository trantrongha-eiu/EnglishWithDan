import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const NAV = [
  { section: 'TỔNG QUAN' },
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'Người dùng' },
  { to: '/admin/access-codes', icon: '🔑', label: 'Mã truy cập' },
  { to: '/admin/courses', icon: '🎓', label: 'Khóa học' },
  { section: 'NỘI DUNG THI' },
  { to: '/admin/passages', icon: '📖', label: 'Bài đọc (Passages)' },
  { to: '/admin/reading-tests', icon: '📋', label: 'Bộ đề Reading' },
  { to: '/admin/listening-tests', icon: '🎧', label: 'Đề Listening' },
  { to: '/admin/writing-tests', icon: '✏️', label: 'Đề Writing' },
  { to: '/admin/speaking', icon: '🎤', label: 'Speaking' },
  { to: '/admin/vocabulary', icon: '🟩', label: 'Từ vựng (Units)' },
  { to: '/admin/writing-practice', icon: '✍️', label: 'Luyện viết' },
  { section: 'HỌC SINH' },
  { to: '/admin/history', icon: '📝', label: 'Lịch sử làm bài' },
  { to: '/admin/vocab-activity', icon: '📈', label: 'Hoạt động từ vựng' },
  { to: '/admin/messages', icon: '✉️', label: 'Hộp thư' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    function fetchOnline() {
      apiFetch('/admin/online-users').then(d => setOnlineCount(d.count || 0)).catch(() => {});
    }
    fetchOnline();
    const id = setInterval(fetchOnline, 60_000); // refresh every minute
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
          {onlineCount > 0 && (
            <div style={{ marginTop: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: '#22c55e', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 5px #22c55e' }} />
              {onlineCount} đang online
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
