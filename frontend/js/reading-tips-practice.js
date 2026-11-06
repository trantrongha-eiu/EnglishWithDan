'use strict';
// Reading Tips → "🎯 Luyện tập" section at the bottom of a tip.
//
// Loaded on reading.html after reading-v2.js / reading-tips.js; uses their
// globals `apiFetch` (auth header + 401 handling) and `escHtml`
// (js/shared/utils.js). Deliberately does NOT reuse reading-v2.js's
// question renderers: those read/write the live exam's global `state` and
// persist it to localStorage (resume-exam banner), which a mini-practice
// must never touch. It reuses their CSS classes instead (question-item,
// q-badge, radio-opt, fill-input, q-explanation…) so it looks the same.
//
// Nothing loads until the student clicks "Bắt đầu luyện tập". The practice
// payload carries no answers — each answer is graded by
// POST /api/reading-tips/:lessonKey/practice/check, which is also what
// reveals the answer, the explanation and the evidence.
//
// No practice history is kept server-side (by design): the current
// practice, its answers and the last/best score are saved in this
// browser's localStorage only, per account.
(function () {
  const COPY = {
    skimming: {
      name: 'Skimming',
      desc: 'Thử áp dụng kỹ thuật vừa học: đọc lướt đoạn văn trích từ đề thật rồi chọn ý chính / mục đích của đoạn. Chỉ đọc phần được đánh dấu — không cần đọc cả bài.',
    },
    scanning: {
      name: 'Scanning',
      desc: 'Tìm thật nhanh tên riêng, con số, năm… trong một bài đọc thật để điền đáp án. Đừng đọc cả bài trước — xác định keyword rồi scan.',
    },
    'keyword-to-paraphrase': {
      name: 'Keyword → Paraphrase',
      desc: 'Xem keyword trong câu hỏi thật, rồi bôi chọn cụm có nghĩa tương đương (paraphrase) trong câu của bài đọc — các cặp lấy từ lời giải của đề.',
    },
    'skim-scan-workflow': {
      name: 'Quy trình làm bài',
      desc: 'Làm trọn 7 bước trên một bài đọc thật: đọc tiêu đề → skim → ý chính → đọc câu hỏi → tìm keyword → scan → kiểm tra evidence.',
    },
    'true-false-not-given': {
      name: 'True / False / Not Given',
      desc: 'Làm các câu T/F/NG thật trong một bài đọc từ đề: tìm thông tin, so sánh ý nghĩa rồi chọn TRUE / FALSE / NOT GIVEN.',
    },
    'yes-no-not-given': {
      name: 'Yes / No / Not Given',
      desc: 'Xác định quan điểm của tác giả trong một bài đọc thật rồi chọn YES / NO / NOT GIVEN.',
    },
    'matching-headings': {
      name: 'Matching Headings',
      desc: 'Chọn heading cho từng đoạn của một bài đọc thật — đoạn cần làm được đánh dấu sẵn, chỉ cần skim đoạn đó.',
    },
    'matching-information': {
      name: 'Matching Information',
      desc: 'Tìm đoạn văn (A, B, C…) chứa từng thông tin trong một bài đọc thật.',
    },
    'matching-features': {
      name: 'Matching Features',
      desc: 'Ghép từng thông tin với đúng người / nhóm / đặc điểm trong một bài đọc thật.',
    },
    'sentence-summary-note-completion': {
      name: 'Sentence / Summary / Note Completion',
      desc: 'Điền từ vào câu, ghi chú, bảng của một bài đọc thật — chép đúng từ trong bài, đúng giới hạn số từ.',
    },
    'multiple-choice': {
      name: 'Multiple Choice',
      desc: 'Trả lời câu hỏi trắc nghiệm của một bài đọc thật dựa trên evidence trong bài, không dựa vào hiểu biết chung.',
    },
    'short-answer-questions': {
      name: 'Short Answer Questions',
      desc: 'Trả lời câu hỏi ngắn bằng từ lấy từ một bài đọc thật, đúng giới hạn số từ.',
    },
  };
  // The "Trước khi làm" guide, the worked-example / hint step names and the
  // scan steps come with the practice (practice.guide — one copy on the
  // server, also printed in the teacher's handout).
  const guideOf = () => (st && st.practice && st.practice.guide) || { steps: [] };
  const FOCUS_LABEL = {
    main_idea: 'Main idea — Ý chính của đoạn',
    paragraph_purpose: 'Paragraph purpose — Mục đích của đoạn',
    overall_topic: 'Overall topic — Chủ đề toàn bài',
  };
  let st = null;        // current practice state (null = entry card only)
  let timerHandle = null;
  // Bumped whenever the panel changes hands (another tip, a new load, close)
  // so a late response for an earlier request is dropped.
  let loadSeq = 0;
  const LOAD_TIMEOUT_MS = 45000;
  const CHECK_TIMEOUT_MS = 30000;
  const SLOW_NOTICE_MS = 6000;

  // apiFetch with a timeout (the server can take a while to wake up).
  async function fetchWithTimeout(url, opts, ms) {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl && setTimeout(() => ctrl.abort(), ms);
    try {
      return await apiFetch(url, ctrl ? { ...opts, signal: ctrl.signal } : opts);
    } finally {
      clearTimeout(timer);
    }
  }

  // Stacked (phone / tablet) layouts: the passage sits above the question,
  // so evidence and hints get a link back up to it (hidden side by side).
  const JUMP_HTML = '<button type="button" class="rtp-link rtp-jump" data-act="show-passage">↑ Xem trong bài đọc</button>';

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  // ── What this page saves (the store itself: js/shared/tips-practice-shell.js) ──

  function itemsOf(practice) {
    if (!practice) return null;
    return practice.kind === 'skimming' || practice.kind === 'paraphrase' ? practice.items : practice.questions;
  }

  // Per-question state that survives a reload (timers / in-flight flags don't).
  const SAVED_ANSWER_FIELDS = ['value', 'result', 'seconds', 'hint', 'viewed', 'gStep', 'hintLevel', 'sel', 'kw', 'kwDone', 'loc', 'wfStep'];
  function savedAnswer(a) {
    const out = {};
    SAVED_ANSWER_FIELDS.forEach(k => { if (a && a[k] !== undefined) out[k] = a[k]; });
    if (out.value == null) out.value = '';
    if (out.result === undefined) out.result = null;
    return out;
  }

  // ── Text highlighting (plain-text paragraphs from the server) ─────────

  // Case-insensitive whole-term occurrences of `term` in `text` (quotes and
  // whitespace matched loosely). No lookbehind — older Safari lacks it.
  function findTerm(text, term) {
    const src = String(term).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/['’‘]/g, "['’‘]").replace(/\s+/g, '\\s+');
    if (!src) return [];
    const re = new RegExp('(^|[^\\p{L}\\p{N}])(' + src + ')(?![\\p{L}\\p{N}])', 'giu');
    const out = [];
    let m;
    while ((m = re.exec(text))) {
      const start = m.index + m[1].length;
      out.push({ start, end: start + m[2].length });
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out;
  }

  // Renders text with (possibly overlapping) ranges → <span class="…">.
  function highlight(text, ranges) {
    const cuts = new Set([0, text.length]);
    ranges.forEach(r => { cuts.add(Math.max(0, r.start)); cuts.add(Math.min(text.length, r.end)); });
    const pts = [...cuts].sort((a, b) => a - b);
    let html = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (a === b) continue;
      const cls = ranges.filter(r => r.start <= a && r.end >= b).map(r => r.cls);
      const seg = esc(text.slice(a, b));
      html += cls.length ? `<span class="${[...new Set(cls)].join(' ')}">${seg}</span>` : seg;
    }
    return html;
  }

  function paraHtml(p, opts) {
    const ranges = [];
    const isTarget = opts.target != null && opts.target === p.i;
    if (opts.lead && p.leadEnd > 0 && !p.heading) ranges.push({ start: 0, end: p.leadEnd, cls: 'rtp-lead' });
    // the sentence carrying the paragraph's main idea (headings) — not
    // always its first sentence
    if (opts.key && opts.key.paragraphIndex === p.i) {
      const at = p.text.indexOf(opts.key.text);
      if (at !== -1) ranges.push({ start: at, end: at + opts.key.text.length, cls: 'rtp-lead' });
    }
    if (opts.hitsIn == null || opts.hitsIn === p.i) {
      (opts.hits || []).forEach(t => findTerm(p.text, t).forEach(r => ranges.push({ ...r, cls: 'rtp-hit' })));
    }
    if (opts.evidence && opts.evidence.paragraphIndex === p.i) {
      const at = p.text.indexOf(opts.evidence.text);
      if (at !== -1) ranges.push({ start: at, end: at + opts.evidence.text.length, cls: 'rtp-ev' });
    }
    // a lettered passage shows its letters only: the paragraphs after a
    // letter belong to that section (a bare number reads like a question no.)
    const lettered = opts.lettered != null ? opts.lettered : !!(st && st.practice && (st.practice.paragraphs || []).some(x => x.label));
    const tag = p.label || (lettered ? '' : p.n);
    const label = p.heading || !tag ? '' : `<span class="rtp-para-label">${esc(tag)}</span>`;
    const cls = ['rtp-para', p.heading ? 'rtp-para-heading' : '', !p.heading && !tag ? 'rtp-para-cont' : '', opts.dim && !p.heading ? 'rtp-dim' : '',
      isTarget ? 'rtp-para-target' : '',
      opts.evidence && opts.evidence.paragraphIndex === p.i ? 'rtp-para-ev' : ''].filter(Boolean).join(' ');
    const act = opts.clickable && !p.heading ? ` data-act="wf-loc" ${KEY_ATTRS}` : '';
    return `<p class="${cls}" data-pi="${p.i}"${act}>${label}${highlight(p.text, ranges)}</p>`;
  }

  // Scrolls only the passage pane (it's position:relative, so offsetTop is
  // relative to it) — never jumps the whole page. Returns whether it found
  // the target.
  function scrollPassageTo(panel, selector) {
    const box = panel && panel.querySelector('.rtp-passage-scroll');
    const el = box && box.querySelector(selector);
    if (!el) return false;
    box.scrollTop = Math.max(0, el.offsetTop - 40);
    return true;
  }

  // ── Entry card + lifecycle, persistence, scrolling — js/shared/tips-practice-shell.js ──

  const {
    esc, KEY_ATTRS, errorMessage, announce, revealPanel, revealEl, explanationBlock,
    persist, persistSoon, recordScore,
    supports, mount, renderEntry, panelEl, showPanelState, start, confirmNewPractice, resume, headerHtml,
  } = window.TipsPracticeShell.create({
    prefix: 'rtp', icon: '🎯', copy: COPY, storePrefix: 'rtp_v1_',
    getSt: () => st, setSt: (v) => { st = v; },
    nextSeq: () => ++loadSeq, curSeq: () => loadSeq,
    stopTimer: () => stopTimer(),
    fetchPractice: (lessonKey) => fetchWithTimeout(`/api/reading-tips/${encodeURIComponent(lessonKey)}/practice`, {}, LOAD_TIMEOUT_MS),
    slowNoticeMs: SLOW_NOTICE_MS,
    itemsOf, savedAnswer,
    freshState: (practice, items) => ({
      showFull: false, introSeen: false, finished: false, counted: false,
      answers: freshAnswers(items),
      stage: 0, main: { value: '', result: null }, guess: '', hl: {},
    }),
    // Timers of unanswered questions restart; checked answers keep their result and time.
    restoreState: (rec) => ({
      showFull: !!rec.showFull, introSeen: !!rec.introSeen, finished: !!rec.finished, counted: !!rec.counted,
      answers: rec.answers.map(savedAnswer),
      stage: Number(rec.stage) || 0,
      main: rec.main ? savedAnswer(rec.main) : { value: '', result: null },
      guess: rec.guess || '',
      hl: rec.hl && typeof rec.hl === 'object' ? rec.hl : {},
    }),
    snapshot: (s) => ({
      showFull: s.showFull,
      introSeen: s.introSeen,
      finished: s.finished,
      counted: s.counted,
      stage: s.stage,
      main: s.main ? savedAnswer(s.main) : null,
      guess: s.guess || '',
      hl: s.hl,
    }),
    isBusy: (x) => hasProgress(x.answers, x.main && x.main.result),
    resumeWhere: (rec, items) => ` (Câu ${Math.min((rec.idx || 0) + 1, items.length)}/${items.length})`,
    isDone: (i) => isDone(i),
    enterSel: '.rtp-input',
    onInput: (e) => onInput(e),
    onClick: (e, lesson) => onClick(e, lesson),
    checkCurrent: () => checkCurrent(),
    renderQuestion: () => renderQuestion(),
    renderResult: () => renderResult(),
    afterPanelState: () => applyHl(),
  });

  function onInput(e) {
    if (e.target.matches('.rtp-input')) {
      activeAnswer().value = e.target.value;
      syncCheckBtn();
      persistSoon();
    } else if (e.target.matches('.rtp-wf-guess')) {
      st.guess = e.target.value;
      persistSoon();
    }
  }

  // ── Student highlights ("Bôi màu", the same tool as a "lẻ" practice) ──
  //
  // The panel is re-rendered wholesale on every click, so the student's
  // highlights are kept in st.hl as text offsets (js/shared/highlight-store.js)
  // per highlightable block and re-applied after each render: the passage
  // ('p'; every skimming item has its own: 's<idx>') and the question stem
  // ('q<idx>'; the workflow's main-idea question: 'qmain'). The tool itself
  // is reading-v2.js's (setTool / state.tool), so H, Esc and the cursor
  // behave as everywhere else on the page.
  const HL_ROOTS = '.rtp-passage-scroll, .q-text';
  let hlOwn = false;          // tool state when reading-v2.js isn't loaded
  let suppressClick = false;  // the click that ends a highlighting drag

  function hlOn() {
    return typeof state !== 'undefined' && state ? state.tool === 'highlight' : hlOwn;
  }

  function toggleHl() {
    if (typeof setTool === 'function') setTool('highlight');
    else hlOwn = !hlOwn;
    const btn = document.getElementById('rtp-tool-hl');
    if (btn) btn.classList.toggle('active', hlOn());
  }

  function hlBtnHtml() {
    return `<button type="button" class="tool-btn rtp-hl-btn${hlOn() ? ' active' : ''}" id="rtp-tool-hl" data-act="hl-tool"
      title="Bật rồi bôi chọn chữ trong bài đọc / câu hỏi để tô màu. Bấm vào chỗ đã tô để đổi màu hoặc xoá.">
      <i class="fas fa-highlighter"></i> <small>Bôi màu (H)</small></button>`;
  }

  function hlKeyOf(el) {
    if (el.matches('.rtp-passage-scroll')) return st.kind === 'skimming' ? `s${st.idx}` : 'p';
    return st.kind === 'workflow' && wfStage() === 'main' ? 'qmain' : `q${st.idx}`;
  }

  function applyHl() {
    const HS = window.HighlightStore;
    const panel = panelEl();
    if (!st || !HS || !panel) return;
    panel.querySelectorAll(HL_ROOTS).forEach(el => {
      const key = hlKeyOf(el);
      el.dataset.hlKey = key;
      if (st.hl[key]) HS.apply(el, st.hl[key]);
    });
  }

  // Reads the highlights on screen back into st.hl.
  function captureHl() {
    const HS = window.HighlightStore;
    const panel = panelEl();
    if (!st || !HS || !panel) return;
    panel.querySelectorAll('[data-hl-key]').forEach(el => {
      const ranges = HS.serialize(el);
      if (ranges.length) st.hl[el.dataset.hlKey] = ranges;
      else delete st.hl[el.dataset.hlKey];
    });
  }

  document.addEventListener('mouseup', (e) => {
    if (!st || !hlOn() || !window.HighlightStore) return;
    if (e.target.closest && e.target.closest('input, textarea, select, button, .radio-opt, .tfng-opt')) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const common = range.commonAncestorContainer;
    const root = (common.nodeType === 1 ? common : common.parentElement).closest('[data-hl-key]');
    const panel = panelEl();
    if (!root || !panel || !panel.contains(root)) return;
    const text = range.toString();
    if (!text.trim()) return;
    const before = document.createRange();
    before.selectNodeContents(root);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    window.HighlightStore.apply(root, [[start, start + text.length, '', text]]);
    sel.removeAllRanges();
    // (a drag that ends on a clickable paragraph must not also pick it)
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    captureHl();
    persistSoon();
  });

  // Re-colored / removed by js/shared/highlight-store.js.
  document.addEventListener('hl:changed', () => {
    if (!st) return;
    captureHl();
    persistSoon();
  });

  // Answered anything in the practice that a new one would replace?
  function hasProgress(answers, extra) {
    return (answers || []).some(a => a && (a.result || a.viewed)) || !!extra;
  }

  function freshAnswers(items) {
    return items.map(() => ({ value: '', result: null, seconds: null, hint: false }));
  }
  // ── Question screens ──────────────────────────────────────────────────

  // Phase 3 "I do": the worked example isn't answered — it counts as done
  // once walked through, and is left out of the score.
  const isExample = (i) => !!(st.items[i] && st.items[i].guided && st.items[i].guided.mode === 'example');
  const isDone = (i) => !!(st.answers[i] && (st.answers[i].result || (isExample(i) && st.answers[i].viewed)));

  function feedbackHtml(a, extra) {
    const r = a.result;
    if (!r) return '';
    const answerLine = r.isCorrect ? '' : ` — Đáp án: <strong>${esc(extra.correctLabel || r.correctAnswer)}</strong>`;
    return `<div class="rtp-feedback ${r.isCorrect ? 'ok' : 'bad'}">
      <div class="q-correct-ans ${r.isCorrect ? 'right' : 'wrong'}">${r.isCorrect ? '✓ Chính xác!' : '✗ Chưa đúng'}${answerLine}</div>
      ${extra.timeLine || ''}
      ${r.evidence && !extra.noEvidence ? `<div class="rtp-evidence"><div class="rtp-evidence-label">📍 Evidence — đã tô xanh lá trong bài</div>“${esc(r.evidence.text)}”${JUMP_HTML}</div>` : ''}
      ${r.explanation ? explanationBlock(r.explanation, { open: !r.isCorrect, dropQuote: !!(r.evidence && !extra.noEvidence) }) : ''}
    </div>`;
  }

  function navHtml() {
    const a = st.answers[st.idx];
    const done = isDone(st.idx);
    const last = st.idx === st.items.length - 1;
    const allDone = st.answers.every((x, i) => isDone(i));
    const checkBtn = done || isExample(st.idx) ? ''
      : `<button type="button" class="rtp-btn rtp-btn-primary" data-act="check" ${String(a.value || '').trim() ? '' : 'disabled'}>Kiểm tra</button>`;
    const firstOpen = st.answers.findIndex((x, i) => !isDone(i));
    let nextBtn;
    if (!last) nextBtn = `<button type="button" class="rtp-btn ${done ? 'rtp-btn-primary' : ''}" data-act="next">Câu tiếp →</button>`;
    else if (allDone) nextBtn = `<button type="button" class="rtp-btn rtp-btn-primary" data-act="finish">Xem kết quả 🎉</button>`;
    else if (done) nextBtn = `<button type="button" class="rtp-btn rtp-btn-primary" data-act="goto" data-idx="${firstOpen}">Làm câu còn lại →</button>`;
    else nextBtn = '';
    return `<div class="rtp-nav">
      <button type="button" class="rtp-btn" data-act="prev" ${st.idx === 0 ? 'disabled' : ''}>← Câu trước</button>
      <div class="rtp-nav-right">${checkBtn}${nextBtn}</div>
    </div>`;
  }

  function renderQuestion() {
    stopTimer();
    if (st.kind === 'skimming') renderSkim();
    else if (st.kind === 'scanning') renderScan();
    else if (st.kind === 'paraphrase') renderParaphrase();
    else if (st.kind === 'workflow') renderWorkflow();
    else if (!st.introSeen) renderTypeIntro();
    else renderTypeQuestion();
  }

  function renderSkim() {
    const it = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    const whole = it.scope === 'passage';
    const words = it.paragraphs.reduce((s, p) => s + (p.heading ? 0 : p.text.split(/\s+/).length), 0);
    // Skim pace ≈ 4 words/second for one paragraph; a whole passage is
    // topic sentences only.
    const budget = whole ? 90 : Math.min(60, Math.max(20, Math.round(words / 4)));
    if (!r && a.startedAt == null) a.startedAt = Date.now();
    const lettered = it.paragraphs.some(x => x.label);
    const paras = it.paragraphs.map(p => paraHtml(p, {
      lead: true, dim: whole && !st.showFull && !r, evidence: r && r.evidence, lettered,
    })).join('');
    const tip = whole
      ? 'Chỉ đọc câu đầu (tô vàng) của mỗi đoạn để nắm chủ đề chung — phần còn lại đã làm mờ.'
      : 'Đọc câu chủ đề (tô vàng) rồi lướt phần còn lại — tìm ý CHÍNH, bỏ qua ví dụ và số liệu.';
    const opts = it.question.options.map((o, i) => {
      const L = String.fromCharCode(65 + i);
      let cls = a.value === L ? 'selected' : '';
      if (r) cls = L === String(r.correctAnswer).toUpperCase() ? 'correct-ans' : (a.value === L ? 'wrong-ans' : '');
      return `<label class="radio-opt ${cls}" ${r ? '' : `data-act="pick" data-val="${L}" ${KEY_ATTRS} aria-pressed="${a.value === L}"`}>
        <span class="radio-dot"></span><span class="radio-letter">${L}.</span> ${esc(o)}</label>`;
    }).join('');
    const correctLabel = r ? `${String(r.correctAnswer).toUpperCase()}. ${it.question.options[String(r.correctAnswer).toUpperCase().charCodeAt(0) - 65] || ''}` : '';

    showPanelState(headerHtml(`${esc(it.sourceName)} · ${esc(it.passageTitle)}`)
      + `<div class="rtp-split">
        <div class="rtp-passage">
          <div class="rtp-passage-head">
            <span class="rtp-chip">${esc(it.targetLabel)}</span>
            ${r ? '' : `<span class="rtp-timer" id="rtp-timer">⏱ ${fmtTime(budget - (Date.now() - a.startedAt) / 1000)}</span>`}
            ${whole && !r ? `<button type="button" class="rtp-link" data-act="toggle-full">${st.showFull ? 'Chỉ hiện câu chủ đề' : 'Hiện toàn văn'}</button>` : ''}
            ${hlBtnHtml()}
          </div>
          <div class="rtp-tip">💡 ${esc(tip)}</div>
          <div class="rtp-passage-scroll">${paras}</div>
        </div>
        <div class="rtp-question">
          <div class="rtp-focus">${esc(FOCUS_LABEL[it.focus] || '')}</div>
          <div class="question-item">
            <div class="q-num-label"><span class="q-badge">${it.questionNumber}</span></div>
            <div class="q-text">${esc(it.question.text)}</div>
            <div class="q-options">${opts}</div>
          </div>
          ${feedbackHtml(a, { correctLabel })}
          ${navHtml()}
        </div>
      </div>`);
    if (r && r.evidence) scrollPassageTo(panelEl(), '.rtp-ev') || scrollPassageTo(panelEl(), '.rtp-para-ev');
    if (!r) startCountdown(budget, a.startedAt);
  }

  // Suggested skim time — a nudge, never a hard stop.
  function startCountdown(budget, t0) {
    const tick = () => {
      const el = document.getElementById('rtp-timer');
      if (!el) { stopTimer(); return; }
      const left = budget - (Date.now() - t0) / 1000;
      if (left <= 0) {
        el.textContent = '⏱ Hết thời gian gợi ý — chọn đáp án đi!';
        el.classList.add('late');
        stopTimer();
      } else {
        el.textContent = '⏱ ' + fmtTime(left);
      }
    };
    tick();
    if (!document.querySelector('#rtp-timer.late')) timerHandle = setInterval(tick, 500);
  }

  function renderScan() {
    const pr = st.practice;
    const q = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    if (!r && a.startedAt == null) a.startedAt = Date.now();
    const hits = a.hint && !r ? q.anchors : [];
    const paras = pr.paragraphs.map(p => paraHtml(p, { hits, evidence: r && r.evidence })).join('');
    const stemRanges = [];
    q.anchors.forEach(t => findTerm(q.text, t).forEach(x => stemRanges.push({ ...x, cls: 'rtp-anchor' })));
    const anchorChips = q.anchors.length
      ? `<div class="rtp-anchors">🔎 Keyword để scan: ${q.anchors.map(t => `<span class="rtp-anchor-chip">${esc(t)}</span>`).join('')}</div>`
      : `<div class="rtp-anchors">🔎 Không có tên riêng/số rõ ràng — dự đoán loại thông tin cần điền (số? năm? danh từ?) rồi scan.</div>`;
    const timeLine = r && a.seconds != null ? `<div class="rtp-time">⏱ Bạn tìm ra trong ${fmtTime(a.seconds)}</div>` : '';
    const inputCls = r ? (r.isCorrect ? 'correct' : 'incorrect') : '';

    showPanelState(headerHtml(`${esc(pr.sourceName)} · ${esc(pr.passageTitle)}`)
      + guideHtml(guideOf(), st.idx === 0 && !r)
      + `<div class="rtp-split">
        <div class="rtp-passage">
          <div class="rtp-passage-head"><span class="rtp-chip">${esc(pr.passageTitle)}</span>
            ${r ? '' : `<span class="rtp-timer" id="rtp-timer">⏱ 0:00</span>`}${hlBtnHtml()}</div>
          <div class="rtp-passage-scroll">${paras}</div>
        </div>
        <div class="rtp-question">
          <div class="question-item">
            <div class="q-num-label"><span class="q-badge">${q.questionNumber}</span></div>
            <div class="q-text">${highlight(q.text, stemRanges)}</div>
            ${anchorChips}
            ${q.wordLimit ? `<div class="rtp-limit">✍️ Giới hạn: <strong>${esc(q.wordLimit)}</strong></div>` : ''}
            <input class="fill-input rtp-input ${inputCls}" value="${esc(a.value)}" ${r ? 'readonly' : ''}
                   placeholder="Nhập đáp án..." autocomplete="off" spellcheck="false" />
            ${r || !q.anchors.length ? '' : `<button type="button" class="rtp-link rtp-hint-btn ask-lulu" data-act="hint"><span class="ask-lulu-ic"></span> Hỏi Lulu vị trí keyword</button>${a.hint ? JUMP_HTML : ''}`}
          </div>
          ${feedbackHtml(a, { timeLine })}
          ${navHtml()}
        </div>
      </div>`);
    const panel = panelEl();
    if (r && r.evidence) scrollPassageTo(panel, '.rtp-ev') || scrollPassageTo(panel, '.rtp-para-ev');
    else if (hits.length) scrollPassageTo(panel, '.rtp-hit');
    if (!r) {
      timerHandle = setInterval(() => {
        const el = document.getElementById('rtp-timer');
        if (!el) { stopTimer(); return; }
        el.textContent = '⏱ ' + fmtTime((Date.now() - a.startedAt) / 1000);
      }, 500);
      const input = panel && panel.querySelector('.rtp-input');
      if (input && window.matchMedia('(min-width: 900px)').matches) input.focus({ preventScroll: true });
    }
  }

  // ── Question-type practices (8 "Chiến thuật theo dạng bài" tips) ─────

  const sameKey = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

  function guideHtml(g, open) {
    if (!g || !g.steps || !g.steps.length) return '';
    return `<details class="rtp-guide" ${open ? 'open' : ''}>
      <summary>📋 ${esc(g.title || 'Cách làm')}</summary>
      ${g.defs ? `<div class="rtp-defs">${g.defs.map(([k, v]) => `<div class="rtp-def"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>` : ''}
      <ol>${g.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${g.warning ? `<div class="rtp-warning">⚠️ ${esc(g.warning)}</div>` : ''}
    </details>`;
  }

  // Mini tutorial before the first question.
  function renderTypeIntro() {
    const pr = st.practice;
    const g = guideOf();
    const name = COPY[st.lesson.lessonKey].name;
    showPanelState(headerHtml(`${esc(pr.sourceName)} · ${esc(pr.passageTitle)}`, { dots: false })
      + `<div class="rtp-intro">
        <div class="rtp-intro-title">📋 Trước khi làm: ${esc(g.title || `cách làm dạng ${name}`)}</div>
        ${g.defs ? `<div class="rtp-defs">${g.defs.map(([k, v]) => `<div class="rtp-def"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>` : ''}
        <ol class="rtp-steps">${g.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        ${g.warning ? `<div class="rtp-warning">⚠️ ${esc(g.warning)}</div>` : ''}
        ${st.items[0] && st.items[0].guided ? `<div class="rtp-flow">
          <span class="rtp-flow-step ex"><b>Câu 1</b> xem mẫu</span>
          <span class="rtp-flow-step we"><b>Câu 2</b> có gợi ý</span>
          <span class="rtp-flow-step you"><b>Câu 3–${st.items.length}</b> tự làm</span>
        </div>` : ''}
        <div class="rtp-intro-foot">
          <span class="rtp-muted">${st.items.length} câu ${esc(name)} lấy nguyên từ đề thật, đúng thứ tự trong đề.</span>
          <button type="button" class="rtp-btn rtp-btn-primary" data-act="intro-done">Bắt đầu làm bài →</button>
        </div>
      </div>`);
  }

  // Choices / text box for one question. `shownKey` marks the key as the
  // answer without a graded result (the worked example's last step).
  function answerInputHtml(q, a, shownKey) {
    const r = a.result;
    const locked = !!r || shownKey != null;
    if (q.input === 'text') {
      const cls = r ? (r.isCorrect ? 'correct' : 'incorrect') : (shownKey != null ? 'correct' : '');
      const val = !r && shownKey != null ? String(shownKey).split('/')[0].trim() : a.value;
      return `<input class="fill-input rtp-input ${cls}" value="${esc(val)}" ${locked ? 'readonly' : ''}
        placeholder="Nhập đáp án..." autocomplete="off" spellcheck="false" />`;
    }
    const choices = q.choices || [];
    const correct = r ? r.correctAnswer : shownKey;
    const pickCls = (c) => {
      if (correct == null) return sameKey(a.value, c.key) ? 'selected' : '';
      if (sameKey(correct, c.key)) return 'correct-ans';
      return r && sameKey(a.value, c.key) ? 'wrong-ans' : '';
    };
    const attrs = (c) => (locked ? '' : `data-act="pick" data-val="${esc(c.key)}" ${KEY_ATTRS} aria-pressed="${sameKey(a.value, c.key)}"`);
    if (choices.every(c => !c.label)) {
      // TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN, paragraph letters.
      const letters = choices.every(c => c.key.length === 1);
      return `<div class="tfng-opts rtp-key-opts${letters ? ' rtp-letter-opts' : ''}">${choices.map(c =>
        `<div class="tfng-opt ${pickCls(c)}" ${attrs(c)}>${esc(c.key)}</div>`).join('')}</div>`;
    }
    return (q.listTitle ? `<div class="rtp-list-title">${esc(q.listTitle)}</div>` : '')
      + `<div class="q-options">${choices.map(c => `<label class="radio-opt ${pickCls(c)}" ${attrs(c)}>
        <span class="radio-dot"></span><span class="radio-letter">${esc(c.key)}.</span> ${esc(c.label)}</label>`).join('')}</div>`;
  }

  function keyLabel(q, key) {
    const c = (q.choices || []).find(x => sameKey(x.key, key));
    if (c) return c.label ? `${c.key}. ${c.label}` : c.key;
    return String(key || '').split('/').map(s => s.trim()).filter(Boolean).join(' / ');
  }

  // "đoạn C" for any paragraph of section C (a lettered passage names its
  // sections, not its paragraphs — and "đoạn 12" reads like question 12).
  function paraName(pr, index) {
    const list = pr.paragraphs;
    const at = list.findIndex(x => x.i === index);
    if (at === -1) return 'bài đọc';
    const p = list[at];
    if (p.label) return `đoạn ${p.label}`;
    if (list.some(x => x.label)) {
      for (let k = at - 1; k >= 0; k--) if (list[k].label) return `đoạn ${list[k].label}`;
      return 'phần mở đầu';
    }
    return p.n ? `đoạn ${p.n}` : 'phần mở đầu';
  }

  const chipsHtml = (list) => list.map(k => `<span class="rtp-anchor-chip">${esc(k)}</span>`).join(' ');

  // ── Phase 3: "I do" (worked example) / "We do" (hints) / "You do" ─────

  function exampleSteps(pr, q, g) {
    const where = paraName(pr, g.evidence.paragraphIndex);
    const answer = keyLabel(q, g.answer);
    const analysis = g.explanation ? explanationBlock(g.explanation, { open: true, dropQuote: true }) : '';
    const t = stepNames(guideOf().example, pr.questionType === 'headings'
      ? ['Tìm câu then chốt của đoạn', 'Tóm tắt ý chính', 'So với danh sách heading', 'Kết luận']
      : ['Tìm keyword', 'Scan bài đọc', 'Đọc câu chứa evidence', 'So sánh & kết luận'], 'BƯỚC');
    if (pr.questionType === 'headings') {
      return [
        [t[0], `Ý chính của ${esc(where)} (viền đỏ) nằm ở câu tô vàng: “${esc(g.evidence.text)}” <span class="rtp-muted">— câu then chốt không phải lúc nào cũng là câu đầu.</span>`],
        [t[1], 'Tự hỏi: cả đoạn đang nói về điều gì? Bỏ qua ví dụ, số liệu, tên riêng.'],
        [t[2], 'Tìm heading diễn đạt lại đúng ý chính đó; loại heading chỉ khớp một chi tiết hoặc chỉ lặp lại một từ trong đoạn.'],
        [t[3], `${analysis}<div class="rtp-answer-line">→ Đáp án: <strong>${esc(answer)}</strong></div>`],
      ];
    }
    const kw = g.keywords.length ? chipsHtml(g.keywords) : '<i>(không có tên riêng / số — dùng các từ nội dung chính)</i>';
    const verdict = q.input === 'text'
      ? `→ Chép đúng từ trong bài: <strong>${esc(answer)}</strong>${q.wordLimit ? ` (giới hạn: ${esc(q.wordLimit)})` : ''}`
      : `→ Đáp án: <strong>${esc(answer)}</strong>`;
    return [
      [t[0], `Gạch chân keyword trong câu hỏi: ${kw}`],
      [t[1], `Lướt tìm keyword (tô xanh trong bài) → thông tin nằm ở <b>${esc(where)}</b> (viền đỏ).`],
      [t[2], `“${esc(g.evidence.text)}” <span class="rtp-muted">(tô xanh lá trong bài)</span>`],
      [t[3], `So nghĩa câu hỏi với câu ở bước 3 (không cần trùng từng chữ).${analysis}<div class="rtp-answer-line">${verdict}</div>`],
    ];
  }

  // "BƯỚC 1 — Tìm keyword" from the guide's step names (fallback: the
  // names a practice saved before guides came from the server had).
  function stepNames(names, fallback, word) {
    return (names && names.length ? names : fallback).map((n, i) => `${word} ${i + 1} — ${n}`);
  }

  function hintLines(pr, g) {
    const where = paraName(pr, g.evidence.paragraphIndex);
    const t = stepNames(guideOf().hints, pr.questionType === 'headings' ? ['câu then chốt', 'cách chọn'] : ['keyword', 'vị trí', 'câu evidence'], 'Gợi ý');
    if (pr.questionType === 'headings') {
      return [
        [t[0], `Ý chính của ${esc(where)} nằm ở câu tô vàng: “${esc(g.evidence.text)}”`],
        [t[1], 'Heading đúng tóm được CẢ đoạn và thường diễn đạt khác câu then chốt — loại heading chỉ khớp một chi tiết.'],
      ];
    }
    return [
      [t[0], g.keywords.length ? chipsHtml(g.keywords) : 'Dùng các từ nội dung chính của câu hỏi.'],
      [t[1], `Thông tin nằm ở <b>${esc(where)}</b> (viền đỏ) — keyword đã tô xanh trong bài.`],
      [t[2], `Đọc kỹ: “${esc(g.evidence.text)}”`],
    ];
  }

  function guidedPanelHtml(pr, q, a) {
    const g = q.guided;
    if (!g) return '';
    // Once the guidance points into the passage (headings: from the start),
    // phones get a link up to it.
    const headings = pr.questionType === 'headings';
    if (g.mode === 'example') {
      const steps = exampleSteps(pr, q, g);
      const step = Math.min(a.gStep || 1, steps.length);
      return `<div class="rtp-guided example">
        <div class="rtp-mode example">🧑‍🏫 Xem cách làm — câu ví dụ, không tính điểm</div>
        ${steps.slice(0, step).map(([t, b]) => `<div class="rtp-gstep"><div class="rtp-gstep-t">${t}</div><div class="rtp-gstep-b">${b}</div></div>`).join('')}
        ${headings || step >= 2 ? JUMP_HTML : ''}
        ${step < steps.length ? '<button type="button" class="rtp-btn rtp-btn-primary" data-act="guide-next">Bước tiếp →</button>' : ''}
      </div>`;
    }
    const lines = hintLines(pr, g);
    const lv = Math.min(a.hintLevel || 0, lines.length);
    return `<div class="rtp-guided hint">
      <div class="rtp-mode hint">💡 Câu có gợi ý — bạn tự trả lời, mở gợi ý khi cần</div>
      ${lines.slice(0, lv).map(([t, b]) => `<div class="rtp-hint-line"><b>${t}:</b> ${b}</div>`).join('')}
      ${lv >= (headings ? 1 : 2) ? JUMP_HTML : ''}
      ${!a.result && lv < lines.length ? `<button type="button" class="rtp-link ask-lulu" data-act="hint-more"><span class="ask-lulu-ic"></span> Hỏi Lulu: ${esc(lines[lv][0].toLowerCase())}</button>` : ''}
    </div>`;
  }

  // What the passage and the question show at the current guidance level
  // (both modes reveal in the same order: keywords → location → evidence).
  function guidedView(pr, q, a) {
    const g = q.guided;
    const none = { stemKw: [], hits: [], hitsIn: null, target: q.targetParagraph, evidence: null, key: null };
    if (!g) return none;
    const level = g.mode === 'example' ? (a.gStep || 1) : (a.hintLevel || 0);
    // headings: the target paragraph is always outlined; its key sentence is
    // marked in the worked example and from the first hint on
    if (pr.questionType === 'headings') return { ...none, key: level >= 1 ? g.evidence : null };
    // keywords are marked inside the paragraph the hint points to — common
    // words ("plant", "tomato") would otherwise light up the whole passage
    return {
      stemKw: level >= 1 ? g.keywords : [],
      hits: level >= 2 ? g.keywords : [],
      hitsIn: g.evidence.paragraphIndex,
      target: q.targetParagraph != null ? q.targetParagraph : (level >= 2 ? g.evidence.paragraphIndex : null),
      evidence: level >= 3 ? g.evidence : null,
    };
  }

  function renderTypeQuestion() {
    const pr = st.practice;
    const q = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    const g = guideOf();
    const view = guidedView(pr, q, a);
    // the instruction is shown where it starts (same group → said once)
    const prev = st.items[st.idx - 1];
    const instruction = q.instruction && (!prev || prev.instruction !== q.instruction) ? q.instruction : '';
    const exampleDone = isExample(st.idx) && (a.gStep || 1) >= exampleSteps(pr, q, q.guided).length;
    const evidence = (r && r.evidence) || view.evidence;
    const paras = pr.paragraphs.map(p => paraHtml(p, { evidence, target: view.target, hits: view.hits, hitsIn: view.hitsIn, key: view.key })).join('');
    const stemRanges = view.stemKw.flatMap(k => findTerm(q.text, k).map(x => ({ ...x, cls: 'rtp-anchor' })));

    showPanelState(headerHtml(`${esc(pr.sourceName)} · ${esc(pr.passageTitle)}`)
      + guideHtml(g, false)
      + `<div class="rtp-split">
        <div class="rtp-passage">
          <div class="rtp-passage-head"><span class="rtp-chip">${esc(pr.passageTitle)}</span>${hlBtnHtml()}</div>
          <div class="rtp-passage-scroll">${paras}</div>
        </div>
        <div class="rtp-question">
          <div class="question-item">
            <div class="q-num-label"><span class="q-badge">${q.questionNumber}</span></div>
            ${instruction ? `<div class="rtp-instruction">${esc(instruction)}</div>` : ''}
            <div class="q-text">${highlight(q.text, stemRanges)}</div>
            ${q.wordLimit ? `<div class="rtp-limit">✍️ Giới hạn: <strong>${esc(q.wordLimit)}</strong></div>` : ''}
            ${answerInputHtml(q, a, exampleDone ? q.guided.answer : null)}
          </div>
          ${guidedPanelHtml(pr, q, a)}
          ${feedbackHtml(a, { correctLabel: r ? keyLabel(q, r.correctAnswer) : '' })}
          ${navHtml()}
        </div>
      </div>`);
    const panel = panelEl();
    if (evidence) scrollPassageTo(panel, '.rtp-ev') || scrollPassageTo(panel, '.rtp-para-ev');
    else if (view.target != null) scrollPassageTo(panel, '.rtp-para-target');
    if (!r && q.input === 'text' && !isExample(st.idx)) {
      const input = panel && panel.querySelector('.rtp-input');
      if (input && window.matchMedia('(min-width: 900px)').matches) input.focus({ preventScroll: true });
    }
  }

  // ── Keyword → Paraphrase ──────────────────────────────────────────────

  // The words of the passage sentence as clickable tokens (spaces kept).
  function sentenceTokens(sentence) {
    const out = [];
    let pos = 0;
    let wi = 0;
    for (const t of String(sentence).split(/(\s+)/)) {
      if (t) out.push({ text: t, start: pos, end: pos + t.length, word: /\S/.test(t) ? wi++ : null });
      pos += t.length;
    }
    return out;
  }

  function selectedText(sentence, sel) {
    if (!sel) return '';
    const words = sentenceTokens(sentence).filter(t => t.word != null);
    const a = words[sel[0]];
    const b = words[sel[1]];
    return a && b ? String(sentence).slice(a.start, b.end) : '';
  }

  function renderParaphrase() {
    const it = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    const okAt = r ? it.sentence.indexOf(r.correctAnswer) : -1;
    const okEnd = okAt === -1 ? -1 : okAt + String(r.correctAnswer).length;
    const tokens = sentenceTokens(it.sentence).map(t => {
      if (t.word == null) return esc(t.text);
      const inSel = a.sel && t.word >= a.sel[0] && t.word <= a.sel[1];
      const inOk = okAt !== -1 && t.start >= okAt && t.end <= okEnd;
      const cls = ['rtp-tok', inSel ? 'sel' : '', inOk ? 'ok' : '', !r && a.selAnchor === t.word ? 'anchor' : ''].filter(Boolean).join(' ');
      return `<span class="${cls}" ${r ? '' : `data-act="tok" data-ti="${t.word}" ${KEY_ATTRS}`}>${esc(t.text)}</span>`;
    }).join('');
    const kwRanges = findTerm(it.question, it.keyword).map(x => ({ ...x, cls: 'rtp-anchor' }));
    const picked = selectedText(it.sentence, a.sel);
    const pickedLine = a.selAnchor != null
      ? `Từ đầu: “${esc(picked)}” — bấm tiếp từ CUỐI của cụm (cụm 1 từ thì bấm Kiểm tra luôn).`
      : `Bạn chọn: “${esc(picked)}”`;
    const pair = r ? `<div class="rtp-pair">🔁 <b>${esc(it.keyword)}</b> ⇄ <b>${esc(r.correctAnswer)}</b></div>` : '';

    showPanelState(headerHtml(`${esc(it.sourceName)} · ${esc(it.passageTitle)}`)
      + `<div class="rtp-pp">
        <div class="rtp-pp-label">Câu hỏi (câu ${it.questionNumber} trong đề)</div>
        <div class="rtp-pp-question">${highlight(it.question, kwRanges)}</div>
        <div class="rtp-pp-kw">🔑 Keyword: <span class="rtp-anchor-chip">${esc(it.keyword)}</span></div>
        <div class="rtp-pp-label">Câu trong bài đọc${it.paragraphLabel ? ` (đoạn ${esc(it.paragraphLabel)})` : ''}</div>
        <div class="rtp-pp-sentence">${tokens}</div>
        ${r ? '' : `<div class="rtp-pp-help">Bấm vào từ ĐẦU rồi từ CUỐI của cụm có nghĩa tương đương với keyword (cụm 1 từ thì bấm 1 lần). Bấm tiếp để chọn lại.</div>`}
        ${picked && !r ? `<div class="rtp-pp-picked">${pickedLine}</div>` : ''}
        ${pair}
        ${feedbackHtml(a, { correctLabel: `“${r ? r.correctAnswer : ''}”`, noEvidence: true })}
        ${navHtml()}
      </div>`);
  }

  // ── Quy trình làm bài (7 steps on one passage) ────────────────────────

  const WF_STEPS_FALLBACK = ['Đọc tiêu đề', 'Skim các đoạn', 'Ý chính', 'Đọc câu hỏi', 'Tìm keyword', 'Scan bài', 'Kiểm tra evidence'];
  const wfSteps = () => (guideOf().steps.length ? guideOf().steps : WF_STEPS_FALLBACK);
  const wfStages = () => ['title', 'skim', 'main', 'read', ...st.items.map((_, i) => `q${i}`)];
  const wfStage = () => wfStages()[st.stage] || 'title';

  function wfHeader(stepNo) {
    const pr = st.practice;
    const steps = wfSteps().map((s, i) => {
      const cls = i + 1 < stepNo ? 'done' : i + 1 === stepNo ? 'active' : '';
      return `<div class="rtp-wf-step ${cls}"><b>${i + 1}</b><span>${esc(s)}</span></div>`;
    }).join('');
    const qPart = /^q\d+$/.test(wfStage()) ? ` · câu hỏi ${st.idx + 1}/${st.items.length}` : '';
    return `<div class="rtp-head">
      <div class="rtp-head-top">
        <div class="rtp-title">🎯 Luyện tập: Quy trình làm bài${qPart}</div>
        <div class="rtp-head-actions">
          <button type="button" class="rtp-link" data-act="start" title="Xoá câu trả lời, làm lại từ bước 1">↻ Làm lại</button>
          <button type="button" class="rtp-link" data-act="close" title="Đóng bài luyện tập">✕ Đóng</button>
        </div>
      </div>
      <div class="rtp-source">${esc(pr.sourceName)} · ${esc(pr.passageTitle)}</div>
      <div class="rtp-wf-steps">${steps}</div>
    </div>`;
  }

  function wfPassage(opts) {
    const pr = st.practice;
    return `<div class="rtp-passage">
      <div class="rtp-passage-head"><span class="rtp-chip">${esc(pr.passageTitle)}</span>${opts.head || ''}${hlBtnHtml()}</div>
      ${opts.tip ? `<div class="rtp-tip">💡 ${esc(opts.tip)}</div>` : ''}
      <div class="rtp-passage-scroll${opts.clickable ? ' rtp-clickable' : ''}">${pr.paragraphs.map(p => paraHtml(p, opts)).join('')}</div>
    </div>`;
  }

  function renderWorkflow() {
    const pr = st.practice;
    const stage = wfStage();
    const nextBtn = (label) => `<button type="button" class="rtp-btn rtp-btn-primary" data-act="wf-next">${esc(label)}</button>`;

    if (stage === 'title') {
      const intro = pr.paragraphs.filter(p => p.heading && normKey(p.text) !== normKey(pr.passageTitle)).slice(0, 2);
      showPanelState(wfHeader(1) + `<div class="rtp-wf-card">
        <div class="rtp-wf-task">Bước 1 — Đọc tiêu đề (5–10 giây) rồi tự hỏi: bài này có thể nói về điều gì?</div>
        <div class="rtp-wf-title">${esc(pr.passageTitle)}</div>
        ${intro.map(p => `<div class="rtp-wf-sub">${esc(p.text)}</div>`).join('')}
        <textarea class="rtp-wf-guess" rows="2" placeholder="Ghi nhanh dự đoán của bạn (không chấm điểm)…">${esc(st.guess)}</textarea>
        ${nextBtn('Tiếp: Bước 2 — Skim →')}
      </div>`);
      return;
    }

    if (stage === 'skim') {
      if (st.skimStartedAt == null) st.skimStartedAt = Date.now();
      showPanelState(wfHeader(2) + `<div class="rtp-wf-grid">
        ${wfPassage({ lead: true, dim: true, head: '<span class="rtp-timer" id="rtp-timer"></span>', tip: 'Chỉ đọc câu đầu (tô vàng) của mỗi đoạn — khoảng 90 giây. Hỏi: mỗi đoạn nói về gì?' })}
        <div class="rtp-wf-side">
          <div class="rtp-wf-task">Bước 2 — Skim các đoạn</div>
          <p>Đừng đọc từng chữ. Lướt câu chủ đề để nắm “bản đồ” của bài: đoạn nào nói về gì.</p>
          ${st.guess ? `<p class="rtp-muted">Dự đoán của bạn ở bước 1: “${esc(st.guess)}” — có đúng không?</p>` : ''}
          ${nextBtn('Tiếp: Bước 3 — Ý chính →')}
        </div>
      </div>`);
      startCountdown(90, st.skimStartedAt);
      return;
    }

    if (stage === 'main') {
      const m = pr.main;
      const a = st.main;
      const r = a.result;
      showPanelState(wfHeader(3) + `<div class="rtp-wf-grid">
        ${wfPassage({ lead: true, target: m.targetParagraph, evidence: r && r.evidence })}
        <div class="rtp-wf-side">
          <div class="rtp-wf-task">Bước 3 — Xác định ý chính (câu ${m.questionNumber} trong đề)</div>
          <div class="question-item">
            <div class="q-text">${esc(m.text)}</div>
            ${answerInputHtml({ input: 'choice', choices: m.choices, listTitle: m.listTitle }, a, null)}
          </div>
          ${feedbackHtml(a, { correctLabel: r ? keyLabel({ choices: m.choices }, r.correctAnswer) : '' })}
          <div class="rtp-nav"><div class="rtp-nav-right">
            ${r ? nextBtn('Tiếp: Bước 4 — Đọc câu hỏi →') : `<button type="button" class="rtp-btn rtp-btn-primary" data-act="check" ${a.value ? '' : 'disabled'}>Kiểm tra</button>`}
          </div></div>
        </div>
      </div>`);
      if (r && r.evidence) scrollPassageTo(panelEl(), '.rtp-ev');
      else if (m.targetParagraph != null) scrollPassageTo(panelEl(), '.rtp-para-target');
      return;
    }

    if (stage === 'read') {
      showPanelState(wfHeader(4) + `<div class="rtp-wf-card">
        <div class="rtp-wf-task">Bước 4 — Đọc hết câu hỏi TRƯỚC khi đọc kỹ bài</div>
        <p>Biết trước mình cần tìm gì giúp bạn không phải đọc lại cả bài nhiều lần.</p>
        <ol class="rtp-wf-qlist">${st.items.map(q => `<li><span class="q-badge">${q.questionNumber}</span> ${esc(q.text)}</li>`).join('')}</ol>
        ${nextBtn('Tiếp: Bước 5 — Tìm keyword →')}
      </div>`);
      return;
    }

    // q<i>: steps 5 (keyword) → 6 (scan) → 7 (evidence + answer)
    const q = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    const step = a.wfStep || 5;
    const kwRanges = step === 5 ? [] : q.keywords.flatMap(k => findTerm(q.text, k).map(x => ({ ...x, cls: 'rtp-anchor' })));
    let side;
    let passage;
    if (step === 5) {
      const picked = new Set(a.kw || []);
      const tokens = sentenceTokens(q.text).map(t => (t.word == null ? esc(t.text)
        : `<span class="rtp-tok${picked.has(t.word) ? ' sel' : ''}" ${a.kwDone ? '' : `data-act="wf-kw" data-ti="${t.word}" ${KEY_ATTRS} aria-pressed="${picked.has(t.word)}"`}>${esc(t.text)}</span>`)).join('');
      const mine = sentenceTokens(q.text).filter(t => t.word != null && picked.has(t.word)).map(t => t.text.replace(/[^\p{L}\p{N}'’-]/gu, ''));
      const matched = mine.filter(w => q.keywords.some(k => k.toLowerCase().includes(w.toLowerCase()) && w.length >= 2));
      side = `<div class="rtp-wf-task">Bước 5 — Tìm keyword</div>
        <p>Bấm chọn các từ khoá trong câu hỏi: tên riêng, số / năm, từ khó thay thế.</p>
        <div class="rtp-pp-sentence">${tokens}</div>
        ${a.kwDone ? `<div class="rtp-hint-line"><b>Keyword gợi ý:</b> ${chipsHtml(q.keywords)}</div>
          <div class="rtp-muted">Bạn chọn ${mine.length} từ, trùng ${matched.length} với gợi ý.</div>
          <button type="button" class="rtp-btn rtp-btn-primary" data-act="wf-step" data-step="6">Tiếp: Bước 6 — Scan →</button>`
        : '<button type="button" class="rtp-btn rtp-btn-primary" data-act="wf-kw-done">Xong — xem keyword gợi ý</button>'}`;
      passage = wfPassage({});
    } else if (step === 6) {
      const tried = a.loc != null;
      const ok = tried && a.loc === q.locationParagraph;
      side = `<div class="rtp-wf-task">Bước 6 — Scan bài</div>
        <div class="q-text">${highlight(q.text, kwRanges)}</div>
        <p>Keyword đã tô xanh trong bài. Lướt tìm, rồi <b>bấm vào đoạn</b> chứa thông tin của câu hỏi.</p>
        ${tried ? `<div class="rtp-wf-loc"><div class="q-correct-ans ${ok ? 'right' : 'wrong'}">${ok ? '✓ Đúng đoạn!' : `✗ Chưa đúng — thông tin nằm ở ${esc(paraName(pr, q.locationParagraph))} (viền đỏ)`}</div>
          <button type="button" class="rtp-btn rtp-btn-primary" data-act="wf-step" data-step="7">Tiếp: Bước 7 — Đọc evidence & trả lời →</button></div>` : ''}`;
      passage = wfPassage({ hits: q.keywords, clickable: !tried, target: tried ? q.locationParagraph : null });
    } else {
      side = `<div class="rtp-wf-task">Bước 7 — Đọc kỹ đoạn đó, kiểm tra evidence rồi trả lời</div>
        <div class="question-item">
          <div class="q-num-label"><span class="q-badge">${q.questionNumber}</span></div>
          ${q.instruction ? `<div class="rtp-instruction">${esc(q.instruction)}</div>` : ''}
          <div class="q-text">${highlight(q.text, kwRanges)}</div>
          ${q.wordLimit ? `<div class="rtp-limit">✍️ Giới hạn: <strong>${esc(q.wordLimit)}</strong></div>` : ''}
          ${answerInputHtml(q, a, null)}
        </div>
        ${feedbackHtml(a, { correctLabel: r ? keyLabel(q, r.correctAnswer) : '' })}
        <div class="rtp-nav"><div class="rtp-nav-right">
          ${r ? nextBtn(st.idx < st.items.length - 1 ? 'Câu hỏi tiếp →' : 'Xem kết quả 🎉')
            : `<button type="button" class="rtp-btn rtp-btn-primary" data-act="check" ${String(a.value || '').trim() ? '' : 'disabled'}>Kiểm tra</button>`}
        </div></div>`;
      passage = wfPassage({ hits: q.keywords, target: q.locationParagraph, evidence: r && r.evidence });
    }
    // Steps 5–6 start from the question, so on stacked layouts the task
    // comes before the passage.
    showPanelState(wfHeader(step) + `<div class="rtp-wf-grid${step < 7 ? ' side-first' : ''}">${passage}<div class="rtp-wf-side">${side}</div></div>`);
    const panel = panelEl();
    if (r && r.evidence) scrollPassageTo(panel, '.rtp-ev');
    else if (step === 7 || (step === 6 && a.loc != null)) scrollPassageTo(panel, '.rtp-para-target');
    else if (step === 6) scrollPassageTo(panel, '.rtp-hit');
  }

  function normKey(s) { return String(s || '').trim().toLowerCase(); }

  function renderWorkflowResult() {
    stopTimer();
    const pr = st.practice;
    const mainOk = !!(st.main.result && st.main.result.isCorrect);
    const detailOk = st.answers.filter(a => a.result && a.result.isCorrect).length;
    const locOk = st.answers.filter((a, i) => a.loc === st.items[i].locationParagraph).length;
    const n = st.items.length + 1;
    const score = detailOk + (mainOk ? 1 : 0);
    if (!st.counted) { recordScore(score, n); st.counted = true; }
    st.finished = true;
    persist();
    renderEntry(st.lesson);
    const rows = [
      `<div class="rtp-result-row ${mainOk ? 'ok' : 'bad'}"><span>${mainOk ? '✓' : '✗'}</span><span class="rtp-result-q">Ý chính (câu ${pr.main.questionNumber}): ${esc(pr.main.text)}</span></div>`,
      ...st.items.map((q, i) => {
        const a = st.answers[i];
        const ok = a.result && a.result.isCorrect;
        const loc = a.loc === q.locationParagraph;
        return `<div class="rtp-result-row ${ok ? 'ok' : 'bad'}"><span>${ok ? '✓' : '✗'}</span><span class="rtp-result-q">Câu ${q.questionNumber}: ${esc(q.text)} <em>· ${loc ? 'tìm đúng đoạn' : 'tìm sai đoạn'}</em></span></div>`;
      }),
    ].join('');
    showPanelState(`<div class="rtp-result">
      <div class="rtp-result-icon">🎉</div>
      <div class="rtp-result-title">Hoàn thành luyện tập Quy trình làm bài</div>
      <div class="rtp-score">${score} / ${n}</div>
      <div class="rtp-result-msg">Tìm đúng đoạn chứa thông tin: <b>${locOk}/${st.items.length}</b> câu</div>
      <div class="rtp-result-list">${rows}</div>
      <div class="rtp-result-actions">
        <button type="button" class="rtp-btn" data-act="wf-review">📖 Ôn lại</button>
        <button type="button" class="rtp-btn rtp-btn-primary" data-act="retry">🔄 Làm lại</button>
      </div>
    </div>`);
    announce(`Hoàn thành luyện tập: đúng ${score} trên ${n} câu.`);
  }

  // The answer being worked on: the workflow's main-idea question has its
  // own slot; everything else is the current question's.
  function activeAnswer() {
    return st.kind === 'workflow' && wfStage() === 'main' ? st.main : st.answers[st.idx];
  }

  function syncCheckBtn() {
    const btn = document.querySelector('#rtp-panel [data-act="check"]');
    if (btn) btn.disabled = !String(activeAnswer().value || '').trim();
  }

  async function checkCurrent() {
    if (!st) return;
    const a = activeAnswer();
    if (a.result || a.checking || !String(a.value || '').trim()) return;
    const onMain = a === st.main;
    const it = onMain ? st.practice.main : st.items[st.idx];
    const passageId = st.kind === 'skimming' || st.kind === 'paraphrase' ? it.passageId : st.practice.passageId;
    const body = { passageId, questionNumber: it.questionNumber, answer: String(a.value).trim() };
    if (st.kind === 'paraphrase') body.pairIndex = it.pairIndex;
    a.checking = true;
    // (before the button is disabled — that drops its focus)
    const panel = panelEl();
    const keyboard = !!(panel && panel.contains(document.activeElement));
    const btn = document.querySelector('#rtp-panel [data-act="check"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang chấm...'; }
    try {
      const data = await fetchWithTimeout(`/api/reading-tips/${encodeURIComponent(st.lesson.lessonKey)}/practice/check`, {
        method: 'POST',
        body: JSON.stringify(body),
      }, CHECK_TIMEOUT_MS);
      if (!st || !(onMain ? st.main === a : st.answers.includes(a))) return; // practice closed / replaced meanwhile
      if (st.kind === 'scanning' && a.startedAt) a.seconds = (Date.now() - a.startedAt) / 1000;
      a.result = data.result;
      persist();
      if (activeAnswer() === a) {
        renderQuestion();
        const verdict = document.querySelector('#rtp-panel .rtp-feedback .q-correct-ans');
        if (verdict) announce(verdict.textContent);
        revealEl(document.querySelector('#rtp-panel .rtp-feedback'));
        // keyboard users continue from the "next" button
        const go = keyboard && document.querySelector('#rtp-panel .rtp-nav .rtp-btn-primary');
        if (go) go.focus({ preventScroll: true });
      }
    } catch (err) {
      if (err && err.body && err.body.requiresPremium && typeof openUpgradeModal === 'function') openUpgradeModal();
      else if (typeof showToast === 'function') showToast(errorMessage(err, 'Không chấm được đáp án, thử lại nhé.'), 'error');
    } finally {
      a.checking = false;
      // still on this question and not graded → the button works again
      if (btn && btn.isConnected && !a.result) { btn.textContent = 'Kiểm tra'; syncCheckBtn(); }
    }
  }

  // ── Result ────────────────────────────────────────────────────────────

  function renderResult() {
    if (st.kind === 'workflow') { renderWorkflowResult(); return; }
    stopTimer();
    // The worked example (Phase 3) isn't answered, so it isn't scored.
    const scored = st.items.map((it, i) => i).filter(i => !isExample(i));
    const n = scored.length;
    const score = scored.filter(i => st.answers[i].result && st.answers[i].result.isCorrect).length;
    if (!st.counted) { recordScore(score, n); st.counted = true; }
    st.finished = true;
    persist();
    renderEntry(st.lesson);
    const pct = score / n;
    const msg = pct === 1 ? 'Xuất sắc! Bạn đã nắm chắc kỹ thuật này.'
      : pct >= 0.6 ? 'Tốt lắm! Xem lại các câu sai để hiểu vì sao nhé.'
        : 'Chưa sao cả — đọc lại phần lý thuyết phía trên rồi làm lại nhé.';
    const total = st.kind === 'scanning'
      ? `<div class="rtp-time">⏱ Tổng thời gian scan: ${fmtTime(st.answers.reduce((s, a) => s + (a.seconds || 0), 0))}</div>` : '';
    const rows = st.items.map((it, i) => {
      const text = st.kind === 'skimming' ? it.question.text : st.kind === 'paraphrase' ? `keyword “${it.keyword}”` : it.text;
      if (isExample(i)) {
        return `<button type="button" class="rtp-result-row example" data-act="goto" data-idx="${i}">
          <span>📘</span><span class="rtp-result-q">Câu ${it.questionNumber} (ví dụ mẫu): ${esc(text)}</span></button>`;
      }
      const ok = st.answers[i].result && st.answers[i].result.isCorrect;
      return `<button type="button" class="rtp-result-row ${ok ? 'ok' : 'bad'}" data-act="goto" data-idx="${i}">
        <span>${ok ? '✓' : '✗'}</span><span class="rtp-result-q">Câu ${it.questionNumber}: ${esc(text)}</span></button>`;
    }).join('');
    showPanelState(`<div class="rtp-result">
      <div class="rtp-result-icon">🎉</div>
      <div class="rtp-result-title">Hoàn thành luyện tập ${esc(COPY[st.lesson.lessonKey].name)}</div>
      <div class="rtp-score">${score} / ${n}</div>
      <div class="rtp-result-msg">${esc(msg)}</div>
      ${total}
      <div class="rtp-result-list">${rows}</div>
      <div class="rtp-result-actions">
        <button type="button" class="rtp-btn" data-act="review">📖 Ôn lại</button>
        <button type="button" class="rtp-btn rtp-btn-primary" data-act="retry">🔄 Làm lại</button>
      </div>
    </div>`);
    announce(`Hoàn thành luyện tập: đúng ${score} trên ${n} câu.`);
  }

  // ── Events ────────────────────────────────────────────────────────────

  // Acts that move to another screen (the rest update the current one).
  const SCREEN_ACTS = new Set(['prev', 'next', 'goto', 'review', 'intro-done', 'retry', 'wf-next', 'wf-review', 'wf-step']);

  // Selector for the same control after a re-render (keeps keyboard focus).
  function focusKeyOf(el) {
    const d = el.dataset;
    const extra = ['val', 'ti', 'pi', 'idx', 'step'].filter(k => d[k] != null)
      .map(k => `[data-${k}="${String(d[k]).replace(/["\\]/g, '\\$&')}"]`).join('');
    return `[data-act="${d.act}"]${extra}`;
  }

  function onClick(e, lesson) {
    if (suppressClick) return;
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    if (act === 'hl-tool') { toggleHl(); return; }
    // clicking a highlight opens its color panel — it isn't an answer
    if (act === 'wf-loc' && e.target.closest('span.hl')) return;
    if (act === 'start') {
      if (el.dataset.force) start(lesson); else confirmNewPractice(lesson, () => start(lesson));
      return;
    }
    if (act === 'resume') { resume(lesson); return; }
    if (act === 'upgrade') { if (typeof openUpgradeModal === 'function') openUpgradeModal(); return; }
    if (act === 'show-passage') {
      const pane = document.querySelector('#rtp-panel .rtp-passage');
      if (pane) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (act === 'close' || act === 'dismiss') {
      stopTimer();
      if (st) persist();
      st = null;
      loadSeq++;
      const panel = panelEl();
      if (panel) { panel.hidden = true; panel.innerHTML = ''; }
      renderEntry(lesson);
      return;
    }
    if (!st) return;
    const cur = st.answers[st.idx];
    const focusKey = document.activeElement === el ? focusKeyOf(el) : null;
    switch (act) {
      case 'pick': {
        const a = activeAnswer();
        if (a.result) return;
        a.value = el.dataset.val;
        break;
      }
      case 'check': checkCurrent(); return;
      case 'prev': if (st.idx > 0) st.idx--; break;
      case 'next': if (st.idx < st.items.length - 1) st.idx++; break;
      case 'finish': renderResult(); revealPanel(); return;
      case 'intro-done': st.introSeen = true; break;
      case 'hint': cur.hint = true; break;
      case 'toggle-full': st.showFull = !st.showFull; break;
      case 'goto': st.idx = Math.min(Math.max(Number(el.dataset.idx) || 0, 0), st.items.length - 1); break;
      case 'review': st.idx = 0; break;
      // Phase 3: worked example steps / "We do" hints
      case 'guide-next': {
        const total = exampleSteps(st.practice, st.items[st.idx], st.items[st.idx].guided).length;
        cur.gStep = Math.min((cur.gStep || 1) + 1, total);
        if (cur.gStep >= total) cur.viewed = true;
        break;
      }
      case 'hint-more': cur.hintLevel = (cur.hintLevel || 0) + 1; break;
      // Keyword → Paraphrase: first click = start word, second = end word
      case 'tok': {
        if (cur.result) return;
        const w = Number(el.dataset.ti);
        if (cur.selAnchor == null) { cur.selAnchor = w; cur.sel = [w, w]; }
        else { cur.sel = [Math.min(cur.selAnchor, w), Math.max(cur.selAnchor, w)]; cur.selAnchor = null; }
        cur.value = selectedText(st.items[st.idx].sentence, cur.sel);
        break;
      }
      // Quy trình làm bài
      case 'wf-next':
        if (st.stage >= wfStages().length - 1) { renderResult(); revealPanel(); return; }
        st.stage++;
        if (/^q\d+$/.test(wfStage())) st.idx = Number(wfStage().slice(1));
        break;
      case 'wf-kw': {
        const w = Number(el.dataset.ti);
        const set = new Set(cur.kw || []);
        if (set.has(w)) set.delete(w); else set.add(w);
        cur.kw = [...set];
        break;
      }
      case 'wf-kw-done': cur.kwDone = true; break;
      case 'wf-step': cur.wfStep = Number(el.dataset.step) || 5; break;
      case 'wf-loc': if (cur.loc == null) cur.loc = Number(el.dataset.pi); break;
      case 'wf-review': st.stage = 2; break;
      case 'retry':
        st.answers = freshAnswers(st.items);
        st.idx = 0;
        st.showFull = false;
        st.finished = false;
        st.counted = false;
        st.stage = 0;
        st.main = { value: '', result: null };
        st.guess = '';
        st.skimStartedAt = null;
        st.hl = {};
        break;
      default: return;
    }
    persist();
    if (act === 'retry') renderEntry(lesson);
    renderQuestion();
    if (focusKey) {
      const again = document.querySelector(`#rtp-panel ${focusKey}`);
      if (again) again.focus({ preventScroll: true });
    }
    if (SCREEN_ACTS.has(act)) revealPanel();
    else if (act === 'wf-loc') revealEl(document.querySelector('#rtp-panel .rtp-wf-loc'));
  }

  window.RTPractice = { supports, mount };
})();
