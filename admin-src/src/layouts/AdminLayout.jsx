import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

const TITLES = {
  '/admin/dashboard':        'Dashboard',
  '/admin/users':            'Người dùng',
  '/admin/access-codes':     'Mã truy cập',
  '/admin/courses':          'Khóa học',
  '/admin/passages':         'Bài đọc (Passages)',
  '/admin/reading-tests':    'Bộ đề Reading',
  '/admin/listening-tests':  'Đề Listening',
  '/admin/writing-tests':    'Đề Writing',
  '/admin/speaking':         'Speaking',
  '/admin/vocabulary':       'Từ vựng (Units)',
  '/admin/writing-practice': 'Luyện viết',
  '/admin/task1-exercises':  'Task 1 Grammar',
  '/admin/task2-exercises':  'Task 2 Writing',
  '/admin/history':          'Lịch sử làm bài',
  '/admin/vocab-activity':   'Hoạt động từ vựng',
  '/admin/messages':         'Hộp thư',
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = TITLES[pathname]
    || (pathname.startsWith('/admin/reading-tests/')   ? 'Chỉnh sửa đề Reading'   : null)
    || (pathname.startsWith('/admin/listening-tests/') ? 'Chỉnh sửa đề Listening' : null)
    || 'Admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost btn-icon sidebar-toggle"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Mở menu"
            >☰</button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-right">
            <a href="/" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>← Trang chủ</a>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),#ff8f00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                  {(user.username || 'A')[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 600 }}>{user.username}</span>
              </div>
            )}
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
