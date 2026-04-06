/* ═══════════════════════════════════════════════════════
   writing.js  –  EnglishWithDan Writing Module
═══════════════════════════════════════════════════════ */

const API = 'https://englishwithdan.onrender.com';

// ──────────────────────────────────────────────────────
// Auth helpers
// ──────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error('Server không phản hồi đúng. Vui lòng thử lại.');
  }
  return JSON.parse(text);
}

// ──────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────
const state = {
  exam: null,
  currentTask: 1,
  answers: { 1: '', 2: '' },
  flags: { 1: false, 2: false },
  timerInterval: null,
  totalSeconds: 0,
  secondsLeft: 0,
  timerHidden: false,
  currentAttemptId: null,    // set after submit
  currentAttemptData: null   // for download
};

// ──────────────────────────────────────────────────────
// Screen management
// ──────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ──────────────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────────────
(function init() {
  const token = getToken();
  if (!token) { window.location.href = 'index.html'; return; }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user.username || '');

  document.querySelectorAll('#user-name-key, #user-name-done, #user-name-history, #user-name-samples')
    .forEach(el => { if (el) el.textContent = `👋 ${displayName}`; });
})();

// ──────────────────────────────────────────────────────
// Format key input  (XXXX-XXXX)
// ──────────────────────────────────────────────────────
function formatKey(input) {
  let v = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
  input.value = v;
}

// ──────────────────────────────────────────────────────
// Verify key & load exam
// ──────────────────────────────────────────────────────
async function startExam() {
  const key = document.getElementById('key-input').value.trim();
  const errEl = document.getElementById('key-error');
  errEl.textContent = '';

  if (!key || key.replace('-', '').length < 8) {
    errEl.textContent = 'Vui lòng nhập mã truy cập (8 ký tự)';
    return;
  }

  const btn = document.getElementById('btn-start');
  btn.disabled = true;
  btn.textContent = 'Đang kiểm tra...';

  try {
    const data = await apiFetch('/api/writing/verify-key', {
      method: 'POST',
      body: JSON.stringify({ key })
    });

    if (!data.success) {
      errEl.textContent = data.message || 'Mã không hợp lệ';
      return;
    }

    state.exam = data.exam;
    state.answers = { 1: '', 2: '' };
    state.flags   = { 1: false, 2: false };
    state.currentTask = 1;

    launchExam();
  } catch (e) {
    errEl.textContent = e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Bắt đầu →';
  }
}

// ──────────────────────────────────────────────────────
// Launch exam UI
// ──────────────────────────────────────────────────────
function launchExam() {
  const exam = state.exam;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user.username || 'Candidate');

  // Top bar candidate info
  document.getElementById('exam-candidate').textContent =
    `${displayName}  –  ${exam.name}`;

  // Timer
  const mins = (exam.duration || 60) * 60;
  state.totalSeconds = mins;
  state.secondsLeft  = mins;
  startTimer();

  // Render task 1
  switchTask(1);

  showScreen('screen-exam');
}

// ──────────────────────────────────────────────────────
// Timer
// ──────────────────────────────────────────────────────
function startTimer() {
  clearInterval(state.timerInterval);
  renderTimer();
  state.timerInterval = setInterval(() => {
    state.secondsLeft--;
    renderTimer();
    if (state.secondsLeft <= 0) {
      clearInterval(state.timerInterval);
      submitExam('timeout');
    }
  }, 1000);
}

function renderTimer() {
  const el = document.getElementById('timer-display');
  const timerBar = document.getElementById('exam-timer');
  if (state.timerHidden) { el.textContent = '--:--'; return; }

  const m = Math.floor(state.secondsLeft / 60);
  const s = state.secondsLeft % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  if (state.secondsLeft <= 300) {
    timerBar.classList.add('warning');
  } else {
    timerBar.classList.remove('warning');
  }
}

function toggleHideTimer() {
  state.timerHidden = !state.timerHidden;
  document.getElementById('btn-hide-timer').textContent = state.timerHidden ? 'Show' : 'Hide';
  renderTimer();
}

// ──────────────────────────────────────────────────────
// Switch task
// ──────────────────────────────────────────────────────
function switchTask(num) {
  if (num < 1 || num > 2) return;

  // Save current answer
  state.answers[state.currentTask] = document.getElementById('answer-textarea').value;

  state.currentTask = num;
  const exam = state.exam;
  const task = num === 1 ? exam.task1 : exam.task2;

  // Title bar
  document.getElementById('task-title-label').textContent =
    `Academic Writing Part ${num}`;
  document.getElementById('task-instructions-label').textContent =
    task.instructions || '';

  // Left panel
  const leftPanel = document.getElementById('exam-left-panel');
  if (num === 1) {
    leftPanel.innerHTML = `
      ${task.imageUrl ? `<img src="${escHtml(task.imageUrl)}" alt="Task 1 chart/diagram" />` : ''}
      <div class="task-prompt">${escHtml(task.prompt || '')}</div>
    `;
  } else {
    leftPanel.innerHTML = `
      <div style="margin-bottom:10px;font-size:13px;color:#555">Write about the following topic:</div>
      <div class="task-prompt" style="font-weight:600">${escHtml(task.prompt || '')}</div>
    `;
  }

  // Restore answer
  const textarea = document.getElementById('answer-textarea');
  textarea.value = state.answers[num];
  updateWordCount(textarea.value);

  // Review flag
  document.getElementById('review-check').checked = state.flags[num];

  // Nav buttons
  document.querySelectorAll('.task-nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active',   i + 1 === num);
    btn.classList.toggle('flagged',  state.flags[i + 1] && i + 1 !== num);
  });

  // Arrow buttons
  document.getElementById('btn-prev').disabled = (num === 1);
  document.getElementById('btn-next').disabled = (num === 2);
}

// ──────────────────────────────────────────────────────
// Word count
// ──────────────────────────────────────────────────────
function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function onAnswerInput() {
  const text = document.getElementById('answer-textarea').value;
  state.answers[state.currentTask] = text;
  updateWordCount(text);
}

function updateWordCount(text) {
  document.getElementById('word-count').textContent = countWords(text);
}

// ──────────────────────────────────────────────────────
// Flag / Review
// ──────────────────────────────────────────────────────
function toggleFlag() {
  state.flags[state.currentTask] = document.getElementById('review-check').checked;
  const btn = document.getElementById(`btn-task-${state.currentTask}`);
  if (state.flags[state.currentTask]) {
    btn.classList.add('flagged');
  } else {
    btn.classList.remove('flagged');
  }
}

// ──────────────────────────────────────────────────────
// Submit
// ──────────────────────────────────────────────────────
function confirmSubmit() {
  // Save current textarea
  state.answers[state.currentTask] = document.getElementById('answer-textarea').value;

  const wc1 = countWords(state.answers[1]);
  const wc2 = countWords(state.answers[2]);
  document.getElementById('confirm-wc1').textContent = wc1;
  document.getElementById('confirm-wc2').textContent = wc2;
  document.getElementById('confirm-modal-overlay').classList.add('open');
}

function closeConfirmModal() {
  document.getElementById('confirm-modal-overlay').classList.remove('open');
}

async function submitExam(statusOverride) {
  closeConfirmModal();
  clearInterval(state.timerInterval);

  const status = statusOverride || 'completed';
  const wc1 = countWords(state.answers[1]);
  const wc2 = countWords(state.answers[2]);
  const timeTaken = state.totalSeconds - state.secondsLeft;

  try {
    const data = await apiFetch('/api/writing/submit', {
      method: 'POST',
      body: JSON.stringify({
        examId:      state.exam._id,
        task1Id:     state.exam.task1?._id,
        task2Id:     state.exam.task2?._id,
        task1Answer: state.answers[1],
        task2Answer: state.answers[2],
        wordCount1:  wc1,
        wordCount2:  wc2,
        timeTaken,
        status
      })
    });

    if (data.success) {
      state.currentAttemptId = data.attemptId;
      // Done screen
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const name = user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : (user.username || '');
      document.querySelectorAll('#user-name-done, #user-name-history')
        .forEach(el => { if (el) el.textContent = `👋 ${name}`; });

      document.getElementById('done-exam-name').textContent = state.exam.name;
      document.getElementById('done-wc1').textContent = wc1;
      document.getElementById('done-wc2').textContent = wc2;
      showScreen('screen-done');
    } else {
      alert('Lỗi nộp bài: ' + (data.message || 'Vui lòng thử lại'));
    }
  } catch (e) {
    alert('Lỗi nộp bài: ' + e.message);
  }
}

// ──────────────────────────────────────────────────────
// History
// ──────────────────────────────────────────────────────
async function loadHistory() {
  const container = document.getElementById('history-content');
  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch('/api/writing/my-history');
    if (!data.success || !data.attempts.length) {
      container.innerHTML = '<p style="color:#6b7280;font-size:14px;text-align:center;padding:40px">Chưa có bài nộp nào.</p>';
      return;
    }

    const rows = data.attempts.map(a => {
      const date = new Date(a.submittedAt).toLocaleString('vi-VN');
      const mins = Math.floor((a.timeTaken || 0) / 60);
      const secs = (a.timeTaken || 0) % 60;
      return `
        <tr>
          <td>${escHtml(a.examName || '–')}</td>
          <td><span class="badge-wc">${a.wordCount1 || 0}</span></td>
          <td><span class="badge-wc">${a.wordCount2 || 0}</span></td>
          <td>${date}</td>
          <td>${mins}:${String(secs).padStart(2,'0')}</td>
          <td>
            <button class="btn-view-attempt" onclick="viewAttempt('${a._id}')">👁 Xem</button>
            <button class="btn-view-attempt" onclick="downloadAttemptById('${a._id}')" style="margin-left:4px">⬇ Tải</button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="history-table">
        <thead>
          <tr>
            <th>Đề thi</th>
            <th>Task 1 (từ)</th>
            <th>Task 2 (từ)</th>
            <th>Ngày nộp</th>
            <th>Thời gian</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (e) {
    container.innerHTML = `<p style="color:#e53935;font-size:14px;text-align:center;padding:40px">${e.message}</p>`;
  }
}

// ──────────────────────────────────────────────────────
// View attempt modal
// ──────────────────────────────────────────────────────
let _currentViewData = null;

async function viewAttempt(id) {
  document.getElementById('review-modal-overlay').classList.add('open');
  document.getElementById('review-modal-body').innerHTML = '<div class="spinner"></div>';
  document.getElementById('review-modal-title').textContent = 'Đang tải...';

  try {
    const data = await apiFetch(`/api/writing/attempt/${id}`);
    if (!data.success) throw new Error(data.message);

    const a = data.attempt;
    _currentViewData = a;

    document.getElementById('review-modal-title').textContent = a.examName || 'Xem lại bài làm';

    // Use snapshots (new), fall back to old embedded data for legacy attempts
    const t1 = a.task1Snapshot || a.examId?.task1 || {};
    const t2 = a.task2Snapshot || a.examId?.task2 || {};
    const t1Prompt = t1.prompt || '';
    const t2Prompt = t2.prompt || '';
    const t1Img    = t1.imageUrl || '';

    document.getElementById('review-modal-body').innerHTML = `
      <div class="review-task-section">
        <h4>Task 1 – ${a.wordCount1 || 0} từ</h4>
        ${t1Img ? `<img src="${escHtml(t1Img)}" style="max-width:100%;border-radius:6px;margin-bottom:8px" />` : ''}
        ${t1Prompt ? `<div class="review-task-prompt">${escHtml(t1Prompt)}</div>` : ''}
        <div class="review-answer">${escHtml(a.task1Answer || '(Không có bài làm)')}</div>
        <div class="review-wc">Số từ: ${a.wordCount1 || 0}</div>
      </div>
      <div class="review-task-section">
        <h4>Task 2 – ${a.wordCount2 || 0} từ</h4>
        ${t2Prompt ? `<div class="review-task-prompt">${escHtml(t2Prompt)}</div>` : ''}
        <div class="review-answer">${escHtml(a.task2Answer || '(Không có bài làm)')}</div>
        <div class="review-wc">Số từ: ${a.wordCount2 || 0}</div>
      </div>
    `;
  } catch (e) {
    document.getElementById('review-modal-body').innerHTML =
      `<p style="color:#e53935;padding:20px">${e.message}</p>`;
  }
}

function closeReviewModal() {
  document.getElementById('review-modal-overlay').classList.remove('open');
  _currentViewData = null;
}

// ──────────────────────────────────────────────────────
// Download attempt as .txt
// ──────────────────────────────────────────────────────
function downloadAttempt() {
  if (!_currentViewData) return;
  doDownload(_currentViewData);
}

async function downloadAttemptById(id) {
  try {
    const data = await apiFetch(`/api/writing/attempt/${id}`);
    if (!data.success) throw new Error(data.message);
    doDownload(data.attempt);
  } catch (e) {
    alert('Lỗi: ' + e.message);
  }
}

function doDownload(a) {
  const t1   = a.task1Snapshot || a.examId?.task1 || {};
  const t2   = a.task2Snapshot || a.examId?.task2 || {};
  const date = new Date(a.submittedAt).toLocaleString('vi-VN');

  const lines = [
    `ENGLISH WITH DAN – WRITING SUBMISSION`,
    `========================================`,
    `Đề: ${a.examName || ''}`,
    `Ngày nộp: ${date}`,
    `Task 1: ${a.wordCount1 || 0} từ   |   Task 2: ${a.wordCount2 || 0} từ`,
    ``,
    `────────────────────────────────────────`,
    `TASK 1`,
    `────────────────────────────────────────`,
    t1.prompt || '',
    ``,
    a.task1Answer || '',
    ``,
    `────────────────────────────────────────`,
    `TASK 2`,
    `────────────────────────────────────────`,
    t2.prompt || '',
    ``,
    a.task2Answer || '',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `writing_${(a.examName || 'submission').replace(/\s+/g, '_')}_${date.replace(/[/:,\s]/g, '-')}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────────────
// Writing Samples (Tài liệu mẫu)
// ──────────────────────────────────────────────────────
const sampleFilters = { quarter: 'all', topic: 'all', taskType: 'all' };

async function loadWritingSamples() {
  showScreen('screen-samples');

  // Load filters (quarters + topics) once
  try {
    const fData = await apiFetch('/api/writing/sample-filters');
    if (fData.success) {
      const qChips = document.getElementById('wsampl-quarter-chips');
      const tChips = document.getElementById('wsampl-topic-chips');

      // Render quarter chips
      qChips.innerHTML = `<span class="sf-chip active" data-val="all" onclick="setSampleFilter('quarter','all',this)">Tất cả</span>`;
      fData.quarters.forEach(q => {
        qChips.insertAdjacentHTML('beforeend',
          `<span class="sf-chip" data-val="${escHtml(q)}" onclick="setSampleFilter('quarter','${escHtml(q)}',this)">${escHtml(q)}</span>`);
      });

      // Render topic chips
      tChips.innerHTML = `<span class="sf-chip active" data-val="all" onclick="setSampleFilter('topic','all',this)">Tất cả</span>`;
      fData.topics.forEach(t => {
        tChips.insertAdjacentHTML('beforeend',
          `<span class="sf-chip" data-val="${escHtml(t)}" onclick="setSampleFilter('topic','${escHtml(t)}',this)">${escHtml(t)}</span>`);
      });
    }
  } catch (e) { /* filters optional */ }

  await _fetchAndRenderSamples();
}

async function _fetchAndRenderSamples() {
  const list = document.getElementById('wsampl-list');
  list.innerHTML = '<div class="spinner"></div>';

  try {
    const params = new URLSearchParams({
      quarter:  sampleFilters.quarter,
      topic:    sampleFilters.topic,
      taskType: sampleFilters.taskType
    });
    const data = await apiFetch(`/api/writing/samples?${params}`);
    if (!data.success) throw new Error(data.message || 'Lỗi');

    if (!data.samples.length) {
      list.innerHTML = '<p style="color:#9ca3af;padding:20px;text-align:center">Không có tài liệu nào.</p>';
      return;
    }

    const taskLabel = { task1: 'Task 1', task2: 'Task 2', both: 'Task 1 & 2' };
    list.innerHTML = data.samples.map(s => `
      <div class="sample-card" onclick="openSamplePdf('${escHtml(s.pdfUrl)}','${escHtml(s.title)}',this)">
        <div class="sample-card-icon">📄</div>
        <div>
          <div class="sample-card-title">${escHtml(s.title)}</div>
          <div class="sample-card-meta">${escHtml(s.quarter)} · ${escHtml(s.topic)}</div>
          <span class="sample-card-badge">${taskLabel[s.taskType] || s.taskType}</span>
        </div>
      </div>`).join('');
  } catch (e) {
    list.innerHTML = `<p style="color:#ef4444;padding:20px;text-align:center">Lỗi tải tài liệu: ${escHtml(e.message)}</p>`;
  }
}

function setSampleFilter(type, val, el) {
  sampleFilters[type] = val;

  // Update active chip in the correct group
  const groupMap = { quarter: 'wsampl-quarter-chips', topic: 'wsampl-topic-chips', taskType: 'wsampl-task-chips' };
  const group = document.getElementById(groupMap[type]);
  if (group) {
    group.querySelectorAll('.sf-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  _fetchAndRenderSamples();
}

function openSamplePdf(url, title, el) {
  document.getElementById('wsampl-placeholder').style.display = 'none';
  const wrap = document.getElementById('wsampl-viewer-wrap');
  wrap.style.display = 'flex';
  document.getElementById('wsampl-viewer-title').textContent = title;
  document.getElementById('wsampl-download-btn').href = url;
  document.getElementById('wsampl-frame').src = url;

  // Highlight selected item
  document.querySelectorAll('.sample-card').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');

  // On mobile: show viewer col full-screen, hide list col
  if (window.innerWidth <= 768) {
    document.getElementById('wsampl-viewer-col').classList.add('mobile-open');
    document.querySelector('.samples-list-col').style.display = 'none';
    document.getElementById('wsampl-viewer-col').scrollIntoView({ behavior: 'smooth' });
  }
}

function closeWritingMobilePdf() {
  document.getElementById('wsampl-viewer-col').classList.remove('mobile-open');
  document.querySelector('.samples-list-col').style.display = '';
}

// ──────────────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
