/* ═══════════════════════════════════════════════════════
   speaking.js  –  EnglishWithDan Speaking Module
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
  const headers = { 'Authorization': `Bearer ${token}` };
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(API + path, {
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) }
  });
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
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
  materialFilter: { quarter: 'all', topic: 'all' }
};

// ──────────────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────────────
(function init() {
  const token = getToken();
  if (!token) { window.location.href = 'index.html'; return; }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user.username || '');
  const el = document.getElementById('userName');
  if (el) el.textContent = `👋 ${name}`;

  // Check Web Speech API support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    document.getElementById('no-speech-warning').classList.add('visible');
  } else {
    setupRecognition();
  }

  loadTopics();

  // Enable analyze button on manual typing
  document.getElementById('transcript-textarea').addEventListener('input', function () {
    document.getElementById('btn-analyze').disabled = !this.value.trim();
  });
})();

// ──────────────────────────────────────────────────────
// Tab switching
// ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.sp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sp-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-btn-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');

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
    (data.topics || []).forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      if (t === prev) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch (e) { console.error('loadTopics:', e); }
}

// ── Load a random question ──
async function loadRandomQuestion() {
  const part  = document.getElementById('sel-part').value;
  const topic = document.getElementById('sel-topic').value;

  const params = [];
  if (part  !== 'all') params.push(`part=${part}`);
  if (topic !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  try {
    const data = await apiFetch(`/api/speaking/random${qs}`);
    if (!data.question) {
      alert('Không tìm thấy câu hỏi phù hợp. Thử chọn topic khác.');
      return;
    }
    setQuestion(data.question);
    resetPractice();
  } catch (e) { console.error('loadRandomQuestion:', e); }
}

function setQuestion(q) {
  state.currentQuestion = q;
  document.getElementById('q-part-label').textContent = `Part ${q.part}`;
  document.getElementById('q-text').textContent = q.question;
  const cue = document.getElementById('q-cue');
  if (q.cueCard) {
    cue.textContent = q.cueCard;
    cue.classList.remove('hidden');
  } else {
    cue.classList.add('hidden');
  }
}

function resetPractice() {
  // Stop recording if active
  if (state.isRecording && state.recognition) {
    state.recognition.stop();
  }
  document.getElementById('transcript-textarea').value = '';
  document.getElementById('btn-analyze').disabled = true;
  document.getElementById('feedback-box').classList.remove('visible');
  document.getElementById('transcript-interim').textContent = '';
  document.getElementById('rec-status').textContent = 'Nhấn để bắt đầu ghi âm';
  document.getElementById('rec-status').classList.remove('live');
  document.getElementById('rec-icon').textContent = '🎙';
  document.getElementById('rec-label').textContent = 'Start Speaking';
  document.getElementById('btn-record').classList.remove('recording');
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
    document.getElementById('rec-icon').textContent = '🔴';
    document.getElementById('rec-label').textContent = 'Stop';
    document.getElementById('rec-status').textContent = '🔴 Recording...';
    document.getElementById('rec-status').classList.add('live');
    document.getElementById('btn-record').classList.add('recording');
  };

  state.recognition.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i].transcript;
      if (e.results[i].isFinal) finalTranscript += t + ' ';
      else interim += t;
    }
    document.getElementById('transcript-interim').textContent = interim;
    const cleaned = finalTranscript.trim();
    if (cleaned) {
      document.getElementById('transcript-textarea').value = cleaned;
      document.getElementById('btn-analyze').disabled = false;
    }
  };

  state.recognition.onend = () => {
    state.isRecording = false;
    document.getElementById('rec-icon').textContent = '🎙';
    document.getElementById('rec-label').textContent = 'Start Speaking';
    document.getElementById('rec-status').classList.remove('live');
    document.getElementById('btn-record').classList.remove('recording');
    document.getElementById('transcript-interim').textContent = '';

    const ta = document.getElementById('transcript-textarea');
    const txt = ta.value.trim();
    if (!txt && finalTranscript.trim()) {
      ta.value = finalTranscript.trim();
    }
    if (ta.value.trim()) {
      document.getElementById('btn-analyze').disabled = false;
      document.getElementById('rec-status').textContent = 'Ghi âm hoàn tất ✓';
    } else {
      document.getElementById('rec-status').textContent = 'Ghi âm đã dừng';
    }
  };

  state.recognition.onerror = (e) => {
    console.error('Speech error:', e.error);
    const msgs = {
      'not-allowed': 'Bạn chưa cấp quyền micro. Vui lòng cho phép trong cài đặt trình duyệt.',
      'no-speech': 'Không nhận được giọng nói. Thử lại nhé.',
      'network': 'Lỗi mạng khi nhận dạng giọng nói.'
    };
    document.getElementById('rec-status').textContent = msgs[e.error] || `Lỗi: ${e.error}`;
    state.isRecording = false;
    document.getElementById('btn-record').classList.remove('recording');
    document.getElementById('rec-icon').textContent = '🎙';
    document.getElementById('rec-label').textContent = 'Start Speaking';
  };
}

function toggleRecord() {
  if (!state.recognition) {
    alert('Trình duyệt không hỗ trợ ghi âm. Bạn có thể gõ câu trả lời vào ô bên dưới.');
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
  const transcript = document.getElementById('transcript-textarea').value.trim();
  if (!transcript) return;

  const question = state.currentQuestion ? state.currentQuestion.question : '';

  const box      = document.getElementById('feedback-box');
  const loading  = document.getElementById('feedback-loading');
  const content  = document.getElementById('feedback-content');

  box.classList.add('visible');
  loading.style.display = 'block';
  content.style.display = 'none';

  // Scroll to feedback
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const data = await apiFetch('/api/speaking/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript, question })
    });

    loading.style.display = 'none';
    content.style.display = 'block';

    const fb = data.feedback || {};

    // Band score
    const bandEl  = document.getElementById('feedback-band');
    const bandVal = document.getElementById('band-value');
    if (fb.band_estimate) {
      bandVal.textContent = fb.band_estimate;
      bandEl.style.display = 'inline-flex';
    } else {
      bandEl.style.display = 'none';
    }

    // Corrected version
    const corrEl = document.getElementById('feedback-corrected');
    corrEl.textContent = fb.corrected || transcript;

    // Errors
    const errEl = document.getElementById('feedback-errors');
    errEl.innerHTML = '';
    if (fb.errors && fb.errors.length) {
      errEl.innerHTML = '<h4>❌ Lỗi cần sửa</h4>';
      fb.errors.forEach(err => {
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

    // Tips
    const tipEl = document.getElementById('feedback-tips');
    tipEl.innerHTML = '';
    if (fb.tips && fb.tips.length) {
      tipEl.innerHTML = '<h4>💡 Gợi ý cải thiện</h4>';
      fb.tips.forEach(t => {
        const d = document.createElement('div');
        d.className = 'tip-item';
        d.textContent = t;
        tipEl.appendChild(d);
      });
    }

  } catch (e) {
    loading.style.display = 'none';
    content.style.display = 'block';
    document.getElementById('feedback-corrected').textContent =
      'Không thể phân tích lúc này. Vui lòng thử lại.';
    console.error('analyzeTranscript:', e);
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
    qChips.innerHTML = `<span class="filter-chip active" data-quarter="all" onclick="setQuarterFilter('all',this)">Tất cả</span>`;
    (data.quarters || []).forEach(q => {
      const s = document.createElement('span');
      s.className = 'filter-chip';
      s.dataset.quarter = q;
      s.textContent = q;
      s.onclick = () => setQuarterFilter(q, s);
      qChips.appendChild(s);
    });

    // Topic chips
    const tChips = document.getElementById('topic-chips');
    tChips.innerHTML = `<span class="filter-chip active" data-topic="all" onclick="setTopicFilter('all',this)">Tất cả</span>`;
    (data.topics || []).forEach(t => {
      const s = document.createElement('span');
      s.className = 'filter-chip';
      s.dataset.topic = t;
      s.textContent = t;
      s.onclick = () => setTopicFilter(t, s);
      tChips.appendChild(s);
    });
  } catch (e) { console.error('loadMaterialFilters:', e); }
}

function setQuarterFilter(q, el) {
  document.querySelectorAll('#quarter-chips .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.materialFilter.quarter = q;
  loadMaterials();
}

function setTopicFilter(t, el) {
  document.querySelectorAll('#topic-chips .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  state.materialFilter.topic = t;
  loadMaterials();
}

async function loadMaterials() {
  const list = document.getElementById('materials-list');
  list.innerHTML = '<div class="spinner"></div>';

  const { quarter, topic } = state.materialFilter;
  const params = [];
  if (quarter !== 'all') params.push(`quarter=${encodeURIComponent(quarter)}`);
  if (topic   !== 'all') params.push(`topic=${encodeURIComponent(topic)}`);
  const qs = params.length ? '?' + params.join('&') : '';

  try {
    const data = await apiFetch(`/api/speaking/materials${qs}`);
    const materials = data.materials || [];

    if (!materials.length) {
      list.innerHTML = '<div class="materials-empty">Chưa có tài liệu nào.</div>';
      return;
    }

    list.innerHTML = '';
    materials.forEach(m => {
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
  document.querySelectorAll('.material-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');

  const placeholder = document.getElementById('pdf-placeholder');
  const frame       = document.getElementById('pdf-frame');

  placeholder.style.display = 'none';
  frame.classList.add('visible');
  frame.src = m.pdfUrl;
}
