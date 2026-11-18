import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Main nav links (mirrors frontend/js/nav.js LINKS)
const LINKS = [
  { href: '/reading.html', icon: 'fa-book-open', label: 'Reading', children: [
    { href: '/reading.html?mode=full', icon: 'fa-file-alt', label: 'Full đề' },
    { href: '/reading.html?mode=single', icon: 'fa-book-open', label: 'Bài lẻ' },
    { href: '/reading.html?mode=tips', icon: 'fa-lightbulb', label: 'Reading Tips' },
    { href: '/reading-listening-strategy.html', icon: 'fa-chess-knight', label: 'Chiến lược luyện đề' },
    { divider: true, label: 'Khóa học' },
    { href: '/mindset-0.html', icon: 'fa-seedling', label: 'Mindset Foundation' },
    { href: '/mindset-1.html', icon: 'fa-leaf', label: 'Mindset Level 1' },
    { href: '/mindset-2.html', icon: 'fa-leaf', label: 'Mindset Level 2' },
  ]},
  { href: '/listening.html', icon: 'fa-headphones', label: 'Listening', children: [
    { href: '/listening.html?mode=full', icon: 'fa-headphones', label: 'Full đề' },
    { href: '/listening.html?mode=single', icon: 'fa-music', label: 'Bài lẻ' },
    { href: '/listening.html?mode=tips', icon: 'fa-lightbulb', label: 'Listening Tips' },
    { href: '/reading-listening-strategy.html', icon: 'fa-chess-knight', label: 'Chiến lược luyện đề' },
    { divider: true, label: 'Khóa học' },
    { href: '/mindset-0.html', icon: 'fa-seedling', label: 'Mindset Foundation' },
    { href: '/mindset-1.html', icon: 'fa-leaf', label: 'Mindset Level 1' },
    { href: '/mindset-2.html', icon: 'fa-leaf', label: 'Mindset Level 2' },
    { divider: true, label: 'Luyện tập' },
    { href: '/dictation.html', icon: 'fa-keyboard', label: 'Dictation' },
  ]},
  { href: '/writing.html', icon: 'fa-pen', label: 'Writing', children: [
    { href: '/writing.html', icon: 'fa-file-alt', label: 'Full đề' },
    { href: '/writing.html?taskType=1', icon: 'fa-chart-bar', label: 'Task 1' },
    { href: '/writing.html?taskType=2', icon: 'fa-edit', label: 'Task 2' },
    { href: '/writing.html?view=writing-tips', icon: 'fa-lightbulb', label: 'Writing Tips' },
    { divider: true, label: 'Khóa học' },
    { href: '/writing-task1.html', icon: 'fa-chart-line', label: 'Task 1 Writing' },
    { href: '/writing-task2-course.html', icon: 'fa-edit', label: 'Task 2 Writing' },
    { divider: true, label: 'Luyện tập' },
    { href: '/task2-practice.html', icon: 'fa-calendar-week', label: 'Task 2 Luyện đề tuần' },
    { href: '/task2-template.html', icon: 'fa-book-open', label: 'Task 2 Templates' },
    { divider: true, label: 'Ngữ pháp' },
    { href: '/essential-grammar.html', icon: 'fa-graduation-cap', label: 'Essential Grammar' },
    { href: '/task1-practice.html', icon: 'fa-chart-pie', label: 'Task 1 Grammar' },
    { href: '/writing-practice.html', icon: 'fa-comment', label: 'Viết câu giao tiếp' },
  ]},
  { href: '/speaking.html', icon: 'fa-microphone', label: 'Speaking', children: [
    { href: '/speaking.html', icon: 'fa-microphone', label: 'Speaking forecast' },
    { href: '/speaking.html?tab=materials', icon: 'fa-book-open', label: 'Tài liệu' },
    { href: '/speaking.html?tab=speaking-tips', icon: 'fa-lightbulb', label: 'Speaking Tips' },
    { divider: true, label: 'Khóa học' },
    { href: '/speaking-course.html', icon: 'fa-graduation-cap', label: 'Khóa học Speaking' },
    { divider: true, label: 'Luyện tập' },
    { href: '/speaking-part2.html', icon: 'fa-book-reader', label: 'Part 2 · 7 câu chuyện gốc' },
    { href: '/shadowing.html', icon: 'fa-comment-dots', label: 'Shadowing (Video)' },
  ]},
  // Vocab → React route
  { href: '/app/#/dashboard', icon: 'fa-layer-group', label: 'Vocab', reactBase: '/dashboard', children: [
    { href: '/app/#/dashboard', icon: 'fa-layer-group', label: 'Sổ từ vựng', reactPath: '/dashboard' },
    { href: '/dashboard.html?view=paraphrase', icon: 'fa-graduation-cap', label: 'Học Paraphrase' },
    { href: '/dashboard.html?view=topics', icon: 'fa-shapes', label: 'Học Vocab Topics' },
  ]},
  { href: '/mock-test.html', icon: 'fa-graduation-cap', label: 'Mocktest', children: [
    { href: '/entrance-test.html', icon: 'fa-door-open', label: 'Test đầu vào' },
    { href: '/mock-test.html', icon: 'fa-layer-group', label: 'Full Mock Test' },
  ]},
  { href: '/vocab-leaderboard.html', icon: 'fa-ranking-star', label: 'BXH vocab', children: [
    { href: '/vocab-leaderboard.html', icon: 'fa-ranking-star', label: 'Bảng xếp hạng' },
    { href: '/shop.html', icon: 'fa-store', label: 'Cửa hàng lửa 🔥' },
  ]},
  { href: '/tuition.html', icon: 'fa-money-bill-wave', label: 'Học phí', highlight: 'nav-link-tuition' },
];

function isLinkActive(link, pathname) {
  if (link.reactBase) return pathname.startsWith(link.reactBase);
  return false;
}

function isChildActive(child, pathname) {
  if (child.reactPath) return pathname === child.reactPath || pathname.startsWith(child.reactPath + '/');
  return false;
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();

  // The nav is position:fixed; mobile.css's .has-global-nav reserves its
  // height on <body> (same class nav.js sets on the static pages).
  useEffect(() => {
    document.body.classList.add('has-global-nav');
    return () => document.body.classList.remove('has-global-nav');
  }, []);

  return (
    <>
      <nav className="top-nav" id="globalTopNav">
        <a href="/dashboard.html" className="nav-brand">
          <img src="/img/big_logo.png" alt="EnglishWithDan" style={{ height: 38, width: 'auto', borderRadius: 6, display: 'block' }} />
        </a>

        <div className="nav-links">
          {LINKS.map((link) => {
            const active = isLinkActive(link, pathname) || (link.children?.some(c => !c.divider && isChildActive(c, pathname)));
            if (link.children) {
              return (
                <div key={link.href} className="nav-dropdown">
                  <a href={link.href} className={[link.highlight, active ? 'active' : ''].filter(Boolean).join(' ') || undefined}>
                    <i className={`fas ${link.icon}`} /> {link.label} <i className="fas fa-chevron-down nav-dd-arrow" />
                  </a>
                  <div className="nav-dd-menu">
                    {link.children.map((child, i) =>
                      child.divider
                        ? <div key={i} className="nav-dd-divider">{child.label}</div>
                        : <a key={child.href} href={child.href} className={isChildActive(child, pathname) ? 'active' : undefined}>
                            <i className={`fas ${child.icon}`} /> {child.label}
                          </a>
                    )}
                  </div>
                </div>
              );
            }
            return (
              <a key={link.href} href={link.href} className={[link.highlight, active ? 'active' : ''].filter(Boolean).join(' ') || undefined}>
                <i className={`fas ${link.icon}`} /> {link.label}
              </a>
            );
          })}
        </div>

        <div className="nav-actions">
          <a className="btn-dark-mode nav-action-hide-mobile" href="/inbox.html" title="Hộp thư" aria-label="Hộp thư">
            <i className="fas fa-envelope" />
          </a>

          <div className="nav-dropdown nav-util-dropdown">
            <button className="btn-dark-mode" title="Tiện ích" aria-label="Tiện ích">
              <i className="fas fa-gear" />
            </button>
            <div className="nav-dd-menu nav-util-menu">
              <a href="#" onClick={(e) => { e.preventDefault(); toggle(); }}>
                <span className="nav-util-emoji">{theme === 'dark' ? '☀️' : '🌙'}</span> Giao diện tối/sáng
              </a>
            </div>
          </div>

          {isAdmin && (
            <a className="btn-dark-mode" href="/admin/" title="Về trang quản trị" aria-label="Về trang quản trị">
              <i className="fas fa-user-shield" />
            </a>
          )}

          {user && (
            <a href="/profile.html" className="btn-dark-mode" title={user.username} aria-label="Hồ sơ cá nhân">
              <div className="topbar-user-dot" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                {(user.username || 'U')[0].toUpperCase()}
              </div>
            </a>
          )}

          <button
            className="btn-dark-mode mobile-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
          >
            <i className="fas fa-bars" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
            <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Đóng menu">
              <i className="fas fa-times" />
            </button>
            <div className="mobile-nav-links">
              {LINKS.map((link) => {
                const active = isLinkActive(link, pathname);
                return (
                  <div key={link.href}>
                    <a href={link.href} className={`mobile-nav-link${active ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                      <i className={`fas ${link.icon}`} style={{ width: 20, textAlign: 'center' }} /> {link.label}
                    </a>
                    {link.children?.map((child, i) =>
                      child.divider
                        ? <div key={i} className="mobile-nav-divider-label">{child.label}</div>
                        : <a key={child.href} href={child.href} className={`mobile-nav-link mobile-nav-sub${isChildActive(child, pathname) ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
                            <i className={`fas ${child.icon}`} style={{ width: 20, textAlign: 'center' }} /> {child.label}
                          </a>
                    )}
                  </div>
                );
              })}
              <a href="/inbox.html" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                <i className="fas fa-envelope" style={{ width: 20, textAlign: 'center' }} /> Hộp thư
              </a>
              {isAdmin && (
                <a href="/admin/" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <i className="fas fa-user-shield" style={{ width: 20, textAlign: 'center' }} /> Về trang quản trị
                </a>
              )}
              <button className="mobile-nav-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => { logout(); setMobileOpen(false); }}>
                <i className="fas fa-sign-out-alt" style={{ width: 20, textAlign: 'center' }} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
