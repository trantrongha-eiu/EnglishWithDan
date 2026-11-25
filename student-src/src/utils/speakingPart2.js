// Speaking Part 2 · 7 câu chuyện gốc (/app/speaking-part2): the rules of the
// old js/speaking-part2.js without the screen. Mastery must match the
// server's (backend/services/speakingPart2Service.js masteryOf), which ticks
// a teacher's `speaking_part2` homework.
import { apiFetch } from './api';

export const MAX_WORD_ERRORS = 3;
export const MAX_ASKS = 3;          // "Hỏi Lulu" asks per question (graded, so capped)
export const REQUEUE_GAP = 3;
export const MAX_REQUEUES = 2;
export const WPM = 130;             // band 6.0–7.0 speaking speed (120–140)
export const SPEAK_SECONDS = 180;
export const PREP_SECONDS = 60;
export const PASS = 70;             // frame unlock + "đạt" (same as the server)
export const SHADOW_PASS = 70;      // a sentence's nhại score that counts

export const CAT = { col: 'Collocation', idiom: 'Idiom', adj: 'Adjective' };
export const CAT_HEAD = {
  col: ['COLLOCATIONS', 'kết hợp từ tự nhiên, dùng được nhiều nhất'],
  idiom: ['IDIOMS', 'tối đa 1–2 idioms / bài nói'],
  adj: ['ADJECTIVES', 'thay cho good / nice / interesting'],
};
export const STEPS = [
  { key: 'read', label: 'Đọc bài mẫu' },
  { key: 'vocab', label: 'Từ vựng' },
  { key: 'learn', label: 'Học thuộc 7 khung' },
  { key: 'speak', label: 'Nói thử' },
];
export const FLOW = [
  { phase: 'Hiểu bài', cls: 'prep', steps: [['1', 'fa-book-open', 'Đọc bài mẫu theo 7 khung'], ['2', 'fa-star', 'Từ vựng ăn điểm']] },
  { phase: 'Học thuộc', cls: 'class', steps: [['3', 'fa-microphone-alt', 'Nhại & dịch từng khung (≥70%)']] },
  { phase: 'Nói', cls: 'home', steps: [['4', 'fa-stopwatch', 'Ghép bài & nói 2 phút']] },
];
export const LULU = {
  read: {
    say: 'Bước 1: đọc to bài mẫu theo 7 khung nói — bấm 🔊 để nghe từng câu. Đọc xong thì bấm “Đã đọc xong”.',
    tips: ['Đổi tên, địa điểm, con số thành chi tiết thật của cậu — câu chuyện thật nghe tự nhiên hơn nhiều!', 'Khung 1–5 giữ nguyên với mọi đề trong nhóm, chỉ khung 6 (WHY) đổi theo cue card thôi.'],
  },
  vocab: {
    say: 'Bước 2: học các cụm ăn điểm của nhóm này. Mỗi bài nói chỉ cần chèn 3–4 collocations và tối đa 1–2 idioms thôi!',
    tips: ['Idiom dùng sai ngữ cảnh gây hại nhiều hơn là không dùng đó nha.', 'Các ví dụ đều gắn với câu chuyện gốc — chèn thẳng vào bài nói được luôn!'],
  },
  learn: {
    say: 'Bước 3: học thuộc từng khung — 🎙️ nhại theo từng câu để máy chấm phát âm, rồi ⌨️ dịch Việt → Anh. Khung nào đạt 70% thì mở khung tiếp theo!',
    tips: ['Nhại: nghe câu mẫu rồi bấm “Nói theo” — từ xanh là máy nghe đúng, từ đỏ cần luyện thêm.', 'Mỗi câu có 2 điểm: nhại đạt 70% và dịch đúng. Cả bài đạt 70% là bài tập được tính đạt nha!', 'Bật “Che câu” khi nhại để tự nói từ trí nhớ — thuộc nhanh hơn nhiều!'],
  },
  speak: {
    say: 'Bước 4: ghép bài và nói thử trong 2 phút. Nhớ đến được khung WHY trước khi hết giờ nha!',
    tips: ['Đến khoảng 1:15 mà chưa tới khung WHY thì bỏ bớt câu mô tả đi — phần WHY mới là phần trả lời đúng đề.', 'Thử chế độ “Chữ cái đầu” rồi “Chỉ 7 khung” để tự kiểm tra trí nhớ.'],
  },
};
export const DONE_TIPS = ['Tuyệt vời! Mai nhại lại khung 1–5 một lần nữa cho nhớ lâu nha 🍊', 'Thử nói với chế độ “Chỉ 7 khung” xem còn nhớ không nè!'];

// ── tiny helpers ──────────────────────────────────────────────────────
export function wc(s) { const t = String(s || '').trim(); return t ? t.split(/\s+/).length : 0; }
export function fmt(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const reduceMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
// Word targets + "be at WHY by" second, from the framework (data howTo.targets)
export function targets(data) {
  const t = data?.howTo?.targets || {};
  return { fixed: t.fixed || '140–160', why: t.why || '50–70', con: t.con || '20–35', total: t.total || '210–260', whyBy: t.whyBy || 75 };
}
// [before, answer, after] of an example sentence around its answer (null: not in it)
export function splitAt(ex, ans) {
  const i = ex.indexOf(ans);
  return i < 0 ? null : [ex.slice(0, i), ans, ex.slice(i + ans.length)];
}
// "first letter of each word", punctuation kept: "The person I'd…" → "T p I'…"
export function firstLetters(s) {
  return s.split(/\s+/).map((w) => {
    const m = w.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}])[\p{L}\p{N}'’-]*([^\p{L}\p{N}]*)$/u);
    return m ? m[1] + m[2] + m[3] : w;
  }).join(' ');
}
export const maskWords = (text) => String(text).split(/\s+/)
  .map((w) => w.replace(/([A-Za-z0-9])([A-Za-z0-9'’]*)/, (_, f, r) => f + r.replace(/[A-Za-z0-9]/g, '_'))).join(' ');

// ── preferences (this device) ─────────────────────────────────────────
const PREF_KEY = 'sp2_prefs';
export function loadPrefs() {
  let p;
  try { p = JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {}; } catch { p = {}; }
  if (p.vi == null) p.vi = true;
  return p;
}
export function savePrefs(p) { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* storage off */ } }

// ── progress: localStorage per user, synced to the server ─────────────
//   { [storyId]: { read, ok: { key: 1 }, shadow: { key: pct }, speak, best: { runKey: pct } }, _v }
//   keys: v<i> vocab · f<sec>.<j> FIXED · w<k>.<j> WHY variant · c<j> kết luận
//   ok = typed right once (dịch) · shadow = best nhại score of a sentence
//   PUT /speaking-part2/progress/:story is what ticks the homework.
export function createProgress(userId) {
  const key = 'sp2_progress:' + String(userId || 'guest');
  let all = null;
  let version = 0;
  let locked = false;
  const dirty = {};
  let syncT = null;

  function prog() {
    if (all) return all;
    try { all = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { all = {}; }
    return all;
  }
  function sp(id) {
    const p = prog();
    if (!p[id]) p[id] = { read: 0, ok: {}, shadow: {}, speak: 0, best: {} };
    const s = p[id];
    if (!s.ok) s.ok = {};
    if (!s.shadow) s.shadow = {};
    if (!s.best) s.best = {};
    return s;
  }
  function writeLocal() { try { localStorage.setItem(key, JSON.stringify(prog())); } catch { /* storage off */ } }
  // shadow as [key, score] pairs: the server's request sanitizer drops dotted
  // object keys ("f0.1"). v = content version: the server only takes FIXED
  // keys (f<sec>.<j>) from the current one.
  function payloadOf(id) {
    const p = sp(id);
    return { v: version, read: !!p.read, ok: Object.keys(p.ok), shadow: Object.keys(p.shadow).map((k) => [k, p.shadow[k]]), speak: p.speak || 0, best: p.best || {} };
  }
  function flush(keepalive) {
    clearTimeout(syncT);
    Object.keys(dirty).forEach((id) => {
      delete dirty[id];
      apiFetch('/speaking-part2/progress/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(payloadOf(id)), keepalive: !!keepalive })
        .catch(() => { dirty[id] = 1; }); // retried on the next change / page hide
    });
  }
  function save(id) {
    writeLocal();
    if (!id || locked) return;
    dirty[id] = 1;
    clearTimeout(syncT);
    syncT = setTimeout(() => flush(false), 1200);
  }
  const pending = () => Object.keys(dirty).length > 0;
  return {
    sp, save, flush, pending,
    setContent(ver, isLocked) { version = ver || 0; locked = !!isLocked; },
    // The FIXED sentences changed (version bump): this browser's FIXED keys
    // point at the old sentences, drop them. The server moved its copy onto
    // the new sentences (upgradeKeys) and merge() brings those back.
    upgradeLocal() {
      const p = prog();
      if (p._v === version) return;
      Object.keys(p).forEach((id) => {
        const s = p[id];
        if (!s || typeof s !== 'object') return;
        ['ok', 'shadow'].forEach((f) => {
          Object.keys(s[f] || {}).forEach((k) => { if (/^f\d/.test(k)) delete s[f][k]; });
        });
      });
      p._v = version;
      writeLocal();
    },
    // Server progress → this browser (union; nothing is ever lost), then send
    // up whatever this browser had that the server didn't (made offline).
    merge(server, stories) {
      const p = prog();
      stories.forEach((st) => {
        const srv = server[st.id];
        const loc = sp(st.id);
        const before = JSON.stringify(payloadOf(st.id));
        if (srv) {
          (srv.ok || []).forEach((k) => { loc.ok[k] = 1; });
          if (srv.read) loc.read = 1;
          loc.speak = Math.max(loc.speak || 0, srv.speak || 0);
          Object.keys(srv.best || {}).forEach((k) => { if (loc.best[k] == null) loc.best[k] = srv.best[k]; });
          Object.keys(srv.shadow || {}).forEach((k) => { loc.shadow[k] = Math.max(loc.shadow[k] || 0, Number(srv.shadow[k]) || 0); });
        }
        const srvSh = srv?.shadow || {};
        const localHasMore = Object.keys(loc.ok).length > (srv?.ok || []).length
          || (loc.read && !srv?.read) || (loc.speak || 0) > (srv?.speak || 0)
          || Object.keys(loc.shadow).some((k) => (loc.shadow[k] || 0) > (Number(srvSh[k]) || 0));
        if (localHasMore) dirty[st.id] = 1;
        if (!srv && before === JSON.stringify(payloadOf(st.id)) && !localHasMore) delete p[st.id];
      });
      writeLocal();
      if (pending()) flush(false);
    },
  };
}

// ── 7 khung nói ───────────────────────────────────────────────────────
//   [{ kind: 'fixed'|'why'|'con', h, parts: [{ h, note, items }], items, i }]
//   Same frames as the server's framesOf(). WHY has no items of its own:
//   they come from the chosen cue-card variant (whyItems).
export function conclusionItems(st) {
  return st.conclusion.map((x, j) => ({ key: 'c' + j, en: x[0], vi: x[1], ctx: 'Khung 7 · Kết luận' }));
}
export function whyItems(st, k) {
  const w = st.why[k];
  return w.s.map((x, j) => ({ key: 'w' + k + '.' + j, en: x[0], vi: x[1], ctx: 'Khung 6 · WHY · ' + w.q }));
}
const FRAMES = new WeakMap();
export function framesOf(st) {
  if (FRAMES.has(st)) return FRAMES.get(st);
  const frames = [];
  st.fixed.forEach((sec, si) => {
    const items = sec.s.map((x, j) => ({ key: 'f' + si + '.' + j, en: x[0], vi: x[1] }));
    const prev = frames[frames.length - 1];
    const part = { h: sec.h, note: sec.note, items };
    if (sec.join && prev) { prev.h = sec.join; prev.parts.push(part); } else frames.push({ kind: 'fixed', h: sec.h, parts: [part] });
  });
  frames.push({ kind: 'why', h: 'WHY — trả lời theo đề', parts: [] });
  frames.push({ kind: 'con', h: 'Kết luận', parts: [{ h: 'Kết luận', items: conclusionItems(st) }] });
  frames.forEach((f, i) => {
    f.i = i;
    f.items = f.parts.reduce((a, p) => a.concat(p.items), []);
    f.items.forEach((it) => { it.ctx = 'Khung ' + (i + 1) + ' · ' + f.h; });
  });
  FRAMES.set(st, frames);
  return frames;
}
export function frameItems(st, fi, k) {
  const f = framesOf(st)[fi];
  return f.kind === 'why' ? whyItems(st, k) : f.items;
}
export function fixedItems(st) {
  return framesOf(st).filter((f) => f.kind === 'fixed').reduce((a, f) => a.concat(f.items), []);
}
export function vocabItems(st) {
  return st.vocab.map((v, i) => ({ key: 'v' + i, en: v[4], vi: v[2], ctx: CAT[v[0]], vocab: v }));
}
export const countOk = (p, items) => items.filter((it) => p.ok[it.key]).length;
export const frameKindTag = (f) => (f.kind === 'fixed' ? 'FIXED' : f.kind === 'why' ? 'ĐỔI THEO ĐỀ' : 'KẾT');

// ── mastery (same rules as the server's masteryOf) ────────────────────
const shOk = (p, key) => (p.shadow[key] || 0) >= SHADOW_PASS;
export function pointsOf(p, items) {
  let sh = 0; let tr = 0;
  items.forEach((it) => { if (shOk(p, it.key)) sh++; if (p.ok[it.key]) tr++; });
  return { sh, tr, n: items.length, got: sh + tr, of: items.length * 2 };
}
export const pctOf = (x) => (x.of ? Math.round((x.got / x.of) * 100) : 0);
export const whyNeed = (st) => Math.min(2, st.why.length);
export const variantPct = (st, p, k) => pctOf(pointsOf(p, whyItems(st, k)));
// { pct, frames: [{ pct, open }] }: a frame is open once every frame before it is >= PASS
export function mastery(st, p) {
  let got = 0; let of = 0; let open = true;
  const frames = framesOf(st).map((f) => {
    let x;
    if (f.kind === 'why') {
      x = st.why.map((w, k) => pointsOf(p, whyItems(st, k)))
        .sort((a, b) => b.got / b.of - a.got / a.of)
        .slice(0, whyNeed(st))
        .reduce((a, y) => ({ got: a.got + y.got, of: a.of + y.of }), { got: 0, of: 0 });
    } else x = pointsOf(p, f.items);
    got += x.got; of += x.of;
    const row = { pct: pctOf(x), open };
    open = open && row.pct >= PASS;
    return row;
  });
  return { pct: of ? Math.round((got / of) * 100) : 0, frames };
}
export function curFrame(m) {
  for (let i = 0; i < m.frames.length; i++) if (m.frames[i].open && m.frames[i].pct < PASS) return i;
  return -1;
}

// ── step status ───────────────────────────────────────────────────────
export function stepStatus(st, p, locked) {
  if (locked || !st.fixed) return STEPS.map((x) => ({ key: x.key, label: x.label, done: false }));
  const voc = vocabItems(st); const m = mastery(st, p);
  return [
    { key: 'read', label: 'Đọc bài mẫu', done: !!p.read },
    { key: 'vocab', label: 'Từ vựng', done: countOk(p, voc) === voc.length, n: countOk(p, voc), of: voc.length },
    { key: 'learn', label: 'Học thuộc 7 khung', done: m.pct >= PASS, n: m.pct, of: 100 },
    { key: 'speak', label: 'Nói thử', done: (p.speak || 0) > 0 },
  ];
}
export function currentStep(st, p, locked) {
  const s = stepStatus(st, p, locked);
  for (const x of s) if (!x.done) return x.key;
  return null;
}
export function storyState(st, p, locked) {
  const s = stepStatus(st, p, locked);
  const n = s.filter((x) => x.done).length;
  if (n === s.length) return 'done';
  if (n || Object.keys(p.ok).length || Object.keys(p.shadow).length || p.read) return 'doing';
  return 'todo';
}
export function nextStory(stories, spOf, locked) {
  for (const st of stories) if (storyState(st, spOf(st.id), locked) === 'doing') return st;
  for (const st of stories) if (storyState(st, spOf(st.id), locked) === 'todo') return st;
  return null;
}
export function coachState(st, p) {
  const steps = stepStatus(st, p, false);
  const n = steps.filter((x) => x.done).length;
  const cur = currentStep(st, p, false);
  return {
    steps, n, cur, all: !cur,
    mood: !cur ? 'cheer' : n >= 2 ? 'excited' : 'happy',
    text: !cur ? 'Cậu đã thuộc câu chuyện này rồi! Thử nói lại với một đề khác trong nhóm, hoặc sang câu chuyện tiếp theo nha 🥳' : LULU[cur].say,
  };
}

// ── cue card → which story + which WHY variant ────────────────────────
// (from "Đề bài dùng được", the WHY rows and section 08's "Mượn sang được")
const STOP = { a: 1, an: 1, the: 1, you: 1, your: 1, describe: 1, of: 1, to: 1, in: 1, on: 1, that: 1, who: 1, which: 1, when: 1, time: 1, something: 1, someone: 1, is: 1, are: 1, did: 1, do: 1, have: 1, was: 1, 'một': 1 };
const FINDER = new WeakMap();
function finderIndex(stories) {
  if (FINDER.has(stories)) return FINDER.get(stories);
  const rows = [];
  stories.forEach((st) => {
    st.why.forEach((w, k) => rows.push({ st, k, label: w.q, sub: w.vi, text: (w.q + ' ' + w.vi).toLowerCase() }));
    st.remember.topics.forEach((t) => rows.push({ st, k: null, label: t, sub: 'Đề bài dùng được', text: t.toLowerCase() }));
    rows.push({ st, k: null, label: st.borrow, sub: 'Mượn sang được', text: st.borrow.toLowerCase() });
  });
  FINDER.set(stories, rows);
  return rows;
}
export function finderResults(stories, q) {
  const toks = q.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').split(/\s+/).filter((t) => t.length > 1 && !STOP[t]);
  if (!toks.length) return [];
  const seen = {};
  return finderIndex(stories).map((r) => {
    let sc = 0;
    toks.forEach((t) => {
      if (r.text.indexOf(t) >= 0) sc += t.length > 3 ? 2 : 1;
      else if (t.length > 4 && r.text.indexOf(t.slice(0, -1)) >= 0) sc += 1;
    });
    return { r, sc };
  }).filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc || (a.r.k == null) - (b.r.k == null))
    .filter((x) => { const key = x.r.st.id + ':' + x.r.label; if (seen[key]) return false; seen[key] = 1; return true; })
    .slice(0, 6).map((x) => x.r);
}

// ── ④ Ghép bài ────────────────────────────────────────────────────────
export function assembled(st, k) {
  return {
    fixed: framesOf(st).filter((f) => f.kind === 'fixed').map((f) => ({ h: f.h, s: f.items.map((x) => x.en) })),
    why: st.why[k].s.map((x) => x[0]),
    con: st.conclusion.map((x) => x[0]),
  };
}
// noUnder: the framework's own WHY samples are often shorter than the 50–70
// words it budgets (students add their own example), only flag a long one.
export function budgetClass(n, range, noUnder) {
  const lo = parseInt(range, 10); const hi = parseInt(range.split('–')[1], 10);
  return n > hi + 10 ? ' is-over' : !noUnder && n < lo - 10 ? ' is-under' : '';
}

// ── nhại scoring: LCS word diff, same as Shadowing ────────────────────
// British spellings vs. what en-US recognition writes back: equal.
const SPELLING = {
  ok: 'okay', centre: 'center', realise: 'realize', realised: 'realized', programme: 'program',
  practise: 'practice', practises: 'practices', favourite: 'favorite', colour: 'color', neighbour: 'neighbor',
  theatre: 'theater', behaviour: 'behavior', travelling: 'traveling', organise: 'organize', organised: 'organized',
  recognise: 'recognize', apologise: 'apologize', grey: 'gray', mum: 'mom',
};
export function normWord(w) {
  const n = String(w).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, '');
  return SPELLING[n] || n;
}
// Hyphenated words are scored as their parts (recognition splits them)
export const tokens = (text) => String(text || '').replace(/[-–—]/g, ' ').split(/\s+/).filter((w) => normWord(w) !== '');
export function diffWords(refWords, saidWords) {
  const a = refWords.map(normWord); const b = saidWords.map(normWord);
  const n = a.length; const m = b.length;
  const dp = [];
  for (let i = 0; i <= n; i++) dp.push(new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const refHit = {};
  let i = n; let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { refHit[i - 1] = 1; i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
  }
  return refHit;
}
export const scoreClass = (pct) => (pct >= 85 ? 'good' : pct >= 60 ? 'mid' : 'low');
// { words: [{ w, hit }], hits, pct } of a take against its sentence
export function gradeTake(sentence, said) {
  const ref = tokens(sentence); const hit = diffWords(ref, tokens(said));
  const hits = Object.keys(hit).length;
  return { words: ref.map((w, k) => ({ w, hit: !!hit[k] })), hits, total: ref.length, pct: ref.length ? Math.round((hits / ref.length) * 100) : 0 };
}

// ── "📄 Xem full bài mẫu" box tone ───────────────────────────────────
export function boxTone(label) {
  return /GHI NHỚ/i.test(label) ? 'goal' : /Lưu ý/i.test(label) ? 'warn' : /Khung xương/i.test(label) ? 'note' : 'tip';
}
