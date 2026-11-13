'use strict';
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
function authH() { return { ...window.AuthService.authHeader(), 'Content-Type': 'application/json' }; }

let messages = [];
let selectedId = null;
let currentPage = 1;
let totalMessages = 0;
let loadingMore = false;

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
    const data = await apiFetch('/user/messages?page=1&limit=50');
    messages = data.messages || [];
    totalMessages = data.total || messages.length;
    currentPage = 1;
    renderList();
    updateBadge();
    // inbox.html?msg=<id> — nav.js's "Bạn có tin nhắn mới" popup links here;
    // opening the message marks it read, which is what stops that popup.
    // An older must-read message can sit past the first page — keep paging
    // (a few pages at most) until it's found, else the popup never clears.
    const wanted = new URLSearchParams(location.search).get('msg');
    for (let i = 0; wanted && i < 5 && !messages.some(m => m._id === wanted) && messages.length < totalMessages; i++) {
      await loadMoreMessages();
    }
    if (wanted && messages.some(m => m._id === wanted)) selectMsg(wanted);
  } catch (e) {
    document.getElementById('msgList').innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>${esc(e.message)}</p></div>`;
  }
}

// Audit finding: only the first 50 messages ever loaded (limit=50, `total`
// returned but discarded) — a student with tuition reminders + study
// nudges + broadcasts piling up could have older messages permanently
// unreachable. Appends the next page instead of replacing, so scroll
// position / selection aren't disturbed.
async function loadMoreMessages() {
  if (loadingMore || messages.length >= totalMessages) return;
  loadingMore = true;
  const btn = document.getElementById('loadMoreBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...'; }
  try {
    const nextPage = currentPage + 1;
    const data = await apiFetch(`/user/messages?page=${nextPage}&limit=50`);
    messages = messages.concat(data.messages || []);
    totalMessages = data.total || totalMessages;
    currentPage = nextPage;
    renderList();
  } catch (e) {
    if (window.showToast) window.showToast('Không tải thêm được: ' + e.message, 'error');
  } finally {
    loadingMore = false;
  }
}

function renderList() {
  const list = document.getElementById('msgList');
  if (!messages.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open"></i><p>Hộp thư trống</p></div>';
    return;
  }
  const items = messages.map(m => {
    const unread = !m.isRead;
    const sender = m.isBroadcast ? '📢 Thông báo chung' : esc(m.fromName || 'Giáo viên');
    const preview = esc(m.body.slice(0, 80));
    const subj = m.subject ? esc(m.subject) : '(Không có tiêu đề)';
    const sel = m._id === selectedId ? ' selected' : '';
    const unr = unread ? ' unread' : '';
    const hasGift = hasAnyGift(m) && !m.giftClaimed;
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
  const loadMore = messages.length < totalMessages
    ? `<button class="btn btn-ghost" id="loadMoreBtn" onclick="loadMoreMessages()" style="width:100%;margin-top:8px">
        <i class="fas fa-chevron-down"></i> Xem thêm (${messages.length}/${totalMessages})
      </button>`
    : '';
  list.innerHTML = items + loadMore;
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
  // Only shown as read once the server agreed — a failed request used to
  // look read here while the "Bạn có tin nhắn mới" popup kept coming back.
  if (!msg.isRead) {
    let ok = false;
    try { await apiFetch(`/user/messages/${id}/read`, { method: 'PATCH' }); ok = true; } catch { /* retried on the next open */ }
    if (ok) {
      msg.isRead = true;
      if (curEl) {
        curEl.classList.remove('unread');
        curEl.querySelector('.dot-unread')?.remove();
      }
      updateBadge();
    }
  }
  if (selectedId !== id) return; // another message was opened meanwhile

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
      <textarea id="replyText" placeholder="Trả lời ${sender}..." rows="3" maxlength="4000"></textarea>
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

// Admin búa/lửa, or a vật phẩm / linh thú another player sent from their
// Kho đồ (giftItem / giftPet — added to the Kho đồ only on "Nhận quà").
function hasAnyGift(m) {
  return !!(m.giftHammers || m.giftStreakDays || m.giftItem || m.giftPet);
}

function giftItemLabel(it) {
  const icon = it.image ? `<img src="${esc(it.image)}" alt="">` : esc(it.emoji || '🎁');
  return `${icon} ${it.qty > 1 ? it.qty + ' × ' : ''}${esc(it.name)}`;
}

function giftPetLabel(p) {
  const art = window.Pets && window.Pets.svg ? window.Pets.svg(p.id) : '';
  return `${art ? `<span class="gift-pet-art" aria-hidden="true">${art}</span>` : '🐾'} Linh thú ${esc(p.name)}`;
}

function renderGiftBox(msg) {
  if (!hasAnyGift(msg)) return '';
  const parts = [];
  if (msg.giftHammers) parts.push(`<span class="gift-item"><img src="img/buaDaniel.jpg" alt="Búa Daniel"> ${msg.giftHammers} búa Daniel</span>`);
  if (msg.giftStreakDays) parts.push(`<span class="gift-item">🔥 ${msg.giftStreakDays} lửa (chuỗi + ví lửa)</span>`);
  if (msg.giftItem) parts.push(`<span class="gift-item">${giftItemLabel(msg.giftItem)}</span>`);
  if (msg.giftPet) parts.push(`<span class="gift-item">${giftPetLabel(msg.giftPet)}</span>`);
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
    const got = [];
    if (d.giftHammers) got.push(d.giftHammers + ' búa');
    if (d.giftStreakDays) got.push(d.giftStreakDays + ' lửa (đã cộng vào chuỗi và ví lửa)');
    if (d.item) got.push(`${d.item.qty > 1 ? d.item.qty + ' × ' : ''}${d.item.emoji} ${d.item.name} (đã vào Kho đồ)`);
    if (d.pet) got.push(`linh thú 🐾 ${d.pet.name} (đã vào Kho đồ)`);
    if (d.pet && window.Pets && window.Pets.setActive) window.Pets.setActive(d.activePet || '');
    if (window.showToast) window.showToast('🎁 Đã nhận quà: ' + got.join(', '), 'success');
    if (msg && msg._id === selectedId) selectMsg(id);
  } catch (e) {
    // 409 = already claimed (another tab / device) — show it as received
    // instead of a "Nhận quà" button that can only ever fail again.
    if (e && e.status === 409) {
      const msg = messages.find(m => m._id === id);
      if (msg) msg.giftClaimed = true;
      if (window.showToast) window.showToast('Bạn đã nhận quà này rồi.', 'info');
      if (msg && msg._id === selectedId) selectMsg(id);
      renderList();
      return;
    }
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
    const d = await apiFetch(`/user/messages/${id}/reply`, { method: 'POST', body: JSON.stringify({ body }) });
    textarea.value = '';
    // A reply to another student's message (quà / bánh kem / thách đấu) goes to the Chat bạn bè.
    if (window.showToast) window.showToast(d && d.peer ? 'Đã gửi vào Chat bạn bè' : 'Đã gửi phản hồi', 'success');
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
  const m = messages.find(x => x._id === id);
  const unclaimed = m && hasAnyGift(m) && !m.giftClaimed;
  showConfirm(unclaimed ? 'Thư này còn quà chưa nhận — xóa thư là mất quà luôn. Vẫn xóa?' : 'Xóa tin nhắn này?', async () => {
    try {
      await apiFetch(`/user/messages/${id}`, { method: 'DELETE' });
      messages = messages.filter(m => m._id !== id);
      totalMessages = Math.max(0, totalMessages - 1);
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
      if (window.showToast) window.showToast('Lỗi: ' + e.message, 'error');
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
