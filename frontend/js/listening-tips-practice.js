'use strict';
// Listening Tips → "🎧 Luyện tập" section at the bottom of a tip.
//
// Loaded on listening.html after listening-tips.js; uses its globals `API`
// (listening.html's inline script, already ending in /api) and `escHtml`
// (js/shared/utils.js). Plays audio through its OWN <audio> element — never
// the page's shared #audio-player, whose global `state` belongs to the exam
// / practice screens (same reason as the Gap-fill screen's #gf-audio).
//
// Nothing loads until the student clicks "Bắt đầu luyện tập". Practices
// come from GET /api/listening-tips/:lessonKey/practice with no answer key;
// each answer is graded by POST …/practice/check, which is also what
// reveals the answer, the explanation and the audio evidence.
//
// No practice history is kept server-side: the current practice, its
// answers and the last / best score live in this browser's localStorage.
(function () {
  const COPY = {
    'keyword-highlighting': {
      name: 'Highlight keyword',
      desc: 'Đọc câu hỏi thật, bấm chọn keyword, dự đoán loại thông tin cần nghe — rồi mới nghe đúng đoạn audio của câu đó và điền đáp án.',
    },
    '30-second-strategy': {
      name: 'Chiến thuật 30 giây',
      desc: '30 giây để đọc 3–5 câu của một đề thật, highlight keyword và dự đoán loại đáp án. Hết giờ audio tự phát — chỉ nghe một lần như thi thật.',
    },
    'symbols-and-paraphrase': {
      name: 'Ký hiệu nhanh',
      desc: 'Nhớ nghĩa các ký hiệu ghi chú ($ # → + – ? ✓ ! ≠), rồi nghe câu thật trong đề và chọn ký hiệu để ghi nhanh ý của câu.',
    },
    'full-workflow-practice': {
      name: 'Quy trình hoàn chỉnh',
      desc: 'Làm trọn quy trình trên 3–5 câu liên tiếp của một đề thật: highlight keyword → dự đoán loại đáp án → nghe → trả lời và tự kiểm tra (ngữ pháp, chính tả, số ít/nhiều, giới hạn từ) → chấm.',
    },
    'predict-noun-adjective-verb': {
      name: 'Dự đoán Noun / Adjective / Verb',
      desc: 'Bài đọc nhanh, không cần nghe: nhìn cấu trúc câu hỏi thật để đoán chỗ trống cần danh từ, tính từ hay động từ — rồi xem dấu hiệu, đáp án thật của đề và câu trong transcript.',
    },
    'predict-number-date-place': {
      name: 'Dự đoán Number / Date / Time / Name / Place',
      desc: 'Bài đọc nhanh, không cần nghe: đoán chỗ trống cần tên người, địa điểm, ngày, giờ, giá tiền hay con số — rồi xem dấu hiệu, những dạng có thể nghe thấy và đáp án thật của đề.',
    },
    'form-note-table-completion': {
      name: 'Form / Note / Table Completion',
      desc: 'Làm các câu điền form / ghi chú / bảng của một bài nghe thật — mỗi câu có đúng đoạn audio của nó, nghe lại được.',
    },
    'multiple-choice': {
      name: 'Multiple Choice',
      desc: 'Trả lời các câu trắc nghiệm A/B/C của một bài nghe thật: nghe theo ý nghĩa, loại đáp án gây nhiễu.',
    },
    matching: {
      name: 'Matching',
      desc: 'Ghép từng người / mục với đúng lựa chọn trong một bài nghe thật.',
    },
    'map-plan-diagram': {
      name: 'Map / Plan / Diagram',
      desc: 'Điền chữ cái vị trí trên bản đồ / sơ đồ thật: xác định điểm bắt đầu rồi đi theo chỉ dẫn của người nói.',
    },
    'sentence-completion': {
      name: 'Sentence Completion',
      desc: 'Hoàn thành câu bằng từ nghe được — đúng chính tả, số ít / số nhiều và giới hạn từ.',
    },
    'multiple-answers': {
      name: 'Multiple Answers',
      desc: 'Dạng “Choose TWO / THREE letters” của một bài nghe thật: tìm đủ các ý đúng, không chọn ngay ý đầu tiên nghe thấy.',
    },
    'predict-plural-countable-formula': {
      name: 'Số ít / nhiều, V-ing & cụm từ',
      desc: 'Bài đọc nhanh, không cần nghe: đoán đáp án sẽ ở dạng nào (số ít, số nhiều, không đếm được, V-ing, cụm từ…) — rồi xem dấu hiệu trong câu và đáp án thật của đề.',
    },
  };
  // What kind of information fills a gap (the server derives the real one
  // from the key and reveals it only when the answer is checked).
  const TYPES = {
    proper: { icon: '🏷️', label: 'Tên riêng', hint: 'người, địa điểm, tổ chức' },
    date: { icon: '📅', label: 'Ngày / thứ / tháng', hint: '' },
    time: { icon: '⏰', label: 'Giờ', hint: '' },
    price: { icon: '💷', label: 'Giá tiền', hint: '' },
    number: { icon: '🔢', label: 'Số / mã số', hint: 'số lượng, SĐT, số phòng' },
    word: { icon: '🔤', label: 'Từ vựng', hint: 'noun / adjective / verb' },
  };
  // Words a student shouldn't spend a highlight on (the tip: "không cần
  // highlight the / will be / on").
  const LOW_VALUE = new Set(('a an the is are was were be been will would can could should must may might do does did has have had '
    + 'of to in on at by for with from as and or but it its this that these those there their they he she his her we you your i my '
    + 'per than then so very too also just').split(' '));
  const SYMBOL_NAMES = {
    '$': 'price', '#': 'number', '→': 'change / result', '+': 'advantage / positive', '–': 'disadvantage / negative',
    '?': 'uncertain', '✓': 'confirmed', '!': 'important', '≠': 'contrast',
  };
  // Phase 2 predictions (the server derives the real one from the question
  // and the key).
  const WORD_CLASSES = {
    noun: { icon: '🔵', label: 'Noun — danh từ', hint: '' },
    adjective: { icon: '🟣', label: 'Adjective — tính từ', hint: '' },
    verb: { icon: '🟢', label: 'Verb — động từ', hint: '' },
  };
  const INFO_TYPES = {
    name: { icon: '🙋', label: 'Tên người', hint: '' },
    place: { icon: '📍', label: 'Địa điểm', hint: '' },
    date: { icon: '📅', label: 'Ngày / thứ / tháng', hint: '' },
    time: { icon: '⏰', label: 'Giờ', hint: '' },
    price: { icon: '💷', label: 'Giá tiền', hint: '' },
    number: { icon: '🔢', label: 'Số / mã số', hint: 'số lượng, SĐT, postcode…' },
  };
  const FORMS = {
    singular: { icon: '1️⃣', label: 'Danh từ số ít', hint: '' },
    plural: { icon: '🔢', label: 'Danh từ số nhiều (-s)', hint: '' },
    uncountable: { icon: '💧', label: 'Không đếm được', hint: 'information, equipment…' },
    ving: { icon: '🏃', label: 'V-ing', hint: '' },
    verb: { icon: '🟢', label: 'Động từ nguyên mẫu', hint: '' },
    adjective: { icon: '🟣', label: 'Tính từ', hint: '' },
    phrase: { icon: '🔗', label: 'Cụm 2–3 từ', hint: '' },
  };
  // What each kind of information can sound like (shown once it's confirmed).
  const POSSIBLE_FORMS = {
    time: '9:00 · 9.30 · half past nine · quarter to ten',
    date: '21st · 21 June · the twenty-first of June · Monday',
    price: '£8.50 · eight pounds fifty · $470',
    number: '15 · fifteen · 0-9-1-4… (đọc từng số) · 2,000',
    name: 'thường được đánh vần: J-A-M-I-E-S-O-N — viết hoa chữ cái đầu',
    place: 'tên đường / toà nhà / thành phố — hay được đánh vần, nhớ viết hoa',
  };
  // "Trước khi làm" mini tutorial per question type (and collapsible on
  // every question) — from the spec and the tips themselves.
  const QTYPE_GUIDE = {
    form: {
      steps: ['Đọc câu hỏi và nhãn của ô trống (Name, Date, Cost…).', 'Dự đoán loại đáp án: số? tên? ngày? danh từ?',
        'Gạch chân keyword.', 'Nghe keyword hoặc cách nói khác (paraphrase).', 'Chép đúng từ nghe được.',
        'Kiểm tra: chính tả · số ít / số nhiều · giới hạn từ.'],
      warning: 'Golden rule: đáp án có thể bị sửa lại ngay sau đó — “The course starts on Monday… actually, it’s been moved to Tuesday” → Tuesday. Nghe hết câu rồi mới chốt.',
    },
    mcq: {
      steps: ['Đọc câu hỏi (chưa vội đọc kỹ các option).', 'Xác định câu hỏi đang hỏi gì.', 'Gạch chân điểm KHÁC nhau giữa A / B / C.',
        'Dự đoán nếu có thể.', 'Nghe theo ý nghĩa, không chờ đúng từng chữ.', 'Loại các option gây nhiễu.', 'Chọn theo đúng điều audio nói.'],
      warning: 'Đừng chọn chỉ vì audio có đúng từ giống option. Bẫy: “At first I thought it was too expensive, but actually the main problem was…”.',
    },
    matching: {
      steps: ['Đọc danh sách lựa chọn (A, B, C…).', 'Xác định điểm khác nhau giữa các lựa chọn.', 'Gạch chân tên người / mục cần ghép.',
        'Dự đoán mối liên hệ có thể có.', 'Nghe theo từng người / mục.', 'Ghép theo ý nghĩa, không theo từ giống nhau.'],
      warning: 'Một lựa chọn có thể được nhắc tới chỉ để bị loại bỏ.',
    },
    map: {
      steps: ['Nhìn bản đồ / sơ đồ trước.', 'Tìm điểm bắt đầu (entrance, you are here…).', 'Xác định các mốc (landmarks).',
        'Nắm phương hướng: north, left / right, above / below.',
        'Nghe: next to · opposite · behind · on the left · at the end of · across from · between.', 'Đi theo đúng lộ trình người nói mô tả.'],
      warning: 'Sai lầm hay gặp: chỉ nghe keyword mà không theo chỉ dẫn phương hướng.',
    },
    sentence: {
      steps: ['Đọc cả câu.', 'Dự đoán ngữ pháp của từ cần điền.', 'Dự đoán loại đáp án.', 'Gạch chân keyword.', 'Nghe.',
        'Kiểm tra câu sau khi điền có đúng ngữ pháp.', 'Kiểm tra giới hạn từ.'],
      warning: 'Listening đòi hỏi đúng chính tả (accommodation), số ít / số nhiều (student ≠ students) và số liệu chính xác (15 ≠ 50).',
    },
    multi: {
      steps: ['Đọc TOÀN BỘ các option.', 'Gạch chân điểm khác nhau.', 'Xác định cần tìm mấy ý (TWO / THREE) và về điều gì.',
        'Nghe: một option có thể được nhắc tới rồi bị bác bỏ.', 'Chọn đủ số chữ cái đề yêu cầu.'],
      warning: 'Không chọn ngay option đầu tiên nghe thấy.',
    },
  };
  const QTYPE_NAME = {
    form: 'Form / Note / Table', mcq: 'Multiple Choice', matching: 'Matching', map: 'Map / Plan / Diagram',
    sentence: 'Sentence Completion', multi: 'Multiple Answers',
  };
  const CHOICE_SETS = { wordclass: WORD_CLASSES, infotype: INFO_TYPES, form: FORMS };
  const PREDICT_KINDS = new Set(['wordclass', 'infotype', 'form']);
  const RUN_KINDS = new Set(['preview', 'workflow']);       // several gaps, one stretch of audio
  const CHECKLIST = [
    ['grammar', 'Ngữ pháp: đáp án ghép vào câu có đúng không?'],
    ['spelling', 'Chính tả: đã viết đúng từng chữ cái?'],
    ['plural', 'Số ít / số nhiều: có cần -s không?'],
    ['limit', 'Giới hạn từ: không viết quá số từ đề cho'],
  ];

  let st = null;          // current practice state (null = entry card only)
  let timerHandle = null;
  // Bumped whenever the panel changes hands (another tip, a new load, close)
  // so a late response for an earlier request is dropped.
  let loadSeq = 0;
  const LOAD_TIMEOUT_MS = 45000;
  const CHECK_TIMEOUT_MS = 30000;
  const SLOW_NOTICE_MS = 6000;
  const SPEEDS = [1, 0.8, 1.2];

  const esc = (s) => escHtml(s == null ? '' : String(s));
  const escNl = (s) => esc(s).replace(/\n/g, '<br>');
  const KEY_ATTRS = 'tabindex="0" role="button"';

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  // ── Requests ──────────────────────────────────────────────────────────

  async function api(path, opts, ms) {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl && setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(API + path, {
        ...(opts || {}),
        signal: ctrl ? ctrl.signal : undefined,
        headers: { 'Content-Type': 'application/json', ...(window.AuthService ? window.AuthService.authHeader() : {}) },
      });
      return await window.ApiClient.handleResponse(res);
    } finally {
      clearTimeout(timer);
    }
  }

  // What to tell the student when a request fails. Our own 4xx messages are
  // already Vietnamese; anything else gets a plain explanation.
  function errorMessage(err, fallback) {
    if (err && err.name === 'AbortError') return 'Máy chủ phản hồi quá lâu (có thể đang khởi động). Vui lòng thử lại sau vài giây.';
    if (err && err.coldStart) return 'Máy chủ đang khởi động, vui lòng thử lại sau vài giây.';
    if (err && err.status >= 400 && err.status < 500 && err.body && err.body.message) return err.body.message;
    if (err && err.status >= 500) return 'Máy chủ đang gặp sự cố, vui lòng thử lại sau ít phút.';
    if (err && !err.status && (err instanceof TypeError || navigator.onLine === false)) return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
    return fallback;
  }

  function announce(msg) {
    const el = document.getElementById('ltp-live');
    if (el) el.textContent = msg;
  }

  // ── Scrolling (the page is long on phones) ────────────────────────────

  function topOffset() {
    const css = getComputedStyle(document.documentElement);
    const px = (name, dflt) => { const v = parseInt(css.getPropertyValue(name), 10); return Number.isFinite(v) ? v : dflt; };
    return px('--nav-height', 64) + px('--expiry-banner-height', 0);
  }

  function revealPanel() {
    const panel = panelEl();
    if (!panel || panel.hidden) return;
    const top = panel.getBoundingClientRect().top;
    if (top < topOffset() || top > window.innerHeight * 0.6) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function revealEl(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const over = r.bottom - window.innerHeight + 16;
    const room = r.top - topOffset() - 12;
    if (over > 0 && room > 0) window.scrollBy({ top: Math.min(over, room), behavior: 'smooth' });
  }

  // ── Browser-only persistence ──────────────────────────────────────────
  // One localStorage entry per account: { [lessonKey]: { practice, answers,
  // idx, stage, finished, counted, savedAt, last, best, attempts } }.
  const STORE_PREFIX = 'ltp_v1_';
  const STALE_MS = 30 * 24 * 60 * 60 * 1000;
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

  // One section with its questions (runs, question types) vs items drawn
  // from several sections.
  const oneSection = (practice) => RUN_KINDS.has(practice.kind) || practice.kind === 'qtype';

  function itemsOf(practice) {
    if (!practice) return null;
    return oneSection(practice) ? practice.questions : practice.items;
  }

  const SAVED_ANSWER_FIELDS = ['value', 'result', 'sel', 'kwSel', 'kwDone', 'prediction', 'played', 'note', 'para', 'step'];
  function savedAnswer(a) {
    const out = {};
    SAVED_ANSWER_FIELDS.forEach(k => { if (a && a[k] !== undefined) out[k] = a[k]; });
    if (out.value == null) out.value = '';
    if (out.result === undefined) out.result = null;
    if (!Array.isArray(out.sel)) out.sel = [];
    return out;
  }

  function loadRecord(key) {
    const rec = readStore()[key];
    if (!rec || typeof rec !== 'object') return null;
    const items = itemsOf(rec.practice);
    // (practices saved before every tip got its one fixed practice are dropped)
    const usable = Array.isArray(items) && items.length && rec.practice.fixed && Array.isArray(rec.answers)
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
      answers: st.answers.map(savedAnswer),
      idx: st.idx,
      // a 30-second run can't resume mid-timer or mid-audio: back to its start
      stage: st.kind === 'preview' && (st.stage === 'prep' || st.stage === 'listen') ? 'intro' : st.stage,
      checklist: st.checklist || {},
      introSeen: !!st.introSeen,
      finished: st.finished,
      counted: st.counted,
    };
    writeStore(all);
  }
  function persistSoon() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(persist, 400);
  }


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

  // ── Audio (one element, one segment at a time) ────────────────────────

  const player = { el: null, url: '', seg: null, id: '', locked: false, speed: 1, state: 'idle' };

  function audioEl() {
    if (player.el) return player.el;
    const a = document.createElement('audio');
    a.preload = 'none';
    a.className = 'ltp-audio';
    a.hidden = true;
    document.body.appendChild(a);
    a.addEventListener('timeupdate', onAudioTime);
    a.addEventListener('ended', () => finishSegment());
    a.addEventListener('error', () => {
      if (!player.id) return;
      player.state = 'error';
      syncPlayer();
      if (typeof onSegmentEnd === 'function') onSegmentEnd(player.id, true);
    });
    player.el = a;
    return a;
  }

  // Plays [seg.start, seg.end] of `url` into the player widget `id`.
  // `locked` = exam mode (no pause / replay while it plays).
  const SLOW_AUDIO_MS = 15000;
  let slowAudioTimer = null;

  function playSegment(id, url, seg, { locked = false } = {}) {
    const a = audioEl();
    // after a failed load the same src never loads again by itself
    const failed = !!a.error || player.state === 'error';
    player.id = id;
    player.seg = seg;
    player.locked = locked;
    player.state = 'loading';
    syncPlayer();
    // a stalled download says so instead of spinning forever
    clearTimeout(slowAudioTimer);
    slowAudioTimer = setTimeout(() => {
      if (player.id === id && player.state === 'loading') { player.state = 'slow'; syncPlayer(); }
    }, SLOW_AUDIO_MS);
    const go = () => {
      try { a.currentTime = seg.start; } catch (e) { /* not seekable yet */ }
      a.playbackRate = locked ? 1 : player.speed;
      const p = a.play();
      if (p && p.catch) {
        p.catch(() => {
          player.state = 'blocked'; // autoplay refused — the student has to press play
          syncPlayer();
        });
      }
    };
    if (player.url !== url || failed) {
      player.url = url;
      a.src = url;
      a.addEventListener('loadedmetadata', go, { once: true });
      a.load();
    } else if (a.readyState >= 1) go();
    else a.addEventListener('loadedmetadata', go, { once: true });
  }

  function pauseAudio() {
    if (player.el && !player.el.paused) player.el.pause();
    if (player.state === 'playing' || player.state === 'loading' || player.state === 'slow') player.state = 'paused';
    syncPlayer();
  }

  function stopAudio() {
    clearTimeout(slowAudioTimer);
    if (player.el && !player.el.paused) player.el.pause();
    player.id = '';
    player.state = 'idle';
  }

  let onSegmentEnd = null; // (playerId, failed) → set by the screen that plays

  function finishSegment() {
    if (!player.id) return;
    if (player.el && !player.el.paused) player.el.pause();
    player.state = 'done';
    syncPlayer();
    const id = player.id;
    if (typeof onSegmentEnd === 'function') onSegmentEnd(id, false);
  }

  function onAudioTime() {
    const a = player.el;
    if (!a || !player.seg || !player.id) return;
    if (!a.paused && player.state !== 'playing') player.state = 'playing';
    if (a.currentTime >= player.seg.end) { finishSegment(); return; }
    syncPlayer();
  }

  function playerHtml(id, seg, { label = 'Nghe đoạn audio', locked = false } = {}) {
    const len = Math.max(0, seg.end - seg.start);
    // locked: the play button only shows if the browser refused to autoplay
    return `<div class="ltp-player${locked ? ' locked' : ''}" id="${id}" data-state="idle">
      <button type="button" class="ltp-play" data-act="play" data-player="${id}" aria-label="Phát / tạm dừng">▶</button>
      <div class="ltp-player-body">
        <div class="ltp-player-label">🎧 ${esc(label)} <span class="ltp-player-len">(${fmtTime(len)})</span></div>
        <div class="ltp-track"><i></i></div>
      </div>
      <span class="ltp-time">0:00 / ${fmtTime(len)}</span>
      ${locked ? '' : `<button type="button" class="ltp-link" data-act="replay" data-player="${id}" title="Nghe lại từ đầu đoạn">↺</button>
      <button type="button" class="ltp-link ltp-speed" data-act="speed" data-player="${id}" title="Tốc độ">${player.speed}x</button>`}
    </div>`;
  }

  // Reflects the audio state in the widget currently on screen.
  function syncPlayer() {
    document.querySelectorAll('#ltp-panel .ltp-player').forEach(box => {
      const mine = box.id === player.id;
      const state = mine ? player.state : 'idle';
      box.dataset.state = state;
      const btn = box.querySelector('.ltp-play');
      if (btn) {
        btn.textContent = state === 'playing' || state === 'loading' || state === 'slow' ? '❚❚' : '▶';
        btn.setAttribute('aria-label', state === 'playing' ? 'Tạm dừng' : 'Phát');
      }
      if (!mine || !player.seg || !player.el) return;
      const len = Math.max(0.1, player.seg.end - player.seg.start);
      const pos = Math.min(len, Math.max(0, player.el.currentTime - player.seg.start));
      const bar = box.querySelector('.ltp-track i');
      if (bar) bar.style.width = `${Math.round((state === 'done' ? len : pos) / len * 100)}%`;
      const t = box.querySelector('.ltp-time');
      if (t) {
        t.textContent = state === 'error' ? 'Không phát được audio — bấm ▶ để thử lại'
          : state === 'blocked' ? 'Bấm ▶ để nghe'
            : state === 'slow' ? 'Mạng chậm, audio đang tải…'
            : `${fmtTime(state === 'done' ? len : pos)} / ${fmtTime(len)}`;
      }
    });
  }

  // ── Entry card + lifecycle ────────────────────────────────────────────

  function supports(lesson) { return !!(lesson && lesson.hasPractice && COPY[lesson.lessonKey]); }

  // Called by listening-tips.js after it renders a tip.
  function mount(lesson, slot) {
    stopTimer();
    stopAudio();
    if (st) persist();
    st = null;
    loadSeq++;
    onSegmentEnd = null;
    if (!slot || !supports(lesson)) return;
    slot.innerHTML = `<section class="ltp-section" id="ltp-section">
      <div id="ltp-entry-wrap"></div>
      <div class="ltp-panel" id="ltp-panel" hidden></div>
      <div class="ltp-sr" id="ltp-live" aria-live="polite"></div>
    </section>`;
    renderEntry(lesson);
    const section = slot.querySelector('#ltp-section');
    section.addEventListener('click', (e) => onClick(e, lesson));
    section.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('.ltp-input[data-enter="check"]')) { e.preventDefault(); checkCurrent(); return; }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-act][role="button"]')) {
        e.preventDefault();
        e.target.click();
      }
    });
    section.addEventListener('input', (e) => {
      if (!st) return;
      const qi = e.target.dataset.qi;
      const a = qi != null ? st.answers[Number(qi)] : st.answers[st.idx];
      if (!a) return;
      if (e.target.matches('.ltp-input')) {
        a.value = e.target.value;
        syncCheckBtn();
        persistSoon();
      } else if (e.target.matches('.ltp-note')) {
        a.note = e.target.value;
        persistSoon();
      } else if (e.target.matches('.ltp-para')) {
        a.para = e.target.value;
        persistSoon();
      }
    });
  }

  function renderEntry(lesson) {
    const wrap = document.getElementById('ltp-entry-wrap');
    if (!wrap) return;
    const c = COPY[lesson.lessonKey];
    const rec = loadRecord(lesson.lessonKey);
    const items = rec && itemsOf(rec.practice);
    let buttons;
    if (st && st.lesson.lessonKey === lesson.lessonKey) {
      buttons = '<button type="button" class="ltp-btn" data-act="start">↻ Làm lại từ đầu</button>';
    } else if (items && !rec.finished) {
      const where = RUN_KINDS.has(rec.practice.kind) ? '' : ` (Câu ${Math.min((rec.idx || 0) + 1, items.length)}/${items.length})`; // questions / items
      buttons = `<button type="button" class="ltp-btn ltp-btn-primary" data-act="resume">▶ Tiếp tục bài đang làm${where}</button>
        <button type="button" class="ltp-btn" data-act="start">↻ Làm lại từ đầu</button>`;
    } else if (items) {
      buttons = `<button type="button" class="ltp-btn ltp-btn-primary" data-act="start">↻ Luyện lại</button>
        <button type="button" class="ltp-btn" data-act="resume">📖 Xem lại kết quả</button>`;
    } else {
      buttons = '<button type="button" class="ltp-btn ltp-btn-primary" data-act="start">🎧 Bắt đầu luyện tập</button>';
    }
    const stats = rec && rec.last
      ? `<div class="ltp-entry-stats">Lần gần nhất: <b>${rec.last.score}/${rec.last.total}</b>`
        + (rec.best ? ` · Cao nhất: <b>${rec.best.score}/${rec.best.total}</b>` : '')
        + ` · Đã luyện ${rec.attempts || 1} lần <span class="ltp-entry-note">(lưu trên trình duyệt này)</span></div>`
      : '';
    wrap.innerHTML = `<div class="ltp-entry">
      <div class="ltp-entry-icon">🎧</div>
      <div class="ltp-entry-text">
        <div class="ltp-entry-title">Luyện tập ${esc(c.name)}</div>
        <div class="ltp-entry-desc">${esc(c.desc)}</div>
        ${stats}
      </div>
      <div class="ltp-entry-actions">${buttons}</div>
    </div>`;
  }

  function panelEl() { return document.getElementById('ltp-panel'); }

  function showPanelState(html) {
    const panel = panelEl();
    if (!panel) return;
    panel.hidden = false;
    panel.innerHTML = html;
  }

  async function start(lesson) {
    stopTimer();
    stopAudio();
    if (st) persist();
    st = null;
    const seq = ++loadSeq;
    const panel = panelEl();
    if (!panel) return;
    const entryBtn = document.querySelector('#ltp-entry-wrap [data-act="start"]');
    if (!(window.AuthService && window.AuthService.isLoggedIn())) {
      const next = location.pathname + location.search;
      const loginUrl = window.AuthService && window.AuthService.buildLoginUrl
        ? window.AuthService.buildLoginUrl(next) : '/login.html?next=' + encodeURIComponent(next);
      showPanelState(`<div class="ltp-state"><div class="ltp-state-icon">🔐</div>
        <div>Bạn cần đăng nhập để luyện tập.</div>
        <a class="ltp-btn ltp-btn-primary" href="${esc(loginUrl)}">Đăng nhập</a></div>`);
      return;
    }
    if (entryBtn) entryBtn.disabled = true;
    showPanelState(`<div class="ltp-state" role="status"><div class="ltp-state-icon"><i class="fas fa-spinner fa-spin"></i></div>
      <div>Đang tải bài luyện tập...</div>
      <div class="ltp-state-slow" hidden>Máy chủ có thể đang khởi động — chờ thêm chút nhé…</div></div>`);
    const slow = setTimeout(() => {
      const el = seq === loadSeq && document.querySelector('#ltp-panel .ltp-state-slow');
      if (el) el.hidden = false;
    }, SLOW_NOTICE_MS);
    try {
      const data = await api(`/listening-tips/${encodeURIComponent(lesson.lessonKey)}/practice`, {}, LOAD_TIMEOUT_MS);
      if (seq !== loadSeq) return; // another tip / request took over meanwhile
      if (!data.practice) {
        renderEntry(lesson);
        showPanelState(`<div class="ltp-state"><div class="ltp-state-icon">📭</div>
          <div>${esc(data.message || 'Chưa tìm thấy bài luyện tập phù hợp.')}</div>
          <button type="button" class="ltp-btn" data-act="dismiss">Đóng</button></div>`);
        return;
      }
      begin(lesson, data.practice);
    } catch (err) {
      if (seq !== loadSeq) return;
      renderEntry(lesson);
      if (err && err.body && err.body.requiresPremium) {
        showPanelState(`<div class="ltp-state"><div class="ltp-state-icon">⭐</div>
          <div>${esc(err.body.message || 'Bạn cần nâng cấp lên Premium để luyện tập.')}</div>
          <button type="button" class="ltp-btn ltp-btn-primary" data-act="upgrade">Nâng cấp Premium</button></div>`);
        return;
      }
      showPanelState(`<div class="ltp-state ltp-state-error" role="alert"><div class="ltp-state-icon">⚠️</div>
        <div>${esc(errorMessage(err, 'Không tải được bài luyện tập. Vui lòng thử lại.'))}</div>
        <button type="button" class="ltp-btn" data-act="start" data-force="1">Thử lại</button></div>`);
    } finally {
      clearTimeout(slow);
      if (entryBtn) entryBtn.disabled = false;
    }
  }

  function hasProgress(answers) {
    return (answers || []).some(a => a && (a.result || a.kwDone || Number(a.step) > 1));
  }

  // "Làm lại từ đầu" replaces the practice in progress — ask first when the student
  // has already done something in it.
  function confirmNewPractice(lesson, go) {
    let busy;
    if (st) busy = !st.finished && hasProgress(st.answers);
    else {
      const rec = loadRecord(lesson.lessonKey);
      busy = !!(rec && rec.practice && !rec.finished && hasProgress(rec.answers));
    }
    if (!busy) { go(); return; }
    const msg = 'Các câu bạn đã làm trong bài này sẽ bị xoá để làm lại từ đầu. Bạn chắc chứ?';
    if (typeof window.confirmDialog === 'function') {
      window.confirmDialog('Làm lại từ đầu?', msg, go, { confirmLabel: 'Làm lại', confirmClass: 'btn-primary' });
    } else if (window.confirm(msg)) go();
  }

  function freshAnswers(items) {
    return items.map(() => ({ value: '', result: null, sel: [], kwDone: false, prediction: null, played: 0, note: '', step: 0 }));
  }

  function begin(lesson, practice) {
    const items = itemsOf(practice);
    st = {
      lesson, practice, kind: practice.kind, items,
      idx: 0, stage: practice.kind === 'workflow' ? 'kw' : 'intro', checklist: {}, finished: false, counted: false,
      answers: freshAnswers(items),
    };
    persist();
    renderEntry(lesson);
    renderQuestion();
    revealPanel();
  }

  function resume(lesson) {
    const rec = loadRecord(lesson.lessonKey);
    const items = rec && itemsOf(rec.practice);
    if (!items) { renderEntry(lesson); return; }
    stopTimer();
    stopAudio();
    loadSeq++;
    st = {
      lesson, practice: rec.practice, kind: rec.practice.kind, items,
      idx: Math.min(Math.max(Number(rec.idx) || 0, 0), items.length - 1),
      stage: ['intro', 'kw', 'predict', 'listen', 'answer', 'result'].includes(rec.stage) ? rec.stage : 'intro',
      checklist: rec.checklist && typeof rec.checklist === 'object' ? rec.checklist : {},
      introSeen: !!rec.introSeen,
      finished: !!rec.finished, counted: !!rec.counted,
      answers: rec.answers.map(savedAnswer),
    };
    renderEntry(lesson);
    if (st.finished) renderResult(); else renderQuestion();
    revealPanel();
  }

  // ── Shared pieces ─────────────────────────────────────────────────────

  // the worked example (not scored) is done once all its steps are shown
  const isExample = (i) => st.kind === 'qtype' && !!st.items[i] && st.items[i].mode === 'example';
  const isDone = (i) => !!(st.answers[i] && (st.answers[i].result || (isExample(i) && st.answers[i].step >= EX_STEPS)));

  function headerHtml(sourceLine) {
    const n = st.items.length;
    const done = st.answers.filter((a, i) => isDone(i)).length;
    return `<div class="ltp-head">
      <div class="ltp-head-top">
        <div class="ltp-title">🎧 Luyện tập: ${esc(COPY[st.lesson.lessonKey].name)}</div>
        <button type="button" class="ltp-link ltp-close" data-act="close" title="Đóng bài luyện tập">✕ Đóng</button>
      </div>
      ${sourceLine ? `<div class="ltp-source">Nguồn: ${sourceLine}</div>` : ''}
      <div class="ltp-progress">
        <span>Câu ${st.idx + 1} / ${n}</span>
        <div class="ltp-bar"><i style="width:${Math.round(done / n * 100)}%"></i></div>
        <span class="ltp-done">${done}/${n} đã làm</span>
      </div>
    </div>`;
  }

  function navHtml(checkBtn) {
    const last = st.idx === st.items.length - 1;
    const allDone = st.answers.every((x, i) => isDone(i));
    const done = isDone(st.idx);
    const firstOpen = st.answers.findIndex((x, i) => !isDone(i));
    let nextBtn;
    if (!last) nextBtn = `<button type="button" class="ltp-btn ${done ? 'ltp-btn-primary' : ''}" data-act="next">Câu tiếp →</button>`;
    else if (allDone) nextBtn = '<button type="button" class="ltp-btn ltp-btn-primary" data-act="finish">Xem kết quả 🎉</button>';
    else if (done) nextBtn = `<button type="button" class="ltp-btn ltp-btn-primary" data-act="goto" data-idx="${firstOpen}">Làm câu còn lại →</button>`;
    else nextBtn = '';
    return `<div class="ltp-nav">
      <button type="button" class="ltp-btn" data-act="prev" ${st.idx === 0 ? 'disabled' : ''}>← Câu trước</button>
      <div class="ltp-nav-right">${done ? '' : checkBtn || ''}${nextBtn}</div>
    </div>`;
  }

  function checkBtnHtml(a, enabled) {
    return `<button type="button" class="ltp-btn ltp-btn-primary" data-act="check" ${enabled ? '' : 'disabled'}>Kiểm tra</button>`;
  }

  function evidenceHtml(ev, keywords, playerId) {
    if (!ev) return '';
    const text = markTerms(ev.text, keywords || [], 'ltp-hit');
    return `<div class="ltp-evidence">
      <div class="ltp-evidence-label">🎧 Audio evidence${ev.speaker ? ` · ${esc(ev.speaker)}` : ''}</div>
      <div class="ltp-evidence-text">“${text}”</div>
      ${playerId ? `<button type="button" class="ltp-link" data-act="ev-play" data-player="${playerId}">▶ Nghe lại câu này</button>
        <div class="ltp-ev-player" id="${playerId}-wrap"></div>` : ''}
    </div>`;
  }

  // [start, end] of every whole-word occurrence of `term` in `text`.
  function termRanges(text, term) {
    const src = String(term || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    if (!src) return [];
    const re = new RegExp('(^|[^\\p{L}\\p{N}])(' + src + ')(?![\\p{L}\\p{N}])', 'giu');
    const out = [];
    let m;
    while ((m = re.exec(text))) {
      const s = m.index + m[1].length;
      out.push([s, s + m[2].length]);
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out;
  }

  // Marks whole-word occurrences of `terms` in `text` (escaped).
  function markTerms(text, terms, cls) {
    const ranges = [];
    terms.filter(Boolean).forEach(t => ranges.push(...termRanges(text, t)));
    ranges.sort((a, b) => a[0] - b[0]);
    let html = '';
    let at = 0;
    ranges.forEach(([s, e]) => {
      if (s < at) return;
      html += esc(text.slice(at, s)) + `<span class="${cls}">${esc(text.slice(s, e))}</span>`;
      at = e;
    });
    return html + esc(text.slice(at));
  }

  // The question text as clickable words; the gap stays a gap.
  function tokens(text) {
    const out = [];
    let wi = 0;
    String(text).split(/(\s+)/).forEach(t => {
      if (!t) return;
      if (/^\s+$/.test(t)) out.push({ space: t });
      else if (t.includes('_____')) out.push({ blank: t });
      else out.push({ text: t, word: wi++ });
    });
    return out;
  }
  const bareWord = (t) => String(t).toLowerCase().replace(/^[^\p{L}\p{N}£$€]+|[^\p{L}\p{N}%]+$/gu, '');

  function tokensHtml(text, sel, { locked, qi, kw = [] } = {}) {
    const picked = new Set(sel || []);
    const kwWords = new Set(kw.flatMap(k => k.split(/\s+/)).map(bareWord));
    return tokens(text).map(t => {
      if (t.space) return t.space;
      if (t.blank) return `<span class="ltp-blank">${esc(t.blank.replace('_____', ' ______ '))}</span>`;
      const on = picked.has(t.word);
      const cls = ['ltp-tok', on ? 'sel' : '', locked && kwWords.has(bareWord(t.text)) ? 'kw' : ''].filter(Boolean).join(' ');
      const attrs = locked ? '' : `data-act="kw" data-ti="${t.word}"${qi != null ? ` data-qi="${qi}"` : ''} ${KEY_ATTRS} aria-pressed="${on}"`;
      return `<span class="${cls}" ${attrs}>${esc(t.text)}</span>`;
    }).join('');
  }

  // How the student's highlights compare with the suggested keywords.
  function kwFeedbackHtml(q, a) {
    const words = tokens(q.text).filter(t => t.text != null);
    const picked = words.filter(t => (a.sel || []).includes(t.word)).map(t => bareWord(t.text)).filter(Boolean);
    const suggested = [...new Set(q.keywords.flatMap(k => k.split(/\s+/)).map(bareWord))];
    const signals = (q.signals || []).map(bareWord);
    const hit = [...new Set(picked.filter(w => suggested.includes(w)))];
    const extra = [...new Set(picked.filter(w => LOW_VALUE.has(w) && !signals.includes(w)))];
    const chips = (list, cls) => list.map(k => `<span class="ltp-chip ${cls}">${esc(k)}</span>`).join(' ');
    return `<div class="ltp-kwfb">
      <div><b>🔵 Keyword gợi ý:</b> ${chips(q.keywords, 'kw') || '<i>—</i>'}</div>
      ${signals.length ? `<div><b>🟢 Dấu hiệu loại đáp án:</b> ${chips(q.signals, 'sig')} <span class="ltp-muted">(từ đứng sát chỗ trống)</span></div>` : ''}
      <div class="ltp-muted">Bạn chọn ${picked.length} từ, trùng <b>${hit.length}/${suggested.length}</b> từ gợi ý.${extra.length ? ` Không cần highlight: ${esc(extra.join(', '))}.` : ''}</div>
    </div>`;
  }

  // The prediction choices of the current practice.
  const choiceSet = () => CHOICE_SETS[st.kind] || TYPES;

  function typeChipsHtml(selected, { locked, qi, compact } = {}) {
    return `<div class="ltp-types${compact ? ' compact' : ''}">${Object.entries(choiceSet()).map(([k, t]) => {
      const on = selected === k;
      const attrs = locked ? '' : `data-act="predict" data-val="${k}"${qi != null ? ` data-qi="${qi}"` : ''} ${KEY_ATTRS} aria-pressed="${on}"`;
      return `<span class="ltp-type${on ? ' on' : ''}" ${attrs} title="${esc(t.hint)}">${t.icon} ${esc(t.label)}</span>`;
    }).join('')}</div>`;
  }

  const typeName = (k) => { const t = choiceSet()[k]; return t ? `${t.icon} ${t.label}` : '—'; };

  // The question with its gap, and the word that gives the answer away
  // marked (the occurrence nearest the gap).
  function questionHtml(q, signal) {
    const text = String(q.text);
    const gapAt = text.indexOf('_____');
    const occ = signal ? termRanges(text, signal) : [];
    let html = esc(text);
    if (occ.length) {
      const [s, e] = occ.reduce((b, r) => (Math.abs(r[0] - gapAt) < Math.abs(b[0] - gapAt) ? r : b));
      html = esc(text.slice(0, s)) + `<span class="ltp-sig">${esc(text.slice(s, e))}</span>` + esc(text.slice(e));
    }
    return `<div class="ltp-q-block">
      ${q.context ? `<div class="ltp-context">📋 ${esc(q.context)}</div>` : ''}
      <div class="ltp-q">${html.replace('_____', '<span class="ltp-blank"> ______ </span>')}</div>
      ${q.wordLimit ? `<div class="ltp-limit">✍️ ${esc(q.wordLimit)}</div>` : ''}
    </div>`;
  }

  const diagnosisHtml = (r) => (r && r.diagnosis ? `<div class="ltp-diag">⚠️ ${esc(r.diagnosis.note)}</div>` : '');

  function answerLabel(key) {
    return String(key || '').split('/').map(s => s.trim()).filter(Boolean).join(' / ');
  }

  // ── Screens ───────────────────────────────────────────────────────────

  function renderQuestion() {
    stopTimer();
    onSegmentEnd = null;
    if (st.kind === 'keywords') renderKeywords();
    else if (st.kind === 'preview') renderPreview();
    else if (st.kind === 'workflow') renderWorkflow();
    else if (PREDICT_KINDS.has(st.kind)) renderPredictItem();
    else if (st.kind === 'qtype') { if (st.introSeen) renderQtypeQuestion(); else renderQtypeIntro(); }
    else renderSymbols();
    syncPlayer();
  }

  // Dự đoán Noun/Adj/Verb · Number/Date/… · dạng của đáp án — text only:
  // read the question → predict → see why, the real answer and its
  // sentence in the transcript.
  function renderPredictItem() {
    const q = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    const stepNo = r ? 3 : a.prediction ? 2 : 1;
    const steps = ['Đọc câu hỏi', 'Dự đoán', 'Xem giải thích'].map((s, i) => {
      const cls = i + 1 < stepNo ? 'done' : i + 1 === stepNo ? 'active' : '';
      return `<span class="ltp-step ${cls}"><b>${i + 1}</b><span>${esc(s)}</span></span>`;
    }).join('');
    const ask = { wordclass: 'chỗ trống cần <b>từ loại</b> gì?', infotype: 'chỗ trống cần <b>loại thông tin</b> gì?', form: 'đáp án sẽ ở <b>dạng</b> nào?' }[st.kind];
    const body = questionHtml(q, r ? r.signal : '')
      + `<div class="ltp-task">Nhìn cấu trúc câu — ${ask}</div>${typeChipsHtml(a.prediction, { locked: !!r })}`
      + (r ? predictResultHtml(r) : '');
    showPanelState(headerHtml(esc(q.sourceName))
      + `<div class="ltp-card"><div class="ltp-steps">${steps}</div>${body}
        ${navHtml(checkBtnHtml(a, !!a.prediction))}</div>`);
  }

  function predictResultHtml(r) {
    const forms = st.kind === 'infotype' && POSSIBLE_FORMS[r.category]
      ? `<div class="ltp-muted">Dạng có thể nghe thấy: ${esc(POSSIBLE_FORMS[r.category])}</div>` : '';
    const answer = answerLabel(r.correctAnswer);
    return `<div class="ltp-feedback ${r.isCorrect ? 'ok' : 'bad'}">
      <div class="ltp-verdict ${r.isCorrect ? 'right' : 'wrong'}">${r.isCorrect ? '✓ Dự đoán đúng' : '✗ Chưa đúng'} → <b>${esc(typeName(r.category))}</b></div>
      <div class="ltp-reason">${esc(r.reason)}</div>${forms}
      <div class="ltp-typeline">Đáp án trong đề: <strong>${esc(answer)}</strong></div>
      ${r.evidence ? `<div class="ltp-evidence"><div class="ltp-evidence-label">📄 Câu trong transcript${r.evidence.speaker ? ` · ${esc(r.evidence.speaker)}` : ''}</div>
        <div class="ltp-evidence-text">“${markTerms(r.evidence.text, answer.split(' / '), 'ltp-hit')}”</div></div>` : ''}
      ${r.explanation ? `<details class="ltp-expl"><summary>Lời giải của đề</summary>${escNl(r.explanation)}</details>` : ''}
    </div>`;
  }

  // ── Question-type practices ("Chiến thuật theo dạng bài") ─────────────

  const qNumbers = (q) => (q.numbers && q.numbers.length > 1 ? `${q.numbers[0]}–${q.numbers[q.numbers.length - 1]}` : String(q.questionNumber));

  function qtypeGuideHtml(open) {
    const g = QTYPE_GUIDE[st.practice.qtype] || { steps: [] };
    return `<details class="ltp-guide" ${open ? 'open' : ''}>
      <summary>📋 Cách làm dạng ${esc(QTYPE_NAME[st.practice.qtype] || '')}</summary>
      <ol>${g.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${g.warning ? `<div class="ltp-warning">⚠️ ${esc(g.warning)}</div>` : ''}
    </details>`;
  }

  // Mini tutorial before the first question.
  function renderQtypeIntro() {
    const pr = st.practice;
    const g = QTYPE_GUIDE[pr.qtype] || { steps: [] };
    const n = st.items.reduce((s, q) => s + (q.pick || 1), 0);
    // "choose TWO": one screen per prompt, each worth its number of answers
    const size = n > st.items.length ? `${st.items.length} câu (${n} đáp án cần chọn)` : `${n} câu`;
    const borrowed = st.items.find(q => q.sourceName && q.sourceName !== pr.sourceName);
    const guided = st.items[0] && st.items[0].mode === 'example';
    showPanelState(headerHtml(esc(pr.sourceName)) + `<div class="ltp-card ltp-intro">
      <div class="ltp-intro-title">📋 Trước khi làm: cách làm dạng ${esc(QTYPE_NAME[pr.qtype] || '')}</div>
      <ol class="ltp-intro-steps">${g.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${g.warning ? `<div class="ltp-warning">⚠️ ${esc(g.warning)}</div>` : ''}
      ${guided ? `<div class="ltp-flow">
        <span class="ltp-mode ex"><b>📘 Câu 1</b> xem mẫu từng bước</span>
        <span class="ltp-mode we"><b>🤝 Câu 2</b> làm cùng, có gợi ý</span>
        <span class="ltp-mode you"><b>✍️ Từ câu 3</b> tự làm</span>
      </div>` : ''}
      <div class="ltp-muted">Bài gồm ${size} ${esc(QTYPE_NAME[pr.qtype] || '')} lấy nguyên từ đề thật (${esc(pr.sourceName)})${borrowed ? `; câu mẫu lấy từ ${esc(borrowed.sourceName)}` : ''}, đúng thứ tự như trong đề. Mỗi câu có đoạn audio riêng — nghe lại thoải mái.</div>
      <button type="button" class="ltp-btn ltp-btn-primary" data-act="intro-done">Bắt đầu làm bài →</button>
    </div>`);
  }

  function qtypeInputHtml(q, a, { readOnly = false } = {}) {
    const r = a.result;
    if (q.input === 'text') {
      return `<input class="ltp-input ${r ? (r.isCorrect ? 'correct' : 'incorrect') : ''}" data-enter="check" value="${esc(a.value)}" ${r ? 'readonly' : ''}
        placeholder="Nhập đáp án..." autocomplete="off" spellcheck="false" />`;
    }
    const keys = r ? String(r.correctAnswer).split(',').map(s => s.trim().toUpperCase()) : [];
    const chosen = q.input === 'multi' ? (a.sel || []) : (a.value ? [a.value] : []);
    const cls = (k) => {
      if (!r) return chosen.includes(k) ? 'selected' : '';
      if (keys.includes(k)) return 'correct-ans';
      return chosen.includes(k) ? 'wrong-ans' : '';
    };
    const act = q.input === 'multi' ? 'mpick' : 'pick';
    const attrs = (k) => (r || readOnly ? '' : `data-act="${act}" data-val="${esc(k)}" ${KEY_ATTRS} aria-pressed="${chosen.includes(k)}"`);
    // labelled options (MCQ, "choose TWO") as a list; bare letters (map,
    // matching — its list shown above) as chips
    if (q.input === 'multi' || (q.choices || []).every(c => c.label) && !q.listTitle && q.reuse == null) {
      return `<div class="ltp-opts">${q.choices.map(c => `<div class="ltp-opt ${cls(c.key)}" ${attrs(c.key)}>
        <span class="ltp-opt-letter">${esc(c.key)}</span>${esc(c.label)}</div>`).join('')}</div>`;
    }
    return `<div class="ltp-letters">${q.choices.map(c => `<span class="ltp-letter ${cls(c.key)}" ${attrs(c.key)}>${esc(c.key)}</span>`).join('')}</div>`;
  }

  // Pieces of a question-type screen.
  function qtypePlayerHtml(q, i) {
    const pid = `ltp-p-${i}`;
    return q.segment
      ? playerHtml(pid, q.segment, { label: `Đoạn audio của câu ${qNumbers(q)}` })
      : playerHtml(pid, { start: 0, end: q.audioDuration || st.practice.audioDuration || 0 }, { label: 'Audio cả bài (câu này chưa xác định được đoạn riêng)' });
  }
  // the <img> itself is kept across re-renders (see mapImage) so picking
  // an answer doesn't make the map flash / the page jump
  const qtypeMapHtml = (q) => (q.imageUrl ? `<div class="ltp-map"><div class="ltp-map-slot"></div>
      <a class="ltp-link" href="${esc(q.imageUrl)}" target="_blank" rel="noopener">🔍 Phóng to</a></div>` : '');
  const qtypeHeadHtml = (q) => `<div class="ltp-qhead"><span class="ltp-qnum">${esc(qNumbers(q))}</span>${q.instruction ? `<span class="ltp-instruction">${esc(q.instruction)}</span>` : ''}</div>`;
  function qtypeListHtml(q) {
    if (st.practice.qtype !== 'matching') return '';
    return `<div class="ltp-matchlist">
      ${q.listTitle ? `<div class="ltp-list-title">${esc(q.listTitle)}</div>` : ''}
      ${q.choices.map(c => `<div class="ltp-matchrow"><b>${esc(c.key)}</b><span>${esc(c.label)}</span></div>`).join('')}
      ${q.reuse ? '<div class="ltp-muted">NB: một chữ cái có thể dùng nhiều lần.</div>' : ''}
    </div>`;
  }
  // The prompt, its keywords marked once they're known.
  function qtypePromptHtml(q, keywords) {
    const body = keywords && keywords.length ? markTerms(q.text, keywords, 'ltp-kwmark') : esc(q.text);
    if (q.input !== 'text') return `<div class="ltp-q">${body}</div>`;
    return `${q.context ? `<div class="ltp-context">📋 ${esc(q.context)}</div>` : ''}<div class="ltp-q">${body.replace('_____', '<span class="ltp-blank"> ______ </span>')}</div>
        ${q.wordLimit ? `<div class="ltp-limit">✍️ ${esc(q.wordLimit)}</div>` : ''}`;
  }
  const pickNoteHtml = (q, a) => (q.input === 'multi' ? `<div class="ltp-limit">☑️ Chọn đúng <b>${q.pick}</b> chữ cái (${(a.sel || []).length}/${q.pick})</div>` : '');
  const qtypeReady = (q, a) => (q.input === 'text' ? String(a.value || '').trim() : q.input === 'multi' ? (a.sel || []).length === q.pick : a.value);
  const MODE_BANNER = {
    example: ['ex', '📘 Câu mẫu (I DO)', 'Xem cách làm từng bước — câu này không tính điểm.'],
    guided: ['we', '🤝 Làm cùng (WE DO)', 'Làm theo từng bước có gợi ý; đáp án chỉ hiện sau khi bạn kiểm tra.'],
    solo: ['you', '✍️ Tự làm (YOU DO)', 'Tự làm trọn vẹn: đọc → dự đoán → nghe → trả lời → kiểm tra.'],
  };
  function modeBannerHtml(q) {
    const m = MODE_BANNER[q.mode];
    if (!m) return ''; // a practice saved before the guided examples
    return `<div class="ltp-mode ${m[0]}"><b>${m[1]}</b><span>${m[2]}</span></div>`;
  }
  function afterQtypeRender(q, a) {
    const panel = panelEl();
    const slot = q.imageUrl && panel && panel.querySelector('.ltp-map-slot');
    if (slot) slot.appendChild(mapImage(q.imageUrl));
    if (!a.result && q.input === 'text') {
      const input = panel && panel.querySelector('.ltp-input');
      if (input && window.matchMedia && window.matchMedia('(min-width: 900px)').matches) input.focus({ preventScroll: true });
    }
  }

  function renderQtypeQuestion() {
    const q = st.items[st.idx];
    if (q.mode === 'example') { renderQtypeExample(); return; }
    if (q.mode === 'guided') { renderQtypeGuided(); return; }
    const a = st.answers[st.idx];
    const r = a.result;
    showPanelState(headerHtml(esc(st.practice.sourceName)) + qtypeGuideHtml(false) + `<div class="ltp-card">
      ${modeBannerHtml(q)}
      ${qtypePlayerHtml(q, st.idx)}
      ${qtypeMapHtml(q)}
      <div class="ltp-q-block">
        ${qtypeHeadHtml(q)}
        ${qtypeListHtml(q)}${qtypePromptHtml(q)}${pickNoteHtml(q, a)}
        ${qtypeInputHtml(q, a)}
      </div>
      ${r ? qtypeFeedbackHtml(q, r) : ''}
      ${navHtml(checkBtnHtml(a, !!qtypeReady(q, a)))}
    </div>`);
    afterQtypeRender(q, a);
  }

  // ── Q1: worked example (I DO) — six steps revealed one at a time ──────

  const EX_STEPS = 6;
  // Why an answer type, in the words a student can reuse.
  const TYPE_WHY = {
    proper: 'Chỗ trống cần một tên riêng (người, địa điểm, tổ chức) → nghe kỹ phần đánh vần, viết hoa chữ cái đầu.',
    date: 'Chỗ trống cần ngày / thứ / tháng → để ý cách đọc “the fifth of June”, “Tuesday the 3rd”.',
    time: 'Chỗ trống cần giờ → để ý a.m. / p.m., “half past”, “quarter to”.',
    price: 'Chỗ trống cần giá tiền → để ý £ / $, “per week”, “each”, và số bị sửa lại.',
    number: 'Chỗ trống cần một con số → để ý số điện thoại, số phòng, số lượng; 15 ≠ 50.',
    word: 'Chỗ trống cần một từ vựng → nhìn từ đứng trước / sau để đoán danh từ, tính từ hay động từ.',
  };
  // Step 2 of the example for the letter types: what to do before listening.
  const EX_PREDICT = {
    mcq: (q) => `Đọc ${q.choices.length} lựa chọn ${q.choices.map(c => c.key).join(' / ')} và để ý chúng khác nhau ở đâu. Audio thường nhắc tới cả những lựa chọn sai — chờ ý trả lời đúng câu hỏi.`,
    multi: (q) => `Cần chọn đúng ${q.pick} chữ cái trong ${q.choices.length} lựa chọn. Đọc hết các lựa chọn trước; nghe xem ý nào được xác nhận, ý nào chỉ được nhắc tới rồi bị bác bỏ.`,
    matching: (q) => `Đọc danh sách ${q.choices[0].key}–${q.choices[q.choices.length - 1].key} trước. Khi nghe tới “${q.text}”, chờ ý nghĩa khớp với một lựa chọn — không phải từ giống hệt.`,
    map: () => 'Nhìn bản đồ trước: tìm điểm bắt đầu và các mốc. Khi nghe, đi theo từ chỉ hướng (next to, opposite, on the left…) chứ không chỉ chờ tên địa điểm.',
  };
  const choiceText = (q, keys) => String(keys).split(',').map(s => s.trim().toUpperCase()).filter(Boolean).map(k => {
    const c = (q.choices || []).find(x => x.key === k);
    return c && c.label ? `${k}. ${c.label}` : k;
  }).join(' · ');
  const wordCount = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

  function exampleStepHtml(k, q, g, i) {
    const typed = q.input === 'text';
    const answer = typed ? answerLabel(g.answer) : choiceText(q, g.answer);
    const chips = (list, cls) => list.map(x => `<span class="ltp-chip ${cls}">${esc(x)}</span>`).join(' ');
    switch (k) {
      case 1: return ['🔍 Gạch chân keyword', `${chips(g.keywords, 'kw') || '<i>—</i>'}
        ${g.signals && g.signals.length ? `<div>🟢 Từ sát chỗ trống: ${chips(g.signals, 'sig')}</div>` : ''}
        <div class="ltp-muted">Đây là những từ (hoặc cách nói khác của chúng) bạn sẽ chờ nghe.</div>`];
      case 2: {
        if (!typed) return ['🎯 Trước khi nghe', esc((EX_PREDICT[st.practice.qtype] || (() => ''))(q))];
        if (!g.type) return ['🎯 Dự đoán loại đáp án', 'Đáp án là một cụm đặc biệt (email / địa chỉ web) — chép thật chính xác từng ký tự.'];
        return ['🎯 Dự đoán loại đáp án', `<b>${esc(typeName(g.type))}</b><div class="ltp-muted">${esc(TYPE_WHY[g.type] || '')}</div>`];
      }
      case 3: return ['🎧 Nghe đoạn audio', `${qtypePlayerHtml(q, i)}${g.where ? `<div class="ltp-muted">📍 Vị trí: ${esc(g.where)}</div>` : ''}`];
      case 4: {
        if (!g.evidence) return ['📝 Tìm đáp án trong transcript', '<span class="ltp-muted">Câu này chưa có transcript khớp — nghe lại đoạn audio ở bước 3.</span>'];
        const terms = typed ? answerLabel(g.answer).split(' / ') : [...(g.directions || []), ...g.keywords];
        const traps = (g.traps || []).length ? `<div class="ltp-trap">⚠️ Bẫy: ${esc(choiceText(q, g.traps.join(',')))} cũng được nhắc tới trong đoạn này — nhưng không phải đáp án.</div>` : '';
        const dirs = (g.directions || []).length ? `<div class="ltp-muted">🧭 Từ chỉ hướng nghe được: ${chips(g.directions, 'sig')}</div>` : '';
        return ['📝 Tìm đáp án trong transcript', `${evidenceHtml(g.evidence, terms, `ltp-ev-${i}`)}${dirs}${traps}`];
      }
      case 5: {
        const limit = typed && q.wordLimit ? `<div class="ltp-muted">✍️ ${wordCount(answerLabel(g.answer).split(' / ')[0])} từ — đúng yêu cầu “${esc(q.wordLimit)}”.</div>` : '';
        return ['✅ Đáp án', `<span class="ltp-answer">${esc(answer)}</span>${limit}`];
      }
      default: {
        const why = g.why || (g.evidence
          ? `${typed && g.type ? `Câu hỏi cần ${typeName(g.type)}. ` : ''}Người nói: “${g.evidence.text}” → đáp án ${answer}.`
          : `Đáp án: ${answer}.`);
        return ['💡 Giải thích', escNl(why)];
      }
    }
  }

  function renderQtypeExample() {
    const q = st.items[st.idx];
    const a = st.answers[st.idx];
    const g = q.guide || { keywords: [], signals: [], traps: [], directions: [] };
    const step = Math.min(Math.max(Number(a.step) || 0, 0), EX_STEPS);
    const steps = [];
    for (let k = 1; k <= step; k++) {
      const [title, body] = exampleStepHtml(k, q, g, st.idx);
      steps.push(`<li class="ltp-gstep${k === step ? ' current' : ''}"><div class="ltp-step-title">Bước ${k} — ${title}</div><div class="ltp-step-body">${body}</div></li>`);
    }
    // the answer shows on the options once step 5 is reached
    const shown = step >= 5 ? { sel: [], value: '', result: { correctAnswer: g.answer, isCorrect: true } } : { sel: [], value: '', result: null };
    const options = q.input === 'text' ? '' : qtypeInputHtml(q, shown, { readOnly: true });
    showPanelState(headerHtml(esc(st.practice.sourceName)) + qtypeGuideHtml(false) + `<div class="ltp-card">
      ${modeBannerHtml(q)}
      ${q.sourceName ? `<div class="ltp-muted">Câu mẫu lấy từ ${esc(q.sourceName)}.</div>` : ''}
      ${qtypeMapHtml(q)}
      <div class="ltp-q-block">
        ${qtypeHeadHtml(q)}
        ${qtypeListHtml(q)}${qtypePromptHtml(q, step >= 1 ? g.keywords : null)}
        ${q.input === 'multi' ? `<div class="ltp-limit">☑️ Chọn đúng <b>${q.pick}</b> chữ cái</div>` : ''}
        ${options}
      </div>
      <ol class="ltp-gsteps">${steps.join('')}</ol>
      ${step < EX_STEPS ? `<button type="button" class="ltp-btn ltp-btn-primary ltp-step-next" data-act="ex-next">${step ? 'Bước tiếp theo →' : '▶ Bắt đầu xem mẫu'}</button>`
    : '<div class="ltp-muted ltp-step-end">✔️ Xong câu mẫu. Câu tiếp theo bạn sẽ làm cùng, có gợi ý từng bước.</div>'}
      ${navHtml('')}
    </div>`);
    afterQtypeRender(q, shown);
  }

  // ── Q2: done together (WE DO) — keyword → predict → listen → answer ──

  const WE_STEPS = ['kw', 'predict', 'listen', 'answer'];
  const GUIDED_THINK = {
    mcq: 'Đọc các lựa chọn và gạch chân điểm khác nhau giữa chúng. Đừng chọn chỉ vì nghe thấy một từ giống option.',
    multi: 'Đọc hết các lựa chọn. Nhớ: có ý được nhắc tới rồi bị bác bỏ — chỉ chọn ý người nói xác nhận.',
    matching: 'Đọc lại danh sách lựa chọn; nghĩ xem mục này có thể được nói lại bằng từ khác (paraphrase) thế nào.',
    map: 'Tìm điểm bắt đầu và các mốc trên bản đồ; chuẩn bị nghe từ chỉ hướng.',
  };

  function renderQtypeGuided() {
    const q = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    const c = q.coach || { keywords: [], signals: [] };
    const step = r ? WE_STEPS.length - 1 : Math.min(Math.max(Number(a.step) || 0, 0), WE_STEPS.length - 1);
    const typed = q.input === 'text';
    const predicts = typed && c.predict;
    const li = (k, title, body) => `<li class="ltp-gstep${k === step && !r ? ' current' : ''}"><div class="ltp-step-title">Bước ${k + 1} — ${title}</div><div class="ltp-step-body">${body}</div></li>`;
    const steps = [];
    // 1 · keywords: the student's own, then the suggested ones
    // (the highlights live in `kwSel`: `sel` holds the "choose TWO" letters)
    const kwSel = a.kwSel || [];
    steps.push(li(0, '🔍 Gạch chân keyword', a.kwDone ? kwFeedbackHtml({ text: q.text, keywords: c.keywords, signals: c.signals }, { sel: kwSel })
      : `<div class="ltp-muted">Chạm vào những từ trong câu hỏi mà bạn sẽ chờ nghe (thường 2–4 từ).</div>
        <button type="button" class="ltp-btn ltp-btn-primary" data-act="kw-done" ${kwSel.length ? '' : 'disabled'}>Xong, xem gợi ý</button>`));
    // 2 · predict (typed) / read the options
    if (step >= 1) {
      const body = predicts
        ? `<div class="ltp-muted">Đáp án là loại gì?${(c.signals || []).length ? ` Nhìn từ sát chỗ trống: <b>${esc(c.signals.join(', '))}</b>.` : ''}</div>
          ${typeChipsHtml(a.prediction, { locked: !!r || step > 1, compact: true })}`
        : `<div>${esc(typed ? 'Đọc cả câu: sau khi điền, câu phải đúng ngữ pháp và không vượt giới hạn từ.' : GUIDED_THINK[st.practice.qtype] || '')}</div>`;
      steps.push(li(1, predicts ? '🎯 Dự đoán loại đáp án' : '🎯 Trước khi nghe', body
        + (step === 1 ? `<button type="button" class="ltp-btn ltp-btn-primary" data-act="g-next" ${predicts && !a.prediction ? 'disabled' : ''}>Tiếp: nghe →</button>` : '')));
    }
    // 3 · listen
    if (step >= 2) {
      steps.push(li(2, '🎧 Nghe đoạn audio', `${qtypePlayerHtml(q, st.idx)}<div class="ltp-muted">Chờ keyword (hoặc cách nói khác của nó); đáp án thường đến ngay sau.</div>
        ${step === 2 ? '<button type="button" class="ltp-btn ltp-btn-primary" data-act="g-next">Nghe xong → trả lời</button>' : ''}`));
    }
    // 4 · answer + check
    if (step >= 3) steps.push(li(3, '✍️ Trả lời', `${pickNoteHtml(q, a)}${qtypeInputHtml(q, a)}`));
    showPanelState(headerHtml(esc(st.practice.sourceName)) + qtypeGuideHtml(false) + `<div class="ltp-card">
      ${modeBannerHtml(q)}
      ${qtypeMapHtml(q)}
      <div class="ltp-q-block">
        ${qtypeHeadHtml(q)}
        ${qtypeListHtml(q)}
        ${typed && q.context ? `<div class="ltp-context">📋 ${esc(q.context)}</div>` : ''}
        <div class="ltp-q ltp-tokens">${tokensHtml(q.text, kwSel, { locked: a.kwDone, kw: c.keywords })}</div>
        ${typed && q.wordLimit ? `<div class="ltp-limit">✍️ ${esc(q.wordLimit)}</div>` : ''}
      </div>
      <ol class="ltp-gsteps">${steps.join('')}</ol>
      ${r ? qtypeFeedbackHtml(q, r) : ''}
      ${navHtml(step >= 3 ? checkBtnHtml(a, !!qtypeReady(q, a)) : '')}
    </div>`);
    afterQtypeRender(q, a);
  }

  // One decoded <img> per map, moved into each fresh render.
  const mapImages = new Map();
  function mapImage(url) {
    if (!mapImages.has(url)) {
      const img = new Image();
      img.alt = 'Bản đồ / sơ đồ của đề';
      img.src = url;
      mapImages.set(url, img);
    }
    return mapImages.get(url);
  }

  function qtypeFeedbackHtml(q, r) {
    const label = (key) => {
      const c = (q.choices || []).find(x => x.key === key);
      return c && c.label ? `${key}. ${c.label}` : key;
    };
    const answer = q.input === 'text' ? answerLabel(r.correctAnswer)
      : String(r.correctAnswer).split(',').map(s => label(s.trim().toUpperCase())).join(' · ');
    const verdict = q.input === 'multi'
      ? `${r.isCorrect ? '✓ Chính xác!' : `✗ Đúng ${r.correctCount}/${r.total}`} — Đáp án: <strong>${esc(answer)}</strong>`
      : `${r.isCorrect ? '✓ Chính xác!' : '✗ Chưa đúng'}${r.isCorrect ? '' : ` — Đáp án: <strong>${esc(answer)}</strong>`}`;
    const terms = q.input === 'text' ? answerLabel(r.correctAnswer).split(' / ') : [];
    const pred = r.prediction && r.category
      ? `<div class="ltp-predres ${r.predictionCorrect ? 'ok' : 'bad'}">🎯 Dự đoán loại đáp án: ${esc(typeName(r.prediction))} ${r.predictionCorrect ? '✓' : `✗ — thực tế là ${esc(typeName(r.category))}`}</div>` : '';
    return `<div class="ltp-feedback ${r.isCorrect ? 'ok' : 'bad'}">
      <div class="ltp-verdict ${r.isCorrect ? 'right' : 'wrong'}">${verdict}</div>
      ${pred}
      ${diagnosisHtml(r)}
      ${evidenceHtml(r.evidence, terms, `ltp-ev-${st.idx}`)}
      ${r.explanation ? `<div class="ltp-explanation"><strong>Giải thích:</strong> ${escNl(r.explanation)}</div>` : ''}
    </div>`;
  }

  // Quy trình hoàn chỉnh: 5 steps over a run of consecutive gaps.
  const WF_STAGES = ['kw', 'predict', 'listen', 'answer', 'result'];
  const WF_STEPS = ['Highlight keyword', 'Dự đoán', 'Nghe', 'Trả lời & tự kiểm tra', 'Kiểm tra đáp án'];

  function renderWorkflow() {
    const pr = st.practice;
    if (!WF_STAGES.includes(st.stage)) st.stage = 'kw';
    if (st.stage === 'result') { renderRunResult(); return; }
    const si = WF_STAGES.indexOf(st.stage);
    const steps = WF_STEPS.map((s, i) => `<span class="ltp-step ${i < si ? 'done' : i === si ? 'active' : ''}"><b>${i + 1}</b><span>${esc(s)}</span></span>`).join('');
    const nums = `Câu ${pr.questions[0].questionNumber}–${pr.questions[pr.questions.length - 1].questionNumber}`;
    const head = `<div class="ltp-head">
      <div class="ltp-head-top">
        <div class="ltp-title">🎧 Luyện tập: Quy trình hoàn chỉnh</div>
        <button type="button" class="ltp-link ltp-close" data-act="close" title="Đóng bài luyện tập">✕ Đóng</button>
      </div>
      <div class="ltp-source">Nguồn: ${esc(pr.sourceName)} · ${nums}</div>
    </div>`;
    const task = {
      kw: `<b>Bước 1/5 — BEFORE LISTENING:</b> đọc ${pr.questions.length} câu, bấm chọn keyword ở mỗi câu (tên riêng, số, từ mang nội dung).`,
      predict: '<b>Bước 2/5 — Dự đoán</b> loại đáp án của từng chỗ trống, và nghĩ trước audio có thể nói khác đi thế nào (paraphrase).',
      listen: '<b>Bước 3/5 — DURING LISTENING:</b> nghe keyword / paraphrase, đi theo đúng thứ tự câu, ghi nhanh đáp án. Lỡ một câu → bỏ qua, nghe câu tiếp.',
      answer: '<b>Bước 4/5 — AFTER LISTENING:</b> hoàn thiện đáp án rồi tự kiểm tra theo checklist.',
    }[st.stage];
    const rows = pr.questions.map((q, i) => {
      const a = st.answers[i];
      let extra = '';
      if (st.stage === 'predict') {
        extra = `${q.keywords.length ? `<div class="ltp-muted">Keyword gợi ý: ${q.keywords.map(k => `<span class="ltp-chip kw">${esc(k)}</span>`).join(' ')}</div>` : ''}
          ${typeChipsHtml(a.prediction, { qi: i, compact: true })}
          <input class="ltp-para" data-qi="${i}" value="${esc(a.para || '')}" placeholder="Audio có thể nói… (paraphrase, không chấm)" autocomplete="off" />`;
      } else if (st.stage === 'listen' || st.stage === 'answer') {
        extra = `${a.prediction ? `<span class="ltp-pred-tag">${typeName(a.prediction)}</span>` : '<span class="ltp-pred-tag none">chưa dự đoán</span>'}
          <input class="ltp-input" data-qi="${i}" value="${esc(a.value)}" placeholder="Đáp án câu ${q.questionNumber}" autocomplete="off" spellcheck="false" />`;
      }
      return `<div class="ltp-pv-row">
        <span class="ltp-qnum">${q.questionNumber}</span>
        <div class="ltp-pv-body">
          ${q.context ? `<div class="ltp-context">📋 ${esc(q.context)}</div>` : ''}
          <div class="ltp-q">${tokensHtml(q.text, a.sel, { locked: st.stage !== 'kw', qi: i, kw: st.stage === 'kw' ? [] : q.keywords })}</div>
          ${extra}
        </div>
      </div>`;
    }).join('');
    const next = (label) => `<button type="button" class="ltp-btn ltp-btn-primary" data-act="wf-next">${esc(label)}</button>`;
    let footer;
    if (st.stage === 'kw') footer = next('Tiếp: Bước 2 — Dự đoán →');
    else if (st.stage === 'predict') footer = next('Tiếp: Bước 3 — Nghe →');
    else if (st.stage === 'listen') footer = next('Tiếp: Bước 4 — Trả lời & tự kiểm tra →');
    else {
      const checks = CHECKLIST.map(([k, label]) => `<label class="ltp-check"><input type="checkbox" data-act="wf-check" data-val="${k}" ${st.checklist && st.checklist[k] ? 'checked' : ''} /> ${esc(label)}</label>`).join('');
      footer = `<div class="ltp-checklist"><div class="ltp-task">✅ Tự kiểm tra trước khi nộp${pr.wordLimit ? ` (giới hạn: ${esc(pr.wordLimit)})` : ''}</div>${checks}</div>
        <button type="button" class="ltp-btn ltp-btn-primary" data-act="submit-run">Nộp bài — Bước 5 →</button>`;
    }
    showPanelState(head + `<div class="ltp-card">
      <div class="ltp-steps">${steps}</div>
      ${pr.instruction ? `<div class="ltp-instruction">${esc(pr.instruction)}</div>` : ''}
      <div class="ltp-task-line">${task}</div>
      ${st.stage === 'listen' ? `${playerHtml('ltp-run', pr.segment, { label: 'Audio của các câu này' })}<div class="ltp-muted">👀 Mắt đi trước, 👂 tai theo sau.</div>` : ''}
      <div class="ltp-pv-list">${rows}</div>
      <div class="ltp-nav"><div class="ltp-nav-right">${footer}</div></div>
    </div>`);
  }

  // Highlight keyword: read → highlight → predict → listen → answer → check.
  function renderKeywords() {
    const q = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    const stepNo = r ? 5 : !a.kwDone ? 1 : !a.prediction ? 2 : 3;
    const steps = ['Đọc & highlight', 'Dự đoán', 'Nghe', 'Trả lời', 'Kiểm tra'].map((s, i) => {
      const cls = i + 1 < stepNo ? 'done' : i + 1 === stepNo ? 'active' : '';
      return `<span class="ltp-step ${cls}"><b>${i + 1}</b><span>${esc(s)}</span></span>`;
    }).join('');
    const pid = `ltp-p-${st.idx}`;
    let body = `<div class="ltp-q-block">
        ${q.context ? `<div class="ltp-context">📋 ${esc(q.context)}</div>` : ''}
        <div class="ltp-q">${tokensHtml(q.text, a.sel, { locked: a.kwDone, kw: a.kwDone ? q.keywords : [] })}</div>
        ${q.wordLimit ? `<div class="ltp-limit">✍️ ${esc(q.wordLimit)}</div>` : ''}
      </div>`;
    if (!a.kwDone) {
      const canPick = tokens(q.text).some(t => t.text != null);
      body += `<div class="ltp-task">Bước 1–2 — Đọc câu hỏi, <b>bấm chọn 2–4 keyword</b>: tên riêng, số, từ mang nội dung chính. Không cần chọn the / is / per…</div>
        <button type="button" class="ltp-btn ltp-btn-primary" data-act="kw-done" ${(a.sel || []).length || !canPick ? '' : 'disabled'}>Xong — xem keyword gợi ý</button>`;
    } else {
      body += kwFeedbackHtml(q, a);
      body += `<div class="ltp-task">Bước 3 — Dự đoán: chỗ trống cần <b>loại thông tin</b> gì?</div>${typeChipsHtml(a.prediction, { locked: !!r })}`;
      if (a.prediction) {
        body += `<div class="ltp-task">Bước 4 — Nghe đoạn audio của câu này (có thể nghe lại)</div>${playerHtml(pid, q.segment)}
          <div class="ltp-task">Bước 5 — Trả lời</div>
          <input class="ltp-input ${r ? (r.isCorrect ? 'correct' : 'incorrect') : ''}" data-enter="check" value="${esc(a.value)}" ${r ? 'readonly' : ''}
            placeholder="Nhập đáp án..." autocomplete="off" spellcheck="false" />`;
      }
    }
    if (r) body += keywordResultHtml(q, a, r);
    showPanelState(headerHtml(`${esc(q.sourceName)}`)
      + `<div class="ltp-card"><div class="ltp-steps">${steps}</div>${body}
        ${navHtml(a.prediction ? checkBtnHtml(a, String(a.value || '').trim()) : '')}</div>`);
  }

  function keywordResultHtml(q, a, r) {
    const pred = r.prediction ? `Bạn dự đoán ${typeName(r.prediction)} ${r.predictionCorrect ? '✓' : '✗'}` : '';
    return `<div class="ltp-feedback ${r.isCorrect ? 'ok' : 'bad'}">
      <div class="ltp-verdict ${r.isCorrect ? 'right' : 'wrong'}">${r.isCorrect ? '✓ Chính xác!' : '✗ Chưa đúng'}${r.isCorrect ? '' : ` — Đáp án: <strong>${esc(answerLabel(r.correctAnswer))}</strong>`}</div>
      ${diagnosisHtml(r)}
      <div class="ltp-typeline">Loại đáp án: <b>${typeName(r.answerType)}</b>${pred ? ` · ${pred}` : ''}</div>
      ${evidenceHtml(r.evidence, q.keywords, `ltp-ev-${st.idx}`)}
      ${r.explanation ? `<div class="ltp-explanation"><strong>Giải thích:</strong> ${escNl(r.explanation)}</div>` : ''}
    </div>`;
  }

  // 30 seconds: intro → prep (timer) → listen (plays once) → answer → result.
  function renderPreview() {
    const pr = st.practice;
    const head = `<div class="ltp-head">
      <div class="ltp-head-top">
        <div class="ltp-title">🎧 Luyện tập: Chiến thuật 30 giây</div>
        <button type="button" class="ltp-link ltp-close" data-act="close" title="Đóng bài luyện tập">✕ Đóng</button>
      </div>
      <div class="ltp-source">Nguồn: ${esc(pr.sourceName)} · Câu ${pr.questions[0].questionNumber}–${pr.questions[pr.questions.length - 1].questionNumber}</div>
    </div>`;
    if (st.stage === 'result') { renderRunResult(); return; }
    if (st.stage === 'intro') {
      showPanelState(head + `<div class="ltp-card ltp-intro">
        <div class="ltp-intro-title">⏱ Mô phỏng 30 giây trước khi audio chạy</div>
        <ol class="ltp-intro-steps">
          <li><b>Read</b> — đọc nhanh ${pr.questions.length} câu (câu ${pr.questions[0].questionNumber}–${pr.questions[pr.questions.length - 1].questionNumber}).</li>
          <li><b>Highlight</b> — bấm chọn keyword ở mỗi câu.</li>
          <li><b>Predict</b> — chọn loại đáp án cho từng chỗ trống.</li>
          <li>Hết 30 giây → audio <b>tự phát một lần</b>, không tạm dừng, không tua. Điền đáp án trong lúc nghe.</li>
        </ol>
        <div class="ltp-muted">Không cần hiểu 100% câu hỏi — 30 giây là để chuẩn bị, không phải để dịch. Đọc xong sớm thì bấm “Sẵn sàng”.</div>
        <button type="button" class="ltp-btn ltp-btn-primary" data-act="prep-start">⏱ Bắt đầu 30 giây</button>
      </div>`);
      return;
    }
    const prep = st.stage === 'prep';
    const listening = st.stage === 'listen';
    const rows = pr.questions.map((q, i) => {
      const a = st.answers[i];
      return `<div class="ltp-pv-row">
        <span class="ltp-qnum">${q.questionNumber}</span>
        <div class="ltp-pv-body">
          ${q.context ? `<div class="ltp-context">📋 ${esc(q.context)}</div>` : ''}
          <div class="ltp-q">${tokensHtml(q.text, a.sel, { locked: !prep, qi: i })}</div>
          ${prep ? typeChipsHtml(a.prediction, { qi: i, compact: true })
            : `${a.prediction ? `<span class="ltp-pred-tag">${typeName(a.prediction)}</span>` : '<span class="ltp-pred-tag none">chưa dự đoán</span>'}
               <input class="ltp-input" data-qi="${i}" value="${esc(a.value)}" placeholder="Đáp án câu ${q.questionNumber}" autocomplete="off" spellcheck="false" />`}
        </div>
      </div>`;
    }).join('');
    let bar;
    if (prep) {
      bar = `<div class="ltp-pv-bar prep"><span class="ltp-countdown" id="ltp-countdown">0:30</span>
        <span>Read → Highlight → Predict</span>
        <button type="button" class="ltp-btn" data-act="prep-skip">Sẵn sàng — phát audio ngay</button></div>`;
    } else if (listening) {
      bar = `<div class="ltp-pv-bar">${playerHtml('ltp-pv', pr.segment, { label: 'Đang phát — chỉ nghe một lần', locked: true })}</div>`;
    } else {
      bar = `<div class="ltp-pv-bar done">✅ Audio đã hết. Kiểm tra lại chính tả, số ít / số nhiều và giới hạn từ${pr.wordLimit ? ` (<b>${esc(pr.wordLimit)}</b>)` : ''} rồi nộp bài.
        <button type="button" class="ltp-btn ltp-btn-primary" data-act="submit-preview">Nộp bài</button></div>`;
    }
    showPanelState(head + `<div class="ltp-card">
      ${pr.instruction ? `<div class="ltp-instruction">${esc(pr.instruction)}</div>` : ''}
      ${bar}
      <div class="ltp-pv-list">${rows}</div>
    </div>`);
    if (prep) startPrepTimer();
    if (listening) {
      onSegmentEnd = (id) => {
        if (id !== 'ltp-pv' || !st || st.stage !== 'listen') return;
        st.stage = 'answer';
        persist();
        renderQuestion();
        announce('Audio đã hết — kiểm tra lại rồi nộp bài.');
      };
      if (player.id !== 'ltp-pv' || player.state === 'idle') playSegment('ltp-pv', pr.audioUrl, pr.segment, { locked: true });
    }
  }

  function startPrepTimer() {
    const total = st.practice.prepSeconds || 30;
    if (st.prepStartedAt == null) st.prepStartedAt = Date.now();
    const tick = () => {
      if (!st || st.stage !== 'prep') { stopTimer(); return; }
      const left = total - (Date.now() - st.prepStartedAt) / 1000;
      const el = document.getElementById('ltp-countdown');
      if (el) {
        el.textContent = fmtTime(Math.ceil(Math.max(0, left)));
        el.classList.toggle('late', left <= 5);
      }
      if (left <= 0) { stopTimer(); goListen(); }
    };
    tick();
    if (st && st.stage === 'prep') timerHandle = setInterval(tick, 250);
  }

  function goListen() {
    if (!st || st.stage !== 'prep') return;
    stopTimer();
    st.stage = 'listen';
    st.prepStartedAt = null;
    persist();
    renderQuestion();
  }

  // Grades every gap of a run (30 seconds / Quy trình; one request each),
  // then shows the result.
  async function submitRun() {
    if (!st || !RUN_KINDS.has(st.kind) || st.submitting) return;
    st.submitting = true;
    const seq = loadSeq;
    const btn = document.querySelector('#ltp-panel [data-act="submit-preview"], #ltp-panel [data-act="submit-run"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang chấm...'; }
    const pr = st.practice;
    try {
      for (let i = 0; i < pr.questions.length; i++) {
        const a = st.answers[i];
        if (a.result) continue;
        const q = pr.questions[i];
        const data = await api(`/listening-tips/${encodeURIComponent(st.lesson.lessonKey)}/practice/check`, {
          method: 'POST',
          body: JSON.stringify({ sectionId: pr.sectionId, questionNumber: q.questionNumber, answer: String(a.value || '').trim(), prediction: a.prediction || undefined }),
        }, CHECK_TIMEOUT_MS);
        if (!st || seq !== loadSeq) return;
        a.result = data.result;
      }
      st.stage = 'result';
      persist();
      renderQuestion();
      revealPanel();
    } catch (err) {
      if (err && err.body && err.body.requiresPremium && typeof openUpgradeModal === 'function') openUpgradeModal();
      else if (isStale(err)) showStale();
      else if (typeof showToast === 'function') showToast(errorMessage(err, 'Không chấm được bài, thử lại nhé.'), 'error');
      const again = document.querySelector('#ltp-panel [data-act="submit-preview"], #ltp-panel [data-act="submit-run"]');
      if (again) { again.disabled = false; again.textContent = 'Nộp bài'; }
    } finally {
      if (st) st.submitting = false;
    }
  }

  function renderRunResult() {
    stopTimer();
    stopAudio();
    const pr = st.practice;
    const n = pr.questions.length;
    const score = st.answers.filter(a => a.result && a.result.isCorrect).length;
    const predOk = st.answers.filter(a => a.result && a.result.predictionCorrect).length;
    if (!st.counted) { recordScore(score, n); st.counted = true; }
    st.finished = true;
    persist();
    renderEntry(st.lesson);
    const rows = pr.questions.map((q, i) => {
      const a = st.answers[i];
      const r = a.result || {};
      return `<div class="ltp-pv-res ${r.isCorrect ? 'ok' : 'bad'}">
        <div class="ltp-pv-res-head"><span class="ltp-qnum">${q.questionNumber}</span>
          <span class="ltp-verdict ${r.isCorrect ? 'right' : 'wrong'}">${r.isCorrect ? '✓' : '✗'} ${esc(a.value || '(bỏ trống)')}</span>
          ${r.isCorrect ? '' : `<span class="ltp-muted">→ Đáp án: <b>${esc(answerLabel(r.correctAnswer))}</b></span>`}</div>
        ${diagnosisHtml(r)}
        <div class="ltp-q small">${tokensHtml(q.text, a.sel, { locked: true, kw: q.keywords })}</div>
        <div class="ltp-typeline">Loại đáp án: <b>${typeName(r.answerType)}</b> · ${a.prediction ? `bạn dự đoán ${typeName(a.prediction)} ${r.predictionCorrect ? '✓' : '✗'}` : 'bạn chưa dự đoán'}
          · Keyword gợi ý: ${q.keywords.map(k => `<span class="ltp-chip kw">${esc(k)}</span>`).join(' ')}</div>
        ${a.para ? `<div class="ltp-muted">Paraphrase bạn đoán: “${esc(a.para)}” — so với câu trong audio bên dưới.</div>` : ''}
        ${evidenceHtml(r.evidence, q.keywords, `ltp-ev-${i}`)}
        ${r.explanation ? `<details class="ltp-expl"><summary>Giải thích</summary>${escNl(r.explanation)}</details>` : ''}
      </div>`;
    }).join('');
    const panelHead = `<div class="ltp-result-top">
      <div class="ltp-result-icon">🎉</div>
      <div class="ltp-result-title">Hoàn thành luyện tập ${esc(COPY[st.lesson.lessonKey].name)}</div>
      <div class="ltp-score">${score} / ${n}</div>
      <div class="ltp-result-msg">Dự đoán đúng loại đáp án: <b>${predOk}/${n}</b> câu</div>
    </div>`;
    showPanelState(panelHead + `<div class="ltp-pv-results">${rows}</div>
      <div class="ltp-result-actions">
        <button type="button" class="ltp-btn ltp-btn-primary" data-act="retry">🔄 Làm lại</button>
      </div>`);
    announce(`Hoàn thành luyện tập: đúng ${score} trên ${n} câu.`);
  }

  // Ký hiệu nhanh: symbol → meaning items, then heard sentence → symbol.
  function renderSymbols() {
    const it = st.items[st.idx];
    const a = st.answers[st.idx];
    const r = a.result;
    let body;
    if (it.type === 'meaning') {
      const opts = it.options.map((o, i) => {
        let cls = a.value === o ? 'selected' : '';
        if (r) cls = o === r.correctAnswer ? 'correct-ans' : (a.value === o ? 'wrong-ans' : '');
        return `<div class="ltp-opt ${cls}" ${r ? '' : `data-act="pick" data-val="${esc(o)}" ${KEY_ATTRS} aria-pressed="${a.value === o}"`}>
          <span class="ltp-opt-letter">${String.fromCharCode(65 + i)}</span>${esc(o)}</div>`;
      }).join('');
      body = `<div class="ltp-task">Phần A — Ký hiệu này dùng để ghi nhanh ý gì?</div>
        <div class="ltp-symbol">${esc(it.symbol)}</div>
        <div class="ltp-opts">${opts}</div>
        ${r ? `<div class="ltp-feedback ${r.isCorrect ? 'ok' : 'bad'}"><div class="ltp-verdict ${r.isCorrect ? 'right' : 'wrong'}">${r.isCorrect ? '✓ Chính xác!' : `✗ Chưa đúng — ${esc(r.symbol)} = <strong>${esc(r.correctAnswer)}</strong>`}</div></div>` : ''}`;
    } else {
      const opts = it.options.map(o => {
        let cls = a.value === o ? 'selected' : '';
        if (r) cls = o === r.correctAnswer ? 'correct-ans' : (a.value === o ? 'wrong-ans' : '');
        return `<div class="ltp-sym-opt ${cls}" ${r ? '' : `data-act="pick" data-val="${esc(o)}" ${KEY_ATTRS} aria-pressed="${a.value === o}"`}
          title="${esc(SYMBOL_NAMES[o] || '')}">${esc(o)}</div>`;
      }).join('');
      const pid = `ltp-p-${st.idx}`;
      body = `<div class="ltp-task">Phần B — Nghe một câu trong đề thật, rồi chọn ký hiệu để ghi nhanh ý chính của câu.</div>
        ${playerHtml(pid, it.segment, { label: 'Nghe câu' })}
        <input class="ltp-note" value="${esc(a.note || '')}" placeholder="Ghi nhanh bằng ký hiệu (không chấm) — VD: $80 → $50" autocomplete="off" ${r ? 'readonly' : ''} />
        <div class="ltp-sym-opts">${opts}</div>
        ${r ? `<div class="ltp-feedback ${r.isCorrect ? 'ok' : 'bad'}">
          <div class="ltp-verdict ${r.isCorrect ? 'right' : 'wrong'}">${r.isCorrect ? '✓ Chính xác!' : '✗ Chưa đúng'} — <strong>${esc(r.correctAnswer)}</strong> = ${esc(r.meaning)}</div>
          <div class="ltp-evidence"><div class="ltp-evidence-label">🎧 Câu trong audio</div>
            <div class="ltp-evidence-text">“${markTerms(r.evidence.text, [r.evidence.signal], 'ltp-hit')}”</div>
            <div class="ltp-muted">Dấu hiệu: <b>${esc(r.evidence.signal)}</b></div></div>
        </div>` : ''}`;
    }
    const source = it.type === 'audio' ? esc(it.sourceName) : 'Bảng ký hiệu trong bài học';
    showPanelState(headerHtml(source) + `<div class="ltp-card">${body}${navHtml(checkBtnHtml(a, !!a.value))}</div>`);
  }

  // ── Checking ──────────────────────────────────────────────────────────

  // Kinds whose screen is one typed gap.
  const typedKind = () => st && st.kind === 'keywords';

  function syncCheckBtn() {
    const btn = document.querySelector('#ltp-panel [data-act="check"]');
    const typing = typedKind() || (st && st.kind === 'qtype' && st.items[st.idx].input === 'text');
    if (btn && typing) btn.disabled = !String(st.answers[st.idx].value || '').trim();
  }

  // The section behind a saved practice was hidden or edited since (404 /
  // "not in this practice"): it can't be graded any more — say so in place
  // and offer a fresh practice instead of a toast that repeats forever.
  const isStale = (err) => !!err && (err.status === 404 || (err.body && err.body.code === 'NOT_IN_PRACTICE'));
  function showStale() {
    const card = document.querySelector('#ltp-panel .ltp-card, #ltp-panel .ltp-result');
    if (!card || card.querySelector('.ltp-stale')) return;
    const box = document.createElement('div');
    box.className = 'ltp-stale';
    box.setAttribute('role', 'alert');
    box.innerHTML = `<div>⚠️ Bài nghe của bài luyện tập này vừa được cập nhật nên không chấm được nữa. Các câu đã làm vẫn giữ nguyên.</div>
      <button type="button" class="ltp-btn ltp-btn-primary" data-act="start" data-force="1">↻ Tải lại bài</button>`;
    card.appendChild(box);
    revealEl(box);
  }

  async function checkCurrent() {
    if (!st || RUN_KINDS.has(st.kind)) return;
    const a = st.answers[st.idx];
    const it = st.items[st.idx];
    const predictOnly = PREDICT_KINDS.has(st.kind); // text only: the prediction is the answer
    const multi = st.kind === 'qtype' && it.input === 'multi';
    const ready = predictOnly ? a.prediction : multi ? (a.sel || []).length === it.pick : String(a.value || '').trim();
    if (a.result || a.checking || !ready) return;
    let body;
    if (predictOnly) body = { sectionId: it.sectionId, questionNumber: it.questionNumber, prediction: a.prediction };
    else if (st.kind === 'qtype') {
      body = { sectionId: st.practice.sectionId, questionNumber: it.questionNumber, answer: multi ? JSON.stringify(a.sel) : String(a.value).trim() };
      if (it.mode === 'guided' && a.prediction) body.prediction = a.prediction;
    }
    else if (typedKind()) body = { sectionId: it.sectionId, questionNumber: it.questionNumber, answer: String(a.value).trim(), prediction: a.prediction || undefined };
    else if (it.type === 'meaning') body = { item: 'meaning', symbol: it.symbol, answer: a.value };
    else body = { item: 'audio', sectionId: it.sectionId, sentenceIndex: it.sentenceIndex, answer: a.value };
    a.checking = true;
    const panel = panelEl();
    const keyboard = !!(panel && panel.contains(document.activeElement));
    const btn = document.querySelector('#ltp-panel [data-act="check"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang chấm...'; }
    try {
      const data = await api(`/listening-tips/${encodeURIComponent(st.lesson.lessonKey)}/practice/check`, {
        method: 'POST',
        body: JSON.stringify(body),
      }, CHECK_TIMEOUT_MS);
      if (!st || !st.answers.includes(a)) return; // practice closed / replaced meanwhile
      a.result = data.result;
      persist();
      if (st.answers[st.idx] === a) {
        stopAudio();
        renderQuestion();
        const verdict = document.querySelector('#ltp-panel .ltp-feedback .ltp-verdict');
        if (verdict) announce(verdict.textContent);
        revealEl(document.querySelector('#ltp-panel .ltp-feedback'));
        const go = keyboard && document.querySelector('#ltp-panel .ltp-nav .ltp-btn-primary');
        if (go) go.focus({ preventScroll: true });
      }
    } catch (err) {
      if (err && err.body && err.body.requiresPremium && typeof openUpgradeModal === 'function') openUpgradeModal();
      else if (isStale(err)) { if (st && st.answers[st.idx] === a) showStale(); }
      else if (typeof showToast === 'function') showToast(errorMessage(err, 'Không chấm được đáp án, thử lại nhé.'), 'error');
    } finally {
      a.checking = false;
      if (btn && btn.isConnected && !a.result) { btn.textContent = 'Kiểm tra'; btn.disabled = false; syncCheckBtn(); }
    }
  }

  // ── Result (keywords / symbols) ───────────────────────────────────────

  function renderResult() {
    if (RUN_KINDS.has(st.kind)) { st.stage = 'result'; renderRunResult(); return; }
    stopTimer();
    stopAudio();
    // a "choose TWO / THREE" item is worth its number of questions
    // and the worked example isn't scored
    const worth = (it) => (st.kind === 'qtype' && it.mode === 'example' ? 0 : (st.kind === 'qtype' && it.pick) || 1);
    const got = (a, it) => (!a.result ? 0 : a.result.total ? a.result.correctCount : (a.result.isCorrect ? worth(it) : 0));
    const n = st.items.reduce((s, it) => s + worth(it), 0);
    const score = st.answers.reduce((s, a, i) => s + got(a, st.items[i]), 0);
    if (!st.counted) { recordScore(score, n); st.counted = true; }
    st.finished = true;
    persist();
    renderEntry(st.lesson);
    const pct = n ? score / n : 0;
    const msg = pct === 1 ? 'Xuất sắc! Bạn đã nắm chắc kỹ thuật này.'
      : pct >= 0.6 ? 'Tốt lắm! Xem lại các câu sai để hiểu vì sao nhé.'
        : 'Chưa sao cả — đọc lại phần lý thuyết phía trên rồi làm lại nhé.';
    const predOk = typedKind() ? st.answers.filter(a => a.result && a.result.predictionCorrect).length : null;
    const rows = st.items.map((it, i) => {
      const ok = st.answers[i].result && st.answers[i].result.isCorrect;
      if (st.kind === 'qtype' && it.mode === 'example') {
        return `<button type="button" class="ltp-result-row ex" data-act="goto" data-idx="${i}">
        <span>📘</span><span class="ltp-result-q">Câu mẫu ${esc(qNumbers(it))}: ${esc(it.text)} <i>(không tính điểm)</i></span></button>`;
      }
      const text = st.kind === 'qtype' ? `Câu ${qNumbers(it)}: ${it.text}`
        : typedKind() || PREDICT_KINDS.has(st.kind) ? `Câu ${it.questionNumber}: ${it.text}`
          : it.type === 'meaning' ? `Ký hiệu ${it.symbol}` : `Nghe → ký hiệu (${it.sourceName})`;
      return `<button type="button" class="ltp-result-row ${ok ? 'ok' : 'bad'}" data-act="goto" data-idx="${i}">
        <span>${ok ? '✓' : '✗'}</span><span class="ltp-result-q">${esc(text)}</span></button>`;
    }).join('');
    showPanelState(`<div class="ltp-result">
      <div class="ltp-result-icon">🎉</div>
      <div class="ltp-result-title">Hoàn thành luyện tập ${esc(COPY[st.lesson.lessonKey].name)}</div>
      <div class="ltp-score">${score} / ${n}</div>
      <div class="ltp-result-msg">${esc(msg)}</div>
      ${predOk != null ? `<div class="ltp-result-msg">Dự đoán đúng loại đáp án: <b>${predOk}/${n}</b> câu</div>` : ''}
      <div class="ltp-result-list">${rows}</div>
      <div class="ltp-result-actions">
        <button type="button" class="ltp-btn" data-act="review">📖 Ôn lại</button>
        <button type="button" class="ltp-btn ltp-btn-primary" data-act="retry">🔄 Làm lại</button>
      </div>
    </div>`);
    announce(`Hoàn thành luyện tập: đúng ${score} trên ${n} câu.`);
  }

  // ── Events ────────────────────────────────────────────────────────────

  const SCREEN_ACTS = new Set(['prev', 'next', 'goto', 'review', 'retry', 'prep-start', 'wf-next', 'intro-done']);

  function focusKeyOf(el) {
    const d = el.dataset;
    const extra = ['val', 'ti', 'qi', 'idx'].filter(k => d[k] != null)
      .map(k => `[data-${k}="${String(d[k]).replace(/["\\]/g, '\\$&')}"]`).join('');
    return `[data-act="${d.act}"]${extra}`;
  }

  function currentSegment(playerId) {
    if (playerId === 'ltp-pv') return { url: st.practice.audioUrl, seg: st.practice.segment, locked: true };
    if (playerId === 'ltp-run') return { url: st.practice.audioUrl, seg: st.practice.segment };
    const m = /^ltp-(p|ev)-(\d+)$/.exec(playerId);
    if (!m) return null;
    const i = Number(m[2]);
    // (a worked example may come from another section, with its own audio)
    const url = st.items[i].audioUrl || (oneSection(st.practice) && st.practice.audioUrl);
    // a question-type item without a located stretch plays the whole section
    if (m[1] === 'p' && st.kind === 'qtype' && !st.items[i].segment) return { url, seg: { start: 0, end: st.items[i].audioDuration || st.practice.audioDuration || 3600 } };
    if (m[1] === 'p') return { url, seg: st.items[i].segment };
    const ev = (st.answers[i].result && st.answers[i].result.evidence) || (st.items[i].guide && st.items[i].guide.evidence);
    return ev ? { url, seg: { start: Math.max(0, ev.start - 0.2), end: ev.end + 0.5 } } : null;
  }

  function onClick(e, lesson) {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    if (act === 'start') {
      if (el.dataset.force) start(lesson); else confirmNewPractice(lesson, () => start(lesson));
      return;
    }
    if (act === 'resume') { resume(lesson); return; }
    if (act === 'upgrade') { if (typeof openUpgradeModal === 'function') openUpgradeModal(); return; }
    if (act === 'close' || act === 'dismiss') {
      stopTimer();
      stopAudio();
      if (st) persist();
      st = null;
      loadSeq++;
      const panel = panelEl();
      if (panel) { panel.hidden = true; panel.innerHTML = ''; }
      renderEntry(lesson);
      return;
    }
    if (!st) return;

    // audio controls: no re-render
    if (act === 'play' || act === 'replay' || act === 'ev-play') {
      const id = el.dataset.player;
      const src = currentSegment(id);
      if (!src) return;
      if (act === 'ev-play') {
        const wrap = document.getElementById(`${id}-wrap`);
        if (wrap && !wrap.innerHTML) wrap.innerHTML = playerHtml(id, src.seg, { label: 'Câu evidence' });
      }
      if (act === 'play' && player.id === id && player.el && (player.state === 'playing' || player.state === 'loading' || player.state === 'slow')) {
        if (!player.locked) pauseAudio();
        return;
      }
      if (act === 'play' && player.id === id && player.el && player.state === 'paused') {
        player.el.play().catch(() => {});
        return;
      }
      if (st.kind === 'keywords' && /^ltp-p-/.test(id)) st.answers[st.idx].played = (st.answers[st.idx].played || 0) + 1;
      playSegment(id, src.url, src.seg, { locked: src.locked });
      return;
    }
    if (act === 'speed') {
      player.speed = SPEEDS[(SPEEDS.indexOf(player.speed) + 1) % SPEEDS.length];
      if (player.el && !player.locked) player.el.playbackRate = player.speed;
      document.querySelectorAll('#ltp-panel .ltp-speed').forEach(b => { b.textContent = `${player.speed}x`; });
      return;
    }
    if (act === 'check') { checkCurrent(); return; }
    if (act === 'submit-preview' || act === 'submit-run') { submitRun(); return; }

    const qi = el.dataset.qi != null ? Number(el.dataset.qi) : st.idx;
    const cur = st.answers[qi];
    const focusKey = document.activeElement === el ? focusKeyOf(el) : null;
    switch (act) {
      case 'kw': {
        if (cur.kwDone && st.kind === 'keywords') return;
        // a question-type screen keeps `sel` for its "choose TWO" letters
        const field = st.kind === 'qtype' ? 'kwSel' : 'sel';
        const w = Number(el.dataset.ti);
        const set = new Set(cur[field] || []);
        if (set.has(w)) set.delete(w); else set.add(w);
        cur[field] = [...set];
        break;
      }
      case 'kw-done': cur.kwDone = true; if (st.kind === 'qtype') cur.step = Math.max(Number(cur.step) || 0, 1); break;
      // worked example: show the next step; done together: move to the next step
      case 'ex-next': cur.step = Math.min((Number(cur.step) || 0) + 1, EX_STEPS); break;
      case 'g-next': if (cur.result) return; cur.step = Math.min((Number(cur.step) || 0) + 1, WE_STEPS.length - 1); break;
      case 'predict': if (cur.result) return; cur.prediction = el.dataset.val; break;
      case 'wf-next': {
        const i = WF_STAGES.indexOf(st.stage);
        if (i === -1 || i >= WF_STAGES.indexOf('answer')) return;
        stopAudio();
        st.stage = WF_STAGES[i + 1];
        break;
      }
      case 'wf-check':
        st.checklist = { ...(st.checklist || {}), [el.dataset.val]: el.checked };
        persist();
        return;
      case 'pick': if (cur.result) return; cur.value = el.dataset.val; break;
      // "choose TWO / THREE": toggle a letter, never more than asked
      case 'mpick': {
        if (cur.result) return;
        const k = el.dataset.val;
        const set = new Set(cur.sel || []);
        if (set.has(k)) set.delete(k);
        else if (set.size < (st.items[st.idx].pick || 2)) set.add(k);
        cur.sel = [...set].sort();
        break;
      }
      case 'intro-done': st.introSeen = true; break;
      case 'prev': if (st.idx > 0) { st.idx--; stopAudio(); } break;
      case 'next': if (st.idx < st.items.length - 1) { st.idx++; stopAudio(); } break;
      case 'goto': st.idx = Math.min(Math.max(Number(el.dataset.idx) || 0, 0), st.items.length - 1); stopAudio(); break;
      case 'review': st.idx = 0; break;
      case 'finish': renderResult(); revealPanel(); return;
      case 'prep-start': {
        // unlock audio inside this click so it may start by itself when the
        // 30 s run out (iOS only lets a gesture start playback; if it still
        // refuses, the player shows its ▶ button)
        const a = audioEl();
        if (player.url !== st.practice.audioUrl) { player.url = st.practice.audioUrl; a.src = player.url; a.load(); }
        a.muted = true;
        const p = a.play();
        // (unless the student already skipped ahead and the run is playing)
        const unmute = () => { if (!player.id) a.pause(); a.muted = false; };
        if (p && p.then) p.then(unmute, () => { a.muted = false; }); else unmute();
        st.stage = 'prep';
        st.prepStartedAt = Date.now();
        break;
      }
      case 'prep-skip': goListen(); return;
      case 'retry':
        stopAudio();
        st.answers = freshAnswers(st.items);
        st.idx = 0;
        st.stage = st.kind === 'workflow' ? 'kw' : 'intro';
        st.checklist = {};
        st.finished = false;
        st.counted = false;
        break;
      default: return;
    }
    persist();
    if (act === 'retry') renderEntry(lesson);
    renderQuestion();
    if (focusKey) {
      const again = document.querySelector(`#ltp-panel ${focusKey}`);
      if (again) again.focus({ preventScroll: true });
    }
    if (SCREEN_ACTS.has(act)) revealPanel();
    if (act === 'ex-next' || act === 'g-next' || act === 'kw-done') {
      const shown = document.querySelector('#ltp-panel .ltp-gstep.current');
      revealEl(shown);
      const title = shown && shown.querySelector('.ltp-step-title');
      if (title) announce(title.textContent);
    }
  }

  window.LTPractice = { supports, mount };
})();
