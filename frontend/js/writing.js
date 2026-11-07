/* ═══════════════════════════════════════════════════════
   writing.js  –  EnglishWithDan Writing Module
═══════════════════════════════════════════════════════ */

const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';

// Force a fresh reload when this page is restored from the browser's
// back-forward cache (bfcache) — bfcache restores the exact in-memory JS
// instance from before navigation, bypassing the network entirely, so a
// browser that still has an OLD copy of this page open (from before a
// deploy) keeps running the OLD script forever on every back/forward nav,
// no matter how many times the server-side file gets fixed. Reported live:
// a modal-cleanup fix kept "not working" for a returning tab even though
// the deployed writing.js/.css both had the fix — this is why.
window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });

// escHtml() (js/shared/utils.js) only escapes &/</>/" — safe for plain HTML
// text/attribute content, but NOT for a value embedded inside a JS string
// literal in an onclick="...('...')" attribute: the browser HTML-decodes
// entities (including escAttr()'s &#39;) before compiling the attribute as
// JS, so a literal apostrophe in the source data still terminates the JS
// string early either way. This backslash-escapes the quote for the JS
// string itself, then entity-escapes the (double-quoted) HTML attribute
// delimiter around it — same pattern as dashboard.js's escH().
function escJsAttr(s) { return (s || '').replace(/\\/g, '\\\\').replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

// ──────────────────────────────────────────────────────
// Auth helpers
// ──────────────────────────────────────────────────────
// Delegates to AuthService (Phase 5) — kept as a local wrapper so the ~5
// existing call sites below don't need to change.
function getToken() { return window.AuthService ? window.AuthService.getToken() : localStorage.getItem('token'); }

// logout() moved to js/auth.js (single source of truth — Phase 3 audit
// found this local copy never cleared 'lastLoginAt', unlike auth.js's).

// apiFetch keeps its own request-building (URL/header logic unchanged)
// and delegates response-handling (401 check, cold-start detection, JSON
// parsing, error normalization) to the shared js/shared/api-client.js —
// single source of truth for that logic (Phase 3 audit).
async function apiFetch(path, opts = {}) {
  // skipAuthRedirect is ours, not fetch()'s — pull it out before spreading
  // the rest into RequestInit, and forward it to ApiClient so a caller can
  // opt OUT of the automatic hard-logout-on-401 (see submitExam()'s and
  // submitPractice()'s use — mirrors reading-v2.js's apiFetch).
  const { skipAuthRedirect, ...fetchOpts } = opts;
  const token = getToken();
  const res = await fetch(API + path, {
    ...fetchOpts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(fetchOpts.headers || {})
    }
  });
  return window.ApiClient.handleResponse(res, { skipAuthRedirect });
}

// showToast() moved to js/shared/toast.js (single source of truth —
// Phase 3 audit). Visual style/position is now the shared design
// (icon + bordered card, bottom-right stack) instead of this file's own
// bottom-center pill — a deliberate consistency normalization, not a bug.

// ──────────────────────────────────────────────────────
// Full-access upsell — /start, /submit and /practice/submit respond 403
// requiresPremium:true once a free account's 24h trial has expired (see
// backend/middleware/requirePremium.js). Reactive fallback for whenever the
// proactive hasPremiumAccess() check below can't run first (e.g. the trial
// expires mid-session, between the proactive check and the actual request).
// Returns true if it handled the error (caller should skip its own generic
// toast), false for any other error.
// ──────────────────────────────────────────────────────
function _handleQuotaError(e) {
  if (e?.status === 403 && e.body?.requiresPremium) {
    confirmDialog(
      'Cần nâng cấp Premium',
      e.body.message || 'Nâng cấp Premium để dùng không giới hạn.',
      () => { if (window.openUpgradeModal) openUpgradeModal(); else location.href = 'profile.html#plan'; },
      { confirmLabel: 'Nâng cấp ngay', confirmClass: 'btn-primary' }
    );
    return true;
  }
  return false;
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
  isSubmitting: false,
  currentAttemptId: null,    // set after submit
  currentAttemptData: null,  // for download
  // 'practice' (default) | 'simulation' — see reading-v2.js's identical
  // field for the full rationale.
  mode: 'practice',
  simAttemptId: null,        // Test Simulation only — the placeholder WritingAttempt's _id from /api/writing/start
};

// Set when this page is step 3/4 of a full mock test (?mock=<id>&skill=writing)
// — see the init() IIFE and shared/mock-test.js. Holds the assigned exam id
// so startExam() opens exactly that WritingExam, and makes #screen-done hand
// off to Speaking instead of ending here.
let _mockMode = false;
let _mockWritingExamId = null;

// ──────────────────────────────────────────────────────
// Screen management
// ──────────────────────────────────────────────────────
// "tra câu" sentence-lookup icon (js/shared/sentence-lookup.js) — and, since
// this feature shipped, dictionary-lookup.js's own double-click popup on the
// exam screen too (see the setupDictionaryDouble('exam-left-panel'/
// 'answer-textarea', ...) calls further down) — must not help while the
// live full exam is genuinely exam-like: the 4-skill Full Mock Test
// (_mockMode, always exam-like regardless of anything else) or a standalone
// Test Simulation attempt (state.mode === 'simulation'). Practice mode
// (state.mode === 'practice', the default) now allows both, even on the
// full #screen-exam — previously this screen always blocked hints outright
// with no mode concept at all; see reading-v2.js's identical gate for the
// full Practice/Test Simulation rationale. Also covers the separate
// per-task practice screen (#screen-practice-write) — its own
// practiceState.mode, checked here too, since the sentence-lookup owl
// reads this one global flag regardless of which screen is showing.
window.__ewsExamActive = () => (
  (!!document.getElementById('screen-exam')?.classList.contains('active') && (_mockMode || state.mode !== 'practice'))
  || (!!document.getElementById('screen-practice-write')?.classList.contains('active') && practiceState.mode === 'simulation')
);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (typeof window.hideTopNav === 'function') {
    const NAV_SCREENS = ['screen-key', 'screen-history', 'screen-practice', 'screen-samples', 'screen-writing-tips'];
    NAV_SCREENS.includes(id) ? window.showTopNav() : window.hideTopNav();
  }
  if (window.PhraseLookup) window.PhraseLookup.refresh();
}

// "Tra từ vựng" panel (js/shared/phrase-lookup.js) — type a Vietnamese/
// English phrase, AI returns the English phrase + examples. Practice only:
// shown on the full test (#screen-exam) and the single-task screen
// (#screen-practice-write) only while __ewsExamActive() says it's NOT a
// Test Simulation / Full Mock Test attempt. showScreen() re-checks it.
if (window.PhraseLookup) {
  window.PhraseLookup.init({
    isAllowed: () => {
      const on = id => !!document.getElementById(id)?.classList.contains('active');
      return (on('screen-exam') || on('screen-practice-write')) && !window.__ewsExamActive();
    },
  });
}

// ──────────────────────────────────────────────────────
// Chống dán bài từ ngoài vào — người học phải tự gõ bài Task 1 / Task 2.
// Chặn cả paste (Ctrl+V / menu chuột phải) và kéo-thả văn bản. Cùng cách
// làm với ô "Viết lại" (_rwPasteBlock) và ô transcript của Speaking — cả 3
// dùng chung js/shared/paste-guard.js (meme + thông báo hài hước thay vì
// toast khô khan như trước).
// Áp cho ô thi (#answer-textarea) và ô luyện tập (#pw-textarea) — cả hai
// đều là phần tử tĩnh trong writing.html nên gắn một lần là đủ.
// ──────────────────────────────────────────────────────
function _blockPasteInto(ta) {
  if (window.PasteGuard) window.PasteGuard.attach(ta, { hint: 'hãy tự gõ bài viết của bạn' });
}

(function _initPasteGuard() {
  const attach = () => {
    _blockPasteInto(document.getElementById('answer-textarea'));
    _blockPasteInto(document.getElementById('pw-textarea'));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();

// ──────────────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────────────
(function init() {
  // Delegates to the same AuthService.requirePageAuth() used by auth.js's
  // Guard 1 (Phase 5) — this used to be its own redundant `if(!token)`
  // check with no next= support, duplicating (and slightly diverging from)
  // the page-load guard that already ran before this script.
  if (window.AuthService ? !window.AuthService.requirePageAuth(false) : !getToken()) return;

  // Premium promo banner (site-wide UX unification, 2026-08-26) — same
  // browsable-with-a-nudge pattern as reading.html/listening.html/
  // speaking.html, replacing the previous "no visual indication at all
  // until you click something locked" gap. Actual gating is unchanged:
  // startExam()/submitPractice() below still do their own proactive
  // hasPremiumAccess() check + openUpgradeModal().
  const promoBanner = document.getElementById('premium-promo-banner');
  if (promoBanner) promoBanner.style.display = (window.AuthService && !window.AuthService.hasPremiumAccess()) ? 'flex' : 'none';

  // URL param routing: ?taskType=1/2&taskId=<id> (shareable), or ?taskType=1/2 (nav link to task list)
  const params = new URLSearchParams(location.search);
  const urlTaskType = parseInt(params.get('taskType'));
  const urlTaskId   = params.get('taskId');

  // ?examId=<id> — deep link from a teacher's Classroom assignment (see
  // dashboard-homework.js's hwResourceHref 'writing_exam' case), forcing
  // startExam() to open exactly that WritingExam instead of whichever one
  // its no-examId fallback (most-recently-created active exam) would pick.
  // Reuses _mockWritingExamId (not _mockMode — this is a normal exam
  // screen, not the full mock-test flow) since startExam() already forwards
  // whatever this variable holds.
  const urlExamId = params.get('examId');
  if (urlExamId) _mockWritingExamId = urlExamId;
  // ?exam=practice|simulation — mode-specific start link (RouteParams).
  const urlExamMode = window.RouteParams ? window.RouteParams.examMode() : null;

  // ?rewrite=<attemptId> — deep link from the cross-page rewrite reminder.
  // Checked FIRST and independently of the other routes (it used to sit
  // after the taskType branches, which `return` early, so it never fired
  // when the reminder landed on a practice-list URL). Opens the modal over
  // whatever screen the rest of init() then renders.
  const rewriteId = params.get('rewrite');
  if (rewriteId) {
    setTimeout(() => { try { openRewrite(rewriteId); } catch (_) {} }, 250);
  }

  if ((urlTaskType === 1 || urlTaskType === 2) && urlTaskId) {
    _openDirectPracticeTask(urlTaskType, urlTaskId, urlExamMode);
    return;
  }
  if (urlTaskType === 1 || urlTaskType === 2) {
    history.replaceState({ screen: 'practice-list', taskType: urlTaskType }, '',
      `writing.html?taskType=${urlTaskType}${rewriteId ? '&rewrite=' + encodeURIComponent(rewriteId) : ''}`);
    showScreen('screen-practice'); // switch screen now; task list loads after practiceState is defined (see deferred init below)
    return;
  }

  if (params.get('view') === 'samples') {
    loadWritingSamples();
    return;
  }

  if (params.get('view') === 'writing-tips') {
    openWritingTips(false);
    return;
  }

  // ?view=exam[&exam=…][&examId=…] — the full Writing test's own URL
  // (stamped by _setWritingExamUrl). An unfinished run on this device is
  // offered back via the restore banner; otherwise the mode popup opens
  // pre-selected — never a silent start.
  if (params.get('view') === 'exam' && !(window.MockTest && window.MockTest.active())) {
    checkRestoreBanner();
    if (!loadFromStorage()) startExam(null, urlExamMode);
    return;
  }

  // Full mock test, step 3/4 (?mock=<id>&skill=writing): open the assigned
  // writing exam straight away, no key screen.
  if (window.MockTest && window.MockTest.active() && window.MockTest.params().skill === 'writing') {
    (async () => {
      try {
        const mt = await window.MockTest.fetchCurrent();
        _mockWritingExamId = mt && mt.bundle && mt.bundle.writingExamId;
        if (!_mockWritingExamId) { showToast('Không tìm thấy đề Writing của bài thi thử', 'error'); location.href = 'dashboard.html'; return; }
        _mockMode = true;
        window.MockTest.showBanner('writing');
        // Run voided mid-Writing → save the essays so far for the teacher.
        if (window.MockTest.setDisqualifySaver) window.MockTest.setDisqualifySaver(_saveDisqualifiedWriting);
        // Mandatory screen share first — no exam clock runs behind its prompt.
        if (window.MockTest.ready) await window.MockTest.ready();
        await startExam();
      } catch (e) {
        showToast('Lỗi mở bài thi thử', 'error');
        location.href = 'dashboard.html';
      }
    })();
    return;
  }

  checkRestoreBanner();
})();

window.addEventListener('popstate', e => {
  const s = e.state?.screen;

  // Full exam in progress → a back/forward to an earlier writing.html screen
  // state (samples/tips/key that was pushed before the exam started) must not
  // leave the exam timer ticking in the background: it would keep autosaving
  // and eventually fire submitExam('timeout') on a screen the student already
  // left. Mirror forceExit() — stop everything but keep the localStorage
  // autosave, so the restore banner offers "Tiếp tục làm". The in-page "Thoát"
  // button and a real page-unload Back are already covered (confirmExit /
  // window.onbeforeunload).
  if (state.exam && !state.isSubmitting) {
    clearInterval(state.timerInterval);
    window.onbeforeunload = null;
    state.exam = null;
  }

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
  } else if (s === 'writing-tips') {
    showScreen('screen-writing-tips');
    initWritingTips();
  } else {
    showScreen('screen-key');
    checkRestoreBanner();
  }
});

async function _openDirectPracticeTask(taskType, taskId, examMode = null) {
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

    // Reopening the same shareable link shouldn't wipe an in-progress draft
    // for this exact task — startPracticeTask() always calls
    // clearPracticeAutoSave() and starts blank, which is correct for a
    // student picking a task from the list, but not for resuming via a
    // link they already started writing from (see commit 3d9cf30, which
    // fixed the same class of bug for browser back/forward navigation).
    const isSameTask = (d) => d && String(d.task?._id) === String(taskId) && d.taskType === taskType;
    let saved = loadPracticeFromStorage(taskType, taskId);
    if (!isSameTask(saved)) {
      const serverDrafts = await loadDraftsFromServer();
      saved = serverDrafts.find(isSameTask) || null;
    }
    if (isSameTask(saved)) {
      // Fresh task from the list, not the draft's copy — task2-practice.html's
      // lesson hand-off seeds this draft with only { _id, prompt }.
      _applyPracticeDraft({ ...saved, task });
    } else if (examMode === 'simulation' && window.ExamModeSelect) {
      // Simulation link: confirm first (proctored attempt), pre-selected.
      window.ExamModeSelect.open({
        skill: 'writing', preferred: 'simulation',
        onPractice: () => _startPracticeTaskWithMode(taskType, taskId, task, false, 'practice'),
        onSimulation: () => _startPracticeTaskWithMode(taskType, taskId, task, false, 'simulation'),
      });
    } else {
      startPracticeTask(taskType, taskId, false);
    }
  } catch (e) {
    showToast('Lỗi tải đề bài', 'error');
  }
}


// ──────────────────────────────────────────────────────
// Start exam (no access key required — gated by full-access trial/premium
// instead, same as Reading/Listening/Speaking. Proactive check mirrors
// reading-v2.js's startPractice() idiom; _handleQuotaError above is the
// reactive fallback if the trial expires mid-session.)
// ──────────────────────────────────────────────────────
// The running full test's URL: writing.html?view=exam&exam=<mode>[&examId=…].
// replaceState, not push — Back keeps leaving the page (onbeforeunload
// guard) exactly as before. Mock mode owns its own URL.
function _setWritingExamUrl(mode) {
  if (_mockMode) return;
  const u = new URL(location.href);
  const examId = u.searchParams.get('examId');
  const qs = `?view=exam&exam=${mode}${examId ? '&examId=' + encodeURIComponent(examId) : ''}`;
  history.replaceState({ screen: 'exam' }, '', `writing.html${qs}`);
}
function _clearWritingExamUrl() {
  if (_mockMode || new URLSearchParams(location.search).get('view') !== 'exam') return;
  history.replaceState({ screen: 'key' }, '', 'writing.html');
}

async function startExam(mode, preferred = null) {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) openUpgradeModal();
    return;
  }
  // Over the rewrite limit: show the rewrite list instead of starting.
  // Only on the first call (the mode popup re-enters with `mode` set).
  if (!_mockMode && !mode && await _blockedByRewriteGate()) return;
  // Full Mock Test (_mockMode) never shows this popup — it always runs
  // 'practice' mode (it has its own, separate proctoring already armed by
  // mock-test.js's own auto-start; see launchExam()'s guard below). A
  // standalone "Bắt đầu làm bài" click always asks first.
  if (!_mockMode && !mode && window.ExamModeSelect) {
    window.ExamModeSelect.open({
      skill: 'writing', preferred,
      onPractice: () => startExam('practice'),
      onSimulation: () => startExam('simulation'),
    });
    return;
  }
  mode = _mockMode ? 'practice' : (mode || 'practice');

  const btn = document.getElementById('btn-start');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...'; }

  try {
    const data = await apiFetch('/api/writing/start', {
      method: 'POST',
      body: JSON.stringify(Object.assign(
        _mockWritingExamId ? { examId: _mockWritingExamId } : {},
        { mode }
      ))
    });

    if (!data.success) {
      showToast(data.message || 'Không thể tải bài thi', 'error');
      return;
    }

    state.exam = data.exam;
    state.answers = { 1: '', 2: '' };
    state.flags   = { 1: false, 2: false };
    state.currentTask = 1;
    state.mode = data.mode || mode;
    state.simAttemptId = data.attemptId || null;
    // null, not 0 — launchExam() below tells "fresh start" apart from "restored
    // exam that had already timed out at secondsLeft:0" by whether this is set
    // yet at all; 0 is a real, meaningful value for the latter case.
    state.secondsLeft = null;

    _setWritingExamUrl(state.mode);
    launchExam();
  } catch (e) {
    if (e && e.status === 429 && e.body && e.body.code === 'SIMULATION_COOLDOWN') {
      showToast(e.body.message || 'Vui lòng đợi trước khi bắt đầu Test Simulation mới', 'error');
      return;
    }
    if (e?.status === 403 && e.body?.code === 'REWRITE_REQUIRED') { _openRewriteGate(e.body); return; }
    if (!_handleQuotaError(e)) showToast(e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-pen"></i> Bắt đầu làm bài'; }
  }
}

// ──────────────────────────────────────────────────────
// Launch exam UI
// ──────────────────────────────────────────────────────
function launchExam() {
  const exam = state.exam;
  const user = (window.AuthService ? window.AuthService.getUser() : null) || {};
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user.username || 'Candidate');

  document.getElementById('restore-banner').style.display = 'none';

  // Top bar candidate info
  document.getElementById('exam-candidate').textContent =
    `${displayName}  –  ${exam.name}`;

  // Timer – only reset if not restoring (secondsLeft already set by restoreExam,
  // including a legitimate 0 for an exam that had already timed out).
  if (state.secondsLeft == null) {
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

  // Dictionary lookup on the exam screen — previously never wired up at
  // all here (only the separate practice screen's pw-* containers were),
  // which incidentally blocked hints but for the wrong reason (no gate,
  // not a deliberate one) and left Practice mode with no dictionary access
  // on a full exam even though the feature spec requires it. Gated by the
  // same window.__ewsExamActive() this page already exposes for the "tra
  // câu" owl — idempotent (removes any previous listener), safe to call on
  // every launchExam().
  setupDictionaryDouble('exam-left-panel', 'writing-exam', () => !window.__ewsExamActive());
  setupDictionaryDouble('answer-textarea', 'writing-exam', () => !window.__ewsExamActive());

  // Full Mock Test (_mockMode) has its own proctoring already armed by
  // mock-test.js's own auto-start — never double-arm both engines. Guarded
  // against re-arming on every launchExam() call (restoreExam() calls this
  // too, e.g. on a page refresh) since ExamProctor.start() is already a
  // no-op while one is active, but isActive() lets this skip the (harmless
  // but pointless) call entirely.
  if (state.mode === 'simulation' && !_mockMode && window.ExamProctor && !window.ExamProctor.isActive()) {
    window.ExamProctor.start({
      skill: 'writing', attemptType: 'full', attemptId: state.simAttemptId,
      onDisqualified: () => {
        clearInterval(state.timerInterval);
        window.onbeforeunload = null;
        clearAutoSave();
        location.href = 'writing.html';
      },
      saveAnswers: _saveDisqualifiedWriting,
    });
  }
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

// Cached across ticks — renderTimer() fires every second from the interval
// in startTimer(), so re-querying these two ids each tick was wasted work.
let _timerDisplayEl = null;
let _examTimerEl = null;

function renderTimer() {
  if (!_timerDisplayEl) _timerDisplayEl = document.getElementById('timer-display');
  if (!_examTimerEl) _examTimerEl = document.getElementById('exam-timer');
  const el = _timerDisplayEl;
  const timerBar = _examTimerEl;
  if (state.timerHidden) { el.textContent = '--:--'; return; }

  // Clamp at 0 — a restored already-timed-out exam (secondsLeft:0) ticks to
  // -1 for one frame before startTimer()'s <=0 check auto-submits, which
  // rendered "-1:-1".
  const left = Math.max(0, state.secondsLeft);
  const m = Math.floor(left / 60);
  const s = left % 60;
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

  // Save current answer — skip when num already equals currentTask (the
  // initial render call from launchExam()/restoreExam(), not a real user
  // switch). At that point the textarea still holds whatever was left over
  // from the previous screen, not this task's answer, so saving it here
  // would clobber a just-restored answer with an empty string before it's
  // ever displayed (see restoreExam() in writing-autosave.js).
  if (num !== state.currentTask) {
    state.answers[state.currentTask] = document.getElementById('answer-textarea').value;
  }

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
    // Prompt text first, then the chart/diagram — matches the actual IELTS
    // paper layout (read the instructions, then look at the graph).
    leftPanel.innerHTML = `
      <div class="task-prompt" style="white-space:pre-wrap">${escHtml(task.prompt || '')}</div>
      ${task.imageUrl ? `<img src="${escHtml(task.imageUrl)}" alt="Task 1 chart/diagram" loading="lazy" style="max-width:100%;border-radius:8px;margin-top:12px" />` : ''}
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
// Cached across keystrokes — onAnswerInput's chain (updateWordCount →
// updateFooterWcSummary) re-queried these same 6 ids on every keystroke;
// none of them are ever removed/recreated during an exam session.
let _answerTextareaEl = null;
function onAnswerInput() {
  if (!_answerTextareaEl) _answerTextareaEl = document.getElementById('answer-textarea');
  const text = _answerTextareaEl.value;
  state.answers[state.currentTask] = text;
  updateWordCount(text);
  clearTimeout(_saveDebounce);
  _saveDebounce = setTimeout(saveToStorage, 800);
}

const _WC_TARGETS = { 1: 150, 2: 250 };
let _wordCountEl = null, _wordCountTargetEl = null, _wcProgressBarEl = null;

function updateWordCount(text) {
  const wc     = countWords(text);
  const target = _WC_TARGETS[state.currentTask] || 150;
  const pct    = wc / target;

  let color;
  if (wc >= target)       color = '#16a34a';
  else if (pct >= 0.8)    color = '#f59e0b';
  else                    color = '#6b7280';

  if (!_wordCountEl) _wordCountEl = document.getElementById('word-count');
  const wcEl = _wordCountEl;
  if (wcEl) { wcEl.textContent = wc; wcEl.style.color = color; }

  if (!_wordCountTargetEl) _wordCountTargetEl = document.getElementById('word-count-target');
  const targetEl = _wordCountTargetEl;
  if (targetEl) { targetEl.textContent = `/ ${target} từ`; targetEl.style.color = color; }

  // Progress bar
  if (!_wcProgressBarEl) _wcProgressBarEl = document.getElementById('wc-progress-bar');
  const bar = _wcProgressBarEl;
  if (bar) {
    bar.style.width = Math.min(pct * 100, 100).toFixed(1) + '%';
    bar.className = 'wc-progress-bar' + (wc >= target ? ' met' : pct >= 0.8 ? ' near' : '');
  }

  updateFooterWcSummary();
}

let _footerWc1El = null, _footerWc2El = null;
function updateFooterWcSummary() {
  if (!_footerWc1El) _footerWc1El = document.getElementById('footer-wc1');
  if (!_footerWc2El) _footerWc2El = document.getElementById('footer-wc2');
  const wc1El = _footerWc1El;
  const wc2El = _footerWc2El;
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
// The proctor voided the attempt (Simulation, or the Full Mock Test run):
// send the essays written so far with disqualified:true — saved for the
// teacher but kept voided (writingService.submitExam). Resolves to the
// attempt id.
function _saveDisqualifiedWriting() {
  if (!state.exam) return Promise.resolve(null);
  const ta = document.getElementById('answer-textarea');
  if (ta) state.answers[state.currentTask] = ta.value;
  if (!(state.answers[1] || '').trim() && !(state.answers[2] || '').trim()) return Promise.resolve(null);
  return apiFetch('/api/writing/submit', {
    method: 'POST', keepalive: true, skipAuthRedirect: true,
    body: JSON.stringify({
      examId: state.exam._id,
      task1Id: state.exam.task1?._id,
      task2Id: state.exam.task2?._id,
      task1Answer: state.answers[1] || '',
      task2Answer: state.answers[2] || '',
      timeTaken: Math.max(0, (state.totalSeconds || 0) - (state.secondsLeft || 0)),
      attemptId: state.mode === 'simulation' ? state.simAttemptId : undefined,
      disqualified: true,
    }),
  }).then(d => (d && d.attemptId) || null);
}

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
  if (state.isSubmitting) return;
  state.isSubmitting = true;
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

  // Abort a hung submit after 30s (a cold-started backend used to leave the
  // "Đang nộp bài…" overlay spinning forever with no way out — reading/
  // listening already guard this).
  const _ctrl = new AbortController();
  const _killer = setTimeout(() => _ctrl.abort(), 30000);

  try {
    // skipAuthRedirect: a 401 here (session expired mid-exam) must not let
    // ApiClient hard-redirect to login right now — see the 401 branch below
    // (mirrors reading-v2.js / listening.html, see incident memory: a
    // proctor's beforeunload listener staying armed through a 401-triggered
    // redirect pops the browser's native "leave site" dialog and strands
    // the student with a wiped token).
    const data = await apiFetch('/api/writing/submit', {
      method: 'POST',
      signal: _ctrl.signal,
      skipAuthRedirect: true,
      body: JSON.stringify({
        examId:      state.exam._id,
        task1Id:     state.exam.task1?._id,
        task2Id:     state.exam.task2?._id,
        task1Answer: state.answers[1],
        task2Answer: state.answers[2],
        wordCount1:  wc1,
        wordCount2:  wc2,
        timeTaken,
        status,
        // Test Simulation only — undefined for Practice/Mock, so the
        // backend takes the exact same insert path it always has.
        attemptId: state.mode === 'simulation' ? state.simAttemptId : undefined,
      })
    });
    clearTimeout(_killer);
    overlay.style.display = 'none';

    if (data.success) {
      if (state.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
      clearAutoSave();
      _clearWritingExamUrl();
      state.currentAttemptId = data.attemptId;
      if (window.showBadgeUnlocked && data.newlyUnlocked?.length) window.showBadgeUnlocked(data.newlyUnlocked);
      // Done screen
      document.getElementById('done-exam-name').textContent = state.exam.name;
      document.getElementById('done-wc1').textContent = wc1;
      document.getElementById('done-wc2').textContent = wc2;
      showScreen('screen-done');

      // Full mock test: Writing is done. Speaking is now a SEPARATE, self-
      // started step — advance() returns a sitting break, so this sends the
      // student back to the dashboard to tap "Bắt đầu Speaking" when ready
      // (e.g. once a teacher is free to run Speaking live). Writing is graded
      // later (teacher/AI), so no band is available now — that's expected.
      if (_mockMode && window.MockTest && window.MockTest.active()) {
        showToast('Đã nộp Writing. Quay lại trang chủ — khi sẵn sàng, bấm "Bắt đầu Speaking".', 'success');
        setTimeout(() => window.MockTest.advance('writing', data.attemptId), 1400);
        return;
      }

      // Priority 2C — only for a session launched via the Today's Learning
      // popup's "Start" button. Writing has no immediate score (teacher/AI
      // grading happens later), so this never fabricates one — see §12.
      if (window.EWSLearning && window.EWSLearning.consumeStart('writing')) {
        window.EWSLearning.showReviewPopup('writing', {
          emoji: '✍️',
          scoreLabel: 'Đã nộp',
          nextAction: 'Tự xem lại bài viết, rồi tiếp tục lộ trình. Feedback sẽ hiện ở đây sau khi được chấm.',
        });
      }
    } else {
      state.isSubmitting = false;
      showToast('Lỗi nộp bài: ' + (data.message || 'Vui lòng thử lại'), 'error');
    }
  } catch (e) {
    clearTimeout(_killer);
    state.isSubmitting = false;
    overlay.style.display = 'none';
    // /api/writing/submit is now full-access gated (BUG-A02) like /start and
    // /practice/submit — handle a mid-exam trial expiry the same way they do
    // (upgrade prompt, not a bare error toast).
    if (e?.status === 403 && e.body?.code === 'REWRITE_REQUIRED') { _openRewriteGate(e.body); return; }
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(e.message || ''));
    if (aborted || e?.coldStart || e?.status === 502 || e?.status === 503) {
      showToast('Nộp bài quá lâu — server có thể đang khởi động. Bài của bạn vẫn được lưu tự động; hãy thử nộp lại sau vài giây.', 'error', 8000);
      return;
    }
    // A 401 here means the session expired mid-exam (mirrors reading-v2.js /
    // listening.html — see incident memory). Without skipAuthRedirect above,
    // ApiClient would already have hard-redirected to login while a proctor's
    // own beforeunload listener was still armed (Mock's stopProctor()/
    // Simulation's ExamProctor.stop() only ever run after a successful
    // submit), tripping the native "Leave site?" dialog and losing the token
    // before the student could react. Disarm both proctors ourselves,
    // explain plainly, and send them to log back in on THIS SAME page — the
    // autosaved draft is untouched, so they can resume and retry submit.
    if (e && e.status === 401) {
      if (window.MockTest && window.MockTest.stopProctor) window.MockTest.stopProctor();
      if (state.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
      showToast('Phiên đăng nhập đã hết hạn — bài làm của bạn vẫn được lưu, hãy đăng nhập lại để nộp bài.', 'info', 6000);
      if (window.AuthService && window.AuthService.clearSession) window.AuthService.clearSession();
      const next = (window.AuthService && window.AuthService.buildLoginUrl)
        ? window.AuthService.buildLoginUrl(location.pathname + location.search)
        : ('/login.html?next=' + encodeURIComponent(location.pathname + location.search));
      location.href = next;
      return;
    }
    if (!_handleQuotaError(e)) showToast('Lỗi nộp bài: ' + e.message, 'error');
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
    let rwCell;
    if (a.gradingStatus !== 'confirmed' || _isStaffUser()) {
      rwCell = '<span style="color:#d1d5db">–</span>';
    } else if (a.rewrite?.done) {
      rwCell = '<span style="color:#15803d;font-size:12px;font-weight:700">✅ Đã viết lại</span>';
    } else if (_rewriteRequired(a)) {
      rwCell = `<button class="btn-view-attempt" style="background:#fffbeb;border-color:#fde68a;color:#92400e" onclick="openRewrite('${a._id}')"><i class="fas fa-pen-fancy"></i> Viết lại</button>`;
    } else {
      rwCell = `<button class="btn-view-attempt" style="opacity:.7" onclick="openRewrite('${a._id}')" title="Không bắt buộc">Viết lại</button>`;
    }
    return `
      <tr>
        <td>${typeBadge}${escHtml(a.examName || '–')}</td>
        <td>${t1badge}</td>
        <td>${t2badge}</td>
        <td>${scoreBadge}</td>
        <td style="text-align:center">${rwCell}</td>
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
    <div class="rw-pending-banner" style="display:none;align-items:center;gap:10px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#92400e">
      <i class="fas fa-pen-fancy"></i>
      <span>Bạn có <b class="rw-pending-count">0</b> bài đã chấm chưa viết lại. Có 2 bài chưa viết lại sẽ bị chặn làm bài mới.</span>
    </div>
    <table class="history-table">
      <thead>
        <tr>
          <th>Đề thi</th>
          <th>Task 1</th>
          <th>Task 2</th>
          <th>Band</th>
          <th>Viết lại</th>
          <th>Ngày nộp</th>
          <th>TG</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  _refreshRewriteBanner();
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
    const _ctrl = new AbortController();
    const _killer = setTimeout(() => _ctrl.abort(), 15000);
    let data;
    try { data = await apiFetch(`/api/writing/attempt/${id}`, { signal: _ctrl.signal }); }
    finally { clearTimeout(_killer); }
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

    // "Viết lại" CTA — only for a graded essay.
    const rw = a.rewrite || {};
    let rewriteCtaHtml = '';
    if (a.gradingStatus === 'confirmed' && !_isStaffUser()) {
      if (rw.done) {
        rewriteCtaHtml = `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#166534;display:flex;align-items:center;justify-content:space-between;gap:10px">
              <span><i class="fas fa-check-circle"></i> Bạn đã viết lại bài này${rw.submittedAt ? ' · ' + new Date(rw.submittedAt).toLocaleDateString('vi-VN') : ''}.</span>
              <button class="btn-secondary" style="flex-shrink:0" onclick="openRewrite('${a._id}')">Xem / sửa lại</button>
            </div>`;
      } else if (_rewriteRequired(a)) {
        rewriteCtaHtml = `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#92400e;display:flex;align-items:center;justify-content:space-between;gap:10px">
              <span><i class="fas fa-pen-fancy"></i> Đọc kĩ các lỗi, ghi vào vở, rồi viết lại bài này dựa trên feedback để không lặp lại lỗi.</span>
              <button class="btn-primary" style="flex-shrink:0" onclick="openRewrite('${a._id}')"><i class="fas fa-pen-fancy"></i> Viết lại bài</button>
            </div>`;
      } else {
        rewriteCtaHtml = `<div style="background:var(--surface2,#f9fafb);border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12.5px;color:var(--text3,#6b7280);display:flex;align-items:center;justify-content:space-between;gap:10px">
              <span>Bài trước ngày áp dụng — viết lại là <b>không bắt buộc</b>.</span>
              <button class="btn-secondary" style="flex-shrink:0" onclick="openRewrite('${a._id}')">Viết lại (tùy chọn)</button>
            </div>`;
      }
    }

    document.getElementById('review-modal-body').innerHTML = `
      ${statusBannerHtml}
      ${rewriteCtaHtml}
      ${feedbackHtml}
      ${showT1Section ? `<div class="review-task-section">
        <h4>Task 1 – ${a.wordCount1 || 0} từ</h4>
        ${t1Img ? `<img src="${escHtml(t1Img)}" loading="lazy" style="max-width:100%;border-radius:6px;margin-bottom:8px" />` : ''}
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
    setupDictionaryDouble('review-modal-body', 'writing-review');
  } catch (e) {
    const cold = e && (e.name === 'AbortError' || /abort/i.test(e.message || '') || e.coldStart || e.status === 502 || e.status === 503);
    document.getElementById('review-modal-body').innerHTML =
      `<div style="padding:20px;text-align:center">
        <p style="color:#e53935;margin-bottom:12px">${cold ? 'Tải bài quá lâu — server có thể đang khởi động. Thử lại sau vài giây.' : escHtml(e?.message || 'Không tải được bài làm.')}</p>
        <button class="btn-primary" onclick="viewAttempt('${id}')">Thử lại</button>
      </div>`;
  }
}

function closeReviewModal() {
  document.getElementById('review-modal-overlay').classList.remove('open');
  _currentViewData = null;
}

// ──────────────────────────────────────────────────────
// "Viết lại" (rewrite) — left: graded essay + feedback · right: hand-typed
// rewrite. Not re-graded; the teacher just monitors that it was done.
// Paste is blocked (same as the Speaking transcript box) — type it yourself.
// ──────────────────────────────────────────────────────
const RW_MIN = { 1: 150, 2: 250 };
let _rwState = null; // { attemptId, gradedTasks:[1,2] }

// Essays graded before this date are grandfathered — rewrite is optional,
// not counted toward the gate. Keep in sync with REWRITE_CUTOFF in
// backend/services/writingService.js.
const REWRITE_CUTOFF = new Date('2026-08-29T00:00:00+07:00');
// Admin/teacher never owe a rewrite — no "Viết lại" buttons/CTAs for them.
function _isStaffUser() {
  return !!(window.AuthService && window.AuthService.isStaff && window.AuthService.isStaff());
}
function _rewriteRequired(a) {
  return a && a.gradingStatus === 'confirmed'
    && a.grading && a.grading.confirmedAt
    && new Date(a.grading.confirmedAt) >= REWRITE_CUTOFF
    && !(a.rewrite && a.rewrite.bypassed);
}

function _rwPasteBlock(ta) {
  if (window.PasteGuard) window.PasteGuard.attach(ta, { hint: 'hãy tự gõ tay bài viết lại của bạn' });
  ta.addEventListener('input', () => { _rwUpdateCounts(); _rwSaveDraft(); });
}

// Local (per-device) autosave so a reload / accidental close doesn't lose a
// long rewrite. Cleared only on a successful submit.
function _rwDraftKey() { return _rwState ? 'rw_draft_' + _rwState.attemptId : null; }
function _rwSaveDraft() {
  const key = _rwDraftKey();
  if (!key) return;
  const d = {};
  _rwState.gradedTasks.forEach(n => { d['task' + n] = document.getElementById('rw-ta-' + n)?.value || ''; });
  try { localStorage.setItem(key, JSON.stringify(d)); } catch (_) {}
}
function _rwLoadDraft(attemptId) {
  try { return JSON.parse(localStorage.getItem('rw_draft_' + attemptId) || 'null'); } catch (_) { return null; }
}
function _rwClearDraft(attemptId) {
  try { localStorage.removeItem('rw_draft_' + attemptId); } catch (_) {}
}

function _rwUpdateCounts() {
  if (!_rwState) return;
  let allOk = true;
  _rwState.gradedTasks.forEach(n => {
    const ta = document.getElementById('rw-ta-' + n);
    const wcEl = document.getElementById('rw-wc-' + n);
    if (!ta || !wcEl) return;
    const wc = countWords(ta.value);
    const ok = wc >= RW_MIN[n];
    if (!ok) allOk = false;
    wcEl.textContent = `${wc} / ${RW_MIN[n]} từ tối thiểu` + (ok ? ' ✓' : '');
    wcEl.className = 'rw-wc ' + (ok ? 'ok' : 'short');
    _rwCheckRepeats(n, ta.value);
  });
  const btn = document.getElementById('rw-submit-btn');
  if (btn) btn.disabled = !allOk;
}

// Draft 2 checklist: the graded errors of this task, and a live warning when
// the rewrite still contains one of them. Only errors that can be spotted
// reliably are watched: a phrase of 2+ words, or a misspelt word. A single
// common word ("thinks", "the") is too often correct somewhere else, so it
// is watched together with its neighbours in the original sentence
// ("people thinks that").
function _rwWithNeighbours(sentence, word) {
  const clean = w => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  const toks = String(sentence || '').split(/\s+/).map(clean).filter(Boolean);
  const i = toks.findIndex(t => t.toLowerCase() === word.toLowerCase());
  return i === -1 ? '' : toks.slice(Math.max(0, i - 1), i + 2).join(' ');
}

function _rwBuildChecks(td) {
  const out = [];
  ((td && td.sentenceFeedback) || []).forEach(s => {
    _fbErrors(s).forEach(e => {
      const wrong = String(e.wrong || '').trim();
      if (!wrong) return;
      const item = { wrong, fix: String(e.fix || '').trim(), cat: e.category, re: null };
      const words = wrong.split(/\s+/).length;
      const lw = wrong.toLowerCase(), lf = item.fix.toLowerCase();
      let phrase = (words >= 2 || e.category === 'spelling') ? wrong : _rwWithNeighbours(s.original, wrong);
      if (phrase.split(/\s+/).length < 2 && e.category !== 'spelling') phrase = '';
      if (phrase) {
        try {
          const pat = phrase.split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
          item.re = new RegExp('(?<![\\p{L}\\p{N}])' + pat + '(?![\\p{L}\\p{N}])', 'iu');
        } catch (_) { item.re = null; }
        // Never warn about text the correction itself contains.
        if (item.re && (item.re.test(item.fix) || item.re.test(String(s.better || '')))) item.re = null;
      }
      if (!out.some(o => o.wrong.toLowerCase() === lw && o.fix.toLowerCase() === lf)) out.push(item);
    });
  });
  return out;
}

function _rwChecklistHtml(n) {
  const items = (_rwState && _rwState.checks[n]) || [];
  if (!items.length) return '';
  return `<details class="rw-chk" open>
    <summary><i class="fas fa-clipboard-check"></i> Lỗi cũ cần tránh khi viết lại (${items.length})</summary>
    <ul>${items.map((it, i) => `<li id="rw-chk-${n}-${i}"><s>${escHtml(it.wrong)}</s> → <b>${escHtml(it.fix || '(bỏ đi)')}</b>${it.cat && FB_ERR_CAT[it.cat] ? ` <span class="rw-chk-cat">${escHtml(FB_ERR_CAT[it.cat])}</span>` : ''}</li>`).join('')}</ul>
  </details>`;
}

function _rwCheckRepeats(n, text) {
  const box = document.getElementById('rw-rep-' + n);
  const items = (_rwState && _rwState.checks[n]) || [];
  if (!box) return;
  const hits = [];
  items.forEach((it, i) => {
    const hit = !!(it.re && text && it.re.test(text));
    document.getElementById(`rw-chk-${n}-${i}`)?.classList.toggle('hit', hit);
    if (hit) hits.push(it);
  });
  box.style.display = hits.length ? '' : 'none';
  box.innerHTML = hits.length
    ? `<i class="fas fa-exclamation-triangle"></i> Em đang lặp lại lỗi cũ: ` +
      hits.map(h => `<b>“${escHtml(h.wrong)}”</b> → nên viết <b>“${escHtml(h.fix)}”</b>`).join('; ')
    : '';
}

async function openRewrite(attemptId) {
  document.getElementById('review-modal-overlay')?.classList.remove('open');
  const overlay = document.getElementById('rewrite-modal-overlay');
  const body = document.getElementById('rewrite-modal-body');
  // Stale cached writing.html (missing the new modal markup): can't open the
  // modal at all — tell the student to hard-reload rather than throw.
  if (!overlay || !body) {
    if (window.showToast) showToast('Trang đang dùng bản cũ. Nhấn Ctrl+Shift+R (hoặc Cmd+Shift+R) để tải lại rồi thử lại.', 'error', 8000);
    return;
  }
  overlay.classList.add('open');
  body.innerHTML = `<div style="text-align:center;padding:36px"><div class="spinner"></div>
    <div style="margin-top:14px;font-size:12.5px;color:var(--text3,#9ca3af)">Đang tải bài…</div></div>`;
  const submitBtn = document.getElementById('rw-submit-btn');
  if (submitBtn) submitBtn.disabled = true;

  try {
    let a;
    // Fast path: viewAttempt() just fetched this exact attempt — reuse it,
    // no second request (this is the button students actually click, and it
    // removes the network round-trip that was leaving the modal spinning).
    if (_currentViewData && String(_currentViewData._id) === String(attemptId)) {
      a = _currentViewData;
    } else {
      // Otherwise fetch, but ABORT after 15s so a cold-started / unreachable
      // backend can't leave the modal spinning forever.
      const ctrl = new AbortController();
      const killer = setTimeout(() => ctrl.abort(), 15000);
      let data;
      try {
        data = await apiFetch(`/api/writing/attempt/${attemptId}`, { signal: ctrl.signal });
      } finally { clearTimeout(killer); }
      if (!data || !data.success) throw new Error((data && data.message) || 'Không tải được bài.');
      a = data.attempt;
    }
    if (!a || a.gradingStatus !== 'confirmed' || !a.grading) {
      throw new Error('Bài này chưa được chấm xong nên chưa thể viết lại.');
    }

    const g = a.grading;
    const gradedTasks = [
      (g.task1 && g.task1.bandScore != null) && 1,
      (g.task2 && g.task2.bandScore != null) && 2,
    ].filter(Boolean);
    _rwState = { attemptId, gradedTasks, checks: {} };
    gradedTasks.forEach(n => { _rwState.checks[n] = _rwBuildChecks(g['task' + n]); });

    const t1 = a.task1Snapshot || {}, t2 = a.task2Snapshot || {};
    const prev = a.rewrite || {};
    // Prefill order: a previously-submitted rewrite (server) → an unsaved
    // local draft → empty.
    const draft = (prev.task1 || prev.task2) ? null : _rwLoadDraft(attemptId);
    const rightCol = gradedTasks.map(n => {
      const prompt = n === 1 ? (t1.prompt || '') : (t2.prompt || '');
      const img = n === 1 ? (t1.imageUrl || '') : '';
      const pre = (n === 1 ? prev.task1 : prev.task2) || (draft && draft['task' + n]) || '';
      return `<div class="rw-task-box">
        <h4>Task ${n} — viết lại (tối thiểu ${RW_MIN[n]} từ)</h4>
        ${prompt ? `<div class="rw-prompt">${escHtml(prompt)}</div>` : ''}
        ${img ? `<img class="rw-chart-img" src="${escHtml(img)}" alt="Biểu đồ / hình Task ${n}" loading="lazy">` : ''}
        ${_rwChecklistHtml(n)}
        <textarea class="rw-ta" id="rw-ta-${n}" placeholder="Gõ bài viết lại của bạn ở đây... (không dán được)">${escHtml(pre)}</textarea>
        <div class="rw-wc short" id="rw-wc-${n}">0 / ${RW_MIN[n]} từ tối thiểu</div>
        <div class="rw-repeat" id="rw-rep-${n}" style="display:none"></div>
      </div>`;
    }).join('');

    const leftCol = `
      <div class="rw-note rw-note-warn">
        <div class="rw-note-title"><i class="fas fa-book-open"></i> Viết lại không phải là chép lại!</div>
        <ol>
          <li><b>Đọc kĩ từng lỗi</b> giáo viên chỉ ra bên dưới — hiểu vì sao sai và sửa thế nào.</li>
          <li><b>Ghi các lỗi vào vở</b> (lỗi sai → cách sửa đúng) để xem lại trước mỗi bài viết sau.</li>
          <li>Rồi mới <b>tự viết lại</b> bài cho tốt hơn, chú ý không lặp lại các lỗi đó. Danh sách <b>"Lỗi cũ cần tránh"</b> bên phải sẽ báo đỏ nếu em viết lại đúng lỗi cũ.</li>
        </ol>
        <div class="rw-note-foot">Bài viết lại <b>không chấm điểm</b> — nhưng chỉ chép lại mà không hiểu lỗi thì bài sau bạn vẫn sẽ sai y như cũ.</div>
      </div>
      ${_buildStudentFeedback(g)}
      ${_buildAiFeedbackBlock(a.aiGrading)}
      ${gradedTasks.map(n => {
        const orig = n === 1 ? (a.task1Answer || '') : (a.task2Answer || '');
        return `<div class="rw-task-box"><h4>Bài gốc — Task ${n} (${n === 1 ? (a.wordCount1 || 0) : (a.wordCount2 || 0)} từ)</h4>
          <div class="rw-orig">${escHtml(orig || '(Không có bài làm)')}</div></div>`;
      }).join('')}`;

    body.innerHTML = `<div class="rw-split">
      <div class="rw-col rw-col-left">${leftCol}</div>
      <div class="rw-col rw-col-right">${rightCol}</div>
    </div>`;

    const titleEl = document.getElementById('rewrite-modal-title');
    if (titleEl) titleEl.innerHTML =
      `<i class="fas fa-pen-fancy"></i> Viết lại: ${escHtml(a.examName || ('Task ' + gradedTasks.join(' + ')))}`;
    gradedTasks.forEach(n => _rwPasteBlock(document.getElementById('rw-ta-' + n)));
    try { setupDictionaryDouble('rewrite-modal-body', 'writing-rewrite'); } catch (_) {}
    _rwUpdateCounts();
  } catch (e) {
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(e.message || ''));
    const cold = aborted || e?.coldStart || e?.status === 502 || e?.status === 503;
    body.innerHTML = `<div style="padding:24px;text-align:center">
      <p style="color:#e53935;margin-bottom:14px">${cold ? 'Tải bài quá lâu — server có thể đang khởi động. Thử lại sau vài giây.' : escHtml(e?.message || 'Không mở được bài viết lại.')}</p>
      <button class="btn-primary" onclick="openRewrite('${attemptId}')">Thử lại</button>
      <button class="btn-secondary" style="margin-left:8px" onclick="location.reload()">Tải lại trang</button>
    </div>`;
  }
}

function closeRewriteModal() {
  document.getElementById('rewrite-modal-overlay').classList.remove('open');
  _rwState = null;
}

async function submitRewrite() {
  if (!_rwState) return;
  const attemptId = _rwState.attemptId;
  const btn = document.getElementById('rw-submit-btn');
  const payload = {};
  _rwState.gradedTasks.forEach(n => { payload['task' + n] = (document.getElementById('rw-ta-' + n)?.value || '').trim(); });
  btn.disabled = true;
  const old = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
  try {
    const data = await apiFetch(`/api/writing/attempt/${attemptId}/rewrite`, {
      method: 'POST', body: JSON.stringify(payload),
    });
    if (!data.success) throw new Error(data.message);
    _rwClearDraft(attemptId);
    showToast('✅ Đã lưu bài viết lại. Giáo viên sẽ thấy bạn đã hoàn thành.', 'success', 4000);
    closeRewriteModal();
    // Refresh whichever history view is on screen.
    if (typeof loadHistory === 'function') loadHistory();
    if (typeof loadPracticeHistory === 'function') loadPracticeHistory();
    _refreshRewriteBanner();
    try { window.dispatchEvent(new Event('ews:rewrite-saved')); } catch (_) {}
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = old;
    if (!_handleQuotaError(e)) showToast(e.body?.message || e.message || 'Không lưu được bài viết lại.', 'error', 5000);
  } finally {
    if (btn.innerHTML.includes('spinner')) btn.innerHTML = old;
  }
}

// Pre-check before opening a new essay: over the rewrite limit (backend
// writingService.MAX_PENDING_REWRITES) => show the gate and return true so
// the caller doesn't start. The server enforces the same rule on /start,
// /practice/start-simulation and both submits; this just avoids letting the
// student write a whole essay first. Network errors fall through (server
// still gates).
async function _blockedByRewriteGate() {
  try {
    const d = await apiFetch('/api/writing/pending-rewrites');
    if (d && d.blocked) { _openRewriteGate(d); return true; }
  } catch (_) {}
  return false;
}

// Forced-rewrite gate: a start/submit returned 403 REWRITE_REQUIRED, or
// _blockedByRewriteGate() found the student over the limit.
function _openRewriteGate(gateBody) {
  const overlay = document.getElementById('review-modal-overlay');
  const list = (gateBody.items || []).map(it => `
    <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 12px;margin-bottom:8px">
      <div style="min-width:0">
        <div style="font-weight:700;font-size:13px">${escHtml(it.examName || (it.submissionType === 'practice' ? 'Bài luyện Task ' + (it.gradedTasks || []).join('+') : 'Bài thi Writing'))}</div>
        <div style="font-size:12px;color:var(--text3,#6b7280)">Nộp ${it.submittedAt ? new Date(it.submittedAt).toLocaleDateString('vi-VN') : ''}${it.overallBand != null ? ' · Band ' + it.overallBand : ''}</div>
      </div>
      <button class="btn-primary" style="flex-shrink:0" onclick="closeReviewModal();openRewrite('${it._id}')"><i class="fas fa-pen-fancy"></i> Viết lại</button>
    </div>`).join('');
  document.getElementById('review-modal-title').textContent = 'Bạn cần viết lại bài trước';
  document.getElementById('review-modal-body').innerHTML = `
    <p style="font-size:13.5px;color:var(--text2,#374151);margin-bottom:12px">
      Bạn có <b>${gateBody.count}</b> bài Writing đã được chấm nhưng chưa viết lại.
      Hãy viết lại (rewrite) ít nhất 1 bài thì mới làm bài mới được.
    </p>
    ${list}`;
  overlay.classList.add('open');
}

// Small banner on the history views when there are pending rewrites.
async function _refreshRewriteBanner() {
  try {
    const d = await apiFetch('/api/writing/pending-rewrites');
    const n = d.count || 0;
    document.querySelectorAll('.rw-pending-banner').forEach(el => {
      el.style.display = n > 0 ? 'flex' : 'none';
      const c = el.querySelector('.rw-pending-count');
      if (c) c.textContent = n;
    });
  } catch (_) {}
}
window.openRewrite = openRewrite;
window.closeRewriteModal = closeRewriteModal;
window.submitRewrite = submitRewrite;

// ── Detailed error feedback (errors[] / upgrades[] / logicFeedback / draft2Plan,
// see backend writingGradingService.normalizeFeedback). Older gradings only
// have one `issue` + `better` per sentence and still render as before.
// Keep the labels in sync with ERROR_CATEGORIES in writingGradingService.js.
const FB_ERR_CAT = {
  tense: 'Thì động từ', sva: 'Hòa hợp chủ ngữ – động từ', article: 'Mạo từ (a/an/the)',
  noun_number: 'Số ít / số nhiều', preposition: 'Giới từ', word_form: 'Từ loại (word form)',
  verb_form: 'Dạng động từ', sentence_structure: 'Cấu trúc câu', relative_clause: 'Mệnh đề quan hệ',
  pronoun: 'Đại từ / từ hạn định', comparison: 'So sánh', punctuation: 'Dấu câu', spelling: 'Chính tả',
  word_choice: 'Dùng từ sai nghĩa', collocation: 'Kết hợp từ (collocation)', register: 'Văn phong không trang trọng',
  linking: 'Từ nối / liên kết', data: 'Sai số liệu', other: 'Lỗi khác',
};
const FB_CRIT_COLOR = { GRA: '#7c3aed', LR: '#0369a1', CC: '#b45309', TA: '#dc2626', TR: '#dc2626' };

function _fbErrors(s) { return Array.isArray(s && s.errors) ? s.errors : []; }
function _fbUpgrades(s) { return Array.isArray(s && s.upgrades) ? s.upgrades : []; }
function _fbCritChip(c) {
  return c ? `<span class="fb-crit-chip" style="background:${FB_CRIT_COLOR[c] || '#6b7280'}">${escHtml(c)}</span>` : '';
}

// The sentence with each error / upgrade span highlighted. Spans the model
// quoted that aren't in the sentence (or overlap an earlier one) are just
// not highlighted — they still appear in the list under the sentence.
function _fbMarkSentence(original, errors, upgrades) {
  const text = String(original || '');
  const lower = text.toLowerCase();
  const ranges = [];
  const add = (needle, cls, label) => {
    const n = String(needle || '').toLowerCase();
    if (!n) return;
    let from = 0, at;
    while ((at = lower.indexOf(n, from)) !== -1) {
      const end = at + n.length;
      if (!ranges.some(r => at < r.end && end > r.start)) { ranges.push({ start: at, end, cls, label }); return; }
      from = at + 1;
    }
  };
  errors.forEach((e, i) => add(e.wrong, 'fb-mk-err', i + 1));
  upgrades.forEach(u => add(u.from, 'fb-mk-up', '💡'));
  ranges.sort((a, b) => a.start - b.start);
  let html = '', pos = 0;
  // The number sits outside the <mark> so the error strike-through doesn't cross it.
  ranges.forEach(r => {
    html += escHtml(text.slice(pos, r.start))
      + `<mark class="${r.cls}">${escHtml(text.slice(r.start, r.end))}</mark><sup class="${r.cls}-n">${r.label}</sup>`;
    pos = r.end;
  });
  return html + escHtml(text.slice(pos));
}

function _fbUpgradeRows(ups) {
  return ups.map(u => `<div class="fb-up-row">
      <span class="fb-up-ico">💡</span>
      <div><span class="fb-up-from">${escHtml(u.from)}</span> <span class="fb-arrow">→</span> <b class="fb-up-to">${escHtml(u.to)}</b>
      ${u.why ? `<div class="fb-why">${escHtml(u.why)}</div>` : ''}</div>
    </div>`).join('');
}

// "Lỗi của em" — counts by error type so the student sees which mistakes
// they repeat (the thing to note down before Draft 2).
function _fbErrorSummary(td) {
  const sf = td.sentenceFeedback || [];
  const counts = {};
  let nErr = 0, nUp = 0;
  sf.forEach(s => {
    _fbErrors(s).forEach(e => {
      nErr++;
      const k = FB_ERR_CAT[e.category] ? e.category : 'other';
      counts[k] = (counts[k] || 0) + 1;
    });
    nUp += _fbUpgrades(s).length;
  });
  const nLogic = (td.logicFeedback || []).length;
  if (!nErr && !nUp && !nLogic) return '';
  const nIssueSent = sf.filter(s => s.type !== 'ok').length;
  const chips = Object.entries(counts).sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `<span class="fb-cat-chip${n >= 2 ? ' rep' : ''}">${escHtml(FB_ERR_CAT[k])} <b>×${n}</b></span>`).join('');
  return `<div class="fb-section fb-sum">
    <div class="fb-sum-stats">
      <span><b>${nIssueSent}</b>/${sf.length} câu có lỗi</span>
      ${nErr ? `<span class="fb-sum-err"><b>${nErr}</b> lỗi</span>` : ''}
      ${nLogic ? `<span class="fb-sum-logic"><b>${nLogic}</b> vấn đề lập luận</span>` : ''}
      ${nUp ? `<span class="fb-sum-up"><b>${nUp}</b> gợi ý nâng cấp từ vựng</span>` : ''}
    </div>
    ${chips ? `<div class="fb-sum-lbl">Loại lỗi em mắc (màu đỏ = lặp lại từ 2 lần trở lên, ưu tiên ghi vào vở):</div><div class="fb-cat-chips">${chips}</div>` : ''}
  </div>`;
}

function _fbLogicSection(td) {
  const items = td.logicFeedback || [];
  if (!items.length) return '';
  const rows = items.map(l => `<div class="fb-logic-row">
      <div class="fb-logic-head">
        <span class="fb-logic-para">${l.paragraph ? 'Đoạn ' + escHtml(l.paragraph) : 'Toàn bài'}</span>
        ${_fbCritChip(l.criterion)}
      </div>
      ${l.quote ? `<div class="fb-logic-quote">“${escHtml(l.quote)}”</div>` : ''}
      <div class="fb-logic-problem"><i class="fas fa-exclamation-triangle"></i> ${escHtml(l.problem)}</div>
      ${l.suggestion ? `<div class="fb-logic-fix"><i class="fas fa-wrench"></i> ${escHtml(l.suggestion)}</div>` : ''}
    </div>`).join('');
  return `<div class="fb-section">
    <div class="fb-section-lbl fb-lbl-logic"><i class="fas fa-project-diagram"></i> Lập luận & bám đề</div>
    <div class="fb-logic-list">${rows}</div>
  </div>`;
}

function _fbSentenceSection(td) {
  const sf = td.sentenceFeedback || [];
  const rows = sf.map(s => {
    const errs = _fbErrors(s), ups = _fbUpgrades(s);
    if (s.type === 'ok') {
      const sugg = s.suggestion ? `<div class="fb-suggest"><span class="fb-suggest-lbl">Gợi ý (câu của em vẫn đúng, không trừ điểm)</span> ${escHtml(s.suggestion)}
          ${s.suggestionWhy ? `<div class="fb-why">${escHtml(s.suggestionWhy)}</div>` : ''}</div>` : '';
      return `<div class="fb-sent ok">
        <div class="fb-sent-text"><span class="fb-sent-ico ok"><i class="fas fa-check-circle"></i></span><span>${_fbMarkSentence(s.original, [], ups)}</span></div>
        ${ups.length || sugg ? `<div class="fb-sent-body">${_fbUpgradeRows(ups)}${sugg}</div>` : ''}
      </div>`;
    }
    // No error spans to mark (older gradings) — strike the whole sentence.
    const sentHtml = errs.length
      ? _fbMarkSentence(s.original, errs, ups)
      : `<s class="fb-sent-wrong">${escHtml(s.original || '')}</s>`;
    // Older gradings: a single issue/better per sentence.
    const errRows = errs.length
      ? errs.map((e, i) => `<div class="fb-err-row">
          <span class="fb-err-num">${i + 1}</span>
          <div class="fb-err-main">
            <div class="fb-err-line">
              <span class="fb-cat-tag">${escHtml(FB_ERR_CAT[e.category] || FB_ERR_CAT.other)}</span>
              ${_fbCritChip(e.criterion)}
              ${e.wrong ? `<s class="fb-wrong">${escHtml(e.wrong)}</s>` : ''}<span class="fb-arrow">→</span><b class="fb-fix">${escHtml(e.fix || '(bỏ đi)')}</b>
            </div>
            ${e.why ? `<div class="fb-why">${escHtml(e.why)}</div>` : ''}
          </div>
        </div>`).join('')
      : `${_fbCritChip(s.criterion)}${s.issue ? `<div class="fb-why"><i class="fas fa-search"></i> ${escHtml(s.issue)}</div>` : ''}`;
    return `<div class="fb-sent issue">
      <div class="fb-sent-text"><span class="fb-sent-ico bad"><i class="fas fa-times-circle"></i></span><span>${sentHtml}</span></div>
      <div class="fb-sent-body">
        ${errRows}
        ${s.better ? `<div class="fb-better"><span class="fb-better-lbl">Câu đúng</span> ${escHtml(s.better)}</div>` : ''}
        ${_fbUpgradeRows(ups)}
      </div>
    </div>`;
  }).join('');
  const nOk = sf.filter(s => s.type === 'ok').length;
  const hasMarks = sf.some(s => _fbErrors(s).length || _fbUpgrades(s).length);
  return `<div class="fb-section fb-sents">
    <div class="fb-sents-head">
      <div class="fb-section-lbl fb-lbl-sent"><i class="fas fa-list-ul"></i> Phân tích từng câu</div>
      ${nOk && nOk < sf.length ? `<label class="fb-only-err"><input type="checkbox" onchange="this.closest('.fb-sents').classList.toggle('only-err', this.checked)"> Chỉ xem câu có lỗi</label>` : ''}
    </div>
    ${hasMarks ? `<div class="fb-legend"><mark class="fb-mk-err">chỗ sai</mark> <mark class="fb-mk-up">gợi ý nâng cấp (không trừ điểm)</mark></div>` : ''}
    <div class="fb-sent-list">${rows}</div>
  </div>`;
}

function _fbDraft2Plan(td) {
  const plan = (td && td.draft2Plan) || [];
  if (!plan.length) return '';
  return `<div class="fb-section fb-plan">
    <div class="fb-section-lbl fb-lbl-plan"><i class="fas fa-pen-fancy"></i> Khi viết lại (Draft 2), em cần:</div>
    <ol>${plan.map(p => `<li>${escHtml(p)}</li>`).join('')}</ol>
  </div>`;
}

// One task's score bars + written feedback. Shared by the teacher-confirmed
// grading (_buildStudentFeedback) and the AI's original grading
// (_buildAiFeedbackBlock) — both use the same taskGrade shape.
function _fbTaskCard(label, td) {
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

    // Sentence-by-sentence feedback, error summary, logic notes, Draft 2 plan
    const sfItems = (td.sentenceFeedback || []);
    const sfHtml = sfItems.length ? _fbErrorSummary(td) + _fbLogicSection(td) + _fbSentenceSection(td) : '';

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
      ${_fbDraft2Plan(td)}
      ${!sfItems.length && corrections ? `<div class="fb-section"><div class="fb-section-lbl fb-section-corr">Lỗi cần sửa</div>${corrections}</div>` : ''}
      ${!sfItems.length && suggestions ? `<div class="fb-section"><div class="fb-section-lbl fb-section-sugg">Gợi ý cải thiện</div><ul class="fb-sugg-list">${suggestions}</ul></div>` : ''}
    </div>`;
}

// AI's original grading (attempt.aiGrading) — shown collapsed under the
// teacher's grading in the rewrite modal so students can compare, without the
// AI draft competing with the official (teacher-confirmed) result.
function _buildAiFeedbackBlock(ai) {
  if (!ai) return '';
  // Match _fbTaskCard's own render condition so we never open an empty block.
  const hasContent = td => td && (td.bandScore != null || td.overallFeedback
    || (td.sentenceFeedback && td.sentenceFeedback.length));
  const has1 = hasContent(ai.task1), has2 = hasContent(ai.task2);
  if (!has1 && !has2) return '';
  const when = ai.generatedAt
    ? new Date(ai.generatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  // Open by default — the student asked to see the AI's notes; they can collapse
  // it if the teacher's grading above already covers everything.
  return `<details class="rw-ai-fb" open>
    <summary><i class="fas fa-robot"></i> Bản chấm gốc từ AI${when ? ' · ' + when : ''} — tham khảo (điểm chính thức là của giáo viên ở trên)</summary>
    <div class="rw-ai-fb-inner">
      ${has1 ? _fbTaskCard('Task 1', ai.task1) : ''}
      ${has2 ? _fbTaskCard('Task 2', ai.task2) : ''}
    </div>
  </details>`;
}

function _buildStudentFeedback(g) {
  const dateStr = g.confirmedAt
    ? new Date(g.confirmedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  const ob = g.overallBand != null ? Number(g.overallBand) : null;
  const wImgSrc = ob == null ? ''
    : ob >= 7.5 ? 'img/above7.5.jpg'
    : ob >= 6.0 ? 'img/band_6_7.jpg'
    : ob >= 5.0 ? 'img/writingbelow60%25.jpg'
    : ob >= 4.0 ? 'img/writingbelow50%25.jpg'
    : 'img/writingbelow45%25.jpg';
  const wImgHtml = wImgSrc
    ? `<img src="${wImgSrc}" alt="" loading="lazy" style="display:block;width:100%;max-width:260px;border-radius:12px;margin:0 auto 16px;object-fit:cover">`
    : '';

  return `<div class="fb-wrap">
    ${wImgHtml}
    <div class="fb-wrap-header">
      <span class="fb-wrap-title"><i class="fas fa-chart-bar"></i> Kết quả chấm bài</span>
      <div class="fb-wrap-right">
        <div class="fb-wrap-band-lbl">Overall Band${dateStr ? ' · ' + dateStr : ''}</div>
        <div class="fb-wrap-band-num">${g.overallBand ?? '–'}</div>
      </div>
    </div>
    <div style="font-size:11px;color:#6b7280;line-height:1.5;margin:-4px 2px 12px">
      Overall = trung bình 4 tiêu chí (TA/TR, CC, LR, GRA), <strong>làm tròn xuống</strong> 0.5 gần nhất — nghiêm hơn cách quy đổi IELTS chính thức một chút, để phản ánh đúng phần em chưa chắc.
    </div>
    ${g.adminNote ? `<div class="fb-admin-note"><span class="fb-admin-note-lbl"><i class="fas fa-comment-dots"></i> Nhận xét từ giáo viên:</span> ${escHtml(g.adminNote)}</div>` : ''}
    ${_fbTaskCard('Task 1', g.task1)}
    ${_fbTaskCard('Task 2', g.task2)}
  </div>`;
}

// ──────────────────────────────────────────────────────
// Download attempt — as text (.txt) or as an image (.png).
// Both include the essay AND, once the teacher has returned it, the full
// grading (band, criteria, teacher note, sentence-by-sentence feedback).
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
    showToast('Lỗi tải bài: ' + e.message, 'error');
  }
}

function _attemptFileBase(a) {
  const d = new Date(a.submittedAt);
  const pad = n => String(n).padStart(2, '0');
  const stamp = isNaN(d) ? '' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  const name = (a.examName || 'submission').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');
  return `writing_${name}${stamp ? '_' + stamp : ''}`;
}

function _saveBlob(blob, filename) {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function _attemptTasks(a) {
  const isPractice = a.submissionType === 'practice';
  return {
    t1: a.task1Snapshot || a.examId?.task1 || {},
    t2: a.task2Snapshot || a.examId?.task2 || {},
    isPractice,
    hasT1: !isPractice || (a.wordCount1 || 0) > 0 || !!(a.task1Answer?.trim()),
    hasT2: !isPractice || (a.wordCount2 || 0) > 0 || !!(a.task2Answer?.trim()),
  };
}

// Plain-text version of one task's grading — mirrors _fbTaskCard.
function _fbTaskText(label, td) {
  if (!td) return [];
  if (td.bandScore == null && !td.overallFeedback && !(td.sentenceFeedback?.length)) return [];
  const isT1 = label.includes('1');
  const crit = [
    ['ta',  isT1 ? 'Task Achievement' : 'Task Response'],
    ['cc',  'Coherence & Cohesion'],
    ['lr',  'Lexical Resource'],
    ['gra', 'Grammatical Range & Accuracy'],
  ];
  const indent = (text, pad) => String(text).split('\n').map(l => pad + l);
  const out = [`▶ ${label.toUpperCase()} — Band ${td.bandScore ?? '–'}`];
  crit.forEach(([k, name]) => {
    if (!td[k]) return;
    out.push(`  • ${name}: ${td[k].score ?? '–'}`);
    if (td[k].comment) out.push(...indent(td[k].comment, '      '));
  });
  if (td.overallFeedback) out.push('', '  Nhận xét chung:', ...indent(td.overallFeedback, '    '));

  const sf = td.sentenceFeedback || [];
  if (sf.length) {
    out.push('', '  Phân tích từng câu:');
    sf.forEach((s, i) => {
      const n = `  ${i + 1}. `;
      if (s.type === 'ok') {
        out.push(`${n}[✓ Tốt] ${s.original || ''}`);
        if (s.suggestion) out.push(`       Gợi ý (không trừ điểm): ${s.suggestion}`);
        return;
      }
      out.push(`${n}[✗${s.criterion ? ' ' + s.criterion : ''}] ${s.original || ''}`);
      const errs = _fbErrors(s);
      if (errs.length) {
        errs.forEach((e, k) => {
          out.push(`       (${k + 1}) [${FB_ERR_CAT[e.category] || FB_ERR_CAT.other}] ${e.wrong || ''} → ${e.fix || '(bỏ đi)'}`);
          if (e.why) out.push(`           ${e.why}`);
        });
      } else if (s.issue) out.push(`       Vấn đề: ${s.issue}`);
      if (s.better) out.push(`       Câu đúng: ${s.better}`);
    });
    sf.forEach(s => _fbUpgrades(s).forEach(u => {
      if (!out.includes('  Gợi ý nâng cấp từ vựng:')) out.push('', '  Gợi ý nâng cấp từ vựng:');
      out.push(`  - ${u.from} → ${u.to}${u.why ? ' — ' + u.why : ''}`);
    }));
    const logic = td.logicFeedback || [];
    if (logic.length) {
      out.push('', '  Lập luận & bám đề:');
      logic.forEach(l => {
        out.push(`  - [${l.paragraph ? 'Đoạn ' + l.paragraph : 'Toàn bài'}] ${l.problem}`);
        if (l.suggestion) out.push(`      Cách sửa: ${l.suggestion}`);
      });
    }
    const plan = td.draft2Plan || [];
    if (plan.length) out.push('', '  Khi viết lại (Draft 2):', ...plan.map((p, k) => `  ${k + 1}. ${p}`));
  } else {
    // Legacy format (older graded attempts)
    const corr = td.corrections || [];
    if (corr.length) {
      out.push('', '  Lỗi cần sửa:');
      corr.forEach(c => {
        out.push(`  - ${c.original} → ${c.corrected}`);
        if (c.explanation) out.push(`      ${c.explanation}`);
      });
    }
    const sugg = td.suggestions || [];
    if (sugg.length) out.push('', '  Gợi ý cải thiện:', ...sugg.map(x => `  - ${x}`));
  }
  out.push('');
  return out;
}

function doDownload(a) {
  const { t1, t2, isPractice, hasT1, hasT2 } = _attemptTasks(a);
  const date = new Date(a.submittedAt).toLocaleString('vi-VN');
  const RULE = `────────────────────────────────────────`;

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

  const g = a.gradingStatus === 'confirmed' ? a.grading : null;
  if (g) {
    const gDate = g.confirmedAt ? new Date(g.confirmedAt).toLocaleDateString('vi-VN') : '';
    lines.push(
      `========================================`,
      `KẾT QUẢ CHẤM BÀI`,
      `========================================`,
      `Overall Band: ${g.overallBand ?? '–'}${gDate ? `  (chấm ngày ${gDate})` : ''}`,
      `(Overall = trung bình 4 tiêu chí, làm tròn xuống 0.5 gần nhất)`,
      ``
    );
    if (g.adminNote) lines.push(`Nhận xét từ giáo viên:`, g.adminNote, ``);
    lines.push(..._fbTaskText('Task 1', g.task1), ..._fbTaskText('Task 2', g.task2));
  } else {
    lines.push(a.gradingStatus === 'ai_done'
      ? `(AI đã chấm xong – đang chờ giáo viên xác nhận và gửi feedback.)`
      : `(Bài đang chờ chấm – chưa có feedback.)`, ``);
  }

  if (hasT1) {
    lines.push(
      RULE,
      `TASK 1 – BÀI LÀM`,
      RULE,
      t1.prompt || null,
      t1.prompt ? `` : null,
      a.task1Answer || '(Không có bài làm)',
      ``
    );
  }
  if (hasT2) {
    lines.push(
      RULE,
      `TASK 2 – BÀI LÀM`,
      RULE,
      t2.prompt || null,
      t2.prompt ? `` : null,
      a.task2Answer || '(Không có bài làm)',
      ``
    );
  }

  const rw = a.rewrite || {};
  if (rw.task1?.trim() || rw.task2?.trim()) {
    lines.push(
      RULE,
      `BÀI VIẾT LẠI${rw.submittedAt ? ` (${new Date(rw.submittedAt).toLocaleDateString('vi-VN')})` : ''}`,
      RULE
    );
    if (rw.task1?.trim()) lines.push(`[Task 1 – ${rw.wordCount1 || 0} từ]`, rw.task1, ``);
    if (rw.task2?.trim()) lines.push(`[Task 2 – ${rw.wordCount2 || 0} từ]`, rw.task2, ``);
  }

  // BOM so Notepad on Windows opens the Vietnamese text as UTF-8.
  const blob = new Blob(['﻿' + lines.filter(l => l != null).join('\r\n')], { type: 'text/plain;charset=utf-8' });
  _saveBlob(blob, `${_attemptFileBase(a)}.txt`);
}

// ── Image (.png) export ───────────────────────────────
// html2canvas is self-hosted (CSP allows scripts from 'self' only) and only
// fetched the first time a student exports an image.
let _h2cPromise = null;
function _loadHtml2Canvas() {
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  if (!_h2cPromise) {
    _h2cPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/lib/html2canvas/html2canvas.min.js?v=e87e550794';
      s.onload  = () => window.html2canvas ? resolve(window.html2canvas) : reject(new Error('html2canvas'));
      s.onerror = () => { _h2cPromise = null; reject(new Error('Không tải được thư viện xuất ảnh')); };
      document.head.appendChild(s);
    });
  }
  return _h2cPromise;
}

// Resolves true when the image can be drawn onto the canvas (same-origin, or
// cross-origin served with CORS) — otherwise it's left out of the export.
function _imgUsable(src) {
  return new Promise(resolve => {
    const img = new Image();
    const url = new URL(src, location.href);
    if (url.origin !== location.origin) img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url.href;
    setTimeout(() => resolve(false), 8000);
  });
}

async function downloadAttemptImage() {
  const a = _currentViewData;
  if (!a) return;
  const btn = document.getElementById('btn-download-img');
  const btnHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo ảnh...'; }

  let box = null;
  try {
    const html2canvas = await _loadHtml2Canvas();
    const { t1, t2, isPractice, hasT1, hasT2 } = _attemptTasks(a);
    const t1Img = t1.imageUrl && await _imgUsable(t1.imageUrl) ? t1.imageUrl : '';
    const g = a.gradingStatus === 'confirmed' ? a.grading : null;
    const date = new Date(a.submittedAt).toLocaleString('vi-VN');

    const taskHtml = (n, task, answer, wc, img) => `<div class="review-task-section">
        <h4>Task ${n} – ${wc || 0} từ</h4>
        ${img ? `<img src="${escHtml(img)}" crossorigin="anonymous" style="max-width:100%;border-radius:6px;margin-bottom:8px" />` : ''}
        ${task.prompt ? `<div class="review-task-prompt">${escHtml(task.prompt)}</div>` : ''}
        <div class="review-answer">${escHtml(answer || '(Không có bài làm)')}</div>
      </div>`;

    box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:absolute;left:-10000px;top:0;width:820px;padding:28px 32px;background:#ffffff;color:#222;box-sizing:border-box';
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2px solid #e53935;padding-bottom:12px;margin-bottom:18px">
        <div>
          <div style="font-size:12px;font-weight:800;letter-spacing:.08em;color:#e53935">ENGLISH WITH DAN · WRITING</div>
          <div style="font-size:20px;font-weight:800;color:#111827;margin-top:4px">${escHtml(a.examName || 'Bài viết')}</div>
        </div>
        <div style="text-align:right;font-size:12px;color:#6b7280;line-height:1.6">
          ${isPractice ? 'Luyện tập' : 'Thi'}<br>Nộp: ${escHtml(date)}
        </div>
      </div>
      ${g ? _buildStudentFeedback(g).replace(/\sloading="lazy"/g, '')
          : `<div style="background:#f0f7ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:12px 16px;margin-bottom:14px;font-size:13px;color:#1e40af">${a.gradingStatus === 'ai_done' ? 'AI đã chấm xong – đang chờ giáo viên xác nhận và gửi feedback.' : 'Bài đang chờ chấm – chưa có feedback.'}</div>`}
      <div style="margin-top:20px">
        ${hasT1 ? taskHtml(1, t1, a.task1Answer, a.wordCount1, t1Img) : ''}
        ${hasT2 ? taskHtml(2, t2, a.task2Answer, a.wordCount2, '') : ''}
      </div>`;
    box.querySelectorAll('.fb-only-err').forEach(el => el.remove()); // on-screen filter, not part of the export
    document.body.appendChild(box);

    // Let images (band picture, Task 1 chart) and web fonts settle first.
    await Promise.all([...box.querySelectorAll('img')].map(img => img.complete ? null
      : new Promise(r => { img.onload = img.onerror = r; })));
    if (document.fonts?.ready) await document.fonts.ready;

    // Keep the canvas under browser size limits for very long essays.
    const scale = Math.max(1, Math.min(2, 16000 / box.scrollHeight));
    const canvas = await html2canvas(box, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Always export the light theme, even when the site is in dark mode.
      onclone: doc => doc.documentElement.setAttribute('data-theme', 'light'),
    });
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('Không tạo được ảnh');
    _saveBlob(blob, `${_attemptFileBase(a)}.png`);
  } catch (e) {
    showToast('Lỗi xuất ảnh: ' + (e?.message || e), 'error');
  } finally {
    if (box) box.remove();
    if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
  }
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

  // Filters (quarters + topics) and the samples list don't depend on each
  // other — fire both in parallel instead of waiting on filters first.
  const filtersPromise = apiFetch('/api/writing/sample-filters').catch(() => null);
  const samplesPromise = _fetchAndRenderSamples();

  const fData = await filtersPromise;
  if (fData && fData.success) {
    const qChips = document.getElementById('wsampl-quarter-chips');
    const tChips = document.getElementById('wsampl-topic-chips');

    // Render quarter chips
    qChips.innerHTML = `<span class="pv-chip active" data-val="all" onclick="setSampleFilter('quarter','all',this)">Tất cả</span>`;
    fData.quarters.forEach(q => {
      qChips.insertAdjacentHTML('beforeend',
        `<span class="pv-chip" data-val="${escHtml(q)}" onclick="setSampleFilter('quarter','${escJsAttr(q)}',this)">${escHtml(q)}</span>`);
    });

    // Render topic chips
    tChips.innerHTML = `<span class="pv-chip active" data-val="all" onclick="setSampleFilter('topic','all',this)">Tất cả</span>`;
    fData.topics.forEach(t => {
      tChips.insertAdjacentHTML('beforeend',
        `<span class="pv-chip" data-val="${escHtml(t)}" onclick="setSampleFilter('topic','${escJsAttr(t)}',this)">${escHtml(t)}</span>`);
    });
  }

  await samplesPromise;
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
      <div class="pv-doc-card" onclick="openSamplePdf('${escJsAttr(s.pdfUrl)}','${escJsAttr(s.title)}',this)">
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
// escHtml() moved to js/shared/utils.js (single source of truth — Phase 3 audit).
// ──────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────
// Auto-save to localStorage
// ──────────────────────────────────────────────────────
// saveToStorage(), _AUTOSAVE_KEY/_AUTOSAVE_MAX_AGE_MS, and the rest of the
// exam-mode autosave/restore logic
// moved to js/writing-autosave.js (loaded before this file — see
// writing.html's script order; its init IIFE below calls
// checkRestoreBanner() synchronously at load time).

// ──────────────────────────────────────────────────────
// Fullscreen  (đồng bộ với reading/listening)
// ──────────────────────────────────────────────────────
ExamFullscreen.install({
  target: () => document.getElementById('screen-exam'),
  buttons: [['btn-fullscreen', 'fs-icon-exam']],
  // Đưa modals vào trong fullscreen element khi cần
  carry: ['confirm-modal-overlay', 'exit-modal-overlay', 'review-modal-overlay'],
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
  // Leaving without submitting must disarm proctoring too — only the
  // submit path did this before, so a Simulation attempt abandoned via
  // "Thoát" kept the badge, violation counting and nav-lock armed
  // indefinitely (BUG-108).
  if (state.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
  // BUG-109: the Simulation placeholder attempt (created at start, so a
  // strike has somewhere to attach) stayed 'in-progress' forever if the
  // student exited instead of submitting — gradingStatus defaults to
  // 'pending' regardless of `status`, so it then showed up in "Lịch sử
  // luyện tập" looking exactly like a real 0-word submission stuck at
  // "Chờ chấm". Cancel it server-side, fire-and-forget — nothing here
  // needs to wait for the response.
  if (state.mode === 'simulation' && state.simAttemptId) {
    apiFetch('/api/writing/cancel-simulation', { method: 'POST', body: JSON.stringify({ attemptId: state.simAttemptId }) }).catch(() => {});
  }
  closeExitModal();
  // Thoát fullscreen nếu đang bật
  if (document.fullscreenElement) document.exitFullscreen();
  // Reset state (giữ autosave để restore sau)
  state.exam = null;
  _clearWritingExamUrl();
  showScreen('screen-key');
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
                   'review-modal-overlay', 'rewrite-modal-overlay', 'practice-exit-modal', 'practice-submit-modal'];
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
  essayType: null,  // category filter: Task 1 chartType / Task 2 essay group (type01..type07), null = all
  taskScores: {},   // taskId -> { band, attemptId } for confirmed/graded attempts
  page: 1,
  wordCount: 0,
  stopwatchInterval: null,
  seconds: 0,
  // 'practice' (default) | 'simulation' — see state.mode (the full-exam
  // equivalent) for the full rationale.
  mode: 'practice',
  simAttemptId: null,
  vocab: [],        // "Từ vựng chủ đề" of the open Task 2 prompt (renderPracticeVocab)
};

// ── Practice task list – pagination ─────────────────────
const PRACTICE_PAGE_SIZE = 8;

// Task 2 essay groups — the 7 types of the Task 2 Templates page, same ids
// and colours as js/task2-template.js (TYPE_META). A prompt's group is
// WritingTask2.essayType (set by scripts/setWritingTask2EssayTypes.js or in
// admin); prompts without one fall back to the wording guess.
const T2_ESSAY_CATS = [
  { id: 'type01', label: 'Advantages & Disadvantages', short: 'Adv & Disadv',    icon: 'fa-scale-balanced',     color: '#4d63d8' },
  { id: 'type02', label: 'Discuss Both Views',         short: 'Discuss Both',    icon: 'fa-comments',           color: '#7d62c9' },
  { id: 'type03', label: 'Cause – Solution',           short: 'Cause–Solution',  icon: 'fa-lightbulb',          color: '#2a9d8f' },
  { id: 'type04', label: 'Effect – Solution',          short: 'Effect–Solution', icon: 'fa-gears',              color: '#cf5f57' },
  { id: 'type05', label: 'Cause – Effect',             short: 'Cause–Effect',    icon: 'fa-arrow-trend-up',     color: '#e07a3a' },
  { id: 'type06', label: 'Agree / Disagree',           short: 'Agree/Disagree',  icon: 'fa-check-double',       color: '#2f9e5b' },
  { id: 'type07', label: 'Positive / Negative',        short: 'Pos/Neg Dev',     icon: 'fa-circle-half-stroke', color: '#d4689a' },
];
const T2_ESSAY_CAT = Object.fromEntries(T2_ESSAY_CATS.map(c => [c.id, c]));

// Task 1 chart types — WritingTask1.chartType (set by
// scripts/seedWritingTask1Nov2026.js or in admin).
const T1_CHART_CATS = [
  { id: 'static',  label: 'Static charts',  short: 'Static',  icon: 'fa-chart-pie',       color: '#4d63d8' },
  { id: 'dynamic', label: 'Dynamic charts', short: 'Dynamic', icon: 'fa-chart-line',      color: '#e07a3a' },
  { id: 'mixed',   label: 'Mixed charts',   short: 'Mixed',   icon: 'fa-table-columns',   color: '#7d62c9' },
  { id: 'process', label: 'Process',        short: 'Process', icon: 'fa-diagram-project', color: '#2a9d8f' },
  { id: 'map',     label: 'Maps',           short: 'Maps',    icon: 'fa-map-location-dot', color: '#2f9e5b' },
];
const T1_CHART_CAT = Object.fromEntries(T1_CHART_CATS.map(c => [c.id, c]));

function _taskEssayType(t) {
  if (t.essayType && T2_ESSAY_CAT[t.essayType]) return t.essayType;
  return (window.Task2GenericTpl && Task2GenericTpl.guessType(t.prompt || '')) || null;
}

// Category of a task in the current list: Task 1 chart type or Task 2 essay group.
function _taskCat(t) {
  if (practiceState.taskType === 1) return T1_CHART_CAT[t.chartType] ? t.chartType : null;
  return _taskEssayType(t);
}
function _catList() { return practiceState.taskType === 1 ? T1_CHART_CATS : T2_ESSAY_CATS; }

// Category buttons under the history box — Task 1 chart types / Task 2 essay groups.
function _renderEssayCats() {
  const section = document.getElementById('practice-cat-section');
  const side    = document.getElementById('practice-side');
  const listEl  = document.getElementById('practice-cat-list');
  const show = (practiceState.taskType === 1 || practiceState.taskType === 2) && (practiceState.tasks || []).length > 0;
  if (section) section.style.display = show ? '' : 'none';
  if (side) side.classList.toggle('has-cats', show);
  if (!show || !listEl) return;
  const titleEl = section && section.querySelector('.practice-cat-title');
  if (titleEl) titleEl.innerHTML = `<i class="fas fa-layer-group"></i> Dạng đề Task ${practiceState.taskType}`;
  const counts = {};
  practiceState.tasks.forEach(t => { const k = _taskCat(t); if (k) counts[k] = (counts[k] || 0) + 1; });
  const cur = practiceState.essayType;
  const btn = (id, label, icon, color, n, num) => `
    <button type="button" class="practice-cat-btn${cur === id ? ' active' : ''}" style="--cat:${color}"
      onclick="filterByEssayType(${id ? `'${id}'` : 'null'})" aria-pressed="${cur === id}">
      <span class="practice-cat-ico"><i class="fas ${icon}"></i></span>
      <span class="practice-cat-name">${num ? `<span class="practice-cat-num">${num}</span> ` : ''}${escHtml(label)}</span>
      <span class="practice-cat-count">${n}</span>
    </button>`;
  listEl.innerHTML = btn(null, 'Tất cả dạng đề', 'fa-border-all', '#475569', practiceState.tasks.length, '')
    + _catList().map((c, i) => btn(c.id, c.label, c.icon, c.color, counts[c.id] || 0, String(i + 1).padStart(2, '0'))).join('');
}

function filterByEssayType(typeId) {
  practiceState.essayType = typeId && practiceState.essayType !== typeId ? typeId : null;
  _applyTaskFilters();
  _renderEssayCats();
  // On phones the groups sit above the list — bring the list into view.
  const list = document.getElementById('practice-task-items');
  if (list && window.innerWidth <= 768) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Search box + essay group, combined.
function _applyTaskFilters() {
  const q = (document.getElementById('writing-task-search')?.value || '').trim().toLowerCase();
  const cat = _catList().find(c => c.id === practiceState.essayType) || null;
  const type = cat ? cat.id : null;
  practiceState.filteredTasks = (practiceState.tasks || []).filter(t =>
    (!q || (t.prompt || '').toLowerCase().includes(q)) && (!type || _taskCat(t) === type));
  practiceState.page = 1;
  const titleEl = document.getElementById('practice-list-title');
  if (titleEl) titleEl.textContent = `Chọn đề Task ${practiceState.taskType}` + (cat ? ` · ${cat.label}` : '');
  _renderTaskPage();
}

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

  const cards = pageTasks.map((t, i) => {
    const idx = start + i + 1;
    const imgHtml = (taskType === 1 && t.imageUrl)
      ? `<img src="${escHtml(t.imageUrl)}" alt="" class="wt-task-card-img" loading="lazy" />`
      : '';
    // Task 2: topic cover flush with the card's top edge; the Daniel logo shows without one.
    const coverHtml = taskType === 2
      ? `<div class="wt-task-card-cover"><span class="wt-task-card-cover-logo"><span>D</span>aniel</span>${t.thumbnail ? `<img src="${escHtml(t.thumbnail)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</div>`
      : '';
    const promptPreview = (t.prompt || '').slice(0, 200) + ((t.prompt || '').length > 200 ? '…' : '');
    const cat = (taskType === 2 ? T2_ESSAY_CAT : T1_CHART_CAT)[_taskCat(t)] || null;
    const catHtml = cat ? `<span class="wt-task-card-type" style="--cat:${cat.color}"><i class="fas ${cat.icon}"></i> ${escHtml(cat.short)}</span>` : '';
    const done = (practiceState.taskScores || {})[String(t._id)];
    const bandColor = done ? (done.band >= 7 ? '#16a34a' : done.band >= 5.5 ? '#2563eb' : '#d97706') : '';
    const bandHtml = done
      ? `<span class="wt-task-card-band" style="color:${bandColor};border-color:${bandColor}">Band ${done.band}</span>`
      : '';
    return `<div class="wt-task-card${coverHtml ? ' wt-task-card--cover' : ''}" data-id="${escHtml(String(t._id))}">
      ${coverHtml}
      <div class="wt-task-card-header">
        <span class="wt-task-card-num">${idx}</span>
        ${catHtml}
        ${bandHtml}
        <button class="btn-primary wt-task-card-btn" onclick="event.stopPropagation();startPracticeTask(${taskType},'${t._id}')">${done ? 'Làm lại' : 'Làm bài'}</button>
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

  itemsEl.innerHTML = `<div class="wt-task-grid">${cards}</div>` + pgHtml;

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
// Up to 2 drafts per taskType are kept server-side (see writingService.
// saveDraft), so localStorage mirrors that: one entry PER TASK, keyed by
// type+id, instead of a single global slot that only ever remembered
// whichever task was written last.
const _PRACTICE_SAVE_PREFIX = 'ews_practice_autosave:';
const _PRACTICE_MAX_AGE     = 24 * 60 * 60 * 1000; // 24h

// Deferred init: shows the "unfinished practice draft" banner on the
// landing screen (screen-key) right after login/page-load, not just after
// clicking into "Luyện tập lẻ" — must run here (after _PRACTICE_SAVE_PREFIX
// and practiceState are initialized), same TDZ reason as the deferred init
// above, and skipped when a URL param already routes to a different screen.
//
// ?taskType=1/2 (the nav dropdown's direct Task 1/Task 2 links) used to be
// skipped here too, on the assumption a student landing there was always
// starting fresh — but the nav dropdown links straight into the task list
// (screen-practice, via the sibling deferred init above), which has its own
// #practice-restore-banner slot that simply never got populated. A student
// with an in-progress draft who used that link (rather than "Luyện tập lẻ")
// had no way to know a draft existed, clicked "Làm bài" on the same prompt
// again, and startPracticeTask()'s clearPracticeAutoSave() wiped it —
// reported as "autosave said saved, but the essay came back empty".
// Reachable through this path too now; only samples/writing-tips (which
// route to an unrelated screen entirely) still skip it.
(function() {
  var _p = new URLSearchParams(location.search);
  if (_p.get('view') === 'samples' || _p.get('view') === 'writing-tips') return;
  checkPracticeRestoreBanner();
})();

function _practiceSaveKey(taskType, taskId) {
  return `${_PRACTICE_SAVE_PREFIX}${taskType}:${taskId}`;
}

function savePracticeToStorage() {
  if (!practiceState.task) return;
  const ta = document.getElementById('pw-textarea');
  const answer = ta?.value || '';
  const key = _practiceSaveKey(practiceState.taskType, practiceState.task._id);
  // Nothing written yet (or it was written then deleted) — there's nothing
  // worth resuming, so don't leave a 0-word ghost draft behind (it used to
  // trip the "bài luyện tập chưa nộp" banner on the next visit for a task
  // the student never actually started). Clears any stale entry too, in
  // case this task had real content before that's since been erased.
  if (!practiceState.wordCount && !answer.trim()) {
    try { localStorage.removeItem(key); } catch (_) {}
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify({
      taskType:  practiceState.taskType,
      task:      practiceState.task,
      answer,
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
  if (!practiceState.wordCount) {
    showToast('Chưa viết gì để lưu nháp', 'info', 2500);
    return;
  }
  savePracticeToStorage();
  saveDraftToServer();
  showToast('Đã lưu nháp ✓ — bạn có thể thoát và tiếp tục sau', 'success', 3000);
}

function loadPracticeFromStorage(taskType, taskId) {
  try {
    const key = _practiceSaveKey(taskType, taskId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.task) return null;
    if (Date.now() - saved.savedAt > _PRACTICE_MAX_AGE) {
      localStorage.removeItem(key);
      return null;
    }
    return saved;
  } catch (_) { return null; }
}

// All locally-cached drafts across every task — used to build the restore
// list on the practice home screen (merged with the server's copies).
function listLocalPracticeDrafts() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(_PRACTICE_SAVE_PREFIX)) continue;
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!saved?.task) continue;
      if (Date.now() - saved.savedAt > _PRACTICE_MAX_AGE) { localStorage.removeItem(key); continue; }
      out.push(saved);
    } catch (_) {}
  }
  return out;
}

function clearPracticeAutoSave(taskType, taskId) {
  if (taskType == null || taskId == null) return;
  localStorage.removeItem(_practiceSaveKey(taskType, taskId));
}

// ── Server-side draft helpers ───────────────────
async function saveDraftToServer(opts = {}) {
  if (!practiceState.task) return;
  const ta = document.getElementById('pw-textarea');
  try {
    await apiFetch('/api/writing/practice/draft', {
      method: 'POST',
      keepalive: !!opts.keepalive,
      body: JSON.stringify({
        taskType:  practiceState.taskType,
        task:      practiceState.task,
        answer:    ta?.value || '',
        wordCount: practiceState.wordCount,
        seconds:   practiceState.seconds
      })
    });
  } catch (err) {
    // Server-side draft save failing silently used to be indistinguishable
    // from it succeeding (the save indicator only reflects the localStorage
    // write in savePracticeToStorage) — log so a stale/duplicate-key index
    // or other server error is at least visible in devtools.
    console.error('saveDraftToServer failed:', err);
  }
}

// Reliability net for the "most recent essay wasn't saved" bug: the only
// server-side autosave triggers used to be a 5-minute stopwatch tick and
// the in-app "Thoát" button — a student who just closes the tab, hits the
// browser back button, or switches apps on mobile before either of those
// fires ends up with nothing synced past whatever the localStorage mirror
// had (device/browser-local only, invisible on any other session). pagehide
// fires reliably in all of those cases; keepalive keeps the POST alive past
// the point where a plain fetch would get cancelled by the page unloading.
function _flushPracticeDraftOnLeave() {
  if (!practiceState.task) return;
  savePracticeToStorage();
  saveDraftToServer({ keepalive: true });
}
window.addEventListener('pagehide', _flushPracticeDraftOnLeave);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') _flushPracticeDraftOnLeave();
});

async function loadDraftsFromServer() {
  try {
    const d = await apiFetch('/api/writing/practice/drafts');
    if (!d.success || !Array.isArray(d.drafts)) return [];
    return d.drafts.map(x => ({
      taskType:  x.taskType,
      task:      x.task,
      answer:    x.answer || '',
      wordCount: x.wordCount || 0,
      seconds:   x.seconds || 0,
      savedAt:   new Date(x.savedAt).getTime()
    }));
  } catch (_) { return []; }
}

function deleteDraftFromServer(taskType, taskId) {
  apiFetch('/api/writing/practice/draft', {
    method: 'DELETE',
    body: JSON.stringify({ taskType, taskId })
  }).catch(() => {});
}

async function checkPracticeRestoreBanner() {
  const localDrafts  = listLocalPracticeDrafts();
  const serverDrafts = await loadDraftsFromServer();

  // Merge by (taskType, taskId), preferring whichever copy was saved more
  // recently — local can be ahead of the server if the last autosave tick
  // hasn't synced yet, and the server is the only copy on a new device.
  const merged = new Map();
  for (const d of serverDrafts) merged.set(`${d.taskType}:${d.task._id}`, d);
  for (const d of localDrafts) {
    const key = `${d.taskType}:${d.task._id}`;
    const existing = merged.get(key);
    if (!existing || d.savedAt > existing.savedAt) merged.set(key, d);
  }
  // The server caps stored drafts at 2 per taskType (writingService.saveDraft),
  // but localStorage can accumulate more than that (different prompts tried
  // across several days, never capped client-side) — re-apply the same
  // "top 2 per taskType" limit here so the restore list never shows more
  // than what a student can actually resume.
  const byType = new Map();
  for (const d of [...merged.values()].sort((a, b) => b.savedAt - a.savedAt)) {
    const list = byType.get(d.taskType) || [];
    if (list.length < 2) { list.push(d); byType.set(d.taskType, list); }
  }
  const drafts = [...byType.values()].flat().sort((a, b) => b.savedAt - a.savedAt);
  practiceState.restorableDrafts = drafts;
  _updatePracticeCardBadges(drafts);

  // Two banner instances share this state: one on screen-practice (shown
  // after clicking "Luyện tập lẻ"), one on screen-key (the landing screen,
  // so the notice appears right after login without an extra click).
  const instances = [
    { banner: 'practice-restore-banner', list: 'practice-restore-list', title: 'practice-restore-title-text' },
    { banner: 'key-practice-restore-banner', list: 'key-practice-restore-list', title: 'key-practice-restore-title-text' }
  ];

  const itemsHtml = drafts.length ? drafts.map((d, i) => {
    const wc = d.wordCount || 0;
    const m  = String(Math.floor((d.seconds || 0) / 60)).padStart(2, '0');
    const s  = String((d.seconds || 0) % 60).padStart(2, '0');
    return `
      <div class="wr-restore-item">
        <span class="wr-restore-item-desc">Task ${d.taskType} – ${wc} từ – đã viết ${m}:${s}</span>
        <div class="wr-restore-item-btns">
          <button class="wr-restore-btn-primary" onclick="restorePracticeWrite(${i})"><i class="fas fa-play"></i> Tiếp tục</button>
          <button class="wr-restore-btn-secondary" onclick="discardPracticeAutoSave(${i})">Bỏ qua</button>
        </div>
      </div>`;
  }).join('') : '';
  const titleText = drafts.length > 1
    ? `Bạn có ${drafts.length} bài luyện tập chưa nộp`
    : 'Bạn có bài luyện tập chưa nộp';

  for (const { banner: bannerId, list: listId, title: titleId } of instances) {
    const banner = document.getElementById(bannerId);
    const listEl = document.getElementById(listId);
    const titleTextEl = document.getElementById(titleId);
    if (!banner || !listEl) continue;
    if (!drafts.length) { banner.style.display = 'none'; continue; }
    if (titleTextEl) titleTextEl.textContent = titleText;
    listEl.innerHTML = itemsHtml;
    banner.style.display = 'block';
  }
}

// Mirrors the top-nav's navTask2Badge (js/nav.js) — a small red count badge
// on the Task 1 / Task 2 picker cards showing how many unsaved drafts of
// that type are waiting to be resumed.
function _updatePracticeCardBadges(drafts) {
  const counts = { 1: 0, 2: 0 };
  for (const d of drafts) counts[d.taskType] = (counts[d.taskType] || 0) + 1;
  [1, 2].forEach(t => {
    const el = document.getElementById(`pcard-t${t}-badge`);
    if (!el) return;
    el.textContent = counts[t];
    el.style.display = counts[t] > 0 ? 'flex' : 'none';
  });
}

function restorePracticeWrite(idx) {
  const saved = practiceState.restorableDrafts?.[idx];
  if (!saved) return;

  const banner = document.getElementById('practice-restore-banner');
  if (banner) banner.style.display = 'none';

  _applyPracticeDraft(saved);
}

// Shared by restorePracticeWrite() (restore banner) and _openDirectPracticeTask()
// (teacher-shared link reopened with an in-progress draft) — puts a previously
// saved draft back on screen instead of starting the task fresh.
function _applyPracticeDraft(saved) {
  practiceState.taskType  = saved.taskType;
  practiceState.task      = saved.task;
  practiceState.tasks     = [saved.task];
  practiceState.wordCount = saved.wordCount || 0;
  practiceState.seconds   = saved.seconds   || 0;

  // Put the shareable ?taskType=&taskId= URL in the address bar so a teacher
  // who resumed a draft (in-page "Tiếp tục" banner, which calls this directly)
  // can still copy the link for students. replaceState, not push — resuming
  // is not a new navigation step.
  const _tid = saved.task && saved.task._id;
  if (_tid) {
    history.replaceState({ screen: 'practice-write', taskType: saved.taskType, taskId: String(_tid) }, '',
      `writing.html?taskType=${saved.taskType}&taskId=${encodeURIComponent(_tid)}`);
  }

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

function discardPracticeAutoSave(idx) {
  const saved = practiceState.restorableDrafts?.[idx];
  if (!saved) return;
  clearPracticeAutoSave(saved.taskType, saved.task._id);
  deleteDraftFromServer(saved.taskType, saved.task._id);
  checkPracticeRestoreBanner(); // re-render the list without this item
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
  _hideEssayCats();
  if (pushHistory) history.pushState({ screen: 'practice' }, '', 'writing.html');
  checkPracticeRestoreBanner();
  showScreen('screen-practice');
  loadPracticeHistory();
}

async function loadPracticeHistory(taskTypeFilter = null) {
  const listEl = document.getElementById('practice-history-list');
  listEl.innerHTML = '<div class="spinner"></div>';
  try {
    const d = await apiFetch('/api/writing/practice/history');
    const allAttempts = d.attempts || [];

    const attempts = taskTypeFilter
      ? allAttempts.filter(a => {
          const isT1 = (a.examName || '').includes('Task 1') || (a.wordCount1 || 0) > 0;
          return taskTypeFilter === 1 ? isT1 : !isT1;
        })
      : allAttempts;

    if (!attempts.length) {
      listEl.innerHTML = '<p style="color:#9ca3af;font-size:14px;text-align:center;padding:24px 0">Chưa có bài luyện tập nào.</p>';
      return attempts;
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
      return attempts;
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
    return attempts;
  } catch (e) {
    listEl.innerHTML = '<p style="color:#ef4444;font-size:13px">Không tải được lịch sử.</p>';
    return [];
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
  practiceState.tasks = [];
  practiceState.essayType = null;
  _renderEssayCats();

  try {
    const [d, attempts] = await Promise.all([
      apiFetch(`/api/writing/practice/tasks?taskType=${taskType}`),
      loadPracticeHistory(taskType),
    ]);
    if (!d.success || !d.tasks || !d.tasks.length) {
      itemsEl.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:24px">Chưa có đề bài nào. Vui lòng liên hệ giáo viên.</p>';
      return;
    }
    practiceState.tasks = d.tasks;
    practiceState.filteredTasks = d.tasks;
    practiceState.page = 1;
    practiceState.taskScores = buildTaskScoreMap(taskType, attempts);
    _renderEssayCats();
    _renderTaskPage();
  } catch (e) {
    itemsEl.innerHTML = `<p style="color:#ef4444;text-align:center;padding:20px">Lỗi tải đề: ${escHtml(e.message)}</p>`;
  }
}

// Most recent CONFIRMED (graded) attempt per task, keyed by taskId — used to
// show a band-score badge + "Làm lại" instead of "Làm bài" on task cards the
// student has already completed. attempts is sorted newest-first already
// (backend orders by submittedAt desc), so the first match per key wins.
function buildTaskScoreMap(taskType, attempts) {
  const idField = taskType === 1 ? 'task1Id' : 'task2Id';
  const map = {};
  (attempts || []).forEach(a => {
    if (a.gradingStatus !== 'confirmed' || a.grading?.overallBand == null) return;
    const tid = a[idField];
    if (!tid) return;
    const key = String(tid);
    if (!map[key]) map[key] = { band: a.grading.overallBand, attemptId: a._id };
  });
  return map;
}

function _hideEssayCats() {
  practiceState.essayType = null;
  const section = document.getElementById('practice-cat-section');
  if (section) section.style.display = 'none';
  document.getElementById('practice-side')?.classList.remove('has-cats');
}

function hidePracticeTaskList() {
  const histBody  = document.querySelector('#screen-practice .history-body');
  const histTitle = document.getElementById('practice-hist-title');
  document.getElementById('practice-task-list').style.display  = 'none';
  document.getElementById('practice-task-select').style.display = '';
  if (histBody)  histBody.classList.remove('practice-split-mode');
  if (histTitle) histTitle.innerHTML = '<i class="fas fa-history"></i> Lịch sử luyện tập';
  _hideEssayCats();
  const s = document.getElementById('writing-task-search');
  if (s) s.value = '';
  history.pushState({ screen: 'practice' }, '', 'writing.html');
  loadPracticeHistory();
}

function filterWritingTasks() {
  _applyTaskFilters();
}

async function startPracticeTask(taskType, taskId, pushHistory = true, mode = null) {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) openUpgradeModal();
    return;
  }
  // Over the rewrite limit: show the rewrite list before the mode popup.
  // _startPracticeTaskWithMode() checks again (covers the shared-link path).
  if (!mode && await _blockedByRewriteGate()) {
    if (!pushHistory) { history.replaceState({ screen: 'practice' }, '', 'writing.html'); showPracticeMode(false); }
    return;
  }
  // Show the Practice/Test Simulation popup once per fresh start — not on
  // a popstate/URL-resume (pushHistory=false) or the recursive call this
  // popup's own callbacks make with `mode` already decided.
  if (pushHistory && !mode && window.ExamModeSelect) {
    window.ExamModeSelect.open({
      skill: 'writing',
      onPractice: () => startPracticeTask(taskType, taskId, pushHistory, 'practice'),
      onSimulation: () => startPracticeTask(taskType, taskId, pushHistory, 'simulation'),
    });
    return;
  }
  mode = mode || 'practice';

  const task = practiceState.tasks.find(t => String(t._id) === String(taskId));
  if (!task) { showToast('Không tìm thấy đề bài', 'error'); return; }

  _startPracticeTaskWithMode(taskType, taskId, task, pushHistory, mode);
}

async function _startPracticeTaskWithMode(taskType, taskId, task, pushHistory, mode) {
  if (await _blockedByRewriteGate()) {
    if (!pushHistory) { history.replaceState({ screen: 'practice' }, '', 'writing.html'); showPracticeMode(false); }
    return;
  }
  // Test Simulation mode: get a server-tracked attempt row up front (so a
  // strike has something to attach to, and the ~20/40min per-task
  // exam-condition timer is server-anchored) before entering the practice
  // screen — see reading-v2.js's identical startPractice() flow.
  let simAttemptId = null, simDurationSec = null;
  if (mode === 'simulation') {
    try {
      const simRes = await apiFetch('/api/writing/practice/start-simulation', {
        method: 'POST',
        body: JSON.stringify({ taskType, taskId })
      });
      if (!simRes.success) { showToast(simRes.message || 'Không thể bắt đầu Test Simulation', 'error'); return; }
      simAttemptId = simRes.attemptId;
      simDurationSec = simRes.duration;
    } catch (simErr) {
      if (simErr.status === 429 && simErr.body && simErr.body.code === 'SIMULATION_COOLDOWN') {
        showToast(simErr.body.message || 'Vui lòng đợi trước khi bắt đầu Test Simulation mới', 'error');
      } else if (simErr.status === 403 && simErr.body && simErr.body.code === 'REWRITE_REQUIRED') {
        _openRewriteGate(simErr.body);
      } else {
        showToast('Lỗi kết nối server', 'error');
      }
      return;
    }
  }

  {
    const url = `writing.html?taskType=${taskType}&taskId=${encodeURIComponent(taskId)}&exam=${mode}`;
    const st = { screen: 'practice-write', taskType, taskId, exam: mode };
    if (pushHistory) history.pushState(st, '', url);
    else history.replaceState(st, '', url);
  }
  practiceState.taskType  = taskType;
  practiceState.task      = task;
  practiceState.wordCount = 0;
  practiceState.seconds   = 0;
  practiceState.mode        = mode;
  practiceState.simAttemptId = simAttemptId;

  // Clear any stale draft when starting fresh — both the local copy AND the
  // server-synced one (discardPracticeAutoSave does the same pair). Missing
  // the server delete previously let an old server draft for this exact
  // task resurface later in checkPracticeRestoreBanner()'s merge, even
  // though the student had explicitly moved past it by starting over here.
  clearPracticeAutoSave(taskType, taskId);
  deleteDraftFromServer(taskType, taskId);
  renderPracticeWriteScreen(taskType, task);
  showScreen('screen-practice-write');
  startPracticeStopwatch(0, mode === 'simulation' ? simDurationSec : null);
  window.onbeforeunload = e => {
    if (practiceState.task) { e.preventDefault(); e.returnValue = ''; }
  };
  setTimeout(() => { const ta = document.getElementById('pw-textarea'); if (ta) ta.focus(); }, 100);

  if (mode === 'simulation' && window.ExamProctor) {
    window.ExamProctor.start({
      skill: 'writing', attemptType: 'practice', attemptId: simAttemptId,
      onDisqualified: () => {
        stopPracticeStopwatch();
        window.onbeforeunload = null;
        clearPracticeAutoSave(taskType, taskId);
        location.href = 'writing.html';
      },
      // The essay so far, kept voided server-side — see _saveDisqualifiedWriting.
      saveAnswers: () => {
        const answer = (document.getElementById('pw-textarea')?.value || '').trim();
        if (!answer) return Promise.resolve(null);
        return apiFetch('/api/writing/practice/submit', {
          method: 'POST', keepalive: true, skipAuthRedirect: true,
          body: JSON.stringify({ taskType, taskId: practiceState.task?._id || taskId, answer, attemptId: simAttemptId, disqualified: true }),
        });
      },
    });
  }
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
  // Same Test Simulation gate as the dictionary lookup below (practiceState.
  // mode === 'simulation') — a sample essay or a "which stance to pick"
  // breakdown of the prompt is exactly the kind of hint real exam
  // conditions must not offer, so both get suppressed here too, not just
  // dictionary/translate.
  const isSimulation = practiceState.mode === 'simulation';
  // Prompt text first, then the chart/diagram — matches the actual IELTS
  // paper layout (read the instructions, then look at the graph), not the
  // other way round.
  let html = `<p style="font-size:13px;line-height:1.75;color:var(--text1,#111)">${escHtml(task.prompt || '')}</p>`;
  if (taskType === 1 && task.imageUrl) {
    html += `<img src="${task.imageUrl}" alt="Task 1 image" loading="lazy" style="max-width:100%;border-radius:8px;margin-top:12px;border:1px solid #e5e7eb" />`;
  }
  // "Phân tích đề" — available for both Task 1 (how to pick overview
  // highlights + split Body 1/2 from the chart) and Task 2 (which stance/
  // argument to pick + split Body 1/2 for the essay). Shown inline right
  // below the prompt/image (toggled open/closed) instead of a modal — a
  // covering modal hid the prompt itself, which defeats the point of
  // reading the analysis WHILE looking at the chart/question.
  const hasAnalysis = !isSimulation && Array.isArray(task.analysisSections) && task.analysisSections.some(s => s.content?.trim());
  if (hasAnalysis) {
    // Colour-coded like the model answer (js/shared/analysis-format.js:
    // headings, model sentences, phrase → example, plan steps, checklist);
    // --i staggers the open animation.
    const fmt = window.AnalysisFormat;
    const analysisHtml = task.analysisSections.filter(s => s.content?.trim()).map((s, i) => {
      const t = fmt ? fmt.title(s.title) : null;
      return `
      <div class="pw-analysis-section${t ? ' tone-' + t.tone : ''}" style="--i:${i}">
        <div class="pw-analysis-section-title">${t ? t.html : `<span>${escHtml(s.title)}</span>`}</div>
        <div class="pw-analysis-section-body${fmt ? ' is-rich' : ''}">${fmt ? fmt.html(s.content) : escHtml(s.content)}</div>
      </div>`;
    }).join('');
    html += `<button class="btn-secondary pw-analysis-btn" id="pw-analysis-toggle-btn" style="margin-top:12px;width:100%" onclick="toggleAnalysisPanel()"><i class="fas fa-search"></i> Phân tích đề</button>`;
    html += `<div id="pw-analysis-inline" class="t2hl-root" style="display:none;margin-top:12px">${analysisHtml}</div>`;
  }
  // "Xem template" — Task 2 only: the generic fill-in template of whichever
  // of the 7 essay types the student picks (js/shared/task2-generic-tpl.js),
  // inline under "Phân tích đề" so the prompt stays in view. Hidden in Test
  // Simulation like the analysis.
  if (taskType === 2 && !isSimulation && window.Task2GenericTpl) {
    practiceState.tplType = _taskEssayType(task);
    html += `<button class="btn-secondary pw-analysis-btn" id="pw-tpl-toggle-btn" style="margin-top:12px;width:100%" onclick="togglePracticeTemplate()"><i class="fas fa-file-lines"></i> Xem template</button>`;
    html += renderPracticeTemplatePanel();
  }
  // "Từ vựng chủ đề" — topic vocab right under "Phân tích đề", open (not
  // behind a toggle) so students can lift phrases while they write. Task 2
  // only (lists come from WritingTask2.vocabularyList or the matching
  // course topic — writingService.attachTask2Vocab); hidden in Test
  // Simulation like the analysis and sample.
  practiceState.vocab = taskType === 2 && !isSimulation && Array.isArray(task.vocabularyList)
    ? task.vocabularyList.filter(v => v && v.term) : [];
  if (practiceState.vocab.length) html += renderPracticeVocab(practiceState.vocab);
  window.WordAudio?.prefetch(practiceState.vocab.map(v => v.term));
  leftPanel.innerHTML = html;
  // Dictionary lookup only in practice/review, never during the timed real
  // exam (that screen has its own separate wiring — see launchExam()) or a
  // Test Simulation attempt on THIS screen — setupDictionaryDouble() is
  // idempotent (removes any previous listener first), so calling it on
  // every render here is safe.
  const _pwDictGate = () => practiceState.mode !== 'simulation';
  setupDictionaryDouble('pw-left-panel', 'writing-practice', _pwDictGate);
  setupDictionaryDouble('pw-textarea', 'writing-practice', _pwDictGate);
  setupDictionaryDouble('pw-instructions-label', 'writing-practice', _pwDictGate);

  // Show/hide sample toggle bar based on whether sample exists — suppressed
  // during Test Simulation, same as "Phân tích đề" above (isSimulation).
  const hasSample = !isSimulation && Array.isArray(task.sampleSections) && task.sampleSections.some(s => s.content?.trim());
  const bar = document.getElementById('pw-sample-bar');
  if (bar) bar.style.display = hasSample ? '' : 'none';

  // Pre-build sample panel HTML with copy buttons
  const panel = document.getElementById('pw-sample-panel');
  if (panel && hasSample) {
    // Model answers carry colour-coded sentence roles (Task 2: hook /
    // thesis / topic / idea / supporting / restatement / final; Task 1:
    // paraphrase / overview / topic / detail / comparison) — see
    // js/shared/task2-highlight.js.
    const sections = task.sampleSections.filter(s => s.content?.trim());
    const hl = window.T2Highlight && T2Highlight.hasAny(sections);
    panel.classList.toggle('t2hl-root', !!hl);
    panel.innerHTML = (hl ? T2Highlight.legend(sections) : '') + sections.map((s, i) => `
      <div class="pw-sample-section">
        <div class="pw-sample-section-title">
          <span>${escHtml(s.title)}</span>
          <button class="pw-copy-btn" onclick="copySampleSection(this,${i})" title="Sao chép đoạn này"><i class="fas fa-copy"></i> Copy</button>
        </div>
        <div class="pw-sample-section-body">${hl ? T2Highlight.html(s.content, s.highlights) : escHtml(s.content)}</div>
      </div>`).join('') + renderBandExplanation(task.bandExplanation);
    if (hl) T2Highlight.applyPref(panel);
    setupDictionaryDouble('pw-sample-panel', 'writing-practice-sample', _pwDictGate);
  } else if (panel) {
    panel.classList.remove('t2hl-root');
    panel.innerHTML = '';
  }

  // Reset sample toggle to OFF
  const chk = document.getElementById('pw-sample-chk');
  if (chk) chk.checked = false;
  togglePracticeSample(false);
}

// "Vì sao bài mẫu đạt Band 7.5+?" — below the model answer: one block per
// marking criterion (task.bandExplanation), formatted like "Phân tích đề".
// Its own .t2hl-root so the colours work even when the essay above has no
// sentence highlights. Not a .pw-sample-section, so copySampleSection's
// indexes still line up with the essay paragraphs.
function renderBandExplanation(notes) {
  const items = (Array.isArray(notes) ? notes : []).filter(n => n && n.content?.trim());
  if (!items.length) return '';
  const fmt = window.AnalysisFormat;
  return `
    <div class="pw-band-why t2hl-root">
      <div class="pw-band-why-head"><i class="fas fa-award"></i> Vì sao bài mẫu đạt Band 7.5+?</div>
      ${items.map((n, i) => `
      <div class="pw-analysis-section tone-${i === 0 ? 'plan' : 'intro'}" style="--i:${i}">
        <div class="pw-analysis-section-title"><span class="an-title-txt">${escHtml(n.title || '')}</span></div>
        <div class="pw-analysis-section-body${fmt ? ' is-rich' : ''}">${fmt ? fmt.html(n.content) : escHtml(n.content)}</div>
      </div>`).join('')}
    </div>`;
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

function toggleAnalysisPanel() {
  const panel = document.getElementById('pw-analysis-inline');
  const btn = document.getElementById('pw-analysis-toggle-btn');
  if (!panel) return;
  const show = panel.style.display === 'none';
  panel.style.display = show ? '' : 'none';
  if (btn) {
    btn.classList.toggle('is-open', show);
    btn.innerHTML = show
      ? '<i class="fas fa-chevron-up"></i> Ẩn phân tích đề'
      : '<i class="fas fa-search"></i> Phân tích đề';
  }
}

// ── "Xem template" panel (Task 2 practice) ──────────────────────
// practiceState.tplType is pre-set from the prompt wording when it clearly
// matches one type (Task2GenericTpl.guessType), otherwise null until the
// student picks a type. Level and the Vietnamese toggle persist across
// prompts for the session.
function renderPracticeTemplatePanel() {
  if (!practiceState.tplLevel) practiceState.tplLevel = 'band6';
  const types = Task2GenericTpl.TYPES.map((t, i) => `
      <button type="button" class="pw-tpl-type" data-type="${t.id}" onclick="pickPracticeTemplate('${t.id}')">
        <span class="pw-tpl-type-no">${String(i + 1).padStart(2, '0')}</span> ${escHtml(t.label)}
      </button>`).join('');
  return `
    <div id="pw-tpl-inline" class="pw-tpl" style="display:none">
      <div class="pw-tpl-ask">Chọn dạng bài bạn muốn xem template:</div>
      <div class="pw-tpl-types">${types}</div>
      <div class="pw-tpl-bar">
        <div class="pw-tpl-levels">
          <button type="button" class="pw-tpl-level" data-level="band6" onclick="setPracticeTemplateLevel('band6')">🌱 Band 6+</button>
          <button type="button" class="pw-tpl-level" data-level="band7" onclick="setPracticeTemplateLevel('band7')">🏆 Band 7+</button>
        </div>
        <button type="button" class="pw-tpl-vi-btn" id="pw-tpl-vi-btn" onclick="togglePracticeTemplateVi()"></button>
      </div>
      <div id="pw-tpl-body" class="pw-tpl-body"></div>
    </div>`;
}

function togglePracticeTemplate() {
  const panel = document.getElementById('pw-tpl-inline');
  const btn = document.getElementById('pw-tpl-toggle-btn');
  if (!panel) return;
  const show = panel.style.display === 'none';
  panel.style.display = show ? '' : 'none';
  if (btn) {
    btn.classList.toggle('is-open', show);
    btn.innerHTML = show
      ? '<i class="fas fa-chevron-up"></i> Ẩn template'
      : '<i class="fas fa-file-lines"></i> Xem template';
  }
  if (show) renderPracticeTemplateBody();
}

function pickPracticeTemplate(typeId) {
  practiceState.tplType = typeId;
  renderPracticeTemplateBody();
}

function setPracticeTemplateLevel(level) {
  if (practiceState.tplLevel === level) return;
  practiceState.tplLevel = level;
  renderPracticeTemplateBody();
}

function togglePracticeTemplateVi() {
  practiceState.tplVi = !practiceState.tplVi;
  _syncPracticeTemplateControls();
  Task2GenericTpl.setVi(document.getElementById('pw-tpl-body'), practiceState.tplVi);
}

function _syncPracticeTemplateControls() {
  document.querySelectorAll('#pw-tpl-inline .pw-tpl-type').forEach(b =>
    b.classList.toggle('active', b.dataset.type === practiceState.tplType));
  document.querySelectorAll('#pw-tpl-inline .pw-tpl-level').forEach(b =>
    b.classList.toggle('active', b.dataset.level === practiceState.tplLevel));
  const vi = document.getElementById('pw-tpl-vi-btn');
  if (vi) vi.textContent = practiceState.tplVi ? '🇻🇳 Ẩn tiếng Việt' : '🇻🇳 Hiện tiếng Việt';
}

async function renderPracticeTemplateBody() {
  const body = document.getElementById('pw-tpl-body');
  if (!body) return;
  _syncPracticeTemplateControls();
  if (!practiceState.tplType) {
    body.innerHTML = '';
    return;
  }
  if (!window.TASK2_GENERIC_TEMPLATES) body.innerHTML = '<div class="gtpl-empty">⏳ Đang tải...</div>';
  let data = null;
  try { data = await Task2GenericTpl.load(); } catch (e) {}
  // The panel may have been re-rendered for another prompt while loading.
  const cur = document.getElementById('pw-tpl-body');
  if (!cur) return;
  cur.innerHTML = data
    ? Task2GenericTpl.html(data, practiceState.tplLevel, practiceState.tplType, !!practiceState.tplVi)
    : '<div class="gtpl-empty">Không tải được nội dung. Vui lòng thử lại.</div>';
}

// First N terms shown; the rest behind "Xem thêm" (course-topic lists run
// to 30–40 terms, which would bury the prompt).
const PW_VOCAB_PREVIEW = 8;

function renderPracticeVocab(list) {
  const items = list.map((v, i) => `
      <div class="pw-vitem${i >= PW_VOCAB_PREVIEW ? ' is-extra' : ''}" data-i="${i}">
        <div class="pw-vitem-main">
          <div class="pw-vitem-term">${escHtml(v.term)}<button type="button" class="pw-vspeak" onclick="speakPracticeVocab(${i})" title="Nghe phát âm" aria-label="Nghe phát âm"><i class="fas fa-volume-up"></i></button></div>
          ${v.definitionVi ? `<div class="pw-vitem-def">${escHtml(v.definitionVi)}</div>` : ''}
          ${v.example ? `<div class="pw-vitem-ex">"${escHtml(v.example)}"</div>` : ''}
        </div>
        <button type="button" class="pw-vbtn" onclick="savePracticeVocab(${i})" title="Lưu vào sổ từ vựng" aria-label="Lưu vào sổ từ vựng"><i class="fas fa-plus"></i></button>
      </div>`).join('');
  const extra = list.length - PW_VOCAB_PREVIEW;
  return `
    <section class="pw-vocab" id="pw-vocab">
      <div class="pw-vocab-head">
        <span class="pw-vocab-title"><i class="fas fa-book-open"></i> Từ vựng chủ đề <span class="pw-vocab-count">${list.length} từ</span></span>
        <button type="button" class="pw-vocab-saveall" onclick="savePracticeVocab(-1)"><i class="fas fa-save"></i> Lưu tất cả</button>
      </div>
      <div class="pw-vocab-hint">Tận dụng các cụm từ này trong bài viết để nâng điểm Lexical Resource.</div>
      <div class="pw-vlist">${items}</div>
      ${extra > 0 ? `<button type="button" class="pw-vocab-more" id="pw-vocab-more" onclick="togglePracticeVocabMore()">Xem thêm ${extra} từ <i class="fas fa-chevron-down"></i></button>` : ''}
    </section>`;
}

function togglePracticeVocabMore() {
  const box = document.getElementById('pw-vocab');
  const btn = document.getElementById('pw-vocab-more');
  if (!box || !btn) return;
  const all = box.classList.toggle('show-all');
  btn.innerHTML = all
    ? 'Thu gọn <i class="fas fa-chevron-up"></i>'
    : `Xem thêm ${practiceState.vocab.length - PW_VOCAB_PREVIEW} từ <i class="fas fa-chevron-down"></i>`;
}

function speakPracticeVocab(idx) {
  const v = practiceState.vocab?.[idx];
  if (!v) return;
  if (window.WordAudio) { window.WordAudio.speak(v.term); return; }
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(v.term);
  u.lang = 'en-US';
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

// idx -1 = "Lưu tất cả". Same book picker as the dictionary popup
// (js/shared/dictionary-lookup.js); the callback gets the terms that were
// actually saved, which flip to a ✓.
function savePracticeVocab(idx) {
  const list = practiceState.vocab || [];
  const picked = idx < 0 ? list : [list[idx]].filter(Boolean);
  if (!picked.length || !window.openVocabBookPickerBulk) return;
  window.openVocabBookPickerBulk(
    picked.map(v => ({ word: v.term, meaning: v.definitionVi || '', example: v.example || '' })),
    terms => {
      const saved = new Set(terms);
      document.querySelectorAll('#pw-vocab .pw-vitem').forEach(el => {
        const v = list[+el.dataset.i];
        if (!v || !saved.has(v.term)) return;
        const btn = el.querySelector('.pw-vbtn');
        if (btn) { btn.classList.add('saved'); btn.disabled = true; btn.title = 'Đã lưu'; btn.innerHTML = '<i class="fas fa-check"></i>'; }
      });
    });
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
// Cached across keystrokes — these 5 ids are static practice-mode markup
// (never rebuilt via innerHTML), so re-querying them on every keystroke was
// wasted work.
let _pwTextareaEl = null, _pwWcEl = null, _pwWcInlineEl = null, _pwProgressBarEl = null, _pwSaveStatusEl = null;
function onPracticeInput() {
  if (!_pwTextareaEl) _pwTextareaEl = document.getElementById('pw-textarea');
  const ta = _pwTextareaEl;
  if (!ta) return;
  const words = ta.value.trim() === '' ? 0 : ta.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  practiceState.wordCount = words;
  const minWords = practiceState.taskType === 1 ? 150 : 250;
  const pct = Math.min(100, (words / minWords) * 100);
  if (!_pwWcEl) _pwWcEl = document.getElementById('pw-wc');
  if (_pwWcEl) _pwWcEl.textContent = words;
  if (!_pwWcInlineEl) _pwWcInlineEl = document.getElementById('pw-wc-inline-n');
  const inlineN = _pwWcInlineEl;
  if (inlineN) inlineN.textContent = words;
  if (!_pwProgressBarEl) _pwProgressBarEl = document.getElementById('pw-progress-bar');
  const bar = _pwProgressBarEl;
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = words >= minWords ? '#22c55e' : words >= minWords * 0.8 ? '#f59e0b' : '#3d8bff';
  }
  // Show unsaved indicator immediately
  if (!_pwSaveStatusEl) _pwSaveStatusEl = document.getElementById('pw-save-status');
  const si = _pwSaveStatusEl;
  if (si) { si.innerHTML = '<i class="fas fa-circle" style="font-size:7px;vertical-align:middle"></i> Chưa lưu'; si.style.color = '#f59e0b'; }
  // Debounced auto-save
  clearTimeout(_practiceSaveDebounce);
  _practiceSaveDebounce = setTimeout(savePracticeToStorage, 800);
}

// `limitSec` (Test Simulation only — undefined for Practice, exactly
// today's behavior): once reached, auto-submits, same "time's up"
// convention the full exam's own countdown and Reading practice's
// identical addition use. Still a count-UP stopwatch (unchanged UI).
function startPracticeStopwatch(startSeconds = 0, limitSec) {
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
    if (limitSec && practiceState.seconds >= limitSec) {
      clearInterval(practiceState.stopwatchInterval);
      showToast('Hết giờ Test Simulation — tự động nộp bài.', 'warning', 4000);
      submitPractice();
    }
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
  // Same fix as forceExit() above — abandoning a Simulation practice
  // attempt via "Thoát" must disarm the proctor, not just submitting it.
  if (practiceState.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
  // BUG-109: same fix as forceExit() — cancel the placeholder attempt
  // server-side instead of leaving it 'in-progress' forever (which then
  // showed up in "Lịch sử luyện tập" as a fake 0-word "Chờ chấm" entry).
  if (practiceState.mode === 'simulation' && practiceState.simAttemptId) {
    apiFetch('/api/writing/cancel-simulation', { method: 'POST', body: JSON.stringify({ attemptId: practiceState.simAttemptId }) }).catch(() => {});
  }
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

  const _ctrl = new AbortController();
  const _killer = setTimeout(() => _ctrl.abort(), 30000);
  try {
    // skipAuthRedirect: same reasoning as submitExam() above — a 401 here
    // must not hard-redirect while a Simulation practice attempt's proctor
    // is still armed.
    const d = await apiFetch('/api/writing/practice/submit', {
      method: 'POST',
      signal: _ctrl.signal,
      skipAuthRedirect: true,
      body: JSON.stringify({
        taskType: practiceState.taskType,
        taskId: practiceState.task?._id,
        answer,
        wordCount: practiceState.wordCount,
        // Test Simulation only — undefined for Practice, so the backend
        // takes the exact same insert path it always has.
        attemptId: practiceState.mode === 'simulation' ? practiceState.simAttemptId : undefined,
      })
    });
    clearTimeout(_killer);
    if (!d.success) throw new Error(d.message || 'Lỗi nộp bài');

    if (practiceState.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
    if (window.showBadgeUnlocked && d.newlyUnlocked?.length) window.showBadgeUnlocked(d.newlyUnlocked);
    stopPracticeStopwatch();
    clearPracticeAutoSave(practiceState.taskType, practiceState.task?._id);
    deleteDraftFromServer(practiceState.taskType, practiceState.task?._id);
    // Must happen before window.onbeforeunload is cleared below: a student
    // closing the tab/switching apps right after "Đã nộp bài!" fires
    // pagehide/visibilitychange, and _flushPracticeDraftOnLeave() only
    // checks `practiceState.task` — leaving it set would silently resave
    // (resurrect) the exact draft just deleted above.
    practiceState.task = null;
    window.onbeforeunload = null;
    document.getElementById('practice-submit-modal').classList.remove('open');
    const label = `Task ${practiceState.taskType} (${practiceState.wordCount} từ)`;
    document.getElementById('pw-done-label').textContent = `Đã nộp ${label}`;
    showScreen('screen-practice-done');
  } catch (e) {
    clearTimeout(_killer);
    if (e?.status === 403 && e.body?.code === 'REWRITE_REQUIRED') { _openRewriteGate(e.body); return; }
    const aborted = e && (e.name === 'AbortError' || /abort/i.test(e.message || ''));
    if (aborted) { showToast('Nộp bài quá lâu — bài vẫn được lưu tự động; thử lại sau vài giây.', 'error', 7000); return; }
    // Same 401-mid-exam fix as submitExam() — disarm the proctor ourselves
    // before the forced redirect, explain plainly, send them back to THIS
    // page (the practice autosave is untouched) instead of losing context.
    if (e && e.status === 401) {
      if (practiceState.mode === 'simulation' && window.ExamProctor) window.ExamProctor.stop();
      showToast('Phiên đăng nhập đã hết hạn — bài làm của bạn vẫn được lưu, hãy đăng nhập lại để nộp bài.', 'info', 6000);
      if (window.AuthService && window.AuthService.clearSession) window.AuthService.clearSession();
      const next = (window.AuthService && window.AuthService.buildLoginUrl)
        ? window.AuthService.buildLoginUrl(location.pathname + location.search)
        : ('/login.html?next=' + encodeURIComponent(location.pathname + location.search));
      location.href = next;
      return;
    }
    if (!_handleQuotaError(e)) showToast(e.message || 'Nộp bài thất bại', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Nộp bài'; }
  }
}
