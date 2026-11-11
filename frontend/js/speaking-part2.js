// speaking-part2.html — IELTS Speaking Part 2 · Master Story Framework
// ══════════════════════════════════════════════════════════════════════
//  7 master stories — content from GET /api/speaking-part2/content
//  (Premium; others get the story list + upgrade button). Same look and the same
//  "Dịch câu" drill as Luyện đề Task 2 theo buổi (task2-practice.html):
//    home   — hero, Lulu coach, one card per story, cue-card finder
//    story  — the 4 steps of one story:
//               ① Đọc bài mẫu theo 7 khung  ② Từ vựng ăn điểm
//               ③ Học thuộc 7 khung: 🎙️ Nhại + ⌨️ Dịch, khung by khung
//               ④ Ghép bài & nói thử (2 phút)
//    7 khung nói = 5 FIXED frames (a section with `join` is merged into the
//               one before) + WHY (theo cue card) + Kết luận. Each sentence
//               is worth 2 points — nhại (shadowing score >= 70%) and dịch
//               (typed right). A frame opens once the one before is >= 70%;
//               the story is "đạt" (homework) at >= 70% overall.
//    shadow   — listen (TTS) → say it → browser SpeechRecognition + the same
//               LCS word diff as shadowing.html → % of the sentence's words.
//    practice — Việt → Anh word-by-word typing (shared WbwDrill). The 3rd
//               wrong try on one word = the sentence counts wrong and
//               comes back 3 questions later (max 2 times), as in Task 2.
//  Progress: localStorage for speed, synced to the server
//  (PUT /api/speaking-part2/progress/:story) — that's what ticks a teacher's
//  `speaking_part2` homework, and what follows the student to another device.
//  The server recomputes mastery the same way (services/speakingPart2Service).
// ══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var DATA = null;       // { howTo, logic, stories } — set by boot()
  var STORIES = [];
  var LOCKED = false;    // no Premium: story list only
  var MAX_WORD_ERRORS = 3;
  var MAX_ASKS = 3;          // "Hỏi Lulu" asks per question (graded, so capped)
  var REQUEUE_GAP = 3;
  var MAX_REQUEUES = 2;
  var WPM = 130;                  // band 6.0–7.0 speaking speed (PDF: 120–140)
  var SPEAK_SECONDS = 120;
  var PREP_SECONDS = 60;
  var CAT = { col: 'Collocation', idiom: 'Idiom', adj: 'Adjective' };
  var CAT_HEAD = {
    col: ['COLLOCATIONS', 'kết hợp từ tự nhiên, dùng được nhiều nhất'],
    idiom: ['IDIOMS', 'tối đa 1–2 idioms / bài nói'],
    adj: ['ADJECTIVES', 'thay cho good / nice / interesting']
  };
  var PASS = 70;          // frame unlock + "đạt" (same as the server)
  var SHADOW_PASS = 70;   // a sentence's nhại score that counts
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var STEPS = [
    { key: 'read',  label: 'Đọc bài mẫu' },
    { key: 'vocab', label: 'Từ vựng' },
    { key: 'learn', label: 'Học thuộc 7 khung' },
    { key: 'speak', label: 'Nói thử' }
  ];
  var LULU = {
    read:  { say: 'Bước 1: đọc to bài mẫu theo 7 khung nói — bấm 🔊 để nghe từng câu. Đọc xong thì bấm “Đã đọc xong”.',
             tips: ['Đổi tên, địa điểm, con số thành chi tiết thật của cậu — câu chuyện thật nghe tự nhiên hơn nhiều!', 'Khung 1–5 giữ nguyên với mọi đề trong nhóm, chỉ khung 6 (WHY) đổi theo cue card thôi.'] },
    vocab: { say: 'Bước 2: học các cụm ăn điểm của nhóm này. Mỗi bài nói chỉ cần chèn 3–4 collocations và tối đa 1–2 idioms thôi!',
             tips: ['Idiom dùng sai ngữ cảnh gây hại nhiều hơn là không dùng đó nha.', 'Các ví dụ đều gắn với câu chuyện gốc — chèn thẳng vào bài nói được luôn!'] },
    learn: { say: 'Bước 3: học thuộc từng khung — 🎙️ nhại theo từng câu để máy chấm phát âm, rồi ⌨️ dịch Việt → Anh. Khung nào đạt 70% thì mở khung tiếp theo!',
             tips: ['Nhại: nghe câu mẫu rồi bấm “Nói theo” — từ xanh là máy nghe đúng, từ đỏ cần luyện thêm.', 'Mỗi câu có 2 điểm: nhại đạt 70% và dịch đúng. Cả bài đạt 70% là bài tập được tính đạt nha!', 'Bật “Che câu” khi nhại để tự nói từ trí nhớ — thuộc nhanh hơn nhiều!'] },
    speak: { say: 'Bước 4: ghép bài và nói thử trong 2 phút. Nhớ đến được khung WHY trước khi hết giờ nha!',
             tips: ['Đến khoảng 1:30 mà chưa tới khung WHY thì bỏ bớt câu mô tả đi.', 'Thử chế độ “Chữ cái đầu” rồi “Chỉ 7 khung” để tự kiểm tra trí nhớ.'] }
  };

  // ── tiny helpers ──────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function wc(s) { var t = String(s || '').trim(); return t ? t.split(/\s+/).length : 0; }
  function fmt(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function toast(msg, type) { if (window.showToast) window.showToast(msg, type || 'info'); }
  function reduceMotion() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function storyById(id) { for (var i = 0; i < STORIES.length; i++) if (STORIES[i].id === id) return STORIES[i]; return null; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function luluSvg(mood) { try { return window.Mascot ? window.Mascot.svg(mood, { label: 'Lulu' }) : '🍊'; } catch (e) { return '🍊'; } }

  // ── progress (localStorage, per user) ────────────────────────────────
  //   { [storyId]: { read, ok: { key: 1 }, shadow: { key: pct }, speak, best: { runKey: pct } } }
  //   keys: v<i> vocab · f<sec>.<j> FIXED · w<k>.<j> WHY variant · c<j> kết luận
  //   ok = typed right once (dịch) · shadow = best nhại score of a sentence
  function userKey() {
    var u = window.AuthService && window.AuthService.getUser && window.AuthService.getUser();
    return 'sp2_progress:' + String((u && (u._id || u.id)) || 'guest');
  }
  var _prog = null;
  function prog() {
    if (_prog) return _prog;
    try { _prog = JSON.parse(localStorage.getItem(userKey()) || '{}') || {}; } catch (e) { _prog = {}; }
    return _prog;
  }
  function sp(id) {
    var p = prog();
    if (!p[id]) p[id] = { read: 0, ok: {}, shadow: {}, speak: 0, best: {} };
    if (!p[id].ok) p[id].ok = {};
    if (!p[id].shadow) p[id].shadow = {};
    if (!p[id].best) p[id].best = {};
    return p[id];
  }
  // Every change also queues the story for the server (debounced).
  var _dirty = {}, _syncT = null;
  function saveProg(id) {
    try { localStorage.setItem(userKey(), JSON.stringify(prog())); } catch (e) {}
    id = id || state.storyId;
    if (!id || LOCKED) return;
    _dirty[id] = 1;
    clearTimeout(_syncT);
    _syncT = setTimeout(flushSync, 1200);
  }
  function payloadOf(id) {
    var p = sp(id);
    // shadow as [key, score] pairs: the server's request sanitizer drops dotted object keys ("f0.1").
    return { read: !!p.read, ok: Object.keys(p.ok), shadow: Object.keys(p.shadow).map(function (k) { return [k, p.shadow[k]]; }), speak: p.speak || 0, best: p.best || {} };
  }
  function flushSync(keepalive) {
    clearTimeout(_syncT);
    Object.keys(_dirty).forEach(function (id) {
      delete _dirty[id];
      api('/speaking-part2/progress/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(payloadOf(id)), keepalive: !!keepalive })
        .catch(function () { _dirty[id] = 1; });   // retried on the next change / page hide
    });
  }
  window.addEventListener('pagehide', function () { if (Object.keys(_dirty).length) flushSync(true); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && Object.keys(_dirty).length) flushSync(true); });

  async function api(path, opts) {
    opts = opts || {};
    var token = window.AuthService && window.AuthService.getToken();
    var headers = Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {});
    var res = await fetch(API + path, Object.assign({}, opts, { headers: headers }));
    if (window.ApiClient && window.ApiClient.handleResponse) return window.ApiClient.handleResponse(res);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // Server progress → this browser (union; nothing is ever lost), then send
  // up whatever this browser had that the server didn't (e.g. made offline).
  function mergeServer(server) {
    var p = prog();
    STORIES.forEach(function (st) {
      var srv = server[st.id], loc = sp(st.id);
      var before = JSON.stringify(payloadOf(st.id));
      if (srv) {
        (srv.ok || []).forEach(function (k) { loc.ok[k] = 1; });
        if (srv.read) loc.read = 1;
        loc.speak = Math.max(loc.speak || 0, srv.speak || 0);
        Object.keys(srv.best || {}).forEach(function (k) { if (loc.best[k] == null) loc.best[k] = srv.best[k]; });
        Object.keys(srv.shadow || {}).forEach(function (k) { loc.shadow[k] = Math.max(loc.shadow[k] || 0, Number(srv.shadow[k]) || 0); });
      }
      var srvSh = (srv && srv.shadow) || {};
      var localHasMore = Object.keys(loc.ok).length > ((srv && srv.ok) || []).length ||
        (loc.read && !(srv && srv.read)) || (loc.speak || 0) > ((srv && srv.speak) || 0) ||
        Object.keys(loc.shadow).some(function (k) { return (loc.shadow[k] || 0) > (Number(srvSh[k]) || 0); });
      if (localHasMore) _dirty[st.id] = 1;
      if (!srv && before === JSON.stringify(payloadOf(st.id)) && !localHasMore) delete p[st.id];
    });
    try { localStorage.setItem(userKey(), JSON.stringify(p)); } catch (e) {}
    if (Object.keys(_dirty).length) flushSync();
  }

  var PREF_KEY = 'sp2_prefs';
  var prefs = (function () { try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {}; } catch (e) { return {}; } })();
  if (prefs.vi == null) prefs.vi = true;
  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }

  // ── 7 khung nói ───────────────────────────────────────────────────────
  //   [{ kind: 'fixed'|'why'|'con', h, parts: [{ h, note, items }], items }]
  //   Same frames as the server's framesOf(). WHY has no items of its own —
  //   they come from the chosen cue-card variant (whyItems).
  function framesOf(st) {
    if (st._frames) return st._frames;
    var frames = [];
    st.fixed.forEach(function (sec, si) {
      var items = sec.s.map(function (x, j) { return { key: 'f' + si + '.' + j, en: x[0], vi: x[1] }; });
      var prev = frames[frames.length - 1];
      var part = { h: sec.h, note: sec.note, items: items };
      if (sec.join && prev) { prev.h = sec.join; prev.parts.push(part); }
      else frames.push({ kind: 'fixed', h: sec.h, parts: [part] });
    });
    frames.push({ kind: 'why', h: 'WHY — trả lời theo đề', parts: [] });
    frames.push({ kind: 'con', h: 'Kết luận', parts: [{ h: 'Kết luận', items: conclusionItems(st) }] });
    frames.forEach(function (f, i) {
      f.i = i;
      f.items = f.parts.reduce(function (a, p) { return a.concat(p.items); }, []);
      f.items.forEach(function (it) { it.ctx = 'Khung ' + (i + 1) + ' · ' + f.h; });
    });
    st._frames = frames;
    return frames;
  }
  function frameItems(st, fi, k) {
    var f = framesOf(st)[fi];
    return f.kind === 'why' ? whyItems(st, k != null ? k : state.variant) : f.items;
  }
  function fixedItems(st) {
    return framesOf(st).filter(function (f) { return f.kind === 'fixed'; }).reduce(function (a, f) { return a.concat(f.items); }, []);
  }
  function conclusionItems(st) {
    return st.conclusion.map(function (x, j) { return { key: 'c' + j, en: x[0], vi: x[1], ctx: 'Khung 7 · Kết luận' }; });
  }
  function whyItems(st, k) {
    var w = st.why[k];
    return w.s.map(function (x, j) { return { key: 'w' + k + '.' + j, en: x[0], vi: x[1], ctx: 'Khung 6 · WHY · ' + w.q }; });
  }
  function vocabItems(st) {
    return st.vocab.map(function (v, i) {
      return { key: 'v' + i, en: v[4], vi: v[2], ctx: CAT[v[0]], vocab: v };
    });
  }
  function countOk(st, items) {
    var ok = sp(st.id).ok;
    return items.filter(function (it) { return ok[it.key]; }).length;
  }

  // ── mastery (same rules as the server's masteryOf) ────────────────────
  function shOk(p, key) { return (p.shadow[key] || 0) >= SHADOW_PASS; }
  function pointsOf(st, items) {
    var p = sp(st.id), sh = 0, tr = 0;
    items.forEach(function (it) { if (shOk(p, it.key)) sh++; if (p.ok[it.key]) tr++; });
    return { sh: sh, tr: tr, n: items.length, got: sh + tr, of: items.length * 2 };
  }
  function pctOf(x) { return x.of ? Math.round(x.got / x.of * 100) : 0; }
  function whyNeed(st) { return Math.min(2, st.why.length); }
  function variantPct(st, k) { return pctOf(pointsOf(st, whyItems(st, k))); }
  // { pct, frames: [{ pct, open }] } — a frame is open once every frame
  // before it is >= PASS.
  function mastery(st) {
    var got = 0, of = 0, open = true;
    var frames = framesOf(st).map(function (f) {
      var x;
      if (f.kind === 'why') {
        x = st.why.map(function (w, k) { return pointsOf(st, whyItems(st, k)); })
          .sort(function (a, b) { return b.got / b.of - a.got / a.of; })
          .slice(0, whyNeed(st))
          .reduce(function (a, y) { return { got: a.got + y.got, of: a.of + y.of }; }, { got: 0, of: 0 });
      } else x = pointsOf(st, f.items);
      got += x.got; of += x.of;
      var row = { pct: pctOf(x), open: open };
      open = open && row.pct >= PASS;
      return row;
    });
    return { pct: of ? Math.round(got / of * 100) : 0, frames: frames };
  }
  function curFrame(m) {
    for (var i = 0; i < m.frames.length; i++) if (m.frames[i].open && m.frames[i].pct < PASS) return i;
    return -1;
  }

  // ── step status ───────────────────────────────────────────────────────
  function stepStatus(st) {
    if (LOCKED || !st.fixed) return STEPS.map(function (x) { return { key: x.key, label: x.label, done: false }; });
    var p = sp(st.id);
    var voc = vocabItems(st), m = mastery(st);
    return [
      { key: 'read',  label: 'Đọc bài mẫu',       done: !!p.read },
      { key: 'vocab', label: 'Từ vựng',           done: countOk(st, voc) === voc.length, n: countOk(st, voc), of: voc.length },
      { key: 'learn', label: 'Học thuộc 7 khung', done: m.pct >= PASS, n: m.pct, of: 100 },
      { key: 'speak', label: 'Nói thử',           done: (p.speak || 0) > 0 }
    ];
  }
  // Toast when an update opened a new frame / passed the story.
  function noteUnlocks(st, before) {
    var after = mastery(st), fr = framesOf(st);
    for (var i = 1; i < after.frames.length; i++) {
      if (after.frames[i].open && !before.frames[i].open) { toast('🔓 Đã mở khoá Khung ' + (i + 1) + ' · ' + fr[i].h, 'success'); break; }
    }
    if (after.pct >= PASS && before.pct < PASS) {
      toast('🎉 Đã thuộc ' + after.pct + '% câu chuyện — đạt yêu cầu bài tập!', 'success');
      if (window.Mascot && window.Mascot.cheer) { try { window.Mascot.cheer(); } catch (e) {} }
    }
  }
  function currentStep(st) {
    var s = stepStatus(st);
    for (var i = 0; i < s.length; i++) if (!s[i].done) return s[i].key;
    return null;
  }
  function storyState(st) {
    var s = stepStatus(st);
    var n = s.filter(function (x) { return x.done; }).length;
    var p = sp(st.id);
    if (n === s.length) return 'done';
    if (n || Object.keys(p.ok).length || Object.keys(p.shadow).length || p.read) return 'doing';
    return 'todo';
  }
  function nextStory() {
    for (var i = 0; i < STORIES.length; i++) if (storyState(STORIES[i]) === 'doing') return STORIES[i];
    for (i = 0; i < STORIES.length; i++) if (storyState(STORIES[i]) === 'todo') return STORIES[i];
    return null;
  }

  // ══════════════════════════════════════════════════════════════════════
  //  STATE + ROUTING
  // ══════════════════════════════════════════════════════════════════════
  var state = {
    view: 'home', storyId: null, variant: 0, memMode: 'full', finder: '',
    run: null,                       // practice run (dịch)
    sh: null,                        // shadowing run (nhại)
    readOpen: true
  };
  var app = document.getElementById('app');

  function curStory() { return storyById(state.storyId); }

  function readUrl() {
    var q = new URLSearchParams(location.search);
    var id = q.get('story');
    var st = id && storyById(id);
    state.storyId = st ? st.id : null;
    state.view = st ? 'story' : 'home';
    var v = parseInt(q.get('variant'), 10);
    state.variant = st && v >= 0 && v < st.why.length ? v : 0;
  }
  function go(view, storyId, opts) {
    opts = opts || {};
    if (LOCKED && view !== 'home') { upgrade(); return; }
    stopAll();
    state.view = view;
    if (storyId !== undefined) state.storyId = storyId;
    if (opts.variant != null) state.variant = opts.variant;
    if (!opts.noPush && (view === 'home' || view === 'story')) {
      var url = view === 'story' ? '/speaking-part2.html?story=' + encodeURIComponent(state.storyId) : '/speaking-part2.html';
      try { history.pushState({ v: view, s: state.storyId }, '', url); } catch (e) {}
    }
    render();
    if (opts.focusStep) setTimeout(function () { scrollToStep(opts.focusStep); }, 60);
    else window.scrollTo(0, 0);
  }
  window.addEventListener('popstate', function () {
    if (state.view === 'practice' && state.run && !state.run.finished) { askQuit(function () { readUrl(); stopAll(); render(); }); return; }
    shStop(true);
    readUrl(); stopAll(); render();
  });

  function upgrade() {
    if (window.openUpgradeModal) window.openUpgradeModal();
    else toast('Nâng cấp Premium để học 7 câu chuyện gốc', 'warn');
  }

  function render() {
    if (!DATA) return;
    if (LOCKED && state.view !== 'home') state.view = 'home';
    document.body.classList.toggle('sp2-on-home', state.view === 'home');
    if (state.view === 'practice') app.innerHTML = renderPractice();
    else if (state.view === 'done') app.innerHTML = renderDone();
    else if (state.view === 'shadow') app.innerHTML = renderShadow();
    else if (state.view === 'shdone') app.innerHTML = renderShadowDone();
    else if (state.view === 'story' && curStory()) app.innerHTML = renderStory();
    else { state.view = 'home'; app.innerHTML = renderHome(); }
    if (state.view === 'practice') mountQuestion();
    if (state.view === 'shadow') mountShadow();
    if (state.view === 'story') document.title = curStory().no + ' · ' + curStory().title + ' – Speaking Part 2 – EnglishWithDan';
    else document.title = 'Speaking Part 2 · 7 câu chuyện gốc – EnglishWithDan';
  }

  // ══════════════════════════════════════════════════════════════════════
  //  HOME
  // ══════════════════════════════════════════════════════════════════════
  var FLOW = [
    { phase: 'Hiểu bài', cls: 'prep', steps: [['1', 'fa-book-open', 'Đọc bài mẫu theo 7 khung'], ['2', 'fa-star', 'Từ vựng ăn điểm']] },
    { phase: 'Học thuộc', cls: 'class', steps: [['3', 'fa-microphone-alt', 'Nhại & dịch từng khung (≥70%)']] },
    { phase: 'Nói', cls: 'home', steps: [['4', 'fa-stopwatch', 'Ghép bài & nói 2 phút']] }
  ];

  function renderHome() {
    var nDone = STORIES.filter(function (s) { return storyState(s) === 'done'; }).length;
    var nDoing = STORIES.filter(function (s) { return storyState(s) === 'doing'; }).length;
    var next = nextStory();
    var h = DATA.howTo;
    return '' +
    '<div class="t2w sp2">' +
      '<section class="t2w-hero sp2-hero">' +
        '<div class="t2w-hero-text">' +
          '<h1 class="t2w-hero-title">Speaking Part 2 <span class="t2w-hero-tag">7 câu chuyện gốc</span></h1>' +
          '<p class="t2w-hero-sub">Không học thuộc một bài riêng cho từng topic: thuộc khoảng 70% phần <b>FIXED</b> của 1 câu chuyện, rồi thay 20–30 giây cuối (<b>WHY</b>) theo cue card.</p>' +
          '<div class="t2w-hero-badges">' +
            '<span class="t2w-hero-badge"><i class="fas fa-flag-checkered"></i> ' + nDone + '/' + STORIES.length + ' câu chuyện đã thuộc</span>' +
            (nDoing ? '<span class="t2w-hero-badge">✍️ ' + nDoing + ' đang học</span>' : '') +
            '<span class="t2w-hero-badge"><i class="fas fa-clock"></i> ≤ 2:00 · ≈ 270–300 từ</span>' +
          '</div>' +
        '</div>' +
        '<div class="lh-mascot" aria-hidden="true">' + (window.Mascot ? window.Mascot.duo('happy') : '') + '</div>' +
      '</section>' +

      '<div class="t2w-flow" aria-label="Các bước của mỗi câu chuyện">' +
        '<span class="t2w-flow-lbl">Mỗi câu chuyện gồm ' + STEPS.length + ' bước</span>' +
        FLOW.map(function (g) {
          return '<div class="t2w-phase is-' + g.cls + '"><span class="t2w-phase-name">' + g.phase + '</span>' +
            '<span class="t2w-phase-steps">' + g.steps.map(function (s) {
              return '<span class="t2w-step"><b>' + s[0] + '</b><i class="fas ' + s[1] + '"></i> ' + s[2] + '</span>';
            }).join('') + '</span></div>';
        }).join('') +
      '</div>' +

      (LOCKED ? lockedBanner() : homeCoach(next, nDone)) +

      '<details class="sp2-card sp2-howto"' + (nDone || nDoing ? '' : ' open') + '>' +
        '<summary><span class="sp2-card-ic">⏱️</span> <b>Cách dùng bộ khung</b> <span class="sp2-muted">— ngân sách thời gian & 3 nguyên tắc</span><i class="fas fa-chevron-down sp2-chev"></i></summary>' +
        '<div class="sp2-card-body">' +
          '<p class="sp2-goal">🎯 ' + esc(h.goal) + '</p>' +
          '<div class="sp2-table-wrap"><table class="sp2-table"><thead><tr><th>Phần</th><th>Thời lượng</th><th>Số từ (ước tính)</th></tr></thead><tbody>' +
            h.budget.map(function (r, i) { return '<tr' + (i === h.budget.length - 1 ? ' class="is-total"' : '') + '><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') +
          '</tbody></table></div>' +
          '<p class="sp2-note">' + esc(h.budgetNote) + '</p>' +
          '<ol class="sp2-rules">' + h.rules.map(function (r) { return '<li><b>' + esc(r[0]) + '</b> ' + esc(r[1]) + '</li>'; }).join('') + '</ol>' +
        '</div>' +
      '</details>' +

      renderFinder() +

      '<div class="t2w-grid sp2-grid">' + STORIES.map(storyCard).join('') + '</div>' +

      renderLogic() +
    '</div>';
  }

  function lockedBanner() {
    return '<div class="t2w-promo sp2-promo" id="premium-promo-banner">' +
      '<span class="t2w-promo-ic">⭐</span>' +
      '<div class="t2w-promo-txt"><b>Nâng cấp Premium để học 7 câu chuyện gốc</b>' +
        '<span>Bài mẫu theo 7 khung nói, 112 cụm từ ăn điểm, nhại theo từng câu có chấm phát âm, dịch câu Việt → Anh để thuộc bài và nói thử 2 phút. Xem trước danh sách câu chuyện và đề dùng được bên dưới.</span></div>' +
      '<button type="button" class="t2w-go" data-act="upgrade">Upgrade Premium</button>' +
    '</div>';
  }

  function homeCoach(next, nDone) {
    var text, mood = 'happy';
    if (!next) { text = 'Cậu đã thuộc cả 7 câu chuyện rồi! Giờ gặp cue card nào cũng có bài để nói 🥳'; mood = 'cheer'; }
    else if (storyState(next) === 'doing') { text = 'Cậu đang học dở câu chuyện ' + next.no + ': “' + next.title + '” — học nốt nha! 💪'; }
    else if (nDone) { text = 'Giỏi lắm, đã thuộc ' + nDone + ' câu chuyện! Tiếp theo là ' + next.no + ': “' + next.title + '” 🎉'; mood = 'excited'; }
    else text = 'Chào cậu! Tớ là Lulu 🍊 Chỉ cần 7 câu chuyện là trả lời được phần lớn cue card Part 2. Bắt đầu với câu chuyện 01 nha!';
    var bubble = (window.Mascot && window.Mascot.reactHtml)
      ? window.Mascot.reactHtml({ text: text, mood: mood, solo: true, compact: true })
      : '<div class="t2w-coach-txt">🍊 ' + esc(text) + '</div>';
    var btn = next ? '<button type="button" class="t2w-go" data-act="open" data-id="' + next.id + '"><i class="fas fa-play"></i> ' +
      (storyState(next) === 'doing' ? 'Học tiếp' : 'Bắt đầu') + ' câu chuyện ' + next.no + '</button>' : '';
    return '<div class="t2w-coach">' + bubble + btn + '</div>';
  }

  function storyCard(st, i) {
    var s = stepStatus(st);
    var n = s.filter(function (x) { return x.done; }).length;
    var stt = storyState(st);
    var isNext = !LOCKED && nextStory() === st;
    var pct = LOCKED ? 0 : mastery(st).pct;
    var chip = '';
    if (LOCKED) chip = '<span class="t2w-chip"><i class="fas fa-lock"></i> Premium</span>';
    else if (stt === 'done') chip = '<span class="t2w-chip is-ok"><i class="fas fa-check"></i> Xong ' + STEPS.length + ' bước</span>';
    else if (stt === 'doing') chip = '<span class="t2w-chip is-mid">✍️ ' + n + '/' + STEPS.length + ' bước</span>';
    if (!LOCKED && pct >= PASS) chip = '<span class="t2w-chip is-ok"><i class="fas fa-medal"></i> Thuộc ' + pct + '%</span>' + (stt === 'done' ? '' : chip);
    if (isNext) chip += '<span class="t2w-chip is-next">👉 Học tiếp</span>';
    var topics = st.remember.topics;
    return '' +
    '<div class="t2w-group sp2-group" style="--g-c:' + st.color + ';--i:' + i + '">' +
      '<div class="t2w-group-head">' +
        '<span class="t2w-group-emoji">' + st.emoji + '</span>' +
        '<div class="t2w-group-title"><div class="t2w-group-theme">' + esc(st.group) + '</div>' +
          '<span class="t2w-group-type">' + esc(st.rootQ.split(' — ')[0]) + '</span></div>' +
        '<span class="t2w-group-count' + (pct >= PASS ? ' is-full' : '') + '" title="Đã thuộc ' + pct + '% câu chuyện (cần ≥' + PASS + '%)">' + pct + '%</span>' +
      '</div>' +
      '<div class="t2w-group-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="t2w-group-sessions">' +
        '<button type="button" class="t2w-sess is-' + stt + (isNext ? ' is-next' : '') + '" data-act="open" data-id="' + st.id + '">' +
          '<span class="t2w-sess-num"><small>Bài</small>' + st.no + '</span>' +
          '<span class="t2w-sess-body"><span class="t2w-sess-name">' + esc(st.title) + '</span>' +
            (chip ? '<span class="t2w-sess-chips">' + chip + '</span>' : '') + '</span>' +
          '<span class="t2w-sess-go" aria-hidden="true">' + (stt === 'done' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-chevron-right"></i>') + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="sp2-topics"><span class="sp2-topics-lbl">Dùng cho:</span> ' + topics.slice(0, 5).map(esc).join(' · ') +
        (topics.length > 5 ? ' <span class="sp2-muted">+' + (topics.length - 5) + '</span>' : '') + '</div>' +
    '</div>';
  }

  // Cue card → which story + which WHY variant (from "Đề bài dùng được",
  // the WHY rows and section 08's "Mượn sang được").
  function finderIndex() {
    var rows = [];
    STORIES.forEach(function (st) {
      st.why.forEach(function (w, k) { rows.push({ st: st, k: k, label: w.q, sub: w.vi, text: (w.q + ' ' + w.vi).toLowerCase() }); });
      st.remember.topics.forEach(function (t) { rows.push({ st: st, k: null, label: t, sub: 'Đề bài dùng được', text: t.toLowerCase() }); });
      rows.push({ st: st, k: null, label: st.borrow, sub: 'Mượn sang được', text: st.borrow.toLowerCase() });
    });
    return rows;
  }
  var _finder = null;
  var STOP = { a: 1, an: 1, the: 1, you: 1, your: 1, describe: 1, of: 1, to: 1, in: 1, on: 1, that: 1, who: 1, which: 1, when: 1, time: 1, something: 1, someone: 1, is: 1, are: 1, did: 1, do: 1, have: 1, was: 1, 'một': 1 };
  function finderResults(q) {
    _finder = _finder || finderIndex();
    var toks = q.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').split(/\s+/).filter(function (t) { return t.length > 1 && !STOP[t]; });
    if (!toks.length) return [];
    var seen = {};
    return _finder.map(function (r) {
      var sc = 0;
      toks.forEach(function (t) { if (r.text.indexOf(t) >= 0) sc += t.length > 3 ? 2 : 1; else if (t.length > 4 && r.text.indexOf(t.slice(0, -1)) >= 0) sc += 1; });
      return { r: r, sc: sc };
    }).filter(function (x) { return x.sc > 0; })
      .sort(function (a, b) { return b.sc - a.sc || (a.r.k == null) - (b.r.k == null); })
      .filter(function (x) { var key = x.r.st.id + ':' + x.r.label; if (seen[key]) return false; seen[key] = 1; return true; })
      .slice(0, 6).map(function (x) { return x.r; });
  }
  function renderFinder() {
    return '<div class="sp2-card sp2-finder">' +
      '<label class="sp2-finder-lbl" for="sp2-finder"><span class="sp2-card-ic">🔎</span> <b>Gặp cue card này thì kể chuyện nào?</b></label>' +
      '<input id="sp2-finder" class="sp2-finder-input" type="search" autocomplete="off" placeholder="Gõ đề, ví dụ: a person who helped you · a crowded place · a gift…" value="' + esc(state.finder) + '">' +
      '<div class="sp2-finder-res" id="sp2-finder-res">' + finderResHtml(state.finder) + '</div>' +
    '</div>';
  }
  function finderResHtml(q) {
    if (!q || !q.trim()) return '';
    var res = finderResults(q);
    if (!res.length) return '<div class="sp2-finder-none">Chưa thấy câu chuyện khớp. 7 câu chuyện gốc không phủ tốt: thể thao · toà nhà / căn phòng · món ăn · công nghệ · phim / sách · luật lệ — các dạng này cần câu chuyện riêng.</div>';
    return res.map(function (r) {
      return '<button type="button" class="sp2-finder-row" data-act="open" data-id="' + r.st.id + '"' + (r.k != null ? ' data-variant="' + r.k + '"' : '') + ' style="--g-c:' + r.st.color + '">' +
        '<span class="sp2-finder-emoji">' + r.st.emoji + '</span>' +
        '<span class="sp2-finder-main"><b>' + r.st.no + ' · ' + esc(r.st.title) + '</b><span>' + (r.k != null ? 'WHY: ' : '') + esc(r.label) + ' <em>· ' + esc(r.sub) + '</em></span></span>' +
        '<i class="fas fa-chevron-right"></i></button>';
    }).join('');
  }

  function renderLogic() {
    var L = DATA.logic;
    return '<details class="sp2-card sp2-logic">' +
      '<summary><span class="sp2-card-ic">🧭</span> <b>Logic tổng hợp — 7 nhóm chủ đề</b><i class="fas fa-chevron-down sp2-chev"></i></summary>' +
      '<div class="sp2-card-body">' +
        '<p class="sp2-note">' + esc(L.intro) + '</p>' +
        '<div class="sp2-table-wrap"><table class="sp2-table"><thead><tr><th>Nhóm chủ đề</th><th>Câu hỏi gốc</th><th>Câu chuyện</th><th>Mượn sang được</th></tr></thead><tbody>' +
          STORIES.map(function (st) {
            return '<tr><td><b>' + esc(st.group) + '</b></td><td>' + esc(st.rootQ) + '</td><td><a href="/speaking-part2.html?story=' + st.id + '" data-act="open" data-id="' + st.id + '">' + st.emoji + ' ' + esc(st.title) + '</a></td><td>' + esc(st.borrow) + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<div class="sp2-callout"><b>Triết lý của bộ khung</b><ul>' + L.philosophy.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="sp2-callout is-warn"><b>Giới hạn — khi nào cần câu chuyện riêng</b><p>' + esc(L.limits) + '</p><p>' + esc(L.limitsTip) + '</p></div>' +
      '</div></details>';
  }

  // ══════════════════════════════════════════════════════════════════════
  //  STORY HUB
  // ══════════════════════════════════════════════════════════════════════
  var _coachFor = null, _pokes = 0;

  function renderStory() {
    var st = curStory();
    var cur = currentStep(st);
    return '' +
    '<div class="t2-nav t2-nav-row">' +
      '<div class="t2-nav-crumb"><span data-act="home">7 câu chuyện</span> › <b>' + st.no + ' · ' + esc(st.group) + '</b></div>' +
      '<div style="display:flex;gap:6px"><button class="t2-icon-btn" data-act="copy-link" title="Sao chép link" aria-label="Sao chép link"><i class="fas fa-link"></i></button></div>' +
    '</div>' +
    '<div class="t2-hub sp2-hub" style="--g-c:' + st.color + '">' +
      '<div class="t2-hub-head">' +
        '<div class="t2-hub-emoji">' + st.emoji + '</div>' +
        '<div style="min-width:0"><div class="t2-hub-kicker">Câu chuyện ' + st.no + ' · ' + esc(st.group) + '</div>' +
          '<h2 class="t2-hub-title">' + esc(st.title) + '</h2>' +
          '<span class="sp2-rootq">Câu hỏi gốc: ' + esc(st.rootQ) + '</span></div>' +
      '</div>' +
      '<div class="t2-selector-prompt sp2-skeleton"><strong>🦴 Khung xương sống (FIXED):</strong> ' + esc(st.skeleton) + '</div>' +
      frameMap(st) +
      renderCoach(st) +
      renderRail(st) +
      '<div class="t2-phase"><span class="t2-phase-k">Giai đoạn 1</span><b>Hiểu bài</b></div>' +
      renderReadStep(st, cur === 'read') +
      renderVocabStep(st, cur === 'vocab') +
      '<div class="t2-phase is-class"><span class="t2-phase-k">Giai đoạn 2</span><b>Học thuộc theo 7 khung nói</b></div>' +
      renderLearnStep(st, cur === 'learn') +
      '<div class="t2-phase is-home"><span class="t2-phase-k">Giai đoạn 3</span><b>Nói</b></div>' +
      renderSpeakStep(st, cur === 'speak') +
      renderRemember(st) +
      storyPager(st) +
    '</div>';
  }

  function coachState(st) {
    var s = stepStatus(st);
    var n = s.filter(function (x) { return x.done; }).length;
    var cur = currentStep(st);
    return {
      steps: s, n: n, cur: cur, all: !cur,
      mood: !cur ? 'cheer' : n >= 2 ? 'excited' : 'happy',
      text: !cur ? 'Cậu đã thuộc câu chuyện này rồi! Thử nói lại với một đề khác trong nhóm, hoặc sang câu chuyện tiếp theo nha 🥳' : LULU[cur].say
    };
  }
  function renderCoach(st) {
    var c = coachState(st);
    var enter = _coachFor !== st.id;
    _coachFor = st.id;
    return '<div class="t2-coach" id="t2-coach">' +
      '<button type="button" class="t2-coach-lulu' + (enter ? ' is-enter' : '') + '" data-mood="' + c.mood + '" data-act="poke" title="Bấm để nghe mẹo từ Lulu" aria-label="Lulu — bấm để nghe mẹo">' + luluSvg(c.mood) + '</button>' +
      '<div class="t2-coach-body">' +
        '<div class="t2-coach-bubble' + (enter ? ' is-say' : '') + '" id="t2-coach-say" role="status" aria-live="polite">' + esc(c.text) + '</div>' +
        '<div class="t2-coach-prog" aria-label="Đã xong ' + c.n + '/' + STEPS.length + ' bước">' + c.steps.map(function (s) {
          return '<i class="' + (s.done ? 'on' : '') + (s.key === c.cur ? ' cur' : '') + '"></i>';
        }).join('') + '<span>' + c.n + '/' + STEPS.length + ' bước</span></div>' +
      '</div></div>';
  }
  function poke() {
    var st = curStory(); if (!st) return;
    var c = coachState(st);
    _pokes++;
    var tips = c.all ? ['Tuyệt vời! Mai nhại lại khung 1–5 một lần nữa cho nhớ lâu nha 🍊', 'Thử nói với chế độ “Chỉ 7 khung” xem còn nhớ không nè!'] : LULU[c.cur].tips;
    var text = _pokes % 9 === 0 ? 'Ui da, cù lét tớ hoài! 🤭' : tips[_pokes % tips.length];
    var b = document.getElementById('t2-coach-say');
    var lulu = document.querySelector('.t2-coach-lulu');
    if (!b || !lulu) return;
    b.textContent = text;
    b.classList.remove('is-say'); void b.offsetWidth; b.classList.add('is-say');
    var mood = ['wink', 'excited', 'think', 'happy'][_pokes % 4];
    lulu.dataset.mood = mood; lulu.innerHTML = luluSvg(mood);
    lulu.classList.remove('is-enter', 'is-jump'); void lulu.offsetWidth; lulu.classList.add('is-jump');
  }
  function renderRail(st) {
    var s = stepStatus(st), cur = currentStep(st);
    return '<nav class="t2-rail" aria-label="Các bước">' + s.map(function (x, i) {
      return '<button type="button" class="t2-rail-item' + (x.done ? ' is-done' : '') + (x.key === cur ? ' is-current' : '') + '" data-act="scroll" data-step="' + x.key + '">' +
        '<span class="t2-rail-num">' + (x.done ? '<i class="fas fa-check" style="font-size:9px"></i>' : i + 1) + '</span>' + x.label + '</button>';
    }).join('') + '</nav>';
  }
  function stepHead(num, title, extra, done) {
    return '<div class="t2-step-head"><span class="t2-step-num' + (done ? ' is-done' : '') + '">' + (done ? '<i class="fas fa-check"></i>' : num) + '</span>' +
      '<div class="t2-step-title">' + title + '</div>' + (extra || '') + '</div>';
  }
  function meter(n, of) {
    var ok = of && n >= of;
    return '<div class="t2-meter' + (ok ? ' ok' : '') + '"><span style="width:' + (of ? Math.round(n / of * 100) : 0) + '%"></span></div>';
  }
  function sayBtn(text) {
    return '<button type="button" class="sp2-say" data-act="say" data-text="' + esc(text) + '" title="Nghe câu này" aria-label="Nghe"><i class="fas fa-volume-up"></i></button>';
  }
  function sentHtml(x) {
    return '<p class="sp2-sent">' + sayBtn(x[0]) + '<span class="sp2-sent-txt"><span class="sp2-en">' + esc(x[0]) + '</span>' +
      (prefs.vi ? '<span class="sp2-vi">' + esc(x[1]) + '</span>' : '') + '</span></p>';
  }

  // 7 khung at a glance (top of the story): number, title, % learnt, lock.
  function frameKindTag(f) { return f.kind === 'fixed' ? 'FIXED' : f.kind === 'why' ? 'ĐỔI THEO ĐỀ' : 'KẾT'; }
  function frameMap(st) {
    var m = mastery(st), cur = curFrame(m);
    return '<div class="sp2-fmap" aria-label="7 khung nói">' + framesOf(st).map(function (f, i) {
      var fm = m.frames[i];
      var cls = !fm.open ? ' is-locked' : fm.pct >= PASS ? ' is-ok' : i === cur ? ' is-cur' : '';
      return '<button type="button" class="sp2-fmap-i is-' + f.kind + cls + '" data-act="scroll-frame" data-f="' + i + '" title="Khung ' + (i + 1) + ' · ' + esc(f.h) + ' — đã thuộc ' + fm.pct + '%">' +
        '<span class="sp2-fmap-n">' + (!fm.open ? '<i class="fas fa-lock"></i>' : fm.pct >= PASS ? '<i class="fas fa-check"></i>' : i + 1) + '</span>' +
        '<span class="sp2-fmap-h">' + esc(f.kind === 'why' ? 'WHY' : f.h) + '</span>' +
        '<span class="sp2-fmap-bar"><i style="width:' + fm.pct + '%"></i></span>' +
      '</button>';
    }).join('') + '</div>';
  }
  function variantChips(st, act) {
    return '<div class="sp2-vchips" role="tablist" aria-label="Chọn đề (cue card)">' + st.why.map(function (w, k) {
      var pct = variantPct(st, k);
      return '<button type="button" role="tab" aria-selected="' + (k === state.variant) + '" class="sp2-vchip' + (k === state.variant ? ' is-on' : '') + (pct >= PASS ? ' is-ok' : '') + '" data-act="' + act + '" data-k="' + k + '" title="' + esc(w.vi) + '">' +
        esc(w.q) + (w.isNew ? ' <span class="sp2-new">mới</span>' : '') + (pct ? ' <em>' + pct + '%</em>' : '') + '</button>';
    }).join('') + '</div>';
  }

  // ① Đọc bài mẫu — the sample answer laid out as its 7 frames
  function renderReadStep(st, isCur) {
    var p = sp(st.id);
    var frames = framesOf(st);
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-read">' +
      stepHead(1, 'Đọc bài mẫu theo 7 khung nói', '<button type="button" class="t2-pill-toggle' + (prefs.vi ? ' on' : '') + '" data-act="toggle-vi">Hiện tiếng Việt</button>', !!p.read) +
      '<p class="t2-step-desc">Bài nói nào cũng đi theo 7 khung: <b>khung 1–5 (FIXED)</b> giữ nguyên với mọi đề trong nhóm → <b>khung 6 (WHY)</b> đổi theo cue card → <b>khung 7</b> kết luận. Đọc to 1–2 lần, bấm 🔊 để nghe từng câu.</p>' +
      '<div class="t2-actions" style="margin-bottom:6px">' +
        '<button type="button" class="t2-secondary" data-act="listen-all"><i class="fas fa-headphones"></i> <span>Nghe cả bài</span></button>' +
      '</div>' +
      '<details class="sp2-read"' + (isCur || state.readOpen ? ' open' : '') + '>' +
        '<summary>Bài mẫu · 7 khung</summary>' +
        '<div class="sp2-frames">' + frames.map(function (f, i) {
          var body;
          if (f.kind === 'why') {
            body = '<p class="sp2-frame-lead">Đề hỏi gì thì chọn đoạn WHY đó (Reason 1 + Example → Reason 2 + Example):</p>' +
              variantChips(st, 'variant') +
              '<div class="sp2-frame-sents">' + st.why[state.variant].s.map(sentHtml).join('') + '</div>';
          } else {
            body = f.parts.map(function (part) {
              return (f.parts.length > 1 ? '<div class="sp2-frame-sub">' + esc(part.h) + '</div>' : '') +
                (part.note ? '<div class="sp2-sec-note">💡 ' + esc(part.note) + '</div>' : '') +
                '<div class="sp2-frame-sents">' + part.items.map(function (it) { return sentHtml([it.en, it.vi]); }).join('') + '</div>';
            }).join('');
          }
          return (f.kind === 'why' ? '<div class="sp2-divider"><span>▼ TỪ ĐÂY THAY ĐỔI THEO CUE CARD</span></div>' : '') +
            '<div class="sp2-frame is-' + f.kind + '">' +
              '<div class="sp2-frame-h"><span class="sp2-frame-n">' + (i + 1) + '</span><b>' + esc(f.h) + '</b><span class="sp2-frame-tag">' + frameKindTag(f) + '</span></div>' +
              body +
            '</div>';
        }).join('') + '</div>' +
      '</details>' +
      '<div class="t2-actions">' +
        (p.read ? '<span class="t2-step-chip ok"><i class="fas fa-check"></i> Đã đọc</span>'
          : '<button type="button" class="t2-primary" data-act="mark-read"><i class="fas fa-check"></i> Đã đọc xong</button>') +
      '</div>' +
    '</section>';
  }

  // ② Từ vựng
  function renderVocabStep(st, isCur) {
    var it = vocabItems(st), n = countOk(st, it), done = n === it.length;
    var ok = sp(st.id).ok;
    var groups = ['col', 'idiom', 'adj'].map(function (cat) {
      var rows = st.vocab.map(function (v, i) { return { v: v, i: i }; }).filter(function (x) { return x.v[0] === cat; });
      return '<div class="sp2-vgroup"><div class="sp2-vgroup-h"><b>' + CAT_HEAD[cat][0] + '</b> — ' + CAT_HEAD[cat][1] + '</div>' +
        rows.map(function (x) {
          var v = x.v;
          return '<div class="t2-vitem sp2-vitem' + (ok['v' + x.i] ? ' is-ok' : '') + '">' +
            '<div class="t2-vitem-main">' +
              '<div class="t2-vitem-term">' + esc(v[1]) + sayBtn(v[1]) +
                (ok['v' + x.i] ? '<i class="fas fa-check-circle sp2-ok-ic" title="Đã thuộc"></i>' : '') + '</div>' +
              '<div class="t2-vitem-def">' + esc(v[2]) + '</div>' +
              '<div class="t2-vitem-ex">' + highlight(v[3], v[4]) + '</div>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';
    }).join('');
    var ph = st.phrases ? '<div class="sp2-callout"><b>★ ' + esc(st.phrases.title) + '</b><div class="sp2-phrases">' +
      st.phrases.items.map(function (x) { return '<span class="sp2-phrase"><b>' + esc(x[0]) + '</b> ' + esc(x[1]) + '</span>'; }).join('') + '</div>' +
      (st.phrases.more ? '<p class="sp2-muted" style="margin-top:6px">' + esc(st.phrases.more) + '</p>' : '') + '</div>' : '';
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-vocab">' +
      stepHead(2, 'Từ vựng ăn điểm — Nhóm ' + esc(st.group), '', done) +
      '<p class="t2-step-desc">Ví dụ đều gắn với câu chuyện gốc — chèn thẳng vào bài nói được. Luyện: đọc nghĩa + câu ví dụ bị che, gõ lại cụm từ.</p>' +
      meter(n, it.length) +
      '<div class="t2-wc-row"><span class="t2-step-chip' + (done ? ' ok' : '') + '">Đã thuộc ' + n + '/' + it.length + ' cụm</span></div>' +
      '<div class="t2-actions">' +
        '<button type="button" class="t2-primary is-lg" data-act="run" data-mode="vocab"><i class="fas fa-keyboard"></i> ' +
          (!n ? 'Luyện từ vựng' : done ? 'Luyện lại' : 'Luyện tiếp ' + (it.length - n) + ' cụm') + '</button>' +
      '</div>' +
      '<details class="sp2-vlist"' + (isCur ? ' open' : '') + '><summary>Bảng Collocations – Idioms – Adjectives (' + it.length + ')</summary>' + groups + '</details>' +
      ph +
    '</section>';
  }
  function highlight(ex, ans) {
    var i = ex.indexOf(ans);
    if (i < 0) return esc(ex);
    return esc(ex.slice(0, i)) + '<mark>' + esc(ans) + '</mark>' + esc(ex.slice(i + ans.length));
  }

  // ③ Học thuộc theo 7 khung — 🎙️ Nhại + ⌨️ Dịch, one frame after another
  function renderLearnStep(st, isCur) {
    var m = mastery(st), pass = m.pct >= PASS, cur = curFrame(m);
    var frames = framesOf(st);
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-learn">' +
      stepHead(3, 'Học thuộc từng khung · Nhại & Dịch', '<span class="t2-step-tag' + (pass ? ' ok' : '') + '">Đã thuộc ' + m.pct + '%</span>', pass) +
      '<p class="t2-step-desc">Mỗi câu có 2 phần: 🎙️ <b>Nhại</b> — nghe câu mẫu rồi nói theo, máy chấm phát âm (đạt khi ≥' + SHADOW_PASS + '%); ⌨️ <b>Dịch</b> — đọc tiếng Việt, gõ lại câu tiếng Anh. ' +
        'Khung trước thuộc <b>≥' + PASS + '%</b> mới mở khung sau. Cả bài thuộc <b>≥' + PASS + '%</b> là <b>đạt</b> (bài tập giáo viên giao).</p>' +
      '<div class="sp2-pass-meter' + (pass ? ' is-ok' : '') + '"><span style="width:' + m.pct + '%"></span><i style="left:' + PASS + '%" title="Mốc đạt ' + PASS + '%"></i></div>' +
      '<div class="t2-wc-row"><span class="t2-step-chip' + (pass ? ' ok' : '') + '">' + (pass ? '<i class="fas fa-medal"></i> Đạt — ' : '') + 'Thuộc ' + m.pct + '% cả bài' + (pass ? '' : ' · cần ≥' + PASS + '%') + '</span></div>' +
      (SR ? '' : '<div class="sp2-callout is-warn" style="margin:8px 0"><b>Trình duyệt này chưa chấm được phát âm.</b><p>Mở trang bằng Chrome hoặc Edge (máy tính / Android) để luyện Nhại — phần Dịch vẫn làm được ở đây.</p></div>') +
      '<ol class="sp2-ladder">' + frames.map(function (f, i) { return frameRow(st, f, m.frames[i], i === cur); }).join('') + '</ol>' +
      practiceOpts() +
    '</section>';
  }
  function drillBtns(fi, k, locked) {
    var dk = k != null ? ' data-k="' + k + '"' : '';
    var dis = locked ? ' disabled aria-disabled="true"' : '';
    return '<div class="sp2-rung-btns">' +
      '<button type="button" class="t2-primary is-sm" data-act="shadow" data-f="' + fi + '"' + dk + dis + '><i class="fas fa-microphone"></i> Nhại</button>' +
      '<button type="button" class="t2-secondary is-sm" data-act="run" data-mode="frame" data-f="' + fi + '"' + dk + dis + '><i class="fas fa-keyboard"></i> Dịch</button>' +
    '</div>';
  }
  function countsHtml(x) {
    return '<span class="sp2-rung-cnt"><span title="Câu nhại đạt ≥' + SHADOW_PASS + '%">🎙️ ' + x.sh + '/' + x.n + '</span>' +
      '<span title="Câu dịch đúng">⌨️ ' + x.tr + '/' + x.n + '</span></span>';
  }
  function frameRow(st, f, fm, isCur) {
    var i = f.i, locked = !fm.open, ok = fm.pct >= PASS;
    var cls = locked ? ' is-locked' : ok ? ' is-ok' : isCur ? ' is-cur' : '';
    var head = '<div class="sp2-rung-head">' +
      '<span class="sp2-rung-n">' + (locked ? '<i class="fas fa-lock"></i>' : ok ? '<i class="fas fa-check"></i>' : i + 1) + '</span>' +
      '<div class="sp2-rung-main"><b>Khung ' + (i + 1) + ' · ' + esc(f.h) + '</b>' +
        '<span class="sp2-rung-sub">' + (f.kind === 'why' ? st.why.length + ' đề · luyện ít nhất ' + whyNeed(st) + ' đề' : f.items.length + ' câu · ' + frameKindTag(f)) + '</span></div>' +
      '<span class="sp2-rung-pct">' + fm.pct + '%</span>' +
    '</div>' +
    '<div class="sp2-rung-bar"><i style="width:' + fm.pct + '%"></i></div>';
    var body;
    if (locked) {
      body = '<div class="sp2-rung-lock"><i class="fas fa-lock"></i> Thuộc Khung ' + i + ' ≥' + PASS + '% để mở khung này</div>';
    } else if (f.kind === 'why') {
      body = '<div class="sp2-rung-whys">' + st.why.map(function (w, k) {
        var x = pointsOf(st, whyItems(st, k)), pct = pctOf(x);
        return '<div class="sp2-whyrow' + (pct >= PASS ? ' is-ok' : '') + '">' +
          '<div class="sp2-whyrow-main"><b>' + esc(w.q) + '</b>' + (w.isNew ? ' <span class="sp2-new">mới</span>' : '') +
            '<span>' + esc(w.vi) + '</span>' + countsHtml(x) + '</div>' +
          '<span class="t2-step-chip' + (pct >= PASS ? ' ok' : pct ? ' mid' : '') + '">' + pct + '%</span>' +
          drillBtns(i, k, false) +
        '</div>';
      }).join('') + '</div>';
    } else {
      body = '<div class="sp2-rung-foot">' + countsHtml(pointsOf(st, f.items)) + drillBtns(i, null, false) + '</div>';
    }
    return '<li class="sp2-rung is-' + f.kind + cls + '" id="sp2-frame-' + i + '">' + head + body + '</li>';
  }
  function practiceOpts() {
    return '<div class="t2-opts-row" style="margin-top:10px">' +
      '<button type="button" class="t2-pill-toggle' + (prefs.shMask ? ' on' : '') + '" data-act="pref" data-pref="shMask" title="Nhại: che câu mẫu, chỉ hiện chữ cái đầu — nói từ trí nhớ">Che câu khi nhại</button>' +
      '<button type="button" class="t2-pill-toggle' + (prefs.autoNext ? ' on' : '') + '" data-act="pref" data-pref="autoNext" title="Tự chuyển câu khi làm đúng / nhại đạt">Tự chuyển câu</button>' +
      '<button type="button" class="t2-pill-toggle' + (prefs.shuffle ? ' on' : '') + '" data-act="pref" data-pref="shuffle" title="Dịch: xáo trộn thứ tự câu">Xáo trộn câu</button>' +
    '</div>';
  }

  // ④ Ghép bài & nói thử
  function assembled(st, k) {
    return {
      fixed: framesOf(st).filter(function (f) { return f.kind === 'fixed'; }).map(function (f) { return { h: f.h, s: f.items.map(function (x) { return x.en; }) }; }),
      why: st.why[k].s.map(function (x) { return x[0]; }),
      con: st.conclusion.map(function (x) { return x[0]; })
    };
  }
  function memText(s) {
    if (state.memMode === 'letters') {
      // first letter of each word, punctuation kept: "The person I'd…" → "T p I'…"
      return esc(s.split(/\s+/).map(function (w) {
        var m = w.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}])[\p{L}\p{N}'’-]*([^\p{L}\p{N}]*)$/u);
        return m ? m[1] + m[2] + m[3] : w;
      }).join(' '));
    }
    return esc(s);
  }
  function renderSpeakStep(st, isCur) {
    var k = state.variant, a = assembled(st, k), p = sp(st.id);
    var fw = a.fixed.reduce(function (n, sec) { return n + sec.s.reduce(function (m, s) { return m + wc(s); }, 0); }, 0);
    var ww = a.why.reduce(function (n, s) { return n + wc(s); }, 0);
    var cw = a.con.reduce(function (n, s) { return n + wc(s); }, 0);
    var total = fw + ww + cw, secs = total / WPM * 60;
    var body;
    if (state.memMode === 'skeleton') {
      body = '<div class="sp2-skel">' +
        '<p><b>FIXED:</b> ' + esc(st.remember.fixed) + '</p>' +
        '<ol>' + a.fixed.map(function (sec) { return '<li>' + esc(sec.h) + '</li>'; }).join('') +
          '<li><b>WHY — ' + esc(st.why[k].q) + ':</b> ' + esc(st.remember.flexible) + '</li>' +
          '<li><b>Kết luận:</b> So overall, …</li></ol></div>';
    } else {
      body = a.fixed.map(function (sec, i) {
        return '<p class="sp2-asm-p"><span class="sp2-asm-h">' + (i + 1) + ' · ' + esc(sec.h) + '</span>' + sec.s.map(memText).join(' ') + '</p>';
      }).join('') +
        '<p class="sp2-asm-p is-why"><span class="sp2-asm-h">' + (a.fixed.length + 1) + ' · WHY · ' + esc(st.why[k].q) + '</span>' + a.why.map(memText).join(' ') + '</p>' +
        '<p class="sp2-asm-p is-con"><span class="sp2-asm-h">' + (a.fixed.length + 2) + ' · Kết luận</span>' + a.con.map(memText).join(' ') + '</p>';
    }
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-speak">' +
      stepHead(4, 'Ghép bài & nói thử 2 phút', p.speak ? '<span class="t2-step-tag ok">Đã nói ' + p.speak + ' lần</span>' : '', (p.speak || 0) > 0) +
      '<p class="t2-step-desc">Chọn một đề, đọc lướt bài ghép, rồi bấm <b>Bắt đầu nói</b> và nói to không nhìn bài. Đồng hồ 2 phút như phòng thi — đến khoảng 1:30 nên đang ở khung 6 (WHY).</p>' +
      '<label class="sp2-field"><span>Đề (cue card):</span><select id="sp2-variant" class="sp2-select">' +
        st.why.map(function (w, i) { return '<option value="' + i + '"' + (i === k ? ' selected' : '') + '>' + esc(w.q) + ' — ' + esc(w.vi) + '</option>'; }).join('') +
      '</select></label>' +
      '<div class="sp2-budget">' +
        budgetCell('FIXED', fw, '200–230') + budgetCell('WHY', ww, '40–60') + budgetCell('Kết luận', cw, '20–35') +
        '<div class="sp2-budget-cell is-total"><b>' + total + ' từ</b><span>≈ ' + fmt(secs) + ' ở ' + WPM + ' từ/phút</span></div>' +
      '</div>' +
      '<div class="t2-seg sp2-seg" role="tablist" aria-label="Chế độ xem bài">' +
        segBtn('full', 'Cả bài') + segBtn('letters', 'Chữ cái đầu') + segBtn('skeleton', 'Chỉ 7 khung') +
      '</div>' +
      '<div class="sp2-asm' + (state.memMode === 'letters' ? ' is-letters' : '') + '" id="sp2-asm">' + body + '</div>' +
      '<div class="sp2-timer" id="sp2-timer">' + timerHtml() + '</div>' +
    '</section>';
  }
  function budgetCell(lbl, n, range) {
    var lo = parseInt(range, 10), hi = parseInt(range.split('–')[1], 10);
    var cls = n > hi + 10 ? ' is-over' : n < lo - 10 ? ' is-under' : '';
    return '<div class="sp2-budget-cell' + cls + '"><b>' + lbl + ': ' + n + ' từ</b><span>mục tiêu ' + range + '</span></div>';
  }
  function segBtn(mode, label) {
    return '<button type="button" class="' + (state.memMode === mode ? 'active' : '') + '" data-act="mem" data-mode="' + mode + '" role="tab" aria-selected="' + (state.memMode === mode) + '">' + label + '</button>';
  }

  function renderRemember(st) {
    var r = st.remember;
    return '<section class="t2-step sp2-remember">' +
      '<div class="t2-step-head"><span class="t2-step-num is-alt">📌</span><div class="t2-step-title">GHI NHỚ — chỉ cần nhớ</div></div>' +
      '<p><b>FIXED (học thuộc):</b> ' + esc(r.fixed) + '</p>' +
      '<p><b>FLEXIBLE (đổi theo đề):</b> ' + esc(r.flexible) + '</p>' +
      (r.map ? '<p><b>Ví dụ ánh xạ:</b> ' + esc(r.map) + '</p>' : '') +
      '<p><b>Đề bài dùng được:</b> ' + r.topics.map(esc).join(' · ') + '</p>' +
      '<p><b>Mượn sang được:</b> ' + esc(st.borrow) + '</p>' +
      (st.notes || []).map(function (n) {
        return '<div class="sp2-callout' + (n.kind === 'warn' ? ' is-warn' : '') + '"><b>' + (n.kind === 'warn' ? '⚠ ' : '★ ') + esc(n.title) + '</b><p>' + esc(n.text) + '</p></div>';
      }).join('') +
    '</section>';
  }
  function storyPager(st) {
    var i = STORIES.indexOf(st);
    var prev = STORIES[i - 1], next = STORIES[i + 1];
    return '<div class="sp2-pager">' +
      (prev ? '<button type="button" class="t2-secondary" data-act="open" data-id="' + prev.id + '"><i class="fas fa-arrow-left"></i> ' + prev.no + ' · ' + esc(prev.group) + '</button>' : '<span></span>') +
      (next ? '<button type="button" class="t2-secondary" data-act="open" data-id="' + next.id + '">' + next.no + ' · ' + esc(next.group) + ' <i class="fas fa-arrow-right"></i></button>' : '') +
    '</div>';
  }
  function scrollToStep(key) {
    var el = document.getElementById('sp2-step-' + key);
    if (el) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }
  function refreshStory(focusKey) {
    var y = window.scrollY;
    app.innerHTML = renderStory();
    window.scrollTo(0, y);
    if (focusKey) scrollToStep(focusKey);
  }

  // ── TTS (sentences) ───────────────────────────────────────────────────
  var _ttsQueue = null;
  function bestVoice() {
    var v = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    var en = v.filter(function (x) { return /^en[-_]/i.test(x.lang); });
    var good = /Google|Natural|Neural|Online|Samantha|Aria|Jenny|Ava|Allison|Sonia|Libby/i;
    return en.find(function (x) { return /GB/i.test(x.lang) && good.test(x.name); }) || en.find(function (x) { return good.test(x.name); }) || en[0] || null;
  }
  function speak(list, onEach, rate) {
    stopTts();
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') { toast('Trình duyệt này không hỗ trợ đọc to', 'warn'); return; }
    var q = { list: list.slice(), i: 0 };
    _ttsQueue = q;
    (function next() {
      if (_ttsQueue !== q || q.i >= q.list.length) { if (_ttsQueue === q) _ttsQueue = null; markSpeaking(null); return; }
      var text = q.list[q.i++];
      if (onEach) onEach(text);
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB'; u.rate = rate || 0.95;
      var v = bestVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      u.onend = u.onerror = function () { setTimeout(next, 120); };
      window.speechSynthesis.speak(u);
    })();
  }
  function stopTts() {
    _ttsQueue = null;
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    markSpeaking(null);
  }
  function markSpeaking(text) {
    document.querySelectorAll('.sp2-sent.is-speaking').forEach(function (el) { el.classList.remove('is-speaking'); });
    if (!text) return;
    var btns = document.querySelectorAll('.sp2-say');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].dataset.text === text) { var p = btns[i].closest('.sp2-sent'); if (p) { p.classList.add('is-speaking'); break; } }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  //  SPEAKING TIMER + optional recording
  // ══════════════════════════════════════════════════════════════════════
  var timer = { phase: 'idle', left: 0, t0: 0, tick: null, rec: null, stream: null, chunks: [], url: null, elapsed: 0 };
  function timerHtml() {
    var ph = timer.phase;
    if (ph === 'prep' || ph === 'talk') {
      var total = ph === 'prep' ? PREP_SECONDS : SPEAK_SECONDS;
      var pct = Math.round((total - timer.left) / total * 100);
      var hint = ph === 'prep' ? 'Chuẩn bị — ghi vài từ khoá theo khung xương sống' :
        (SPEAK_SECONDS - timer.left) >= 90 ? 'Đã 1:30 — phải đang ở phần WHY rồi nha!' : 'Đang nói phần FIXED…';
      return '<div class="sp2-timer-box is-' + ph + '">' +
        '<div class="sp2-timer-lbl">' + (ph === 'prep' ? '⏳ Chuẩn bị' : '🎙️ Đang nói') + (timer.rec ? ' · <span class="sp2-rec-dot"></span> đang ghi âm' : '') + '</div>' +
        '<div class="sp2-timer-num" id="sp2-timer-num">' + fmt(timer.left) + '</div>' +
        '<div class="sp2-timer-bar' + (ph === 'talk' ? ' has-mark' : '') + '"><i id="sp2-timer-fill" style="width:' + pct + '%"></i></div>' +
        '<div class="sp2-timer-hint" id="sp2-timer-hint">' + hint + '</div>' +
        '<div class="t2-actions">' +
          (ph === 'prep' ? '<button type="button" class="t2-primary" data-act="timer-skip"><i class="fas fa-forward"></i> Bắt đầu nói luôn</button>' : '') +
          '<button type="button" class="t2-secondary" data-act="timer-stop"><i class="fas fa-stop"></i> ' + (ph === 'talk' ? 'Nói xong' : 'Huỷ') + '</button>' +
        '</div></div>';
    }
    var res = ph === 'done' ? '<div class="sp2-timer-res">✅ Bạn đã nói <b>' + fmt(timer.elapsed) + '</b>' +
      (timer.elapsed < 90 ? ' — hơi ngắn, cố nói đủ 1:30–2:00 nha.' : timer.elapsed >= SPEAK_SECONDS ? ' — hết giờ! Giám khảo sẽ dừng bạn ở đây, đã kịp tới phần WHY chưa?' : ' — độ dài ổn!') + '</div>' +
      (timer.url ? '<audio controls src="' + timer.url + '" class="sp2-audio"></audio>' : '') : '';
    return res + '<div class="t2-actions">' +
      '<button type="button" class="t2-primary is-lg" data-act="timer-start"><i class="fas fa-play"></i> ' + (ph === 'done' ? 'Nói lại' : 'Bắt đầu nói') + ' (2:00)</button>' +
      '<button type="button" class="t2-pill-toggle' + (prefs.prep ? ' on' : '') + '" data-act="pref" data-pref="prep" title="Có 1 phút chuẩn bị như thi thật">1 phút chuẩn bị</button>' +
      '<button type="button" class="t2-pill-toggle' + (prefs.rec ? ' on' : '') + '" data-act="pref" data-pref="rec" title="Ghi âm để nghe lại giọng mình">🎙️ Ghi âm</button>' +
    '</div>';
  }
  function paintTimer() { var el = document.getElementById('sp2-timer'); if (el) el.innerHTML = timerHtml(); }
  function timerStart() {
    stopTts();
    if (timer.url) { try { URL.revokeObjectURL(timer.url); } catch (e) {} timer.url = null; }
    if (prefs.prep) beginPhase('prep'); else beginTalk();
  }
  function beginPhase(ph) {
    clearInterval(timer.tick);
    timer.phase = ph;
    timer.left = ph === 'prep' ? PREP_SECONDS : SPEAK_SECONDS;
    timer.t0 = Date.now();
    var total = timer.left;
    paintTimer();
    timer.tick = setInterval(function () {
      var gone = (Date.now() - timer.t0) / 1000;
      timer.left = Math.max(0, total - gone);
      var n = document.getElementById('sp2-timer-num'); if (n) n.textContent = fmt(timer.left);
      var f = document.getElementById('sp2-timer-fill'); if (f) f.style.width = Math.round(gone / total * 100) + '%';
      var h = document.getElementById('sp2-timer-hint');
      if (h && ph === 'talk' && gone >= 90) h.textContent = 'Đã 1:30 — phải đang ở phần WHY rồi nha!';
      if (timer.left <= 0) { if (ph === 'prep') beginTalk(); else timerStop(true); }
    }, 250);
  }
  function beginTalk() {
    beginPhase('talk');
    if (!prefs.rec) return;
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) { toast('Trình duyệt này không ghi âm được', 'warn'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      if (timer.phase !== 'talk') { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      timer.stream = s; timer.chunks = [];
      try {
        timer.rec = new MediaRecorder(s);
        timer.rec.ondataavailable = function (e) { if (e.data && e.data.size) timer.chunks.push(e.data); };
        timer.rec.onstop = function () {
          if (timer.chunks.length) {
            timer.url = URL.createObjectURL(new Blob(timer.chunks, { type: timer.rec.mimeType || 'audio/webm' }));
            if (timer.phase === 'done') paintTimer();
          }
          timer.rec = null;
        };
        timer.rec.start();
        paintTimer();
      } catch (e) { s.getTracks().forEach(function (t) { t.stop(); }); }
    }).catch(function () { toast('Chưa có quyền dùng micro — vẫn luyện nói được, chỉ không ghi âm', 'warn'); });
  }
  function timerStop(natural) {
    clearInterval(timer.tick); timer.tick = null;
    var wasTalk = timer.phase === 'talk';
    timer.elapsed = wasTalk ? Math.min(SPEAK_SECONDS, (Date.now() - timer.t0) / 1000) : 0;
    if (timer.rec && timer.rec.state !== 'inactive') { try { timer.rec.stop(); } catch (e) {} }
    if (timer.stream) { timer.stream.getTracks().forEach(function (t) { t.stop(); }); timer.stream = null; }
    timer.phase = wasTalk ? 'done' : 'idle';
    if (wasTalk && timer.elapsed >= 60 && curStory()) {
      var p = sp(curStory().id);
      var was = (p.speak || 0) > 0;
      p.speak = (p.speak || 0) + 1; saveProg();
      if (!was) { refreshStory(); celebrate('Bước 4 xong! Cậu đã nói thử trọn bài rồi đó 🎤'); return; }
    }
    if (natural && window.playOk) window.playOk();
    paintTimer();
  }
  function stopAll() {
    stopTts();
    shStop(true);
    if (timer.phase === 'prep' || timer.phase === 'talk') timerStop(false);
    if (timer.phase === 'done') timer.phase = 'idle';
    clearTimeout(_autoNext);
  }

  function celebrate(text) {
    var b = document.getElementById('t2-coach-say');
    if (b) { b.textContent = text; b.classList.remove('is-say'); void b.offsetWidth; b.classList.add('is-say'); }
    toast(text, 'success');
  }

  // ══════════════════════════════════════════════════════════════════════
  //  PRACTICE (Dịch câu)
  // ══════════════════════════════════════════════════════════════════════
  var _autoNext = null;
  function startRun(mode, opts) {
    opts = opts || {};
    var st = curStory();
    var items, label, runKey;
    if (mode === 'vocab') { items = vocabItems(st); label = '② Từ vựng'; runKey = 'vocab'; }
    else if (mode === 'frame') {
      var fm = mastery(st).frames[opts.f];
      if (!fm || !fm.open) { toast('Thuộc khung trước ≥' + PASS + '% để mở khung này nha', 'warn'); return; }
      var fr = framesOf(st)[opts.f];
      if (fr.kind === 'why') { if (opts.k != null) state.variant = opts.k; opts.k = state.variant; }
      items = frameItems(st, opts.f, opts.k);
      label = '⌨️ Khung ' + (opts.f + 1) + (fr.kind === 'why' ? ' · WHY · ' + st.why[opts.k].q : ' · ' + fr.h);
      runKey = null;
    } else if (mode === 'retry') { items = opts.items; label = '🔁 Ôn câu sai'; runKey = null; }
    if (!items || !items.length) return;
    // Vocab already partly known: only the rest, unless all of it is known
    // (then it's a full review). A frame is short — always the whole frame.
    if (!opts.all && mode === 'vocab') {
      var ok = sp(st.id).ok;
      var todo = items.filter(function (x) { return !ok[x.key]; });
      if (todo.length && todo.length < items.length) items = todo;
    }
    items = items.map(function (x) { return Object.assign({}, x); });
    if (prefs.shuffle) shuffle(items);
    state.run = {
      mode: mode, label: label, runKey: runKey, f: opts.f, k: opts.k,
      qs: items, status: items.map(function () { return 'pending'; }),
      idx: 0, first: {}, wrong: {}, answered: false, finished: false
    };
    stopAll();
    state.view = 'practice';
    render();
    window.scrollTo(0, 0);
  }

  function renderPractice() {
    var r = state.run, st = curStory(), q = r.qs[r.idx];
    var pct = Math.round((r.idx + 1) / r.qs.length * 100);
    var isVocab = !!q.vocab;
    var prompt = isVocab
      ? '<div class="t2-question-text sp2-q-vi">' + esc(q.vi) + '</div>' +
        '<div class="sp2-q-ex">' + clozeHtml(q.vocab[3], q.vocab[4]) + '</div>'
      : '<div class="t2-question-text sp2-q-vi">' + esc(q.vi) + '</div>';
    return '' +
    '<div class="t2-prac-head">' +
      '<button class="t2-back-btn" data-act="quit"><i class="fas fa-times"></i> Thoát</button>' +
      '<div class="t2-prac-ctx"><span class="t2-ctx-week">' + st.no + ' · ' + esc(st.group) + '</span>' +
        '<span class="t2-ctx-name" title="' + esc(st.title) + '">' + st.emoji + ' ' + esc(st.title) + '</span></div>' +
      '<span class="sp2-run-tag">' + esc(r.label) + '</span>' +
    '</div>' +
    '<div class="wp-progress-bar-wrap"><div class="wp-progress-bar" style="width:' + pct + '%"></div></div>' +
    '<div class="t2-q-dots">' + r.qs.map(function (x, i) {
      var s = r.status[i];
      return '<span class="t2-q-dot ' + (s === 'correct' ? 't2-dot-ok' : s === 'wrong' ? 't2-dot-err' : i === r.idx ? 't2-dot-current' : '') + '" title="Câu ' + (i + 1) + '"></span>';
    }).join('') + '</div>' +
    '<div class="wp-exercise-meta" style="padding:8px 20px">' +
      '<span class="wp-ex-counter">' + (r.idx + 1) + ' / ' + r.qs.length + '</span>' +
      '<span class="wp-type-tag">' + esc(q.ctx) + '</span>' +
      (q._repeat ? '<span class="wp-type-tag" style="background:#fef3c7;color:#92400e">🔁 Làm lại</span>' : '') +
    '</div>' +
    '<div class="wp-card sp2-qcard" style="margin:0 20px" id="qcard">' +
      '<div class="wp-task-label">' + (isVocab ? 'Gõ cụm từ còn thiếu' : 'Dịch câu sang tiếng Anh') + '</div>' +
      prompt +
      '<div class="sp2-wbw-bar">' +
        '<button type="button" class="wbw-ask ask-lulu" id="sp2-ask" data-act="ask" title="Hỏi Lulu chữ cái tiếp theo"><span class="ask-lulu-ic"></span> <span>Hỏi Lulu</span></button>' +
      '</div>' +
      '<div id="sp2-wbw"></div>' +
      '<div class="t2-wbw-hint">Câu tính sai sẽ quay lại sau ' + REQUEUE_GAP + ' câu để làm lại.</div>' +
    '</div>' +
    '<div class="wp-feedback-card hidden" id="sp2-fb" style="margin:12px 20px"></div>';
  }
  function clozeHtml(ex, ans) {
    var i = ex.indexOf(ans);
    if (i < 0) return esc(ex);
    return esc(ex.slice(0, i)) + '<span class="sp2-blank">' + ans.split(/\s+/).map(function () { return '_____'; }).join(' ') + '</span>' + esc(ex.slice(i + ans.length));
  }
  function mountQuestion() {
    var r = state.run, q = r.qs[r.idx];
    var host = document.getElementById('sp2-wbw');
    r.answered = false;
    r.asks = 0;
    if (window.AskLulu) window.AskLulu.left(document.getElementById('sp2-ask'), MAX_ASKS);
    window.WbwDrill.mount(host, {
      answer: q.en,
      maxWordErrors: MAX_WORD_ERRORS,
      onComplete: function () { answer(true); },
      onFail: function () { answer(false); }
    });
  }
  // At most MAX_ASKS asks per question.
  function askLulu() {
    var r = state.run;
    var host = document.getElementById('sp2-wbw');
    var pk = window.WbwDrill.peek(host);
    var btn = document.getElementById('sp2-ask');
    if (pk && window.AskLulu && btn && r && (r.asks || 0) < MAX_ASKS) {
      r.asks = (r.asks || 0) + 1;
      window.AskLulu.left(btn, MAX_ASKS - r.asks);
      window.AskLulu.say(btn, 'Chữ tiếp theo là “' + pk.next + '” nè — từ này bắt đầu “' + pk.sofar + (pk.full ? '' : '…') + '” 🍊');
    }
    var inp = host && host.querySelector('[data-role="input"]');
    if (inp && !inp.disabled) inp.focus();
  }
  function answer(ok) {
    var r = state.run;
    if (!r || r.answered) return;
    r.answered = true;
    var q = r.qs[r.idx], st = curStory();
    r.status[r.idx] = ok ? 'correct' : 'wrong';
    if (!(q.key in r.first)) r.first[q.key] = ok;
    var requeued = false;
    if (ok) { var before = mastery(st); sp(st.id).ok[q.key] = 1; saveProg(); delete r.wrong[q.key]; if (!q.vocab) noteUnlocks(st, before); }
    else {
      r.wrong[q.key] = q;
      var copies = r.qs.filter(function (x) { return x.key === q.key; }).length - 1;
      if (copies < MAX_REQUEUES) {
        var at = Math.min(r.idx + 1 + REQUEUE_GAP, r.qs.length);
        r.qs.splice(at, 0, Object.assign({}, q, { _repeat: true }));
        r.status.splice(at, 0, 'pending');
        requeued = true;
      }
    }
    var dots = document.querySelectorAll('.t2-q-dot');
    if (dots[r.idx]) dots[r.idx].className = 't2-q-dot ' + (ok ? 't2-dot-ok' : 't2-dot-err');
    var ask = document.getElementById('sp2-ask'); if (ask) ask.disabled = true;
    var fb = document.getElementById('sp2-fb');
    var last = r.idx >= r.qs.length - 1;
    fb.innerHTML =
      '<div class="wp-result-banner ' + (ok ? 'wp-result-correct' : 'wp-result-wrong') + '">' +
        (ok ? '✅ Chính xác!' : '❌ Câu này tính sai' + (requeued ? ' — sẽ quay lại sau ' + REQUEUE_GAP + ' câu' : '')) + '</div>' +
      '<div class="wp-comparison-box"><div class="wp-cmp-row wp-cmp-sample"><span class="wp-cmp-label">✅ Bài mẫu:</span><span class="wp-cmp-text">' + esc(q.vocab ? q.vocab[3] : q.en) + '</span>' + sayBtn(q.vocab ? q.vocab[3] : q.en) + '</div></div>' +
      '<button class="wp-next-btn" data-act="next">' + (last ? 'Xem kết quả' : 'Câu tiếp theo') + ' <i class="fas fa-arrow-right"></i>' +
        '<span style="font-size:10px;opacity:.55;margin-left:4px;font-weight:400">Enter ↵</span></button>';
    fb.classList.remove('hidden');
    if (ok && prefs.autoNext) { clearTimeout(_autoNext); _autoNext = setTimeout(next, 1100); }
  }
  function next() {
    clearTimeout(_autoNext);
    var r = state.run;
    if (!r || !r.answered) return;
    if (r.idx >= r.qs.length - 1) return finishRun();
    r.idx++;
    render();
  }
  function finishRun() {
    var r = state.run, st = curStory();
    r.finished = true;
    var keys = Object.keys(r.first);
    var right = keys.filter(function (k) { return r.first[k]; }).length;
    r.score = keys.length ? Math.round(right / keys.length * 100) : 0;
    r.right = right; r.total = keys.length;
    if (r.runKey) { sp(st.id).best[r.runKey] = r.score; saveProg(); }
    state.view = 'done';
    render();
    window.scrollTo(0, 0);
    if (r.score >= 80 && window.Mascot && window.Mascot.cheer) { try { window.Mascot.cheer(); } catch (e) {} }
  }
  function renderDone() {
    var r = state.run, st = curStory();
    var wrong = Object.keys(r.wrong).map(function (k) { return r.wrong[k]; });
    var mood = r.score >= 80 ? 'cheer' : r.score >= 50 ? 'happy' : 'think';
    var line = r.score >= 80 ? 'Xuất sắc! Câu chuyện đang vào đầu rồi đó 🎉' : r.score >= 50 ? 'Khá lắm! Ôn lại mấy câu sai là thuộc ngay 💪' : 'Không sao, lần đầu ai cũng vậy — làm lại vài lần là nhớ thôi 🍊';
    var bubble = (window.Mascot && window.Mascot.reactHtml) ? window.Mascot.reactHtml({ text: line, mood: mood, solo: true, compact: true }) : '<p>' + esc(line) + '</p>';
    return '<div class="t2-done sp2-done">' +
      bubble +
      '<div class="t2-done-score">' + r.score + '%</div>' +
      '<div class="t2-done-sub">' + esc(r.label) + ' · ' + st.no + ' ' + esc(st.title) + '</div>' +
      '<div class="t2-done-stats">' +
        '<div class="t2-done-stat"><div class="t2-done-stat-num">' + r.right + '/' + r.total + '</div><div class="t2-done-stat-lbl">Đúng ngay lần đầu</div></div>' +
        '<div class="t2-done-stat"><div class="t2-done-stat-num">' + wrong.length + '</div><div class="t2-done-stat-lbl">Vẫn còn sai</div></div>' +
      '</div>' +
      (wrong.length ? '<div class="sp2-wronglist"><div class="sp2-wronglist-h">Câu cần ôn lại</div>' + wrong.map(function (q) {
        return '<p class="sp2-sent">' + sayBtn(q.vocab ? q.vocab[3] : q.en) + '<span class="sp2-sent-txt"><span class="sp2-en">' + esc(q.vocab ? q.vocab[3] : q.en) + '</span><span class="sp2-vi">' + esc(q.vi) + '</span></span></p>';
      }).join('') + '</div>' : '') +
      '<div class="t2-actions" style="justify-content:center">' +
        (wrong.length ? '<button type="button" class="t2-primary is-lg" data-act="retry"><i class="fas fa-redo-alt"></i> Ôn câu sai (' + wrong.length + ')</button>' : '') +
        '<button type="button" class="t2-secondary" data-act="again"><i class="fas fa-sync-alt"></i> Làm lại</button>' +
        '<button type="button" class="t2-secondary" data-act="back-story"><i class="fas fa-arrow-left"></i> Về câu chuyện</button>' +
      '</div></div>';
  }

  // ══════════════════════════════════════════════════════════════════════
  //  NHẠI (shadowing) — listen → say it → scored like shadowing.html:
  //  browser SpeechRecognition, then an LCS word diff against the sentence;
  //  score = % of the sentence's words heard. Best score per sentence is kept.
  // ══════════════════════════════════════════════════════════════════════
  // British spellings vs. what en-US recognition writes back — equal.
  var SPELLING = {
    ok: 'okay', centre: 'center', realise: 'realize', realised: 'realized', programme: 'program',
    practise: 'practice', practises: 'practices', favourite: 'favorite', colour: 'color', neighbour: 'neighbor',
    theatre: 'theater', behaviour: 'behavior', travelling: 'traveling', organise: 'organize', organised: 'organized',
    recognise: 'recognize', apologise: 'apologize', grey: 'gray', mum: 'mom'
  };
  function normWord(w) {
    var n = String(w).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, '');
    return SPELLING[n] || n;
  }
  // Hyphenated words are scored as their parts (recognition splits them).
  function tokens(text) { return String(text || '').replace(/[-–—]/g, ' ').split(/\s+/).filter(function (w) { return normWord(w) !== ''; }); }
  function diffWords(refWords, saidWords) {
    var a = refWords.map(normWord), b = saidWords.map(normWord);
    var n = a.length, m = b.length, i, j;
    var dp = [];
    for (i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    var refHit = {};
    i = n; j = m;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { refHit[i - 1] = 1; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
      else j--;
    }
    return refHit;
  }
  function scoreClass(pct) { return pct >= 85 ? 'good' : pct >= 60 ? 'mid' : 'low'; }
  function maskWords(text) {
    return esc(String(text).split(/\s+/).map(function (w) {
      return w.replace(/([A-Za-z0-9])([A-Za-z0-9'’]*)/, function (_, f, r) { return f + r.replace(/[A-Za-z0-9]/g, '_'); });
    }).join(' '));
  }

  function startShadow(fi, k) {
    var st = curStory(), m = mastery(st);
    if (!m.frames[fi] || !m.frames[fi].open) { toast('Thuộc khung trước ≥' + PASS + '% để mở khung này nha', 'warn'); return; }
    var f = framesOf(st)[fi];
    if (f.kind === 'why' && k != null) state.variant = k;
    var items = frameItems(st, fi, k).map(function (x) { return Object.assign({}, x); });
    if (!items.length) return;
    stopAll();
    state.sh = {
      f: fi, k: f.kind === 'why' ? state.variant : null,
      label: '🎙️ Khung ' + (fi + 1) + (f.kind === 'why' ? ' · WHY · ' + st.why[state.variant].q : ' · ' + f.h),
      qs: items, idx: 0, run: {}, said: {}
    };
    state.view = 'shadow';
    render();
    window.scrollTo(0, 0);
  }

  function renderShadow() {
    var r = state.sh, st = curStory(), q = r.qs[r.idx], p = sp(st.id);
    var best = p.shadow[q.key];
    var pct = Math.round((r.idx + 1) / r.qs.length * 100);
    var last = r.idx >= r.qs.length - 1;
    var graded = r.run[q.key] != null;
    return '' +
    '<div class="t2-prac-head">' +
      '<button class="t2-back-btn" data-act="sh-quit"><i class="fas fa-times"></i> Thoát</button>' +
      '<div class="t2-prac-ctx"><span class="t2-ctx-week">' + st.no + ' · ' + esc(st.group) + '</span>' +
        '<span class="t2-ctx-name" title="' + esc(st.title) + '">' + st.emoji + ' ' + esc(st.title) + '</span></div>' +
      '<span class="sp2-run-tag">' + esc(r.label) + '</span>' +
    '</div>' +
    '<div class="wp-progress-bar-wrap"><div class="wp-progress-bar" style="width:' + pct + '%"></div></div>' +
    '<div class="t2-q-dots">' + r.qs.map(function (x, i) {
      var sc = r.run[x.key] != null ? r.run[x.key] : null;
      var c = sc == null ? (i === r.idx ? 't2-dot-current' : '') : sc >= SHADOW_PASS ? 't2-dot-ok' : 't2-dot-err';
      return '<button type="button" class="t2-q-dot ' + c + '" data-act="sh-go" data-i="' + i + '" title="Câu ' + (i + 1) + (sc != null ? ' · ' + sc + '%' : '') + '"></button>';
    }).join('') + '</div>' +
    '<div class="wp-exercise-meta" style="padding:8px 20px">' +
      '<span class="wp-ex-counter">' + (r.idx + 1) + ' / ' + r.qs.length + '</span>' +
      '<span class="wp-type-tag">' + esc(q.ctx) + '</span>' +
      (best != null ? '<span class="wp-type-tag sp2-best ' + (best >= SHADOW_PASS ? 'is-ok' : '') + '">Cao nhất: ' + best + '%</span>' : '') +
    '</div>' +
    '<div class="wp-card sp2-shcard" style="margin:0 20px">' +
      '<div class="wp-task-label">Nghe câu mẫu rồi nói theo</div>' +
      '<div class="sp2-sh-sent' + (prefs.shMask && !graded ? ' is-masked' : '') + '" id="sp2-sh-sent">' + (prefs.shMask && !graded ? maskWords(q.en) : esc(q.en)) + '</div>' +
      (prefs.vi ? '<div class="sp2-sh-vi">' + esc(q.vi) + '</div>' : '') +
      '<div class="sp2-sh-ctrl">' +
        '<button type="button" class="t2-secondary" data-act="sh-listen"><i class="fas fa-volume-up"></i> Nghe</button>' +
        '<button type="button" class="t2-secondary" data-act="sh-slow" title="Nghe chậm"><i class="fas fa-walking"></i> Chậm</button>' +
        '<button type="button" class="t2-primary sp2-sh-rec" id="sp2-sh-rec" data-act="sh-rec"' + (SR ? '' : ' disabled') + '><i class="fas fa-microphone"></i> Nói theo</button>' +
        '<button type="button" class="t2-secondary" id="sp2-sh-mine" data-act="sh-mine" disabled title="Nghe lại giọng của bạn"><i class="fas fa-play"></i> Giọng của tôi</button>' +
      '</div>' +
      '<div class="sp2-sh-interim" id="sp2-sh-interim" aria-live="polite">' + (SR ? '' : 'Trình duyệt này chưa chấm được phát âm — mở bằng Chrome hoặc Edge nha.') + '</div>' +
      '<div class="sp2-sh-score" id="sp2-sh-score" aria-live="polite"></div>' +
    '</div>' +
    '<div class="sp2-sh-nav">' +
      '<button type="button" class="t2-secondary" data-act="sh-prev"' + (r.idx ? '' : ' disabled') + '><i class="fas fa-arrow-left"></i> Câu trước</button>' +
      '<button type="button" class="t2-primary" data-act="sh-next">' + (last ? 'Xem kết quả' : 'Câu tiếp') + ' <i class="fas fa-arrow-right"></i></button>' +
    '</div>';
  }
  function mountShadow() {
    var r = state.sh, q = r.qs[r.idx];
    if (r.run[q.key] != null && r.said[q.key] != null) showShadowResult(q, r.said[q.key], r.run[q.key], true);
    else setTimeout(function () { if (state.view === 'shadow' && state.sh === r) speak([q.en]); }, 250);
  }

  var rec = { on: false, recog: null, media: null, stream: null, text: '', silence: null, hard: null, session: 0, url: null, audio: null };
  function shStart() {
    var r = state.sh;
    if (rec.on || !r || !SR) return;
    stopTts();
    var q = r.qs[r.idx], session = ++rec.session;
    rec.on = true; rec.text = '';
    setText('sp2-sh-interim', 'Đang nghe bạn nói…');
    var sc = document.getElementById('sp2-sh-score'); if (sc) { sc.className = 'sp2-sh-score'; sc.innerHTML = ''; }
    var btn = document.getElementById('sp2-sh-rec');
    if (btn) { btn.classList.add('is-recording'); btn.innerHTML = '<i class="fas fa-stop"></i> Dừng'; }
    rec.hard = setTimeout(shStop, Math.max(6000, wc(q.en) * 1000 + 3000));
    // Recognition first, own-voice capture after (Android lets only one hold the mic).
    var recog = new SR();
    rec.recog = recog;
    recog.lang = 'en-US';
    recog.continuous = !/Android/i.test(navigator.userAgent);
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recog.onresult = function (e) {
      var interim = '', fin = '';
      for (var k = 0; k < e.results.length; k++) {
        if (e.results[k].isFinal) fin += e.results[k][0].transcript + ' ';
        else interim += e.results[k][0].transcript;
      }
      rec.text = fin;
      setText('sp2-sh-interim', (fin + interim).trim() || 'Đang nghe bạn nói…');
      clearTimeout(rec.silence);
      rec.silence = setTimeout(shStop, 1500);
    };
    recog.onerror = function (e) {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Không truy cập được micro — hãy cho phép quyền micro trên trình duyệt.', 'error');
      else if (e.error === 'network') toast('Không kết nối được dịch vụ nhận diện giọng nói — kiểm tra mạng rồi thử lại.', 'error');
    };
    recog.onend = function () { if (rec.on) shStop(); };
    try { recog.start(); } catch (err) { /* already started */ }
    captureOwnVoice(session, r.idx);
  }
  function captureOwnVoice(session, recIdx) {
    if (!window.MediaRecorder || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then(function (stream) {
      if (!rec.on || session !== rec.session) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      rec.stream = stream;
      var chunks = [], mr = new MediaRecorder(stream);
      rec.media = mr;
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function () {
        if (!state.sh || state.sh.idx !== recIdx) return;
        if (rec.url) { try { URL.revokeObjectURL(rec.url); } catch (e) {} }
        rec.url = chunks.length ? URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' })) : null;
        var b = document.getElementById('sp2-sh-mine'); if (b) b.disabled = !rec.url;
      };
      mr.start();
    }).catch(function () { /* recognition still scores */ });
  }
  // silent: leaving the screen — stop without grading.
  function shStop(silent) {
    if (!rec.on) return;
    rec.on = false;
    clearTimeout(rec.silence); clearTimeout(rec.hard);
    if (rec.recog) { rec.recog.onend = null; try { rec.recog.stop(); } catch (e) {} rec.recog = null; }
    if (rec.media && rec.media.state !== 'inactive') { try { rec.media.stop(); } catch (e) {} }
    rec.media = null;
    if (rec.stream) { rec.stream.getTracks().forEach(function (t) { t.stop(); }); rec.stream = null; }
    var btn = document.getElementById('sp2-sh-rec');
    if (btn) { btn.classList.remove('is-recording'); btn.innerHTML = '<i class="fas fa-microphone"></i> Nói theo'; }
    if (silent === true || state.view !== 'shadow') return;
    gradeShadow(rec.text.trim());
  }
  function gradeShadow(said) {
    var r = state.sh, st = curStory();
    if (!r || !st) return;
    var q = r.qs[r.idx];
    if (!said) {
      setText('sp2-sh-interim', '');
      showScore('low', 'Chưa nghe thấy bạn nói', 'Bấm “Nói theo” và đọc to câu trên, gần micro hơn một chút.');
      return;
    }
    var ref = tokens(q.en), hit = diffWords(ref, tokens(said));
    var n = Object.keys(hit).length, pct = ref.length ? Math.round(n / ref.length * 100) : 0;
    var before = mastery(st), p = sp(st.id);
    r.run[q.key] = Math.max(r.run[q.key] || 0, pct);
    r.said[q.key] = said;
    if (pct > (p.shadow[q.key] || 0)) { p.shadow[q.key] = pct; saveProg(); }
    showShadowResult(q, said, pct, false);
    paintShadowDots();
    noteUnlocks(st, before);
    if (pct >= 85 && window.playOk) window.playOk();
    if (pct >= SHADOW_PASS && prefs.autoNext) { clearTimeout(_autoNext); _autoNext = setTimeout(shNext, 1600); }
  }
  function showShadowResult(q, said, pct, restored) {
    var ref = tokens(q.en), hit = diffWords(ref, tokens(said));
    var el = document.getElementById('sp2-sh-sent');
    if (el) {
      el.classList.remove('is-masked');
      el.innerHTML = ref.map(function (w, k) { return '<span class="' + (hit[k] ? 'w-match' : 'w-miss') + '">' + esc(w) + '</span>'; }).join(' ');
    }
    setText('sp2-sh-interim', 'Máy nghe được: “' + said + '”');
    var cls = scoreClass(pct), passed = pct >= SHADOW_PASS;
    var msg = cls === 'good' ? 'Tuyệt vời!' : passed ? 'Đạt — luyện thêm các từ màu đỏ.' : 'Chưa đạt ' + SHADOW_PASS + '% — nghe lại rồi thử thêm lần nữa nhé.';
    showScore(cls, (restored ? 'Lần này: ' : '') + pct + '% — ' + msg, 'Đúng ' + Object.keys(hit).length + '/' + ref.length + ' từ. Bấm “Giọng của tôi” để so với câu mẫu.');
  }
  function showScore(cls, title, sub) {
    var el = document.getElementById('sp2-sh-score');
    if (!el) return;
    el.className = 'sp2-sh-score show ' + cls;
    el.innerHTML = esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '');
  }
  function paintShadowDots() {
    var r = state.sh, dots = document.querySelectorAll('.t2-q-dot');
    r.qs.forEach(function (x, i) {
      var sc = r.run[x.key];
      if (dots[i] && sc != null) dots[i].className = 't2-q-dot ' + (sc >= SHADOW_PASS ? 't2-dot-ok' : 't2-dot-err');
    });
  }
  function setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function playMine() {
    if (!rec.url) return;
    stopTts();
    if (rec.audio) rec.audio.pause();
    rec.audio = new Audio(rec.url);
    rec.audio.play().catch(function () { toast('Không phát được bản ghi âm.', 'error'); });
  }
  function shGo(i) {
    var r = state.sh;
    if (!r || i < 0 || i >= r.qs.length) return;
    clearTimeout(_autoNext);
    shStop(true); stopTts();
    if (rec.url) { try { URL.revokeObjectURL(rec.url); } catch (e) {} rec.url = null; }
    r.idx = i;
    render();
  }
  function shNext() {
    var r = state.sh;
    if (!r || state.view !== 'shadow') return;
    if (r.idx >= r.qs.length - 1) { shStop(true); stopTts(); state.view = 'shdone'; render(); window.scrollTo(0, 0); return; }
    shGo(r.idx + 1);
  }
  function renderShadowDone() {
    var r = state.sh, st = curStory(), p = sp(st.id);
    var rows = r.qs.map(function (q) { return { q: q, run: r.run[q.key], best: p.shadow[q.key] || 0 }; });
    var tried = rows.filter(function (x) { return x.run != null; });
    var avg = tried.length ? Math.round(tried.reduce(function (a, x) { return a + x.run; }, 0) / tried.length) : 0;
    var weak = rows.filter(function (x) { return x.best < SHADOW_PASS; });
    var m = mastery(st), fm = m.frames[r.f], nextF = m.frames[r.f + 1];
    var mood = !weak.length ? 'cheer' : avg >= 60 ? 'happy' : 'think';
    var line = !weak.length ? 'Cả khung nhại đạt hết rồi! Giờ thử ⌨️ Dịch khung này nha 🎉' : tried.length ? 'Còn ' + weak.length + ' câu chưa đạt ' + SHADOW_PASS + '% — nhại lại mấy câu đó là xong 💪' : 'Cậu chưa nhại câu nào — bấm “Nói theo” để máy chấm nha 🍊';
    var bubble = (window.Mascot && window.Mascot.reactHtml) ? window.Mascot.reactHtml({ text: line, mood: mood, solo: true, compact: true }) : '<p>' + esc(line) + '</p>';
    return '<div class="t2-done sp2-done">' +
      bubble +
      '<div class="t2-done-score">' + avg + '%</div>' +
      '<div class="t2-done-sub">' + esc(r.label) + ' · điểm phát âm trung bình lần này</div>' +
      '<div class="t2-done-stats">' +
        '<div class="t2-done-stat"><div class="t2-done-stat-num">' + (rows.length - weak.length) + '/' + rows.length + '</div><div class="t2-done-stat-lbl">Câu nhại đạt</div></div>' +
        '<div class="t2-done-stat"><div class="t2-done-stat-num">' + fm.pct + '%</div><div class="t2-done-stat-lbl">Khung ' + (r.f + 1) + ' đã thuộc</div></div>' +
      '</div>' +
      '<div class="sp2-shlist">' + rows.map(function (x) {
        var c = x.best >= SHADOW_PASS ? 'is-ok' : x.best ? 'is-mid' : '';
        return '<p class="sp2-sent">' + sayBtn(x.q.en) + '<span class="sp2-sent-txt"><span class="sp2-en">' + esc(x.q.en) + '</span><span class="sp2-vi">' + esc(x.q.vi) + '</span></span>' +
          '<span class="sp2-shlist-pct ' + c + '">' + (x.best ? x.best + '%' : '—') + '</span></p>';
      }).join('') + '</div>' +
      '<div class="t2-actions" style="justify-content:center">' +
        (weak.length ? '<button type="button" class="t2-primary is-lg" data-act="sh-weak"><i class="fas fa-redo-alt"></i> Nhại lại câu chưa đạt (' + weak.length + ')</button>' : '') +
        '<button type="button" class="' + (weak.length ? 't2-secondary' : 't2-primary is-lg') + '" data-act="run" data-mode="frame" data-f="' + r.f + '"' + (r.k != null ? ' data-k="' + r.k + '"' : '') + '><i class="fas fa-keyboard"></i> Dịch khung này</button>' +
        (nextF && nextF.open ? '<button type="button" class="t2-secondary" data-act="shadow" data-f="' + (r.f + 1) + '"><i class="fas fa-microphone"></i> Nhại khung ' + (r.f + 2) + '</button>' : '') +
        '<button type="button" class="t2-secondary" data-act="back-story"><i class="fas fa-arrow-left"></i> Về câu chuyện</button>' +
      '</div></div>';
  }
  function shWeak() {
    var r = state.sh, st = curStory(), p = sp(st.id);
    var qs = r.qs.filter(function (q) { return (p.shadow[q.key] || 0) < SHADOW_PASS; });
    if (!qs.length) return;
    state.sh = { f: r.f, k: r.k, label: r.label, qs: qs, idx: 0, run: {}, said: {} };
    state.view = 'shadow';
    render();
    window.scrollTo(0, 0);
  }

  // ── quit modal (same as Task 2's "Dừng luyện tập?") ─────────────────
  function askQuit(onLeave) {
    var r = state.run;
    var left = r ? r.qs.length - r.idx - (r.answered ? 1 : 0) : 0;
    var ov = document.getElementById('t2-quit-overlay');
    if (!ov || !left) { onLeave(); return; }
    document.getElementById('t2-quit-sub').textContent = 'Còn ' + left + ' câu chưa làm. Các câu đã gõ đúng vẫn được tính là đã thuộc.';
    ov.classList.remove('hidden');
    var cont = document.getElementById('t2-quit-continue-btn'), leave = document.getElementById('t2-quit-leave-btn');
    function close() { ov.classList.add('hidden'); cont.onclick = leave.onclick = null; }
    cont.onclick = function () { close(); var i = document.querySelector('#sp2-wbw [data-role="input"]'); if (i && !i.disabled) i.focus(); };
    leave.onclick = function () { close(); onLeave(); };
  }

  // ══════════════════════════════════════════════════════════════════════
  //  EVENTS
  // ══════════════════════════════════════════════════════════════════════
  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) return;
    var act = el.dataset.act;
    var st = curStory();
    switch (act) {
      case 'open':
        e.preventDefault();
        go('story', el.dataset.id, el.dataset.variant != null ? { variant: +el.dataset.variant, focusStep: 'learn' } : {});
        break;
      case 'home': go('home', null); break;
      case 'upgrade': upgrade(); break;
      case 'copy-link': copyLink(); break;
      case 'poke': poke(); break;
      case 'scroll': scrollToStep(el.dataset.step); break;
      case 'toggle-vi': prefs.vi = !prefs.vi; savePrefs(); state.readOpen = true; refreshStory(); break;
      case 'say': speak([el.dataset.text], markSpeaking); break;
      case 'listen-all':
        state.readOpen = true;
        var det = document.querySelector('.sp2-read'); if (det) det.open = true;
        speak(fixedItems(st).concat(whyItems(st, state.variant), conclusionItems(st)).map(function (x) { return x.en; }), markSpeaking);
        break;
      case 'variant': state.variant = +el.dataset.k; state.readOpen = true; stopTts(); refreshStory(); break;
      case 'scroll-frame':
        var fe = document.getElementById('sp2-frame-' + el.dataset.f);
        if (fe) fe.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
        break;
      case 'mark-read': sp(st.id).read = 1; saveProg(); refreshStory(); celebrate('Bước 1 xong! Giờ học từ vựng ăn điểm nha 📚'); setTimeout(function () { scrollToStep('vocab'); }, 400); break;
      case 'run':
        startRun(el.dataset.mode, {
          f: el.dataset.f != null ? +el.dataset.f : null,
          k: el.dataset.k != null ? +el.dataset.k : null
        });
        break;
      case 'shadow': startShadow(+el.dataset.f, el.dataset.k != null ? +el.dataset.k : null); break;
      case 'sh-listen': shStop(true); speak([state.sh.qs[state.sh.idx].en]); break;
      case 'sh-slow': shStop(true); speak([state.sh.qs[state.sh.idx].en], null, 0.7); break;
      case 'sh-rec': if (rec.on) shStop(); else shStart(); break;
      case 'sh-mine': playMine(); break;
      case 'sh-prev': shGo(state.sh.idx - 1); break;
      case 'sh-next': shNext(); break;
      case 'sh-go': shGo(+el.dataset.i); break;
      case 'sh-weak': shWeak(); break;
      case 'sh-quit': go('story', state.storyId, { noPush: true, focusStep: 'learn' }); break;
      case 'pref':
        var k = el.dataset.pref; prefs[k] = !prefs[k]; savePrefs();
        el.classList.toggle('on', !!prefs[k]);
        break;
      case 'mem': state.memMode = el.dataset.mode; refreshStory(); break;
      case 'timer-start': timerStart(); break;
      case 'timer-skip': beginTalk(); break;
      case 'timer-stop': timerStop(false); break;
      case 'ask': askLulu(); break;
      case 'next': next(); break;
      case 'quit': askQuit(function () { go('story', state.storyId, { noPush: true, focusStep: stepOfRun() }); }); break;
      case 'retry':
        var items = Object.keys(state.run.wrong).map(function (k2) { var q = state.run.wrong[k2]; return { key: q.key, en: q.en, vi: q.vi, ctx: q.ctx, vocab: q.vocab }; });
        startRun('retry', { items: items });
        break;
      case 'again':
        var r = state.run;
        if (r.mode === 'retry') go('story', state.storyId, { noPush: true, focusStep: 'learn' });
        else startRun(r.mode, { f: r.f, k: r.k, all: true });
        break;
      case 'back-story': go('story', state.storyId, { noPush: true, focusStep: state.view === 'shdone' ? 'learn' : stepOfRun() }); break;
    }
  });
  function stepOfRun() {
    var r = state.run; if (!r) return null;
    return r.mode === 'vocab' ? 'vocab' : 'learn';
  }
  app.addEventListener('input', function (e) {
    if (e.target.id === 'sp2-finder') {
      state.finder = e.target.value;
      var res = document.getElementById('sp2-finder-res');
      if (res) res.innerHTML = finderResHtml(state.finder);
    }
  });
  app.addEventListener('change', function (e) {
    if (e.target.id === 'sp2-variant') { state.variant = +e.target.value; refreshStory(); }
  });
  app.addEventListener('toggle', function (e) {
    if (e.target.matches && e.target.matches('.sp2-read')) state.readOpen = e.target.open;
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && state.view === 'shadow' && !(e.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName))) { e.preventDefault(); shNext(); return; }
    if (e.key !== 'Enter' || state.view !== 'practice' || !state.run || !state.run.answered) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName) && !e.target.disabled && e.target.tagName !== 'BUTTON') return;
    e.preventDefault();
    next();
  });

  function copyLink() {
    var url = location.origin + '/speaking-part2.html' + (state.storyId ? '?story=' + state.storyId : '');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast('Đã sao chép link', 'success'); }, function () { toast(url); });
    else toast(url);
  }

  // ── boot ─────────────────────────────────────────────────────────────
  function bootMsg(html) { app.innerHTML = '<div class="sp2-boot">' + html + '</div>'; }
  async function boot() {
    bootMsg('<div class="wp-spinner"></div><p>Đang tải 7 câu chuyện gốc…</p>');
    var content;
    try { content = await api('/speaking-part2/content'); }
    catch (e) {
      bootMsg('<p>Không tải được nội dung' + (e && e.coldStart ? ' — máy chủ đang khởi động, thử lại sau vài giây' : '') + '.</p>' +
        '<button type="button" class="t2-primary" id="sp2-retry"><i class="fas fa-redo"></i> Thử lại</button>');
      document.getElementById('sp2-retry').onclick = boot;
      return;
    }
    DATA = content; STORIES = content.stories || []; LOCKED = !!content.locked;
    _finder = null;
    var wanted = new URLSearchParams(location.search).get('story');
    if (!LOCKED) {
      try { var pr = await api('/speaking-part2/progress'); mergeServer(pr.progress || {}); } catch (e) { /* offline: local progress still works */ }
    }
    readUrl();
    try { history.replaceState({ v: state.view, s: state.storyId }, '', location.href); } catch (e) {}
    render();
    if (LOCKED && wanted) upgrade();
    if (state.view === 'story' && new URLSearchParams(location.search).get('variant') != null) setTimeout(function () { scrollToStep('learn'); }, 80);
  }
  boot();

  // Expose for tests / debugging.
  window.SP2 = { state: state, stepStatus: stepStatus, finderResults: finderResults, mastery: mastery, framesOf: framesOf };
})();
