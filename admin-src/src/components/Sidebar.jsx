import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminData } from '../contexts/AdminDataContext';
import { NAV_GROUPS, isItemActive } from '../layouts/navConfig';

// Sidebar (redesigned 2026-09-25, docs/ADMIN_AUDIT_2026-09-25.md §6/§9):
//  - groups from navConfig, each collapsible (remembered per browser); the
//    group holding the current page always stays open;
//  - admin-only entries are hidden from teachers (they used to be shown and
//    bounced the teacher to login.html);
//  - "Tìm menu…" filters all entries across groups;
//  - desktop "compact" mode shows icons only.
// Badge counts come from AdminDataProvider (one shared poll).

const CLOSED_KEY = 'admin-nav-closed';

function readClosed() {
  try { return new Set(JSON.parse(localStorage.getItem(CLOSED_KEY) || '[]')); }
  catch { return new Set(); }
}

function Badge({ count, tone, title }) {
  if (!count) return null;
  return (
    <span className={`nav-badge${tone === 'warn' ? ' nav-badge--warn' : ''}`} title={title}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Sidebar({ mobileOpen, onClose, compact, onToggleCompact }) {
  const { user, logout, isAdmin } = useAuth();
  const { badges } = useAdminData();
  const { pathname, search } = useLocation();
  const [query, setQuery] = useState('');
  const [closed, setClosed] = useState(readClosed);
  const [onlineOpen, setOnlineOpen] = useState(false);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAV_GROUPS
      .map(g => ({
        ...g,
        items: g.items.filter(i => (isAdmin || !i.adminOnly) && (!q || i.label.toLowerCase().includes(q) || g.label.toLowerCase().includes(q))),
      }))
      .filter(g => g.items.length);
  }, [isAdmin, query]);

  function toggleGroup(id) {
    setClosed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(CLOSED_KEY, JSON.stringify([...next])); } catch { /* storage unavailable */ }
      return next;
    });
  }

  const online = (badges?.onlineUsers || []).filter(u => u.role === 'student');

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay open" onClick={onClose} />}
      <nav className={`sidebar${mobileOpen ? ' open' : ''}${compact ? ' sidebar--compact' : ''}`} aria-label="Điều hướng quản trị">
        <div className="sidebar-brand">
          <Link to="/dashboard" className="sidebar-brand-link" onClick={onClose} title="Dashboard">
            <span className="sidebar-brand-mark" aria-hidden="true">D</span>
            <span className="sidebar-brand-text">
              <span className="sidebar-brand-name">EnglishWithDan</span>
              <span className="sidebar-brand-sub">Admin</span>
            </span>
          </Link>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Đóng menu">✕</button>
          <button className="sidebar-compact-btn" onClick={onToggleCompact} aria-label={compact ? 'Mở rộng menu' : 'Thu gọn menu'} title={compact ? 'Mở rộng menu' : 'Thu gọn menu'}>
            {compact ? '»' : '«'}
          </button>
        </div>

        {!compact && (
          <div className="sidebar-search">
            <input
              type="search"
              className="sidebar-search-input"
              placeholder="Tìm menu…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Tìm chức năng trong menu"
            />
          </div>
        )}

        {!compact && online.length > 0 && (
          <div className="sidebar-online">
            <button type="button" className="sidebar-online-toggle" onClick={() => setOnlineOpen(o => !o)} aria-expanded={onlineOpen}>
              <span className="online-dot" aria-hidden="true" />
              {online.length} học sinh đang online
              <span className="sidebar-chevron" aria-hidden="true">{onlineOpen ? '▾' : '▸'}</span>
            </button>
            {onlineOpen && (
              <div className="sidebar-online-list">
                {online.map(u => (
                  <Link key={u._id} to={`/students/${u._id}`} onClick={onClose} title={`Xem hồ sơ ${u.username}`}>
                    {u.username}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="sidebar-nav">
          {groups.map(g => {
            const hasActive = g.items.some(i => isItemActive(i, pathname, search));
            const isOpen = compact || !!query || hasActive || !closed.has(g.id);
            const groupCount = g.items.reduce((n, i) => n + (i.badge && badges ? (badges[i.badge] || 0) : 0), 0);
            return (
              <div key={g.id} className="nav-group">
                {compact
                  ? <div className="nav-group-divider" aria-hidden="true" />
                  : (
                    <button type="button" className="nav-section-label" onClick={() => toggleGroup(g.id)} aria-expanded={isOpen}>
                      <span>{g.label}</span>
                      {!isOpen && groupCount > 0 && <span className="nav-group-dot" title={`${groupCount} mục cần xử lý`} />}
                      <span className="sidebar-chevron" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                    </button>
                  )}
                {isOpen && g.items.map(item => {
                  const active = isItemActive(item, pathname, search);
                  const count = item.badge && badges ? badges[item.badge] : 0;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`nav-item${active ? ' active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={onClose}
                      title={compact ? item.label : undefined}
                    >
                      <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      <Badge count={count} tone={item.badgeTone} title={item.badgeTitle} />
                    </Link>
                  );
                })}
              </div>
            );
          })}
          {groups.length === 0 && <div className="nav-empty">Không có mục nào khớp “{query}”</div>}
        </div>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="user-avatar" aria-hidden="true">{(user?.username || 'A')[0].toUpperCase()}</div>
            <div className="user-chip-text">
              <div className="user-name">{user?.username || 'Admin'}</div>
              <div className="user-role">{user?.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}</div>
            </div>
            <button className="btn-logout" onClick={logout} title="Đăng xuất" aria-label="Đăng xuất">⏻</button>
          </div>
        </div>
      </nav>
    </>
  );
}
