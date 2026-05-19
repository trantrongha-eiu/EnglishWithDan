'use strict';
const API = 'https://englishwithdan.onrender.com/api';
function authH() { return { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }; }

let messages = [];
let selectedId = null;

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authH(), ...(opts.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
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

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

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
  selectedId = id;
  const msg = messages.find(m => m._id === id);
  if (!msg) return;

  // Mark read
  if (!msg.isRead) {
    try { await apiFetch(`/user/messages/${id}/read`, { method: 'PATCH' }); } catch { /* ignore */ }
    msg.isRead = true;
    updateBadge();
  }
  renderList();

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
    <div class="detail-actions">
      <button class="btn btn-danger" onclick="deleteMsg('${id}')"><i class="fas fa-trash"></i> Xóa</button>
    </div>
  `;
}

async function deleteMsg(id) {
  if (!confirm('Xóa tin nhắn này?')) return;
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
  } catch (e) { alert(e.message); }
}

// Expose for onclick
window.selectMsg = selectMsg;
window.deleteMsg = deleteMsg;

load();
