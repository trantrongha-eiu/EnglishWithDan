/**
 * shared/cowrite-invites.js — "Mời bạn viết cùng" invite popup.
 *
 * A classmate on the Task 2 writer (task2-practice.html) invited this
 * student to write the same lesson together (backend/services/
 * task2CoWriteService.js). Invites arrive with peer-chat-widget.js's 20s
 * every-page poll (GET /user/peer/conversations → cowriteInvites), which
 * calls CowriteInvites.handle(list). The writer page also polls faster via
 * CowriteInvites.check() so an invite in class shows up within seconds.
 *
 * Accept → POST /task2/cowrite/room/:id/accept, then open the writer for
 * that lesson (or, if the page registered window.T2CoWriteJoined and is
 * already on it, let the page join in place).
 */
(function () {
  'use strict';
  if (window.CowriteInvites) return;

  var _seen = {};       // roomId|invitedAt → true once shown (or answered)
  var _queue = [];
  var _showing = null;

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  async function _api(path, opts) {
    var A = window.AuthService;
    var res = await fetch((A.API || '') + path, Object.assign({}, opts || {}, {
      headers: Object.assign({ 'Content-Type': 'application/json' }, A.authHeader())
    }));
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
    return data;
  }

  function _style() {
    if (document.getElementById('cwi-style')) return;
    var s = document.createElement('style');
    s.id = 'cwi-style';
    s.textContent =
      '#cwi-card{position:fixed;right:20px;bottom:96px;z-index:2147482000;width:330px;max-width:calc(100vw - 32px);' +
      'background:#fff;border:1px solid #c7d2fe;border-radius:16px;box-shadow:0 18px 50px rgba(30,27,75,.25);padding:14px 16px 14px;' +
      'font-family:inherit;animation:cwiIn .3s cubic-bezier(.34,1.56,.64,1)}' +
      '#cwi-card .cwi-top{display:flex;gap:10px;align-items:flex-start}' +
      '#cwi-card .cwi-ic{font-size:26px;line-height:1}' +
      '#cwi-card .cwi-title{font-weight:800;font-size:14px;color:#1e1b4b;line-height:1.35}' +
      '#cwi-card .cwi-sub{font-size:13px;color:#4b5563;margin-top:3px;line-height:1.4}' +
      '#cwi-card .cwi-x{margin-left:auto;background:none;border:0;color:#9ca3af;font-size:18px;cursor:pointer;line-height:1;padding:0 2px}' +
      '#cwi-card .cwi-btns{display:flex;gap:8px;margin-top:12px}' +
      '#cwi-card .cwi-btns button{flex:1;border-radius:10px;padding:9px 10px;font-weight:700;font-size:13px;cursor:pointer;border:1px solid transparent}' +
      '#cwi-card .cwi-yes{background:#4f46e5;color:#fff}' +
      '#cwi-card .cwi-yes:disabled{opacity:.6;cursor:wait}' +
      '#cwi-card .cwi-no{background:#f3f4f6;color:#374151;border-color:#e5e7eb!important}' +
      '[data-theme="dark"] #cwi-card{background:#1f2433;border-color:#3730a3}' +
      '[data-theme="dark"] #cwi-card .cwi-title{color:#e0e7ff}' +
      '[data-theme="dark"] #cwi-card .cwi-sub{color:#cbd5e1}' +
      '[data-theme="dark"] #cwi-card .cwi-no{background:#2b3144;color:#e5e7eb;border-color:#3b4256!important}' +
      '@keyframes cwiIn{from{transform:translateY(16px) scale(.96);opacity:0}to{transform:none;opacity:1}}' +
      '@media (max-width:600px){#cwi-card{right:16px;left:16px;width:auto;bottom:84px}}';
    document.head.appendChild(s);
  }

  function _key(inv) { return inv.roomId + '|' + (inv.invitedAt || ''); }

  function _close() {
    var el = document.getElementById('cwi-card');
    if (el) el.remove();
    _showing = null;
    _next();
  }

  function _next() {
    if (_showing || !_queue.length) return;
    _show(_queue.shift());
  }

  function _show(inv) {
    _style();
    _showing = inv;
    var el = document.createElement('div');
    el.id = 'cwi-card';
    el.setAttribute('role', 'alertdialog');
    el.setAttribute('aria-live', 'assertive');
    var others = (inv.joined || []).filter(function (n) { return n && n !== inv.fromName; });
    el.innerHTML =
      '<div class="cwi-top"><div class="cwi-ic">👥</div><div>' +
        '<div class="cwi-title">' + _esc(inv.fromName || 'Một bạn') + ' mời bạn viết cùng</div>' +
        '<div class="cwi-sub">' + _esc(inv.topicEmoji || '📝') + ' ' + _esc(inv.topicName) +
          (others.length ? '<br>Cùng nhóm: ' + _esc(others.slice(0, 3).join(', ')) + (others.length > 3 ? '…' : '') : '') +
        '</div>' +
      '</div><button type="button" class="cwi-x" aria-label="Đóng">×</button></div>' +
      '<div class="cwi-btns"><button type="button" class="cwi-no">Từ chối</button><button type="button" class="cwi-yes">Tham gia viết</button></div>';
    document.body.appendChild(el);

    el.querySelector('.cwi-x').onclick = _close;
    el.querySelector('.cwi-no').onclick = function () {
      _api('/task2/cowrite/room/' + encodeURIComponent(inv.roomId) + '/decline', { method: 'POST' }).catch(function () {});
      _close();
    };
    el.querySelector('.cwi-yes').onclick = async function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Đang vào…';
      try {
        var d = await _api('/task2/cowrite/room/' + encodeURIComponent(inv.roomId) + '/accept', { method: 'POST' });
        var topicId = String(d.topicId || inv.topicId);
        if (typeof window.T2CoWriteJoined === 'function' && window.T2CoWriteJoined(topicId)) { _close(); return; }
        var q = new URLSearchParams({ topicId: topicId, write: '1' });
        if (inv.week) q.set('week', String(inv.week));
        window.location.href = '/task2-practice.html?' + q.toString();
      } catch (e) {
        if (window.showToast) window.showToast(e.message || 'Lời mời đã hết hạn', 'warn');
        _close();
      }
    };
  }

  function handle(list) {
    (list || []).forEach(function (inv) {
      var k = _key(inv);
      if (_seen[k]) return;
      _seen[k] = true;
      _queue.push(inv);
    });
    _next();
  }

  var _checking = false;
  async function check() {
    if (_checking || !window.AuthService || !window.AuthService.isLoggedIn()) return;
    _checking = true;
    try { handle((await _api('/task2/cowrite/invites')).invites); } catch (e) { /* retry next tick */ }
    _checking = false;
  }

  window.CowriteInvites = { handle: handle, check: check };
})();
