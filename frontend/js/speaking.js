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
async function loadQuestions() {
  const topic = document.getElementById('sel-topic').value;
  const params = [];
  if (state.partFilter !== 'all') params.push(`part=${state.partFilter}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  const list = document.getElementById('question-list');
  if (list) list.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch(`/api/speaking/questions${qs}`);
    const questions = data.questions || [];

    if (!list) return;
    if (!questions.length) {
      list.innerHTML = '<div style="font-size:13px;color:#9ca3af;padding:12px 0;text-align:center">Không có câu hỏi</div>';
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
  } catch (e) {
    if (list) list.innerHTML = '<div style="font-size:13px;color:#e53935;padding:8px 0">Lỗi tải câu hỏi</div>';
    console.error('loadQuestions:', e);
  }
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
}

function readQuestion() {
  const q = state.currentQuestion;
  if (!q || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(q.question);
  utter.lang  = 'en-US';
  utter.rate  = 0.85;
  window.speechSynthesis.speak(utter);
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
