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
    const hasGift = (m.giftHammers || m.giftStreakDays) && !m.giftClaimed;
    return `<div class="msg-item${unr}${sel}" onclick="selectMsg('${m._id}')" data-id="${m._id}">
      <div class="msg-sender">
        ${unread ? '<span class="dot-unread"></span>' : ''}
        ${sender}
        <span class="msg-time" style="margin-left:auto">${timeAgo(m.createdAt)}</span>
      </div>
      <div class="msg-subject">${subj}${hasGift ? ' <span class="gift-tag">🎁 Có quà</span>' : ''}</div>
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
  const detailEl = document.getElementById('msgDetail');
  // Mobile-only: CSS hides .msg-detail below 680px until it gets .active
  // (see inbox.html's @media block) — the panel used to never actually
  // toggle that class, so nothing ever appeared on a phone. Desktop is
  // unaffected (.active has no rule outside that media query).
  detailEl.classList.add('active');
  detailEl.innerHTML = `
    <button class="mobile-back-btn" onclick="backToList()"><i class="fas fa-arrow-left"></i> Danh sách tin nhắn</button>
    <div class="detail-head">
      <h2 class="detail-subject">${subj}</h2>
      <div class="detail-meta">
        <span><i class="fas fa-user"></i> Từ: <strong>${sender}</strong></span>
        <span><i class="fas fa-clock"></i> ${formatFull(msg.createdAt)}</span>
        ${msg.isBroadcast ? '<span class="broadcast-badge">📢 Thông báo chung</span>' : ''}
      </div>
    </div>
    <div class="detail-body">${esc(msg.body)}</div>
    ${renderGiftBox(msg)}
    <div class="reply-box">
      <textarea id="replyText" placeholder="Trả lời ${sender}..." rows="3"></textarea>
      <button class="btn btn-primary" id="replySendBtn" onclick="replyMsg('${id}')"><i class="fas fa-reply"></i> Gửi phản hồi</button>
    </div>
    <div class="detail-actions">
      <button class="btn btn-danger" onclick="deleteMsg('${id}')"><i class="fas fa-trash"></i> Xóa</button>
    </div>
  `;
  setupDictionaryDouble('msgDetail', 'inbox-message');
}

// Mobile-only "back" button inside the detail panel — removes .active so
// the CSS media query switches back to showing the message list.
function backToList() {
  document.getElementById('msgDetail').classList.remove('active');
}

function renderGiftBox(msg) {
  if (!msg.giftHammers && !msg.giftStreakDays) return '';
  const parts = [];
  if (msg.giftHammers) parts.push(`<span class="gift-item"><img src="img/buaDaniel.jpg" alt="Búa Daniel"> ${msg.giftHammers} búa Daniel</span>`);
  if (msg.giftStreakDays) parts.push(`<span class="gift-item">🔥 ${msg.giftStreakDays} ngày lửa streak</span>`);
  if (msg.giftClaimed) {
    return `<div class="gift-box gift-box-claimed">
      <div class="gift-items">${parts.join('')}</div>
      <span class="gift-claimed-label"><i class="fas fa-check-circle"></i> Đã nhận</span>
    </div>`;
  }
  return `<div class="gift-box">
    <div class="gift-items">${parts.join('')}</div>
    <button class="btn btn-primary" id="claimGiftBtn" onclick="claimGift('${msg._id}')"><i class="fas fa-gift"></i> Nhận quà</button>
  </div>`;
}

async function claimGift(id) {
  const btn = document.getElementById('claimGiftBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang nhận...'; }
  try {
    const d = await apiFetch(`/user/messages/${id}/claim`, { method: 'POST' });
    const msg = messages.find(m => m._id === id);
    if (msg) msg.giftClaimed = true;
    if (window.showToast) window.showToast(`Đã nhận quà: ${d.giftHammers ? d.giftHammers + ' búa' : ''}${d.giftHammers && d.giftStreakDays ? ', ' : ''}${d.giftStreakDays ? d.giftStreakDays + ' ngày lửa' : ''}`, 'success');
    if (msg && msg._id === selectedId) selectMsg(id);
  } catch (e) {
    if (window.showToast) window.showToast('Lỗi: ' + e.message, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-gift"></i> Nhận quà'; }
  }
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
      const detailEl = document.getElementById('msgDetail');
      detailEl.classList.remove('active');
      detailEl.innerHTML = `
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
window.claimGift = claimGift;
window.backToList = backToList;

load();
