(function () {
  'use strict';
  var API = 'https://englishwithdan.onrender.com/api';
  var page = location.pathname.split('/').pop() || 'index.html';

  var LINKS = [
    { href: 'reading.html',          icon: 'fa-book-open',   label: 'Reading' },
    { href: 'listening.html',        icon: 'fa-headphones',  label: 'Listening' },
    { href: 'writing.html',          icon: 'fa-pen',         label: 'Writing' },
    { href: 'writing-practice.html', icon: 'fa-pencil-alt',  label: 'Luyện viết' },
    { href: 'dashboard.html',        icon: 'fa-layer-group', label: 'Vocab' },
    { href: 'inbox.html',            icon: 'fa-envelope',    label: 'Hộp thư', badge: true },
  ];

  function mkDesktopLinks() {
    return LINKS.map(function (l) {
      var cls = page === l.href ? ' class="active"' : '';
      var badge = l.badge
        ? '<span id="navInboxBadge" style="display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:3px;vertical-align:middle"></span>'
        : '';
      return '<a href="' + l.href + '"' + cls + '><i class="fas ' + l.icon + '"></i> ' + l.label + badge + '</a>';
    }).join('');
  }

  function mkMobileLinks() {
    return LINKS.map(function (l) {
      var active = page === l.href ? ' active' : '';
      var badge = l.badge
        ? '<span id="mobileInboxBadge" style="display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:3px;vertical-align:middle"></span>'
        : '';
      return '<a href="' + l.href + '" class="mobile-nav-link' + active + '"><i class="fas ' + l.icon + '" style="width:20px;text-align:center"></i> ' + l.label + badge + '</a>';
    }).join('');
  }

  // ── Inject top nav ────────────────────────────────────────
  var nav = document.createElement('nav');
  nav.className = 'top-nav';
  nav.id = 'globalTopNav';
  nav.innerHTML =
    '<a href="dashboard.html" class="nav-brand"><i class="fas fa-graduation-cap"></i> EnglishWithDan</a>' +
    '<div class="nav-links">' + mkDesktopLinks() + '</div>' +
    '<div class="nav-actions">' +
      '<button class="btn-dark-mode" id="globalDarkBtn" title="Chế độ tối/sáng"><span class="dark-toggle-icon">🌙</span></button>' +
      '<a href="profile.html" id="navUserWidget" title="Trang cá nhân" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;overflow:hidden;cursor:pointer;text-decoration:none;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14px;font-weight:700;border:2px solid rgba(255,255,255,.25);transition:transform .15s,box-shadow .15s;" onmouseover="this.style.transform=\'scale(1.1)\';this.style.boxShadow=\'0 0 0 3px rgba(99,102,241,.35)\'" onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'none\'">' +
        '<span id="navAvatar" style="line-height:1;pointer-events:none">?</span>' +
      '</a>' +
      '<button class="btn-dark-mode" id="globalLogoutBtn" title="Đăng xuất"><i class="fas fa-sign-out-alt"></i></button>' +
      '<button class="hamburger" id="globalHamburger" aria-label="Mở menu"><span></span><span></span><span></span></button>' +
    '</div>';
  document.body.insertBefore(nav, document.body.firstChild);

  // ── Add padding class to body ─────────────────────────────
  document.body.classList.add('has-global-nav');

  // ── Populate avatar widget from localStorage ──────────────
  try {
    var _u = JSON.parse(localStorage.getItem('user') || 'null');
    if (_u) {
      var _navAv = document.getElementById('navAvatar');
      if (_navAv) {
        if (_u.avatar) {
          _navAv.innerHTML = '<img src="' + _u.avatar + '" alt="avatar" style="width:34px;height:34px;object-fit:cover;display:block;">';
        } else {
          _navAv.textContent = (_u.firstName || _u.username || '?')[0].toUpperCase();
        }
      }
    }
  } catch (e) {}

  // ── Inject mobile drawer ──────────────────────────────────
  var drawer = document.createElement('div');
  drawer.className = 'mobile-nav';
  drawer.id = 'globalMobileNav';
  drawer.innerHTML =
    '<div class="mobile-nav-inner">' +
    mkMobileLinks() +
    '<div class="mobile-nav-divider"></div>' +
    '<button id="mobileLogoutBtn" style="width:100%;padding:12px 16px;border:none;background:none;cursor:pointer;color:var(--danger,#ef4444);font-size:15px;font-weight:600;font-family:inherit;text-align:left;border-radius:10px;display:flex;align-items:center;gap:12px;">' +
    '<i class="fas fa-sign-out-alt" style="width:20px;text-align:center"></i> Đăng xuất</button>' +
    '</div>';
  document.body.appendChild(drawer);

  // ── Hamburger toggle ──────────────────────────────────────
  var ham = document.getElementById('globalHamburger');
  ham.addEventListener('click', function () {
    drawer.classList.toggle('open');
    ham.classList.toggle('open');
  });
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer) {
      drawer.classList.remove('open');
      ham.classList.remove('open');
    }
  });

  // ── Dark mode button ──────────────────────────────────────
  document.getElementById('globalDarkBtn').addEventListener('click', function () {
    if (typeof toggleDark === 'function') toggleDark();
  });

  // ── Logout ────────────────────────────────────────────────
  function doLogout() {
    if (typeof window.logout === 'function') { window.logout(); return; }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = 'login.html';
  }
  document.getElementById('globalLogoutBtn').addEventListener('click', doLogout);
  document.getElementById('mobileLogoutBtn').addEventListener('click', doLogout);

  // ── Unread badge ──────────────────────────────────────────
  var token = localStorage.getItem('token');
  if (token) {
    fetch(API + '/user/messages/unread-count', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.count > 0) {
          ['navInboxBadge', 'mobileInboxBadge'].forEach(function (id) {
            var b = document.getElementById(id);
            if (b) { b.textContent = d.count; b.style.display = 'inline'; }
          });
        }
      })
      .catch(function () {});
  }
})();
