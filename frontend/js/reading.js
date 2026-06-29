/* ═══════════════════════════════════════════════════════════════════════
   frontend/js/reading.js  –  EnglishWithDan Reading Module
   Supports: questionGroups (table, note-form, bullet-list, map,
             matching-options, plain) + legacy questions[] flat array
═══════════════════════════════════════════════════════════════════════ */

const API = 'https://englishwithdan.onrender.com/api';   // backend on Render
const DURATION = 3600;  // 60 min in seconds

/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  passages: [],          // passages for current exam
  attemptId: null,
  testId: null,
  testName: '',
  answers: {},           // { questionNumber: value }
  timer: null,
  secondsLeft: DURATION,
  currentPassageIdx: 0,
  tool: 'none',          // 'none' | 'highlight' | 'dict'
  isReview: false,
  submitted: false,
  reviewData: null,
};

let allTests = [];
let _activeFilter = 'all';
let _practiceMode = false;   // true khi đang luyện bài lẻ từ list screen
let _practiceCategory = '';  // 'passage1' | 'passage2' | 'passage3'

/* ── Practice stopwatch ─────────────────────────────────────────────── */
let _practiceTimer     = null;
let _practiceStartTime = 0;
let _practiceElapsedSec = 0;

/* Highlight cache – preserve <span class="hl"> spans across passage switches */
const passageHlCache = {};   // exam mode  : { passageIdx: passageInnerHTML }
const reviewHlCache = {};   // review mode: { passageIdx: passageInnerHTML }

/* ── Stopwatch helpers ──────────────────────────────────────────────── */
function _startPracticeTimer(totalQ) {
  _practiceStartTime = Date.now();
  _practiceElapsedSec = 0;
  _clearPracticeTimer();

  const swEl   = document.getElementById('practice-stopwatch');
  const txtEl  = document.getElementById('practice-progress-txt');
  const barWrap = document.getElementById('practice-prog-bar');
  const barFill = document.getElementById('practice-prog-fill');

  if (swEl)   { swEl.textContent = '00:00'; swEl.className = 'practice-stopwatch'; swEl.style.display = ''; }
  if (txtEl)  { txtEl.textContent = `0 / ${totalQ} câu`; txtEl.style.display = ''; }
  if (barWrap){ barWrap.style.display = ''; }
  if (barFill){ barFill.style.width = '0%'; barFill.className = 'practice-prog-fill'; }

  _practiceTimer = setInterval(() => {
    const secs = Math.floor((Date.now() - _practiceStartTime) / 1000);
    _practiceElapsedSec = secs;
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    if (swEl) {
      swEl.textContent = `${m}:${s}`;
      swEl.className = secs >= 1200 ? 'practice-stopwatch sw-slow'
                     : secs >= 600  ? 'practice-stopwatch sw-medium'
                     : 'practice-stopwatch';
    }
  }, 1000);
}

function _stopPracticeTimer() {
  _clearPracticeTimer();
  const swEl = document.getElementById('practice-stopwatch');
  if (swEl) swEl.classList.add('sw-stopped');
  return _practiceElapsedSec;
}

function _clearPracticeTimer() {
  if (_practiceTimer) { clearInterval(_practiceTimer); _practiceTimer = null; }
}

function _hidePracticeHUD() {
  ['practice-stopwatch', 'practice-progress-txt', 'practice-prog-bar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function _updatePracticeProgress() {
  if (!_practiceTimer) return; // only while timer is running (before submit)
  const passage = state.passages[0];
  if (!passage) return;
  const allQ   = getAllQuestionsFromPassage(passage);
  const total  = allQ.length;
  const answered = allQ.filter(q => {
    const a = state.answers[q.questionNumber];
    return a && a !== '[]';
  }).length;

  const txtEl  = document.getElementById('practice-progress-txt');
  const barFill = document.getElementById('practice-prog-fill');
  const pct    = total ? Math.round(answered / total * 100) : 0;

  if (txtEl)  txtEl.textContent = `${answered} / ${total} câu`;
  if (barFill) {
    barFill.style.width = `${pct}%`;
    barFill.className = answered === total ? 'practice-prog-fill fill-done'
                      : pct >= 50          ? 'practice-prog-fill fill-half'
                      : 'practice-prog-fill';
  }

  // Highlight answered q-nav buttons
  document.querySelectorAll('#retry-q-nav .q-nav-btn').forEach(btn => {
    const m = (btn.getAttribute('onclick') || '').match(/\d+/);
    if (m) {
      const a = state.answers[+m[0]];
      btn.classList.toggle('q-nav-answered', !!(a && a !== '[]'));
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  const userName = localStorage.getItem('userName') || 'bạn';
  const el = document.getElementById('userName');
  if (el) el.textContent = `👋 ${userName}`;

  initDividerDrag('split-divider', 'split-passage', 'split-questions');
  initDividerDrag('review-divider', 'review-passage', 'review-questions');
  initDividerDrag('retry-divider', 'retry-passage', 'retry-questions');
  document.addEventListener('keydown', handleKeyShortcuts);

  // Handle browser back/forward button
  window.addEventListener('popstate', (e) => {
    const s = e.state?.screen;
    if (!s || s === 'list') {
      loadTests(true);
    } else if (s === 'key' && e.state.testId) {
      _openKeyScreen(e.state.testId, e.state.testName);
    }
  });

  // Check URL params on load
  const params = new URLSearchParams(location.search);
  const reviewId = params.get('review');
  const testIdParam = params.get('testId');

  if (reviewId) {
    history.replaceState({ screen: 'review', reviewId }, '', `?review=${reviewId}`);
    await loadReview(reviewId);
    return;
  }

  await loadTests();

  if (testIdParam) {
    const test = allTests.find(t => t._id === testIdParam);
    if (test) {
      // Replace state so the initial list is still accessible via back
      history.replaceState({ screen: 'key', testId: test._id, testName: test.name }, '', `?testId=${test._id}`);
      _openKeyScreen(test._id, test.name);
    }
  } else {
    history.replaceState({ screen: 'list' }, '', 'reading.html');
  }
});

/* ══════════════════════════════════════════════════════════════════════
   SCREEN HELPERS
══════════════════════════════════════════════════════════════════════ */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const el = document.getElementById(`screen-${name}`);
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }
  if (typeof window.hideTopNav === 'function') {
    name === 'list' ? window.showTopNav() : window.hideTopNav();
  }
  closeDictPopup();
  closeTranslatePopup();
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 1 – TEST LIST
══════════════════════════════════════════════════════════════════════ */
async function loadTests(fromNav = false) {
  // Clean URL when user explicitly navigates back to list (not on first load)
  if (fromNav && location.search) history.pushState({ screen: 'list' }, '', 'reading.html');
  showScreen('list');
  const wrap = document.getElementById('tests-wrapper');

  // Skeleton cards while loading
  const skCard = () => `
    <div class="test-card-skeleton">
      <div class="sk-cover sk-shimmer"></div>
      <div class="sk-body">
        <div class="sk-line sk-title sk-shimmer"></div>
        <div class="sk-line sk-meta sk-shimmer"></div>
        <div class="sk-line sk-btn sk-shimmer"></div>
      </div>
    </div>`;
  wrap.innerHTML = `<div class="test-group"><div class="test-grid">${Array(6).fill(0).map(skCard).join('')}</div></div>`;

  try {
    const res = await apiFetch('/api/reading/tests');
    allTests = res.tests || [];
    renderTestList(allTests);
    checkResumeExam();
  } catch (e) {
    wrap.innerHTML = `
      <div class="loading-spinner">
        <div style="font-size:36px;margin-bottom:12px">😕</div>
        <div style="font-weight:600;color:#374151;margin-bottom:6px">Không tải được danh sách đề thi</div>
        <div style="font-size:12px;margin-bottom:16px;color:#9ca3af">Kiểm tra kết nối rồi thử lại</div>
        <button onclick="loadTests()" style="background:#3d8bff;color:#fff;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">↺ Thử lại</button>
      </div>`;
  }
}

function renderTestList(tests) {
  const wrap = document.getElementById('tests-wrapper');
  if (!tests.length) {
    wrap.innerHTML = '<div class="loading-spinner">Chưa có bộ đề nào</div>';
    return;
  }
  // Group by testNumber range
  const groups = {};
  tests.forEach(t => {
    const g = Math.ceil(t.testNumber / 5) * 5;
    if (!groups[g]) groups[g] = [];
    groups[g].push(t);
  });
  let html = '';
  for (const g of Object.keys(groups).sort((a, b) => a - b)) {
    const arr = groups[g];
    const done = arr.filter(t => t.lastAttempt).length;
    html += `<div class="test-group">
      <div class="test-group-title">
        Bộ đề <span class="test-group-progress">${done}/${arr.length} đã làm</span>
        <div class="progress-bar-mini"><div class="progress-bar-mini-fill" style="width:${Math.round(done / arr.length * 100)}%"></div></div>
      </div>
      <div class="test-grid">
        ${arr.map(testCard).join('')}
      </div>
    </div>`;
  }
  wrap.innerHTML = html;
}

function testCard(t) {
  const done = !!t.lastAttempt;
  const band = t.lastAttempt?.bandScore?.toFixed(1) || '';
  const cor = t.lastAttempt?.correctCount ?? '';
  const tot = t.lastAttempt?.totalQuestions ?? '';
  return `<div class="test-card" id="tcard-${t._id}" data-done="${done}" data-name="${escHtml((t.name || '').toLowerCase())}">
    <div class="test-card-cover">
      <div class="test-cover-badge">IELTS</div>
      <div class="test-cover-title">Test ${t.testNumber}</div>
      <div class="test-cover-sub">Reading Full</div>
      ${done ? `<div class="test-done-tick">✓</div>` : ''}
    </div>
    <div class="test-card-body">
      <div class="test-card-name">${escHtml(t.name)}</div>
      <div class="test-card-meta">40 câu · 60 phút</div>
      ${done ? `<div class="test-card-last">Lần cuối: <span class="band-mini">${band}</span> · ${cor}/${tot} câu</div>` : ''}
      <button class="btn-do-test" onclick="goToKey('${t._id}','${escHtml(t.name)}')">
        ${done ? 'Làm test mới' : 'Bắt đầu'}
      </button>
      <div class="test-card-random-note"><i class="fas fa-shuffle"></i> Câu hỏi ngẫu nhiên mỗi lần</div>
      ${done ? `<button class="btn-redo-test" onclick="loadReviewByTest('${t._id}')">Xem lại kết quả</button>` : ''}
    </div>
  </div>`;
}

function filterTests(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  _activeFilter = filter;
  applyTestFilters();
}

function applyTestFilters() {
  const q = (document.getElementById('test-search')?.value || '').trim().toLowerCase();
  document.querySelectorAll('.test-card').forEach(c => {
    const done = c.dataset.done === 'true';
    const name = c.dataset.name || '';
    const matchFilter = _activeFilter === 'all' || (_activeFilter === 'done' ? done : !done);
    const matchSearch = !q || name.includes(q);
    c.style.display = (matchFilter && matchSearch) ? '' : 'none';
  });
  document.querySelectorAll('.test-group').forEach(g => {
    const hasVisible = Array.from(g.querySelectorAll('.test-card')).some(c => c.style.display !== 'none');
    g.style.display = hasVisible ? '' : 'none';
  });
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 2 – KEY
══════════════════════════════════════════════════════════════════════ */
// Called from test card button — updates URL too
function goToKey(testId, testName) {
  history.pushState({ screen: 'key', testId, testName }, '', `?testId=${testId}`);
  _openKeyScreen(testId, testName);
}

// Internal: opens key screen without touching URL (used by popstate / direct link)
function _openKeyScreen(testId, testName) {
  state.testId = testId;
  state.testName = testName;
  document.getElementById('key-test-name').textContent = testName;
  document.getElementById('key-input').value = '';
  const msg = document.getElementById('key-msg');
  msg.textContent = ''; msg.className = 'key-msg hidden';
  showScreen('key');
  setTimeout(() => document.getElementById('key-input')?.focus(), 50);
}

function formatKeyInput(inp) {
  let v = inp.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
  inp.value = v;
}

async function verifyAndStart() {
  const key = document.getElementById('key-input').value.trim();
  const btn = document.getElementById('btn-start-key');
  const msg = document.getElementById('key-msg');
  if (!key) { showMsg(msg, 'Vui lòng nhập mã truy cập', 'error'); return; }
  btn.disabled = true; btn.textContent = 'Đang xác thực...';
  try {
    const res = await apiFetch('/api/reading/start', {
      method: 'POST',
      body: JSON.stringify({ key, testId: state.testId })
    });
    if (!res.success) { showMsg(msg, res.message, 'error'); return; }
    startExam(res);
  } catch (e) {
    showMsg(msg, 'Lỗi kết nối server', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Bắt đầu làm bài';
  }
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `key-msg ${type}`;
}

/* ══════════════════════════════════════════════════════════════════════
   LOCAL-STORAGE: AUTO-SAVE & RESUME
══════════════════════════════════════════════════════════════════════ */
const _EXAM_KEY     = 'ews_reading_progress';
const _PRACTICE_KEY = 'ews_reading_practice';

function saveExamToStorage() {
  if (!state.attemptId || state.submitted) return;
  try {
    localStorage.setItem(_EXAM_KEY, JSON.stringify({
      attemptId: state.attemptId,
      testId: state.testId,
      testName: state.testName,
      passages: state.passages,      // full passage data (no correct answers)
      answers: state.answers,
      secondsLeft: state.secondsLeft,
      savedAt: Date.now()
    }));
    const lbl = document.getElementById('exam-autosave');
    if (lbl) { lbl.classList.add('saved'); clearTimeout(lbl._t); lbl._t = setTimeout(() => lbl.classList.remove('saved'), 1500); }
  } catch { /* quota exceeded – ignore */ }
}

function clearExamStorage() {
  localStorage.removeItem(_EXAM_KEY);
}

function checkResumeExam() {
  try {
    const raw = localStorage.getItem(_EXAM_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data.attemptId || !data.passages?.length) { clearExamStorage(); return; }
    // Expire after 70 min (exam is 60 min)
    if (Date.now() - data.savedAt > 70 * 60 * 1000) { clearExamStorage(); return; }
    const banner = document.getElementById('resume-banner');
    if (!banner) return;
    document.getElementById('resume-test-name').textContent = data.testName || 'bài thi';
    const totalSec = data.secondsLeft || 0;
    const rm = Math.floor(totalSec / 60);
    const rs = totalSec % 60;
    document.getElementById('resume-time-left').textContent = rs > 0 ? `còn ${rm} phút ${rs} giây` : `còn ${rm} phút`;
    banner._resumeData = data;
    banner.style.display = 'flex';
  } catch { clearExamStorage(); }
}

function resumeExam() {
  const banner = document.getElementById('resume-banner');
  const data = banner?._resumeData;
  if (!data) return;
  banner.style.display = 'none';

  state.passages = data.passages;
  state.attemptId = data.attemptId;
  state.testId = data.testId;
  state.testName = data.testName;
  state.answers = data.answers || {};
  state.secondsLeft = data.secondsLeft || DURATION;
  state.currentPassageIdx = 0;
  state.isReview = false;
  state.submitted = false;

  document.getElementById('exam-title').textContent = state.testName;
  renderPassageTabs('toolbar-passage-tabs', false);
  switchPassage(0);
  buildQNavFooter();
  startTimer();
  showScreen('exam');
  window.onbeforeunload = () => 'Bạn đang làm bài thi. Rời trang sẽ dừng bài.';
}

function dismissResume() {
  const banner = document.getElementById('resume-banner');
  if (banner) banner.style.display = 'none';
  clearExamStorage();
}

/* ══════════════════════════════════════════════════════════════════════
   LOCAL-STORAGE: PRACTICE MODE AUTO-SAVE
══════════════════════════════════════════════════════════════════════ */
function savePracticeToStorage() {
  if (!_practiceMode || !_retryState) return;
  try {
    const passage = state.passages[0];
    if (!passage) return;
    localStorage.setItem(_PRACTICE_KEY, JSON.stringify({
      passageId: _retryState.practicePassageId,
      category:  _retryState.practiceCategory,
      title:     passage.title || '',
      answers:   state.answers,
      savedAt:   Date.now()
    }));
  } catch { /* quota – ignore */ }
}

function clearPracticeStorage() {
  localStorage.removeItem(_PRACTICE_KEY);
}

function _fmtTimeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  return `${Math.floor(s / 3600)} giờ trước`;
}

function checkResumePractice() {
  try {
    const raw = localStorage.getItem(_PRACTICE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data.passageId || !data.category) { clearPracticeStorage(); return; }
    if (Date.now() - data.savedAt > 4 * 60 * 60 * 1000) { clearPracticeStorage(); return; }
    const picker = document.getElementById('practice-picker');
    if (!picker) return;
    let banner = document.getElementById('practice-resume-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'practice-resume-banner';
      banner.style.cssText = 'display:flex;align-items:center;gap:10px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin-bottom:14px;font-size:13px;flex-wrap:wrap';
      picker.prepend(banner);
    }
    const answered = Object.keys(data.answers || {}).length;
    const timeAgo  = _fmtTimeAgo(data.savedAt);
    banner.innerHTML = `
      <span style="flex:1;min-width:180px">
        📖 Bài dở dang: <strong>${escHtml(data.title || 'Không tên')}</strong>
        — đã trả lời <strong>${answered}</strong> câu
        <span style="color:#6b7280">(${timeAgo})</span>
      </span>
      <button onclick="resumePractice()"
        style="background:#3d8bff;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
        Tiếp tục
      </button>
      <button onclick="dismissPracticeResume()"
        style="background:none;border:1px solid #d1d5db;color:#6b7280;border-radius:7px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit">
        Bỏ qua
      </button>`;
    banner._resumeData = data;
    banner.style.display = 'flex';
  } catch { clearPracticeStorage(); }
}

async function resumePractice() {
  const banner = document.getElementById('practice-resume-banner');
  const data = banner?._resumeData;
  if (!data) return;
  if (banner) banner.style.display = 'none';
  showVocabToast('Đang tải bài...', 'info');
  try {
    const res = await apiFetch(`/api/reading/practice/by-id/${data.passageId}`);
    if (!res.success || !res.passage) { showVocabToast('Không thể tiếp tục bài cũ', 'error'); return; }
    _enterPracticeScreen(res.passage, data.category, data.passageId);
    const savedAnswers = data.answers || {};
    if (Object.keys(savedAnswers).length > 0) {
      state.answers = savedAnswers;
      const cleanPassage = state.passages[0];
      document.getElementById('retry-questions-inner').innerHTML =
        renderPassageQuestions(cleanPassage, false, {});
      initDropZones();
      savePracticeToStorage();
      const n = Object.keys(savedAnswers).length;
      showVocabToast(`Đã khôi phục ${n} câu trả lời`, 'success');
    }
  } catch {
    showVocabToast('Không thể tiếp tục bài cũ', 'error');
  }
}

function dismissPracticeResume() {
  const banner = document.getElementById('practice-resume-banner');
  if (banner) banner.style.display = 'none';
  clearPracticeStorage();
}

/* ══════════════════════════════════════════════════════════════════════
   MODE SWITCH: Full đề / Bài lẻ
══════════════════════════════════════════════════════════════════════ */
function setReadingMode(mode) {
  const isLele = mode === 'lele';
  document.getElementById('rmode-full')?.classList.toggle('rmode-active', !isLele);
  document.getElementById('rmode-lele')?.classList.toggle('rmode-active', isLele);

  const picker    = document.getElementById('practice-picker');
  const wrapper   = document.getElementById('tests-wrapper');
  const banner    = document.getElementById('resume-banner');
  const filterBar = document.getElementById('list-filter-bar');
  const subtitle  = document.getElementById('list-mode-subtitle');
  const title     = document.getElementById('list-mode-title');

  if (picker)    picker.classList.toggle('hidden', !isLele);
  if (wrapper)   wrapper.style.display   = isLele ? 'none' : '';
  if (banner)    banner.style.display    = isLele ? 'none' : (banner._resumeData ? 'flex' : 'none');
  if (filterBar) filterBar.style.display = isLele ? 'none' : '';
  if (subtitle)  subtitle.style.display  = isLele ? 'none' : '';
  if (title) {
    title.innerHTML = isLele
      ? 'Luyện tập <span style="background:#3d8bff;color:#fff;padding:2px 10px;border-radius:6px;font-size:14px">Reading Bài lẻ</span>'
      : 'Luyện tập <span class="tag-red">Reading Full đề</span>';
  }

  if (isLele) {
    const listEl = document.getElementById('practice-passage-list');
    if (listEl && !listEl.children.length) {
      const activeTab = document.querySelector('.plele-tab.plele-active');
      const cat = activeTab?.dataset.category || 'passage1';
      loadPracticePassages(cat);
    }
    checkResumePractice();
  }
}

async function loadPracticePassages(category, tabEl) {
  // Update active tab
  document.querySelectorAll('.plele-tab').forEach(b => b.classList.remove('plele-active'));
  const tab = tabEl || document.querySelector(`.plele-tab[data-category="${category}"]`);
  if (tab) tab.classList.add('plele-active');

  const listEl = document.getElementById('practice-passage-list');
  if (!listEl) return;

  const cls = { passage1: 'p1', passage2: 'p2', passage3: 'p3' }[category] || 'p1';
  const pNum = { passage1: '1', passage2: '2', passage3: '3' }[category] || '1';

  // Skeleton
  listEl.innerHTML = `<div class="practice-card-grid">${Array(4).fill(0).map(() => `
    <div class="practice-card practice-card-sk">
      <div class="practice-card-cover"></div>
      <div class="practice-card-body">
        <div class="sk-line sk-shimmer" style="height:13px;width:90%;margin-bottom:6px;border-radius:4px"></div>
        <div class="sk-line sk-shimmer" style="height:13px;width:65%;margin-bottom:10px;border-radius:4px"></div>
        <div class="sk-line sk-shimmer" style="height:28px;border-radius:7px"></div>
      </div>
    </div>`).join('')}</div>`;

  try {
    const res = await apiFetch(`/api/reading/practice/list?category=${category}`);
    const passages = res.passages || [];

    if (!passages.length) {
      listEl.innerHTML = `<div style="text-align:center;padding:48px 0;color:#9ca3af">
        <div style="font-size:32px;margin-bottom:10px">📭</div>
        <div style="font-weight:600;margin-bottom:4px">Chưa có bài đọc nào</div>
        <div style="font-size:13px">Category này chưa có passage được thêm vào</div>
      </div>`;
      return;
    }

    const typeLabel = {
      'true-false-ng': 'True / False / Not Given',
      'yes-no-ng': 'Yes / No / Not Given',
      'multiple-choice': 'Multiple Choice',
      'fill-blank': 'Gap Filling',
      'sentence-completion': 'Sentence Completion',
      'matching-headings': 'Matching Headings',
      'matching-info': 'Matching Information',
      'matching-options': 'Matching Features',
      'map': 'Map / Diagram',
      'table': 'Table Completion',
      'note-form': 'Note Completion',
      'bullet-list': 'Bullet List',
      'summary-completion': 'Summary Completion',
      'sentence-endings': 'Sentence Endings',
    };

    const _isPremium = (JSON.parse(localStorage.getItem('user') || '{}').plan === 'premium');
    listEl.innerHTML = `<div class="practice-card-grid">${passages.map(p => {
      const qtypes = [...new Set(
        (p.questionGroups || []).flatMap(g =>
          g.questions?.map(q => typeLabel[q.type] || typeLabel[g.groupType] || g.groupType) || []
        )
      )].slice(0, 3);
      const qCount = p.questionCount || 0;
      const btnText = _isPremium ? `Làm bài · ${qCount} câu` : '<i class="fas fa-lock" style="font-size:11px;margin-right:4px"></i> Upgrade gói';
      const btnCls  = `practice-card-btn ${cls}${_isPremium ? '' : ' btn-upgrade-lock'}`;

      return `<div class="practice-card" onclick="startPractice('${p._id}','${category}')">
        <div class="practice-card-cover">
          <div class="practice-cover-logo"><span>D</span>aniel</div>
          <span class="practice-card-cat-badge ${cls}">Passage ${pNum}</span>
        </div>
        <div class="practice-card-body">
          <div class="practice-card-title">${escHtml(p.title)}</div>
          <div class="practice-card-qtypes">${qtypes.map(t => `· ${t}`).join('<br>')}</div>
          <button class="${btnCls}" onclick="event.stopPropagation();startPractice('${p._id}','${category}')">
            ${btnText}
          </button>
        </div>
      </div>`;
    }).join('')}</div>`;
  } catch (e) {
    listEl.innerHTML = `<div style="text-align:center;padding:40px 0">
      <div style="color:#e53935;margin-bottom:12px">Lỗi tải danh sách bài đọc</div>
      <button onclick="loadPracticePassages('${category}')"
        style="background:#3d8bff;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit">
        ↺ Thử lại
      </button>
    </div>`;
  }
}

async function startPractice(passageId, category) {
  const _u = JSON.parse(localStorage.getItem('user') || '{}');
  if (_u.plan !== 'premium' && !['admin', 'teacher'].includes(_u.role)) {
    openUpgradeModal(); return;
  }

  _practiceCategory = category;

  const cards = document.querySelectorAll('#practice-passage-list .practice-card');
  cards.forEach(c => { c.style.opacity = '0.5'; c.style.pointerEvents = 'none'; });

  try {
    const res = await apiFetch(`/api/reading/practice/by-id/${passageId}`);
    if (!res.success || !res.passage) { showVocabToast('Không tải được bài luyện tập'); return; }
    _enterPracticeScreen(res.passage, category, passageId);
  } catch (e) {
    showVocabToast('Lỗi kết nối server');
  } finally {
    cards.forEach(c => { c.style.opacity = ''; c.style.pointerEvents = ''; });
  }
}

function _enterPracticeScreen(passage, category, passageId) {
  _practiceMode = true;

  // Build correctMap từ passage (backend trả đầy đủ đáp án)
  const correctMap = {};
  getAllQuestionsFromPassage(passage).forEach(q => {
    if (q.correctAnswer !== undefined) correctMap[q.questionNumber] = q.correctAnswer;
  });

  // Deep-clone và xóa đáp án trước khi render
  const cleanPassage = JSON.parse(JSON.stringify(passage));
  getAllQuestionsFromPassage(cleanPassage).forEach(q => {
    delete q.correctAnswer;  // ẩn đáp án trong lúc làm bài
    delete q.userAnswer;
    delete q.isCorrect;
    // giữ lại q.explanation để submitRetry() dùng khi hiện kết quả
  });

  // Lưu _retryState với flag isPractice để submitRetry/closeRetry dùng đúng
  _retryState = {
    passages: state.passages,
    answers: state.answers,
    isReview: state.isReview,
    currentPassageIdx: state.currentPassageIdx,
    correctMap,
    isPractice: true,
    practiceCategory: category,
    practicePassageId: passageId || passage._id,
  };

  state.passages = [cleanPassage];
  state.answers = {};
  state.isReview = false;
  state.currentPassageIdx = 0;

  const catLabel = { passage1: 'Passage 1', passage2: 'Passage 2', passage3: 'Passage 3' };
  const label = passage.title || catLabel[category] || 'Passage';
  document.getElementById('retry-title').textContent = `🎯 Luyện: ${label}`;

  const badge = document.getElementById('retry-score-badge');
  if (badge) badge.style.display = 'none';

  document.getElementById('retry-footer-btns').innerHTML = `
    <button class="btn-ghost" onclick="closeRetry()">← Chọn bài khác</button>
    <button class="btn-primary" onclick="submitRetry()">Kiểm tra đáp án</button>`;

  document.getElementById('retry-passage-inner').innerHTML =
    `<div class="passage-title">${escHtml(passage.title)}</div>
     <div class="passage-text">${passage.content || ''}</div>`;

  document.getElementById('retry-questions-inner').innerHTML =
    renderPassageQuestions(cleanPassage, false, {});

  const nav = document.getElementById('retry-q-nav');
  if (nav) {
    nav.innerHTML = getAllQuestionsFromPassage(cleanPassage)
      .map(q => `<button class="q-nav-btn" onclick="jumpToRetryQuestion(${q.questionNumber})">${q.questionNumber}</button>`)
      .join('');
  }

  setTool('none');
  initDropZones();
  showScreen('retry');

  // Start stopwatch + progress HUD (practice mode only)
  const totalQ = getAllQuestionsFromPassage(cleanPassage).length;
  _startPracticeTimer(totalQ);

  // Save initial state immediately and guard against accidental navigation
  savePracticeToStorage();
  window.onbeforeunload = e => {
    savePracticeToStorage();
    e.preventDefault();
    e.returnValue = '';
  };

  // Listen for answer changes to update progress live and auto-save
  const qi = document.getElementById('retry-questions-inner');
  if (qi) {
    const onAnswer = () => { setTimeout(_updatePracticeProgress, 40); savePracticeToStorage(); };
    qi.addEventListener('click', onAnswer);
    qi.addEventListener('input', onAnswer);
    qi.addEventListener('drop', onAnswer);
  }
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 3 – EXAM
══════════════════════════════════════════════════════════════════════ */
function startExam(data) {
  clearExamStorage();          // Clear any previous in-progress exam
  for (const k in passageHlCache) delete passageHlCache[k];
  state.passages = data.passages;
  state.attemptId = data.attemptId;
  state.testName = data.testName;
  state.answers = {};
  state.secondsLeft = data.duration || DURATION;
  state.currentPassageIdx = 0;
  state.isReview = false;
  state.submitted = false;

  document.getElementById('exam-title').textContent = state.testName;
  renderPassageTabs('toolbar-passage-tabs', false);
  switchPassage(0);
  buildQNavFooter();
  startTimer();
  showScreen('exam');
  saveExamToStorage();         // Save initial state immediately
  window.onbeforeunload = () => 'Bạn đang làm bài thi. Rời trang sẽ dừng bài.';
}

function renderPassageTabs(containerId, isReview) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = state.passages.map((p, i) => `
    <button class="passage-tab-btn ${i === state.currentPassageIdx ? 'active' : ''}"
      onclick="${isReview ? `switchReviewPassage(${i})` : `switchPassage(${i})`}">
      ${p.category?.replace('passage', 'P') || `P${i + 1}`}
    </button>`).join('');
}

function switchPassage(idx) {
  const passageInner = document.getElementById('passage-inner');
  const questionsInner = document.getElementById('questions-inner');

  // Guard: same tab click should not re-render (would erase highlights)
  if (idx === state.currentPassageIdx && passageInner?.innerHTML?.trim()) {
    return;
  }

  // Save both panels' highlights before overwriting (skip on first load when idx === currentPassageIdx)
  if (state.currentPassageIdx !== idx) {
    passageHlCache[state.currentPassageIdx] = {
      passage: passageInner ? passageInner.innerHTML : null,
      questions: questionsInner ? questionsInner.innerHTML : null,
    };
  }

  state.currentPassageIdx = idx;
  const p = state.passages[idx];
  if (!p) return;

  const cached = passageHlCache[idx];
  if (cached !== undefined) {
    // Restore both panels with saved highlights
    if (passageInner) passageInner.innerHTML = cached.passage ?? '';
    if (questionsInner) questionsInner.innerHTML = cached.questions ?? '';
    restoreAnswers(false);
    initDropZones();
  } else {
    // Fresh render
    if (passageInner) {
      passageInner.innerHTML =
        `<div class="passage-title">${escHtml(p.title)}</div>
     <div class="passage-text">${p.content || ''}</div>`;
    }
    if (questionsInner) questionsInner.innerHTML = renderPassageQuestions(p, false);
    restoreAnswers(false);
    initDropZones();
  }

  // Scroll both panels to top when switching to a new passage
  const splitPassage = document.getElementById('split-passage');
  const splitQuestions = document.getElementById('split-questions');
  if (splitPassage) splitPassage.scrollTop = 0;
  if (splitQuestions) splitQuestions.scrollTop = 0;

  updateQNavFooter();
  renderPassageTabs('toolbar-passage-tabs', false);
}

/* ── Render questions for a passage ──────────────────────────────── */
function renderPassageQuestions(passage, isReview, reviewMap = {}) {
  let html = '';
  const groups = getAllGroupsFromPassage(passage);
  for (const group of groups) {
    html += renderQuestionGroup(group, isReview, reviewMap);
  }
  return html;
}

/* ── getAllGroupsFromPassage: supports both questionGroups[] and legacy questions[] ── */
function getAllGroupsFromPassage(passage) {
  if (passage.questionGroups?.length) return passage.questionGroups;
  // Legacy: wrap flat questions in a single plain group
  if (passage.questions?.length) {
    return [{ groupType: 'plain', groupTitle: '', instruction: '', questions: passage.questions }];
  }
  return [];
}

/* ── getAllQuestionsFromPassage: flat list for answer collection ── */
function getAllQuestionsFromPassage(passage) {
  if (passage.questionGroups?.length) {
    return passage.questionGroups.flatMap(g => g.questions || []);
  }
  return passage.questions || [];
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTION GROUP RENDERER
══════════════════════════════════════════════════════════════════════ */
function renderQuestionGroup(group, isReview, reviewMap = {}) {
  const { groupType = 'plain', groupTitle = '', instruction = '', questions = [] } = group;

  let headerHtml = '';
  if (groupTitle) headerHtml += `<div class="q-group-title">${escHtml(groupTitle)}</div>`;
  if (instruction) headerHtml += `<div class="q-section-instruction">${escHtml(instruction)}</div>`;

  let bodyHtml = '';
  switch (groupType) {
    case 'table': bodyHtml = renderTableGroup(group, isReview, reviewMap); break;
    case 'note-form':
    case 'bullet-list': bodyHtml = renderNoteFormGroup(group, isReview, reviewMap); break;
    case 'map': bodyHtml = renderMapGroup(group, isReview, reviewMap); break;
    case 'matching-options':
    case 'sentence-endings': bodyHtml = renderMatchingOptionsGroup(group, isReview, reviewMap); break;
    case 'matching-headings': bodyHtml = renderMatchingHeadingsGroup(group, isReview, reviewMap); break;
    case 'summary-completion': bodyHtml = renderSummaryCompletionGroup(group, isReview, reviewMap); break;
    case 'multi-answer-group': bodyHtml = renderMultiAnswerCluster(questions, isReview, reviewMap); break;
    default: bodyHtml = renderPlainGroup(questions, isReview, reviewMap); break;
  }

  return `<div class="question-group">${headerHtml}${bodyHtml}</div>`;
}

/* ── PLAIN ────────────────────────────────────────────────────────── */
function renderPlainGroup(questions, isReview, reviewMap) {
  const items = [];
  let i = 0;
  while (i < questions.length) {
    const q = questions[i];
    if (q.type === 'multi-answer-group') {
      // Gom tất cả câu multi-answer-group liên tiếp trong cùng nhóm thành 1 cluster
      const cluster = [q];
      while (i + 1 < questions.length && questions[i + 1].type === 'multi-answer-group') {
        i++; cluster.push(questions[i]);
      }
      items.push(renderMultiAnswerCluster(cluster, isReview, reviewMap));
    } else {
      items.push(renderSingleQuestion(q, isReview, reviewMap));
    }
    i++;
  }
  return items.join('');
}

/* ── MULTI-ANSWER CLUSTER (Choose TWO/THREE Letters) ─────────────── */
function renderMultiAnswerCluster(cluster, isReview, reviewMap) {
  const count = cluster.length;
  const firstNum = cluster[0].questionNumber;
  const lastNum  = cluster[cluster.length - 1].questionNumber;
  const opts = cluster[0].options || [];
  const LETTERS = 'ABCDEFGHIJ';

  const caLetters = cluster.map(q => (q.correctAnswer || '').trim().toUpperCase()).filter(Boolean);

  let uaArr = [];
  if (isReview) {
    try { uaArr = JSON.parse(reviewMap[firstNum]?.userAnswer || '[]').map(x => x.toUpperCase()); } catch { }
  } else {
    try { uaArr = JSON.parse(state.answers[firstNum] || '[]').map(x => x.toUpperCase()); } catch { }
  }

  let rangeLabel;
  if (count === 1) rangeLabel = `Question ${firstNum}`;
  else if (count === 2) rangeLabel = `Questions ${firstNum} and ${lastNum}`;
  else {
    const nums = cluster.map(q => q.questionNumber);
    rangeLabel = `Questions ${nums.slice(0, -1).join(', ')} and ${nums[nums.length - 1]}`;
  }

  const letterWord = count === 2 ? 'TWO' : count === 3 ? 'THREE' : count === 4 ? 'FOUR' : String(count);

  const optHtml = opts.map((opt, idx) => {
    const letter = LETTERS[idx] || String.fromCharCode(65 + idx);
    let cls = '';
    if (isReview) {
      if (caLetters.includes(letter)) cls = 'correct-ans';
      else if (uaArr.includes(letter)) cls = 'wrong-ans';
    } else {
      if (uaArr.includes(letter)) cls = 'selected';
    }
    const onclick = isReview ? '' : `onclick="toggleMultiAnswer(${firstNum},'${letter}',${count},${lastNum})"`;
    return `<div class="checkbox-opt ${cls}" data-cluster="${firstNum}" data-value="${letter}" ${onclick}>
      <span class="check-box"></span>
      <label><strong class="cb-letter">${letter}</strong>&nbsp;&nbsp;${escHtml(opt.replace(/^[A-Ja-j]\s+/, ''))}</label>
    </div>`;
  }).join('');

  let reviewExtra = '';
  if (isReview) {
    reviewExtra = cluster.map(q => {
      const r = reviewMap[q.questionNumber];
      const ok = !!r?.isCorrect;
      const ca = (r?.correctAnswer || q.correctAnswer || '').toUpperCase();
      return `<div class="q-correct-ans ${ok ? 'right' : 'wrong'}" style="margin-top:4px">
        Q${q.questionNumber}: ${ok ? '✓ Đúng' : `✗ Sai — Đáp án: <strong>${escHtml(ca)}</strong>`}
      </div>${r?.explanation ? `<div class="q-explanation"><strong>Giải thích:</strong> ${escHtmlNl(r.explanation)}</div>` : ''}`;
    }).join('');
  }

  return `<div class="question-item" id="qi-${firstNum}" data-cluster-start="${firstNum}" data-cluster-end="${lastNum}">
    <div class="q-num-label"><span class="q-badge">${rangeLabel}</span></div>
    <div class="q-text">${escHtml(cluster[0].questionText || '')}</div>
    <div class="checkbox-hint">Chọn <strong>${letterWord}</strong> chữ cái, A–${LETTERS[opts.length - 1] || 'E'}</div>
    <div class="checkbox-opts">${optHtml}</div>
    ${reviewExtra}
  </div>`;
}

/* ── TABLE ────────────────────────────────────────────────────────── */
function renderTableGroup(group, isReview, reviewMap) {
  const { tableConfig = {}, questions = [] } = group;
  const headers = tableConfig.headers || [];
  const rows = tableConfig.rows || [];

  const qMap = {};
  questions.forEach(q => { qMap[q.questionNumber] = q; });

  const thead = headers.length
    ? `<thead><tr>${headers.map(h => `<th>${escHtml(h)}</th>`).join('')}</tr></thead>`
    : '';

  const tbody = rows.map(row =>
    `<tr>${row.map(cell => `<td>${resolvePlaceholders(cell, qMap, isReview, reviewMap)}</td>`).join('')}</tr>`
  ).join('');

  return `<div class="rq-table-wrap"><table class="rq-table">${thead}<tbody>${tbody}</tbody></table></div>`;
}

/* ── NOTE FORM / BULLET LIST ──────────────────────────────────────── */
function renderNoteFormGroup(group, isReview, reviewMap) {
  const { groupType, noteConfig = {}, bulletConfig, questions = [] } = group;
  const title = noteConfig.title || '';
  const lines = noteConfig.lines?.length ? noteConfig.lines : (bulletConfig?.items || []);

  const qMap = {};
  questions.forEach(q => { qMap[q.questionNumber] = q; });

  if (groupType === 'bullet-list') {
    const itemsHtml = lines.map(line =>
      `<li class="rq-bullet-item">${resolvePlaceholders(line, qMap, isReview, reviewMap)}</li>`
    ).join('');
    return `<div class="rq-bullet-list"><ul>${itemsHtml}</ul></div>`;
  }

  const titleHtml = title ? `<div class="rq-note-title">${escHtml(title)}</div>` : '';
  const linesHtml = lines.map(line =>
    `<div class="rq-note-line">${resolvePlaceholders(line, qMap, isReview, reviewMap)}</div>`
  ).join('');
  return `<div class="rq-note-form">${titleHtml}<div class="rq-note-body">${linesHtml}</div></div>`;
}

/* ── MAP ──────────────────────────────────────────────────────────── */
function renderMapGroup(group, isReview, reviewMap) {
  const { imageUrl = '', questions = [] } = group;
  const imgHtml = imageUrl
    ? `<div class="rq-map-img-wrap"><img class="rq-map-img" src="${escHtml(imageUrl)}" alt="Map/Diagram" /></div>`
    : '';
  const questionsHtml = questions.map(q => renderSingleQuestion(q, isReview, reviewMap)).join('');
  return `<div class="rq-map-group">${imgHtml}<div class="rq-map-questions">${questionsHtml}</div></div>`;
}

/* ── MATCHING OPTIONS (drag-and-drop) — dùng cho Matching Features, Sentence Endings, Choose Letters ── */
function renderMatchingOptionsGroup(group, isReview, reviewMap) {
  const { matchingReuseAllowed = false, questions = [] } = group;
  // Backward compat: sentence-endings lưu trong endingsConfig.endings thay vì matchingOptions
  const matchingOptions = group.matchingOptions?.length
    ? group.matchingOptions
    : (group.endingsConfig?.endings || []).map(e => e.text || '');
  // sentence-endings: dùng letter lưu trong DB (admin có thể xóa/đổi thứ tự)
  // matching-options: dùng vị trí A=0, B=1, C=2...
  const optLetters = (group.groupType === 'sentence-endings' && group.endingsConfig?.endings?.length)
    ? group.endingsConfig.endings.map((e, i) => e.letter || String.fromCharCode(65 + i))
    : matchingOptions.map((_, i) => String.fromCharCode(65 + i));
  const groupId = 'mog-' + questions.map(q => q.questionNumber).join('-');

  // NB note (before chip bank)
  const reuseNote = matchingReuseAllowed
    ? `<div class="match-reuse-note"><strong>NB</strong> &nbsp;You may use any letter more than once.</div>` : '';

  // Chip bank — each letter is a draggable chip
  const chipsHtml = matchingOptions.map((opt, i) => {
    const letter = optLetters[i];
    const isUsed = !isReview && !matchingReuseAllowed &&
      questions.some(q => state.answers[q.questionNumber] === letter);
    const label = opt && opt.trim().length > 1 ? `. ${escHtml(opt)}` : '';
    return `<span class="drag-chip mo-chip${isUsed ? ' used' : ''}"
      data-value="${escHtml(letter)}" data-groupid="${groupId}"
      data-reuse="${matchingReuseAllowed ? 1 : 0}"
      draggable="${isReview ? 'false' : 'true'}"
      ondragstart="dragStart(event,'${escHtml(letter)}')"
      onclick="clickMOChip('${escHtml(letter)}','${groupId}')">
      <strong>${escHtml(letter)}</strong>${label}
    </span>`;
  }).join('');

  // Question rows with drop zones
  const qRowsHtml = questions.map(q => {
    const qNum = q.questionNumber;
    const review = reviewMap[qNum];
    const ans = isReview ? (review?.userAnswer || '') : (state.answers[qNum] || '');

    if (isReview) {
      const isCorrect = review?.isCorrect;
      const expl = review?.explanation
        ? `<div class="match-feedback q-explanation">${escHtmlNl(review.explanation)}</div>` : '';
      return `<div class="match-question-row" id="q${qNum}" data-qnum="${qNum}">
        <div class="match-q-left">
          <span class="match-q-num">${qNum}</span>
          <span class="match-q-text">${escHtml(q.questionText || '')}</span>
        </div>
        <div class="match-q-right">
          <span class="match-answer-badge ${isCorrect ? 'match-ans-correct' : 'match-ans-wrong'}">${escHtml(ans || '–')}</span>
          ${!isCorrect ? `<span class="match-correct-ans">✓ ${escHtml(review?.correctAnswer || '')}</span>` : ''}
        </div>${expl}
      </div>`;
    }

    // Build display text for filled drop zone
    const optIdx = ans ? ans.charCodeAt(0) - 65 : -1;
    const optDesc = optIdx >= 0 ? (matchingOptions[optIdx] || '') : '';
    const short = optDesc.length > 30 ? optDesc.slice(0, 30) + '…' : optDesc;
    const displayText = ans
      ? `<strong>${escHtml(ans)}</strong>${short && short.length > 1 ? '. ' + escHtml(short) : ''}<span class="clear-drop" onclick="clearDragDrop(${qNum},'${groupId}')">✕</span>`
      : 'Kéo chữ cái vào đây';

    return `<div class="match-question-row" id="q${qNum}" data-qnum="${qNum}">
      <div class="match-q-left">
        <span class="match-q-num">${qNum}</span>
        <span class="match-q-text">${escHtml(q.questionText || '')}</span>
      </div>
      <div class="drop-zone rq-mo-drop${ans ? ' filled' : ''}"
           data-qnum="${qNum}" data-groupid="${groupId}"
           ondragover="event.preventDefault()"
           ondrop="dropMO(event,${qNum},'${groupId}')">
        ${displayText}
      </div>
    </div>`;
  }).join('');

  const title = group.matchingOptionsTitle?.trim();
  const chipBankHtml = title
    ? `<div class="mo-options-box"><div class="mo-options-title">${escHtml(title)}</div><div class="rq-chip-bank" id="${groupId}-bank">${chipsHtml}</div></div>`
    : `<div class="rq-chip-bank" id="${groupId}-bank">${chipsHtml}</div>`;

  return `<div class="rq-mo-group">
    ${reuseNote}
    ${chipBankHtml}
    <div class="rq-mo-questions">${qRowsHtml}</div>
  </div>`;
}

/* ── MATCHING HEADINGS ────────────────────────────────────────────── */
function renderMatchingHeadingsGroup(group, isReview, reviewMap) {
  const { headingsConfig = {}, questions = [] } = group;
  const headings = headingsConfig.headings || [];
  if (!headings.length || !questions.length) return '<div class="form-hint">Chưa có dữ liệu matching headings.</div>';

  const groupId = 'mhg-' + questions.map(q => q.questionNumber).join('-');

  const chipsHtml = headings.map(h => {
    const val = h.numeral || '';
    const isUsed = !isReview && questions.some(q => state.answers[q.questionNumber] === val);
    return `<span class="drag-chip mh-chip${isUsed ? ' used' : ''}"
      data-value="${escHtml(val)}" data-groupid="${groupId}"
      draggable="${isReview ? 'false' : 'true'}"
      ondragstart="dragStart(event,'${escHtml(val)}')"
      onclick="clickMHChip('${escHtml(val)}','${groupId}')">
      <em>${escHtml(val)}.</em> ${escHtml(h.text || '')}
    </span>`;
  }).join('');

  const qRowsHtml = questions.map(q => {
    const qNum = q.questionNumber;
    const review = reviewMap[qNum];
    const ans = isReview ? (review?.userAnswer || '') : (state.answers[qNum] || '');
    const ansObj = headings.find(h => h.numeral === ans);
    const displayText = ansObj ? `<em>${escHtml(ans)}</em>. ${escHtml(ansObj.text.slice(0, 40))}${ansObj.text.length > 40 ? '…' : ''}` : '';

    if (isReview) {
      const isCorrect = review?.isCorrect;
      const expl = review?.explanation ? `<div class="match-feedback q-explanation">${escHtmlNl(review.explanation)}</div>` : '';
      return `<div class="match-question-row" id="q${qNum}" data-qnum="${qNum}">
        <div class="match-q-left">
          <span class="match-q-num">${qNum}</span>
          <span class="match-q-text">${escHtml(q.questionText || '')}</span>
        </div>
        <div class="match-q-right">
          <span class="match-answer-badge ${isCorrect ? 'match-ans-correct' : 'match-ans-wrong'}">${escHtml(ans || '–')}</span>
          ${!isCorrect ? `<span class="match-correct-ans">✓ ${escHtml(review?.correctAnswer || '')}</span>` : ''}
        </div>${expl}
      </div>`;
    }
    return `<div class="match-question-row" id="q${qNum}" data-qnum="${qNum}">
      <div class="match-q-left">
        <span class="match-q-num">${qNum}</span>
        <span class="match-q-text">${escHtml(q.questionText || '')}</span>
      </div>
      <div class="drop-zone rq-heading-drop${ans ? ' filled' : ''}"
           data-qnum="${qNum}" data-groupid="${groupId}"
           ondragover="event.preventDefault()"
           ondrop="dropMH(event,${qNum},'${groupId}')">
        ${ans ? `${displayText}<span class="clear-drop" onclick="clearDragDrop(${qNum},'${groupId}')">✕</span>` : 'Kéo tiêu đề vào đây'}
      </div>
    </div>`;
  }).join('');

  return `<div class="rq-mh-group">
    <div class="rq-chip-bank" id="${groupId}-bank">${chipsHtml}</div>
    <div class="rq-mh-questions">${qRowsHtml}</div>
  </div>`;
}

/* ── SUMMARY COMPLETION ───────────────────────────────────────────── */
function renderSummaryCompletionGroup(group, isReview, reviewMap) {
  const { summaryConfig = {}, questions = [] } = group;
  const { text = '', wordBank = [] } = summaryConfig;
  if (!wordBank.length) return '<div class="form-hint">Chưa có word bank.</div>';

  const groupId = 'scg-' + questions.map(q => q.questionNumber).join('-');
  const qMap = {};
  questions.forEach(q => { qMap[q.questionNumber] = q; });

  // Word bank chips (store the actual word as value)
  const chipsHtml = wordBank.map(w => {
    const word = w.word || '';
    const isUsed = !isReview && questions.some(q => state.answers[q.questionNumber] === word);
    return `<span class="drag-chip sc-chip${isUsed ? ' used' : ''}"
      data-value="${escHtml(word)}" data-groupid="${groupId}"
      draggable="${isReview ? 'false' : 'true'}"
      ondragstart="dragStart(event,'${escHtml(word)}')"
      onclick="clickSCChip('${escHtml(word)}','${groupId}')">
      <strong>${escHtml(w.letter || '')}</strong>. ${escHtml(word)}
    </span>`;
  }).join('');

  // Replace __Qn__ in summary text with drop zones (or review spans)
  const summaryHtml = text.replace(/__Q(\d+)__/g, (_, numStr) => {
    const qNum = parseInt(numStr);
    const q = qMap[qNum];
    if (!q) return `[Q${qNum}]`;
    if (isReview) {
      const review = reviewMap[qNum];
      const cls = review?.isCorrect ? 'rq-ans-ok' : 'rq-ans-wrong';
      const hint = !review?.isCorrect ? `<span class="rq-ans-correct">(✓${escHtml(review?.correctAnswer || '')})</span>` : '';
      return `<span class="rq-inline-wrap"><span class="rq-q-badge">${qNum}</span><span class="rq-inline-ans ${cls}">${escHtml(review?.userAnswer || '–')}</span>${hint}</span>`;
    }
    const ans = state.answers[qNum] || '';
    return `<span class="rq-inline-wrap"><span class="rq-q-badge">${qNum}</span><span class="drop-zone sc-drop${ans ? ' filled' : ''}" data-qnum="${qNum}" data-groupid="${groupId}" ondragover="event.preventDefault()" ondrop="dropSC(event,${qNum},'${groupId}')" style="display:inline-flex;min-width:90px">${ans ? `${escHtml(ans)}<span class="clear-drop" onclick="clearDragDrop(${qNum},'${groupId}')">✕</span>` : 'Kéo từ vào'}</span></span>`;
  });

  // Explanation blocks (below summary text, one per question that has explanation)
  const explHtml = isReview
    ? questions
        .filter(q => reviewMap[q.questionNumber]?.explanation)
        .map(q => {
          const r = reviewMap[q.questionNumber];
          return `<div class="q-explanation"><span class="q-badge">${q.questionNumber}</span> <strong>Giải thích:</strong> ${escHtmlNl(r.explanation)}</div>`;
        })
        .join('')
    : '';

  return `<div class="rq-summary-group">
    <div class="rq-chip-bank" id="${groupId}-bank">${chipsHtml}</div>
    <div class="rq-summary-text">${summaryHtml}</div>
    ${explHtml}
  </div>`;
}


/* ── SINGLE QUESTION (plain / map inner) ──────────────────────────── */
function renderSingleQuestion(q, isReview, reviewMap) {
  const { questionNumber: qNum, type, questionText, options = [], wordBank = [] } = q;
  const review = reviewMap[qNum];

  let inputHtml = '';

  if (type === 'true-false-ng') {
    inputHtml = renderTFNG(qNum, isReview, review, ['TRUE', 'FALSE', 'NOT GIVEN']);
  } else if (type === 'yes-no-ng') {
    inputHtml = renderTFNG(qNum, isReview, review, ['YES', 'NO', 'NOT GIVEN']);
  } else if (type === 'multiple-choice' || type === 'multi-answer-group') {
    inputHtml = renderMC(qNum, options, isReview, review);
  } else if (type === 'checkbox') {
    inputHtml = renderCheckbox(q, isReview, review);
  } else if (type === 'fill-blank' || type === 'sentence-completion' || type === 'map-labelling' || type === 'matching-headings' || type === 'matching-info') {
    if (wordBank?.length) {
      inputHtml = renderWordBank(qNum, wordBank, isReview, review);
    } else {
      inputHtml = renderFillBlank(qNum, isReview, review);
    }
  } else {
    inputHtml = renderFillBlank(qNum, isReview, review);
  }

  // Individual map image (map-labelling with per-question image)
  const imgHtml = (type === 'map-labelling' && q.imageUrl)
    ? `<div class="map-img-wrap"><img class="map-img" src="${escHtml(q.imageUrl)}" /></div>` : '';

  const reviewFeedback = isReview && review
    ? `<div class="q-correct-ans ${review.isCorrect ? 'right' : 'wrong'}">
        ${review.isCorrect ? '✓ Đúng' : `✗ Sai — Đáp án: <strong>${escHtml(review.correctAnswer)}</strong>`}
       </div>
       ${review.explanation ? `<div class="q-explanation"><strong>Giải thích:</strong> ${escHtmlNl(review.explanation)}</div>` : ''}` : '';

  return `<div class="question-item" id="q${qNum}" data-qnum="${qNum}">
    <div class="q-num-label"><span class="q-badge">${qNum}</span></div>
    <div class="q-text">${escHtml(questionText || '')}</div>
    ${imgHtml}
    ${inputHtml}
    ${reviewFeedback}
  </div>`;
}

/* ── True/False/NG  &  Yes/No/NG ─────────────────────────────────── */
function renderTFNG(qNum, isReview, review, labels = ['TRUE', 'FALSE', 'NOT GIVEN']) {
  const chosen = review ? review.userAnswer?.toUpperCase() : (state.answers[qNum] || '');
  if (isReview) {
    return `<div class="tfng-opts">${labels.map(l => {
      let cls = '';
      if (l === review?.correctAnswer?.toUpperCase()) cls = 'correct-ans';
      else if (l === chosen) cls = 'wrong-ans';
      return `<div class="tfng-opt ${cls}">${l}</div>`;
    }).join('')}</div>`;
  }
  return `<div class="tfng-opts">${labels.map(l =>
    `<div class="tfng-opt ${chosen === l ? 'selected' : ''}"
          onclick="pickTFNG(${qNum},'${l}',this)">${l}</div>`
  ).join('')}</div>`;
}

/* ── Multiple Choice ──────────────────────────────────────────────── */
function renderMC(qNum, options, isReview, review) {
  const chosen = review ? review.userAnswer : (state.answers[qNum] || '');
  if (isReview) {
    return `<div class="q-options">${options.map((opt, i) => {
      const l = String.fromCharCode(65 + i);
      let cls = '';
      if (l === review?.correctAnswer) cls = 'correct-ans';
      else if (l === chosen) cls = 'wrong-ans';
      return `<label class="radio-opt ${cls}">
        <span class="radio-dot"></span>
        <span class="radio-letter">${l}.</span>
        ${escHtml(opt)}
      </label>`;
    }).join('')}</div>`;
  }
  return `<div class="q-options">${options.map((opt, i) => {
    const l = String.fromCharCode(65 + i);
    return `<label class="radio-opt ${chosen === l ? 'selected' : ''}"
                   onclick="pickMC(${qNum},'${l}',this)">
      <span class="radio-dot"></span>
      <span class="radio-letter">${l}.</span>
      ${escHtml(opt)}
    </label>`;
  }).join('')}</div>`;
}

/* ── Checkbox ─────────────────────────────────────────────────────── */
function renderCheckbox(q, isReview, review) {
  const { questionNumber: qNum, options = [], checkboxCount = 2 } = q;
  const rawAns = review ? review.userAnswer : (state.answers[qNum] || '');
  let chosen = [];
  try { chosen = JSON.parse(rawAns); } catch { if (rawAns) chosen = [rawAns]; }
  const correctArr = (() => { try { return JSON.parse(review?.correctAnswer || '[]'); } catch { return []; } })();
  const hint = !isReview ? `<div class="checkbox-hint">Chọn ${checkboxCount} đáp án</div>` : '';
  return `${hint}<div class="checkbox-opts">${options.map((opt, i) => {
    const l = String.fromCharCode(65 + i);
    const sel = chosen.includes(l);
    let cls = sel ? 'selected' : '';
    if (isReview) {
      if (correctArr.includes(l)) cls = 'correct-ans';
      else if (sel) cls = 'wrong-ans';
    }
    return `<label class="checkbox-opt ${cls}" onclick="${isReview ? '' : `toggleCheckbox(${qNum},'${l}',${checkboxCount},this)`}">
      <span class="check-box"></span>
      <span class="cb-letter">${l}.</span>
      ${escHtml(opt)}
    </label>`;
  }).join('')}</div>`;
}

/* ── Fill Blank ───────────────────────────────────────────────────── */
function renderFillBlank(qNum, isReview, review) {
  if (isReview) {
    const cls = review?.isCorrect ? 'correct' : 'incorrect';
    return `<input class="fill-input ${cls}" value="${escHtml(review?.userAnswer || '')}" readonly />`;
  }
  const val = state.answers[qNum] || '';
  return `<input class="fill-input" data-qnum="${qNum}" value="${escHtml(val)}"
           oninput="setAnswer(${qNum},this.value)" placeholder="Nhập đáp án..." autocomplete="off" />`;
}

/* ── Word Bank / Drag-drop ────────────────────────────────────────── */
function renderWordBank(qNum, wordBank, isReview, review) {
  if (isReview) {
    const cls = review?.isCorrect ? 'correct' : 'incorrect';
    return `<input class="fill-input ${cls}" value="${escHtml(review?.userAnswer || '')}" readonly />`;
  }
  const current = state.answers[qNum] || '';
  const chips = wordBank.map(w =>
    `<span class="word-chip ${current === w ? 'used' : ''}"
           draggable="true"
           ondragstart="dragStart(event,'${escHtml(w)}')"
           onclick="clickChip(${qNum},'${escHtml(w)}')">${escHtml(w)}</span>`
  ).join('');
  const dzContent = current
    ? `${escHtml(current)}<span class="clear-drop" onclick="clearDrop(${qNum})">✕</span>`
    : 'Kéo hoặc click';
  return `<div class="word-bank">${chips}</div>
    <div class="drop-zone ${current ? 'filled' : ''}"
         data-qnum="${qNum}"
         ondragover="event.preventDefault()"
         ondrop="dropWord(event,${qNum})">${dzContent}</div>`;
}

/* ── PLACEHOLDERS in table/note/bullet cells ──────────────────────── */
function resolvePlaceholders(text, qMap, isReview, reviewMap) {
  const sortedQNums = Object.keys(qMap).map(Number).sort((a, b) => a - b);
  return text.replace(/__Q(\d+)__/g, (_, numStr) => {
    const idx = parseInt(numStr);
    // Exact match first; fall back to 1-based position within group (admin convenience)
    let q = qMap[idx];
    if (!q && idx >= 1 && idx <= sortedQNums.length) {
      q = qMap[sortedQNums[idx - 1]];
    }
    if (!q) return `[Q${idx}]`;
    const qNum = q.questionNumber;

    if (isReview) {
      const review = reviewMap[qNum];
      const userAns = review?.userAnswer || '';
      const isCorrect = review?.isCorrect;
      const cls = isCorrect ? 'rq-ans-ok' : 'rq-ans-wrong';
      const correctHint = !isCorrect && review?.correctAnswer
        ? `<span class="rq-ans-correct">(✓ ${escHtml(review.correctAnswer)})</span>` : '';
      const expl = review?.explanation
        ? `<span class="rq-inline-expl"><strong>Giải thích:</strong> ${escHtmlNl(review.explanation)}</span>` : '';
      return `<span class="rq-inline-wrap" id="q${qNum}" data-qnum="${qNum}">
    <span class="rq-q-badge">${qNum}</span>
    <span class="rq-inline-ans ${cls}">${escHtml(userAns || '–')}</span>
    ${correctHint}${expl}
  </span>`;
    }
    const val = state.answers[qNum] || '';
    return `<span class="rq-inline-wrap" id="q${qNum}" data-qnum="${qNum}">
      <span class="rq-q-badge">${qNum}</span>
      <input class="rq-inline-input" data-qnum="${qNum}" value="${escHtml(val)}"
             oninput="setAnswer(${qNum},this.value)" placeholder="Q${qNum}" />
    </span>`;
  });
}

/* ══════════════════════════════════════════════════════════════════════
   ANSWER SETTERS
══════════════════════════════════════════════════════════════════════ */
function setAnswer(qNum, val) {
  state.answers[qNum] = val;
  updateQNavBtn(qNum);
  saveExamToStorage();
}

function pickTFNG(qNum, val, el) {
  state.answers[qNum] = val;
  el.closest('.tfng-opts').querySelectorAll('.tfng-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  updateQNavBtn(qNum);
  saveExamToStorage();
}

function pickMC(qNum, val, el) {
  if (window.getSelection()?.toString()?.trim()) return;
  state.answers[qNum] = val;
  el.closest('.q-options').querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  updateQNavBtn(qNum);
  saveExamToStorage();
}

function toggleCheckbox(qNum, letter, maxCount, el) {
  if (window.getSelection()?.toString()?.trim()) return;
  let arr = [];
  try { arr = JSON.parse(state.answers[qNum] || '[]'); } catch { arr = []; }
  if (arr.includes(letter)) {
    arr = arr.filter(l => l !== letter);
    el.classList.remove('selected');
  } else {
    if (arr.length >= maxCount) return;
    arr.push(letter);
    el.classList.add('selected');
  }
  state.answers[qNum] = JSON.stringify(arr);
  updateQNavBtn(qNum);
  saveExamToStorage();
}

function toggleMultiAnswer(firstNum, letter, maxCount, lastNum) {
  let arr = [];
  try { arr = JSON.parse(state.answers[firstNum] || '[]'); } catch { }
  if (arr.includes(letter)) {
    arr = arr.filter(v => v !== letter);
  } else {
    if (arr.length >= maxCount) return;
    arr.push(letter);
  }
  arr.sort();
  const val = JSON.stringify(arr);
  for (let n = firstNum; n <= lastNum; n++) { state.answers[n] = val; updateQNavBtn(n); }
  document.querySelectorAll(`[data-cluster="${firstNum}"]`).forEach(o =>
    o.classList.toggle('selected', arr.includes(o.dataset.value))
  );
  saveExamToStorage();
}

function pickMatchAnswer(qNum, val) {
  state.answers[qNum] = val;
  updateQNavBtn(qNum);
  // Enforce reuse restriction if enabled
  const sel = document.querySelector(`.match-select[data-qnum="${qNum}"]`);
  if (sel && sel.dataset.reuse === '0') _refreshMatchingSelects(sel.dataset.groupid);
  saveExamToStorage();
}

/* Refresh disabled state of options in a matching-options group (reuse=false) */
function _refreshMatchingSelects(groupId) {
  const usedVals = new Set();
  document.querySelectorAll(`.match-select[data-groupid="${groupId}"]`).forEach(s => {
    const ans = state.answers[parseInt(s.dataset.qnum)];
    if (ans) usedVals.add(ans);
  });
  document.querySelectorAll(`.match-select[data-groupid="${groupId}"]`).forEach(s => {
    const ownAns = state.answers[parseInt(s.dataset.qnum)] || '';
    Array.from(s.options).forEach(opt => {
      if (!opt.value) return;
      opt.disabled = usedVals.has(opt.value) && opt.value !== ownAns;
    });
  });
}

/* ── Drag & drop ──────────────────────────────────────────────────── */
let _dragWord = '';
function dragStart(e, word) { _dragWord = word; e.dataTransfer.effectAllowed = 'copy'; }
function dropWord(e, qNum) {
  e.preventDefault();
  const word = _dragWord;
  if (!word) return;
  setAnswer(qNum, word);
  refreshWordBankZone(qNum, word);
}
function clickChip(qNum, word) {
  setAnswer(qNum, word);
  refreshWordBankZone(qNum, word);
}
function clearDrop(qNum) {
  delete state.answers[qNum];
  const passage = state.passages[state.currentPassageIdx];
  const allQ = getAllQuestionsFromPassage(passage);
  const q = allQ.find(x => x.questionNumber === qNum);
  if (q) {
    const dz = document.querySelector(`.drop-zone[data-qnum="${qNum}"]`);
    if (dz) { dz.classList.remove('filled'); dz.innerHTML = 'Kéo hoặc click'; }
    document.querySelectorAll('.word-chip').forEach(c => {
      if (c.textContent === q.wordBank?.find(w => w === c.textContent)) c.classList.remove('used');
    });
  }
  updateQNavBtn(qNum);
  saveExamToStorage();
}
function refreshWordBankZone(qNum, word) {
  const dz = document.querySelector(`.drop-zone[data-qnum="${qNum}"]`);
  if (dz) {
    dz.classList.add('filled');
    dz.innerHTML = `${escHtml(word)}<span class="clear-drop" onclick="clearDrop(${qNum})">✕</span>`;
  }
  updateQNavBtn(qNum);
}
function initDropZones() {
  document.querySelectorAll('.drop-zone').forEach(dz => {
    // Skip new-style zones (MH, MO, SC, endings) – they manage their own ondrop inline
    if (dz.hasAttribute('ondrop')) return;
    dz.addEventListener('dragover', e => e.preventDefault());
    dz.addEventListener('drop', e => {
      e.preventDefault();
      const qNum = parseInt(dz.dataset.qnum);
      if (_dragWord) { setAnswer(qNum, _dragWord); refreshWordBankZone(qNum, _dragWord); }
    });
  });
}

/* ── Generic clear for drag-drop group types ──────────────────────── */
function clearDragDrop(qNum, groupId) {
  delete state.answers[qNum];
  const dz = document.querySelector(`.drop-zone[data-qnum="${qNum}"]`);
  if (dz) {
    dz.classList.remove('filled');
    dz.innerHTML = dz.classList.contains('rq-heading-drop') ? 'Kéo tiêu đề vào đây'
      : dz.classList.contains('sc-drop') ? 'Kéo từ vào'
        : dz.classList.contains('rq-mo-drop') ? 'Kéo chữ cái vào đây'
          : 'Thả vào đây';
  }
  _refreshGroupChips(groupId);
  updateQNavBtn(qNum);
  saveExamToStorage();
}

// Re-mark chips used/unused based on current answers for a group
function _refreshGroupChips(groupId) {
  const usedVals = new Set();
  document.querySelectorAll(`.drop-zone[data-groupid="${groupId}"]`).forEach(dz => {
    const ans = state.answers[parseInt(dz.dataset.qnum)];
    if (ans) usedVals.add(ans);
  });
  document.querySelectorAll(`[data-groupid="${groupId}"].drag-chip`).forEach(chip => {
    const isUsed = chip.dataset.reuse === '1' ? false : usedVals.has(chip.dataset.value);
    chip.classList.toggle('used', isUsed);
  });
}

/* ── MATCHING OPTIONS drag-drop ───────────────────────────────────── */
function dropMO(e, qNum, groupId) {
  e.preventDefault();
  if (!_dragWord) return;
  setAnswer(qNum, _dragWord);
  _refreshMOZone(qNum, groupId);
  _refreshGroupChips(groupId);
}
function clickMOChip(letter, groupId) {
  // Place chip into first empty drop zone; if all filled, place into last one
  const emptyDz = document.querySelector(`.rq-mo-drop[data-groupid="${groupId}"]:not(.filled)`);
  if (!emptyDz) return;
  const qNum = parseInt(emptyDz.dataset.qnum);
  _dragWord = letter;
  setAnswer(qNum, letter);
  _refreshMOZone(qNum, groupId);
  _refreshGroupChips(groupId);
}
function _refreshMOZone(qNum, groupId) {
  const dz = document.querySelector(`.rq-mo-drop[data-qnum="${qNum}"]`);
  if (!dz) return;
  const letter = state.answers[qNum] || '';
  const passage = state.passages[state.currentPassageIdx];
  const allGroups = getAllGroupsFromPassage(passage);
  let desc = '';
  for (const g of allGroups) {
    if (g.groupType !== 'matching-options' && g.groupType !== 'sentence-endings') continue;
    // Match by groupId to avoid cross-group description contamination
    const gId = 'mog-' + (g.questions || []).map(q => q.questionNumber).join('-');
    if (gId !== groupId) continue;
    if (g.groupType === 'sentence-endings' && g.endingsConfig?.endings?.length) {
      desc = g.endingsConfig.endings.find(e => e.letter === letter)?.text || '';
    } else {
      const idx = letter.charCodeAt(0) - 65;
      desc = (g.matchingOptions || [])[idx] || '';
    }
    break;
  }
  const short = desc.length > 30 ? desc.slice(0, 30) + '…' : desc;
  dz.classList.add('filled');
  dz.innerHTML = `<strong>${escHtml(letter)}</strong>${short && short.length > 1 ? '. ' + escHtml(short) : ''}<span class="clear-drop" onclick="clearDragDrop(${qNum},'${groupId}')">✕</span>`;
  updateQNavBtn(qNum);
}

/* ── MATCHING HEADINGS drag-drop ──────────────────────────────────── */
function dropMH(e, qNum, groupId) {
  e.preventDefault();
  if (!_dragWord) return;
  setAnswer(qNum, _dragWord);
  _refreshMHZone(qNum, groupId);
  _refreshGroupChips(groupId);
}
function clickMHChip(numeral, groupId) {
  const emptyDz = document.querySelector(`.rq-heading-drop[data-groupid="${groupId}"]:not(.filled)`);
  if (!emptyDz) return;
  const qNum = parseInt(emptyDz.dataset.qnum);
  _dragWord = numeral;
  setAnswer(qNum, numeral);
  _refreshMHZone(qNum, groupId);
  _refreshGroupChips(groupId);
}
function _refreshMHZone(qNum, groupId) {
  const passage = state.passages[state.currentPassageIdx];
  const allGroups = getAllGroupsFromPassage(passage);
  let headingText = '';
  for (const g of allGroups) {
    if (g.groupType === 'matching-headings') {
      const h = g.headingsConfig?.headings?.find(x => x.numeral === state.answers[qNum]);
      if (h) { headingText = h.text; break; }
    }
  }
  const dz = document.querySelector(`.rq-heading-drop[data-qnum="${qNum}"]`);
  if (!dz) return;
  const numeral = state.answers[qNum] || '';
  const short = headingText.length > 40 ? headingText.slice(0, 40) + '…' : headingText;
  dz.classList.add('filled');
  dz.innerHTML = `<em>${escHtml(numeral)}</em>${short ? '. ' + escHtml(short) : ''}<span class="clear-drop" onclick="clearDragDrop(${qNum},'${groupId}')">✕</span>`;
  updateQNavBtn(qNum);
}

/* ── SUMMARY COMPLETION drag-drop ─────────────────────────────────── */
function dropSC(e, qNum, groupId) {
  e.preventDefault();
  if (!_dragWord) return;
  setAnswer(qNum, _dragWord);
  _refreshSCZone(qNum, groupId);
  _refreshGroupChips(groupId);
}
function clickSCChip(word, groupId) {
  const emptyDz = document.querySelector(`.sc-drop[data-groupid="${groupId}"]:not(.filled)`);
  if (!emptyDz) return;
  const qNum = parseInt(emptyDz.dataset.qnum);
  _dragWord = word;
  setAnswer(qNum, word);
  _refreshSCZone(qNum, groupId);
  _refreshGroupChips(groupId);
}
function _refreshSCZone(qNum, groupId) {
  const dz = document.querySelector(`.sc-drop[data-qnum="${qNum}"]`);
  if (!dz) return;
  const word = state.answers[qNum] || '';
  dz.classList.add('filled');
  dz.innerHTML = `${escHtml(word)}<span class="clear-drop" onclick="clearDragDrop(${qNum},'${groupId}')">✕</span>`;
  updateQNavBtn(qNum);
}


/* ── Restore saved answers back into DOM after re-render ──────────── */
function restoreAnswers(isReview) {
  if (isReview) return;
  const groupIdsRefreshed = new Set();
  Object.entries(state.answers).forEach(([qNumStr, val]) => {
    if (!val) return;
    const qNum = parseInt(qNumStr);

    // 1. Text inputs / textareas
    const inp = document.querySelector(`input[data-qnum="${qNum}"], textarea[data-qnum="${qNum}"]`);
    if (inp) { inp.value = val; return; }

    // 2. Radio / TFNG / Checkbox inside question container
    const container = document.getElementById(`q${qNum}`);
    if (container) {
      const radios = container.querySelectorAll('.radio-opt');
      if (radios.length) {
        radios.forEach(o => {
          const letter = (o.querySelector('.radio-letter')?.textContent || '').trim().replace('.', '');
          o.classList.toggle('selected', letter === val);
        });
        return;
      }
      const tfng = container.querySelectorAll('.tfng-opt');
      if (tfng.length) {
        const normVal = val.toUpperCase();
        tfng.forEach(o => o.classList.toggle('selected', o.textContent.trim().toUpperCase() === normVal));
        return;
      }
      const cbs = container.querySelectorAll('.checkbox-opt');
      if (cbs.length) {
        let arr = []; try { arr = JSON.parse(val); } catch {}
        cbs.forEach(o => {
          const letter = (o.querySelector('.cb-letter')?.textContent || '').trim().replace('.', '');
          o.classList.toggle('selected', arr.includes(letter));
        });
        return;
      }
    }

    // 3. Multi-answer-group cluster (options have data-cluster="firstNum")
    const clusterOpts = document.querySelectorAll(`[data-cluster="${qNum}"]`);
    if (clusterOpts.length) {
      let arr = []; try { arr = JSON.parse(val); } catch {}
      clusterOpts.forEach(o => o.classList.toggle('selected', arr.includes(o.dataset.value)));
      return;
    }

    // 4. Matching-options drop zone
    const moDz = document.querySelector(`.rq-mo-drop[data-qnum="${qNum}"]`);
    if (moDz) {
      const groupId = moDz.dataset.groupid;
      _refreshMOZone(qNum, groupId);
      if (!groupIdsRefreshed.has(groupId)) { groupIdsRefreshed.add(groupId); _refreshGroupChips(groupId); }
      return;
    }

    // 4. Matching-headings drop zone
    const mhDz = document.querySelector(`.rq-heading-drop[data-qnum="${qNum}"]`);
    if (mhDz) {
      const groupId = mhDz.dataset.groupid;
      _refreshMHZone(qNum, groupId);
      if (!groupIdsRefreshed.has(groupId)) { groupIdsRefreshed.add(groupId); _refreshGroupChips(groupId); }
      return;
    }

    // 5. Summary-completion drop zone
    const scDz = document.querySelector(`.sc-drop[data-qnum="${qNum}"]`);
    if (scDz) {
      const groupId = scDz.dataset.groupid;
      _refreshSCZone(qNum, groupId);
      if (!groupIdsRefreshed.has(groupId)) { groupIdsRefreshed.add(groupId); _refreshGroupChips(groupId); }
      return;
    }

    // 6. Generic word-bank drop zone
    const wbDz = document.querySelector(`.drop-zone[data-qnum="${qNum}"]`);
    if (wbDz) {
      wbDz.classList.add('filled');
      wbDz.innerHTML = `${escHtml(val)}<span class="clear-drop" onclick="clearDrop(${qNum})">✕</span>`;
      document.querySelectorAll('.word-chip').forEach(c =>
        c.classList.toggle('used', c.textContent.trim() === val));
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTION NAV FOOTER
══════════════════════════════════════════════════════════════════════ */
function buildQNavFooter() {
  const nav = document.getElementById('q-nav-scroll');
  if (!nav) return;
  const allNums = state.passages.flatMap(p => getAllQuestionsFromPassage(p).map(q => q.questionNumber));
  nav.innerHTML = allNums.map(n =>
    `<button class="q-nav-btn" id="qnav-${n}" onclick="jumpToQuestion(${n})">${n}</button>`
  ).join('');
}

function updateQNavFooter() {
  state.passages.forEach(p => {
    getAllQuestionsFromPassage(p).forEach(q => updateQNavBtn(q.questionNumber));
  });
}

function updateQNavBtn(qNum) {
  const btn = document.getElementById(`qnav-${qNum}`);
  if (!btn) return;
  const ans = state.answers[qNum];
  const answered = ans !== undefined && ans !== '' && ans !== '[]';
  btn.classList.toggle('answered', answered);
}

function jumpToQuestion(qNum) {
  // Find which passage contains this question
  let pIdx = state.currentPassageIdx;
  state.passages.forEach((p, i) => {
    if (getAllQuestionsFromPassage(p).some(q => q.questionNumber === qNum)) pIdx = i;
  });
  if (pIdx !== state.currentPassageIdx) switchPassage(pIdx);
  setTimeout(() => {
    const el = document.getElementById(`q${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

/* ══════════════════════════════════════════════════════════════════════
   TIMER
══════════════════════════════════════════════════════════════════════ */
function startTimer() {
  clearInterval(state.timer);
  updateTimerDisplay();
  state.timer = setInterval(() => {
    state.secondsLeft--;
    updateTimerDisplay();
    if (state.secondsLeft % 10 === 0) saveExamToStorage(); // save every 10s, not every second
    if (state.secondsLeft <= 0) {
      clearInterval(state.timer);
      submitExam();
    } else {
      const el = timerEl();
      if (el) {
        el.classList.toggle('danger', state.secondsLeft <= 300);
        el.classList.toggle('warn', state.secondsLeft > 300 && state.secondsLeft <= 600);
      }
    }
  }, 1000);
}
function timerEl() { return document.getElementById('exam-timer'); }
function updateTimerDisplay() {
  const s = state.secondsLeft;
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  const el = document.getElementById('timer-display');
  if (el) el.textContent = `${h}:${m}:${sec}`;
}

/* ══════════════════════════════════════════════════════════════════════
   SUBMIT
══════════════════════════════════════════════════════════════════════ */
function confirmSubmit() {
  const allQ = state.passages.flatMap(p => getAllQuestionsFromPassage(p));
  const unanswered = allQ.filter(q => { const a = state.answers[q.questionNumber]; return !a || a === '' || a === '[]'; }).length;
  const warn = document.getElementById('submit-unanswered-warn');
  if (warn) warn.textContent = unanswered > 0 ? `⚠️ Còn ${unanswered} câu chưa trả lời.` : '';
  openModal('modal-submit');
}

async function submitExam() {
  closeModal('modal-submit');
  clearInterval(state.timer);
  state.submitted = true;
  window.onbeforeunload = null;

  // Show loading overlay
  let overlay = document.getElementById('submit-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'submit-loading-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
    overlay.innerHTML = '<div style="width:48px;height:48px;border:5px solid #fff;border-top-color:#3d8bff;border-radius:50%;animation:spin 1s linear infinite"></div><p style="color:#fff;font-size:16px;font-weight:600;margin:0">Đang nộp bài, vui lòng chờ…</p>';
    if (!document.getElementById('submit-spin-style')) {
      const s = document.createElement('style');
      s.id = 'submit-spin-style';
      s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';

  const hideOverlay = () => { overlay.style.display = 'none'; };

  const controller = new AbortController();
  const submitTimeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await apiFetch('/api/reading/submit', {
      method: 'POST',
      body: JSON.stringify({ attemptId: state.attemptId, answers: state.answers }),
      signal: controller.signal
    });
    clearTimeout(submitTimeout);
    hideOverlay();
    if (!res.success) { showVocabToast('Lỗi nộp bài: ' + res.message); return; }
    clearExamStorage();
    showResult(res.result);
  } catch (e) {
    clearTimeout(submitTimeout);
    hideOverlay();
    // Server may have processed the request even if the network timed out
    openSubmitErrorModal();
  }
}

function openSubmitErrorModal() {
  let m = document.getElementById('modal-submit-error');
  if (!m) {
    m = document.createElement('div');
    m.id = 'modal-submit-error';
    m.className = 'modal-overlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    m.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,.18)">
        <div style="font-size:40px;margin-bottom:12px">⚠️</div>
        <h3 style="font-size:17px;font-weight:700;margin-bottom:8px;color:#1f2937">Kết nối bị gián đoạn</h3>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:20px">
          Bài thi có thể đã được lưu trên server.<br>Kiểm tra lịch sử để xem kết quả.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button onclick="showHistoryModal();document.getElementById('modal-submit-error').remove()"
            style="background:#3d8bff;color:#fff;border:none;padding:10px 20px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer">
            Xem lịch sử
          </button>
          <button onclick="document.getElementById('modal-submit-error').remove();state.submitted=false;submitExam()"
            style="background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;padding:10px 20px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer">
            Nộp lại
          </button>
        </div>
      </div>`;
    document.body.appendChild(m);
  }
  m.style.display = 'flex';
}

function showResult(r) {
  document.getElementById('result-band').textContent = r.bandScore?.toFixed(1) || '–';
  document.getElementById('result-total').textContent = `${r.correctCount}/${r.totalQuestions} câu đúng`;
  document.getElementById('r-correct').textContent = r.correctCount;
  document.getElementById('r-wrong').textContent = r.wrongCount;
  document.getElementById('r-skip').textContent = r.skippedCount;
  document.getElementById('result-band').dataset.attemptId = r.attemptId;
  showScreen('result');
}

function goToReview() {
  const aid = document.getElementById('result-band').dataset.attemptId;
  if (aid) loadReview(aid);
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 5 – REVIEW
══════════════════════════════════════════════════════════════════════ */
async function loadReview(attemptId) {
  try {
    const res = await apiFetch(`/api/reading/attempt/${attemptId}/review`);
    if (!res.success) { showVocabToast('Không tải được bài review'); return; }
    renderReview(res.attempt);
  } catch (e) { showVocabToast('Lỗi tải bài review. Thử lại sau.'); }
}

async function loadReviewByTest(testId) {
  try {
    const histRes = await apiFetch('/api/reading/history');
    const attempts = histRes.history || [];
    const attempt = attempts.find(a => a.testId?._id === testId || a.testId === testId);
    if (attempt) loadReview(attempt._id);
    else showVocabToast('Không tìm thấy lịch sử làm bài', 'info');
  } catch { showVocabToast('Lỗi tải lịch sử'); }
}

function renderReview(attempt) {
  state.isReview = true;
  state.passages = attempt.passages;
  state.currentPassageIdx = 0;
  for (const k in reviewHlCache) delete reviewHlCache[k];

  document.getElementById('review-title').textContent = attempt.testName || 'Review';
  const badge = document.getElementById('review-band-badge');
  if (badge) badge.textContent = `Band: ${attempt.bandScore?.toFixed(1)}`;

  // Build reviewMap: { questionNumber: { userAnswer, correctAnswer, isCorrect, explanation } }
  const reviewMap = {};
  attempt.passages.forEach(p => {
    getAllQuestionsFromPassage(p).forEach(q => {
      reviewMap[q.questionNumber] = {
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect: q.isCorrect,
        explanation: q.explanation
      };
    });
  });
  state.reviewData = { attempt, reviewMap };

  renderPassageTabs('toolbar-passage-tabs-rv', true);
  switchReviewPassage(0);
  buildReviewQNav(attempt, reviewMap);
  showScreen('review');
}

function switchReviewPassage(idx) {
  const rvPassageInner = document.getElementById('review-passage-inner');
  const rvQuestionsInner = document.getElementById('review-questions-inner');

  // Guard: same tab click should not re-render (would erase highlights)
  if (idx === state.currentPassageIdx && rvPassageInner?.innerHTML?.trim()) {
    return;
  }

  // Save both panels' highlights before overwriting
  if (state.currentPassageIdx !== idx) {
    reviewHlCache[state.currentPassageIdx] = {
      passage: rvPassageInner ? rvPassageInner.innerHTML : null,
      questions: rvQuestionsInner ? rvQuestionsInner.innerHTML : null,
    };
  }

  state.currentPassageIdx = idx;
  const p = state.passages[idx];
  if (!p) return;
  const { reviewMap } = state.reviewData;

  const cached = reviewHlCache[idx];
  if (cached !== undefined) {
    if (rvPassageInner) rvPassageInner.innerHTML = cached.passage ?? '';
    if (rvQuestionsInner) rvQuestionsInner.innerHTML = cached.questions ?? '';
  } else {
    if (rvPassageInner) {
      rvPassageInner.innerHTML =
        `<div class="passage-title">${escHtml(p.title)}</div>
     <div class="passage-text">${p.content || ''}</div>`;
    }
    if (rvQuestionsInner) rvQuestionsInner.innerHTML = renderPassageQuestions(p, true, reviewMap);
  }

  // Scroll both panels to top when switching to a new passage
  const rvPassagePanel = document.getElementById('review-passage');
  const rvQPanel = document.getElementById('review-questions');
  if (rvPassagePanel) rvPassagePanel.scrollTop = 0;
  if (rvQPanel) rvQPanel.scrollTop = 0;

  renderPassageTabs('toolbar-passage-tabs-rv', true);
}

function buildReviewQNav(attempt, reviewMap) {
  const nav = document.getElementById('review-q-nav');
  if (!nav) return;
  const allNums = attempt.passages.flatMap(p =>
    getAllQuestionsFromPassage(p).map(q => q.questionNumber)
  );
  nav.innerHTML = allNums.map(n => {
    const r = reviewMap[n];
    const cls = !r?.userAnswer ? 'skipped' : r.isCorrect ? 'correct' : 'wrong';
    return `<button class="q-nav-btn ${cls}" title="Câu ${n}" onclick="jumpToReviewQuestion(${n})">${n}</button>`;
  }).join('');
}

function jumpToReviewQuestion(qNum) {
  // Find which passage contains this question
  let pIdx = state.currentPassageIdx;
  state.passages.forEach((p, i) => {
    const allQ = getAllQuestionsFromPassage(p);
    if (allQ.some(q => q.questionNumber === qNum)) pIdx = i;
  });
  // Switch passage if needed, then scroll
  if (pIdx !== state.currentPassageIdx) {
    switchReviewPassage(pIdx);
    // Wait for DOM to render before scrolling
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(`q${qNum}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
  } else {
    const el = document.getElementById(`q${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 6 – RETRY PASSAGE
══════════════════════════════════════════════════════════════════════ */
let _retryState = null;

function retryCurrentPassage() {
  if (!state.isReview) return;
  setTool('none');   // reset highlight/dict cursor before entering retry mode
  const passageIdx = state.currentPassageIdx;
  const passage = state.passages[passageIdx];
  if (!passage) return;

  // Capture correct answers before cloning (review data has them on each question)
  const correctMap = {};
  getAllQuestionsFromPassage(passage).forEach(q => {
    correctMap[q.questionNumber] = q.correctAnswer;
  });

  // Deep-clone and strip student-specific fields so questions render in exam mode
  const cleanPassage = JSON.parse(JSON.stringify(passage));
  getAllQuestionsFromPassage(cleanPassage).forEach(q => {
    delete q.userAnswer;
    delete q.isCorrect;
  });

  // Stash full state for restoration
  _retryState = {
    passages: state.passages,
    answers: state.answers,
    isReview: state.isReview,
    currentPassageIdx: passageIdx,
    correctMap,
  };

  // Switch to retry state
  state.passages = [cleanPassage];
  state.answers = {};
  state.isReview = false;
  state.currentPassageIdx = 0;

  const label = passage.title
    || (passage.category?.replace('passage', 'Passage '))
    || `Passage ${passageIdx + 1}`;
  document.getElementById('retry-title').textContent = `Làm lại: ${label}`;

  const badge = document.getElementById('retry-score-badge');
  if (badge) badge.style.display = 'none';

  document.getElementById('retry-footer-btns').innerHTML = `
    <button class="btn-ghost" onclick="closeRetry()">← Về review</button>
    <button class="btn-primary" onclick="submitRetry()">Kiểm tra đáp án</button>`;

  document.getElementById('retry-passage-inner').innerHTML =
    `<div class="passage-title">${escHtml(cleanPassage.title)}</div>
     <div class="passage-text">${cleanPassage.content || ''}</div>`;

  document.getElementById('retry-questions-inner').innerHTML =
    renderPassageQuestions(cleanPassage, false, {});

  // Q-nav for retry
  const nav = document.getElementById('retry-q-nav');
  if (nav) {
    nav.innerHTML = getAllQuestionsFromPassage(cleanPassage)
      .map(q => `<button class="q-nav-btn" onclick="jumpToRetryQuestion(${q.questionNumber})">${q.questionNumber}</button>`)
      .join('');
  }

  initDropZones();
  showScreen('retry');
}

function jumpToRetryQuestion(qNum) {
  const el = document.getElementById(`q${qNum}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeRetry() {
  const fromPractice = _retryState?.isPractice || _practiceMode;
  _clearPracticeTimer();
  _hidePracticeHUD();
  if (fromPractice) clearPracticeStorage();
  window.onbeforeunload = null;
  if (_retryState) {
    if (!fromPractice) {
      state.passages = _retryState.passages;
      state.answers = _retryState.answers;
      state.isReview = _retryState.isReview;
      state.currentPassageIdx = _retryState.currentPassageIdx;
    }
    _retryState = null;
  }
  _practiceMode = false;
  if (fromPractice) {
    // Clear list so setReadingMode reloads it fresh
    const listEl = document.getElementById('practice-passage-list');
    if (listEl) listEl.innerHTML = '';
    loadTests(true);
    setTimeout(() => setReadingMode('lele'), 100);
  } else {
    showScreen('review');
  }
}

function submitRetry() {
  if (!_retryState) return;
  const passage = state.passages[0];
  const allQ = getAllQuestionsFromPassage(passage);
  const { correctMap } = _retryState;
  let correct = 0, wrong = 0, skipped = 0;
  const retryReviewMap = {};

  allQ.forEach(q => {
    const qNum = q.questionNumber;
    const userAns = state.answers[qNum] || '';
    const correctAns = correctMap[qNum] || '';
    let isCorrect = false;

    if (!userAns || userAns === '[]') {
      skipped++;
    } else if (q.type === 'multi-answer-group' || (q.type !== 'checkbox' && userAns.startsWith('['))) {
      // multi-answer cluster: userAns là JSON array, correctAns là 1 chữ cái
      try {
        const uaArr = JSON.parse(userAns).map(x => x.toUpperCase().trim());
        isCorrect = uaArr.includes(correctAns.toUpperCase().trim());
      } catch { isCorrect = false; }
      if (isCorrect) correct++; else wrong++;
    } else if (q.type === 'checkbox') {
      try {
        const a = JSON.parse(userAns).sort();
        const b = JSON.parse(correctAns || '[]').sort();
        isCorrect = JSON.stringify(a) === JSON.stringify(b);
      } catch { isCorrect = false; }
      if (isCorrect) correct++; else wrong++;
    } else {
      const userLow = userAns.trim().toLowerCase();
      const alts = correctAns.split(/\s*\/\s*/).map(s => s.toLowerCase().trim()).filter(Boolean);
      isCorrect = alts.length > 0 ? alts.some(a => a === userLow) : false;
      if (isCorrect) correct++; else wrong++;
    }

    retryReviewMap[qNum] = {
      userAnswer: userAns,
      correctAnswer: correctAns,
      isCorrect,
      explanation: q.explanation || '',
    };
  });

  const total = allQ.length;
  const pct = total ? Math.round(correct / total * 100) : 0;
  const color = pct >= 70 ? '#166534' : pct >= 40 ? '#92400e' : '#991b1b';
  const bg    = pct >= 70 ? '#f0fdf4' : pct >= 40 ? '#fffbeb' : '#fef2f2';
  const border= pct >= 70 ? '#86efac' : pct >= 40 ? '#fde68a' : '#fca5a5';

  // Stop stopwatch, build time display for practice mode
  const fromPractice = _retryState?.isPractice;
  if (fromPractice) { clearPracticeStorage(); window.onbeforeunload = null; }
  let timeLine = '';
  if (fromPractice) {
    const elapsed = _stopPracticeTimer();
    const tm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ts = String(elapsed % 60).padStart(2, '0');
    const perQ = total ? Math.round(elapsed / total) : 0;
    const encourage = pct >= 80 ? 'Xuất sắc! Tiếp tục phát huy nhé!'
                    : pct >= 60 ? 'Khá tốt! Ôn lại phần chưa đúng.'
                    : pct >= 40 ? 'Cần luyện tập thêm một chút!'
                    : 'Đừng nản, luyện thêm là sẽ tiến bộ!';
    const speed = perQ <= 45 ? '⚡ Rất nhanh' : perQ <= 75 ? 'Ổn' : 'Cần tăng tốc';
    timeLine = `<div style="margin-top:8px;font-size:12px;color:#6b7280;font-weight:400;display:flex;gap:12px;flex-wrap:wrap;align-items:center">
      <span>⏱ Thời gian: <strong style="color:#374151">${tm}:${ts}</strong></span>
      <span>${speed} · ${perQ}s/câu</span>
      <span style="color:${color};font-style:italic">${encourage}</span>
    </div>`;
  }

  const qi = document.getElementById('retry-questions-inner');
  if (qi) {
    qi.innerHTML =
      `<div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:14px;font-weight:600;color:${color}">
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
          <span>Kết quả: <strong>${correct}/${total}</strong> câu đúng (${pct}%)</span>
          <span style="color:#16a34a">● Đúng: ${correct}</span>
          <span style="color:#dc2626">● Sai: ${wrong}</span>
          <span style="color:#9ca3af">● Bỏ qua: ${skipped}</span>
        </div>${timeLine}
      </div>`
      + renderPassageQuestions(passage, true, retryReviewMap);
  }

  const badge = document.getElementById('retry-score-badge');
  if (badge) { badge.textContent = `${correct}/${total} câu đúng`; badge.style.display = ''; }

  document.getElementById('retry-footer-btns').innerHTML = fromPractice
    ? `<button class="btn-ghost" onclick="closeRetry()">← Chọn bài khác</button>
       <button class="btn-primary" onclick="retryReset()">🔁 Làm lại bài này</button>`
    : `<button class="btn-ghost" onclick="closeRetry()">Quay lại review</button>
       <button class="btn-primary" onclick="retryReset()">🔁 Làm lại từ đầu</button>`;
}

function retryReset() {
  if (!_retryState) return;
  const isPractice = _retryState.isPractice;
  const practicePassageId = _retryState.practicePassageId;
  const practiceCategory  = _retryState.practiceCategory;
  if (isPractice) {
    _retryState = null;
    _practiceMode = false;
    startPractice(practicePassageId, practiceCategory);
  } else {
    closeRetry();
    retryCurrentPassage();
  }
}

/* ══════════════════════════════════════════════════════════════════════
   HISTORY MODAL
══════════════════════════════════════════════════════════════════════ */
async function showHistoryModal() {
  try {
    const res = await apiFetch('/api/reading/history');
    const history = res.history || [];
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = history.map(h => `
      <tr>
        <td>${escHtml(h.testId?.name || '–')}</td>
        <td>${new Date(h.endTime).toLocaleDateString('vi-VN')}</td>
        <td>${fmtDuration(h.duration)}</td>
        <td>${h.totalQuestions}</td>
        <td style="color:#43a047;font-weight:600">${h.correctCount}</td>
        <td style="color:#e53935;font-weight:600">${h.wrongCount}</td>
        <td style="color:#9ca3af">${h.skippedCount}</td>
        <td class="band-cell">${h.bandScore?.toFixed(1)}</td>
        <td><button class="btn-review-sm" onclick="loadReview('${h._id}');closeModal('modal-history')">Xem lại</button></td>
      </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:#9ca3af">Chưa có lịch sử</td></tr>';
    openModal('modal-history');
  } catch { showVocabToast('Lỗi tải lịch sử'); }
}

/* ══════════════════════════════════════════════════════════════════════
   DICTIONARY (review only)
══════════════════════════════════════════════════════════════════════ */
let _dictWord = '';
let _dictCurrentData = null;
const _dictCache = new Map(); // word.toLowerCase() → { phonetic, meanings: [{partOfSpeech, definitions:[{viMeaning,enDefinition,example}]}] }

document.addEventListener('dblclick', e => {
  if (state.tool !== 'dict' || (!state.isReview && !_practiceMode && !_retryState)) return;
  const sel = window.getSelection()?.toString().trim();
  if (!sel || sel.split(' ').length > 3) return;
  lookupWord(sel, e.clientX, e.clientY);
});

async function lookupWord(word, x, y) {
  const key = word.toLowerCase();
  _dictWord = word;
  document.getElementById('dict-word').textContent = word;
  document.getElementById('dict-phonetic').textContent = '';
  positionDictPopup(x, y);
  document.getElementById('dict-popup').classList.remove('hidden');

  if (_dictCache.has(key)) {
    renderDictPopup(_dictCache.get(key));
    return;
  }

  document.getElementById('dict-body').innerHTML = '<div class="dict-loading">Đang tra...</div>';

  const [dictRes, transRes] = await Promise.allSettled([
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`).then(r => r.ok ? r.json() : null),
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(word)}`).then(r => r.json())
  ]);

  let phonetic = '';
  let meanings = [];

  if (dictRes.status === 'fulfilled' && Array.isArray(dictRes.value)) {
    const entry = dictRes.value[0];
    phonetic = entry?.phonetic || entry?.phonetics?.find(p => p.text)?.text || '';
    let defCount = 0;
    for (const m of (entry?.meanings || [])) {
      if (defCount >= 4) break;
      const defs = [];
      for (const d of (m.definitions || [])) {
        if (defCount >= 4) break;
        defs.push({ enDefinition: d.definition || '', example: d.example ? `"${d.example}"` : '' });
        defCount++;
      }
      if (defs.length) meanings.push({ partOfSpeech: m.partOfSpeech || '', definitions: defs });
    }
  }

  // Translate each definition to Vietnamese in parallel
  const allDefs = meanings.flatMap(m => m.definitions);
  if (allDefs.length) {
    const viResults = await Promise.all(allDefs.map(d =>
      fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(d.enDefinition)}`)
        .then(r => r.json()).then(j => j?.[0]?.[0]?.[0] || d.enDefinition).catch(() => d.enDefinition)
    ));
    let i = 0;
    for (const m of meanings) for (const d of m.definitions) d.viMeaning = viResults[i++];
  }

  // Fallback to word-level translation when dictionary API has no results
  if (!meanings.length) {
    const viWord = (transRes.status === 'fulfilled' ? transRes.value?.[0]?.[0]?.[0] : null) || 'Không tìm thấy';
    meanings = [{ partOfSpeech: '', definitions: [{ viMeaning: viWord, enDefinition: '', example: '' }] }];
  }

  const cached = { phonetic, meanings };
  _dictCache.set(key, cached);

  if (_dictWord.toLowerCase() === key) renderDictPopup(cached);
}

function renderDictPopup(data) {
  _dictCurrentData = data;
  document.getElementById('dict-phonetic').textContent = data.phonetic;
  const body = document.getElementById('dict-body');
  let html = '';
  let defIdx = 0;
  for (let mi = 0; mi < data.meanings.length; mi++) {
    const m = data.meanings[mi];
    if (m.partOfSpeech) html += `<div class="dict-pos-label">${escHtml(m.partOfSpeech)}</div>`;
    for (let di = 0; di < m.definitions.length; di++) {
      const d = m.definitions[di];
      defIdx++;
      html += `<div class="dict-def-item">
        <div class="dict-def-vi"><span class="dict-def-num">${defIdx}.</span> ${escHtml(d.viMeaning)}</div>
        ${d.example ? `<div class="dict-def-example">${escHtml(d.example)}</div>` : ''}
        <button class="btn-save-def" onclick="saveVocab(${mi},${di})">＋ Lưu từ</button>
      </div>`;
    }
  }
  body.innerHTML = html;
}

function positionDictPopup(x, y) {
  const popup = document.getElementById('dict-popup');
  popup.style.left = Math.max(8, Math.min(x, window.innerWidth - 320)) + 'px';
  popup.style.top = Math.max(8, Math.min(y + 12, window.innerHeight - 380)) + 'px';
}

function closeDictPopup() { document.getElementById('dict-popup').classList.add('hidden'); }

/* ══════════════════════════════════════════════════════════════════════
   TRANSLATE POPUP  (T key / toolbar button)
   Toolbar buttons use onmousedown=preventDefault to keep selection alive
   so window.getSelection() works the same for both code paths.
══════════════════════════════════════════════════════════════════════ */
async function translateSelected() {
  if (!state.isReview && !_practiceMode && !_retryState) return;

  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : '';
  if (!text) return;

  // Position popup: below selection when there's space, else above
  const PW = 350, PH = 180;
  let lx = window.innerWidth / 2 - PW / 2;
  let ly = 200;
  try {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    lx = rect.left + rect.width / 2 - PW / 2;
    // rect coords are viewport-relative; popup is position:fixed — no scrollY offset needed
    ly = (window.innerHeight - rect.bottom >= PH + 16)
      ? rect.bottom + 10
      : rect.top - PH - 10;
  } catch (e) {}

  const srcEl = document.getElementById('translate-src');
  const resEl = document.getElementById('translate-result');
  srcEl.textContent = text;
  resEl.innerHTML = '<span class="translate-loading">Đang dịch...</span>';
  positionTranslatePopup(lx, ly);
  document.getElementById('translate-popup').classList.remove('hidden');

  // Google Translate free endpoint — limit query to 500 chars to avoid URL overflow
  const query = text.length > 500 ? text.slice(0, 500) : text;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const translated = data?.[0]?.map(s => s?.[0]).filter(Boolean).join('') || 'Không dịch được';
    resEl.textContent = translated;
  } catch (e) {
    resEl.textContent = 'Lỗi kết nối';
  }
}

function positionTranslatePopup(x, y) {
  const popup = document.getElementById('translate-popup');
  const PW = 350;
  popup.style.left = Math.max(8, Math.min(x, window.innerWidth - PW - 8)) + 'px';
  popup.style.top = Math.max(8, y) + 'px';
}

function closeTranslatePopup() { document.getElementById('translate-popup').classList.add('hidden'); }

// Close translate popup when clicking outside it (but not on the toolbar buttons)
document.addEventListener('mousedown', e => {
  const popup = document.getElementById('translate-popup');
  if (popup && !popup.classList.contains('hidden')) {
    if (!popup.contains(e.target) &&
        e.target.id !== 'tool-translate-rv' &&
        e.target.id !== 'tool-translate-rt' &&
        !e.target.closest('#tool-translate-rv') &&
        !e.target.closest('#tool-translate-rt')) {
      closeTranslatePopup();
    }
  }
});

function speakDictWord() {
  const w = document.getElementById('dict-word').textContent;
  if (w && window.speechSynthesis) {
    const u = new SpeechSynthesisUtterance(w);
    u.lang = 'en-US';
    speechSynthesis.speak(u);
  }
}

async function saveVocab(mi, di) {
  if (!_dictCurrentData) return;
  const m = _dictCurrentData.meanings[mi];
  const d = m.definitions[di];
  openVocabBookPicker({
    word: _dictWord,
    meaning: d.viMeaning,
    example: d.example,
    phonetic: _dictCurrentData.phonetic,
    partOfSpeech: m.partOfSpeech,
    source: 'reading'
  });
}

/* ── Vocab Book Picker Modal ─────────────────────────────────────── */
let _pendingVocabWord = null;

async function openVocabBookPicker(wordData) {
  _pendingVocabWord = wordData;
  const modal = document.getElementById('modal-vocab-picker');
  const listEl = document.getElementById('vocab-book-list');
  listEl.innerHTML = '<div style="text-align:center;padding:16px;color:#9ca3af">Đang tải sổ...</div>';
  modal.classList.remove('hidden');
  try {
    const res = await apiFetch('/api/vocabbook/');
    const books = res.books || [];
    if (!books.length) {
      listEl.innerHTML = '<div style="text-align:center;padding:16px;color:#9ca3af">Chưa có sổ nào</div>';
      return;
    }
    listEl.innerHTML = books.map(b =>
      `<div class="vb-pick-item" onclick="saveWordToBook('${b._id}')">
        <span class="vb-pick-emoji">${b.emoji || '📘'}</span>
        <div class="vb-pick-info">
          <div class="vb-pick-name">${escHtml(b.name)}</div>
          <div class="vb-pick-count">${b.totalWords} từ</div>
        </div>
        <span class="vb-pick-arrow">›</span>
      </div>`
    ).join('');
  } catch (e) {
    const isColdStart = e.message === 'server-cold-start';
    listEl.innerHTML = `<div style="text-align:center;padding:16px;color:${isColdStart ? '#f59e0b' : '#e53935'}">
      ${isColdStart
        ? '🔄 Server đang khởi động,<br>vui lòng thử lại sau vài giây.'
        : 'Lỗi tải sổ từ vựng'}
    </div>`;
  }
}

async function createNewBookAndSave() {
  const nameInput = document.getElementById('new-book-name');
  const name = nameInput?.value?.trim();
  if (!name) { if (nameInput) nameInput.focus(); return; }
  try {
    const res = await apiFetch('/api/vocabbook/', {
      method: 'POST',
      body: JSON.stringify({ name, emoji: '📘', color: '#3d8bff' })
    });
    if (!res.success) { showVocabToast(res.message); return; }
    if (nameInput) nameInput.value = '';
    await saveWordToBook(res.book._id);
  } catch (e) {
    showVocabToast(e.message === 'server-cold-start' ? 'Server đang khởi động, thử lại sau.' : 'Lỗi tạo sổ mới');
  }
}

async function saveWordToBook(bookId) {
  if (!_pendingVocabWord) return;
  try {
    const res = await apiFetch(`/api/vocabbook/${bookId}/words`, {
      method: 'POST',
      body: JSON.stringify(_pendingVocabWord)
    });
    closeModal('modal-vocab-picker');
    const msg = res.success
      ? `✓ Đã lưu "${_pendingVocabWord.word}" vào sổ`
      : `ℹ️ ${res.message}`;
    showVocabToast(msg, res.success ? 'success' : 'info');
    _pendingVocabWord = null;
  } catch { showVocabToast('Lỗi lưu từ'); }
}

function showVocabToast(msg, type = 'success') {
  const toast = document.getElementById('vocab-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `vocab-toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════════════════════════════════════
   HIGHLIGHT
══════════════════════════════════════════════════════════════════════ */
function setTool(tool) {
  const next = (tool !== 'none' && state.tool === tool) ? 'none' : tool;
  state.tool = next;
  ['tool-hl', 'tool-hl-rv', 'tool-hl-rt'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.classList.toggle('active', next === 'highlight');
  });
  ['tool-dict', 'tool-dict-rt'].forEach(id => {
    const td = document.getElementById(id);
    if (td) td.classList.toggle('active', next === 'dict');
  });
  document.body.style.cursor = next === 'highlight' ? 'crosshair' : 'default';
  document.body.classList.toggle('tool-hl', next === 'highlight');
}

document.addEventListener('mouseup', e => {
  if (state.tool !== 'highlight') return;
  const inPassage = e.target.closest('.split-passage') || e.target.closest('.review-passage');
  const inQuestions = e.target.closest('.split-questions') || e.target.closest('.review-q-panel');
  if (!inPassage && !inQuestions) return;
  // Don't highlight when clicking on interactive inputs
  if (e.target.closest('input, textarea, select, button, .drag-chip, .drop-zone')) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.className = 'hl';
  try { range.surroundContents(span); } catch { }
  sel.removeAllRanges();
});

/* ══════════════════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════════════════ */
function toggleSettings() {
  document.getElementById('settings-panel').classList.toggle('hidden');
}
function toggleEyeProtection() {
  document.body.classList.toggle('eye-protection',
    document.getElementById('toggle-eye').checked);
}
function setFontSize(s) {
  const map = { S: '13px', M: '15px', L: '17px' };
  document.documentElement.style.setProperty('--reading-font-size', map[s]);
  document.querySelectorAll('.fs-btn').forEach(b => b.classList.toggle('active', b.textContent === s));
}

/* ══════════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════════════════════ */
function handleKeyShortcuts(e) {
  if (e.key === 'Escape') {
    closeDictPopup();
    closeTranslatePopup();
    closeModal('modal-vocab-picker');
    const sp = document.getElementById('settings-panel');
    if (sp && !sp.classList.contains('hidden')) sp.classList.add('hidden');
    setTool('none');
    return;
  }
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  if (e.key === 'h' || e.key === 'H') setTool('highlight');
  if (e.key === 'd' || e.key === 'D') setTool('dict');
  if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.altKey && !e.metaKey) translateSelected();
  if (['1', '2', '3'].includes(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
    const idx = parseInt(e.key) - 1;
    if (state.isReview && state.passages[idx]) switchReviewPassage(idx);
    else if (!state.isReview && state.passages[idx]) switchPassage(idx);
  }
}

/* ══════════════════════════════════════════════════════════════════════
   CONFIRM / EXIT MODALS
══════════════════════════════════════════════════════════════════════ */
function confirmExit() { openModal('modal-exit'); }
function forceExit() {
  closeModal('modal-exit');
  saveExamToStorage();   // flush latest answers before leaving
  clearInterval(state.timer);
  window.onbeforeunload = null;
  loadTests(true);
}

/* ══════════════════════════════════════════════════════════════════════
   RESIZABLE DIVIDER
══════════════════════════════════════════════════════════════════════ */
function initDividerDrag(dividerId, leftId, rightId) {
  const divider = document.getElementById(dividerId);
  const left = document.getElementById(leftId);
  const right = document.getElementById(rightId);
  if (!divider || !left || !right) return;
  let dragging = false, startX = 0, startW = 0;
  divider.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX; startW = left.offsetWidth;
    divider.classList.add('dragging');
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const newW = Math.max(240, Math.min(startW + e.clientX - startX, window.innerWidth - 300));
    left.style.width = newW + 'px';
  });
  document.addEventListener('mouseup', () => {
    dragging = false; divider.classList.remove('dragging');
    document.body.style.userSelect = '';
  });
}

/* ══════════════════════════════════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════════════════════════════════ */
function openModal(id) { const m = document.getElementById(id); if (m) { m.classList.remove('hidden'); } }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.add('hidden'); }

/* ══════════════════════════════════════════════════════════════════════
   AUTH HELPERS (uses auth.js)
══════════════════════════════════════════════════════════════════════ */
function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return false; }
  return true;
}
function logout() {
  localStorage.removeItem('token'); localStorage.removeItem('userName');
  window.location.href = 'login.html';
}
async function apiFetch(url, opts = {}) {
  const token = localStorage.getItem('token');
  // Prepend API base for relative paths
  const fullUrl = url.startsWith('/api/') ? API + url.slice(4) : url;
  const res = await fetch(fullUrl, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
  if (!res.ok) {
    const isColdStart = res.status === 502 || res.status === 503;
    throw new Error(isColdStart ? 'server-cold-start' : `HTTP ${res.status}`);
  }
  return res.json();
}

/* ══════════════════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════════════════ */
function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Like escHtml but also converts \n → <br> (for explanation text)
function escHtmlNl(str) {
  return escHtml(str).replace(/\n/g, '<br>');
}
function fmtDuration(s) {
  if (!s) return '–';
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/* ── Click outside to close settings panel ──────────────────────────── */
document.addEventListener('click', e => {
  const panel = document.getElementById('settings-panel');
  if (!panel || panel.classList.contains('hidden')) return;
  const btn = document.getElementById('btn-settings');
  if (!e.target.closest('#settings-panel') && !btn?.contains(e.target) && e.target !== btn) {
    panel.classList.add('hidden');
  }
});