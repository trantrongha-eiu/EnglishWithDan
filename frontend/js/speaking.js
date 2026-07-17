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
  elapsedTimer:     null,
  prepTimer:        null,
  speakTimer:       null,
  prepSecondsLeft:  60,
  speakSecondsLeft: 120,
  practiceInited:   false,
  partFilter:       'all',
  materialFilter:   { quarter: 'all', topic: 'all' },

  // Sequential (mock-test) topic practice — fully isolated from the fields above
  lastQuestionList:   [],
  seqQueue:           [],
  seqIndex:           0,
  seqAnswers:         [],
  seqRecognition:     null,
  seqIsRecording:     false,
  seqFinalTranscript: '',
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

  // Enable analyze button on manual typing
  const ta = document.getElementById('transcript-textarea');
  if (ta) {
    ta.addEventListener('input', function() {
      const btn = document.getElementById('btn-analyze');
      if (btn) btn.disabled = !this.value.trim();
    });
  }

  // Navigate to practice if URL param
  const tabParam = new URLSearchParams(location.search).get('tab');
  if (tabParam === 'materials') {
    showScreen('screen-materials');
    loadMaterialFilters();
    loadMaterials();
  } else if (tabParam === 'practice') {
    showScreen('screen-practice');
    initPractice();
  }
})();

// ══════════════════════════════════════════════════════
// PRACTICE SCREEN
// ══════════════════════════════════════════════════════

function initPractice() {
  if (state.practiceInited) return;
  state.practiceInited = true;
  loadTopics();
}

// ── Part filter ──
function setPartFilter(part, el) {
  state.partFilter = part;
  document.querySelectorAll('.part-tab').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  loadTopics();
}

// ── Topics ──
async function loadTopics() {
  try {
    const qs = state.partFilter !== 'all' ? `?part=${state.partFilter}` : '';
    const data = await apiFetch(`/api/speaking/topics${qs}`);
    const sel = document.getElementById('sel-topic');
    const prev = sel.value;
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
  questions.forEach(q => {
    const item = document.createElement('div');
    item.className = 'question-item';
    item.dataset.id = q._id;
    item.dataset.q  = JSON.stringify(q);

    const badgeClass = `p${q.part}`;
    item.innerHTML = `
      <div class="q-item-meta">
        <span class="q-item-badge ${badgeClass}">Part ${q.part}</span>
        <span class="q-item-topic">${escHtml(q.topic)}</span>
      </div>
      <div class="q-item-text">${escHtml(q.question)}</div>`;
    item.onclick = () => selectQuestion(q, item);
    list.appendChild(item);
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

function speakText(text) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang  = 'en-US';
  utter.rate  = 0.95;
  utter.pitch = 1.0;
  if (_ttsVoice) utter.voice = _ttsVoice;
  window.speechSynthesis.speak(utter);
}

function readQuestion() {
  const q = state.currentQuestion;
  if (!q) return;
  speakText(q.question);
}

function resetPractice() {
  clearAllTimers();
  if (state.isRecording && state.recognition) state.recognition.stop();
  state.isRecording    = false;
  state.recordStartTime = null;

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
  if (btnRecord)  btnRecord.classList.remove('recording');
  if (elapsed)    elapsed.classList.add('hidden');
  if (recIcon)    { recIcon.className = 'fas fa-microphone rec-mic'; }
  if (recLabel)   recLabel.textContent = 'Bắt đầu';
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
function setupRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.recognition = new SR();
  state.recognition.lang           = 'en-US';
  state.recognition.continuous     = true;
  state.recognition.interimResults = true;

  let finalTranscript = '';

  state.recognition.onstart = () => {
    finalTranscript = '';
    const recIcon   = document.getElementById('rec-icon');
    const recLabel  = document.getElementById('rec-label');
    const recStatus = document.getElementById('rec-status');
    const btnRecord = document.getElementById('btn-record');

    if (recIcon)   recIcon.className  = 'fas fa-stop rec-mic';
    if (recLabel)  recLabel.textContent = 'Dừng';
    if (recStatus) { recStatus.textContent = '🔴 Đang ghi âm...'; recStatus.classList.add('live'); }
    if (btnRecord) btnRecord.classList.add('recording');

    startElapsedTimer();
    startSpeakCountdown();
  };

  state.recognition.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalTranscript += t + ' ';
      else interim += t;
    }
    const interimEl = document.getElementById('transcript-interim');
    if (interimEl) interimEl.textContent = interim;

    const cleaned = finalTranscript.trim();
    if (cleaned) {
      const ta = document.getElementById('transcript-textarea');
      if (ta) ta.value = cleaned;
      const btn = document.getElementById('btn-analyze');
      if (btn) btn.disabled = false;
    }
  };

  state.recognition.onend = () => {
    state.isRecording = false;
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
    if (btnRecord) btnRecord.classList.remove('recording');
    if (interimEl) interimEl.textContent = '';

    if (ta && !ta.value.trim() && finalTranscript.trim()) ta.value = finalTranscript.trim();

    if (ta && ta.value.trim()) {
      if (btn) btn.disabled = false;
      if (recStatus) recStatus.textContent = '✓ Ghi âm hoàn tất';
    } else {
      if (recStatus) recStatus.textContent = 'Ghi âm đã dừng';
    }
  };

  state.recognition.onerror = (e) => {
    console.error('Speech error:', e.error);
    const msgs = {
      'not-allowed': 'Bạn chưa cấp quyền micro. Vui lòng cho phép trong cài đặt trình duyệt.',
      'no-speech':   'Không nhận được giọng nói. Thử lại nhé.',
      'network':     'Lỗi mạng khi nhận dạng giọng nói.',
    };
    const recStatus = document.getElementById('rec-status');
    if (recStatus) recStatus.textContent = msgs[e.error] || `Lỗi: ${e.error}`;
    state.isRecording = false;
    stopElapsedTimer();
    document.getElementById('btn-record')?.classList.remove('recording');
    const recIcon  = document.getElementById('rec-icon');
    const recLabel = document.getElementById('rec-label');
    if (recIcon)  recIcon.className  = 'fas fa-microphone rec-mic';
    if (recLabel) recLabel.textContent = 'Bắt đầu';
  };
}

function toggleRecord() {
  if (!state.recognition) {
    showToast('Trình duyệt không hỗ trợ ghi âm. Bạn có thể gõ câu trả lời vào ô bên dưới.', 'warn');
    return;
  }
  if (state.isRecording) {
    state.recognition.stop();
    state.isRecording = false;
  } else {
    try {
      state.recognition.start();
      state.isRecording = true;
    } catch (e) {
      showToast('Không thể bắt đầu ghi âm, thử lại.', 'error');
    }
  }
}

// ──────────────────────────────────────────────────────
// AI Analysis
// ──────────────────────────────────────────────────────
async function analyzeTranscript() {
  const ta         = document.getElementById('transcript-textarea');
  const transcript = ta ? ta.value.trim() : '';
  if (!transcript) return;

  const question = state.currentQuestion?.question || '';
  const duration = getElapsedSeconds();

  const section  = document.getElementById('feedback-section');
  const loading  = document.getElementById('feedback-loading');
  const results  = document.getElementById('feedback-results');

  if (section) section.style.display = 'block';
  if (loading) loading.style.display = 'flex';
  if (results) results.style.display = 'none';
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const data = await apiFetch('/api/speaking/analyze', {
      method: 'POST',
      body: JSON.stringify({
        transcript,
        question,
        questionId: state.currentQuestion?._id,
        topic:      state.currentQuestion?.topic,
        part:       state.currentQuestion?.part,
        duration,
      }),
    });

    if (loading) loading.style.display = 'none';
    if (results) results.style.display = 'block';

    renderFeedback(data.feedback || {});
  } catch (e) {
    if (loading) loading.style.display = 'none';
    if (results) results.style.display = 'block';
    showToast('Không thể phân tích. Vui lòng thử lại sau.', 'error');
    const scoreOverall = document.getElementById('score-overall');
    if (scoreOverall) scoreOverall.textContent = 'Lỗi';
    console.error('analyzeTranscript:', e);
  }
}

function renderFeedback(fb) {
  // Scores
  const scores = [
    ['overall',       fb.overall_band],
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

  // Overall feedback
  const fbOverall = document.getElementById('fb-overall-card');
  const fbOverallText = document.getElementById('fb-overall-text');
  if (fb.overall_feedback) {
    if (fbOverallText) fbOverallText.textContent = fb.overall_feedback;
    if (fbOverall) fbOverall.style.display = 'block';
  } else {
    if (fbOverall) fbOverall.style.display = 'none';
  }

  // Corrected version
  const fbCorrected = document.getElementById('fb-corrected-card');
  const fbCorrectedText = document.getElementById('fb-corrected-text');
  if (fb.corrected) {
    if (fbCorrectedText) fbCorrectedText.textContent = fb.corrected;
    if (fbCorrected) fbCorrected.style.display = 'block';
  } else {
    if (fbCorrected) fbCorrected.style.display = 'none';
  }

  // Strengths
  const fbStrengths = document.getElementById('fb-strengths-card');
  const fbStrengthsList = document.getElementById('fb-strengths-list');
  if (fb.strengths?.length) {
    if (fbStrengthsList) fbStrengthsList.innerHTML = fb.strengths.map(s => `<li>${escHtml(s)}</li>`).join('');
    if (fbStrengths) fbStrengths.style.display = 'block';
  } else {
    if (fbStrengths) fbStrengths.style.display = 'none';
  }

  // Errors
  const fbErrors = document.getElementById('fb-errors-card');
  const fbErrorsList = document.getElementById('fb-errors-list');
  if (fb.errors?.length) {
    if (fbErrorsList) {
      fbErrorsList.innerHTML = fb.errors.map(err => `
        <div class="error-item">
          <span class="error-wrong">${escHtml(err.wrong)}</span>
          <span class="error-arrow">→</span>
          <span class="error-right">${escHtml(err.right)}</span>
          ${err.tip ? `<div class="error-tip-row">💡 ${escHtml(err.tip)}</div>` : ''}
        </div>`).join('');
    }
    if (fbErrors) fbErrors.style.display = 'block';
  } else {
    if (fbErrors) fbErrors.style.display = 'none';
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

  hideSeqPrepTimer();
  hideSeqSpeakCountdown();
  clearSeqSilenceTimer();

  replaySeqQuestion();

  if (q.part === 2) {
    setTimeout(() => { if (state.seqActive && state.seqQueue[state.seqIndex] === q) startSeqPrepTimer(); }, 100);
  } else {
    startSeqRecording();
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

function setupSeqRecognition() {
  if (state.seqRecognition) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  state.seqRecognition = new SR();
  state.seqRecognition.lang           = 'en-US';
  state.seqRecognition.continuous     = true;
  state.seqRecognition.interimResults = true;

  state.seqRecognition.onstart = () => {
    state.seqFinalTranscript = '';
    state.seqIsRecording = true;
    const recIndicator = document.getElementById('seq-rec-indicator');
    const recStatus    = document.getElementById('seq-rec-status');
    if (recIndicator) recIndicator.classList.add('recording');
    if (recStatus) { recStatus.textContent = '🔴 Đang ghi âm...'; recStatus.classList.add('live'); }
    startSeqElapsedTimer();
    const q = state.seqQueue[state.seqIndex];
    if (q && q.part === 2) startSeqSpeakCountdown();
    else startSeqSilenceTimer();
  };

  state.seqRecognition.onresult = (e) => {
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
  };

  state.seqRecognition.onerror = (e) => {
    console.error('Seq speech error:', e.error);
    state.seqIsRecording = false;
    stopSeqElapsedTimer();
    const recIndicator = document.getElementById('seq-rec-indicator');
    if (recIndicator) recIndicator.classList.remove('recording');
    const recStatus = document.getElementById('seq-rec-status');
    const msgs = {
      'not-allowed': 'Bạn chưa cấp quyền micro.',
      'no-speech':   'Không nhận được giọng nói.',
      'network':     'Lỗi mạng khi nhận dạng giọng nói.',
    };
    if (recStatus) recStatus.textContent = msgs[e.error] || `Lỗi: ${e.error}`;
  };
}

function startSeqRecording() {
  if (!state.seqRecognition) {
    showToast('Trình duyệt không hỗ trợ ghi âm. Gõ câu trả lời rồi nhấn Ghi nhận câu trả lời.', 'warn');
    return;
  }
  if (state.seqIsRecording) return;
  try {
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

function exitSequentialSession() {
  state.seqActive = false;
  clearSeqSilenceTimer();
  hideSeqPrepTimer();
  hideSeqSpeakCountdown();
  stopSeqElapsedTimer();
  if (state.seqRecognition && state.seqIsRecording) {
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
    if (loadingEl)    loadingEl.style.display    = 'none';
    if (feedbackBody) feedbackBody.style.display = 'block';
    if (actionsEl)    actionsEl.style.display    = 'flex';
    renderSeqFeedback(data.feedback || {});
  } catch (e) {
    console.error('finishSequentialSession:', e);
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
    ['Band tổng thể',       fb.overall_band, ' score-overall'],
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

  if (fb.overall_feedback) {
    html += `
    <div class="fb-card">
      <div class="fb-card-title"><i class="fas fa-comment-alt"></i> Nhận xét tổng thể</div>
      <p class="fb-card-text">${escHtml(fb.overall_feedback)}</p>
    </div>`;
  }
  if (fb.corrected) {
    html += `
    <div class="fb-card fb-card-green">
      <div class="fb-card-title"><i class="fas fa-check-circle"></i> Phiên bản cải thiện</div>
      <p class="fb-card-text">${escHtml(fb.corrected)}</p>
    </div>`;
  }
  if (fb.strengths?.length) {
    html += `
    <div class="fb-card fb-card-blue">
      <div class="fb-card-title"><i class="fas fa-star"></i> Điểm mạnh</div>
      <ul class="fb-list">${fb.strengths.map(s => `<li>${escHtml(s)}</li>`).join('')}</ul>
    </div>`;
  }
  if (fb.errors?.length) {
    html += `
    <div class="fb-card fb-card-red">
      <div class="fb-card-title"><i class="fas fa-times-circle"></i> Lỗi cần sửa</div>
      ${fb.errors.map(err => `
        <div class="error-item">
          <span class="error-wrong">${escHtml(err.wrong)}</span>
          <span class="error-arrow">→</span>
          <span class="error-right">${escHtml(err.right)}</span>
          ${err.tip ? `<div class="error-tip-row">💡 ${escHtml(err.tip)}</div>` : ''}
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
      const badgeClass = `hbadge-p${a.part}`;
      card.innerHTML = `
        <div class="history-card-top">
          <div class="history-card-meta">
            <span class="history-part-badge ${badgeClass}">Part ${a.part}</span>
            ${a.topic ? `<span class="history-topic-badge">${escHtml(a.topic)}</span>` : ''}
            <span class="history-date">${formatDate(a.createdAt)}</span>
          </div>
          ${band ? `<div class="history-band-badge">${band}</div>` : ''}
        </div>
        <div class="history-question">${escHtml(a.question || 'Không có câu hỏi')}</div>
        ${renderHistoryScores(a.aiFeedback)}`;

      card.onclick = () => openHistoryModal(a);
      list.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = '<div class="history-empty">Lỗi tải lịch sử. Vui lòng thử lại.</div>';
    console.error('loadHistory:', e);
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

function openHistoryModal(attempt) {
  const modal = document.getElementById('history-modal');
  const title = document.getElementById('history-modal-title');
  const body  = document.getElementById('history-modal-body');

  if (title) title.textContent = `Part ${attempt.part} · ${attempt.topic || 'Speaking'}`;

  const fb   = attempt.aiFeedback || {};
  const band = fb.overallBand || 0;
  const badgeClass = `hbadge-p${attempt.part}`;

  body.innerHTML = `
    <div class="modal-question-card">
      <div class="q-meta">
        <span class="q-part-badge">Part ${attempt.part}</span>
        ${attempt.topic ? `<span class="q-topic-badge">${escHtml(attempt.topic)}</span>` : ''}
      </div>
      <div class="q-text" style="font-size:15px">${escHtml(attempt.question || '')}</div>
    </div>

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

    ${fb.suggestions?.length ? `
    <div class="fb-card fb-card-yellow">
      <div class="fb-card-title"><i class="fas fa-lightbulb"></i> Gợi ý cải thiện</div>
      <ul class="fb-list">${fb.suggestions.map(s=>`<li>${escHtml(s)}</li>`).join('')}</ul>
    </div>` : ''}
  `;

  if (modal) modal.classList.add('open');
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
  } else {
    showScreen('screen-home');
  }
}

// ══════════════════════════════════════════════════════
// UPGRADE MODAL
// ══════════════════════════════════════════════════════

const SP_UPGRADE_PRICES = { 1: 90000, 3: 250000, 6: 500000, 12: 900000, 36: 2500000 };
let _spUpgradeSettings = null;

async function openSpeakingUpgradeModal() {
  const modal = document.getElementById('sp-modal-upgrade');
  if (!modal) return;
  modal.classList.remove('hidden');
  if (!_spUpgradeSettings) {
    try {
      const res = await fetch(`${API}/tuition/settings`, {
        headers: window.AuthService.authHeader()
      });
      const d = await res.json();
      _spUpgradeSettings = d.settings || {};
    } catch { _spUpgradeSettings = {}; }
    _renderSpBankInfo();
  }
  selectSpeakingPlan(1);
}

function closeSpeakingUpgradeModal() {
  const modal = document.getElementById('sp-modal-upgrade');
  if (modal) modal.classList.add('hidden');
}

function selectSpeakingPlan(months) {
  document.querySelectorAll('.sp-up-plan-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.sp-up-plan-btn[data-months="${months}"]`);
  if (btn) btn.classList.add('active');
  const el = document.getElementById('sp-up-total-price');
  if (el) el.textContent = (SP_UPGRADE_PRICES[months] || 0).toLocaleString('vi-VN') + ' ₫';
}

function _renderSpBankInfo() {
  const s = _spUpgradeSettings || {};
  const el = document.getElementById('sp-up-bank-info');
  if (!el) return;
  const rows = [];
  if (s.bankName)    rows.push(`<div class="sp-up-bank-row"><span class="sp-up-bank-label">🏦 Ngân hàng</span><span class="sp-up-bank-val">${s.bankName}</span></div>`);
  if (s.accountName) rows.push(`<div class="sp-up-bank-row"><span class="sp-up-bank-label">👤 Chủ TK</span><span class="sp-up-bank-val">${s.accountName}</span></div>`);
  if (s.bankAccount) rows.push(`<div class="sp-up-bank-row"><span class="sp-up-bank-label">💳 Số TK</span><span class="sp-up-bank-val sp-up-acc-num">${s.bankAccount}<button onclick="copySpAccount('${s.bankAccount}')" title="Sao chép"><i class="fas fa-copy"></i></button></span></div>`);
  if (s.paymentNote) rows.push(`<div class="sp-up-bank-row"><span class="sp-up-bank-label">📋 Nội dung CK</span><span class="sp-up-bank-val">${s.paymentNote}</span></div>`);
  el.innerHTML = rows.join('');
  const qrEl = document.getElementById('sp-up-qr-img');
  if (qrEl) { qrEl.src = s.qrImageUrl || ''; qrEl.style.display = s.qrImageUrl ? 'block' : 'none'; }
}

function copySpAccount(num) {
  if (navigator.clipboard) navigator.clipboard.writeText(num).then(() => showToast('Đã sao chép số tài khoản', 'success'));
}

async function submitSpeakingUpgradeRequest() {
  const activeBtn = document.querySelector('.sp-up-plan-btn.active');
  const months = activeBtn ? Number(activeBtn.dataset.months) : 1;
  const amount = SP_UPGRADE_PRICES[months] || 0;
  try {
    const res = await apiFetch('/api/upgrade-request', {
      method: 'POST',
      body: JSON.stringify({ months, amount, note: 'Speaking Premium' })
    });
    if (res.success) {
      closeSpeakingUpgradeModal();
      showToast('Yêu cầu đã gửi! Admin sẽ xác nhận trong 24 giờ.', 'success');
    } else {
      showToast(res.message || 'Gửi yêu cầu thất bại', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Lỗi kết nối', 'error');
  }
}
