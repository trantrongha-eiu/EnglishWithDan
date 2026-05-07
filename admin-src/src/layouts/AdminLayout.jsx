import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Người dùng',
  '/admin/access-codes': 'Mã truy cập',
  '/admin/courses': 'Khóa học',
  '/admin/passages': 'Bài đọc (Passages)',
  '/admin/reading-tests': 'Bộ đề Reading',
  '/admin/listening-tests': 'Đề Listening',
  '/admin/writing-tests': 'Đề Writing',
  '/admin/speaking': 'Speaking',
  '/admin/vocabulary': 'Từ vựng (Units)',
  '/admin/writing-practice': 'Luyện viết (Writing Practice)',
  '/admin/history': 'Lịch sử làm bài',
  '/admin/vocab-activity': 'Hoạt động từ vựng',
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost btn-icon"
              style={{ display: 'none' }}
              id="sidebar-toggle"
              onClick={() => setMobileOpen(o => !o)}
            >☰</button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-right">
            <a href="/" className="btn btn-ghost btn-sm">← Trang chủ</a>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
