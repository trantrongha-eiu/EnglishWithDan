(function () {
  'use strict';
  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var page = location.pathname.split('/').pop() || 'index.html';

  var LINKS = [
    { href: 'reading.html',          icon: 'fa-book-open',   label: 'Reading',
      children: [
        { href: 'reading.html?mode=full',   icon: 'fa-file-alt',   label: 'Full đề' },
        { href: 'reading.html?mode=single', icon: 'fa-book-open',  label: 'Bài lẻ' },
        { href: 'reading.html?mode=tips',   icon: 'fa-lightbulb',  label: 'Reading Tips' },
      ]
    },
    { href: 'listening.html',        icon: 'fa-headphones',  label: 'Listening',
      children: [
        { href: 'listening.html?mode=full',   icon: 'fa-headphones', label: 'Full đề' },
        { href: 'listening.html?mode=single', icon: 'fa-music',      label: 'Bài lẻ' },
        { href: 'dictation.html',             icon: 'fa-keyboard',   label: 'Dictation' },
        { href: 'listening.html?mode=tips',   icon: 'fa-lightbulb',  label: 'Listening Tips' },
      ]
    },
    { href: 'writing.html',          icon: 'fa-pen',         label: 'Writing', badgeId: 'navWritingBadge',
      children: [
        { href: 'writing.html',             icon: 'fa-file-alt',  label: 'Full đề' },
        { href: 'writing.html?taskType=1',  icon: 'fa-chart-bar', label: 'Task 1', badgeId: 'navWritingTask1Badge' },
        { href: 'writing.html?taskType=2',  icon: 'fa-edit',      label: 'Task 2', badgeId: 'navWritingTask2Badge' },
        { href: 'writing.html?view=writing-tips', icon: 'fa-lightbulb', label: 'Writing Tips' },
      ]
    },
    { href: 'speaking.html',          icon: 'fa-microphone',  label: 'Speaking',
      children: [
        { href: 'speaking.html',                    icon: 'fa-microphone', label: 'Luyện tập' },
        { href: 'speaking.html?tab=materials',      icon: 'fa-book-open',  label: 'Tài liệu' },
        { href: 'speaking.html?tab=speaking-tips',  icon: 'fa-lightbulb',  label: 'Speaking Tips' },
      ]
    },
    { href: 'writing-practice.html', icon: 'fa-pencil-alt',  label: 'Luyện viết',
      children: [
        { href: 'writing-practice.html', icon: 'fa-house',      label: 'Viết câu giao tiếp' },
        { href: 'task1-practice.html',   icon: 'fa-chart-bar',  label: 'Task 1 Grammar' },
        { href: 'task2-practice.html',   icon: 'fa-edit',       label: 'Task 2 Writing', badgeId: 'navTask2Badge' },
        { href: 'task2-template.html',  icon: 'fa-book-open',  label: 'Task 2 Templates' },
        { href: 'essential-grammar.html', icon: 'fa-graduation-cap', label: 'Essential Grammar' },
      ]
    },
    { href: 'dashboard.html',        icon: 'fa-layer-group', label: 'Vocab' },
    { href: 'inbox.html',            icon: 'fa-envelope',    label: 'Hộp thư', badge: true, badgeId: 'navInboxBadge' },
    { href: 'tuition.html',          icon: 'fa-money-bill-wave', label: 'Học phí', badge: true, badgeId: 'navTuitionBadge' },
  ];

  var BADGE_STYLE = 'display:none;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:3px;vertical-align:middle';

  // Base match: supports both plain filenames (compared against the current
  // page's filename) and absolute clean paths like "/writing/templates"
  // (compared against location.pathname) — the latter is also matched when
  // the visitor lands directly on the underlying .html file, since Render's
  // rewrite keeps the address bar on the clean path but a direct hit or old
  // bookmark won't.
  function navBaseActive(base) {
    if (base.charAt(0) === '/') {
      if (location.pathname.replace(/\/$/, '') === base) return true;
      return base === '/writing/templates' && page === 'task2-template.html';
    }
    return base === page;
  }

  // Subset-param match: child href is active when the current page filename matches
  // AND every query param in the child href is present in the current URL.
  // A child with no query string is only active when the current URL also has no query string.
  function navChildActive(cHref) {
    var ci = cHref.indexOf('?');
    var cBase   = ci === -1 ? cHref : cHref.slice(0, ci);
    var cSearch = ci === -1 ? '' : cHref.slice(ci + 1);
    if (!navBaseActive(cBase)) return false;
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
          return '<a href="/' + c.href + '"' + cc + '><i class="fas ' + c.icon + '"></i> ' + c.label + cbadge + '</a>';
        }).join('');
        return '<div class="nav-dropdown"><a href="/' + l.href + '"' + cls + '><i class="fas ' + l.icon + '"></i> ' + l.label + badge + ' <i class="fas fa-chevron-down nav-dd-arrow"></i></a><div class="nav-dd-menu">' + items + '</div></div>';
      }
      return '<a href="/' + l.href + '"' + cls + '><i class="fas ' + l.icon + '"></i> ' + l.label + badge + '</a>';
    }).join('');
  }

  function mkMobileLinks() {
    var out = [];
    LINKS.forEach(function (l) {
      var isActive = page === l.href || (l.children && l.children.some(function (c) { return navChildActive(c.href); }));
      var active = isActive ? ' active' : '';
      var badge = l.badgeId ? '<span id="mob_' + l.badgeId + '" style="' + BADGE_STYLE + '"></span>' : '';
      out.push('<a href="/' + l.href + '" class="mobile-nav-link' + active + '"><i class="fas ' + l.icon + '" style="width:20px;text-align:center"></i> ' + l.label + badge + '</a>');
      if (l.children) {
        l.children.forEach(function (c) {
          var ca = navChildActive(c.href) ? ' active' : '';
          var cbadge = c.badgeId ? '<span id="mob_' + c.badgeId + '" style="' + BADGE_STYLE + '"></span>' : '';
          out.push('<a href="/' + c.href + '" class="mobile-nav-link mobile-nav-sub' + ca + '"><i class="fas ' + c.icon + '" style="width:20px;text-align:center"></i> ' + c.label + cbadge + '</a>');
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
    '<a href="/dashboard.html" class="nav-brand"><img src="/img/big_logo.png" alt="EnglishWithDan" style="height:38px;width:auto;border-radius:6px;display:block;"></a>' +
    '<div class="nav-links">' + mkDesktopLinks() + '</div>' +
    '<div class="nav-actions">' +
      '<button class="btn-dark-mode" id="globalSoundBtn" title="Bật/tắt âm thanh" aria-label="Bật/tắt âm thanh"><span class="sound-toggle-icon">🔊</span></button>' +
      '<button class="btn-dark-mode" id="globalDarkBtn" title="Chế độ tối/sáng" aria-label="Chuyển chế độ tối/sáng"><span class="dark-toggle-icon">🌙</span></button>' +
      '<button class="btn-dark-mode" id="globalLangBtn" data-i18n-skip title="Switch to English" aria-label="Switch to English" style="font-size:12px;font-weight:800;letter-spacing:.5px">EN</button>' +
      '<div class="nav-search-wrap" style="position:relative">' +
        '<button class="btn-dark-mode" id="globalSearchBtn" title="Tìm kiếm" aria-label="Tìm kiếm" aria-haspopup="true" aria-expanded="false"><i class="fas fa-search"></i></button>' +
        '<div class="nav-search-panel" id="globalSearchPanel">' +
          '<input type="text" id="globalSearchInput" class="nav-search-input" placeholder="Tìm đề Reading, Listening, bài học từ vựng...">' +
          '<div class="nav-search-results" id="globalSearchResults"></div>' +
        '</div>' +
      '</div>' +
      '<button class="btn-dark-mode" id="globalTourBtn" title="Xem lại hướng dẫn" aria-label="Xem lại hướng dẫn" style="display:none"><i class="fas fa-circle-question"></i></button>' +
      '<div class="nav-bell-wrap" style="position:relative">' +
        '<button class="btn-dark-mode" id="globalBellBtn" title="Thông báo" aria-label="Thông báo" aria-haspopup="true" aria-expanded="false"><i class="fas fa-bell"></i><span id="navBellBadge" class="nav-bell-badge" style="display:none">0</span></button>' +
        '<div class="nav-bell-panel" id="globalBellPanel">' +
          '<div class="nav-bell-panel-header">Thông báo</div>' +
          '<div class="nav-bell-panel-list" id="globalBellList"><div style="padding:24px;text-align:center;color:var(--text3);font-size:13px"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div></div>' +
        '</div>' +
      '</div>' +
      '<a href="/profile.html" id="navUserWidget" title="Trang cá nhân" aria-label="Trang cá nhân" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;overflow:hidden;cursor:pointer;text-decoration:none;flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14px;font-weight:700;border:2px solid rgba(255,255,255,.25);transition:transform .15s,box-shadow .15s;" onmouseover="this.style.transform=\'scale(1.1)\';this.style.boxShadow=\'0 0 0 3px rgba(99,102,241,.35)\'" onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'none\'">' +
        '<span id="navAvatar" style="line-height:1;pointer-events:none">?</span>' +
      '</a>' +
      '<button class="btn-dark-mode" id="globalLogoutBtn" title="Đăng xuất" aria-label="Đăng xuất"><i class="fas fa-sign-out-alt"></i></button>' +
      '<button class="hamburger" id="globalHamburger" aria-label="Mở menu"><span></span><span></span><span></span></button>' +
    '</div>';
  document.body.insertBefore(nav, document.body.firstChild);

  // ── Add padding class to body ─────────────────────────────
  document.body.classList.add('has-global-nav');

  // ── Populate avatar widget from localStorage ──────────────
  try {
    var _u = window.AuthService ? window.AuthService.getUser() : JSON.parse(localStorage.getItem('user') || 'null');
    if (_u) {
      var _navAv = document.getElementById('navAvatar');
      if (_navAv) {
        if (_u.avatar) {
          _navAv.innerHTML = '';
          var _navImg = document.createElement('img');
          _navImg.src = _u.avatar;
          _navImg.alt = 'avatar';
          _navImg.style.cssText = 'width:34px;height:34px;object-fit:cover;display:block;';
          _navAv.appendChild(_navImg);
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
    '<button id="mobileLangBtn" class="mobile-nav-link ews-lang-mobile" data-i18n-skip style="width:100%;border:none;background:none;cursor:pointer;font-family:inherit;font-size:15px;font-weight:500;text-align:left;color:var(--text-light);">' +
    '<i class="fas fa-language" style="width:20px;text-align:center"></i> English</button>' +
    '<button id="mobileLogoutBtn" style="width:100%;padding:12px 16px;border:none;background:none;cursor:pointer;color:var(--danger,#ef4444);font-size:15px;font-weight:600;font-family:inherit;text-align:left;border-radius:10px;display:flex;align-items:center;gap:12px;">' +
    '<i class="fas fa-sign-out-alt" style="width:20px;text-align:center"></i> Đăng xuất</button>' +
    '</div>';
  document.body.appendChild(drawer);

  // ── Sentence lookup floating bubble ("tra câu") ───────────
  // Loaded here (rather than a <script>/<link> tag on every page) so every
  // page that already gets the global nav also gets this for free. Absolute
  // paths are required, not relative ones: some of these pages are served
  // at nested clean URLs (e.g. task2-template.html at /writing/templates —
  // see navBaseActive above), where a relative "css/x.css" would resolve
  // against the wrong directory.
  if (!document.getElementById('ews-sentence-lookup-css')) {
    var slLink = document.createElement('link');
    slLink.id = 'ews-sentence-lookup-css';
    slLink.rel = 'stylesheet';
    slLink.href = '/css/sentence-lookup.css';
    document.head.appendChild(slLink);
  }
  if (!document.getElementById('ews-sentence-lookup-js')) {
    var slScript = document.createElement('script');
    slScript.id = 'ews-sentence-lookup-js';
    slScript.src = '/js/shared/sentence-lookup.js';
    document.body.appendChild(slScript);
  }

  // ── Site-wide VI ⇄ EN toggle (js/shared/i18n.js) ──────────
  // Injected here so every page with the global nav gets the language
  // switch without editing ~28 HTML files. The nav + drawer buttons above
  // (#globalLangBtn / #mobileLangBtn) are already in the DOM by the time
  // this loads, so i18n.js's first apply() and its MutationObserver pick
  // them up.
  if (!document.getElementById('ews-i18n-js')) {
    var i18nScript = document.createElement('script');
    i18nScript.id = 'ews-i18n-js';
    i18nScript.src = '/js/shared/i18n.js?v=20260903';
    document.body.appendChild(i18nScript);
  }

  // ── Nav visibility helpers ────────────────────────────────
  // Also hides the floating peer-chat bubble (js/shared/peer-chat-widget.js)
  // while it's active — on Reading/Listening/Writing exam screens it sits
  // right on top of the submit button (student-reported overlap). Guarded
  // with a null check since not every page that calls hideTopNav() has the
  // widget included.
  window.hideTopNav = function () {
    var n = document.getElementById('globalTopNav');
    var d = document.getElementById('globalMobileNav');
    if (n) n.style.display = 'none';
    if (d) d.style.display = 'none';
    document.body.classList.remove('has-global-nav');
    document.documentElement.style.setProperty('--nav-height', '0px');
    var pcw = document.getElementById('pcw-root');
    if (pcw) pcw.style.display = 'none';
  };
  window.showTopNav = function () {
    var n = document.getElementById('globalTopNav');
    var d = document.getElementById('globalMobileNav');
    if (n) n.style.display = '';
    if (d) d.style.display = '';
    document.body.classList.add('has-global-nav');
    document.documentElement.style.removeProperty('--nav-height');
    var pcw = document.getElementById('pcw-root');
    if (pcw) pcw.style.display = '';
  };

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

  // ── Sound toggle button ────────────────────────────────────
  document.getElementById('globalSoundBtn').addEventListener('click', function () {
    if (typeof toggleWpSound === 'function') toggleWpSound();
  });

  // ── Dark mode button ──────────────────────────────────────
  document.getElementById('globalDarkBtn').addEventListener('click', function () {
    if (typeof toggleDark === 'function') toggleDark();
  });

  // ── Language toggle (VI ⇄ EN) ─────────────────────────────
  function _toggleLang() {
    if (window.EWSI18n) window.EWSI18n.toggle();
  }
  var langBtn = document.getElementById('globalLangBtn');
  if (langBtn) langBtn.addEventListener('click', _toggleLang);
  var mobLangBtn = document.getElementById('mobileLangBtn');
  if (mobLangBtn) mobLangBtn.addEventListener('click', function () {
    _toggleLang();
    drawer.classList.remove('open');
    ham.classList.remove('open');
  });

  // ── Logout ────────────────────────────────────────────────
  // window.logout is always present (auth.js loads before nav.js on every
  // page that has both) — the local fallback body only exists in case a
  // future page ever loads nav.js standalone.
  function doLogout() {
    if (typeof window.logout === 'function') { window.logout(); return; }
    if (window.AuthService) { window.AuthService.clearSession(); }
    location.href = '/login.html';
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

  // ── Site-wide search ────────────────────────────────────────
  var searchBtn = document.getElementById('globalSearchBtn');
  var searchPanel = document.getElementById('globalSearchPanel');
  var searchInput = document.getElementById('globalSearchInput');
  var searchResults = document.getElementById('globalSearchResults');
  var _searchDebounce = null;

  function openSearchPanel() {
    searchPanel.classList.add('open');
    searchBtn.setAttribute('aria-expanded', 'true');
    searchInput.focus();
  }
  function closeSearchPanel() {
    searchPanel.classList.remove('open');
    searchBtn.setAttribute('aria-expanded', 'false');
  }
  function _renderSearchResults(results) {
    if (!results.length) {
      searchResults.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Không tìm thấy kết quả nào</div>';
      return;
    }
    var byCategory = {};
    var order = [];
    results.forEach(function (r) {
      if (!byCategory[r.category]) { byCategory[r.category] = []; order.push(r.category); }
      byCategory[r.category].push(r);
    });
    searchResults.innerHTML = order.map(function (cat) {
      var items = byCategory[cat].map(function (r) {
        return '<a href="' + r.url + '" class="nav-search-item">' + r.label + '</a>';
      }).join('');
      return '<div class="nav-search-group"><div class="nav-search-group-label">' + cat + '</div>' + items + '</div>';
    }).join('');
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (searchPanel.classList.contains('open')) closeSearchPanel(); else openSearchPanel();
    });
    searchInput.addEventListener('input', function () {
      clearTimeout(_searchDebounce);
      var q = searchInput.value.trim();
      if (!q) { searchResults.innerHTML = ''; return; }
      _searchDebounce = setTimeout(function () {
        searchResults.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px"><i class="fas fa-spinner fa-spin"></i></div>';
        var headers = window.AuthService ? window.AuthService.authHeader() : {};
        fetch(API + '/search?q=' + encodeURIComponent(q), { headers: headers })
          .then(function (r) { return r.json(); })
          .then(function (d) { _renderSearchResults(d.results || []); })
          .catch(function () {
            searchResults.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Lỗi tìm kiếm.</div>';
          });
      }, 300);
    });
    document.addEventListener('click', function (e) {
      if (!searchPanel.classList.contains('open')) return;
      if (searchPanel.contains(e.target) || searchBtn.contains(e.target)) return;
      closeSearchPanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearchPanel();
    });
  }

  // ── Notification bell ──────────────────────────────────────
  // Deliberately does NOT excludes/re-fetches on its own poll loop — the
  // badge count reuses the exact same /user/messages/unread-count response
  // _pollInboxBadge() already fetches every 20s for navInboxBadge, so this
  // is just a second showBadge() call, not a second network request. The
  // dropdown LIST (a different, richer payload) is fetched lazily, only
  // when the student actually opens the panel.
  var NOTIF_TYPE_ICON = { broadcast: '📢', reminder: '⏰', gift: '🎁', personal: '✉️' };
  var bellBtn = document.getElementById('globalBellBtn');
  var bellPanel = document.getElementById('globalBellPanel');
  var bellList = document.getElementById('globalBellList');
  var _bellLoaded = false;

  function _renderBellList(notifications) {
    if (!notifications.length) {
      bellList.innerHTML = '<div style="padding:28px 16px;text-align:center;color:var(--text3);font-size:13px">🔔<br><br>Chưa có thông báo nào</div>';
      return;
    }
    bellList.innerHTML = notifications.map(function (n) {
      var icon = NOTIF_TYPE_ICON[n.type] || '✉️';
      var subject = n.subject || (n.isBroadcast ? 'Thông báo chung' : 'Tin nhắn');
      var date = new Date(n.createdAt).toLocaleDateString('vi-VN');
      var unreadCls = !n.isRead ? ' unread' : '';
      var snippet = (n.body || '').replace(/\s+/g, ' ').trim();
      if (snippet.length > 80) snippet = snippet.slice(0, 80) + '…';
      return '<a href="inbox.html" class="nav-bell-item' + unreadCls + '">' +
        '<span class="nav-bell-icon">' + icon + '</span>' +
        '<span class="nav-bell-item-body">' +
          '<span class="nav-bell-item-subject">' + subject + '</span>' +
          '<span class="nav-bell-item-snippet">' + snippet + '</span>' +
          '<span class="nav-bell-item-date">' + date + '</span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  function _loadBellList() {
    bellList.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text3);font-size:13px"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
    var headers = window.AuthService ? window.AuthService.authHeader() : {};
    fetch(API + '/user/notifications?limit=15', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) { _renderBellList(d.notifications || []); })
      .catch(function () {
        bellList.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Không thể tải thông báo.</div>';
      });
  }

  function openBellPanel() {
    bellPanel.classList.add('open');
    bellBtn.setAttribute('aria-expanded', 'true');
    if (!_bellLoaded) { _bellLoaded = true; _loadBellList(); }
  }
  function closeBellPanel() {
    bellPanel.classList.remove('open');
    bellBtn.setAttribute('aria-expanded', 'false');
  }
  if (bellBtn) {
    bellBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (bellPanel.classList.contains('open')) closeBellPanel(); else openBellPanel();
    });
    document.addEventListener('click', function (e) {
      if (!bellPanel.classList.contains('open')) return;
      if (bellPanel.contains(e.target) || bellBtn.contains(e.target)) return;
      closeBellPanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeBellPanel();
    });
  }

  var token = window.AuthService ? window.AuthService.getToken() : localStorage.getItem('token');
  if (token) {
    var headers = window.AuthService ? window.AuthService.authHeader() : { Authorization: 'Bearer ' + token };

    // Inbox badge (teacher/admin messages + peer student-to-student chat,
    // see backend userMessageService.getUnreadCount) polls on an interval
    // instead of a single fetch on page load — previously a message that
    // arrived while the student was browsing never showed up on the
    // "Hộp thư" icon until the next full page load/navigation. Unconditional
    // showBadge() call (not gated on count > 0) so the badge also clears
    // itself once the student reads the message in another tab.
    var INBOX_POLL_MS = 20000;
    function _pollInboxBadge() {
      fetch(API + '/user/messages/unread-count', { headers: headers })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          showBadge('navInboxBadge', d.count || 0);
          showBadge('navBellBadge', d.count || 0);
        })
        .catch(function () {});
    }
    _pollInboxBadge();
    setInterval(_pollInboxBadge, INBOX_POLL_MS);

    fetch(API + '/writing/unread-feedback-count', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.count > 0) showBadge('navWritingBadge', d.count); })
      .catch(function () {});

    // Per-Task1/Task2 counts (unfinished drafts + unread graded feedback,
    // combined) for the "Writing" dropdown's own Task 1 / Task 2 rows —
    // navWritingBadge above only tells a student SOMETHING needs attention
    // under Writing; this tells them which of Task 1 / Task 2 it is.
    fetch(API + '/writing/practice/nav-counts', { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.success || !d.counts) return;
        showBadge('navWritingTask1Badge', d.counts[1] || 0);
        showBadge('navWritingTask2Badge', d.counts[2] || 0);
      })
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

    // Refresh plan silently and show expiry warning if needed.
    // AuthService.refreshPlan() centralizes the "hit /auth/me, touch
    // lastLoginAt, merge plan fields into the cached user" logic that used
    // to live only here — nav.js now just decides whether to show the
    // expiry banner from the result.
    if (window.AuthService) {
      window.AuthService.refreshPlan().then(function (u) {
        if (!u) return;
        if (u.plan === 'premium' && u.planExpiresAt) {
          var daysLeft = Math.ceil((new Date(u.planExpiresAt) - Date.now()) / 86400000);
          if (daysLeft >= 0 && daysLeft <= 7) _showExpiryBanner(daysLeft);
        }
        // Deliberately not sessionStorage-dismissed like the expiry banner —
        // the whole point is it keeps showing on every visit until an admin
        // clears studyReminderCount (student caught up on their work).
        if ((u.studyReminderCount || 0) >= 3) _showStudyWarningBanner(u.studyReminderCount);
        // Same escalation pattern, tuition side — auto-clears itself once
        // the student has no unpaid fees left (tuitionService.js), unlike
        // the study one above which needs an admin to manually reset it.
        if ((u.tuitionReminderCount || 0) >= 3) _showTuitionWarningBanner(u.tuitionReminderCount);

        if (u.role === 'student') _showStreak35Notice();
        if (u.role === 'student') _showVocabInactivityNotice(u.lastVocabStudyDate);
        if (u.role === 'student') _showDailyVocabGoalNudge();

        // Free-plan trial expired (24h from account creation, see
        // backend/utils/plan.js's hasFullAccess) — surface the paywall
        // proactively rather than waiting for the student to hit a locked
        // action. Every locked action already shows this same modal on its
        // own (reading-v2.js/listening.html/speaking.js/writing.js/
        // dashboard.js), so this is purely "tell them right away" on top.
        // planExpiresAt distinguishes the two copies: backend/middleware/
        // auth.js deliberately no longer clears it when downgrading an
        // expired premium account to free, so its presence here means
        // "this account WAS premium and it just lapsed" (renew copy)
        // rather than "this is a free account whose 24h trial ran out"
        // (trial-expired copy).
        if (u.role === 'student' && !window.AuthService.hasPremiumAccess(u)) {
          _showTrialExpiredModalOnce(0, u.planExpiresAt ? 'premium_expired' : 'trial_expired');
        }
      });
    }
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
    banner.style.cssText = 'position:fixed;top:var(--nav-height,64px);left:0;right:0;z-index:997;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;font-size:13px;font-weight:600;color:#fff;background:' + bg + ';box-shadow:0 2px 8px rgba(0,0,0,.15)';
    banner.innerHTML =
      '<span style="flex:1;text-align:center">' + msg + '</span>' +
      '<button type="button" onclick="if(window.openUpgradeModal)openUpgradeModal();else location.href=\'profile.html#plan\'" style="color:#fff;background:rgba(255,255,255,.25);border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-family:inherit;cursor:pointer;white-space:nowrap">Gia hạn</button>' +
      '<button style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;flex-shrink:0" title="Đóng">&times;</button>';
    document.body.insertBefore(banner, document.getElementById('globalTopNav').nextSibling);

    // A fixed-position banner would otherwise sit on top of whatever the
    // page renders just below the nav (question cards, page headers, ...).
    // Reserve real space for it — same idea as --nav-height/has-global-nav
    // above — measured rather than hardcoded since the message wraps to
    // two lines on narrow screens.
    function applyOffset() {
      document.documentElement.style.setProperty('--expiry-banner-height', banner.offsetHeight + 'px');
    }
    applyOffset();
    window.addEventListener('resize', applyOffset);

    banner.querySelector('button').addEventListener('click', function () {
      sessionStorage.setItem('expiry-banner-dismissed', '1');
      window.removeEventListener('resize', applyOffset);
      document.documentElement.style.removeProperty('--expiry-banner-height');
      banner.remove();
    });
  }

  // Student has been poked by an admin (missing vocab practice / incomplete
  // homework) 3+ times — see routes/admin/users.js's POST /:id/remind.
  // Fixed + reuses the SAME --expiry-banner-height var the premium-expiry
  // banner (and a dozen page-specific stylesheets' sticky-header/padding
  // rules) already read, additively, rather than introducing a second CSS
  // var nothing else would know to account for. If the expiry banner is
  // also showing, this stacks directly below it. No dismiss-persistence on
  // purpose — closing it only hides it for this page view; it reappears on
  // the next page load until an admin resets the counter.
  function _showStudyWarningBanner(count) {
    var baseOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--expiry-banner-height')) || 0;
    var banner = document.createElement('div');
    banner.id = 'nav-study-warning-banner';
    banner.style.cssText = 'position:fixed;top:calc(var(--nav-height,64px) + ' + baseOffset + 'px);left:0;right:0;z-index:996;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(90deg,#b91c1c,#dc2626);box-shadow:0 2px 8px rgba(0,0,0,.15)';
    banner.innerHTML =
      '<span style="flex:1;text-align:center">⚠️ Bạn đã bị nhắc nhở <strong>' + count + ' lần</strong> về việc học từ vựng / làm bài tập chưa đầy đủ. Hãy chăm chỉ ôn tập nhé!</span>' +
      '<a href="inbox.html" style="color:#fff;background:rgba(255,255,255,.25);border-radius:6px;padding:4px 10px;text-decoration:none;font-size:12px;white-space:nowrap">Xem hộp thư</a>' +
      '<button style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;flex-shrink:0" title="Đóng">&times;</button>';
    var afterEl = document.getElementById('nav-expiry-banner') || document.getElementById('globalTopNav');
    document.body.insertBefore(banner, afterEl.nextSibling);

    function applyOffset() {
      document.documentElement.style.setProperty('--expiry-banner-height', (baseOffset + banner.offsetHeight) + 'px');
    }
    applyOffset();
    window.addEventListener('resize', applyOffset);

    banner.querySelector('button').addEventListener('click', function () {
      window.removeEventListener('resize', applyOffset);
      document.documentElement.style.setProperty('--expiry-banner-height', baseOffset + 'px');
      banner.remove();
    });
  }

  // Tuition-payment counterpart to _showStudyWarningBanner above — same
  // stacking mechanism (reads the current --expiry-banner-height so it
  // lands below any banner already showing), separate wording/link since
  // "you've been reminded about unpaid tuition" must not be confused with
  // the study-reminder banner's "practice more vocab/exercises" message.
  function _showTuitionWarningBanner(count) {
    var baseOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--expiry-banner-height')) || 0;
    var banner = document.createElement('div');
    banner.id = 'nav-tuition-warning-banner';
    banner.style.cssText = 'position:fixed;top:calc(var(--nav-height,64px) + ' + baseOffset + 'px);left:0;right:0;z-index:996;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(90deg,#b45309,#d97706);box-shadow:0 2px 8px rgba(0,0,0,.15)';
    banner.innerHTML =
      '<span style="flex:1;text-align:center">💰 Bạn đã được nhắc <strong>' + count + ' lần</strong> về học phí chưa thanh toán. Vui lòng kiểm tra và xác nhận chuyển khoản nhé!</span>' +
      '<a href="tuition.html" style="color:#fff;background:rgba(255,255,255,.25);border-radius:6px;padding:4px 10px;text-decoration:none;font-size:12px;white-space:nowrap">Xem học phí</a>' +
      '<button style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;flex-shrink:0" title="Đóng">&times;</button>';
    var afterEl = document.getElementById('nav-study-warning-banner') || document.getElementById('nav-expiry-banner') || document.getElementById('globalTopNav');
    document.body.insertBefore(banner, afterEl.nextSibling);

    function applyOffset() {
      document.documentElement.style.setProperty('--expiry-banner-height', (baseOffset + banner.offsetHeight) + 'px');
    }
    applyOffset();
    window.addEventListener('resize', applyOffset);

    banner.querySelector('button').addEventListener('click', function () {
      window.removeEventListener('resize', applyOffset);
      document.documentElement.style.setProperty('--expiry-banner-height', baseOffset + 'px');
      banner.remove();
    });
  }

  // One-time popup explaining the new "35 words/day" streak-eligibility
  // rule (backend: streakBonusService.reachedDailyWordThreshold) — added
  // after several students were farming the streak by saving a single
  // throwaway vocab word a day. Shown once ever per browser (localStorage,
  // not sessionStorage — this is an announcement, not a per-visit warning)
  // to every logged-in student.
  // Guards against stacking on top of learning-popups.js's goal-setup/
  // today's-plan modal (js/learning-popups.js's #lp-overlay, fired from
  // dashboard.js's own independent async chain around the same page
  // load) — both are full-screen one-time-ever/once-a-day overlays with
  // no shared coordinator, so without this a student could see this
  // notice's "Đã hiểu" button visibly stacked behind the goal modal.
  // Safe to just skip rather than queue: neither notice below marks
  // itself as "seen" unless it actually renders, so it simply tries
  // again on the student's next page load instead.
  function _learningModalOpen() {
    var el = document.getElementById('lp-overlay');
    return !!(el && el.classList.contains('open'));
  }

  var STREAK35_NOTICE_KEY = 'ews_seen_streak35_notice';
  function _showStreak35Notice() {
    if (localStorage.getItem(STREAK35_NOTICE_KEY)) return;
    if (_learningModalOpen()) return;

    var overlay = document.createElement('div');
    overlay.id = 'nav-streak35-notice-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    overlay.innerHTML =
      '<div style="background:var(--surface,#fff);color:var(--text,#111827);border-radius:16px;max-width:420px;width:100%;padding:28px 24px;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,.3)">' +
        '<div style="font-size:44px;margin-bottom:10px">🔥📖</div>' +
        '<h3 style="font-size:18px;font-weight:800;margin-bottom:10px">Cập nhật cơ chế giữ chuỗi lửa 🔥</h3>' +
        '<p style="font-size:14px;color:var(--text2,#6b7280);line-height:1.65;margin-bottom:18px;text-align:left">' +
          'Để chuỗi lửa phản ánh đúng việc học thật, từ nay mỗi ngày bạn cần <strong>học đủ số từ vựng mục tiêu trong ngày</strong> ' +
          '(mặc định 35 từ, tăng dần theo band mục tiêu bạn đặt ở Hồ sơ: 6.0 → 50 từ, 7.0 → 70 từ). ' +
          'Tính gộp: thêm từ mới, đổi trạng thái ôn từ, hoặc làm quiz từ vựng trong ngày.' +
        '</p>' +
        '<button id="nav-streak35-notice-close" style="background:var(--brand,#e53935);color:#fff;border:none;border-radius:8px;padding:10px 28px;font-size:14px;font-weight:700;cursor:pointer">Đã hiểu</button>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('nav-streak35-notice-close').addEventListener('click', function () {
      localStorage.setItem(STREAK35_NOTICE_KEY, '1');
      overlay.remove();
    });
  }

  // Nudges a student who's gone quiet on vocab specifically — lastVocabStudyDate
  // (set in vocabBookService.completePractice, see backend/models/User.js) is
  // vocab-only, unlike the shared lastActivityDate a Reading/Listening test
  // also bumps, so this can catch a real vocab gap even when the overall
  // streak looks healthy. Re-shown once per calendar day (not once-ever like
  // the streak35 notice above) for as long as the gap persists — sessionStorage
  // would refire every tab/page nav, localStorage keyed by today's date lets it
  // reappear tomorrow without spamming this same session/day.
  var VOCAB_INACTIVITY_DAYS = 2; // "2 ngày liên tục" per the product ask
  var VOCAB_INACTIVITY_SHOWN_KEY = 'ews_vocab_inactivity_shown_date';
  function _showVocabInactivityNotice(lastVocabStudyDate) {
    // No vocab practice yet at all (brand-new student) — that's not "long
    // time no study", it's "never started"; a different nudge, not this one.
    if (!lastVocabStudyDate) return;
    var daysSince = Math.floor((Date.now() - new Date(lastVocabStudyDate).getTime()) / 86400000);
    if (daysSince < VOCAB_INACTIVITY_DAYS) return;

    var todayStr = new Date().toDateString();
    if (localStorage.getItem(VOCAB_INACTIVITY_SHOWN_KEY) === todayStr) return;
    if (_learningModalOpen()) return;
    localStorage.setItem(VOCAB_INACTIVITY_SHOWN_KEY, todayStr);

    var overlay = document.createElement('div');
    overlay.id = 'nav-vocab-inactivity-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    overlay.innerHTML =
      '<div style="background:var(--surface,#fff);color:var(--text,#111827);border-radius:16px;max-width:400px;width:100%;padding:28px 24px;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,.3)">' +
        '<div style="font-size:44px;margin-bottom:10px">📖😴</div>' +
        '<h3 style="font-size:18px;font-weight:800;margin-bottom:10px">Đã ' + daysSince + ' ngày bạn chưa học từ vựng!</h3>' +
        '<p style="font-size:14px;color:var(--text2,#6b7280);line-height:1.65;margin-bottom:18px">' +
          'Ôn tập đều đặn giúp bạn nhớ từ lâu hơn. Chọn một sổ từ vựng và học ngay nào!' +
        '</p>' +
        '<div style="display:flex;gap:10px;justify-content:center">' +
          '<button id="nav-vocab-inactivity-later" style="background:var(--surface2,#f3f4f6);color:var(--text,#111827);border:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Để sau</button>' +
          '<button id="nav-vocab-inactivity-go" style="background:var(--brand,#e53935);color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Học ngay</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('nav-vocab-inactivity-later').addEventListener('click', function () {
      overlay.remove();
    });
    // dashboard.html is the vocab-book page itself (list of the student's own
    // sổ) — navigating there (rather than deep-linking into a specific book)
    // is deliberate: the student picks which sổ to study, per the product ask.
    document.getElementById('nav-vocab-inactivity-go').addEventListener('click', function () {
      overlay.remove();
      location.href = '/dashboard.html';
    });
  }

  // Daily vocab-goal nudge — a small floating card shown on EVERY page load
  // while the student hasn't hit today's word target (which scales with
  // their IELTS target band: backend streakBonusService.dailyWordTargetForBand,
  // GET /api/vocabbook/daily-goal). Not persistence-dismissed on purpose:
  // "nếu chưa học đủ thì liên tục nhắc nhở mỗi lần truy cập". Non-blocking
  // (not a full-screen modal) so it can appear that often without being
  // hostile.
  function _showDailyVocabGoalNudge() {
    if (!window.AuthService) return;
    if (document.getElementById('nav-vocab-goal-nudge')) return;
    // Don't pile on top of a blocking overlay this load — it re-checks next load.
    if (_learningModalOpen()
      || document.getElementById('nav-vocab-inactivity-overlay')
      || document.getElementById('nav-streak35-notice-overlay')) return;

    fetch(API + '/vocabbook/daily-goal', { headers: window.AuthService.authHeader() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.success || typeof d.target !== 'number') return;

        if (d.met) {
          // Small positive confirmation, once per browser session.
          if (sessionStorage.getItem('ews_vocab_goal_done_toast')) return;
          sessionStorage.setItem('ews_vocab_goal_done_toast', '1');
          _renderVocabGoalCard({ done: true, target: d.target });
          return;
        }
        _renderVocabGoalCard({ done: false, target: d.target, studied: d.studied || 0, remaining: d.remaining });
      })
      .catch(function () {});
  }

  function _renderVocabGoalCard(o) {
    if (document.getElementById('nav-vocab-goal-nudge')) return;
    var pct = o.target ? Math.min(100, Math.round((o.studied || (o.done ? o.target : 0)) / o.target * 100)) : 0;
    var card = document.createElement('div');
    card.id = 'nav-vocab-goal-nudge';
    card.style.cssText = [
      'position:fixed', 'right:20px', 'bottom:92px', 'z-index:1049',
      'width:300px', 'max-width:calc(100vw - 32px)',
      'background:var(--surface,#fff)', 'color:var(--text,#111827)',
      'border:1px solid var(--border,#e5e7eb)', 'border-radius:14px',
      'box-shadow:0 12px 34px rgba(0,0,0,.18)', 'padding:14px 16px',
      'font-family:inherit', 'transform:translateY(12px)', 'opacity:0',
      'transition:opacity .25s ease, transform .25s ease'
    ].join(';');

    if (o.done) {
      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<span style="font-size:22px">✅</span>' +
          '<div style="font-size:13.5px;line-height:1.5">Bạn đã học đủ <strong>' + o.target + ' từ vựng</strong> hôm nay. Giữ phong độ nhé! 🔥</div>' +
        '</div>';
      document.body.appendChild(card);
      requestAnimationFrame(function () { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; });
      setTimeout(function () {
        card.style.opacity = '0'; card.style.transform = 'translateY(12px)';
        setTimeout(function () { card.remove(); }, 300);
      }, 4000);
      return;
    }

    card.innerHTML =
      '<button aria-label="Đóng" style="position:absolute;top:6px;right:8px;background:none;border:none;font-size:16px;line-height:1;color:var(--text3,#9ca3af);cursor:pointer;padding:4px">&times;</button>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<span style="font-size:20px">📖</span>' +
        '<div style="font-size:14px;font-weight:800">Từ vựng hôm nay</div>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--text2,#6b7280);line-height:1.55;margin-bottom:10px">' +
        'Mục tiêu <strong style="color:var(--text,#111827)">' + o.target + ' từ</strong> — bạn đã học ' +
        '<strong style="color:var(--text,#111827)">' + o.studied + '/' + o.target + '</strong>, còn <strong style="color:var(--brand,#e53935)">' + o.remaining + ' từ</strong>.' +
      '</div>' +
      '<div style="height:7px;background:var(--surface2,#f3f4f6);border-radius:99px;overflow:hidden;margin-bottom:12px">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#f59e0b,#e53935);border-radius:99px"></div>' +
      '</div>' +
      '<button id="nav-vocab-goal-go" style="width:100%;background:var(--brand,#e53935);color:#fff;border:none;border-radius:9px;padding:10px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit">Học ngay</button>';

    document.body.appendChild(card);
    requestAnimationFrame(function () { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; });

    card.querySelector('button[aria-label="Đóng"]').addEventListener('click', function () {
      card.style.opacity = '0'; card.style.transform = 'translateY(12px)';
      setTimeout(function () { card.remove(); }, 250);
    });
    card.querySelector('#nav-vocab-goal-go').addEventListener('click', function () {
      location.href = '/dashboard.html';
    });
  }

  // Free-plan trial expired — shows the shared upgrade paywall
  // (js/upgrade-modal.js) once per browser session (sessionStorage, not
  // localStorage — a JWT session can persist across many days/browser
  // restarts without a real re-login, so "once per session" is the closest
  // practical proxy to "once per login" without spamming the modal on
  // every single page navigation within one sitting).
  var TRIAL_EXPIRED_SHOWN_KEY = 'ews_trial_expired_shown';
  function _showTrialExpiredModalOnce(attempt, reason) {
    if (sessionStorage.getItem(TRIAL_EXPIRED_SHOWN_KEY)) return;
    if (typeof window.openUpgradeModal !== 'function') {
      // Defense-in-depth: correctness normally comes from upgrade-modal.js
      // loading before nav.js in every page's <script> order, but a future
      // page that gets that order wrong shouldn't silently lose this modal
      // (the sessionStorage flag below is also deliberately NOT set until
      // this actually succeeds) — retry briefly instead of giving up.
      attempt = attempt || 0;
      if (attempt < 20) setTimeout(function () { _showTrialExpiredModalOnce(attempt + 1, reason); }, 100);
      return;
    }
    sessionStorage.setItem(TRIAL_EXPIRED_SHOWN_KEY, '1');
    window.openUpgradeModal(reason || 'trial_expired');
  }
})();
