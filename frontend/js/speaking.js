/* ═══════════════════════════════════════════════════════
   speaking.js  –  EnglishWithDan Speaking Module
   ⚠️  All AI calls go through /api/speaking/analyze (backend proxy)
       No API keys are stored or used in this file.
═══════════════════════════════════════════════════════ */

const API = 'https://englishwithdan.onrender.com';

// ──────────────────────────────────────────────────────
// Toast notification
// ──────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText =
      'position:fixed;top:68px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { info: '#3d8bff', error: '#e53935', success: '#22c55e', warn: '#f59e0b' };
  toast.style.cssText = `background:#fff;border-left:4px solid ${colors[type] || colors.info};border-radius:8px;padding:12px 16px;font-size:13px;font-weight:500;color:#111;box-shadow:0 4px 16px rgba(0,0,0,.12);max-width:300px;line-height:1.4;`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ──────────────────────────────────────────────────────
// Auth helpers
// ──────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('sp_verified');
  window.location.href = 'login.html';
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
  const text = await res.text();
  if (text.trimStart().startsWith('<')) throw new Error('Server không phản hồi đúng.');
  try { return JSON.parse(text); } catch { throw new Error('Phản hồi không hợp lệ từ server.'); }
}

// ──────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────
const state = {
  currentQuestion:  null,
  recognition:      null,
  isRecording:      false,
  recordStartTime:  null,
  elapsedTimer:     null,   // setInterval for elapsed counter
  prepTimer:        null,   // setInterval for Part 2 prep countdown
  speakTimer:       null,   // setInterval for Part 2 speaking countdown
  prepSecondsLeft:  60,
  speakSecondsLeft: 120,
  materialFilter:   { quarter: 'all', topic: 'all' },
};

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────
function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function clearAllTimers() {
  clearInterval(state.elapsedTimer);
  clearInterval(state.prepTimer);
  clearInterval(state.speakTimer);
  state.elapsedTimer = state.prepTimer = state.speakTimer = null;
}

// ──────────────────────────────────────────────────────
// Access Key Gate
// ──────────────────────────────────────────────────────
function showGate() {
  document.getElementById('sp-gate').style.display = 'flex';
  document.getElementById('sp-tabs').style.display = 'none';
  document.querySelectorAll('.sp-content').forEach(el => el.classList.add('sp-tab-hidden'));
}

function showPractice() {
  document.getElementById('sp-gate').style.display = 'none';
  document.getElementById('sp-tabs').style.display = 'flex';
  document.querySelectorAll('.sp-content').forEach(el => el.classList.remove('sp-tab-hidden'));
  loadTopics();
}

async function submitKey() {
  const input = document.getElementById('gate-key-input');
  const msgEl = document.getElementById('gate-msg');
  const btn   = document.getElementById('gate-submit-btn');
  const key   = (input?.value || '').trim().toUpperCase();

  if (!key) { showGateMsg('Vui lòng nhập mã truy cập.', 'error'); return; }

  btn.disabled = true;
  btn.textContent = 'Đang kiểm tra...';
  hideGateMsg();

  try {
    const data = await apiFetch('/api/speaking/verify-key', {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
    if (!data.success) {
      showGateMsg(data.message || 'Mã không hợp lệ.', 'error');
      return;
    }
    sessionStorage.setItem('sp_verified', '1');
    showPractice();
    showToast('✅ Xác nhận thành công! Chúc bạn luyện tập hiệu quả.', 'success');
  } catch (e) {
    showGateMsg(e.message || 'Lỗi kết nối. Vui lòng thử lại.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Xác nhận →';
  }
}

function showGateMsg(msg, type = 'error') {
  const el = document.getElementById('gate-msg');
  if (!el) return;
  el.textContent  = msg;
  el.style.display = 'block';
  el.className = `gate-msg gate-msg--${type}`;
}
function hideGateMsg() {
  const el = document.getElementById('gate-msg');
  if (el) el.style.display = 'none';
}

// ──────────────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────────────
(function init() {
  if (!getToken()) { window.location.href = 'login.html'; return; }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || '';
  const el = document.getElementById('userName');
  if (el) el.textContent = `👋 ${name}`;

  // Web Speech API support check
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const warn = document.getElementById('no-speech-warning');
    if (warn) warn.classList.add('visible');
  } else {
    setupRecognition();
  }

  // Enable analyze button on manual typing
  const textarea = document.getElementById('transcript-textarea');
  if (textarea) {
    textarea.addEventListener('input', function () {
      const btn = document.getElementById('btn-analyze');
      if (btn) btn.disabled = !this.value.trim();
    });
  }

  // Check session access
  if (sessionStorage.getItem('sp_verified') === '1') {
    showPractice();
  } else {
    showGate();
  }
})();

// ──────────────────────────────────────────────────────
// Tab switching
// ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.sp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sp-content').forEach(c => c.classList.remove('active'));

  document.getElementById('tab-btn-' + tab)?.classList.add('active');
  document.getElementById('tab-' + tab)?.classList.add('active');

  if (tab === 'materials') { loadMaterialFilters(); loadMaterials(); }
  if (tab === 'practice'  ) { if (!state.currentQuestion) loadTopics(); }
}

// ══════════════════════════════════════════════════════
// PRACTICE TAB
// ══════════════════════════════════════════════════════

async function loadTopics() {
  try {
    const part = document.getElementById('sel-part').value;
    const qs   = part !== 'all' ? `?part=${part}` : '';
    const data  = await apiFetch(`/api/speaking/topics${qs}`);
    const sel   = document.getElementById('sel-topic');
    const prev  = sel.value;
    sel.innerHTML = '<option value="all">Tất cả</option>';
    (data.topics || []).forEach(t => {
      const opt = document.createElement('option');
      opt.value = t; opt.textContent = t;
      if (t === prev) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error('loadTopics:', e);
    showToast('Không thể tải danh sách chủ đề. Vui lòng thử lại.', 'error');
  }
  await loadQuestions();
}

async function loadQuestions() {
  const part  = document.getElementById('sel-part').value;
  const topic = document.getElementById('sel-topic').value;
  const params = [];
  if (part  !== 'all') params.push(`part=${part}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  const sel = document.getElementById('sel-question');
  sel.innerHTML = '<option value="">-- Chọn câu hỏi --</option>';

  try {
    const data = await apiFetch(`/api/speaking/questions${qs}`);
    (data.questions || []).forEach(q => {
      const opt    = document.createElement('option');
      opt.value    = q._id;
      const label  = q.question.length > 65 ? q.question.slice(0, 62) + '…' : q.question;
      opt.textContent = `[Part ${q.part}] ${label}`;
      opt.dataset.q   = JSON.stringify(q);
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error('loadQuestions:', e);
    showToast('Không thể tải câu hỏi. Vui lòng thử lại.', 'error');
  }
}

function selectQuestion(id) {
  if (!id) return;
  const opt = document.querySelector(`#sel-question option[value="${id}"]`);
  if (!opt) return;
  try {
    const q = JSON.parse(opt.dataset.q);
    setQuestion(q);
    resetPractice();
  } catch (e) { console.error('selectQuestion:', e); }
}

function readQuestion(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter  = new SpeechSynthesisUtterance(text);
  utter.lang   = 'en-US';
  utter.rate   = 0.85;
  utter.pitch  = 1;
  window.speechSynthesis.speak(utter);
}

async function loadRandomQuestion() {
  const part  = document.getElementById('sel-part').value;
  const topic = document.getElementById('sel-topic').value;
  const params = [];
  if (part  !== 'all') params.push(`part=${part}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  try {
    const data = await apiFetch(`/api/speaking/random${qs}`);
    if (!data.question) { showToast('Không tìm thấy câu hỏi phù hợp. Thử chọn topic khác.', 'warn'); return; }
    const sel = document.getElementById('sel-question');
    if (sel) sel.value = data.question._id || '';
    setQuestion(data.question);
    resetPractice();
  } catch (e) {
    console.error('loadRandomQuestion:', e);
    showToast('Không thể tải câu hỏi. Vui lòng thử lại.', 'error');
  }
}

function setQuestion(q) {
  state.currentQuestion = q;

  const partLabel = document.getElementById('q-part-label');
  const qText     = document.getElementById('q-text');
  const cue       = document.getElementById('q-cue');

  if (partLabel) partLabel.textContent = `Part ${q.part}`;
  if (qText)     qText.textContent     = q.question;
  if (cue) {
    if (q.cueCard) { cue.textContent = q.cueCard; cue.classList.remove('hidden'); }
    else             cue.classList.add('hidden');
  }
  readQuestion(q.question);

  // Part 2: show prep timer after reset
  if (q.part === 2) {
    // Capture question ref; check it still matches when timeout fires
    // (guards against rapid question switching)
    setTimeout(() => { if (state.currentQuestion === q) startPrepTimer(); }, 100);
  }
}

function resetPractice() {
  clearAllTimers();

  if (state.isRecording && state.recognition) state.recognition.stop();
  state.isRecording   = false;
  state.recordStartTime = null;

  // Hide Part 2 elements
  hidePrepTimer();
  hideSpeakCountdown();

  const ta          = document.getElementById('transcript-textarea');
  const btnAnalyze  = document.getElementById('btn-analyze');
  const feedbackBox = document.getElementById('feedback-box');
  const interim     = document.getElementById('transcript-interim');
  const recStatus   = document.getElementById('rec-status');
  const recIcon     = document.getElementById('rec-icon');
  const recLabel    = document.getElementById('rec-label');
  const btnRecord   = document.getElementById('btn-record');
  const elapsed     = document.getElementById('rec-elapsed');

  if (ta)          ta.value           = '';
  if (btnAnalyze)  btnAnalyze.disabled = true;
  if (feedbackBox) feedbackBox.classList.remove('visible');
  if (interim)     interim.textContent = '';
  if (recStatus)   { recStatus.textContent = 'Nhấn để bắt đầu ghi âm'; recStatus.classList.remove('live'); }
  if (recIcon)     recIcon.textContent  = '🎙';
  if (recLabel)    recLabel.textContent = 'Start Speaking';
  if (btnRecord)   btnRecord.classList.remove('recording');
  if (elapsed)     { elapsed.textContent = '⏱ 0:00'; elapsed.classList.add('hidden'); }
}

function retryQuestion() {
  resetPractice();
  if (state.currentQuestion?.part === 2) {
    setTimeout(() => { if (state.currentQuestion?.part === 2) startPrepTimer(); }, 100);
  }
}

// ──────────────────────────────────────────────────────
// Part 2 Timer – Prep phase (60 seconds)
// ──────────────────────────────────────────────────────
function startPrepTimer() {
  clearInterval(state.prepTimer);
  state.prepSecondsLeft = 60;

  const prepEl    = document.getElementById('p2-prep');
  const clockEl   = document.getElementById('p2-prep-clock');
  const btnRecord = document.getElementById('btn-record');

  if (!prepEl) return;
  prepEl.style.display = 'block';
  if (clockEl) clockEl.textContent = fmtTime(state.prepSecondsLeft);

  // Disable record button during prep
  if (btnRecord) { btnRecord.disabled = true; btnRecord.classList.add('btn-record--disabled'); }

  state.prepTimer = setInterval(() => {
    state.prepSecondsLeft--;
    if (clockEl) clockEl.textContent = fmtTime(state.prepSecondsLeft);

    if (state.prepSecondsLeft <= 0) {
      clearInterval(state.prepTimer);
      state.prepTimer = null;
      hidePrepTimer();
      // Auto-start recording when prep ends
      showToast('⏰ Hết thời gian chuẩn bị – Bắt đầu nói!', 'info');
      if (state.recognition && !state.isRecording) {
        state.recognition.start();
        state.isRecording = true;
      }
    }
  }, 1000);
}

function skipPrep() {
  clearInterval(state.prepTimer);
  state.prepTimer = null;
  hidePrepTimer();
  if (state.recognition && !state.isRecording) {
    state.recognition.start();
    state.isRecording = true;
  }
}

function hidePrepTimer() {
  const prepEl    = document.getElementById('p2-prep');
  const btnRecord = document.getElementById('btn-record');
  if (prepEl) prepEl.style.display = 'none';
  if (btnRecord) { btnRecord.disabled = false; btnRecord.classList.remove('btn-record--disabled'); }
}

// ──────────────────────────────────────────────────────
// Part 2 Timer – Speaking phase (2 minutes)
// ──────────────────────────────────────────────────────
function startSpeakCountdown() {
  if (state.currentQuestion?.part !== 2) return;
  clearInterval(state.speakTimer);
  state.speakSecondsLeft = 120;

  const cdEl = document.getElementById('p2-speak-countdown');
  const tmEl = document.getElementById('p2-speak-time');

  if (cdEl) cdEl.classList.remove('hidden');
  if (tmEl) tmEl.textContent = fmtTime(state.speakSecondsLeft);

  state.speakTimer = setInterval(() => {
    state.speakSecondsLeft--;
    if (tmEl) tmEl.textContent = fmtTime(state.speakSecondsLeft);

    // Warning at 30 seconds left
    if (state.speakSecondsLeft === 30) {
      showToast('⚠️ Còn 30 giây – hãy kết thúc câu trả lời!', 'warn');
    }

    if (state.speakSecondsLeft <= 0) {
      clearInterval(state.speakTimer);
      state.speakTimer = null;
      // Auto-stop recording
      if (state.isRecording && state.recognition) {
        state.recognition.stop();
        state.isRecording = false;
      }
      showToast('⏰ Hết 2 phút – ghi âm đã dừng tự động.', 'info');
      hideSpeakCountdown();
    }
  }, 1000);
}

function hideSpeakCountdown() {
  const cdEl = document.getElementById('p2-speak-countdown');
  if (cdEl) cdEl.classList.add('hidden');
  clearInterval(state.speakTimer);
  state.speakTimer = null;
}

// ──────────────────────────────────────────────────────
// Elapsed time counter (all parts)
// ──────────────────────────────────────────────────────
function startElapsedTimer() {
  clearInterval(state.elapsedTimer);
  state.recordStartTime = Date.now();
  const el = document.getElementById('rec-elapsed');
  if (el) el.classList.remove('hidden');

  state.elapsedTimer = setInterval(() => {
    const secs = Math.floor((Date.now() - state.recordStartTime) / 1000);
    const elEl = document.getElementById('rec-elapsed');
    if (elEl) elEl.textContent = `⏱ ${fmtTime(secs)}`;
  }, 1000);
}

function stopElapsedTimer() {
  clearInterval(state.elapsedTimer);
  state.elapsedTimer = null;
}

function getElapsedSeconds() {
  if (!state.recordStartTime) return 0;
  return Math.floor((Date.now() - state.recordStartTime) / 1000);
}

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
    document.getElementById('rec-icon')?.textContent  && (document.getElementById('rec-icon').textContent  = '🔴');
    document.getElementById('rec-label')?.textContent && (document.getElementById('rec-label').textContent = 'Stop');
    const recStatus = document.getElementById('rec-status');
    if (recStatus) { recStatus.textContent = '🔴 Recording...'; recStatus.classList.add('live'); }
    document.getElementById('btn-record')?.classList.add('recording');

    startElapsedTimer();
    startSpeakCountdown(); // only does something for Part 2
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
      document.getElementById('btn-analyze') && (document.getElementById('btn-analyze').disabled = false);
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
    const btnAnalyze= document.getElementById('btn-analyze');

    if (recIcon)   recIcon.textContent  = '🎙';
    if (recLabel)  recLabel.textContent = 'Start Speaking';
    if (recStatus) recStatus.classList.remove('live');
    if (btnRecord) btnRecord.classList.remove('recording');
    if (interimEl) interimEl.textContent = '';

    if (ta && !ta.value.trim() && finalTranscript.trim()) ta.value = finalTranscript.trim();

    if (ta && ta.value.trim()) {
      if (btnAnalyze) btnAnalyze.disabled = false;
      if (recStatus) recStatus.textContent = 'Ghi âm hoàn tất ✓';
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
    if (document.getElementById('rec-icon'))  document.getElementById('rec-icon').textContent  = '🎙';
    if (document.getElementById('rec-label')) document.getElementById('rec-label').textContent = 'Start Speaking';
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
    state.recognition.start();
    state.isRecording = true;
  }
}

// ──────────────────────────────────────────────────────
// AI Analyze
// ──────────────────────────────────────────────────────
async function analyzeTranscript() {
  const ta         = document.getElementById('transcript-textarea');
  const transcript = ta ? ta.value.trim() : '';
  if (!transcript) return;

  const question = state.currentQuestion?.question || '';
  const duration = getElapsedSeconds();

  const box     = document.getElementById('feedback-box');
  const loading = document.getElementById('feedback-loading');
  const content = document.getElementById('feedback-content');

  if (box)     box.classList.add('visible');
  if (loading) loading.style.display = 'block';
  if (content) content.style.display = 'none';
  if (box)     box.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
    if (content) content.style.display = 'block';

    const fb = data.feedback || {};

    // Band score
    const bandEl  = document.getElementById('feedback-band');
    const bandVal = document.getElementById('band-value');
    if (fb.band_estimate) {
      if (bandVal) bandVal.textContent = fb.band_estimate;
      if (bandEl)  bandEl.style.display = 'inline-flex';
    } else {
      if (bandEl) bandEl.style.display = 'none';
    }

    // Corrected version
    const corrEl = document.getElementById('feedback-corrected');
    if (corrEl) corrEl.textContent = fb.corrected || transcript;

    // Errors
    const errEl = document.getElementById('feedback-errors');
    if (errEl) {
      errEl.innerHTML = '';
      if (fb.errors?.length) {
        errEl.innerHTML = '<h4>❌ Lỗi cần sửa</h4>';
        fb.errors.forEach(err => {
          const d = document.createElement('div');
          d.className = 'error-item';
          d.innerHTML = `
            <span class="error-wrong">${escHtml(err.wrong)}</span>
            <span class="error-arrow">→</span>
            <span class="error-right">${escHtml(err.right)}</span>
            <span class="error-tip">${escHtml(err.tip || '')}</span>`;
          errEl.appendChild(d);
        });
      }
    }

    // Tips
    const tipEl = document.getElementById('feedback-tips');
    if (tipEl) {
      tipEl.innerHTML = '';
      if (fb.tips?.length) {
        tipEl.innerHTML = '<h4>💡 Gợi ý cải thiện</h4>';
        fb.tips.forEach(t => {
          const d = document.createElement('div');
          d.className = 'tip-item';
          d.textContent = t;
          tipEl.appendChild(d);
        });
      }
    }
  } catch (e) {
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
    const corrEl = document.getElementById('feedback-corrected');
    if (corrEl) corrEl.textContent = 'Không thể phân tích lúc này. Vui lòng thử lại.';
    console.error('analyzeTranscript:', e);
    showToast('Không thể phân tích. Vui lòng thử lại sau.', 'error');
  }
}

// ══════════════════════════════════════════════════════
// MATERIALS TAB
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

    if (!materials.length) { list.innerHTML = '<div class="materials-empty">Chưa có tài liệu nào.</div>'; return; }

    list.innerHTML = '';
    materials.forEach(m => {
      const card = document.createElement('div');
      card.className = 'pv-doc-card';
      card.innerHTML = `
        <div class="pv-doc-icon">📄</div>
        <div class="pv-doc-info">
          <div class="pv-doc-title">${m.title}</div>
          <div class="pv-doc-meta">${m.quarter} · ${m.topic}</div>
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
    document.querySelector('.pv-sidebar').style.display = 'none';
    right.scrollIntoView({ behavior: 'smooth' });
  }
}

function closeMobilePdf() {
  const right   = document.getElementById('materials-right');
  const sidebar = document.querySelector('#tab-materials .pv-sidebar');
  if (right)   right.classList.remove('mobile-open');
  if (sidebar) sidebar.style.display = '';
}
