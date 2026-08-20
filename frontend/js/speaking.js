/* ═══════════════════════════════════════════════════════
   speaking.js  –  EnglishWithDan Speaking Module
   All AI calls go through /api/speaking/analyze (backend).
═══════════════════════════════════════════════════════ */

const API = 'https://englishwithdan.onrender.com';

// showToast() and escHtml() moved to js/shared/toast.js and
// js/shared/utils.js (single source of truth — Phase 3 audit).

// ──────────────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────────────
// Delegates to AuthService (Phase 5) — kept as a local wrapper so the
// existing call sites below don't need to change.
function getToken() { return window.AuthService.getToken(); }

// logout() moved to js/auth.js (single source of truth — Phase 3 audit
// found this local copy never cleared 'lastLoginAt', unlike auth.js's).

// apiFetch keeps its own request-building (FormData-safe headers unchanged)
// and delegates response-handling to js/shared/api-client.js. The
// premium-expiry redirect (403 + requiresPremium) is speaking.html-specific
// UI behavior, so it stays here: it inspects the normalized error's
// .status/.body (attached by the shared handler) instead of re-parsing.
async function apiFetch(path, opts = {}) {
  const headers = { ...window.AuthService.authHeader() };
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers||{}) } });
  try {
    return await window.ApiClient.handleResponse(res);
  } catch (err) {
    if (err.status === 403 && err.body && err.body.requiresPremium) {
      showScreen('screen-upgrade');
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────
const state = {
  currentQuestion:  null,
  recognition:      null,
  isRecording:      false,
  recordStartTime:  null,
  // Snapshot of getElapsedSeconds() taken the instant recording actually
  // stops (_finishRecordingUI) — analyzeTranscript() sends this, not a
  // fresh getElapsedSeconds() call, since a student can spend anywhere
  // from seconds to several minutes reviewing/editing the transcript
  // before clicking "Phân tích": calling getElapsedSeconds() live at that
  // point folded all of that idle review time into the reported duration,
  // so admin saw wildly inflated "thời gian" values (e.g. 12+ minutes for
  // a Part 1 answer) that didn't match how long the student actually spoke.
  _frozenDurationSeconds: 0,
  elapsedTimer:     null,
  prepTimer:        null,
  speakTimer:       null,
  prepSecondsLeft:  60,
  speakSecondsLeft: 120,
  practiceInited:   false,
  partFilter:       '1',
  _analyzing:       false,
  materialFilter:   { quarter: 'all', topic: 'all' },
  _pendingTopicFromUrl: null,

  // Speech recognition can stop itself mid-answer even with continuous:true
  // (a well-known Chrome limitation, especially on longer Part 2 monologues)
  // — see setupRecognition()'s onend for the auto-restart that keeps this
  // from silently truncating the student's transcript.
  finalTranscript:        '',
  _userStoppedRecording:  false,
  _restartAttempts:       0,
  // Separate from _restartAttempts (which now resets on real speech — see
  // onresult — so it only tracks a *consecutive* failure streak for the
  // dead-mic cap). This one only ever resets in _startRecordingGuarded, so
  // onstart can still tell "genuine first start of this session" apart from
  // "resumed after a transparent auto-restart" regardless of how many times
  // _restartAttempts itself has been reset by then.
  _recognitionEverStarted: false,
  // True from the moment the record button is clicked until start()/stop()
  // actually settles (onstart/onerror/onend, all async). Without this, a
  // second click landing in that gap — a fast double-tap, or just an
  // impatient click before the icon visibly changes on a slow device/first
  // permission prompt — used to be read as "stop" and cancel the session
  // before it ever began, with no visible error (see toggleRecord()).
  _recordBusy:            false,
  // Bumped on every start attempt so a stale watchdog timeout (see
  // toggleRecord()) can tell it's no longer about the current attempt and
  // skip firing, instead of misfiring against a later session.
  _recordWatchdogToken:   0,

  // Sequential (mock-test) topic practice — fully isolated from the fields above
  lastQuestionList:   [],
  seqQueue:           [],
  seqIndex:           0,
  seqAnswers:         [],
  seqRecognition:     null,
  seqIsRecording:     false,
  seqFinalTranscript: '',
  _seqUserStoppedRecording: false,
  _seqRestartAttempts:      0,
  _seqRecognitionEverStarted: false,
  seqActive:          false,
  seqTextRevealed:    false,
  seqSilenceTimer:    null,
  seqSilenceSecondsLeft: 3,
  seqPrepTimer:       null,
  seqPrepSecondsLeft: 60,
  seqSpeakTimer:      null,
  seqSpeakSecondsLeft: 120,
  seqElapsedTimer:    null,
  seqRecordStartTime: null,
  seqTotalElapsed:    0,
  seqIsFullMock:      false,
  seqPreviewMode:     'topic', // 'topic' | 'fullmock' — which flow opened #seq-preview-modal
};

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────
// fmtTime() and clearAllTimers() moved to js/speaking-timer.js along with
// the rest of the exam-timer subsystem (prep countdown, speak countdown,
// elapsed timer) — kept together since they're all part of the same
// cohesive concern and only touch the `state` object above.

function bandColor(band) {
  if (band >= 7) return 'high';
  if (band >= 5.5) return 'medium';
  return 'low';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
}

// ──────────────────────────────────────────────────────
// Screen navigation
// ──────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
  window.scrollTo(0, 0);
}

// ──────────────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────────────
(async function init() {
  // Delegates to the same AuthService.requirePageAuth() used by auth.js's
  // Guard 1 (Phase 5) — this used to be its own redundant `if(!token)`
  // check with no next= support.
  if (!window.AuthService.requirePageAuth(false)) return;

  // Premium gate: if localStorage shows free, re-verify with server
  // (catches stale cache after admin upgrades the account). hasPremiumAccess/
  // refreshPlan centralize logic that used to be hand-rolled here.
  let _u = window.AuthService.getUser() || {};
  if (!window.AuthService.hasPremiumAccess(_u)) {
    const _refreshed = await window.AuthService.refreshPlan();
    if (_refreshed) _u = _refreshed;
    if (!window.AuthService.hasPremiumAccess(_u)) {
      showScreen('screen-upgrade');
      return;
    }
  }

  // Speech API check
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const warn = document.getElementById('no-speech-warning');
    if (warn) warn.classList.add('visible');
  } else {
    setupRecognition();
  }
  primeTtsVoice();
  window.SpeakingAudioStore?.pruneOldRecordings(); // best-effort, non-blocking housekeeping

  // Enable analyze button on manual typing
  const ta = document.getElementById('transcript-textarea');
  if (ta) {
    ta.addEventListener('input', function() {
      const btn = document.getElementById('btn-analyze');
      if (btn) btn.disabled = !this.value.trim();
    });
  }

  // Navigate to the right screen/tab per the URL, also restoring the exact
  // Part/topic that was in the URL (?part=2&topic=Building) so reloading,
  // sharing, or bookmarking a filtered view lands back on the same
  // questions. Whichever tab this resolves to, replaceState so
  // `history.state` is populated for THIS entry (a direct load/bookmark
  // never runs through pushState, so `history.state` would otherwise be
  // null here) — popstate later relies on that to know what to restore.
  const urlParams = new URLSearchParams(location.search);
  const tabParam = urlParams.get('tab') || 'home';
  const partParam = urlParams.get('part');
  const topicParam = urlParams.get('topic');
  history.replaceState({ tab: tabParam, part: partParam, topic: topicParam }, '', location.href);

  if (tabParam === 'materials') {
    showScreen('screen-materials');
    loadMaterialFilters();
    loadMaterials();
  } else if (tabParam === 'practice') {
    showScreen('screen-practice');
    initPractice({ part: partParam, topic: topicParam });
  } else if (tabParam === 'history') {
    showScreen('screen-history');
    loadHistory();
  } else if (tabParam === 'speaking-tips') {
    showScreen('screen-speaking-tips');
    if (typeof initSpeakingTips === 'function') initSpeakingTips();
  }
  // else 'home' — screen-home is already the active screen in the static HTML.

  window.addEventListener('popstate', (e) => {
    const tab = e.state?.tab || 'home';
    if (tab === 'practice') {
      showScreen('screen-practice');
      initPractice({ part: e.state?.part, topic: e.state?.topic });
    } else if (tab === 'history') {
      showScreen('screen-history');
      loadHistory();
    } else if (tab === 'materials') {
      showScreen('screen-materials');
      loadMaterialFilters();
      loadMaterials();
    } else if (tab === 'speaking-tips') {
      showScreen('screen-speaking-tips');
      if (typeof initSpeakingTips === 'function') initSpeakingTips();
    } else {
      showScreen('screen-home');
    }
  });
})();

// ──────────────────────────────────────────────────────
// Tab navigation — every top-level screen reflected in the address bar
// (?tab=practice/history/materials, bare path for home) so refresh,
// sharing, and browser back/forward all work. Called from the home-screen
// cards and each screen's own "back" button; the popstate listener above
// mirrors the same dispatch for browser back/forward.
// ──────────────────────────────────────────────────────
function syncTabUrl(tab, push = true) {
  const url = tab === 'home' ? location.pathname : `?tab=${tab}`;
  if (push) history.pushState({ tab }, '', url);
  else history.replaceState({ tab }, '', url);
}
function goHome() { showScreen('screen-home'); syncTabUrl('home'); }

// Guards the single-question practice screen's "Trang chủ" back button —
// previously wired straight to goHome(), which discarded an in-progress or
// just-finished recording/transcript with zero warning (student UI audit,
// 2026-07-25). Only prompts when there's actually something to lose.
function confirmGoHome() {
  const hasTranscript = document.getElementById('transcript-textarea')?.value.trim();
  if (!state.isRecording && !hasTranscript) { goHome(); return; }
  confirmDialog(
    'Thoát luyện tập?',
    'Câu trả lời hiện tại chưa được lưu — thoát ra sẽ mất toàn bộ.',
    () => { if (state.isRecording) toggleRecord(); goHome(); },
    { confirmLabel: 'Thoát', confirmClass: 'btn-danger' }
  );
}
function goPractice() { showScreen('screen-practice'); syncTabUrl('practice'); initPractice(); }
function goHistory(fromScreen) {
  state._historyReturnScreen = fromScreen || null;
  showScreen('screen-history');
  syncTabUrl('history');
  loadHistory();
}
function goMaterials() { showScreen('screen-materials'); syncTabUrl('materials'); loadMaterialFilters(); loadMaterials(); }
function goSpeakingTips() { showScreen('screen-speaking-tips'); syncTabUrl('speaking-tips'); if (typeof initSpeakingTips === 'function') initSpeakingTips(); }

// ══════════════════════════════════════════════════════
// PRACTICE SCREEN
// ══════════════════════════════════════════════════════

async function initPractice(opts = {}) {
  if (state.practiceInited) return;
  state.practiceInited = true;

  if (opts.part && ['1', '2', '3'].includes(opts.part)) {
    state.partFilter = opts.part;
    document.querySelectorAll('.part-tab').forEach(b => b.classList.remove('active'));
    document.getElementById('ptab-' + opts.part)?.classList.add('active');
  }
  // Consumed once by loadTopics() below (applied only after the real topic
  // list has loaded, so it can validate the URL's topic actually exists).
  state._pendingTopicFromUrl = opts.topic || null;

  await loadTopics();
  // Refines the URL with the actual part/topic now that topics have
  // loaded (goPractice()'s pushState above fires before this resolves) —
  // replaceState since this is just adding detail, not new navigation.
  syncUrlState();
}

// Keeps the address bar in sync with the current Part/topic selection —
// replaceState (not pushState) so switching tabs/topics doesn't spam
// browser history, it just makes the current view reloadable/shareable.
function syncUrlState() {
  const url = new URL(location.href);
  url.searchParams.set('tab', 'practice');
  url.searchParams.set('part', state.partFilter);
  const topic = document.getElementById('sel-topic')?.value;
  if (topic && topic !== 'all') url.searchParams.set('topic', topic);
  else url.searchParams.delete('topic');
  history.replaceState(null, '', url);
}

// ── Part filter ──
async function setPartFilter(part, el) {
  state.partFilter = part;
  document.querySelectorAll('.part-tab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  // Awaited so syncUrlState() below reads #sel-topic's settled value —
  // loadTopics() repopulates (and can reset) it asynchronously.
  await loadTopics();
  syncUrlState();
}

// ── Topic filter (wraps loadQuestions() so #sel-topic's onchange also syncs the URL) ──
function onTopicFilterChange() {
  loadQuestions();
  syncUrlState();
}

// ── Topics ──
async function loadTopics() {
  try {
    const qs = state.partFilter !== 'all' ? `?part=${state.partFilter}` : '';
    const data = await apiFetch(`/api/speaking/topics${qs}`);
    const sel = document.getElementById('sel-topic');
    // A pending topic from the URL (first load only, cleared right after
    // use) takes priority over preserving whatever was previously selected;
    // only applied if it's actually a real topic for this part.
    const pending = state._pendingTopicFromUrl;
    state._pendingTopicFromUrl = null;
    const prev = pending || sel.value;
    sel.innerHTML = '<option value="all">Tất cả chủ đề</option>';
    (data.topics || []).forEach(t => {
      const opt = document.createElement('option');
      opt.value = t; opt.textContent = t;
      if (t === prev) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error('loadTopics:', e);
  }
  await loadQuestions();
}

// ── Questions ──
// Renders a question list into #question-list — shared by loadQuestions()
// (server-filtered by part/topic) and filterQuestionList() (client-side
// text search over the already-cached state.lastQuestionList, no re-fetch).
function renderQuestionItems(questions, emptyMessage) {
  const list = document.getElementById('question-list');
  if (!list) { updateSeqButtonVisibility(); return; }
  if (!questions.length) {
    list.innerHTML = `<div style="font-size:13px;color:#9ca3af;padding:12px 0;text-align:center">${emptyMessage || 'Không có câu hỏi'}</div>`;
    updateSeqButtonVisibility();
    return;
  }

  list.innerHTML = '';
  // Consecutive same-topic questions are already adjacent (loadQuestions()
  // sorts server-side by part then topic; filterQuestionList() preserves
  // that order) — group them under one shared header instead of repeating
  // the topic badge on every single card.
  let currentGroup = null;
  let currentTopicKey = null;
  questions.forEach(q => {
    const topicKey = `${q.part}::${q.topic}`;
    if (topicKey !== currentTopicKey) {
      currentTopicKey = topicKey;
      currentGroup = document.createElement('div');
      currentGroup.className = 'q-topic-group';
      currentGroup.innerHTML = `<div class="q-topic-group-header">${escHtml(q.topic)}</div>`;
      list.appendChild(currentGroup);
    }

    const item = document.createElement('div');
    item.className = 'question-item';
    item.dataset.id = q._id;
    item.dataset.q  = JSON.stringify(q);

    const badgeClass = `p${q.part}`;
    item.innerHTML = `
      <div class="q-item-meta">
        <span class="q-item-badge ${badgeClass}">Part ${q.part}</span>
        ${q.attempted ? '<span class="q-item-attempted-badge" title="Bạn đã luyện câu này rồi — bấm để làm lại"><i class="fas fa-check-circle"></i> Đã luyện · Làm lại</span>' : ''}
      </div>
      <div class="q-item-text">${escHtml(q.question)}</div>`;
    item.onclick = () => selectQuestion(q, item);
    currentGroup.appendChild(item);
  });
  updateSeqButtonVisibility();
}

async function loadQuestions() {
  const topic = document.getElementById('sel-topic').value;
  const params = [];
  if (state.partFilter !== 'all') params.push(`part=${state.partFilter}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  const list = document.getElementById('question-list');
  if (list) list.innerHTML = '<div class="spinner"></div>';
  const searchInput = document.getElementById('q-search-input');
  if (searchInput) searchInput.value = ''; // reset search whenever the part/topic filter changes

  try {
    const data = await apiFetch(`/api/speaking/questions${qs}`);
    const questions = data.questions || [];
    state.lastQuestionList = questions;
    renderQuestionItems(questions);
  } catch (e) {
    if (list) list.innerHTML = '<div style="font-size:13px;color:#e53935;padding:8px 0">Lỗi tải câu hỏi</div>';
    console.error('loadQuestions:', e);
    state.lastQuestionList = [];
    updateSeqButtonVisibility();
  }
}

// Client-side text search over the already-loaded list — no network call,
// keeps the (up to 565-question) flat list actually browsable.
function filterQuestionList() {
  const q = (document.getElementById('q-search-input')?.value || '').trim().toLowerCase();
  if (!q) { renderQuestionItems(state.lastQuestionList); return; }
  const filtered = state.lastQuestionList.filter(item =>
    item.question.toLowerCase().includes(q) || (item.topic || '').toLowerCase().includes(q)
  );
  renderQuestionItems(filtered, 'Không tìm thấy câu hỏi phù hợp');
}

function selectQuestion(q, itemEl) {
  // Highlight selected
  document.querySelectorAll('.question-item').forEach(i => i.classList.remove('active'));
  if (itemEl) itemEl.classList.add('active');

  setQuestion(q);
  resetPractice();

  // Show practice content
  document.getElementById('practice-empty').style.display   = 'none';
  document.getElementById('practice-content').style.display = 'block';

  // On mobile, scroll to practice area
  if (window.innerWidth <= 768) {
    document.getElementById('practice-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function loadRandomQuestion() {
  const topic = document.getElementById('sel-topic').value;
  const params = [];
  if (state.partFilter !== 'all') params.push(`part=${state.partFilter}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  try {
    const data = await apiFetch(`/api/speaking/random${qs}`);
    if (!data.question) { showToast('Không tìm thấy câu hỏi phù hợp.', 'warn'); return; }

    // Highlight in list
    const listItem = document.querySelector(`.question-item[data-id="${data.question._id}"]`);
    document.querySelectorAll('.question-item').forEach(i => i.classList.remove('active'));
    if (listItem) listItem.classList.add('active');

    setQuestion(data.question);
    resetPractice();

    document.getElementById('practice-empty').style.display   = 'none';
    document.getElementById('practice-content').style.display = 'block';

    // Same mobile auto-scroll as selectQuestion() — without this, tapping
    // "Random" left the student stranded above the sidebar's own scrollable
    // question list, having to manually scroll past it to see the new
    // question that just loaded.
    if (window.innerWidth <= 768) {
      document.getElementById('practice-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (e) {
    console.error('loadRandomQuestion:', e);
    showToast('Không thể tải câu hỏi. Vui lòng thử lại.', 'error');
  }
}

function setQuestion(q) {
  state.currentQuestion = q;

  const partBadge  = document.getElementById('q-part-badge');
  const topicBadge = document.getElementById('q-topic-badge');
  const qText      = document.getElementById('q-text');
  const qCue       = document.getElementById('q-cue');

  if (partBadge)  partBadge.textContent  = `Part ${q.part}`;
  if (topicBadge) topicBadge.textContent = q.topic || '';
  if (qText)      qText.textContent      = q.question;
  if (qCue) {
    if (q.cueCard) { qCue.textContent = q.cueCard; qCue.style.display = 'block'; }
    else             qCue.style.display = 'none';
  }

  // Sample Answer — available for all 3 parts, each with its own shape
  // (see showSampleAnswer()); reset whenever the question changes so a
  // stale answer never carries over.
  const sampleBox = document.getElementById('sample-answer-box');
  if (sampleBox) { sampleBox.style.display = 'none'; sampleBox.dataset.forQuestion = ''; }
  _sampleAnswerText = '';

  // Hints box — same reset-on-question-change rule as the sample answer above.
  const hintsBox = document.getElementById('hints-box');
  if (hintsBox) { hintsBox.style.display = 'none'; hintsBox.dataset.forQuestion = ''; }

  // Scratch notes — same reset-on-question-change rule, but NOT cleared by
  // retryQuestion() (which calls resetPractice(), not setQuestion()), so
  // notes survive a retry of the same question.
  const notesTa = document.getElementById('notes-textarea');
  if (notesTa) notesTa.value = '';

  readQuestion();

  if (q.part === 2) {
    setTimeout(() => { if (state.currentQuestion === q) startPrepTimer(); }, 100);
  }

  setupDictionaryDouble('question-card', 'speaking-question');
  setupDictionaryDouble('transcript-textarea', 'speaking-transcript');
}

// ──────────────────────────────────────────────────────
// Text-to-speech — shared by the single-question flow, sequential
// mode, and the full mock test below. Left-to-its-defaults, most
// browsers fall back to a robotic OS-level voice; explicitly picking
// a known natural-sounding engine (when the browser offers one) and
// a slightly faster, more conversational rate sounds far less robotic.
// ──────────────────────────────────────────────────────
let _ttsVoice = null;

function primeTtsVoice() {
  if (!('speechSynthesis' in window)) return;
  const load = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) _ttsVoice = pickNaturalVoice(voices);
  };
  load();
  // Chrome loads voices asynchronously — getVoices() can return [] on the
  // very first call, then fire this event once the real list is ready.
  window.speechSynthesis.onvoiceschanged = load;
}

function pickNaturalVoice(voices) {
  const preferredNames = [
    'Google US English',
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
    'Samantha',
    'Daniel',
    'Karen',
  ];
  for (const name of preferredNames) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // Any locally-installed (non-network) English voice beats an unknown default.
  const localEn = voices.find(v => v.lang?.startsWith('en') && v.localService);
  if (localEn) return localEn;
  return voices.find(v => v.lang?.startsWith('en')) || null;
}

// onEnd (optional) fires once the utterance finishes — used by sequential
// mode to delay starting recording until the question has actually been
// read aloud (see loadSeqQuestion()). Guarded against firing twice and
// backstopped with a timeout in case onend/onerror never arrive (a known
// flaky quirk in some browsers, e.g. after the tab was backgrounded).
function speakText(text, onEnd) {
  if (!text || !('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang  = 'en-US';
  utter.rate  = 0.95;
  utter.pitch = 1.0;
  if (_ttsVoice) utter.voice = _ttsVoice;
  if (onEnd) {
    let fired = false;
    const fire = () => { if (!fired) { fired = true; onEnd(); } };
    utter.onend = fire;
    utter.onerror = fire;
    setTimeout(fire, 10000);
  }
  window.speechSynthesis.speak(utter);
}

function readQuestion() {
  const q = state.currentQuestion;
  if (!q) return;
  speakText(q.question);
}

// ──────────────────────────────────────────────────────
// Sample Answer (Part 1 only) — AI-generated 2-4 sentence model answer
// following the Opinion/Reason/Example structure with a natural filler
// word or discourse marker, per the coaching notes this was built from.
// ──────────────────────────────────────────────────────
let _sampleAnswerText = '';

async function showSampleAnswer() {
  const q = state.currentQuestion;
  if (!q) return;

  const box    = document.getElementById('sample-answer-box');
  const textEl = document.getElementById('sample-answer-text');
  const btn    = document.getElementById('q-sample-btn');
  if (!box || !textEl || !btn) return;

  // Toggle closed if it's already showing an answer for this exact question.
  if (box.style.display === 'block' && box.dataset.forQuestion === q.question) {
    box.style.display = 'none';
    return;
  }

  box.dataset.forQuestion = q.question;
  box.style.display = 'block';
  textEl.innerHTML = '<div class="spinner"></div>';
  btn.disabled = true;

  try {
    const data = await apiFetch('/api/speaking/sample-answer', {
      method: 'POST',
      body: JSON.stringify({ questionId: q._id, question: q.question, part: q.part, cueCard: q.cueCard || '' }),
    });
    _sampleAnswerText = data.sampleAnswer || '';
    textEl.textContent = _sampleAnswerText;
  } catch (e) {
    console.error('showSampleAnswer:', e);
    showToast('Không thể tạo câu trả lời mẫu. Vui lòng thử lại.', 'error');
    box.style.display = 'none';
  } finally {
    btn.disabled = false;
  }
}

function replaySampleAnswer() {
  if (_sampleAnswerText) speakText(_sampleAnswerText);
}

// ──────────────────────────────────────────────────────
// Hints (vocab generated alongside the sample answer, without revealing
// the sample text itself) — a lighter-touch nudge a student can reach for
// before jumping straight to the full Sample Answer. Mirrors
// showSampleAnswer()'s toggle-closed/loading/error handling exactly.
// ──────────────────────────────────────────────────────
async function showHints() {
  const q = state.currentQuestion;
  if (!q) return;

  const box   = document.getElementById('hints-box');
  const btn   = document.getElementById('q-hints-btn');
  if (!box || !btn) return;

  if (box.style.display === 'block' && box.dataset.forQuestion === q.question) {
    box.style.display = 'none';
    return;
  }

  box.dataset.forQuestion = q.question;
  box.style.display = 'block';
  document.getElementById('hints-vocab').innerHTML = '<div class="spinner"></div>';
  btn.disabled = true;

  try {
    const data = await apiFetch('/api/speaking/hints', {
      method: 'POST',
      body: JSON.stringify({ questionId: q._id, question: q.question, part: q.part, cueCard: q.cueCard || '' }),
    });
    renderHints(data.hints);
  } catch (e) {
    console.error('showHints:', e);
    showToast('Không thể tạo gợi ý. Vui lòng thử lại.', 'error');
    box.style.display = 'none';
  } finally {
    btn.disabled = false;
  }
}

function renderHints(hints) {
  const vocabEl = document.getElementById('hints-vocab');
  const vocab = hints?.vocab || [];

  vocabEl.innerHTML = vocab.length
    ? vocab.map(v => `<span class="hint-chip">${escHtml(v)}</span>`).join('')
    : '<span class="hints-empty">Không có gợi ý từ vựng.</span>';
}

function resetPractice() {
  clearAllTimers();
  state._userStoppedRecording = true; // abandon this session — don't let onend auto-restart it
  if (state.isRecording && state.recognition) state.recognition.stop();
  state.isRecording    = false;
  state._recordBusy    = false; // force-stopping here, outside toggleRecord()'s own flow
  state.recordStartTime = null;
  state._frozenDurationSeconds = 0;
  state._analyzing      = false;

  hidePrepTimer();
  hideSpeakCountdown();

  // Reset UI
  const ta          = document.getElementById('transcript-textarea');
  const btnAnalyze  = document.getElementById('btn-analyze');
  const fbSection   = document.getElementById('feedback-section');
  const interim     = document.getElementById('transcript-interim');
  const recStatus   = document.getElementById('rec-status');
  const btnRecord   = document.getElementById('btn-record');
  const elapsed     = document.getElementById('rec-elapsed');
  const recIcon     = document.getElementById('rec-icon');
  const recLabel    = document.getElementById('rec-label');

  if (ta)         ta.value           = '';
  if (btnAnalyze) btnAnalyze.disabled = true;
  if (fbSection)  fbSection.style.display = 'none';
  if (interim)    interim.textContent = '';
  if (recStatus)  { recStatus.textContent = 'Nhấn để ghi âm'; recStatus.classList.remove('live'); }
  if (btnRecord)  { btnRecord.classList.remove('recording'); btnRecord.disabled = false; }
  if (elapsed)    elapsed.classList.add('hidden');
  if (recIcon)    { recIcon.className = 'fas fa-microphone rec-mic'; }
  if (recLabel)   recLabel.textContent = 'Bắt đầu';

  // New question → any previous recording no longer applies
  _lastRecordingBlob = null;
  const playbackBtn = document.getElementById('btn-playback-recording');
  if (playbackBtn) playbackBtn.classList.add('hidden');
}

function retryQuestion() {
  resetPractice();
  if (state.currentQuestion?.part === 2) {
    setTimeout(() => { if (state.currentQuestion?.part === 2) startPrepTimer(); }, 100);
  }
}

function clearTranscript() {
  const ta = document.getElementById('transcript-textarea');
  if (ta) ta.value = '';
  const btn = document.getElementById('btn-analyze');
  if (btn) btn.disabled = true;
}

// Prep timer, speak countdown, and elapsed timer moved to
// js/speaking-timer.js (loaded before this file — see speaking.html).

// ──────────────────────────────────────────────────────
// Web Speech API
// ──────────────────────────────────────────────────────
// Called when the recording session is truly over (student pressed Stop,
// or the browser ended it and we've given up trying to seamlessly resume)
// — resets the recording UI and finalizes the transcript into the textarea.
function _finishRecordingUI() {
  state.isRecording = false;
  state._recordBusy = false;
  state._frozenDurationSeconds = getElapsedSeconds();
  stopElapsedTimer();
  hideSpeakCountdown();

  const recIcon   = document.getElementById('rec-icon');
  const recLabel  = document.getElementById('rec-label');
  const recStatus = document.getElementById('rec-status');
  const btnRecord = document.getElementById('btn-record');
  const interimEl = document.getElementById('transcript-interim');
  const ta        = document.getElementById('transcript-textarea');
  const btn       = document.getElementById('btn-analyze');

  if (recIcon)   recIcon.className  = 'fas fa-microphone rec-mic';
  if (recLabel)  recLabel.textContent = 'Bắt đầu';
  if (recStatus) recStatus.classList.remove('live');
  if (btnRecord) { btnRecord.classList.remove('recording'); btnRecord.disabled = false; }
  if (interimEl) interimEl.textContent = '';

  if (ta && !ta.value.trim() && state.finalTranscript.trim()) ta.value = state.finalTranscript.trim();

  if (ta && ta.value.trim()) {
    if (btn) btn.disabled = false;
    if (recStatus) recStatus.textContent = '✓ Ghi âm hoàn tất';
  } else {
    if (recStatus) recStatus.textContent = 'Ghi âm đã dừng';
  }
}

function setupRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.recognition = new SR();
  state.recognition.lang           = 'en-US';
  state.recognition.continuous     = true;
  state.recognition.interimResults = true;

  state.recognition.onstart = () => {
    const recIcon   = document.getElementById('rec-icon');
    const recLabel  = document.getElementById('rec-label');
    const recStatus = document.getElementById('rec-status');
    const btnRecord = document.getElementById('btn-record');

    if (recIcon)   recIcon.className  = 'fas fa-stop rec-mic';
    if (recLabel)  recLabel.textContent = 'Dừng';
    if (recStatus) { recStatus.textContent = '🔴 Đang ghi âm...'; recStatus.classList.add('live'); }
    if (btnRecord) { btnRecord.classList.add('recording'); btnRecord.disabled = false; }
    state._recordBusy = false;

    // Only (re)start the timers — and the raw-audio capture for the
    // playback button — on the genuine first start of this session.
    // state._recognitionEverStarted is already true by the time onstart
    // fires again after a transparent auto-restart (see onend below), so
    // the elapsed/countdown timers keep running through the gap instead of
    // resetting, and we don't re-acquire a second audio-capture stream
    // mid-answer.
    if (!state._recognitionEverStarted) {
      state._recognitionEverStarted = true;
      startElapsedTimer();
      startSpeakCountdown();
      _startAudioCapture();
    }
  };

  state.recognition.onresult = (e) => {
    // Real speech came through this session, so the mic/recognition is
    // clearly alive — reset the restart-attempt counter (see onend below).
    // Without this, the cap counts restarts across the ENTIRE recording, so
    // Chrome's routine ~10-15s auto-restarts during a long, healthy Part 2
    // answer with a few natural pauses would exhaust the cap and cut the
    // recording off around a minute in — long before the actual 2-minute
    // limit — which is exactly what students were reporting.
    state._restartAttempts = 0;
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) state.finalTranscript += t + ' ';
      else interim += t;
    }
    const interimEl = document.getElementById('transcript-interim');
    if (interimEl) interimEl.textContent = interim;

    const cleaned = state.finalTranscript.trim();
    if (cleaned) {
      const ta = document.getElementById('transcript-textarea');
      if (ta) ta.value = cleaned;
      const btn = document.getElementById('btn-analyze');
      if (btn) btn.disabled = false;
    }
  };

  state.recognition.onend = () => {
    // Chrome can end a "continuous" recognition session on its own — a brief
    // pause while thinking, or just a long Part 2 monologue, is enough to
    // trigger it. That's not the student choosing to stop, so transparently
    // resume instead of cutting their transcript off mid-answer. Capped at
    // 6 CONSECUTIVE attempts with no speech captured in between (onresult
    // resets the counter) so a genuinely dead mic doesn't loop forever —
    // previously the cap counted restarts across the whole recording, so a
    // healthy long Part 2 answer with a few natural pauses could exhaust it
    // and get cut off around a minute in, well before the real 2-minute limit.
    if (state.isRecording && !state._userStoppedRecording && state._restartAttempts < 6) {
      state._restartAttempts++;
      const recStatus = document.getElementById('rec-status');
      if (recStatus) recStatus.textContent = '🔄 Đang kết nối lại micro...';
      setTimeout(() => {
        if (!state.isRecording || state._userStoppedRecording) return; // stopped while we waited
        try {
          state.recognition.start();
        } catch (e) {
          _finishRecordingUI();
        }
      }, 250);
      return;
    }
    _finishRecordingUI();
  };

  state.recognition.onerror = (e) => {
    console.error('Speech error:', e.error);
    // "no-speech" fires during an ordinary pause (thinking, breathing) —
    // not a real failure. Let onend's own restart-or-stop logic decide;
    // treating it as fatal here would kill the recording on every pause.
    if (e.error === 'no-speech') return;

    const msgs = {
      'not-allowed': 'Bạn chưa cấp quyền micro. Vui lòng cho phép trong cài đặt trình duyệt.',
      'network':     'Lỗi mạng khi nhận dạng giọng nói.',
      'audio-capture': 'Không tìm thấy micro, hoặc micro đang được ứng dụng khác sử dụng.',
    };
    const message = msgs[e.error] || `Lỗi ghi âm (${e.error}). Vui lòng thử lại.`;
    const recStatus = document.getElementById('rec-status');
    if (recStatus) recStatus.textContent = message;
    // Previously only the small status line above changed — easy to miss,
    // and exactly why "bấm mic nhưng không ghi âm được" looked like nothing
    // happened at all. A toast makes a real failure impossible to miss.
    showToast(message, 'error');
    state._userStoppedRecording = true; // a real error — don't let onend try to resume
    _finishRecordingUI();
  };
}

// ──────────────────────────────────────────────────────
// Raw audio capture (separate from SpeechRecognition, which does its own
// internal audio handling but never exposes the stream/blob) — lets the
// student play back their actual recording, stored locally via
// js/speaking-audio-store.js. Best-effort throughout: if getUserMedia or
// MediaRecorder isn't available/permitted, transcription still works
// exactly as before, the student just doesn't get a playback button.
// ──────────────────────────────────────────────────────
let _mediaRecorder = null;
let _mediaChunks = [];
let _mediaStream = null;
let _lastRecordingBlob = null;

async function _startAudioCapture() {
  if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getUserMedia) return;
  try {
    // Explicit constraints (not just `audio: true`) — without these, some
    // browsers/devices don't enable echo cancellation by default, so the
    // recording picks up its own speaker output as a faint echo, especially
    // noticeable on laptops without headphones (student report).
    _mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    _mediaChunks = [];
    _mediaRecorder = new MediaRecorder(_mediaStream);
    _mediaRecorder.ondataavailable = e => { if (e.data.size > 0) _mediaChunks.push(e.data); };
    _mediaRecorder.start();
  } catch (e) {
    console.warn('_startAudioCapture:', e.message);
    _mediaRecorder = null;
  }
}

function _stopAudioCapture() {
  return new Promise(resolve => {
    if (!_mediaRecorder) { resolve(null); return; }
    const recorder = _mediaRecorder;
    recorder.onstop = () => {
      const blob = _mediaChunks.length ? new Blob(_mediaChunks, { type: recorder.mimeType || 'audio/webm' }) : null;
      _mediaStream?.getTracks().forEach(t => t.stop());
      _mediaStream = null;
      _mediaRecorder = null;
      resolve(blob);
    };
    try { recorder.stop(); } catch (e) { resolve(null); }
  });
}

let _playbackAudio = null;

function _setPlaybackBtnState(playing) {
  const btn = document.getElementById('btn-playback-recording');
  if (!btn) return;
  btn.classList.toggle('playing', playing);
  btn.innerHTML = playing
    ? '<i class="fas fa-stop"></i> Đang phát...'
    : '<i class="fas fa-play"></i> Nghe lại bản ghi âm';
}

function playbackRecording() {
  // Second click while already playing = stop.
  if (_playbackAudio) {
    _playbackAudio.pause();
    return;
  }
  if (!_lastRecordingBlob) return;
  const url = URL.createObjectURL(_lastRecordingBlob);
  const audio = new Audio(url);
  _playbackAudio = audio;
  _setPlaybackBtnState(true);

  const cleanup = () => {
    URL.revokeObjectURL(url);
    _playbackAudio = null;
    _setPlaybackBtnState(false);
  };
  audio.addEventListener('ended', cleanup);
  audio.addEventListener('pause', cleanup);
  audio.play().catch(() => {
    cleanup();
    showToast('Không thể phát lại bản ghi âm.', 'error');
  });
}

// Shared guarded-start — used by toggleRecord()'s start branch AND the
// Part 2 prep-timer's auto-start/skip (startPrepTimer/skipPrep in
// speaking-timer.js). Those two used to call state.recognition.start() and
// set state.isRecording = true directly, bypassing the _recordBusy race
// guard built for toggleRecord() — leaving a window where the record button
// still showed "Bắt đầu" (idle) but state.isRecording was already true, so a
// student clicking it there silently STOPPED a recording they didn't know
// had started (student UI audit follow-up, 2026-07-26). Self-contained/
// idempotent — safe to call from any of the three sites with no pre-check.
function _startRecordingGuarded() {
  if (!state.recognition || state.isRecording || state._recordBusy) return;
  const btnRecord = document.getElementById('btn-record');
  state._recordBusy = true;
  if (btnRecord) btnRecord.disabled = true;
  try {
    state._userStoppedRecording = false;
    state._restartAttempts = 0;
    state._recognitionEverStarted = false;
    state._frozenDurationSeconds = 0;
    state.finalTranscript = '';
    state.recognition.start();
    state.isRecording = true;
    _lastRecordingBlob = null;
    document.getElementById('btn-playback-recording')?.classList.add('hidden');
    // _startAudioCapture() itself is fired from onstart, not here —
    // starting it only after SpeechRecognition confirms it has acquired
    // the mic avoids two near-simultaneous getUserMedia calls contending
    // for the same device on some browser/OS combos. state._recordBusy/
    // btnRecord.disabled are also cleared there, not here — the click
    // isn't "done" until the engine confirms it's actually live.

    // Backstop for when the browser's speech engine never calls back at
    // all (e.g. can't reach its recognition service — same class of
    // "browser API just hangs" issue speakText() above already guards
    // against with its own 10s timeout). Without this, that failure mode
    // would leave the button disabled forever with zero feedback, which
    // is worse than the original bug.
    const watchdogToken = ++state._recordWatchdogToken;
    setTimeout(() => {
      if (state._recordWatchdogToken !== watchdogToken || !state._recordBusy) return; // already resolved
      state._userStoppedRecording = true;
      try { state.recognition.stop(); } catch (e) {}
      showToast('Không thể kết nối micro (quá thời gian chờ). Vui lòng kiểm tra kết nối mạng và thử lại.', 'error');
      _finishRecordingUI();
    }, 8000);
  } catch (e) {
    state._recordBusy = false;
    if (btnRecord) btnRecord.disabled = false;
    showToast('Không thể bắt đầu ghi âm, thử lại.', 'error');
  }
}

function toggleRecord() {
  if (!state.recognition) {
    showToast('Trình duyệt không hỗ trợ ghi âm. Bạn có thể gõ câu trả lời vào ô bên dưới.', 'warn');
    return;
  }
  // See state._recordBusy's comment — ignore clicks while the previous
  // start/stop is still settling instead of racing it.
  if (state._recordBusy) return;

  if (state.isRecording) {
    const btnRecord = document.getElementById('btn-record');
    state._recordBusy = true;
    if (btnRecord) btnRecord.disabled = true;
    state._userStoppedRecording = true;
    state.recognition.stop();
    state.isRecording = false;
    _stopAudioCapture().then(blob => {
      _lastRecordingBlob = blob;
      const btn = document.getElementById('btn-playback-recording');
      if (btn) btn.classList.toggle('hidden', !blob);
    }).finally(() => {
      state._recordBusy = false;
      if (btnRecord) btnRecord.disabled = false;
    });
  } else {
    _startRecordingGuarded();
  }
}

// ──────────────────────────────────────────────────────
// AI Analysis
// ──────────────────────────────────────────────────────

// Rotates the loading-state message every ~2.4s instead of leaving one
// static line for the whole (sometimes 10-20s+) Gemini call — makes the
// wait feel shorter and gives the student a sense of what's actually
// happening, rather than a bare spinner. Shared by both single-question
// analyzeTranscript() and the whole-session finishSequentialSession().
const FEEDBACK_LOADING_MESSAGES = [
  'Gemini AI đang nghe và đọc câu trả lời của bạn...',
  'Đang chấm Fluency & Coherence...',
  'Đang chấm Lexical Resource & Grammatical Range...',
  'Đang ước tính Pronunciation từ transcript...',
  'Đang tổng hợp nhận xét và gợi ý cải thiện...',
];
let _feedbackLoadingTimer = null;
function _startFeedbackLoadingMessages(textElId) {
  _stopFeedbackLoadingMessages();
  const el = document.getElementById(textElId);
  if (!el) return;
  let i = 0;
  el.textContent = FEEDBACK_LOADING_MESSAGES[0];
  _feedbackLoadingTimer = setInterval(() => {
    i = (i + 1) % FEEDBACK_LOADING_MESSAGES.length;
    el.textContent = FEEDBACK_LOADING_MESSAGES[i];
  }, 2400);
}
function _stopFeedbackLoadingMessages() {
  if (_feedbackLoadingTimer) { clearInterval(_feedbackLoadingTimer); _feedbackLoadingTimer = null; }
}

async function analyzeTranscript() {
  if (state._analyzing) return; // already in flight — ignore a double click
  const ta         = document.getElementById('transcript-textarea');
  const transcript = ta ? ta.value.trim() : '';
  if (!transcript) return;

  const question = state.currentQuestion?.question || '';
  // Frozen at the moment recording stopped, not live — see the
  // _frozenDurationSeconds field comment for why.
  const duration = state._frozenDurationSeconds;

  const section  = document.getElementById('feedback-section');
  const loading  = document.getElementById('feedback-loading');
  const results  = document.getElementById('feedback-results');
  const errorBox = document.getElementById('feedback-error');
  const btnAnalyze = document.getElementById('btn-analyze');

  state._analyzing = true;
  if (btnAnalyze) btnAnalyze.disabled = true;
  if (section) section.style.display = 'block';
  if (loading) loading.style.display = 'flex';
  if (results) results.style.display = 'none';
  if (errorBox) errorBox.classList.add('hidden');
  _startFeedbackLoadingMessages('feedback-loading-text');
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const questionId = state.currentQuestion?._id;

  try {
    // Fetched in parallel with /analyze (not awaited first) so the
    // encouragement comparison below never adds perceptible latency to the
    // slow path — history is normally far faster than Gemini grading, and
    // this fetch naturally captures the "before" state since it races
    // ahead of (not after) the new attempt being saved server-side.
    const [data, histData] = await Promise.all([
      apiFetch('/api/speaking/analyze', {
        method: 'POST',
        body: JSON.stringify({
          transcript,
          question,
          questionId,
          topic: state.currentQuestion?.topic,
          part:  state.currentQuestion?.part,
          duration,
        }),
      }),
      questionId ? apiFetch('/api/speaking/history').catch(() => null) : Promise.resolve(null),
    ]);

    if (loading) loading.style.display = 'none';
    if (results) results.style.display = 'block';

    let previousBand = null;
    if (histData && questionId) {
      const prev = (histData.attempts || []).find(a => a.status === 'analyzed' && String(a.questionId) === String(questionId));
      previousBand = prev?.aiFeedback?.overallBand ?? null;
    }
    renderFeedback(data.feedback || {}, previousBand);

    // Best-effort: key the locally-captured recording (if any) to this
    // exact attempt so History can offer same-device playback later.
    if (data.attemptId && _lastRecordingBlob && window.SpeakingAudioStore) {
      window.SpeakingAudioStore.saveAudioRecording(data.attemptId, _lastRecordingBlob);
    }
  } catch (e) {
    if (loading) loading.style.display = 'none';
    if (results) results.style.display = 'none';
    const errorText = document.getElementById('feedback-error-text');
    if (errorText) {
      errorText.textContent = e?.coldStart
        ? 'Server đang khởi động, vui lòng thử lại sau vài giây.'
        : (e?.message || 'Không thể phân tích. Vui lòng thử lại sau.');
    }
    if (errorBox) errorBox.classList.remove('hidden');
    console.error('analyzeTranscript:', e);
  } finally {
    _stopFeedbackLoadingMessages();
    state._analyzing = false;
    if (btnAnalyze) btnAnalyze.disabled = !ta?.value.trim();
  }
}

function renderFeedback(fb, previousBand) {
  // Scores
  const scores = [
    ['overall',       fb.overallBand],
    ['fluency',       fb.fluency],
    ['vocabulary',    fb.vocabulary],
    ['grammar',       fb.grammar],
    ['pronunciation', fb.pronunciation],
  ];
  scores.forEach(([key, val]) => {
    const el = document.getElementById(`score-${key}`);
    if (!el) return;
    el.textContent = val != null ? val : '—';
    el.dataset.band = val != null ? bandColor(val) : '';
  });

  // Comparison against this same question's own previous attempt — a
  // light, positive-framed encouragement signal (not a streak/mascot
  // system). Only shown when both bands exist and a real prior attempt on
  // this exact question was found.
  const compareNote = document.getElementById('fb-compare-note');
  if (compareNote) {
    if (previousBand != null && fb.overallBand != null) {
      const diff = Math.round((fb.overallBand - previousBand) * 2) / 2;
      let text;
      if (diff > 0) text = `🔼 Cải thiện +${diff} band so với lần trước (${previousBand} → ${fb.overallBand})`;
      else if (diff < 0) text = `So với lần trước: ${previousBand} → ${fb.overallBand} — cùng câu hỏi này, thử lại nhé!`;
      else text = `So với lần trước: giữ nguyên ${fb.overallBand} band cho câu hỏi này`;
      compareNote.textContent = text;
      compareNote.className = diff > 0 ? 'fb-compare-up' : diff < 0 ? 'fb-compare-down' : 'fb-compare-flat';
      compareNote.style.display = 'block';
    } else {
      compareNote.style.display = 'none';
    }
  }

  // Overall feedback
  const fbOverall = document.getElementById('fb-overall-card');
  const fbOverallText = document.getElementById('fb-overall-text');
  if (fb.overallFeedback) {
    if (fbOverallText) fbOverallText.textContent = fb.overallFeedback;
    if (fbOverall) fbOverall.style.display = 'block';
  } else {
    if (fbOverall) fbOverall.style.display = 'none';
  }

  // Today's Focus — the one biggest thing to fix next
  const fbFocus = document.getElementById('fb-focus-card');
  const fbFocusText = document.getElementById('fb-focus-text');
  if (fb.todaysFocus) {
    if (fbFocusText) fbFocusText.textContent = fb.todaysFocus;
    if (fbFocus) fbFocus.style.display = 'block';
  } else {
    if (fbFocus) fbFocus.style.display = 'none';
  }

  // Improve my answer (Stage 2) — reset for this attempt; only fetched if
  // the student clicks the button, never generated automatically.
  const improveText = document.getElementById('fb-improve-text');
  const improveBtn   = document.getElementById('btn-improve-answer');
  if (improveText) { improveText.style.display = 'none'; improveText.textContent = ''; improveText.dataset.forTranscript = ''; }
  if (improveBtn)  improveBtn.disabled = false;

  // Strengths
  const fbStrengths = document.getElementById('fb-strengths-card');
  const fbStrengthsList = document.getElementById('fb-strengths-list');
  if (fb.strengths?.length) {
    if (fbStrengthsList) fbStrengthsList.innerHTML = fb.strengths.map(s => `<li>${escHtml(s)}</li>`).join('');
    if (fbStrengths) fbStrengths.style.display = 'block';
  } else {
    if (fbStrengths) fbStrengths.style.display = 'none';
  }

  // Mistakes
  const fbErrors = document.getElementById('fb-errors-card');
  const fbErrorsList = document.getElementById('fb-errors-list');
  if (fb.mistakes?.length) {
    if (fbErrorsList) {
      fbErrorsList.innerHTML = fb.mistakes.map(m => `
        <div class="error-item">
          <span class="error-wrong">${escHtml(m.original)}</span>
          <span class="error-arrow">→</span>
          <span class="error-right">${escHtml(m.corrected)}</span>
          ${m.reason ? `<div class="error-tip-row">💡 ${escHtml(m.reason)}</div>` : ''}
        </div>`).join('');
    }
    if (fbErrors) fbErrors.style.display = 'block';
  } else {
    if (fbErrors) fbErrors.style.display = 'none';
  }

  // Vocabulary upgrades — basic-but-correct words the candidate used that
  // could be swapped for something more sophisticated (distinct from
  // mistakes above, which are actual errors).
  const fbVocab = document.getElementById('fb-vocab-card');
  const fbVocabList = document.getElementById('fb-vocab-list');
  if (fb.vocabUpgrades?.length) {
    if (fbVocabList) {
      fbVocabList.innerHTML = fb.vocabUpgrades.map(v => `
        <div class="vocab-item">
          <span class="vocab-original">${escHtml(v.original)}</span>
          <span class="error-arrow">→</span>
          <span class="vocab-upgrade">${escHtml(v.upgrade)}</span>
          ${v.reason ? `<div class="vocab-tip-row">💡 ${escHtml(v.reason)}</div>` : ''}
        </div>`).join('');
    }
    if (fbVocab) fbVocab.style.display = 'block';
  } else {
    if (fbVocab) fbVocab.style.display = 'none';
  }

  // Improvements
  const fbImprovements = document.getElementById('fb-improvements-card');
  const fbImprovementsList = document.getElementById('fb-improvements-list');
  if (fb.improvements?.length) {
    if (fbImprovementsList) {
      fbImprovementsList.innerHTML = fb.improvements.map(i => `<li>${escHtml(i)}</li>`).join('');
    }
    if (fbImprovements) fbImprovements.style.display = 'block';
  } else {
    if (fbImprovements) fbImprovements.style.display = 'none';
  }

  setupDictionaryDouble('feedback-results', 'speaking-feedback');
}

// ──────────────────────────────────────────────────────
// Improve My Answer (Stage 2) — opt-in only, mirrors showSampleAnswer()'s
// fetch-and-toggle pattern. Reads the transcript live from the textarea
// (not a snapshot from analyze time) so edits the student makes before
// clicking are reflected.
// ──────────────────────────────────────────────────────
async function showImprovedAnswer() {
  const q = state.currentQuestion;
  const ta = document.getElementById('transcript-textarea');
  const transcript = ta ? ta.value.trim() : '';
  if (!q || !transcript) return;

  const box = document.getElementById('fb-improve-text');
  const btn = document.getElementById('btn-improve-answer');
  if (!box || !btn) return;

  // Toggle closed if already showing an answer for this exact transcript.
  if (box.style.display === 'block' && box.dataset.forTranscript === transcript) {
    box.style.display = 'none';
    return;
  }

  box.dataset.forTranscript = transcript;
  box.style.display = 'block';
  box.innerHTML = '<div class="spinner"></div>';
  btn.disabled = true;

  try {
    const data = await apiFetch('/api/speaking/improve', {
      method: 'POST',
      body: JSON.stringify({ question: q.question, part: q.part, transcript }),
    });
    box.textContent = data.improvedAnswer || '';
  } catch (e) {
    console.error('showImprovedAnswer:', e);
    showToast('Không thể cải thiện câu trả lời. Vui lòng thử lại.', 'error');
    box.style.display = 'none';
  } finally {
    btn.disabled = false;
  }
}

// ══════════════════════════════════════════════════════
// SEQUENTIAL (MOCK-TEST) TOPIC PRACTICE
// Fully isolated from the single-question flow above: its own
// SpeechRecognition instance, its own timers, its own feedback
// renderer — reuses only the existing /api/speaking/analyze
// endpoint and the same score-card/fb-card CSS classes.
// ══════════════════════════════════════════════════════

function updateSeqButtonVisibility() {
  const btn   = document.getElementById('btn-start-topic-session');
  const label = document.getElementById('btn-seq-start-label');
  if (!btn) return;
  const topic = document.getElementById('sel-topic')?.value;
  const n = state.lastQuestionList.length;
  if (topic && topic !== 'all' && n >= 2) {
    if (label) label.textContent = `Luyện topic này (${n} câu)`;
    btn.style.display = 'flex';
  } else {
    btn.style.display = 'none';
  }
}

function seqPartLabel(queue) {
  const parts = [...new Set(queue.map(q => q.part))].sort();
  return parts.length > 1 ? parts.join('+') : String(parts[0]);
}

// state.seqPreviewMode tracks which flow opened the shared preview modal
// ('topic' | 'fullmock') so its single "Bắt Đầu" button knows which start
// function to dispatch to — see confirmStartFromPreview() below.

function openTopicPreviewModal() {
  const topic = document.getElementById('sel-topic')?.value;
  const queue = state.lastQuestionList;
  if (!topic || topic === 'all' || queue.length < 2) return;

  state.seqPreviewMode = 'topic';
  const title = document.getElementById('seq-preview-title');
  if (title) title.textContent = `Luyện PART ${seqPartLabel(queue)} — ${topic}`;

  const list = document.getElementById('seq-preview-list');
  if (list) {
    list.innerHTML = queue.map((q, i) => `
      <div class="seq-preview-item">
        <span class="seq-preview-num">${i + 1}</span>
        <span class="seq-preview-text">${escHtml(q.question)}</span>
      </div>`).join('');
  }

  document.getElementById('seq-preview-modal')?.classList.add('open');
}

function closeSeqPreviewModal() {
  document.getElementById('seq-preview-modal')?.classList.remove('open');
}

// Close modal on overlay click
document.getElementById('seq-preview-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeSeqPreviewModal();
});

function confirmStartFromPreview() {
  if (state.seqPreviewMode === 'fullmock') startFullMockTest();
  else startSequentialSession();
}

// Shared by both entry points: single-topic sequential practice and the
// full mock test below. Fully replaces whatever sequential state existed
// before (queue/index/answers/timers) and drives the screen-sequential UI
// identically regardless of how the queue was composed.
function beginSeqRun(queue, headerTitle) {
  if (!queue.length) return;

  state.seqQueue        = queue;
  state.seqIndex         = 0;
  state.seqAnswers       = [];
  state.seqActive        = true;
  state.seqTotalElapsed  = 0;

  const headerTitleEl = document.getElementById('seq-header-title');
  if (headerTitleEl) headerTitleEl.textContent = headerTitle;

  const resultsEl = document.getElementById('seq-results');
  const bodyEl    = document.getElementById('seq-body');
  if (resultsEl) resultsEl.style.display = 'none';
  if (bodyEl)    bodyEl.style.display    = 'flex';

  showScreen('screen-sequential');
  setupSeqRecognition();
  loadSeqQuestion();
}

function startSequentialSession() {
  if (state.lastQuestionList.length < 2) return;
  closeSeqPreviewModal();
  state.seqIsFullMock = false;
  const topic = document.getElementById('sel-topic')?.value || '';
  beginSeqRun([...state.lastQuestionList], `PART ${seqPartLabel(state.lastQuestionList)} — ${topic}`);
}

// ──────────────────────────────────────────────────────
// Full mock test — random 3 Part 1 topics (~9-12 questions), 1 random
// Part 2 cue card, and that same topic's Part 3 follow-ups. Composed
// client-side from the already-seeded question bank (no new backend
// endpoint needed) then handed to the exact same sequential-run engine
// used for single-topic practice above.
// ──────────────────────────────────────────────────────
let _fullMockQueue = null;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Random subset of size n, but keeping the items in their original relative
// order — real Part 1 topics are seeded with follow-on questions ("Do you
// wear a watch?" -> "What kind?"), so shuffling within a topic reads oddly.
function pickRandomSubsetInOrder(arr, n) {
  const idxs = shuffleArray(arr.map((_, i) => i)).slice(0, Math.min(n, arr.length)).sort((a, b) => a - b);
  return idxs.map(i => arr[i]);
}

async function composeFullMockQueue() {
  const [p1data, p2data, p3data] = await Promise.all([
    apiFetch('/api/speaking/questions?part=1'),
    apiFetch('/api/speaking/questions?part=2'),
    apiFetch('/api/speaking/questions?part=3'),
  ]);
  const p1 = p1data.questions || [];
  const p2 = p2data.questions || [];
  const p3 = p3data.questions || [];
  if (!p1.length || !p2.length) return [];

  const byTopic = {};
  p1.forEach(q => { (byTopic[q.topic] = byTopic[q.topic] || []).push(q); });
  const chosenTopics = shuffleArray(Object.keys(byTopic)).slice(0, 3);
  // Real IELTS Part 1 asks ~3-4 questions per topic, not every question the
  // bank happens to have for it (some seeded topics have up to 11) — cap
  // each topic to 3-4 so the whole Part 1 section lands around 9-12 total.
  const part1Queue = chosenTopics.flatMap(t => {
    const perTopic = Math.random() < 0.5 ? 3 : 4;
    return pickRandomSubsetInOrder(byTopic[t], perTopic);
  });

  // Only pick a Part 2 cue card whose topic actually has Part 3 follow-ups
  // seeded — a handful of topics in the bank don't, and a mock test must
  // always include a real Part 3 section.
  const p3Topics = new Set(p3.map(q => q.topic));
  const eligibleCues = p2.filter(q => p3Topics.has(q.topic));
  const cuePool = eligibleCues.length ? eligibleCues : p2;
  const cue = cuePool[Math.floor(Math.random() * cuePool.length)];
  const part3Queue = p3.filter(q => q.topic === cue.topic);

  return [...part1Queue, cue, ...part3Queue];
}

async function openFullMockPreviewModal() {
  const card = document.getElementById('btn-full-mock');
  const descEl = card?.querySelector('.sp-home-card-desc');
  const originalDesc = descEl?.textContent;
  if (descEl) descEl.textContent = 'Đang tạo đề thi thử ngẫu nhiên...';
  if (card) card.style.pointerEvents = 'none';

  try {
    const queue = await composeFullMockQueue();
    if (queue.length < 3) {
      showToast('Không đủ câu hỏi để tạo bài thi thử. Vui lòng thử lại sau.', 'error');
      return;
    }
    _fullMockQueue = queue;
    state.seqPreviewMode = 'fullmock';

    const title = document.getElementById('seq-preview-title');
    if (title) title.textContent = `Bài thi thử Speaking đầy đủ (${queue.length} câu hỏi)`;

    const list = document.getElementById('seq-preview-list');
    if (list) {
      list.innerHTML = queue.map((q, i) => `
        <div class="seq-preview-item">
          <span class="seq-preview-num">${i + 1}</span>
          <span class="seq-preview-text"><strong>Part ${q.part} · ${escHtml(q.topic)}</strong><br>${escHtml(q.question)}</span>
        </div>`).join('');
    }

    document.getElementById('seq-preview-modal')?.classList.add('open');
  } catch (e) {
    console.error('openFullMockPreviewModal:', e);
    showToast('Không thể tạo bài thi thử. Vui lòng thử lại.', 'error');
  } finally {
    if (descEl && originalDesc) descEl.textContent = originalDesc;
    if (card) card.style.pointerEvents = '';
  }
}

function startFullMockTest() {
  if (!_fullMockQueue || _fullMockQueue.length < 3) return;
  closeSeqPreviewModal();
  state.seqIsFullMock = true;
  const queue = _fullMockQueue;
  _fullMockQueue = null;
  beginSeqRun(queue, 'Bài thi thử Speaking đầy đủ');
}

function loadSeqQuestion() {
  const q = state.seqQueue[state.seqIndex];
  if (!q) { finishSequentialSession(); return; }

  state.seqTextRevealed = false;
  // Reset synchronously (not just in seqRecognition.onstart) — otherwise a
  // student who confirms/exits before recognition has actually started
  // (widened by the TTS-first sequencing below) would carry the previous
  // question's leftover transcript into this one.
  state.seqFinalTranscript = '';

  const progress = document.getElementById('seq-progress');
  if (progress) progress.textContent = `${state.seqIndex + 1}/${state.seqQueue.length}`;

  const partBadge   = document.getElementById('seq-q-part-badge');
  const topicBadge  = document.getElementById('seq-q-topic-badge');
  const qText       = document.getElementById('seq-q-text');
  const qCue        = document.getElementById('seq-q-cue');
  const toggleIcon  = document.getElementById('seq-toggle-icon');
  const toggleLabel = document.getElementById('seq-toggle-label');
  const interimEl   = document.getElementById('seq-transcript-interim');
  const recIndicator = document.getElementById('seq-rec-indicator');
  const recStatus     = document.getElementById('seq-rec-status');

  // Dict lookup was never wired up on this screen at all — off during a
  // full mock test (where it'd be an unfair aid), on during ordinary
  // part-by-part sequential practice (seqIsFullMock stays false there).
  setupDictionaryDouble('seq-question-card', 'speaking-sequential', () => !state.seqIsFullMock);

  if (partBadge)  partBadge.textContent  = `Part ${q.part}`;
  if (topicBadge) topicBadge.textContent = q.topic || '';
  if (qText) { qText.textContent = q.question; qText.style.display = 'none'; }
  if (qCue) {
    if (q.cueCard) { qCue.textContent = q.cueCard; qCue.style.display = 'block'; }
    else             qCue.style.display = 'none';
  }
  if (toggleIcon)  toggleIcon.className = 'fas fa-eye';
  if (toggleLabel) toggleLabel.textContent = 'Hiện câu hỏi';
  if (interimEl)   interimEl.textContent = '';
  if (recIndicator) recIndicator.classList.remove('recording');
  if (recStatus)     { recStatus.classList.remove('live'); recStatus.textContent = 'Đang chuẩn bị...'; }

  const manualInput = document.getElementById('seq-manual-input');
  if (manualInput) manualInput.value = '';

  // Briefly disable "Ghi nhận câu trả lời" right after a new question loads
  // so a leftover/rapid double-click from advancing the previous question
  // doesn't immediately skip this one too.
  const confirmBtn = document.getElementById('seq-btn-confirm');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    setTimeout(() => { confirmBtn.disabled = false; }, 500);
  }

  hideSeqPrepTimer();
  hideSeqSpeakCountdown();
  clearSeqSilenceTimer();
  // Elapsed badge otherwise kept showing the PREVIOUS question's frozen
  // time for a moment after confirming an answer, until the next
  // question's recording actually starts (student UI audit follow-up,
  // 2026-07-26) — mirrors resetPractice()'s equivalent reset for the
  // single-question flow.
  stopSeqElapsedTimer();
  document.getElementById('seq-rec-elapsed')?.classList.add('hidden');

  if (q.part === 2) {
    speakText(q.question);
    setTimeout(() => { if (state.seqActive && state.seqQueue[state.seqIndex] === q) startSeqPrepTimer(); }, 100);
  } else {
    // Don't start recording (and its 3s silence auto-advance) until the
    // question has actually finished being read aloud — otherwise the
    // timer races the TTS and routinely skips the question before the
    // student even hears it, let alone gets to answer.
    speakText(q.question, () => {
      if (state.seqActive && state.seqQueue[state.seqIndex] === q) startSeqRecording();
    });
  }
}

function toggleSeqQuestionText() {
  state.seqTextRevealed = !state.seqTextRevealed;
  const qText       = document.getElementById('seq-q-text');
  const toggleIcon  = document.getElementById('seq-toggle-icon');
  const toggleLabel = document.getElementById('seq-toggle-label');
  if (qText)        qText.style.display = state.seqTextRevealed ? 'block' : 'none';
  if (toggleIcon)   toggleIcon.className = state.seqTextRevealed ? 'fas fa-eye-slash' : 'fas fa-eye';
  if (toggleLabel)  toggleLabel.textContent = state.seqTextRevealed ? 'Ẩn câu hỏi' : 'Hiện câu hỏi';
}

// Typing a manual answer counts as "not silent" — cancel the 3s auto-advance
// grace timer the same way real speech (onresult) does.
function onSeqManualInput() {
  const val = document.getElementById('seq-manual-input')?.value || '';
  if (val.trim()) clearSeqSilenceTimer();
}

function replaySeqQuestion() {
  const q = state.seqQueue[state.seqIndex];
  if (!q) return;
  speakText(q.question);
}

// Mirrors _finishRecordingUI() for the sequential (mock-test) flow.
function _finishSeqRecordingUI() {
  state.seqIsRecording = false;
  stopSeqElapsedTimer();
  hideSeqSpeakCountdown();
  const recIndicator = document.getElementById('seq-rec-indicator');
  const recStatus    = document.getElementById('seq-rec-status');
  if (recIndicator) recIndicator.classList.remove('recording');
  if (recStatus) {
    recStatus.classList.remove('live');
    recStatus.textContent = state.seqFinalTranscript.trim() ? '✓ Ghi âm hoàn tất' : 'Chưa ghi âm';
  }
}

function setupSeqRecognition() {
  if (state.seqRecognition) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  state.seqRecognition = new SR();
  state.seqRecognition.lang           = 'en-US';
  state.seqRecognition.continuous     = true;
  state.seqRecognition.interimResults = true;

  state.seqRecognition.onstart = () => {
    state.seqIsRecording = true;
    const recIndicator = document.getElementById('seq-rec-indicator');
    const recStatus    = document.getElementById('seq-rec-status');
    if (recIndicator) recIndicator.classList.add('recording');
    if (recStatus) { recStatus.textContent = '🔴 Đang ghi âm...'; recStatus.classList.add('live'); }
    // Only (re)start timers on the genuine first start — see the matching
    // comment in setupRecognition(); same Chrome auto-stop concern applies here.
    if (!state._seqRecognitionEverStarted) {
      state._seqRecognitionEverStarted = true;
      startSeqElapsedTimer();
      const q = state.seqQueue[state.seqIndex];
      if (q && q.part === 2) startSeqSpeakCountdown();
      else startSeqSilenceTimer();
    }
  };

  state.seqRecognition.onresult = (e) => {
    // See setupRecognition()'s onresult — resets the restart-attempt streak
    // on real speech so routine Chrome auto-restarts during a long, healthy
    // answer don't exhaust the dead-mic cap and cut the recording off early.
    state._seqRestartAttempts = 0;
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) state.seqFinalTranscript += t + ' ';
      else interim += t;
    }
    const interimEl = document.getElementById('seq-transcript-interim');
    if (interimEl) interimEl.textContent = interim;
    if (state.seqFinalTranscript.trim() || interim.trim()) clearSeqSilenceTimer();
  };

  state.seqRecognition.onend = () => {
    // Same transparent-resume logic as the single-question flow's
    // setupRecognition() — Chrome can end "continuous" recognition on its
    // own mid-answer; don't let that silently truncate the transcript.
    if (state.seqIsRecording && !state._seqUserStoppedRecording && state._seqRestartAttempts < 6) {
      state._seqRestartAttempts++;
      const recStatus = document.getElementById('seq-rec-status');
      if (recStatus) recStatus.textContent = '🔄 Đang kết nối lại micro...';
      setTimeout(() => {
        if (!state.seqIsRecording || state._seqUserStoppedRecording) return;
        try {
          state.seqRecognition.start();
        } catch (e) {
          _finishSeqRecordingUI();
        }
      }, 250);
      return;
    }
    _finishSeqRecordingUI();
  };

  state.seqRecognition.onerror = (e) => {
    console.error('Seq speech error:', e.error);
    // See setupRecognition()'s onerror — "no-speech" is a normal pause, not
    // a failure; let onend's restart-or-stop logic handle it.
    if (e.error === 'no-speech') return;

    const recStatus = document.getElementById('seq-rec-status');
    const msgs = {
      'not-allowed': 'Bạn chưa cấp quyền micro.',
      'network':     'Lỗi mạng khi nhận dạng giọng nói.',
    };
    if (recStatus) recStatus.textContent = msgs[e.error] || `Lỗi: ${e.error}`;
    state._seqUserStoppedRecording = true;
    _finishSeqRecordingUI();
  };
}

function startSeqRecording() {
  if (!state.seqRecognition) {
    showToast('Trình duyệt không hỗ trợ ghi âm. Gõ câu trả lời rồi nhấn Ghi nhận câu trả lời.', 'warn');
    return;
  }
  if (state.seqIsRecording) return;
  try {
    state._seqUserStoppedRecording = false;
    state._seqRestartAttempts = 0;
    state._seqRecognitionEverStarted = false;
    state.seqFinalTranscript = '';
    state.seqRecognition.start();
  } catch (e) {
    // Already starting/started — safe to ignore, user can still confirm manually.
  }
}

function confirmSeqAnswer() {
  if (!state.seqActive) return;
  clearSeqSilenceTimer();
  hideSeqPrepTimer();
  hideSeqSpeakCountdown();

  const manualVal = document.getElementById('seq-manual-input')?.value.trim() || '';
  const transcript = state.seqFinalTranscript.trim() || manualVal;
  if (state.seqIsRecording && state.seqRecognition) {
    state._seqUserStoppedRecording = true; // moving to the next question — don't auto-restart this session
    try { state.seqRecognition.stop(); } catch (e) {}
  }
  state.seqTotalElapsed += getSeqElapsedSeconds();
  stopSeqElapsedTimer();

  const q = state.seqQueue[state.seqIndex];
  state.seqAnswers.push({ question: q.question, part: q.part, transcript });

  state.seqIndex++;
  if (state.seqIndex < state.seqQueue.length) {
    loadSeqQuestion();
  } else {
    finishSequentialSession();
  }
}

// Guards the sequential (multi-part mock test) screen's "Thoát" button —
// previously wired straight to exitSequentialSession(), discarding the
// whole in-progress Part 1-3 session on a single click with zero warning
// (student UI audit, 2026-07-25 — flagged Cao since a full mock test can
// represent 10-15+ minutes of answered questions). Once the session has
// already finished (results screen showing, seqActive is false), there's
// nothing left to lose, so exit immediately without nagging.
function confirmExitSequential() {
  if (!state.seqActive) { exitSequentialSession(); return; }
  confirmDialog(
    'Thoát bài thi thử?',
    'Bạn đang làm dở bài thi thử nhiều phần — thoát ra bây giờ sẽ mất toàn bộ tiến độ, không thể khôi phục.',
    exitSequentialSession,
    { confirmLabel: 'Thoát', confirmClass: 'btn-danger' }
  );
}

function exitSequentialSession() {
  state.seqActive = false;
  clearSeqSilenceTimer();
  hideSeqPrepTimer();
  hideSeqSpeakCountdown();
  stopSeqElapsedTimer();
  if (state.seqRecognition && state.seqIsRecording) {
    state._seqUserStoppedRecording = true; // exiting the session — don't auto-restart
    try { state.seqRecognition.stop(); } catch (e) {}
  }
  window.speechSynthesis?.cancel();
  // Full mock test was launched from the home card, not from browsing a
  // topic — return there instead of the (unvisited) practice sidebar.
  showScreen(state.seqIsFullMock ? 'screen-home' : 'screen-practice');
  state.seqIsFullMock = false;
}

async function finishSequentialSession() {
  state.seqActive = false;

  let topic, questionLabel, partForApi;
  if (state.seqIsFullMock) {
    topic = 'Full Mock Test';
    questionLabel = `Bài thi thử Speaking đầy đủ — Part 1 + 2 + 3 (${state.seqAnswers.length} câu hỏi)`;
    partForApi = 1;
  } else {
    topic = state.seqQueue[0]?.topic || '';
    questionLabel = `PART ${seqPartLabel(state.seqQueue)} — ${topic} (${state.seqAnswers.length} câu hỏi)`;
    partForApi = state.seqQueue[0]?.part;
  }

  const combined = state.seqAnswers.map((a, i) =>
    `Q${i + 1} (Part ${a.part}): ${a.question}\nA${i + 1}: ${a.transcript || '(không trả lời)'}`
  ).join('\n\n');

  const bodyEl       = document.getElementById('seq-body');
  const resultsEl    = document.getElementById('seq-results');
  const loadingEl    = document.getElementById('seq-feedback-loading');
  const feedbackBody = document.getElementById('seq-feedback-body');
  const actionsEl    = document.getElementById('seq-results-actions');

  if (bodyEl)        bodyEl.style.display        = 'none';
  if (resultsEl)      resultsEl.style.display      = 'block';
  if (loadingEl)      loadingEl.style.display      = 'flex';
  if (feedbackBody)   feedbackBody.style.display   = 'none';
  if (actionsEl)       actionsEl.style.display       = 'none';
  _startFeedbackLoadingMessages('seq-feedback-loading-text');

  try {
    const data = await apiFetch('/api/speaking/analyze', {
      method: 'POST',
      body: JSON.stringify({
        transcript: combined,
        question:   questionLabel,
        topic,
        part:       partForApi,
        duration:   state.seqTotalElapsed,
      }),
    });
    _stopFeedbackLoadingMessages();
    if (loadingEl)    loadingEl.style.display    = 'none';
    if (feedbackBody) feedbackBody.style.display = 'block';
    if (actionsEl)    actionsEl.style.display    = 'flex';
    renderSeqFeedback(data.feedback || {});

    // Priority 2C — only for a session launched via the Today's Learning
    // popup's "Start" button. AI feedback already rendered above is the
    // real review surface; this never recomputes or invents a score.
    if (window.EWSLearning && window.EWSLearning.consumeStart('speaking')) {
      window.EWSLearning.showReviewPopup('speaking', {
        emoji: '🗣️',
        scoreLabel: 'Session Complete',
        nextAction: 'Review your AI feedback above, then continue your plan.',
      });
    }
  } catch (e) {
    console.error('finishSequentialSession:', e);
    _stopFeedbackLoadingMessages();
    if (loadingEl) loadingEl.style.display = 'none';
    if (feedbackBody) {
      feedbackBody.style.display = 'block';
      feedbackBody.innerHTML = '<div class="fb-card"><p class="fb-card-text">Không thể phân tích. Vui lòng thử lại sau.</p></div>';
    }
    if (actionsEl) actionsEl.style.display = 'flex';
    showToast('Không thể phân tích. Vui lòng thử lại sau.', 'error');
  }
}

function renderSeqFeedback(fb) {
  const scores = [
    ['Band tổng thể',       fb.overallBand, ' score-overall'],
    ['Fluency & Coherence', fb.fluency,       ''],
    ['Lexical Resource',    fb.vocabulary,    ''],
    ['Grammatical Range',   fb.grammar,       ''],
    ['Pronunciation',       fb.pronunciation, ''],
  ];
  const scoreCards = scores.map(([label, val, extraClass]) => `
    <div class="score-card${extraClass}">
      <div class="score-label">${label}</div>
      <div class="score-value" data-band="${val != null ? bandColor(val) : ''}">${val != null ? val : '—'}</div>
    </div>`).join('');

  let html = `
    <div class="score-header"><i class="fas fa-chart-bar"></i> Kết quả đánh giá cả buổi</div>
    <div class="score-grid">${scoreCards}</div>`;

  if (fb.overallFeedback) {
    html += `
    <div class="fb-card">
      <div class="fb-card-title"><i class="fas fa-comment-alt"></i> Nhận xét tổng thể</div>
      <p class="fb-card-text">${escHtml(fb.overallFeedback)}</p>
    </div>`;
  }
  if (fb.todaysFocus) {
    html += `
    <div class="fb-card fb-card-focus">
      <div class="fb-card-title"><i class="fas fa-bullseye"></i> Trọng tâm hôm nay</div>
      <p class="fb-card-text">${escHtml(fb.todaysFocus)}</p>
    </div>`;
  }
  if (fb.strengths?.length) {
    html += `
    <div class="fb-card fb-card-blue">
      <div class="fb-card-title"><i class="fas fa-star"></i> Điểm mạnh</div>
      <ul class="fb-list">${fb.strengths.map(s => `<li>${escHtml(s)}</li>`).join('')}</ul>
    </div>`;
  }
  if (fb.mistakes?.length) {
    html += `
    <div class="fb-card fb-card-red">
      <div class="fb-card-title"><i class="fas fa-times-circle"></i> Lỗi cần sửa</div>
      ${fb.mistakes.map(m => `
        <div class="error-item">
          <span class="error-wrong">${escHtml(m.original)}</span>
          <span class="error-arrow">→</span>
          <span class="error-right">${escHtml(m.corrected)}</span>
          ${m.reason ? `<div class="error-tip-row">💡 ${escHtml(m.reason)}</div>` : ''}
        </div>`).join('')}
    </div>`;
  }
  if (fb.vocabUpgrades?.length) {
    html += `
    <div class="fb-card fb-card-green">
      <div class="fb-card-title"><i class="fas fa-arrow-up"></i> Nâng cấp từ vựng</div>
      ${fb.vocabUpgrades.map(v => `
        <div class="vocab-item">
          <span class="vocab-original">${escHtml(v.original)}</span>
          <span class="error-arrow">→</span>
          <span class="vocab-upgrade">${escHtml(v.upgrade)}</span>
          ${v.reason ? `<div class="vocab-tip-row">💡 ${escHtml(v.reason)}</div>` : ''}
        </div>`).join('')}
    </div>`;
  }
  if (fb.improvements?.length) {
    html += `
    <div class="fb-card fb-card-yellow">
      <div class="fb-card-title"><i class="fas fa-lightbulb"></i> Gợi ý cải thiện</div>
      <ul class="fb-list">${fb.improvements.map(i => `<li>${escHtml(i)}</li>`).join('')}</ul>
    </div>`;
  }

  const feedbackBody = document.getElementById('seq-feedback-body');
  if (feedbackBody) feedbackBody.innerHTML = html;
  setupDictionaryDouble('seq-feedback-body', 'speaking-seq-feedback');
}

// ══════════════════════════════════════════════════════
// HISTORY SCREEN
// ══════════════════════════════════════════════════════

async function loadHistory() {
  const container = document.getElementById('history-content');
  if (!container) return;
  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch('/api/speaking/history');
    const attempts = data.attempts || [];

    if (!attempts.length) {
      container.innerHTML = `
        <div class="history-empty">
          <p style="font-size:48px;margin-bottom:16px">🎙</p>
          <p style="font-size:16px;font-weight:700;color:#374151;margin-bottom:8px">Chưa có bài luyện nào</p>
          <p>Hãy bắt đầu luyện tập và nhận AI feedback ngay!</p>
          <button class="btn-primary" style="margin-top:20px" onclick="showScreen('screen-practice');initPractice()">
            <i class="fas fa-microphone"></i> Luyện ngay
          </button>
        </div>`;
      return;
    }

    container.innerHTML = '<div class="history-list" id="history-list"></div>';
    const list = document.getElementById('history-list');

    attempts.forEach(a => {
      const band = a.aiFeedback?.overallBand || 0;
      const card = document.createElement('div');
      card.className = 'history-card';
      // Full Mock Test attempts always save part=1 (schema only allows a
      // single part) even though they cover all 3 — badge them distinctly
      // instead of showing a misleading "Part 1".
      const isFullMock = a.topic === 'Full Mock Test';
      const badgeClass = isFullMock ? 'hbadge-mock' : `hbadge-p${a.part}`;
      const badgeLabel = isFullMock ? 'Mock Test' : `Part ${a.part}`;
      // A submission can sit as 'pending' while Gemini is still grading
      // (Part 2/3's longer transcripts take longest) or end up 'error' if
      // grading ultimately failed — either way the attempt itself was
      // saved immediately, so show it rather than a blank/missing card.
      const statusNote = a.status === 'pending'
        ? '<div class="history-status-note history-status-pending">⏳ Đang chấm bài, vui lòng quay lại sau ít phút...</div>'
        : a.status === 'error'
          ? `<div class="history-status-note history-status-error">⚠️ Chấm bài thất bại cho lượt này.
              <button class="history-retry-btn" onclick="event.stopPropagation();retrySpeakingGrading('${a._id}', this)"><i class="fas fa-rotate-right"></i> Thử chấm lại</button>
            </div>`
          : '';
      card.innerHTML = `
        <div class="history-card-top">
          <div class="history-card-meta">
            <span class="history-part-badge ${badgeClass}">${badgeLabel}</span>
            ${a.topic && !isFullMock ? `<span class="history-topic-badge">${escHtml(a.topic)}</span>` : ''}
            <span class="history-date">${formatDate(a.createdAt)}</span>
          </div>
          ${band ? `<div class="history-band-badge">${band}</div>` : ''}
        </div>
        <div class="history-question">${escHtml(a.question || 'Không có câu hỏi')}</div>
        ${statusNote}
        ${renderHistoryScores(a.aiFeedback)}`;

      card.onclick = () => openHistoryModal(a);
      list.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = `
      <div class="state-error">
        <p style="font-size:15px;font-weight:600;margin-bottom:4px">Lỗi tải lịch sử</p>
        <p style="font-size:13px;color:var(--text3,#6b7280)">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
        <button class="btn-primary retry-btn" onclick="loadHistory()"><i class="fas fa-rotate-right"></i> Thử lại</button>
      </div>`;
    console.error('loadHistory:', e);
  }
}

// Re-grades a stuck/failed attempt against its own stored transcript (no
// new recording needed) — the history card's "Thử chấm lại" action.
// Refetches the whole list on success/failure rather than hand-patching
// one card in place, since the raw feedback shape this endpoint returns
// (fb.mistakes/fb.improvements) differs from the persisted aiFeedback
// shape (fb.corrections/fb.suggestions) the history cards render from —
// simplest correct option, and history lists are short/cheap to refetch.
async function retrySpeakingGrading(attemptId, btn) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang chấm lại...';
  try {
    await apiFetch(`/api/speaking/${attemptId}/retry`, { method: 'POST' });
    toast('Đã chấm lại thành công!', 'success');
    loadHistory();
  } catch (e) {
    toast(e.message || 'Chấm lại thất bại, vui lòng thử lại sau.', 'error');
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

function renderHistoryScores(fb) {
  if (!fb || !fb.overallBand) return '';
  const items = [
    ['Fluency', fb.fluency],
    ['Vocabulary', fb.vocabulary],
    ['Grammar', fb.grammar],
    ['Pronunciation', fb.pronunciation],
  ].filter(([,v]) => v);
  if (!items.length) return '';
  return `<div class="history-scores">
    ${items.map(([label, val]) => `
      <div class="history-score-item">
        ${escHtml(label)}: <strong>${val}</strong>
      </div>`).join('')}
  </div>`;
}

async function openHistoryModal(attempt) {
  const modal = document.getElementById('history-modal');
  const title = document.getElementById('history-modal-title');
  const body  = document.getElementById('history-modal-body');

  const isFullMock = attempt.topic === 'Full Mock Test';
  if (title) title.textContent = isFullMock ? 'Bài thi thử Speaking đầy đủ' : `Part ${attempt.part} · ${attempt.topic || 'Speaking'}`;

  const fb   = attempt.aiFeedback || {};
  const band = fb.overallBand || 0;

  body.innerHTML = `
    <div class="modal-question-card">
      <div class="q-meta">
        <span class="q-part-badge">${isFullMock ? 'Mock Test' : `Part ${attempt.part}`}</span>
        ${attempt.topic && !isFullMock ? `<span class="q-topic-badge">${escHtml(attempt.topic)}</span>` : ''}
      </div>
      <div class="q-text" style="font-size:15px">${escHtml(attempt.question || '')}</div>
    </div>

    <div id="history-audio-slot"></div>

    ${attempt.status === 'pending' ? '<div class="history-status-note history-status-pending">⏳ Đang chấm bài, vui lòng quay lại sau ít phút...</div>' : ''}
    ${attempt.status === 'error' ? `
    <div class="history-status-note history-status-error">⚠️ Chấm bài thất bại cho lượt này.
      <button class="history-retry-btn" onclick="closeHistoryModal();retrySpeakingGrading('${attempt._id}', this)"><i class="fas fa-rotate-right"></i> Thử chấm lại</button>
    </div>` : ''}

    ${attempt.transcript ? `
    <div class="modal-transcript">
      <div class="modal-transcript-label">📝 Transcript của bạn</div>
      ${escHtml(attempt.transcript)}
    </div>` : ''}

    ${band ? `
    <div class="score-header"><i class="fas fa-chart-bar"></i> Điểm số</div>
    <div class="score-grid modal-score-grid">
      <div class="score-card score-overall">
        <div class="score-label">Band tổng</div>
        <div class="score-value">${band}</div>
      </div>
      ${fb.fluency      ? `<div class="score-card"><div class="score-label">Fluency</div><div class="score-value">${fb.fluency}</div></div>` : ''}
      ${fb.vocabulary   ? `<div class="score-card"><div class="score-label">Vocabulary</div><div class="score-value">${fb.vocabulary}</div></div>` : ''}
      ${fb.grammar      ? `<div class="score-card"><div class="score-label">Grammar</div><div class="score-value">${fb.grammar}</div></div>` : ''}
      ${fb.pronunciation? `<div class="score-card"><div class="score-label">Pronunciation</div><div class="score-value">${fb.pronunciation}</div></div>` : ''}
    </div>` : ''}

    ${(fb.overallFeedback || fb.feedback) ? `
    <div class="fb-card" style="margin-bottom:14px">
      <div class="fb-card-title"><i class="fas fa-comment-alt"></i> Nhận xét</div>
      <p class="fb-card-text">${escHtml(fb.overallFeedback || fb.feedback)}</p>
    </div>` : ''}

    ${fb.todaysFocus ? `
    <div class="fb-card fb-card-focus" style="margin-bottom:14px">
      <div class="fb-card-title"><i class="fas fa-bullseye"></i> Trọng tâm hôm nay</div>
      <p class="fb-card-text">${escHtml(fb.todaysFocus)}</p>
    </div>` : ''}

    ${fb.correctedVersion ? `
    <div class="fb-card fb-card-green" style="margin-bottom:14px">
      <div class="fb-card-title"><i class="fas fa-check-circle"></i> Phiên bản cải thiện</div>
      <p class="fb-card-text">${escHtml(fb.correctedVersion)}</p>
    </div>` : ''}

    ${fb.strengths?.length ? `
    <div class="fb-card fb-card-blue" style="margin-bottom:14px">
      <div class="fb-card-title"><i class="fas fa-star"></i> Điểm mạnh</div>
      <ul class="fb-list">${fb.strengths.map(s=>`<li>${escHtml(s)}</li>`).join('')}</ul>
    </div>` : ''}

    ${fb.corrections?.length ? `
    <div class="fb-card fb-card-red" style="margin-bottom:14px">
      <div class="fb-card-title"><i class="fas fa-times-circle"></i> Lỗi cần sửa</div>
      ${fb.corrections.map(c=>`
        <div class="error-item">
          <span class="error-wrong">${escHtml(c.original)}</span>
          <span class="error-arrow">→</span>
          <span class="error-right">${escHtml(c.corrected)}</span>
          ${c.explanation ? `<div class="error-tip-row">💡 ${escHtml(c.explanation)}</div>` : ''}
        </div>`).join('')}
    </div>` : ''}

    ${fb.vocabUpgrades?.length ? `
    <div class="fb-card fb-card-green" style="margin-bottom:14px">
      <div class="fb-card-title"><i class="fas fa-arrow-up"></i> Nâng cấp từ vựng</div>
      ${fb.vocabUpgrades.map(v=>`
        <div class="vocab-item">
          <span class="vocab-original">${escHtml(v.original)}</span>
          <span class="error-arrow">→</span>
          <span class="vocab-upgrade">${escHtml(v.upgrade)}</span>
          ${v.reason ? `<div class="vocab-tip-row">💡 ${escHtml(v.reason)}</div>` : ''}
        </div>`).join('')}
    </div>` : ''}

    ${fb.suggestions?.length ? `
    <div class="fb-card fb-card-yellow">
      <div class="fb-card-title"><i class="fas fa-lightbulb"></i> Gợi ý cải thiện</div>
      <ul class="fb-list">${fb.suggestions.map(s=>`<li>${escHtml(s)}</li>`).join('')}</ul>
    </div>` : ''}
  `;

  if (modal) modal.classList.add('open');

  // Best-effort, async, non-blocking — only present if this exact browser/
  // device made the recording (IndexedDB is local-only, never syncs).
  if (window.SpeakingAudioStore && attempt._id) {
    const blob = await window.SpeakingAudioStore.getAudioRecording(attempt._id);
    const slot = document.getElementById('history-audio-slot');
    if (blob && slot) {
      const url = URL.createObjectURL(blob);
      slot.innerHTML = `
        <div class="modal-audio-playback">
          <div class="modal-transcript-label">🔊 Bản ghi âm (chỉ có trên thiết bị này)</div>
          <audio controls src="${url}"></audio>
        </div>`;
    }
  }
}

function closeHistoryModal() {
  const modal = document.getElementById('history-modal');
  if (modal) modal.classList.remove('open');
}

// Close modal on overlay click
document.getElementById('history-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeHistoryModal();
});

// ══════════════════════════════════════════════════════
// MATERIALS SCREEN
// ══════════════════════════════════════════════════════

async function loadMaterialFilters() {
  try {
    const data = await apiFetch('/api/speaking/material-filters');

    const qChips = document.getElementById('quarter-chips');
    if (qChips) {
      qChips.innerHTML = `<span class="pv-chip active" data-quarter="all" onclick="setQuarterFilter('all',this)">Tất cả</span>`;
      (data.quarters || []).forEach(q => {
        const s = document.createElement('span');
        s.className = 'pv-chip'; s.dataset.quarter = q; s.textContent = q;
        s.onclick = () => setQuarterFilter(q, s);
        qChips.appendChild(s);
      });
    }

    const tChips = document.getElementById('topic-chips');
    if (tChips) {
      tChips.innerHTML = `<span class="pv-chip active" data-topic="all" onclick="setTopicFilter('all',this)">Tất cả</span>`;
      (data.topics || []).forEach(t => {
        const s = document.createElement('span');
        s.className = 'pv-chip'; s.dataset.topic = t; s.textContent = t;
        s.onclick = () => setTopicFilter(t, s);
        tChips.appendChild(s);
      });
    }
  } catch (e) { console.error('loadMaterialFilters:', e); }
}

function setQuarterFilter(q, el) {
  document.querySelectorAll('#quarter-chips .pv-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.materialFilter.quarter = q;
  loadMaterials();
}

function setTopicFilter(t, el) {
  document.querySelectorAll('#topic-chips .pv-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.materialFilter.topic = t;
  loadMaterials();
}

async function loadMaterials() {
  const list = document.getElementById('materials-list');
  if (!list) return;
  list.innerHTML = '<div class="spinner"></div>';

  const { quarter, topic } = state.materialFilter;
  const params = [];
  if (quarter !== 'all') params.push(`quarter=${encodeURIComponent(quarter)}`);
  if (topic   !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  try {
    const data      = await apiFetch(`/api/speaking/materials${qs}`);
    const materials = data.materials || [];

    if (!materials.length) {
      list.innerHTML = '<div class="materials-empty">Chưa có tài liệu nào.</div>';
      return;
    }

    list.innerHTML = '';
    materials.forEach(m => {
      const card = document.createElement('div');
      card.className = 'pv-doc-card';
      card.innerHTML = `
        <div class="pv-doc-icon">📄</div>
        <div class="pv-doc-info">
          <div class="pv-doc-title">${escHtml(m.title)}</div>
          <div class="pv-doc-meta">${escHtml(m.quarter)} · ${escHtml(m.topic)}</div>
        </div>`;
      card.onclick = () => openMaterial(m, card);
      list.appendChild(card);
    });
  } catch (e) {
    list.innerHTML = '<div class="materials-empty">Lỗi tải tài liệu.</div>';
    console.error('loadMaterials:', e);
  }
}

function openMaterial(m, card) {
  document.querySelectorAll('.pv-doc-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');

  const placeholder = document.getElementById('pdf-placeholder');
  const wrap        = document.getElementById('sp-viewer-wrap');
  const frame       = document.getElementById('pdf-frame');
  const right       = document.getElementById('materials-right');

  if (placeholder) placeholder.style.display = 'none';
  if (wrap)        wrap.style.display         = 'flex';
  if (frame)       frame.src = `https://docs.google.com/viewer?url=${encodeURIComponent(m.pdfUrl)}&embedded=true`;

  const titleEl = document.getElementById('sp-viewer-title');
  const dlBtn   = document.getElementById('sp-download-btn');
  const tabBtn  = document.getElementById('sp-newtab-btn');
  if (titleEl) titleEl.textContent = m.title;
  if (dlBtn)   dlBtn.href  = m.pdfUrl;
  if (tabBtn)  tabBtn.href = m.pdfUrl;

  if (window.innerWidth <= 768 && right) {
    right.classList.add('mobile-open');
    document.querySelector('#screen-materials .pv-sidebar').style.display = 'none';
    right.scrollIntoView({ behavior: 'smooth' });
  }
}

function closeMobilePdf() {
  const right   = document.getElementById('materials-right');
  const sidebar = document.querySelector('#screen-materials .pv-sidebar');
  if (right)   right.classList.remove('mobile-open');
  if (sidebar) sidebar.style.display = '';
}

// ──────────────────────────────────────────────────────
// Navigation helper — free user quay lại upgrade screen
// ──────────────────────────────────────────────────────
function goBackFromHistory() {
  if (!window.AuthService.hasPremiumAccess()) {
    showScreen('screen-upgrade');
  } else if (state._historyReturnScreen === 'screen-practice') {
    state._historyReturnScreen = null;
    showScreen('screen-practice');
    syncTabUrl('practice');
  } else {
    goHome();
  }
}

// Premium upgrade modal (openUpgradeModal, closeUpgradeModal,
// selectUpgradePlan, submitUpgradeRequest, copyUpgradeAccount) is now the
// shared, site-wide js/upgrade-modal.js component — see speaking.html.
// (The old openSpeakingUpgradeModal()/submitSpeakingUpgradeRequest() here
// posted to a nonexistent /api/upgrade-request route and always 404'd.)
