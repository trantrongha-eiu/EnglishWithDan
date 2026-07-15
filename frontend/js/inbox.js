'use strict';
const API = 'https://englishwithdan.onrender.com/api';
function authH() { return { ...window.AuthService.authHeader(), 'Content-Type': 'application/json' }; }

let messages = [];
let selectedId = null;

// apiFetch keeps its own request-building and delegates response-handling
// (including the 401 check this file previously lacked entirely) to
// js/shared/api-client.js — single source of truth (Phase 3 audit).
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authH(), ...(opts.headers || {}) } });
  return window.ApiClient.handleResponse(res);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  const dt = new Date(dateStr);
  return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`;
}

function formatFull(dateStr) {
  const d = new Date(dateStr);
  const pad = n => String(n).padStart(2,'0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// esc() moved to js/shared/utils.js (single source of truth — Phase 3 audit).

async function load() {
  try {
    const data = await apiFetch('/user/messages?limit=50');
    messages = data.messages || [];
    renderList();
    updateBadge();
  } catch (e) {
    document.getElementById('msgList').innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>${esc(e.message)}</p></div>`;
  }
}

function renderList() {
  const list = document.getElementById('msgList');
  if (!messages.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open"></i><p>Hộp thư trống</p></div>';
    return;
  }
  list.innerHTML = messages.map(m => {
    const unread = !m.isRead;
    const sender = m.isBroadcast ? '📢 Thông báo chung' : esc(m.fromName || 'Giáo viên');
    const preview = esc(m.body.slice(0, 80));
    const subj = m.subject ? esc(m.subject) : '(Không có tiêu đề)';
    const sel = m._id === selectedId ? ' selected' : '';
    const unr = unread ? ' unread' : '';
    return `<div class="msg-item${unr}${sel}" onclick="selectMsg('${m._id}')" data-id="${m._id}">
      <div class="msg-sender">
        ${unread ? '<span class="dot-unread"></span>' : ''}
        ${sender}
        <span class="msg-time" style="margin-left:auto">${timeAgo(m.createdAt)}</span>
      </div>
      <div class="msg-subject">${subj}</div>
      <div class="msg-preview">${preview}</div>
    </div>`;
  }).join('');
}

function updateBadge() {
  const unread = messages.filter(m => !m.isRead).length;
  const badge = document.getElementById('unreadBadge');
  if (unread > 0) { badge.textContent = unread; badge.style.display = ''; }
  else { badge.style.display = 'none'; }
}

async function selectMsg(id) {
  const prevId = selectedId;
  selectedId = id;
  const msg = messages.find(m => m._id === id);
  if (!msg) return;

  // Update selection highlight without re-rendering the whole list (preserves scroll position)
  if (prevId && prevId !== id) {
    const prevEl = document.querySelector(`.msg-item[data-id="${prevId}"]`);
    if (prevEl) prevEl.classList.remove('selected');
  }
  const curEl = document.querySelector(`.msg-item[data-id="${id}"]`);
  if (curEl) curEl.classList.add('selected');

  // Mark read
  if (!msg.isRead) {
    try { await apiFetch(`/user/messages/${id}/read`, { method: 'PATCH' }); } catch { /* ignore */ }
    msg.isRead = true;
    if (curEl) {
      curEl.classList.remove('unread');
      curEl.querySelector('.dot-unread')?.remove();
    }
    updateBadge();
  }

  const sender = msg.isBroadcast ? '📢 Thông báo chung' : esc(msg.fromName || 'Giáo viên');
  const subj = msg.subject ? esc(msg.subject) : '(Không có tiêu đề)';
  document.getElementById('msgDetail').innerHTML = `
    <div class="detail-head">
      <h2 class="detail-subject">${subj}</h2>
      <div class="detail-meta">
        <span><i class="fas fa-user"></i> Từ: <strong>${sender}</strong></span>
        <span><i class="fas fa-clock"></i> ${formatFull(msg.createdAt)}</span>
        ${msg.isBroadcast ? '<span class="broadcast-badge">📢 Thông báo chung</span>' : ''}
      </div>
    </div>
    <div class="detail-body">${esc(msg.body)}</div>
    <div class="reply-box">
      <textarea id="replyText" placeholder="Trả lời ${sender}..." rows="3"></textarea>
      <button class="btn btn-primary" id="replySendBtn" onclick="replyMsg('${id}')"><i class="fas fa-reply"></i> Gửi phản hồi</button>
    </div>
    <div class="detail-actions">
      <button class="btn btn-danger" onclick="deleteMsg('${id}')"><i class="fas fa-trash"></i> Xóa</button>
    </div>
  `;
}

async function replyMsg(id) {
  const textarea = document.getElementById('replyText');
  const btn = document.getElementById('replySendBtn');
  const body = textarea.value.trim();
  if (!body) { textarea.focus(); return; }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
  try {
    await apiFetch(`/user/messages/${id}/reply`, { method: 'POST', body: JSON.stringify({ body }) });
    textarea.value = '';
    if (window.showToast) window.showToast('Đã gửi phản hồi', 'success');
  } catch (e) {
    if (window.showToast) window.showToast('Lỗi: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-reply"></i> Gửi phản hồi';
  }
}

// showConfirm() moved to js/shared/confirm-dialog.js (single source of
// truth — Phase 3 audit).

async function deleteMsg(id) {
  showConfirm('Xóa tin nhắn này?', async () => {
    try {
      await apiFetch(`/user/messages/${id}`, { method: 'DELETE' });
      messages = messages.filter(m => m._id !== id);
      selectedId = null;
      renderList();
      updateBadge();
      document.getElementById('msgDetail').innerHTML = `
        <div class="detail-placeholder">
          <i class="fas fa-envelope-open-text"></i>
          <p>Chọn một tin nhắn để đọc</p>
        </div>`;
    } catch (e) {
      const t = document.createElement('div');
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 14px rgba(0,0,0,.2)';
      t.textContent = 'Lỗi: ' + e.message;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3500);
    }
  });
}

// Expose for onclick
window.selectMsg = selectMsg;
window.deleteMsg = deleteMsg;
window.replyMsg = replyMsg;

load();
