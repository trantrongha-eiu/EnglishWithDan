import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const TITLES = {
  '/dashboard':              'Dashboard',
  '/users':                  'Người dùng',
  '/access-codes':           'Mã truy cập',
  '/courses':                'Khóa học',
  '/passages':               'Bài đọc (Passages)',
  '/reading-tests':          'Bộ đề Reading',
  '/listening-tests':        'Đề Listening',
  '/listening-sections':     'Bài lẻ Listening',
  '/writing-tests':          'Đề Writing',
  '/speaking':               'Speaking',
  '/vocabulary':             'Từ vựng (Units)',
  '/writing-practice':       'Luyện viết (Writing Practice)',
  '/task1-exercises':        'Task 1 Grammar Exercises',
  '/task2-exercises':        'Task 2 Writing Exercises',
  '/task2-templates':        'Task 2 Templates',
  '/history':                'Lịch sử làm bài',
  '/writing-grades':         'Chấm bài Writing',
  '/vocab-activity':         'Hoạt động từ vựng',
  '/messages':               'Hộp thư',
  '/writing-samples':        'Bài mẫu Writing',
  '/tuition':                'Quản lý học phí',
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const title = TITLES[pathname]
    || (pathname.startsWith('/reading-tests/')   ? 'Chỉnh sửa đề Reading'   : null)
    || (pathname.startsWith('/listening-tests/') ? 'Chỉnh sửa đề Listening' : null)
    || (pathname.startsWith('/listening-sections/') ? 'Chỉnh sửa bài Listening' : null)
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
            <button
              className="btn btn-ghost btn-icon theme-toggle"
              onClick={toggle}
              title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >{theme === 'dark' ? '☀️' : '🌙'}</button>
            <a href="/" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>← Trang chủ</a>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),#ff8f00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                  {(user.username || 'A')[0].toUpperCase()}
                </div>
                <span className="topbar-username" style={{ fontWeight: 600 }}>{user.username}</span>
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
