/* ══════════════════════════════════════════════
   CONFIG & STATE
══════════════════════════════════════════════ */
const API = 'https://englishwithdan.onrender.com/api';
let allTests = [];
let allPassages = [];
let _filteredPassages = [];
let allKeys = [];
let allVocabUnits = [];
let passagePage = 1;
const PAGE_SIZE = 15;
let editPassageId = null;
let editTestId = null;
let editingUnitId = null;
let editingUnitObj = null;
let qIdx = 0;

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !['teacher', 'admin'].includes(user.role)) {
    alert('Bạn không có quyền truy cập trang này.');
    window.location.href = 'login.html';
    return;
  }

  const avatarChar = (user.username || 'A')[0].toUpperCase();
  document.getElementById('nav-avatar').textContent = avatarChar;
  document.getElementById('nav-name').textContent = user.username || 'Admin';
  document.getElementById('nav-role').textContent = user.role;
  // Topbar user
  const tbAvatar = document.getElementById('topbar-avatar');
  const tbName   = document.getElementById('topbar-username');
  if (tbAvatar) tbAvatar.textContent = avatarChar;
  if (tbName)   tbName.textContent   = user.username || 'Admin';

  await Promise.all([loadStats(), loadPassages(), loadTests(), loadKeys(), loadHistory()]);

  // Real-time polling: refresh stats + history every 30s
  setInterval(async () => {
    await Promise.all([loadStats(), loadHistory()]);
  }, 30000);
});

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function authH() {
  return { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' };
}
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.className = `show ${type}`;
  document.getElementById('toast-msg').textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function confirm2(msg, onOk) {
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('btn-confirm-ok').onclick = () => { closeModal('modal-confirm'); onOk(); };
  openModal('modal-confirm');
}
// ★ SỬA: nhận event làm tham số thứ 2 để không phụ thuộc window.event
function switchTab(tab, ev) {
  document.querySelectorAll('.tab-panels > div').forEach(d => d.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (ev) ev.currentTarget.classList.add('active');
  if (window.innerWidth <= 1024) closeSidebar();
  const titles = {
    dashboard: 'Dashboard',
    passages: 'Bài đọc (Passages)', tests: 'Bộ đề Reading',
    vocab: 'Từ vựng (Units)', keys: 'Mã truy cập',
    history: 'Lịch sử làm bài',
    listening: 'Đề Listening', writing: 'Đề Writing', speaking: 'Speaking',
    courses: 'Khóa học', users: 'Người dùng',
    'vocab-students': 'Hoạt động từ vựng',
    wp: 'Luyện viết (Writing Practice)'
  };
  document.getElementById('topbar-title').textContent = titles[tab] || tab;
  // Load lazy khi chuyển tab
  if (tab === 'vocab') loadVocabUnits();
  if (tab === 'listening') loadListeningTests();
  if (tab === 'writing') { loadTask1Pool(); loadTask2Pool(); loadWritingHistory(); loadWritingSamples(); }
  if (tab === 'speaking') { loadSpeakingQuestions(); loadSpeakingMaterials(); }
  if (tab === 'courses') loadCourses();
  if (tab === 'users') loadUsers();
  if (tab === 'vocab-students') loadVocabStudents();
  if (tab === 'history') loadHistory();       // Luôn fetch mới khi vào tab lịch sử
  if (tab === 'dashboard') loadHistory();     // Cập nhật bảng bài nộp gần nhất trên dashboard
  if (tab === 'wp') { loadWPTopics(); loadWPExercises(); }
}
function toggleSidebar() {
  const open = document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'login.html'; }
function formatDate(s) {
  if (!s) return '–';
  const d = new Date(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function pad(n) { return String(n).padStart(2, '0'); }
function formatDur(s) { if (!s) return '–'; return `${Math.floor(s / 60)}m${pad(s % 60)}s`; }
function diffBadge(d) { const m = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' }, l = { easy: 'Dễ', medium: 'TB', hard: 'Khó' }; return `<span class="badge ${m[d] || 'badge-gray'}">${l[d] || d}</span>`; }
function catBadge(c) { const m = { passage1: 'badge-blue', passage2: 'badge-purple', passage3: 'badge-red' }; return `<span class="badge ${m[c] || 'badge-gray'}">${c || '–'}</span>`; }
function bandBadge(b) { if (!b && b !== 0) return '–'; const c = b >= 7 ? 'badge-green' : b >= 5.5 ? 'badge-yellow' : 'badge-red'; return `<span class="badge ${c}">${b.toFixed(1)}</span>`; }

/* ══════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════ */
async function loadStats() {
  try {
    const data = await (await fetch(`${API}/admin/stats`, { headers: authH() })).json();
    if (!data.success) return;
    const s = data.stats;
    document.getElementById('stat-students').textContent          = s.totalStudents        ?? '–';
    document.getElementById('stat-new-week').textContent          = s.newUsersThisWeek     ?? '–';
    document.getElementById('stat-teachers').textContent          = s.totalTeachers        ?? '–';
    document.getElementById('stat-banned').textContent            = s.bannedUsers          ?? '–';
    document.getElementById('stat-reading-attempts').textContent  = s.totalReadingAttempts  ?? '–';
    document.getElementById('stat-listening-attempts').textContent= s.totalListeningAttempts?? '–';
    document.getElementById('stat-writing-attempts').textContent  = s.totalWritingAttempts  ?? '–';
    document.getElementById('stat-passages').textContent          = s.passageCount          ?? '–';
    document.getElementById('stat-reading-band').textContent      = s.avgReadingBand        ?? '–';
    document.getElementById('stat-listening-band').textContent    = s.avgListeningBand      ?? '–';
    document.getElementById('stat-vocab-units').textContent       = s.vocabUnitCount        ?? '–';
  } catch { }
}
const _skillBadge = s => {
  const map = { reading: ['badge-blue','Reading'], listening: ['badge-purple','Listening'], writing: ['badge-yellow','Writing'] };
  const [cls, label] = map[s] || ['badge-gray', s];
  return `<span class="badge ${cls}">${label}</span>`;
};

async function loadHistory() {
  try {
    const data = await fetch(`${API}/admin/recent-attempts?limit=200`, { headers: authH() }).then(r => r.json());
    if (!data.success) return;
    const attempts = data.attempts || [];

    // ── Dashboard: 10 bài nộp gần nhất ──
    document.getElementById('recent-tbody').innerHTML =
      attempts.slice(0, 10).map(h => {
        const name = h.userId?.displayName || '–';
        const score = h.skill === 'writing'
          ? (h.bandScore != null ? bandBadge(h.bandScore) : '<span style="color:var(--text3)">Chờ chấm</span>')
          : bandBadge(h.bandScore);
        const correct = (h.correctCount != null && h.totalQuestions != null)
          ? `${h.correctCount}/${h.totalQuestions}` : '–';
        const dur = h.duration != null ? formatDur(h.duration) : '–';
        return `<tr>
          <td><strong>${name}</strong></td>
          <td>${_skillBadge(h.skill)}</td>
          <td>${h.testName || '–'}</td>
          <td>${formatDate(h.date)}</td>
          <td>${score}</td>
          <td>${correct}</td>
          <td>${dur}</td>
        </tr>`;
      }).join('') || '<tr><td colspan="7" class="table-empty">Chưa có dữ liệu</td></tr>';

    // ── History tab: tất cả kỹ năng ──
    renderHistoryTable(attempts);
  } catch (err) {
    console.error(err);
  }
}

function renderHistoryTable(list) {
  document.getElementById('history-tbody').innerHTML = list.length
    ? list.map(h => {
      const name = h.userId?.displayName || '–';
      const score = h.skill === 'writing'
        ? (h.bandScore != null ? bandBadge(h.bandScore) : '<span style="color:var(--text3)">Chờ chấm</span>')
        : bandBadge(h.bandScore);
      const correct = (h.correctCount != null && h.totalQuestions != null)
        ? `${h.correctCount}/${h.totalQuestions}` : '–';
      const dur = h.duration != null ? formatDur(h.duration) : '–';
      const deleteBtn = h.skill === 'reading'
        ? `<button class="btn btn-danger btn-sm" onclick="deleteAttempt('${h._id}','reading','${name.replace(/'/g,"\\'")}')">🗑</button>`
        : h.skill === 'listening'
        ? `<button class="btn btn-danger btn-sm" onclick="deleteAttempt('${h._id}','listening','${name.replace(/'/g,"\\'")}')">🗑</button>`
        : h.skill === 'writing'
        ? `<button class="btn btn-danger btn-sm" onclick="deleteAttempt('${h._id}','writing','${name.replace(/'/g,"\\'")}')">🗑</button>`
        : '';
      return `<tr>
        <td><strong>${name}</strong></td>
        <td>${_skillBadge(h.skill)}</td>
        <td>${h.testName || '–'}</td>
        <td>${formatDate(h.date)}</td>
        <td>${dur}</td>
        <td>${correct}</td>
        <td>${score}</td>
        <td>${deleteBtn}</td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="8" class="table-empty">Chưa có kết quả</td></tr>';
}
function filterHistory() {
  const q = document.getElementById('search-history').value.toLowerCase();
  document.querySelectorAll('#history-tbody tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

/* ══════════════════════════════════════════════
   PASSAGES
══════════════════════════════════════════════ */
async function loadPassages() {
  try {
    const data = await (await fetch(`${API}/admin/passages?limit=200`, { headers: authH() })).json();
    if (!data.success) return;
    allPassages = data.passages;
    _filteredPassages = allPassages;
    document.getElementById('stat-passages').textContent = data.total;
    renderPassagesTable(_filteredPassages);
  } catch { }
}
function renderPassagesTable(list) {
  const start = (passagePage - 1) * PAGE_SIZE;
  const page = list.slice(start, start + PAGE_SIZE);
  document.getElementById('passages-tbody').innerHTML = page.length
    ? page.map(p => `<tr>
    <td><strong>${p.title}</strong></td><td>${catBadge(p.category)}</td><td>${diffBadge(p.difficulty)}</td>
    <td>${p.questions?.length || 0}</td>
    <td style="font-family:var(--mono);font-size:12px">${p.questionRange?.start}–${p.questionRange?.end}</td>
    <td><span class="badge ${p.isActive ? 'badge-green' : 'badge-gray'}"><span class="dot"></span>${p.isActive ? 'Hoạt động' : 'Ẩn'}</span></td>
    <td style="color:var(--text3)">${formatDate(p.createdAt).split(' ')[0]}</td>
    <td><div class="row-actions">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="editPassage('${p._id}')" title="Chỉnh sửa">✏️</button>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="togglePassage('${p._id}',${p.isActive})" title="${p.isActive ? 'Ẩn' : 'Hiện'}">${p.isActive ? '🙈' : '👁'}</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeletePassage('${p._id}','${p.title.replace(/'/g,"\\'")}')" title="Xóa vĩnh viễn">🗑</button>
    </div></td>
  </tr>`).join('')
    : '<tr><td colspan="8" class="table-empty">Không có bài đọc nào</td></tr>';
  const total = list.length, pages = Math.ceil(total / PAGE_SIZE);
  const pg = document.getElementById('passages-pagination');
  if (pages <= 1) { pg.innerHTML = ''; return; }
  let html = `<span class="page-info">${start + 1}–${Math.min(start + PAGE_SIZE, total)} / ${total}</span>`;
  for (let i = 1; i <= pages; i++) html += `<button class="page-btn ${i === passagePage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  pg.innerHTML = html;
}
function goPage(p) { passagePage = p; renderPassagesTable(_filteredPassages); }
function filterPassages() {
  const q = document.getElementById('search-passages').value.toLowerCase();
  const cat = document.getElementById('filter-category').value;
  passagePage = 1;
  _filteredPassages = allPassages.filter(p => (!q || p.title.toLowerCase().includes(q)) && (!cat || p.category === cat));
  renderPassagesTable(_filteredPassages);
}
async function editPassage(id) {
  const p = allPassages.find(x => x._id === id);
  try { const res = await fetch(`${API}/admin/passages/${id}`, { headers: authH() }); if (res.ok) { const d = await res.json(); openPassageModal(d.passage || p); } else openPassageModal(p); }
  catch { openPassageModal(p); }
}
async function togglePassage(id, isActive) {
  try {
    await fetch(`${API}/admin/passages/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    toast(isActive ? 'Đã ẩn bài đọc' : 'Đã hiện bài đọc'); await loadPassages();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}
function hardDeletePassage(id, title) {
  confirmAction(`Xóa VĨNH VIỄN bài đọc "${title}"? Không thể khôi phục!`, async () => {
    try {
      const res  = await fetch(`${API}/admin/passages/${id}/permanent`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn bài đọc'); await loadPassages();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════════════════════════════
   READING ADMIN – Question Group Builder
══════════════════════════════════════════════════════════════════════ */

// ── State ──────────────────────────────────────────────────────────────
let rqGroupIdx = 0;
let rqQIdx = 0;
let _rqPendingGroupContainer = null;

// ── Mở modal passage (ghi đè function cũ) ──────────────────────────────
function openPassageModal(data = null) {
  editPassageId = data?._id || null;
  rqGroupIdx = 0; rqQIdx = 0;

  document.getElementById('p-title').value = data?.title || '';
  document.getElementById('p-content').value = data?.content || '';
  document.getElementById('p-category').value = data?.category || 'passage1';
  document.getElementById('p-qstart').value = data?.questionRange?.start || '';
  document.getElementById('p-qend').value = data?.questionRange?.end || '';
  document.getElementById('p-difficulty').value = data?.difficulty || 'medium';
  document.getElementById('p-tags').value = (data?.tags || []).join(', ');
  document.getElementById('modal-passage-title').textContent = data ? 'Chỉnh sửa bài đọc' : 'Thêm bài đọc mới';

  // Clear & rebuild question groups
  const qc = document.getElementById('questions-container');
  qc.innerHTML = '';

  if (data?.questionGroups?.length) {
    data.questionGroups.forEach(g => addRQGroup(g));
  } else if (data?.questions?.length) {
    // Migration: nếu passage cũ dùng questions[] phẳng → gom vào 1 group plain
    addRQGroup({ groupType: 'plain', instruction: '', questions: data.questions });
  } else {
    addRQGroup({ groupType: 'plain' });
  }

  openModal('modal-passage');
}

// ── "＋ Thêm nhóm câu hỏi" button handler ──────────────────────────────
function openRQGroupModal(containerId) {
  _rqPendingGroupContainer = containerId;
  let modal = document.getElementById('modal-rq-group-picker');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-rq-group-picker';
    modal.className = 'modal-overlay hidden';
    modal.innerHTML = `
  <div class="modal-box" style="width:min(560px,100%)">
    <div class="modal-header">
      <h3>Chọn loại nhóm câu hỏi</h3>
      <button class="modal-close" onclick="closeModal('modal-rq-group-picker')">×</button>
    </div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
        { type: 'plain',              icon: '💬', label: 'Câu hỏi thường',          desc: 'True/False/NG, Yes/No/NG, Multiple choice, Checkbox, Fill-blank riêng lẻ' },
        { type: 'table',              icon: '📋', label: 'Bảng (Table/Note)',        desc: 'Fill-blank trong ô bảng – dùng __Q1__ làm placeholder' },
        { type: 'note-form',          icon: '📝', label: 'Note / Bullet Completion', desc: 'Điền vào dòng biểu mẫu hoặc danh sách bullet – dùng __Q6__' },
        { type: 'matching-options',   icon: '🔗', label: 'Matching / Sentence Endings / Choose Letters', desc: 'Ghép chữ cái (kéo thả). Dùng cho: Matching Features, Sentence Endings, Choose TWO/THREE letters (bật hoán đổi)' },
        { type: 'matching-headings',  icon: '📌', label: 'Matching Headings',        desc: 'List tiêu đề i,ii,iii – ghép vào đoạn văn A,B,C (kéo thả)' },
        { type: 'summary-completion', icon: '🧩', label: 'Summary Completion',       desc: 'Đoạn tóm tắt + word bank A-J chọn từ điền vào (kéo thả)' },
        { type: 'map',                icon: '🗺️', label: 'Map / Diagram',            desc: 'Điền nhãn sơ đồ – có hình ảnh chung cho nhóm' },
      ].map(g => `
          <div onclick="pickRQGroupType('${g.type}')"
               style="border:1.5px solid var(--border);border-radius:10px;padding:13px;cursor:pointer;transition:all .15s"
               onmouseover="this.style.borderColor='#3d8bff';this.style.background='rgba(61,139,255,.06)'"
               onmouseout="this.style.borderColor='var(--border)';this.style.background='transparent'">
            <div style="font-size:18px;margin-bottom:5px">${g.icon}</div>
            <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px">${g.label}</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.4">${g.desc}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
    document.body.appendChild(modal);
  }
  openModal('modal-rq-group-picker');
}

function pickRQGroupType(groupType) {
  closeModal('modal-rq-group-picker');
  addRQGroup({ groupType }, _rqPendingGroupContainer);
}

// ════════════════════════════════════════════════════════════════════════
// ADD QUESTION GROUP
// ════════════════════════════════════════════════════════════════════════
function addRQGroup(data = null, containerId = 'questions-container') {
  rqGroupIdx++;
  const gIdx = rqGroupIdx;
  const groupType = data?.groupType || 'plain';
  const container = document.getElementById(containerId);
  if (!container) return;

  const labelMap = {
    'plain':              '💬 Câu hỏi thường',
    'table':              '📋 Bảng (Table)',
    'note-form':          '📝 Note Completion',
    'matching-options':   '🔗 Matching Features/People',
    'matching-headings':  '📌 Matching Headings',
    'summary-completion': '🧩 Summary Completion',
    'sentence-endings':   '🔚 Sentence Endings',
    'bullet-list':        '• Bullet List',
    'map':                '🗺️ Map/Diagram',
  };

  const div = document.createElement('div');
  div.id = `rqg-${gIdx}`;
  div.style.cssText = 'background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px';
  div.innerHTML = `
<!-- Group header -->
<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
  <span style="background:#3d8bff;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px">
    ${labelMap[groupType] || groupType}
  </span>
  <span style="flex:1;font-size:12px;color:var(--text3)">Nhóm câu hỏi</span>
  <button class="btn btn-danger btn-sm" onclick="this.closest('[id^=rqg-]').remove()">✕ Xoá nhóm</button>
</div>
<input type="hidden" class="rqg-type" value="${groupType}" />

<!-- Tiêu đề nhóm + instruction -->
<div style="display:grid;grid-template-columns:1fr 1.8fr;gap:8px;margin-bottom:10px">
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">Tiêu đề nhóm</label>
    <input class="form-input rqg-title" value="${data?.groupTitle || ''}"
           style="font-size:12px;padding:7px 10px"
           placeholder="VD: Questions 1-5" />
  </div>
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">Hướng dẫn</label>
    <input class="form-input rqg-instruction" value="${data?.instruction || ''}"
           style="font-size:12px;padding:7px 10px"
           placeholder="VD: Choose NO MORE THAN TWO WORDS from the passage for each answer." />
  </div>
</div>

<!-- Group-type config -->
<div id="rqgcfg-${gIdx}">${renderRQGroupConfig(groupType, data, gIdx)}</div>

<!-- Questions -->
<div style="margin-top:12px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
    <span style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Câu hỏi trong nhóm</span>
    <button class="btn btn-ghost btn-sm" onclick="addRQQuestion(${gIdx},null,'${groupType}')">＋ Thêm câu</button>
  </div>
  <div id="rqqs-${gIdx}" style="display:flex;flex-direction:column;gap:8px"></div>
</div>`;

  container.appendChild(div);

  if (data?.questions?.length) {
    data.questions.forEach(q => addRQQuestion(gIdx, q, groupType));
  }
}

// ── Admin guide helper ──────────────────────────────────────────────────
function rqAdminGuide(html) {
  return `<div style="background:rgba(61,139,255,.08);border:1px solid rgba(61,139,255,.25);border-radius:7px;padding:9px 12px;margin-bottom:10px;font-size:11px;color:var(--text2);line-height:1.6">${html}</div>`;
}

// ── Group config renderers ──────────────────────────────────────────────
function renderRQGroupConfig(groupType, data, gIdx) {
  if (groupType === 'table') {
    const headers = data?.tableConfig?.headers || ['', '', ''];
    const rows = data?.tableConfig?.rows || [['', '', '']];
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    ${rqAdminGuide('📋 <strong>Table/Note Completion:</strong> Nhập tiêu đề cột, sau đó từng hàng (cách ô bằng <code>|</code>). Dùng <code>__Q1__</code> để đánh dấu ô cần điền. Câu hỏi bên dưới chỉ cần số câu + đáp án đúng.')}
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Cấu trúc bảng</div>
    <div style="margin-bottom:8px">
      <label style="font-size:10px;color:var(--text3)">Tiêu đề cột (cách nhau bằng |)</label>
      <input class="form-input rqg-tbl-headers" value="${headers.join(' | ')}"
             style="font-size:12px;padding:6px 10px;margin-top:4px"
             placeholder="Apartments | Parking | Additional information" />
    </div>
    <label style="font-size:10px;color:var(--text3)">
      Hàng – dùng <code style="background:var(--bg);padding:1px 4px;border-radius:3px">__Q1__</code> cho ô câu hỏi
    </label>
    <div id="rqgtbl-${gIdx}" style="margin-top:6px;display:flex;flex-direction:column;gap:5px">
      ${rows.map((r, ri) => renderRQTableRow(gIdx, ri, r)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addRQTableRow(${gIdx})">＋ Thêm hàng</button>
  </div>`;
  }

  if (groupType === 'note-form') {
    const title = data?.noteConfig?.title || '';
    const lines = data?.noteConfig?.lines || [''];
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    ${rqAdminGuide('📝 <strong>Note / Bullet Completion:</strong> Dùng cho cả <em>Note Form</em> (khung ghi chú) và <em>Bullet List</em> (danh sách chấm tròn). Nhập tiêu đề khung (không bắt buộc), rồi từng dòng nội dung – dùng <code>__Q6__</code> để đánh dấu chỗ trống. Câu hỏi bên dưới: loại <strong>fill-blank</strong>, đáp án là từ cần điền.')}
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Cấu trúc Note</div>
    <div style="margin-bottom:8px">
      <label style="font-size:10px;color:var(--text3)">Tiêu đề khung</label>
      <input class="form-input rqg-note-title" value="${title}"
             style="font-size:12px;padding:6px 10px;margin-top:4px"
             placeholder="VD: How Business Works" />
    </div>
    <label style="font-size:10px;color:var(--text3)">
      Dòng – dùng <code style="background:var(--bg);padding:1px 4px;border-radius:3px">__Q6__</code> cho chỗ trống
    </label>
    <div id="rqgnote-${gIdx}" style="margin-top:6px;display:flex;flex-direction:column;gap:5px">
      ${lines.map(l => renderRQNoteLine(gIdx, l)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addRQNoteLine(${gIdx})">＋ Thêm dòng</button>
  </div>`;
  }

  if (groupType === 'matching-options' || groupType === 'sentence-endings') {
    const isSentEnding = groupType === 'sentence-endings'
      || (!!(data?.endingsConfig?.endings?.length) && !(data?.matchingOptions?.length));
    const rawOpts = isSentEnding
      ? (data?.endingsConfig?.endings || []).map(e => e.text || '')
      : (data?.matchingOptions || ['', '', '', '', '', '']);
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    <div style="display:flex;gap:16px;margin-bottom:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="radio" name="lg-mo-mode-${gIdx}" class="lg-mo-mode" value="matching"
               ${!isSentEnding ? 'checked' : ''}
               style="accent-color:var(--accent)" onchange="lgToggleMOMode(${gIdx},this.value)" />
        🔗 Matching / Choose Letters
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="radio" name="lg-mo-mode-${gIdx}" class="lg-mo-mode" value="endings"
               ${isSentEnding ? 'checked' : ''}
               style="accent-color:var(--accent)" onchange="lgToggleMOMode(${gIdx},this.value)" />
        🔚 Sentence Endings
      </label>
    </div>
    <div id="lg-mo-guide-${gIdx}">
      ${!isSentEnding
        ? lgAdminGuide('🔗 <strong>Matching / Choose Letters</strong>: Nhập danh sách người/sự vật A→G, câu hỏi loại <code>matching-info</code>. Hoặc 5–7 lựa chọn cho Choose TWO/THREE letters + bật Hoán đổi thứ tự.')
        : lgAdminGuide('🔚 <strong>Sentence Endings:</strong> Nhập danh sách phần kết câu A-H. Câu hỏi bên dưới: mỗi câu = một phần đầu câu, đáp án là chữ cái phần kết (A, B, C…).')}
    </div>
    <div id="lg-mo-checkboxes-${gIdx}" style="display:${!isSentEnding ? 'flex' : 'none'};flex-wrap:wrap;gap:14px;margin-bottom:10px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="checkbox" class="lg-reuse" id="lg-reuse-${gIdx}"
               ${data?.matchingReuseAllowed ? 'checked' : ''}
               style="width:14px;height:14px;accent-color:var(--blue)" />
        NB: You may use any letter more than once
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="checkbox" class="lg-interchangeable" id="lg-interchangeable-${gIdx}"
               ${data?.interchangeableAnswers ? 'checked' : ''}
               style="width:14px;height:14px;accent-color:var(--green)" />
        <span style="color:var(--green);font-weight:600">Hoán đổi thứ tự (Choose TWO/THREE letters)</span>
      </label>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">
      ${!isSentEnding ? 'Danh sách lựa chọn (A, B, C…)' : 'Danh sách phần kết câu (A, B, C…)'}
    </div>
    <div id="lg-opts-${gIdx}" style="display:flex;flex-direction:column;gap:5px">
      ${rawOpts.map((o, i) => renderLGOption(gIdx, i, o)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addLGOption(${gIdx})">＋ Thêm mục</button>
  </div>`;
  }

  if (groupType === 'map') {
    const imgId = `rqgmap-${gIdx}`;
    const fileId = `rqgmapfile-${gIdx}`;
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    ${rqAdminGuide('🗺️ <strong>Map/Diagram Labelling:</strong> Upload hình ảnh sơ đồ hoặc paste URL. Câu hỏi bên dưới tự động chọn loại <strong>map-labelling</strong>, đáp án là nhãn điền vào sơ đồ.')}
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Map / Diagram</div>
    <div style="display:flex;gap:10px;align-items:flex-start">
      <div style="flex:1">
        <input class="form-input rqg-map-url" value="${data?.imageUrl || ''}"
               style="font-size:12px;padding:7px 10px;margin-bottom:6px"
               placeholder="URL hoặc chọn file bên dưới"
               oninput="previewRQGImage(this,'${imgId}')" />
        <div style="display:flex;gap:6px;align-items:center">
          <label style="cursor:pointer;background:var(--accent);color:#fff;font-size:11px;font-weight:600;padding:5px 10px;border-radius:6px;white-space:nowrap">
            📁 Chọn ảnh
            <input type="file" id="${fileId}" accept="image/*" style="display:none"
                   onchange="uploadRQGMapImage(this,'${imgId}')" />
          </label>
          <span style="font-size:10px;color:var(--text3)">JPG/PNG – tự động nén</span>
        </div>
      </div>
      <div id="${imgId}" style="width:160px;min-height:90px;border:1.5px dashed var(--border2);border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg);flex-shrink:0">
        ${data?.imageUrl ? `<img src="${data.imageUrl}" style="max-width:100%;max-height:120px;object-fit:contain"/>` : `<span style="font-size:11px;color:var(--text3)">Xem trước</span>`}
      </div>
    </div>
  </div>`;
  }

  if (groupType === 'matching-headings') {
    const headings = data?.headingsConfig?.headings?.length
      ? data.headingsConfig.headings
      : ROMAN.slice(0, 7).map(r => ({ numeral: r, text: '' }));
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    ${rqAdminGuide('📌 <strong>Matching Headings:</strong> Nhập danh sách tiêu đề bên dưới (số La Mã + nội dung). Câu hỏi bên dưới: <strong>Nội dung câu hỏi</strong> = tên đoạn văn (VD: <em>Section A</em>), <strong>Đáp án đúng</strong> = số La Mã tương ứng (VD: <em>v</em>). Học sinh sẽ kéo-thả tiêu đề vào đúng đoạn văn.')}
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Danh sách tiêu đề (i, ii, iii…)</div>
    <div id="rqghd-${gIdx}" style="display:flex;flex-direction:column;gap:5px">
      ${headings.map((h, i) => renderRQHeading(gIdx, i, h)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addRQHeading(${gIdx})">＋ Thêm tiêu đề</button>
  </div>`;
  }

  if (groupType === 'bullet-list') {
    const items = data?.bulletConfig?.items?.length ? data.bulletConfig.items : [''];
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    ${rqAdminGuide('• <strong>Bullet List Completion:</strong> Nhập từng dòng nội dung — dùng <code>__Q6__</code> để đánh dấu chỗ trống câu hỏi. Câu hỏi bên dưới: loại <strong>fill-blank</strong>, đáp án là từ cần điền.')}
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Danh sách dòng</div>
    <div id="rqgbul-${gIdx}" style="display:flex;flex-direction:column;gap:5px">
      ${items.map(it => renderRQBulletItem(gIdx, it)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addRQBulletItem(${gIdx})">＋ Thêm dòng</button>
  </div>`;
  }

  if (groupType === 'summary-completion') {
    const sc = data?.summaryConfig || {};
    const wb = sc.wordBank?.length ? sc.wordBank
      : 'ABCDEFGH'.split('').map(l => ({ letter: l, word: '' }));
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    ${rqAdminGuide('📄 <strong>Summary Completion:</strong> Nhập đoạn tóm tắt với <code>__Q14__</code> cho chỗ trống. Word Bank bên dưới: học sinh kéo-thả chip chữ cái vào đúng ô. Câu hỏi bên dưới chỉ cần số câu + đáp án là chữ cái (A, B, C…).')}
    <div style="margin-bottom:8px">
      <label style="font-size:10px;color:var(--text3);display:block;margin-bottom:4px">
        Đoạn tóm tắt — dùng <code style="background:var(--bg);padding:1px 4px;border-radius:3px">__Q14__</code> cho chỗ trống
      </label>
      <textarea class="form-input rqg-summary-text"
                style="font-size:12px;padding:8px 10px;min-height:100px;resize:vertical"
                placeholder="The programme focuses on __Q14__ management and __Q15__ skills…"
      >${sc.text || ''}</textarea>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Word Bank (chữ cái → từ)</div>
    <div id="rqgwb-${gIdx}" style="display:flex;flex-direction:column;gap:5px">
      ${wb.map((w, i) => renderRQWordBankItem(gIdx, i, w)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addRQWordBankItem(${gIdx})">＋ Thêm từ</button>
  </div>`;
  }

  // plain – no extra config
  return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px">
    ${rqAdminGuide('💬 <strong>Câu hỏi thường:</strong> Thêm từng câu hỏi bên dưới. Hỗ trợ: True/False/Not Given, Yes/No/Not Given, Multiple Choice (1 đáp án), Multiple Choice (nhiều đáp án), Fill in the blank.')}
  </div>`;
}

function previewRQGImage(input, imgId) {
  const url = input.value.trim();
  const el = document.getElementById(imgId);
  if (!el) return;
  el.innerHTML = url
    ? `<img src="${url}" style="max-width:100%;max-height:120px;object-fit:contain" onerror="this.parentElement.innerHTML='<span style=\\'font-size:11px;color:var(--accent)\\'>URL lỗi</span>'">`
    : `<span style="font-size:11px;color:var(--text3)">Xem trước</span>`;
}

function uploadRQGMapImage(fileInput, imgId) {
  const file = fileInput.files[0];
  if (!file) return;
  const preview = document.getElementById(imgId);
  if (preview) preview.innerHTML = `<span style="font-size:11px;color:var(--text3)">Đang nén...</span>`;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const MAX = 900;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

      if (preview) preview.innerHTML = `<span style="font-size:11px;color:var(--text3)">Đang upload...</span>`;

      fetch('/api/admin/passages/upload-map-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ imageBase64: dataUrl })
      })
      .then(r => r.json())
      .then(data => {
        if (!data.success) throw new Error(data.message || 'Upload thất bại');
        const container = fileInput.closest('[id^="rqg-"]');
        if (container) {
          const ui = container.querySelector('.rqg-map-url');
          if (ui) {
            ui.value = data.url;
            previewRQGImage(ui, imgId);
          }
        }
        if (preview) preview.innerHTML = `<img src="${data.url}" style="max-width:100%;max-height:120px;object-fit:contain"/>`;
      })
      .catch(err => {
        if (preview) preview.innerHTML = `<span style="font-size:11px;color:var(--accent)">Lỗi: ${err.message}</span>`;
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── Table row ──────────────────────────────────────────────────────────
function renderRQTableRow(_gIdx, ri, cells) {
  return `<div style="display:flex;gap:5px;align-items:center">
<span style="font-size:11px;color:var(--text3);width:18px;text-align:center">${ri + 1}</span>
<input class="form-input rqg-tbl-row" value="${(cells || []).join(' | ')}"
       style="flex:1;font-size:12px;padding:5px 9px"
       placeholder="Rose Garden | free parking | a large __Q1__" />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQTableRow(gIdx) {
  const c = document.getElementById(`rqgtbl-${gIdx}`);
  if (c) c.insertAdjacentHTML('beforeend', renderRQTableRow(gIdx, c.children.length, []));
}

// ── Note line ──────────────────────────────────────────────────────────
function renderRQNoteLine(_gIdx, line) {
  return `<div style="display:flex;gap:5px;align-items:center">
<input class="form-input rqg-note-line" value="${line || ''}"
       style="flex:1;font-size:12px;padding:5px 9px"
       placeholder="The most important aspect of business is having __Q6__ in others." />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQNoteLine(gIdx) {
  const c = document.getElementById(`rqgnote-${gIdx}`);
  if (c) c.insertAdjacentHTML('beforeend', renderRQNoteLine(gIdx, ''));
}

// ── Bullet list item ────────────────────────────────────────────────────
function renderRQBulletItem(_gIdx, item) {
  return `<div style="display:flex;gap:5px;align-items:center">
<span style="color:var(--text3);font-size:14px;flex-shrink:0">•</span>
<input class="form-input rqg-bul-item" value="${(item || '').replace(/"/g, '&quot;')}"
       style="flex:1;font-size:12px;padding:5px 9px"
       placeholder="VD: located __Q6__ km from the city" />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQBulletItem(gIdx) {
  const c = document.getElementById(`rqgbul-${gIdx}`);
  if (c) c.insertAdjacentHTML('beforeend', renderRQBulletItem(gIdx, ''));
}

// ── Matching option ────────────────────────────────────────────────────
function renderRQOption(_gIdx, i, value) {
  const letter = String.fromCharCode(65 + i);
  return `<div style="display:flex;gap:6px;align-items:center">
<span style="font-weight:700;color:var(--blue);width:18px;font-size:13px">${letter}.</span>
<input class="form-input rqg-opt-item" value="${value || ''}"
       style="flex:1;font-size:12px;padding:5px 9px"
       placeholder="Option ${letter}" />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQOption(gIdx) {
  const c = document.getElementById(`rqgopt-${gIdx}`);
  if (c) c.insertAdjacentHTML('beforeend', renderRQOption(gIdx, c.children.length, ''));
}

// ── Bullet item ────────────────────────────────────────────────────────
function renderRQBulletItem(_gIdx, item) {
  return `<div style="display:flex;gap:5px;align-items:center">
<span style="color:var(--text3)">•</span>
<input class="form-input rqg-bul-item" value="${item || ''}"
       style="flex:1;font-size:12px;padding:5px 9px"
       placeholder="Which section contains… __Q27__" />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQBulletItem(gIdx) {
  const c = document.getElementById(`rqgbul-${gIdx}`);
  if (c) c.insertAdjacentHTML('beforeend', renderRQBulletItem(gIdx, ''));
}

// ── Matching Headings ──────────────────────────────────────────────────
const ROMAN = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii'];
function renderRQHeading(_gIdx, i, h) {
  const num = h?.numeral || ROMAN[i] || (i + 1).toString();
  return `<div style="display:flex;gap:6px;align-items:center">
<span style="font-style:italic;color:var(--blue);width:26px;font-size:13px;text-align:right;flex-shrink:0">${num}.</span>
<input class="form-input rqg-hd-numeral" value="${num}" style="width:42px;font-size:12px;padding:5px 7px;font-style:italic" placeholder="i" />
<input class="form-input rqg-hd-text" value="${h?.text || ''}" style="flex:1;font-size:12px;padding:5px 9px" placeholder="The history of silk production" />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQHeading(gIdx) {
  const c = document.getElementById(`rqghd-${gIdx}`);
  if (c) c.insertAdjacentHTML('beforeend', renderRQHeading(gIdx, c.children.length, {}));
}

// ── Summary Completion Word Bank ───────────────────────────────────────
function renderRQWordBankItem(_gIdx, i, w) {
  const letter = w?.letter || String.fromCharCode(65 + i);
  return `<div style="display:flex;gap:6px;align-items:center">
<span style="font-weight:700;color:var(--blue);width:18px;font-size:13px">${letter}</span>
<input class="form-input rqg-wb-letter" value="${letter}" style="width:38px;font-size:12px;padding:5px 7px;font-weight:700" placeholder="A" />
<input class="form-input rqg-wb-word" value="${w?.word || ''}" style="flex:1;font-size:12px;padding:5px 9px" placeholder="popular" />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQWordBankItem(gIdx) {
  const c = document.getElementById(`rqgwb-${gIdx}`);
  if (c) {
    const idx = c.children.length;
    c.insertAdjacentHTML('beforeend', renderRQWordBankItem(gIdx, idx, { letter: String.fromCharCode(65 + idx), word: '' }));
  }
}

// ── Sentence Endings ───────────────────────────────────────────────────
function renderRQEnding(_gIdx, i, e) {
  const letter = e?.letter || String.fromCharCode(65 + i);
  return `<div style="display:flex;gap:6px;align-items:center">
<span style="font-weight:700;color:var(--accent);width:18px;font-size:13px">${letter}.</span>
<input class="form-input rqg-end-letter" value="${letter}" style="width:38px;font-size:12px;padding:5px 7px;font-weight:700" placeholder="A" />
<input class="form-input rqg-end-text" value="${e?.text || ''}" style="flex:1;font-size:12px;padding:5px 9px" placeholder="can be found in unusual thoughts and chance events." />
<button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:3px" onclick="this.parentElement.remove()">✕</button>
  </div>`;
}
function addRQEnding(gIdx) {
  const c = document.getElementById(`rqgend-${gIdx}`);
  if (c) {
    const idx = c.children.length;
    c.insertAdjacentHTML('beforeend', renderRQEnding(gIdx, idx, { letter: String.fromCharCode(65 + idx), text: '' }));
  }
}

// ════════════════════════════════════════════════════════════════════════
// ADD QUESTION INSIDE GROUP
// ════════════════════════════════════════════════════════════════════════

// Danh sách tất cả loại câu hỏi
const RQQ_ALL_TYPES = [
  { value: 'true-false-ng',      label: 'True / False / Not Given' },
  { value: 'yes-no-ng',          label: 'Yes / No / Not Given' },
  { value: 'multiple-choice',    label: 'Multiple Choice (1 đáp án)' },
  { value: 'checkbox',           label: 'Multiple Choice (nhiều đáp án)' },
  { value: 'fill-blank',         label: 'Fill in the blank' },
  { value: 'sentence-completion',label: 'Sentence Completion (kéo thả)' },
  { value: 'matching-headings',  label: 'Matching Headings' },
  { value: 'matching-info',      label: 'Matching Information / Sections' },
  { value: 'map-labelling',      label: 'Map Labelling' },
];

// Loại câu hỏi phù hợp cho từng kiểu nhóm
const RQQ_ALLOWED = {
  'plain':              null,   // null = tất cả loại
  'table':              ['fill-blank', 'sentence-completion'],
  'note-form':          ['fill-blank', 'sentence-completion'],
  'bullet-list':        ['fill-blank', 'sentence-completion'],
  'map':                ['map-labelling', 'fill-blank'],
  'matching-options':   ['matching-info'],
  'matching-headings':  ['matching-headings'],
  'summary-completion': ['fill-blank'],
  'sentence-endings':   ['matching-info'],
};

function getAllowedTypes(groupType, existingType) {
  const allowed = RQQ_ALLOWED[groupType];
  if (!allowed) return RQQ_ALL_TYPES; // plain → tất cả
  let list = RQQ_ALL_TYPES.filter(t => allowed.includes(t.value));
  // Luôn giữ loại hiện tại (dữ liệu cũ) dù không trong danh sách
  if (existingType && !list.find(t => t.value === existingType)) {
    const found = RQQ_ALL_TYPES.find(t => t.value === existingType);
    if (found) list = [found, ...list];
  }
  return list;
}

function addRQQuestion(gIdx, data = null, groupType = 'plain') {
  rqQIdx++;
  const qId = `rqq-${gIdx}-${rqQIdx}`;
  const container = document.getElementById(`rqqs-${gIdx}`);
  if (!container) return;

  // Smart default type based on group
  const autoType = data?.type || (
    ['note-form','table'].includes(groupType) ? 'fill-blank' :
    groupType === 'map'               ? 'map-labelling' :
    groupType === 'matching-options'  ? 'matching-info' :
    groupType === 'summary-completion'? 'fill-blank' :
    'true-false-ng'
  );

  const allowedTypes = getAllowedTypes(groupType, data?.type);
  const isSingle = allowedTypes.length === 1;
  const typeOptionsHtml = allowedTypes.map(t =>
    `<option value="${t.value}" ${autoType === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('');

  const div = document.createElement('div');
  div.id = qId;
  div.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;';
  div.innerHTML = `
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
  <span style="background:var(--accent);color:#fff;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">Q</span>
  <span style="font-size:12px;font-weight:600;flex:1">Câu hỏi</span>
  <button class="btn btn-danger btn-sm" style="padding:3px 7px;font-size:11px" onclick="this.closest('[id^=rqq-]').remove(); checkDuplicateQNum()">✕</button>
</div>
<div style="display:grid;grid-template-columns:0.6fr 1.4fr;gap:8px;margin-bottom:8px">
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:3px">Số câu *</label>
    <input class="form-input rqq-num" type="number" value="${data?.questionNumber || ''}"
           style="font-size:12px;padding:6px 9px" placeholder="#"
           oninput="checkDuplicateQNum(this)" />
    <div class="rqq-dup-warn" style="display:none;font-size:10px;color:#ef4444;margin-top:3px;font-weight:600">⚠ Số câu này đã tồn tại!</div>
  </div>
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:3px">Loại câu *</label>
    <select class="form-select rqq-type" onchange="onRQQTypeChange(this,'${qId}')"
            style="font-size:12px;padding:6px 9px${isSingle ? ';opacity:.65;pointer-events:none' : ''}">
      ${typeOptionsHtml}
    </select>
    ${isSingle ? `<div style="font-size:10px;color:var(--text3);margin-top:3px">💡 Loại câu cố định cho nhóm này</div>` : ''}
  </div>
</div>
<div id="rqqguide-${qId}" style="font-size:11px;line-height:1.6;border-radius:7px;padding:8px 11px;margin-bottom:8px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af">${getRQQTypeGuide(autoType)}</div>
<div style="margin-bottom:8px">
  <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:3px">Nội dung câu hỏi *</label>
  <textarea class="form-input rqq-text" rows="2" style="font-size:12px;padding:6px 9px;resize:vertical"
    placeholder="Nội dung câu hỏi...">${(data?.questionText || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
</div>
<div class="rqq-extra" id="rqqex-${qId}">${renderRQQExtra(autoType, data)}</div>
<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:8px;margin-top:8px">
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:3px">Đáp án đúng *</label>
    <input class="form-input rqq-answer" value="${data?.correctAnswer || ''}"
           style="font-size:12px;padding:6px 9px"
           placeholder='text (nhiều đáp án: word1 / word2)' />
    <div class="rqq-answer-hint" style="font-size:10px;color:var(--text3);margin-top:3px">${getRQQAnswerHint(autoType)}</div>
  </div>
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:3px">Giải thích</label>
    <textarea class="form-input rqq-explain" rows="3"
              style="font-size:12px;padding:6px 9px;resize:vertical"
              placeholder="Giải thích đáp án...">${(data?.explanation || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
  </div>
</div>`;
  container.appendChild(div);
}

function getRQQTypeGuide(type) {
  const guides = {
    'true-false-ng':     '✅ <strong>True / False / Not Given</strong> — Đọc passage, xác định câu đúng/sai/không có thông tin.<br>• <strong>Đáp án đúng:</strong> nhập <code>TRUE</code>, <code>FALSE</code> hoặc <code>NOT GIVEN</code>.',
    'yes-no-ng':         '✅ <strong>Yes / No / Not Given</strong> — Xác định ý kiến/quan điểm đồng ý/không đồng ý/không đề cập.<br>• <strong>Đáp án đúng:</strong> nhập <code>YES</code>, <code>NO</code> hoặc <code>NOT GIVEN</code>.',
    'multiple-choice':   '🔘 <strong>Multiple Choice (1 đáp án)</strong> — Học sinh chọn 1 trong các lựa chọn A, B, C, D.<br>• Nhập 4 options A-D bên dưới. <strong>Đáp án đúng:</strong> nhập chữ cái VD <code>A</code>.',
    'checkbox':          '☑️ <strong>Multiple Choice (nhiều đáp án)</strong> — Học sinh chọn nhiều ô, nhập số ô muốn chọn.<br>• Nhập options và số lượng cần chọn. <strong>Đáp án đúng:</strong> <code>["A","C"]</code>.',
    'fill-blank':        '✏️ <strong>Fill in the blank</strong> — Học sinh điền từ/cụm từ vào ô trống.<br>• Không cần nhập options.<br>• <strong>Đáp án đúng:</strong> nhập chính xác từ/cụm từ cần điền, VD: <code>kiln</code>',
    'sentence-completion':'🔗 <strong>Sentence Completion (kéo thả)</strong> — Học sinh kéo từ trong Word Bank vào chỗ trống.<br>• <strong>Đáp án đúng:</strong> nhập từ thực tế trong Word Bank.',
    'matching-headings': '📌 <strong>Matching Headings</strong> — Học sinh ghép tiêu đề (i, ii, iii…) với đoạn văn.<br>• <strong>Đáp án đúng:</strong> nhập chữ số La Mã VD <code>iii</code>.',
    'matching-info':     '🔗 <strong>Matching Information</strong> — Học sinh ghép phát biểu với người/sự vật A-G.<br>• <strong>Đáp án đúng:</strong> nhập chữ cái VD <code>B</code>.',
    'map-labelling':     '🗺️ <strong>Map Labelling</strong> — Học sinh điền nhãn vào sơ đồ/bản đồ.<br>• Không cần options.<br>• <strong>Đáp án đúng:</strong> nhập nhãn cần điền, VD: <code>library</code>',
  };
  return guides[type] || '';
}

function getRQQAnswerHint(type) {
  const hints = {
    'true-false-ng':     '💡 TRUE / FALSE / NOT GIVEN',
    'yes-no-ng':         '💡 YES / NO / NOT GIVEN',
    'multiple-choice':   '💡 Nhập chữ cái: A, B, C hoặc D',
    'checkbox':          '💡 VD: ["A","C"] — mảng các chữ cái',
    'fill-blank':        '💡 Nhập từ/cụm từ cần điền. Nhiều đáp án: word1 / word2',
    'sentence-completion':'💡 Nhập từ thực tế trong Word Bank',
    'matching-headings': '💡 Nhập số La Mã: i, ii, iii…',
    'matching-info':     '💡 Nhập chữ cái: A, B, C…',
    'map-labelling':     '💡 Nhập tên/nhãn trên sơ đồ',
  };
  return hints[type] || '';
}

function renderRQQExtra(type, data) {
  if (type === 'multiple-choice') {
    const opts = data?.options || ['', '', '', ''];
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Các đáp án A-D</label>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:4px">
    ${['A', 'B', 'C', 'D'].map((l, i) => `
      <div style="display:flex;align-items:center;gap:5px">
        <span style="font-weight:700;color:var(--accent);width:14px;font-size:12px">${l}.</span>
        <input class="form-input rqq-opt" value="${opts[i] || ''}" style="font-size:12px;padding:5px 8px" placeholder="${l}"/>
      </div>`).join('')}
  </div></div>`;
  }
  if (type === 'checkbox') {
    const opts = data?.options || [];
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Các đáp án A-E</label>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:4px">
    ${['A', 'B', 'C', 'D', 'E'].map((l, i) => `
      <div style="display:flex;align-items:center;gap:5px">
        <span style="font-weight:700;color:var(--accent);width:14px;font-size:12px">${l}.</span>
        <input class="form-input rqq-opt" value="${opts[i] || ''}" style="font-size:12px;padding:5px 8px" placeholder="${l}"/>
      </div>`).join('')}
  </div>
  <div style="margin-top:7px;display:flex;align-items:center;gap:8px">
    <label style="font-size:10px;color:var(--text3);white-space:nowrap">Số đáp án cần chọn:</label>
    <input class="form-input rqq-cbcount" type="number" value="${data?.checkboxCount || 2}"
           style="width:55px;font-size:12px;padding:5px 8px" min="1" max="5"/>
  </div></div>`;
  }
  if (type === 'sentence-completion') {
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Word Bank (cách nhau bằng dấu phẩy)</label>
  <input class="form-input rqq-wordbank" value="${(data?.wordBank || []).join(', ')}"
         style="font-size:12px;padding:6px 9px;margin-top:4px"
         placeholder="word1, phrase two, word3" /></div>`;
  }
  // matching-info và matching-headings: options đã được định nghĩa ở group level, không cần word bank riêng
  if (type === 'map-labelling') {
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Hình ảnh riêng (nếu không dùng hình chung của nhóm)</label>
  <input class="form-input rqq-imageurl" value="${data?.imageUrl || ''}"
         style="font-size:12px;padding:6px 9px;margin-top:4px" placeholder="URL hình (để trống nếu dùng hình nhóm)"/></div>`;
  }
  return ''; // true-false-ng và fill-blank không cần extra
}

function onRQQTypeChange(sel, qId) {
  document.getElementById(`rqqex-${qId}`).innerHTML = renderRQQExtra(sel.value, {});
  const guide = document.getElementById(`rqqguide-${qId}`);
  if (guide) guide.innerHTML = getRQQTypeGuide(sel.value);
  const qDiv = sel.closest('[id^="rqq-"]');
  if (qDiv) {
    const hint = qDiv.querySelector('.rqq-answer-hint');
    if (hint) hint.textContent = getRQQAnswerHint(sel.value);
    const answerInput = qDiv.querySelector('.rqq-answer');
    if (answerInput) {
      const placeholders = {
        'true-false-ng': 'TRUE / FALSE / NOT GIVEN',
        'yes-no-ng':     'YES / NO / NOT GIVEN',
        'multiple-choice': 'A, B, C hoặc D',
        'checkbox': '["A","C"]',
        'fill-blank': 'Từ/cụm từ cần điền',
        'sentence-completion': 'Từ trong Word Bank',
        'matching-headings': 'i, ii, iii…',
        'matching-info': 'A, B, C…',
        'map-labelling': 'Nhãn trên sơ đồ',
      };
      answerInput.placeholder = placeholders[sel.value] || '';
    }
  }
}

// ════════════════════════════════════════════════════════════════════════
// DUPLICATE QUESTION NUMBER CHECK
// ════════════════════════════════════════════════════════════════════════
function checkDuplicateQNum(changedInput) {
  // Thu thập tất cả .rqq-num trong cùng passage modal
  const allInputs = [...document.querySelectorAll('#questions-container .rqq-num')];

  // Build map: number → danh sách input có cùng số
  const numMap = {};
  allInputs.forEach(inp => {
    const v = inp.value.trim();
    if (!v) return;
    if (!numMap[v]) numMap[v] = [];
    numMap[v].push(inp);
  });

  // Cập nhật trạng thái từng input
  allInputs.forEach(inp => {
    const v = inp.value.trim();
    const isDup = v && numMap[v] && numMap[v].length > 1;
    const warn  = inp.parentElement.querySelector('.rqq-dup-warn');

    if (isDup) {
      inp.style.borderColor  = '#ef4444';
      inp.style.background   = '#2d1515';
      if (warn) warn.style.display = 'block';
    } else {
      inp.style.borderColor  = '';
      inp.style.background   = '';
      if (warn) warn.style.display = 'none';
    }
  });
}

// Kiểm tra số câu trùng cho Listening (lq-num)
function checkDuplicateLQNum() {
  const allInputs = [...document.querySelectorAll('#lt-sections-container .lq-num')];
  const numMap = {};
  allInputs.forEach(inp => {
    const v = inp.value.trim();
    if (!v) return;
    if (!numMap[v]) numMap[v] = [];
    numMap[v].push(inp);
  });
  allInputs.forEach(inp => {
    const v    = inp.value.trim();
    const isDup = v && numMap[v] && numMap[v].length > 1;
    const warn  = inp.parentElement.querySelector('.lq-dup-warn');
    if (isDup) {
      inp.style.borderColor = '#ef4444';
      inp.style.background  = '#2d1515';
      if (warn) warn.style.display = 'block';
    } else {
      inp.style.borderColor = '';
      inp.style.background  = '';
      if (warn) warn.style.display = 'none';
    }
  });
}

// ════════════════════════════════════════════════════════════════════════
// COLLECT & SAVE
// ════════════════════════════════════════════════════════════════════════
function collectQuestions() {
  // Ghi đè function cũ - collect theo questionGroups mới
  const questionGroups = [];

  for (const gDiv of document.querySelectorAll('#questions-container [id^="rqg-"]')) {
    const groupType = gDiv.querySelector('.rqg-type')?.value || 'plain';
    const groupTitle = gDiv.querySelector('.rqg-title')?.value.trim() || '';
    const instruction = gDiv.querySelector('.rqg-instruction')?.value.trim() || '';

    const group = { groupType, groupTitle, instruction };

    // Collect group-type config
    if (groupType === 'table') {
      const rawH = gDiv.querySelector('.rqg-tbl-headers')?.value || '';
      group.tableConfig = {
        headers: rawH.split('|').map(h => h.trim()).filter(Boolean),
        rows: [...gDiv.querySelectorAll('.rqg-tbl-row')].map(inp =>
          inp.value.split('|').map(c => c.trim())
        )
      };
    }
    if (groupType === 'note-form') {
      group.noteConfig = {
        title: gDiv.querySelector('.rqg-note-title')?.value.trim() || '',
        lines: [...gDiv.querySelectorAll('.rqg-note-line')].map(i => i.value)
      };
    }
    if (groupType === 'matching-options' || groupType === 'sentence-endings') {
      // Cả 2 loại giờ dùng chung UI với radio lg-mo-mode
      const moMode = gDiv.querySelector('.lg-mo-mode:checked')?.value || 'matching';
      const opts = [...gDiv.querySelectorAll('.lg-opt')].map(i => i.value.trim());
      if (moMode === 'endings') {
        group.groupType = 'sentence-endings';
        group.endingsConfig = {
          endings: opts.map((text, i) => ({ letter: 'ABCDEFGHIJ'[i] || String(i+1), text }))
        };
      } else {
        group.matchingOptions = opts;
        group.matchingReuseAllowed = gDiv.querySelector('.lg-reuse')?.checked || false;
        group.interchangeableAnswers = gDiv.querySelector('.lg-interchangeable')?.checked || false;
      }
    }
    if (groupType === 'bullet-list') {
      group.bulletConfig = {
        items: [...gDiv.querySelectorAll('.rqg-bul-item')].map(i => i.value)
      };
    }
    if (groupType === 'map') {
      group.imageUrl = gDiv.querySelector('.rqg-map-url')?.value.trim() || '';
    }
    if (groupType === 'matching-headings') {
      const hdCont = gDiv.querySelector('[id^="rqghd-"]');
      group.headingsConfig = {
        headings: hdCont ? [...hdCont.children].map(row => ({
          numeral: row.querySelector('.rqg-hd-numeral')?.value.trim() || '',
          text:    row.querySelector('.rqg-hd-text')?.value.trim() || ''
        })).filter(h => h.numeral || h.text) : []
      };
    }
    if (groupType === 'summary-completion') {
      const wbCont = gDiv.querySelector('[id^="rqgwb-"]');
      group.summaryConfig = {
        text:    gDiv.querySelector('.rqg-summary-text')?.value || '',
        wordBank: wbCont ? [...wbCont.children].map(row => ({
          letter: row.querySelector('.rqg-wb-letter')?.value.trim() || '',
          word:   row.querySelector('.rqg-wb-word')?.value.trim() || ''
        })).filter(w => w.letter) : []
      };
    }

    // Collect questions
    const questions = [];
    for (const qDiv of gDiv.querySelectorAll('[id^="rqq-"]')) {
      const num = parseInt(qDiv.querySelector('.rqq-num')?.value || '0');
      const type = qDiv.querySelector('.rqq-type')?.value || '';
      const text = (qDiv.querySelector('.rqq-text')?.value || '').trim();
      const answer = (qDiv.querySelector('.rqq-answer')?.value || '').trim();
      const expl = (qDiv.querySelector('.rqq-explain')?.value || '').trim();
      if (!num || !text || !answer) {
        toast(`Điền đầy đủ số câu, nội dung và đáp án (câu ${num || '?'})`, 'error');
        return null;
      }
      const q = { questionNumber: num, type, questionText: text, correctAnswer: answer, explanation: expl };
      if (['multiple-choice', 'checkbox'].includes(type))
        q.options = [...qDiv.querySelectorAll('.rqq-opt')].map(i => i.value.trim()).filter(Boolean);
      if (type === 'checkbox')
        q.checkboxCount = parseInt(qDiv.querySelector('.rqq-cbcount')?.value) || 2;
      if (type === 'sentence-completion') {
        const wb = qDiv.querySelector('.rqq-wordbank')?.value || '';
        q.wordBank = wb.split(',').map(w => w.trim()).filter(Boolean);
      }
      if (type === 'map-labelling')
        q.imageUrl = qDiv.querySelector('.rqq-imageurl')?.value.trim() || '';
      questions.push(q);
    }
    group.questions = questions;
    if (questions.length === 0) continue; // bỏ qua nhóm rỗng (không có câu hỏi) để không tích lũy nhóm thừa
    questionGroups.push(group);
  }
  return questionGroups; // trả về groups, savePassage() sẽ dùng làm questionGroups
}

// ── Patch savePassage để gửi questionGroups ──────────────────────────────
async function savePassage() {
  const title = document.getElementById('p-title').value.trim();
  const content = document.getElementById('p-content').value.trim();
  const qstart = Number(document.getElementById('p-qstart').value);
  const qend = Number(document.getElementById('p-qend').value);
  if (!title || !content || !qstart || !qend) { toast('Điền đầy đủ trường bắt buộc *', 'error'); return; }

  const btn = document.getElementById('btn-save-passage');
  btn.disabled = true; btn.textContent = 'Đang lưu...';
  try {
    // collectQuestions bên trong try để bắt mọi lỗi JS và hiển thị thông báo
    const questionGroups = collectQuestions();
    if (!questionGroups) { btn.disabled = false; btn.textContent = 'Lưu bài đọc'; return; }

    // Flatten để gửi kèm questions[] (tương thích ngược với route cũ)
    const questions = questionGroups.flatMap(g => g.questions);

    const body = {
      title,
      category: document.getElementById('p-category').value,
      content,
      questionRange: { start: qstart, end: qend },
      difficulty: document.getElementById('p-difficulty').value,
      tags: document.getElementById('p-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      questionGroups,
      questions      // giữ lại để tương thích
    };

    const url = editPassageId ? `${API}/admin/passages/${editPassageId}` : `${API}/admin/passages`;
    const res = await fetch(url, { method: editPassageId ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(body) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || `HTTP ${res.status}`);
    toast(editPassageId ? 'Đã cập nhật' : 'Đã thêm bài đọc mới');
    closeModal('modal-passage'); await loadPassages();
  } catch (err) {
    console.error('[savePassage]', err);
    toast('Lỗi: ' + (err.message || 'Không xác định'), 'error');
  } finally { btn.disabled = false; btn.textContent = 'Lưu bài đọc'; }
}



/* ══════════════════════════════════════════════
   TESTS
══════════════════════════════════════════════ */
async function loadTests() {
  try {
    const data = await (await fetch(`${API}/admin/tests`, { headers: authH() })).json();
    if (!data.success) return;
    allTests = data.tests; renderTestsTable(data.tests);
    // Dropdown k-test sẽ do openKeyModal() populate riêng
  } catch { }
}
function renderTestsTable(list) {
  document.getElementById('tests-tbody').innerHTML = list.length
    ? list.map(t => `<tr>
  <td><strong>${t.name}</strong></td>
  <td style="font-family:var(--mono)">${t.testNumber}</td>
  <td>${t.seriesName || '–'}</td>
  <td id="tstat-${t._id}" style="font-size:12px;color:var(--text3)">–</td>
  <td><span class="badge ${t.isActive ? 'badge-green' : 'badge-gray'}"><span class="dot"></span>${t.isActive ? 'Hoạt động' : 'Ẩn'}</span></td>
  <td style="color:var(--text3)">${formatDate(t.createdAt).split(' ')[0]}</td>
  <td><div class="row-actions">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="copyTestLink('${t._id}')" title="Copy link chia sẻ">🔗</button>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="editTest('${t._id}')" title="Chỉnh sửa">✏️</button>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleReadingTest('${t._id}',${t.isActive})" title="${t.isActive ? 'Ẩn' : 'Hiện'}">${t.isActive ? '🙈' : '👁'}</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeleteTest('${t._id}','${t.name.replace(/'/g,"\\'")}')" title="Xóa vĩnh viễn">🗑</button>
  </div></td></tr>`).join('')
    : '<tr><td colspan="7" class="table-empty">Chưa có bộ đề nào</td></tr>';
}

function filterTests() {
  const q      = (document.getElementById('search-tests')?.value || '').toLowerCase();
  const status = document.getElementById('filter-tests-status')?.value || '';
  let list = allTests;
  if (q)      list = list.filter(t => t.name.toLowerCase().includes(q) || (t.seriesName || '').toLowerCase().includes(q));
  if (status === 'active')  list = list.filter(t => t.isActive);
  if (status === 'hidden')  list = list.filter(t => !t.isActive);
  renderTestsTable(list);
}

function copyTestLink(testId) {
  const base = location.origin + location.pathname.replace(/admin\.html.*$/, '');
  const url  = `${base}reading.html?testId=${testId}`;
  navigator.clipboard.writeText(url)
    .then(() => toast('Đã copy link chia sẻ ✓'))
    .catch(() => toast('Không thể copy, hãy copy thủ công: ' + url, 'error'));
}
function openTestModal(data = null) {
  editTestId = data?._id || null;
  document.getElementById('t-name').value = data?.name || '';
  document.getElementById('t-series').value = data?.seriesName || '';
  document.getElementById('t-number').value = data?.testNumber || '';
  document.getElementById('modal-test-title').textContent = data ? 'Chỉnh sửa bộ đề' : 'Tạo bộ đề mới';
  openModal('modal-test');
}
function editTest(id) { openTestModal(allTests.find(x => x._id === id)); }
async function saveTest() {
  const name = document.getElementById('t-name').value.trim();
  if (!name) { toast('Nhập tên bộ đề', 'error'); return; }
  const body = { name, seriesName: document.getElementById('t-series').value.trim(), testNumber: Number(document.getElementById('t-number').value) || 1 };
  try {
    const url = editTestId ? `${API}/admin/tests/${editTestId}` : `${API}/admin/tests`;
    const data = await (await fetch(url, { method: editTestId ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(body) })).json();
    if (!data.success) throw new Error(data.message);
    toast(editTestId ? 'Đã cập nhật' : 'Đã tạo bộ đề mới');
    closeModal('modal-test'); await loadTests();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function toggleReadingTest(id, isActive) {
  try {
    const res  = await fetch(`${API}/admin/tests/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(isActive ? 'Đã ẩn bộ đề' : 'Đã hiện bộ đề'); await loadTests();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}
function hardDeleteTest(id, name) {
  confirmAction(`Xóa VĨNH VIỄN bộ đề "${name}"? Không thể khôi phục!`, async () => {
    try {
      const res  = await fetch(`${API}/admin/tests/${id}/permanent`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn bộ đề'); await loadTests();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════
   KEYS
══════════════════════════════════════════════ */
async function loadKeys() {
  try {
    const data = await (await fetch(`${API}/admin/keys`, { headers: authH() })).json();
    if (!data.success) return;
    allKeys = data.keys; renderKeysTable(data.keys);
  } catch { }
}
function renderKeysTable(list) {
  document.getElementById('keys-tbody').innerHTML = list.length
    ? list.map(k => {
      const pct = Math.round((k.currentUses / k.maxUses) * 100);
      const used = k.currentUses >= k.maxUses, exp2 = k.expiresAt && new Date() > new Date(k.expiresAt);
      const status = !k.isActive ? 'Vô hiệu' : used ? 'Hết lượt' : exp2 ? 'Hết hạn' : 'Còn dùng';
      const cls = !k.isActive || used || exp2 ? 'badge-gray' : 'badge-green';
      return `<tr><td><span class="key-code">${k.key}</span></td>
    <td>
  ${k.testId?.name
          ? `${k.testType === 'listening' ? '🎧' : k.testType === 'writing' ? '✏️' : '📖'} ${k.testId.name}`
          : k.testType === 'listening'
            ? '<span style="color:var(--blue)">🎧 Tất cả Listening</span>'
            : k.testType === 'reading'
              ? '<span style="color:var(--green)">📖 Tất cả Reading</span>'
              : k.testType === 'writing'
                ? '<span style="color:var(--purple)">✏️ Tất cả Writing</span>'
                : '<span style="color:var(--text3)">Tất cả</span>'
        }
</td>
    <td><span class="key-uses">${k.currentUses}/${k.maxUses}</span>
      <div class="prog-bar"><div class="prog-bar-fill" style="width:${pct}%;background:${pct >= 100 ? 'var(--accent)' : 'var(--green)'}"></div></div></td>
    <td style="color:var(--text3);font-size:12px">${k.expiresAt ? formatDate(k.expiresAt) : '–'}</td>
    <td><span class="badge ${cls}"><span class="dot"></span>${status}</span></td>
    <td style="color:var(--text3);font-size:12px">${formatDate(k.createdAt).split(' ')[0]}</td>
    <td><button class="btn btn-danger btn-sm btn-icon" onclick="deactivateKey('${k._id}')" title="Vô hiệu hoá">✕</button></td></tr>`;
    }).join('')
    : '<tr><td colspan="7" class="table-empty">Chưa có key nào</td></tr>';
}
function filterKeys() {
  const q      = (document.getElementById('search-keys')?.value || '').toLowerCase();
  const type   = document.getElementById('filter-keys-type')?.value || '';
  const status = document.getElementById('filter-keys-status')?.value || '';
  let list = allKeys;
  if (q)    list = list.filter(k => k.key.toLowerCase().includes(q) || (k.testId?.name || '').toLowerCase().includes(q));
  if (type) list = list.filter(k => (k.testType || '') === type);
  if (status === 'active') {
    list = list.filter(k => {
      const expired = k.expiresAt && new Date() > new Date(k.expiresAt);
      return k.isActive && k.currentUses < k.maxUses && !expired;
    });
  }
  if (status === 'used') {
    list = list.filter(k => {
      const expired = k.expiresAt && new Date() > new Date(k.expiresAt);
      return !k.isActive || k.currentUses >= k.maxUses || expired;
    });
  }
  renderKeysTable(list);
}

async function openKeyModal() {
  document.getElementById('generated-keys').classList.add('hidden');
  document.getElementById('k-count').value = 1;
  document.getElementById('k-maxuses').value = 1;
  document.getElementById('k-expiry').value = '';
  document.getElementById('k-test').innerHTML = '<option value="">Tất cả bộ đề</option>';

  // Load reading + listening + writing tests vào dropdown
  try {
    const [rdRes, lsRes, wrRes] = await Promise.all([
      fetch(`${API}/admin/tests`, { headers: authH() }),
      fetch(`${API}/admin/listening-tests`, { headers: authH() }),
      fetch(`${API}/admin/writing-tests`, { headers: authH() })
    ]);
    const rdData = await rdRes.json();
    const lsData = await lsRes.json();
    const wrData = await wrRes.json();

    const rdTests = rdData.success ? rdData.tests : [];
    const lsTests = lsData.success ? lsData.tests : [];
    const wrTests = wrData.success ? wrData.exams : [];

    const sel = document.getElementById('k-test');
    if (rdTests.length) {
      const grp = document.createElement('optgroup');
      grp.label = '📖 Reading';
      rdTests.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t._id; opt.dataset.type = 'reading';
        opt.textContent = t.name;
        grp.appendChild(opt);
      });
      sel.appendChild(grp);
    }
    if (lsTests.length) {
      const grp = document.createElement('optgroup');
      grp.label = '🎧 Listening';
      lsTests.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t._id; opt.dataset.type = 'listening';
        opt.textContent = t.name;
        grp.appendChild(opt);
      });
      sel.appendChild(grp);
    }
    if (wrTests.length) {
      const grp = document.createElement('optgroup');
      grp.label = '✏️ Writing';
      wrTests.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t._id; opt.dataset.type = 'writing';
        opt.textContent = t.name;
        grp.appendChild(opt);
      });
      sel.appendChild(grp);
    }
  } catch { toast('Không load được danh sách đề', 'error'); }

  openModal('modal-key');
}
async function generateKeys() {
  const btn = document.getElementById('btn-gen-keys');
  btn.disabled = true; btn.textContent = 'Đang tạo...';
  try {
    const kTestSel = document.getElementById('k-test');
    const selectedOpt = kTestSel.options[kTestSel.selectedIndex];
    const testId = kTestSel.value || null;
    // Lấy testType từ data-type của option được chọn
    const testType = testId ? (selectedOpt?.dataset?.type || null) : null;

    const data = await (await fetch(`${API}/admin/keys/generate`, {
      method: 'POST', headers: authH(), body: JSON.stringify({
        count: Number(document.getElementById('k-count').value) || 1,
        maxUses: Number(document.getElementById('k-maxuses').value) || 1,
        testId,
        testType,
        expiryDays: document.getElementById('k-expiry').value ? Number(document.getElementById('k-expiry').value) : null
      })
    })).json();
    if (!data.success) throw new Error(data.message);
    const wrap = document.getElementById('generated-keys');
    document.getElementById('keys-list-display').innerHTML = data.keys.map(k => `<div class="key-chip" onclick="copyKey('${k}')">${k}</div>`).join('');
    wrap.classList.remove('hidden'); wrap._keys = data.keys;
    toast(`Đã tạo ${data.keys.length} key`); await loadKeys();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Tạo key'; }
}
function copyKey(key) { navigator.clipboard.writeText(key).then(() => toast(`Đã copy: ${key}`, 'info')); }
function copyAllKeys() { const k = document.getElementById('generated-keys')._keys || []; navigator.clipboard.writeText(k.join('\n')).then(() => toast(`Đã copy ${k.length} keys`, 'info')); }
async function deactivateKey(id) {
  confirm2('Vô hiệu hoá key này?', async () => {
    await fetch(`${API}/admin/keys/${id}`, { method: 'DELETE', headers: authH() });
    toast('Đã vô hiệu hoá'); await loadKeys();
  });
}

/* ══════════════════════════════════════════════
   ★ VOCAB UNITS
══════════════════════════════════════════════ */
async function loadVocabUnits() {
  try {
    const data = await (await fetch(`${API}/vocab/admin/units`, { headers: authH() })).json();
    if (!data.success) return;
    allVocabUnits = data.units;
    renderVocabUnitsTable(data.units);
  } catch (err) {
    document.getElementById('vocab-units-tbody').innerHTML =
      `<tr><td colspan="7" class="table-empty">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
  }
}

function renderVocabUnitsTable(list) {
  const tbody = document.getElementById('vocab-units-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-empty">Chưa có Unit nào. Nhấn "+ Tạo Unit" hoặc "📂 Import JSON".</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(u => `
  <tr draggable="true" data-id="${u._id}" data-sort="${u.sortOrder ?? u.unitNumber}">
    <td class="drag-handle" title="Kéo để đổi vị trí" style="cursor:grab;color:var(--text3);font-size:16px;text-align:center;padding:0 6px">⠿</td>
    <td style="font-family:var(--mono);font-weight:700;color:var(--yellow)">${String(u.unitNumber).padStart(2, '0')}</td>
    <td><strong>${u.title}</strong></td>
    <td><span class="badge badge-blue">${u.level || 'B1'}</span></td>
    <td style="font-weight:600;color:var(--text)">${u.wordCount} từ</td>
    <td>
      <span class="badge ${u.isActive ? 'badge-green' : 'badge-gray'}">
        <span class="dot"></span>${u.isActive ? 'Hoạt động' : 'Ẩn'}
      </span>
    </td>
    <td style="color:var(--text3);font-size:12px">${formatDate(u.createdAt).split(' ')[0]}</td>
    <td><div class="row-actions">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="openUnitWordsModal('${u._id}')" title="Quản lý từ vựng">📝</button>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="editUnit('${u._id}')" title="Chỉnh sửa">✏️</button>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleUnitActive('${u._id}',${u.isActive})" title="${u.isActive ? 'Ẩn' : 'Hiện'}">${u.isActive ? '🙈' : '👁'}</button>
      <button class="btn btn-sm btn-icon" onclick="deleteUnit('${u._id}','${escH(u.title)}')" title="Xoá unit" style="color:#ef4444;background:none;border:none;cursor:pointer;font-size:15px">🗑</button>
    </div></td>
  </tr>`).join('');
  initUnitDragDrop(tbody);
}

let _dragSrcRow = null;
function initUnitDragDrop(tbody) {
  tbody.querySelectorAll('tr[draggable]').forEach(row => {
    row.addEventListener('dragstart', e => {
      _dragSrcRow = row;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => {
      _dragSrcRow = null;
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('dragging', 'drag-over'));
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (row === _dragSrcRow) return;
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('drag-over'));
      row.classList.add('drag-over');
    });
    row.addEventListener('drop', e => {
      e.preventDefault();
      if (!_dragSrcRow || _dragSrcRow === row) return;
      const rows = [...tbody.querySelectorAll('tr')];
      const srcIdx = rows.indexOf(_dragSrcRow);
      const dstIdx = rows.indexOf(row);
      if (srcIdx < dstIdx) row.after(_dragSrcRow);
      else row.before(_dragSrcRow);
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('drag-over'));
      reorderUnits(tbody);
    });
  });
}

async function reorderUnits(tbody) {
  const items = [...tbody.querySelectorAll('tr[data-id]')].map((r, i) => ({ _id: r.dataset.id }));
  try {
    const data = await (await fetch(`${API}/vocab/admin/units/reorder`, {
      method: 'PATCH', headers: authH(), body: JSON.stringify(items)
    })).json();
    if (!data.success) throw new Error(data.message);
    toast('Đã lưu thứ tự');
    await loadVocabUnits(); // reload to show updated unitNumbers
  } catch { toast('Lỗi lưu thứ tự', 'error'); }
}

function deleteUnit(id, title) {
  confirmAction(`Xoá hẳn Unit "${title}"? Hành động này không thể hoàn tác.`, async () => {
    try {
      const data = await (await fetch(`${API}/vocab/admin/units/${id}`, { method: 'DELETE', headers: authH() })).json();
      if (!data.success) throw new Error(data.message);
      toast(`Đã xoá "${title}"`);
      await loadVocabUnits();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

function filterVocabUnits() {
  const q = document.getElementById('search-vocab').value.toLowerCase();
  renderVocabUnitsTable(allVocabUnits.filter(u =>
    u.title.toLowerCase().includes(q) || String(u.unitNumber).includes(q)
  ));
}

/* ── Tạo / Sửa Unit ── */
function openUnitModal(data = null) {
  editingUnitId = data?._id || null;
  document.getElementById('u-number').value = data?.unitNumber || '';
  document.getElementById('u-title').value = data?.title || '';
  document.getElementById('u-desc').value = data?.description || '';
  document.getElementById('u-level').value = data?.level || 'B1';
  document.getElementById('modal-unit-title').textContent = data ? 'Chỉnh sửa Unit' : 'Tạo Unit mới';
  openModal('modal-unit');
  setTimeout(() => document.getElementById('u-number').focus(), 100);
}
function editUnit(id) { openUnitModal(allVocabUnits.find(u => u._id === id)); }

async function saveUnit() {
  const num = Number(document.getElementById('u-number').value);
  const title = document.getElementById('u-title').value.trim();
  if (!num || !title) { toast('Số Unit và Tên là bắt buộc', 'error'); return; }
  const body = { unitNumber: num, title, description: document.getElementById('u-desc').value.trim(), level: document.getElementById('u-level').value };
  try {
    const url = editingUnitId ? `${API}/vocab/admin/units/${editingUnitId}` : `${API}/vocab/admin/units`;
    const data = await (await fetch(url, { method: editingUnitId ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(body) })).json();
    if (!data.success) throw new Error(data.message);
    toast(editingUnitId ? 'Đã cập nhật Unit' : `Đã tạo Unit ${num}`);
    closeModal('modal-unit'); await loadVocabUnits();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function toggleUnitActive(id, isActive) {
  try {
    await fetch(`${API}/vocab/admin/units/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    toast('Đã cập nhật trạng thái'); await loadVocabUnits();
  } catch { toast('Lỗi', 'error'); }
}

/* ── Words Modal ── */
async function openUnitWordsModal(unitId) {
  try {
    const data = await (await fetch(`${API}/vocab/admin/units/${unitId}`, { headers: authH() })).json();
    if (!data.success) { toast(data.message, 'error'); return; }
    editingUnitObj = data.unit;
    renderUnitWordsModal(data.unit);
    openModal('modal-unit-words');
  } catch (err) { toast(err.message, 'error'); }
}

function toggleWordTypeForm() {
  const type = document.querySelector('input[name="nw-type"]:checked')?.value || 'vocab';
  document.getElementById('nw-vocab-fields').style.display = type === 'vocab' ? '' : 'none';
  document.getElementById('nw-para-fields').style.display  = type === 'paraphrase' ? '' : 'none';
}

function renderUnitWordsModal(unit) {
  document.getElementById('modal-uw-title').textContent = `Từ vựng – Unit ${unit.unitNumber}: ${unit.title}`;
  const total  = unit.words.length;
  const vocab  = unit.words.filter(w => (w.type || 'vocab') === 'vocab').length;
  const para   = unit.words.filter(w => w.type === 'paraphrase').length;
  document.getElementById('uw-word-count').textContent =
    `${total} mục${vocab ? ` · ${vocab} từ vựng` : ''}${para ? ` · ${para} paraphrase` : ''}`;

  // Reset form
  ['nw-word','nw-meaning','nw-example','nw-phonetic','nw-pos',
   'nw-para-original','nw-para-paraphrase','nw-para-meaning','nw-para-explanation']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const vocabRadio = document.querySelector('input[name="nw-type"][value="vocab"]');
  if (vocabRadio) { vocabRadio.checked = true; toggleWordTypeForm(); }

  document.getElementById('uw-words-tbody').innerHTML = unit.words.length
    ? unit.words.map((w, i) => {
        const isPara = w.type === 'paraphrase';
        const typeBadge = isPara
          ? `<span class="badge" style="background:rgba(245,158,11,.15);color:#b45309;font-size:10px;white-space:nowrap">📊 Para</span>`
          : `<span class="badge badge-blue" style="font-size:10px">📚 Vocab</span>`;
        const col2 = isPara
          ? `<strong>${w.word}</strong>`
          : `<strong>${w.word}</strong>${w.phonetic ? `<div style="font-size:11px;color:var(--text3);font-family:var(--mono)">${w.phonetic}</div>` : ''}`;
        const col3 = isPara
          ? `<span style="color:#b45309;font-size:12px">${w.paraphrase || ''}</span>`
          : `<span style="color:var(--text2)">${w.meaning || ''}</span>`;
        const col4 = isPara
          ? `<span style="font-size:11px;color:var(--text3)">${(w.explanation || '').slice(0, 80)}${w.explanation?.length > 80 ? '…' : ''}</span>`
          : `<span style="font-size:12px;color:var(--text3);font-style:italic">${w.example || ''}</span>`;
        return `
  <tr>
    <td style="color:var(--text3)">${i + 1}</td>
    <td>${typeBadge}</td>
    <td>${col2}</td>
    <td>${col3}</td>
    <td>${col4}</td>
    <td style="white-space:nowrap">
      <button class="btn btn-sm btn-icon" onclick="editWordInUnit(${i})" title="Sửa" style="background:rgba(59,130,246,.1);color:#3b82f6;border:1px solid rgba(59,130,246,.25);margin-right:4px">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteWordFromUnit(${i})" title="Xoá">✕</button>
    </td>
  </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3)">Chưa có từ nào – thêm từ ở form trên</td></tr>';
}

async function addWordToUnit() {
  if (!editingUnitObj) return;
  const type = document.querySelector('input[name="nw-type"]:checked')?.value || 'vocab';
  let body;

  if (type === 'paraphrase') {
    const word       = document.getElementById('nw-para-original').value.trim();
    const paraphrase = document.getElementById('nw-para-paraphrase').value.trim();
    if (!word || !paraphrase) { toast('Text gốc và Paraphrase là bắt buộc', 'error'); return; }
    body = {
      type: 'paraphrase',
      word,
      paraphrase,
      meaning:     document.getElementById('nw-para-meaning').value.trim(),
      explanation: document.getElementById('nw-para-explanation').value.trim(),
    };
  } else {
    const word    = document.getElementById('nw-word').value.trim();
    const meaning = document.getElementById('nw-meaning').value.trim();
    if (!word || !meaning) { toast('Từ và nghĩa là bắt buộc', 'error'); return; }
    body = {
      type: 'vocab',
      word, meaning,
      example:      document.getElementById('nw-example').value.trim(),
      phonetic:     document.getElementById('nw-phonetic').value.trim(),
      partOfSpeech: document.getElementById('nw-pos').value.trim(),
      level:        document.getElementById('nw-level').value
    };
  }

  try {
    let url, method;
    if (editingWordIdx !== null) {
      url = `${API}/vocab/admin/units/${editingUnitObj._id}/words/${editingWordIdx}`;
      method = 'PUT';
    } else {
      url = `${API}/vocab/admin/units/${editingUnitObj._id}/words`;
      method = 'POST';
    }
    const data = await (await fetch(url, { method, headers: authH(), body: JSON.stringify(body) })).json();
    if (!data.success) { toast(data.message, 'error'); return; }
    toast(editingWordIdx !== null ? 'Đã cập nhật từ' : data.message);
    cancelWordEdit();
    await openUnitWordsModal(editingUnitObj._id);
    await loadVocabUnits();
  } catch (err) { toast(err.message, 'error'); }
}

let editingWordIdx = null;

function editWordInUnit(idx) {
  if (!editingUnitObj) return;
  const w = editingUnitObj.words[idx];
  if (!w) return;
  editingWordIdx = idx;

  const isP = w.type === 'paraphrase';
  const radio = document.querySelector(`input[name="nw-type"][value="${isP ? 'paraphrase' : 'vocab'}"]`);
  if (radio) { radio.checked = true; toggleWordTypeForm(); }

  if (isP) {
    document.getElementById('nw-para-original').value    = w.word || '';
    document.getElementById('nw-para-paraphrase').value  = w.paraphrase || '';
    document.getElementById('nw-para-meaning').value     = w.meaning || '';
    document.getElementById('nw-para-explanation').value = w.explanation || '';
  } else {
    document.getElementById('nw-word').value     = w.word || '';
    document.getElementById('nw-meaning').value  = w.meaning || '';
    document.getElementById('nw-example').value  = w.example || '';
    document.getElementById('nw-phonetic').value = w.phonetic || '';
    document.getElementById('nw-pos').value      = w.partOfSpeech || '';
    const lvl = document.getElementById('nw-level');
    if (lvl) lvl.value = w.level || 'A2';
  }

  document.getElementById('nw-edit-banner').style.display = '';
  document.getElementById('nw-edit-idx').textContent = idx + 1;

  const bv = document.getElementById('btn-add-vocab-word');
  const bp = document.getElementById('btn-add-para-word');
  if (bv) { bv.textContent = '💾 Lưu sửa'; bv.style.background = '#f59e0b'; bv.style.borderColor = '#f59e0b'; }
  if (bp) { bp.textContent = '💾 Lưu sửa'; }

  document.getElementById('nw-edit-banner').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelWordEdit() {
  editingWordIdx = null;
  document.getElementById('nw-edit-banner').style.display = 'none';
  const bv = document.getElementById('btn-add-vocab-word');
  const bp = document.getElementById('btn-add-para-word');
  if (bv) { bv.textContent = '＋ Thêm'; bv.style.background = ''; bv.style.borderColor = ''; }
  if (bp) { bp.textContent = '＋ Thêm'; }
  ['nw-word','nw-meaning','nw-example','nw-phonetic','nw-pos',
   'nw-para-original','nw-para-paraphrase','nw-para-meaning','nw-para-explanation']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function deleteWordFromUnit(idx) {
  if (!editingUnitObj) return;
  const word = editingUnitObj.words[idx]?.word;
  confirmAction(`Xoá từ "${word}"?`, async () => {
    try {
      const data = await (await fetch(`${API}/vocab/admin/units/${editingUnitObj._id}/words/${idx}`, { method: 'DELETE', headers: authH() })).json();
      toast(data.message);
      await openUnitWordsModal(editingUnitObj._id);
      await loadVocabUnits();
    } catch (err) { toast(err.message, 'error'); }
  });
}

/* ── Import JSON ── */
function openImportJsonModal() {
  document.getElementById('import-json-text').value = '';
  document.getElementById('import-replace').checked = false;
  document.getElementById('import-result').classList.add('hidden');
  switchGuideTab('vocab');
  openModal('modal-import-json');
}

function switchGuideTab(tab) {
  const isVocab = tab === 'vocab';
  document.getElementById('guide-panel-vocab').style.display = isVocab ? '' : 'none';
  document.getElementById('guide-panel-para').style.display  = isVocab ? 'none' : '';
  document.getElementById('guide-tab-vocab').style.background = isVocab ? 'var(--accent)' : 'var(--surface2)';
  document.getElementById('guide-tab-vocab').style.color      = isVocab ? '#fff' : 'var(--text2)';
  document.getElementById('guide-tab-para').style.background  = isVocab ? 'var(--surface2)' : '#f59e0b';
  document.getElementById('guide-tab-para').style.color       = isVocab ? 'var(--text2)' : '#fff';
}

const _GUIDE_TEMPLATES = {
  vocab: JSON.stringify([{
    unitNumber: 1,
    title: "Tên Unit",
    level: "B1",
    words: [
      { word: "commute", meaning: "đi làm hàng ngày", example: "I commute by train.", phonetic: "/kəˈmjuːt/", partOfSpeech: "verb" },
      { word: "habitat", meaning: "môi trường sống", example: "The rainforest is the natural habitat of many species.", partOfSpeech: "noun" }
    ]
  }], null, 2),
  para: JSON.stringify([{
    unitNumber: 5,
    title: "Cambridge IELTS 15",
    level: "IELTS",
    words: [
      { type: "paraphrase", word: "evergreen tree", paraphrase: "always green tree", meaning: "cây xanh quanh năm", explanation: "Paraphrase: 'evergreen' mang nghĩa là luôn xanh tươi, tương đương 'always green'" },
      { type: "paraphrase", word: "native to Southeast Asia", paraphrase: "originally from Southeast Asia", meaning: "có nguồn gốc từ Đông Nam Á", explanation: "Paraphrase: 'native to' (bản địa) đồng nghĩa với 'originally from'" }
    ]
  }], null, 2)
};

function copyGuideTemplate(type) {
  const text = type === 'full'
    ? (document.getElementById('guide-full-example')?.textContent?.trim() || '')
    : (_GUIDE_TEMPLATES[type] || '');
  navigator.clipboard.writeText(text).then(() => toast('Đã copy template ✅'));
}

function pasteGuideToInput() {
  const fullText = document.getElementById('guide-full-example')?.textContent?.trim() || '';
  document.getElementById('import-json-text').value = fullText;
  document.getElementById('import-json-text').focus();
}

async function importJsonUnits() {
  const raw = document.getElementById('import-json-text').value.trim();
  if (!raw) { toast('Paste JSON vào trước', 'error'); return; }
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { toast('JSON không hợp lệ – kiểm tra định dạng', 'error'); return; }

  const btn = document.getElementById('btn-import-json');
  btn.disabled = true; btn.textContent = 'Đang import...';
  try {
    const data = await (await fetch(`${API}/vocab/admin/import`, {
      method: 'POST', headers: authH(), body: JSON.stringify(parsed)
    })).json();
    const resultEl = document.getElementById('import-result');
    resultEl.classList.remove('hidden');
    if (data.success) {
      resultEl.style.cssText = 'background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:#34d399;padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.6';
      resultEl.innerHTML = `✅ ${data.message}<br><small style="opacity:.7">${(data.results || []).map(r => `Unit ${r.unitNumber}: ${r.status} (${r.wordCount || 0} từ)`).join(' · ')}</small>`;
      toast(data.message);
      await loadVocabUnits();
    } else {
      resultEl.style.cssText = 'background:rgba(229,57,53,.1);border:1px solid rgba(229,57,53,.3);color:var(--accent2);padding:12px 14px;border-radius:8px;font-size:13px';
      resultEl.textContent = '❌ ' + data.message;
    }
  } catch (err) { toast(err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = '📥 Import'; }
}
/* ══════════════════════════════════════════════════════════════════
 LISTENING ADMIN – Section & Question Group Builder
 
  ══════════════════════════════════════════════════════════════════ */

let allListeningTests = [];
let editListeningId = null;
let uploadAudioTestId = null;
let ltSectionCount = 0;
let ltGroupIdx = 0;
let ltQIdx = 0;

// ── Load & Render table ──────────────────────────────────────────
async function loadListeningTests() {
  try {
    const data = await (await fetch(`${API}/listening/admin/tests`, { headers: authH() })).json();
    if (!data.success) return;
    allListeningTests = data.tests;
    renderListeningTable(data.tests);
  } catch (err) {
    document.getElementById('listening-tbody').innerHTML =
      `<tr><td colspan="9" class="table-empty">Lỗi: ${err.message}</td></tr>`;
  }
}

function renderListeningTable(list) {
  const tbody = document.getElementById('listening-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="table-empty">Chưa có đề nghe nào. Nhấn "+ Tạo đề nghe".</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(t => {
    const dur = t.audioDuration
      ? `${Math.floor(t.audioDuration / 60)}:${pad(t.audioDuration % 60)}`
      : '–';
    return `<tr>
  <td><strong>${t.name}</strong></td>
  <td style="font-family:var(--mono)">${t.testNumber}</td>
  <td>${t.seriesName || '–'}</td>
  <td>${t.audioUrl
        ? `<span class="badge badge-green"><span class="dot"></span>Đã có</span>`
        : `<span class="badge badge-gray">Chưa upload</span>`}</td>
  <td style="font-family:var(--mono)">${dur}</td>
  <td>${t.totalQuestions || 0} câu</td>
  <td><span class="badge ${t.isActive ? 'badge-green' : 'badge-gray'}">
    <span class="dot"></span>${t.isActive ? 'Hoạt động' : 'Ẩn'}</span></td>
  <td style="color:var(--text3);font-size:12px">${formatDate(t.createdAt).split(' ')[0]}</td>
  <td><div class="row-actions">
    <button class="btn btn-ghost btn-sm btn-icon" onclick="openUploadAudioModal('${t._id}','${t.name.replace(/'/g, "\\'")}')" title="Upload Audio">🎵</button>
    <button class="btn btn-ghost btn-sm btn-icon" onclick="editListeningTest('${t._id}')" title="Chỉnh sửa">✏️</button>
    <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleListeningTest('${t._id}',${t.isActive})" title="${t.isActive ? 'Ẩn' : 'Hiện'}">${t.isActive ? '🙈' : '👁'}</button>
    <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeleteListeningTest('${t._id}','${t.name.replace(/'/g, "\\'")}')" title="Xóa vĩnh viễn">🗑</button>
  </div></td>
</tr>`;
  }).join('');
}

function filterListeningTests() {
  const q = document.getElementById('search-listening').value.toLowerCase();
  renderListeningTable(allListeningTests.filter(t => t.name.toLowerCase().includes(q)));
}

// ── Open / Edit Modal ────────────────────────────────────────────
function openListeningModal(data = null) {
  editListeningId = data?._id || null;
  ltSectionCount = 0; ltGroupIdx = 0; ltQIdx = 0;

  document.getElementById('lt-id').value = data?._id || '';
  document.getElementById('lt-name').value = data?.name || '';
  document.getElementById('lt-series').value = data?.seriesName || '';
  document.getElementById('lt-number').value = data?.testNumber || '';
  document.getElementById('modal-listening-title').textContent = data ? 'Chỉnh sửa đề nghe' : 'Tạo đề nghe mới';

  if (data?.audioUrl) {
    document.getElementById('lt-audio-url-chip').classList.remove('hidden');
    document.getElementById('lt-audio-name').textContent = data.audioFileName || 'Đã có audio';
  } else {
    document.getElementById('lt-audio-url-chip').classList.add('hidden');
    document.getElementById('lt-audio-name').textContent = 'Upload sau khi tạo đề xong';
  }

  const container = document.getElementById('lt-sections-container');
  container.innerHTML = '';
  if (data?.sections?.length) {
    data.sections.forEach(s => addListeningSection(s));
  } else {
    addListeningSection();
  }
  openModal('modal-listening');
}

async function editListeningTest(id) {
  try {
    const res = await fetch(`${API}/listening/admin/tests/${id}`, { headers: authH() });
    const data = await res.json();
    if (data.success) openListeningModal(data.test);
  } catch { openListeningModal(allListeningTests.find(t => t._id === id)); }
}

async function toggleListeningTest(id, isActive) {
  try {
    await fetch(`${API}/listening/admin/tests/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    toast(isActive ? 'Đã ẩn đề nghe' : 'Đã hiện đề nghe'); await loadListeningTests();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}
function hardDeleteListeningTest(id, name) {
  confirmAction(`Xóa VĨNH VIỄN đề nghe "${name}"? Không thể khôi phục!`, async () => {
    try {
      const res  = await fetch(`${API}/listening/admin/tests/${id}/permanent`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn đề nghe'); await loadListeningTests();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

// ════════════════════════════════════════════════════════════════
// SECTION (PART) BUILDER
// ════════════════════════════════════════════════════════════════
function addListeningSection(data = null) {
  ltSectionCount++;
  const sIdx = ltSectionCount;
  const partNum = data?.partNumber || sIdx;
  const range = getPartRange(partNum);

  const div = document.createElement('div');
  div.className = 'question-row';
  div.id = `ls-${sIdx}`;
  div.style.marginBottom = '20px';
  div.innerHTML = `
<div class="question-row-header" style="margin-bottom:12px">
  <span class="q-num-badge" style="background:#3d8bff">P</span>
  <span style="font-size:13px;font-weight:700;flex:1">Part ${partNum}</span>
  <button class="btn btn-danger btn-sm" onclick="this.closest('.question-row').remove()">✕ Xoá Part</button>
</div>
<div style="display:grid;grid-template-columns:0.6fr 2fr 1.5fr;gap:10px;margin-bottom:10px">
  <div class="form-group" style="margin-bottom:0">
    <label>Part số *</label>
    <select class="form-select ls-part" style="padding:8px 10px;font-size:13px" onchange="onPartSelect(this)">
      <option value="1" ${partNum == 1 ? 'selected' : ''}>Part 1 (Q1–10)</option>
      <option value="2" ${partNum == 2 ? 'selected' : ''}>Part 2 (Q11–20)</option>
      <option value="3" ${partNum == 3 ? 'selected' : ''}>Part 3 (Q21–30)</option>
      <option value="4" ${partNum == 4 ? 'selected' : ''}>Part 4 (Q31–40)</option>
    </select>
    <input type="hidden" class="ls-qstart" value="${data?.questionRange?.start || range.start}" />
    <input type="hidden" class="ls-qend"   value="${data?.questionRange?.end || range.end}" />
  </div>
  <div class="form-group" style="margin-bottom:0">
    <label>Tiêu đề *</label>
    <input class="form-input ls-title" style="font-size:13px;padding:8px 10px"
           value="${data?.title || ''}" placeholder="VD: A conversation about accommodation" />
  </div>
  <div class="form-group" style="margin-bottom:0">
    <label>Mô tả</label>
    <input class="form-input ls-desc" style="font-size:13px;padding:8px 10px"
           value="${data?.description || ''}" placeholder="Context ngắn gọn..." />
  </div>
</div>
<div style="background:rgba(61,139,255,.08);border:1px solid rgba(61,139,255,.2);border-radius:6px;
            padding:6px 12px;font-size:12px;color:#3d8bff;margin-bottom:12px">
  📌 Phạm vi: Questions <strong class="ls-range-text">${getPartRangeText(partNum)}</strong>
</div>
<div class="form-group" style="margin-bottom:12px">
  <label style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px">
    📜 Transcript Part ${partNum} <span style="font-weight:400;color:var(--text3)">(plain text)</span>
  </label>
  <textarea class="form-textarea ls-transcript" rows="4"
    style="font-size:13px;margin-top:4px"
    placeholder="Dán nội dung bài nghe của Part ${partNum} vào đây...">${data?.transcript || ''}</textarea>
</div>

<!-- Question Groups container -->
<div id="lgs-${sIdx}" style="display:flex;flex-direction:column;gap:12px"></div>

<button class="btn btn-ghost btn-sm" style="margin-top:10px;width:100%;justify-content:center"
        onclick="openAddGroupModal(${sIdx})">
  ＋ Thêm nhóm câu hỏi
</button>`;

  document.getElementById('lt-sections-container').appendChild(div);

  // Nếu có data, restore các groups
  if (data?.questionGroups?.length) {
    data.questionGroups.forEach(g => addQuestionGroup(sIdx, g));
  }
}

// ════════════════════════════════════════════════════════════════
// GROUP TYPE SELECTOR MODAL
// ════════════════════════════════════════════════════════════════
let _pendingGroupSIdx = null;

function openAddGroupModal(sIdx) {
  _pendingGroupSIdx = sIdx;

  // Tạo modal chọn loại group nếu chưa có
  let modal = document.getElementById('modal-add-group');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-add-group';
    modal.className = 'modal-overlay hidden';
    modal.innerHTML = `
  <div class="modal-box" style="width:min(520px,100%)">
    <div class="modal-header">
      <h3>Chọn loại nhóm câu hỏi</h3>
      <button class="modal-close" onclick="closeModal('modal-add-group')">×</button>
    </div>
    <div class="modal-body">
      <p style="color:var(--text2);font-size:13px;margin-bottom:16px;line-height:1.6">
        Chọn cách hiển thị các câu hỏi trong nhóm này:
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${[
        { type: 'plain',              icon: '💬', label: 'Câu hỏi thường',                desc: 'Multiple Choice, Choose N Letters, Fill-blank riêng lẻ' },
        { type: 'table',              icon: '📋', label: 'Bảng (Table/Note)',              desc: 'Fill-blank trong ô bảng – dùng __Q1__ làm placeholder' },
        { type: 'note-form',          icon: '📝', label: 'Note / Bullet Completion',      desc: 'Khung ghi chú hoặc danh sách bullet – chọn kiểu hiển thị trong nhóm' },
        { type: 'matching-options',   icon: '🔗', label: 'Matching / Sentence Endings / Choose Letters', desc: 'Ghép chữ cái kéo thả. Dùng cho: Matching speakers/features, Sentence Endings, Choose TWO/THREE letters' },
        { type: 'summary-completion', icon: '🧩', label: 'Summary Completion',            desc: 'Đoạn tóm tắt + word bank A-J chọn từ điền vào (kéo thả)' },
        { type: 'map',                icon: '🗺️', label: 'Map / Diagram',                 desc: 'Câu hỏi dán nhãn bản đồ hoặc sơ đồ' },
      ].map(g => `
          <div onclick="pickGroupType('${g.type}')"
               style="border:1.5px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;
                      transition:all .15s"
               onmouseover="this.style.borderColor='#3d8bff';this.style.background='rgba(61,139,255,.06)'"
               onmouseout="this.style.borderColor='var(--border)';this.style.background='transparent'">
            <div style="font-size:20px;margin-bottom:6px">${g.icon}</div>
            <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">${g.label}</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.4">${g.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
    document.body.appendChild(modal);
  }
  openModal('modal-add-group');
}

function pickGroupType(groupType) {
  closeModal('modal-add-group');
  addQuestionGroup(_pendingGroupSIdx, { groupType });
}

// ════════════════════════════════════════════════════════════════
// QUESTION GROUP BUILDER
// ════════════════════════════════════════════════════════════════
function addQuestionGroup(sIdx, data = null) {
  ltGroupIdx++;
  const gIdx = ltGroupIdx;
  const groupType = data?.groupType || 'plain';

  const container = document.getElementById(`lgs-${sIdx}`);
  if (!container) return;

  const groupLabels = {
    'plain':              '💬 Câu hỏi thường',
    'table':              '📋 Bảng (Table)',
    'note-form':          '📝 Note / Bullet',
    'matching-options':   '🔗 Matching / Sentence Endings',
    'summary-completion': '🧩 Summary Completion',
    'map':                '🗺️ Map / Diagram',
  };

  const div = document.createElement('div');
  div.id = `lg-${gIdx}`;
  div.style.cssText = 'background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:14px;';

  div.innerHTML = `
<!-- Group header -->
<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
  <span style="background:#a78bfa;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px">
    ${groupLabels[groupType] || groupType}
  </span>
  <span style="flex:1;font-size:12px;color:var(--text3)">Nhóm câu hỏi</span>
  <button class="btn btn-danger btn-sm" onclick="this.closest('[id^=lg-]').remove()">✕ Xoá nhóm</button>
</div>

<!-- Instruction -->
<div class="form-group" style="margin-bottom:10px">
  <label style="font-size:10px">Hướng dẫn làm bài</label>
  <input class="form-input lg-instruction" value="${data?.instruction || ''}"
         style="font-size:12px;padding:7px 10px"
         placeholder="VD: Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer." />
</div>

<!-- Group-type specific config -->
<input type="hidden" class="lg-type" value="${groupType}" />
<div class="lg-config" id="lgcfg-${gIdx}">
  ${renderGroupConfig(groupType, data, gIdx)}
</div>

<!-- Questions inside group -->
<div style="margin-top:12px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
    <span style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">
      Câu hỏi trong nhóm
    </span>
    <button class="btn btn-ghost btn-sm" onclick="addGroupQuestion(${gIdx}, null, '${groupType}')">＋ Thêm câu</button>
  </div>
  <div id="lgqs-${gIdx}" style="display:flex;flex-direction:column;gap:8px"></div>
</div>`;

  container.appendChild(div);

  // Restore existing questions
  if (data?.questions?.length) {
    data.questions.forEach(q => addGroupQuestion(gIdx, q, groupType));
  }
}

// ── Render cấu hình theo loại group ─────────────────────────────
function renderGroupConfig(groupType, data, gIdx) {
  if (groupType === 'table') {
    const headers = data?.tableConfig?.headers || ['', '', ''];
    const rows = data?.tableConfig?.rows || [['', '', '']];
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
      Cấu trúc bảng
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:10px;color:var(--text3)">Tiêu đề cột (cách nhau bằng |)</label>
      <input class="form-input lg-tbl-headers" value="${headers.join(' | ')}"
             style="font-size:12px;padding:7px 10px;margin-top:4px"
             placeholder="Apartments | Parking | Additional information" />
    </div>
    <div>
      <label style="font-size:10px;color:var(--text3)">
        Các hàng – dùng <code style="background:var(--bg);padding:1px 4px;border-radius:3px">__Q1__</code> để đánh dấu ô câu hỏi
      </label>
      <div id="tbl-rows-${gIdx}" style="margin-top:6px;display:flex;flex-direction:column;gap:6px">
        ${rows.map((row, ri) => renderTableRow(gIdx, ri, row)).join('')}
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px"
              onclick="addTableRow(${gIdx})">＋ Thêm hàng</button>
    </div>
  </div>`;
  }

  if (groupType === 'note-form' || groupType === 'bullet-list') {
    const isBullet = groupType === 'bullet-list'
      || (!!(data?.bulletConfig?.items?.length) && !(data?.noteConfig?.lines?.length));
    const title = data?.noteConfig?.title || data?.bulletConfig?.title || '';
    const lineData = isBullet
      ? (data?.bulletConfig?.items || [''])
      : (data?.noteConfig?.lines || ['']);
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">
      Cấu trúc Note / Bullet
    </div>
    <div style="display:flex;gap:16px;margin-bottom:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="radio" name="lg-note-mode-${gIdx}" class="lg-note-mode" value="note"
               ${!isBullet ? 'checked' : ''}
               style="accent-color:var(--accent)" onchange="lgToggleNoteMode(${gIdx},this.value)" />
        📝 Note / Form
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="radio" name="lg-note-mode-${gIdx}" class="lg-note-mode" value="bullet"
               ${isBullet ? 'checked' : ''}
               style="accent-color:var(--accent)" onchange="lgToggleNoteMode(${gIdx},this.value)" />
        • Bullet List
      </label>
    </div>
    <div class="form-group" style="margin-bottom:8px">
      <label style="font-size:10px">Tiêu đề khung <span style="color:var(--text3)">(không bắt buộc)</span></label>
      <input class="form-input lg-note-title" value="${title}"
             style="font-size:12px;padding:7px 10px"
             placeholder="VĐ: Accommodation details" />
    </div>
    <div>
      <label style="font-size:10px;color:var(--text3)">
        Các dòng – dùng <code style="background:var(--bg);padding:1px 4px;border-radius:3px">__Q1__</code> để đánh dấu chỗ trống
      </label>
      <div id="note-lines-${gIdx}" style="margin-top:6px;display:flex;flex-direction:column;gap:6px">
        ${lineData.map((line, li) => renderNoteLine(gIdx, li, line)).join('')}
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px"
              onclick="addNoteLine(${gIdx})">＋ Thêm dòng</button>
    </div>
  </div>`;
  }


  if (groupType === 'matching-options' || groupType === 'sentence-endings') {
    // Auto-detect mode: nếu data có endingsConfig thì là sentence-endings
    const isEndings = groupType === 'sentence-endings'
      || (!!(data?.endingsConfig?.endings?.length) && !(data?.matchingOptions?.length));
    const moMode = isEndings ? 'endings' : 'matching';
    const opts = isEndings
      ? (data?.endingsConfig?.endings || Array(8).fill(0).map((_, i) => ({ letter: 'ABCDEFGHIJ'[i] || String(i+1), text: '' }))).map(e => e.text || '')
      : (data?.matchingOptions || ['', '', '', '', '', '']);
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    <div style="display:flex;gap:16px;margin-bottom:10px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="radio" name="lg-mo-mode-${gIdx}" class="lg-mo-mode" value="matching"
               ${moMode === 'matching' ? 'checked' : ''}
               style="accent-color:var(--accent)" onchange="lgToggleMOMode(${gIdx},'matching')" />
        🔗 Matching / Choose Letters
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="radio" name="lg-mo-mode-${gIdx}" class="lg-mo-mode" value="endings"
               ${moMode === 'endings' ? 'checked' : ''}
               style="accent-color:var(--accent)" onchange="lgToggleMOMode(${gIdx},'endings')" />
        🔚 Sentence Endings
      </label>
    </div>
    <div id="lg-mo-guide-${gIdx}">
      ${moMode === 'endings'
        ? lgAdminGuide('🔚 <strong>Sentence Endings:</strong> Nhập danh sách phần kết câu A-H. Câu hỏi: mỗi câu = một phần đầu câu, đáp án là chữ cái phần kết (A, B, C…).')
        : lgAdminGuide(`🔗 <strong>Matching / Choose Letters</strong> — Nhóm đa năng dùng kéo thả chữ cái:<br>
• <strong>Matching speakers/features</strong>: Nhập danh sách người/sự vật A→G, câu hỏi loại <code>matching-info</code>, đáp án A/B/C…<br>
• <strong>Choose TWO/THREE letters</strong>: Nhập 5–7 lựa chọn A–G, mỗi câu hỏi loại <code>matching-info</code>, bật <strong>Hoán đổi thứ tự</strong> – đáp án Q13=B Q14=D hoặc hoán đổi đều đúng.`)}
    </div>
    <div id="lg-mo-checkboxes-${gIdx}" style="display:${moMode === 'endings' ? 'none' : 'flex'};flex-wrap:wrap;gap:14px;margin-bottom:10px;margin-top:8px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="checkbox" class="lg-reuse" id="lg-reuse-${gIdx}"
               ${data?.matchingReuseAllowed ? 'checked' : ''}
               style="width:14px;height:14px;accent-color:var(--blue)" />
        NB: You may use any letter more than once
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
        <input type="checkbox" class="lg-interchangeable" id="lg-interchangeable-${gIdx}"
               ${data?.interchangeableAnswers ? 'checked' : ''}
               style="width:14px;height:14px;accent-color:var(--green)" />
        <span style="color:var(--green);font-weight:600">Hoán đổi thứ tự (Choose TWO/THREE letters)</span>
      </label>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Danh sách lựa chọn (A, B, C…)</div>
    <div id="lg-opts-${gIdx}" style="display:flex;flex-direction:column;gap:5px">
      ${opts.map((o, i) => renderLGOption(gIdx, i, o)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addLGOption(${gIdx})">＋ Thêm mục</button>
  </div>`;
  }

  if (groupType === 'summary-completion') {
    const wb = data?.summaryConfig?.wordBank || [
      { letter: 'A', word: '' }, { letter: 'B', word: '' }, { letter: 'C', word: '' },
      { letter: 'D', word: '' }, { letter: 'E', word: '' }, { letter: 'F', word: '' },
      { letter: 'G', word: '' }, { letter: 'H', word: '' }, { letter: 'I', word: '' },
      { letter: 'J', word: '' }
    ];
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    ${lgAdminGuide('🧩 <strong>Summary Completion with Word Bank:</strong> 1) Nhập đoạn tóm tắt có chỗ trống dùng <code>__Q37__</code>. 2) Nhập word bank A-J (chữ cái → từ). Câu hỏi bên dưới: loại <strong>fill-blank</strong>, đáp án là <strong>từ thực tế</strong> (không phải chữ cái). Học sinh sẽ kéo từ vào ô trống.')}
    <div style="margin-bottom:10px">
      <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">
        Đoạn tóm tắt (dùng <code style="background:var(--bg);padding:1px 4px;border-radius:3px">__Q37__</code> cho chỗ trống)
      </label>
      <textarea class="form-input lg-summary-text" rows="5"
                style="font-size:12px;padding:8px 10px;resize:vertical;width:100%"
                placeholder="The tour begins near the __Q37__ at the main entrance...">${data?.summaryConfig?.text || ''}</textarea>
    </div>
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Word Bank (A, B, C…)</div>
    <div id="lg-wb-${gIdx}" style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
      ${wb.map((w, i) => renderLGWbItem(gIdx, i, w)).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" style="margin-top:7px" onclick="addLGWbItem(${gIdx})">＋ Thêm từ</button>
  </div>`;
  }

  if (groupType === 'map') {
    const imgId = `lgmap-${gIdx}`;
    const fileId = `lgmapfile-${gIdx}`;
    return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px">
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
      Map / Diagram
    </div>
    <div style="display:flex;gap:10px;align-items:flex-start">
      <div style="flex:1">
        <input class="form-input lg-map-url" value="${data?.imageUrl || ''}"
               style="font-size:12px;padding:7px 10px;margin-bottom:6px"
               placeholder="URL hoặc chọn file bên dưới"
               oninput="previewGroupImage(this,'${imgId}')" />
        <div style="display:flex;gap:6px;align-items:center">
          <label style="cursor:pointer;background:var(--accent);color:#fff;font-size:11px;font-weight:600;padding:5px 10px;border-radius:6px;white-space:nowrap">
            📁 Chọn ảnh
            <input type="file" id="${fileId}" accept="image/*" style="display:none"
                   onchange="uploadLGMapImage(this,'${imgId}')" />
          </label>
          <span style="font-size:10px;color:var(--text3)">JPG/PNG – tự động nén & upload Cloudinary</span>
        </div>
      </div>
      <div id="${imgId}"
           style="width:160px;min-height:90px;border:1.5px dashed var(--border2);border-radius:6px;
                  display:flex;align-items:center;justify-content:center;overflow:hidden;
                  background:var(--bg);flex-shrink:0">
        ${data?.imageUrl
        ? `<img src="${data.imageUrl}" style="max-width:100%;max-height:120px;object-fit:contain"/>`
        : `<span style="font-size:11px;color:var(--text3)">Xem trước</span>`}
      </div>
    </div>
  </div>`;
  }

  // plain – không cần config thêm
  return `<div style="font-size:12px;color:var(--text3);padding:6px 0">
Câu hỏi thường – không có khung đặc biệt. Thêm câu hỏi bên dưới.
  </div>`;
}

function lgAdminGuide(html) {
  return `<div style="background:rgba(61,139,255,.08);border:1px solid rgba(61,139,255,.25);border-radius:7px;padding:9px 12px;margin-bottom:10px;font-size:11px;color:var(--text2);line-height:1.6">${html}</div>`;
}

function previewGroupImage(input, imgId) {
  const url = input.value.trim();
  const el = document.getElementById(imgId);
  if (!el) return;
  el.innerHTML = url
    ? `<img src="${url}" style="max-width:100%;max-height:120px;object-fit:contain"
       onerror="this.parentElement.innerHTML='<span style=\\'font-size:11px;color:var(--accent)\\'>URL lỗi</span>'">`
    : `<span style="font-size:11px;color:var(--text3)">Xem trước</span>`;
}

function uploadLGMapImage(fileInput, imgId) {
  const file = fileInput.files[0];
  if (!file) return;
  const preview = document.getElementById(imgId);
  if (preview) preview.innerHTML = `<span style="font-size:11px;color:var(--text3)">Đang nén...</span>`;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const MAX = 900;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

      if (preview) preview.innerHTML = `<span style="font-size:11px;color:var(--text3)">Đang upload...</span>`;

      fetch(`${API}/listening/admin/upload-map-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ imageBase64: dataUrl })
      })
      .then(r => r.json())
      .then(data => {
        if (!data.success) throw new Error(data.message || 'Upload thất bại');
        const container = fileInput.closest('[id^="lg-"]');
        if (container) {
          const urlInput = container.querySelector('.lg-map-url');
          if (urlInput) {
            urlInput.value = data.url;
            previewGroupImage(urlInput, imgId);
          }
        }
        if (preview) preview.innerHTML = `<img src="${data.url}" style="max-width:100%;max-height:120px;object-fit:contain"/>`;
        toast('Upload hình thành công!');
      })
      .catch(err => {
        if (preview) preview.innerHTML = `<span style="font-size:11px;color:var(--accent)">Lỗi: ${err.message}</span>`;
        toast('Upload thất bại: ' + err.message, 'error');
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── Table row helpers ────────────────────────────────────────────
function renderTableRow(gIdx, ri, cells) {
  return `
<div style="display:flex;gap:6px;align-items:center" id="tblrow-${gIdx}-${ri}">
  <span style="font-size:11px;color:var(--text3);width:20px;text-align:center">${ri + 1}</span>
  <input class="form-input lg-tbl-row" value="${(cells || []).join(' | ')}"
         style="flex:1;font-size:12px;padding:6px 10px"
         placeholder="Tên căn hộ | Bãi đỗ xe | Ghi chú thêm __Q1__" />
  <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:4px"
          onclick="this.parentElement.remove()">✕</button>
</div>`;
}

function addTableRow(gIdx) {
  const container = document.getElementById(`tbl-rows-${gIdx}`);
  if (!container) return;
  const ri = container.children.length;
  container.insertAdjacentHTML('beforeend', renderTableRow(gIdx, ri, []));
}

// ── Note line helpers ────────────────────────────────────────────
function renderNoteLine(gIdx, li, line) {
  return `
<div style="display:flex;gap:6px;align-items:center">
  <input class="form-input lg-note-line" value="${line}"
         style="flex:1;font-size:12px;padding:6px 10px"
         placeholder="Nội dung __Q1__ | Thụt lề: >>text | Để trống = khoảng trắng" />
  <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:4px"
          onclick="this.parentElement.remove()">✕</button>
</div>`;
}

function addNoteLine(gIdx) {
  document.getElementById(`note-lines-${gIdx}`)
    ?.insertAdjacentHTML('beforeend', renderNoteLine(gIdx, 0, ''));
}

// ── Bullet item helpers ──────────────────────────────────────────
function renderBulletItem(gIdx, ii, item) {
  return `
<div style="display:flex;gap:6px;align-items:center">
  <span style="color:var(--text3);font-size:14px">•</span>
  <input class="form-input lg-bullet-item" value="${item}"
         style="flex:1;font-size:12px;padding:6px 10px"
         placeholder="Item __Q5__ | Thụt lề con: >>Sub-item __Q6__" />
  <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:4px"
          onclick="this.parentElement.remove()">✕</button>
</div>`;
}

function addBulletItem(gIdx) {
  document.getElementById(`bullet-items-${gIdx}`)
    ?.insertAdjacentHTML('beforeend', renderBulletItem(gIdx, 0, ''));
}

// ── Matching option helpers ──────────────────────────────────────
// ── Note/Bullet mode toggle ─────────────────────────────────
function lgToggleNoteMode(gIdx, val) {
  const lines = document.getElementById(`note-lines-${gIdx}`);
  if (!lines) return;
  const isBullet = val === 'bullet';
  lines.querySelectorAll('.lg-note-line').forEach(inp => {
    inp.placeholder = isBullet
      ? 'What colour is the bus? __Q5__'
      : 'Loại căn hộ: __Q1__';
  });
}

// ── Matching/SentenceEndings mode toggle ────────────────────
function lgToggleMOMode(gIdx, val) {
  const isSE = val === 'endings';
  const guide = document.getElementById(`lg-mo-guide-${gIdx}`);
  const cbs   = document.getElementById(`lg-mo-checkboxes-${gIdx}`);
  if (guide) guide.innerHTML = isSE
    ? lgAdminGuide('🔚 <strong>Sentence Endings:</strong> Nhập danh sách phần kết câu A-H. Câu hỏi: mỗi câu = một phần đầu câu, đáp án là chữ cái phần kết (A, B, C…).')
    : lgAdminGuide('🔗 <strong>Matching / Choose Letters</strong>: Nhập danh sách người/sự vật A→G hoặc 5–7 lựa chọn cho Choose TWO/THREE letters.');
  if (cbs) cbs.style.display = isSE ? 'none' : 'flex';
}

function renderLGOption(gIdx, i, text) {
  const letter = 'ABCDEFGHIJ'[i] || String(i + 1);
  return `
<div style="display:flex;gap:6px;align-items:center">
  <span style="font-weight:700;color:var(--accent);width:14px;font-size:12px;flex-shrink:0">${letter}.</span>
  <input class="form-input lg-opt" value="${text}"
         style="flex:1;font-size:12px;padding:6px 10px" placeholder="Mô tả lựa chọn ${letter}…" />
  <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:4px"
          onclick="this.parentElement.remove()">✕</button>
</div>`;
}

function addLGOption(gIdx) {
  const c = document.getElementById(`lg-opts-${gIdx}`);
  if (!c) return;
  c.insertAdjacentHTML('beforeend', renderLGOption(gIdx, c.children.length, ''));
}

// ── Summary word bank helpers ────────────────────────────────────
function renderLGWbItem(gIdx, i, w) {
  const letter = w?.letter || 'ABCDEFGHIJ'[i] || String(i + 1);
  return `
<div style="display:flex;gap:6px;align-items:center">
  <span style="font-weight:700;color:var(--accent);width:20px;font-size:12px;flex-shrink:0">${letter}.</span>
  <input class="form-input lg-wb-word" value="${w?.word || ''}"
         style="flex:1;font-size:12px;padding:6px 10px" placeholder="từ / cụm từ" />
  <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:4px"
          onclick="this.parentElement.remove()">✕</button>
</div>`;
}

function addLGWbItem(gIdx) {
  const c = document.getElementById(`lg-wb-${gIdx}`);
  if (!c) return;
  const i = c.children.length;
  const letter = 'ABCDEFGHIJ'[i] || String(i + 1);
  c.insertAdjacentHTML('beforeend', renderLGWbItem(gIdx, i, { letter, word: '' }));
}

// ── Sentence ending helpers ──────────────────────────────────────
function renderLGEnding(gIdx, i, e) {
  const letter = e?.letter || 'ABCDEFGHIJ'[i] || String(i + 1);
  return `
<div style="display:flex;gap:6px;align-items:center">
  <span style="font-weight:700;color:var(--accent);width:14px;font-size:12px;flex-shrink:0">${letter}.</span>
  <input class="form-input lg-ending" value="${e?.text || ''}"
         style="flex:1;font-size:12px;padding:6px 10px" placeholder="…phần kết câu ${letter}" />
  <button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:4px"
          onclick="this.parentElement.remove()">✕</button>
</div>`;
}

function addLGEnding(gIdx) {
  const c = document.getElementById(`lg-endings-${gIdx}`);
  if (!c) return;
  const i = c.children.length;
  const letter = 'ABCDEFGHIJ'[i] || String(i + 1);
  c.insertAdjacentHTML('beforeend', renderLGEnding(gIdx, i, { letter, text: '' }));
}

// ════════════════════════════════════════════════════════════════
// LISTENING QUESTION TYPES & ALLOWED TYPES PER GROUP
// ════════════════════════════════════════════════════════════════
const LQQ_ALL_TYPES = [
  { value: 'multiple-choice',    label: 'Multiple Choice' },
  { value: 'fill-blank',         label: 'Fill in the blank' },
  { value: 'sentence-completion',label: 'Sentence Completion (kéo thả)' },
  { value: 'matching',           label: 'Matching' },
  { value: 'matching-info',      label: 'Matching Information / People' },
  { value: 'map-labelling',      label: 'Map Labelling' },
  { value: 'multi-answer-group', label: '🔢 Choose N Letters – IELTS (2,3,4...)' },
];

const LQQ_ALLOWED = {
  'plain':              null,  // null = tất cả loại
  'table':              ['fill-blank', 'sentence-completion'],
  'note-form':          ['fill-blank', 'sentence-completion'],
  'bullet-list':        ['fill-blank', 'sentence-completion'],  // backward compat
  'matching-options':   ['matching-info'],
  'sentence-endings':   ['matching-info'],                       // backward compat
  'summary-completion': ['fill-blank'],
  'map':                ['map-labelling', 'fill-blank'],
};

function getAllowedLQTypes(groupType, existingType) {
  const allowed = LQQ_ALLOWED[groupType];
  if (!allowed) return LQQ_ALL_TYPES;
  let list = LQQ_ALL_TYPES.filter(t => allowed.includes(t.value));
  if (existingType && !list.find(t => t.value === existingType)) {
    const found = LQQ_ALL_TYPES.find(t => t.value === existingType);
    if (found) list = [found, ...list];
  }
  return list;
}

function _lqGuideStyle(type) {
  if (type === 'multi-answer-group') return { bg: '#fdf4ff', border: '#a855f7', color: '#6b21a8' };
  if (type === 'checkbox')           return { bg: '#fefce8', border: '#eab308', color: '#854d0e' };
  return { bg: '#eff6ff', border: 'var(--accent)', color: '#1e40af' };
}

// ════════════════════════════════════════════════════════════════
// INDIVIDUAL QUESTION INSIDE GROUP
// ════════════════════════════════════════════════════════════════
function addGroupQuestion(gIdx, data = null, groupType = 'plain') {
  ltQIdx++;
  const qId = `lq-${gIdx}-${ltQIdx}`;
  const container = document.getElementById(`lgqs-${gIdx}`);
  if (!container) return;

  const allowedTypes = getAllowedLQTypes(groupType, data?.type);
  const isSingle = allowedTypes.length === 1;
  // autoType: always start from the allowed list so single-type groups render correctly
  const autoType = data?.type || allowedTypes[0]?.value || 'multiple-choice';
  const typeOptionsHtml = allowedTypes.map(t =>
    `<option value="${t.value}" ${autoType === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('');

  const gs = _lqGuideStyle(autoType);

  const div = document.createElement('div');
  div.id = qId;
  div.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;';
  div.innerHTML = `
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
  <span style="background:var(--accent);color:#fff;width:18px;height:18px;border-radius:50%;
               display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">Q</span>
  <span style="font-size:12px;font-weight:600;flex:1">Câu hỏi</span>
  <button class="btn btn-danger btn-sm" style="padding:3px 7px;font-size:11px"
          onclick="this.closest('[id^=lq-]').remove(); checkDuplicateLQNum()">✕</button>
</div>
<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:8px;margin-bottom:8px">
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">Số câu *</label>
    <input class="form-input lq-num" type="number" value="${data?.questionNumber || ''}"
           style="font-size:12px;padding:6px 9px" placeholder="Số câu"
           oninput="checkDuplicateLQNum(this)" />
    <div class="lq-dup-warn" style="display:none;font-size:10px;color:#ef4444;margin-top:3px;font-weight:600">⚠ Số câu này đã tồn tại!</div>
  </div>
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">Loại câu *</label>
    <select class="form-select lq-type" onchange="onLQTypeChange(this,'${qId}')"
            style="font-size:12px;padding:6px 9px${isSingle ? ';opacity:.65;pointer-events:none' : ''}">
      ${typeOptionsHtml}
    </select>
    ${isSingle ? `<div style="font-size:10px;color:var(--text3);margin-top:3px">💡 Loại câu cố định cho nhóm này</div>` : ''}
  </div>
</div>
<div class="lq-type-guide" id="lqguide-${qId}" style="margin-bottom:8px;padding:7px 10px;border-radius:6px;font-size:11px;line-height:1.6;background:${gs.bg};border-left:3px solid ${gs.border};color:${gs.color}">${getLQTypeGuide(autoType)}</div>
<div style="margin-bottom:8px">
  <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">Nội dung câu hỏi *</label>
  <textarea class="form-input lq-text" rows="2" style="font-size:12px;padding:6px 9px;resize:vertical"
    placeholder="Dùng ___ để đánh dấu chỗ trống">${data?.questionText || ''}</textarea>
</div>
<div class="lq-extra" id="lqex-${qId}">${renderLQExtra(autoType, data, qId)}</div>
<div class="lq-answer-row" style="display:${['checkbox','multi-answer-group'].includes(autoType) ? 'none' : 'grid'};grid-template-columns:1fr 1.5fr;gap:8px;margin-top:8px">
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">Đáp án đúng *</label>
    <input class="form-input lq-answer" value="${data?.correctAnswer || ''}"
           style="font-size:12px;padding:6px 9px"
           placeholder='A / text / ["A","C"]' />
    <div class="lq-answer-hint" style="font-size:10px;color:var(--text3);margin-top:3px">${getLQAnswerHint(autoType)}</div>
  </div>
  <div>
    <label style="font-size:10px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">Giải thích</label>
    <textarea class="form-input lq-explain" rows="3"
              style="font-size:12px;padding:6px 9px;resize:vertical"
              placeholder="Giải thích đáp án...">${(data?.explanation || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
  </div>
</div>`;

  container.appendChild(div);
}

// renderLQExtra và onLQTypeChange giữ nguyên từ code cũ
function renderLQExtra(type, data, qId) {
  if (type === 'multiple-choice') {
    const opts = data?.options || ['', '', '', ''];
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Các đáp án (A,B,C,D)</label>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">
    ${['A', 'B', 'C', 'D'].map((l, i) => `
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-weight:700;color:var(--accent);width:14px;font-size:12px">${l}.</span>
        <input class="form-input lq-opt" value="${opts[i] || ''}"
               style="font-size:12px;padding:5px 8px" placeholder="${l}" />
      </div>`).join('')}
  </div></div>`;
  }
  if (['sentence-completion', 'matching'].includes(type)) {
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Word Bank (cách nhau bằng dấu phẩy)</label>
  <input class="form-input lq-wordbank" value="${(data?.wordBank || []).join(', ')}"
         style="font-size:12px;padding:6px 9px;margin-top:4px" placeholder="word1, word2, word3..." /></div>`;
  }
  if (type === 'checkbox') {
    const opts = data?.options || [];
    let checkedLetters = [];
    try {
      const ca = data?.correctAnswer || '';
      if (ca.startsWith('[')) checkedLetters = JSON.parse(ca).map(x => x.toUpperCase().trim());
      else checkedLetters = ca.split(',').map(x => x.toUpperCase().trim()).filter(Boolean);
    } catch { checkedLetters = []; }
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Các đáp án (A→E)</label>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:4px">
    ${['A', 'B', 'C', 'D', 'E'].map((l, i) => `
      <div style="display:flex;align-items:center;gap:5px">
        <span style="font-weight:700;color:var(--accent);width:14px;font-size:12px">${l}.</span>
        <input class="form-input lq-opt" value="${opts[i] || ''}"
               style="font-size:12px;padding:5px 8px;flex:1" placeholder="${l}" />
      </div>`).join('')}
  </div>
  <div style="margin-top:10px">
    <label style="font-size:10px;font-weight:700;color:var(--green);display:block;margin-bottom:6px">✅ Tick đáp án đúng</label>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${['A','B','C','D','E'].map(l => `
        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text)">
          <input type="checkbox" class="lq-cb-correct" value="${l}"
                 ${checkedLetters.includes(l) ? 'checked' : ''}
                 style="width:15px;height:15px;accent-color:var(--green);cursor:pointer" />
          ${l}
        </label>`).join('')}
    </div>
  </div>
  <div style="margin-top:7px;display:flex;align-items:center;gap:8px">
    <label style="font-size:10px;color:var(--text3);white-space:nowrap">Số đáp án cần chọn:</label>
    <input class="form-input lq-cbcount" type="number" value="${data?.checkboxCount || 2}"
           style="width:56px;font-size:12px;padding:5px 8px" min="1" max="5" />
  </div></div>`;
  }
  if (type === 'multi-answer-group') {
    const opts = data?.options || ['', '', '', '', ''];
    const ca = (data?.correctAnswer || '').toUpperCase().trim();
    const optCount = Math.max(opts.length, 5); // tối thiểu 5 options
    const allLetters = 'ABCDEFG';
    const checkboxCount = data?.checkboxCount || 2;
    return `<div class="form-group" style="margin-bottom:0">
  <div style="font-size:11px;color:#6b21a8;margin-bottom:8px;padding:7px 10px;background:#fdf4ff;border-left:3px solid #a855f7;border-radius:4px;line-height:1.6">
    💡 <strong>Hướng dẫn:</strong> Mỗi câu trong nhóm nhập <strong>1 đáp án đúng riêng</strong> (1 chữ cái).<br>
    Frontend tự <strong>gộp N câu liên tiếp</strong> có cùng Options thành 1 UI "Choose N letters".
    VD: Q18=<code>A</code>, Q19=<code>C</code>, Q20=<code>F</code> → hiện "Choose THREE letters, A–G".
  </div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
    <label style="font-size:10px;font-weight:700;color:var(--text3);white-space:nowrap">Số đáp án cần chọn (= số câu trong nhóm):</label>
    <input class="form-input lq-cbcount lq-mag-count" type="number" value="${checkboxCount}"
           style="width:60px;font-size:13px;padding:5px 8px;font-weight:700" min="2" max="5"
           title="Admin nhập để reference; frontend tự đếm số câu trong cluster" />
    <span style="font-size:10px;color:var(--text3)">(chỉ để tham khảo – frontend tự đếm)</span>
  </div>
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Options (A→G, dùng chung cho tất cả câu trong nhóm)</label>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:4px">
    ${'ABCDEFG'.split('').map((l,i)=>
      '<div style="display:flex;align-items:center;gap:5px">'
      +'<span style="font-weight:700;color:var(--accent);width:14px;font-size:12px">'+l+'.</span>'
      +'<input class="form-input lq-opt" value="'+(opts[i]||'')+'" style="font-size:12px;padding:5px 8px;flex:1" placeholder="'+(i<5?'Bắt buộc':'Tuỳ chọn')+'" />'
      +'</div>'
    ).join('')}
  </div>
  <div style="margin-top:10px;display:flex;align-items:flex-start;gap:14px">
    <div>
      <label style="font-size:10px;font-weight:700;color:var(--green);display:block;margin-bottom:4px">✅ Đáp án đúng của <u>câu này</u></label>
      <input class="form-input lq-answer mag-answer" value="${ca}"
             style="font-size:18px;padding:7px 10px;width:64px;font-weight:900;letter-spacing:4px;text-transform:uppercase;text-align:center;border:2px solid var(--green)"
             maxlength="1" placeholder="A" oninput="this.value=this.value.toUpperCase().replace(/[^A-G]/,\'\')" />
    </div>
    <div style="font-size:11px;color:var(--text3);line-height:1.8;padding-top:18px">
      <strong>Ví dụ Q18-20 Choose THREE:</strong><br>
      • Câu 18 → nhập <strong>A</strong><br>
      • Câu 19 → nhập <strong>C</strong><br>
      • Câu 20 → nhập <strong>F</strong><br>
      Thứ tự chọn không quan trọng.
    </div>
  </div>
</div>`;
  }
  if (type === 'map-labelling') {
    const imgId = `lqimg-${qId || Date.now()}`;
    return `<div class="form-group" style="margin-bottom:0">
  <label style="font-size:10px;font-weight:700;color:var(--text3)">Hình ảnh (nếu câu này có ảnh riêng)</label>
  <input class="form-input lq-imageurl" value="${data?.imageUrl || ''}"
         style="font-size:12px;padding:6px 9px;margin-top:4px"
         placeholder="URL hình ảnh (để trống nếu dùng ảnh chung của nhóm)"
         oninput="previewGroupImage(this,'${imgId}')"/>
</div>`;
  }
  return '';
}

function getLQTypeGuide(type) {
  const guides = {
    'multiple-choice': `
      <strong>📝 Multiple Choice</strong> — Học sinh chọn 1 đáp án duy nhất.<br>
      • Nhập nội dung 4 đáp án vào ô A, B, C, D — <strong>không cần thêm chữ cái A/B/C/D vào đầu</strong> (hệ thống tự hiển thị).<br>
      • <strong>Đáp án đúng:</strong> nhập chữ cái tương ứng, VD: <code>A</code>, <code>B</code>, <code>C</code> hoặc <code>D</code>.`,
    'fill-blank': `
      <strong>✏️ Fill in the blank</strong> — Học sinh điền từ/cụm từ vào ô trống.<br>
      • Không cần nhập options.<br>
      • <strong>Đáp án đúng:</strong> nhập chính xác từ/cụm từ cần điền, VD: <code>kiln</code>`,
    'sentence-completion': `
      <strong>🔗 Sentence Completion</strong> — Học sinh kéo thả từ vào chỗ trống trong câu.<br>
      • Nhập Word Bank (cách nhau bằng dấu phẩy).<br>
      • Trong "Nội dung câu hỏi", dùng <code>___</code> hoặc <code>[blank]</code> để đánh dấu chỗ trống.<br>
      • <strong>Đáp án đúng:</strong> nhập đúng từ trong Word Bank, VD: <code>pottery</code>`,
    'matching': `
      <strong>🔀 Matching</strong> — Học sinh kéo thả để ghép cặp.<br>
      • Nhập Word Bank (cách nhau bằng dấu phẩy).<br>
      • Trong "Nội dung câu hỏi", dùng <code>___</code> để đánh dấu chỗ trống.<br>
      • <strong>Đáp án đúng:</strong> nhập đúng từ cần ghép, VD: <code>clay</code>`,
    'matching-info': `
      <strong>🔗 Matching Information / People</strong> — Học sinh ghép câu hỏi với chữ cái (người nói, sự vật…).<br>
      • Danh sách lựa chọn A-G được định nghĩa ở cấp <strong>nhóm</strong> (matching-options group).<br>
      • <strong>Đáp án đúng:</strong> nhập chữ cái, VD: <code>B</code>`,
    'map-labelling': `
      <strong>🗺️ Map Labelling</strong> — Học sinh điền tên địa điểm/vị trí trên bản đồ.<br>
      • Có thể upload URL ảnh bản đồ riêng cho câu này (hoặc dùng ảnh chung của nhóm).<br>
      • <strong>Đáp án đúng:</strong> nhập tên địa điểm, VD: <code>library</code>`,
    'checkbox': `
      <strong>☑️ Checkbox (legacy – không nên dùng)</strong> — Dạng cũ: chọn đúng <em>toàn bộ</em> set mới được điểm.<br>
      • <span style="color:#dc2626">⚠️ Dạng này đã được thay thế bởi <strong>🔢 Choose N Letters</strong>.</span><br>
      • Chỉ giữ lại để hiển thị đề cũ đã lưu trong DB. Đề mới hãy dùng <strong>multi-answer-group</strong>.<br>
      • Chấm: đúng <strong>toàn bộ</strong> set → 1 điểm; sai/thiếu 1 cái → 0 điểm.`,
    'multi-answer-group': `
      <strong>🔢 Choose N Letters – IELTS</strong> — Dạng "Questions 18-20 – Choose THREE letters, A-G".<br>
      • Nhập <strong>N câu riêng</strong> với <strong>cùng bộ Options</strong> (tối đa A→G, 7 options).<br>
      • Mỗi câu điền <strong>1 chữ cái đáp án đúng</strong>: Q18=<code>A</code>, Q19=<code>C</code>, Q20=<code>F</code>.<br>
      • Frontend tự <strong>gộp N câu liên tiếp</strong> có cùng Options thành 1 UI chọn N letters.<br>
      • Chấm: mỗi câu <strong>1 điểm riêng</strong>, thứ tự chọn không quan trọng.<br>
      • <span style="color:#dc2626">⚠️ Tất cả câu trong nhóm phải nằm liền kề trong cùng 1 Group.</span>`,
  };
  return guides[type] || '';
}

function getLQAnswerHint(type) {
  const hints = {
    'multiple-choice':     '💡 Nhập chữ cái: A, B, C hoặc D',
    'fill-blank':          '💡 Nhập đúng từ/cụm từ cần điền',
    'sentence-completion': '💡 Nhập từ trong Word Bank',
    'matching':            '💡 Nhập từ trong Word Bank',
    'matching-info':       '💡 Nhập chữ cái: A, B, C…',
    'map-labelling':       '💡 Nhập tên địa điểm trên bản đồ',
    'checkbox':            '',
    'multi-answer-group':  '💡 Nhập 1 chữ cái đáp án đúng của câu này (A → G). Frontend tự gộp các câu liên tiếp cùng options thành 1 UI.',
  };
  return hints[type] || '';
}

function onLQTypeChange(sel, qId) {
  document.getElementById(`lqex-${qId}`).innerHTML = renderLQExtra(sel.value, {}, qId);
  // Update guide banner
  const guide = document.getElementById(`lqguide-${qId}`);
  if (guide) {
    guide.innerHTML = getLQTypeGuide(sel.value);
    const gs = _lqGuideStyle(sel.value);
    guide.style.background = gs.bg;
    guide.style.borderLeftColor = gs.border;
    guide.style.color = gs.color;
  }
  const qDiv = sel.closest('[id^="lq-"]');
  if (qDiv) {
    const answerRow = qDiv.querySelector('.lq-answer-row');
    if (answerRow) {
      const isCheckbox = ['checkbox', 'multi-answer-group'].includes(sel.value);
      answerRow.style.display = isCheckbox ? 'none' : 'grid';
      const hint = answerRow.querySelector('.lq-answer-hint');
      if (hint) hint.textContent = getLQAnswerHint(sel.value);
      const answerInput = answerRow.querySelector('.lq-answer');
      if (answerInput) {
        const placeholders = {
          'multiple-choice':     'A, B, C hoặc D',
          'fill-blank':          'Nhập từ/cụm từ đúng',
          'sentence-completion': 'Nhập từ trong Word Bank',
          'matching':            'Nhập từ trong Word Bank',
          'matching-info':       'A, B, C…',
          'map-labelling':       'Tên địa điểm',
        };
        answerInput.placeholder = placeholders[sel.value] || 'Đáp án đúng';
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════
// COLLECT & SAVE
// ════════════════════════════════════════════════════════════════
function collectListeningSections() {
  const sections = [];
  for (const sDiv of document.querySelectorAll('#lt-sections-container > .question-row')) {
    const partNumber = parseInt(sDiv.querySelector('.ls-part').value);
    const title = sDiv.querySelector('.ls-title').value.trim();
    const desc = sDiv.querySelector('.ls-desc').value.trim();
    const qstart = parseInt(sDiv.querySelector('.ls-qstart').value);
    const qend = parseInt(sDiv.querySelector('.ls-qend').value);

    const transcript = sDiv.querySelector('.ls-transcript')?.value.trim() || '';

    if (!title || !qstart || !qend) {
      toast('Điền đầy đủ tiêu đề và phạm vi câu cho tất cả Parts', 'error'); return null;
    }

    const questionGroups = [];
    for (const gDiv of sDiv.querySelectorAll('[id^="lg-"]')) {
      // Skip non-group elements whose IDs also start with "lg-" (e.g. lg-opts-1, lg-wb-1, lg-reuse-1)
      const lgTypeEl = gDiv.querySelector('.lg-type');
      if (!lgTypeEl) continue;
      const groupType = lgTypeEl.value;
      const instruction = gDiv.querySelector('.lg-instruction')?.value.trim() || '';

      const group = { groupType, instruction };

      // ── Collect group-type config ──
      if (groupType === 'table') {
        const rawHeaders = gDiv.querySelector('.lg-tbl-headers')?.value || '';
        group.tableConfig = {
          headers: rawHeaders.split('|').map(h => h.trim()).filter(Boolean),
          rows: [...gDiv.querySelectorAll('.lg-tbl-row')].map(inp =>
            inp.value.split('|').map(c => c.trim())
          )
        };
      }
      if (groupType === 'note-form' || groupType === 'bullet-list') {
        const noteMode = gDiv.querySelector('.lg-note-mode:checked')?.value || 'note';
        const title = gDiv.querySelector('.lg-note-title')?.value.trim() || '';
        const lineVals = [...gDiv.querySelectorAll('.lg-note-line')].map(i => i.value);
        if (noteMode === 'bullet') {
          group.groupType = 'bullet-list';
          group.bulletConfig = { title, items: lineVals };
        } else {
          group.groupType = 'note-form';
          group.noteConfig = { title, lines: lineVals };
        }
      }
      if (groupType === 'matching-options' || groupType === 'sentence-endings') {
        const moMode = gDiv.querySelector('.lg-mo-mode:checked')?.value || 'matching';
        const opts = [...gDiv.querySelectorAll('.lg-opt')].map(i => i.value.trim());
        if (moMode === 'endings') {
          group.groupType = 'sentence-endings';
          group.endingsConfig = {
            endings: opts.map((text, i) => ({ letter: 'ABCDEFGHIJ'[i] || String(i+1), text }))
          };
        } else {
          group.groupType = 'matching-options';
          group.matchingOptions = opts;
          group.matchingReuseAllowed = gDiv.querySelector('.lg-reuse')?.checked || false;
          group.interchangeableAnswers = gDiv.querySelector('.lg-interchangeable')?.checked || false;
        }
      }
      if (groupType === 'summary-completion') {
        group.summaryConfig = {
          text: gDiv.querySelector('.lg-summary-text')?.value.trim() || '',
          wordBank: [...gDiv.querySelectorAll('.lg-wb-word')].map((inp, i) => ({
            letter: 'ABCDEFGHIJ'[i] || String(i + 1),
            word: inp.value.trim()
          }))
        };
      }
      if (groupType === 'map') {
        group.imageUrl = gDiv.querySelector('.lg-map-url')?.value.trim() || '';
      }

      // ── Collect questions ──
      const questions = [];
      for (const qDiv of gDiv.querySelectorAll('[id^="lq-"]')) {
        const num = parseInt(qDiv.querySelector('.lq-num').value);
        const type = qDiv.querySelector('.lq-type').value;
        const text = qDiv.querySelector('.lq-text').value.trim();
        const expl = qDiv.querySelector('.lq-explain').value.trim();

        let answer;
        if (type === 'checkbox') {
          const ticked = [...qDiv.querySelectorAll('.lq-cb-correct:checked')].map(cb => cb.value).sort();
          if (ticked.length === 0) {
            toast(`Câu ${num || '?'}: chưa tick đáp án đúng`, 'error'); return null;
          }
          answer = JSON.stringify(ticked);
        } else if (type === 'multi-answer-group') {
          // Mỗi câu có 1 chữ cái riêng (A-G)
          const magInput = qDiv.querySelector('.mag-answer') || qDiv.querySelector('.lq-answer');
          answer = magInput ? magInput.value.trim().toUpperCase() : '';
          if (!answer || !/^[A-G]$/.test(answer)) {
            toast(`Câu ${num || '?'}: đáp án phải là 1 chữ cái A-G`, 'error'); return null;
          }
        } else {
          answer = qDiv.querySelector('.lq-answer').value.trim();
        }

        if (!num || !text || !answer) {
          toast(`Điền đầy đủ số câu, nội dung và đáp án (câu ${num || '?'})`, 'error'); return null;
        }

        const q = { questionNumber: num, type, questionText: text, correctAnswer: answer, explanation: expl };

        if (['multiple-choice', 'checkbox', 'multi-answer-group'].includes(type))
          q.options = [...qDiv.querySelectorAll('.lq-opt')].map(i => i.value.trim()).filter(Boolean);
        if (type === 'checkbox')
          q.checkboxCount = parseInt(qDiv.querySelector('.lq-cbcount')?.value) || 2;
        if (type === 'multi-answer-group')
          q.checkboxCount = parseInt(qDiv.querySelector('.lq-mag-count')?.value) || 2;
        if (['sentence-completion', 'matching'].includes(type)) {
          const wb = qDiv.querySelector('.lq-wordbank')?.value || '';
          q.wordBank = wb.split(',').map(w => w.trim()).filter(Boolean);
        }
        if (type === 'map-labelling')
          q.imageUrl = qDiv.querySelector('.lq-imageurl')?.value.trim() || '';

        questions.push(q);
      }

      group.questions = questions;
      questionGroups.push(group);
    }

    sections.push({ partNumber, title, description: desc, transcript, questionRange: { start: qstart, end: qend }, questionGroups });
  }
  return sections;
}

async function saveListeningTest() {
  const name = document.getElementById('lt-name').value.trim();
  const number = parseInt(document.getElementById('lt-number').value);
  if (!name || !number) { toast('Tên đề và số thứ tự là bắt buộc', 'error'); return; }

  const sections = collectListeningSections();
  if (sections === null) return;

  const body = {
    name, testNumber: number,
    seriesName: document.getElementById('lt-series').value.trim(),
    sections
  };

  const btn = document.getElementById('btn-save-listening');
  btn.disabled = true; btn.textContent = 'Đang lưu...';
  try {
    const url = editListeningId ? `${API}/listening/admin/tests/${editListeningId}` : `${API}/listening/admin/tests`;
    const method = editListeningId ? 'PUT' : 'POST';
    const data = await (await fetch(url, { method, headers: authH(), body: JSON.stringify(body) })).json();
    if (!data.success) throw new Error(data.message);
    toast(editListeningId ? 'Đã cập nhật đề nghe' : 'Đã tạo đề nghe mới');
    closeModal('modal-listening'); await loadListeningTests();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Lưu đề nghe'; }
}

// ── Part range helpers (giữ nguyên) ─────────────────────────────
function getPartRange(partNumber) {
  const map = { 1: { start: 1, end: 10 }, 2: { start: 11, end: 20 }, 3: { start: 21, end: 30 }, 4: { start: 31, end: 40 } };
  return map[partNumber] || { start: 1, end: 10 };
}
function getPartRangeText(partNumber) {
  const r = getPartRange(partNumber);
  return `${r.start}–${r.end}`;
}
function onPartSelect(sel) {
  const sDiv = sel.closest('.question-row');
  const part = parseInt(sel.value);
  const range = getPartRange(part);
  sDiv.querySelector('.ls-qstart').value = range.start;
  sDiv.querySelector('.ls-qend').value = range.end;
  sDiv.querySelector('.ls-range-text').textContent = `${range.start}–${range.end}`;
}

// ── Upload Audio (giữ nguyên) ────────────────────────────────────
function openUploadAudioModal(id, name) {
  uploadAudioTestId = id;
  document.getElementById('upload-audio-name').textContent = name;
  document.getElementById('upload-audio-input').value = '';
  document.getElementById('upload-progress').classList.add('hidden');
  openModal('modal-upload-audio');
}

async function doUploadAudio() {
  const file = document.getElementById('upload-audio-input').files[0];
  if (!file) { toast('Chọn file audio trước', 'error'); return; }
  const btn = document.getElementById('btn-do-upload');
  btn.disabled = true; btn.textContent = 'Đang upload...';
  document.getElementById('upload-progress').classList.remove('hidden');
  const formData = new FormData();
  formData.append('audio', file);
  try {
    const res = await fetch(`${API}/listening/admin/tests/${uploadAudioTestId}/audio`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(`Upload thành công! Thời lượng: ${Math.floor(data.audioDuration / 60)}:${pad(data.audioDuration % 60)}`);
    closeModal('modal-upload-audio'); await loadListeningTests();
  } catch (err) { toast('Upload thất bại: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = '📤 Upload'; }
}

// ═══════════════════════════════════════════════════════
// WRITING EXAMS
// ═══════════════════════════════════════════════════════
function confirmAction(message, onConfirm) {
  const overlay = document.getElementById('modal-confirm-action');
  document.getElementById('confirm-action-msg').textContent = message;
  overlay.classList.remove('hidden');
  const btnOk  = document.getElementById('confirm-action-ok');
  const btnNo  = document.getElementById('confirm-action-no');
  const close  = () => overlay.classList.add('hidden');
  btnOk.onclick  = () => { close(); onConfirm(); };
  btnNo.onclick  = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

/* ── Task 1 Pool ── */
async function loadTask1Pool() {
  try {
    const res  = await fetch(`${API}/admin/writing-task1`, { headers: authH() });
    const data = await res.json();
    const list = data.tasks || [];
    document.getElementById('writing-task1-tbody').innerHTML = list.length
      ? list.map(t => `
        <tr>
          <td style="max-width:340px;white-space:normal;font-size:13px">${escH((t.prompt || '').slice(0, 120))}${t.prompt?.length > 120 ? '…' : ''}</td>
          <td>${t.imageUrl ? `<a href="${escH(t.imageUrl)}" target="_blank" style="color:var(--blue);font-size:12px">🖼 Xem</a>` : '<span style="color:var(--text3);font-size:12px">–</span>'}</td>
          <td><span class="badge ${t.isActive ? 'badge-green' : 'badge-gray'}">${t.isActive ? 'Active' : 'Ẩn'}</span></td>
          <td style="font-size:12px;color:var(--text3)">${formatDate(t.createdAt)}</td>
          <td><div class="row-actions">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openTask1Modal('${t._id}')" title="Chỉnh sửa">✏️</button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleTask1('${t._id}',${t.isActive})" title="${t.isActive ? 'Ẩn' : 'Hiện'}">${t.isActive ? '🙈' : '👁'}</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeleteTask1('${t._id}')" title="Xóa vĩnh viễn">🗑</button>
          </div></td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="table-empty">Pool Task 1 đang trống. Thêm câu hỏi để học sinh có thể thi.</td></tr>';
  } catch { toast('Lỗi load Task 1 pool', 'error'); }
}

/* ── Task 2 Pool ── */
async function loadTask2Pool() {
  try {
    const res  = await fetch(`${API}/admin/writing-task2`, { headers: authH() });
    const data = await res.json();
    const list = data.tasks || [];
    document.getElementById('writing-task2-tbody').innerHTML = list.length
      ? list.map(t => `
        <tr>
          <td style="max-width:400px;white-space:normal;font-size:13px">${escH((t.prompt || '').slice(0, 140))}${t.prompt?.length > 140 ? '…' : ''}</td>
          <td><span class="badge ${t.isActive ? 'badge-green' : 'badge-gray'}">${t.isActive ? 'Active' : 'Ẩn'}</span></td>
          <td style="font-size:12px;color:var(--text3)">${formatDate(t.createdAt)}</td>
          <td><div class="row-actions">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openTask2Modal('${t._id}')" title="Chỉnh sửa">✏️</button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleTask2('${t._id}',${t.isActive})" title="${t.isActive ? 'Ẩn' : 'Hiện'}">${t.isActive ? '🙈' : '👁'}</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeleteTask2('${t._id}')" title="Xóa vĩnh viễn">🗑</button>
          </div></td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="table-empty">Pool Task 2 đang trống. Thêm câu hỏi để học sinh có thể thi.</td></tr>';
  } catch { toast('Lỗi load Task 2 pool', 'error'); }
}

let _writingAttempts = [];

async function loadWritingHistory() {
  try {
    const res  = await fetch(`${API}/admin/writing-history`, { headers: authH() });
    const data = await res.json();
    _writingAttempts = data.success ? data.attempts : [];
    applyWritingFilters();
  } catch { toast('Lỗi load lịch sử writing', 'error'); }
}

function applyWritingFilters() {
  const q      = (document.getElementById('writing-history-search')?.value || '').trim().toLowerCase();
  const status = document.getElementById('writing-grading-filter')?.value || '';
  const filtered = _writingAttempts.filter(a => {
    const u    = a.userId || {};
    const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || '');
    const matchQ = !q || name.toLowerCase().includes(q) || (a.examName || '').toLowerCase().includes(q);
    const matchS = !status || a.gradingStatus === status;
    return matchQ && matchS;
  });
  renderWritingHistory(filtered);
}

function filterWritingHistory(q) { applyWritingFilters(); }

function _wcBadge(wc, target) {
  const num  = wc || 0;
  const met  = num >= target;
  const close = num >= target * 0.8;
  const bg   = met ? '#dcfce7' : close ? '#fef9c3' : '#fee2e2';
  const col  = met ? '#15803d' : close ? '#a16207' : '#b91c1c';
  const warn = met ? '' : ` ⚠ <${target}`;
  return `<span style="background:${bg};color:${col};border-radius:5px;padding:2px 8px;font-size:12px;font-weight:600">${num} từ${warn}</span>`;
}

function _gradingBadge(a) {
  if (a.gradingStatus === 'confirmed' && a.grading?.overallBand != null) {
    return `<span style="background:#dcfce7;color:#15803d;border-radius:5px;padding:2px 8px;font-size:12px;font-weight:700">${a.grading.overallBand}</span>`;
  }
  if (a.gradingStatus === 'ai_done') {
    return `<span style="background:#fef3c7;color:#d97706;border-radius:5px;padding:2px 8px;font-size:12px;font-weight:600">AI ⏳</span>`;
  }
  return `<span style="background:#f3f4f6;color:#9ca3af;border-radius:5px;padding:2px 8px;font-size:12px">Chờ</span>`;
}

function renderWritingHistory(list) {
  document.getElementById('writing-history-tbody').innerHTML = list.length
    ? list.map(a => {
        const u    = a.userId || {};
        const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || '–');
        const date = formatDate(a.submittedAt);
        return `<tr>
          <td>${escH(name)}</td>
          <td>${escH(a.examName || '–')}</td>
          <td>${_wcBadge(a.wordCount1, 150)}</td>
          <td>${_wcBadge(a.wordCount2, 250)}</td>
          <td>${_gradingBadge(a)}</td>
          <td style="font-size:12px;color:var(--text3)">${date}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="viewWritingAttempt('${a._id}')">👁 Xem</button>
            <button class="btn btn-ghost btn-sm" onclick="downloadWritingAttempt('${a._id}')" style="margin-left:4px">⬇</button>
            <button class="btn btn-danger btn-sm" onclick="deleteWritingAttempt('${a._id}')" style="margin-left:4px">🗑</button>
          </td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="7" class="table-empty">Không tìm thấy bài nộp nào</td></tr>';
}

/* ── Task 1 Pool modals ── */
let _editingTask1Id = null;
async function openTask1Modal(id) {
  _editingTask1Id = id || null;
  document.getElementById('t1m-id').value           = id || '';
  document.getElementById('t1m-prompt').value       = '';
  document.getElementById('t1m-instructions').value = 'You should spend about 20 minutes on this task. Write at least 150 words.';
  document.getElementById('t1m-image').value        = '';
  document.getElementById('t1m-img-preview').style.display = 'none';
  if (id) {
    try {
      const res  = await fetch(`${API}/admin/writing-task1/${id}`, { headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const t = data.task;
      document.getElementById('t1m-id').value           = t._id;
      document.getElementById('t1m-prompt').value       = t.prompt || '';
      document.getElementById('t1m-instructions').value = t.instructions || '';
      document.getElementById('t1m-image').value        = t.imageUrl || '';
      if (t.imageUrl) {
        const img = document.getElementById('t1m-img-preview');
        img.src = t.imageUrl; img.style.display = 'block';
      }
    } catch (err) { toast('Lỗi load Task 1: ' + err.message, 'error'); return; }
  }
  openModal('modal-task1');
}

async function uploadTask1Image() {
  const file = document.getElementById('t1m-img-file').files[0];
  if (!file) { toast('Chọn ảnh trước', 'error'); return; }
  const btn = document.getElementById('btn-upload-t1img');
  btn.disabled = true; btn.textContent = 'Đang upload...';
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const res  = await fetch(`${API}/admin/writing-task1/upload-image`, {
      method: 'POST', headers: authH(), body: JSON.stringify({ imageBase64: dataUrl })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    document.getElementById('t1m-image').value = data.url;
    const img = document.getElementById('t1m-img-preview');
    img.src = data.url; img.style.display = 'block';
    toast('Upload ảnh thành công!');
  } catch (err) { toast('Upload thất bại: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = '📤 Upload'; }
}

async function saveTask1() {
  const id     = document.getElementById('t1m-id').value;
  const prompt = document.getElementById('t1m-prompt').value.trim();
  if (!prompt) { toast('Nhập nội dung prompt', 'error'); return; }
  const payload = {
    prompt,
    instructions: document.getElementById('t1m-instructions').value.trim(),
    imageUrl:     document.getElementById('t1m-image').value.trim()
  };
  try {
    const url = id ? `${API}/admin/writing-task1/${id}` : `${API}/admin/writing-task1`;
    const res  = await fetch(url, {
      method: id ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(id ? 'Đã cập nhật Task 1' : 'Đã thêm Task 1 vào pool');
    closeModal('modal-task1');
    loadTask1Pool();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function toggleTask1(id, isActive) {
  try {
    const res  = await fetch(`${API}/admin/writing-task1/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(isActive ? 'Đã ẩn Task 1' : 'Đã hiện Task 1'); loadTask1Pool();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function hardDeleteTask1(id) {
  confirmAction('Xóa VĨNH VIỄN Task 1 này? Không thể khôi phục!', async () => {
    try {
      const res  = await fetch(`${API}/admin/writing-task1/${id}/permanent`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn Task 1');
      loadTask1Pool();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ── Task 2 Pool modals ── */
let _editingTask2Id = null;
async function openTask2Modal(id) {
  _editingTask2Id = id || null;
  document.getElementById('t2m-id').value           = id || '';
  document.getElementById('t2m-prompt').value       = '';
  document.getElementById('t2m-instructions').value = 'You should spend about 40 minutes on this task. Write at least 250 words.';
  if (id) {
    try {
      const res  = await fetch(`${API}/admin/writing-task2/${id}`, { headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const t = data.task;
      document.getElementById('t2m-id').value           = t._id;
      document.getElementById('t2m-prompt').value       = t.prompt || '';
      document.getElementById('t2m-instructions').value = t.instructions || '';
    } catch (err) { toast('Lỗi load Task 2: ' + err.message, 'error'); return; }
  }
  openModal('modal-task2');
}

async function saveTask2() {
  const id     = document.getElementById('t2m-id').value;
  const prompt = document.getElementById('t2m-prompt').value.trim();
  if (!prompt) { toast('Nhập nội dung prompt', 'error'); return; }
  const payload = {
    prompt,
    instructions: document.getElementById('t2m-instructions').value.trim()
  };
  try {
    const url = id ? `${API}/admin/writing-task2/${id}` : `${API}/admin/writing-task2`;
    const res  = await fetch(url, {
      method: id ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(id ? 'Đã cập nhật Task 2' : 'Đã thêm Task 2 vào pool');
    closeModal('modal-task2');
    loadTask2Pool();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function toggleTask2(id, isActive) {
  try {
    const res  = await fetch(`${API}/admin/writing-task2/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(isActive ? 'Đã ẩn Task 2' : 'Đã hiện Task 2'); loadTask2Pool();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function hardDeleteTask2(id) {
  confirmAction('Xóa VĨNH VIỄN Task 2 này? Không thể khôi phục!', async () => {
    try {
      const res  = await fetch(`${API}/admin/writing-task2/${id}/permanent`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn Task 2');
      loadTask2Pool();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

let _currentWritingAttempt = null;

async function viewWritingAttempt(id) {
  try {
    const res  = await fetch(`${API}/admin/writing-attempt/${id}`, { headers: authH() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    _currentWritingAttempt = data.attempt;
    _renderWritingModal(_currentWritingAttempt);
    openModal('modal-writing-view');
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

function _renderWritingModal(a) {
  const u    = a.userId || {};
  const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || '');
  const t1   = a.task1Snapshot || {};
  const t2   = a.task2Snapshot || {};

  const essayHtml = `
    <div style="margin-bottom:14px">
      <strong>${escH(a.examName || '')}</strong> – ${escH(name)}<br/>
      <small style="color:var(--text3)">${formatDate(a.submittedAt)}</small>
    </div>
    <div style="margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">TASK 1 – ${a.wordCount1 || 0} từ</div>
      ${t1.imageUrl ? `<img src="${escH(t1.imageUrl)}" style="max-width:100%;border-radius:6px;margin-bottom:8px">` : ''}
      ${t1.prompt   ? `<div style="background:var(--surface2);border-radius:6px;padding:10px 12px;font-size:13px;margin-bottom:8px;white-space:pre-wrap">${escH(t1.prompt)}</div>` : ''}
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:12px 14px;font-size:13px;line-height:1.75;white-space:pre-wrap">${escH(a.task1Answer || '(trống)')}</div>
    </div>
    <div style="margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">TASK 2 – ${a.wordCount2 || 0} từ</div>
      ${t2.prompt ? `<div style="background:var(--surface2);border-radius:6px;padding:10px 12px;font-size:13px;margin-bottom:8px;white-space:pre-wrap">${escH(t2.prompt)}</div>` : ''}
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:12px 14px;font-size:13px;line-height:1.75;white-space:pre-wrap">${escH(a.task2Answer || '(trống)')}</div>
    </div>`;

  const hasGrading = a.gradingStatus === 'ai_done' || a.gradingStatus === 'confirmed';
  const sourceGrade = a.gradingStatus === 'confirmed' ? a.grading : a.aiGrading;

  const gradingHtml = hasGrading && sourceGrade
    ? _buildGradingForm(sourceGrade, a.gradingStatus === 'confirmed', a._id)
    : `<div id="wg-grading-section" style="border-top:2px dashed var(--border);padding-top:16px;margin-top:4px;text-align:center;color:var(--text3);font-size:13px;padding-bottom:20px">
        Bài thi chưa được chấm điểm AI.<br>Nhấn <strong>🤖 AI Chấm điểm</strong> để tự động chấm.
      </div>`;

  document.getElementById('writing-view-body').innerHTML = essayHtml + gradingHtml;
  document.getElementById('writing-view-name').textContent = `${name} – ${a.examName || ''}`;
  document.getElementById('btn-download-writing').onclick = () => downloadWritingAttemptData(a);

  const btnAI      = document.getElementById('btn-ai-grade-writing');
  const btnConfirm = document.getElementById('btn-confirm-grade');
  btnAI.style.display      = (a.gradingStatus === 'pending' || a.gradingStatus === 'ai_done') ? '' : 'none';
  btnAI.textContent        = a.gradingStatus === 'ai_done' ? '🔄 Chấm lại AI' : '🤖 AI Chấm điểm';
  btnConfirm.style.display = hasGrading ? '' : 'none';
}

function _buildGradingForm(g, isConfirmed, attemptId) {
  const labelStyle = 'font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px';
  const criteria = [
    { key: 'ta',  label: 'Task Achievement/Response' },
    { key: 'cc',  label: 'Coherence & Cohesion' },
    { key: 'lr',  label: 'Lexical Resource' },
    { key: 'gra', label: 'Grammatical Range & Accuracy' }
  ];

  function buildTaskForm(taskKey, taskLabel, taskData) {
    const td = taskData || {};
    const crit = criteria.map(c => `
      <div style="display:grid;grid-template-columns:160px 60px 1fr;gap:8px;align-items:start;margin-bottom:10px">
        <div style="${labelStyle};padding-top:6px">${c.label}</div>
        <input type="number" id="wg-${taskKey}-${c.key}-score" value="${td[c.key]?.score ?? ''}"
          min="0" max="9" step="0.5"
          oninput="wgRecalcBand('${taskKey}')"
          style="border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:13px;font-weight:700;text-align:center;width:100%">
        <textarea id="wg-${taskKey}-${c.key}-comment" rows="2"
          style="border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:12px;resize:vertical;width:100%"
          placeholder="Nhận xét...">${escH(td[c.key]?.comment || '')}</textarea>
      </div>`).join('');

    const corrections = (td.corrections || []).map(c =>
      `<tr>
        <td style="font-size:12px;color:#dc2626;padding:4px 8px">${escH(c.original)}</td>
        <td style="font-size:12px;color:#16a34a;padding:4px 8px">${escH(c.corrected)}</td>
        <td style="font-size:12px;color:var(--text2);padding:4px 8px">${escH(c.explanation)}</td>
      </tr>`).join('');

    const suggestions = (td.suggestions || []).map((s, i) =>
      `<li style="font-size:12px;margin-bottom:4px">${escH(s)}</li>`).join('');

    return `
      <div style="border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <span style="font-size:13px;font-weight:700;color:var(--accent)">${taskLabel}</span>
          <span style="font-size:11px;color:var(--text3)">Band:</span>
          <span id="wg-${taskKey}-band" style="font-size:18px;font-weight:800;color:#2563eb">${td.bandScore ?? '–'}</span>
        </div>
        ${crit}
        <div style="margin-top:10px">
          <div style="${labelStyle};margin-bottom:4px">Nhận xét tổng thể (gửi cho học sinh)</div>
          <textarea id="wg-${taskKey}-feedback" rows="3"
            style="border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:13px;resize:vertical;width:100%;box-sizing:border-box"
            placeholder="Nhận xét tổng thể...">${escH(td.overallFeedback || '')}</textarea>
        </div>
        ${corrections ? `
        <div style="margin-top:10px">
          <div style="${labelStyle};margin-bottom:4px">Lỗi sửa (AI)</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead><tr style="background:var(--surface2)">
              <th style="padding:4px 8px;text-align:left;font-size:11px">Lỗi</th>
              <th style="padding:4px 8px;text-align:left;font-size:11px">Sửa thành</th>
              <th style="padding:4px 8px;text-align:left;font-size:11px">Giải thích</th>
            </tr></thead>
            <tbody>${corrections}</tbody>
          </table>
        </div>` : ''}
        ${suggestions ? `
        <div style="margin-top:10px">
          <div style="${labelStyle};margin-bottom:4px">Gợi ý cải thiện (AI)</div>
          <ul style="margin:0;padding-left:18px">${suggestions}</ul>
        </div>` : ''}
      </div>`;
  }

  const t1Form = buildTaskForm('t1', 'TASK 1', g.task1);
  const t2Form = buildTaskForm('t2', 'TASK 2', g.task2);

  return `
    <div id="wg-grading-section" style="border-top:2px solid var(--accent);padding-top:16px;margin-top:4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <span style="font-size:14px;font-weight:800">🤖 Chấm điểm IELTS</span>
        ${isConfirmed ? `<span style="background:#dcfce7;color:#15803d;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700">✓ Đã xác nhận</span>` : `<span style="background:#fef3c7;color:#d97706;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700">Chờ xác nhận</span>`}
        <span style="margin-left:auto;font-size:12px;color:var(--text3)">Overall Band: <strong id="wg-overall-band" style="font-size:18px;color:#2563eb">${g.overallBand ?? '–'}</strong></span>
      </div>
      ${t1Form}
      ${t2Form}
      <div style="margin-top:4px">
        <div style="${labelStyle};margin-bottom:4px">Ghi chú của giáo viên (không hiện với học sinh)</div>
        <textarea id="wg-admin-note" rows="2"
          style="border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:13px;resize:vertical;width:100%;box-sizing:border-box"
          placeholder="Ghi chú nội bộ...">${escH(g.adminNote || '')}</textarea>
      </div>
    </div>`;
}

function wgRecalcBand(taskKey) {
  const scores = ['ta','cc','lr','gra'].map(c =>
    parseFloat(document.getElementById(`wg-${taskKey}-${c}-score`)?.value) || 0
  );
  const avg  = scores.reduce((a, b) => a + b, 0) / 4;
  const band = Math.round(avg * 2) / 2;
  const el   = document.getElementById(`wg-${taskKey}-band`);
  if (el) el.textContent = band.toFixed(1);

  const t1 = parseFloat(document.getElementById('wg-t1-band')?.textContent) || 0;
  const t2 = parseFloat(document.getElementById('wg-t2-band')?.textContent) || 0;
  const overall = Math.round((t1 + t2) / 2 * 2) / 2;
  const oel = document.getElementById('wg-overall-band');
  if (oel) oel.textContent = overall.toFixed(1);
}

async function aiGradeWriting() {
  if (!_currentWritingAttempt) return;
  const btn = document.getElementById('btn-ai-grade-writing');
  btn.disabled = true;
  btn.textContent = '⏳ Đang chấm...';
  const section = document.getElementById('wg-grading-section');
  if (section) section.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3);font-size:13px">⏳ AI đang chấm bài, vui lòng chờ 15-30 giây...</div>';

  try {
    const res  = await fetch(`${API}/admin/writing-attempts/${_currentWritingAttempt._id}/ai-grade`, {
      method: 'POST', headers: authH()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    _currentWritingAttempt.aiGrading   = { task1: data.task1, task2: data.task2, generatedAt: new Date() };
    _currentWritingAttempt.gradingStatus = 'ai_done';

    const gradingSection = document.getElementById('wg-grading-section');
    gradingSection.outerHTML = _buildGradingForm({ task1: data.task1, task2: data.task2 }, false, _currentWritingAttempt._id);

    btn.disabled  = false;
    btn.textContent = '🔄 Chấm lại AI';
    document.getElementById('btn-confirm-grade').style.display = '';
    loadWritingHistory();
    toast('AI đã chấm xong! Hãy kiểm tra và xác nhận điểm.');
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '🤖 AI Chấm điểm';
    toast('Lỗi AI: ' + err.message, 'error');
  }
}

function _collectTaskGrade(taskKey, sourceGrading) {
  const src = sourceGrading || {};
  return {
    bandScore:       parseFloat(document.getElementById(`wg-${taskKey}-band`)?.textContent) || 0,
    ta:  { score: parseFloat(document.getElementById(`wg-${taskKey}-ta-score`)?.value)  || 0, comment: document.getElementById(`wg-${taskKey}-ta-comment`)?.value  || '' },
    cc:  { score: parseFloat(document.getElementById(`wg-${taskKey}-cc-score`)?.value)  || 0, comment: document.getElementById(`wg-${taskKey}-cc-comment`)?.value  || '' },
    lr:  { score: parseFloat(document.getElementById(`wg-${taskKey}-lr-score`)?.value)  || 0, comment: document.getElementById(`wg-${taskKey}-lr-comment`)?.value  || '' },
    gra: { score: parseFloat(document.getElementById(`wg-${taskKey}-gra-score`)?.value) || 0, comment: document.getElementById(`wg-${taskKey}-gra-comment`)?.value || '' },
    overallFeedback: document.getElementById(`wg-${taskKey}-feedback`)?.value || '',
    corrections:     src.corrections  || [],
    suggestions:     src.suggestions  || []
  };
}

async function saveConfirmedGrade() {
  if (!_currentWritingAttempt) return;
  const btn = document.getElementById('btn-confirm-grade');
  btn.disabled = true;
  btn.textContent = '⏳ Đang lưu...';

  const aiSrc = _currentWritingAttempt.aiGrading || _currentWritingAttempt.grading || {};
  const payload = {
    task1:       _collectTaskGrade('t1', aiSrc.task1),
    task2:       _collectTaskGrade('t2', aiSrc.task2),
    overallBand: parseFloat(document.getElementById('wg-overall-band')?.textContent) || 0,
    adminNote:   document.getElementById('wg-admin-note')?.value || ''
  };

  try {
    const res  = await fetch(`${API}/admin/writing-attempts/${_currentWritingAttempt._id}/confirm-grade`, {
      method: 'PUT', headers: authH(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast('Đã xác nhận! Học sinh có thể xem điểm và feedback.', 'success');
    closeModal('modal-writing-view');
    _currentWritingAttempt = null;
    loadWritingHistory();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '✓ Xác nhận & Gửi học sinh';
    toast('Lỗi lưu: ' + err.message, 'error');
  }
}

async function downloadWritingAttempt(id) {
  try {
    const res  = await fetch(`${API}/admin/writing-attempt/${id}`, { headers: authH() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    downloadWritingAttemptData(data.attempt);
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

function downloadWritingAttemptData(a) {
  const u    = a.userId || {};
  const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || '');
  const date = formatDate(a.submittedAt);
  const t1Prompt = a.task1Snapshot?.prompt || '';
  const t2Prompt = a.task2Snapshot?.prompt || '';
  const lines = [
    `ENGLISH WITH DAN – WRITING SUBMISSION`,
    `========================================`,
    `Học sinh: ${name}`,
    `Đề: ${a.examName || ''}`,
    `Ngày nộp: ${date}`,
    `Task 1: ${a.wordCount1 || 0} từ   |   Task 2: ${a.wordCount2 || 0} từ`,
    ``,
    `────────────────────────────────────────`,
    `TASK 1`,
    `────────────────────────────────────────`,
    t1Prompt,
    ``,
    a.task1Answer || '',
    ``,
    `────────────────────────────────────────`,
    `TASK 2`,
    `────────────────────────────────────────`,
    t2Prompt,
    ``,
    a.task2Answer || '',
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `writing_${name.replace(/\s+/g,'_')}_${(a.examName||'').replace(/\s+/g,'_')}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function escH(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════════
   SPEAKING – Questions
══════════════════════════════════════════════ */
async function loadSpeakingQuestions() {
  const part  = document.getElementById('sq-filter-part').value;
  const topic = document.getElementById('sq-filter-topic').value.trim();
  const params = [];
  if (part)  params.push(`part=${part}`);
  if (topic) params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';
  try {
    const res  = await fetch(`${API}/admin/speaking/questions${qs}`, { headers: authH() });
    const data = await res.json();
    const list = data.questions || [];
    document.getElementById('speaking-q-tbody').innerHTML = list.length
      ? list.map(q => `
        <tr>
          <td><span class="badge badge-blue">Part ${q.part}</span></td>
          <td>${escH(q.topic)}</td>
          <td style="max-width:300px;white-space:normal">${escH(q.question)}</td>
          <td>${q.cueCard ? '✅' : '–'}</td>
          <td>${formatDate(q.createdAt)}</td>
          <td><div class="row-actions">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openSpeakingQModal('${q._id}')" title="Chỉnh sửa">✏️</button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleSpeakingQuestion('${q._id}',${q.isActive !== false})" title="${q.isActive !== false ? 'Ẩn' : 'Hiện'}">${q.isActive !== false ? '🙈' : '👁'}</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeleteSpeakingQuestion('${q._id}')" title="Xóa vĩnh viễn">🗑</button>
          </div></td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="table-empty">Chưa có câu hỏi nào.</td></tr>';
  } catch { toast('Lỗi load câu hỏi speaking', 'error'); }
}

let _editingSpeakingQId = null;
async function openSpeakingQModal(id) {
  _editingSpeakingQId = id || null;
  document.getElementById('sq-modal-title').textContent = id ? 'Sửa câu hỏi Speaking' : 'Thêm câu hỏi Speaking';
  document.getElementById('sq-id').value       = '';
  document.getElementById('sq-part').value     = '1';
  document.getElementById('sq-topic').value    = '';
  document.getElementById('sq-question').value = '';
  document.getElementById('sq-cue').value      = '';
  if (id) {
    try {
      const res  = await fetch(`${API}/admin/speaking/questions?_id=${id}`, { headers: authH() });
      const data = await res.json();
      const q    = (data.questions || []).find(x => x._id === id);
      if (q) {
        document.getElementById('sq-id').value       = q._id;
        document.getElementById('sq-part').value     = q.part;
        document.getElementById('sq-topic').value    = q.topic;
        document.getElementById('sq-question').value = q.question;
        document.getElementById('sq-cue').value      = q.cueCard || '';
      }
    } catch { toast('Lỗi load câu hỏi', 'error'); return; }
  }
  openModal('modal-speaking-q');
}

async function saveSpeakingQuestion() {
  const id       = document.getElementById('sq-id').value;
  const part     = parseInt(document.getElementById('sq-part').value);
  const topic    = document.getElementById('sq-topic').value.trim();
  const question = document.getElementById('sq-question').value.trim();
  const cueCard  = document.getElementById('sq-cue').value.trim();
  if (!topic || !question) { toast('Vui lòng điền Topic và Câu hỏi', 'error'); return; }
  try {
    const method = id ? 'PUT' : 'POST';
    const url    = id
      ? `${API}/admin/speaking/questions/${id}`
      : `${API}/admin/speaking/questions`;
    const res  = await fetch(url, {
      method,
      headers: { ...authH(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ part, topic, question, cueCard })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(id ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi');
    closeModal('modal-speaking-q');
    loadSpeakingQuestions();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function toggleSpeakingQuestion(id, isActive) {
  try {
    const res  = await fetch(`${API}/admin/speaking/questions/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(isActive ? 'Đã ẩn câu hỏi' : 'Đã hiện câu hỏi'); loadSpeakingQuestions();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}
function hardDeleteSpeakingQuestion(id) {
  confirmAction('Xóa VĨNH VIỄN câu hỏi này? Không thể khôi phục!', async () => {
    try {
      const res  = await fetch(`${API}/admin/speaking/questions/${id}/permanent`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn câu hỏi');
      loadSpeakingQuestions();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════
   SPEAKING – Materials (PDF)
══════════════════════════════════════════════ */
async function loadSpeakingMaterials() {
  try {
    const res  = await fetch(`${API}/admin/speaking/materials`, { headers: authH() });
    const data = await res.json();
    const list = data.materials || [];
    document.getElementById('speaking-mat-tbody').innerHTML = list.length
      ? list.map(m => `
        <tr>
          <td>${escH(m.title)}</td>
          <td>${escH(m.quarter)}</td>
          <td>${escH(m.topic)}</td>
          <td><a href="${escH(m.pdfUrl)}" target="_blank" style="color:var(--primary)">📄 Xem</a></td>
          <td>${formatDate(m.createdAt)}</td>
          <td><div class="row-actions">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openSpeakingMatModal('${m._id}')" title="Chỉnh sửa">✏️</button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleSpeakingMaterial('${m._id}',${m.isActive !== false})" title="${m.isActive !== false ? 'Ẩn' : 'Hiện'}">${m.isActive !== false ? '🙈' : '👁'}</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeleteSpeakingMaterial('${m._id}')" title="Xóa vĩnh viễn">🗑</button>
          </div></td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="table-empty">Chưa có tài liệu nào.</td></tr>';
  } catch { toast('Lỗi load tài liệu speaking', 'error'); }
}

let _editingSpeakingMatId = null;
async function openSpeakingMatModal(id) {
  _editingSpeakingMatId = id || null;
  document.getElementById('smat-modal-title').textContent = id ? 'Sửa tài liệu' : 'Upload tài liệu PDF';
  document.getElementById('smat-id').value      = '';
  document.getElementById('smat-title').value   = '';
  document.getElementById('smat-quarter').value = '';
  document.getElementById('smat-topic').value   = '';
  document.getElementById('smat-file-group').querySelector('label').textContent = id ? 'Thay thế PDF (tuỳ chọn)' : 'File PDF *';
  document.getElementById('smat-file').value = '';
  document.getElementById('smat-save-btn').textContent = id ? '💾 Lưu' : '📤 Upload & Lưu';
  document.getElementById('smat-upload-status').style.display = 'none';
  if (id) {
    try {
      const res  = await fetch(`${API}/admin/speaking/materials`, { headers: authH() });
      const data = await res.json();
      const m    = (data.materials || []).find(x => x._id === id);
      if (m) {
        document.getElementById('smat-id').value      = m._id;
        document.getElementById('smat-title').value   = m.title;
        document.getElementById('smat-quarter').value = m.quarter;
        document.getElementById('smat-topic').value   = m.topic;
      }
    } catch { toast('Lỗi load tài liệu', 'error'); return; }
  }
  openModal('modal-speaking-mat');
}

async function saveSpeakingMaterial() {
  const id      = document.getElementById('smat-id').value;
  const title   = document.getElementById('smat-title').value.trim();
  const quarter = document.getElementById('smat-quarter').value.trim();
  const topic   = document.getElementById('smat-topic').value.trim();
  if (!title || !quarter || !topic) { toast('Vui lòng điền đầy đủ thông tin', 'error'); return; }

  const btn    = document.getElementById('smat-save-btn');
  const status = document.getElementById('smat-upload-status');
  btn.disabled = true;

  try {
    if (id) {
      // Update metadata; optionally replace PDF if new file selected
      const file = document.getElementById('smat-file').files[0];
      let updateBody = { title, quarter, topic };
      if (file) {
        status.style.display = 'block';
        status.textContent   = '⬆️ Đang upload PDF mới...';
        const formData = new FormData();
        formData.append('pdf', file);
        const uploadRes  = await fetch(`${API}/admin/speaking/materials/upload-pdf`, {
          method: 'POST',
          headers: { Authorization: authH().Authorization },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error(uploadData.message);
        updateBody.pdfUrl = uploadData.url;
        status.textContent = '💾 Đang lưu...';
      }
      const res  = await fetch(`${API}/admin/speaking/materials/${id}`, {
        method: 'PUT',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã cập nhật tài liệu');
    } else {
      // Upload PDF then save
      const file = document.getElementById('smat-file').files[0];
      if (!file) { toast('Chưa chọn file PDF', 'error'); btn.disabled = false; return; }

      status.style.display = 'block';
      status.textContent   = '⬆️ Đang upload PDF lên Cloudinary...';

      const formData = new FormData();
      formData.append('pdf', file);
      const uploadRes  = await fetch(`${API}/admin/speaking/materials/upload-pdf`, {
        method: 'POST',
        headers: { Authorization: authH().Authorization },
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message);

      status.textContent = '💾 Đang lưu thông tin...';
      const saveRes  = await fetch(`${API}/admin/speaking/materials`, {
        method: 'POST',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, quarter, topic, pdfUrl: uploadData.url })
      });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.message);
      toast('Đã upload tài liệu');
    }
    closeModal('modal-speaking-mat');
    loadSpeakingMaterials();
  } catch (err) {
    toast('Lỗi: ' + err.message, 'error');
    status.style.display = 'none';
  } finally {
    btn.disabled = false;
  }
}

async function toggleSpeakingMaterial(id, isActive) {
  try {
    const res  = await fetch(`${API}/admin/speaking/materials/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(isActive ? 'Đã ẩn tài liệu' : 'Đã hiện tài liệu'); loadSpeakingMaterials();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}
function hardDeleteSpeakingMaterial(id) {
  confirmAction('Xóa VĨNH VIỄN tài liệu này? Không thể khôi phục!', async () => {
    try {
      const res  = await fetch(`${API}/admin/speaking/materials/${id}/permanent`, {
        method: 'DELETE', headers: authH()
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn tài liệu');
      loadSpeakingMaterials();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════
   USERS – Quản lý người dùng
══════════════════════════════════════════════ */
let _allUsers = [];
let _userPage  = 1;
let _userTotal = 0;
const _USER_LIMIT = 30;

async function loadUsers(page = 1) {
  _userPage = page;
  const search   = (document.getElementById('user-search')?.value || '').trim();
  const role     = document.getElementById('user-filter-role')?.value || '';
  const status   = document.getElementById('user-filter-status')?.value || '';

  const params = new URLSearchParams({ page, limit: _USER_LIMIT });
  if (search) params.set('search', search);
  if (role)   params.set('role', role);
  if (status === 'banned')  params.set('isBanned', 'true');
  if (status === 'active')  params.set('isBanned', 'false');

  try {
    const res  = await fetch(`${API}/admin/users?${params}`, { headers: authH() });
    const data = await res.json();
    if (!data.success) { toast(data.message, 'error'); return; }
    _allUsers  = data.users;
    _userTotal = data.total || 0;
    renderUsers(_allUsers);
    renderUserPagination();
  } catch (err) { toast('Lỗi load người dùng: ' + err.message, 'error'); }
}

function renderUsers(list) {
  const roleBadge = r => {
    const map = { admin: 'badge-red', teacher: 'badge-blue', student: 'badge-green' };
    const label = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };
    return `<span class="badge ${map[r] || 'badge-gray'}">${label[r] || r}</span>`;
  };
  document.getElementById('users-tbody').innerHTML = list.length
    ? list.map(u => {
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || '–';
      const banned   = u.isBanned;
      return `<tr style="${banned ? 'opacity:.55' : ''}">
        <td><strong>${escH(u.username)}</strong></td>
        <td style="font-size:12px;color:var(--text3)">${escH(u.email)}</td>
        <td>${escH(fullName)}</td>
        <td>${roleBadge(u.role)}</td>
        <td>${banned
          ? '<span class="badge badge-red">Bị cấm</span>'
          : '<span class="badge badge-green">Hoạt động</span>'}</td>
        <td style="font-size:12px">${formatDate(u.createdAt)}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="openUserModal('${u._id}')">✏️ Sửa</button>
          <button class="btn btn-sm ${banned ? 'btn-primary' : 'btn-warning'}"
            onclick="toggleBanUser('${u._id}','${escH(u.username)}',${banned})">
            ${banned ? '✅ Bỏ cấm' : '🚫 Cấm'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}','${escH(u.username)}')">🗑 Xóa</button>
        </td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="7" class="table-empty">Không có người dùng</td></tr>';
}

function renderUserPagination() {
  const el = document.getElementById('users-pagination');
  if (!el) return;
  const totalPages = Math.ceil(_userTotal / _USER_LIMIT);
  if (totalPages <= 1) { el.innerHTML = `<span style="font-size:12px;color:var(--text3)">${_userTotal} người dùng</span>`; return; }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - _userPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  el.innerHTML = `
    <span style="font-size:12px;color:var(--text3)">${_userTotal} người dùng</span>
    <button class="btn btn-ghost btn-sm" onclick="loadUsers(${_userPage - 1})" ${_userPage <= 1 ? 'disabled' : ''}>‹</button>
    ${pages.map(p => p === '…'
      ? `<span style="padding:0 4px;color:var(--text3)">…</span>`
      : `<button class="btn btn-sm ${p === _userPage ? 'btn-primary' : 'btn-ghost'}" onclick="loadUsers(${p})">${p}</button>`
    ).join('')}
    <button class="btn btn-ghost btn-sm" onclick="loadUsers(${_userPage + 1})" ${_userPage >= totalPages ? 'disabled' : ''}>›</button>`;
}

function filterUsers() {
  loadUsers(1);
}

let _editingUserId = null;
async function openUserModal(id) {
  _editingUserId = id;
  const user = _allUsers.find(u => u._id === id);
  if (!user) return;
  document.getElementById('umod-username').value  = user.username  || '';
  document.getElementById('umod-email').value     = user.email     || '';
  document.getElementById('umod-firstName').value = user.firstName || '';
  document.getElementById('umod-lastName').value  = user.lastName  || '';
  document.getElementById('umod-role').value      = user.role      || 'student';
  document.getElementById('umod-password').value  = '';
  openModal('modal-user');
}

async function saveUser() {
  const body = {
    username:  document.getElementById('umod-username').value.trim(),
    email:     document.getElementById('umod-email').value.trim(),
    firstName: document.getElementById('umod-firstName').value.trim(),
    lastName:  document.getElementById('umod-lastName').value.trim(),
    role:      document.getElementById('umod-role').value,
  };
  const pw = document.getElementById('umod-password').value.trim();
  if (pw) body.password = pw;
  if (!body.username || !body.email) { toast('Username và Email là bắt buộc', 'error'); return; }
  try {
    const res  = await fetch(`${API}/admin/users/${_editingUserId}`, {
      method: 'PUT', headers: { ...authH(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast('Đã cập nhật người dùng');
    closeModal('modal-user');
    loadUsers();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

function toggleBanUser(id, username, isBanned) {
  const action = isBanned ? 'bỏ cấm' : 'cấm';
  confirmAction(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản "${username}"?`, async () => {
    try {
      const res  = await fetch(`${API}/admin/users/${id}/ban`, {
        method: 'PUT', headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !isBanned })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast(isBanned ? 'Đã bỏ cấm tài khoản' : 'Đã cấm tài khoản');
      loadUsers();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

function deleteUser(id, username) {
  confirmAction(`Xóa VĨNH VIỄN tài khoản "${username}"? Không thể khôi phục!`, async () => {
    try {
      const res  = await fetch(`${API}/admin/users/${id}`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa tài khoản');
      loadUsers();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════
   WRITING – Samples (PDF)
══════════════════════════════════════════════ */
const TASK_TYPE_LABEL = { task1: 'Task 1', task2: 'Task 2', both: 'Task 1 & 2' };

async function loadWritingSamples() {
  try {
    const res  = await fetch(`${API}/admin/writing/samples`, { headers: authH() });
    const data = await res.json();
    const list = data.samples || [];
    document.getElementById('writing-sample-tbody').innerHTML = list.length
      ? list.map(s => `
        <tr>
          <td>${escH(s.title)}</td>
          <td>${escH(s.quarter)}</td>
          <td>${escH(s.topic)}</td>
          <td><span style="font-size:12px;padding:2px 8px;border-radius:8px;background:#eff6ff;color:#3d8bff">${TASK_TYPE_LABEL[s.taskType] || s.taskType}</span></td>
          <td style="font-size:12px;color:#999">${formatDate(s.createdAt)}</td>
          <td><div class="row-actions">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openWritingSampleModal('${s._id}')" title="Chỉnh sửa">✏️</button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleWritingSample('${s._id}',${s.isActive !== false})" title="${s.isActive !== false ? 'Ẩn' : 'Hiện'}">${s.isActive !== false ? '🙈' : '👁'}</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="hardDeleteWritingSample('${s._id}')" title="Xóa vĩnh viễn">🗑</button>
          </div></td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="table-empty">Chưa có tài liệu nào</td></tr>';
  } catch { toast('Lỗi load tài liệu Writing', 'error'); }
}

function openWritingSampleModal(id) {
  document.getElementById('wsample-modal-title').textContent = id ? 'Chỉnh sửa tài liệu' : 'Upload tài liệu mẫu Writing';
  document.getElementById('wsample-id').value       = '';
  document.getElementById('wsample-title').value    = '';
  document.getElementById('wsample-quarter').value  = '';
  document.getElementById('wsample-topic').value    = '';
  document.getElementById('wsample-tasktype').value = 'task2';
  document.getElementById('wsample-file').value     = '';
  document.getElementById('wsample-upload-status').style.display = 'none';

  if (id) {
    document.getElementById('wsample-id').value = id;
    document.getElementById('wsample-file-group').querySelector('label').textContent = 'File PDF (để trống nếu không đổi)';
    fetch(`${API}/admin/writing/samples`, { headers: authH() })
      .then(r => r.json())
      .then(data => {
        const s = (data.samples || []).find(x => x._id === id);
        if (s) {
          document.getElementById('wsample-title').value    = s.title;
          document.getElementById('wsample-quarter').value  = s.quarter;
          document.getElementById('wsample-topic').value    = s.topic;
          document.getElementById('wsample-tasktype').value = s.taskType || 'task2';
        }
      });
  } else {
    document.getElementById('wsample-file-group').querySelector('label').textContent = 'File PDF *';
  }
  openModal('modal-writing-sample');
}

async function saveWritingSample() {
  const id       = document.getElementById('wsample-id').value;
  const title    = document.getElementById('wsample-title').value.trim();
  const quarter  = document.getElementById('wsample-quarter').value.trim();
  const topic    = document.getElementById('wsample-topic').value.trim();
  const taskType = document.getElementById('wsample-tasktype').value;
  if (!title || !quarter || !topic) { toast('Vui lòng điền đầy đủ thông tin', 'error'); return; }

  const btn    = document.getElementById('wsample-save-btn');
  const status = document.getElementById('wsample-upload-status');
  btn.disabled = true;

  try {
    if (id) {
      const file = document.getElementById('wsample-file').files[0];
      let updateBody = { title, quarter, topic, taskType };
      if (file) {
        status.style.display = 'block';
        status.textContent   = '⬆️ Đang upload PDF mới...';
        const formData = new FormData();
        formData.append('pdf', file);
        const uploadRes  = await fetch(`${API}/admin/writing/samples/upload-pdf`, {
          method: 'POST', headers: { Authorization: authH().Authorization }, body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error(uploadData.message);
        updateBody.pdfUrl = uploadData.url;
        status.textContent = '💾 Đang lưu...';
      }
      const res  = await fetch(`${API}/admin/writing/samples/${id}`, {
        method: 'PUT',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã cập nhật tài liệu');
    } else {
      const file = document.getElementById('wsample-file').files[0];
      if (!file) { toast('Chưa chọn file PDF', 'error'); btn.disabled = false; return; }

      status.style.display = 'block';
      status.textContent   = '⬆️ Đang upload PDF lên Cloudinary...';
      const formData = new FormData();
      formData.append('pdf', file);
      const uploadRes  = await fetch(`${API}/admin/writing/samples/upload-pdf`, {
        method: 'POST', headers: { Authorization: authH().Authorization }, body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message);

      status.textContent = '💾 Đang lưu thông tin...';
      const saveRes  = await fetch(`${API}/admin/writing/samples`, {
        method: 'POST',
        headers: { ...authH(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, quarter, topic, taskType, pdfUrl: uploadData.url })
      });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.message);
      toast('Đã upload tài liệu mẫu Writing');
    }
    closeModal('modal-writing-sample');
    loadWritingSamples();
  } catch (err) {
    toast('Lỗi: ' + err.message, 'error');
    status.style.display = 'none';
  } finally {
    btn.disabled = false;
  }
}

async function toggleWritingSample(id, isActive) {
  try {
    const res  = await fetch(`${API}/admin/writing/samples/${id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !isActive }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(isActive ? 'Đã ẩn tài liệu' : 'Đã hiện tài liệu'); loadWritingSamples();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

function hardDeleteWritingSample(id) {
  confirmAction('Xóa VĨNH VIỄN tài liệu này? Không thể khôi phục!', async () => {
    try {
      const res  = await fetch(`${API}/admin/writing/samples/${id}/permanent`, {
        method: 'DELETE', headers: authH()
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa vĩnh viễn tài liệu');
      loadWritingSamples();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════
   COURSES (Quản lý khóa học)
══════════════════════════════════════════════ */
let _allCourses = [];

async function loadCourses() {
  try {
    const data = await (await fetch(`${API}/admin/courses`, { headers: authH() })).json();
    _allCourses = data.success ? data.courses : [];
    renderCoursesTable(_allCourses);
  } catch { toast('Lỗi load khóa học', 'error'); }
}

function renderCoursesTable(list) {
  const catLabel = { ielts: 'IELTS', speaking: 'Speaking', comm: 'Giao tiếp', 'speaking ielts': 'Speaking + IELTS' };
  const colMap   = { red: 'badge-red', blue: 'badge-blue', green: 'badge-green', purple: 'badge-purple' };
  document.getElementById('courses-tbody').innerHTML = list.length
    ? list.map(c => `<tr>
        <td><strong>${escH(c.title)}</strong><br><small style="color:var(--text3)">${escH(c.subtitle || '')}</small></td>
        <td><span class="badge badge-blue">${catLabel[c.category] || c.category}</span></td>
        <td><span class="badge ${colMap[c.levelColor] || 'badge-gray'}">${escH(c.level || '–')}</span></td>
        <td style="font-size:12px">${escH(c.duration || '–')}</td>
        <td style="font-size:13px;font-weight:600">${escH(c.price || '–')}</td>
        <td><span class="badge ${c.isActive ? 'badge-green' : 'badge-gray'}">${c.isActive ? 'Hiển thị' : 'Ẩn'}</span></td>
        <td style="font-family:var(--mono);font-size:12px">${c.order ?? 0}</td>
        <td style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="openCourseModal('${c._id}')">✏️ Sửa</button>
          <button class="btn btn-sm ${c.isActive ? 'btn-warning' : 'btn-primary'}" onclick="toggleCourseActive('${c._id}',${c.isActive})">
            ${c.isActive ? '🙈 Ẩn' : '👁 Hiện'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="hardDeleteCourse('${c._id}','${escH(c.title).replace(/'/g,"\\'")}')">🗑</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="8" class="table-empty">Chưa có khóa học nào. Nhấn ＋ để thêm.</td></tr>';
}

function filterCourses() {
  const q   = (document.getElementById('search-courses')?.value || '').toLowerCase();
  const cat = document.getElementById('filter-courses-cat')?.value || '';
  let list = _allCourses;
  if (q)   list = list.filter(c => c.title.toLowerCase().includes(q) || (c.subtitle || '').toLowerCase().includes(q));
  if (cat) list = list.filter(c => (c.category || '').toLowerCase() === cat);
  renderCoursesTable(list);
}

function openCourseModal(id) {
  const c = id ? _allCourses.find(x => x._id === id) : null;
  document.getElementById('course-modal-title').textContent = c ? 'Sửa khóa học' : 'Thêm khóa học';
  document.getElementById('course-id').value          = c?._id         || '';
  document.getElementById('course-title').value       = c?.title       || '';
  document.getElementById('course-subtitle').value    = c?.subtitle    || '';
  document.getElementById('course-description').value = c?.description || '';
  document.getElementById('course-price').value       = c?.price       || 'Liên hệ tư vấn';
  document.getElementById('course-image').value       = c?.imageUrl    || '';
  document.getElementById('course-placeholder').value = c?.placeholder || '📚';
  document.getElementById('course-category').value   = c?.category    || 'ielts';
  document.getElementById('course-level').value       = c?.level       || '';
  document.getElementById('course-level-color').value = c?.levelColor  || 'blue';
  document.getElementById('course-duration').value    = c?.duration    || '';
  document.getElementById('course-classsize').value   = c?.classSize   || '';
  document.getElementById('course-order').value       = c?.order       ?? 0;
  document.getElementById('course-active').checked   = c ? c.isActive : true;
  openModal('modal-course');
}

async function saveCourse() {
  const id = document.getElementById('course-id').value;
  const title = document.getElementById('course-title').value.trim();
  if (!title) { toast('Tên khóa học là bắt buộc', 'error'); return; }
  const body = {
    title,
    subtitle:    document.getElementById('course-subtitle').value.trim(),
    description: document.getElementById('course-description').value.trim(),
    price:       document.getElementById('course-price').value.trim() || 'Liên hệ tư vấn',
    imageUrl:    document.getElementById('course-image').value.trim(),
    placeholder: document.getElementById('course-placeholder').value.trim() || '📚',
    category:    document.getElementById('course-category').value,
    level:       document.getElementById('course-level').value.trim(),
    levelColor:  document.getElementById('course-level-color').value,
    duration:    document.getElementById('course-duration').value.trim(),
    classSize:   document.getElementById('course-classsize').value.trim(),
    order:       Number(document.getElementById('course-order').value) || 0,
    isActive:    document.getElementById('course-active').checked,
  };
  try {
    const url    = id ? `${API}/admin/courses/${id}` : `${API}/admin/courses`;
    const method = id ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers: { ...authH(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data   = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(id ? 'Đã cập nhật khóa học' : 'Đã thêm khóa học');
    closeModal('modal-course');
    loadCourses();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function toggleCourseActive(id, currentActive) {
  try {
    const res  = await fetch(`${API}/admin/courses/${id}`, {
      method: 'PUT', headers: { ...authH(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    toast(currentActive ? 'Đã ẩn khóa học' : 'Đã hiện khóa học');
    loadCourses();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

function hardDeleteCourse(id, title) {
  confirmAction(`Xóa VĨNH VIỄN khóa học "${title}"? Không thể khôi phục!`, async () => {
    try {
      const res  = await fetch(`${API}/admin/courses/${id}/permanent`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa khóa học');
      loadCourses();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════
   XÓA BÀI THI (Admin delete attempts)
══════════════════════════════════════════════ */
function deleteAttempt(id, skill, studentName) {
  const skillLabel = { reading: 'Reading', listening: 'Listening', writing: 'Writing' }[skill] || skill;
  confirmAction(`Xóa bài thi ${skillLabel} của "${studentName}"? Không thể khôi phục!`, async () => {
    try {
      const endpointMap = { reading: 'attempts', listening: 'listening-attempts', writing: 'writing-attempts' };
      const ep = endpointMap[skill] || 'attempts';
      const res  = await fetch(`${API}/admin/${ep}/${id}`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast(`Đã xóa bài thi ${skillLabel}`);
      loadHistory();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}
// Alias giữ tương thích nếu còn nơi nào gọi tên cũ
function deleteReadingAttempt(id, studentName) { deleteAttempt(id, 'reading', studentName); }

function deleteWritingAttempt(id) {
  confirmAction('Xóa bài nộp Writing này? Không thể khôi phục!', async () => {
    try {
      const res  = await fetch(`${API}/admin/writing-attempts/${id}`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast('Đã xóa bài nộp Writing');
      loadWritingHistory();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

/* ══════════════════════════════════════════════
   VOCAB STUDENTS – Quản lý từ vựng học sinh
══════════════════════════════════════════════ */
let _allVocabStudents = [];

async function loadVocabStudents() {
  document.getElementById('vocab-students-tbody').innerHTML =
    '<tr><td colspan="8" class="table-empty">⏳ Đang tải...</td></tr>';
  try {
    const sort = document.getElementById('vs-sort')?.value || 'words-desc';
    const q    = (document.getElementById('vs-search')?.value || '').trim();
    const params = new URLSearchParams({ sort });
    if (q) params.set('search', q);
    const res  = await fetch(`${API}/admin/vocab-students?${params}`, { headers: authH() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    _allVocabStudents = data.students;
    renderVocabStudents(_allVocabStudents);
  } catch (err) {
    document.getElementById('vocab-students-tbody').innerHTML =
      `<tr><td colspan="8" class="table-empty" style="color:var(--accent)">Lỗi: ${err.message}</td></tr>`;
  }
}

function renderVocabStudents(list) {
  // Cập nhật summary cards
  const activeCount  = list.filter(s => s.totalWords > 0).length;
  const totalWords   = list.reduce((s, u) => s + u.totalWords,   0);
  const totalViews   = list.reduce((s, u) => s + u.totalViews,   0);
  const totalStudied = list.reduce((s, u) => s + u.totalStudied, 0);
  document.getElementById('vs-stat-active').textContent  = activeCount;
  document.getElementById('vs-stat-words').textContent   = totalWords.toLocaleString('vi-VN');
  document.getElementById('vs-stat-views').textContent   = totalViews.toLocaleString('vi-VN');
  document.getElementById('vs-stat-studied').textContent = totalStudied.toLocaleString('vi-VN');

  if (!list.length) {
    document.getElementById('vocab-students-tbody').innerHTML =
      '<tr><td colspan="8" class="table-empty">Không tìm thấy học sinh nào</td></tr>';
    return;
  }

  document.getElementById('vocab-students-tbody').innerHTML = list.map(u => {
    const name     = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username;
    const mastered = u.totalWords > 0 ? Math.round((u.daThuoc / u.totalWords) * 100) : 0;
    const lastAct  = u.lastVocabActivity
      ? formatDateShort(u.lastVocabActivity)
      : '<span style="color:var(--text3)">Chưa có</span>';

    const streakBadge = u.learningStreak > 0
      ? `<span title="Streak học" style="font-size:11px;color:#fbbf24;margin-left:4px">🔥${u.learningStreak}</span>`
      : '';

    const activityDot = (() => {
      if (!u.lastVocabActivity) return '<span style="color:var(--text3)">●</span>';
      const days = (Date.now() - new Date(u.lastVocabActivity)) / 86400000;
      if (days <= 1)  return '<span style="color:var(--green)">●</span>';
      if (days <= 7)  return '<span style="color:var(--yellow)">●</span>';
      return '<span style="color:var(--accent2)">●</span>';
    })();

    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--surface2);border:2px solid var(--border);
               display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;color:var(--blue)">
            ${(u.username[0] || '?').toUpperCase()}
          </div>
          <div>
            <div style="font-weight:600;font-size:13px">${escH(name)}${streakBadge}</div>
            <div style="font-size:11px;color:var(--text3)">@${escH(u.username)}</div>
          </div>
        </div>
      </td>
      <td style="text-align:center">
        <span style="font-weight:700;color:var(--blue)">${u.totalBooks}</span>
        <span style="font-size:11px;color:var(--text3)"> sổ</span>
      </td>
      <td style="text-align:center">
        <span style="font-weight:700;font-size:15px">${u.totalWords.toLocaleString('vi-VN')}</span>
        ${u.totalAdded > u.totalWords
          ? `<div style="font-size:10px;color:var(--text3)" title="Đã thêm ${u.totalAdded} từ, xoá ${u.totalAdded - u.totalWords} từ">${u.totalAdded - u.totalWords} đã xoá</div>`
          : (u.totalAdded > 0 ? `<div style="font-size:10px;color:var(--text3)">${u.totalAdded} tổng thêm</div>` : '')}
      </td>
      <td style="text-align:center">
        ${u.totalWords > 0
          ? `<div style="font-weight:700;color:var(--green)">${u.daThuoc}</div>
             <div class="vs-progress-bar" style="margin:4px auto 0">
               <div class="vs-progress-fill" style="width:${mastered}%"></div>
             </div>
             <div style="font-size:10px;color:var(--text3);margin-top:2px">${mastered}%</div>`
          : '<span style="color:var(--text3)">–</span>'}
      </td>
      <td style="text-align:center">
        <span style="font-weight:700;color:var(--yellow)">${u.totalViews.toLocaleString('vi-VN')}</span>
        ${u.activeDays > 0 ? `<div style="font-size:10px;color:var(--text3)">${u.activeDays} ngày</div>` : ''}
      </td>
      <td style="text-align:center">
        ${u.activeDays > 0
          ? `<span style="font-weight:700">${u.activeDays}</span><span style="font-size:11px;color:var(--text3)"> ngày</span>`
          : '<span style="color:var(--text3)">–</span>'}
      </td>
      <td>${activityDot} ${lastAct}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openVocabActivityModal('${u._id}')">
          📊 Chi tiết
        </button>
      </td>
    </tr>`;
  }).join('');
}

function filterVocabStudents() {
  const q = (document.getElementById('vs-search').value || '').toLowerCase();
  const sort = document.getElementById('vs-sort').value;

  let filtered = _allVocabStudents.filter(u => {
    if (!q) return true;
    return u.username.toLowerCase().includes(q)
      || (u.email || '').toLowerCase().includes(q)
      || (u.firstName || '').toLowerCase().includes(q)
      || (u.lastName  || '').toLowerCase().includes(q);
  });

  const sortFns = {
    'words-desc': (a, b) => b.totalWords   - a.totalWords,
    'views-desc': (a, b) => b.totalViews   - a.totalViews,
    'recent':     (a, b) => {
      const da = a.lastVocabActivity ? new Date(a.lastVocabActivity) : new Date(0);
      const db = b.lastVocabActivity ? new Date(b.lastVocabActivity) : new Date(0);
      return db - da;
    },
    'name': (a, b) => (a.username || '').localeCompare(b.username || ''),
  };
  filtered.sort(sortFns[sort] || sortFns['words-desc']);
  renderVocabStudents(filtered);
}

function formatDateShort(s) {
  if (!s) return '–';
  const d = new Date(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* ── Vocab Activity Modal ─────────────────────── */
let _vaUserId   = null;
let _vaView     = 'day'; // day | month | year

async function openVocabActivityModal(userId) {
  _vaUserId = userId;
  _vaView   = 'day';

  // Reset view buttons
  document.querySelectorAll('.va-view-btn').forEach(b => b.classList.remove('active-view'));
  document.getElementById('va-btn-day').classList.add('active-view');

  // Set default period to current month/year
  const now = new Date();
  const selMonth = document.getElementById('va-sel-month');
  const selYear  = document.getElementById('va-sel-year');
  selMonth.value = now.getMonth() + 1;
  // Populate year options (last 3 years)
  selYear.innerHTML = '';
  for (let y = now.getFullYear(); y >= now.getFullYear() - 2; y--) {
    selYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  selYear.value = now.getFullYear();
  document.getElementById('va-period-wrap').style.display = 'flex';

  // Fill student info
  const student = _allVocabStudents.find(s => s._id === userId);
  if (student) {
    const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.username;
    document.getElementById('va-modal-name').textContent = `📖 ${name}`;
    document.getElementById('va-modal-sub').textContent  = `@${student.username} · ${student.email || ''}`;

    // Mini stats
    document.getElementById('va-mini-stats').innerHTML = [
      { val: student.totalBooks,                  lbl: 'Sổ từ vựng',    color: '#3d8bff' },
      { val: student.totalWords.toLocaleString('vi-VN'), lbl: 'Tổng từ đã lưu', color: '#34d399' },
      { val: student.totalViews.toLocaleString('vi-VN'), lbl: 'Lượt truy cập',  color: '#fbbf24' },
      { val: student.totalStudied.toLocaleString('vi-VN'), lbl: 'Từ đã ôn',     color: '#a78bfa' },
    ].map(c => `
      <div class="va-mini-card">
        <div class="va-mc-lbl">${c.lbl}</div>
        <div class="va-mc-val" style="color:${c.color}">${c.val}</div>
      </div>`).join('');

    // Notebook table
    renderVaBooksTable(userId);
  }

  openModal('modal-vocab-activity');
  loadVocabActivity();
}

async function renderVaBooksTable(userId) {
  // Fetch books from server
  try {
    // We use the admin vocab-students data that includes daThuoc/nhoSoSo/chuaThuoc totals
    // For per-book breakdown we need a dedicated call – use vocabbook admin endpoint
    const res  = await fetch(`${API}/admin/vocab-books/${userId}`, { headers: authH() });
    if (!res.ok) { document.getElementById('va-books-tbody').innerHTML = '<tr><td colspan="6" class="table-empty">Không có dữ liệu sổ</td></tr>'; return; }
    const data = await res.json();
    if (!data.success || !data.books?.length) {
      document.getElementById('va-books-tbody').innerHTML = '<tr><td colspan="6" class="table-empty">Chưa có sổ từ vựng</td></tr>';
      return;
    }
    document.getElementById('va-books-tbody').innerHTML = data.books.map(b => {
      const total     = b.totalWords || 0;
      const pct       = total > 0 ? Math.round((b.daThucCount / total) * 100) : 0;
      return `<tr>
        <td>
          <span style="margin-right:6px">${b.emoji || '📘'}</span>
          <span style="font-weight:600">${escH(b.name)}</span>
          ${b.isDefault ? '<span style="font-size:10px;color:var(--text3);margin-left:4px">mặc định</span>' : ''}
        </td>
        <td style="text-align:center;font-weight:700">${total}</td>
        <td style="text-align:center;color:var(--green);font-weight:700">${b.daThucCount || 0}</td>
        <td style="text-align:center;color:var(--yellow)">${b.nhoSoSoCount || 0}</td>
        <td style="text-align:center;color:var(--accent2)">${b.chuaThuocCount || 0}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="vs-progress-bar" style="width:100px">
              <div class="vs-progress-fill" style="width:${pct}%"></div>
            </div>
            <span style="font-size:11px;color:var(--text3)">${pct}%</span>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch {
    document.getElementById('va-books-tbody').innerHTML = '<tr><td colspan="6" class="table-empty">Không thể tải dữ liệu sổ</td></tr>';
  }
}

function setVaView(view, btn) {
  _vaView = view;
  document.querySelectorAll('.va-view-btn').forEach(b => b.classList.remove('active-view'));
  btn.classList.add('active-view');

  // Show/hide month selector based on view
  const periodWrap = document.getElementById('va-period-wrap');
  if (view === 'year') {
    periodWrap.style.display = 'none';
  } else if (view === 'month') {
    periodWrap.style.display = 'flex';
    document.getElementById('va-sel-month').style.display = 'none';
  } else {
    periodWrap.style.display = 'flex';
    document.getElementById('va-sel-month').style.display = '';
  }
  loadVocabActivity();
}

async function loadVocabActivity() {
  if (!_vaUserId) return;
  const wrap = document.getElementById('va-chart-wrap');
  document.getElementById('va-loading-indicator').style.display = '';
  wrap.innerHTML = '<div class="table-empty" style="padding:60px 20px">⏳ Đang tải dữ liệu...</div>';

  try {
    const year  = document.getElementById('va-sel-year').value;
    const month = document.getElementById('va-sel-month').value;
    const params = new URLSearchParams({ view: _vaView, year });
    if (_vaView === 'day') params.set('month', month);

    const res  = await fetch(`${API}/admin/vocab-activity/${_vaUserId}?${params}`, { headers: authH() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    renderVaChart(wrap, data.data, _vaView);
  } catch (err) {
    wrap.innerHTML = `<div class="table-empty" style="padding:60px 20px;color:var(--accent)">Lỗi: ${err.message}</div>`;
  } finally {
    document.getElementById('va-loading-indicator').style.display = 'none';
  }
}

function renderVaChart(container, data, view) {
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="table-empty" style="padding:60px 20px">Không có dữ liệu trong kỳ này</div>';
    return;
  }

  // Tính maxVal để scale
  const maxVal = Math.max(1, ...data.map(d => Math.max(d.viewCount, d.wordsAdded, d.wordsStudied)));
  const niceMax = (() => {
    if (maxVal <= 5)  return 5;
    if (maxVal <= 10) return 10;
    if (maxVal <= 20) return 20;
    if (maxVal <= 50) return 50;
    if (maxVal <= 100) return 100;
    const mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil(maxVal / mag) * mag;
  })();

  const n     = data.length;
  const padL  = 44, padR = 12, padT = 14, padB = 32;
  const H     = 220;
  const chartH = H - padT - padB;
  // Responsive width: dựa theo số cột
  const svgW  = Math.max(520, n * (view === 'day' ? 22 : 56) + padL + padR);
  const xSlot = (svgW - padL - padR) / n;
  const barW  = Math.max(5, Math.min(14, xSlot / 4.5));
  const gap   = 2;
  const groupW = (barW + gap) * 3 - gap;

  const toH = v => (v / niceMax) * chartH;

  // Y ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    val: Math.round(niceMax * f),
    y:   padT + chartH * (1 - f),
  }));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${H}"
    style="width:100%;min-width:${Math.min(svgW, 480)}px;display:block;overflow:visible">`;

  // Grid + Y labels
  ticks.forEach(t => {
    svg += `<line x1="${padL}" y1="${t.y}" x2="${svgW - padR}" y2="${t.y}"
      stroke="#2a3045" stroke-width="1"/>`;
    svg += `<text x="${padL - 6}" y="${t.y + 4}" text-anchor="end"
      fill="#555e78" font-size="10" font-family="monospace">${t.val}</text>`;
  });

  // Bars + X labels
  data.forEach((d, i) => {
    const cx  = padL + i * xSlot + xSlot / 2;
    const bx0 = cx - groupW / 2;

    const bars = [
      { v: d.viewCount,    color: '#3d8bff' },
      { v: d.wordsAdded,   color: '#34d399' },
      { v: d.wordsStudied, color: '#a78bfa' },
    ];

    bars.forEach((b, bi) => {
      if (b.v <= 0) return;
      const bh  = Math.max(2, toH(b.v));
      const bx  = bx0 + bi * (barW + gap);
      const by  = padT + chartH - bh;
      svg += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}"
        width="${barW}" height="${bh.toFixed(1)}"
        fill="${b.color}" rx="3" opacity="0.88">
        <title>${b.v}</title>
      </rect>`;
      // value on top if tall enough
      if (bh > 16) {
        svg += `<text x="${(bx + barW / 2).toFixed(1)}" y="${(by - 3).toFixed(1)}"
          text-anchor="middle" fill="${b.color}" font-size="9">${b.v}</text>`;
      }
    });

    // X label – chỉ show mỗi 3 ngày ở view day để tránh chật
    const showLabel = view !== 'day' || (i % 3 === 0) || i === n - 1;
    if (showLabel) {
      svg += `<text x="${cx.toFixed(1)}" y="${H - 4}"
        text-anchor="middle" fill="#8b92a8" font-size="10">${escH(d.label)}</text>`;
    }

    // Highlight hiện tại (day view: ngày hôm nay)
    if (view === 'day') {
      const today = new Date().getDate();
      if (parseInt(d.label) === today) {
        svg += `<rect x="${(cx - xSlot / 2).toFixed(1)}" y="${padT}"
          width="${xSlot.toFixed(1)}" height="${chartH}"
          fill="#3d8bff" opacity="0.05" rx="4"/>`;
      }
    }
  });

  // Baseline
  svg += `<line x1="${padL}" y1="${padT + chartH}" x2="${svgW - padR}" y2="${padT + chartH}"
    stroke="#353d55" stroke-width="1.5"/>`;

  // Nếu không có data thực sự (tất cả = 0)
  const hasAny = data.some(d => d.viewCount > 0 || d.wordsAdded > 0 || d.wordsStudied > 0);
  if (!hasAny) {
    svg += `<text x="${svgW / 2}" y="${padT + chartH / 2}"
      text-anchor="middle" fill="#555e78" font-size="13">Không có hoạt động trong kỳ này</text>`;
  }

  svg += `</svg>`;

  container.innerHTML = `<div style="overflow-x:auto;overflow-y:hidden">${svg}</div>`;
}

/* ══════════════════════════════════════════════
   INNER SUB-TABS (Writing, Speaking)
══════════════════════════════════════════════ */
function switchInnerTab(group, name, btn) {
  // Ẩn tất cả panels của group này
  const prefix = `${group}-sub-`;
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => el.classList.remove('active'));
  // Hiện panel được chọn
  const target = document.getElementById(`${prefix}${name}`);
  if (target) target.classList.add('active');
  // Toggle trạng thái nút
  btn.closest('.inner-tabs-nav').querySelectorAll('.inner-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ══════════════════════════════════════════════
   WRITING PRACTICE (WP) – Admin Management
══════════════════════════════════════════════ */
let _allWPTopics   = [];
let _allWPExercises = [];
let _allWPAttempts  = [];
let _wpEditTopicId    = null;
let _wpEditExerciseId = null;
const WP_EX_PAGE_SIZE = 20;
let   _wpExPage = 1;

// ── Badge helpers ─────────────────────────────────────────────────
const wpLevelBadge = l => {
  const m = { beginner: 'badge-green', elementary: 'badge-blue', intermediate: 'badge-yellow', advanced: 'badge-red' };
  const label = { beginner: 'Beginner', elementary: 'Elementary', intermediate: 'Intermediate', advanced: 'Advanced' };
  return `<span class="badge ${m[l] || 'badge-gray'}">${label[l] || l}</span>`;
};
const wpTypeBadge = t => {
  const m = { translation: 'badge-blue', rearrange: 'badge-purple', fill_blank: 'badge-yellow', expand: 'badge-green', combine: 'badge-red' };
  return `<span class="badge ${m[t] || 'badge-gray'}">${t}</span>`;
};

// ── Load Topics ───────────────────────────────────────────────────
async function loadWPTopics() {
  try {
    const data = await fetch(`${API}/admin/wp-topics`, { headers: authH() }).then(r => r.json());
    if (!data.success) return;
    _allWPTopics = data.topics || [];
    renderWPTopicsTable(_allWPTopics);
    _populateWPTopicSelects(_allWPTopics);
  } catch (err) { console.error('[WP] loadTopics:', err); }
}

function _populateWPTopicSelects(topics) {
  // Populate filter dropdown in exercises sub-tab
  const sel = document.getElementById('wp-filter-topic');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = '<option value="all">Tất cả chủ đề</option>' +
      topics.map(t => `<option value="${escH(t.key)}">${escH(t.title)}${t.titleVi ? ' – ' + escH(t.titleVi) : ''}</option>`).join('');
    sel.value = cur || 'all';
  }
  // Populate topicKey dropdown in exercise edit modal
  const mSel = document.getElementById('wpex-topicKey');
  if (mSel) {
    const curM = mSel.value;
    mSel.innerHTML = '<option value="">-- Chọn chủ đề --</option>' +
      topics.map(t => `<option value="${escH(t.key)}">${escH(t.title)}${t.titleVi ? ' – ' + escH(t.titleVi) : ''}</option>`).join('');
    if (curM) mSel.value = curM;
  }
}

function renderWPTopicsTable(list) {
  const tb = document.getElementById('wp-topics-tbody');
  if (!tb) return;
  if (!list.length) { tb.innerHTML = '<tr><td colspan="7" class="table-empty">Chưa có chủ đề nào</td></tr>'; return; }
  tb.innerHTML = list.map(t => `<tr>
    <td><code style="font-size:12px;color:var(--blue)">${escH(t.key)}</code></td>
    <td><strong>${escH(t.title)}</strong></td>
    <td style="color:var(--text3)">${escH(t.titleVi || '–')}</td>
    <td>${escH(t.category || '–')}</td>
    <td style="text-align:center">${t.orderIndex ?? 0}</td>
    <td><span class="badge ${t.isActive ? 'badge-green' : 'badge-gray'}">${t.isActive ? 'Active' : 'Ẩn'}</span></td>
    <td><div class="row-actions">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="openWPTopicModal('${t._id}')" title="Sửa">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteWPTopic('${t._id}','${escH(t.title.replace(/'/g,"\\'"))}')" title="Ẩn">🗑</button>
    </div></td>
  </tr>`).join('');
}

// ── Load Exercises ────────────────────────────────────────────────
async function loadWPExercises() {
  const level  = document.getElementById('wp-filter-level')?.value  || 'all';
  const type   = document.getElementById('wp-filter-type')?.value   || 'all';
  const topic  = document.getElementById('wp-filter-topic')?.value  || 'all';
  const active = document.getElementById('wp-filter-active')?.value || '';
  const params = new URLSearchParams({ limit: 200 });
  if (level !== 'all') params.set('level', level);
  if (type  !== 'all') params.set('type',  type);
  if (topic !== 'all') params.set('topic', topic);
  if (active !== '')   params.set('active', active);

  document.getElementById('wp-exercises-tbody').innerHTML =
    '<tr><td colspan="8" class="table-empty">⏳ Đang tải...</td></tr>';

  try {
    const data = await fetch(`${API}/admin/wp-exercises?${params}`, { headers: authH() }).then(r => r.json());
    if (!data.success) return;
    _allWPExercises = data.exercises || [];
    document.getElementById('wp-ex-stats').textContent =
      `Tổng: ${data.total} bài tập${data.total !== _allWPExercises.length ? ` (hiển thị ${_allWPExercises.length})` : ''}`;
    _wpExPage = 1;
    _renderWPExercisesPage();
  } catch (err) { console.error('[WP] loadExercises:', err); }
}

function filterWPExercisesLocal() {
  _wpExPage = 1;
  _renderWPExercisesPage();
}

function _renderWPExercisesPage() {
  const q = (document.getElementById('wp-search-ex')?.value || '').toLowerCase();
  const filtered = q
    ? _allWPExercises.filter(e =>
        (e.question || '').toLowerCase().includes(q) ||
        (e.sampleAnswer || '').toLowerCase().includes(q) ||
        (e.grammarPoint || '').toLowerCase().includes(q))
    : _allWPExercises;

  const start = (_wpExPage - 1) * WP_EX_PAGE_SIZE;
  const page  = filtered.slice(start, start + WP_EX_PAGE_SIZE);
  const tb    = document.getElementById('wp-exercises-tbody');
  if (!tb) return;

  if (!page.length) {
    tb.innerHTML = '<tr><td colspan="8" class="table-empty">Không có bài tập nào</td></tr>';
    document.getElementById('wp-ex-pagination').innerHTML = '';
    return;
  }

  tb.innerHTML = page.map((e, i) => `<tr>
    <td style="color:var(--text3);font-size:12px">${start + i + 1}</td>
    <td style="max-width:260px;white-space:normal;font-size:13px">${escH((e.question || '').slice(0, 100))}${e.question?.length > 100 ? '…' : ''}</td>
    <td>${wpTypeBadge(e.type)}</td>
    <td>${wpLevelBadge(e.level)}</td>
    <td style="font-size:12px;color:var(--text3)">${escH(e.topicKey || '–')}</td>
    <td style="max-width:200px;white-space:normal;font-size:12px;color:var(--text2)">${escH((e.sampleAnswer || '').slice(0, 80))}${e.sampleAnswer?.length > 80 ? '…' : ''}</td>
    <td><span class="badge ${e.isActive ? 'badge-green' : 'badge-gray'}">${e.isActive ? 'Active' : 'Ẩn'}</span></td>
    <td><div class="row-actions">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="openWPExerciseModal('${e._id}')" title="Sửa">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteWPExercise('${e._id}')" title="Ẩn">🗑</button>
    </div></td>
  </tr>`).join('');

  // Pagination
  const pg = document.getElementById('wp-ex-pagination');
  const totalPages = Math.ceil(filtered.length / WP_EX_PAGE_SIZE);
  if (totalPages <= 1) { pg.innerHTML = ''; return; }
  let html = `<span class="page-info">${start + 1}–${Math.min(start + WP_EX_PAGE_SIZE, filtered.length)} / ${filtered.length}</span>`;
  for (let i = 1; i <= totalPages; i++)
    html += `<button class="page-btn ${i === _wpExPage ? 'active' : ''}" onclick="_wpGoPage(${i})">${i}</button>`;
  pg.innerHTML = html;
}

function _wpGoPage(p) { _wpExPage = p; _renderWPExercisesPage(); }

// ── Load Attempts ─────────────────────────────────────────────────
async function loadWPAttempts() {
  document.getElementById('wp-attempts-tbody').innerHTML =
    '<tr><td colspan="8" class="table-empty">⏳ Đang tải...</td></tr>';
  try {
    const data = await fetch(`${API}/admin/wp-attempts?limit=200`, { headers: authH() }).then(r => r.json());
    if (!data.success) return;
    _allWPAttempts = data.attempts || [];
    filterWPAttempts();
  } catch (err) { console.error('[WP] loadAttempts:', err); }
}

function filterWPAttempts() {
  const q = (document.getElementById('wp-search-attempts')?.value || '').toLowerCase();
  const list = q
    ? _allWPAttempts.filter(a =>
        (a.studentId?.username || '').toLowerCase().includes(q) ||
        (a.studentId?.displayName || '').toLowerCase().includes(q) ||
        (a.topic || '').toLowerCase().includes(q))
    : _allWPAttempts;
  const tb = document.getElementById('wp-attempts-tbody');
  if (!tb) return;
  if (!list.length) { tb.innerHTML = '<tr><td colspan="8" class="table-empty">Không có dữ liệu</td></tr>'; return; }
  tb.innerHTML = list.slice(0, 100).map(a => {
    const name = a.studentId?.displayName || a.studentId?.username || '–';
    return `<tr>
      <td><strong>${escH(name)}</strong></td>
      <td>${wpTypeBadge(a.type)}</td>
      <td>${wpLevelBadge(a.level)}</td>
      <td style="font-size:12px;color:var(--text3)">${escH(a.topic || '–')}</td>
      <td style="max-width:240px;white-space:normal;font-size:12px">${escH((a.userAnswer || '').slice(0, 100))}${a.userAnswer?.length > 100 ? '…' : ''}</td>
      <td style="text-align:center;font-weight:700;color:var(--green)">${a.xpEarned ?? 0}</td>
      <td style="font-size:12px;color:var(--text3)">${formatDate(a.createdAt)}</td>
      <td><button class="btn btn-danger btn-sm btn-icon" onclick="deleteWPAttempt('${a._id}','${escH(name.replace(/'/g,"\\'"))}')">🗑</button></td>
    </tr>`;
  }).join('');
}

// ── Topic Modal ───────────────────────────────────────────────────
function openWPTopicModal(id = null) {
  _wpEditTopicId = id;
  const topic = id ? _allWPTopics.find(t => t._id === id) : null;
  document.getElementById('wpt-modal-title').textContent = id ? 'Sửa chủ đề' : 'Thêm chủ đề mới';
  document.getElementById('wpt-key').value         = topic?.key         || '';
  document.getElementById('wpt-title').value       = topic?.title       || '';
  document.getElementById('wpt-titleVi').value     = topic?.titleVi     || '';
  document.getElementById('wpt-description').value = topic?.description || '';
  document.getElementById('wpt-category').value    = topic?.category    || 'general';
  document.getElementById('wpt-orderIndex').value  = topic?.orderIndex  ?? 0;
  document.getElementById('wpt-isActive').checked  = topic ? topic.isActive !== false : true;
  openModal('modal-wp-topic');
}

async function saveWPTopic() {
  const key   = document.getElementById('wpt-key').value.trim();
  const title = document.getElementById('wpt-title').value.trim();
  if (!key || !title) { toast('Nhập đầy đủ Key và Tiêu đề', 'error'); return; }
  const body = {
    key,
    title,
    titleVi:     document.getElementById('wpt-titleVi').value.trim(),
    description: document.getElementById('wpt-description').value.trim(),
    category:    document.getElementById('wpt-category').value.trim() || 'general',
    orderIndex:  Number(document.getElementById('wpt-orderIndex').value) || 0,
    isActive:    document.getElementById('wpt-isActive').checked
  };
  try {
    const url    = _wpEditTopicId ? `${API}/admin/wp-topics/${_wpEditTopicId}` : `${API}/admin/wp-topics`;
    const method = _wpEditTopicId ? 'PUT' : 'POST';
    const data   = await fetch(url, { method, headers: authH(), body: JSON.stringify(body) }).then(r => r.json());
    if (!data.success) throw new Error(data.message);
    toast(_wpEditTopicId ? 'Đã cập nhật chủ đề' : 'Đã thêm chủ đề mới');
    closeModal('modal-wp-topic');
    await loadWPTopics();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function deleteWPTopic(id, title) {
  confirmAction(`Ẩn chủ đề "${title}"?`, async () => {
    try {
      await fetch(`${API}/admin/wp-topics/${id}`, { method: 'DELETE', headers: authH() });
      toast('Đã ẩn chủ đề'); await loadWPTopics();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

// ── Exercise Modal ────────────────────────────────────────────────
function toggleWPExFields() {
  const type = document.getElementById('wpex-type')?.value;
  document.getElementById('wpex-basetext-wrap').style.display   = type === 'fill_blank' ? '' : 'none';
  document.getElementById('wpex-basewords-wrap').style.display  = type === 'rearrange'  ? '' : 'none';
  document.getElementById('wpex-sentences-wrap').style.display  = type === 'combine'    ? '' : 'none';
  document.getElementById('wpex-blankanswer-wrap').style.display = type === 'fill_blank' ? '' : 'none';
}

function openWPExerciseModal(id = null) {
  _wpEditExerciseId = id;
  const ex = id ? _allWPExercises.find(e => e._id === id) : null;
  document.getElementById('wpex-modal-title').textContent = id ? 'Sửa bài tập' : 'Thêm bài tập mới';
  document.getElementById('wpex-level').value       = ex?.level       || 'beginner';
  document.getElementById('wpex-type').value        = ex?.type        || 'translation';
  document.getElementById('wpex-grammarPoint').value = ex?.grammarPoint || '';
  document.getElementById('wpex-question').value    = ex?.question    || '';
  document.getElementById('wpex-sampleAnswer').value = ex?.sampleAnswer || '';
  document.getElementById('wpex-blankAnswer').value  = ex?.blankAnswer  || '';
  document.getElementById('wpex-baseText').value    = ex?.baseText    || '';
  document.getElementById('wpex-baseWords').value   = ex?.baseWords?.join(' | ') || '';
  document.getElementById('wpex-sentences').value   = ex?.sentences?.join('\n') || '';
  document.getElementById('wpex-altAnswers').value  = (ex?.alternativeAnswers || []).join('\n');
  document.getElementById('wpex-explanation').value = ex?.explanation || '';
  document.getElementById('wpex-orderIndex').value  = ex?.orderIndex  ?? 0;
  document.getElementById('wpex-isActive').checked  = ex ? ex.isActive !== false : true;

  // Populate topic key dropdown with current topics
  _populateWPTopicSelects(_allWPTopics);
  document.getElementById('wpex-topicKey').value = ex?.topicKey || '';

  toggleWPExFields();
  openModal('modal-wp-exercise');
}

async function saveWPExercise() {
  const question    = document.getElementById('wpex-question').value.trim();
  const sampleAnswer = document.getElementById('wpex-sampleAnswer').value.trim();
  const topicKey    = document.getElementById('wpex-topicKey').value;
  const type        = document.getElementById('wpex-type').value;

  if (!question || !sampleAnswer || !topicKey) {
    toast('Nhập đầy đủ Câu hỏi, Đáp án mẫu và Chủ đề', 'error'); return;
  }
  if (type === 'fill_blank' && !document.getElementById('wpex-blankAnswer').value.trim()) {
    toast('Fill blank cần có Đáp án chỗ trống (blankAnswer)', 'error'); return;
  }

  const rawBaseWords = document.getElementById('wpex-baseWords').value.trim();
  const rawSentences = document.getElementById('wpex-sentences').value.trim();
  const rawAlt       = document.getElementById('wpex-altAnswers').value.trim();

  const body = {
    level:        document.getElementById('wpex-level').value,
    type,
    topicKey,
    grammarPoint: document.getElementById('wpex-grammarPoint').value.trim(),
    question,
    sampleAnswer,
    blankAnswer:  document.getElementById('wpex-blankAnswer').value.trim() || undefined,
    baseText:     document.getElementById('wpex-baseText').value.trim()    || undefined,
    baseWords:    rawBaseWords ? rawBaseWords.split('|').map(s => s.trim()).filter(Boolean) : [],
    sentences:    rawSentences ? rawSentences.split('\n').map(s => s.trim()).filter(Boolean) : [],
    alternativeAnswers: rawAlt ? rawAlt.split('\n').map(s => s.trim()).filter(Boolean) : [],
    explanation:  document.getElementById('wpex-explanation').value.trim() || undefined,
    orderIndex:   Number(document.getElementById('wpex-orderIndex').value) || 0,
    isActive:     document.getElementById('wpex-isActive').checked
  };

  // Clean up undefined fields to avoid overwriting with null
  Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

  try {
    const url    = _wpEditExerciseId ? `${API}/admin/wp-exercises/${_wpEditExerciseId}` : `${API}/admin/wp-exercises`;
    const method = _wpEditExerciseId ? 'PUT' : 'POST';
    const data   = await fetch(url, { method, headers: authH(), body: JSON.stringify(body) }).then(r => r.json());
    if (!data.success) throw new Error(data.message);
    toast(_wpEditExerciseId ? 'Đã cập nhật bài tập' : 'Đã thêm bài tập mới');
    closeModal('modal-wp-exercise');
    await loadWPExercises();
  } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

async function deleteWPExercise(id) {
  confirmAction('Ẩn bài tập này?', async () => {
    try {
      await fetch(`${API}/admin/wp-exercises/${id}`, { method: 'DELETE', headers: authH() });
      toast('Đã ẩn bài tập'); await loadWPExercises();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}

async function deleteWPAttempt(id, name) {
  confirmAction(`Xóa lần luyện tập của "${name}"?`, async () => {
    try {
      await fetch(`${API}/admin/wp-attempts/${id}`, { method: 'DELETE', headers: authH() });
      toast('Đã xóa'); await loadWPAttempts();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
  });
}