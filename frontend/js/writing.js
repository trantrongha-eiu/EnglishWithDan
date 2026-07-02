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
  if (typeof window.hideTopNav === 'function') {
    const NAV_SCREENS = ['screen-key', 'screen-history', 'screen-practice', 'screen-samples'];
    NAV_SCREENS.includes(id) ? window.showTopNav() : window.hideTopNav();
  }
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

  // URL param routing: ?taskType=1/2&taskId=<id> (shareable), or ?taskType=1/2 (nav link to task list)
  const params = new URLSearchParams(location.search);
  const urlTaskType = parseInt(params.get('taskType'));
  const urlTaskId   = params.get('taskId');
  if ((urlTaskType === 1 || urlTaskType === 2) && urlTaskId) {
    _openDirectPracticeTask(urlTaskType, urlTaskId);
    return;
  }
  if (urlTaskType === 1 || urlTaskType === 2) {
    history.replaceState({ screen: 'practice-list', taskType: urlTaskType }, '', `writing.html?taskType=${urlTaskType}`);
    showScreen('screen-practice'); // switch screen now; task list loads after practiceState is defined (see deferred init below)
    return;
  }

  if (params.get('view') === 'samples') {
    loadWritingSamples();
    return;
  }

  checkRestoreBanner();
})();

window.addEventListener('popstate', e => {
  const s = e.state?.screen;

  // Clean up write screen if navigating away
  if (practiceState.task) {
    stopPracticeStopwatch();
    savePracticeToStorage();
    saveDraftToServer();
    window.onbeforeunload = null;
    practiceState.task = null;
    document.getElementById('practice-exit-modal')?.classList.remove('open');
  }

  if (s === 'practice-list') {
    showPracticeTaskList(e.state.taskType, false);
  } else if (s === 'practice') {
    showPracticeMode(false);
  } else if (s === 'practice-write') {
    // Forward to a write-screen URL: show the task list instead of restarting
    // (restarting would call clearPracticeAutoSave and delete the saved draft)
    if (e.state.taskType) showPracticeTaskList(e.state.taskType, false);
    else showPracticeMode(false);
  } else if (s === 'samples') {
    showScreen('screen-samples');
  } else {
    showScreen('screen-key');
    checkRestoreBanner();
  }
});

async function _openDirectPracticeTask(taskType, taskId) {
  showScreen('screen-practice');
  try {
    const taskRes = await apiFetch(`/api/writing/practice/tasks?taskType=${taskType}`);
    practiceState.tasks = taskRes.tasks || [];

    const task = practiceState.tasks.find(t => String(t._id) === taskId);
    if (!task) {
      history.replaceState({ screen: 'practice' }, '', 'writing.html');
      showPracticeMode(false);
      showToast('Không tìm thấy đề bài hoặc đề đã bị ẩn', 'error');
      return;
    }

    history.replaceState({ screen: 'practice-write', taskType, taskId }, '',
      `writing.html?taskType=${taskType}&taskId=${encodeURIComponent(taskId)}`);
    startPracticeTask(taskType, taskId, false);
  } catch (e) {
    showToast('Lỗi tải đề bài', 'error');
  }
}


// ──────────────────────────────────────────────────────
// Start exam (no key required — writing is free)
// ──────────────────────────────────────────────────────
async function startExam() {
  const btn = document.getElementById('btn-start');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...'; }

  try {
    const data = await apiFetch('/api/writing/start', { method: 'POST', body: JSON.stringify({}) });

    if (!data.success) {
      showToast(data.message || 'Không thể tải bài thi', 'error');
      return;
    }

    state.exam = data.exam;
    state.answers = { 1: '', 2: '' };
    state.flags   = { 1: false, 2: false };
    state.currentTask = 1;
    state.secondsLeft = 0;

    launchExam();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-pen"></i> Bắt đầu làm bài'; }
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
  document.getElementById('btn-hide-timer').textContent = state.timerHidden ? 'Hiện' : 'Ẩn';
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
    `Academic Writing Task ${num}`;
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
      <div style="margin-bottom:10px;font-size:13px;color:#555">Hãy viết về chủ đề sau:</div>
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
  const timeTaken = Math.max(0, state.totalSeconds - state.secondsLeft);

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
let _allAttempts = [];
let _historyFilter = 'all';

function setHistoryFilter(type, btn) {
  _historyFilter = type;
  document.querySelectorAll('.btn-hist-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  _renderHistory();
}

function _renderHistory() {
  const container = document.getElementById('history-content');
  const filtered = _historyFilter === 'all'
    ? _allAttempts
    : _allAttempts.filter(a => (a.submissionType || 'exam') === _historyFilter);

  if (!filtered.length) {
    container.innerHTML = '<p style="color:#6b7280;font-size:14px;text-align:center;padding:40px">Chưa có bài nộp nào.</p>';
    return;
  }

  const rows = filtered.map(a => {
    const date = new Date(a.submittedAt).toLocaleString('vi-VN');
    const isPractice = a.submissionType === 'practice';
    const timeStr = (!isPractice && (a.timeTaken || 0) > 0)
      ? `${String(Math.floor(a.timeTaken / 60)).padStart(2,'0')}:${String(a.timeTaken % 60).padStart(2,'0')}`
      : '–';
    const typeBadge = isPractice
      ? `<span style="background:#eff6ff;color:#2563eb;border-radius:5px;padding:2px 7px;font-size:11px;font-weight:600;margin-right:4px"><i class="fas fa-pencil-alt"></i> Luyện</span>`
      : `<span style="background:#f0fdf4;color:#15803d;border-radius:5px;padding:2px 7px;font-size:11px;font-weight:600;margin-right:4px"><i class="fas fa-trophy"></i> Thi</span>`;
    const t1badge = isPractice && (a.wordCount1 || 0) === 0 ? '<span style="color:#9ca3af">–</span>' : `<span class="badge-wc">${a.wordCount1 || 0}</span>`;
    const t2badge = isPractice && (a.wordCount2 || 0) === 0 ? '<span style="color:#9ca3af">–</span>' : `<span class="badge-wc">${a.wordCount2 || 0}</span>`;
    let scoreBadge;
    if (a.gradingStatus === 'confirmed' && a.grading?.overallBand != null) {
      const b = a.grading.overallBand;
      const col = b >= 7 ? '#15803d' : b >= 5.5 ? '#1d4ed8' : b >= 4 ? '#d97706' : '#dc2626';
      const bg  = b >= 7 ? '#dcfce7' : b >= 5.5 ? '#dbeafe' : b >= 4 ? '#fef3c7' : '#fee2e2';
      scoreBadge = `<span style="background:${bg};color:${col};border-radius:6px;padding:3px 10px;font-size:13px;font-weight:800">${b}</span>`;
    } else if (a.gradingStatus === 'ai_done') {
      scoreBadge = `<span style="background:#fef3c7;color:#d97706;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600">Chờ GV</span>`;
    } else {
      scoreBadge = `<span style="color:#9ca3af;font-size:12px">Chờ chấm</span>`;
    }
    return `
      <tr>
        <td>${typeBadge}${escHtml(a.examName || '–')}</td>
        <td>${t1badge}</td>
        <td>${t2badge}</td>
        <td>${scoreBadge}</td>
        <td style="font-size:12px;color:#6b7280">${date}</td>
        <td style="font-size:12px;color:#6b7280;text-align:center">${timeStr}</td>
        <td>
          <button class="btn-view-attempt" onclick="viewAttempt('${a._id}')"><i class="fas fa-eye"></i> Xem</button>
          <button class="btn-view-attempt" onclick="downloadAttemptById('${a._id}')" style="margin-left:4px"><i class="fas fa-download"></i> Tải</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Đề thi</th>
          <th>Task 1</th>
          <th>Task 2</th>
          <th>Band</th>
          <th>Ngày nộp</th>
          <th>TG</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function loadHistory() {
  const container = document.getElementById('history-content');
  container.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await apiFetch('/api/writing/my-history');
    if (!data.success) throw new Error(data.message || 'Lỗi tải lịch sử');
    _allAttempts = data.attempts || [];
    _renderHistory();
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

    // Mark feedback as read (fire-and-forget) + update nav badge
    if (a.gradingStatus === 'confirmed' && !a.feedbackRead) {
      apiFetch(`/api/writing/attempt/${id}/mark-read`, { method: 'PATCH' }).then(() => {
        // Decrement nav badge
        const badgeEl = document.getElementById('navWritingBadge');
        const mobEl   = document.getElementById('mob_navWritingBadge');
        [badgeEl, mobEl].forEach(b => {
          if (!b) return;
          const n = Math.max(0, parseInt(b.textContent || '0', 10) - 1);
          b.textContent = n;
          b.style.display = n > 0 ? 'inline' : 'none';
        });
      }).catch(() => {});
    }

    // Use snapshots (new), fall back to old embedded data for legacy attempts
    const t1 = a.task1Snapshot || a.examId?.task1 || {};
    const t2 = a.task2Snapshot || a.examId?.task2 || {};
    const t1Prompt = t1.prompt || '';
    const t2Prompt = t2.prompt || '';
    const t1Img    = t1.imageUrl || '';

    const feedbackHtml = (a.gradingStatus === 'confirmed' && a.grading)
      ? _buildStudentFeedback(a.grading)
      : '';

    const statusBannerHtml = (a.gradingStatus !== 'confirmed')
      ? `<div style="background:${a.gradingStatus === 'ai_done' ? '#fef9c3' : '#f0f7ff'};border:1.5px solid ${a.gradingStatus === 'ai_done' ? '#f59e0b' : '#bfdbfe'};border-radius:10px;padding:12px 16px;margin-bottom:14px;font-size:13px;color:${a.gradingStatus === 'ai_done' ? '#78350f' : '#1e40af'}">
          ${a.gradingStatus === 'ai_done'
            ? '<i class="fas fa-robot"></i> AI đã chấm xong – đang chờ giáo viên xác nhận và gửi feedback.'
            : '<i class="fas fa-hourglass-half"></i> Bài đang chờ chấm – feedback sẽ xuất hiện ở đây sau khi giáo viên trả bài.'}
        </div>`
      : '';

    const isPractice = a.submissionType === 'practice';
    const showT1Section = !isPractice || (a.wordCount1 > 0) || (a.task1Answer && a.task1Answer.trim());
    const showT2Section = !isPractice || (a.wordCount2 > 0) || (a.task2Answer && a.task2Answer.trim());

    document.getElementById('review-modal-body').innerHTML = `
      ${statusBannerHtml}
      ${feedbackHtml}
      ${showT1Section ? `<div class="review-task-section">
        <h4>Task 1 – ${a.wordCount1 || 0} từ</h4>
        ${t1Img ? `<img src="${escHtml(t1Img)}" style="max-width:100%;border-radius:6px;margin-bottom:8px" />` : ''}
        ${t1Prompt ? `<div class="review-task-prompt">${escHtml(t1Prompt)}</div>` : ''}
        <div class="review-answer">${escHtml(a.task1Answer || '(Không có bài làm)')}</div>
        <div class="review-wc">Số từ: ${a.wordCount1 || 0}</div>
      </div>` : ''}
      ${showT2Section ? `<div class="review-task-section">
        <h4>Task 2 – ${a.wordCount2 || 0} từ</h4>
        ${t2Prompt ? `<div class="review-task-prompt">${escHtml(t2Prompt)}</div>` : ''}
        <div class="review-answer">${escHtml(a.task2Answer || '(Không có bài làm)')}</div>
        <div class="review-wc">Số từ: ${a.wordCount2 || 0}</div>
      </div>` : ''}
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
    if (td.bandScore == null && !td.overallFeedback && !(td.sentenceFeedback?.length)) return '';
    const isT1 = label.includes('1');
    const criteria = [
      { key: 'ta',  label: isT1 ? 'Task Achievement' : 'Task Response' },
      { key: 'cc',  label: 'Coherence & Cohesion' },
      { key: 'lr',  label: 'Lexical Resource' },
      { key: 'gra', label: 'Grammatical Range & Accuracy' }
    ];
    const bars = criteria.map(c => {
      const score = td[c.key]?.score ?? 0;
      const pct   = (score / 9 * 100).toFixed(0);
      const color = score >= 7 ? '#16a34a' : score >= 5.5 ? '#2563eb' : score >= 4 ? '#d97706' : '#dc2626';
      return `<div class="fb-crit-row">
        <div class="fb-crit-header">
          <span class="fb-crit-label">${escHtml(c.label)}</span>
          <strong style="color:${color};font-size:15px">${score}</strong>
        </div>
        <div class="fb-crit-track">
          <div style="background:${color};width:${pct}%;height:100%;border-radius:99px;transition:width .4s"></div>
        </div>
        ${td[c.key]?.comment ? `<div class="fb-crit-comment">${escHtml(td[c.key].comment)}</div>` : ''}
      </div>`;
    }).join('');

    // Sentence-by-sentence feedback (new format)
    const sfItems = (td.sentenceFeedback || []);
    let sfHtml = '';
    if (sfItems.length > 0) {
      const rows = sfItems.map(s => {
        if (s.type === 'ok') {
          return `<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;background:#f0fdf4;border-radius:8px;border-left:3px solid #22c55e">
            <span style="color:#22c55e;flex-shrink:0"><i class="fas fa-check-circle"></i></span>
            <span style="font-size:13px;color:#166534;line-height:1.6">${escHtml(s.original)}</span>
          </div>`;
        }
        // type === 'issue'
        const critColor = s.criterion === 'GRA' ? '#7c3aed' : s.criterion === 'LR' ? '#0369a1' : s.criterion === 'CC' ? '#b45309' : '#dc2626';
        return `<div style="background:#fff7f7;border-radius:8px;border-left:3px solid #ef4444;padding:10px 12px">
          ${s.original ? `<div style="font-size:13px;color:#374151;line-height:1.6;margin-bottom:8px;padding:5px 8px;background:#fee2e2;border-radius:5px">${escHtml(s.original)}</div>` : ''}
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:5px">
            <span style="color:#ef4444;flex-shrink:0"><i class="fas fa-times-circle"></i></span>
            ${s.criterion ? `<span style="display:inline-block;background:${critColor};color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:9px">${escHtml(s.criterion)}</span>` : ''}
          </div>
          ${s.issue ? `<div style="font-size:12px;color:#6b7280;margin-bottom:6px;padding-left:4px"><i class="fas fa-search"></i> ${escHtml(s.issue)}</div>` : ''}
          ${s.better ? `<div style="display:flex;gap:8px;align-items:flex-start">
            <span style="color:#16a34a;flex-shrink:0"><i class="fas fa-check-circle"></i></span>
            <span style="font-size:13px;color:#14532d;font-weight:500;line-height:1.6">${escHtml(s.better)}</span>
          </div>` : ''}
        </div>`;
      }).join('');
      sfHtml = `<div class="fb-section">
        <div class="fb-section-lbl" style="color:#1e40af;border:1px solid #bfdbfe;background:#eff6ff;border-radius:6px;padding:3px 8px;display:inline-block"><i class="fas fa-list-ul"></i> Phân tích từng câu</div>
        <div style="display:flex;flex-direction:column;gap:8px">${rows}</div>
      </div>`;
    }

    // Legacy: corrections (for older graded attempts)
    const corrections = (td.corrections || []).map(c =>
      `<div class="fb-correction">
        <span class="fb-corr-orig">${escHtml(c.original)}</span>
        <span class="fb-corr-arrow">→</span>
        <span class="fb-corr-fixed">${escHtml(c.corrected)}</span>
        ${c.explanation ? `<div class="fb-corr-expl">${escHtml(c.explanation)}</div>` : ''}
      </div>`).join('');
    const suggestions = (td.suggestions || []).map(s =>
      `<li class="fb-suggestion">${escHtml(s)}</li>`).join('');

    return `<div class="fb-task-card">
      <div class="fb-task-header">
        <span class="fb-task-label">${label}</span>
        <span class="fb-task-band">${td.bandScore ?? '–'}</span>
      </div>
      ${bars}
      ${td.overallFeedback ? `<div class="fb-overall-txt">${escHtml(td.overallFeedback)}</div>` : ''}
      ${sfHtml}
      ${!sfItems.length && corrections ? `<div class="fb-section"><div class="fb-section-lbl fb-section-corr">Lỗi cần sửa</div>${corrections}</div>` : ''}
      ${!sfItems.length && suggestions ? `<div class="fb-section"><div class="fb-section-lbl fb-section-sugg">Gợi ý cải thiện</div><ul class="fb-sugg-list">${suggestions}</ul></div>` : ''}
    </div>`;
  }

  const dateStr = g.confirmedAt
    ? new Date(g.confirmedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return `<div class="fb-wrap">
    <div class="fb-wrap-header">
      <span class="fb-wrap-title"><i class="fas fa-chart-bar"></i> Kết quả chấm bài</span>
      <div class="fb-wrap-right">
        <div class="fb-wrap-band-lbl">Overall Band${dateStr ? ' · ' + dateStr : ''}</div>
        <div class="fb-wrap-band-num">${g.overallBand ?? '–'}</div>
      </div>
    </div>
    ${g.adminNote ? `<div class="fb-admin-note"><span class="fb-admin-note-lbl"><i class="fas fa-comment-dots"></i> Nhận xét từ giáo viên:</span> ${escHtml(g.adminNote)}</div>` : ''}
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
  const isPractice = a.submissionType === 'practice';
  const hasT1 = !isPractice || (a.wordCount1 || 0) > 0 || !!(a.task1Answer?.trim());
  const hasT2 = !isPractice || (a.wordCount2 || 0) > 0 || !!(a.task2Answer?.trim());

  // Use null for optional/conditional lines; '' for intentional blank lines
  const lines = [
    `ENGLISH WITH DAN – WRITING SUBMISSION`,
    `========================================`,
    `Đề: ${a.examName || ''}`,
    `Loại: ${isPractice ? 'Luyện tập' : 'Thi'}`,
    `Ngày nộp: ${date}`,
    hasT1 ? `Task 1: ${a.wordCount1 || 0} từ` : null,
    hasT2 ? `Task 2: ${a.wordCount2 || 0} từ` : null,
    ``,
  ];

  if (hasT1) {
    lines.push(
      `────────────────────────────────────────`,
      `TASK 1`,
      `────────────────────────────────────────`,
      t1.prompt || null,
      ``,
      a.task1Answer || '(Không có bài làm)',
      ``
    );
  }
  if (hasT2) {
    lines.push(
      `────────────────────────────────────────`,
      `TASK 2`,
      `────────────────────────────────────────`,
      t2.prompt || null,
      ``,
      a.task2Answer || '(Không có bài làm)',
    );
  }

  const blob = new Blob([lines.filter(l => l != null).join('\n')], { type: 'text/plain;charset=utf-8' });
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

function exitSamples() {
  history.pushState({ screen: 'key' }, '', 'writing.html');
  showScreen('screen-key');
  checkRestoreBanner();
}

async function loadWritingSamples() {
  history.pushState({ screen: 'samples' }, '', 'writing.html?view=samples');
  showScreen('screen-samples');

  // Reset filter state so chips and fetch are in sync when reopening screen
  sampleFilters.quarter  = 'all';
  sampleFilters.topic    = 'all';
  sampleFilters.taskType = 'all';

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
  const btn  = document.getElementById('btn-fullscreen');
  const icon = document.getElementById('fs-icon-exam');
  if (btn)  btn.title    = document.fullscreenElement ? 'Thoát toàn màn hình' : 'Toàn màn hình';
  if (icon) icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
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

// ──────────────────────────────────────────────────────
function openHistoryModal() {
  document.getElementById('wr-history-modal').classList.add('open');
  loadHistory();
}

function closeHistoryModal() {
  document.getElementById('wr-history-modal').classList.remove('open');
}

// Keyboard shortcuts
// ──────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const overlay = ['wr-history-modal', 'exit-modal-overlay', 'confirm-modal-overlay',
                   'review-modal-overlay', 'practice-exit-modal', 'practice-submit-modal'];
  for (const id of overlay) {
    const el = document.getElementById(id);
    if (el && el.classList.contains('open')) { el.classList.remove('open'); break; }
  }
});

// ══════════════════════════════════════════════════════
// PRACTICE MODE – Luyện Task 1 / Task 2 lẻ
// ══════════════════════════════════════════════════════
const practiceState = {
  taskType: null,
  task: null,
  tasks: [],
  filteredTasks: [],
  page: 1,
  wordCount: 0,
  stopwatchInterval: null,
  seconds: 0,
  hasPending: false
};

// ── Practice task list – pagination ─────────────────────
const PRACTICE_PAGE_SIZE = 8;

function _renderTaskPage() {
  const itemsEl = document.getElementById('practice-task-items');
  if (!itemsEl) return;
  const { filteredTasks, page, taskType } = practiceState;
  const total = (filteredTasks || []).length;
  const totalPages = Math.max(1, Math.ceil(total / PRACTICE_PAGE_SIZE));
  const curPage = Math.min(Math.max(1, page), totalPages);
  practiceState.page = curPage;
  const start = (curPage - 1) * PRACTICE_PAGE_SIZE;
  const pageTasks = (filteredTasks || []).slice(start, start + PRACTICE_PAGE_SIZE);

  if (!total) {
    itemsEl.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:24px">Không tìm thấy đề nào phù hợp.</p>';
    return;
  }

  const pendingBanner = practiceState.hasPending
    ? `<div class="wr-pending-notice" style="margin-bottom:12px"><p class="wr-pending-title">⏳ Bạn đang có bài chờ chấm</p><p class="wr-pending-desc">Vui lòng đợi giáo viên trả bài trước khi nộp bài mới. Bạn vẫn có thể đọc đề để chuẩn bị.</p></div>`
    : '';

  const cards = pageTasks.map((t, i) => {
    const idx = start + i + 1;
    const imgHtml = (taskType === 1 && t.imageUrl)
      ? `<img src="${escHtml(t.imageUrl)}" alt="" class="wt-task-card-img" />`
      : '';
    const promptPreview = (t.prompt || '').slice(0, 200) + ((t.prompt || '').length > 200 ? '…' : '');
    return `<div class="wt-task-card" data-id="${escHtml(String(t._id))}">
      <div class="wt-task-card-header">
        <span class="wt-task-card-num">${idx}</span>
        <button class="btn-primary wt-task-card-btn" onclick="event.stopPropagation();startPracticeTask(${taskType},'${t._id}')">Làm bài</button>
      </div>
      ${imgHtml}
      <div class="wt-task-card-prompt">${escHtml(promptPreview)}</div>
    </div>`;
  }).join('');

  const pgHtml = totalPages > 1
    ? `<div class="practice-pagination">
        <button class="practice-page-btn" onclick="goToTaskPage(${curPage - 1})" ${curPage <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Trước</button>
        <span class="practice-page-info">Trang ${curPage} / ${totalPages} &nbsp;·&nbsp; ${total} đề</span>
        <button class="practice-page-btn" onclick="goToTaskPage(${curPage + 1})" ${curPage >= totalPages ? 'disabled' : ''}>Sau <i class="fas fa-chevron-right"></i></button>
      </div>`
    : `<p style="text-align:center;font-size:12px;color:#9ca3af;padding:6px 0">${total} đề</p>`;

  itemsEl.innerHTML = pendingBanner + `<div class="wt-task-grid">${cards}</div>` + pgHtml;

  itemsEl.querySelectorAll('.wt-task-card').forEach(card => {
    card.addEventListener('click', () => startPracticeTask(taskType, card.dataset.id));
  });
}

function goToTaskPage(n) {
  const totalPages = Math.max(1, Math.ceil((practiceState.filteredTasks || []).length / PRACTICE_PAGE_SIZE));
  if (n < 1 || n > totalPages) return;
  practiceState.page = n;
  _renderTaskPage();
  const list = document.getElementById('practice-task-list');
  if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Deferred init: ?taskType=1/2 nav link — must run here because practiceState (const) is not
// hoisted and showPracticeTaskList accesses it before its first await.
(function() {
  var _p = new URLSearchParams(location.search);
  var _tt = parseInt(_p.get('taskType'));
  if ((_tt === 1 || _tt === 2) && !_p.get('taskId')) {
    showPracticeTaskList(_tt, false);
  }
})();

// ── Practice Auto-save (localStorage) ─────────────────
const _PRACTICE_SAVE_KEY = 'ews_practice_autosave';
const _PRACTICE_MAX_AGE  = 24 * 60 * 60 * 1000; // 24h

function savePracticeToStorage() {
  if (!practiceState.task) return;
  const ta = document.getElementById('pw-textarea');
  try {
    localStorage.setItem(_PRACTICE_SAVE_KEY, JSON.stringify({
      taskType:  practiceState.taskType,
      task:      practiceState.task,
      answer:    ta?.value || '',
      wordCount: practiceState.wordCount,
      seconds:   practiceState.seconds,
      savedAt:   Date.now()
    }));
    _updateSaveIndicator(Date.now());
  } catch (_) {}
}

function _updateSaveIndicator(ts) {
  const el = document.getElementById('pw-save-status');
  if (!el) return;
  const d  = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  el.innerHTML = `<i class="fas fa-check"></i> Đã lưu ${hh}:${mm}`;
  el.style.color  = '#16a34a';
}

function saveDraftManual() {
  if (!practiceState.task) return;
  savePracticeToStorage();
  saveDraftToServer();
  showToast('Đã lưu nháp ✓ — bạn có thể thoát và tiếp tục sau', 'success', 3000);
}

function loadPracticeFromStorage() {
  try {
    const raw = localStorage.getItem(_PRACTICE_SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.task) return null;
    if (Date.now() - saved.savedAt > _PRACTICE_MAX_AGE) {
      localStorage.removeItem(_PRACTICE_SAVE_KEY);
      return null;
    }
    return saved;
  } catch (_) { return null; }
}

function clearPracticeAutoSave() {
  localStorage.removeItem(_PRACTICE_SAVE_KEY);
}

// ── Server-side draft helpers ───────────────────
async function saveDraftToServer() {
  if (!practiceState.task) return;
  const ta = document.getElementById('pw-textarea');
  try {
    await apiFetch('/api/writing/practice/draft', {
      method: 'POST',
      body: JSON.stringify({
        taskType:  practiceState.taskType,
        task:      practiceState.task,
        answer:    ta?.value || '',
        wordCount: practiceState.wordCount,
        seconds:   practiceState.seconds
      })
    });
  } catch (_) {}
}

async function loadDraftFromServer() {
  try {
    const d = await apiFetch('/api/writing/practice/draft');
    if (!d.success || !d.draft) return null;
    return {
      taskType:  d.draft.taskType,
      task:      d.draft.task,
      answer:    d.draft.answer || '',
      wordCount: d.draft.wordCount || 0,
      seconds:   d.draft.seconds || 0,
      savedAt:   new Date(d.draft.savedAt).getTime()
    };
  } catch (_) { return null; }
}

function deleteDraftFromServer() {
  apiFetch('/api/writing/practice/draft', { method: 'DELETE' }).catch(() => {});
}

async function checkPracticeRestoreBanner() {
  let saved = loadPracticeFromStorage();
  if (!saved) {
    // Thử lấy từ server (dùng khi đổi thiết bị hoặc mất localStorage)
    saved = await loadDraftFromServer();
    if (saved) {
      try { localStorage.setItem(_PRACTICE_SAVE_KEY, JSON.stringify(saved)); } catch (_) {}
    }
  }
  const banner  = document.getElementById('practice-restore-banner');
  const descEl  = document.getElementById('practice-restore-desc');
  if (!banner) return;
  if (!saved) { banner.style.display = 'none'; return; }

  const wc = saved.wordCount || 0;
  const m  = String(Math.floor(saved.seconds / 60)).padStart(2, '0');
  const s  = String(saved.seconds % 60).padStart(2, '0');
  if (descEl) descEl.textContent = `Task ${saved.taskType} – ${wc} từ – đã viết ${m}:${s}`;
  banner.style.display = 'block';
}

function restorePracticeWrite() {
  if (practiceState.hasPending) {
    showToast('Bạn còn bài đang chờ chấm. Vui lòng đợi giáo viên trả bài.', 'info');
    return;
  }
  const saved = loadPracticeFromStorage();
  if (!saved) return;

  practiceState.taskType  = saved.taskType;
  practiceState.task      = saved.task;
  practiceState.tasks     = [saved.task];
  practiceState.wordCount = saved.wordCount || 0;
  practiceState.seconds   = saved.seconds   || 0;

  const banner = document.getElementById('practice-restore-banner');
  if (banner) banner.style.display = 'none';

  renderPracticeWriteScreen(saved.taskType, saved.task);
  const ta = document.getElementById('pw-textarea');
  if (ta) { ta.value = saved.answer || ''; onPracticeInput(); setTimeout(() => ta.focus(), 100); }
  // Restore save indicator with the time the draft was last saved
  if (saved.savedAt) _updateSaveIndicator(saved.savedAt);

  showScreen('screen-practice-write');
  startPracticeStopwatch(saved.seconds || 0);

  window.onbeforeunload = e => {
    if (practiceState.task) { e.preventDefault(); e.returnValue = ''; }
  };
}

function discardPracticeAutoSave() {
  clearPracticeAutoSave();
  deleteDraftFromServer();
  const banner = document.getElementById('practice-restore-banner');
  if (banner) banner.style.display = 'none';
}

function showPracticeMode(pushHistory = true) {
  const list      = document.getElementById('practice-task-list');
  const cards     = document.getElementById('practice-task-select');
  const histBody  = document.querySelector('#screen-practice .history-body');
  const histTitle = document.getElementById('practice-hist-title');
  if (list)  list.style.display  = 'none';
  if (cards) cards.style.display = '';
  if (histBody)  histBody.classList.remove('practice-split-mode');
  if (histTitle) histTitle.innerHTML = '<i class="fas fa-history"></i> Lịch sử luyện tập';
  if (pushHistory) history.pushState({ screen: 'practice' }, '', 'writing.html');
  checkPracticeRestoreBanner();
  showScreen('screen-practice');
  loadPracticeHistory();
}

async function loadPracticeHistory(taskTypeFilter = null) {
  const listEl = document.getElementById('practice-history-list');
  const noticeEl = document.getElementById('practice-pending-notice');
  const descEl   = document.getElementById('practice-pending-desc');
  listEl.innerHTML = '<div class="spinner"></div>';
  try {
    const d = await apiFetch('/api/writing/practice/history');
    const allAttempts = d.attempts || [];

    // Pending notice only in home mode (not in sidebar)
    if (!taskTypeFilter) {
      const pending = allAttempts.find(a => a.gradingStatus === 'pending' || a.gradingStatus === 'ai_done');
      practiceState.hasPending = !!pending;
      if (pending) {
        noticeEl.style.display = '';
        const taskLabel = ((pending.examName || '').includes('Task 1') || (pending.wordCount1 || 0) > 0) ? 'Task 1' : 'Task 2';
        const gradingLabel = pending.gradingStatus === 'ai_done' ? 'AI đã chấm, đang chờ giáo viên xác nhận' : 'đang chờ chấm';
        const date = new Date(pending.submittedAt).toLocaleDateString('vi-VN');
        descEl.textContent = `Bài ${taskLabel} nộp ngày ${date} ${gradingLabel}. Kết quả sẽ hiện trong lịch sử sau khi được xác nhận.`;
      } else {
        noticeEl.style.display = 'none';
      }
    }

    const attempts = taskTypeFilter
      ? allAttempts.filter(a => {
          const isT1 = (a.examName || '').includes('Task 1') || (a.wordCount1 || 0) > 0;
          return taskTypeFilter === 1 ? isT1 : !isT1;
        })
      : allAttempts;

    if (!attempts.length) {
      listEl.innerHTML = '<p style="color:#9ca3af;font-size:14px;text-align:center;padding:24px 0">Chưa có bài luyện tập nào.</p>';
      return;
    }

    const STATUS = {
      pending:   '<i class="fas fa-hourglass-half"></i> Chờ chấm',
      ai_done:   '<i class="fas fa-robot"></i> Chờ xác nhận',
      confirmed: '<i class="fas fa-check-circle"></i> Đã chấm'
    };
    const STATUS_COL = { pending: '#f59e0b', ai_done: '#f59e0b', confirmed: '#16a34a' };

    if (taskTypeFilter) {
      // Sidebar mode → compact card layout (table too wide for 280px column)
      listEl.innerHTML = attempts.map(a => {
        const isT1 = (a.examName || '').includes('Task 1') || (a.wordCount1 || 0) > 0;
        const wc   = isT1 ? (a.wordCount1 || 0) : (a.wordCount2 || 0);
        const band = a.grading?.overallBand;
        const status = a.gradingStatus || 'pending';
        const date = new Date(a.submittedAt).toLocaleDateString('vi-VN');
        const bandColor = band >= 7 ? '#16a34a' : band >= 5.5 ? '#2563eb' : band != null ? '#d97706' : '#9ca3af';
        return `
          <div class="phist-card" onclick="viewAttempt('${a._id}')">
            <div class="phist-card-top">
              <span class="phist-date">${date}</span>
              <span class="badge-wc">${wc}w</span>
            </div>
            <div class="phist-card-bottom">
              <span style="color:${STATUS_COL[status]||'#6b7280'};font-size:12px;font-weight:600">${STATUS[status]||status}</span>
              <span class="phist-band" style="color:${bandColor}">${band != null ? 'Band ' + band : '–'}</span>
            </div>
          </div>`;
      }).join('');
      return;
    }

    // Home mode → full table
    listEl.innerHTML = `<table class="history-table" style="width:100%">
      <thead><tr>
        <th>Task</th><th>Ngày nộp</th><th>Số từ</th><th>Trạng thái</th><th>Band</th><th></th>
      </tr></thead>
      <tbody>
      ${attempts.map(a => {
        const isT1 = (a.examName || '').includes('Task 1') || (a.wordCount1 || 0) > 0;
        const taskLabel = isT1 ? 'Task 1' : 'Task 2';
        const wc = isT1 ? (a.wordCount1 || 0) : (a.wordCount2 || 0);
        const band = a.grading?.overallBand;
        const status = a.gradingStatus || 'pending';
        const date = new Date(a.submittedAt).toLocaleDateString('vi-VN');
        return `<tr>
          <td><span class="badge-wc">${taskLabel}</span></td>
          <td style="font-size:13px;color:#6b7280">${date}</td>
          <td><span class="badge-wc">${wc}w</span></td>
          <td><span style="color:${STATUS_COL[status] || '#6b7280'};font-size:13px;font-weight:600">${STATUS[status] || status}</span></td>
          <td style="font-weight:700;color:${band >= 7 ? '#16a34a' : band >= 5.5 ? '#2563eb' : band != null ? '#d97706' : '#9ca3af'}">${band != null ? band : '–'}</td>
          <td><button class="btn-view-attempt" onclick="viewAttempt('${a._id}')">${status === 'confirmed' ? '<i class="fas fa-eye"></i> Xem' : '<i class="fas fa-file-alt"></i> Bài nộp'}</button></td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>`;
  } catch (e) {
    listEl.innerHTML = '<p style="color:#ef4444;font-size:13px">Không tải được lịch sử.</p>';
  }
}

async function showPracticeTaskList(taskType, pushHistory = true) {
  if (pushHistory) {
    history.pushState({ screen: 'practice-list', taskType }, '', `writing.html?taskType=${taskType}`);
  }
  practiceState.taskType = taskType;
  const listPanel  = document.getElementById('practice-task-list');
  const cardSelect = document.getElementById('practice-task-select');
  const titleEl    = document.getElementById('practice-list-title');
  const itemsEl    = document.getElementById('practice-task-items');
  const histTitle  = document.getElementById('practice-hist-title');
  const histBody   = document.querySelector('#screen-practice .history-body');

  titleEl.textContent = `Chọn đề Task ${taskType}`;
  if (histTitle) histTitle.innerHTML = `<i class="fas fa-history"></i> Lịch sử Task ${taskType}`;
  cardSelect.style.display = 'none';
  listPanel.style.display  = '';
  if (histBody) histBody.classList.add('practice-split-mode');
  itemsEl.innerHTML = '<div class="spinner"></div>';
  const searchEl = document.getElementById('writing-task-search');
  if (searchEl) searchEl.value = '';

  loadPracticeHistory(taskType);

  try {
    const d = await apiFetch(`/api/writing/practice/tasks?taskType=${taskType}`);
    if (!d.success || !d.tasks || !d.tasks.length) {
      itemsEl.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:24px">Chưa có đề bài nào. Vui lòng liên hệ giáo viên.</p>';
      return;
    }
    practiceState.tasks = d.tasks;
    practiceState.filteredTasks = d.tasks;
    practiceState.page = 1;
    _renderTaskPage();
  } catch (e) {
    itemsEl.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px">Lỗi tải đề: ${escHtml(e.message)}</p>`;
  }
}

function hidePracticeTaskList() {
  const histBody  = document.querySelector('#screen-practice .history-body');
  const histTitle = document.getElementById('practice-hist-title');
  document.getElementById('practice-task-list').style.display  = 'none';
  document.getElementById('practice-task-select').style.display = '';
  if (histBody)  histBody.classList.remove('practice-split-mode');
  if (histTitle) histTitle.innerHTML = '<i class="fas fa-history"></i> Lịch sử luyện tập';
  const s = document.getElementById('writing-task-search');
  if (s) s.value = '';
  history.pushState({ screen: 'practice' }, '', 'writing.html');
  loadPracticeHistory();
}

function filterWritingTasks(query) {
  const q = (query || '').trim().toLowerCase();
  practiceState.filteredTasks = q
    ? practiceState.tasks.filter(t => (t.prompt || '').toLowerCase().includes(q))
    : practiceState.tasks;
  practiceState.page = 1;
  _renderTaskPage();
}

function startPracticeTask(taskType, taskId, pushHistory = true) {
  if (practiceState.hasPending) {
    showToast('Bạn còn bài đang chờ chấm. Vui lòng đợi giáo viên trả bài trước khi làm bài mới.', 'info', 5000);
    return;
  }
  const task = practiceState.tasks.find(t => String(t._id) === String(taskId));
  if (!task) { showToast('Không tìm thấy đề bài', 'error'); return; }

  if (pushHistory) {
    history.pushState({ screen: 'practice-write', taskType, taskId }, '',
      `writing.html?taskType=${taskType}&taskId=${encodeURIComponent(taskId)}`);
  }
  practiceState.taskType  = taskType;
  practiceState.task      = task;
  practiceState.wordCount = 0;
  practiceState.seconds   = 0;

  clearPracticeAutoSave(); // Clear any stale draft when starting fresh
  renderPracticeWriteScreen(taskType, task);
  showScreen('screen-practice-write');
  startPracticeStopwatch(0);
  window.onbeforeunload = e => {
    if (practiceState.task) { e.preventDefault(); e.returnValue = ''; }
  };
  setTimeout(() => { const ta = document.getElementById('pw-textarea'); if (ta) ta.focus(); }, 100);
}

function renderPracticeWriteScreen(taskType, task) {
  const minWords = taskType === 1 ? 150 : 250;
  document.getElementById('pw-task-label').textContent = `Task ${taskType} – Luyện tập`;
  document.getElementById('pw-title-label').textContent = `Task ${taskType} – Luyện tập`;
  document.getElementById('pw-instructions-label').textContent = task.instructions || '';
  document.getElementById('pw-wc-target').textContent = `/ ${minWords} từ`;
  document.getElementById('pw-wc').textContent = '0';
  document.getElementById('pw-progress-bar').style.width = '0%';
  document.getElementById('pw-textarea').value = '';
  const si = document.getElementById('pw-save-status');
  if (si) { si.textContent = ''; }

  const leftPanel = document.getElementById('pw-left-panel');
  let html = '';
  if (taskType === 1 && task.imageUrl) {
    html += `<img src="${task.imageUrl}" alt="Task 1 image" style="max-width:100%;border-radius:8px;margin-bottom:12px;border:1px solid #e5e7eb" />`;
  }
  html += `<p style="font-size:13px;line-height:1.75;color:var(--text1,#111)">${escHtml(task.prompt || '')}</p>`;
  leftPanel.innerHTML = html;

  // Show/hide sample toggle bar based on whether sample exists
  const hasSample = Array.isArray(task.sampleSections) && task.sampleSections.some(s => s.content?.trim());
  const bar = document.getElementById('pw-sample-bar');
  if (bar) bar.style.display = hasSample ? '' : 'none';

  // Pre-build sample panel HTML with copy buttons
  const panel = document.getElementById('pw-sample-panel');
  if (panel && hasSample) {
    panel.innerHTML = task.sampleSections.filter(s => s.content?.trim()).map((s, i) => `
      <div class="pw-sample-section">
        <div class="pw-sample-section-title">
          <span>${escHtml(s.title)}</span>
          <button class="pw-copy-btn" onclick="copySampleSection(this,${i})" title="Sao chép đoạn này"><i class="fas fa-copy"></i> Copy</button>
        </div>
        <div class="pw-sample-section-body">${escHtml(s.content)}</div>
      </div>`).join('');
  } else if (panel) {
    panel.innerHTML = '';
  }

  // Reset sample toggle to OFF
  const chk = document.getElementById('pw-sample-chk');
  if (chk) chk.checked = false;
  togglePracticeSample(false);
}

function togglePracticeSample(on) {
  const writePanel  = document.getElementById('pw-write-panel');
  const samplePanel = document.getElementById('pw-sample-panel');
  const hint        = document.getElementById('pw-sample-hint');
  if (writePanel)  writePanel.style.display  = on ? 'none' : 'flex';
  if (samplePanel) {
    samplePanel.style.display = on ? 'flex' : 'none';
    if (on) samplePanel.scrollTop = 0;
  }
  if (hint) hint.style.display = on ? '' : 'none';
}

function copySampleSection(btn, idx) {
  const bodies = document.querySelectorAll('#pw-sample-panel .pw-sample-section-body');
  const text = bodies[idx]?.textContent || '';
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Đã copy';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
  }).catch(() => showToast('Không copy được', 'error'));
}

let _practiceSaveDebounce = null;
function onPracticeInput() {
  const ta = document.getElementById('pw-textarea');
  if (!ta) return;
  const words = ta.value.trim() === '' ? 0 : ta.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  practiceState.wordCount = words;
  const minWords = practiceState.taskType === 1 ? 150 : 250;
  const pct = Math.min(100, (words / minWords) * 100);
  document.getElementById('pw-wc').textContent = words;
  const inlineN = document.getElementById('pw-wc-inline-n');
  if (inlineN) inlineN.textContent = words;
  const bar = document.getElementById('pw-progress-bar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = words >= minWords ? '#22c55e' : words >= minWords * 0.8 ? '#f59e0b' : '#3d8bff';
  }
  // Show unsaved indicator immediately
  const si = document.getElementById('pw-save-status');
  if (si) { si.innerHTML = '<i class="fas fa-circle" style="font-size:7px;vertical-align:middle"></i> Chưa lưu'; si.style.color = '#f59e0b'; }
  // Debounced auto-save
  clearTimeout(_practiceSaveDebounce);
  _practiceSaveDebounce = setTimeout(savePracticeToStorage, 800);
}

function startPracticeStopwatch(startSeconds = 0) {
  clearInterval(practiceState.stopwatchInterval);
  practiceState.seconds = startSeconds;
  // Render immediately
  const el = document.getElementById('pw-stopwatch');
  if (el) el.textContent = `${String(Math.floor(practiceState.seconds / 60)).padStart(2,'0')}:${String(practiceState.seconds % 60).padStart(2,'0')}`;

  practiceState.stopwatchInterval = setInterval(() => {
    practiceState.seconds++;
    const m = String(Math.floor(practiceState.seconds / 60)).padStart(2, '0');
    const s = String(practiceState.seconds % 60).padStart(2, '0');
    const el = document.getElementById('pw-stopwatch');
    if (el) el.textContent = `${m}:${s}`;
    if (practiceState.seconds % 30 === 0) savePracticeToStorage();
    if (practiceState.seconds % 300 === 0) saveDraftToServer();
  }, 1000);
}

function stopPracticeStopwatch() {
  clearInterval(practiceState.stopwatchInterval);
}

function confirmExitPractice() {
  const ta = document.getElementById('pw-textarea');
  if (ta && ta.value.trim()) {
    document.getElementById('practice-exit-modal').classList.add('open');
  } else {
    exitPracticeWrite();
  }
}

function exitPracticeWrite() {
  document.getElementById('practice-exit-modal').classList.remove('open');
  stopPracticeStopwatch();
  savePracticeToStorage();
  saveDraftToServer();
  window.onbeforeunload = null;
  practiceState.task = null;
  showPracticeMode(); // handles pushState, split-mode cleanup, title reset, history load
}

function confirmSubmitPractice() {
  const ta = document.getElementById('pw-textarea');
  if (!ta || !ta.value.trim()) {
    showToast('Vui lòng viết bài trước khi nộp', 'error');
    return;
  }
  document.getElementById('ps-wc-confirm').textContent = practiceState.wordCount;
  document.getElementById('practice-submit-modal').classList.add('open');
}

async function submitPractice() {
  const ta = document.getElementById('pw-textarea');
  const answer = ta?.value.trim() || '';
  if (!answer) return;

  const btn = document.getElementById('btn-confirm-submit-practice');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang nộp...'; }

  try {
    const d = await apiFetch('/api/writing/practice/submit', {
      method: 'POST',
      body: JSON.stringify({
        taskType: practiceState.taskType,
        taskId: practiceState.task?._id,
        answer,
        wordCount: practiceState.wordCount
      })
    });
    if (!d.success) throw new Error(d.message || 'Lỗi nộp bài');

    stopPracticeStopwatch();
    clearPracticeAutoSave();
    deleteDraftFromServer();
    window.onbeforeunload = null;
    document.getElementById('practice-submit-modal').classList.remove('open');
    const label = `Task ${practiceState.taskType} (${practiceState.wordCount} từ)`;
    document.getElementById('pw-done-label').textContent = `Đã nộp ${label}`;
    showScreen('screen-practice-done');
  } catch (e) {
    showToast(e.message || 'Nộp bài thất bại', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Nộp bài'; }
  }
}
