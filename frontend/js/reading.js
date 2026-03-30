/**
 * EnglishWithDan – Reading Full Test
 * reading.js – complete frontend logic
 */

'use strict';

// ══════════════════════════════════════════════════════
// CONFIG & STATE
// ══════════════════════════════════════════════════════
const API = 'https://englishwithdan.onrender.com/api';

const state = {
  tests: [],
  currentTestId: null,
  attemptId: null,
  passages: [],
  passageIdx: 0,       // passage đang hiển thị (0,1,2)
  answers: {},      // { questionNumber: value }
  dragItem: null,    // chip đang kéo
  timer: null,
  timeLeft: 3600,
  submitted: false,
  isReview: false,
  tool: 'highlight', // 'highlight' | 'dict'
  dictWord: '',
  dictMeaning: '',
  dictExample: '',
};

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (!token) { window.location.href = 'login.html'; return; }

  loadTestList();
  setupResizableSplitter('exam-split', 'split-divider', 'split-passage');
  setupResizableSplitter('review-split', 'review-divider', 'review-passage');
  setupHighlight();

  // Hotkey H = toggle highlight
  document.addEventListener('keydown', e => {
    if (e.key === 'h' || e.key === 'H') {
      if (!isInputFocused()) setTool('highlight');
    }
  });
});

// ══════════════════════════════════════════════════════
// AUTH HELPERS
// ══════════════════════════════════════════════════════
function getToken() { return localStorage.getItem('token'); }
function authHeader() { return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }; }
function isInputFocused() {
  const t = document.activeElement?.tagName;
  return t === 'INPUT' || t === 'TEXTAREA';
}

// ══════════════════════════════════════════════════════
// SCREEN MANAGEMENT
// ══════════════════════════════════════════════════════
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const el = document.getElementById(`screen-${name}`);
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ══════════════════════════════════════════════════════
// SCREEN 1 – TEST LIST
// ══════════════════════════════════════════════════════
async function loadTestList() {
  try {
    const res = await fetch(`${API}/reading/tests`, { headers: authHeader() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    state.tests = data.tests;
    renderTestList(data.tests);
  } catch (err) {
    document.getElementById('tests-wrapper').innerHTML =
      `<p style="color:#e53935;padding:40px;text-align:center">Lỗi tải dữ liệu: ${err.message}</p>`;
  }
}

function renderTestList(tests) {
  const wrap = document.getElementById('tests-wrapper');
  if (!tests.length) {
    wrap.innerHTML = '<p style="text-align:center;padding:60px;color:#9ca3af">Chưa có đề thi nào.</p>';
    return;
  }

  // Group by seriesName
  const groups = {};
  tests.forEach(t => {
    const g = t.seriesName || 'Bộ đề';
    if (!groups[g]) groups[g] = [];
    groups[g].push(t);
  });

  wrap.innerHTML = Object.entries(groups).map(([groupName, groupTests]) => {
    const done = groupTests.filter(t => t.lastAttempt).length;
    const total = groupTests.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    return `
      <div class="test-group" data-group="${groupName}">
        <div class="test-group-title">
          ${groupName}
          <span class="test-group-progress">Hoàn thành ${done}/${total} đề</span>
          <div class="progress-bar-mini">
            <div class="progress-bar-mini-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="test-grid">
          ${groupTests.map(renderTestCard).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderTestCard(t) {
  const la = t.lastAttempt;
  const done = !!la;

  const lastInfo = done ? `
    <div class="test-card-last">
      Lần cuối: ${formatDate(la.endTime)} •
      <span class="band-mini">${la.bandScore?.toFixed(1)} điểm</span>
    </div>` : '';

  return `
    <div class="test-card ${done ? 'done' : ''}" data-testid="${t._id}">
      <div class="test-card-cover">
        ${done ? '<div class="test-done-tick">✓</div>' : ''}
        <div class="test-cover-badge">Orange test</div>
        <div class="test-cover-title">IELTS 20</div>
        <div class="test-cover-sub">ACADEMIC TEST ${t.testNumber}</div>
      </div>
      <div class="test-card-body">
        <div class="test-card-name">${t.name}</div>
        <div class="test-card-meta">Reading · 40 câu · 60 phút</div>
        ${lastInfo}
        <button class="btn-do-test" onclick="onClickTest('${t._id}','${t.name}')">
          Làm bài
        </button>
        ${done ? `<button class="btn-redo-test" onclick="onClickReview('${la._id}')">Xem lại</button>` : ''}
      </div>
    </div>
  `;
}

function filterTests(mode) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  let filtered = state.tests;
  if (mode === 'done') filtered = state.tests.filter(t => t.lastAttempt);
  if (mode === 'new') filtered = state.tests.filter(t => !t.lastAttempt);
  renderTestList(filtered);
}

// ══════════════════════════════════════════════════════
// SCREEN 2 – KEY
// ══════════════════════════════════════════════════════
function onClickTest(testId, testName) {
  state.currentTestId = testId;
  document.getElementById('key-test-name').textContent = testName;
  document.getElementById('key-input').value = '';
  hideMsg('key-msg');
  showScreen('key');
  setTimeout(() => document.getElementById('key-input').focus(), 100);
}

function formatKeyInput(input) {
  // Format XXXX-XXXX
  let v = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
  input.value = v;
}

async function verifyAndStart() {
  const key = document.getElementById('key-input').value.trim();
  if (!key || key.length < 9) {
    showMsg('key-msg', 'Vui lòng nhập đủ key (định dạng XXXX-XXXX)', 'error');
    return;
  }

  const btn = document.getElementById('btn-start-key');
  btn.disabled = true; btn.textContent = 'Đang kiểm tra...';

  try {
    const res = await fetch(`${API}/reading/verify-key`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ key, testId: state.currentTestId })
    });
    const data = await res.json();

    if (!data.success) {
      showMsg('key-msg', data.message, 'error');
      btn.disabled = false; btn.textContent = 'Bắt đầu làm bài';
      return;
    }

    showMsg('key-msg', data.message, 'success');
    await startExam(key);
  } catch {
    showMsg('key-msg', 'Lỗi kết nối server', 'error');
    btn.disabled = false; btn.textContent = 'Bắt đầu làm bài';
  }
}

// ══════════════════════════════════════════════════════
// SCREEN 3 – EXAM
// ══════════════════════════════════════════════════════
async function startExam(key) {
  try {
    const res = await fetch(`${API}/reading/start`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ key, testId: state.currentTestId })
    });
    const data = await res.json();
    if (!data.success) { alert(data.message); return; }

    state.attemptId = data.attemptId;
    state.passages = data.passages;
    state.answers = {};
    state.timeLeft = data.duration;
    state.submitted = false;
    state.isReview = false;
    state.passageIdx = 0;

    document.getElementById('exam-title').textContent = data.testName;

    buildPassageTabs('toolbar-passage-tabs', false);
    renderCurrentPassage(false);
    renderQNav(false);
    startTimer();
    setTool('highlight');
    showScreen('exam');

    // Prevent accidental close
    window.onbeforeunload = e => { if (!state.submitted) { e.preventDefault(); e.returnValue = ''; } };
  } catch (err) {
    alert('Lỗi bắt đầu bài thi: ' + err.message);
  }
}

// ── Passage tabs ──
function buildPassageTabs(containerId, isReview) {
  const c = document.getElementById(containerId);
  c.innerHTML = state.passages.map((p, i) => `
    <button class="passage-tab-btn ${i === 0 ? 'active' : ''}"
            onclick="switchPassage(${i}, ${isReview})">
      Passage ${i + 1}
    </button>
  `).join('');
}

function switchPassage(idx, isReview) {
  state.passageIdx = idx;
  const tabsId = isReview ? 'toolbar-passage-tabs-rv' : 'toolbar-passage-tabs';
  document.querySelectorAll(`#${tabsId} .passage-tab-btn`).forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });
  renderCurrentPassage(isReview);
}

// ── Passage text ──
function renderCurrentPassage(isReview) {
  const p = state.passages[state.passageIdx];
  const innerId = isReview ? 'review-passage-inner' : 'passage-inner';
  const el = document.getElementById(innerId);

  el.innerHTML = `
    <div class="passage-title">${p.title}</div>
    <div class="passage-text">${p.content}</div>
  `;

  renderCurrentQuestions(isReview);
}

// ── Questions ──
function renderCurrentQuestions(isReview) {
  const p = state.passages[state.passageIdx];
  const innerId = isReview ? 'review-questions-inner' : 'questions-inner';
  const el = document.getElementById(innerId);

  const rangeText = `Questions ${p.questionRange.start}–${p.questionRange.end}`;
  let html = `<div class="q-section-title">${rangeText}</div>`;

  // Detect drag-drop groups
  let prevType = null;
  let bankRendered = false;

  p.questions.forEach(q => {
    const isDnD = ['sentence-completion', 'matching-headings', 'matching-info'].includes(q.type);

    // Render word bank once per group of DnD questions
    if (isDnD && q.wordBank?.length && (!bankRendered || prevType !== q.type)) {
      html += renderWordBank(q.wordBank, p.questionRange.start, isReview);
      bankRendered = true;
    }
    if (!isDnD) { bankRendered = false; }
    prevType = q.type;

    html += renderQuestion(q, isReview);
  });

  el.innerHTML = html;

  // Restore answers
  p.questions.forEach(q => {
    const saved = state.answers[q.questionNumber];
    if (!saved) return;

    if (['sentence-completion', 'matching-headings', 'matching-info'].includes(q.type)) {
      const dz = el.querySelector(`.drop-zone[data-qnum="${q.questionNumber}"]`);
      if (dz) fillDropZone(dz, saved, isReview ? getCorrectAns(q) : null, isReview);
    } else if (q.type === 'fill-blank') {
      const inp = el.querySelector(`#fi-${q.questionNumber}`);
      if (inp) inp.value = saved;
    } else {
      const opt = el.querySelector(`.radio-opt[data-value="${CSS.escape(saved)}"][data-qnum="${q.questionNumber}"]`);
      if (opt) opt.classList.add('selected');
    }
  });

  // DnD setup
  if (!isReview) setupDragDrop(el);

  // Review: apply correct/wrong styling
  if (isReview) applyReviewStyling(el, p.questions);
}

function getCorrectAns(q) { return q.correctAnswer || ''; }

function renderWordBank(words, startNum, isReview) {
  // In review mode, word bank is static
  const chips = words.map(w => `
    <div class="word-chip ${isReview ? 'used' : ''}"
         data-word="${w}"
         ${isReview ? '' : 'draggable="true"'}>
      ${w}
    </div>
  `).join('');
  return `<div class="word-bank" id="bank-${startNum}">${chips}</div>`;
}

function renderQuestion(q, isReview) {
  const num = q.questionNumber;
  const ua = q.userAnswer || state.answers[num] || '';
  const ca = q.correctAnswer || '';
  const ok = q.isCorrect;

  let inputHtml = '';

  switch (q.type) {
    case 'true-false-ng':
      inputHtml = renderRadioOpts(num, ['TRUE', 'FALSE', 'NOT GIVEN'], ua, ca, isReview);
      break;
    case 'multiple-choice':
      inputHtml = renderRadioOpts(num, q.options || [], ua, ca, isReview);
      break;
    case 'fill-blank':
      inputHtml = renderFillBlank(num, ua, ca, isReview);
      break;
    case 'sentence-completion':
    case 'matching-info':
      inputHtml = renderInlineDropZone(num, q.questionText, ua, ca, isReview);
      break;
    case 'matching-headings':
      inputHtml = renderMatchingHeadings(num, q, ua, ca, isReview);
      break;
    default:
      inputHtml = renderFillBlank(num, ua, ca, isReview);
  }

  const reviewExtra = isReview ? `
    <div class="q-correct-ans ${ok ? 'right' : 'wrong'}">
      ${ok ? '✓ Đúng' : `✗ Sai – Đáp án: <strong>${ca}</strong>`}
    </div>
    ${q.explanation ? `<div class="q-explanation"><strong>Giải thích:</strong> ${q.explanation}</div>` : ''}
  ` : '';

  return `
    <div class="question-item" id="qi-${num}" data-qnum="${num}">
      <div class="q-num-label">
        <span class="q-badge">${num}</span>
        <span>${q.type.replace(/-/g, ' ')}</span>
      </div>
      ${['sentence-completion', 'matching-headings', 'matching-info'].includes(q.type)
      ? '' /* text embedded in drop zone */
      : `<div class="q-text">${q.questionText}</div>`
    }
      ${inputHtml}
      ${reviewExtra}
    </div>
  `;
}

function renderRadioOpts(num, opts, userAns, correctAns, isReview) {
  return `<div class="q-options">` +
    opts.map(opt => {
      let cls = '';
      if (isReview) {
        if (opt === correctAns) cls = 'correct-ans';
        else if (opt === userAns && opt !== correctAns) cls = 'wrong-ans';
      } else {
        if (opt === userAns) cls = 'selected';
      }
      return `
        <div class="radio-opt ${cls}"
             data-qnum="${num}" data-value="${opt}"
             ${isReview ? '' : `onclick="pickRadio(${num}, '${opt}')" `}>
          <span class="radio-dot"></span>
          <label>${opt}</label>
        </div>
      `;
    }).join('') +
    `</div>`;
}

function renderFillBlank(num, userAns, correctAns, isReview) {
  const cls = isReview ? (userAns.toLowerCase().trim() === correctAns.toLowerCase().trim() ? 'correct' : 'incorrect') : '';
  return `<input id="fi-${num}" class="fill-input ${cls}"
    type="text" placeholder="Nhập câu trả lời..."
    value="${userAns}"
    ${isReview ? 'readonly' : `oninput="saveTextAnswer(${num}, this.value)"`}
  />`;
}

// Sentence completion: "___ are important" → drop zone inline
function renderInlineDropZone(num, questionText, userAns, correctAns, isReview) {
  // Replace ___ or [blank] with drop zone
  const dzHtml = `
    <div class="drop-zone ${userAns ? 'filled' : ''} ${isReview ? (userAns.toLowerCase().trim() === correctAns.toLowerCase().trim() ? 'correct-drop' : 'wrong-drop') : ''}"
         data-qnum="${num}"
         ${isReview ? '' : `ondragover="dzDragOver(event)" ondrop="dzDrop(event,${num})" onclick="dzClick(event,${num})"`}>
      ${userAns ? `${userAns}<span class="clear-drop" onclick="clearDz(event,${num})">×</span>` : '&nbsp;&nbsp;&nbsp;'}
    </div>`;

  const filled = questionText.replace(/_{2,}|\[blank\]/i, dzHtml);
  // If question text had no blank marker, put drop zone after text
  const html = filled !== questionText ? filled : `${questionText} ${dzHtml}`;
  return `<div class="q-text">${html}</div>`;
}

function renderMatchingHeadings(num, q, userAns, correctAns, isReview) {
  return `
    <div class="q-text">${q.questionText}</div>
    <div class="matching-item">
      <span class="matching-label">${num}.</span>
      <div class="matching-drop">
        <div class="drop-zone ${userAns ? 'filled' : ''}"
             data-qnum="${num}"
             ${isReview ? '' : `ondragover="dzDragOver(event)" ondrop="dzDrop(event,${num})" onclick="dzClick(event,${num})"`}>
          ${userAns ? `${userAns}<span class="clear-drop" onclick="clearDz(event,${num})">×</span>` : 'Kéo hoặc click để chọn'}
        </div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// DRAG-AND-DROP LOGIC
// ══════════════════════════════════════════════════════
function setupDragDrop(container) {
  // Drag start on word chips
  container.querySelectorAll('.word-chip:not(.used)').forEach(chip => {
    chip.addEventListener('dragstart', e => {
      state.dragItem = chip.dataset.word;
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    chip.addEventListener('dragend', e => {
      chip.classList.remove('dragging');
    });
  });
}

function dzDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function dzDrop(e, qnum) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const word = state.dragItem || e.dataTransfer.getData('text');
  if (!word) return;
  placeAnswer(qnum, word, false);
}

// Click on drop zone → show word picker
function dzClick(e, qnum) {
  if (e.target.classList.contains('clear-drop')) return;
  const p = state.passages[state.passageIdx];
  const q = p.questions.find(q => q.questionNumber === qnum);
  if (!q?.wordBank?.length) return;

  const available = q.wordBank.filter(w => {
    // Word not already used by another question in same passage (except current)
    const usedElsewhere = p.questions
      .filter(qq => qq.questionNumber !== qnum && state.answers[qq.questionNumber] === w)
      .length > 0;
    return !usedElsewhere;
  });

  // Simple picker popup
  const existing = document.getElementById('word-picker');
  if (existing) existing.remove();

  const rect = e.currentTarget.getBoundingClientRect();
  const picker = document.createElement('div');
  picker.id = 'word-picker';
  Object.assign(picker.style, {
    position: 'fixed',
    top: (rect.bottom + 4) + 'px',
    left: rect.left + 'px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,.15)',
    zIndex: '500',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    maxWidth: '280px'
  });

  available.forEach(w => {
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.textContent = w;
    chip.onclick = () => { placeAnswer(qnum, w, false); picker.remove(); };
    picker.appendChild(chip);
  });

  if (!available.length) {
    picker.innerHTML = '<span style="color:#9ca3af;font-size:13px">Không còn từ khả dụng</span>';
  }

  document.body.appendChild(picker);
  setTimeout(() => document.addEventListener('click', function closeP(ev) {
    if (!picker.contains(ev.target)) { picker.remove(); document.removeEventListener('click', closeP); }
  }), 0);
}

function clearDz(e, qnum) {
  e.stopPropagation();
  delete state.answers[qnum];
  renderCurrentQuestions(false);
  updateQNav();
}

function placeAnswer(qnum, word, isReview) {
  state.answers[qnum] = word;
  // Re-render questions to reflect new state
  renderCurrentQuestions(isReview);
  updateQNav();
  state.dragItem = null;
}

function fillDropZone(dz, value, correctAns, isReview) {
  dz.classList.add('filled');
  if (isReview && correctAns) {
    dz.classList.add(value.toLowerCase() === correctAns.toLowerCase() ? 'correct-drop' : 'wrong-drop');
  }
  dz.innerHTML = `${value}<span class="clear-drop" ${isReview ? '' : `onclick="clearDz(event,${dz.dataset.qnum})"`}>×</span>`;
}

// ══════════════════════════════════════════════════════
// ANSWER HANDLERS
// ══════════════════════════════════════════════════════
function pickRadio(qnum, value) {
  state.answers[qnum] = value;

  const qi = document.getElementById(`qi-${qnum}`);
  qi?.querySelectorAll('.radio-opt').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.value === value);
  });
  updateQNav();
}

function saveTextAnswer(qnum, value) {
  state.answers[qnum] = value.trim();
  updateQNav();
}

// ══════════════════════════════════════════════════════
// QUESTION NAV
// ══════════════════════════════════════════════════════
function renderQNav(isReview) {
  const navId = isReview ? 'review-q-nav' : 'q-nav-scroll';
  const nav = document.getElementById(navId);
  const allQs = state.passages.flatMap(p => p.questions);

  nav.innerHTML = allQs.map(q => {
    const num = q.questionNumber;
    let cls = '';
    if (isReview) {
      cls = q.isCorrect ? 'correct' : (q.userAnswer ? 'wrong' : 'skipped');
    } else {
      cls = state.answers[num] ? 'answered' : '';
    }
    return `<button class="q-nav-btn ${cls}" id="qnb-${num}"
              onclick="scrollToQuestion(${num})">${num}</button>`;
  }).join('');
}

function updateQNav() {
  const allQs = state.passages.flatMap(p => p.questions);
  allQs.forEach(q => {
    const btn = document.getElementById(`qnb-${q.questionNumber}`);
    if (!btn) return;
    btn.className = `q-nav-btn ${state.answers[q.questionNumber] ? 'answered' : ''}`;
  });
}

function scrollToQuestion(num) {
  const el = document.getElementById(`qi-${num}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ══════════════════════════════════════════════════════
// TIMER
// ══════════════════════════════════════════════════════
function startTimer() {
  clearInterval(state.timer);
  updateTimerDisplay();
  state.timer = setInterval(() => {
    if (state.submitted) return;
    state.timeLeft--;
    updateTimerDisplay();

    const timerEl = document.getElementById('exam-timer');
    if (state.timeLeft <= 300 && state.timeLeft > 60) timerEl.className = 'exam-timer warn';
    if (state.timeLeft <= 60) timerEl.className = 'exam-timer danger';

    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      alert('Hết giờ! Bài thi sẽ được nộp tự động.');
      submitExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const h = Math.floor(state.timeLeft / 3600);
  const m = Math.floor((state.timeLeft % 3600) / 60);
  const s = state.timeLeft % 60;
  document.getElementById('timer-display').textContent =
    `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

// ══════════════════════════════════════════════════════
// SUBMIT
// ══════════════════════════════════════════════════════
function confirmSubmit() { openModal('modal-submit'); }

async function submitExam() {
  closeModal('modal-submit');
  if (state.submitted) return;
  state.submitted = true;
  clearInterval(state.timer);
  window.onbeforeunload = null;

  try {
    const res = await fetch(`${API}/reading/submit`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ attemptId: state.attemptId, answers: state.answers })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const r = data.result;
    document.getElementById('result-band').textContent = r.bandScore.toFixed(1);
    document.getElementById('result-total').textContent = `${r.correctCount}/${r.totalQuestions} câu đúng`;
    document.getElementById('r-correct').textContent = r.correctCount;
    document.getElementById('r-wrong').textContent = r.wrongCount;
    document.getElementById('r-skip').textContent = r.skippedCount;
    document.getElementById('result-msg').textContent = getBandMessage(r.bandScore);

    showScreen('result');
  } catch (err) {
    alert('Lỗi nộp bài: ' + err.message);
    state.submitted = false;
  }
}

function getBandMessage(band) {
  if (band >= 7.5) return 'Xuất sắc! Bạn đã đạt kết quả rất tốt 🎉';
  if (band >= 6.5) return 'Tốt lắm! Hãy tiếp tục luyện tập để đạt band cao hơn 💪';
  if (band >= 5.5) return 'Tiếp tục cố gắng nhé! Bạn đang tiến bộ rõ rệt 📚';
  return 'Đề IELTS hơi khó bạn nhỉ, mình cố tiếp cùng nhau nha, từ từ sẽ giỏi thôi!';
}

// ══════════════════════════════════════════════════════
// REVIEW
// ══════════════════════════════════════════════════════
async function goToReview() {
  try {
    const res = await fetch(`${API}/reading/attempt/${state.attemptId}/review`, { headers: authHeader() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const a = data.attempt;
    state.passages = a.passages;
    state.isReview = true;
    state.passageIdx = 0;

    document.getElementById('review-title').textContent = a.testName;
    document.getElementById('review-band-badge').textContent = `Band Score: ${a.bandScore.toFixed(1)}`;

    buildPassageTabs('toolbar-passage-tabs-rv', true);
    renderCurrentPassage(true);
    renderQNav(true);
    setupDictionaryDouble('review-passage-inner');
    showScreen('review');
  } catch (err) {
    alert('Lỗi tải bài review: ' + err.message);
  }
}

async function onClickReview(attemptId) {
  state.attemptId = attemptId;
  await goToReview();
}

function applyReviewStyling(container, questions) {
  // Nav buttons already coloured in renderQNav
  // Fill inputs and radio opts already have correct/wrong classes from renderQuestion
}

// ══════════════════════════════════════════════════════
// HIGHLIGHT
// ══════════════════════════════════════════════════════
function setupHighlight() {
  document.addEventListener('mouseup', () => {
    if (state.tool !== 'highlight') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    // Only inside passage panels
    const passageEl = document.getElementById('passage-inner') ||
      document.getElementById('review-passage-inner');
    if (!passageEl || !passageEl.contains(range.commonAncestorContainer)) return;

    const span = document.createElement('span');
    span.className = 'hl';
    try { range.surroundContents(span); } catch { }
    sel.removeAllRanges();
  });
}

// ══════════════════════════════════════════════════════
// DICTIONARY (review only – double-click)
// ══════════════════════════════════════════════════════
function setupDictionaryDouble(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.addEventListener('dblclick', async () => {
    if (state.tool !== 'dict') return;
    const word = window.getSelection()?.toString().trim();
    if (!word || word.includes(' ') || word.length < 2) return;
    await lookupWord(word);
  });
}

async function lookupWord(word) {
  const popup = document.getElementById('dict-popup');
  document.getElementById('dict-word').textContent = word;
  document.getElementById('dict-phonetic').textContent = '...';
  document.getElementById('dict-pos').textContent = '';
  document.getElementById('dict-meaning').textContent = 'Đang tra...';
  document.getElementById('dict-example').textContent = '';
  document.getElementById('dict-vn').textContent = '';

  // Position near cursor
  const sel = window.getSelection();
  const rect = sel?.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : { bottom: 200, left: 200 };
  popup.style.top = Math.min(rect.bottom + 8, window.innerHeight - 260) + 'px';
  popup.style.left = Math.min(rect.left, window.innerWidth - 320) + 'px';
  popup.classList.remove('hidden');

  state.dictWord = word;
  state.dictMeaning = '';
  state.dictExample = '';

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    const data = await res.json();
    const entry = data[0];
    const meaning = entry.meanings[0];
    const def = meaning.definitions[0];

    document.getElementById('dict-phonetic').textContent = entry.phonetic || '';
    document.getElementById('dict-pos').textContent = meaning.partOfSpeech;
    document.getElementById('dict-meaning').textContent = def.definition;
    document.getElementById('dict-example').textContent = def.example ? `"${def.example}"` : '';

    state.dictMeaning = def.definition;
    state.dictExample = def.example || '';
  } catch {
    document.getElementById('dict-meaning').textContent = 'Không tìm thấy định nghĩa.';
  }
}

function closeDictPopup() { document.getElementById('dict-popup').classList.add('hidden'); }

// Phát âm từ trong dict popup
function speakDictWord() {
  if (!state.dictWord) return;
  const u = new SpeechSynthesisUtterance(state.dictWord);
  u.lang = 'en-US'; u.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// Mở modal chọn sổ (dùng lại modal từ dashboard)
async function saveVocab() {
  if (!state.dictWord) return;
  closeDictPopup();

  // Nếu đang trong dashboard context thì dùng trực tiếp
  if (window.openSaveWordModal) {
    window.openSaveWordModal({
      word: state.dictWord,
      meaning: state.dictMeaning,
      example: state.dictExample,
      phonetic: document.getElementById('dict-phonetic')?.textContent || '',
      source: 'reading'
    });
    return;
  }

  // Fallback: gọi API trực tiếp nếu không có dashboard
  try {
    const res = await fetch(`${API}/vocabbook`, { headers: authHeader() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    openBookPickerModal(data.books);
  } catch (err) {
    alert('Lỗi tải danh sách sổ: ' + err.message);
  }
}

function openBookPickerModal(books) {
  // Tạo modal chọn sổ inline
  const existing = document.getElementById('reading-book-picker');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'reading-book-picker';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(3px)';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(460px,95%);box-shadow:0 8px 32px rgba(0,0,0,.15);overflow:hidden">
      <div style="padding:18px 22px 0;display:flex;align-items:center;justify-content:space-between">
        <div>
          <h3 style="font-size:16px;font-weight:700;margin-bottom:2px">Lưu vào sổ từ vựng</h3>
          <div style="font-size:13px;color:#6b7280">
            <strong style="color:#111">${state.dictWord}</strong>
            ${document.getElementById('dict-phonetic')?.textContent ? `<span style="font-family:monospace;color:#9ca3af;margin-left:6px">${document.getElementById('dict-phonetic').textContent}</span>` : ''}
          </div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px">${state.dictMeaning}</div>
        </div>
        <button onclick="document.getElementById('reading-book-picker').remove()"
          style="background:none;border:none;font-size:20px;cursor:pointer;color:#9ca3af;padding:4px">×</button>
      </div>

      <div style="padding:14px 22px;max-height:280px;overflow-y:auto">
        <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Chọn sổ</div>
        ${books.map(b => `
          <div onclick="pickBookAndSave('${b._id}', this)"
            style="display:flex;align-items:center;gap:12px;padding:11px 13px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;margin-bottom:8px;transition:all .15s"
            onmouseover="this.style.borderColor='#3d8bff';this.style.background='#eff6ff'"
            onmouseout="this.style.borderColor='#e5e7eb';this.style.background='#fff'"
            id="bpick-${b._id}">
            <span style="font-size:20px">${b.emoji}</span>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px">${b.name}</div>
              <div style="font-size:12px;color:#9ca3af">${b.totalWords} từ</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="padding:10px 22px 18px;border-top:1px solid #e5e7eb">
        <label style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px">Ghi chú (tuỳ chọn)</label>
        <input id="reading-save-note" placeholder="VD: gặp trong bài Reading tháng 3..."
          style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;font-family:inherit"
          onfocus="this.style.borderColor='#3d8bff'" onblur="this.style.borderColor='#e5e7eb'"/>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  // Click outside to close
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

async function pickBookAndSave(bookId, el) {
  // Visual feedback
  document.querySelectorAll('[id^="bpick-"]').forEach(el => {
    el.style.borderColor = '#e5e7eb';
    el.style.background = '#fff';
  });
  el.style.borderColor = '#e53935';
  el.style.background = '#fef2f2';

  const note = document.getElementById('reading-save-note')?.value.trim() || '';

  try {
    const res = await fetch(`${API}/vocabbook/${bookId}/words`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({
        word: state.dictWord,
        meaning: state.dictMeaning,
        example: state.dictExample,
        phonetic: document.getElementById('dict-phonetic')?.textContent || '',
        source: 'reading',
        note
      })
    });
    const data = await res.json();

    document.getElementById('reading-book-picker')?.remove();

    // Toast thông báo
    showReadingToast(data.message || (data.success ? 'Đã lưu từ!' : 'Lỗi lưu từ'), data.success);
  } catch (err) {
    showReadingToast('Lỗi kết nối: ' + err.message, false);
  }
}

function showReadingToast(msg, success = true) {
  const existing = document.getElementById('reading-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'reading-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:11px 18px;border-radius:10px;font-size:13px;font-weight:500;
    color:#fff;background:${success ? '#166534' : '#991b1b'};
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    animation:slideUp .25s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

window.speakDictWord = speakDictWord;
window.pickBookAndSave = pickBookAndSave;

// ══════════════════════════════════════════════════════
// TOOL SWITCHER
// ══════════════════════════════════════════════════════
function setTool(tool) {
  state.tool = tool;

  // Update all tool buttons on current screen
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  if (tool === 'highlight') {
    document.querySelectorAll('#tool-hl, #tool-hl-rv').forEach(b => b?.classList.add('active'));
  } else if (tool === 'dict') {
    document.getElementById('tool-dict')?.classList.add('active');
  }
}

// ══════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════
function toggleSettings() {
  const p = document.getElementById('settings-panel');
  p.classList.toggle('hidden');
}

function toggleEyeProtection() {
  document.body.classList.toggle('eye-protection');
}

function setFontSize(size) {
  const map = { S: '13px', M: '15px', L: '17px' };
  document.documentElement.style.setProperty('--reading-font-size', map[size]);
  document.querySelectorAll('.fs-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === size);
  });
}

// ══════════════════════════════════════════════════════
// RESIZABLE SPLITTER
// ══════════════════════════════════════════════════════
function setupResizableSplitter(splitId, dividerId, leftId) {
  const split = document.getElementById(splitId);
  const divider = document.getElementById(dividerId);
  const left = document.getElementById(leftId);
  if (!split || !divider || !left) return;

  let dragging = false;

  divider.addEventListener('mousedown', e => {
    dragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const splitRect = split.getBoundingClientRect();
    let pct = ((e.clientX - splitRect.left) / splitRect.width) * 100;
    pct = Math.min(Math.max(pct, 20), 80);
    left.style.width = pct + '%';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  // Touch support
  divider.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const touch = e.touches[0];
    const splitRect = split.getBoundingClientRect();
    let pct = ((touch.clientX - splitRect.left) / splitRect.width) * 100;
    pct = Math.min(Math.max(pct, 20), 80);
    left.style.width = pct + '%';
  }, { passive: false });
  document.addEventListener('touchend', () => { dragging = false; });
}

// ══════════════════════════════════════════════════════
// HISTORY MODAL
// ══════════════════════════════════════════════════════
async function showHistoryModal() {
  try {
    const res = await fetch(`${API}/reading/history`, { headers: authHeader() });
    const data = await res.json();

    const tbody = document.getElementById('history-tbody');
    if (!data.history.length) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#9ca3af;padding:20px">Chưa có lịch sử làm bài</td></tr>';
    } else {
      tbody.innerHTML = data.history.map(h => `
        <tr>
          <td>${h.testId?.name || '–'}</td>
          <td>${formatDate(h.endTime)}</td>
          <td>${formatDuration(h.duration)}</td>
          <td>${h.totalQuestions}</td>
          <td style="color:#43a047;font-weight:600">${h.correctCount}</td>
          <td style="color:#e53935;font-weight:600">${h.wrongCount}</td>
          <td style="color:#9ca3af">${h.skippedCount}</td>
          <td class="band-cell">${h.bandScore?.toFixed(1)}</td>
          <td><button class="btn-review-sm" onclick="onClickReview('${h._id}');closeModal('modal-history')">Xem lại</button></td>
        </tr>
      `).join('');
    }

    openModal('modal-history');
  } catch (err) {
    alert('Lỗi tải lịch sử: ' + err.message);
  }
}

// ══════════════════════════════════════════════════════
// EXIT
// ══════════════════════════════════════════════════════
function confirmExit() { openModal('modal-exit'); }

function forceExit() {
  closeModal('modal-exit');
  clearInterval(state.timer);
  window.onbeforeunload = null;
  state.submitted = true;
  showScreen('list');
}

// ══════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════
function formatDate(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(secs) {
  if (!secs) return '–';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m${pad(s)}s`;
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `key-msg ${type}`;
  el.classList.remove('hidden');
}

function hideMsg(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('hidden'); el.textContent = ''; }
}

// Hiển thị tên user + logout
(function initNav() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user.firstName ? `${user.firstName} ${user.lastName}` : user.username || '';
  const el = document.getElementById('userName');
  if (el && name) el.textContent = `👋 ${name}`;
})();

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
window.logout = logout;

// Global exports for HTML onclick
window.showScreen = showScreen;
window.openModal = openModal;
window.closeModal = closeModal;
window.onClickTest = onClickTest;
window.onClickReview = onClickReview;
window.verifyAndStart = verifyAndStart;
window.formatKeyInput = formatKeyInput;
window.filterTests = filterTests;
window.confirmSubmit = confirmSubmit;
window.submitExam = submitExam;
window.confirmExit = confirmExit;
window.forceExit = forceExit;
window.goToReview = goToReview;
window.showHistoryModal = showHistoryModal;
window.toggleSettings = toggleSettings;
window.toggleEyeProtection = toggleEyeProtection;
window.setFontSize = setFontSize;
window.setTool = setTool;
window.pickRadio = pickRadio;
window.saveTextAnswer = saveTextAnswer;
window.dzDragOver = dzDragOver;
window.dzDrop = dzDrop;
window.dzClick = dzClick;
window.clearDz = clearDz;
window.scrollToQuestion = scrollToQuestion;
window.switchPassage = switchPassage;
window.closeDictPopup = closeDictPopup;
window.saveVocab = saveVocab;