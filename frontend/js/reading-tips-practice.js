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
  };
  const FOCUS_LABEL = {
    main_idea: 'Main idea — Ý chính của đoạn',
    paragraph_purpose: 'Paragraph purpose — Mục đích của đoạn',
    overall_topic: 'Overall topic — Chủ đề toàn bài',
  };
  const SCAN_STEPS = [
    'Xác định keyword trong câu hỏi — ưu tiên tên riêng, số, năm, thuật ngữ (đã tô sẵn).',
    'Dự đoán cách bài đọc có thể diễn đạt lại (paraphrase) nếu keyword là từ thường.',
    'Scan bài đọc tìm keyword — lướt mắt, KHÔNG đọc từng câu.',
    'Đọc kỹ 1–2 câu quanh vị trí vừa tìm thấy.',
    'Chép đáp án đúng chính tả, đúng giới hạn số từ.',
  ];

  let st = null;        // current practice state (null = entry card only)
  let timerHandle = null;

  const esc = (s) => escHtml(s == null ? '' : String(s));
  const escNl = (s) => esc(s).replace(/\n/g, '<br>');

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  // ── Browser-only persistence ──────────────────────────────────────────
  // One localStorage entry per account: { [lessonKey]: { practice, answers,
  // idx, showFull, finished, counted, savedAt, last, best, attempts } }.
  // Every access is guarded — storage can be unavailable (private mode,
  // quota) and the practice must still work without it.
  const STORE_PREFIX = 'rtp_v1_';
  const STALE_MS = 30 * 24 * 60 * 60 * 1000; // a month-old unfinished practice is dropped
  let persistTimer = null;

  function storeKey() {
    const u = window.AuthService && typeof window.AuthService.getUser === 'function' ? window.AuthService.getUser() : null;
    return STORE_PREFIX + ((u && (u._id || u.id || u.username)) || 'anon');
  }

  function readStore() {
    try {
      const v = JSON.parse(localStorage.getItem(storeKey()) || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  }

  function writeStore(all) {
    try { localStorage.setItem(storeKey(), JSON.stringify(all)); } catch (e) { /* unavailable or full */ }
  }

  function itemsOf(practice) {
    return practice && (practice.kind === 'skimming' ? practice.items : practice.questions);
  }

  // The saved record for a tip, with its practice dropped if it's stale or
  // malformed (scores are kept either way).
  function loadRecord(key) {
    const rec = readStore()[key];
    if (!rec || typeof rec !== 'object') return null;
    const items = itemsOf(rec.practice);
    const usable = Array.isArray(items) && items.length && Array.isArray(rec.answers)
      && rec.answers.length === items.length && Date.now() - (rec.savedAt || 0) < STALE_MS;
    if (!usable) { rec.practice = null; rec.answers = null; }
    return rec;
  }

  function persist() {
    clearTimeout(persistTimer);
    if (!st) return;
    const all = readStore();
    all[st.lesson.lessonKey] = {
      ...(all[st.lesson.lessonKey] || {}), // keeps last / best / attempts
      savedAt: Date.now(),
      practice: st.practice,
      answers: st.answers.map(a => ({ value: a.value, result: a.result, seconds: a.seconds, hint: a.hint })),
      idx: st.idx,
      showFull: st.showFull,
      finished: st.finished,
      counted: st.counted,
    };
    writeStore(all);
  }

  function persistSoon() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(persist, 400);
  }

  // Once per completed practice (a "Làm lại" or a new practice counts again).
  function recordScore(score, total) {
    const all = readStore();
    const rec = all[st.lesson.lessonKey] || {};
    const now = Date.now();
    rec.last = { score, total, at: now };
    if (!rec.best || score / total > rec.best.score / rec.best.total) rec.best = { score, total, at: now };
    rec.attempts = (rec.attempts || 0) + 1;
    all[st.lesson.lessonKey] = rec;
    writeStore(all);
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
    if (opts.lead && p.leadEnd > 0 && !p.heading) ranges.push({ start: 0, end: p.leadEnd, cls: 'rtp-lead' });
    (opts.hits || []).forEach(t => findTerm(p.text, t).forEach(r => ranges.push({ ...r, cls: 'rtp-hit' })));
    if (opts.evidence && opts.evidence.paragraphIndex === p.i) {
      const at = p.text.indexOf(opts.evidence.text);
      if (at !== -1) ranges.push({ start: at, end: at + opts.evidence.text.length, cls: 'rtp-ev' });
    }
    const label = p.heading ? '' : `<span class="rtp-para-label">${esc(p.label || p.n)}</span>`;
    const cls = ['rtp-para', p.heading ? 'rtp-para-heading' : '', opts.dim && !p.heading ? 'rtp-dim' : '',
      opts.evidence && opts.evidence.paragraphIndex === p.i ? 'rtp-para-ev' : ''].filter(Boolean).join(' ');
    return `<p class="${cls}" data-pi="${p.i}">${label}${highlight(p.text, ranges)}</p>`;
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

  // ── Entry card + lifecycle ────────────────────────────────────────────

  function supports(lesson) { return !!(lesson && lesson.hasPractice && COPY[lesson.lessonKey]); }

  // Called by reading-tips.js after it renders a tip. Resets any practice
  // from a previously opened tip (its progress is already saved).
  function mount(lesson, slot) {
    stopTimer();
    if (st) persist();
    st = null;
    if (!slot || !supports(lesson)) return;
    slot.innerHTML = `<section class="rtp-section" id="rtp-section">
      <div id="rtp-entry-wrap"></div>
      <div class="rtp-panel" id="rtp-panel" hidden></div>
    </section>`;
    renderEntry(lesson);
    const section = slot.querySelector('#rtp-section');
    section.addEventListener('click', (e) => onClick(e, lesson));
    section.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('.rtp-input')) { e.preventDefault(); checkCurrent(); }
    });
    section.addEventListener('input', (e) => {
      if (e.target.matches('.rtp-input') && st) {
        st.answers[st.idx].value = e.target.value;
        syncCheckBtn();
        persistSoon();
      }
    });
  }

  // Entry card: start / resume buttons + the scores saved in this browser.
  function renderEntry(lesson) {
    const wrap = document.getElementById('rtp-entry-wrap');
    if (!wrap) return;
    const c = COPY[lesson.lessonKey];
    const rec = loadRecord(lesson.lessonKey);
    const items = rec && itemsOf(rec.practice);
    let buttons;
    if (st && st.lesson.lessonKey === lesson.lessonKey) {
      buttons = `<button type="button" class="rtp-btn" data-act="start">🎲 Bài mới</button>`;
    } else if (items && !rec.finished) {
      buttons = `<button type="button" class="rtp-btn rtp-btn-primary" data-act="resume">▶ Tiếp tục bài đang làm (Câu ${Math.min((rec.idx || 0) + 1, items.length)}/${items.length})</button>
        <button type="button" class="rtp-btn" data-act="start">🎲 Bài mới</button>`;
    } else if (items) {
      buttons = `<button type="button" class="rtp-btn rtp-btn-primary" data-act="start">🎯 Luyện bài mới</button>
        <button type="button" class="rtp-btn" data-act="resume">📖 Xem lại bài trước</button>`;
    } else {
      buttons = `<button type="button" class="rtp-btn rtp-btn-primary" data-act="start">🎯 Bắt đầu luyện tập</button>`;
    }
    const stats = rec && rec.last
      ? `<div class="rtp-entry-stats">Lần gần nhất: <b>${rec.last.score}/${rec.last.total}</b>`
        + (rec.best ? ` · Cao nhất: <b>${rec.best.score}/${rec.best.total}</b>` : '')
        + ` · Đã luyện ${rec.attempts || 1} lần <span class="rtp-entry-note">(lưu trên trình duyệt này)</span></div>`
      : '';
    wrap.innerHTML = `<div class="rtp-entry">
      <div class="rtp-entry-icon">🎯</div>
      <div class="rtp-entry-text">
        <div class="rtp-entry-title">Luyện tập ${esc(c.name)}</div>
        <div class="rtp-entry-desc">${esc(c.desc)}</div>
        ${stats}
      </div>
      <div class="rtp-entry-actions">${buttons}</div>
    </div>`;
  }

  function panelEl() { return document.getElementById('rtp-panel'); }

  function showPanelState(html) {
    const panel = panelEl();
    if (!panel) return;
    panel.hidden = false;
    panel.innerHTML = html;
  }

  async function start(lesson) {
    stopTimer();
    if (st) persist();
    st = null;
    const panel = panelEl();
    if (!panel) return;
    const entryBtn = document.querySelector('#rtp-entry-wrap [data-act="start"]');
    if (!(window.AuthService && window.AuthService.isLoggedIn())) {
      showPanelState(`<div class="rtp-state"><div class="rtp-state-icon">🔐</div>
        <div>Bạn cần đăng nhập để luyện tập.</div>
        <a class="rtp-btn rtp-btn-primary" href="/login.html">Đăng nhập</a></div>`);
      return;
    }
    if (entryBtn) entryBtn.disabled = true;
    showPanelState(`<div class="rtp-state"><div class="rtp-state-icon"><i class="fas fa-spinner fa-spin"></i></div>Đang tải bài luyện tập...</div>`);
    try {
      const data = await apiFetch(`/api/reading-tips/${encodeURIComponent(lesson.lessonKey)}/practice`);
      if (!data.practice) {
        showPanelState(`<div class="rtp-state"><div class="rtp-state-icon">📭</div>
          <div>${esc(data.message || 'Chưa tìm thấy bài luyện tập phù hợp.')}</div></div>`);
        return;
      }
      begin(lesson, data.practice);
    } catch (err) {
      if (err && err.body && err.body.requiresPremium) {
        showPanelState(`<div class="rtp-state"><div class="rtp-state-icon">⭐</div>
          <div>${esc(err.body.message || 'Bạn cần nâng cấp lên Premium để luyện tập.')}</div>
          <button type="button" class="rtp-btn rtp-btn-primary" data-act="upgrade">Nâng cấp Premium</button></div>`);
        return;
      }
      const msg = (err && err.body && err.body.message) || 'Không tải được bài luyện tập. Vui lòng thử lại.';
      showPanelState(`<div class="rtp-state rtp-state-error"><div class="rtp-state-icon">⚠️</div>
        <div>${esc(msg)}</div>
        <button type="button" class="rtp-btn" data-act="start">Thử lại</button></div>`);
    } finally {
      if (entryBtn) entryBtn.disabled = false;
    }
  }

  function freshAnswers(items) {
    return items.map(() => ({ value: '', result: null, seconds: null, hint: false }));
  }

  function begin(lesson, practice) {
    const items = itemsOf(practice);
    st = {
      lesson, practice, kind: practice.kind, items,
      idx: 0, showFull: false, finished: false, counted: false,
      answers: freshAnswers(items),
    };
    persist();
    renderEntry(lesson);
    renderQuestion();
    const panel = panelEl();
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Re-opens the practice saved in this browser. Timers of unanswered
  // questions restart; checked answers keep their result and time.
  function resume(lesson) {
    const rec = loadRecord(lesson.lessonKey);
    const items = rec && itemsOf(rec.practice);
    if (!items) { renderEntry(lesson); return; }
    stopTimer();
    st = {
      lesson, practice: rec.practice, kind: rec.practice.kind, items,
      idx: Math.min(Math.max(Number(rec.idx) || 0, 0), items.length - 1),
      showFull: !!rec.showFull, finished: !!rec.finished, counted: !!rec.counted,
      answers: rec.answers.map(a => ({
        value: (a && a.value) || '', result: (a && a.result) || null,
        seconds: a && a.seconds != null ? a.seconds : null, hint: !!(a && a.hint),
      })),
    };
    renderEntry(lesson);
    if (st.finished) renderResult(); else renderQuestion();
    const panel = panelEl();
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Question screens ──────────────────────────────────────────────────

  function headerHtml(sourceLine) {
    const n = st.items.length;
    const done = st.answers.filter(a => a.result).length;
    return `<div class="rtp-head">
      <div class="rtp-head-top">
        <div class="rtp-title">🎯 Luyện tập: ${esc(COPY[st.kind].name)}</div>
        <button type="button" class="rtp-link" data-act="close" title="Đóng bài luyện tập">✕ Đóng</button>
      </div>
      ${sourceLine ? `<div class="rtp-source">Nguồn: ${sourceLine}</div>` : ''}
      <div class="rtp-progress">
        <span>Câu ${st.idx + 1} / ${n}</span>
        <div class="rtp-bar"><i style="width:${Math.round(done / n * 100)}%"></i></div>
        <span class="rtp-done">${done}/${n} đã làm</span>
      </div>
    </div>`;
  }

  function feedbackHtml(a, extra) {
    const r = a.result;
    if (!r) return '';
    const answerLine = r.isCorrect ? '' : ` — Đáp án: <strong>${esc(extra.correctLabel || r.correctAnswer)}</strong>`;
    return `<div class="rtp-feedback ${r.isCorrect ? 'ok' : 'bad'}">
      <div class="q-correct-ans ${r.isCorrect ? 'right' : 'wrong'}">${r.isCorrect ? '✓ Chính xác!' : '✗ Chưa đúng'}${answerLine}</div>
      ${extra.timeLine || ''}
      ${r.evidence ? `<div class="rtp-evidence"><div class="rtp-evidence-label">📍 Evidence trong bài</div>“${esc(r.evidence.text)}”</div>` : ''}
      ${r.explanation ? `<div class="q-explanation"><strong>Giải thích:</strong> ${escNl(r.explanation)}</div>` : ''}
    </div>`;
  }

  function navHtml() {
    const a = st.answers[st.idx];
    const last = st.idx === st.items.length - 1;
    const allDone = st.answers.every(x => x.result);
    const checkBtn = a.result ? '' : `<button type="button" class="rtp-btn rtp-btn-primary" data-act="check" ${String(a.value || '').trim() ? '' : 'disabled'}>Kiểm tra</button>`;
    const firstOpen = st.answers.findIndex(x => !x.result);
    let nextBtn;
    if (!last) nextBtn = `<button type="button" class="rtp-btn ${a.result ? 'rtp-btn-primary' : ''}" data-act="next">Câu tiếp →</button>`;
    else if (allDone) nextBtn = `<button type="button" class="rtp-btn rtp-btn-primary" data-act="finish">Xem kết quả 🎉</button>`;
    else if (a.result) nextBtn = `<button type="button" class="rtp-btn rtp-btn-primary" data-act="goto" data-idx="${firstOpen}">Làm câu còn lại →</button>`;
    else nextBtn = '';
    return `<div class="rtp-nav">
      <button type="button" class="rtp-btn" data-act="prev" ${st.idx === 0 ? 'disabled' : ''}>← Câu trước</button>
      <div class="rtp-nav-right">${checkBtn}${nextBtn}</div>
    </div>`;
  }

  function renderQuestion() {
    stopTimer();
    if (st.kind === 'skimming') renderSkim(); else renderScan();
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
    const paras = it.paragraphs.map(p => paraHtml(p, {
      lead: true, dim: whole && !st.showFull && !r, evidence: r && r.evidence,
    })).join('');
    const tip = whole
      ? 'Chỉ đọc câu đầu (tô vàng) của mỗi đoạn để nắm chủ đề chung — phần còn lại đã làm mờ.'
      : 'Đọc câu chủ đề (tô vàng) rồi lướt phần còn lại — tìm ý CHÍNH, bỏ qua ví dụ và số liệu.';
    const opts = it.question.options.map((o, i) => {
      const L = String.fromCharCode(65 + i);
      let cls = a.value === L ? 'selected' : '';
      if (r) cls = L === String(r.correctAnswer).toUpperCase() ? 'correct-ans' : (a.value === L ? 'wrong-ans' : '');
      return `<label class="radio-opt ${cls}" ${r ? '' : `data-act="pick" data-val="${L}"`}>
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
      + `<details class="rtp-guide" ${st.idx === 0 && !r ? 'open' : ''}>
          <summary>📋 5 bước Scanning</summary>
          <ol>${SCAN_STEPS.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        </details>
        <div class="rtp-split">
        <div class="rtp-passage">
          <div class="rtp-passage-head"><span class="rtp-chip">${esc(pr.passageTitle)}</span>
            ${r ? '' : `<span class="rtp-timer" id="rtp-timer">⏱ 0:00</span>`}</div>
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
            ${r || !q.anchors.length ? '' : `<button type="button" class="rtp-link rtp-hint-btn" data-act="hint">💡 Gợi ý vị trí keyword</button>`}
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

  function syncCheckBtn() {
    const btn = document.querySelector('#rtp-panel [data-act="check"]');
    if (btn) btn.disabled = !String(st.answers[st.idx].value || '').trim();
  }

  async function checkCurrent() {
    if (!st) return;
    const a = st.answers[st.idx];
    if (a.result || a.checking || !String(a.value || '').trim()) return;
    const it = st.items[st.idx];
    const passageId = st.kind === 'skimming' ? it.passageId : st.practice.passageId;
    a.checking = true;
    const btn = document.querySelector('#rtp-panel [data-act="check"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang chấm...'; }
    try {
      const data = await apiFetch(`/api/reading-tips/${encodeURIComponent(st.lesson.lessonKey)}/practice/check`, {
        method: 'POST',
        body: JSON.stringify({ passageId, questionNumber: it.questionNumber, answer: String(a.value).trim() }),
      });
      if (!st || !st.answers.includes(a)) return; // practice closed / replaced meanwhile
      if (st.kind === 'scanning' && a.startedAt) a.seconds = (Date.now() - a.startedAt) / 1000;
      a.result = data.result;
      persist();
      if (st.answers[st.idx] === a) renderQuestion();
    } catch (err) {
      if (err && err.body && err.body.requiresPremium && typeof openUpgradeModal === 'function') openUpgradeModal();
      else if (typeof showToast === 'function') showToast((err && err.body && err.body.message) || 'Không chấm được đáp án, thử lại nhé.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Kiểm tra'; }
    } finally {
      a.checking = false;
    }
  }

  // ── Result ────────────────────────────────────────────────────────────

  function renderResult() {
    stopTimer();
    const n = st.items.length;
    const score = st.answers.filter(a => a.result && a.result.isCorrect).length;
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
      const ok = st.answers[i].result && st.answers[i].result.isCorrect;
      const text = st.kind === 'skimming' ? it.question.text : it.text;
      return `<button type="button" class="rtp-result-row ${ok ? 'ok' : 'bad'}" data-act="goto" data-idx="${i}">
        <span>${ok ? '✓' : '✗'}</span><span class="rtp-result-q">Câu ${it.questionNumber}: ${esc(text)}</span></button>`;
    }).join('');
    showPanelState(`<div class="rtp-result">
      <div class="rtp-result-icon">🎉</div>
      <div class="rtp-result-title">Hoàn thành luyện tập ${esc(COPY[st.kind].name)}</div>
      <div class="rtp-score">${score} / ${n}</div>
      <div class="rtp-result-msg">${esc(msg)}</div>
      ${total}
      <div class="rtp-result-list">${rows}</div>
      <div class="rtp-result-actions">
        <button type="button" class="rtp-btn" data-act="review">📖 Ôn lại</button>
        <button type="button" class="rtp-btn" data-act="retry">🔄 Làm lại</button>
        <button type="button" class="rtp-btn rtp-btn-primary" data-act="start">🎲 Bài khác</button>
      </div>
    </div>`);
  }

  // ── Events ────────────────────────────────────────────────────────────

  function onClick(e, lesson) {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    if (act === 'start') { start(lesson); return; }
    if (act === 'resume') { resume(lesson); return; }
    if (act === 'upgrade') { if (typeof openUpgradeModal === 'function') openUpgradeModal(); return; }
    if (!st) return;
    switch (act) {
      case 'pick':
        if (st.answers[st.idx].result) return;
        st.answers[st.idx].value = el.dataset.val;
        break;
      case 'check': checkCurrent(); return;
      case 'prev': if (st.idx > 0) st.idx--; break;
      case 'next': if (st.idx < st.items.length - 1) st.idx++; break;
      case 'finish': renderResult(); return;
      case 'hint': st.answers[st.idx].hint = true; break;
      case 'toggle-full': st.showFull = !st.showFull; break;
      case 'goto': st.idx = Math.min(Math.max(Number(el.dataset.idx) || 0, 0), st.items.length - 1); break;
      case 'review': st.idx = 0; break;
      case 'retry':
        st.answers = freshAnswers(st.items);
        st.idx = 0;
        st.showFull = false;
        st.finished = false;
        st.counted = false;
        break;
      case 'close': {
        stopTimer();
        persist();
        st = null;
        const panel = panelEl();
        if (panel) { panel.hidden = true; panel.innerHTML = ''; }
        renderEntry(lesson);
        return;
      }
      default: return;
    }
    persist();
    if (act === 'retry') renderEntry(lesson);
    renderQuestion();
  }

  window.RTPractice = { supports, mount };
})();
