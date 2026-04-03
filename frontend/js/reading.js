/* ═══════════════════════════════════════════════════════════════════════
   frontend/js/reading.js  –  EnglishWithDan Reading Module
   Supports: questionGroups (table, note-form, bullet-list, map,
             matching-options, plain) + legacy questions[] flat array
═══════════════════════════════════════════════════════════════════════ */

const API = 'https://englishwithdan.onrender.com/api';   // backend on Render
const DURATION = 3600;  // 60 min in seconds

/* ── State ─────────────────────────────────────────────────────────── */
const state = {
  passages: [],          // passages for current exam
  attemptId: null,
  testId: null,
  testName: '',
  answers: {},           // { questionNumber: value }
  timer: null,
  secondsLeft: DURATION,
  currentPassageIdx: 0,
  tool: 'highlight',     // 'highlight' | 'dict'
  isReview: false,
  submitted: false,
  reviewData: null,
};

let allTests = [];

/* ══════════════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  const userName = localStorage.getItem('userName') || 'bạn';
  const el = document.getElementById('userName');
  if (el) el.textContent = `👋 ${userName}`;

  initDividerDrag('split-divider', 'split-passage', 'split-questions');
  initDividerDrag('review-divider', 'review-passage', 'review-questions');
  document.addEventListener('keydown', handleKeyShortcuts);

  // Check if arriving from history (attemptId in URL)
  const params = new URLSearchParams(location.search);
  const reviewId = params.get('review');
  if (reviewId) { await loadReview(reviewId); return; }

  await loadTests();
});

/* ══════════════════════════════════════════════════════════════════════
   SCREEN HELPERS
══════════════════════════════════════════════════════════════════════ */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const el = document.getElementById(`screen-${name}`);
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 1 – TEST LIST
══════════════════════════════════════════════════════════════════════ */
async function loadTests() {
  showScreen('list');
  const wrap = document.getElementById('tests-wrapper');
  wrap.innerHTML = '<div class="loading-spinner">Đang tải danh sách đề thi...</div>';
  try {
    const res = await apiFetch('/api/reading/tests');
    allTests = res.tests || [];
    renderTestList(allTests);
  } catch (e) {
    wrap.innerHTML = `<div class="loading-spinner" style="color:#e53935">Lỗi tải dữ liệu</div>`;
  }
}

function renderTestList(tests) {
  const wrap = document.getElementById('tests-wrapper');
  if (!tests.length) {
    wrap.innerHTML = '<div class="loading-spinner">Chưa có bộ đề nào</div>';
    return;
  }
  // Group by testNumber range
  const groups = {};
  tests.forEach(t => {
    const g = Math.ceil(t.testNumber / 5) * 5;
    if (!groups[g]) groups[g] = [];
    groups[g].push(t);
  });
  let html = '';
  for (const g of Object.keys(groups).sort((a, b) => a - b)) {
    const arr = groups[g];
    const done = arr.filter(t => t.lastAttempt).length;
    html += `<div class="test-group">
      <div class="test-group-title">
        Bộ đề <span class="test-group-progress">${done}/${arr.length} đã làm</span>
        <div class="progress-bar-mini"><div class="progress-bar-mini-fill" style="width:${Math.round(done / arr.length * 100)}%"></div></div>
      </div>
      <div class="test-grid">
        ${arr.map(testCard).join('')}
      </div>
    </div>`;
  }
  wrap.innerHTML = html;
}

function testCard(t) {
  const done = !!t.lastAttempt;
  const band = t.lastAttempt?.bandScore?.toFixed(1) || '';
  const cor = t.lastAttempt?.correctCount ?? '';
  const tot = t.lastAttempt?.totalQuestions ?? '';
  return `<div class="test-card" id="tcard-${t._id}" data-done="${done}">
    <div class="test-card-cover">
      <div class="test-cover-badge">IELTS</div>
      <div class="test-cover-title">Test ${t.testNumber}</div>
      <div class="test-cover-sub">Reading Full</div>
      ${done ? `<div class="test-done-tick">✓</div>` : ''}
    </div>
    <div class="test-card-body">
      <div class="test-card-name">${escHtml(t.name)}</div>
      <div class="test-card-meta">40 câu · 60 phút</div>
      ${done ? `<div class="test-card-last">Lần cuối: <span class="band-mini">${band}</span> · ${cor}/${tot} câu</div>` : ''}
      <button class="btn-do-test" onclick="goToKey('${t._id}','${escHtml(t.name)}')">
        ${done ? 'Làm lại' : 'Bắt đầu'}
      </button>
      ${done ? `<button class="btn-redo-test" onclick="loadReviewByTest('${t._id}')">Xem lại kết quả</button>` : ''}
    </div>
  </div>`;
}

function filterTests(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('.test-card');
  cards.forEach(c => {
    const done = c.dataset.done === 'true';
    if (filter === 'all') c.style.display = '';
    else if (filter === 'done') c.style.display = done ? '' : 'none';
    else c.style.display = !done ? '' : 'none';
  });
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 2 – KEY
══════════════════════════════════════════════════════════════════════ */
function goToKey(testId, testName) {
  state.testId = testId;
  state.testName = testName;
  document.getElementById('key-test-name').textContent = testName;
  document.getElementById('key-input').value = '';
  const msg = document.getElementById('key-msg');
  msg.textContent = ''; msg.className = 'key-msg hidden';
  showScreen('key');
}

function formatKeyInput(inp) {
  let v = inp.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
  inp.value = v;
}

async function verifyAndStart() {
  const key = document.getElementById('key-input').value.trim();
  const btn = document.getElementById('btn-start-key');
  const msg = document.getElementById('key-msg');
  if (!key) { showMsg(msg, 'Vui lòng nhập mã truy cập', 'error'); return; }
  btn.disabled = true; btn.textContent = 'Đang xác thực...';
  try {
    const res = await apiFetch('/api/reading/start', {
      method: 'POST',
      body: JSON.stringify({ key, testId: state.testId })
    });
    if (!res.success) { showMsg(msg, res.message, 'error'); return; }
    startExam(res);
  } catch (e) {
    showMsg(msg, 'Lỗi kết nối server', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Bắt đầu làm bài';
  }
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `key-msg ${type}`;
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 3 – EXAM
══════════════════════════════════════════════════════════════════════ */
function startExam(data) {
  state.passages = data.passages;
  state.attemptId = data.attemptId;
  state.testName = data.testName;
  state.answers = {};
  state.secondsLeft = data.duration || DURATION;
  state.currentPassageIdx = 0;
  state.isReview = false;
  state.submitted = false;

  document.getElementById('exam-title').textContent = state.testName;
  renderPassageTabs('toolbar-passage-tabs', false);
  switchPassage(0);
  buildQNavFooter();
  startTimer();
  showScreen('exam');
}

function renderPassageTabs(containerId, isReview) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = state.passages.map((p, i) => `
    <button class="passage-tab-btn ${i === state.currentPassageIdx ? 'active' : ''}"
      onclick="${isReview ? `switchReviewPassage(${i})` : `switchPassage(${i})`}">
      ${p.category?.replace('passage', 'P') || `P${i + 1}`}
    </button>`).join('');
}

function switchPassage(idx) {
  state.currentPassageIdx = idx;
  const p = state.passages[idx];
  if (!p) return;

  // Passage text
  document.getElementById('passage-inner').innerHTML =
    `<div class="passage-title">${escHtml(p.title)}</div>
     <div class="passage-text">${p.content || ''}</div>`;

  // Questions
  document.getElementById('questions-inner').innerHTML =
    renderPassageQuestions(p, false);

  // Restore existing answers
  restoreAnswers(false);
  updateQNavFooter();

  // Update tabs
  renderPassageTabs('toolbar-passage-tabs', false);
  initDropZones();
}

/* ── Render questions for a passage ──────────────────────────────── */
function renderPassageQuestions(passage, isReview, reviewMap = {}) {
  let html = '';
  const groups = getAllGroupsFromPassage(passage);
  for (const group of groups) {
    html += renderQuestionGroup(group, isReview, reviewMap);
  }
  return html;
}

/* ── getAllGroupsFromPassage: supports both questionGroups[] and legacy questions[] ── */
function getAllGroupsFromPassage(passage) {
  if (passage.questionGroups?.length) return passage.questionGroups;
  // Legacy: wrap flat questions in a single plain group
  if (passage.questions?.length) {
    return [{ groupType: 'plain', groupTitle: '', instruction: '', questions: passage.questions }];
  }
  return [];
}

/* ── getAllQuestionsFromPassage: flat list for answer collection ── */
function getAllQuestionsFromPassage(passage) {
  if (passage.questionGroups?.length) {
    return passage.questionGroups.flatMap(g => g.questions || []);
  }
  return passage.questions || [];
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTION GROUP RENDERER
══════════════════════════════════════════════════════════════════════ */
function renderQuestionGroup(group, isReview, reviewMap = {}) {
  const { groupType = 'plain', groupTitle = '', instruction = '', questions = [] } = group;

  let headerHtml = '';
  if (groupTitle) headerHtml += `<div class="q-group-title">${escHtml(groupTitle)}</div>`;
  if (instruction) headerHtml += `<div class="q-section-instruction">${escHtml(instruction)}</div>`;

  let bodyHtml = '';
  switch (groupType) {
    case 'table': bodyHtml = renderTableGroup(group, isReview, reviewMap); break;
    case 'note-form': bodyHtml = renderNoteFormGroup(group, isReview, reviewMap); break;
    case 'bullet-list': bodyHtml = renderBulletListGroup(group, isReview, reviewMap); break;
    case 'map': bodyHtml = renderMapGroup(group, isReview, reviewMap); break;
    case 'matching-options': bodyHtml = renderMatchingOptionsGroup(group, isReview, reviewMap); break;
    default: bodyHtml = renderPlainGroup(questions, isReview, reviewMap); break;
  }

  return `<div class="question-group">${headerHtml}${bodyHtml}</div>`;
}

/* ── PLAIN ────────────────────────────────────────────────────────── */
function renderPlainGroup(questions, isReview, reviewMap) {
  return questions.map(q => renderSingleQuestion(q, isReview, reviewMap)).join('');
}

/* ── TABLE ────────────────────────────────────────────────────────── */
function renderTableGroup(group, isReview, reviewMap) {
  const { tableConfig = {}, questions = [] } = group;
  const headers = tableConfig.headers || [];
  const rows = tableConfig.rows || [];

  const qMap = {};
  questions.forEach(q => { qMap[q.questionNumber] = q; });

  const thead = headers.length
    ? `<thead><tr>${headers.map(h => `<th>${escHtml(h)}</th>`).join('')}</tr></thead>`
    : '';

  const tbody = rows.map(row =>
    `<tr>${row.map(cell => `<td>${resolvePlaceholders(cell, qMap, isReview, reviewMap)}</td>`).join('')}</tr>`
  ).join('');

  return `<div class="rq-table-wrap"><table class="rq-table">${thead}<tbody>${tbody}</tbody></table></div>`;
}

/* ── NOTE FORM ────────────────────────────────────────────────────── */
function renderNoteFormGroup(group, isReview, reviewMap) {
  const { noteConfig = {}, questions = [] } = group;
  const title = noteConfig.title || '';
  const lines = noteConfig.lines || [];

  const qMap = {};
  questions.forEach(q => { qMap[q.questionNumber] = q; });

  const titleHtml = title ? `<div class="rq-note-title">${escHtml(title)}</div>` : '';
  const linesHtml = lines.map(line =>
    `<div class="rq-note-line">${resolvePlaceholders(line, qMap, isReview, reviewMap)}</div>`
  ).join('');

  return `<div class="rq-note-form">${titleHtml}<div class="rq-note-body">${linesHtml}</div></div>`;
}

/* ── BULLET LIST ──────────────────────────────────────────────────── */
function renderBulletListGroup(group, isReview, reviewMap) {
  const { bulletConfig = {}, questions = [] } = group;
  const items = bulletConfig.items || [];

  const qMap = {};
  questions.forEach(q => { qMap[q.questionNumber] = q; });

  const itemsHtml = items.map(item =>
    `<li class="rq-bullet-item">${resolvePlaceholders(item, qMap, isReview, reviewMap)}</li>`
  ).join('');

  return `<div class="rq-bullet-list"><ul>${itemsHtml}</ul></div>`;
}

/* ── MAP ──────────────────────────────────────────────────────────── */
function renderMapGroup(group, isReview, reviewMap) {
  const { imageUrl = '', questions = [] } = group;
  const imgHtml = imageUrl
    ? `<div class="rq-map-img-wrap"><img class="rq-map-img" src="${escHtml(imageUrl)}" alt="Map/Diagram" /></div>`
    : '';
  const questionsHtml = questions.map(q => renderSingleQuestion(q, isReview, reviewMap)).join('');
  return `<div class="rq-map-group">${imgHtml}<div class="rq-map-questions">${questionsHtml}</div></div>`;
}

/* ── MATCHING OPTIONS ─────────────────────────────────────────────── */
function renderMatchingOptionsGroup(group, isReview, reviewMap) {
  const { matchingOptions = [], matchingReuseAllowed = false, questions = [] } = group;

  // Build option letters
  const optLetters = matchingOptions.map((opt, i) => String.fromCharCode(65 + i));

  // Question rows with dropdown
  const qRowsHtml = questions.map(q => {
    const qNum = q.questionNumber;
    const review = reviewMap[qNum];
    const userAns = review ? review.userAnswer : (state.answers[qNum] || '');

    let control = '';
    if (isReview) {
      const isCorrect = review?.isCorrect;
      const badgeClass = isCorrect ? 'match-ans-correct' : 'match-ans-wrong';
      control = `
        <div class="match-q-right">
          <span class="match-answer-badge ${badgeClass}">${escHtml(userAns || '–')}</span>
          ${!isCorrect ? `<span class="match-correct-ans">✓ ${escHtml(review?.correctAnswer || '')}</span>` : ''}
        </div>`;
    } else {
      const opts = optLetters.map(l =>
        `<option value="${l}" ${userAns === l ? 'selected' : ''}>${l}</option>`
      ).join('');
      control = `
        <div class="match-q-right">
          <select class="match-select" data-qnum="${qNum}"
                  onchange="pickMatchAnswer(${qNum},this.value)">
            <option value="">–</option>
            ${opts}
          </select>
        </div>`;
    }

    const feedbackHtml = isReview && review?.explanation
      ? `<div class="match-feedback q-explanation">${escHtml(review.explanation)}</div>` : '';

    return `<div class="match-question-row" id="q${qNum}" data-qnum="${qNum}">
      <div class="match-q-left">
        <span class="match-q-num">${qNum}</span>
        <span class="match-q-text">${escHtml(q.questionText || '')}</span>
      </div>
      ${control}
      ${feedbackHtml}
    </div>`;
  }).join('');

  // Options panel
  const reuseNote = matchingReuseAllowed
    ? `<div class="match-reuse-note">NB: You may use any letter more than once.</div>` : '';
  const optListHtml = matchingOptions.map((opt, i) =>
    `<div class="match-option-item">
      <span class="match-option-letter">${optLetters[i]}.</span>
      <span class="match-option-text">${escHtml(opt)}</span>
    </div>`
  ).join('');

  return `<div class="matching-group-wrap">
    ${qRowsHtml}
    <div class="match-options-panel">
      <div class="match-options-label">Options</div>
      ${reuseNote}
      <div class="match-options-grid">${optListHtml}</div>
    </div>
  </div>`;
}

/* ── SINGLE QUESTION (plain / map inner) ──────────────────────────── */
function renderSingleQuestion(q, isReview, reviewMap) {
  const { questionNumber: qNum, type, questionText, options = [], wordBank = [] } = q;
  const review = reviewMap[qNum];

  let inputHtml = '';

  if (type === 'true-false-ng') {
    inputHtml = renderTFNG(qNum, isReview, review);
  } else if (type === 'multiple-choice') {
    inputHtml = renderMC(qNum, options, isReview, review);
  } else if (type === 'checkbox') {
    inputHtml = renderCheckbox(q, isReview, review);
  } else if (type === 'fill-blank' || type === 'sentence-completion' || type === 'map-labelling' || type === 'matching-headings' || type === 'matching-info') {
    if (wordBank?.length) {
      inputHtml = renderWordBank(qNum, wordBank, isReview, review);
    } else {
      inputHtml = renderFillBlank(qNum, isReview, review);
    }
  } else {
    inputHtml = renderFillBlank(qNum, isReview, review);
  }

  // Individual map image (map-labelling with per-question image)
  const imgHtml = (type === 'map-labelling' && q.imageUrl)
    ? `<div class="map-img-wrap"><img class="map-img" src="${escHtml(q.imageUrl)}" /></div>` : '';

  const reviewFeedback = isReview && review
    ? `<div class="q-correct-ans ${review.isCorrect ? 'right' : 'wrong'}">
        ${review.isCorrect ? '✓ Đúng' : `✗ Sai — Đáp án: <strong>${escHtml(review.correctAnswer)}</strong>`}
       </div>
       ${review.explanation ? `<div class="q-explanation"><strong>Giải thích:</strong> ${escHtml(review.explanation)}</div>` : ''}` : '';

  return `<div class="question-item" id="q${qNum}" data-qnum="${qNum}">
    <div class="q-num-label"><span class="q-badge">${qNum}</span></div>
    <div class="q-text">${escHtml(questionText || '')}</div>
    ${imgHtml}
    ${inputHtml}
    ${reviewFeedback}
  </div>`;
}

/* ── True/False/NG ────────────────────────────────────────────────── */
function renderTFNG(qNum, isReview, review) {
  const chosen = review ? review.userAnswer?.toUpperCase() : (state.answers[qNum] || '');
  const labels = ['TRUE', 'FALSE', 'NOT GIVEN'];
  if (isReview) {
    return `<div class="tfng-opts">${labels.map(l => {
      let cls = '';
      if (l === chosen && review?.isCorrect) cls = 'correct-ans';
      else if (l === chosen && !review?.isCorrect) cls = 'wrong-ans';
      else if (l === review?.correctAnswer?.toUpperCase() && !review?.isCorrect) cls = 'correct-ans';
      return `<div class="tfng-opt ${cls}">${l}</div>`;
    }).join('')}</div>`;
  }
  return `<div class="tfng-opts">${labels.map(l =>
    `<div class="tfng-opt ${chosen === l ? 'selected' : ''}"
          onclick="pickTFNG(${qNum},'${l}',this)">${l}</div>`
  ).join('')}</div>`;
}

/* ── Multiple Choice ──────────────────────────────────────────────── */
function renderMC(qNum, options, isReview, review) {
  const chosen = review ? review.userAnswer : (state.answers[qNum] || '');
  const letters = ['A', 'B', 'C', 'D', 'E'];
  if (isReview) {
    return `<div class="q-options">${options.map((opt, i) => {
      const l = letters[i];
      let cls = '';
      if (l === chosen && review?.isCorrect) cls = 'correct-ans';
      else if (l === chosen) cls = 'wrong-ans';
      else if (l === review?.correctAnswer) cls = 'correct-ans';
      return `<label class="radio-opt ${cls}">
        <span class="radio-dot"></span>
        <span class="radio-letter">${l}.</span>
        ${escHtml(opt)}
      </label>`;
    }).join('')}</div>`;
  }
  return `<div class="q-options">${options.map((opt, i) => {
    const l = letters[i];
    return `<label class="radio-opt ${chosen === l ? 'selected' : ''}"
                   onclick="pickMC(${qNum},'${l}',this)">
      <span class="radio-dot"></span>
      <span class="radio-letter">${l}.</span>
      ${escHtml(opt)}
    </label>`;
  }).join('')}</div>`;
}

/* ── Checkbox ─────────────────────────────────────────────────────── */
function renderCheckbox(q, isReview, review) {
  const { questionNumber: qNum, options = [], checkboxCount = 2 } = q;
  const rawAns = review ? review.userAnswer : (state.answers[qNum] || '');
  let chosen = [];
  try { chosen = JSON.parse(rawAns); } catch { if (rawAns) chosen = [rawAns]; }
  const correctArr = (() => { try { return JSON.parse(review?.correctAnswer || '[]'); } catch { return []; } })();
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const hint = !isReview ? `<div class="checkbox-hint">Chọn ${checkboxCount} đáp án</div>` : '';
  return `${hint}<div class="checkbox-opts">${options.map((opt, i) => {
    const l = letters[i];
    const sel = chosen.includes(l);
    let cls = sel ? 'selected' : '';
    if (isReview) {
      if (correctArr.includes(l)) cls = 'correct-ans';
      else if (sel) cls = 'wrong-ans';
    }
    return `<label class="checkbox-opt ${cls}" onclick="${isReview ? '' : `toggleCheckbox(${qNum},'${l}',${checkboxCount},this)`}">
      <span class="check-box"></span>
      <span class="cb-letter">${l}.</span>
      ${escHtml(opt)}
    </label>`;
  }).join('')}</div>`;
}

/* ── Fill Blank ───────────────────────────────────────────────────── */
function renderFillBlank(qNum, isReview, review) {
  if (isReview) {
    const cls = review?.isCorrect ? 'correct' : 'incorrect';
    return `<input class="fill-input ${cls}" value="${escHtml(review?.userAnswer || '')}" readonly />`;
  }
  const val = state.answers[qNum] || '';
  return `<input class="fill-input" data-qnum="${qNum}" value="${escHtml(val)}"
           oninput="setAnswer(${qNum},this.value)" placeholder="Nhập đáp án..." />`;
}

/* ── Word Bank / Drag-drop ────────────────────────────────────────── */
function renderWordBank(qNum, wordBank, isReview, review) {
  if (isReview) {
    const cls = review?.isCorrect ? 'correct' : 'incorrect';
    return `<input class="fill-input ${cls}" value="${escHtml(review?.userAnswer || '')}" readonly />`;
  }
  const current = state.answers[qNum] || '';
  const chips = wordBank.map(w =>
    `<span class="word-chip ${current === w ? 'used' : ''}"
           draggable="true"
           ondragstart="dragStart(event,'${escHtml(w)}')"
           onclick="clickChip(${qNum},'${escHtml(w)}')">${escHtml(w)}</span>`
  ).join('');
  const dzContent = current
    ? `${escHtml(current)}<span class="clear-drop" onclick="clearDrop(${qNum})">✕</span>`
    : 'Kéo hoặc click';
  return `<div class="word-bank">${chips}</div>
    <div class="drop-zone ${current ? 'filled' : ''}"
         data-qnum="${qNum}"
         ondragover="event.preventDefault()"
         ondrop="dropWord(event,${qNum})">${dzContent}</div>`;
}

/* ── PLACEHOLDERS in table/note/bullet cells ──────────────────────── */
function resolvePlaceholders(text, qMap, isReview, reviewMap) {
  return text.replace(/__Q(\d+)__/g, (_, numStr) => {
    const qNum = parseInt(numStr);
    const q = qMap[qNum];
    if (!q) return `[Q${qNum}]`;

    if (isReview) {
      const review = reviewMap[qNum];
      const userAns = review?.userAnswer || '';
      const isCorrect = review?.isCorrect;
      const cls = isCorrect ? 'rq-ans-ok' : 'rq-ans-wrong';
      const correctHint = !isCorrect && review?.correctAnswer
        ? `<span class="rq-ans-correct">(✓ ${escHtml(review.correctAnswer)})</span>` : '';
      return `<span class="rq-inline-wrap">
        <span class="rq-q-badge">${qNum}</span>
        <span class="rq-inline-ans ${cls}">${escHtml(userAns || '–')}</span>
        ${correctHint}
      </span>`;
    }

    const val = state.answers[qNum] || '';
    return `<span class="rq-inline-wrap">
      <span class="rq-q-badge">${qNum}</span>
      <input class="rq-inline-input" data-qnum="${qNum}" value="${escHtml(val)}"
             oninput="setAnswer(${qNum},this.value)" placeholder="Q${qNum}" />
    </span>`;
  });
}

/* ══════════════════════════════════════════════════════════════════════
   ANSWER SETTERS
══════════════════════════════════════════════════════════════════════ */
function setAnswer(qNum, val) {
  state.answers[qNum] = val;
  updateQNavBtn(qNum);
}

function pickTFNG(qNum, val, el) {
  state.answers[qNum] = val;
  el.closest('.tfng-opts').querySelectorAll('.tfng-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  updateQNavBtn(qNum);
}

function pickMC(qNum, val, el) {
  state.answers[qNum] = val;
  el.closest('.q-options').querySelectorAll('.radio-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  updateQNavBtn(qNum);
}

function toggleCheckbox(qNum, letter, maxCount, el) {
  let arr = [];
  try { arr = JSON.parse(state.answers[qNum] || '[]'); } catch { arr = []; }
  if (arr.includes(letter)) {
    arr = arr.filter(l => l !== letter);
    el.classList.remove('selected');
  } else {
    if (arr.length >= maxCount) return;
    arr.push(letter);
    el.classList.add('selected');
  }
  state.answers[qNum] = JSON.stringify(arr);
  updateQNavBtn(qNum);
}

function pickMatchAnswer(qNum, val) {
  state.answers[qNum] = val;
  updateQNavBtn(qNum);
}

/* ── Drag & drop ──────────────────────────────────────────────────── */
let _dragWord = '';
function dragStart(e, word) { _dragWord = word; e.dataTransfer.effectAllowed = 'copy'; }
function dropWord(e, qNum) {
  e.preventDefault();
  const word = _dragWord;
  if (!word) return;
  setAnswer(qNum, word);
  refreshWordBankZone(qNum, word);
}
function clickChip(qNum, word) {
  setAnswer(qNum, word);
  refreshWordBankZone(qNum, word);
}
function clearDrop(qNum) {
  delete state.answers[qNum];
  const passage = state.passages[state.currentPassageIdx];
  const allQ = getAllQuestionsFromPassage(passage);
  const q = allQ.find(x => x.questionNumber === qNum);
  if (q) {
    const dz = document.querySelector(`.drop-zone[data-qnum="${qNum}"]`);
    if (dz) { dz.classList.remove('filled'); dz.innerHTML = 'Kéo hoặc click'; }
    document.querySelectorAll('.word-chip').forEach(c => {
      if (c.textContent === q.wordBank?.find(w => w === c.textContent)) c.classList.remove('used');
    });
  }
  updateQNavBtn(qNum);
}
function refreshWordBankZone(qNum, word) {
  const dz = document.querySelector(`.drop-zone[data-qnum="${qNum}"]`);
  if (dz) {
    dz.classList.add('filled');
    dz.innerHTML = `${escHtml(word)}<span class="clear-drop" onclick="clearDrop(${qNum})">✕</span>`;
  }
  updateQNavBtn(qNum);
}
function initDropZones() {
  document.querySelectorAll('.drop-zone').forEach(dz => {
    dz.addEventListener('dragover', e => e.preventDefault());
    dz.addEventListener('drop', e => {
      e.preventDefault();
      const qNum = parseInt(dz.dataset.qnum);
      if (_dragWord) { setAnswer(qNum, _dragWord); refreshWordBankZone(qNum, _dragWord); }
    });
  });
}

/* ── Restore saved answers back into DOM after re-render ──────────── */
function restoreAnswers(isReview) {
  if (isReview) return;
  Object.entries(state.answers).forEach(([qNum, val]) => {
    const inp = document.querySelector(`[data-qnum="${qNum}"]`);
    if (inp && (inp.tagName === 'INPUT' || inp.tagName === 'TEXTAREA')) inp.value = val;
  });
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTION NAV FOOTER
══════════════════════════════════════════════════════════════════════ */
function buildQNavFooter() {
  const nav = document.getElementById('q-nav-scroll');
  if (!nav) return;
  const allNums = state.passages.flatMap(p => getAllQuestionsFromPassage(p).map(q => q.questionNumber));
  nav.innerHTML = allNums.map(n =>
    `<button class="q-nav-btn" id="qnav-${n}" onclick="jumpToQuestion(${n})">${n}</button>`
  ).join('');
}

function updateQNavFooter() {
  state.passages.forEach(p => {
    getAllQuestionsFromPassage(p).forEach(q => updateQNavBtn(q.questionNumber));
  });
}

function updateQNavBtn(qNum) {
  const btn = document.getElementById(`qnav-${qNum}`);
  if (!btn) return;
  const ans = state.answers[qNum];
  const answered = ans !== undefined && ans !== '' && ans !== '[]';
  btn.classList.toggle('answered', answered);
}

function jumpToQuestion(qNum) {
  // Find which passage contains this question
  let pIdx = state.currentPassageIdx;
  state.passages.forEach((p, i) => {
    if (getAllQuestionsFromPassage(p).some(q => q.questionNumber === qNum)) pIdx = i;
  });
  if (pIdx !== state.currentPassageIdx) switchPassage(pIdx);
  setTimeout(() => {
    const el = document.getElementById(`q${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

/* ══════════════════════════════════════════════════════════════════════
   TIMER
══════════════════════════════════════════════════════════════════════ */
function startTimer() {
  clearInterval(state.timer);
  updateTimerDisplay();
  state.timer = setInterval(() => {
    state.secondsLeft--;
    updateTimerDisplay();
    if (state.secondsLeft <= 0) { clearInterval(state.timer); submitExam(); }
    else if (state.secondsLeft <= 300) timerEl()?.classList.add('danger');
    else if (state.secondsLeft <= 600) timerEl()?.classList.add('warn');
  }, 1000);
}
function timerEl() { return document.getElementById('exam-timer'); }
function updateTimerDisplay() {
  const s = state.secondsLeft;
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  const el = document.getElementById('timer-display');
  if (el) el.textContent = `${h}:${m}:${sec}`;
}

/* ══════════════════════════════════════════════════════════════════════
   SUBMIT
══════════════════════════════════════════════════════════════════════ */
function confirmSubmit() { openModal('modal-submit'); }

async function submitExam() {
  closeModal('modal-submit');
  clearInterval(state.timer);
  state.submitted = true;
  try {
    const res = await apiFetch('/api/reading/submit', {
      method: 'POST',
      body: JSON.stringify({ attemptId: state.attemptId, answers: state.answers })
    });
    if (!res.success) { alert('Lỗi nộp bài: ' + res.message); return; }
    showResult(res.result);
  } catch (e) { alert('Lỗi kết nối khi nộp bài'); }
}

function showResult(r) {
  document.getElementById('result-band').textContent = r.bandScore?.toFixed(1) || '–';
  document.getElementById('result-total').textContent = `${r.correctCount}/${r.totalQuestions} câu đúng`;
  document.getElementById('r-correct').textContent = r.correctCount;
  document.getElementById('r-wrong').textContent = r.wrongCount;
  document.getElementById('r-skip').textContent = r.skippedCount;
  document.getElementById('result-band').dataset.attemptId = r.attemptId;
  showScreen('result');
}

function goToReview() {
  const aid = document.getElementById('result-band').dataset.attemptId;
  if (aid) loadReview(aid);
}

/* ══════════════════════════════════════════════════════════════════════
   SCREEN 5 – REVIEW
══════════════════════════════════════════════════════════════════════ */
async function loadReview(attemptId) {
  try {
    const res = await apiFetch(`/api/reading/attempt/${attemptId}/review`);
    if (!res.success) { alert('Không tải được bài review'); return; }
    renderReview(res.attempt);
  } catch (e) { alert('Lỗi tải review'); }
}

async function loadReviewByTest(testId) {
  try {
    const histRes = await apiFetch('/api/reading/history');
    const attempts = histRes.history || [];
    const attempt = attempts.find(a => a.testId?._id === testId || a.testId === testId);
    if (attempt) loadReview(attempt._id);
    else alert('Không tìm thấy lịch sử làm bài');
  } catch { alert('Lỗi tải lịch sử'); }
}

function renderReview(attempt) {
  state.isReview = true;
  state.passages = attempt.passages;
  state.currentPassageIdx = 0;

  document.getElementById('review-title').textContent = attempt.testName || 'Review';
  const badge = document.getElementById('review-band-badge');
  if (badge) badge.textContent = `Band: ${attempt.bandScore?.toFixed(1)}`;

  // Build reviewMap: { questionNumber: { userAnswer, correctAnswer, isCorrect, explanation } }
  const reviewMap = {};
  attempt.passages.forEach(p => {
    (p.questions || []).forEach(q => {
      reviewMap[q.questionNumber] = {
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect: q.isCorrect,
        explanation: q.explanation
      };
    });
  });
  state.reviewData = { attempt, reviewMap };

  renderPassageTabs('toolbar-passage-tabs-rv', true);
  switchReviewPassage(0);
  buildReviewQNav(attempt, reviewMap);
  showScreen('review');
}

function switchReviewPassage(idx) {
  state.currentPassageIdx = idx;
  const p = state.passages[idx];
  if (!p) return;
  const { reviewMap } = state.reviewData;

  document.getElementById('review-passage-inner').innerHTML =
    `<div class="passage-title">${escHtml(p.title)}</div>
     <div class="passage-text">${p.content || ''}</div>`;

  document.getElementById('review-questions-inner').innerHTML =
    renderPassageQuestions(p, true, reviewMap);

  renderPassageTabs('toolbar-passage-tabs-rv', true);
}

function buildReviewQNav(attempt, reviewMap) {
  const nav = document.getElementById('review-q-nav');
  if (!nav) return;
  const allNums = attempt.passages.flatMap(p =>
    (p.questions || []).map(q => q.questionNumber)
  );
  nav.innerHTML = allNums.map(n => {
    const r = reviewMap[n];
    const cls = !r?.userAnswer ? 'skipped' : r.isCorrect ? 'correct' : 'wrong';
    return `<button class="q-nav-btn ${cls}" title="Câu ${n}" onclick="jumpToReviewQuestion(${n})">${n}</button>`;
  }).join('');
}

function jumpToReviewQuestion(qNum) {
  // Find which passage contains this question
  let pIdx = state.currentPassageIdx;
  state.passages.forEach((p, i) => {
    const allQ = getAllQuestionsFromPassage(p);
    if (allQ.some(q => q.questionNumber === qNum)) pIdx = i;
  });
  // Switch passage if needed, then scroll
  if (pIdx !== state.currentPassageIdx) {
    switchReviewPassage(pIdx);
    // Wait for DOM to render before scrolling
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(`q${qNum}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
  } else {
    const el = document.getElementById(`q${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ══════════════════════════════════════════════════════════════════════
   HISTORY MODAL
══════════════════════════════════════════════════════════════════════ */
async function showHistoryModal() {
  try {
    const res = await apiFetch('/api/reading/history');
    const history = res.history || [];
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = history.map(h => `
      <tr>
        <td>${escHtml(h.testId?.name || '–')}</td>
        <td>${new Date(h.endTime).toLocaleDateString('vi-VN')}</td>
        <td>${fmtDuration(h.duration)}</td>
        <td>${h.totalQuestions}</td>
        <td style="color:#43a047;font-weight:600">${h.correctCount}</td>
        <td style="color:#e53935;font-weight:600">${h.wrongCount}</td>
        <td style="color:#9ca3af">${h.skippedCount}</td>
        <td class="band-cell">${h.bandScore?.toFixed(1)}</td>
        <td><button class="btn-review-sm" onclick="loadReview('${h._id}');closeModal('modal-history')">Xem lại</button></td>
      </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:#9ca3af">Chưa có lịch sử</td></tr>';
    openModal('modal-history');
  } catch { alert('Lỗi tải lịch sử'); }
}

/* ══════════════════════════════════════════════════════════════════════
   DICTIONARY (review only)
══════════════════════════════════════════════════════════════════════ */
let _dictWord = '';
document.addEventListener('dblclick', e => {
  if (state.tool !== 'dict' || !state.isReview) return;
  const sel = window.getSelection()?.toString().trim();
  if (!sel || sel.split(' ').length > 3) return;
  lookupWord(sel, e.clientX, e.clientY);
});

async function lookupWord(word, x, y) {
  _dictWord = word;
  document.getElementById('dict-word').textContent = word;
  document.getElementById('dict-phonetic').textContent = '…';
  document.getElementById('dict-pos').textContent = '';
  document.getElementById('dict-meaning').textContent = 'Đang tra...';
  document.getElementById('dict-example').textContent = '';
  positionDictPopup(x, y);
  document.getElementById('dict-popup').classList.remove('hidden');
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    const data = await res.json();
    const entry = data[0];
    const meaning = entry?.meanings?.[0];
    const def = meaning?.definitions?.[0];
    document.getElementById('dict-phonetic').textContent = entry?.phonetic || '';
    document.getElementById('dict-pos').textContent = meaning?.partOfSpeech || '';
    document.getElementById('dict-meaning').textContent = def?.definition || 'Không tìm thấy';
    document.getElementById('dict-example').textContent = def?.example || '';
  } catch {
    document.getElementById('dict-meaning').textContent = 'Không tìm thấy';
  }
}

function positionDictPopup(x, y) {
  const popup = document.getElementById('dict-popup');
  popup.style.left = Math.min(x, window.innerWidth - 320) + 'px';
  popup.style.top = Math.min(y + 12, window.innerHeight - 300) + 'px';
}

function closeDictPopup() { document.getElementById('dict-popup').classList.add('hidden'); }

function speakDictWord() {
  const w = document.getElementById('dict-word').textContent;
  if (w && window.speechSynthesis) {
    const u = new SpeechSynthesisUtterance(w);
    u.lang = 'en-US';
    speechSynthesis.speak(u);
  }
}

async function saveVocab() {
  const word = _dictWord;
  const meaning = document.getElementById('dict-meaning').textContent;
  const example = document.getElementById('dict-example').textContent;
  const phonetic = document.getElementById('dict-phonetic').textContent;
  const pos = document.getElementById('dict-pos').textContent;
  openVocabBookPicker({ word, meaning, example, phonetic, partOfSpeech: pos, source: 'reading' });
}

/* ── Vocab Book Picker Modal ─────────────────────────────────────── */
let _pendingVocabWord = null;

async function openVocabBookPicker(wordData) {
  _pendingVocabWord = wordData;
  const modal = document.getElementById('modal-vocab-picker');
  const listEl = document.getElementById('vocab-book-list');
  listEl.innerHTML = '<div style="text-align:center;padding:16px;color:#9ca3af">Đang tải sổ...</div>';
  modal.classList.remove('hidden');
  try {
    const res = await apiFetch('/api/vocabbook/');
    const books = res.books || [];
    if (!books.length) {
      listEl.innerHTML = '<div style="text-align:center;padding:16px;color:#9ca3af">Chưa có sổ nào</div>';
      return;
    }
    listEl.innerHTML = books.map(b =>
      `<div class="vb-pick-item" onclick="saveWordToBook('${b._id}')">
        <span class="vb-pick-emoji">${b.emoji || '📘'}</span>
        <div class="vb-pick-info">
          <div class="vb-pick-name">${escHtml(b.name)}</div>
          <div class="vb-pick-count">${b.totalWords} từ</div>
        </div>
        <span class="vb-pick-arrow">›</span>
      </div>`
    ).join('');
  } catch {
    listEl.innerHTML = '<div style="text-align:center;padding:16px;color:#e53935">Lỗi tải sổ từ vựng</div>';
  }
}

async function createNewBookAndSave() {
  const nameInput = document.getElementById('new-book-name');
  const name = nameInput?.value?.trim();
  if (!name) { if (nameInput) nameInput.focus(); return; }
  try {
    const res = await apiFetch('/api/vocabbook/', {
      method: 'POST',
      body: JSON.stringify({ name, emoji: '📘', color: '#3d8bff' })
    });
    if (!res.success) { alert(res.message); return; }
    if (nameInput) nameInput.value = '';
    await saveWordToBook(res.book._id);
  } catch { alert('Lỗi tạo sổ mới'); }
}

async function saveWordToBook(bookId) {
  if (!_pendingVocabWord) return;
  try {
    const res = await apiFetch(`/api/vocabbook/${bookId}/words`, {
      method: 'POST',
      body: JSON.stringify(_pendingVocabWord)
    });
    closeModal('modal-vocab-picker');
    const msg = res.success
      ? `✓ Đã lưu "${_pendingVocabWord.word}" vào sổ`
      : `ℹ️ ${res.message}`;
    showVocabToast(msg, res.success ? 'success' : 'info');
    _pendingVocabWord = null;
  } catch { alert('Lỗi lưu từ'); }
}

function showVocabToast(msg, type = 'success') {
  const toast = document.getElementById('vocab-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `vocab-toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════════════════════════════════════
   HIGHLIGHT
══════════════════════════════════════════════════════════════════════ */
function setTool(tool) {
  state.tool = tool;
  ['tool-hl', 'tool-hl-rv'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.classList.toggle('active', tool === 'highlight');
  });
  const td = document.getElementById('tool-dict');
  if (td) td.classList.toggle('active', tool === 'dict');
  document.body.style.cursor = tool === 'highlight' ? 'crosshair' : '';
}

document.addEventListener('mouseup', e => {
  if (state.tool !== 'highlight') return;
  if (e.target.closest('.split-passage') || e.target.closest('.review-passage')) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'hl';
    try { range.surroundContents(span); } catch { }
    sel.removeAllRanges();
  }
});

/* ══════════════════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════════════════ */
function toggleSettings() {
  document.getElementById('settings-panel').classList.toggle('hidden');
}
function toggleEyeProtection() {
  document.body.classList.toggle('eye-protection',
    document.getElementById('toggle-eye').checked);
}
function setFontSize(s) {
  const map = { S: '13px', M: '15px', L: '17px' };
  document.documentElement.style.setProperty('--reading-font-size', map[s]);
  document.querySelectorAll('.fs-btn').forEach(b => b.classList.toggle('active', b.textContent === s));
}

/* ══════════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════════════════════ */
function handleKeyShortcuts(e) {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  if (e.key === 'h' || e.key === 'H') setTool('highlight');
  if (e.key === 'd' || e.key === 'D') setTool('dict');
}

/* ══════════════════════════════════════════════════════════════════════
   CONFIRM / EXIT MODALS
══════════════════════════════════════════════════════════════════════ */
function confirmExit() { openModal('modal-exit'); }
function forceExit() { closeModal('modal-exit'); clearInterval(state.timer); showScreen('list'); }

/* ══════════════════════════════════════════════════════════════════════
   RESIZABLE DIVIDER
══════════════════════════════════════════════════════════════════════ */
function initDividerDrag(dividerId, leftId, rightId) {
  const divider = document.getElementById(dividerId);
  const left = document.getElementById(leftId);
  const right = document.getElementById(rightId);
  if (!divider || !left || !right) return;
  let dragging = false, startX = 0, startW = 0;
  divider.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX; startW = left.offsetWidth;
    divider.classList.add('dragging');
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const newW = Math.max(240, Math.min(startW + e.clientX - startX, window.innerWidth - 300));
    left.style.width = newW + 'px';
  });
  document.addEventListener('mouseup', () => {
    dragging = false; divider.classList.remove('dragging');
    document.body.style.userSelect = '';
  });
}

/* ══════════════════════════════════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════════════════════════════════ */
function openModal(id) { const m = document.getElementById(id); if (m) { m.classList.remove('hidden'); } }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.add('hidden'); }

/* ══════════════════════════════════════════════════════════════════════
   AUTH HELPERS (uses auth.js)
══════════════════════════════════════════════════════════════════════ */
function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return false; }
  return true;
}
function logout() {
  localStorage.removeItem('token'); localStorage.removeItem('userName');
  window.location.href = 'login.html';
}
async function apiFetch(url, opts = {}) {
  const token = localStorage.getItem('token');
  // Prepend API base for relative paths
  const fullUrl = url.startsWith('/api/') ? API + url.slice(4) : url;
  const res = await fetch(fullUrl, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
  return res.json();
}

/* ══════════════════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════════════════ */
function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtDuration(s) {
  if (!s) return '–';
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}