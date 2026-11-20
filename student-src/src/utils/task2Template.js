// Task 2 Templates — rules and text maths shared by the page
// (pages/Task2Template.jsx). Ported from js/task2-template.js: same
// thresholds, same progress shape (backend Task2TemplateProgress), same
// localStorage key for the XP badge (t2_progress).

// Colours from the playful palette — the hero and the active tab take the
// colour of the open essay type.
export const TYPE_META = {
  type01: { label: 'Type 01', sub: 'Adv & Disadv',    icon: 'fa-scale-balanced',     color: '#4d63d8', desc: 'Phân tích ưu điểm và nhược điểm của một xu hướng hiện đại.' },
  type02: { label: 'Type 02', sub: 'Discuss Both',    icon: 'fa-comments',           color: '#7d62c9', desc: 'Thảo luận hai quan điểm đối lập và đưa ra ý kiến cá nhân.' },
  type03: { label: 'Type 03', sub: 'Cause–Solution',  icon: 'fa-lightbulb',          color: '#2a9d8f', desc: 'Phân tích nguyên nhân của một vấn đề và đề xuất giải pháp.' },
  type04: { label: 'Type 04', sub: 'Effect–Solution', icon: 'fa-gears',              color: '#cf5f57', desc: 'Phân tích tác động của vấn đề và đề xuất giải pháp khắc phục.' },
  type05: { label: 'Type 05', sub: 'Cause–Effect',    icon: 'fa-arrow-trend-up',     color: '#e07a3a', desc: 'Phân tích nguyên nhân và hậu quả của một hiện tượng xã hội.' },
  type06: { label: 'Type 06', sub: 'Agree/Disagree',  icon: 'fa-check-double',       color: '#2f9e5b', desc: 'Bày tỏ quan điểm đồng ý hoặc không đồng ý và bảo vệ lập trường.' },
  type07: { label: 'Type 07', sub: 'Pos/Neg Dev',     icon: 'fa-circle-half-stroke', color: '#d4689a', desc: 'Đánh giá xem một xu hướng là phát triển tích cực hay tiêu cực.' },
};
export const TYPE_IDS = Object.keys(TYPE_META);

export const STEPS = [
  { key: 'warmup',   num: '①', icon: 'fa-sitemap',     title: 'Khung bài',      desc: 'Mỗi đoạn có mấy câu, câu nào làm nhiệm vụ gì — rồi tự sắp xếp các câu theo đúng thứ tự.' },
  { key: 'read',     num: '②', icon: 'fa-headphones',  title: 'Đọc & nghe',     desc: 'Đọc từng câu của bản đầy đủ kèm nghĩa tiếng Việt, nghe phát âm, chú ý các từ khoá.' },
  { key: 'drill',    num: '③', icon: 'fa-layer-group', title: 'Luyện từng đoạn', desc: 'Mỗi đoạn 3 vòng: ghép cụm → điền chữ bị ẩn dần → nhớ lại cả câu từ tiếng Việt.' },
  { key: 'assemble', num: '④', icon: 'fa-pen-nib',     title: 'Ghép cả bài',    desc: 'Chỉ nhìn khung, viết lại cả đoạn từ trí nhớ. Máy so từng chữ với bản đầy đủ.' },
  { key: 'apply',    num: '⑤', icon: 'fa-flag-checkered', title: 'Áp dụng đề thật', desc: 'Viết bài cho một đề thật bằng các khung câu — Lulu đánh dấu khung nào bạn đã dùng.' },
];
export const STEP_KEYS = STEPS.map((s) => s.key);
export const DRILL_STAGES = ['Ghép cụm', 'Điền dần', 'Nhớ lại'];
// "Thuộc" (memorised) = a sentence recalled with >= SENT_KNOWN % of its words
// right. ④ and the mock test pass at >= ASSEMBLE_PASS % of the template's
// sentences memorised — the same bar the class homework tick uses
// (backend resourceCompletionService.checkTask2Templates).
export const SENT_KNOWN = 80;
export const ASSEMBLE_PASS = 70;
export const RECALL_PASS_B7 = 90; // % words right for a free-typed sentence to count in ③ (Band 7+)
export const LULU_MAX = 3;        // "Hỏi Lulu" per sentence / paragraph in graded drills
export const FIX_MAX = 8;         // sentences per "Luyện câu yếu" run
export const EXAM_SECONDS = 30 * 60;
export const HINTED_NOTE = 'Có Lulu giúp nên câu này sẽ quay lại cuối vòng — lần sau tự làm không gợi ý nha!';

// ── Small helpers ──────────────────────────────────────────────
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// Shuffle that never returns the original order (when there's more than one item).
export function shuffleNew(arr, same = (x, y) => x === y) {
  if (arr.length < 2) return arr.slice();
  for (let k = 0; k < 8; k++) {
    const s = shuffle(arr);
    if (s.some((x, i) => !same(x, arr[i]))) return s;
  }
  return arr.slice(1).concat(arr[0]);
}
export function fmtMMSS(secs) {
  secs = Math.max(0, Math.floor(secs));
  return String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
}

// Sentence tokens: "(placeholder)," counts as one fixed token the student
// never has to type; everything else is a word ("/" between two options too).
export function tokenize(sentence) {
  return (String(sentence).match(/\([^()]*\)\S*|\S+/g) || []).map((text) => {
    if (text.startsWith('(')) return { text, ph: true, lead: '', core: text, trail: '' };
    const m = text.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
    const core = m ? m[2] : text;
    return { text, ph: false, lead: m ? m[1] : '', core: core || text, trail: m ? m[3] : '' };
  });
}
export function normWord(w) {
  return String(w || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[–—]/g, '-')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}
export const stripPh = (s) => String(s || '').replace(/\([^()]*\)/g, ' ');
export function countWords(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
export function firstWords(s, n) { return stripPh(s.en).trim().split(/\s+/).filter((w) => w !== '/').slice(0, n).join(' ').replace(/[,;:.]+$/, ''); }
export function shortTitle(title) { return String(title || '').replace(/^[①②③④⑤⑥⑦⑧]\s*/, ''); }

export const STOPWORDS = new Set('a an the of in on at to for with by from and or but so as is are was were be been being it its this that these those they them their there which who can could may might will would should has have had do does did not than more most very also such into over some many much one two'.split(' '));

// Sentence role inside its paragraph — shown in ①/④/⑤ as the cue for each
// line. The book's own labels (Mở đề / Paraphrase đề / Nêu luận điểm) win.
function roleOf(text, si, secCount) {
  const s = String(text).trim();
  const intro = si === 0; const concl = si === secCount - 1;
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

// ── Essay outline in Vietnamese ("Sườn bài") ──────────────────
// What each paragraph of a real essay should say, per essay type — shown in
// ① and ④. Trusted HTML (<b>). Keys: intro / body1 / body2 / bodies (Band 7+
// Agree/Disagree has one "Body 1 & 2" section) / concl; missing keys fall
// back to OUTLINE_COMMON.
const OUTLINE_COMMON = {
  intro: 'Giới thiệu chủ đề, viết lại đề bằng từ của mình (paraphrase), rồi nói bài sẽ bàn về điều gì.',
  concl: 'Tóm lại các ý chính của 2 đoạn thân bài. Không đưa thêm ý mới.',
};
export const OUTLINE = {
  type01: {
    gist: 'Đề hỏi <b>ưu điểm và nhược điểm</b> của một xu hướng / hiện tượng. Thân bài chia đôi: một đoạn ưu, một đoạn nhược. Nếu đề hỏi thêm “ưu có lớn hơn nhược không?” thì phải nêu ý kiến ở mở bài và kết bài.',
    intro: 'Giới thiệu xu hướng, paraphrase đề, rồi nói bài sẽ phân tích cả ưu điểm lẫn nhược điểm.',
    body1: 'Viết <b>1–2 ưu điểm</b> của xu hướng: nêu ưu điểm → giải thích vì sao → kết quả tốt → ví dụ cụ thể.',
    body2: 'Viết <b>1–2 nhược điểm</b>: nêu nhược điểm → giải thích vì sao → hậu quả xấu → ví dụ cụ thể.',
    concl: 'Nhắc lại ưu điểm chính và nhược điểm chính. Nếu đề hỏi “outweigh” thì nói rõ bên nào lớn hơn.',
  },
  type02: {
    gist: 'Đề đưa ra <b>2 quan điểm trái ngược</b> (“Some people think… Others believe…”). Bài phải bàn <b>cả hai</b> một cách công bằng, rồi nói mình nghiêng về bên nào.',
    intro: 'Giới thiệu chủ đề, paraphrase 2 quan điểm, nói bài sẽ bàn cả hai và cho biết mình ủng hộ bên nào.',
    body1: 'Viết <b>2 lý do tại sao nhóm 1 ủng hộ quan điểm 1</b>: lý do → giải thích → kết quả → ví dụ. Viết khách quan (“Some people believe…”), chưa đưa ý kiến của mình vào.',
    body2: 'Viết <b>2 lý do tại sao nhóm 2 ủng hộ quan điểm 2</b>: lý do → giải thích → kết quả → ví dụ. Mở đoạn bằng từ chuyển ý (“On the other hand…”).',
    concl: 'Nhắc lại rằng cả hai bên đều có lý, rồi nói rõ <b>ý kiến của mình</b> và lý do chính.',
  },
  type03: {
    gist: 'Đề hỏi <b>nguyên nhân</b> của một vấn đề và <b>giải pháp</b> cho nó. Body 1 = nguyên nhân, Body 2 = giải pháp. Giải pháp tốt nhất là giải pháp “chữa” đúng nguyên nhân đã nêu.',
    intro: 'Giới thiệu vấn đề, nói bài sẽ phân tích nguyên nhân và đề xuất giải pháp.',
    body1: 'Viết <b>2 nguyên nhân</b> gây ra vấn đề: nguyên nhân 1 → giải thích → hậu quả → ví dụ; rồi nguyên nhân 2.',
    body2: 'Viết <b>2 giải pháp</b>, mỗi giải pháp nhắm vào một nguyên nhân ở Body 1: cần làm gì → giúp được gì → kết quả tốt.',
    concl: 'Tóm lại 2 nguyên nhân chính và 2 giải pháp.',
  },
  type04: {
    gist: 'Đề hỏi vấn đề <b>gây ra hậu quả gì</b> và <b>giải pháp</b>. Body 1 = hậu quả, Body 2 = giải pháp để giảm những hậu quả đó.',
    intro: 'Giới thiệu vấn đề và nó ảnh hưởng tới ai (con người / xã hội / môi trường), nói bài sẽ bàn hậu quả và giải pháp.',
    body1: 'Viết <b>2 hậu quả</b> của vấn đề: hậu quả 1 → giải thích → hệ quả tiếp theo → ví dụ; rồi hậu quả 2.',
    body2: 'Viết <b>2 giải pháp</b> giúp giảm các hậu quả ở Body 1: cần làm gì → giúp được gì → kết quả tốt.',
    concl: 'Nhắc lại vấn đề gây hậu quả nghiêm trọng nhưng có thể giảm bớt bằng 2 giải pháp đã nêu.',
  },
  type05: {
    gist: 'Đề hỏi <b>nguyên nhân</b> và <b>hậu quả</b> của một hiện tượng. Body 1 = vì sao nó xảy ra, Body 2 = nó gây ra điều gì.',
    intro: 'Giới thiệu hiện tượng, nói bài sẽ phân tích nguyên nhân và hậu quả của nó.',
    body1: 'Viết <b>2 nguyên nhân</b> khiến hiện tượng xảy ra: nguyên nhân 1 → giải thích → ví dụ; rồi nguyên nhân 2.',
    body2: 'Viết <b>2 hậu quả</b>: ảnh hưởng tới ai, ngắn hạn và lâu dài ra sao, kèm ví dụ hoặc dẫn chứng.',
    concl: 'Tóm lại nguyên nhân chính và hậu quả chính, nhấn mạnh đây là vấn đề cần quan tâm.',
  },
  type06: {
    gist: 'Đề đưa ra <b>một ý kiến</b> và hỏi bạn đồng ý tới mức nào. Chọn <b>một lập trường rõ ràng</b> (đồng ý / không đồng ý / đồng ý một phần), nói ngay ở mở bài và giữ nguyên tới hết bài — cả 2 đoạn thân bài đều để bảo vệ lập trường đó.',
    intro: 'Giới thiệu chủ đề, paraphrase ý kiến trong đề, nêu rõ <b>lập trường của mình</b> (chọn một trong các câu phương án).',
    body1: 'Viết <b>lý do 1</b> vì sao mình đồng ý (hoặc không đồng ý): lý do → giải thích → kết quả → ví dụ.',
    body2: 'Viết <b>lý do 2</b> — một lý do khác cũng ủng hộ lập trường của mình: lý do → giải thích → kết quả → ví dụ.',
    bodies: 'Viết <b>2 đoạn, mỗi đoạn là 1 lý do</b> ủng hộ lập trường của mình: nêu lý do → vì sao quan trọng → giải thích + ví dụ → dẫn chứng. Nhắm Band 7.5+ thì thêm câu phản biện: nêu ý kiến ngược lại rồi bác bỏ nó.',
    concl: 'Nhắc lại lập trường và 2 lý do chính. Không đổi lập trường so với mở bài.',
  },
  type07: {
    gist: 'Đề hỏi một xu hướng là phát triển <b>tích cực hay tiêu cực</b>. Chọn một bên, nói ngay ở mở bài. Body 1 bảo vệ lựa chọn của mình, Body 2 thừa nhận mặt ngược lại rồi khẳng định lại.',
    intro: 'Giới thiệu xu hướng và ảnh hưởng của nó, nói rõ đây là <b>positive hay negative</b> và vì 2 lý do nào.',
    body1: 'Viết <b>2 lý do</b> vì sao mình thấy xu hướng này tích cực (hoặc tiêu cực): lý do 1 → giải thích → kết quả → ví dụ; rồi lý do 2.',
    body2: '<b>Thừa nhận mặt ngược lại</b> (bài positive thì nêu một nhược điểm, bài negative thì nêu một lợi ích) và giải thích ngắn, rồi <b>khẳng định lại</b> rằng mặt đó không lớn bằng → lập trường vẫn đúng.',
    concl: 'Nhắc lại tích cực / tiêu cực và lý do; có thể nói xu hướng này sẽ ra sao trong tương lai.',
  },
};
function outlineKind(title) {
  const t = String(title || '');
  if (/Introduction/i.test(t)) return 'intro';
  if (/Conclusion/i.test(t)) return 'concl';
  if (/Body 1\s*&\s*2/i.test(t)) return 'bodies';
  if (/Body 1/i.test(t)) return 'body1';
  if (/Body 2/i.test(t)) return 'body2';
  return '';
}
// Vietnamese "what to write here" for a paragraph (trusted HTML)
export function outlineFor(p, typeId) {
  const kind = outlineKind(p.title);
  const o = OUTLINE[typeId] || {};
  return o[kind] || OUTLINE_COMMON[kind] || '';
}

// Recommended size of each paragraph in a real essay (not the template).
export function paraTarget(si, secCount) {
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
function optName(label) {
  if (/NEGATIVE/i.test(label)) return 'Bài NEGATIVE';
  if (/một phần/i.test(label)) return 'Đồng ý một phần';
  if (/hoàn toàn/i.test(label)) return 'Đồng ý / không đồng ý hoàn toàn';
  if (/7\.5/.test(label)) return 'Band 7.5+ · tuỳ chọn';
  return label;
}
// Key words: the (up to 3) longest content words — underlined in ② and
// hidden first in ③.
function anchorsOf(en) {
  const words = tokenize(en).filter((t) => !t.ph).map((t) => normWord(t.core)).filter((w) => w.length >= 5 && !STOPWORDS.has(w));
  const uniq = [...new Set(words)];
  return new Set(uniq.map((w, i) => [w, i]).sort((a, b) => b[0].length - a[0].length || a[1] - b[1]).slice(0, 3).map((x) => x[0]));
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
      const isOpt = !!label && !ROLE_LABELS.has(label);
      const s = {
        si, ii, key: `${si}-${ii}`, en, vi, role: ROLE_LABELS.has(label) ? label : roleOf(en, si, n),
        opt: isOpt ? optName(label) : '', optional: /7\.5/.test(label), alt: null, anchors: anchorsOf(en),
      };
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
// One level of js/task2-generic-templates.js → { types: [{id,label,sub,name}], byId: {typeId: {name, paras}} }
export function buildLevel(data, level) {
  const lv = data && data[level];
  if (!lv) return null;
  const types = TYPE_IDS.filter((id) => lv[id]).map((id) => ({ id, label: TYPE_META[id].label, sub: TYPE_META[id].sub, name: lv[id].name }));
  if (!types.length) return null;
  const byId = {};
  types.forEach((t) => { byId[t.id] = buildType(lv[t.id]); });
  return { types, byId };
}
export const allSentencesOf = (tpl) => (tpl ? tpl.paras.flatMap((p) => p.sentences) : []);

// ── Word-level diff (placeholders ignored, "a / b" = either) ────
// target: [{w, alts, sid}]
export function targetWords(sentences) {
  const out = [];
  sentences.forEach((s) => {
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
export function typedWords(text) {
  return stripPh(text).split(/\s+/).filter(Boolean).map((w) => ({ w, n: normWord(w) })).filter((x) => x.n);
}
// → { ops, matched[], pct } where matched[i] tells whether target word i was written correctly
export function alignWords(target, typedText) {
  const typed = typedWords(typedText);
  const a = target.map((t) => t.alts); const b = typed.map((t) => t.n);
  const n = a.length; const m = b.length;
  const eq = (i, j) => a[i].includes(b[j]);
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) dp[i][j] = eq(i, j) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const raw = []; const matched = new Array(n).fill(false);
  let i = 0; let j = 0;
  while (i < n && j < m) {
    if (eq(i, j)) { raw.push({ type: 'ok', word: typed[j].w }); matched[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { raw.push({ type: 'miss', word: target[i].w }); i++; } else { raw.push({ type: 'extra', word: typed[j].w }); j++; }
  }
  while (i < n) { raw.push({ type: 'miss', word: target[i].w }); i++; }
  while (j < m) { raw.push({ type: 'extra', word: typed[j].w }); j++; }
  const ops = [];
  for (let k = 0; k < raw.length; k++) {
    const c = raw[k]; const d = raw[k + 1];
    if (d && ((c.type === 'miss' && d.type === 'extra') || (c.type === 'extra' && d.type === 'miss'))) {
      ops.push({ type: 'wrong', word: (c.type === 'extra' ? c : d).word, expected: (c.type === 'miss' ? c : d).word }); k++;
    } else ops.push(c);
  }
  const right = matched.filter(Boolean).length;
  return { ops, matched, pct: n ? Math.round((right / n) * 100) : 100 };
}

// What the letter-by-letter drill (Band 6+ recall) asks the student to type:
// placeholders are not typed — they show as "…" glued to the word before;
// "agree / disagree" becomes one "agree/disagree" word.
export function wbwAnswer(en) {
  const out = [];
  let pending = '';
  tokenize(en).forEach((t) => {
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

// Next missing word for a typed answer — Lulu reveals one more letter each
// ask. `shown` (per target-word letter counts) is updated in place.
export function wordHint(target, typedText, shown) {
  const d = alignWords(target, typedText);
  const idx = d.matched.findIndex((x) => !x);
  if (idx < 0) return { done: true };
  const word = target[idx].w.split(' / ')[0].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9']+$/g, '');
  shown[idx] = Math.min(word.length, Math.max(1, shown[idx] || 0) + 1);
  const full = shown[idx] >= word.length;
  const before = idx > 0 ? target[idx - 1].w.split(' / ')[0].replace(/[,.;:]+$/, '') : '';
  const where = before ? `Sau “${before}”` : 'Từ đầu tiên';
  return { done: false, text: full ? `${where} là chữ “${word}” nè 💪` : `${where} là một chữ bắt đầu bằng “${word.slice(0, shown[idx])}…” nè 🍊` };
}

// ③ Ghép cụm: the chunks of one sentence, in order
export function chunkSentence(sentence) {
  const BOUND = new Set(['of', 'in', 'on', 'for', 'with', 'to', 'from', 'at', 'by', 'that', 'which', 'and', 'but', 'because', 'so', 'while', 'although', 'as', 'if', 'than', 'after', 'before', 'when']);
  const toks = tokenize(sentence).map((t) => t.text);
  const chunks = []; let cur = [];
  toks.forEach((w, i) => {
    const bare = normWord(w);
    if (i > 0 && !w.startsWith('(') && BOUND.has(bare) && cur.length >= 2) { chunks.push(cur.join(' ')); cur = [w]; } else { cur.push(w); if (/[,.;]$/.test(w) && cur.length >= 3) { chunks.push(cur.join(' ')); cur = []; } }
  });
  if (cur.length) chunks.push(cur.join(' '));
  const merged = [];
  chunks.forEach((c) => { if (merged.length && c.split(' ').length <= 1) merged[merged.length - 1] += ' ' + c; else merged.push(c); });
  if (merged.length >= 3) return merged;
  // Short sentence: pairs of words instead.
  const pairs = [];
  for (let i = 0; i < toks.length; i += 2) pairs.push(toks.slice(i, i + 2).join(' '));
  return pairs;
}
// A Ghép cụm item: the target chunks and the shuffled bank
export function buildItem(s) {
  const pieces = chunkSentence(s.en).map((text, i) => ({ id: i, text }));
  return { target: pieces.map((p) => p.text), bank: shuffleNew(pieces, (a, b) => a.text === b.text) };
}
// ③ Điền dần: which token indexes are blank. lvl 1 ≈ 30% (key words first), lvl 2 ≈ 60%.
export function fadeBlanks(s, lvl) {
  const toks = tokenize(s.en);
  const cand = toks.map((t, i) => i).filter((i) => !toks[i].ph && normWord(toks[i].core).length >= 2);
  const need = Math.max(1, Math.round(cand.length * (lvl === 1 ? 0.3 : 0.6)));
  const anchors = cand.filter((i) => s.anchors.has(normWord(toks[i].core)));
  const rest = shuffle(cand.filter((i) => !anchors.includes(i)));
  if (lvl === 1) rest.sort((a, b) => (STOPWORDS.has(normWord(toks[a].core)) ? 1 : 0) - (STOPWORDS.has(normWord(toks[b].core)) ? 1 : 0));
  return anchors.concat(rest).slice(0, Math.max(need, Math.min(anchors.length, need + 1)));
}

// ── ⑤ Áp dụng: which template frames a paragraph already uses ──
// How much of one sentence's fixed wording (placeholders removed) appears,
// in order, in the student's paragraph — 0..1.
function frameCoverage(sentence, paraWords) {
  const a = targetWords([sentence]).map((t) => t.alts);
  if (!a.length) return 0;
  const b = paraWords; const n = a.length; const m = b.length;
  let prev = new Uint16Array(m + 1); let cur = new Uint16Array(m + 1);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) cur[j] = a[i - 1].includes(b[j - 1]) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    [prev, cur] = [cur, prev];
  }
  return prev[m] / n;
}
// Options of one slot count once; "tuỳ chọn" lines are a bonus.
export function applyFrames(p, text) {
  const pw = typedWords(text || '').map((x) => x.n);
  const groups = [];
  p.sentences.forEach((s) => {
    const cov = pw.length ? frameCoverage(s, pw) : 0;
    const g = s.alt != null ? groups.find((x) => x.alt === s.alt) : null;
    if (g) { g.options.push(s); if (cov > g.cov) { g.best = s; g.cov = cov; } } else groups.push({ id: s.key, alt: s.alt, role: s.role, optional: s.optional, best: s, options: [s], cov });
  });
  groups.forEach((g) => { g.state = g.cov >= 0.7 ? 'is-ok' : g.cov >= 0.4 ? 'is-part' : 'is-miss'; });
  return groups;
}

// ── Progress (backend Task2TemplateProgress, one row per type and level) ──
export function emptyProg(typeId, level) {
  return { typeId, level, steps: {}, drillRounds: [], mastery: {}, warmupScore: 0, assembleBest: 0, applyText: [], reviewStage: 0, nextReviewAt: null };
}
// The row after a PUT patch, as the server will store it (applied locally
// first so the screen moves at once).
export function mergeProg(row, patch) {
  const p = JSON.parse(JSON.stringify(row));
  const now = new Date().toISOString();
  p.steps = p.steps || {}; p.drillRounds = p.drillRounds || []; p.mastery = p.mastery || {};
  if (patch.steps) STEP_KEYS.forEach((k) => { if (patch.steps[k] && !p.steps[k]) p.steps[k] = now; });
  if (patch.drillRounds) patch.drillRounds.forEach((v, i) => { p.drillRounds[i] = Math.max(p.drillRounds[i] || 0, v || 0); });
  if (patch.mastery) Object.assign(p.mastery, patch.mastery);
  if (patch.warmupScore != null) p.warmupScore = Math.max(p.warmupScore || 0, patch.warmupScore);
  if (patch.assembleBest != null) p.assembleBest = Math.max(p.assembleBest || 0, patch.assembleBest);
  if (patch.applyText) p.applyText = patch.applyText.slice();
  return p;
}
// Mastery 0..5 per sentence: a run collects changes in `pending` and sends them with the next save.
export function bumpMastery(pending, key, delta, floor, current) {
  const cur = pending[key] != null ? pending[key] : current;
  return { ...pending, [key]: Math.min(5, Math.max(floor || 0, 0, cur + delta)) };
}
export const stepDone = (row, key) => !!(row.steps || {})[key];
export const stepUnlocked = (row, i) => i === 0 || stepDone(row, STEP_KEYS[i - 1]);
export const allStepsDone = (row) => STEP_KEYS.every((k) => stepDone(row, k));
export function typePct(row, nParas) {
  const n = nParas || 1;
  let done = STEP_KEYS.filter((k) => stepDone(row, k)).length;
  if (!stepDone(row, 'drill')) done += Math.min(1, (row.drillRounds || []).reduce((s, r) => s + Math.min(3, r || 0), 0) / (n * 3));
  return Math.round((done / STEP_KEYS.length) * 100);
}
export function reviewDue(row) {
  return !!(stepDone(row, 'assemble') && row.nextReviewAt && new Date(row.nextReviewAt) <= new Date());
}
export function knownCount(row, tpl) {
  const m = row.mastery || {};
  return allSentencesOf(tpl).filter((s) => (m[s.key] || 0) >= 3).length;
}
// Lines already practised but not memorised yet, weakest first.
export function weakSentences(row, tpl) {
  const m = row.mastery || {};
  return allSentencesOf(tpl).filter((s) => m[s.key] != null && m[s.key] < 3).sort((a, b) => (m[a.key] || 0) - (m[b.key] || 0));
}

// ── Address: /app/task2-template?type=&level= ──
export function stateFromSearch(search) {
  const q = new URLSearchParams(search);
  const t = q.get('type');
  return { type: t && TYPE_META[t] ? t : null, level: q.get('level') === 'band7' ? 'band7' : 'band6' };
}
export function queryFor(type, level) {
  const q = new URLSearchParams();
  if (type && type !== 'type01') q.set('type', type);
  if (level !== 'band6') q.set('level', level);
  const s = q.toString();
  return s ? '?' + s : '';
}

// Class homework of type task2_template: resourceCode "typeId||level"
export function homeworkFrom(assignments) {
  const out = [];
  (assignments || []).forEach((a) => (a.resources || []).forEach((r) => {
    if (r.resourceType !== 'task2_template') return;
    const [typeId, level] = String(r.resourceCode || '').split('||');
    if (!typeId) return;
    out.push({ key: `${a._id}:${r.itemId}`, title: a.title || '', className: a.className || '', deadline: a.deadline || null, typeId, level: level || 'band7', completed: !!r.completed });
  }));
  return out;
}

// ── XP badge (local only, as before) ──
export function loadXP() {
  try {
    const v = JSON.parse(localStorage.getItem('t2_progress'));
    return { xp: (v && v.xp) || 0, streak: (v && v.streak) || 0 };
  } catch { return { xp: 0, streak: 0 }; }
}
export function addXP(earned) {
  let stored = { xp: 0, streak: 0 };
  try { stored = JSON.parse(localStorage.getItem('t2_progress')) || stored; } catch { /* corrupt */ }
  stored.xp = (stored.xp || 0) + earned;
  try { localStorage.setItem('t2_progress', JSON.stringify(stored)); } catch { /* private mode */ }
  return { xp: stored.xp || 0, streak: stored.streak || 0 };
}

export function examTierImage(pct) {
  return pct >= 90 ? '/img/cheer/cheer-top.jpg'
    : pct >= 50 ? '/img/cheer/cheer-ok.jpg'
      : pct >= 45 ? '/img/cheer/cheer-try.jpg'
        : '/img/cheer/cheer-rest.jpg';
}

export const MODE_LABELS = { path: 'Ghép cả bài', review: 'Ôn nhanh', translation: 'Dịch câu', chunks: 'Chunks', build: 'Build', dictation: 'Dictation' };
