// review-history.html — Lịch sử Review
const API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
function headers() { return { 'Content-Type': 'application/json', ...window.AuthService.authHeader() }; }

const ATTEMPT_TYPE_LABEL = {
  'reading': 'Reading (Full test)', 'reading-practice': 'Reading (Practice)',
  'listening': 'Listening (Full test)', 'listening-practice': 'Listening (Practice)',
};

let rhPage = 1;
let rhItemsRaw = []; // current page's raw items, for client-side category filtering

async function rhLoad() {
  const listEl = document.getElementById('rhList');
  listEl.innerHTML = '<div class="rh-empty">Đang tải...</div>';
  const params = new URLSearchParams({ page: rhPage, limit: 10 });
  const type = document.getElementById('rhFilterType').value;
  const from = document.getElementById('rhFilterFrom').value;
  const to = document.getElementById('rhFilterTo').value;
  if (type) params.set('attemptType', type);
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  try {
    const res = await fetch(`${API}/review/history?${params}`, { headers: headers() });
    const data = await window.ApiClient.handleResponse(res);
    rhItemsRaw = data.items || [];
    rhRenderCategoryOptions(rhItemsRaw);
    rhRenderList(rhFilterByCategory(rhItemsRaw));
    rhRenderPagination(data.total, data.page, data.limit);
  } catch (e) {
    listEl.innerHTML = '<div class="rh-empty">Lỗi tải lịch sử review.</div>';
  }
}

function rhFilterByCategory(items) {
  const cat = document.getElementById('rhFilterCategory').value;
  if (!cat) return items;
  return items.filter(r => (r.mistakes || []).some(m => m.errorCategory === cat));
}

function rhRenderCategoryOptions(items) {
  const sel = document.getElementById('rhFilterCategory');
  const current = sel.value;
  const cats = [...new Set(items.flatMap(r => (r.mistakes || []).map(m => m.errorCategory)).filter(Boolean))];
  sel.innerHTML = '<option value="">Tất cả nhóm lỗi</option>' +
    cats.map(c => `<option value="${escHtml(c)}"${c === current ? ' selected' : ''}>${escHtml(c)}</option>`).join('');
}

function rhRenderList(items) {
  const listEl = document.getElementById('rhList');
  if (!items.length) {
    listEl.innerHTML = '<div class="rh-empty">Chưa có review nào phù hợp bộ lọc.</div>';
    return;
  }
  listEl.innerHTML = items.map(r => `
        <div class="card rh-item">
          <div class="card-body">
            <div class="rh-item-meta">
              <span class="badge badge-primary">${escHtml(ATTEMPT_TYPE_LABEL[r.attemptType] || r.attemptType)}</span>
              <span>${r.completedAt ? new Date(r.completedAt).toLocaleDateString('vi-VN') : ''}</span>
              <span>· ${(r.mistakes || []).length} câu sai</span>
            </div>
            ${(r.mistakes || []).map(m => `
              <div class="rh-mistake">
                <div class="rh-mistake-q">Câu ${m.questionNumber}${m.questionType ? ' · ' + escHtml(m.questionType) : ''}</div>
                ${m.errorCategory ? `<div class="rh-mistake-row">❌ <strong>${escHtml(m.errorCategory)}</strong> — ${escHtml(m.errorReason || '')}</div>` : ''}
                ${m.retryResult ? `<div class="rh-mistake-row">${m.retryResult === 'correct' ? '✅ Thử lại: đúng' : '❌ Thử lại: vẫn sai'}</div>` : ''}
                ${m.note ? `<div class="rh-mistake-note">"${escHtml(m.note)}"</div>` : ''}
                ${m.learningPoint?.content ? `<div class="rh-mistake-note">📌 ${escHtml(m.learningPoint.content)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
}

function rhRenderPagination(total, page, limit) {
  const pag = document.getElementById('rhPagination');
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) { pag.style.display = 'none'; return; }
  pag.style.display = 'flex';
  document.getElementById('rhPageLabel').textContent = `Trang ${page}/${totalPages}`;
  document.getElementById('rhPrevBtn').disabled = page <= 1;
  document.getElementById('rhNextBtn').disabled = page >= totalPages;
}

document.getElementById('rhFilterType').addEventListener('change', () => { rhPage = 1; rhLoad(); });
document.getElementById('rhFilterFrom').addEventListener('change', () => { rhPage = 1; rhLoad(); });
document.getElementById('rhFilterTo').addEventListener('change', () => { rhPage = 1; rhLoad(); });
document.getElementById('rhFilterCategory').addEventListener('change', () => rhRenderList(rhFilterByCategory(rhItemsRaw)));
document.getElementById('rhPrevBtn').addEventListener('click', () => { rhPage--; rhLoad(); });
document.getElementById('rhNextBtn').addEventListener('click', () => { rhPage++; rhLoad(); });

/* ── Thi thử Full test (mock-test) history view ───────────────────── */
let mtPage = 1;
const MT_SKILLS = [['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking']];

function setView(v) {
  const isMock = v === 'mock';
  document.getElementById('rhTabMistakes').classList.toggle('active', !isMock);
  document.getElementById('rhTabMock').classList.toggle('active', isMock);
  document.querySelector('.rh-filters').style.display = isMock ? 'none' : 'flex';
  document.getElementById('rhList').style.display = isMock ? 'none' : 'block';
  document.getElementById('rhPagination').style.display = 'none';
  document.getElementById('mockList').style.display = isMock ? 'block' : 'none';
  document.getElementById('mockPagination').style.display = 'none';
  const url = new URL(location.href);
  if (isMock) url.searchParams.set('view', 'mock'); else url.searchParams.delete('view');
  history.replaceState(null, '', url);
  if (isMock) mtLoad(); else rhLoad();
}
document.getElementById('rhTabMistakes').addEventListener('click', () => setView('mistakes'));
document.getElementById('rhTabMock').addEventListener('click', () => setView('mock'));

async function mtLoad() {
  const listEl = document.getElementById('mockList');
  listEl.innerHTML = '<div class="rh-empty">Đang tải...</div>';
  try {
    const res = await fetch(`${API}/mock-test/history?page=${mtPage}&limit=10`, { headers: headers() });
    const data = await window.ApiClient.handleResponse(res);
    mtRenderList(data.items || []);
    mtRenderPagination(data.total, data.page, data.limit);
  } catch (e) {
    listEl.innerHTML = '<div class="rh-empty">Lỗi tải lịch sử thi thử.</div>';
  }
}

function mtChip(label, step) {
  const b = step && step.band != null ? Number(step.band).toFixed(1) : null;
  return `<span class="mt-chip ${b != null ? 'done' : 'pending'}">${label}: ${b != null ? b : 'chờ chấm'}</span>`;
}

function mtRenderList(items) {
  const listEl = document.getElementById('mockList');
  if (!items.length) {
    listEl.innerHTML = '<div class="rh-empty">Bạn chưa hoàn thành bài thi thử full nào.</div>';
    return;
  }
  listEl.innerHTML = items.map(a => {
    const d = new Date(a.createdAt).toLocaleString('vi-VN');
    const overall = a.overallBand != null
      ? `<span class="mt-overall">Band tổng ${Number(a.overallBand).toFixed(1)}</span>`
      : a.status === 'disqualified'
        ? `<span class="mt-overall pending">🚫 Huỷ do vi phạm — không tính kết quả</span>`
        : `<span class="mt-overall pending">${a.status === 'in-progress' ? 'Đang làm dở' : 'Đang chờ chấm Writing / Speaking'}</span>`;
    const chips = MT_SKILLS.map(([s, l]) => mtChip(l, a.steps[s])).join('');
    const violated = a.proctor && a.proctor.violated
      ? `<span class="mt-violation" title="Số lần rời khỏi tab khi đang thi">⚠️ Vi phạm thi cử · ${a.proctor.violationCount || 0} gậy</span>`
      : '';
    const links = [];
    if (a.steps.listening && a.steps.listening.attemptId) links.push(`<a href="listening.html?review=${a.steps.listening.attemptId}">Xem lại Listening</a>`);
    if (a.steps.reading && a.steps.reading.attemptId) links.push(`<a href="reading.html?review=${a.steps.reading.attemptId}">Xem lại Reading</a>`);
    links.push(`<a href="speaking.html?tab=history">Lịch sử Speaking</a>`);
    links.push(`<a href="writing.html">Lịch sử Writing</a>`);
    if (a.status === 'in-progress') links.unshift(`<a href="dashboard.html">Tiếp tục thi thử</a>`);
    return `<div class="card rh-item"><div class="card-body">
            <div class="rh-item-meta"><span class="badge badge-primary">🎯 Thi thử Full 4 kỹ năng</span><span>${d}</span></div>
            <div class="mt-overall-row">${overall}${violated}</div>
            <div class="mt-chips">${chips}</div>
            <div class="mt-links">${links.join(' · ')}</div>
          </div></div>`;
  }).join('');
}

function mtRenderPagination(total, page, limit) {
  const pag = document.getElementById('mockPagination');
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) { pag.style.display = 'none'; return; }
  pag.style.display = 'flex';
  document.getElementById('mockPageLabel').textContent = `Trang ${page}/${totalPages}`;
  document.getElementById('mockPrevBtn').disabled = page <= 1;
  document.getElementById('mockNextBtn').disabled = page >= totalPages;
}
document.getElementById('mockPrevBtn').addEventListener('click', () => { mtPage--; mtLoad(); });
document.getElementById('mockNextBtn').addEventListener('click', () => { mtPage++; mtLoad(); });

if (new URLSearchParams(location.search).get('view') === 'mock') setView('mock');
else rhLoad();

// Double-click / drag-select word lookup on the review + mock lists —
// they're full of English answer text, error notes and learning points.
// setupDictionaryDouble delegates on the container, so one call up front
// covers every re-render.
if (typeof setupDictionaryDouble === 'function') {
  setupDictionaryDouble('rhList', 'review-history');
  setupDictionaryDouble('mockList', 'review-history');
}
