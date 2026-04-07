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
      'position:fixed;top:68px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
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
function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(API + path, {
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) },
  });
  if (res.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }
  const text = await res.text();
  if (text.trimStart().startsWith('<')) throw new Error('Server không phản hồi đúng.');
  return JSON.parse(text);
}

// ──────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────
const state = {
  currentQuestion: null,
  recognition: null,
  isRecording: false,
  materialFilter: { quarter: 'all', topic: 'all' },
};

// ──────────────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────────────
(function init() {
  const token = getToken();
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.username || '';
  const el = document.getElementById('userName');
  if (el) el.textContent = `👋 ${name}`;

  // Check Web Speech API support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const warn = document.getElementById('no-speech-warning');
    if (warn) warn.classList.add('visible');
  } else {
    setupRecognition();
  }

  loadTopics();

  // Enable analyze button on manual typing
  const textarea = document.getElementById('transcript-textarea');
  if (textarea) {
    textarea.addEventListener('input', function () {
      const btn = document.getElementById('btn-analyze');
      if (btn) btn.disabled = !this.value.trim();
    });
  }
})();

// ──────────────────────────────────────────────────────
// Tab switching
// ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.sp-tab').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.sp-content').forEach((c) => c.classList.remove('active'));

  const tabBtn = document.getElementById('tab-btn-' + tab);
  const tabContent = document.getElementById('tab-' + tab);
  if (tabBtn) tabBtn.classList.add('active');
  if (tabContent) tabContent.classList.add('active');

  if (tab === 'materials') {
    loadMaterialFilters();
    loadMaterials();
  }
}

// ══════════════════════════════════════════════════════
// PRACTICE TAB
// ══════════════════════════════════════════════════════

// ── Load topics by selected part ──
async function loadTopics() {
  try {
    const part = document.getElementById('sel-part').value;
    const qs = part !== 'all' ? `?part=${part}` : '';
    const data = await apiFetch(`/api/speaking/topics${qs}`);
    const sel = document.getElementById('sel-topic');
    const prev = sel.value;
    sel.innerHTML = '<option value="all">Tất cả</option>';
    (data.topics || []).forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      if (t === prev) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error('loadTopics:', e);
  }
  await loadQuestions();
}

// ── Load questions filtered by part + topic ──
async function loadQuestions() {
  const part = document.getElementById('sel-part').value;
  const topic = document.getElementById('sel-topic').value;
  const params = [];
  if (part !== 'all') params.push(`part=${part}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  const sel = document.getElementById('sel-question');
  sel.innerHTML = '<option value="">-- Chọn câu hỏi --</option>';

  try {
    const data = await apiFetch(`/api/speaking/questions${qs}`);
    (data.questions || []).forEach((q) => {
      const opt = document.createElement('option');
      opt.value = q._id;
      const label = q.question.length > 65 ? q.question.slice(0, 62) + '…' : q.question;
      opt.textContent = `[Part ${q.part}] ${label}`;
      opt.dataset.q = JSON.stringify(q);
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error('loadQuestions:', e);
  }
}

// ── Select a specific question from dropdown ──
function selectQuestion(id) {
  if (!id) return;
  const opt = document.querySelector(`#sel-question option[value="${id}"]`);
  if (!opt) return;
  try {
    const q = JSON.parse(opt.dataset.q);
    setQuestion(q);
    resetPractice();
  } catch (e) {
    console.error('selectQuestion:', e);
  }
}

// ── Text-to-Speech ──
function readQuestion(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

// ── Load a random question ──
async function loadRandomQuestion() {
  const part = document.getElementById('sel-part').value;
  const topic = document.getElementById('sel-topic').value;

  const params = [];
  if (part !== 'all') params.push(`part=${part}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  try {
    const data = await apiFetch(`/api/speaking/random${qs}`);
    if (!data.question) {
      showToast('Không tìm thấy câu hỏi phù hợp. Thử chọn topic khác.', 'warn');
      return;
    }
    // Sync dropdown selection
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
  const qText = document.getElementById('q-text');
  const cue = document.getElementById('q-cue');

  if (partLabel) partLabel.textContent = `Part ${q.part}`;
  if (qText) qText.textContent = q.question;
  if (cue) {
    if (q.cueCard) {
      cue.textContent = q.cueCard;
      cue.classList.remove('hidden');
    } else {
      cue.classList.add('hidden');
    }
  }
  readQuestion(q.question);
}

function resetPractice() {
  // Stop recording if active
  if (state.isRecording && state.recognition) {
    state.recognition.stop();
  }

  const ta = document.getElementById('transcript-textarea');
  const btnAnalyze = document.getElementById('btn-analyze');
  const feedbackBox = document.getElementById('feedback-box');
  const interim = document.getElementById('transcript-interim');
  const recStatus = document.getElementById('rec-status');
  const recIcon = document.getElementById('rec-icon');
  const recLabel = document.getElementById('rec-label');
  const btnRecord = document.getElementById('btn-record');

  if (ta) ta.value = '';
  if (btnAnalyze) btnAnalyze.disabled = true;
  if (feedbackBox) feedbackBox.classList.remove('visible');
  if (interim) interim.textContent = '';
  if (recStatus) {
    recStatus.textContent = 'Nhấn để bắt đầu ghi âm';
    recStatus.classList.remove('live');
  }
  if (recIcon) recIcon.textContent = '🎙';
  if (recLabel) recLabel.textContent = 'Start Speaking';
  if (btnRecord) btnRecord.classList.remove('recording');
}

function retryQuestion() {
  resetPractice();
}

// ──────────────────────────────────────────────────────
// Web Speech API
// ──────────────────────────────────────────────────────
function setupRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.recognition = new SR();
  state.recognition.lang = 'en-US';
  state.recognition.continuous = true;
  state.recognition.interimResults = true;

  let finalTranscript = '';

  state.recognition.onstart = () => {
    finalTranscript = '';
    const recIcon = document.getElementById('rec-icon');
    const recLabel = document.getElementById('rec-label');
    const recStatus = document.getElementById('rec-status');
    const btnRecord = document.getElementById('btn-record');

    if (recIcon) recIcon.textContent = '🔴';
    if (recLabel) recLabel.textContent = 'Stop';
    if (recStatus) {
      recStatus.textContent = '🔴 Recording...';
      recStatus.classList.add('live');
    }
    if (btnRecord) btnRecord.classList.add('recording');
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
      const btnAnalyze = document.getElementById('btn-analyze');
      if (ta) ta.value = cleaned;
      if (btnAnalyze) btnAnalyze.disabled = false;
    }
  };

  state.recognition.onend = () => {
    state.isRecording = false;

    const recIcon = document.getElementById('rec-icon');
    const recLabel = document.getElementById('rec-label');
    const recStatus = document.getElementById('rec-status');
    const btnRecord = document.getElementById('btn-record');
    const interimEl = document.getElementById('transcript-interim');
    const ta = document.getElementById('transcript-textarea');
    const btnAnalyze = document.getElementById('btn-analyze');

    if (recIcon) recIcon.textContent = '🎙';
    if (recLabel) recLabel.textContent = 'Start Speaking';
    if (recStatus) recStatus.classList.remove('live');
    if (btnRecord) btnRecord.classList.remove('recording');
    if (interimEl) interimEl.textContent = '';

    // Fallback: if textarea is empty but we have a final transcript, fill it in
    if (ta && !ta.value.trim() && finalTranscript.trim()) {
      ta.value = finalTranscript.trim();
    }

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
      'no-speech': 'Không nhận được giọng nói. Thử lại nhé.',
      network: 'Lỗi mạng khi nhận dạng giọng nói.',
    };
    const recStatus = document.getElementById('rec-status');
    if (recStatus) recStatus.textContent = msgs[e.error] || `Lỗi: ${e.error}`;

    state.isRecording = false;
    const btnRecord = document.getElementById('btn-record');
    const recIcon = document.getElementById('rec-icon');
    const recLabel = document.getElementById('rec-label');
    if (btnRecord) btnRecord.classList.remove('recording');
    if (recIcon) recIcon.textContent = '🎙';
    if (recLabel) recLabel.textContent = 'Start Speaking';
  };
}

function toggleRecord() {
  if (!state.recognition) {
    showToast(
      'Trình duyệt không hỗ trợ ghi âm. Bạn có thể gõ câu trả lời vào ô bên dưới.',
      'warn'
    );
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
// AI Analyze  –  calls backend proxy (no API key in frontend)
// Backend route: POST /api/speaking/analyze
// ──────────────────────────────────────────────────────
async function analyzeTranscript() {
  const ta = document.getElementById('transcript-textarea');
  const transcript = ta ? ta.value.trim() : '';
  if (!transcript) return;

  const question = state.currentQuestion ? state.currentQuestion.question : '';

  const box = document.getElementById('feedback-box');
  const loading = document.getElementById('feedback-loading');
  const content = document.getElementById('feedback-content');

  if (box) box.classList.add('visible');
  if (loading) loading.style.display = 'block';
  if (content) content.style.display = 'none';

  // Scroll to feedback
  if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    // ✅ Calls backend proxy – API key stays server-side
    const data = await apiFetch('/api/speaking/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript, question }),
    });

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    const fb = data.feedback || {};

    // Band score
    const bandEl = document.getElementById('feedback-band');
    const bandVal = document.getElementById('band-value');
    if (fb.band_estimate) {
      if (bandVal) bandVal.textContent = fb.band_estimate;
      if (bandEl) bandEl.style.display = 'inline-flex';
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
      if (fb.errors && fb.errors.length) {
        errEl.innerHTML = '<h4>❌ Lỗi cần sửa</h4>';
        fb.errors.forEach((err) => {
          const d = document.createElement('div');
          d.className = 'error-item';
          d.innerHTML = `
            <span class="error-wrong">${err.wrong}</span>
            <span class="error-arrow">→</span>
            <span class="error-right">${err.right}</span>
            <span class="error-tip">${err.tip || ''}</span>`;
          errEl.appendChild(d);
        });
      }
    }

    // Tips
    const tipEl = document.getElementById('feedback-tips');
    if (tipEl) {
      tipEl.innerHTML = '';
      if (fb.tips && fb.tips.length) {
        tipEl.innerHTML = '<h4>💡 Gợi ý cải thiện</h4>';
        fb.tips.forEach((t) => {
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

    // Quarter chips
    const qChips = document.getElementById('quarter-chips');
    if (qChips) {
      qChips.innerHTML = `<span class="filter-chip active" data-quarter="all" onclick="setQuarterFilter('all',this)">Tất cả</span>`;
      (data.quarters || []).forEach((q) => {
        const s = document.createElement('span');
        s.className = 'filter-chip';
        s.dataset.quarter = q;
        s.textContent = q;
        s.onclick = () => setQuarterFilter(q, s);
        qChips.appendChild(s);
      });
    }

    // Topic chips
    const tChips = document.getElementById('topic-chips');
    if (tChips) {
      tChips.innerHTML = `<span class="filter-chip active" data-topic="all" onclick="setTopicFilter('all',this)">Tất cả</span>`;
      (data.topics || []).forEach((t) => {
        const s = document.createElement('span');
        s.className = 'filter-chip';
        s.dataset.topic = t;
        s.textContent = t;
        s.onclick = () => setTopicFilter(t, s);
        tChips.appendChild(s);
      });
    }
  } catch (e) {
    console.error('loadMaterialFilters:', e);
  }
}

function setQuarterFilter(q, el) {
  document.querySelectorAll('#quarter-chips .filter-chip').forEach((c) =>
    c.classList.remove('active')
  );
  el.classList.add('active');
  state.materialFilter.quarter = q;
  loadMaterials();
}

function setTopicFilter(t, el) {
  document.querySelectorAll('#topic-chips .filter-chip').forEach((c) =>
    c.classList.remove('active')
  );
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
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  try {
    const data = await apiFetch(`/api/speaking/materials${qs}`);
    const materials = data.materials || [];

    if (!materials.length) {
      list.innerHTML = '<div class="materials-empty">Chưa có tài liệu nào.</div>';
      return;
    }

    list.innerHTML = '';
    materials.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'material-card';
      card.innerHTML = `
        <div class="material-card-icon">📄</div>
        <div class="material-card-info">
          <div class="material-card-title">${m.title}</div>
          <div class="material-card-meta">${m.quarter} · ${m.topic}</div>
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
  document.querySelectorAll('.material-card').forEach((c) => c.classList.remove('active'));
  card.classList.add('active');

  const placeholder = document.getElementById('pdf-placeholder');
  const wrap        = document.getElementById('sp-viewer-wrap');
  const frame       = document.getElementById('pdf-frame');
  const right       = document.getElementById('materials-right');

  if (placeholder) placeholder.style.display = 'none';
  if (wrap) wrap.style.display = 'flex';
  if (frame) frame.src = `https://docs.google.com/viewer?url=${encodeURIComponent(m.pdfUrl)}&embedded=true`;

  const titleEl = document.getElementById('sp-viewer-title');
  const dlBtn   = document.getElementById('sp-download-btn');
  if (titleEl) titleEl.textContent = m.title;
  if (dlBtn)   dlBtn.href = m.pdfUrl;

  // On mobile: show PDF panel, hide list panel
  if (window.innerWidth <= 768 && right) {
    right.classList.add('mobile-open');
    document.getElementById('materials-left').style.display = 'none';
    right.scrollIntoView({ behavior: 'smooth' });
  }
}

function closeMobilePdf() {
  const right = document.getElementById('materials-right');
  const left = document.getElementById('materials-left');
  if (right) right.classList.remove('mobile-open');
  if (left) left.style.display = '';
}