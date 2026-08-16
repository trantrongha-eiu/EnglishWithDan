/**
 * shared/peer-chat-widget.js — Facebook-Messenger-style floating chat bubble
 * for student-to-student peer messaging (backend/services/peerService.js,
 * same Message rows and /api/user/peer/* routes as js/shared/peer-profile.js's
 * chat modal — this widget is the "always available, notifies you" surface;
 * the modal opened from a leaderboard row is still the entry point for
 * profile/block/report).
 *
 * Builds its own DOM/CSS (like nav.js's _showStreak35Notice()) so it works
 * on every page without any host-page markup — just include this script
 * after nav.js/toast.js/utils.js/auth-service.js.
 *
 * Host page requirements: window.AuthService, window.escHtml,
 * window.showToastWithTitle (js/shared/toast.js).
 *
 * Only active for logged-in students — peer messaging is student-to-student
 * only (peerService.sendPeerMessage rejects non-student recipients).
 */
(function () {
  'use strict';
  if (!window.AuthService || !window.AuthService.isLoggedIn()) return;
  if (window.AuthService.getRole() !== 'student') return;

  var API_BASE = window.AuthService.API || 'https://englishwithdan.onrender.com/api';
  var POLL_MS = 20000;        // conversation-list poll — cheap enough to run on every page
  var THREAD_POLL_MS = 5000;  // matches peer-profile.js's in-modal chat poll

  var _conversations = [];
  var _lastAtByPeer = {};     // peerId -> ISO string; baseline for "is this message new?"
  var _seeded = false;        // true once we've fetched at least once — suppresses toasts for
                               // messages that were already unread before this page load
  var _activePeerId = null;
  var _activePeerName = '';
  var _threadPollTimer = null;
  var _panelOpen = false;
  var _view = 'list'; // 'list' | 'thread' | 'students'
  var _allStudents = null; // cached roster for the "start a new chat" list — fetched once per page load

  async function _api(path, opts) {
    opts = opts || {};
    var res = await fetch(API_BASE + path, Object.assign({}, opts, {
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        window.AuthService.authHeader(),
        opts.headers || {}
      )
    }));
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
    return data;
  }

  function _myId() {
    var u = window.AuthService.getUser();
    return u && u._id;
  }

  function _initial(name) { return (name || '?').trim().charAt(0).toUpperCase() || '?'; }

  function _timeAgo(iso) {
    var diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    if (diff < 172800) return 'Hôm qua';
    return Math.floor(diff / 86400) + ' ngày trước';
  }

  function _pad2(n) { return n < 10 ? '0' + n : String(n); }

  function _hm(d) { return _pad2(d.getHours()) + ':' + _pad2(d.getMinutes()); }

  // Messenger-style per-message stamp: bare time for today, "Hôm qua HH:mm"
  // for yesterday, "dd/MM HH:mm" further back.
  function _fmtMsgStamp(iso) {
    var d = new Date(iso);
    var now = new Date();
    var sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return _hm(d);
    var yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua ' + _hm(d);
    return _pad2(d.getDate()) + '/' + _pad2(d.getMonth() + 1) + ' ' + _hm(d);
  }

  // Three-state status for MY last message, shown Messenger-style under it:
  //  - "Đã xem": the recipient has opened this thread (isRead, set server-
  //    side by getThread() when they fetch it).
  //  - "Đã nhận": not read yet, but the recipient has been active on the
  //    site (peerLastSeen) since this message was sent — there's no push
  //    delivery in this polling-based chat, so "delivered" is approximated
  //    as "their client would have picked it up by now."
  //  - "Đã gửi": neither of the above yet.
  function _msgStatus(m, peerLastSeen) {
    if (m.isRead) return 'Đã xem';
    if (peerLastSeen && new Date(peerLastSeen).getTime() >= new Date(m.createdAt).getTime()) return 'Đã nhận';
    return 'Đã gửi';
  }

  // "Online" threshold matches the admin panel's own definition (lastSeen
  // within 5 minutes — backend/routes/admin/users.js's /online-users), so a
  // student sees the same notion of "online" a teacher would.
  var ONLINE_MS = 5 * 60 * 1000;
  function _formatPresence(lastSeen) {
    if (!lastSeen) return { text: '', online: false };
    var diff = Date.now() - new Date(lastSeen).getTime();
    if (diff < ONLINE_MS) return { text: 'Đang hoạt động', online: true };
    var mins = Math.floor(diff / 60000);
    if (mins < 60) return { text: 'Hoạt động ' + mins + ' phút trước', online: false };
    var hours = Math.floor(diff / 3600000);
    if (hours < 24) return { text: 'Hoạt động ' + hours + ' giờ trước', online: false };
    var days = Math.floor(diff / 86400000);
    if (days < 7) return { text: 'Hoạt động ' + days + ' ngày trước', online: false };
    return { text: '', online: false };
  }

  function _avatarHtml(avatar, name, cls) {
    return avatar
      ? '<img class="' + cls + '" src="' + escHtml(avatar) + '" alt="">'
      : '<span class="' + cls + ' pcw-avatar-fallback">' + escHtml(_initial(name)) + '</span>';
  }

  // ── Styles (self-contained — no dependency on dashboard.css) ─────────
  function _injectStyles() {
    if (document.getElementById('pcw-styles')) return;
    var s = document.createElement('style');
    s.id = 'pcw-styles';
    s.textContent =
      '#pcw-root{position:fixed;bottom:20px;right:20px;z-index:1050;font-family:inherit}' +
      '.pcw-launcher{width:52px;height:52px;border-radius:50%;background:var(--blue,#3d8bff);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;font-size:22px;position:relative;transition:transform .15s}' +
      '.pcw-launcher:hover{transform:scale(1.06)}' +
      '.pcw-launcher.pcw-bump{animation:pcw-bump .5s ease}' +
      '@keyframes pcw-bump{0%,100%{transform:scale(1)}30%{transform:scale(1.18)}}' +
      '.pcw-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;min-width:19px;height:19px;border-radius:10px;display:none;align-items:center;justify-content:center;padding:0 4px;border:2px solid var(--bg,#fff)}' +
      '.pcw-panel{position:absolute;bottom:64px;right:0;width:330px;max-width:calc(100vw - 24px);height:440px;max-height:calc(100vh - 110px);background:var(--surface,#fff);border:1px solid var(--border,#e5e7eb);border-radius:14px;box-shadow:0 10px 34px rgba(0,0,0,.22);display:none;flex-direction:column;overflow:hidden}' +
      '.pcw-panel.open{display:flex}' +
      '.pcw-header{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--border,#e5e7eb);flex-shrink:0}' +
      '.pcw-header-titles{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}' +
      '.pcw-header-title{flex:1;min-width:0;font-weight:800;font-size:14.5px;color:var(--text,#111827);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.pcw-header-sub{font-size:11px;color:var(--text3,#9ca3af);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:4px;min-height:14px}' +
      '.pcw-header-sub.online{color:var(--green,#22c55e)}' +
      '.pcw-online-dot{width:7px;height:7px;border-radius:50%;background:var(--green,#22c55e);flex-shrink:0}' +
      '.pcw-avatar-wrap{position:relative;flex-shrink:0}' +
      '.pcw-avatar-wrap .pcw-online-dot{position:absolute;bottom:0;right:0;border:2px solid var(--surface,#fff)}' +
      '.pcw-icon-btn{background:none;border:none;color:var(--text3,#6b7280);cursor:pointer;font-size:15px;padding:4px;border-radius:6px;flex-shrink:0}' +
      '.pcw-icon-btn:hover{background:var(--surface2,#f3f4f6);color:var(--text,#111827)}' +
      '.pcw-list{flex:1;overflow-y:auto}' +
      '.pcw-conv-row{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background .12s}' +
      '.pcw-conv-row:hover{background:var(--surface2,#f3f4f6)}' +
      '.pcw-conv-avatar,.pcw-avatar-fallback{width:38px;height:38px;border-radius:50%;object-fit:cover;background:var(--surface2,#e5e7eb);flex-shrink:0}' +
      '.pcw-avatar-fallback{display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--text2,#6b7280);font-size:14px}' +
      '.pcw-conv-info{flex:1;min-width:0}' +
      '.pcw-conv-name{font-size:13.5px;font-weight:600;color:var(--text,#111827);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.pcw-conv-row.unread .pcw-conv-name{font-weight:800}' +
      '.pcw-conv-preview{font-size:12px;color:var(--text3,#9ca3af);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.pcw-conv-row.unread .pcw-conv-preview{color:var(--text,#111827);font-weight:600}' +
      '.pcw-conv-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}' +
      '.pcw-conv-time{font-size:10.5px;color:var(--text3,#9ca3af)}' +
      '.pcw-conv-dot{width:9px;height:9px;border-radius:50%;background:var(--blue,#3d8bff)}' +
      '.pcw-empty{margin:auto;padding:24px;text-align:center;color:var(--text3,#9ca3af);font-size:13px}' +
      '.pcw-search-wrap{padding:10px 12px;border-bottom:1px solid var(--border,#e5e7eb);flex-shrink:0}' +
      '.pcw-search-input{width:100%;border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:8px 11px;font-family:inherit;font-size:13.5px;background:var(--bg,var(--surface,#fff));color:var(--text,#111827)}' +
      '.pcw-search-input:focus{outline:none;border-color:var(--blue,#3d8bff)}' +
      '.pcw-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}' +
      '.pcw-row{display:flex;flex-direction:column;max-width:80%}' +
      '.pcw-row.mine{align-self:flex-end;align-items:flex-end}' +
      '.pcw-row:not(.mine){align-items:flex-start}' +
      '.pcw-bubble{background:var(--surface2,#f3f4f6);color:var(--text,#111827);padding:8px 12px;border-radius:14px;font-size:13.5px;line-height:1.45;word-break:break-word;white-space:pre-wrap}' +
      '.pcw-bubble.mine{background:var(--blue,#3d8bff);color:#fff}' +
      '.pcw-msg-time{font-size:10px;color:var(--text3,#9ca3af);margin:2px 4px 0}' +
      '.pcw-msg-status{font-size:10px;color:var(--text3,#9ca3af);margin:1px 4px 0}' +
      '.pcw-input-row{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--border,#e5e7eb);flex-shrink:0}' +
      '.pcw-input{flex:1;resize:none;border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:8px 11px;font-family:inherit;font-size:13.5px;background:var(--bg,var(--surface,#fff));color:var(--text,#111827);max-height:80px}' +
      '.pcw-input:focus{outline:none;border-color:var(--blue,#3d8bff)}' +
      '.pcw-send-btn{background:var(--blue,#3d8bff);color:#fff;border:none;border-radius:10px;width:36px;flex-shrink:0;cursor:pointer;font-size:14px}' +
      '.pcw-send-btn:disabled{opacity:.5;cursor:default}' +
      // Stacks the launcher above the floating Zalo contact button
      // (.zalo-float/.zalo-btn, css/main.css) instead of sitting directly on
      // top of it when both appear on the same page — applied conditionally
      // via _buildWidget()'s runtime check, so pages without a Zalo button
      // keep the normal corner-hugging position.
      '#pcw-root.pcw-above-zalo{bottom:100px}' +
      '@media(max-width:480px){#pcw-root{bottom:12px;right:12px}.pcw-panel{width:calc(100vw - 24px);right:-4px}#pcw-root.pcw-above-zalo{bottom:80px}}';
    document.head.appendChild(s);
  }

  // ── DOM ────────────────────────────────────────────────────────────
  var _root, _launcher, _badge, _panel, _header, _body;

  function _buildWidget() {
    _injectStyles();
    _root = document.createElement('div');
    _root.id = 'pcw-root';
    if (document.querySelector('.zalo-float, .zalo-btn')) _root.classList.add('pcw-above-zalo');
    _root.innerHTML =
      '<div class="pcw-panel" id="pcw-panel">' +
        '<div class="pcw-header" id="pcw-header"></div>' +
        '<div id="pcw-body" style="flex:1;display:flex;flex-direction:column;min-height:0"></div>' +
      '</div>' +
      '<button class="pcw-launcher" id="pcw-launcher" title="Tin nhắn" type="button">' +
        '<i class="fas fa-comment-dots"></i>' +
        '<span class="pcw-badge" id="pcw-badge"></span>' +
      '</button>';
    document.body.appendChild(_root);

    _launcher = document.getElementById('pcw-launcher');
    _badge = document.getElementById('pcw-badge');
    _panel = document.getElementById('pcw-panel');
    _header = document.getElementById('pcw-header');
    _body = document.getElementById('pcw-body');

    _launcher.addEventListener('click', function () {
      _panelOpen = !_panelOpen;
      _panel.classList.toggle('open', _panelOpen);
      if (_panelOpen) {
        if (_view === 'list') _renderList();
        else _renderThread();
      } else {
        _stopThreadPoll();
      }
    });
  }

  function _updateBadge() {
    var total = _conversations.reduce(function (sum, c) { return sum + (c.unread || 0); }, 0);
    if (total > 0) {
      _badge.textContent = total > 99 ? '99+' : String(total);
      _badge.style.display = 'flex';
    } else {
      _badge.style.display = 'none';
    }
  }

  function _bump() {
    _launcher.classList.remove('pcw-bump');
    void _launcher.offsetWidth; // restart animation
    _launcher.classList.add('pcw-bump');
  }

  // ── List view ─────────────────────────────────────────────────────
  function _renderList() {
    _view = 'list';
    _stopThreadPoll();
    _header.innerHTML =
      '<span class="pcw-header-title">Tin nhắn</span>' +
      '<button class="pcw-icon-btn" id="pcw-new-chat-btn" title="Nhắn tin cho bạn học khác"><i class="fas fa-user-plus"></i></button>' +
      '<button class="pcw-icon-btn" id="pcw-close-btn" title="Đóng"><i class="fas fa-times"></i></button>';
    document.getElementById('pcw-new-chat-btn').addEventListener('click', _renderStudentList);
    document.getElementById('pcw-close-btn').addEventListener('click', function () {
      _panelOpen = false;
      _panel.classList.remove('open');
    });

    if (!_conversations.length) {
      _body.innerHTML = '<div class="pcw-empty">Chưa có cuộc trò chuyện nào.<br>Bấm vào tên một bạn học ở bảng xếp hạng để nhắn tin.</div>';
      return;
    }
    var list = document.createElement('div');
    list.className = 'pcw-list';
    list.innerHTML = _conversations.map(function (c) {
      var unread = c.unread > 0;
      var online = _formatPresence(c.lastSeen).online;
      return '<div class="pcw-conv-row' + (unread ? ' unread' : '') + '" data-peer="' + c.userId + '">' +
        '<span class="pcw-avatar-wrap">' + _avatarHtml(c.avatar, c.name, 'pcw-conv-avatar') + (online ? '<span class="pcw-online-dot"></span>' : '') + '</span>' +
        '<div class="pcw-conv-info">' +
          '<div class="pcw-conv-name">' + escHtml(c.name) + '</div>' +
          '<div class="pcw-conv-preview">' + (c.isLastFromMe ? 'Bạn: ' : '') + escHtml(c.lastMessage || '') + '</div>' +
        '</div>' +
        '<div class="pcw-conv-meta">' +
          '<div class="pcw-conv-time">' + _timeAgo(c.lastAt) + '</div>' +
          (unread ? '<div class="pcw-conv-dot"></div>' : '') +
        '</div>' +
      '</div>';
    }).join('');
    _body.innerHTML = '';
    _body.appendChild(list);
    list.querySelectorAll('.pcw-conv-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var peerId = row.getAttribute('data-peer');
        var conv = _conversations.filter(function (c) { return String(c.userId) === peerId; })[0];
        _openThread(peerId, conv ? conv.name : '', conv ? conv.avatar : '', conv ? conv.lastSeen : null);
      });
    });
  }

  // ── Student roster view (start a new conversation) ─────────────────
  // "Tin nhắn" previously only ever showed EXISTING conversations — the
  // only way to message someone new was to find them on the leaderboard
  // first. This lists every active (non-banned, non-blocked) student.
  async function _renderStudentList() {
    _view = 'students';
    _stopThreadPoll();
    _header.innerHTML =
      '<button class="pcw-icon-btn" id="pcw-back-btn" title="Quay lại"><i class="fas fa-arrow-left"></i></button>' +
      '<span class="pcw-header-title">Nhắn tin cho bạn học</span>' +
      '<button class="pcw-icon-btn" id="pcw-close-btn" title="Đóng"><i class="fas fa-times"></i></button>';
    document.getElementById('pcw-back-btn').addEventListener('click', _renderList);
    document.getElementById('pcw-close-btn').addEventListener('click', function () {
      _panelOpen = false;
      _panel.classList.remove('open');
    });

    _body.innerHTML =
      '<div class="pcw-search-wrap"><input class="pcw-search-input" id="pcw-student-search" placeholder="Tìm bạn học..." autocomplete="off"></div>' +
      '<div class="pcw-list" id="pcw-student-list"><div class="pcw-empty">Đang tải...</div></div>';

    var searchInp = document.getElementById('pcw-student-search');
    searchInp.addEventListener('input', function () { _renderStudentRows(searchInp.value); });
    setTimeout(function () { searchInp.focus(); }, 50);

    if (_allStudents === null) {
      try {
        var d = await _api('/user/peer/students');
        _allStudents = d.students || [];
      } catch (e) {
        _allStudents = [];
      }
    }
    if (_view === 'students') _renderStudentRows('');
  }

  function _renderStudentRows(query) {
    var listEl = document.getElementById('pcw-student-list');
    if (!listEl) return;
    var q = (query || '').trim().toLowerCase();
    var rows = (_allStudents || []).filter(function (s) {
      return !q || (s.name || '').toLowerCase().indexOf(q) !== -1;
    });
    if (!rows.length) {
      listEl.innerHTML = '<div class="pcw-empty">' +
        ((_allStudents || []).length ? 'Không tìm thấy bạn học nào.' : 'Chưa có bạn học nào khác.') +
        '</div>';
      return;
    }
    listEl.innerHTML = rows.map(function (s) {
      var online = _formatPresence(s.lastSeen).online;
      return '<div class="pcw-conv-row" data-peer="' + s._id + '">' +
        '<span class="pcw-avatar-wrap">' + _avatarHtml(s.avatar, s.name, 'pcw-conv-avatar') + (online ? '<span class="pcw-online-dot"></span>' : '') + '</span>' +
        '<div class="pcw-conv-info"><div class="pcw-conv-name">' + escHtml(s.name) + '</div></div>' +
      '</div>';
    }).join('');
    listEl.querySelectorAll('.pcw-conv-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var peerId = row.getAttribute('data-peer');
        var s = (_allStudents || []).filter(function (x) { return String(x._id) === peerId; })[0];
        _openThread(peerId, s ? s.name : '', s ? s.avatar : '', s ? s.lastSeen : null);
      });
    });
  }

  // ── Thread view ───────────────────────────────────────────────────
  function _openThread(peerId, peerName, avatar, lastSeen) {
    _activePeerId = peerId;
    _activePeerName = peerName;
    _view = 'thread';
    var presence = _formatPresence(lastSeen);
    _header.innerHTML =
      '<button class="pcw-icon-btn" id="pcw-back-btn" title="Quay lại"><i class="fas fa-arrow-left"></i></button>' +
      '<span class="pcw-avatar-wrap">' + _avatarHtml(avatar, peerName, 'pcw-conv-avatar') + (presence.online ? '<span class="pcw-online-dot"></span>' : '') + '</span>' +
      '<div class="pcw-header-titles">' +
        '<span class="pcw-header-title">' + escHtml(peerName) + '</span>' +
        '<span class="pcw-header-sub' + (presence.online ? ' online' : '') + '" id="pcw-header-presence">' + escHtml(presence.text) + '</span>' +
      '</div>' +
      '<button class="pcw-icon-btn" id="pcw-close-btn" title="Đóng"><i class="fas fa-times"></i></button>';
    document.getElementById('pcw-back-btn').addEventListener('click', function () {
      _activePeerId = null;
      _renderList();
    });
    document.getElementById('pcw-close-btn').addEventListener('click', function () {
      _panelOpen = false;
      _panel.classList.remove('open');
      _stopThreadPoll();
    });

    _body.innerHTML =
      '<div class="pcw-messages" id="pcw-messages"></div>' +
      '<div class="pcw-input-row">' +
        '<textarea class="pcw-input" id="pcw-input" rows="1" placeholder="Nhắn tin..."></textarea>' +
        '<button class="pcw-send-btn" id="pcw-send-btn" title="Gửi"><i class="fas fa-paper-plane"></i></button>' +
      '</div>';

    document.getElementById('pcw-send-btn').addEventListener('click', _sendMessage);
    document.getElementById('pcw-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _sendMessage(); }
    });

    _renderThread();
    setTimeout(function () {
      var ta = document.getElementById('pcw-input');
      if (ta) ta.focus();
    }, 50);
  }

  function _stopThreadPoll() {
    clearInterval(_threadPollTimer);
    _threadPollTimer = null;
  }

  // Refreshes just the header's presence subtitle + avatar dot — called on
  // every thread poll (THREAD_POLL_MS) so "Đang hoạt động" / "Hoạt động X
  // phút trước" stays reasonably live without re-rendering the whole header
  // (which would lose focus/scroll state).
  function _updateHeaderPresence(lastSeen) {
    var sub = document.getElementById('pcw-header-presence');
    if (!sub) return;
    var presence = _formatPresence(lastSeen);
    sub.textContent = presence.text;
    sub.classList.toggle('online', presence.online);
    var wrap = _header.querySelector('.pcw-avatar-wrap');
    if (wrap) {
      var dot = wrap.querySelector('.pcw-online-dot');
      if (presence.online && !dot) {
        wrap.insertAdjacentHTML('beforeend', '<span class="pcw-online-dot"></span>');
      } else if (!presence.online && dot) {
        dot.remove();
      }
    }
  }

  async function _renderThread() {
    if (!_activePeerId) return;
    var list = document.getElementById('pcw-messages');
    if (!list) return;
    var wasNearBottom = (list.scrollHeight - list.scrollTop - list.clientHeight) < 60;
    try {
      var d = await _api('/user/peer/' + _activePeerId + '/thread');
      if (!d.success) return;
      var myId = _myId();
      if (!d.messages.length) {
        list.innerHTML = '<div class="pcw-empty">Chưa có tin nhắn nào. Gửi lời chào đầu tiên nhé!</div>';
      } else {
        var lastMineIdx = -1;
        d.messages.forEach(function (m, i) {
          var mine = m.fromId === myId || (m.fromId && m.fromId._id === myId);
          if (mine) lastMineIdx = i;
        });
        list.innerHTML = d.messages.map(function (m, i) {
          var mine = m.fromId === myId || (m.fromId && m.fromId._id === myId);
          // Status line only under MY latest message (Messenger shows it
          // there, not repeated under every one of my messages).
          var statusHtml = (mine && i === lastMineIdx)
            ? '<div class="pcw-msg-status">' + escHtml(_msgStatus(m, d.peerLastSeen)) + '</div>'
            : '';
          return '<div class="pcw-row' + (mine ? ' mine' : '') + '">' +
            '<div class="pcw-bubble' + (mine ? ' mine' : '') + '">' + escHtml(m.body) + '</div>' +
            '<div class="pcw-msg-time">' + _fmtMsgStamp(m.createdAt) + '</div>' +
            statusHtml +
          '</div>';
        }).join('');
        if (wasNearBottom) list.scrollTop = list.scrollHeight;
      }
      _updateHeaderPresence(d.peerLastSeen);
      // Reading the thread marks it read server-side — reflect that locally
      // so the badge doesn't wait for the next 20s poll to clear.
      var conv = _conversations.filter(function (c) { return String(c.userId) === String(_activePeerId); })[0];
      if (conv && conv.unread) { conv.unread = 0; _updateBadge(); }
      if (!_threadPollTimer) _threadPollTimer = setInterval(_renderThread, THREAD_POLL_MS);
    } catch (e) { /* silent — polling retry next tick */ }
  }

  async function _sendMessage() {
    var ta = document.getElementById('pcw-input');
    var body = ta ? ta.value.trim() : '';
    if (!body || !_activePeerId) return;
    var btn = document.getElementById('pcw-send-btn');
    if (btn) btn.disabled = true;
    try {
      await _api('/user/peer/' + _activePeerId + '/message', {
        method: 'POST',
        body: JSON.stringify({ body: body }),
      });
      if (ta) ta.value = '';
      await _renderThread();
    } catch (e) {
      if (window.showToastWithTitle) window.showToastWithTitle('error', 'Không gửi được', e.message || '');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ── Global polling: unread badge + new-message notifications ────────
  async function _pollConversations() {
    try {
      var d = await _api('/user/peer/conversations');
      if (!d.success) return;
      _conversations = d.conversations || [];
      _updateBadge();

      if (_seeded) {
        _conversations.forEach(function (c) {
          if (c.isLastFromMe) return;
          var prevAt = _lastAtByPeer[c.userId];
          if (prevAt && new Date(c.lastAt).getTime() <= new Date(prevAt).getTime()) return;
          if (!prevAt && !c.unread) return; // pre-existing read conversation, not a new arrival
          _notifyNewMessage(c);
        });
      }
      _conversations.forEach(function (c) { _lastAtByPeer[c.userId] = c.lastAt; });
      _seeded = true;

      if (_panelOpen && _view === 'list') _renderList();
    } catch (e) { /* silent — retry next tick */ }
  }

  function _notifyNewMessage(conv) {
    _bump();
    if (_panelOpen && _view === 'thread' && String(_activePeerId) === String(conv.userId)) return; // already visible live
    if (!window.showToastWithTitle) return;
    var preview = (conv.lastMessage || '').slice(0, 80);
    var el = window.showToastWithTitle('info', conv.name, preview, 5000);
    if (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function () {
        _panelOpen = true;
        _panel.classList.add('open');
        _openThread(conv.userId, conv.name, conv.avatar, conv.lastSeen);
      });
    }
  }

  _buildWidget();
  _pollConversations();
  setInterval(_pollConversations, POLL_MS);
})();
