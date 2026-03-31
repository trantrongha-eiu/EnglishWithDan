/**
 * EnglishWithDan – Reading Full Test
 * reading.js – complete frontend logic (updated with questionGroups)
 */

'use strict';

const API = 'https://englishwithdan.onrender.com/api';

const state = {
  tests: [],
  currentTestId: null,
  attemptId: null,
  passages: [],
  passageIdx: 0,
  answers: {},
  dragItem: null,
  timer: null,
  timeLeft: 3600,
  submitted: false,
  isReview: false,
  tool: 'highlight',
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
  document.addEventListener('keydown', e => {
    if ((e.key === 'h' || e.key === 'H') && !isInputFocused()) setTool('highlight');
  });
});

function getToken() { return localStorage.getItem('token'); }
function authHeader() { return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }; }
function isInputFocused() { const t = document.activeElement?.tagName; return t === 'INPUT' || t === 'TEXTAREA'; }

// ══════════════════════════════════════════════════════
// SCREEN MANAGEMENT
// ══════════════════════════════════════════════════════
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.classList.add('hidden'); });
  const el = document.getElementById(`screen-${name}`);
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }
}
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ══════════════════════════════════════════════════════
// SCREEN 1 – TEST LIST
// ══════════════════════════════════════════════════════
async function loadTestList() {
  try {
    const res  = await fetch(`${API}/reading/tests`, { headers: authHeader() });
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
  if (!tests.length) { wrap.innerHTML = '<p style="text-align:center;padding:60px;color:#9ca3af">Chưa có đề thi nào.</p>'; return; }
  const groups = {};
  tests.forEach(t => { const g = t.seriesName || 'Bộ đề'; if (!groups[g]) groups[g] = []; groups[g].push(t); });
  wrap.innerHTML = Object.entries(groups).map(([groupName, groupTests]) => {
    const done = groupTests.filter(t => t.lastAttempt).length;
    const pct  = groupTests.length ? Math.round((done / groupTests.length) * 100) : 0;
    return `<div class="test-group" data-group="${groupName}">
      <div class="test-group-title">${groupName}
        <span class="test-group-progress">Hoàn thành ${done}/${groupTests.length} đề</span>
        <div class="progress-bar-mini"><div class="progress-bar-mini-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="test-grid">${groupTests.map(renderTestCard).join('')}</div>
    </div>`;
  }).join('');
}

function renderTestCard(t) {
  const la = t.lastAttempt;
  return `<div class="test-card ${la?'done':''}" data-testid="${t._id}">
    <div class="test-card-cover">
      ${la?'<div class="test-done-tick">✓</div>':''}
      <div class="test-cover-badge">IELTS Reading</div>
      <div class="test-cover-title">TEST ${t.testNumber}</div>
      <div class="test-cover-sub">${t.seriesName||''}</div>
    </div>
    <div class="test-card-body">
      <div class="test-card-name">${t.name}</div>
      <div class="test-card-meta">Reading · 40 câu · 60 phút</div>
      ${la?`<div class="test-card-last">Lần cuối: ${formatDate(la.endTime)} · <span class="band-mini">${la.bandScore?.toFixed(1)} điểm</span></div>`:''}
      <button class="btn-do-test" onclick="onClickTest('${t._id}','${t.name}')">Làm bài</button>
      ${la?`<button class="btn-redo-test" onclick="onClickReview('${la._id}')">Xem lại</button>`:''}
    </div>
  </div>`;
}

function filterTests(mode, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  let f = state.tests;
  if (mode === 'done') f = state.tests.filter(t => t.lastAttempt);
  if (mode === 'new')  f = state.tests.filter(t => !t.lastAttempt);
  renderTestList(f);
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
  let v = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
  input.value = v;
}

async function verifyAndStart() {
  const key = document.getElementById('key-input').value.trim();
  if (!key || key.length < 9) { showMsg('key-msg', 'Vui lòng nhập đủ key (định dạng XXXX-XXXX)', 'error'); return; }
  const btn = document.getElementById('btn-start-key');
  btn.disabled = true; btn.textContent = 'Đang kiểm tra...';
  try {
    const res  = await fetch(`${API}/reading/verify-key`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ key, testId: state.currentTestId }) });
    const data = await res.json();
    if (!data.success) { showMsg('key-msg', data.message, 'error'); btn.disabled = false; btn.textContent = 'Bắt đầu làm bài'; return; }
    showMsg('key-msg', data.message, 'success');
    await startExam(key);
  } catch { showMsg('key-msg', 'Lỗi kết nối server', 'error'); btn.disabled = false; btn.textContent = 'Bắt đầu làm bài'; }
}

// ══════════════════════════════════════════════════════
// SCREEN 3 – EXAM
// ══════════════════════════════════════════════════════
async function startExam(key) {
  try {
    const res  = await fetch(`${API}/reading/start`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ key, testId: state.currentTestId }) });
    const data = await res.json();
    if (!data.success) { alert(data.message); return; }
    state.attemptId  = data.attemptId;
    state.passages   = data.passages;
    state.answers    = {};
    state.timeLeft   = data.duration;
    state.submitted  = false;
    state.isReview   = false;
    state.passageIdx = 0;
    document.getElementById('exam-title').textContent = data.testName;
    buildPassageTabs('toolbar-passage-tabs', false);
    renderCurrentPassage(false);
    renderQNav(false);
    startTimer();
    setTool('highlight');
    showScreen('exam');
    window.onbeforeunload = e => { if (!state.submitted) { e.preventDefault(); e.returnValue = ''; } };
  } catch (err) { alert('Lỗi bắt đầu bài thi: ' + err.message); }
}

function buildPassageTabs(containerId, isReview) {
  const c = document.getElementById(containerId);
  c.innerHTML = state.passages.map((p, i) =>
    `<button class="passage-tab-btn ${i===0?'active':''}" onclick="switchPassage(${i},${isReview})">Passage ${i+1}</button>`
  ).join('');
}

function switchPassage(idx, isReview) {
  state.passageIdx = idx;
  const tabsId = isReview ? 'toolbar-passage-tabs-rv' : 'toolbar-passage-tabs';
  document.querySelectorAll(`#${tabsId} .passage-tab-btn`).forEach((b, i) => b.classList.toggle('active', i === idx));
  renderCurrentPassage(isReview);
  if (isReview) setupDictionaryDouble('review-passage-inner');
}

// ══════════════════════════════════════════════════════
// RENDER PASSAGE + QUESTIONS
// ══════════════════════════════════════════════════════
function renderCurrentPassage(isReview) {
  const p      = state.passages[state.passageIdx];
  const innerId= isReview ? 'review-passage-inner' : 'passage-inner';
  document.getElementById(innerId).innerHTML =
    `<div class="passage-title">${p.title}</div><div class="passage-text">${p.content}</div>`;
  renderCurrentQuestions(isReview);
}

// ── Dispatch: groups or flat questions ────────────────────────────────
function renderCurrentQuestions(isReview) {
  const p      = state.passages[state.passageIdx];
  const innerId= isReview ? 'review-questions-inner' : 'questions-inner';
  const el     = document.getElementById(innerId);

  const rangeText = `Questions ${p.questionRange.start}–${p.questionRange.end}`;
  let html = `<div class="q-section-title">${rangeText}</div>`;

  // Prefer questionGroups if available
  if (p.questionGroups?.length) {
    p.questionGroups.forEach((group, gi) => {
      html += renderQuestionGroup(group, gi, isReview);
    });
  } else {
    // Fallback: flat questions[]
    html += renderFlatQuestions(p.questions, isReview);
  }

  el.innerHTML = html;

  // Restore answers
  const allQs = getAllQuestionsFromPassage(p);
  allQs.forEach(q => restoreAnswer(q, el, isReview));

  if (!isReview) setupDragDrop(el);
  if (isReview)  applyReviewStyling(el);
}

function getAllQuestionsFromPassage(p) {
  if (p.questionGroups?.length) return p.questionGroups.flatMap(g => g.questions);
  return p.questions || [];
}

// ════════════════════════════════════════════════════════════════════════
// RENDER QUESTION GROUP — BC/IDP style
// ════════════════════════════════════════════════════════════════════════
function renderQuestionGroup(group, gi, isReview) {
  const groupType = group.groupType || 'plain';
  let html = '';

  // Group title + instruction
  if (group.groupTitle) {
    html += `<div class="q-group-title">${group.groupTitle}</div>`;
  }
  if (group.instruction) {
    html += `<div class="q-section-instruction">${group.instruction}</div>`;
  }

  switch (groupType) {
    case 'table':           html += renderTableGroup(group, isReview);          break;
    case 'note-form':       html += renderNoteFormGroup(group, isReview);       break;
    case 'matching-options':html += renderMatchingOptionsGroup(group, isReview);break;
    case 'bullet-list':     html += renderBulletListGroup(group, isReview);     break;
    case 'map':             html += renderMapGroup(group, isReview);            break;
    default:                html += renderPlainGroup(group, isReview);          break;
  }

  return `<div class="question-group" data-type="${groupType}">${html}</div>`;
}

// ── TABLE group ──────────────────────────────────────────────────────────
function renderTableGroup(group, isReview) {
  const { headers = [], rows = [] } = group.tableConfig || {};
  const headerHtml = headers.length
    ? `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>` : '';
  const bodyHtml = rows.map(cells =>
    `<tr>${cells.map(cell =>
      `<td>${resolvePlaceholders(cell, group.questions, isReview)}</td>`
    ).join('')}</tr>`
  ).join('');
  return `<div class="rq-table-wrap"><table class="rq-table">${headerHtml}<tbody>${bodyHtml}</tbody></table></div>`;
}

// ── NOTE FORM group ──────────────────────────────────────────────────────
function renderNoteFormGroup(group, isReview) {
  const { title = '', lines = [] } = group.noteConfig || {};
  const linesHtml = lines.map(line =>
    `<div class="rq-note-line">${resolvePlaceholders(line, group.questions, isReview)}</div>`
  ).join('');
  return `<div class="rq-note-form">
    ${title ? `<div class="rq-note-title">${title}</div>` : ''}
    <div class="rq-note-body">${linesHtml}</div>
  </div>`;
}

// ── MATCHING OPTIONS group (Matching headings / Matching info) ───────────
// Layout: câu hỏi số ở trên, options list A-F ở dưới (như BC/IDP)
function renderMatchingOptionsGroup(group, isReview) {
  const opts = group.matchingOptions || [];
  const reuse = group.matchingReuseAllowed;

  // Render numbered questions first
  const questionsHtml = group.questions.map(q => {
    const num = q.questionNumber;
    const ua  = isReview ? (q.userAnswer || '') : (state.answers[num] || '');
    const ca  = isReview ? (q.correctAnswer || '') : '';
    const ok  = isReview ? !!q.isCorrect : false;

    let inputHtml;
    if (isReview) {
      const cls = ok ? 'match-ans-correct' : 'match-ans-wrong';
      inputHtml = `<span class="match-answer-badge ${cls}">${ua || '–'}</span>
        ${!ok ? `<span class="match-correct-ans">${ca}</span>` : ''}`;
    } else {
      // Dropdown to pick letter
      const optHtml = opts.map((_, i) => {
        const letter = String.fromCharCode(65 + i);
        return `<option value="${letter}" ${ua===letter?'selected':''}>${letter}</option>`;
      }).join('');
      inputHtml = `<select class="match-select" data-qnum="${num}" onchange="pickMatchAnswer(${num}, this.value)">
        <option value="">– Chọn –</option>${optHtml}
      </select>`;
    }

    const reviewExtra = isReview ? `<div class="q-correct-ans ${ok?'right':'wrong'} match-feedback">
      ${ok ? '✓ Đúng' : `✗ Sai — Đáp án: <strong>${ca}</strong>`}
    </div>${q.explanation?`<div class="q-explanation"><strong>Giải thích:</strong> ${q.explanation}</div>`:''}` : '';

    return `<div class="match-question-row" id="qi-${num}" data-qnum="${num}">
      <div class="match-q-left">
        <span class="match-q-num">${num}</span>
        <div class="match-q-text">${q.questionText}</div>
      </div>
      <div class="match-q-right">${inputHtml}</div>
      ${reviewExtra}
    </div>`;
  }).join('');

  // Options list (A, B, C…) pinned below questions
  const optionsHtml = opts.length ? `
    <div class="match-options-panel">
      <div class="match-options-label">List of options</div>
      ${reuse ? `<div class="match-reuse-note">NB You may use any letter more than once.</div>` : ''}
      <div class="match-options-grid">
        ${opts.map((opt, i) => `
          <div class="match-option-item">
            <span class="match-option-letter">${String.fromCharCode(65+i)}</span>
            <span class="match-option-text">${opt}</span>
          </div>`).join('')}
      </div>
    </div>` : '';

  return `<div class="matching-group-wrap">${questionsHtml}${optionsHtml}</div>`;
}

// ── BULLET LIST group ────────────────────────────────────────────────────
function renderBulletListGroup(group, isReview) {
  const { items = [] } = group.bulletConfig || {};
  const itemsHtml = items.map(item =>
    `<li class="rq-bullet-item">${resolvePlaceholders(item, group.questions, isReview)}</li>`
  ).join('');
  return `<div class="rq-bullet-list"><ul>${itemsHtml}</ul></div>`;
}

// ── MAP group ────────────────────────────────────────────────────────────
function renderMapGroup(group, isReview) {
  const imgUrl = group.imageUrl || '';
  const qsHtml = group.questions.map(q => renderStandaloneQuestion(q, isReview)).join('');
  return `<div class="rq-map-group">
    ${imgUrl ? `<div class="rq-map-img-wrap"><img src="${imgUrl}" class="rq-map-img" alt="Diagram"/></div>` : ''}
    <div class="rq-map-questions">${qsHtml}</div>
  </div>`;
}

// ── PLAIN group ──────────────────────────────────────────────────────────
function renderPlainGroup(group, isReview) {
  // Render word bank for DnD types
  let html = '';
  const dndQs = group.questions.filter(q =>
    ['sentence-completion','matching-headings','matching-info'].includes(q.type) && q.wordBank?.length
  );
  if (dndQs.length && !isReview) {
    const allWords = [...new Set(dndQs.flatMap(q => q.wordBank))];
    html += renderWordBank(allWords, group.questions[0]?.questionNumber || 0, isReview);
  }
  html += group.questions.map(q => renderStandaloneQuestion(q, isReview)).join('');
  return html;
}

// Fallback flat questions[]
function renderFlatQuestions(questions, isReview) {
  let html = '';
  let prevType = null, bankRendered = false;
  (questions || []).forEach(q => {
    const isDnD = ['sentence-completion','matching-headings','matching-info'].includes(q.type);
    if (isDnD && q.wordBank?.length && (!bankRendered || prevType !== q.type)) {
      html += renderWordBank(q.wordBank, q.questionNumber, isReview);
      bankRendered = true;
    }
    if (!isDnD) bankRendered = false;
    prevType = q.type;
    html += renderStandaloneQuestion(q, isReview);
  });
  return html;
}

// ── PLACEHOLDER RESOLVER ─────────────────────────────────────────────────
function resolvePlaceholders(template, questions, isReview) {
  return template.replace(/__Q(\d+)__/g, (match, numStr) => {
    const num = parseInt(numStr);
    const q   = (questions || []).find(q => q.questionNumber === num);
    if (!q) return match;
    const ua = isReview ? (q.userAnswer || '') : (state.answers[num] || '');
    const ca = isReview ? (q.correctAnswer || '') : '';
    if (isReview) {
      const ok  = !!q.isCorrect;
      return `<span class="rq-inline-wrap">
        <span class="rq-q-badge">${num}</span>
        <span class="rq-inline-ans ${ok?'rq-ans-ok':'rq-ans-wrong'}">${ua||'–'}</span>
        ${!ok?`<span class="rq-ans-correct">(${ca})</span>`:''}
      </span>`;
    }
    return `<span class="rq-inline-wrap">
      <span class="rq-q-badge">${num}</span>
      <input id="fi-${num}" class="rq-inline-input" type="text"
             value="${ua}" placeholder="..."
             oninput="saveTextAnswer(${num}, this.value)" />
    </span>`;
  });
}

// ══════════════════════════════════════════════════════
// STANDALONE QUESTION RENDERER
// ══════════════════════════════════════════════════════
function renderStandaloneQuestion(q, isReview) {
  const num = q.questionNumber;
  const ua  = isReview ? (q.userAnswer || '') : (state.answers[num] || '');
  const ca  = isReview ? (q.correctAnswer || '') : '';
  const ok  = isReview ? !!q.isCorrect : false;

  let inputHtml = '';
  switch (q.type) {
    case 'true-false-ng':
      inputHtml = renderTFNG(num, ua, ca, isReview); break;
    case 'multiple-choice':
      inputHtml = renderRadioOpts(num, q.options || [], ua, ca, isReview); break;
    case 'checkbox':
      inputHtml = renderCheckboxOpts(num, q, ua, ca, isReview); break;
    case 'fill-blank':
      inputHtml = renderFillBlank(num, ua, ca, isReview); break;
    case 'map-labelling':
      inputHtml = renderMapLabelling(num, q, ua, ca, isReview); break;
    case 'sentence-completion':
    case 'matching-info':
      inputHtml = renderInlineDrop(num, q.questionText, ua, ca, isReview); break;
    case 'matching-headings':
      inputHtml = renderMatchingHeadings(num, q, ua, ca, isReview); break;
    default:
      inputHtml = renderFillBlank(num, ua, ca, isReview);
  }

  const showText = !['sentence-completion','matching-headings','matching-info'].includes(q.type);
  const reviewExtra = isReview ? `
    <div class="q-correct-ans ${ok?'right':'wrong'}">
      ${ok ? '✓ Đúng' : `✗ Sai – Đáp án: <strong>${ca}</strong>`}
    </div>
    ${q.explanation?`<div class="q-explanation"><strong>Giải thích:</strong> ${q.explanation}</div>`:''}` : '';

  return `<div class="question-item" id="qi-${num}" data-qnum="${num}">
    <div class="q-num-label">
      <span class="q-badge">${num}</span>
      <span>${typeLabel(q.type)}</span>
    </div>
    ${showText ? `<div class="q-text">${q.questionText}</div>` : ''}
    ${inputHtml}${reviewExtra}
  </div>`;
}

function typeLabel(t) {
  const m = {
    'true-false-ng':'True/False/NG','multiple-choice':'Multiple Choice',
    'checkbox':'Multiple Choice','fill-blank':'Fill in blank',
    'sentence-completion':'Sentence Completion','matching-headings':'Matching Headings',
    'matching-info':'Matching Information','map-labelling':'Map Labelling'
  };
  return m[t] || t;
}

// ══════════════════════════════════════════════════════
// INPUT RENDERERS
// ══════════════════════════════════════════════════════

// True/False/Not Given — horizontal 3 buttons like exam
function renderTFNG(num, ua, ca, isReview) {
  return `<div class="tfng-opts">
    ${['TRUE','FALSE','NOT GIVEN'].map(opt => {
      let cls = '';
      if (isReview) { if (opt===ca) cls='correct-ans'; else if (opt===ua && opt!==ca) cls='wrong-ans'; }
      else { if (opt===ua) cls='selected'; }
      return `<div class="tfng-opt ${cls}" data-qnum="${num}" data-value="${opt}"
                   ${isReview?'':` onclick="pickRadio(${num}, '${opt}')"`}>
        ${opt}
      </div>`;
    }).join('')}
  </div>`;
}

// Multiple choice — vertical list with letters
function renderRadioOpts(num, opts, ua, ca, isReview) {
  return `<div class="q-options">${opts.map((opt, i) => {
    const letter = String.fromCharCode(65 + i);
    const value  = opt; // store full option text
    let cls = '';
    if (isReview) { if (opt===ca) cls='correct-ans'; else if (opt===ua && opt!==ca) cls='wrong-ans'; }
    else { if (opt===ua) cls='selected'; }
    return `<div class="radio-opt ${cls}" data-qnum="${num}" data-value="${opt}"
                 ${isReview?'':` onclick="pickRadio(${num}, '${opt}')"`}>
      <span class="radio-dot"></span>
      <span class="radio-letter">${letter}</span>
      <label>${opt}</label>
    </div>`;
  }).join('')}</div>`;
}

// Fill blank
function renderFillBlank(num, ua, ca, isReview) {
  const cls = isReview ? (ua.toLowerCase().trim()===ca.toLowerCase().trim()?'correct':'incorrect') : '';
  return `<input id="fi-${num}" class="fill-input ${cls}" type="text"
    placeholder="Nhập câu trả lời..." value="${ua}"
    ${isReview?'readonly':`oninput="saveTextAnswer(${num}, this.value)"`} />`;
}

// Map labelling
function renderMapLabelling(num, q, ua, ca, isReview) {
  const imgHtml = q.imageUrl
    ? `<div class="map-img-wrap"><img src="${q.imageUrl}" alt="Diagram" class="map-img"/></div>` : '';
  return `${imgHtml}${renderFillBlank(num, ua, ca, isReview)}`;
}

// Sentence completion inline drop zone
function renderInlineDrop(num, questionText, ua, ca, isReview) {
  const cls = isReview ? (ua.toLowerCase().trim()===ca.toLowerCase().trim()?'correct-drop':'wrong-drop') : '';
  const dz = `<div class="drop-zone ${ua?'filled':''} ${isReview?cls:''}" data-qnum="${num}"
    ${isReview?'':` ondragover="dzDragOver(event)" ondrop="dzDrop(event,${num})" onclick="dzClick(event,${num})"`}>
    ${ua?`${ua}<span class="clear-drop" onclick="clearDz(event,${num})">×</span>`:'&nbsp;&nbsp;&nbsp;'}
  </div>`;
  const filled = questionText.replace(/_{2,}|\[blank\]/i, dz);
  return `<div class="q-text">${filled !== questionText ? filled : questionText + ' ' + dz}</div>`;
}

// Matching headings (old DnD style - kept for backwards compat)
function renderMatchingHeadings(num, q, ua, ca, isReview) {
  return `<div class="q-text">${q.questionText}</div>
    <div class="matching-item">
      <span class="matching-label">${num}.</span>
      <div class="matching-drop">
        <div class="drop-zone ${ua?'filled':''}" data-qnum="${num}"
          ${isReview?'':` ondragover="dzDragOver(event)" ondrop="dzDrop(event,${num})" onclick="dzClick(event,${num})"`}>
          ${ua?`${ua}<span class="clear-drop" onclick="clearDz(event,${num})">×</span>`:'Kéo hoặc click để chọn'}
        </div>
      </div>
    </div>`;
}

// Checkbox
function renderCheckboxOpts(num, q, ua, ca, isReview) {
  let selected = []; try { selected = Array.isArray(ua) ? ua : JSON.parse(ua||'[]'); } catch {}
  let correctArr=[]; try { correctArr = Array.isArray(ca) ? ca : JSON.parse(ca||'[]'); } catch {}
  const count = q.checkboxCount || 2;
  return `
    ${isReview?'':`<div class="checkbox-hint">Chọn ${count} đáp án</div>`}
    <div class="checkbox-opts">${(q.options||[]).map((opt, i) => {
      const letter = String.fromCharCode(65+i);
      const isSel  = selected.includes(letter);
      const isCorr = correctArr.includes(letter);
      let cls = '';
      if (isReview) { if (isCorr) cls='correct-ans'; else if (isSel&&!isCorr) cls='wrong-ans'; }
      else { if (isSel) cls='selected'; }
      return `<div class="checkbox-opt ${cls}" data-qnum="${num}" data-letter="${letter}"
                   ${isReview?'':` onclick="toggleCheckboxReading(${num},'${letter}',${count},this)"`}>
        <div class="check-box"></div>
        <span class="cb-letter">${letter}.</span>
        <label>${opt}</label>
      </div>`;
    }).join('')}</div>`;
}

// Word bank for DnD
function renderWordBank(words, startNum, isReview) {
  return `<div class="word-bank" id="bank-${startNum}">
    ${words.map(w => `<div class="word-chip ${isReview?'used':''}" data-word="${w}" ${isReview?'':'draggable="true"'}>${w}</div>`).join('')}
  </div>`;
}

// ══════════════════════════════════════════════════════
// ANSWER HANDLERS
// ══════════════════════════════════════════════════════
function pickRadio(qnum, value) {
  state.answers[qnum] = value;
  document.getElementById(`qi-${qnum}`)?.querySelectorAll('.radio-opt,.tfng-opt')
    .forEach(o => o.classList.toggle('selected', o.dataset.value === value));
  updateQNav();
}

function pickMatchAnswer(qnum, value) {
  state.answers[qnum] = value;
  updateQNav();
}

function toggleCheckboxReading(qnum, letter, maxCount, el) {
  let current = []; try { current = JSON.parse(state.answers[qnum]||'[]'); } catch {}
  if (current.includes(letter)) { current = current.filter(l => l !== letter); el.classList.remove('selected'); }
  else {
    if (current.length >= maxCount) {
      const first = current.shift();
      document.getElementById(`qi-${qnum}`)?.querySelector(`.checkbox-opt[data-letter="${first}"]`)?.classList.remove('selected');
    }
    current.push(letter); el.classList.add('selected');
  }
  state.answers[qnum] = JSON.stringify(current);
  updateQNav();
}

function saveTextAnswer(qnum, value) {
  state.answers[qnum] = value.trim();
  updateQNav();
}

function restoreAnswer(q, el, isReview) {
  const num   = q.questionNumber;
  const saved = state.answers[num];
  if (!saved) return;
  if (['sentence-completion','matching-headings','matching-info'].includes(q.type)) {
    const dz = el.querySelector(`.drop-zone[data-qnum="${num}"]`);
    if (dz) { dz.classList.add('filled'); dz.innerHTML = `${saved}<span class="clear-drop" onclick="clearDz(event,${num})">×</span>`; }
  } else if (['fill-blank','map-labelling'].includes(q.type)) {
    const inp = document.getElementById(`fi-${num}`);
    if (inp) inp.value = saved;
  }
  // Inline inputs
  const inlineInp = document.getElementById(`fi-${num}`);
  if (inlineInp && !inlineInp.value) inlineInp.value = saved;
}

// ══════════════════════════════════════════════════════
// DRAG & DROP
// ══════════════════════════════════════════════════════
function setupDragDrop(container) {
  container.querySelectorAll('.word-chip:not(.used)').forEach(chip => {
    chip.addEventListener('dragstart', e => { state.dragItem = chip.dataset.word; chip.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    chip.addEventListener('dragend',   () => chip.classList.remove('dragging'));
  });
}

function dzDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }

function dzDrop(e, qnum) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  const word = state.dragItem || e.dataTransfer.getData('text');
  if (word) placeAnswer(qnum, word);
}

function dzClick(e, qnum) {
  if (e.target.classList.contains('clear-drop')) return;
  const p = state.passages[state.passageIdx];
  const allQs = getAllQuestionsFromPassage(p);
  const q = allQs.find(q => q.questionNumber === qnum);
  if (!q?.wordBank?.length) return;
  const existing = document.getElementById('word-picker');
  if (existing) existing.remove();
  const rect   = e.currentTarget.getBoundingClientRect();
  const picker = document.createElement('div');
  picker.id    = 'word-picker';
  Object.assign(picker.style, { position:'fixed', top:(rect.bottom+4)+'px', left:rect.left+'px', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'10px', boxShadow:'0 8px 24px rgba(0,0,0,.15)', zIndex:'500', display:'flex', flexWrap:'wrap', gap:'6px', maxWidth:'280px' });
  q.wordBank.forEach(w => {
    const chip = document.createElement('div'); chip.className = 'word-chip'; chip.textContent = w;
    chip.onclick = () => { placeAnswer(qnum, w); picker.remove(); };
    picker.appendChild(chip);
  });
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

function placeAnswer(qnum, word) {
  state.answers[qnum] = word;
  renderCurrentQuestions(false);
  updateQNav();
  state.dragItem = null;
}

// ══════════════════════════════════════════════════════
// Q NAV
// ══════════════════════════════════════════════════════
function renderQNav(isReview) {
  const navId = isReview ? 'review-q-nav' : 'q-nav-scroll';
  const nav   = document.getElementById(navId);
  const allQs = state.passages.flatMap(p => getAllQuestionsFromPassage(p));
  nav.innerHTML = allQs.map(q => {
    const num = q.questionNumber;
    let cls = '';
    if (isReview) cls = q.isCorrect ? 'correct' : (q.userAnswer ? 'wrong' : 'skipped');
    else cls = state.answers[num] ? 'answered' : '';
    return `<button class="q-nav-btn ${cls}" id="qnb-${num}" onclick="scrollToQuestion(${num})">${num}</button>`;
  }).join('');
}

function updateQNav() {
  const allQs = state.passages.flatMap(p => getAllQuestionsFromPassage(p));
  allQs.forEach(q => {
    const btn = document.getElementById(`qnb-${q.questionNumber}`);
    if (btn) btn.className = `q-nav-btn ${state.answers[q.questionNumber] ? 'answered' : ''}`;
  });
}

function scrollToQuestion(num) {
  document.getElementById(`qi-${num}`)?.scrollIntoView({ behavior:'smooth', block:'center' });
}

function applyReviewStyling(el) { /* handled by CSS classes in renderXxx */ }

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
    if (state.timeLeft <= 0) { clearInterval(state.timer); alert('Hết giờ!'); submitExam(); }
  }, 1000);
}

function updateTimerDisplay() {
  const h = Math.floor(state.timeLeft/3600), m = Math.floor((state.timeLeft%3600)/60), s = state.timeLeft%60;
  document.getElementById('timer-display').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

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
    const res  = await fetch(`${API}/reading/submit`, { method:'POST', headers:authHeader(), body:JSON.stringify({ attemptId:state.attemptId, answers:state.answers }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const r = data.result;
    document.getElementById('result-band').textContent  = r.bandScore.toFixed(1);
    document.getElementById('result-total').textContent = `${r.correctCount}/${r.totalQuestions} câu đúng`;
    document.getElementById('r-correct').textContent    = r.correctCount;
    document.getElementById('r-wrong').textContent      = r.wrongCount;
    document.getElementById('r-skip').textContent       = r.skippedCount;
    document.getElementById('result-msg').textContent   = getBandMessage(r.bandScore);
    showScreen('result');
  } catch (err) { alert('Lỗi nộp bài: ' + err.message); state.submitted = false; }
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
    const res  = await fetch(`${API}/reading/attempt/${state.attemptId}/review`, { headers:authHeader() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const a = data.attempt;
    state.passages   = a.passages;
    state.isReview   = true;
    state.passageIdx = 0;
    document.getElementById('review-title').textContent     = a.testName;
    document.getElementById('review-band-badge').textContent= `Band Score: ${a.bandScore.toFixed(1)}`;
    buildPassageTabs('toolbar-passage-tabs-rv', true);
    renderCurrentPassage(true);
    renderQNav(true);
    setupDictionaryDouble('review-passage-inner');
    setTool('highlight');
    showScreen('review');
  } catch (err) { alert('Lỗi tải bài review: ' + err.message); }
}

async function onClickReview(attemptId) { state.attemptId = attemptId; await goToReview(); }

// ══════════════════════════════════════════════════════
// HIGHLIGHT
// ══════════════════════════════════════════════════════
function setupHighlight() {
  document.addEventListener('mouseup', () => {
    if (state.tool !== 'highlight') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const ap = state.isReview ? document.getElementById('review-passage-inner') : document.getElementById('passage-inner');
    if (!ap || !ap.contains(range.commonAncestorContainer)) return;
    const span = document.createElement('span'); span.className = 'hl';
    try { range.surroundContents(span); } catch {}
    sel.removeAllRanges();
  });
}

// ══════════════════════════════════════════════════════
// DICTIONARY
// ══════════════════════════════════════════════════════
function setupDictionaryDouble(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (el._dictHandler) el.removeEventListener('dblclick', el._dictHandler);
  el._dictHandler = async e => {
    if (state.tool !== 'dict') return;
    const word = window.getSelection()?.toString().trim();
    if (!word || word.includes(' ') || word.length < 2) return;
    e.preventDefault();
    await lookupWord(word);
  };
  el.addEventListener('dblclick', el._dictHandler);
}

async function lookupWord(word) {
  const popup = document.getElementById('dict-popup');
  if (!popup) return;
  const set = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
  set('dict-word', word); set('dict-phonetic','...'); set('dict-pos',''); set('dict-meaning','Đang tra...'); set('dict-example','');
  const sel = window.getSelection();
  let top = 200, left = 200;
  if (sel?.rangeCount) {
    const r = sel.getRangeAt(0).getBoundingClientRect();
    top  = Math.min(r.bottom + 8, window.innerHeight - 280);
    left = Math.min(r.left, window.innerWidth - 330);
    top  = Math.max(top, 8); left = Math.max(left, 8);
  }
  popup.style.top = top+'px'; popup.style.left = left+'px';
  popup.classList.remove('hidden');
  state.dictWord = word; state.dictMeaning = ''; state.dictExample = '';
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const entry = data[0], meaning = entry.meanings[0];
    const def = meaning.definitions.find(d => d.example) || meaning.definitions[0];
    set('dict-phonetic', entry.phonetic || entry.phonetics?.find(p=>p.text)?.text || '');
    set('dict-pos', meaning.partOfSpeech);
    set('dict-meaning', def.definition);
    set('dict-example', def.example ? `"${def.example}"` : '');
    state.dictMeaning = def.definition; state.dictExample = def.example || '';
  } catch { set('dict-meaning', 'Không tìm thấy định nghĩa.'); }
}

function closeDictPopup() { document.getElementById('dict-popup')?.classList.add('hidden'); }
function speakDictWord() {
  if (!state.dictWord) return;
  const u = new SpeechSynthesisUtterance(state.dictWord); u.lang = 'en-US'; u.rate = 0.8;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
}
async function saveVocab() {
  if (!state.dictWord) return; closeDictPopup();
  try {
    const res  = await fetch(`${API}/vocabbook`, { headers:authHeader() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    openBookPickerModal(data.books);
  } catch (err) { alert('Lỗi: ' + err.message); }
}
function openBookPickerModal(books) {
  const existing = document.getElementById('reading-book-picker'); if (existing) existing.remove();
  const modal = document.createElement('div'); modal.id = 'reading-book-picker'; modal.className = 'modal-overlay';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;';
  modal.innerHTML = `<div style="background:#fff;border-radius:16px;width:min(460px,95%);box-shadow:0 8px 32px rgba(0,0,0,.15);overflow:hidden">
    <div style="padding:18px 22px 0;display:flex;align-items:center;justify-content:space-between">
      <div><h3 style="font-size:16px;font-weight:700">Lưu vào sổ từ vựng</h3><div style="font-size:13px;color:#6b7280"><strong>${state.dictWord}</strong> – ${state.dictMeaning}</div></div>
      <button onclick="document.getElementById('reading-book-picker').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#9ca3af">×</button>
    </div>
    <div style="padding:14px 22px;max-height:280px;overflow-y:auto">
      ${books.map(b => `<div onclick="pickBookAndSave('${b._id}',this)" id="bpick-${b._id}"
        style="display:flex;align-items:center;gap:12px;padding:11px 13px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;margin-bottom:8px;transition:all .15s"
        onmouseover="this.style.borderColor='#3d8bff';this.style.background='#eff6ff'"
        onmouseout="this.style.borderColor='#e5e7eb';this.style.background='#fff'">
        <span style="font-size:20px">${b.emoji}</span>
        <div><div style="font-weight:700">${b.name}</div><div style="font-size:12px;color:#9ca3af">${b.totalWords} từ</div></div>
      </div>`).join('')}
    </div></div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}
async function pickBookAndSave(bookId, el) {
  document.querySelectorAll('[id^="bpick-"]').forEach(e => { e.style.borderColor='#e5e7eb'; e.style.background='#fff'; });
  el.style.borderColor='#e53935'; el.style.background='#fef2f2';
  try {
    const res  = await fetch(`${API}/vocabbook/${bookId}/words`, { method:'POST', headers:authHeader(), body:JSON.stringify({ word:state.dictWord, meaning:state.dictMeaning, example:state.dictExample, source:'reading' }) });
    const data = await res.json();
    document.getElementById('reading-book-picker')?.remove();
    showReadingToast(data.message || (data.success ? 'Đã lưu từ!' : 'Lỗi'), data.success);
  } catch (err) { showReadingToast('Lỗi: ' + err.message, false); }
}
function showReadingToast(msg, success = true) {
  const t = document.createElement('div'); t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:500;color:#fff;background:${success?'#166534':'#991b1b'};box-shadow:0 4px 16px rgba(0,0,0,.2)`;
  t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3000);
}

// ══════════════════════════════════════════════════════
// TOOL / SETTINGS / SPLITTER / HISTORY / EXIT / UTILS
// ══════════════════════════════════════════════════════
function setTool(tool) {
  state.tool = tool;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  if (tool==='highlight') document.querySelectorAll('#tool-hl,#tool-hl-rv').forEach(b => b?.classList.add('active'));
  else if (tool==='dict') document.getElementById('tool-dict')?.classList.add('active');
}
function toggleSettings() { document.getElementById('settings-panel')?.classList.toggle('hidden'); }
function toggleEyeProtection() { document.body.classList.toggle('eye-protection'); }
function setFontSize(size) {
  const map = { S:'13px', M:'15px', L:'17px' };
  document.documentElement.style.setProperty('--reading-font-size', map[size]);
  document.querySelectorAll('.fs-btn').forEach(b => b.classList.toggle('active', b.textContent.trim()===size));
}
function setupResizableSplitter(splitId, dividerId, leftId) {
  const split=document.getElementById(splitId), divider=document.getElementById(dividerId), left=document.getElementById(leftId);
  if (!split||!divider||!left) return;
  let dragging=false;
  divider.addEventListener('mousedown', () => { dragging=true; divider.classList.add('dragging'); document.body.style.cursor='col-resize'; document.body.style.userSelect='none'; });
  document.addEventListener('mousemove', e => { if (!dragging) return; const r=split.getBoundingClientRect(); let pct=((e.clientX-r.left)/r.width)*100; pct=Math.min(Math.max(pct,20),80); left.style.width=pct+'%'; });
  document.addEventListener('mouseup', () => { if(!dragging) return; dragging=false; divider.classList.remove('dragging'); document.body.style.cursor=''; document.body.style.userSelect=''; });
}
async function showHistoryModal() {
  try {
    const res  = await fetch(`${API}/reading/history`, { headers:authHeader() });
    const data = await res.json();
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = data.history.length ? data.history.map(h => `
      <tr><td>${h.testId?.name||'–'}</td><td>${formatDate(h.endTime)}</td><td>${formatDuration(h.duration)}</td>
      <td>${h.totalQuestions}</td><td style="color:#43a047;font-weight:600">${h.correctCount}</td>
      <td style="color:#e53935;font-weight:600">${h.wrongCount}</td><td style="color:#9ca3af">${h.skippedCount}</td>
      <td class="band-cell">${h.bandScore?.toFixed(1)}</td>
      <td><button class="btn-review-sm" onclick="onClickReview('${h._id}');closeModal('modal-history')">Xem lại</button></td></tr>`).join('')
      : '<tr><td colspan="9" style="text-align:center;color:#9ca3af;padding:20px">Chưa có lịch sử</td></tr>';
    openModal('modal-history');
  } catch (err) { alert('Lỗi: ' + err.message); }
}
function confirmExit() { openModal('modal-exit'); }
function forceExit() { closeModal('modal-exit'); clearInterval(state.timer); window.onbeforeunload=null; state.submitted=true; showScreen('list'); }
function formatDate(s) { if (!s) return '–'; const d=new Date(s); return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function formatDuration(s) { if (!s) return '–'; return `${Math.floor(s/60)}m${pad(s%60)}s`; }
function pad(n) { return String(n).padStart(2,'0'); }
function showMsg(id, text, type) { const el=document.getElementById(id); el.textContent=text; el.className=`key-msg ${type}`; el.classList.remove('hidden'); }
function hideMsg(id) { const el=document.getElementById(id); if(el){el.classList.add('hidden');el.textContent='';} }
(function initNav() {
  const user = JSON.parse(localStorage.getItem('user')||'{}');
  const name = user.firstName ? `${user.firstName} ${user.lastName}` : user.username || '';
  const el   = document.getElementById('userName');
  if (el && name) el.textContent = `👋 ${name}`;
})();
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='login.html'; }

// Global exports
window.showScreen=showScreen; window.openModal=openModal; window.closeModal=closeModal;
window.onClickTest=onClickTest; window.onClickReview=onClickReview;
window.verifyAndStart=verifyAndStart; window.formatKeyInput=formatKeyInput;
window.filterTests=filterTests; window.confirmSubmit=confirmSubmit; window.submitExam=submitExam;
window.confirmExit=confirmExit; window.forceExit=forceExit; window.goToReview=goToReview;
window.showHistoryModal=showHistoryModal; window.toggleSettings=toggleSettings;
window.toggleEyeProtection=toggleEyeProtection; window.setFontSize=setFontSize; window.setTool=setTool;
window.pickRadio=pickRadio; window.pickMatchAnswer=pickMatchAnswer;
window.toggleCheckboxReading=toggleCheckboxReading; window.saveTextAnswer=saveTextAnswer;
window.dzDragOver=dzDragOver; window.dzDrop=dzDrop; window.dzClick=dzClick; window.clearDz=clearDz;
window.scrollToQuestion=scrollToQuestion; window.switchPassage=switchPassage;
window.closeDictPopup=closeDictPopup; window.speakDictWord=speakDictWord;
window.saveVocab=saveVocab; window.pickBookAndSave=pickBookAndSave; window.logout=logout;