'use strict';

// ⚔️ Đấu trường từ vựng — the question bank.
//
// Words come from what the site already teaches:
//   • Học Paraphrase — VocabUnit.words[type='paraphrase'] (word ↔ paraphrase)
//   • Vocab Topics   — published VocabularyLesson.words (word, meaning,
//                      example, imageUrl) — lessons for one class only
//                      (targetClass) are left out
//   • Từ điển        — DictionaryPhrase (phrase ↔ alternatives)
//   • Trái nghĩa     — data/vocabBattle/antonyms.js (hand-written)
// Nối chữ accepts a player's word when it is in the ENABLE word list
// (data/vocabBattle/enable1.txt.gz, public domain), in ChainWord (common words
// checked against an online dictionary — scripts/seedChainWords.js) or taught
// on the site. Lulu 🤖 and the opening word only ever use ChainWord words, so
// the bot never plays rare Scrabble-only words (konking, yobbo…).
//
// buildQuestions() returns full questions (answers included) to store on the
// room; publicQuestion() is the only shape that reaches a client and
// grade() scores an answer server-side.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const VocabUnit = require('../models/VocabUnit');
const VocabularyLesson = require('../models/VocabularyLesson');
const DictionaryPhrase = require('../models/DictionaryPhrase');
const ChainWord = require('../models/ChainWord');
const { ANTONYMS } = require('../data/vocabBattle/antonyms');
const { QUESTION_TYPES, SOURCES } = require('../constants/vocabBattle');

const POOL_TTL_MS = 10 * 60 * 1000;
let poolCache = null; // { at, pools }

// ── text helpers ───────────────────────────────────────────────────
function clean(s) {
  return String(s || '').normalize('NFC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
}
function norm(s) {
  return clean(s).toLowerCase().replace(/[.,!?;:"()]+$/g, '').trim();
}
// What a typed answer is compared on: case, punctuation and spacing don't count
function normTyped(s) {
  return clean(s).toLowerCase().replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function wordCount(s) { return clean(s).split(' ').filter(Boolean).length; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// n distinct values from `cands` (in their order) whose norm() differs from
// every value in `avoid`.
function distinct(cands, n, avoid) {
  const seen = new Set(avoid.map(norm));
  const out = [];
  for (const c of cands) {
    const k = norm(c);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(clean(c));
    if (out.length >= n) break;
  }
  return out;
}

// 4 options with the right one at a random place → { options, answer }
function mcq(correct, wrong) {
  const options = shuffle([clean(correct), ...wrong]);
  return { options, answer: options.indexOf(clean(correct)) };
}

// ── pools ──────────────────────────────────────────────────────────
async function loadPools() {
  if (poolCache && Date.now() - poolCache.at < POOL_TTL_MS) return poolCache.pools;
  const [units, lessons, dict, chainDocs] = await Promise.all([
    VocabUnit.find({ isActive: { $ne: false } }).select('title words').lean(),
    VocabularyLesson.find({ published: true, $or: [{ targetClass: '' }, { targetClass: { $exists: false } }] })
      .select('title words').lean(),
    DictionaryPhrase.find({}).select('phrase meaning alternatives').lean(),
    ChainWord.find({}).select('w -_id').lean().catch(() => []),
  ]);
  if (chainDocs.length) setChainWords(chainDocs.map((d) => d.w));

  const para = [];
  for (const u of units) {
    for (const w of u.words || []) {
      if (w.type !== 'paraphrase' || !w.word || !w.paraphrase) continue;
      para.push({ word: clean(w.word), syn: clean(w.paraphrase), meaning: clean(w.meaning), group: String(u._id) });
    }
  }
  const dictSyn = [];
  for (const d of dict) {
    for (const alt of d.alternatives || []) {
      if (d.phrase && alt) dictSyn.push({ word: clean(d.phrase), syn: clean(alt), meaning: clean(d.meaning), group: 'dict:' + d._id });
    }
  }
  const topics = [];
  for (const l of lessons) {
    const words = (l.words || []).filter((w) => w.word && w.meaning).map((w) => ({
      word: clean(w.word), meaning: clean(w.meaning), example: clean(w.example),
      imageUrl: w.imageUrl || '', distractors: (w.distractors || []).map(clean).filter(Boolean),
      lessonId: String(l._id), lessonTitle: l.title,
    }));
    if (words.length >= 4) topics.push({ id: String(l._id), title: l.title, words });
  }

  // Single words the site teaches (Nối chữ bonus + accepted even if ENABLE lacks them)
  const bank = new Set();
  const addSingles = (s) => {
    for (const t of norm(s).split(/[\s/]+/)) if (/^[a-z]{3,}$/.test(t)) bank.add(t);
  };
  for (const l of topics) for (const w of l.words) if (wordCount(w.word) === 1) addSingles(w.word);
  for (const p of para) { if (wordCount(p.word) === 1) addSingles(p.word); if (wordCount(p.syn) === 1) addSingles(p.syn); }

  const pools = { para, dictSyn, topics, bank };
  poolCache = { at: Date.now(), pools };
  return pools;
}

function resetCache() { poolCache = null; }

// ── ENABLE word list (Nối chữ) ─────────────────────────────────────
let enable = null;
function englishWords() {
  if (!enable) {
    const buf = zlib.gunzipSync(fs.readFileSync(path.join(__dirname, '..', 'data', 'vocabBattle', 'enable1.txt.gz')));
    enable = new Set(buf.toString('utf8').split(/\r?\n/).filter(Boolean));
  }
  return enable;
}

// ── verified Nối chữ words (ChainWord, else the JSON it was seeded from) ──
let chain = null; // { all: Set, byLetter: { a: [4–8 letter words] } }
function setChainWords(list) {
  const all = new Set();
  const byLetter = {};
  for (const raw of list) {
    const w = String(raw || '').toLowerCase();
    if (!/^[a-z]{3,}$/.test(w)) continue;
    all.add(w);
    if (w.length >= 4 && w.length <= 8) (byLetter[w[0]] = byLetter[w[0]] || []).push(w);
  }
  chain = { all, byLetter };
}
function chainWords() {
  if (!chain) {
    let list = [];
    try {
      list = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'vocabBattle', 'chainWords.json'), 'utf8')).map((x) => x.w);
    } catch { /* not built yet */ }
    setChainWords(list);
  }
  return chain;
}

// ── generators: (ctx) → question | null ───────────────────────────
// ctx = { pools, source, lesson (topics lesson or null), used: Set }
function synonymItems(ctx) {
  const short = (it) => wordCount(it.word) <= 6 && wordCount(it.syn) <= 6 && norm(it.word) !== norm(it.syn);
  const list = [];
  if (ctx.source === 'all' || ctx.source === 'paraphrase') list.push(...ctx.pools.para.filter(short));
  if (ctx.source === 'all' || ctx.source === 'dictionary') list.push(...ctx.pools.dictSyn.filter(short));
  return list;
}

function genSynonym(ctx) {
  const list = synonymItems(ctx);
  const fresh = list.filter((it) => !ctx.used.has('syn:' + norm(it.word)));
  if (!fresh.length || list.length < 6) return null;
  const it = pick(fresh);
  // Wrong options: other paraphrases, same unit first (same topic = harder)
  const same = shuffle(list.filter((o) => o.group === it.group && norm(o.word) !== norm(it.word)).map((o) => o.syn));
  const rest = shuffle(list.filter((o) => o.group !== it.group).map((o) => o.syn));
  // An option must not also be a paraphrase OF this word (two right answers)
  const alsoRight = list.filter((o) => norm(o.word) === norm(it.word)).map((o) => o.syn);
  const wrong = distinct([...same, ...rest], 3, [it.syn, it.word, ...alsoRight]);
  if (wrong.length < 3) return null;
  ctx.used.add('syn:' + norm(it.word));
  return { type: 'synonym', prompt: it.word, ...mcq(it.syn, wrong), word: it.word, meaning: it.meaning, note: it.syn };
}

function genAntonym(ctx) {
  const fresh = ANTONYMS.filter((r) => !ctx.used.has('ant:' + r.w));
  if (!fresh.length) return null;
  const r = pick(fresh);
  const group = ANTONYMS.filter((o) => o.pos === r.pos && o.w !== r.w);
  // An option must not be another accepted opposite of the same word
  const alsoRight = ANTONYMS.filter((o) => o.w === r.w).map((o) => o.a);
  const wrong = distinct(shuffle(group.map((o) => o.a)), 3, [r.a, r.w, ...alsoRight]);
  if (wrong.length < 3) return null;
  ctx.used.add('ant:' + r.w);
  return { type: 'antonym', prompt: r.w, ...mcq(r.a, wrong), word: r.w, meaning: r.vi, note: r.a };
}

function topicLessons(ctx) {
  if (ctx.source !== 'all' && ctx.source !== 'topics') return [];
  if (ctx.lesson) return [ctx.lesson];
  return ctx.pools.topics;
}

function topicWords(ctx, filter) {
  const out = [];
  for (const l of topicLessons(ctx)) for (const w of l.words) if (filter(w)) out.push(w);
  return out;
}

function lessonOf(ctx, w) {
  return ctx.pools.topics.find((l) => l.id === w.lessonId) || ctx.lesson;
}

function genMeaning(ctx) {
  const fresh = topicWords(ctx, (w) => !ctx.used.has('w:' + norm(w.word)));
  if (!fresh.length) return null;
  const w = pick(fresh);
  const lesson = lessonOf(ctx, w);
  const others = shuffle(lesson.words.filter((o) => norm(o.word) !== norm(w.word)));
  const allOthers = shuffle(topicWords(ctx, (o) => o.lessonId !== w.lessonId)).slice(0, 40);
  const toVi = Math.random() < 0.5;
  let q;
  if (toVi) {
    const wrong = distinct([...others, ...allOthers].map((o) => o.meaning), 3, [w.meaning]);
    if (wrong.length < 3) return null;
    q = { type: 'meaning', dir: 'en-vi', prompt: w.word, ...mcq(w.meaning, wrong) };
  } else {
    const wrong = distinct([...w.distractors, ...others.map((o) => o.word), ...allOthers.map((o) => o.word)], 3, [w.word]);
    if (wrong.length < 3) return null;
    q = { type: 'meaning', dir: 'vi-en', prompt: w.meaning, ...mcq(w.word, wrong) };
  }
  ctx.used.add('w:' + norm(w.word));
  return { ...q, word: w.word, meaning: w.meaning, example: w.example };
}

function genImage(ctx) {
  const fresh = topicWords(ctx, (w) => w.imageUrl && !ctx.used.has('w:' + norm(w.word)));
  if (!fresh.length) return null;
  const w = pick(fresh);
  const lesson = lessonOf(ctx, w);
  const wrong = distinct([...w.distractors, ...shuffle(lesson.words).map((o) => o.word)], 3, [w.word]);
  if (wrong.length < 3) return null;
  ctx.used.add('w:' + norm(w.word));
  return { type: 'image', prompt: '', image: w.imageUrl, ...mcq(w.word, wrong), word: w.word, meaning: w.meaning };
}

function genMatch(ctx) {
  const lessons = shuffle(topicLessons(ctx));
  for (const l of lessons) {
    const fresh = shuffle(l.words.filter((w) => !ctx.used.has('w:' + norm(w.word))));
    const chosen = [];
    const seenW = new Set();
    const seenM = new Set();
    for (const w of fresh) {
      if (seenW.has(norm(w.word)) || seenM.has(norm(w.meaning))) continue;
      seenW.add(norm(w.word)); seenM.add(norm(w.meaning));
      chosen.push(w);
      if (chosen.length === 5) break;
    }
    if (chosen.length < 4) continue;
    const right = shuffle(chosen.map((w) => w.meaning));
    for (const w of chosen) ctx.used.add('w:' + norm(w.word));
    return {
      type: 'match', prompt: l.title,
      left: chosen.map((w) => w.word), right,
      answer: chosen.map((w) => right.indexOf(w.meaning)),
      pairs: chosen.map((w) => ({ word: w.word, meaning: w.meaning })),
    };
  }
  return null;
}

function genOrder(ctx) {
  const fresh = topicWords(ctx, (w) => {
    if (!w.example || ctx.used.has('ex:' + norm(w.example))) return false;
    const n = wordCount(w.example);
    return n >= 5 && n <= 14;
  });
  if (!fresh.length) return null;
  const w = pick(fresh);
  const tokens = w.example.split(' ');
  let shuffled = shuffle(tokens);
  for (let t = 0; t < 5 && shuffled.join(' ') === tokens.join(' '); t++) shuffled = shuffle(tokens);
  ctx.used.add('ex:' + norm(w.example));
  return { type: 'order', prompt: w.meaning, tokens: shuffled, answerText: w.example, word: w.word, meaning: w.meaning, example: w.example };
}

function genListen(ctx) {
  const fresh = topicWords(ctx, (w) => w.example && !ctx.used.has('w:' + norm(w.word)) && wordCount(w.word) <= 3
    && new RegExp(`\\b${escapeRe(w.word)}\\b`, 'i').test(w.example));
  if (!fresh.length) return null;
  const w = pick(fresh);
  const m = new RegExp(`\\b${escapeRe(w.word)}\\b`, 'i').exec(w.example);
  const answer = m[0];
  const masked = w.example.slice(0, m.index) + '_____' + w.example.slice(m.index + answer.length);
  ctx.used.add('w:' + norm(w.word));
  return {
    type: 'listen', prompt: masked, speak: w.example, hint: w.meaning,
    len: answer.replace(/[^A-Za-z]/g, '').length, answer, word: w.word, meaning: w.meaning, example: w.example,
  };
}

function genSpell(ctx) {
  const fresh = topicWords(ctx, (w) => !ctx.used.has('w:' + norm(w.word)) && wordCount(w.word) <= 3
    && /^[A-Za-z' -]+$/.test(w.word) && w.word.replace(/[^A-Za-z]/g, '').length >= 3);
  if (!fresh.length) return null;
  const w = pick(fresh);
  ctx.used.add('w:' + norm(w.word));
  return {
    type: 'spell', prompt: '', speak: w.word, hint: w.meaning,
    len: w.word.replace(/[^A-Za-z]/g, '').length, answer: w.word, word: w.word, meaning: w.meaning, example: w.example,
  };
}

const GENERATORS = {
  synonym: genSynonym, antonym: genAntonym, meaning: genMeaning, image: genImage,
  match: genMatch, order: genOrder, listen: genListen, spell: genSpell,
};

// Which of `types` the source (and lesson) can actually feed.
function usableTypes(types, source) {
  const allowed = (SOURCES[source] || SOURCES.all).types;
  return types.filter((t) => GENERATORS[t] && allowed.includes(t));
}

// `count` questions mixing `types` as evenly as the bank allows.
async function buildQuestions({ types, count, source = 'all', lessonId = '' }) {
  const pools = await loadPools();
  const lesson = lessonId ? pools.topics.find((l) => l.id === String(lessonId)) || null : null;
  const ctx = { pools, source, lesson, used: new Set() };
  let live = usableTypes(types, source);
  const out = [];
  let turn = shuffle(live);
  while (out.length < count && live.length) {
    if (!turn.length) turn = shuffle(live);
    const t = turn.shift();
    const q = GENERATORS[t](ctx);
    if (!q) { live = live.filter((x) => x !== t); turn = turn.filter((x) => x !== t); continue; }
    q.limit = QUESTION_TYPES[t].limit;
    out.push(q);
  }
  return out;
}

// What a player sees: never the answer.
function publicQuestion(q, i) {
  const base = { i, type: q.type, label: QUESTION_TYPES[q.type]?.label || q.type, limit: q.limit, prompt: q.prompt || '' };
  if (q.options) base.options = q.options;
  if (q.dir) base.dir = q.dir;
  if (q.image) base.image = q.image;
  if (q.type === 'match') { base.left = q.left; base.right = q.right; }
  if (q.type === 'order') base.tokens = q.tokens;
  if (q.type === 'listen' || q.type === 'spell') { base.speak = q.speak; base.hint = q.hint; base.len = q.len; }
  return base;
}

// The right answer as text (review screen + "đáp án đúng" after a reply)
function answerText(q) {
  if (q.options) return q.options[q.answer];
  if (q.type === 'match') return q.pairs.map((p) => `${p.word} = ${p.meaning}`).join(' · ');
  if (q.type === 'order') return q.answerText;
  return q.answer;
}

// → { frac (0..1), given (normalised, for the review) }
function grade(q, given) {
  if (q.options) {
    const g = Number.isInteger(given) ? given : -1;
    return { frac: g === q.answer ? 1 : 0, given: g >= 0 && g < q.options.length ? q.options[g] : '' };
  }
  if (q.type === 'match') {
    const g = Array.isArray(given) ? given : [];
    let ok = 0;
    q.answer.forEach((a, i) => { if (g[i] === a) ok += 1; });
    return { frac: ok / q.answer.length, given: g.map((r, i) => `${q.left[i]} = ${q.right[r] ?? '?'}`).join(' · ') };
  }
  if (q.type === 'order') {
    const g = Array.isArray(given) ? given.filter((n) => Number.isInteger(n) && n >= 0 && n < q.tokens.length) : [];
    const used = new Set(g);
    const text = used.size === g.length ? g.map((n) => q.tokens[n]).join(' ') : '';
    return { frac: text && norm(text) === norm(q.answerText) ? 1 : 0, given: text };
  }
  const text = typeof given === 'string' ? given.slice(0, 120) : '';
  return { frac: text && normTyped(text) === normTyped(q.answer) ? 1 : 0, given: clean(text) };
}

// ── Nối chữ ────────────────────────────────────────────────────────
async function chainWordInfo(w) {
  const pools = await loadPools();
  return { known: englishWords().has(w) || chainWords().all.has(w) || pools.bank.has(w), bank: pools.bank.has(w) };
}

// The word the game opens with: a verified word the site teaches, ending in an easy letter
async function chainStartWord() {
  const pools = await loadPools();
  const verified = chainWords();
  const easy = (w) => w.length >= 4 && w.length <= 8 && !/[xqzjvy]$/.test(w);
  const taught = [...pools.bank].filter((w) => easy(w) && verified.all.has(w));
  if (taught.length) return pick(taught);
  const any = [...verified.all].filter(easy);
  return any.length ? pick(any) : pick(['table', 'water', 'school', 'garden', 'travel', 'health']);
}

// The bot's word for Nối chữ (sync: runs inside a room update): only words
// checked against an online dictionary (ChainWord) — ones the site teaches
// first, then any common verified word; null = it's stuck.
function botWord(letter, used) {
  const list = (chainWords().byLetter[letter] || []).filter((w) => !used.has(w));
  const bankSet = poolCache ? poolCache.pools.bank : new Set();
  const taught = list.filter((w) => bankSet.has(w));
  if (taught.length && Math.random() < 0.7) return { w: pick(taught), bank: true };
  if (!list.length) return null;
  const w = pick(list);
  return { w, bank: bankSet.has(w) };
}

async function lessonOptions() {
  const pools = await loadPools();
  return pools.topics.map((l) => ({ id: l.id, title: l.title, count: l.words.length }));
}

module.exports = {
  buildQuestions, publicQuestion, grade, answerText, usableTypes,
  chainWordInfo, chainStartWord, botWord, lessonOptions, loadPools, resetCache,
  _internal: { norm, normTyped, englishWords, chainWords, setChainWords },
};
