// task2-template.html — Task 2 Templates: one short practice path per essay type.
//
// Content: the full template of each type and level — exactly the lines the
// "Xem đầy đủ" pop-up shows (js/task2-generic-templates.js, copied from the
// Template Bank book, Band 6+ and Band 7+ boxes). Nothing is reworded; every
// exercise drills those lines.
//
//   ① Khung bài   — paragraph structure + put each paragraph's lines in order
//   ② Đọc & nghe  — read every line with its meaning, key words, audio
//   ③ Luyện đoạn  — per paragraph: build from chunks → fill fading blanks → recall from Vietnamese
//   ④ Ghép cả bài — write each paragraph (band 7+: the whole essay, timed) from memory
//   ⑤ Áp dụng     — write a real essay with the frames (live checklist), then compare with the model essay
//
// "Hỏi Lulu" hints (js/shared/playful.js AskLulu) in every exercise except the
// mock test. A line answered with Lulu's help still counts as done, but comes
// back once at the end of the round to be recalled without help.
// "Luyện câu yếu" drills the lines the student keeps forgetting (mastery < 3),
// also offered right after a ④ run below the pass mark.
//
// Band 6+ gets more help (two fade levels, letter-by-letter recall, one
// paragraph at a time in ④); Band 7+ gets less (one fade level, free typing,
// whole essay in ④ with a timer). Progress is saved to the account
// (/api/task2template/progress, no TTL); finished runs are also logged to
// /api/task2template/save so history and homework completion keep working.
// Spaced review ("Ôn nhanh") becomes due 1/3/7/14/30 days after ④.

const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';

// ── XP badge (local, as before) ─────────────────────────────────
function _safeParse(json, fallback) { if (json == null) return fallback; try { return JSON.parse(json); } catch { return fallback; } }
function loadXPFromStorage() {
  const stored = _safeParse(localStorage.getItem('t2_progress'), { xp: 0, streak: 0 });
  const xp = document.getElementById('header-xp'), st = document.getElementById('header-streak');
  if (xp) xp.textContent = stored.xp || 0;
  if (st) st.textContent = stored.streak || 0;
}
function updateXPStorage(earned) {
  const stored = _safeParse(localStorage.getItem('t2_progress'), { xp: 0, streak: 0 });
  stored.xp = (stored.xp || 0) + earned;
  try { localStorage.setItem('t2_progress', JSON.stringify(stored)); } catch {}
  loadXPFromStorage();
}

// ── Template data ───────────────────────────────────────────────
// Colours from the playful palette (css/playful.css) — the hero and the
// active tab take the colour of the open essay type.
const TYPE_META = {
  type01: { label: 'Type 01', sub: 'Adv & Disadv',    icon: 'fa-scale-balanced',     color: '#4d63d8', desc: 'Phân tích ưu điểm và nhược điểm của một xu hướng hiện đại.' },
  type02: { label: 'Type 02', sub: 'Discuss Both',    icon: 'fa-comments',           color: '#7d62c9', desc: 'Thảo luận hai quan điểm đối lập và đưa ra ý kiến cá nhân.' },
  type03: { label: 'Type 03', sub: 'Cause–Solution',  icon: 'fa-lightbulb',          color: '#2a9d8f', desc: 'Phân tích nguyên nhân của một vấn đề và đề xuất giải pháp.' },
  type04: { label: 'Type 04', sub: 'Effect–Solution', icon: 'fa-gears',              color: '#cf5f57', desc: 'Phân tích tác động của vấn đề và đề xuất giải pháp khắc phục.' },
  type05: { label: 'Type 05', sub: 'Cause–Effect',    icon: 'fa-arrow-trend-up',     color: '#e07a3a', desc: 'Phân tích nguyên nhân và hậu quả của một hiện tượng xã hội.' },
  type06: { label: 'Type 06', sub: 'Agree/Disagree',  icon: 'fa-check-double',       color: '#2f9e5b', desc: 'Bày tỏ quan điểm đồng ý hoặc không đồng ý và bảo vệ lập trường.' },
  type07: { label: 'Type 07', sub: 'Pos/Neg Dev',     icon: 'fa-circle-half-stroke', color: '#d4689a', desc: 'Đánh giá xem một xu hướng là phát triển tích cực hay tiêu cực.' },
};
let TPL_TYPES = [];  // [{id, label, sub, name}]
let TPL_DATA  = {};  // typeId -> { name, paras: [{si, title, sentences:[…]}] }

let _type  = 'type01';
let _level = 'band6';
let _progress = {};  // typeId -> progress row for _level (see backend Task2TemplateProgress)
let _view = 'overview'; // overview | warmup | read | drill | assemble | apply | review | fix | exam
let _run = null;        // state of the open activity
let _showVi = true;
let _homework = []; // class homework of type task2_template: [{title, className, deadline, typeId, level, completed}]

const STEPS = [
  { key: 'warmup',   num: '①', icon: 'fa-sitemap',     title: 'Khung bài',      desc: 'Mỗi đoạn có mấy câu, câu nào làm nhiệm vụ gì — rồi tự sắp xếp các câu theo đúng thứ tự.' },
  { key: 'read',     num: '②', icon: 'fa-headphones',  title: 'Đọc & nghe',     desc: 'Đọc từng câu của bản đầy đủ kèm nghĩa tiếng Việt, nghe phát âm, chú ý các từ khoá.' },
  { key: 'drill',    num: '③', icon: 'fa-layer-group', title: 'Luyện từng đoạn', desc: 'Mỗi đoạn 3 vòng: ghép cụm → điền chữ bị ẩn dần → nhớ lại cả câu từ tiếng Việt.' },
  { key: 'assemble', num: '④', icon: 'fa-pen-nib',     title: 'Ghép cả bài',    desc: 'Chỉ nhìn khung, viết lại cả đoạn từ trí nhớ. Máy so từng chữ với bản đầy đủ.' },
  { key: 'apply',    num: '⑤', icon: 'fa-flag-checkered', title: 'Áp dụng đề thật', desc: 'Viết bài cho một đề thật bằng các khung câu — Lulu đánh dấu khung nào bạn đã dùng.' },
];
const STEP_KEYS = STEPS.map(s => s.key);
const DRILL_STAGES = ['Ghép cụm', 'Điền dần', 'Nhớ lại'];
// "Thuộc" (memorised) = a sentence recalled with >= SENT_KNOWN % of its words
// right. ④ and the mock test pass at >= ASSEMBLE_PASS % of the template's
// sentences memorised — the same bar the class homework tick uses
// (backend resourceCompletionService.checkTask2Templates).
const SENT_KNOWN = 80;
const ASSEMBLE_PASS = 70;
const RECALL_PASS_B7 = 90; // % words right for a free-typed sentence to count in ③ (Band 7+)
const ASM_HINTS = { band6: 6, band7: 3 }; // "Hỏi Lulu" per paragraph in ④
const RUN_HINTS = 3;                       // per sentence in Ôn nhanh / Luyện câu yếu
const FIX_MAX = 8;                         // sentences per "Luyện câu yếu" run

// ── Small helpers ──────────────────────────────────────────────
const esc  = s => (window.escHtml ? window.escHtml(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]));
const escA = s => (window.escAttr ? window.escAttr(s) : esc(s));
const isB7 = () => _level === 'band7';
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// Shuffle that never returns the original order (when there's more than one item).
function shuffleNew(arr, same = (x, y) => x === y) {
  if (arr.length < 2) return arr.slice();
  for (let k = 0; k < 8; k++) {
    const s = shuffle(arr);
    if (s.some((x, i) => !same(x, arr[i]))) return s;
  }
  return arr.slice(1).concat(arr[0]);
}
function fmtMMSS(secs) { secs = Math.max(0, Math.floor(secs)); return String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0'); }

// Sentence tokens: "(placeholder)," counts as one fixed token the student
// never has to type; everything else is a word ("/" between two options too).
function tokenize(sentence) {
  return (String(sentence).match(/\([^()]*\)\S*|\S+/g) || []).map(text => {
    if (text.startsWith('(')) return { text, ph: true, lead: '', core: text, trail: '' };
    const m = text.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
    const core = m ? m[2] : text;
    return { text, ph: false, lead: m ? m[1] : '', core: core || text, trail: m ? m[3] : '' };
  });
}
function normWord(w) {
  return String(w || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[–—]/g, '-')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}
const stripPh = s => String(s || '').replace(/\([^()]*\)/g, ' ');
function countWords(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
function firstWords(s, n) { return stripPh(s.en).trim().split(/\s+/).filter(w => w !== '/').slice(0, n).join(' ').replace(/[,;:.]+$/, ''); }

const STOPWORDS = new Set('a an the of in on at to for with by from and or but so as is are was were be been being it its this that these those they them their there which who can could may might will would should has have had do does did not than more most very also such into over some many much one two'.split(' '));

// Sentence role inside its paragraph — shown in ①/④/⑤ as the cue for each
// line. The book's own labels (Mở đề / Paraphrase đề / Nêu luận điểm) win.
function roleOf(text, si, secCount) {
  const s = String(text).trim();
  const intro = si === 0, concl = si === secCount - 1;
  if (/^(In conclusion|To conclude|In summary|To sum up)\b/i.test(s)) return 'Tóm lại';
  if (/^(This essay|The following (discussion|essay))\b/i.test(s)) return 'Hướng bài';
  if (concl) return 'Chốt ý';
  if (intro) {
    if (/\b(I (completely |strongly |firmly |partly |fully )?(agree|disagree|believe)|In my (view|opinion)|I contend|I would argue|I firmly)\b/i.test(s)) return 'Nêu quan điểm';
    if (/^(In recent years|In recent decades|Recently|Nowadays|In today|In (the )?contemporary|In some|The issue of|With the|As society|It is (undeniable|widely)|There (has been|is) (an ongoing|a growing|considerable))/i.test(s)) return 'Mở đề';
    return 'Bối cảnh';
  }
  if (/^(This is (mainly |primarily |largely |partly )?(because|due)|This can be attributed|This stems|The reason)/i.test(s)) return 'Giải thích';
  if (/^(As a result|Consequently|Therefore|Thus|Hence|This (leads|means|can lead))\b/i.test(s)) return 'Kết quả';
  if (/^(For (example|instance)|To illustrate|A (clear|good|prime) (illustration|example)|Research|Recent studies|Studies)\b/i.test(s)) return 'Ví dụ / dẫn chứng';
  if (/^(However|On the other hand|Despite|Admittedly|While some|Nevertheless|Although|Conversely|That said|Critics)\b/i.test(s)) return 'Chuyển ý / nhượng bộ';
  if (/^(Furthermore|Moreover|In addition|Additionally|Another|Besides|Secondly|Finally|Also|Ultimately|When considered)\b/i.test(s)) return 'Ý bổ sung';
  return 'Câu chủ đề';
}

// Recommended size of each paragraph in a real essay (not the template).
function paraTarget(si, secCount) {
  if (si === 0) return { sent: '2–3 câu', words: '40–60 chữ', lo: 40, hi: 60 };
  if (si === secCount - 1) return { sent: '1–3 câu', words: '30–50 chữ', lo: 30, hi: 50 };
  return { sent: '4–6 câu', words: '80–110 chữ', lo: 80, hi: 110 };
}

// ── Full template → paragraphs of sentences ────────────────────
// Book labels: role names (kept as the role), or options the student picks
// one of when writing ("Đồng ý một phần", "Nếu bài của bạn là NEGATIVE", …).
// Options of the same slot share an `alt` group: they may swap places in ①
// and count as one frame in ⑤.
const ROLE_LABELS = new Set(['Mở đề', 'Paraphrase đề', 'Nêu luận điểm']);
function _optName(label) {
  if (/NEGATIVE/i.test(label)) return 'Bài NEGATIVE';
  if (/một phần/i.test(label)) return 'Đồng ý một phần';
  if (/hoàn toàn/i.test(label)) return 'Đồng ý / không đồng ý hoàn toàn';
  if (/7\.5/.test(label)) return 'Band 7.5+ · tuỳ chọn';
  return label;
}
function _anchorsOf(en) {
  // Key words: the (up to 3) longest content words — underlined in ② and
  // hidden first in ③.
  const words = tokenize(en).filter(t => !t.ph).map(t => normWord(t.core)).filter(w => w.length >= 5 && !STOPWORDS.has(w));
  const uniq = [...new Set(words)];
  return new Set(uniq.map((w, i) => [w, i]).sort((a, b) => b[0].length - a[0].length || a[1] - b[1]).slice(0, 3).map(x => x[0]));
}
function buildType(type) {
  const n = type.sections.length;
  let altSeq = 0;
  const paras = type.sections.map((sec, si) => {
    const sentences = [];
    (sec.lines || []).forEach((ln, ii) => {
      let en = String(ln.en || '').replace(/\s+/g, ' ').trim();
      let vi = String(ln.vi || '').replace(/^→\s*/, '').trim();
      let label = String(ln.label || '').trim();
      // "Partially agree: In conclusion, …" — the option name is written into the line.
      const pre = en.match(/^Partially agree:\s*/i);
      if (pre) { en = en.slice(pre[0].length); vi = vi.replace(/^[^:]{0,30}:\s*/, ''); label = label || 'Đồng ý một phần'; }
      const prev = sentences[sentences.length - 1];
      let role = ROLE_LABELS.has(label) ? label : roleOf(en, si, n);
      const isOpt = !!label && !ROLE_LABELS.has(label);
      const s = { si, ii, key: `${si}-${ii}`, en, vi, role, opt: isOpt ? _optName(label) : '', optional: /7\.5/.test(label), alt: null, anchors: _anchorsOf(en) };
      const joinsPrev = prev && isOpt && (/NEGATIVE/i.test(label) || pre || (/^(Đồng ý|Lập trường)/.test(label) && /^(Đồng ý|Lập trường)/.test(prev.rawLabel || '')));
      if (joinsPrev) {
        if (prev.alt == null) prev.alt = ++altSeq;
        if (!prev.opt) prev.opt = /NEGATIVE/i.test(label) ? 'Bài POSITIVE' : 'Đồng ý / không đồng ý hoàn toàn';
        s.alt = prev.alt;
        s.role = prev.role;
      }
      s.rawLabel = label;
      sentences.push(s);
    });
    return { si, title: sec.title, sentences };
  });
  return { name: type.name, paras };
}

function paragraphs(typeId = _type) { return (TPL_DATA[typeId] && TPL_DATA[typeId].paras) || []; }
function allSentences(typeId = _type) { return paragraphs(typeId).flatMap(p => p.sentences); }
function shortTitle(title) { return String(title || '').replace(/^[①②③④⑤⑥⑦⑧]\s*/, ''); }
function roleTag(s) { return `<span class="pth-role">${esc(s.role)}</span>${s.opt ? `<span class="pth-opt">${esc(s.opt)}</span>` : ''}`; }

// English sentence as HTML: placeholders as chips, key words underlined.
function enHtml(s, { anchors = true } = {}) {
  return tokenize(s.en).map(t => {
    if (t.ph) return `<span class="pth-ph">${esc(t.text)}</span>`;
    if (t.text === '/') return '<span class="pth-or">/</span>';
    if (anchors && s.anchors && s.anchors.has(normWord(t.core))) return `${esc(t.lead)}<span class="pth-anchor">${esc(t.core)}</span>${esc(t.trail)}`;
    return esc(t.text);
  }).join(' ');
}

// ── Word-level diff (placeholders ignored, "a / b" = either) ────
// target: [{w, alts, sid}], typed: string → { ops, matched[] } where
// matched[i] tells whether target word i was written correctly.
function targetWords(sentences) {
  const out = [];
  sentences.forEach(s => {
    const raw = stripPh(s.en).split(/\s+/).filter(Boolean);
    for (let i = 0; i < raw.length; i++) {
      const n = normWord(raw[i]);
      if (!n) continue;
      if (raw[i + 1] === '/' && raw[i + 2] && normWord(raw[i + 2])) {
        out.push({ w: `${raw[i]} / ${raw[i + 2]}`, alts: [n, normWord(raw[i + 2])], sid: s.key });
        i += 2;
        continue;
      }
      out.push({ w: raw[i], alts: [n], sid: s.key });
    }
  });
  return out;
}
function typedWords(text) {
  return stripPh(text).split(/\s+/).filter(Boolean).map(w => ({ w, n: normWord(w) })).filter(x => x.n);
}
function alignWords(target, typedText) {
  const typed = typedWords(typedText);
  const a = target.map(t => t.alts), b = typed.map(t => t.n);
  const n = a.length, m = b.length;
  const eq = (i, j) => a[i].includes(b[j]);
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = eq(i, j) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const raw = [], matched = new Array(n).fill(false);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (eq(i, j)) { raw.push({ type: 'ok', word: typed[j].w }); matched[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { raw.push({ type: 'miss', word: target[i].w }); i++; }
    else { raw.push({ type: 'extra', word: typed[j].w }); j++; }
  }
  while (i < n) { raw.push({ type: 'miss', word: target[i].w }); i++; }
  while (j < m) { raw.push({ type: 'extra', word: typed[j].w }); j++; }
  const ops = [];
  for (let k = 0; k < raw.length; k++) {
    const c = raw[k], d = raw[k + 1];
    if (d && ((c.type === 'miss' && d.type === 'extra') || (c.type === 'extra' && d.type === 'miss'))) {
      ops.push({ type: 'wrong', word: (c.type === 'extra' ? c : d).word, expected: (c.type === 'miss' ? c : d).word }); k++;
    } else ops.push(c);
  }
  const right = matched.filter(Boolean).length;
  return { ops, matched, pct: n ? Math.round(right / n * 100) : 100 };
}
function diffHtml(ops) {
  return ops.map(o => {
    if (o.type === 'ok')    return `<span class="pth-d-ok">${esc(o.word)}</span>`;
    if (o.type === 'miss')  return `<span class="pth-d-miss" title="Thiếu">${esc(o.word)}</span>`;
    if (o.type === 'extra') return `<span class="pth-d-extra" title="Thừa">${esc(o.word)}</span>`;
    return `<span class="pth-d-wrong" title="Đúng là: ${escA(o.expected)}">${esc(o.word)}</span><span class="pth-d-fix">${esc(o.expected)}</span>`;
  }).join(' ');
}

// What the letter-by-letter drill (Band 6+ recall) asks the student to type:
// placeholders are not typed — they show as "…" glued to the word before;
// "agree / disagree" becomes one "agree/disagree" word.
function wbwAnswer(en) {
  const out = [];
  let pending = '';
  tokenize(en).forEach(t => {
    if (t.ph) {
      if (pending === '\u0000') pending = '';
      const trail = t.text.replace(/^\([^()]*\)/, '');
      if (out.length) out[out.length - 1] += '…' + trail; else pending = '…';
      return;
    }
    if (t.text === '/' && out.length) { out[out.length - 1] += '/'; pending = '\u0000'; return; }
    if (pending === '\u0000') { out[out.length - 1] += t.text; pending = ''; return; }
    out.push(pending + t.text);
    pending = '';
  });
  return out.join(' ');
}

// ── Lulu ───────────────────────────────────────────────────────
// Lulu says `text` in a bubble over the element (a selector is looked up
// after the screen re-rendered).
function lulu(anchor, text, mood = 'wink') {
  const el = typeof anchor === 'string' ? document.querySelector(anchor) : anchor;
  if (window.AskLulu) window.AskLulu.say(el, text, mood);
  else showToast(text, 'info', 3500);
}
function askBtn(id, onclick, label = 'Hỏi Lulu', extra = '') {
  return `<button class="pth-btn ask-lulu" id="${id}" onclick="${onclick}" ${extra}><span class="ask-lulu-ic"></span> ${label}</button>`;
}
// Lulu with a speech bubble (results, coach).
function luluSays(text, { pct = 70, mood, solo = true, stacked = false } = {}) {
  if (window.Mascot && window.Mascot.reactHtml) return window.Mascot.reactHtml({ pct, text, mood, solo, stacked, compact: !stacked });
  return `<div class="pth-fb pth-fb--good">🍊 ${esc(text)}</div>`;
}
const HINTED_NOTE = 'Có Lulu giúp nên câu này sẽ quay lại cuối vòng — lần sau tự làm không gợi ý nha!';

// Next missing word for a typed answer — Lulu reveals one more letter each ask.
// shown: per target-word letter counts (kept by the caller).
function wordHint(target, typedText, shown) {
  const d = alignWords(target, typedText);
  const idx = d.matched.findIndex(x => !x);
  if (idx < 0) return { done: true };
  const word = target[idx].w.split(' / ')[0].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9']+$/g, '');
  shown[idx] = Math.min(word.length, Math.max(1, shown[idx] || 0) + 1);
  const full = shown[idx] >= word.length;
  const before = idx > 0 ? target[idx - 1].w.split(' / ')[0].replace(/[,.;:]+$/, '') : '';
  const where = before ? `Sau “${before}”` : 'Từ đầu tiên';
  return { done: false, text: full ? `${where} là chữ “${word}” nè 💪` : `${where} là một chữ bắt đầu bằng “${word.slice(0, shown[idx])}…” nè 🍊` };
}

// ── Audio (browser text-to-speech) ─────────────────────────────
let _voice = null;
function _pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = speechSynthesis.getVoices() || [];
  return vs.find(v => /en-GB/i.test(v.lang) && /Google|Natural|Online/i.test(v.name))
      || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
function speak(text, rate = 0.95) {
  if (!('speechSynthesis' in window)) { showToast('Trình duyệt không hỗ trợ đọc to.', 'warn', 2500); return; }
  speechSynthesis.cancel();
  if (!_voice) _voice = _pickVoice();
  // Placeholders are read as "something"; "a / b" as "a or b".
  const u = new SpeechSynthesisUtterance(String(text).replace(/\([^()]*\)/g, 'something').replace(/\s\/\s/g, ' or '));
  u.lang = _voice ? _voice.lang : 'en-GB';
  if (_voice) u.voice = _voice;
  u.rate = rate;
  speechSynthesis.speak(u);
}
function speakKey(key) { const s = allSentences().find(x => x.key === key); if (s) speak(s.en); }
function speakPara(si) { const p = paragraphs()[si]; if (p) speak(p.sentences.map(s => s.en).join(' ')); }
function stopSpeak() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

// ── Server I/O ─────────────────────────────────────────────────
function authHeaders(json) {
  const token = window.AuthService && window.AuthService.getToken();
  const h = token ? { Authorization: 'Bearer ' + token } : {};
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// The full templates (same file as the "Xem đầy đủ" pop-up).
async function loadTemplates(level) {
  try {
    const data = window.Task2GenericTpl ? await window.Task2GenericTpl.load() : window.TASK2_GENERIC_TEMPLATES;
    const lv = data && data[level];
    if (!lv) return false;
    TPL_TYPES = Object.keys(TYPE_META).filter(id => lv[id]).map(id => ({ id, label: TYPE_META[id].label, sub: TYPE_META[id].sub, name: lv[id].name }));
    TPL_DATA = {};
    TPL_TYPES.forEach(t => { TPL_DATA[t.id] = buildType(lv[t.id]); });
    return TPL_TYPES.length > 0;
  } catch { return false; }
}

async function loadProgress(level) {
  try {
    const res = await fetch(`${API}/api/task2template/progress?level=${level}`, { headers: authHeaders() });
    const data = res.ok ? await res.json() : null;
    if (level !== _level) return;
    _progress = {};
    if (data && data.success) (data.progress || []).forEach(p => { _progress[p.typeId] = p; });
  } catch { if (level === _level) _progress = {}; }
}

function prog(typeId = _type) {
  return _progress[typeId] || { typeId, level: _level, steps: {}, drillRounds: [], mastery: {}, warmupScore: 0, assembleBest: 0, applyText: [], reviewStage: 0, nextReviewAt: null };
}

// Merge locally right away (so the UI moves), then send. Saves for one
// type run one after another so a slow request never lands after a newer one.
let _saveChain = Promise.resolve();
function saveProg(patch, typeId = _type, level = _level) {
  const p = JSON.parse(JSON.stringify(prog(typeId)));
  const now = new Date().toISOString();
  if (patch.steps) STEP_KEYS.forEach(k => { if (patch.steps[k] && !p.steps[k]) p.steps[k] = now; });
  if (patch.drillRounds) patch.drillRounds.forEach((v, i) => { p.drillRounds[i] = Math.max(p.drillRounds[i] || 0, v || 0); });
  if (patch.mastery) Object.assign(p.mastery, patch.mastery);
  if (patch.warmupScore != null) p.warmupScore = Math.max(p.warmupScore || 0, patch.warmupScore);
  if (patch.assembleBest != null) p.assembleBest = Math.max(p.assembleBest || 0, patch.assembleBest);
  if (patch.applyText) p.applyText = patch.applyText.slice();
  if (level === _level) _progress[typeId] = p;

  const body = JSON.stringify(Object.assign({ level }, patch));
  _saveChain = _saveChain.then(async () => {
    try {
      const res = await fetch(`${API}/api/task2template/progress/${typeId}`, { method: 'PUT', headers: authHeaders(true), body });
      const data = res.ok ? await res.json() : null;
      if (data && data.success && data.progress && level === _level) {
        if (patch.reset) delete _progress[typeId]; else _progress[typeId] = data.progress;
        renderChrome();
      } else if (!res.ok) {
        showToast('Chưa lưu được tiến độ — kiểm tra kết nối mạng.', 'warn', 3000);
      }
    } catch { showToast('Chưa lưu được tiến độ — kiểm tra kết nối mạng.', 'warn', 3000); }
  });
  renderChrome();
  return _saveChain;
}

// Mastery 0..5 per sentence — changes are applied locally and sent with the
// next saveProg().
function masteryOf(key) { return Number(prog().mastery[key] || 0); }
function bumpMastery(pending, key, delta, floor = 0) {
  const cur = pending[key] != null ? pending[key] : masteryOf(key);
  pending[key] = Math.min(5, Math.max(floor, 0, cur + delta));
}

// One finished run → attempt history (90-day TTL) + homework completion.
async function saveAttempt({ mode, total, correct, isExam = false, timeTakenSec }) {
  if (!total) return;
  const meta = TPL_TYPES.find(t => t.id === _type);
  try {
    const res = await fetch(`${API}/api/task2template/save`, {
      method: 'POST', headers: authHeaders(true),
      body: JSON.stringify({ templateType: _type, templateName: meta ? `${meta.label} – ${meta.name}` : _type, totalItems: total, correctItems: correct, mode, isExam, timeTakenSec, level: _level }),
    });
    if (window.ApiClient) await window.ApiClient.handleResponse(res);
  } catch {}
  refreshHomeworkSoon();
}

// ── Class homework ("Bài tập về nhà") ──────────────────────────
// A teacher can assign one essay type at one level. The tick (server side)
// needs all 5 steps done AND one whole-template recall (④ or the mock test)
// with >= 70% of the sentences memorised since it was assigned.
let _hwLoadSeq = 0;
async function loadHomework() {
  const req = ++_hwLoadSeq;
  try {
    const res = await fetch(`${API}/api/assignments/mine`, { headers: authHeaders() });
    const data = res.ok ? await res.json() : null;
    if (req !== _hwLoadSeq || !data || !data.success) return;
    const before = new Map(_homework.map(h => [h.key, h.completed]));
    const out = [];
    (data.assignments || []).forEach(a => (a.resources || []).forEach(r => {
      if (r.resourceType !== 'task2_template') return;
      const [typeId, level] = String(r.resourceCode || '').split('||');
      if (!typeId) return;
      out.push({ key: `${a._id}:${r.itemId}`, title: a.title || '', className: a.className || '', deadline: a.deadline || null,
        typeId, level: level || 'band7', completed: !!r.completed });
    }));
    _homework = out;
    if (out.some(h => h.completed && before.get(h.key) === false)) {
      showToast('✅ Đạt bài tập về nhà: đã học xong và thuộc ≥ 70% số câu!', 'success', 4000);
      updateXPStorage(10);
    }
    renderChrome();
    if (_view === 'overview') renderOverview();
  } catch {}
}
// Re-check after anything that can change the tick (waits for pending saves).
function refreshHomeworkSoon() {
  if (!_homework.some(h => !h.completed)) return;
  _saveChain.then(() => setTimeout(loadHomework, 400));
}
function pendingHomework(typeId, level = _level) { return _homework.filter(h => h.typeId === typeId && h.level === level && !h.completed); }

function homeworkHtml() {
  const mine = _homework.filter(h => h.typeId === _type);
  if (!mine.length) return '';
  return mine.map(h => {
    const lvlName = h.level === 'band6' ? 'Band 6+' : 'Band 7+';
    const when = h.deadline ? ` · hạn ${new Date(h.deadline).toLocaleDateString('vi-VN')}` : '';
    const from = `${esc(h.title)}${h.className ? ` · ${esc(h.className)}` : ''}${when}`;
    if (h.level !== _level) {
      return `<div class="pth-hw">
        <div class="pth-hw-ic">📌</div>
        <div class="pth-hw-txt"><b>Bài tập về nhà ở ${lvlName}</b><span>${from}</span></div>
        <button class="pth-btn" onclick="switchTplLevel('${h.level}')">Chuyển sang ${lvlName}</button>
      </div>`;
    }
    if (h.completed) {
      return `<div class="pth-hw is-done">
        <div class="pth-hw-ic">✅</div>
        <div class="pth-hw-txt"><b>Đã đạt bài tập về nhà</b><span>${from}</span></div>
      </div>`;
    }
    const p = prog();
    const steps = STEP_KEYS.filter(k => p.steps[k]).length;
    return `<div class="pth-hw">
      <div class="pth-hw-ic">📌</div>
      <div class="pth-hw-txt"><b>Bài tập về nhà — cần làm để được tick</b><span>${from}</span>
        <ul class="pth-hw-req">
          <li class="${steps === STEP_KEYS.length ? 'ok' : ''}">${steps === STEP_KEYS.length ? '✓' : '○'} Học xong cả 5 bước (${steps}/5)</li>
          <li>○ Thuộc ≥ ${ASSEMBLE_PASS}% số câu khi nhớ lại cả bài — ở bước ④ Ghép cả bài hoặc Thi thử, làm sau khi được giao bài</li>
        </ul>
      </div>
    </div>`;
  }).join('');
}

// ── Progress maths ─────────────────────────────────────────────
function stepDone(key, typeId = _type) { return !!prog(typeId).steps[key]; }
function stepUnlocked(i, typeId = _type) { return i === 0 || stepDone(STEP_KEYS[i - 1], typeId); }
function typePct(typeId) {
  const p = prog(typeId);
  const nPara = paragraphs(typeId).length || 1;
  let done = STEP_KEYS.filter(k => p.steps[k]).length;
  if (!p.steps.drill) done += Math.min(1, (p.drillRounds || []).reduce((s, r) => s + Math.min(3, r || 0), 0) / (nPara * 3));
  return Math.round(done / STEP_KEYS.length * 100);
}
function reviewDue(typeId) {
  const p = prog(typeId);
  return !!(p.steps.assemble && p.nextReviewAt && new Date(p.nextReviewAt) <= new Date());
}
function knownCount(typeId) {
  const m = prog(typeId).mastery || {};
  return allSentences(typeId).filter(s => (m[s.key] || 0) >= 3).length;
}
// Lines already practised but not memorised yet, weakest first.
function weakSentences(typeId = _type) {
  const m = prog(typeId).mastery || {};
  return allSentences(typeId).filter(s => m[s.key] != null && m[s.key] < 3).sort((a, b) => (m[a.key] || 0) - (m[b.key] || 0));
}

// ══════════════════════════════════════════════════════════════════
//  Page chrome: hero, type tabs, badges, status, URL
// ══════════════════════════════════════════════════════════════════
function renderChrome() {
  renderTabs();
  const meta = TYPE_META[_type] || {};
  const hero = document.getElementById('tpl-hero');
  if (hero) hero.style.setProperty('--tpl-c', meta.color || '#4d63d8');
  document.documentElement.style.setProperty('--tpl-type-c', meta.color || '#4d63d8');
  const done = TPL_TYPES.filter(t => STEP_KEYS.every(k => stepDone(k, t.id))).length;
  const main = document.getElementById('tpl-main-badge');
  if (main) main.innerHTML = `<i class="fas fa-flag-checkered"></i> ${done}/${TPL_TYPES.length} dạng hoàn thành`;
  const known = TPL_TYPES.reduce((s, t) => s + knownCount(t.id), 0);
  const total = TPL_TYPES.reduce((s, t) => s + allSentences(t.id).length, 0);
  const due = TPL_TYPES.filter(t => reviewDue(t.id)).length;
  const sub = document.getElementById('tpl-mode-badge');
  if (sub) sub.innerHTML = `🧠 Đã thuộc ${known}/${total} câu` + (due ? ` · 🔔 ${due} dạng cần ôn` : '');
  const fill = document.getElementById('tpl-progress-fill');
  if (fill) fill.style.width = typePct(_type) + '%';
  const st = document.getElementById('tpl-type-status');
  if (st) {
    const p = prog();
    let h = `<span class="tpl-stat"><i class="fas fa-route"></i> ${esc(meta.label || '')}: ${typePct(_type)}%</span>`;
    if (STEP_KEYS.every(k => p.steps[k])) h += '<span class="tpl-stat is-ok"><i class="fas fa-check-circle"></i> Xong lộ trình</span>';
    if (p.assembleBest) h += `<span class="tpl-stat"><i class="fas fa-star"></i> Ghép bài tốt nhất: ${p.assembleBest}%</span>`;
    st.innerHTML = h;
  }
  const subEl = document.getElementById('tpl-page-sub');
  if (subEl) subEl.textContent = `Lộ trình 5 bước để thuộc ${total} câu của bản template đầy đủ — 7 dạng bài IELTS Task 2, ${isB7() ? 'Band 7+' : 'Band 6+'}. Bí quá thì bấm “Hỏi Lulu” nha!`;
}

function renderTabs() {
  const wrap = document.getElementById('tpl-type-tabs');
  if (!wrap) return;
  wrap.innerHTML = TPL_TYPES.map(t => {
    const meta = TYPE_META[t.id] || {};
    const color = meta.color || '#4d63d8';
    const pct = typePct(t.id);
    const allDone = STEP_KEYS.every(k => stepDone(k, t.id));
    const due = reviewDue(t.id);
    const hw = pendingHomework(t.id).length > 0;
    const badge = due ? '<span class="t2-tab-pct-badge pth-due-badge" title="Đến hạn ôn">🔔</span>'
      : hw ? '<span class="t2-tab-pct-badge pth-due-badge" title="Bài tập về nhà">📌</span>'
      : allDone ? '<span class="t2-tab-done-badge" title="Đã xong lộ trình">✓</span>'
      : pct > 0 ? `<span class="t2-tab-pct-badge">${pct}%</span>` : '';
    const dots = STEP_KEYS.map(k => `<span class="t2-tab-mode-dot${stepDone(k, t.id) ? ' on' : ''}"></span>`).join('');
    return `
    <button class="t2-type-tab-btn ${_type === t.id ? 'active' : ''}" onclick="switchTplType('${t.id}')" data-tpl-type="${t.id}" style="--tab-color:${color}" title="${escA(t.name)}">
      <span class="t2-tab-icon-wrap"><i class="fas ${meta.icon || 'fa-file'}"></i></span>
      <span class="t2-tab-text">
        <span class="t2-tab-label">${esc(t.label)}</span>
        <span class="t2-tab-sub">${esc(t.sub)}</span>
        <span class="t2-tab-mode-dots" title="5 bước của lộ trình">${dots}</span>
      </span>
      ${badge}
    </button>`;
  }).join('');
}

function _syncUrl(push = false) {
  const params = new URLSearchParams();
  if (_type !== 'type01') params.set('type', _type);
  if (_level !== 'band6') params.set('level', _level);
  const url = location.pathname.split('?')[0] + (params.toString() ? '?' + params : '');
  if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
}
function copyTplShareUrl() {
  const url = `${location.origin}${location.pathname.split('?')[0]}?type=${_type}${_level !== 'band6' ? '&level=' + _level : ''}`;
  const ok = () => showToast('Đã sao chép link chia sẻ!', 'info', 2500);
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok).catch(() => _copyFallback(url, ok));
  else _copyFallback(url, ok);
}
function _copyFallback(text, onDone) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); onDone(); } catch { showToast('Không thể sao chép', 'warn', 2000); }
  document.body.removeChild(ta);
}

// ── Switching type / level (asks first when leaving an activity) ──
let _pendingLeave = null;
function _inActivity() { return _view !== 'overview' && _view !== 'read' && !(_run && _run.finished); }
function _confirmLeave(text, action) {
  if (!_inActivity()) { action(); return; }
  _pendingLeave = action;
  document.getElementById('tpl-switch-sub').textContent = text;
  document.getElementById('tpl-switch-overlay').classList.remove('hidden');
}
function confirmTypeSwitch() {
  document.getElementById('tpl-switch-overlay').classList.add('hidden');
  const a = _pendingLeave; _pendingLeave = null;
  if (a) a();
}
function cancelTypeSwitch() {
  _pendingLeave = null;
  document.getElementById('tpl-switch-overlay').classList.add('hidden');
}
function _leaveActivity() {
  _stopTimers();
  stopSpeak();
  _unmountDrill();
  if (_run && _run.saveT) { clearTimeout(_run.saveT); if (_view === 'apply' && _run.dirty) saveProg({ applyText: _run.texts }); }
  _run = null;
  _view = 'overview';
}

function switchTplType(typeId) {
  if (typeId === _type && _view === 'overview') return;
  _confirmLeave('Phần đang luyện dở của bước này sẽ không được lưu.', () => {
    _leaveActivity();
    _type = typeId;
    _syncUrl(true);
    renderChrome();
    renderTypeGuide();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

async function switchTplLevel(level) {
  if ((level !== 'band6' && level !== 'band7') || level === _level) return;
  _confirmLeave('Phần đang luyện dở của bước này sẽ không được lưu.', async () => {
    _leaveActivity();
    const ok = await loadTemplates(level);
    if (!ok) { showToast('Không tải được nội dung. Vui lòng thử lại.', 'error'); return; }
    _level = level;
    _syncLevelButtons();
    await loadProgress(level);
    if (!TPL_DATA[_type]) _type = TPL_TYPES[0]?.id || 'type01';
    _syncUrl(true);
    renderChrome();
    render();
  });
}
function _syncLevelButtons() {
  document.querySelectorAll('.t2-level-btn').forEach(btn => {
    const on = btn.dataset.level === _level;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

window.addEventListener('popstate', async () => {
  const q = new URLSearchParams(location.search);
  const level = q.get('level') === 'band7' ? 'band7' : 'band6';
  _leaveActivity();
  if (level !== _level && await loadTemplates(level)) {
    _level = level; _syncLevelButtons(); await loadProgress(level);
  }
  const t = q.get('type');
  _type = t && TPL_DATA[t] ? t : (TPL_TYPES[0]?.id || 'type01');
  renderChrome(); renderTypeGuide(); render();
});

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  loadXPFromStorage();
  const heroMascot = document.getElementById('tpl-hero-mascot');
  if (heroMascot && window.Mascot) heroMascot.innerHTML = window.Mascot.duo('happy');
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    return;
  }
  if ('speechSynthesis' in window) {
    _voice = _pickVoice();
    speechSynthesis.onvoiceschanged = () => { _voice = _pickVoice(); };
  }
  setupDictionaryDouble('tpl-content-area', 'task2-template', () => _view !== 'exam');
  window.__ewsExamActive = () => _view === 'exam';

  const q = new URLSearchParams(location.search);
  if (q.get('level') === 'band7') _level = 'band7';
  _syncLevelButtons();

  const area = document.getElementById('tpl-content-area');
  if (area) area.innerHTML = '<div class="pth-loading">⏳ Đang tải...</div>';
  const [ok] = await Promise.all([loadTemplates(_level), loadProgress(_level)]);
  if (!ok) {
    if (area) area.innerHTML = '<div class="pth-loading">Không tải được nội dung. Vui lòng tải lại trang.</div>';
    return;
  }
  const t = q.get('type');
  _type = t && TPL_DATA[t] ? t : (TPL_TYPES[0]?.id || 'type01');

  renderChrome();
  renderTypeGuide();
  render();
  loadHomework();
  document.getElementById('tpl-switch-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) cancelTypeSwitch(); });
  window.addEventListener('beforeunload', e => {
    if (_view === 'apply' && _run && _run.dirty) saveProg({ applyText: _run.texts });
    if (_view === 'exam') { e.preventDefault(); e.returnValue = ''; }
  });
});

// ══════════════════════════════════════════════════════════════════
//  Views
// ══════════════════════════════════════════════════════════════════
function area() { return document.getElementById('tpl-content-area'); }

function render() {
  _unmountDrill();
  const guide = document.getElementById('tpl-guide-area');
  if (guide) guide.style.display = _view === 'exam' ? 'none' : '';
  updateExamBtn();
  if (!TPL_DATA[_type]) { area().innerHTML = '<div class="pth-loading">Chưa có nội dung</div>'; return; }
  switch (_view) {
    case 'warmup':   return renderWarmup();
    case 'read':     return renderRead();
    case 'drill':    return renderDrill();
    case 'assemble': return renderAssemble();
    case 'apply':    return renderApply();
    case 'review':
    case 'fix':
    case 'exam':     return renderRecallRun();
    default:         return renderOverview();
  }
}

function backToPath() {
  _leaveActivity();
  renderChrome();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function activityHeader(stepIdx, right = '') {
  const s = STEPS[stepIdx];
  return `<div class="pth-act-hdr">
    <button class="pth-back" onclick="backToPath()"><i class="fas fa-arrow-left"></i> Lộ trình</button>
    <div class="pth-act-title"><span class="pth-act-num">${s.num}</span> ${esc(s.title)}</div>
    <div class="pth-act-right">${right}</div>
  </div>`;
}

// ── Overview: the path ─────────────────────────────────────────
// What Lulu suggests next on the overview.
function coachLine() {
  const p = prog();
  const firstOpen = STEP_KEYS.findIndex(k => !p.steps[k]);
  const weak = weakSentences();
  const known = knownCount(_type), total = allSentences().length;
  if (reviewDue(_type)) return { mood: 'think', text: 'Đến hạn ôn rồi nè! Ôn nhanh 3 phút bây giờ thì mấy câu template sẽ nằm trong đầu lâu hơn nhiều đó 🔔' };
  if (pendingHomework(_type).length && firstOpen >= 0) return { mood: 'wink', text: `Cô/thầy giao dạng này làm bài về nhà đó. Mình làm tiếp bước ${STEPS[firstOpen].num} ${STEPS[firstOpen].title} nha 📌` };
  if (firstOpen === 0 && !(p.drillRounds || []).some(Boolean)) return { mood: 'excited', text: `Chào cậu! Tớ là Lulu 🍊 Dạng này có ${total} câu mẫu. Bắt đầu với ① Khung bài nha — chỉ 3 phút thôi!` };
  if (weak.length >= 3 && firstOpen !== 0) return { mood: 'think', text: `Có ${weak.length} câu cậu hay quên. Luyện câu yếu 3–5 phút rồi đi tiếp sẽ nhớ chắc hơn đó!` };
  if (firstOpen >= 0) return { mood: 'happy', text: `Cậu thuộc ${known}/${total} câu rồi! Bước tiếp theo: ${STEPS[firstOpen].num} ${STEPS[firstOpen].title}. Bí chỗ nào cứ bấm “Hỏi Lulu” nha.` };
  return { mood: 'cheer', text: 'Cậu xong cả lộ trình rồi, giỏi quá! Thử Thi thử để xem còn nhớ bao nhiêu, hoặc viết thêm một bài ở bước ⑤ nha 🏆' };
}

function renderOverview() {
  const t = TPL_DATA[_type];
  const meta = TYPE_META[_type] || {};
  const p = prog();
  const paras = paragraphs();
  const total = allSentences().length;
  const known = knownCount(_type);
  const firstOpen = STEP_KEYS.findIndex(k => !p.steps[k]);

  const due = reviewDue(_type);
  const next = p.nextReviewAt ? new Date(p.nextReviewAt) : null;
  const reviewCard = p.steps.assemble ? `
    <div class="pth-review ${due ? 'is-due' : ''}">
      <div class="pth-review-ic">${due ? '🔔' : '🗓️'}</div>
      <div class="pth-review-txt">
        <b>${due ? 'Đến hạn ôn nhanh' : 'Ôn nhanh'}</b>
        <span>${due ? 'Khoảng 3 phút: nhớ lại những câu bạn hay sai nhất.' : `Lần ôn tiếp theo: ${next ? next.toLocaleDateString('vi-VN') : '—'}. Ôn đúng hẹn giúp nhớ lâu hơn.`}</span>
      </div>
      <button class="pth-btn ${due ? 'pth-btn--primary' : ''}" onclick="startReview()"><i class="fas fa-bolt"></i> ${due ? 'Ôn ngay' : 'Ôn sớm'}</button>
    </div>` : '';
  const weak = weakSentences();
  const weakCard = weak.length ? `
    <div class="pth-review pth-weak">
      <div class="pth-review-ic">🎯</div>
      <div class="pth-review-txt">
        <b>Luyện câu yếu · ${weak.length} câu</b>
        <span>Những câu bạn đã học nhưng chưa thuộc chắc — nhớ lại từ tiếng Việt, có Lulu gợi ý.</span>
      </div>
      <button class="pth-btn" onclick="startFix()"><i class="fas fa-crosshairs"></i> Luyện ${Math.min(FIX_MAX, weak.length)} câu</button>
    </div>` : '';

  const cards = STEPS.map((s, i) => {
    const done = !!p.steps[s.key];
    const open = stepUnlocked(i);
    const current = i === firstOpen;
    let meta2 = '';
    if (s.key === 'warmup' && done) meta2 = `Xếp đúng ngay lần đầu: ${p.warmupScore || 0}%`;
    if (s.key === 'drill') {
      const r = paras.map((_, k) => Math.min(3, p.drillRounds[k] || 0));
      meta2 = `Đoạn xong: ${r.filter(x => x >= 3).length}/${paras.length}`;
    }
    if (s.key === 'assemble' && p.assembleBest) meta2 = `Tốt nhất: thuộc ${p.assembleBest}% số câu · cần ≥ ${ASSEMBLE_PASS}%`;
    if (s.key === 'assemble' && !p.assembleBest) meta2 = `Cần thuộc ≥ ${ASSEMBLE_PASS}% số câu để hoàn thành`;
    const state = done ? 'is-done' : current ? 'is-current' : open ? '' : 'is-locked';
    const btn = !open ? '<span class="pth-lock" title="Làm xong bước trước để mở"><i class="fas fa-lock"></i></span>'
      : `<button class="pth-btn ${current ? 'pth-btn--primary' : ''}" onclick="startStep('${s.key}')">${done ? '<i class="fas fa-rotate-right"></i> Luyện lại' : current ? '<i class="fas fa-play"></i> Bắt đầu' : '<i class="fas fa-play"></i> Mở'}</button>`;
    return `<div class="pth-step ${state}">
      <div class="pth-step-num">${done ? '<i class="fas fa-check"></i>' : s.num}</div>
      <div class="pth-step-body">
        <div class="pth-step-title"><i class="fas ${s.icon}"></i> ${esc(s.title)}</div>
        <div class="pth-step-desc">${esc(s.desc)}</div>
        ${meta2 ? `<div class="pth-step-meta">${esc(meta2)}</div>` : ''}
      </div>
      <div class="pth-step-act">${btn}</div>
    </div>`;
  }).join('');

  const c = coachLine();
  area().innerHTML = `
    <div class="pth-wrap">
      <div class="t2-type-info-card" style="--tab-color:${meta.color || '#4d63d8'}">
        <div class="t2-type-info-left">
          <div class="t2-type-info-icon"><i class="fas ${meta.icon || 'fa-file'}"></i></div>
          <div>
            <div class="t2-type-info-name">${esc(meta.label || '')} · ${esc(t.name)} <span class="t2-type-lvl">${isB7() ? '🏆 Band 7+' : '🌱 Band 6+'}</span></div>
            ${meta.desc ? `<div class="t2-type-info-desc">${esc(meta.desc)}</div>` : ''}
          </div>
        </div>
        <div class="t2-type-structure"><i class="fas fa-route"></i> ${paras.length} đoạn · ${total} câu · thuộc ${known}</div>
      </div>
      <div class="pth-coach">${luluSays(c.text, { mood: c.mood })}</div>
      ${homeworkHtml()}
      ${reviewCard}
      ${weakCard}
      <div class="pth-steps">${cards}</div>
      <div class="pth-foot">
        <span>🧠 Đã thuộc <b>${known}/${total}</b> câu</span>
        <span class="pth-foot-sep">·</span>
        <span>${isB7() ? 'Band 7+: ít gợi ý hơn, ghép cả bài có tính giờ.' : 'Band 6+: nhiều gợi ý hơn, ghép từng đoạn một.'}</span>
        ${STEP_KEYS.some(k => p.steps[k]) || (p.drillRounds || []).some(Boolean) ? `<button class="pth-link" onclick="resetPath()"><i class="fas fa-eraser"></i> Làm lại từ đầu</button>` : ''}
      </div>
    </div>`;
}

function resetPath() {
  if (!confirm('Xoá tiến độ lộ trình của dạng bài này (cấp độ hiện tại) và làm lại từ đầu?')) return;
  saveProg({ reset: true });
  delete _progress[_type];
  renderChrome();
  render();
}

function startStep(key) {
  const i = STEP_KEYS.indexOf(key);
  if (i < 0 || !stepUnlocked(i)) return;
  stopSpeak();
  if (key === 'warmup') startWarmup();
  else if (key === 'read') { _view = 'read'; _run = {}; render(); }
  else if (key === 'drill') startDrill();
  else if (key === 'assemble') startAssemble();
  else if (key === 'apply') startApply();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Finishing a step: save, award XP, then show the next one.
function completeStep(key, extra = {}) {
  const first = !stepDone(key);
  saveProg(Object.assign({ steps: { [key]: true } }, extra));
  refreshHomeworkSoon();
  if (first) { updateXPStorage(10); showToast(`🎉 Xong bước ${STEPS[STEP_KEYS.indexOf(key)].num} ${STEPS[STEP_KEYS.indexOf(key)].title}! +10 XP`, 'success', 2500); }
}
function nextStepButton(key) {
  const i = STEP_KEYS.indexOf(key);
  const n = STEPS[i + 1];
  return n ? `<button class="pth-btn pth-btn--primary" onclick="startStep('${n.key}')">Sang bước ${n.num} ${esc(n.title)} <i class="fas fa-arrow-right"></i></button>`
           : `<button class="pth-btn pth-btn--primary" onclick="backToPath()">Về lộ trình <i class="fas fa-arrow-right"></i></button>`;
}

// ── ① Warm-up: paragraph structure + sentence order ────────────
function startWarmup() {
  _view = 'warmup';
  _run = { part: 'intro', p: 0, firstTry: [], tried: false };
  render();
}

// The line `idx` may sit at position `pos` when it is that line, or an
// option of the same slot (book labels) — nothing else is interchangeable.
function _wuOkAt(p, idx, pos) {
  if (idx === pos) return true;
  const a = p.sentences[idx], b = p.sentences[pos];
  return a.alt != null && a.alt === b.alt;
}

function renderWarmup() {
  const paras = paragraphs();
  if (_run.part === 'intro') {
    const rows = paras.map(p => {
      const tgt = paraTarget(p.si, paras.length);
      const words = p.sentences.reduce((s, x) => s + countWords(stripPh(x.en)), 0);
      const flow = p.sentences.map(s => `<span class="pth-flow-item">${roleTag(s)}</span>`).join('<i class="fas fa-angle-right pth-flow-arr"></i>');
      return `<div class="pth-struct-row">
        <div class="pth-struct-name">${esc(shortTitle(p.title))}</div>
        <div class="pth-struct-nums">
          <span><b>${p.sentences.length}</b> câu mẫu · <b>${words}</b> chữ cố định</span>
          <span class="pth-struct-tgt">Bài thật: ${tgt.sent} · ${tgt.words}</span>
        </div>
        <div class="pth-flow">${flow}</div>
      </div>`;
    }).join('');
    const hasOpt = allSentences().some(s => s.opt);
    area().innerHTML = `${activityHeader(0)}
      <div class="pth-wrap">
        <div class="pth-card">
          <div class="pth-card-title">🗺️ Bộ khung của dạng bài này</div>
          <p class="pth-muted">Đọc qua: mỗi đoạn có mấy câu, câu nào làm nhiệm vụ gì. Cả bài thật nên dài <b>250–300 chữ</b>.${hasOpt ? ' Các câu có nhãn <span class="pth-opt">phương án</span> là lựa chọn thay nhau — khi viết bài thật chỉ chọn một.' : ''}</p>
          <div class="pth-struct">${rows}</div>
          <div class="pth-actions"><button class="pth-btn pth-btn--primary" onclick="wuStartOrder()">Bắt đầu sắp xếp câu <i class="fas fa-arrow-right"></i></button></div>
        </div>
      </div>`;
    return;
  }

  if (_run.part === 'done') {
    const score = _run.score;
    area().innerHTML = `${activityHeader(0)}
      <div class="pth-wrap"><div class="pth-card pth-done">
        <div class="pth-card-title">🧩 Xong phần khung bài!</div>
        ${luluSays(score >= 75 ? `Xếp đúng ngay lần đầu ${score}% số đoạn — cậu nắm khung bài chắc rồi đó! 🧩` : `Xong khung bài! Xếp đúng ngay lần đầu ${score}% số đoạn. Bước ② đọc kỹ vai trò từng câu sẽ giúp nhớ thứ tự hơn nha.`, { pct: score, stacked: true, solo: false })}
        <div class="pth-actions"><button class="pth-btn" onclick="startWarmup()"><i class="fas fa-rotate-right"></i> Làm lại</button>${nextStepButton('warmup')}</div>
      </div></div>`;
    return;
  }

  // part === 'order'
  const p = paras[_run.p];
  const r = _run;
  const picked = r.picked.map((idx, pos) => {
    const s = p.sentences[idx];
    const st = r.checked ? (r.checked.wrong.has(pos) ? 'is-wrong' : 'is-ok') : '';
    const role = r.checked && r.checked.ok ? `<span class="pth-sent-role">${roleTag(p.sentences[idx])}</span>` : '';
    return `<button class="pth-sent ${st}" ${r.checked && r.checked.ok ? 'disabled' : `onclick="wuUnpick(${pos})"`}><span class="pth-sent-n">${pos + 1}</span><span class="pth-sent-txt">${enHtml(s, { anchors: false })}</span>${role}</button>`;
  }).join('');
  const pool = r.pool.filter(idx => !r.picked.includes(idx)).map(idx =>
    `<button class="pth-sent${r.hl === idx ? ' is-hint' : ''}" onclick="wuPick(${idx})"><span class="pth-sent-txt">${enHtml(p.sentences[idx], { anchors: false })}</span></button>`).join('');
  const full = r.picked.length === p.sentences.length;
  let actions = '';
  if (r.checked && r.checked.ok) actions = `<button class="pth-btn pth-btn--primary" onclick="wuNext()">${r.p + 1 < paras.length ? 'Đoạn tiếp theo' : 'Hoàn thành'} <i class="fas fa-arrow-right"></i></button>`;
  else if (r.checked) actions = `<button class="pth-btn" onclick="wuShowAnswer()"><i class="fas fa-eye"></i> Xem đáp án</button><button class="pth-btn pth-btn--primary" onclick="wuRetry()"><i class="fas fa-rotate-right"></i> Sửa lại</button>`;
  else actions = `${askBtn('pth-hint', 'wuHint()')}<button class="pth-btn pth-btn--primary" onclick="wuCheck()" ${full ? '' : 'disabled'}><i class="fas fa-check"></i> Kiểm tra</button>`;

  area().innerHTML = `${activityHeader(0, `Đoạn ${r.p + 1}/${paras.length}`)}
    <div class="pth-wrap">
      <div class="pth-card">
        <div class="pth-card-title">${esc(shortTitle(p.title))} <span class="pth-chip">${p.sentences.length} câu</span></div>
        <p class="pth-muted">Bấm các câu bên dưới theo đúng thứ tự trong bản đầy đủ. Bấm lại một câu đã chọn để bỏ ra.</p>
        <div class="pth-order-slots">${picked || '<div class="pth-empty-slot">Chưa chọn câu nào</div>'}</div>
        ${pool ? `<div class="pth-pool-label">Các câu cần xếp</div><div class="pth-pool">${pool}</div>` : ''}
        ${r.checked && !r.checked.ok ? '<div class="pth-fb pth-fb--bad">Chưa đúng thứ tự — các câu viền đỏ đang ở sai vị trí.</div>' : ''}
        ${r.checked && r.checked.ok ? '<div class="pth-fb pth-fb--good">✅ Đúng rồi! Nhìn lại vai trò của từng câu trong đoạn.</div>' : ''}
        <div class="pth-actions">${actions}</div>
      </div>
    </div>`;
}

function wuStartOrder() { _run.part = 'order'; _run.p = 0; _wuSetupPara(); render(); }
function _wuSetupPara() {
  const p = paragraphs()[_run.p];
  const idx = p.sentences.map((_, i) => i);
  _run.pool = shuffleNew(idx);
  _run.picked = p.sentences.length === 1 ? [0] : [];
  _run.checked = null;
  _run.tried = false;
  _run.hl = null;
  if (p.sentences.length === 1) { _run.checked = { ok: true, wrong: new Set() }; _run.firstTry[_run.p] = true; }
}
function wuPick(idx) { if (_run.checked) return; if (!_run.picked.includes(idx)) _run.picked.push(idx); _run.hl = null; renderWarmup(); }
function wuUnpick(pos) { if (_run.checked) return; _run.picked.splice(pos, 1); renderWarmup(); }
function wuCheck() {
  const p = paragraphs()[_run.p];
  const wrong = new Set();
  _run.picked.forEach((idx, pos) => { if (!_wuOkAt(p, idx, pos)) wrong.add(pos); });
  const ok = wrong.size === 0;
  if (!_run.tried) _run.firstTry[_run.p] = ok;
  _run.tried = true;
  _run.checked = { ok, wrong };
  if (ok) playOk(); else playWrong();
  renderWarmup();
}
// Hỏi Lulu: removes a wrong pick, or points at the next line (role + opener).
function wuHint() {
  const p = paragraphs()[_run.p];
  if (_run.checked) return;
  _run.tried = true;
  _run.firstTry[_run.p] = false;
  let k = 0;
  while (k < _run.picked.length && _wuOkAt(p, _run.picked[k], k)) k++;
  let text;
  if (k < _run.picked.length) {
    _run.picked = _run.picked.slice(0, k);
    text = `Câu thứ ${k + 1} chưa đúng chỗ — tớ gỡ từ câu đó trở đi ra rồi, xếp lại nha 🍊`;
  } else if (k < p.sentences.length) {
    const s = p.sentences[k];
    _run.hl = k;
    text = `Câu thứ ${k + 1} là câu “${s.role}”${s.opt ? ` (${s.opt})` : ''}, mở đầu bằng “${firstWords(s, 3)}…” nè — tớ tô vàng nó rồi đó!`;
  } else text = 'Xếp đủ rồi, bấm Kiểm tra thôi! 🎉';
  renderWarmup();
  lulu('#pth-hint', text, 'think');
}
function wuRetry() {
  // Keep the sentences that were in the right place, return the rest to the pool.
  const keep = [];
  for (let pos = 0; pos < _run.picked.length; pos++) { if (_run.checked.wrong.has(pos)) break; keep.push(_run.picked[pos]); }
  _run.picked = keep;
  _run.checked = null;
  renderWarmup();
}
function wuShowAnswer() {
  const p = paragraphs()[_run.p];
  _run.picked = p.sentences.map((_, i) => i);
  _run.checked = { ok: true, wrong: new Set() };
  renderWarmup();
}
function wuNext() {
  const paras = paragraphs();
  if (_run.p + 1 < paras.length) { _run.p++; _wuSetupPara(); renderWarmup(); return; }
  const score = Math.round(paras.filter((_, i) => _run.firstTry[i]).length / paras.length * 100);
  _run.part = 'done'; _run.score = score; _run.finished = true;
  completeStep('warmup', { warmupScore: score });
  renderWarmup();
}

// ── ② Read & listen ───────────────────────────────────────────
function renderRead() {
  const paras = paragraphs();
  const body = paras.map(p => `
    <div class="pth-read-para">
      <div class="pth-read-hdr">
        <span>${esc(shortTitle(p.title))} <span class="pth-chip">${p.sentences.length} câu</span></span>
        <button class="pth-icon-btn" onclick="speakPara(${p.si})" title="Nghe cả đoạn"><i class="fas fa-volume-high"></i> Cả đoạn</button>
      </div>
      ${p.sentences.map(s => `
        <div class="pth-read-sent">
          <button class="pth-icon-btn pth-icon-btn--sm" onclick="speakKey('${s.key}')" title="Nghe câu này"><i class="fas fa-volume-high"></i></button>
          <div>
            <div class="pth-read-role">${roleTag(s)}</div>
            <div class="pth-read-en">${enHtml(s)}</div>
            <div class="pth-read-vi"${_showVi ? '' : ' style="display:none"'}>${esc(s.vi)}</div>
          </div>
        </div>`).join('')}
    </div>`).join('');
  area().innerHTML = `${activityHeader(1, `<button class="pth-icon-btn" onclick="toggleReadVi()">🇻🇳 ${_showVi ? 'Ẩn tiếng Việt' : 'Hiện tiếng Việt'}</button>`)}
    <div class="pth-wrap">
      <div class="pth-card">
        ${luluSays('Mẹo của tớ: đọc to từng câu 2 lần, rồi che tiếng Anh đi và thử nói lại từ câu tiếng Việt. Phần trong ngoặc là chỗ cậu tự điền theo đề, không cần học thuộc đâu!', { mood: 'wink' })}
        <p class="pth-muted"><span class="pth-anchor">Gạch chân</span> = từ khoá sẽ bị ẩn trước ở bước sau. <span class="pth-ph">(…)</span> = chỗ bạn tự điền nội dung theo đề. <span class="pth-or">/</span> = chọn một trong hai.</p>
        ${body}
        <div class="pth-actions">${_run.finished ? nextStepButton('read') : '<button class="pth-btn pth-btn--primary" onclick="readDone()"><i class="fas fa-check"></i> Tôi đã đọc xong</button>'}</div>
      </div>
    </div>`;
}
function toggleReadVi() { _showVi = !_showVi; renderRead(); }
function readDone() { stopSpeak(); _run.finished = true; completeStep('read'); renderRead(); }

// ── ③ Drill per paragraph ─────────────────────────────────────
// Stage 1 build (chunks) → 2 fade (band 6+: 30% then 60% blanks; band 7+:
// 60%) → 3 recall (band 6+: letter-by-letter drill; band 7+: free typing).
// A sentence answered wrong — or right with Lulu's help — comes back at the
// end of the round (twice at most).
function startDrill(pIdx) {
  const paras = paragraphs();
  const rounds = prog().drillRounds || [];
  if (pIdx == null) {
    pIdx = paras.findIndex((_, i) => (rounds[i] || 0) < 3);
    if (pIdx < 0) pIdx = 0;
  }
  if (pIdx > 0 && (rounds[pIdx - 1] || 0) < 3) return;
  _view = 'drill';
  const doneStages = rounds[pIdx] || 0;
  _run = { p: pIdx, stage: doneStages >= 3 ? 1 : doneStages + 1, pending: {}, between: false };
  _drillSetupStage();
  render();
}
function _drillSetupStage() {
  const p = paragraphs()[_run.p];
  const st = _run.stage;
  let q = [];
  if (st === 1) q = p.sentences.map(s => ({ key: s.key, kind: 'build' }));
  if (st === 2) {
    if (!isB7()) q = p.sentences.map(s => ({ key: s.key, kind: 'fade', lvl: 1 }));
    q = q.concat(p.sentences.map(s => ({ key: s.key, kind: 'fade', lvl: 2 })));
  }
  if (st === 3) q = p.sentences.map(s => ({ key: s.key, kind: 'recall' }));
  _run.queue = q.map(x => Object.assign(x, { tries: 0 }));
  _run.pos = 0;
  _run.item = null;
  _run.stageFirstOk = 0;
  _run.stageHints = 0;
}
function _sentence(key) { return allSentences().find(s => s.key === key); }

function renderDrill() {
  const paras = paragraphs();
  const rounds = prog().drillRounds || [];
  const chips = paras.map((p, i) => {
    const r = Math.min(3, rounds[i] || 0);
    const locked = i > 0 && (rounds[i - 1] || 0) < 3;
    return `<button class="pth-para-chip ${i === _run.p ? 'active' : ''} ${r >= 3 ? 'is-done' : ''}" ${locked ? 'disabled' : `onclick="drillSwitchPara(${i})"`}>
      ${locked ? '<i class="fas fa-lock"></i>' : r >= 3 ? '<i class="fas fa-check"></i>' : ''} ${esc(shortTitle(p.title).split(/[·–-]/)[0].trim())}
      <span class="pth-para-dots">${[1, 2, 3].map(k => `<i class="${r >= k ? 'on' : ''}"></i>`).join('')}</span>
    </button>`;
  }).join('');
  const stageBar = DRILL_STAGES.map((n, i) => `<span class="pth-stage ${i + 1 === _run.stage ? 'active' : ''} ${i + 1 < _run.stage ? 'done' : ''}">${i + 1}. ${n}</span>`).join('<i class="fas fa-angle-right pth-flow-arr"></i>');

  let inner;
  if (_run.between) inner = _drillBetweenHtml();
  else {
    const it = _run.queue[_run.pos];
    const s = _sentence(it.key);
    const left = _run.queue.length - _run.pos;
    inner = `
      <div class="pth-drill-meta"><span>Còn ${left} lượt trong vòng này</span><span class="pth-drill-tags">${roleTag(s)}${it.tries ? '<span class="pth-chip pth-chip--warn">Làm lại — lần này tự làm nha</span>' : ''}</span></div>
      <div class="pth-vi-prompt"><i class="fas fa-quote-left"></i> ${esc(s.vi)}</div>
      <div id="pth-item"></div>`;
  }
  area().innerHTML = `${activityHeader(2, `Đoạn ${_run.p + 1}/${paras.length}`)}
    <div class="pth-wrap">
      <div class="pth-para-chips">${chips}</div>
      <div class="pth-card">
        <div class="pth-card-title">${esc(shortTitle(paras[_run.p].title))}</div>
        <div class="pth-stages">${stageBar}</div>
        ${inner}
      </div>
    </div>`;
  if (!_run.between) _drillRenderItem();
}

function drillSwitchPara(i) {
  if (i === _run.p) return;
  _unmountDrill();
  startDrill(i);
}

function _drillBetweenHtml() {
  const paras = paragraphs();
  const st = _run.stage;
  if (st <= 3) {
    const next = st === 2 ? (isB7() ? ' — 60% số chữ bị ẩn.' : ' — ẩn 30% rồi 60% số chữ.') : st === 3 ? (isB7() ? ' — nhìn tiếng Việt, tự gõ cả câu.' : ' — nhìn tiếng Việt, gõ từng chữ (có chữ cái đầu).') : '';
    return `<div class="pth-between">
      ${luluSays(`Xong vòng ${st - 1}: ${DRILL_STAGES[st - 2]}! Tiếp theo: ${DRILL_STAGES[st - 1]}${next}`, { mood: 'happy', stacked: true })}
      <div class="pth-actions"><button class="pth-btn pth-btn--primary" onclick="drillContinue()">Tiếp tục <i class="fas fa-arrow-right"></i></button></div>
    </div>`;
  }
  const allDone = paras.every((_, i) => (prog().drillRounds[i] || 0) >= 3);
  const nextP = _run.p + 1 < paras.length ? _run.p + 1 : -1;
  const n = paras[_run.p].sentences.length;
  const pct = Math.round(_run.stageFirstOk / n * 100);
  return `<div class="pth-between">
    <div class="pth-card-title">🏁 Xong đoạn ${esc(shortTitle(paras[_run.p].title))}!</div>
    ${luluSays(`Nhớ lại đúng ngay lần đầu, không cần tớ gợi ý: ${_run.stageFirstOk}/${n} câu. ${pct >= 80 ? 'Đỉnh quá! 🎉' : 'Luyện lại đoạn này một lần nữa sẽ nhớ chắc hơn đó!'}`, { pct, stacked: true, solo: false })}
    <div class="pth-actions">
      <button class="pth-btn" onclick="startDrill(${_run.p})"><i class="fas fa-rotate-right"></i> Luyện lại đoạn này</button>
      ${nextP >= 0 && !allDone ? `<button class="pth-btn pth-btn--primary" onclick="startDrill(${nextP})">Đoạn tiếp theo <i class="fas fa-arrow-right"></i></button>` : ''}
      ${allDone ? nextStepButton('drill') : ''}
    </div>
  </div>`;
}
function drillContinue() { _run.between = false; renderDrill(); }

function _drillRenderItem() {
  const it = _run.queue[_run.pos];
  const s = _sentence(it.key);
  const host = document.getElementById('pth-item');
  if (!host) return;
  if (it.kind === 'build') renderBuild(host, s, (ok, hinted) => _drillAnswered(ok, hinted));
  else if (it.kind === 'fade') renderFade(host, s, it.lvl, (ok, hinted) => _drillAnswered(ok, hinted));
  else renderRecall(host, s, { free: isB7(), hints: 99, onDone: (ok, _d, hinted) => _drillAnswered(ok, hinted) });
}

// Called once the student has answered the current item (the item's own UI
// then shows feedback and a "Tiếp" button that calls drillNext()).
function _drillAnswered(ok, hinted = false) {
  const it = _run.queue[_run.pos];
  const clean = ok && !hinted;
  if (hinted) _run.stageHints++;
  if (it.kind === 'recall') {
    if (clean && !it.tries) { _run.stageFirstOk++; bumpMastery(_run.pending, it.key, 1, 3); updateXPStorage(2); }
    else if (clean) bumpMastery(_run.pending, it.key, 0, 2);
    else if (ok) bumpMastery(_run.pending, it.key, 0, 1);
    else bumpMastery(_run.pending, it.key, -1);
  } else if (ok) {
    bumpMastery(_run.pending, it.key, 0, 1);
  }
  if (!clean && it.tries < 2) _run.queue.push({ key: it.key, kind: it.kind, lvl: it.lvl, tries: it.tries + 1 });
}
function drillNext() {
  _unmountDrill();
  _run.pos++;
  if (_run.pos < _run.queue.length) { renderDrill(); return; }
  // Round finished.
  const rounds = (prog().drillRounds || []).slice();
  rounds[_run.p] = Math.max(rounds[_run.p] || 0, _run.stage);
  const paras = paragraphs();
  const allDone = paras.every((_, i) => (rounds[i] || 0) >= 3);
  const patch = { drillRounds: rounds, mastery: _run.pending };
  _run.pending = {};
  if (allDone && !stepDone('drill')) completeStep('drill', patch);
  else saveProg(patch);
  _run.stage++;
  _run.between = true;
  if (_run.stage <= 3) _drillSetupStage();
  else _run.finished = true;
  renderDrill();
}

// Build: put the chunks of one sentence in order.
function chunkSentence(sentence) {
  const BOUND = new Set(['of', 'in', 'on', 'for', 'with', 'to', 'from', 'at', 'by', 'that', 'which', 'and', 'but', 'because', 'so', 'while', 'although', 'as', 'if', 'than', 'after', 'before', 'when']);
  const toks = tokenize(sentence).map(t => t.text);
  const chunks = []; let cur = [];
  toks.forEach((w, i) => {
    const bare = normWord(w);
    if (i > 0 && !w.startsWith('(') && BOUND.has(bare) && cur.length >= 2) { chunks.push(cur.join(' ')); cur = [w]; }
    else { cur.push(w); if (/[,.;]$/.test(w) && cur.length >= 3) { chunks.push(cur.join(' ')); cur = []; } }
  });
  if (cur.length) chunks.push(cur.join(' '));
  const merged = [];
  chunks.forEach(c => { if (merged.length && c.split(' ').length <= 1) merged[merged.length - 1] += ' ' + c; else merged.push(c); });
  if (merged.length >= 3) return merged;
  // Short sentence: pairs of words instead.
  const pairs = [];
  for (let i = 0; i < toks.length; i += 2) pairs.push(toks.slice(i, i + 2).join(' '));
  return pairs;
}
let _build = null;
function renderBuild(host, s, onDone) {
  const pieces = chunkSentence(s.en).map((text, i) => ({ id: i, text }));
  _build = { host, s, onDone, target: pieces.map(p => p.text), bank: shuffleNew(pieces, (a, b) => a.text === b.text), picked: [], state: null, wrongs: 0, hints: 0 };
  _buildDraw();
}
function _buildDraw() {
  const b = _build;
  const done = b.state === 'ok';
  b.host.innerHTML = `
    <div class="pth-build-ans ${b.state === 'bad' ? 'is-bad' : ''} ${done ? 'is-ok' : ''}">${b.picked.map((id, pos) => {
      const pc = b.bank.find(x => x.id === id);
      return `<button class="pth-chunk is-picked" ${done ? 'disabled' : `onclick="buildUnpick(${pos})"`}>${esc(pc.text)}</button>`;
    }).join('') || '<span class="pth-empty-slot">Bấm các cụm bên dưới theo đúng thứ tự</span>'}</div>
    <div class="pth-build-bank">${b.bank.filter(x => !b.picked.includes(x.id)).map(x => `<button class="pth-chunk" onclick="buildPick(${x.id})">${esc(x.text)}</button>`).join('')}</div>
    ${b.state === 'bad' ? '<div class="pth-fb pth-fb--bad">Chưa đúng thứ tự — bấm vào cụm để gỡ ra và sửa lại, hoặc hỏi Lulu.</div>' : ''}
    ${done ? `<div class="pth-fb pth-fb--good">✅ ${enHtml(b.s)}${b.hints ? `<div class="pth-muted pth-fb-note">${HINTED_NOTE}</div>` : ''}</div>` : ''}
    <div class="pth-actions">
      ${done ? '<button class="pth-btn pth-btn--primary" id="pth-next" onclick="drillNext()">Tiếp <i class="fas fa-arrow-right"></i></button>'
        : `${askBtn('pth-hint', 'buildHint()')}${b.wrongs >= 2 ? '<button class="pth-btn" onclick="buildReveal()"><i class="fas fa-eye"></i> Xem đáp án</button>' : ''}`}
    </div>`;
  if (done) document.getElementById('pth-next')?.focus();
}
function _buildFinishIfFull() {
  const b = _build;
  if (b.picked.length !== b.bank.length) return;
  const typed = b.picked.map(i => b.bank.find(x => x.id === i).text).join(' ');
  if (typed === b.target.join(' ')) { b.state = 'ok'; playOk(); b.onDone(b.wrongs === 0, b.hints > 0); }
  else { b.state = 'bad'; b.wrongs++; playWrong(); }
}
function buildPick(id) {
  const b = _build; if (!b || b.state === 'ok') return;
  b.picked.push(id); b.state = null;
  _buildFinishIfFull();
  _buildDraw();
}
function buildUnpick(pos) { const b = _build; if (!b || b.state === 'ok') return; b.picked.splice(pos, 1); b.state = null; _buildDraw(); }
// Hỏi Lulu: takes back the wrong chunks, or places the next right one.
function buildHint() {
  const b = _build; if (!b || b.state === 'ok') return;
  b.hints++;
  const texts = b.picked.map(id => b.bank.find(x => x.id === id).text);
  let k = 0;
  while (k < texts.length && texts[k] === b.target[k]) k++;
  let text;
  if (k < texts.length) {
    b.picked = b.picked.slice(0, k);
    b.state = null;
    text = `Từ cụm thứ ${k + 1} là lạc chỗ rồi — tớ gỡ ra giúp cậu nè. Cụm đúng tiếp theo mở đầu bằng “${b.target[k].split(' ')[0]}…”`;
  } else {
    const pc = b.bank.find(x => x.text === b.target[k] && !b.picked.includes(x.id));
    if (pc) { b.picked.push(pc.id); b.state = null; _buildFinishIfFull(); }
    text = `Cụm tiếp theo là “${b.target[k]}” nè 🍊`;
  }
  _buildDraw();
  if (b.state !== 'ok') lulu('#pth-hint', text, 'think');
}
function buildReveal() {
  const b = _build; if (!b) return;
  // Order the bank by the target text (duplicate chunks map to any equal piece).
  const used = new Set();
  b.picked = b.target.map(t => { const pc = b.bank.find(x => x.text === t && !used.has(x.id)); used.add(pc.id); return pc.id; });
  b.state = 'ok';
  b.onDone(false, false);
  _buildDraw();
}

// Fade: type the hidden words. lvl 1 ≈ 30% (key words first), lvl 2 ≈ 60%.
let _fade = null;
function renderFade(host, s, lvl, onDone) {
  const toks = tokenize(s.en);
  const cand = toks.map((t, i) => i).filter(i => !toks[i].ph && normWord(toks[i].core).length >= 2);
  const need = Math.max(1, Math.round(cand.length * (lvl === 1 ? 0.3 : 0.6)));
  const anchors = cand.filter(i => s.anchors.has(normWord(toks[i].core)));
  const rest = shuffle(cand.filter(i => !anchors.includes(i)));
  if (lvl === 1) rest.sort((a, b) => (STOPWORDS.has(normWord(toks[a].core)) ? 1 : 0) - (STOPWORDS.has(normWord(toks[b].core)) ? 1 : 0));
  const blanks = new Set(anchors.concat(rest).slice(0, Math.max(need, Math.min(anchors.length, need + 1))));
  _fade = { host, s, toks, blanks, onDone, checked: false, hints: 0, shown: {} };
  let n = 0;
  const html = toks.map((t, i) => {
    if (t.ph) return `<span class="pth-ph">${esc(t.text)}</span>`;
    if (t.text === '/') return '<span class="pth-or">/</span>';
    if (!blanks.has(i)) return esc(t.text);
    const w = Math.max(3, t.core.length) + 1;
    return `${esc(t.lead)}<input class="pth-blank" data-i="${i}" data-n="${n++}" style="width:${w}ch" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" onkeydown="fadeKey(event,this)" onfocus="_fade && (_fade.last=this)">${esc(t.trail)}`;
  }).join(' ');
  host.innerHTML = `
    <div class="pth-fade">${html}</div>
    <div class="pth-hint-line">Gõ các chữ bị ẩn · <b>Enter</b> để sang ô tiếp theo / kiểm tra</div>
    <div id="pth-fade-fb"></div>
    <div class="pth-actions" id="pth-fade-actions">${askBtn('pth-hint', 'fadeHint()')}<button class="pth-btn pth-btn--primary" onclick="fadeCheck()"><i class="fas fa-check"></i> Kiểm tra</button></div>`;
  setTimeout(() => host.querySelector('.pth-blank')?.focus(), 30);
}
function fadeKey(e, el) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  if (_fade && _fade.checked) { drillNext(); return; }
  const all = [..._fade.host.querySelectorAll('.pth-blank')];
  const i = all.indexOf(el);
  const nextEmpty = all.slice(i + 1).find(x => !x.value.trim());
  if (nextEmpty) nextEmpty.focus(); else fadeCheck();
}
// Hỏi Lulu: one more letter in the box being typed (or the first wrong one).
function fadeHint() {
  const f = _fade; if (!f || f.checked) return;
  const inputs = [...f.host.querySelectorAll('.pth-blank')];
  const wrong = x => normWord(x.value) !== normWord(f.toks[+x.dataset.i].core);
  const inp = (f.last && inputs.includes(f.last) && wrong(f.last)) ? f.last : inputs.find(wrong);
  if (!inp) { lulu('#pth-hint', 'Các ô đều đúng hết rồi, bấm Kiểm tra thôi! 🎉', 'excited'); return; }
  const i = +inp.dataset.i;
  const core = f.toks[i].core;
  const v = inp.value;
  let p = 0;
  while (p < v.length && p < core.length && v[p].toLowerCase() === core[p].toLowerCase()) p++;
  const n = Math.min(core.length, Math.max(p + 1, (f.shown[i] || 0) + 1));
  f.shown[i] = n;
  f.hints++;
  inp.value = core.slice(0, n);
  inp.focus();
  lulu('#pth-hint', n >= core.length ? `Chữ này là “${core}” nè 💪` : `Chữ này bắt đầu bằng “${core.slice(0, n)}…” nè 🍊`, 'think');
}
function fadeCheck() {
  const f = _fade; if (!f || f.checked) return;
  const inputs = [...f.host.querySelectorAll('.pth-blank')];
  if (inputs.some(x => !x.value.trim())) { showToast('Hãy điền hết các ô trống (bí thì hỏi Lulu nha).', 'warn', 1800); inputs.find(x => !x.value.trim()).focus(); return; }
  f.checked = true;
  let allOk = true;
  inputs.forEach(inp => {
    const t = f.toks[+inp.dataset.i];
    const ok = normWord(inp.value) === normWord(t.core);
    inp.classList.add(ok ? 'is-ok' : 'is-bad');
    inp.readOnly = true;
    if (!ok) { allOk = false; inp.insertAdjacentHTML('afterend', `<span class="pth-blank-fix">${esc(t.core)}</span>`); }
  });
  if (allOk) playOk(); else playWrong();
  document.getElementById('pth-fade-fb').innerHTML = allOk
    ? `<div class="pth-fb pth-fb--good">✅ Chính xác!${f.hints ? `<div class="pth-muted pth-fb-note">${HINTED_NOTE}</div>` : ''}</div>`
    : `<div class="pth-fb pth-fb--bad">Câu đúng: ${enHtml(f.s)}<div class="pth-muted pth-fb-note">Câu này sẽ quay lại cuối vòng.</div></div>`;
  document.getElementById('pth-fade-actions').innerHTML = '<button class="pth-btn pth-btn--primary" id="pth-next" onclick="drillNext()">Tiếp <i class="fas fa-arrow-right"></i></button>';
  f.onDone(allOk, f.hints > 0);
  document.getElementById('pth-next')?.focus();
}

// Recall one sentence from its Vietnamese meaning.
//   free=false → WbwDrill (word masks with first letter, wrong letters rejected)
//   free=true  → plain textarea, graded by word diff (≥ passPct %)
//   hints      → how many times the student may ask Lulu (0 = mock test)
let _recall = null;
function renderRecall(host, s, { free, onDone, nextLabel = 'Tiếp', nextFn = 'drillNext()', passPct = RECALL_PASS_B7, hints = 0 }) {
  _recall = { host, s, onDone, free, done: false, nextLabel, nextFn, passPct, hintsLeft: hints, hints: 0, shown: [], answer: wbwAnswer(s.en), target: targetWords([s]) };
  host.innerHTML = `
    <div id="pth-wbw"></div>
    <textarea class="pth-textarea" id="pth-recall-in" rows="3" placeholder="Gõ lại cả câu tiếng Anh... (không cần gõ phần trong ngoặc)"
      onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();recallCheck()}"></textarea>
    <div id="pth-recall-fb"></div>
    <div class="pth-actions" id="pth-recall-actions">
      <button class="pth-btn" id="pth-giveup" onclick="recallGiveUp()"><i class="fas fa-eye"></i> Không nhớ</button>
      ${hints ? askBtn('pth-hint', 'recallHint()') : ''}
      <button class="pth-btn pth-btn--primary" id="pth-recall-check" onclick="recallCheck()"><i class="fas fa-check"></i> Kiểm tra</button>
    </div>`;
  const input = document.getElementById('pth-recall-in');
  if (!free && window.WbwDrill) {
    const words = countWords(_recall.answer);
    const ok = window.WbwDrill.mount(document.getElementById('pth-wbw'), {
      answer: _recall.answer, bridgeInput: input, maxErrors: Math.max(4, Math.ceil(words / 3)),
      onComplete: () => _recallFinish(true, null),
      onFail: () => _recallFinish(false, null),
    });
    if (ok) {
      input.style.display = 'none';
      document.getElementById('pth-recall-check').style.display = 'none';
      return;
    }
  }
  document.getElementById('pth-wbw').style.display = 'none';
  setTimeout(() => input.focus(), 30);
}
// Hỏi Lulu: one more letter of the next word the student hasn't got yet.
function recallHint() {
  const r = _recall; if (!r || r.done) return;
  if (r.hintsLeft <= 0) { lulu('#pth-hint', 'Hết lượt gợi ý cho câu này rồi — cố nhớ thêm chút, hoặc bấm “Không nhớ” để xem đáp án nha 🤗', 'sad'); return; }
  const input = document.getElementById('pth-recall-in');
  let text;
  if (!r.free && window.AskLulu) {
    const res = window.AskLulu.letterHint(r.answer, input ? input.value : '', r.shown);
    if (res.done) { lulu('#pth-hint', window.AskLulu.line(res), 'excited'); return; }
    text = window.AskLulu.line(res);
  } else {
    const res = wordHint(r.target, input ? input.value : '', r.shown);
    if (res.done) { lulu('#pth-hint', 'Cậu gõ đủ chữ rồi đó, bấm Kiểm tra thôi! 🎉', 'excited'); return; }
    text = res.text;
  }
  r.hints++;
  r.hintsLeft--;
  lulu('#pth-hint', text, 'think');
  const wbwIn = document.querySelector('#pth-wbw .wbwd-input');
  (wbwIn || input)?.focus();
}
function recallCheck() {
  const r = _recall; if (!r || r.done) return;
  const input = document.getElementById('pth-recall-in');
  if (!input.value.trim()) { showToast('Hãy gõ câu trả lời.', 'warn', 1800); return; }
  const d = alignWords(r.target, input.value);
  _recallFinish(d.pct >= r.passPct, d);
}
function recallGiveUp() {
  const r = _recall; if (!r || r.done) return;
  _unmountDrill();
  _recallFinish(false, null);
}
function _recallFinish(ok, diff) {
  const r = _recall; if (!r || r.done) return;
  r.done = true;
  const input = document.getElementById('pth-recall-in');
  if (input) input.readOnly = true;
  if (ok) playOk(); else playWrong();
  const diffPart = diff ? `<div class="pth-diff">${diffHtml(diff.ops)}</div><div class="pth-muted">Đúng ${diff.pct}% số chữ${r.free ? ` (cần ≥ ${r.passPct}%)` : ''}</div>` : '';
  const note = r.hints && ok && r.nextFn === 'drillNext()' ? `<div class="pth-muted pth-fb-note">${HINTED_NOTE}</div>` : r.hints && ok ? '<div class="pth-muted pth-fb-note">Có Lulu gợi ý — lần ôn sau thử tự nhớ nha!</div>' : '';
  const fb = document.getElementById('pth-recall-fb');
  if (fb) fb.innerHTML = ok
    ? `<div class="pth-fb pth-fb--good">✅ Nhớ đúng!${diffPart}${note}</div>`
    : `<div class="pth-fb pth-fb--bad">${diffPart}<div><b>Câu đúng:</b> ${enHtml(r.s)}</div></div>`;
  const acts = document.getElementById('pth-recall-actions');
  if (acts) acts.innerHTML = `<button class="pth-btn pth-btn--primary" id="pth-next" onclick="${r.nextFn}">${esc(r.nextLabel)} <i class="fas fa-arrow-right"></i></button>`;
  r.onDone(ok, diff, r.hints > 0);
  setTimeout(() => document.getElementById('pth-next')?.focus(), 30);
}
function _unmountDrill() {
  const h = document.getElementById('pth-wbw');
  if (h && window.WbwDrill) window.WbwDrill.unmount(h);
}

// ── ④ Assemble the whole essay from memory ────────────────────
// Band 6+: one paragraph at a time, cue = role + first two words of each
// sentence. Band 7+: every paragraph on one screen, cue = roles only, timed.
function startAssemble() {
  _view = 'assemble';
  const n = paragraphs().length;
  _run = { p: 0, texts: new Array(n).fill(''), results: new Array(n).fill(null), hints: new Array(n).fill(0), shown: Array.from({ length: n }, () => []), start: Date.now(), submitted: false };
  if (isB7()) _run.timer = setInterval(_asmTick, 1000);
  render();
}
function _asmTick() {
  const el = document.getElementById('pth-asm-time');
  if (!el || !_run || _view !== 'assemble') return;
  el.textContent = fmtMMSS((Date.now() - _run.start) / 1000);
}
function _asmCueHtml(p) {
  return `<ol class="pth-cues">${p.sentences.map(s => {
    const first = isB7() ? '' : ` — <i>${esc(firstWords(s, 2))}…</i>`;
    return `<li>${roleTag(s)}${first}</li>`;
  }).join('')}</ol>`;
}
function _asmHintsLeft(i) { return ASM_HINTS[_level] - (_run.hints[i] || 0); }
function _asmBoxHtml(p, i) {
  const res = _run.results[i];
  const usedHints = _run.hints[i] ? ` · ${_run.hints[i]} gợi ý` : '';
  return `<div class="pth-asm-para">
    <div class="pth-read-hdr"><span>${esc(shortTitle(p.title))} <span class="pth-chip">${p.sentences.length} câu</span></span>${res ? `<span class="pth-chip ${res.knownPct >= ASSEMBLE_PASS ? 'pth-chip--ok' : 'pth-chip--warn'}">Thuộc ${res.known}/${res.sent} câu · ${res.knownPct}%${usedHints}</span>` : askBtn(`pth-asm-hint-${i}`, `asmHint(${i})`, `Hỏi Lulu (${_asmHintsLeft(i)})`, _asmHintsLeft(i) <= 0 ? 'disabled' : '')}</div>
    ${_asmCueHtml(p)}
    ${res ? `<div class="pth-diff pth-diff--box">${diffHtml(res.ops)}</div>`
      : `<textarea class="pth-textarea pth-asm-in" id="pth-asm-${i}" rows="${Math.max(4, p.sentences.length + 1)}" placeholder="Viết lại cả đoạn từ trí nhớ... (bỏ qua phần trong ngoặc)" oninput="_run.texts[${i}]=this.value">${esc(_run.texts[i])}</textarea>`}
  </div>`;
}
// Hỏi Lulu in ④: the next word of the paragraph that's missing (limited).
function asmHint(i) {
  if (!_run || _run.results[i]) return;
  const btn = document.getElementById(`pth-asm-hint-${i}`);
  if (_asmHintsLeft(i) <= 0) { lulu(btn, 'Hết lượt gợi ý cho đoạn này rồi — viết tiếp những gì cậu nhớ nha!', 'sad'); return; }
  const res = wordHint(targetWords(paragraphs()[i].sentences), _run.texts[i] || '', _run.shown[i]);
  if (res.done) { lulu(btn, 'Đoạn này cậu viết đủ chữ rồi đó, kiểm tra thôi! 🎉', 'excited'); return; }
  _run.hints[i]++;
  if (btn) {
    btn.innerHTML = `<span class="ask-lulu-ic"></span> Hỏi Lulu (${_asmHintsLeft(i)})`;
    if (_asmHintsLeft(i) <= 0) btn.disabled = true;
  }
  lulu(btn, res.text, 'think');
  document.getElementById(`pth-asm-${i}`)?.focus();
}
function renderAssemble() {
  const paras = paragraphs();
  const r = _run;
  const right = isB7() ? `<span class="pth-timer"><i class="fas fa-stopwatch"></i> <span id="pth-asm-time">${fmtMMSS((Date.now() - r.start) / 1000)}</span></span>` : `Đoạn ${Math.min(r.p + 1, paras.length)}/${paras.length}`;
  let body;
  if (r.submitted) {
    const tot = _asmTotal();
    const pass = tot.knownPct >= ASSEMBLE_PASS;
    const weak = _asmWeakKeys();
    const hintTotal = r.hints.reduce((a, b) => a + b, 0);
    body = `<div class="pth-card pth-done">
        ${luluSays(pass ? `Thuộc ${tot.knownPct}% số câu — cậu viết lại được cả bài từ trí nhớ rồi! 🎉` : `Thuộc ${tot.knownPct}% số câu, cần ≥ ${ASSEMBLE_PASS}%. Mình luyện riêng ${weak.length} câu chưa thuộc rồi ghép lại nha — sẽ lên nhanh lắm!`, { pct: tot.knownPct, stacked: true, solo: false })}
        <div class="pth-score ${pass ? 'is-ok' : 'is-bad'}">${tot.knownPct}%</div>
        <p class="pth-muted" style="text-align:center">Thuộc <b>${tot.goodSent}/${tot.sent}</b> câu (một câu được tính là thuộc khi đúng ≥ ${SENT_KNOWN}% số chữ) · nhớ đúng ${tot.right}/${tot.total} chữ${r.secs ? ` · ⏱ ${fmtMMSS(r.secs)}` : ''}${hintTotal ? ` · 🍊 ${hintTotal} gợi ý` : ''}</p>
        <div class="pth-legend"><span class="pth-d-ok">đúng</span> <span class="pth-d-wrong">sai</span><span class="pth-d-fix">đáp án</span> <span class="pth-d-miss">thiếu</span> <span class="pth-d-extra">thừa</span></div>
        ${paras.map((p, i) => _asmBoxHtml(p, i)).join('')}
        <div class="pth-actions">
          ${weak.length ? `<button class="pth-btn ${pass ? '' : 'pth-btn--primary'}" onclick="startFix(_asmWeakKeys(), 'assemble')"><i class="fas fa-crosshairs"></i> Luyện lại ${Math.min(FIX_MAX, weak.length)} câu chưa thuộc</button>` : ''}
          <button class="pth-btn" onclick="startAssemble()"><i class="fas fa-rotate-right"></i> Làm lại</button>${pass ? nextStepButton('assemble') : ''}
        </div>
      </div>`;
  } else if (isB7()) {
    body = `<div class="pth-card">
        <p class="pth-muted">Viết lại toàn bộ template từ trí nhớ, mỗi ô một đoạn. Chỉ có vai trò của từng câu làm gợi ý. Không cần gõ phần trong ngoặc. Mỗi đoạn được hỏi Lulu ${ASM_HINTS.band7} lần.</p>
        ${paras.map((p, i) => _asmBoxHtml(p, i)).join('')}
        <div class="pth-actions"><button class="pth-btn pth-btn--primary" onclick="asmSubmitAll()"><i class="fas fa-paper-plane"></i> Nộp bài</button></div>
      </div>`;
  } else {
    const p = paras[r.p];
    const res = r.results[r.p];
    body = `<div class="pth-card">
        <p class="pth-muted">Viết lại cả đoạn từ trí nhớ. Gợi ý: vai trò và 2 chữ đầu của mỗi câu. Không cần gõ phần trong ngoặc. Bí từ nào thì hỏi Lulu (${ASM_HINTS.band6} lần mỗi đoạn).</p>
        ${_asmBoxHtml(p, r.p)}
        <div class="pth-actions">${res
          ? `<button class="pth-btn pth-btn--primary" onclick="asmNextPara()">${r.p + 1 < paras.length ? 'Đoạn tiếp theo' : 'Xem kết quả'} <i class="fas fa-arrow-right"></i></button>`
          : `<button class="pth-btn pth-btn--primary" onclick="asmCheckPara()"><i class="fas fa-check"></i> Kiểm tra đoạn này</button>`}</div>
      </div>`;
  }
  area().innerHTML = `${activityHeader(3, right)}<div class="pth-wrap">${body}</div>`;
  if (!r.submitted) setTimeout(() => document.querySelector('.pth-asm-in')?.focus(), 30);
}
function _asmGrade(i) {
  const p = paragraphs()[i];
  const tw = targetWords(p.sentences);
  const d = alignWords(tw, _run.texts[i] || '');
  // Per-sentence accuracy → mastery.
  const per = {};
  tw.forEach((t, k) => { per[t.sid] = per[t.sid] || [0, 0]; per[t.sid][1]++; if (d.matched[k]) per[t.sid][0]++; });
  const known = Object.values(per).filter(([a, b]) => b && a / b * 100 >= SENT_KNOWN).length;
  const sent = p.sentences.length;
  _run.results[i] = { ops: d.ops, pct: d.pct, right: d.matched.filter(Boolean).length, total: tw.length, per,
    known, sent, knownPct: sent ? Math.round(known / sent * 100) : 0 };
}
function asmCheckPara() {
  const i = _run.p;
  if (!(_run.texts[i] || '').trim()) { showToast('Hãy viết đoạn văn trước khi kiểm tra.', 'warn', 2000); return; }
  _asmGrade(i);
  if (_run.results[i].knownPct >= ASSEMBLE_PASS) playOk(); else playWrong();
  renderAssemble();
}
function asmNextPara() {
  if (_run.p + 1 < paragraphs().length) { _run.p++; renderAssemble(); return; }
  _asmFinish();
}
function asmSubmitAll() {
  const paras = paragraphs();
  if (_run.texts.every(t => !t.trim())) { showToast('Bạn chưa viết gì.', 'warn', 2000); return; }
  paras.forEach((_, i) => _asmGrade(i));
  _asmFinish();
}
function _asmTotal() {
  let right = 0, total = 0, sent = 0, goodSent = 0;
  _run.results.forEach(r => {
    if (!r) return;
    right += r.right; total += r.total;
    sent += r.sent; goodSent += r.known;
  });
  return { right, total, sent, goodSent, pct: total ? Math.round(right / total * 100) : 0,
    knownPct: sent ? Math.round(goodSent / sent * 100) : 0 };
}
// Sentences under the "thuộc" bar in the last ④ run, weakest first.
function _asmWeakKeys() {
  if (!_run || !_run.results) return [];
  const rows = [];
  _run.results.forEach(r => r && Object.entries(r.per).forEach(([key, [a, b]]) => { if (!b || a / b * 100 < SENT_KNOWN) rows.push([key, b ? a / b : 0]); }));
  return rows.sort((x, y) => x[1] - y[1]).map(x => x[0]);
}
function _asmFinish() {
  _stopTimers();
  _run.secs = Math.round((Date.now() - _run.start) / 1000);
  _run.submitted = true;
  _run.finished = true;
  const tot = _asmTotal();
  const pending = {};
  _run.results.forEach(r => r && Object.entries(r.per).forEach(([key, [a, b]]) => {
    const acc = b ? a / b : 1;
    if (acc >= 0.9) bumpMastery(pending, key, 1);
    else if (acc < 0.6) bumpMastery(pending, key, -1);
  }));
  const patch = { mastery: pending, assembleBest: tot.knownPct };
  if (tot.knownPct >= ASSEMBLE_PASS) completeStep('assemble', patch); else saveProg(patch);
  saveAttempt({ mode: 'path', total: tot.sent, correct: tot.goodSent, timeTakenSec: _run.secs });
  if (tot.knownPct >= ASSEMBLE_PASS) playOk();
  renderAssemble();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── ⑤ Apply: write a real essay, compare with the model essay ──
// While typing, a checklist under each paragraph ticks the template frames
// already used (options of one slot count once; "tuỳ chọn" lines are a bonus).
function startApply() {
  _view = 'apply';
  const n = paragraphs().length;
  const saved = prog().applyText || [];
  _run = { texts: Array.from({ length: n }, (_, i) => saved[i] || ''), result: null, hintLvl: {}, dirty: false };
  render();
  if (!_typeGuides) _loadTypeGuides().then(() => { if (_view === 'apply' && !_run.result) renderApply(); });
}
// How much of one template sentence's fixed wording (placeholders removed)
// appears, in order, in the student's paragraph — 0..1.
function _frameCoverage(sentence, paraWords) {
  const a = targetWords([sentence]).map(t => t.alts);
  if (!a.length) return 0;
  const b = paraWords, n = a.length, m = b.length;
  let prev = new Uint16Array(m + 1), cur = new Uint16Array(m + 1);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) cur[j] = a[i - 1].includes(b[j - 1]) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    [prev, cur] = [cur, prev];
  }
  return prev[m] / n;
}
// Frames of paragraph i with their state for the current text.
function _applyFrames(i) {
  const p = paragraphs()[i];
  const pw = typedWords(_run.texts[i] || '').map(x => x.n);
  const groups = [];
  p.sentences.forEach(s => {
    const cov = pw.length ? _frameCoverage(s, pw) : 0;
    const g = s.alt != null ? groups.find(x => x.alt === s.alt) : null;
    if (g) { g.options.push(s); if (cov > g.cov) { g.best = s; g.cov = cov; } }
    else groups.push({ id: s.key, alt: s.alt, role: s.role, optional: s.optional, best: s, options: [s], cov });
  });
  groups.forEach(g => { g.state = g.cov >= 0.7 ? 'is-ok' : g.cov >= 0.4 ? 'is-part' : 'is-miss'; });
  return groups;
}
function _applyWordsHtml(i) {
  const paras = paragraphs();
  const tgt = paraTarget(i, paras.length);
  const n = countWords(_run.texts[i]);
  const cls = n >= tgt.lo && n <= tgt.hi + 20 ? 'is-ok' : n ? 'is-warn' : '';
  return `<span class="pth-wc ${cls}">${n} chữ · nên ${tgt.words}</span>`;
}
function _applyFramesHtml(i) {
  const icon = st => st === 'is-ok' ? '✓' : st === 'is-part' ? '~' : '○';
  return _applyFrames(i).map(g => {
    const cue = isB7() ? '' : ` <span class="pth-frame-cue">${esc(firstWords(g.best, 3))}…</span>`;
    const opts = g.options.length > 1 ? ` <span class="pth-opt">${g.options.length} phương án</span>` : g.optional ? ' <span class="pth-opt">tuỳ chọn</span>' : '';
    return `<li class="${g.state}"><span class="pth-check-ic">${icon(g.state)}</span><span class="pth-role">${esc(g.role)}</span>${opts}${cue}</li>`;
  }).join('');
}
function applyInput(i, el) {
  _run.texts[i] = el.value;
  _run.dirty = true;
  const wc = document.getElementById('pth-wc-' + i);
  if (wc) wc.innerHTML = _applyWordsHtml(i);
  const tot = document.getElementById('pth-wc-total');
  if (tot) tot.textContent = _run.texts.reduce((s, t) => s + countWords(t), 0);
  clearTimeout(_run.frameT);
  _run.frameT = setTimeout(() => { const ul = document.getElementById('pth-frames-' + i); if (ul && _view === 'apply') ul.innerHTML = _applyFramesHtml(i); }, 250);
  // Draft autosave to the account a few seconds after the student stops typing.
  clearTimeout(_run.saveT);
  _run.saveT = setTimeout(() => { if (_view === 'apply' && _run && _run.dirty && !_run.result) { _run.dirty = false; saveProg({ applyText: _run.texts }); const s = document.getElementById('pth-autosave'); if (s) s.textContent = '☁️ Đã tự lưu nháp'; } }, 4000);
}
// Hỏi Lulu in ⑤: the next frame this paragraph hasn't used yet.
function applyHint(i) {
  const btn = document.getElementById(`pth-apply-hint-${i}`);
  const g = _applyFrames(i).find(x => x.state !== 'is-ok' && !x.optional);
  if (!g) { lulu(btn, 'Đoạn này cậu dùng đủ các khung rồi đó! Giờ chú ý nội dung cho sát đề nha 💯', 'excited'); return; }
  const lvl = (_run.hintLvl[g.id] || 0) + 1;
  _run.hintLvl[g.id] = lvl;
  const s = g.best;
  const frame = s.en.replace(/\([^()]*\)/g, '(…)');
  const pick = g.options.length > 1 ? ` (chọn 1 trong ${g.options.length} phương án: ${g.options.map(o => o.opt).join(' / ')})` : '';
  const text = !isB7() || lvl >= 2
    ? `Đoạn này còn thiếu câu “${g.role}”${pick}. Thử khung này: “${frame}” rồi điền ý của cậu vào chỗ (…) nha 🍊`
    : `Đoạn này còn thiếu câu “${g.role}”${pick} — mở đầu bằng “${firstWords(s, 3)}…”. Hỏi lần nữa tớ đọc cả khung cho!`;
  lulu(btn, text, 'think');
  document.getElementById(`pth-apply-in-${i}`)?.focus();
}
function renderApply() {
  const paras = paragraphs();
  const g = _typeGuides && _typeGuides[_type];
  const me = (g && g.modelEssay) || null;
  const r = _run;
  const prompt = me && me.prompt ? `<div class="pth-prompt"><div class="pth-prompt-lbl">📝 Đề bài</div>${esc(me.prompt)}</div>`
    : '<div class="pth-prompt">Tự chọn một đề IELTS thuộc dạng bài này và viết bài theo template.</div>';
  let body;
  if (r.result) {
    body = `<div class="pth-card">
      ${luluSays(r.result.usedPct >= 70 ? `Cậu dùng ${r.result.used}/${r.result.total} khung câu — áp dụng template ngon lành rồi! Giờ so với bài mẫu để học cách triển khai ý nha 📖` : `Cậu mới dùng ${r.result.used}/${r.result.total} khung câu. Bấm “Sửa bài” rồi hỏi tớ khung còn thiếu nha — dùng đủ khung là bài mạch lạc hơn hẳn!`, { pct: r.result.usedPct, stacked: true, solo: false })}
      ${prompt}
      <div class="pth-score ${r.result.usedPct >= 50 ? 'is-ok' : 'is-bad'}">${r.result.words} chữ</div>
      <p class="pth-muted" style="text-align:center">Đã dùng <b>${r.result.used}/${r.result.total}</b> khung câu của bản đầy đủ${r.result.words < 250 ? ' · bài thật cần ít nhất <b>250 chữ</b>' : ''}</p>
      ${r.result.paras.map(pr => `<div class="pth-asm-para">
        <div class="pth-read-hdr"><span>${esc(pr.title)}</span><span class="pth-wc ${pr.wcOk ? 'is-ok' : 'is-warn'}">${pr.words} chữ · nên ${esc(pr.target)}</span></div>
        <div class="pth-mine">${esc(pr.text) || '<i class="pth-muted">(trống)</i>'}</div>
        <ul class="pth-check">${pr.frames.map(x => `<li class="${x.state}"><span class="pth-check-ic">${x.state === 'is-ok' ? '✓' : x.state === 'is-part' ? '~' : x.optional ? '·' : '✗'}</span><span class="pth-role">${esc(x.role)}</span>${x.optional ? '<span class="pth-opt">tuỳ chọn</span>' : ''} <span class="pth-check-en">${enHtml(x.best, { anchors: false })}</span></li>`).join('')}</ul>
      </div>`).join('')}
      ${me ? _modelEssayHtml(me) : ''}
      <div class="pth-actions"><button class="pth-btn" onclick="applyEdit()"><i class="fas fa-pen"></i> Sửa bài</button><button class="pth-btn pth-btn--primary" onclick="backToPath()">Về lộ trình <i class="fas fa-arrow-right"></i></button></div>
    </div>`;
  } else {
    body = `<div class="pth-card">
      ${prompt}
      <p class="pth-muted">Viết bài hoàn chỉnh bằng các khung câu vừa học, điền nội dung của đề vào chỗ <span class="pth-ph">(…)</span>. Bài thật cần <b>250–300 chữ</b>. Danh sách dưới mỗi ô tự đánh dấu <b>✓</b> khi bạn đã dùng một khung. Nộp xong sẽ so với bài mẫu.</p>
      ${paras.map((p, i) => `<div class="pth-asm-para">
        <div class="pth-read-hdr"><span>${esc(shortTitle(p.title))}</span><span class="pth-apply-tools"><span id="pth-wc-${i}">${_applyWordsHtml(i)}</span>${askBtn(`pth-apply-hint-${i}`, `applyHint(${i})`)}</span></div>
        <textarea class="pth-textarea" id="pth-apply-in-${i}" rows="${i === 0 || i === paras.length - 1 ? 4 : 7}" oninput="applyInput(${i},this)" placeholder="${escA(shortTitle(p.title))}...">${esc(r.texts[i])}</textarea>
        <ul class="pth-check pth-frames" id="pth-frames-${i}">${_applyFramesHtml(i)}</ul>
      </div>`).join('')}
      <div class="pth-actions">
        <span class="pth-muted pth-total">Tổng: <b id="pth-wc-total">${r.texts.reduce((s, t) => s + countWords(t), 0)}</b> chữ <span id="pth-autosave"></span></span>
        <button class="pth-btn" onclick="applySaveDraft()"><i class="fas fa-floppy-disk"></i> Lưu nháp</button>
        <button class="pth-btn pth-btn--primary" onclick="applySubmit()"><i class="fas fa-paper-plane"></i> Nộp & so với bài mẫu</button>
      </div>
    </div>`;
  }
  area().innerHTML = `${activityHeader(4)}<div class="pth-wrap">${body}</div>`;
}
function _modelEssayHtml(me) {
  const T2H = window.T2Highlight;
  const hl = !!(T2H && T2H.hasAny(me.sections));
  return `<details class="pth-model" open><summary>📖 Bài mẫu Band 7+${me.wordCount ? ' · ' + esc(me.wordCount) : ''}</summary>
    <div class="t2-g-essay${hl ? ' t2hl-root' + (T2H.isOff() ? ' t2hl-off' : '') : ''}">
      ${hl ? T2H.legend(me.sections) : ''}
      ${(me.sections || []).map(s => `<h5>${esc(s.title)}</h5><div>${hl ? T2H.html(s.text, s.highlights) : esc(s.text)}</div>`).join('')}
    </div></details>`;
}
function applySaveDraft() { _run.dirty = false; clearTimeout(_run.saveT); saveProg({ applyText: _run.texts }); showToast('Đã lưu nháp vào tài khoản.', 'info', 2000); }
function applyEdit() { _run.result = null; _run.finished = false; renderApply(); }

function applySubmit() {
  const paras = paragraphs();
  const words = _run.texts.reduce((s, t) => s + countWords(t), 0);
  if (words < 120) { showToast('Bài còn quá ngắn — hãy viết ít nhất 120 chữ trước khi nộp.', 'warn', 3000); return; }
  clearTimeout(_run.saveT);
  _run.dirty = false;
  let used = 0, total = 0;
  const resParas = paras.map((p, i) => {
    const frames = _applyFrames(i);
    frames.forEach(f => {
      if (f.optional && f.state !== 'is-ok') return; // bonus line — not counted when unused
      total++;
      if (f.state === 'is-ok') used++;
    });
    const tgt = paraTarget(i, paras.length);
    const n = countWords(_run.texts[i]);
    return { title: shortTitle(p.title), text: _run.texts[i].trim(), words: n, target: tgt.words, wcOk: n >= tgt.lo && n <= tgt.hi + 20, frames };
  });
  _run.result = { words, used, total, usedPct: total ? Math.round(used / total * 100) : 0, paras: resParas };
  _run.finished = true;
  completeStep('apply', { applyText: _run.texts });
  renderApply();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Recall runs: spaced review, weak lines, mock test ──────────
// review: up to 6 weakest sentences, band rules, one pass, schedules the next review.
// fix:    the given (or weakest practised) sentences, band rules, mastery only.
// exam:   every sentence, plain typing, no hints, one pass, 30-minute timer.
const EXAM_SECONDS = 30 * 60;
function startReview() {
  const pool = allSentences();
  const m = prog().mastery || {};
  const items = shuffle(pool).sort((a, b) => (m[a.key] || 0) - (m[b.key] || 0)).slice(0, Math.min(6, pool.length));
  _view = 'review';
  _run = { mode: 'review', items, pos: 0, results: [], pending: {}, start: Date.now() };
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function startFix(keys, from = '') {
  const items = (keys && keys.length ? keys.map(_sentence).filter(Boolean) : weakSentences()).slice(0, FIX_MAX);
  if (!items.length) { showToast('Chưa có câu yếu nào — luyện bước ③ trước nha!', 'info', 2500); return; }
  _leaveActivity();
  _view = 'fix';
  _run = { mode: 'fix', from, items, pos: 0, results: [], pending: {}, start: Date.now() };
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function toggleExamMode() {
  if (_view === 'exam') { examExit(); return; }
  _confirmLeave('Bắt đầu thi thử sẽ bỏ phần đang luyện dở của bước này.', () => {
    _leaveActivity();
    _view = 'exam';
    _run = { mode: 'exam', items: allSentences(), pos: 0, results: [], start: Date.now(), left: EXAM_SECONDS };
    _run.timer = setInterval(_examTick, 1000);
    render();
    showToast('⏱ Bắt đầu thi thử! Nhớ lại từng câu từ tiếng Việt — không có gợi ý.', 'info', 3000);
  });
}
function updateExamBtn() {
  const lbl = document.getElementById('tpl-exam-label');
  const btn = document.getElementById('tpl-exam-btn');
  if (lbl) lbl.textContent = _view === 'exam' ? 'Thoát thi thử' : 'Thi thử';
  if (btn) btn.classList.toggle('active', _view === 'exam');
}
function _examTick() {
  if (!_run || _view !== 'exam' || _run.finished) return;
  _run.left = EXAM_SECONDS - Math.floor((Date.now() - _run.start) / 1000);
  const el = document.getElementById('pth-exam-time');
  if (el) { el.textContent = fmtMMSS(_run.left); el.classList.toggle('warn', _run.left <= 300); }
  if (_run.left <= 0) { showToast('⏰ Hết giờ!', 'warn', 2500); _recallRunFinish(); }
}
function _stopTimers() { if (_run && _run.timer) { clearInterval(_run.timer); _run.timer = null; } }

function renderRecallRun() {
  const r = _run;
  const isExam = r.mode === 'exam';
  const title = r.mode === 'fix' ? '🎯 Luyện câu yếu' : '⚡ Ôn nhanh';
  const bar = isExam ? `<div class="t2-exam-bar">
      <span class="t2-exam-timer" id="pth-exam-time">${fmtMMSS(r.left)}</span>
      <span class="t2-exam-label"><i class="fas fa-clock"></i> ${esc((TYPE_META[_type] || {}).label || '')} · ${esc(TPL_DATA[_type].name)} · Thi thử</span>
      <button class="t2-exam-exit-btn" onclick="examExit()"><i class="fas fa-times"></i> Nộp bài</button>
    </div>` : `<div class="pth-act-hdr">
      <button class="pth-back" onclick="backToPath()"><i class="fas fa-arrow-left"></i> Lộ trình</button>
      <div class="pth-act-title">${title}</div><div class="pth-act-right">Câu ${Math.min(r.pos + 1, r.items.length)}/${r.items.length}</div>
    </div>`;
  if (r.finished) {
    const correct = r.results.filter(Boolean).length, total = r.results.length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const next = prog().nextReviewAt;
    const line = isExam
      ? (pct >= ASSEMBLE_PASS ? `Nhớ đúng ${correct}/${total} câu không cần gợi ý — trí nhớ của cậu xịn ghê! 🏆` : `Nhớ đúng ${correct}/${total} câu. Luyện câu yếu vài lượt rồi thi lại nha, Lulu tin cậu!`)
      : r.mode === 'fix' ? `Xong ${total} câu yếu, nhớ đúng ${correct}! ${r.from === 'assemble' ? 'Giờ ghép lại cả bài thử xem nha 💪' : 'Mấy câu này sẽ lên dần mức “thuộc” đó.'}`
      : `Ôn xong rồi! Nhớ đúng ${correct}/${total} câu. Hẹn cậu lần ôn tiếp theo nha 🗓️`;
    area().innerHTML = `${isExam ? '' : bar}<div class="pth-wrap"><div class="pth-card pth-done">
      ${isExam ? `<img src="${_examTierImageSrc(pct)}" alt="" loading="lazy" class="pth-tier-img">` : ''}
      ${luluSays(line, { pct, stacked: true, solo: false })}
      <div class="pth-score ${pct >= 60 ? 'is-ok' : 'is-bad'}">${pct}%</div>
      <p class="pth-muted">${correct}/${total} câu nhớ đúng${isExam ? ` · ⏱ ${fmtMMSS(r.secs)}` : ''}</p>
      ${isExam && pendingHomework(_type).length ? `<p class="pth-muted">${pct >= ASSEMBLE_PASS ? '✅ Đủ ≥ 70% số câu cho bài tập về nhà' + (STEP_KEYS.every(k => stepDone(k)) ? '.' : ' — còn cần học xong cả 5 bước.') : `Bài tập về nhà cần thuộc ≥ ${ASSEMBLE_PASS}% số câu.`}</p>` : ''}
      ${r.mode === 'review' && next ? `<p class="pth-muted">Lần ôn tiếp theo: <b>${new Date(next).toLocaleDateString('vi-VN')}</b></p>` : ''}
      <div class="pth-actions">
        ${isExam ? '<button class="pth-btn" onclick="toggleExamMode()"><i class="fas fa-redo"></i> Thi lại</button>' : ''}
        ${(isExam || r.mode === 'review') && weakSentences().length ? '<button class="pth-btn" onclick="startFix()"><i class="fas fa-crosshairs"></i> Luyện câu yếu</button>' : ''}
        ${r.mode === 'fix' && r.from === 'assemble' ? '<button class="pth-btn pth-btn--primary" onclick="_leaveActivity();startAssemble()"><i class="fas fa-pen-nib"></i> Ghép lại cả bài</button>' : ''}
        <button class="pth-btn ${r.mode === 'fix' && r.from === 'assemble' ? '' : 'pth-btn--primary'}" onclick="backToPath()">Về lộ trình <i class="fas fa-arrow-right"></i></button>
      </div>
    </div></div>`;
    return;
  }
  const s = r.items[r.pos];
  area().innerHTML = `${bar}<div class="pth-wrap"><div class="pth-card">
      <div class="pth-drill-meta"><span>Câu ${r.pos + 1} / ${r.items.length}</span><span class="pth-drill-tags"><span class="pth-chip">${esc(shortTitle(paragraphs()[s.si].title))}</span>${roleTag(s)}</span></div>
      <div class="pth-vi-prompt"><i class="fas fa-quote-left"></i> ${esc(s.vi)}</div>
      <div id="pth-item"></div>
    </div></div>`;
  const last = r.pos + 1 >= r.items.length;
  renderRecall(document.getElementById('pth-item'), s, {
    free: isExam || isB7(),
    hints: isExam ? 0 : RUN_HINTS,
    nextLabel: last ? 'Xem kết quả' : 'Câu tiếp',
    nextFn: 'recallRunNext()',
    passPct: isExam ? SENT_KNOWN : RECALL_PASS_B7,
    onDone: (ok, _d, hinted) => {
      r.results[r.pos] = ok;
      if (!isExam) bumpMastery(r.pending, s.key, ok && !hinted ? 1 : ok ? 0 : -1);
    },
  });
  if (isExam) { const g = document.getElementById('pth-giveup'); if (g) g.innerHTML = '<i class="fas fa-forward"></i> Bỏ qua'; }
}
function recallRunNext() {
  _unmountDrill();
  _run.pos++;
  if (_run.pos >= _run.items.length) { _recallRunFinish(); return; }
  renderRecallRun();
}
function examExit() {
  if (!_run || _view !== 'exam') return;
  if (_run.finished) { backToPath(); return; }
  _recallRunFinish();
}
function _recallRunFinish() {
  const r = _run;
  if (!r || r.finished) return;
  _stopTimers();
  _unmountDrill();
  r.finished = true;
  r.secs = Math.round((Date.now() - r.start) / 1000);
  const answered = r.results.filter(x => x !== undefined);
  const total = r.mode === 'exam' ? r.items.length : answered.length;
  const correct = r.results.filter(Boolean).length;
  // An exam counts every sentence (unanswered = wrong); a review only what was answered.
  if (r.mode === 'exam') r.results = r.items.map((_, i) => !!r.results[i]);
  if (r.mode === 'review' && total) {
    saveProg({ reviewDone: true, reviewScore: Math.round(correct / total * 100), mastery: r.pending });
    saveAttempt({ mode: 'review', total, correct, timeTakenSec: r.secs });
    updateXPStorage(5);
  }
  if (r.mode === 'fix' && total) {
    saveProg({ mastery: r.pending });
    updateXPStorage(3);
  }
  if (r.mode === 'exam' && answered.length) saveAttempt({ mode: 'path', total, correct, isExam: true, timeTakenSec: r.secs });
  updateExamBtn();
  renderRecallRun();
}
function _examTierImageSrc(pct) {
  return pct >= 90 ? 'img/vocab_writingabove90%25.jpg'
       : pct >= 50 ? 'img/writingbelow60%25.jpg'
       : pct >= 45 ? 'img/writingbelow50%25.jpg'
       : 'img/writingbelow45%25.jpg';
}

// ══════════════════════════════════════════════════════════════════
//  Reference material: type guide, full template, history
// ══════════════════════════════════════════════════════════════════
let _typeGuides = null;
let _typeGuidesPromise = null;
function _loadTypeGuides() {
  if (_typeGuides) return Promise.resolve(_typeGuides);
  if (_typeGuidesPromise) return _typeGuidesPromise;
  _typeGuidesPromise = fetch(`${API}/api/task2/type-guides`, { headers: authHeaders() })
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      _typeGuides = {};
      if (d && d.success && Array.isArray(d.guides)) d.guides.forEach(g => { _typeGuides[g.typeId] = g; });
      return _typeGuides;
    })
    .catch(() => { _typeGuides = {}; return _typeGuides; });
  return _typeGuidesPromise;
}
function renderTypeGuide() {
  const host = document.getElementById('tpl-guide-area');
  if (!host) return;
  _loadTypeGuides().then(map => {
    const g = map && map[_type];
    if (!g) { host.innerHTML = ''; return; }
    const sub = (icon, title, inner) => `<details class="t2-g-sec"><summary>${icon} ${esc(title)}</summary><div class="t2-g-inner">${inner}</div></details>`;
    const recognise = sub('🔍', 'Nhận diện đề',
      `<ul>${((g.recognise || {}).stems || []).map(s => `<li>${esc(s)}</li>`).join('')}</ul>` +
      ((g.recognise || {}).note ? `<div class="t2-g-note">${esc(g.recognise.note)}</div>` : ''));
    const outline = sub('🧭', 'Dàn ý',
      `<div class="t2-g-flow">${esc((g.outline || {}).flow)}</div>` +
      ((g.outline || {}).perBody ? `<div style="margin-top:6px">${esc(g.outline.perBody)}</div>` : ''));
    const upgrade = sub('🔼', 'Bảng nâng cấp câu: Band 6+ → Band 7+',
      `<div style="overflow-x:auto"><table class="t2-g-up"><thead><tr><th>Band 6+</th><th>Band 7+</th></tr></thead><tbody>` +
      (g.upgradePairs || []).map(p => `<tr><td>${esc(p[0])}</td><td>${esc(p[1])}</td></tr>`).join('') + `</tbody></table></div>`);
    const useful = sub('🧰', 'Useful language',
      (g.usefulLanguage || []).map(grp => `<div class="t2-g-ul-grp"><b>${esc(grp.label)}</b><ul>${(grp.lines || []).map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>`).join(''));
    const me = g.modelEssay || {};
    const essayText = (me.sections || []).map(s => `${s.title}\n${s.text}`).join('\n\n');
    const T2H = window.T2Highlight;
    const hl = !!(T2H && T2H.hasAny(me.sections));
    const model = sub('📝', 'Bài mẫu Band 7+' + (me.wordCount ? ' · ' + esc(me.wordCount) : ''),
      `<div class="t2-g-essay${hl ? ' t2hl-root' + (T2H.isOff() ? ' t2hl-off' : '') : ''}"><div class="t2-g-prompt">${esc(me.prompt)}</div>` +
      (hl ? T2H.legend(me.sections) : '') +
      (me.sections || []).map(s => `<h5>${esc(s.title)}</h5><div>${hl ? T2H.html(s.text, s.highlights) : esc(s.text)}</div>`).join('') +
      `<button class="t2-g-copy" onclick="_copyGuideEssay(this)" data-essay="${escA(essayText)}"><i class="fas fa-copy"></i> Chép cả bài</button></div>`);
    const mistakes = sub('⚠️', 'Lỗi thường gặp ở dạng này', `<ul>${(g.mistakes || []).map(m => `<li>${esc(m)}</li>`).join('')}</ul>`);
    host.innerHTML =
      `<details class="t2-guide"><summary><i class="fas fa-book-open"></i> Hướng dẫn dạng bài này — ${esc(g.name)}${g.nameVi ? ' · ' + esc(g.nameVi) : ''}</summary>` +
      `<div class="t2-guide-body">${recognise}${outline}${upgrade}${useful}${model}${mistakes}</div></details>`;
  });
}
function _copyGuideEssay(btn) {
  const txt = btn.getAttribute('data-essay') || '';
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => {
    const old = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check"></i> Đã chép';
    setTimeout(() => { btn.innerHTML = old; }, 1500);
  });
}

// "Xem đầy đủ" — the full template of this type (the same lines the path drills).
let _tplFullLevel = 'band6';
let _tplFullShowVi = false;
function _renderTplFullLevelBtns() {
  document.querySelectorAll('.tpl-full-level-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.level === _tplFullLevel));
}
async function _renderTplFullBody() {
  const body = document.getElementById('tpl-full-body');
  if (!body) return;
  if (!window.TASK2_GENERIC_TEMPLATES) body.innerHTML = '<div class="tpl-full-loading">⏳ Đang tải...</div>';
  let data = null;
  try { data = await Task2GenericTpl.load(); } catch {}
  body.innerHTML = data ? Task2GenericTpl.html(data, _tplFullLevel, _type, _tplFullShowVi)
    : '<p style="color:#e53935;text-align:center;padding:24px">Không tải được nội dung. Vui lòng thử lại.</p>';
}
async function switchTplFullLevel(level) { if (level === _tplFullLevel) return; _tplFullLevel = level; _renderTplFullLevelBtns(); await _renderTplFullBody(); }
function toggleTplFullVi() {
  _tplFullShowVi = !_tplFullShowVi;
  const lbl = document.getElementById('tpl-full-vi-label');
  if (lbl) lbl.textContent = _tplFullShowVi ? '🇻🇳 Ẩn tiếng Việt' : '🇻🇳 Hiện tiếng Việt';
  Task2GenericTpl.setVi(document.getElementById('tpl-full-body'), _tplFullShowVi);
}
function copyTplFullText() {
  const text = Task2GenericTpl.text(window.TASK2_GENERIC_TEMPLATES, _tplFullLevel, _type);
  if (!text) return;
  const ok = () => showToast('Đã sao chép văn bản!', 'info', 2500);
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok).catch(() => _copyFallback(text, ok));
  else _copyFallback(text, ok);
}
async function openTplFullView() {
  _tplFullLevel = _level;
  if (!document.getElementById('tpl-full-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'tpl-full-overlay';
    overlay.className = 'tpl-hist-overlay';
    overlay.innerHTML = `
      <div class="tpl-hist-box tpl-full-box">
        <div class="tpl-hist-hdr">
          <h3 class="tpl-hist-title"><i class="fas fa-file-lines"></i> Bản đầy đủ template</h3>
          <button class="tpl-hist-close" onclick="document.getElementById('tpl-full-overlay').style.display='none'"><i class="fas fa-times"></i></button>
        </div>
        <div class="tpl-full-toolbar">
          <div class="tpl-full-level-toggle">
            <button class="tpl-full-level-btn" data-level="band6" onclick="switchTplFullLevel('band6')">🌱 Band 6+</button>
            <button class="tpl-full-level-btn" data-level="band7" onclick="switchTplFullLevel('band7')">🏆 Band 7+</button>
          </div>
          <button class="t2-tpl-vi-btn-tab" onclick="toggleTplFullVi()"><span id="tpl-full-vi-label">🇻🇳 Hiện tiếng Việt</span></button>
          <button class="t2-tpl-vi-btn-tab" onclick="copyTplFullText()"><i class="fas fa-copy"></i> Sao chép văn bản</button>
        </div>
        <div id="tpl-full-body" class="tpl-hist-body tpl-full-body"></div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.body.appendChild(overlay);
  } else {
    document.getElementById('tpl-full-overlay').style.display = 'flex';
  }
  _renderTplFullLevelBtns();
  await _renderTplFullBody();
}

function openTplHistory() {
  if (!document.getElementById('tpl-hist-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'tpl-hist-overlay';
    overlay.className = 'tpl-hist-overlay';
    overlay.innerHTML = `
      <div class="tpl-hist-box">
        <div class="tpl-hist-hdr">
          <h3 class="tpl-hist-title"><i class="fas fa-history"></i> Lịch sử Task 2 Templates</h3>
          <button class="tpl-hist-close" onclick="document.getElementById('tpl-hist-overlay').style.display='none'"><i class="fas fa-times"></i></button>
        </div>
        <div id="tpl-hist-body" class="tpl-hist-body"></div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.body.appendChild(overlay);
  } else {
    document.getElementById('tpl-hist-overlay').style.display = 'flex';
  }
  loadTplHistory();
}
async function loadTplHistory() {
  const body = document.getElementById('tpl-hist-body');
  body.innerHTML = '<div class="tpl-hist-loading"><div class="tpl-hist-loading-icon">⏳</div><p>Đang tải...</p></div>';
  try {
    const res = await fetch(`${API}/api/task2template/history?limit=200`, { headers: authHeaders() });
    const data = await window.ApiClient.handleResponse(res);
    if (!data.success) throw new Error(data.message);
    const attempts = data.attempts || [];
    if (!attempts.length) { body.innerHTML = '<div class="tpl-hist-empty"><div class="tpl-hist-empty-icon">📭</div><p>Chưa có lịch sử luyện tập</p></div>'; return; }
    const totalCorrect = attempts.reduce((s, a) => s + (a.correctItems || 0), 0);
    const totalItems   = attempts.reduce((s, a) => s + (a.totalItems || 0), 0);
    const MODE_LABELS = { path: 'Ghép cả bài', review: 'Ôn nhanh', translation: 'Dịch câu', chunks: 'Chunks', build: 'Build', dictation: 'Dictation' };
    const rows = attempts.slice(0, 40).map(a => {
      const acc = a.totalItems > 0 ? Math.round((a.correctItems / a.totalItems) * 100) : 0;
      const badgeCls = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
      const date = new Date(a.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const label = a.isExam ? 'Thi thử' : (MODE_LABELS[a.mode] || (a.mode && a.mode !== 'cloze' ? a.mode : ''));
      const lvl = a.level === 'band6' ? ' · Band 6+' : ' · Band 7+';
      return `<div class="tpl-hist-entry">
        <div class="tpl-hist-date">${date}</div>
        <div class="tpl-hist-name">${esc(a.templateName || a.templateType || '–')}${esc(lvl)}${label ? `<span class="tpl-hist-mode-badge">${esc(label)}</span>` : ''}</div>
        <div class="tpl-hist-row"><span class="tpl-hist-score">${a.correctItems}/${a.totalItems} câu</span><span class="tpl-hist-badge tpl-hist-badge--${badgeCls}">${acc}%</span></div>
      </div>`;
    }).join('');
    body.innerHTML = `
      <div class="tpl-hist-stats">
        <div class="tpl-hist-stat"><div class="tpl-hist-stat-val">${attempts.length}</div><div class="tpl-hist-stat-lbl">Phiên học</div></div>
        <div class="tpl-hist-stat"><div class="tpl-hist-stat-val">${totalCorrect}/${totalItems}</div><div class="tpl-hist-stat-lbl">Đúng/Tổng</div></div>
        <div class="tpl-hist-stat"><div class="tpl-hist-stat-val">90</div><div class="tpl-hist-stat-lbl">Ngày lưu</div></div>
      </div>${rows}`;
  } catch (e) {
    body.innerHTML = `<p style="color:#e53935;text-align:center;padding:24px;font-size:13px">Không thể tải: ${esc(e.message)}</p>`;
  }
}
