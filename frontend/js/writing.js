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
  window.location.href = 'login.html';
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
  try { return JSON.parse(text); } catch { throw new Error('Phản hồi không hợp lệ từ server.'); }
}

// ──────────────────────────────────────────────────────
// Toast notification
// ──────────────────────────────────────────────────────
function showToast(msg, type = 'error', duration = 4000) {
  let toast = document.getElementById('wt-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'wt-toast';
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);z-index:99999;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;color:#fff;box-shadow:0 4px 18px rgba(0,0,0,.22);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;max-width:90vw;text-align:center;';
    document.body.appendChild(toast);
  }
  clearTimeout(toast._hideTimer);
  toast.textContent = msg;
  toast.style.background = type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6';
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
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
  if (!token) { window.location.href = 'login.html'; return; }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user.username || '');

  document.querySelectorAll('#user-name-done, #user-name-history, #user-name-samples')
    .forEach(el => { if (el) el.textContent = `👋 ${displayName}`; });

  checkRestoreBanner();
  // Focus key input on load
  setTimeout(() => { const ki = document.getElementById('key-input'); if (ki) ki.focus(); }, 150);
})();

// ──────────────────────────────────────────────────────
// Format key input  (XXXX-XXXX) — đồng bộ với reading/listening
// ──────────────────────────────────────────────────────
function formatKeyInput(input) {
  let v = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
  input.value = v;
}

function showKeyMsg(text, type) {
  const el = document.getElementById('key-msg');
  if (!el) return;
  el.textContent = text;
  el.className = `key-msg ${type}`;
}

// ──────────────────────────────────────────────────────
// Verify key & load exam
// ──────────────────────────────────────────────────────
async function startExam() {
  const key = document.getElementById('key-input').value.trim();
  showKeyMsg('', 'hidden');

  if (!key || key.replace('-', '').length < 8) {
    showKeyMsg('Vui lòng nhập mã truy cập (8 ký tự)', 'error');
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
      showKeyMsg(data.message || 'Mã không hợp lệ', 'error');
      return;
    }

    state.exam = data.exam;
    state.answers = { 1: '', 2: '' };
    state.flags   = { 1: false, 2: false };
    state.currentTask = 1;
    state.secondsLeft = 0;

    launchExam();
  } catch (e) {
    showKeyMsg(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '✏️ Bắt đầu làm bài';
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

  document.getElementById('restore-banner').style.display = 'none';

  // Top bar candidate info
  document.getElementById('exam-candidate').textContent =
    `${displayName}  –  ${exam.name}`;

  // Timer – only reset if not restoring (secondsLeft already set by restoreExam)
  if (!state.secondsLeft || state.secondsLeft <= 0) {
    const mins = (exam.duration || 60) * 60;
    state.totalSeconds = mins;
    state.secondsLeft  = mins;
  }
  startTimer();
  saveToStorage();

  // Render task 1
  switchTask(1);

  showScreen('screen-exam');
  window.onbeforeunload = e => { if (state.exam) { e.preventDefault(); e.returnValue = ''; } };
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
    if (state.secondsLeft % 30 === 0) saveToStorage(); // auto-save every 30s
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
      ${task.imageUrl ? `<img src="${escHtml(task.imageUrl)}" alt="Task 1 chart/diagram" style="max-width:100%;border-radius:8px;margin-bottom:12px" />` : ''}
      <div class="task-prompt" style="white-space:pre-wrap">${escHtml(task.prompt || '')}</div>
    `;
  } else {
    leftPanel.innerHTML = `
      <div style="margin-bottom:10px;font-size:13px;color:#555">Write about the following topic:</div>
      <div class="task-prompt" style="font-weight:600;white-space:pre-wrap">${escHtml(task.prompt || '')}</div>
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

let _saveDebounce = null;
function onAnswerInput() {
  const text = document.getElementById('answer-textarea').value;
  state.answers[state.currentTask] = text;
  updateWordCount(text);
  clearTimeout(_saveDebounce);
  _saveDebounce = setTimeout(saveToStorage, 800);
}

const _WC_TARGETS = { 1: 150, 2: 250 };

function updateWordCount(text) {
  const wc     = countWords(text);
  const target = _WC_TARGETS[state.currentTask] || 150;
  const pct    = wc / target;

  let color;
  if (wc >= target)       color = '#16a34a';
  else if (pct >= 0.8)    color = '#f59e0b';
  else                    color = '#6b7280';

  const wcEl = document.getElementById('word-count');
  if (wcEl) { wcEl.textContent = wc; wcEl.style.color = color; }

  const targetEl = document.getElementById('word-count-target');
  if (targetEl) { targetEl.textContent = `/ ${target} từ`; targetEl.style.color = color; }

  // Progress bar
  const bar = document.getElementById('wc-progress-bar');
  if (bar) {
    bar.style.width = Math.min(pct * 100, 100).toFixed(1) + '%';
    bar.className = 'wc-progress-bar' + (wc >= target ? ' met' : pct >= 0.8 ? ' near' : '');
  }

  updateFooterWcSummary();
}

function updateFooterWcSummary() {
  const wc1El = document.getElementById('footer-wc1');
  const wc2El = document.getElementById('footer-wc2');
  if (!wc1El || !wc2El) return;

  const wc1 = countWords(state.answers[1] || '');
  const wc2 = countWords(state.answers[2] || '');
  wc1El.textContent = wc1;
  wc2El.textContent = wc2;
  wc1El.style.color = wc1 >= 150 ? '#16a34a' : wc1 >= 120 ? '#f59e0b' : '#374151';
  wc2El.style.color = wc2 >= 250 ? '#16a34a' : wc2 >= 200 ? '#f59e0b' : '#374151';
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
  window.onbeforeunload = null;

  const status = statusOverride || 'completed';
  const wc1 = countWords(state.answers[1]);
  const wc2 = countWords(state.answers[2]);
  const timeTaken = state.totalSeconds - state.secondsLeft;

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
    overlay.style.display = 'none';

    if (data.success) {
      clearAutoSave();
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
      showToast('Lỗi nộp bài: ' + (data.message || 'Vui lòng thử lại'));
    }
  } catch (e) {
    overlay.style.display = 'none';
    showToast('Lỗi nộp bài: ' + e.message);
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
      let scoreBadge;
      if (a.gradingStatus === 'confirmed' && a.grading?.overallBand != null) {
        scoreBadge = `<span style="background:#dcfce7;color:#15803d;border-radius:6px;padding:3px 10px;font-size:13px;font-weight:800">${a.grading.overallBand}</span>`;
      } else if (a.gradingStatus === 'ai_done') {
        scoreBadge = `<span style="background:#fef3c7;color:#d97706;border-radius:6px;padding:3px 10px;font-size:12px">Đang chờ GV</span>`;
      } else {
        scoreBadge = `<span style="color:#9ca3af;font-size:12px">Chờ chấm</span>`;
      }
      return `
        <tr>
          <td>${escHtml(a.examName || '–')}</td>
          <td><span class="badge-wc">${a.wordCount1 || 0}</span></td>
          <td><span class="badge-wc">${a.wordCount2 || 0}</span></td>
          <td>${scoreBadge}</td>
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
            <th>Điểm Band</th>
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

    const feedbackHtml = (a.gradingStatus === 'confirmed' && a.grading)
      ? _buildStudentFeedback(a.grading)
      : '';

    document.getElementById('review-modal-body').innerHTML = `
      ${feedbackHtml}
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

function _buildStudentFeedback(g) {
  function taskCard(label, td) {
    if (!td) return '';
    const criteria = [
      { key: 'ta',  label: 'Task Achievement' },
      { key: 'cc',  label: 'Coherence & Cohesion' },
      { key: 'lr',  label: 'Lexical Resource' },
      { key: 'gra', label: 'Grammar' }
    ];
    const bars = criteria.map(c => {
      const score = td[c.key]?.score ?? 0;
      const pct   = (score / 9 * 100).toFixed(0);
      const color = score >= 7 ? '#16a34a' : score >= 5.5 ? '#2563eb' : score >= 4 ? '#d97706' : '#dc2626';
      return `<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
          <span style="color:#374151">${escHtml(c.label)}</span>
          <strong style="color:${color}">${score}</strong>
        </div>
        <div style="background:#e5e7eb;border-radius:99px;height:6px">
          <div style="background:${color};width:${pct}%;height:6px;border-radius:99px;transition:width .4s"></div>
        </div>
        ${td[c.key]?.comment ? `<div style="font-size:11px;color:#6b7280;margin-top:3px;font-style:italic">${escHtml(td[c.key].comment)}</div>` : ''}
      </div>`;
    }).join('');

    const corrections = (td.corrections || []).map(c =>
      `<div style="background:#fff7ed;border-left:3px solid #f97316;border-radius:4px;padding:6px 10px;margin-bottom:6px;font-size:12px">
        <span style="color:#dc2626;text-decoration:line-through">${escHtml(c.original)}</span>
        <span style="color:#6b7280;margin:0 6px">→</span>
        <span style="color:#16a34a;font-weight:600">${escHtml(c.corrected)}</span>
        ${c.explanation ? `<div style="color:#78350f;margin-top:3px">${escHtml(c.explanation)}</div>` : ''}
      </div>`).join('');

    const suggestions = (td.suggestions || []).map(s =>
      `<li style="font-size:12px;color:#1e40af;margin-bottom:4px">${escHtml(s)}</li>`).join('');

    return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:13px;font-weight:700;color:#1e40af">${label}</span>
        <span style="font-size:22px;font-weight:800;color:#1e40af">${td.bandScore ?? '–'}</span>
      </div>
      ${bars}
      ${td.overallFeedback ? `<div style="background:#eff6ff;border-radius:6px;padding:10px 12px;font-size:13px;color:#1e3a5f;margin-top:10px;line-height:1.6">${escHtml(td.overallFeedback)}</div>` : ''}
      ${corrections ? `<div style="margin-top:10px"><div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Lỗi cần sửa</div>${corrections}</div>` : ''}
      ${suggestions ? `<div style="margin-top:10px"><div style="font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Gợi ý cải thiện</div><ul style="margin:0;padding-left:16px">${suggestions}</ul></div>` : ''}
    </div>`;
  }

  return `<div style="background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #3b82f6;border-radius:12px;padding:16px;margin-bottom:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <span style="font-size:15px;font-weight:800;color:#1e40af">📊 Kết quả chấm bài</span>
      <div style="text-align:center">
        <div style="font-size:11px;color:#6b7280;margin-bottom:2px">Overall Band</div>
        <div style="font-size:32px;font-weight:900;color:#1e40af;line-height:1">${g.overallBand ?? '–'}</div>
      </div>
    </div>
    ${taskCard('Task 1', g.task1)}
    ${taskCard('Task 2', g.task2)}
  </div>`;
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
    showToast('Lỗi tải bài: ' + e.message);
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
      qChips.innerHTML = `<span class="pv-chip active" data-val="all" onclick="setSampleFilter('quarter','all',this)">Tất cả</span>`;
      fData.quarters.forEach(q => {
        qChips.insertAdjacentHTML('beforeend',
          `<span class="pv-chip" data-val="${escHtml(q)}" onclick="setSampleFilter('quarter','${escHtml(q)}',this)">${escHtml(q)}</span>`);
      });

      // Render topic chips
      tChips.innerHTML = `<span class="pv-chip active" data-val="all" onclick="setSampleFilter('topic','all',this)">Tất cả</span>`;
      fData.topics.forEach(t => {
        tChips.insertAdjacentHTML('beforeend',
          `<span class="pv-chip" data-val="${escHtml(t)}" onclick="setSampleFilter('topic','${escHtml(t)}',this)">${escHtml(t)}</span>`);
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
      <div class="pv-doc-card" onclick="openSamplePdf('${escHtml(s.pdfUrl)}','${escHtml(s.title)}',this)">
        <div class="pv-doc-icon">📄</div>
        <div class="pv-doc-info">
          <div class="pv-doc-title">${escHtml(s.title)}</div>
          <div class="pv-doc-meta">${escHtml(s.quarter)} · ${escHtml(s.topic)}</div>
          <span class="pv-doc-badge">${taskLabel[s.taskType] || s.taskType}</span>
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
    group.querySelectorAll('.pv-chip').forEach(c => c.classList.remove('active'));
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
  const tabBtn = document.getElementById('wsampl-newtab-btn');
  if (tabBtn) tabBtn.href = url;
  document.getElementById('wsampl-frame').src = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&embedded=true';

  // Highlight selected item
  document.querySelectorAll('.pv-doc-card').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');

  // On mobile: show viewer col full-screen, hide sidebar
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
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ──────────────────────────────────────────────────────
// Auto-save to localStorage
// ──────────────────────────────────────────────────────
const _AUTOSAVE_KEY = 'ews_writing_autosave';
const _AUTOSAVE_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

function saveToStorage() {
  if (!state.exam) return;
  try {
    localStorage.setItem(_AUTOSAVE_KEY, JSON.stringify({
      exam:        state.exam,
      answers:     state.answers,
      flags:       state.flags,
      secondsLeft: state.secondsLeft,
      savedAt:     Date.now()
    }));
    const lbl = document.getElementById('btn-autosave');
    if (lbl) {
      lbl.title = 'Đã lưu lúc ' + new Date().toLocaleTimeString('vi-VN');
      lbl.classList.add('saved');
      clearTimeout(lbl._t);
      lbl._t = setTimeout(() => lbl.classList.remove('saved'), 2000);
    }
  } catch (_) {}
}

// ──────────────────────────────────────────────────────
// Fullscreen  (đồng bộ với reading/listening)
// ──────────────────────────────────────────────────────
function toggleFullscreen() {
  const el = document.getElementById('screen-exam');
  if (!document.fullscreenElement) {
    el.requestFullscreen && el.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('btn-fullscreen');
  if (btn) btn.title = document.fullscreenElement ? 'Thoát toàn màn hình' : 'Toàn màn hình';
  // Đưa modals vào trong fullscreen element khi cần
  const fsEl = document.fullscreenElement;
  const ids = ['confirm-modal-overlay', 'exit-modal-overlay', 'review-modal-overlay'];
  if (fsEl) {
    ids.forEach(id => {
      const m = document.getElementById(id);
      if (m && !fsEl.contains(m)) { m._fsPrev = m.parentNode; fsEl.appendChild(m); }
    });
  } else {
    ids.forEach(id => {
      const m = document.getElementById(id);
      if (m && m._fsPrev) { m._fsPrev.appendChild(m); m._fsPrev = null; }
    });
  }
});

// ──────────────────────────────────────────────────────
// Exit exam  (giữ nguyên autosave, về screen-key)
// ──────────────────────────────────────────────────────
function confirmExit() {
  saveToStorage();
  document.getElementById('exit-modal-overlay').classList.add('open');
}

function closeExitModal() {
  document.getElementById('exit-modal-overlay').classList.remove('open');
}

function forceExit() {
  clearInterval(state.timerInterval);
  window.onbeforeunload = null;
  closeExitModal();
  // Thoát fullscreen nếu đang bật
  if (document.fullscreenElement) document.exitFullscreen();
  // Reset state (giữ autosave để restore sau)
  state.exam = null;
  showScreen('screen-key');
  const ki = document.getElementById('key-input');
  if (ki) { ki.value = ''; ki.focus(); }
  showKeyMsg('', 'hidden');
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(_AUTOSAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !saved.exam) return null;
    if (Date.now() - saved.savedAt > _AUTOSAVE_MAX_AGE_MS) {
      localStorage.removeItem(_AUTOSAVE_KEY);
      return null;
    }
    return saved;
  } catch (_) { return null; }
}

function clearAutoSave() {
  localStorage.removeItem(_AUTOSAVE_KEY);
}

function checkRestoreBanner() {
  const saved = loadFromStorage();
  const banner = document.getElementById('restore-banner');
  const desc   = document.getElementById('restore-banner-desc');
  if (!saved || !banner) return;

  const mins = Math.floor(saved.secondsLeft / 60);
  const secs = saved.secondsLeft % 60;
  const wc1  = countWords(saved.answers[1] || '');
  const wc2  = countWords(saved.answers[2] || '');
  desc.textContent =
    `${saved.exam.name}  •  Task 1: ${wc1} từ  |  Task 2: ${wc2} từ  •  Còn ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  banner.style.display = 'block';
}

function restoreExam() {
  const saved = loadFromStorage();
  if (!saved) return;
  state.exam        = saved.exam;
  state.answers     = saved.answers  || { 1: '', 2: '' };
  state.flags       = saved.flags    || { 1: false, 2: false };
  state.secondsLeft = saved.secondsLeft || 3600;
  state.totalSeconds = state.exam.duration ? state.exam.duration * 60 : 3600;
  state.currentTask  = 1;
  document.getElementById('restore-banner').style.display = 'none';
  launchExam();
}

function discardSaved() {
  clearAutoSave();
  document.getElementById('restore-banner').style.display = 'none';
}
