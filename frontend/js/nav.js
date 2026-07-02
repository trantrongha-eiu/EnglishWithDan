(function () {
  'use strict';
  var API = 'https://englishwithdan.onrender.com/api';
  var page = location.pathname.split('/').pop() || 'index.html';

  var LINKS = [
    { href: 'reading.html',          icon: 'fa-book-open',   label: 'Reading',
      children: [
        { href: 'reading.html?mode=full',   icon: 'fa-file-alt',   label: 'Full đề' },
        { href: 'reading.html?mode=single', icon: 'fa-book-open',  label: 'Bài lẻ' },
      ]
    },
    { href: 'listening.html',        icon: 'fa-headphones',  label: 'Listening',
      children: [
        { href: 'listening.html?mode=full',   icon: 'fa-headphones', label: 'Full đề' },
        { href: 'listening.html?mode=single', icon: 'fa-music',      label: 'Bài lẻ' },
      ]
    },
    { href: 'writing.html',          icon: 'fa-pen',         label: 'Writing', badgeId: 'navWritingBadge',
      children: [
        { href: 'writing.html',             icon: 'fa-file-alt',  label: 'Full đề' },
        { href: 'writing.html?taskType=1',  icon: 'fa-chart-bar', label: 'Task 1' },
        { href: 'writing.html?taskType=2',  icon: 'fa-edit',      label: 'Task 2' },
      ]
    },
    { href: 'speaking.html',          icon: 'fa-microphone',  label: 'Speaking' },
    { href: 'writing-practice.html', icon: 'fa-pencil-alt',  label: 'Luyện viết',
      children: [
        { href: 'writing-practice.html', icon: 'fa-house',      label: 'Viết câu giao tiếp' },
        { href: 'task1-practice.html',   icon: 'fa-chart-bar',  label: 'Task 1 Grammar' },
        { href: 'task2-practice.html',   icon: 'fa-edit',       label: 'Task 2 Writing', badgeId: 'navTask2Badge' },
        { href: 'task2-template.html',  icon: 'fa-book-open',  label: 'Task 2 Templates' },
      ]
    },
    { href: 'dashboard.html',        icon: 'fa-layer-group', label: 'Vocab' },
    { href: 'inbox.html',            icon: 'fa-envelope',    label: 'Hộp thư', badge: true, badgeId: 'navInboxBadge' },
    { href: 'tuition.html',          icon: 'fa-money-bill-wave', label: 'Học phí', badge: true, badgeId: 'navTuitionBadge' },
  ];

  var BADGE_STYLE = 'display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:3px;vertical-align:middle';

  // Subset-param match: child href is active when the current page filename matches
  // AND every query param in the child href is present in the current URL.
  // A child with no query string is only active when the current URL also has no query string.
  function navChildActive(cHref) {
    var ci = cHref.indexOf('?');
    var cBase   = ci === -1 ? cHref : cHref.slice(0, ci);
    var cSearch = ci === -1 ? '' : cHref.slice(ci + 1);
    if (cBase !== page) return false;
    if (!cSearch) return !location.search;
    var cParams  = new URLSearchParams(cSearch);
    var curParams = new URLSearchParams(location.search);
    var ok = true;
    cParams.forEach(function (v, k) { if (curParams.get(k) !== v) ok = false; });
    return ok;
  }

  function mkDesktopLinks() {
    return LINKS.map(function (l) {
      var isActive = page === l.href || (l.children && l.children.some(function (c) { return navChildActive(c.href); }));
      var cls = isActive ? ' class="active"' : '';
      var badge = l.badgeId ? '<span id="' + l.badgeId + '" style="' + BADGE_STYLE + '"></span>' : '';
      if (l.children) {
        var items = l.children.map(function (c) {
          var cc = navChildActive(c.href) ? ' class="active"' : '';
          var cbadge = c.badgeId ? '<span id="' + c.badgeId + '" style="' + BADGE_STYLE + '"></span>' : '';
          return '<a href="' + c.href + '"' + cc + '><i class="fas ' + c.icon + '"></i> ' + c.label + cbadge + '</a>';
        }).join('');
        return '<div class="nav-dropdown"><a href="' + l.href + '"' + cls + '><i class="fas ' + l.icon + '"></i> ' + l.label + badge + ' <i class="fas fa-chevron-down nav-dd-arrow"></i></a><div class="nav-dd-menu">' + items + '</div></div>';
      }
      return '<a href="' + l.href + '"' + cls + '><i class="fas ' + l.icon + '"></i> ' + l.label + badge + '</a>';
    }).join('');
  }

  function mkMobileLinks() {
    var out = [];
    LINKS.forEach(function (l) {
      var isActive = page === l.href || (l.children && l.children.some(function (c) { return navChildActive(c.href); }));
      var active = isActive ? ' active' : '';
      var badge = l.badgeId ? '<span id="mob_' + l.badgeId + '" style="' + BADGE_STYLE + '"></span>' : '';
      out.push('<a href="' + l.href + '" class="mobile-nav-link' + active + '"><i class="fas ' + l.icon + '" style="width:20px;text-align:center"></i> ' + l.label + badge + '</a>');
      if (l.children) {
        l.children.forEach(function (c) {
          var ca = navChildActive(c.href) ? ' active' : '';
          var cbadge = c.badgeId ? '<span id="mob_' + c.badgeId + '" style="' + BADGE_STYLE + '"></span>' : '';
          out.push('<a href="' + c.href + '" class="mobile-nav-link mobile-nav-sub' + ca + '"><i class="fas ' + c.icon + '" style="width:20px;text-align:center"></i> ' + c.label + cbadge + '</a>');
        });
      }
    });
    return out.join('');
  }

  // ── Inject top nav ────────────────────────────────────────
  var nav = document.createElement('nav');
  nav.className = 'top-nav';
  nav.id = 'globalTopNav';
  nav.innerHTML =
    '<a href="dashboard.html" class="nav-brand"><img src="img/big_logo.png" alt="EnglishWithDan" style="height:38px;width:auto;border-radius:6px;display:block;"></a>' +
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

  // ── Nav visibility helpers ────────────────────────────────
  window.hideTopNav = function () {
    var n = document.getElementById('globalTopNav');
    var d = document.getElementById('globalMobileNav');
    if (n) n.style.display = 'none';
    if (d) d.style.display = 'none';
    document.body.classList.remove('has-global-nav');
    document.documentElement.style.setProperty('--nav-height', '0px');
  };
  window.showTopNav = function () {
    var n = document.getElementById('globalTopNav');
    var d = document.getElementById('globalMobileNav');
    if (n) n.style.display = '';
    if (d) d.style.display = '';
    document.body.classList.add('has-global-nav');
    document.documentElement.style.removeProperty('--nav-height');
  };

  // Auto-hide on standalone practice pages
  var PRACTICE_ONLY_PAGES = ['writing-practice.html', 'task1-practice.html', 'task2-practice.html', 'task2-template.html'];
  if (PRACTICE_ONLY_PAGES.indexOf(page) !== -1) {
    window.hideTopNav();
  }

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
  // Close mobile nav if window is resized to desktop width (prevents overlay getting stuck)
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && drawer.classList.contains('open')) {
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

  // ── Dropdown hover management (delay prevents accidental close) ──
  var ddItems = nav.querySelectorAll('.nav-dropdown');
  ddItems.forEach(function (dd) {
    var _t = null;
    dd.addEventListener('mouseenter', function () {
      clearTimeout(_t);
      dd.classList.add('nav-dd-open');
    });
    dd.addEventListener('mouseleave', function () {
      _t = setTimeout(function () {
        dd.classList.remove('nav-dd-open');
      }, 250);
    });
  });

  // ── Unread badges ─────────────────────────────────────────
  function showBadge(badgeId, count) {
    [badgeId, 'mob_' + badgeId].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) { b.textContent = count; b.style.display = count > 0 ? 'inline' : 'none'; }
    });
  }

  var token = localStorage.getItem('token');
  if (token) {
    var headers = { Authorization: 'Bearer ' + token };

    fetch(API + '/user/messages/unread-count', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.count > 0) showBadge('navInboxBadge', d.count); })
      .catch(function () {});

    fetch(API + '/writing/unread-feedback-count', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.count > 0) showBadge('navWritingBadge', d.count); })
      .catch(function () {});

    fetch(API + '/tuition/my/summary', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.unpaidCount > 0) showBadge('navTuitionBadge', d.unpaidCount); })
      .catch(function () {});

    fetch(API + '/task2/drafts', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var count = (d.drafts || []).filter(function (dr) {
          return ((dr.questionIds && dr.questionIds.length) || 0) - (dr.currentIdx || 0) > 0;
        }).length;
        if (count > 0) showBadge('navTask2Badge', count);
      })
      .catch(function () {});

    // Refresh plan silently and show expiry warning if needed
    fetch(API + '/auth/me', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.success || !d.user) return;
        // Merge fresh plan data into localStorage
        var _cached = {};
        try { _cached = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e) {}
        _cached.plan = d.user.plan;
        _cached.planExpiresAt = d.user.planExpiresAt;
        localStorage.setItem('user', JSON.stringify(_cached));
        // Show expiry banner if premium and expiring within 7 days
        if (d.user.plan === 'premium' && d.user.planExpiresAt) {
          var daysLeft = Math.ceil((new Date(d.user.planExpiresAt) - Date.now()) / 86400000);
          if (daysLeft >= 0 && daysLeft <= 7) _showExpiryBanner(daysLeft);
        }
      })
      .catch(function () {});
  }

  function _showExpiryBanner(daysLeft) {
    if (sessionStorage.getItem('expiry-banner-dismissed')) return;
    var isUrgent = daysLeft <= 3;
    var bg = isUrgent
      ? 'linear-gradient(90deg,#dc2626,#ef4444)'
      : 'linear-gradient(90deg,#d97706,#f59e0b)';
    var msg = daysLeft === 0
      ? 'Gói Premium của bạn hết hạn hôm nay!'
      : ('Gói Premium còn ' + daysLeft + ' ngày. Gia hạn ngay để không bị gián đoạn!');
    var banner = document.createElement('div');
    banner.id = 'nav-expiry-banner';
    banner.style.cssText = 'position:fixed;top:56px;left:0;right:0;z-index:997;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;font-size:13px;font-weight:600;color:#fff;background:' + bg + ';box-shadow:0 2px 8px rgba(0,0,0,.15)';
    banner.innerHTML =
      '<span style="flex:1;text-align:center">' + msg + '</span>' +
      '<a href="profile.html#plan" style="color:#fff;background:rgba(255,255,255,.25);border-radius:6px;padding:4px 10px;text-decoration:none;font-size:12px;white-space:nowrap">Gia hạn</a>' +
      '<button onclick="(function(){sessionStorage.setItem(\'expiry-banner-dismissed\',\'1\');document.getElementById(\'nav-expiry-banner\').remove();})()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;flex-shrink:0" title="Đóng">&times;</button>';
    document.body.insertBefore(banner, document.getElementById('globalTopNav').nextSibling);
  }
})();
