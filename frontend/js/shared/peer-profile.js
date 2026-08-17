/**
 * shared/peer-profile.js — click a student's name (leaderboards) to view
 * their profile (name/streak/band scores only — see backend/services/
 * peerService.js for why the field set is this narrow), message them,
 * block them, or report them.
 *
 * Host page requirements:
 *   - window.AuthService.authHeader()/API (js/shared/auth-service.js)
 *   - window.escHtml()                    (js/shared/utils.js)
 *   - window.showVocabToast() or window.toast() — whichever the host page
 *     defines; this file calls a small _toast() wrapper that tries both.
 *   - markup: #modal-peer-profile, #modal-peer-chat, #modal-peer-report
 *     (see dashboard.html)
 */
(function () {
  'use strict';

  var API_BASE = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var _peerId = null;
  var _peerName = '';
  var _reportMessageId = null;
  var _chatPollTimer = null;

  function _toast(msg, type) {
    if (window.showVocabToast) return window.showVocabToast(msg, type);
    if (window.toast) return window.toast(msg, type);
  }

  async function _api(path, opts) {
    opts = opts || {};
    var res = await fetch(API_BASE + path, Object.assign({}, opts, {
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        window.AuthService ? window.AuthService.authHeader() : {},
        opts.headers || {}
      )
    }));
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
    return data;
  }

  function _bandRow(label, band, total) {
    var val = band ? band : '–';
    return '<div class="peer-band-stat">' +
      '<div class="peer-band-label">' + label + '</div>' +
      '<div class="peer-band-value">' + val + '</div>' +
      '<div class="peer-band-total">' + (total || 0) + ' bài</div>' +
      '</div>';
  }

  async function openPeerProfile(userId) {
    _peerId = userId;
    var modal = document.getElementById('modal-peer-profile');
    var body = document.getElementById('peer-profile-body');
    if (!modal || !body) return;
    body.innerHTML = '<div class="spinner" style="margin:30px auto"></div>';
    modal.classList.remove('hidden');
    try {
      var d = await _api('/user/peer/' + userId + '/profile');
      if (!d.success) throw new Error(d.message);
      _renderPeerProfile(d.profile);
    } catch (e) {
      body.innerHTML = '<div style="padding:24px;text-align:center;color:#e53935">' + escHtml(e.message || 'Lỗi tải hồ sơ') + '</div>';
    }
  }

  function _renderPeerProfile(p) {
    _peerName = p.name;
    var body = document.getElementById('peer-profile-body');
    var avatar = p.avatar
      ? '<img class="peer-profile-avatar" src="' + escHtml(p.avatar) + '" alt="">'
      : '<span class="peer-profile-avatar-placeholder">' + escHtml((p.name || '?')[0].toUpperCase()) + '</span>';

    body.innerHTML =
      '<div class="peer-profile-header">' +
        avatar +
        '<div class="peer-profile-name">' + escHtml(p.name) + '</div>' +
        '<div class="peer-profile-streak"><i class="fas fa-fire"></i> ' + p.streak + ' ngày streak</div>' +
      '</div>' +
      '<div class="peer-band-grid">' +
        _bandRow('Reading', p.reading.avgBand, p.reading.total) +
        _bandRow('Listening', p.listening.avgBand, p.listening.total) +
        _bandRow('Writing', p.writing.avgBand, p.writing.total) +
        _bandRow('Speaking', p.speaking.avgBand, p.speaking.total) +
      '</div>' +
      '<div class="peer-profile-actions">' +
        '<button class="btn btn-primary" onclick="openPeerChat(\'' + p._id + '\')"><i class="fas fa-comment-dots"></i> Nhắn tin</button>' +
        '<button class="btn btn-ghost" onclick="' + (p.isBlockedByMe ? 'unblockPeer()' : 'blockPeer()') + '">' +
          (p.isBlockedByMe ? '<i class="fas fa-user-check"></i> Bỏ chặn' : '<i class="fas fa-user-slash"></i> Chặn') +
        '</button>' +
        '<button class="btn btn-ghost peer-report-btn" onclick="openPeerReport()"><i class="fas fa-flag"></i> Báo cáo</button>' +
      '</div>';
  }

  function closePeerProfile() {
    document.getElementById('modal-peer-profile')?.classList.add('hidden');
  }

  async function blockPeer() {
    if (!_peerId) return;
    try {
      await _api('/user/peer/' + _peerId + '/block', { method: 'POST' });
      _toast('Đã chặn ' + _peerName, 'success');
      openPeerProfile(_peerId); // re-render with updated isBlockedByMe
    } catch (e) { _toast(e.message || 'Lỗi', 'error'); }
  }

  async function unblockPeer() {
    if (!_peerId) return;
    try {
      await _api('/user/peer/' + _peerId + '/block', { method: 'DELETE' });
      _toast('Đã bỏ chặn ' + _peerName, 'success');
      openPeerProfile(_peerId);
    } catch (e) { _toast(e.message || 'Lỗi', 'error'); }
  }

  // ── Report ──────────────────────────────────────────────────
  // messageId (optional): set when reporting from an open chat thread, so
  // the report links to the specific offending message.
  function openPeerReport(messageId) {
    _reportMessageId = messageId || null;
    var modal = document.getElementById('modal-peer-report');
    var title = document.getElementById('peer-report-title');
    var textarea = document.getElementById('peer-report-reason');
    if (!modal) return;
    if (title) title.textContent = 'Báo cáo ' + _peerName;
    if (textarea) textarea.value = '';
    modal.classList.remove('hidden');
  }

  function closePeerReport() {
    document.getElementById('modal-peer-report')?.classList.add('hidden');
  }

  async function submitPeerReport() {
    var textarea = document.getElementById('peer-report-reason');
    var reason = textarea ? textarea.value.trim() : '';
    if (!reason) { _toast('Vui lòng nhập lý do báo cáo', 'error'); return; }
    try {
      await _api('/user/peer/' + _peerId + '/report', {
        method: 'POST',
        body: JSON.stringify({ reason: reason, messageId: _reportMessageId }),
      });
      _toast('Đã gửi báo cáo tới giáo viên', 'success');
      closePeerReport();
    } catch (e) { _toast(e.message || 'Lỗi gửi báo cáo', 'error'); }
  }

  // ── Chat ────────────────────────────────────────────────────
  async function openPeerChat(userId) {
    _peerId = userId;
    closePeerProfile();
    var modal = document.getElementById('modal-peer-chat');
    var nameEl = document.getElementById('peer-chat-name');
    if (!modal) return;
    modal.classList.remove('hidden');
    if (nameEl) nameEl.textContent = _peerName || '...';
    await _loadThread();
    clearInterval(_chatPollTimer);
    _chatPollTimer = setInterval(_loadThread, 5000);
    setTimeout(function () {
      var ta = document.getElementById('peer-chat-input');
      if (ta) ta.focus();
    }, 100);
  }

  function closePeerChat() {
    document.getElementById('modal-peer-chat')?.classList.add('hidden');
    clearInterval(_chatPollTimer);
    _chatPollTimer = null;
  }

  async function _loadThread() {
    if (!_peerId) return;
    var list = document.getElementById('peer-chat-messages');
    if (!list) return;
    var wasNearBottom = (list.scrollHeight - list.scrollTop - list.clientHeight) < 60;
    try {
      var d = await _api('/user/peer/' + _peerId + '/thread');
      if (!d.success) return;
      // AuthService's stored user object keys the id as "id", not "_id"
      // (see authService.js's userPayload()) — using ._id here made myId
      // always undefined, which in turn made every message's "mine" check
      // below spuriously true (m.fromId?._id === undefined matched).
      var myId = window.AuthService && window.AuthService.getUser ? window.AuthService.getUser().id : null;
      if (!d.messages.length) {
        list.innerHTML = '<div class="peer-chat-empty">Chưa có tin nhắn nào. Gửi lời chào đầu tiên nhé!</div>';
        return;
      }
      list.innerHTML = d.messages.map(function (m) {
        var mine = !!myId && (m.fromId === myId || m.fromId?._id === myId);
        var bubbleClass = mine ? 'peer-chat-bubble mine' : 'peer-chat-bubble';
        var reportBtn = mine ? '' :
          '<button class="peer-chat-report-btn" title="Báo cáo tin nhắn này" onclick="openPeerReport(\'' + m._id + '\')"><i class="fas fa-flag"></i></button>';
        return '<div class="peer-chat-row' + (mine ? ' mine' : '') + '">' +
          '<div class="' + bubbleClass + '">' + escHtml(m.body) + '</div>' +
          reportBtn +
          '</div>';
      }).join('');
      if (wasNearBottom) list.scrollTop = list.scrollHeight;
    } catch (e) { /* silent — polling retry next tick */ }
  }

  async function sendPeerChatMessage() {
    var ta = document.getElementById('peer-chat-input');
    var body = ta ? ta.value.trim() : '';
    if (!body || !_peerId) return;
    var btn = document.getElementById('peer-chat-send-btn');
    if (btn) btn.disabled = true;
    try {
      await _api('/user/peer/' + _peerId + '/message', {
        method: 'POST',
        body: JSON.stringify({ body: body }),
      });
      if (ta) ta.value = '';
      await _loadThread();
    } catch (e) {
      _toast(e.message || 'Không gửi được tin nhắn', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  window.openPeerProfile = openPeerProfile;
  window.closePeerProfile = closePeerProfile;
  window.blockPeer = blockPeer;
  window.unblockPeer = unblockPeer;
  window.openPeerReport = openPeerReport;
  window.closePeerReport = closePeerReport;
  window.submitPeerReport = submitPeerReport;
  window.openPeerChat = openPeerChat;
  window.closePeerChat = closePeerChat;
  window.sendPeerChatMessage = sendPeerChatMessage;
})();
