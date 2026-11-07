// speaking-part2.html — IELTS Speaking Part 2 · Master Story Framework
// ══════════════════════════════════════════════════════════════════════
//  7 master stories — content from GET /api/speaking-part2/content
//  (Premium; others get the story list + upgrade button). Same look and the same
//  "Dịch câu" drill as Luyện đề Task 2 theo buổi (task2-practice.html):
//    home   — hero, Lulu coach, one card per story, cue-card finder
//    story  — the 5 steps of one story:
//               ① Đọc bài mẫu  ② Từ vựng ăn điểm
//               ③ Dịch phần FIXED  ④ Dịch phần WHY theo đề
//               ⑤ Ghép bài & nói thử (2 phút)
//    practice — Việt → Anh word-by-word typing (shared WbwDrill). The 3rd
//               wrong try on one word = the sentence counts wrong and
//               comes back 3 questions later (max 2 times), as in Task 2.
//  Progress: localStorage for speed, synced to the server
//  (PUT /api/speaking-part2/progress/:story) — that's what ticks a teacher's
//  `speaking_part2` homework, and what follows the student to another device.
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
  var STEPS = [
    { key: 'read',  label: 'Đọc bài mẫu' },
    { key: 'vocab', label: 'Từ vựng' },
    { key: 'fixed', label: 'Dịch FIXED' },
    { key: 'why',   label: 'Dịch WHY' },
    { key: 'speak', label: 'Nói thử' }
  ];
  var LULU = {
    read:  { say: 'Bước 1: đọc to bài mẫu 1–2 lần trước nha — bấm 🔊 để nghe từng câu. Đọc xong thì bấm “Đã đọc xong”.',
             tips: ['Đổi tên, địa điểm, con số thành chi tiết thật của cậu — câu chuyện thật nghe tự nhiên hơn nhiều!', 'Phần FIXED chiếm khoảng 1 phút 30 — học thuộc 70% là đủ rồi.'] },
    vocab: { say: 'Bước 2: học các cụm ăn điểm của nhóm này. Mỗi bài nói chỉ cần chèn 3–4 collocations và tối đa 1–2 idioms thôi!',
             tips: ['Idiom dùng sai ngữ cảnh gây hại nhiều hơn là không dùng đó nha.', 'Các ví dụ đều gắn với câu chuyện gốc — chèn thẳng vào bài nói được luôn!'] },
    fixed: { say: 'Bước 3: dịch phần FIXED từ tiếng Việt sang tiếng Anh, gõ từng chữ. Gõ nhiều lần là thuộc lúc nào không hay!',
             tips: ['Bí chữ nào thì bấm “Hỏi Lulu”, tớ nhắc từng chữ cái một.', 'Học từng đoạn một cũng được — bấm vào tên đoạn để dịch riêng đoạn đó.'] },
    why:   { say: 'Bước 4: chọn ít nhất 2 đề trong nhóm và dịch phần WHY + kết luận. Đây là phần trả lời đúng đề nên đừng bỏ qua nha!',
             tips: ['Công thức WHY: Reason 1 + Example → Reason 2 + Example.', 'Thiếu thời gian thì cắt phần giữa, không bao giờ cắt phần WHY.'] },
    speak: { say: 'Bước 5: ghép bài và nói thử trong 2 phút. Nhớ đến được phần WHY trước khi hết giờ nha!',
             tips: ['Đến khoảng 1:30 mà chưa tới phần WHY thì bỏ bớt câu mô tả đi.', 'Thử chế độ “Chữ cái đầu” rồi “Chỉ khung xương” để tự kiểm tra trí nhớ.'] }
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
  //   { [storyId]: { read, ok: { key: 1 }, speak, best: { runKey: pct } } }
  //   keys: v<i> vocab · f<sec>.<j> FIXED · w<k>.<j> WHY variant · c<j> kết luận
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
    if (!p[id]) p[id] = { read: 0, ok: {}, speak: 0, best: {} };
    if (!p[id].ok) p[id].ok = {};
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
    return { read: !!p.read, ok: Object.keys(p.ok), speak: p.speak || 0, best: p.best || {} };
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
      }
      var localHasMore = Object.keys(loc.ok).length > ((srv && srv.ok) || []).length ||
        (loc.read && !(srv && srv.read)) || (loc.speak || 0) > ((srv && srv.speak) || 0);
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

  // ── question lists ────────────────────────────────────────────────────
  function fixedItems(st, onlySec) {
    var out = [];
    st.fixed.forEach(function (sec, si) {
      if (onlySec != null && si !== onlySec) return;
      sec.s.forEach(function (x, j) {
        out.push({ key: 'f' + si + '.' + j, en: x[0], vi: x[1], ctx: (si + 1) + '. ' + sec.h });
      });
    });
    return out;
  }
  function conclusionItems(st) {
    return st.conclusion.map(function (x, j) { return { key: 'c' + j, en: x[0], vi: x[1], ctx: 'Kết luận' }; });
  }
  function whyItems(st, k) {
    var w = st.why[k];
    return w.s.map(function (x, j) { return { key: 'w' + k + '.' + j, en: x[0], vi: x[1], ctx: 'WHY · ' + w.q }; });
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

  // ── step status ───────────────────────────────────────────────────────
  function whyDone(st, k) { var it = whyItems(st, k); return countOk(st, it) === it.length; }
  function whyNeed(st) { return Math.min(2, st.why.length); }
  function stepStatus(st) {
    if (LOCKED || !st.fixed) return STEPS.map(function (x) { return { key: x.key, label: x.label, done: false }; });
    var p = sp(st.id);
    var voc = vocabItems(st), fix = fixedItems(st), con = conclusionItems(st);
    var nWhy = st.why.filter(function (w, k) { return whyDone(st, k); }).length;
    return [
      { key: 'read',  label: 'Đọc bài mẫu', done: !!p.read },
      { key: 'vocab', label: 'Từ vựng',     done: countOk(st, voc) === voc.length, n: countOk(st, voc), of: voc.length },
      { key: 'fixed', label: 'Dịch FIXED',  done: countOk(st, fix) === fix.length, n: countOk(st, fix), of: fix.length },
      { key: 'why',   label: 'Dịch WHY',    done: nWhy >= whyNeed(st) && countOk(st, con) === con.length, n: nWhy, of: st.why.length },
      { key: 'speak', label: 'Nói thử',     done: (p.speak || 0) > 0 }
    ];
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
    if (n || Object.keys(p.ok).length || p.read) return 'doing';
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
    run: null,                       // practice run
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
    else if (state.view === 'story' && curStory()) app.innerHTML = renderStory();
    else { state.view = 'home'; app.innerHTML = renderHome(); }
    if (state.view === 'practice') mountQuestion();
    if (state.view === 'story') document.title = curStory().no + ' · ' + curStory().title + ' – Speaking Part 2 – EnglishWithDan';
    else document.title = 'Speaking Part 2 · 7 câu chuyện gốc – EnglishWithDan';
  }

  // ══════════════════════════════════════════════════════════════════════
  //  HOME
  // ══════════════════════════════════════════════════════════════════════
  var FLOW = [
    { phase: 'Hiểu bài', cls: 'prep', steps: [['1', 'fa-book-open', 'Đọc bài mẫu'], ['2', 'fa-star', 'Từ vựng ăn điểm']] },
    { phase: 'Dịch câu giúp nhớ', cls: 'class', steps: [['3', 'fa-language', 'Dịch FIXED'], ['4', 'fa-random', 'Dịch WHY theo đề']] },
    { phase: 'Nói', cls: 'home', steps: [['5', 'fa-microphone', 'Ghép bài & nói 2 phút']] }
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
        '<span class="t2w-flow-lbl">Mỗi câu chuyện gồm 5 bước</span>' +
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
        '<span>Bài mẫu đầy đủ, 112 cụm từ ăn điểm, dịch câu Việt → Anh để thuộc bài và nói thử 2 phút. Xem trước danh sách câu chuyện và đề dùng được bên dưới.</span></div>' +
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
    var chip = '';
    if (LOCKED) chip = '<span class="t2w-chip"><i class="fas fa-lock"></i> Premium</span>';
    else if (stt === 'done') chip = '<span class="t2w-chip is-ok"><i class="fas fa-check"></i> Đã thuộc</span>';
    else if (stt === 'doing') chip = '<span class="t2w-chip is-mid">✍️ ' + n + '/5 bước</span>';
    if (isNext) chip += '<span class="t2w-chip is-next">👉 Học tiếp</span>';
    var topics = st.remember.topics;
    return '' +
    '<div class="t2w-group sp2-group" style="--g-c:' + st.color + ';--i:' + i + '">' +
      '<div class="t2w-group-head">' +
        '<span class="t2w-group-emoji">' + st.emoji + '</span>' +
        '<div class="t2w-group-title"><div class="t2w-group-theme">' + esc(st.group) + '</div>' +
          '<span class="t2w-group-type">' + esc(st.rootQ.split(' — ')[0]) + '</span></div>' +
        '<span class="t2w-group-count' + (n === 5 ? ' is-full' : '') + '" title="Đã xong ' + n + '/5 bước">' + n + '/5</span>' +
      '</div>' +
      '<div class="t2w-group-bar"><i style="width:' + Math.round(n / 5 * 100) + '%"></i></div>' +
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
      renderCoach(st) +
      renderRail(st) +
      '<div class="t2-phase"><span class="t2-phase-k">Giai đoạn 1</span><b>Hiểu bài</b></div>' +
      renderReadStep(st, cur === 'read') +
      renderVocabStep(st, cur === 'vocab') +
      '<div class="t2-phase is-class"><span class="t2-phase-k">Giai đoạn 2</span><b>Dịch câu giúp nhớ</b></div>' +
      renderFixedStep(st, cur === 'fixed') +
      renderWhyStep(st, cur === 'why') +
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
      mood: !cur ? 'cheer' : n >= 3 ? 'excited' : 'happy',
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
        '<div class="t2-coach-prog" aria-label="Đã xong ' + c.n + '/5 bước">' + c.steps.map(function (s) {
          return '<i class="' + (s.done ? 'on' : '') + (s.key === c.cur ? ' cur' : '') + '"></i>';
        }).join('') + '<span>' + c.n + '/5 bước</span></div>' +
      '</div></div>';
  }
  function poke() {
    var st = curStory(); if (!st) return;
    var c = coachState(st);
    _pokes++;
    var tips = c.all ? ['Tuyệt vời! Mai ôn lại phần FIXED một lần nữa cho nhớ lâu nha 🍊', 'Thử nói với chế độ “Chỉ khung xương” xem còn nhớ không nè!'] : LULU[c.cur].tips;
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

  // ① Đọc bài mẫu
  function renderReadStep(st, isCur) {
    var p = sp(st.id);
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-read">' +
      stepHead(1, 'Đọc bài mẫu', '<button type="button" class="t2-pill-toggle' + (prefs.vi ? ' on' : '') + '" data-act="toggle-vi">Hiện tiếng Việt</button>', !!p.read) +
      '<p class="t2-step-desc">Đọc to cả bài 1–2 lần, bấm 🔊 để nghe từng câu. Phần <b>FIXED</b> giữ nguyên với mọi đề trong nhóm; phần <b>WHY</b> thay theo cue card.</p>' +
      '<div class="t2-actions" style="margin-bottom:6px">' +
        '<button type="button" class="t2-secondary" data-act="listen-fixed"><i class="fas fa-headphones"></i> <span>Nghe cả phần FIXED</span></button>' +
      '</div>' +
      '<details class="sp2-read"' + (isCur || state.readOpen ? ' open' : '') + ' data-act-toggle="readOpen">' +
        '<summary>Bài mẫu đầy đủ</summary>' +
        '<div class="sp2-read-tag">FIXED · học thuộc</div>' +
        st.fixed.map(function (sec, si) {
          return '<div class="sp2-sec"><div class="sp2-sec-h">' + (si + 1) + '. ' + esc(sec.h) + '</div>' +
            (sec.note ? '<div class="sp2-sec-note">💡 ' + esc(sec.note) + '</div>' : '') +
            sec.s.map(sentHtml).join('') + '</div>';
        }).join('') +
        '<div class="sp2-divider"><span>▼ TỪ ĐÂY THAY ĐỔI THEO CUE CARD</span></div>' +
        st.why.map(function (w, k) {
          return '<details class="sp2-why"' + (k === state.variant ? ' open' : '') + '><summary><b>Nếu đề hỏi:</b> ' + esc(w.q) + (w.isNew ? ' <span class="sp2-new">mới</span>' : '') + ' <span class="sp2-muted">· ' + esc(w.vi) + '</span></summary>' +
            w.s.map(sentHtml).join('') + '</details>';
        }).join('') +
        '<div class="sp2-sec"><div class="sp2-sec-h">' + (st.fixed.length + 1) + '. Kết luận</div>' + st.conclusion.map(sentHtml).join('') + '</div>' +
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

  // ③ Dịch FIXED
  function renderFixedStep(st, isCur) {
    var all = fixedItems(st), n = countOk(st, all), done = n === all.length;
    var best = sp(st.id).best.fixed;
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-fixed">' +
      stepHead(3, 'Dịch câu Việt → Anh · phần FIXED', '<span class="t2-step-tag">' + all.length + ' câu · ≈ ' + wordsOf(all) + ' từ</span>', done) +
      '<p class="t2-step-desc">Đọc câu tiếng Việt, gõ lại câu tiếng Anh của bài mẫu từng chữ. Gõ sai 1 từ ' + MAX_WORD_ERRORS + ' lần là câu tính sai và phải làm lại (quay lại sau). Bấm vào tên một đoạn để học riêng đoạn đó.</p>' +
      meter(n, all.length) +
      '<div class="t2-wc-row"><span class="t2-step-chip' + (done ? ' ok' : '') + '">Đã thuộc ' + n + '/' + all.length + ' câu</span>' +
        (best != null ? '<span class="t2-step-chip">Lần gần nhất: đúng ngay ' + best + '%</span>' : '') + '</div>' +
      '<div class="sp2-secs">' + st.fixed.map(function (sec, si) {
        var it = fixedItems(st, si), k = countOk(st, it);
        return '<button type="button" class="sp2-secbtn' + (k === it.length ? ' is-ok' : k ? ' is-mid' : '') + '" data-act="run" data-mode="fixed" data-sec="' + si + '">' +
          '<span>' + (si + 1) + '. ' + esc(sec.h) + '</span><em>' + k + '/' + it.length + '</em></button>';
      }).join('') + '</div>' +
      '<div class="t2-actions">' +
        '<button type="button" class="t2-primary is-lg" data-act="run" data-mode="fixed"><i class="fas fa-language"></i> ' +
          (!n ? 'Bắt đầu dịch phần FIXED' : done ? 'Dịch lại cả phần FIXED' : 'Dịch tiếp ' + (all.length - n) + ' câu') + '</button>' +
      '</div>' +
      practiceOpts() +
    '</section>';
  }
  function wordsOf(items) { return items.reduce(function (a, x) { return a + wc(x.en); }, 0); }
  function practiceOpts() {
    return '<div class="t2-opts-row" style="margin-top:8px">' +
      '<button type="button" class="t2-pill-toggle' + (prefs.autoNext ? ' on' : '') + '" data-act="pref" data-pref="autoNext" title="Tự chuyển câu sau khi gõ đúng">Tự chuyển câu</button>' +
      '<button type="button" class="t2-pill-toggle' + (prefs.shuffle ? ' on' : '') + '" data-act="pref" data-pref="shuffle" title="Xáo trộn thứ tự câu">Xáo trộn câu</button>' +
    '</div>';
  }

  // ④ Dịch WHY
  function renderWhyStep(st, isCur) {
    var con = conclusionItems(st), cn = countOk(st, con);
    var nDone = st.why.filter(function (w, k) { return whyDone(st, k); }).length;
    var need = whyNeed(st);
    var done = nDone >= need && cn === con.length;
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-why">' +
      stepHead(4, 'Dịch phần WHY theo đề + Kết luận', '<span class="t2-step-tag' + (done ? ' ok' : '') + '">' + nDone + '/' + st.why.length + ' đề</span>', done) +
      '<p class="t2-step-desc">Mỗi đề chỉ thay đoạn WHY (Reason 1 + Example → Reason 2 + Example), rồi kết luận. Luyện ít nhất <b>' + need + ' đề</b> — mỗi lần luyện gồm phần WHY của đề đó + câu kết luận.</p>' +
      '<div class="sp2-whys">' + st.why.map(function (w, k) {
        var it = whyItems(st, k), n = countOk(st, it), ok = n === it.length;
        return '<div class="sp2-whyrow' + (ok ? ' is-ok' : '') + '">' +
          '<div class="sp2-whyrow-main"><b>' + esc(w.q) + '</b>' + (w.isNew ? ' <span class="sp2-new">mới</span>' : '') + '<span>' + esc(w.vi) + ' · ' + it.length + ' câu</span></div>' +
          '<span class="t2-step-chip' + (ok ? ' ok' : n ? ' mid' : '') + '">' + (ok ? '<i class="fas fa-check"></i> ' : '') + n + '/' + it.length + '</span>' +
          '<button type="button" class="t2-primary is-sm" data-act="run" data-mode="why" data-k="' + k + '"><i class="fas fa-language"></i> ' + (ok ? 'Dịch lại' : 'Luyện') + '</button>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="t2-wc-row" style="margin-top:8px"><span class="t2-step-chip' + (cn === con.length ? ' ok' : '') + '">Kết luận: ' + cn + '/' + con.length + ' câu</span></div>' +
    '</section>';
  }

  // ⑤ Ghép bài & nói thử
  function assembled(st, k) {
    return {
      fixed: st.fixed.map(function (sec) { return { h: sec.h, s: sec.s.map(function (x) { return x[0]; }) }; }),
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
        '<ol>' + a.fixed.map(function (sec) { return '<li>' + esc(sec.h) + '</li>'; }).join('') + '</ol>' +
        '<p><b>WHY — ' + esc(st.why[k].q) + ':</b> ' + esc(st.remember.flexible) + '</p>' +
        '<p><b>Kết luận:</b> So overall, …</p></div>';
    } else {
      body = a.fixed.map(function (sec) {
        return '<p class="sp2-asm-p"><span class="sp2-asm-h">' + esc(sec.h) + '</span>' + sec.s.map(memText).join(' ') + '</p>';
      }).join('') +
        '<p class="sp2-asm-p is-why"><span class="sp2-asm-h">WHY · ' + esc(st.why[k].q) + '</span>' + a.why.map(memText).join(' ') + '</p>' +
        '<p class="sp2-asm-p is-con"><span class="sp2-asm-h">Kết luận</span>' + a.con.map(memText).join(' ') + '</p>';
    }
    return '<section class="t2-step' + (isCur ? ' is-current' : '') + '" id="sp2-step-speak">' +
      stepHead(5, 'Ghép bài & nói thử 2 phút', p.speak ? '<span class="t2-step-tag ok">Đã nói ' + p.speak + ' lần</span>' : '', (p.speak || 0) > 0) +
      '<p class="t2-step-desc">Chọn một đề, đọc lướt bài ghép, rồi bấm <b>Bắt đầu nói</b> và nói to không nhìn bài. Đồng hồ 2 phút như phòng thi — đến khoảng 1:30 nên đang ở phần WHY.</p>' +
      '<label class="sp2-field"><span>Đề (cue card):</span><select id="sp2-variant" class="sp2-select">' +
        st.why.map(function (w, i) { return '<option value="' + i + '"' + (i === k ? ' selected' : '') + '>' + esc(w.q) + ' — ' + esc(w.vi) + '</option>'; }).join('') +
      '</select></label>' +
      '<div class="sp2-budget">' +
        budgetCell('FIXED', fw, '200–230') + budgetCell('WHY', ww, '40–60') + budgetCell('Kết luận', cw, '20–35') +
        '<div class="sp2-budget-cell is-total"><b>' + total + ' từ</b><span>≈ ' + fmt(secs) + ' ở ' + WPM + ' từ/phút</span></div>' +
      '</div>' +
      '<div class="t2-seg sp2-seg" role="tablist" aria-label="Chế độ xem bài">' +
        segBtn('full', 'Cả bài') + segBtn('letters', 'Chữ cái đầu') + segBtn('skeleton', 'Chỉ khung xương') +
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
  function speak(list, onEach) {
    stopTts();
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') { toast('Trình duyệt này không hỗ trợ đọc to', 'warn'); return; }
    var q = { list: list.slice(), i: 0 };
    _ttsQueue = q;
    (function next() {
      if (_ttsQueue !== q || q.i >= q.list.length) { if (_ttsQueue === q) _ttsQueue = null; markSpeaking(null); return; }
      var text = q.list[q.i++];
      if (onEach) onEach(text);
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB'; u.rate = 0.95;
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
      if (!was) { refreshStory(); celebrate('Bước 5 xong! Cậu đã nói thử trọn bài rồi đó 🎤'); return; }
    }
    if (natural && window.playOk) window.playOk();
    paintTimer();
  }
  function stopAll() {
    stopTts();
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
    else if (mode === 'fixed') {
      items = fixedItems(st, opts.sec != null ? opts.sec : null);
      label = opts.sec != null ? '③ FIXED · ' + st.fixed[opts.sec].h : '③ Dịch FIXED';
      runKey = opts.sec != null ? null : 'fixed';
    } else if (mode === 'why') {
      items = whyItems(st, opts.k).concat(conclusionItems(st));
      label = '④ WHY · ' + st.why[opts.k].q; runKey = 'why' + opts.k;
      state.variant = opts.k;
    } else if (mode === 'retry') { items = opts.items; label = '🔁 Ôn câu sai'; runKey = null; }
    if (!items || !items.length) return;
    // A run over a part the student already partly knows: only the rest, unless
    // all of it is known (then it's a full review).
    if (!opts.all && mode !== 'retry' && opts.sec == null && mode !== 'why') {
      var ok = sp(st.id).ok;
      var todo = items.filter(function (x) { return !ok[x.key]; });
      if (todo.length && todo.length < items.length) items = todo;
    }
    items = items.map(function (x) { return Object.assign({}, x); });
    if (prefs.shuffle) shuffle(items);
    state.run = {
      mode: mode, label: label, runKey: runKey, sec: opts.sec, k: opts.k,
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
    if (ok) { sp(st.id).ok[q.key] = 1; saveProg(); delete r.wrong[q.key]; }
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
        go('story', el.dataset.id, el.dataset.variant != null ? { variant: +el.dataset.variant, focusStep: 'why' } : {});
        break;
      case 'home': go('home', null); break;
      case 'upgrade': upgrade(); break;
      case 'copy-link': copyLink(); break;
      case 'poke': poke(); break;
      case 'scroll': scrollToStep(el.dataset.step); break;
      case 'toggle-vi': prefs.vi = !prefs.vi; savePrefs(); state.readOpen = true; refreshStory(); break;
      case 'say': speak([el.dataset.text], markSpeaking); break;
      case 'listen-fixed':
        state.readOpen = true;
        var det = document.querySelector('.sp2-read'); if (det) det.open = true;
        speak(fixedItems(st).map(function (x) { return x.en; }), markSpeaking);
        break;
      case 'mark-read': sp(st.id).read = 1; saveProg(); refreshStory(); celebrate('Bước 1 xong! Giờ học từ vựng ăn điểm nha 📚'); setTimeout(function () { scrollToStep('vocab'); }, 400); break;
      case 'run':
        startRun(el.dataset.mode, {
          sec: el.dataset.sec != null ? +el.dataset.sec : null,
          k: el.dataset.k != null ? +el.dataset.k : null
        });
        break;
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
        if (r.mode === 'retry') go('story', state.storyId, { noPush: true, focusStep: 'fixed' });
        else startRun(r.mode, { sec: r.sec, k: r.k, all: true });
        break;
      case 'back-story': go('story', state.storyId, { noPush: true, focusStep: stepOfRun() }); break;
    }
  });
  function stepOfRun() {
    var r = state.run; if (!r) return null;
    return r.mode === 'vocab' ? 'vocab' : r.mode === 'why' ? 'why' : 'fixed';
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
    if (state.view === 'story' && new URLSearchParams(location.search).get('variant') != null) setTimeout(function () { scrollToStep('why'); }, 80);
  }
  boot();

  // Expose for tests / debugging.
  window.SP2 = { state: state, stepStatus: stepStatus, finderResults: finderResults };
})();
