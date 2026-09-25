import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import QuickSearch from '../components/QuickSearch';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AdminDataProvider } from '../contexts/AdminDataProvider';
import { routeTitle } from './navConfig';

const COMPACT_KEY = 'admin-sidebar-compact';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(() => {
    try { return localStorage.getItem(COMPACT_KEY) === '1'; } catch { return false; }
  });
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { title, group } = routeTitle(pathname, search);

  useEffect(() => {
    document.title = `${title} · Admin EnglishWithDan`;
  }, [title]);

  function toggleCompact() {
    setCompact(c => {
      try { localStorage.setItem(COMPACT_KEY, c ? '0' : '1'); } catch { /* storage unavailable */ }
      return !c;
    });
  }

  return (
    <AdminDataProvider>
      <a href="#admin-main" className="skip-link">Bỏ qua menu</a>
      <div className={`admin-shell${compact ? ' is-compact' : ''}`}>
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          compact={compact}
          onToggleCompact={toggleCompact}
        />
        <div className="main">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="btn btn-ghost btn-icon sidebar-toggle"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Mở menu"
              >☰</button>
              <div className="topbar-heading">
                {group && <span className="topbar-crumb">{group}</span>}
                <span className="topbar-title">{title}</span>
              </div>
            </div>
            <div className="topbar-right">
              <QuickSearch />
              <button
                className="btn btn-ghost btn-icon theme-toggle"
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              >{theme === 'dark' ? '☀️' : '🌙'}</button>
              <a href="/" className="btn btn-ghost btn-sm topbar-home">← Trang học sinh</a>
              {user && (
                <div className="topbar-user" title={user.username}>
                  <div className="topbar-user-dot" aria-hidden="true">{(user.username || 'A')[0].toUpperCase()}</div>
                </div>
              )}
            </div>
          </header>
          <main className="content" id="admin-main" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </AdminDataProvider>
  );
}
