/**
 * shared/battle-invites.js — "⚔️ … thách đấu bạn!" popup on every page.
 *
 * A classmate challenged this student in the Đấu trường từ vựng
 * (/app/vocab-battle, backend/services/vocabBattleService.js). Every page
 * polls GET /api/vocab-battle/invites (~10 s while in front) and pops each
 * new invite up with "Vào trận ngay" (accept → the room) / "Từ chối" /
 * "Để sau" (still waiting on the Đấu trường page + Hộp thư).
 *
 * Doing a test: listening.js / listening-practice.js / reading-v2.js call
 * EwdActivity.set({ skill: 'listening'|'reading', mode: 'practice'|'simulation' })
 * when a test screen opens and EwdActivity.set(null) when it closes. The
 * poll reports it (?act=…&mode=…) so the inviter is warned first
 * (services/presenceService.js), and during an exam-mode (simulation) test
 * — in any tab — no popup shows: it waits until the test is over. During a
 * practice test the popup shows, and "Vào trận" opens the room in a new tab
 * so the test stays open.
 */
(function () {
  'use strict';
  if (window.EwdActivity) return;

  var POLL_MS = 10000;
  var HIDDEN_POLL_MS = 30000;   // a hidden tab only polls to keep "mid-test" fresh
  var SHARED_KEY = 'ewdTestActivity';  // { skill, mode, at } — the tab that's mid-test
  var SHARED_TTL = 45000;
  var SEEN_KEY = 'vbInviteSeen';

  var _activity = null;   // this tab's test, if any
  var _sentNone = true;   // already told the server this tab is not mid-test
  var _queue = [];
  var _showing = null;
  var _seenMem = {};

  function _me() {
    try {
      var A = window.AuthService;
      if (!A || !A.getToken || !A.getToken()) return null;
      var u = A.getUser ? A.getUser() : null;
      return u && u.role === 'student' ? u : null;
    } catch (e) { return null; }
  }
  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function _api(path, opts) {
    var A = window.AuthService;
    return fetch((A.API || '') + path, Object.assign({}, opts || {}, {
      headers: Object.assign({ 'Content-Type': 'application/json' }, A.authHeader()),
    })).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (d) {
        if (!res.ok) { var e = new Error(d.message || ('HTTP ' + res.status)); e.code = d.code; throw e; }
        return d;
      });
    });
  }

  // ── what this student is doing ──────────────────────────────
  function _readShared() {
    try {
      var s = JSON.parse(localStorage.getItem(SHARED_KEY) || 'null');
      return s && Date.now() - (s.at || 0) < SHARED_TTL ? s : null;
    } catch (e) { return null; }
  }
  function _writeShared() {
    try {
      if (_activity) localStorage.setItem(SHARED_KEY, JSON.stringify({ skill: _activity.skill, mode: _activity.mode, at: Date.now() }));
    } catch (e) { /* ignore */ }
  }
  function _clearShared() {
    try { localStorage.removeItem(SHARED_KEY); } catch (e) { /* ignore */ }
  }
  // Exam mode in this tab or another one → popups wait
  function _quiet() {
    if (_activity && _activity.mode === 'simulation') return true;
    var s = _readShared();
    return !!(s && s.mode === 'simulation');
  }

  function setActivity(a) {
    var next = a && (a.skill === 'listening' || a.skill === 'reading')
      ? { skill: a.skill, mode: a.mode === 'simulation' ? 'simulation' : 'practice' } : null;
    var same = (!next && !_activity) || (next && _activity && next.skill === _activity.skill && next.mode === _activity.mode);
    var had = !!_activity;
    _activity = next;
    if (next) { _sentNone = false; _writeShared(); } else if (had) { _clearShared(); }
    if (next && next.mode === 'simulation') _hideCard(true);
    if (!same) _poll();
    else if (!next) _next();
  }

  // ── seen invites (never pop the same one up twice) ─────────
  function _seen(id) {
    if (_seenMem[id]) return true;
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]').indexOf(id) >= 0; } catch (e) { return false; }
  }
  function _markSeen(id) {
    _seenMem[id] = true;
    try {
      var l = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]').filter(function (x) { return x !== id; });
      l.push(id);
      localStorage.setItem(SEEN_KEY, JSON.stringify(l.slice(-40)));
    } catch (e) { /* the in-memory copy still stops a repeat on this page */ }
  }

  function _unmarkSeen(id) {
    delete _seenMem[id];
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]').filter(function (x) { return x !== id; })));
    } catch (e) { /* ignore */ }
  }

  // ── the card ────────────────────────────────────────────────
  function _style() {
    if (document.getElementById('vbi-style')) return;
    var s = document.createElement('style');
    s.id = 'vbi-style';
    s.textContent =
      '#vbi-card{position:fixed;left:50%;top:76px;transform:translateX(-50%);z-index:2147482100;width:380px;max-width:calc(100vw - 32px);box-sizing:border-box;' +
      'background:#fff;border:2px solid #f59e0b;border-radius:18px;box-shadow:0 22px 60px rgba(120,53,15,.32);padding:16px 16px 14px;' +
      'font-family:inherit;animation:vbiIn .38s cubic-bezier(.34,1.56,.64,1)}' +
      '#vbi-card .vbi-top{display:flex;gap:12px;align-items:flex-start}' +
      '#vbi-card .vbi-av{width:44px;height:44px;border-radius:50%;flex:none;background:#fde68a;color:#92400e;display:flex;align-items:center;' +
      'justify-content:center;font-weight:800;font-size:16px;overflow:hidden;position:relative}' +
      '#vbi-card .vbi-av img{width:100%;height:100%;object-fit:cover}' +
      '#vbi-card .vbi-av .vbi-sw{position:absolute;right:-4px;bottom:-4px;font-size:18px}' +
      '#vbi-card .vbi-title{font-weight:800;font-size:15px;color:#1f2937;line-height:1.35}' +
      '#vbi-card .vbi-sub{font-size:13px;color:#4b5563;margin-top:4px;line-height:1.45}' +
      '#vbi-card .vbi-bet{display:inline-block;margin-top:6px;padding:2px 9px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700}' +
      '#vbi-card .vbi-x{margin-left:auto;background:none;border:0;color:#9ca3af;font-size:20px;cursor:pointer;line-height:1;padding:0 2px}' +
      '#vbi-card .vbi-btns{display:flex;gap:8px;margin-top:14px}' +
      '#vbi-card .vbi-btns button{border-radius:11px;padding:10px 10px;font-weight:700;font-size:13px;cursor:pointer;border:1px solid transparent;font-family:inherit}' +
      '#vbi-card .vbi-yes{flex:2;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff}' +
      '#vbi-card .vbi-yes:disabled{opacity:.6;cursor:wait}' +
      '#vbi-card .vbi-no,#vbi-card .vbi-later{flex:1;background:#f3f4f6;color:#374151;border-color:#e5e7eb!important}' +
      '#vbi-card .vbi-note{font-size:12px;color:#6b7280;margin-top:8px}' +
      '[data-theme="dark"] #vbi-card{background:#1f2433;border-color:#b45309}' +
      '[data-theme="dark"] #vbi-card .vbi-title{color:#fef3c7}' +
      '[data-theme="dark"] #vbi-card .vbi-sub,[data-theme="dark"] #vbi-card .vbi-note{color:#cbd5e1}' +
      '[data-theme="dark"] #vbi-card .vbi-bet{background:#3b2a12;color:#fcd34d}' +
      '[data-theme="dark"] #vbi-card .vbi-no,[data-theme="dark"] #vbi-card .vbi-later{background:#2b3144;color:#e5e7eb;border-color:#3b4256!important}' +
      '@keyframes vbiIn{from{transform:translate(-50%,-24px) scale(.94);opacity:0}to{transform:translateX(-50%);opacity:1}}' +
      '@media (max-width:600px){#vbi-card{top:64px}}';
    document.head.appendChild(s);
  }

  function _initials(name) {
    var w = String(name || '?').trim().split(/\s+/);
    return ((w[0] || '?')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
  }

  // requeue: an exam started while it was open — show it again afterwards
  function _hideCard(requeue) {
    var el = document.getElementById('vbi-card');
    if (el) el.remove();
    if (requeue && _showing) { _unmarkSeen(_showing.id); _queue.unshift(_showing); }
    _showing = null;
  }
  function _close() {
    _hideCard(false);
    setTimeout(_next, 250);
  }

  function _onRoom(id) {
    return location.pathname.replace(/\/+$/, '') === '/app/vocab-battle/' + id;
  }
  function _roomUrl(id) { return '/app/vocab-battle/' + encodeURIComponent(id); }

  function _next() {
    if (_showing || !document.body) return;
    while (_queue.length) {
      if (_quiet()) return;
      var inv = _queue.shift();
      if (_seen(inv.id) || _onRoom(inv.id) || (inv.expiresAt && new Date(inv.expiresAt) <= new Date())) continue;
      _show(inv);
      return;
    }
  }

  function _show(inv) {
    _style();
    _showing = inv;
    _markSeen(inv.id);
    var el = document.createElement('div');
    el.id = 'vbi-card';
    el.setAttribute('role', 'alertdialog');
    el.setAttribute('aria-live', 'assertive');
    var others = (inv.others || []).filter(Boolean);
    var av = inv.fromAvatar
      ? '<img src="' + _esc(inv.fromAvatar) + '" alt="" onerror="this.remove()">'
      : _esc(_initials(inv.fromName));
    var testOpen = !!_activity;
    el.innerHTML =
      '<div class="vbi-top"><div class="vbi-av">' + av + '<span class="vbi-sw">⚔️</span></div><div>' +
        '<div class="vbi-title">' + _esc(inv.fromName) + ' thách đấu từ vựng với bạn!</div>' +
        '<div class="vbi-sub">' + (inv.kind === 'chain' ? '🔗 ' : '🧠 ') + _esc(inv.game) +
          (others.length ? '<br>Cùng đấu: ' + _esc(others.slice(0, 3).join(', ')) : '') + '</div>' +
        '<span class="vbi-bet">' + (inv.stake ? 'Cược ' + inv.stake + ' 🔥 — thắng ẵm cả pot' : 'Giao hữu — thắng được 🔥') + '</span>' +
      '</div><button type="button" class="vbi-x" aria-label="Đóng">×</button></div>' +
      '<div class="vbi-btns">' +
        '<button type="button" class="vbi-no">Từ chối</button>' +
        '<button type="button" class="vbi-later">Để sau</button>' +
        '<button type="button" class="vbi-yes">⚔️ Vào trận ngay' + (inv.stake ? ' (' + inv.stake + ' 🔥)' : '') + '</button>' +
      '</div>' +
      (testOpen ? '<div class="vbi-note">Trận mở ở tab mới — bài đang làm vẫn giữ nguyên.</div>' : '');
    document.body.appendChild(el);
    try { if (typeof window.playOk === 'function' && (!window.isSoundEnabled || window.isSoundEnabled())) window.playOk(); } catch (e) { /* ignore */ }

    el.querySelector('.vbi-x').onclick = _close;
    el.querySelector('.vbi-later').onclick = function () {
      if (window.showToast) window.showToast('Lời mời vẫn chờ ở BXH vocab → ⚔️ Đấu trường.', 'info');
      _close();
    };
    el.querySelector('.vbi-no').onclick = function () {
      _api('/vocab-battle/' + encodeURIComponent(inv.id) + '/decline', { method: 'POST' }).catch(function () {});
      _close();
    };
    el.querySelector('.vbi-yes').onclick = function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Đang vào…';
      // Mid-test: open the room beside it (opened now, while the click still counts)
      var win = _activity ? window.open('', '_blank') : null;
      _api('/vocab-battle/' + encodeURIComponent(inv.id) + '/accept', { method: 'POST' }).then(function () {
        _close();
        var url = _roomUrl(inv.id);
        if (win) { win.location.href = url; return; }
        if (/^\/app(\/|$)/.test(location.pathname) && window.ewsNavigate) window.ewsNavigate(url.slice('/app'.length));
        else window.location.href = url;
      }).catch(function (e) {
        if (win) win.close();
        if (window.showToast) window.showToast(e.message || 'Lời mời đã hết hạn', 'warn');
        _close();
      });
    };
  }

  function _handle(list) {
    (list || []).forEach(function (inv) {
      if (!inv || !inv.id || _seen(inv.id)) return;
      if (_showing && _showing.id === inv.id) return;
      if (_queue.some(function (q) { return q.id === inv.id; })) return;
      _queue.push(inv);
    });
    _next();
  }

  // ── polling ─────────────────────────────────────────────────
  var _busy = false;
  var _again = false;   // the test started/ended while a poll was out → report it right after
  var _lastPoll = 0;
  function _poll() {
    if (!_me()) return;
    if (_busy) { _again = true; return; }
    _busy = true;
    _again = false;
    _lastPoll = Date.now();
    var q = '';
    if (_activity) { q = '?act=' + _activity.skill + '&mode=' + _activity.mode; _writeShared(); }
    else if (!_sentNone) q = '?act=none';
    var sentNone = !_activity;
    _api('/vocab-battle/invites' + q).then(function (d) {
      if (sentNone && !_activity) _sentNone = true;
      _handle(d.invites);
    }).catch(function () { /* retry next tick */ }).then(function () {
      _busy = false;
      if (_again) _poll();
    });
  }

  function _tick() {
    var hidden = document.visibilityState === 'hidden';
    if (hidden && !_activity) return;
    if (Date.now() - _lastPoll >= (hidden ? HIDDEN_POLL_MS : POLL_MS) - 500) _poll();
  }

  window.EwdActivity = {
    set: setActivity,
    get: function () { return _activity; },
    check: _poll,
  };

  if (!_me()) return;
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { _poll(); _next(); }
  });
  // The exam tab ended its test → this one may show what waited
  window.addEventListener('storage', function (e) { if (e.key === SHARED_KEY) _next(); });
  // Leaving mid-test (closing the tab, going elsewhere): no longer mid-test
  window.addEventListener('pagehide', function () {
    if (!_activity) return;
    _clearShared();
    try {
      var A = window.AuthService;
      fetch((A.API || '') + '/vocab-battle/invites?act=none', { keepalive: true, headers: A.authHeader() }).catch(function () {});
    } catch (e) { /* ignore */ }
  });
  setInterval(_tick, 2000);
  // After the page's own first requests
  setTimeout(_poll, 1500);
})();
