// Reading-check quizzes for the Task 2 type guide. One quiz per guide
// section; a section opens once the one before it is passed (>= GUIDE_PASS %)
// and the 5-step path opens once all six are passed (backend
// services/task2GuideQuizService.js keeps the results).
//
// Each quiz = the hand-written questions for that section
// (guideQuizBank.js) + questions built from the guide's own content, topped
// up to QUIZ_SIZE with "which type is this prompt / what must it contain?"
// drills — recognising the question is the skill that matters most.
import { BANK, CONFUSE, PROMPTS, TYPE_NAME, WRITE } from './guideQuizBank';

export const GUIDE_SECTIONS = [
  { key: 'recognise', icon: '🔍', title: 'Nhận diện đề' },
  { key: 'outline',   icon: '🧭', title: 'Dàn ý' },
  { key: 'upgrade',   icon: '🔼', title: 'Bảng nâng cấp câu: Band 6+ → Band 7+' },
  { key: 'language',  icon: '🧰', title: 'Useful language' },
  { key: 'essay',     icon: '📝', title: 'Bài mẫu Band 7+' },
  { key: 'mistakes',  icon: '⚠️', title: 'Lỗi thường gặp ở dạng này' },
];
export const GUIDE_KEYS = GUIDE_SECTIONS.map((s) => s.key);
export const GUIDE_PASS = 90;
export const QUIZ_SIZE = 10;

export const passedPct = (correct, total) => total > 0 && correct * 100 >= total * GUIDE_PASS;
export const sectionPassed = (qp, key) => !!(qp && qp.sections && qp.sections[key] && qp.sections[key].passedAt);
export const guidePassedCount = (qp) => GUIDE_KEYS.filter((k) => sectionPassed(qp, k)).length;
export const guideAllPassed = (qp) => guidePassedCount(qp) === GUIDE_KEYS.length;
export const sectionOpen = (qp, i) => i === 0 || sectionPassed(qp, GUIDE_KEYS[i - 1]);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uniq = (arr) => [...new Set(arr)];

// → { q, prompt?, opts, answer, why, tag? }
function mcq(q, ok, no, why, extra = {}) {
  const wrong = uniq(no.filter((x) => x && x !== ok)).slice(0, 3);
  return { q, opts: shuffle([ok, ...wrong]), answer: ok, why, ...extra };
}
function fromBank(it) {
  if (typeof it.tf === 'boolean') return { q: it.q, opts: ['Đúng', 'Sai'], answer: it.tf ? 'Đúng' : 'Sai', why: it.why, tf: true };
  return mcq(it.q, it.ok, it.no, it.why);
}

// ── Recognition drills ──
function classifyQ(p, tag) {
  return mcq('Đề này thuộc dạng nào?', TYPE_NAME[p.t], CONFUSE[p.t].map((t) => TYPE_NAME[t]),
    `Dấu hiệu: "${p.cue}" → ${TYPE_NAME[p.t]}. Cần viết: ${WRITE[p.t]}.`, { prompt: p.p, tag });
}
function writeQ(p, tag) {
  return mcq('Với đề này, bài viết cần làm gì?', WRITE[p.t], CONFUSE[p.t].map((t) => WRITE[t]),
    `Dấu hiệu: "${p.cue}" → ${TYPE_NAME[p.t]}.`, { prompt: p.p, tag });
}
// Stems from the guide: "which question belongs to this type?"
function stemQ(typeId, guides) {
  const own = ((guides[typeId] || {}).recognise || {}).stems || [];
  const clean = (s) => !/^Dấu hiệu/i.test(s);
  const ok = pick(own.filter(clean));
  if (!ok) return null;
  const wrong = CONFUSE[typeId].map((t) => pick((((guides[t] || {}).recognise || {}).stems || []).filter(clean))).filter(Boolean);
  if (wrong.length < 2) return null;
  return mcq(`Câu hỏi nào dưới đây là dấu hiệu của dạng ${TYPE_NAME[typeId]}?`, ok, wrong,
    `Các câu hỏi đặc trưng của dạng này: ${own.filter(clean).map((s) => `"${s}"`).join(' · ')}`);
}
// Review drills to top a quiz up (half on this type and its look-alikes)
function reviewQs(typeId, n, used) {
  const near = new Set([typeId, ...CONFUSE[typeId]]);
  const pool = shuffle(PROMPTS.filter((p) => !used.has(p.p)));
  const ordered = [...pool.filter((p) => near.has(p.t)), ...pool.filter((p) => !near.has(p.t))];
  const out = [];
  for (const p of ordered) {
    if (out.length >= n) break;
    used.add(p.p);
    out.push(out.length % 2 ? writeQ(p, '🔁 Ôn nhận diện đề') : classifyQ(p, '🔁 Ôn nhận diện đề'));
  }
  return out;
}

// ── Built from the guide ──
function outlineQs(g, guides, typeId) {
  const out = [];
  const flow = String((g.outline || {}).flow || '');
  const parts = flow.split(/\s*→\s*/).filter(Boolean);
  if (parts.length >= 3) {
    const seen = new Set([parts.join(' → ')]);
    const wrong = [];
    for (let k = 0; k < 30 && wrong.length < 3; k++) {
      const s = shuffle(parts).join(' → ');
      if (!seen.has(s)) { seen.add(s); wrong.push(s); }
    }
    out.push(mcq('Dàn ý cả bài của dạng này theo thứ tự nào?', parts.join(' → '), wrong, `Dàn ý: ${flow}`));
  }
  // "BODY 1: ADVANTAGES" → what does Body 1 cover?
  const bodies = (f) => String(f || '').split(/\s*→\s*/).map((s) => /^BODY\s*(\d)\s*:\s*(.+)$/.exec(s)).filter(Boolean).map((m) => ({ n: m[1], what: m[2].trim() }));
  const own = bodies(flow);
  const others = uniq(Object.keys(guides).filter((t) => t !== typeId).flatMap((t) => bodies((guides[t].outline || {}).flow).map((b) => b.what)))
    .filter((w) => !own.some((o) => o.what === w));
  own.forEach((b) => {
    const twin = own.filter((o) => o.n !== b.n).map((o) => o.what);
    out.push(mcq(`Theo dàn ý, BODY ${b.n} của dạng này viết về gì?`, b.what, [...twin, ...shuffle(others)], `Dàn ý: ${flow}`));
  });
  return out;
}

function upgradeQs(g) {
  const pairs = (g.upgradePairs || []).filter((p) => p && p[0] && p[1]);
  if (pairs.length < 4) return [];
  return shuffle(pairs).slice(0, QUIZ_SIZE).map((p, i) => {
    const why = `Band 6+: ${p[0]}  →  Band 7+: ${p[1]}`;
    if (i % 2 === 0) {
      return mcq('Bản nâng cấp Band 7+ của câu Band 6+ này là câu nào?', p[1], shuffle(pairs.filter((x) => x !== p).map((x) => x[1])), why, { prompt: p[0], promptLabel: 'Band 6+' });
    }
    return mcq('Câu Band 7+ này được nâng cấp từ câu Band 6+ nào?', p[0], shuffle(pairs.filter((x) => x !== p).map((x) => x[0])), why, { prompt: p[1], promptLabel: 'Band 7+' });
  });
}

function languageQs(g) {
  const groups = (g.usefulLanguage || []).filter((x) => x && x.label && (x.lines || []).length);
  if (groups.length < 2) return [];
  const labels = groups.map((x) => x.label);
  const lines = groups.flatMap((x) => x.lines.map((l) => ({ label: x.label, text: String(l).replace(/\s+—\s+.*$/, '').trim() })));
  const counted = new Map();
  lines.forEach((l) => counted.set(l.text, (counted.get(l.text) || 0) + 1));
  return shuffle(lines.filter((l) => l.text && counted.get(l.text) === 1)).slice(0, 8)
    .map((l) => mcq('Cụm / mẫu câu này nằm trong nhóm nào của Useful language?', l.label, labels.filter((x) => x !== l.label), `Nhóm "${l.label}".`, { prompt: l.text }));
}

// Sentence roles on the colour-coded model essay, by kind (Idea 1 / Idea 2
// are both "Idea" — the sentence alone can't tell which one it is).
const ROLE_KIND = {
  hook: 'Hook — câu dẫn vào chủ đề', thesis: 'Thesis — nêu hướng bài / quan điểm',
  topic: 'Topic sentence — câu chủ đề của đoạn', idea1: 'Idea — nêu một ý chính', idea2: 'Idea — nêu một ý chính',
  support1: 'Support — giải thích / ví dụ cho ý', support2: 'Support — giải thích / ví dụ cho ý',
  restate: 'Restatement — nhắc lại quan điểm ở kết bài', final: 'Final — câu chốt cuối bài',
};
const KINDS = uniq(Object.values(ROLE_KIND));
function essayQs(g) {
  const secs = ((g.modelEssay || {}).sections || []).filter((s) => s && s.title && s.text);
  const out = [];
  const titles = secs.map((s) => s.title);
  const hl = secs.flatMap((s) => (s.highlights || []).filter((h) => ROLE_KIND[h.role] && h.text && h.text.length > 25).map((h) => ({ ...h, title: s.title })));
  // Which paragraph is this sentence from? (one per paragraph, up to 3)
  if (titles.length >= 3) {
    const bySec = shuffle(secs).slice(0, 3);
    bySec.forEach((s) => {
      const cands = (s.highlights && s.highlights.length ? s.highlights.map((h) => h.text) : String(s.text).split(/(?<=[.!?])\s+(?=[A-Z])/)).filter((t) => t.length > 40);
      const sent = pick(cands);
      if (sent) out.push(mcq('Câu này nằm ở đoạn nào của bài mẫu?', s.title, titles.filter((t) => t !== s.title), `Câu này thuộc đoạn ${s.title}.`, { prompt: sent }));
    });
  }
  // What job does this sentence do?
  const usedText = new Set(out.map((x) => x.prompt));
  shuffle(hl).filter((h) => !usedText.has(h.text)).slice(0, 4).forEach((h) => {
    const ok = ROLE_KIND[h.role];
    out.push(mcq('Trong bài mẫu, câu này đóng vai trò gì?', ok, shuffle(KINDS.filter((k) => k !== ok)),
      `Bài mẫu tô màu câu này là "${ok}" (đoạn ${h.title}).`, { prompt: h.text, promptLabel: h.title }));
  });
  return out;
}

// One quiz for one section of one type's guide.
export function buildSectionQuiz(section, typeId, guides) {
  const g = guides[typeId] || {};
  const bank = (BANK[typeId] || {})[section] || [];
  const used = new Set();
  let qs = bank.map(fromBank);
  if (section === 'recognise') {
    const own = shuffle(PROMPTS.filter((p) => p.t === typeId));
    const near = shuffle(PROMPTS.filter((p) => CONFUSE[typeId].includes(p.t)));
    const s = stemQ(typeId, guides);
    if (s) qs.push(s);
    // 3 hand-written + 1 stem + 2 classify (this type) + 2 classify (look-alikes) + 2 "what must it contain?"
    own.slice(0, 2).forEach((p) => { used.add(p.p); qs.push(classifyQ(p)); });
    near.slice(0, 2).forEach((p) => { used.add(p.p); qs.push(classifyQ(p)); });
    own.slice(2, 4).forEach((p) => { used.add(p.p); qs.push(writeQ(p)); });
  } else if (section === 'outline') qs = [...qs, ...outlineQs(g, guides, typeId)];
  else if (section === 'upgrade') qs = [...qs, ...upgradeQs(g)];
  else if (section === 'language') qs = [...qs, ...languageQs(g)];
  else if (section === 'essay') qs = [...qs, ...essayQs(g)];
  qs = qs.slice(0, QUIZ_SIZE);
  if (qs.length < QUIZ_SIZE) qs = [...qs, ...reviewQs(typeId, QUIZ_SIZE - qs.length, used)];
  // keep review drills at the end, shuffle the rest
  const main = shuffle(qs.filter((x) => !x.tag));
  return [...main, ...qs.filter((x) => x.tag)];
}
