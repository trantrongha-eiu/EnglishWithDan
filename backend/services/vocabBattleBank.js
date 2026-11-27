'use strict';

// ⚔️ Đấu trường từ vựng — the question bank.
//
// Every word comes from what the site already has. Quiz words live in "sets"
// (a lesson, a topic, a test…) so wrong options come from the same topic first:
//   topics      Vocab Topics — published VocabularyLesson.words (word,
//               meaning, example, imageUrl, distractors); lessons for one
//               class only (targetClass) are left out
//   writing     Writing Task 2 — Task2Topic.vocabularyList (term, definitionVi, example)
//   para        Học Paraphrase — VocabUnit.words[type='paraphrase'] (the text in
//               a Cambridge Reading passage ↔ the question's wording, + meaning)
//   listening   Listening glossaries — ListeningSection.gapFillGlossary, example
//               = the transcript sentence the word is spoken in
//   saved       words students saved into their Sổ tay while doing a Reading /
//               Listening test (VocabBook words, source reading/listening/…),
//               one entry per word, the meaning most students kept; a word
//               must be a real English word (ENABLE / ChainWord)
//   dictionary  Từ điển — DictionaryCollocation phrases + DictionaryPhrase
//   pictures    "Từ có hình ảnh" — BattleWord kind 'picture' (a picture each;
//               `near` = look-alike words never offered as wrong options)
//   wikt        Từ điển mở — BattleWord kind 'dict': ~6k common words the
//               site doesn't teach (Vietnamese Wiktionary meanings). Their
//               meanings show in Nối chữ but they earn no ⭐ (not taught).
//               Both kinds are edited on admin /vocab-battle → Kho từ.
// Đồng nghĩa = paraphrase pairs (Học Paraphrase + DictionaryPhrase
// alternatives); Trái nghĩa = data/vocabBattle/antonyms.js (hand-written,
// asked both ways) + BattleWord.ant pairs.
// Two right answers are kept out: an option never overlaps the answer
// ("hobby" / "cooking as a hobby", "while" / "meanwhile") and is never a word
// the site gives the same meaning (or the prompt's meaning) anywhere.
//
// Nối chữ accepts a player's word when it is in the ENABLE word list
// (data/vocabBattle/enable1.txt.gz, public domain), in ChainWord (checked
// against an online dictionary — scripts/seedChainWords.js), taught on the
// site, or — none of those — when Wiktionary knows it (favourite, website…;
// then cached in ChainWord as source 'player'). Swear words never count.
// Lulu 🤖 and the opening word only use ChainWord words (not 'player' ones)
// and words the site teaches, so the bot never plays rare Scrabble-only
// words (konking, yobbo…).
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
const DictionaryCollocation = require('../models/DictionaryCollocation');
const Task2Topic = require('../models/Task2Topic');
const ListeningSection = require('../models/ListeningSection');
const VocabBook = require('../models/VocabBook');
const ChainWord = require('../models/ChainWord');
const BattleWord = require('../models/BattleWord');
const { ANTONYMS, NEAR } = require('../data/vocabBattle/antonyms');
const { BLOCK, lookupWiktionary, lookupFreeDict } = require('./wordCheck');
const R = require('../constants/vocabBattle');
const { QUESTION_TYPES, SOURCES } = R;

const POOL_TTL_MS = 10 * 60 * 1000;
let poolCache = null; // { at, pools }

// Which sets each word source reads (null = all)
const SOURCE_SETS = Object.fromEntries(Object.entries(SOURCES).map(([k, v]) => [k, v.sets || null]));
// Sổ tay words saved while doing these (frontend sends `source`)
const SAVED_SOURCES = ['reading', 'listening', 'reading-tips'];

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
const VI_MARK = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
// "sb", "something", "(n)", "a/an" — fine to read, not to type or hear
const PLACEHOLDER = /\b(sb|sth|someone|something|somebody|one's)\b|[/()[\]…]/i;

// Two options too alike to both be offered: equal, or one inside the other
// ("hobby" ⊂ "cooking as a hobby", "while" ⊂ "meanwhile", "rừng" ⊂ "rừng mưa").
function close(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [s, l] = x.length <= y.length ? [x, y] : [y, x];
  return s.length >= 4 && l.includes(s);
}

// A meaning as the site shows it: "GA TÀU" → "ga tàu", no trailing dot
function tidyMeaning(m) {
  let s = clean(m).replace(/[.;,]+$/, '');
  if (/\p{L}/u.test(s) && s === s.toUpperCase()) s = s.toLowerCase();
  return s;
}

// n distinct values from `cands` (in their order) whose norm() differs from
// every value in `avoid` and that pass `ok`.
function distinct(cands, n, avoid, ok = () => true) {
  const seen = new Set(avoid.map(norm));
  const out = [];
  for (const c of cands) {
    const k = norm(c);
    if (!k || seen.has(k) || !ok(c)) continue;
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

function addTo(map, k, v) {
  if (!k || !v) return;
  let s = map.get(k);
  if (!s) { s = new Set(); map.set(k, s); }
  s.add(v);
}

// ── antonyms: both directions, near-synonyms ──────────────────────
const OPP = new Map();  // word → its opposites (both ways)
const NEAR_OF = new Map(); // word → words it means about the same as
for (const r of ANTONYMS) { addTo(OPP, norm(r.w), norm(r.a)); addTo(OPP, norm(r.a), norm(r.w)); }
for (const g of NEAR) for (const a of g) for (const b of g) if (a !== b) addTo(NEAR_OF, norm(a), norm(b));
const alike = (w) => [norm(w), ...(NEAR_OF.get(norm(w)) || [])];
// Is `o` a fair answer to "the opposite of `prompt`"? (it or a near-synonym
// of it is an opposite of the prompt or of a near-synonym of the prompt)
function isOpposite(prompt, o, opp = OPP) {
  const os = alike(o);
  return alike(prompt).some((p) => os.some((x) => opp.get(p)?.has(x)));
}
// Admin-blocked Nối chữ words (admin → Cài đặt), on top of the swear list
const blockedWord = (w) => BLOCK.has(w) || R.BLOCKED_WORDS.has(w);
const near = (a, b) => norm(a) === norm(b) || (NEAR_OF.get(norm(a))?.has(norm(b)) ?? false);

// ── pools ──────────────────────────────────────────────────────────
async function loadPools() {
  if (poolCache && Date.now() - poolCache.at < POOL_TTL_MS) return poolCache.pools;
  const [units, lessons, dict, chainDocs, t2, colls, sections, saved, battleWords] = await Promise.all([
    VocabUnit.find({ isActive: { $ne: false } }).select('title words').lean(),
    VocabularyLesson.find({ published: true, $or: [{ targetClass: '' }, { targetClass: { $exists: false } }] })
      .select('title words').lean(),
    DictionaryPhrase.find({ phrase: { $ne: '' } }).select('phrase meaning alternatives examples').lean(),
    ChainWord.find({}).select('w source -_id').lean().catch(() => []),
    Task2Topic.find({ isActive: { $ne: false } }).select('topicName vocabularyList').sort({ week: 1, orderIndex: 1 }).lean().catch(() => []),
    DictionaryCollocation.find({}).select('word collocations').sort({ word: 1 }).lean().catch(() => []),
    ListeningSection.find({ isActive: { $ne: false }, 'gapFillGlossary.0': { $exists: true } })
      .select('title gapFillGlossary dictationSentences.text').lean().catch(() => []),
    VocabBook.aggregate([
      { $unwind: '$words' },
      { $match: { 'words.source': { $in: SAVED_SOURCES } } },
      { $group: {
        _id: { $toLower: { $trim: { input: '$words.word' } } },
        n: { $sum: 1 },
        meanings: { $push: '$words.meaning' },
        examples: { $push: '$words.example' },
        pos: { $push: '$words.partOfSpeech' },
      } },
    ]).catch(() => []),
    BattleWord.find({ hidden: { $ne: true } }).select('kind word meaning pos set setTitle imageUrl example near ant')
      .sort({ set: 1, word: 1 }).lean().catch(() => []),
  ]);
  if (chainDocs.length) setChainWords(chainDocs);
  const enable = englishWords();
  const verified = chainWords();

  const sets = [];
  const entry = (set, w) => ({
    word: clean(w.word), meaning: tidyMeaning(w.meaning), example: clean(w.example),
    imageUrl: w.imageUrl || '', distractors: (w.distractors || []).map(clean).filter(Boolean),
    near: (w.near || []).map(norm).filter(Boolean),
    lessonId: set.id, lessonTitle: set.title,
  });
  const okEntry = (w) => w.word && w.meaning && /[A-Za-z]/.test(w.word) && norm(w.word) !== norm(w.meaning) && w.meaning.length <= 90;
  function addSet(id, title, src, words) {
    const set = { id, title, src, words: [] };
    const seen = new Set();
    for (const w of words) {
      const e = entry(set, w);
      if (!okEntry(e) || seen.has(norm(e.word))) continue;
      seen.add(norm(e.word));
      set.words.push(e);
    }
    if (set.words.length >= 4) sets.push(set);
    return set;
  }

  // Vocab Topics
  for (const l of lessons) addSet(String(l._id), l.title, 'topics', l.words || []);

  // Writing Task 2
  for (const t of t2) {
    addSet(`task2:${t._id}`, `Task 2 – ${t.topicName}`, 'writing',
      (t.vocabularyList || []).map((v) => ({ word: v.term, meaning: v.definitionVi, example: v.example })));
  }

  // Học Paraphrase (pairs for Đồng nghĩa + the passage wording for the rest)
  const para = [];
  for (const u of units) {
    const words = [];
    for (const w of u.words || []) {
      if (w.type !== 'paraphrase' || !w.word || !w.paraphrase) continue;
      para.push({ word: clean(w.word), syn: clean(w.paraphrase), meaning: clean(w.meaning), group: String(u._id) });
      if (wordCount(w.word) <= 6) words.push({ word: w.word, meaning: w.meaning });
    }
    addSet(`para:${u._id}`, `Reading – ${u.title}`, 'para', words);
  }

  // Listening glossaries: the example is the sentence the word is heard in
  const prettyTitle = (s) => (s === s.toUpperCase() ? s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : s);
  for (const s of sections) {
    const lines = (s.dictationSentences || []).map((d) => clean(d.text)).filter((t) => {
      const n = wordCount(t);
      return n >= 5 && n <= 16;
    });
    const words = (s.gapFillGlossary || []).filter((g) => !g.skip && g.word).map((g) => {
      const re = new RegExp(`(^|[^A-Za-z])${escapeRe(clean(g.word))}([^A-Za-z]|$)`, 'i');
      return { word: g.word, meaning: g.meaning, example: lines.find((t) => re.test(t)) || '' };
    });
    addSet(`ls:${s._id}`, `Listening – ${prettyTitle(clean(s.title))}`, 'listening', words);
  }

  // Taught on the site (Nối chữ ⭐ + accepted even if ENABLE lacks them)
  const bank = new Set();
  const viOf = new Map(); // single word → Vietnamese meaning (shown in Nối chữ)
  const addSingles = (s, vi) => {
    if (wordCount(s) !== 1) return;
    for (const t of norm(s).split(/[\s/]+/)) {
      if (!/^[a-z]{3,}$/.test(t) || BLOCK.has(t)) continue;
      bank.add(t);
      if (vi && !viOf.has(t)) viOf.set(t, vi);
    }
  };
  for (const set of sets) for (const w of set.words) addSingles(w.word, w.meaning);
  for (const p of para) addSingles(p.syn, p.meaning);
  const isWord = (t) => enable.has(t) || verified.all.has(t) || bank.has(t);

  // Words students saved from Reading / Listening: a real word, the meaning most kept
  const savedWords = [];
  const mostCommon = (list) => {
    const n = new Map();
    let best = '';
    for (const x of list) { if (!x) continue; n.set(x, (n.get(x) || 0) + 1); if (!best || n.get(x) > n.get(best)) best = x; }
    return best;
  };
  for (const g of saved) {
    const w = clean(g._id).toLowerCase();
    if (!/^[a-z][a-z' -]*[a-z]$/.test(w) || w.length < 3 || wordCount(w) > 4) continue;
    if (!w.split(/[\s-]+/).every((t) => isWord(t.replace(/'s?$/, '')) && !BLOCK.has(t))) continue;
    const meanings = (g.meanings || []).map(tidyMeaning).filter((m) => m && m.length <= 60 && norm(m) !== w
      && (VI_MARK.test(m) || !m.toLowerCase().split(/\s+/).every((t) => enable.has(t))));
    const meaning = mostCommon(meanings);
    if (!meaning) continue;
    const re = new RegExp(`(^|[^A-Za-z])${escapeRe(w)}([^A-Za-z]|$)`, 'i');
    const example = (g.examples || []).map(clean).find((e) => {
      const n = wordCount(e);
      return n >= 5 && n <= 20 && re.test(e) && /[a-z]/.test(e);
    }) || '';
    savedWords.push({ word: w, meaning, example, pos: mostCommon((g.pos || []).map((p) => clean(p).toLowerCase())) });
  }
  const POS_LABEL = { noun: 'danh từ', verb: 'động từ', adjective: 'tính từ', adverb: 'trạng từ' };
  const byPos = {};
  for (const w of savedWords.sort((a, b) => a.word.localeCompare(b.word))) {
    const k = POS_LABEL[w.pos] ? w.pos : 'other';
    (byPos[k] = byPos[k] || []).push(w);
  }
  for (const [pos, list] of Object.entries(byPos)) {
    for (let k = 0, part = 1; k < list.length; k += 24, part++) {
      const label = POS_LABEL[pos] || 'cụm từ & từ khác';
      addSet(`saved:${pos}:${part}`, `Từ học viên lưu khi làm Reading/Listening – ${label} ${part}`, 'saved', list.slice(k, k + 24));
    }
  }
  for (const w of savedWords) if (wordCount(w.word) === 1 && (enable.has(w.word) || verified.all.has(w.word))) addSingles(w.word, w.meaning);

  // Từ điển: collocations (a few headwords per set) + phrases looked up
  let chunk = [];
  let heads = [];
  const flush = () => {
    if (chunk.length) addSet(`coll:${heads[0]}`, `Từ điển – Collocations: ${heads[0]} … ${heads[heads.length - 1]}`, 'dictionary', chunk);
    chunk = []; heads = [];
  };
  for (const c of colls) {
    const items = (c.collocations || []).filter((x) => x.phrase && wordCount(x.phrase) <= 6);
    if (!items.length) continue;
    heads.push(clean(c.word));
    chunk.push(...items.map((x) => ({ word: x.phrase, meaning: x.meaning, example: x.example })));
    if (chunk.length >= 20) flush();
  }
  flush();
  addSet('dict:phrases', 'Từ điển – Cụm từ đã tra', 'dictionary', dict.map((d) => ({
    word: d.phrase, meaning: d.meaning, example: (d.examples || []).map((e) => (typeof e === 'string' ? e : e?.en)).find(Boolean) || '',
  })));
  for (const set of sets) if (set.src === 'dictionary') for (const w of set.words) addSingles(w.word, w.meaning);

  // Đấu trường's own words (BattleWord): pictures + Từ điển mở. Not "taught"
  // (no ⭐ in Nối chữ), but their meaning shows there.
  const bwSets = new Map();
  for (const w of battleWords) {
    const src = w.kind === 'picture' ? 'pictures' : 'wikt';
    const id = `${src}:${w.set}`;
    let g = bwSets.get(id);
    if (!g) { g = { title: w.setTitle || w.set, src, words: [] }; bwSets.set(id, g); }
    g.words.push(w);
  }
  for (const [id, g] of bwSets) addSet(id, g.title, g.src, g.words);
  for (const w of battleWords) {
    if (w.kind !== 'dict' || wordCount(w.word) !== 1) continue;
    const t = norm(w.word);
    if (/^[a-z]{3,}$/.test(t) && !viOf.has(t)) viOf.set(t, tidyMeaning(w.meaning));
  }
  // Their antonyms (BattleWord.ant) join the hand-written pairs
  const POS_OF = { n: 'noun', noun: 'noun', v: 'verb', verb: 'verb', adj: 'adj', adv: 'adv' };
  const antonyms = [...ANTONYMS];
  const opp = new Map([...OPP].map(([k, v]) => [k, new Set(v)]));
  const seenPair = new Set(ANTONYMS.map((r) => [norm(r.w), norm(r.a)].sort().join('|')));
  for (const w of battleWords) {
    const a = clean(w.ant);
    const pos = POS_OF[w.pos];
    if (!a || !pos || wordCount(w.word) !== 1 || wordCount(a) !== 1) continue;
    const key = [norm(w.word), norm(a)].sort().join('|');
    if (seenPair.has(key)) continue;
    seenPair.add(key);
    antonyms.push({ w: clean(w.word), a, vi: tidyMeaning(w.meaning), pos, extra: true });
    addTo(opp, norm(w.word), norm(a));
    addTo(opp, norm(a), norm(w.word));
  }

  const dictSyn = [];
  for (const d of dict) {
    for (const alt of d.alternatives || []) {
      if (d.phrase && alt) dictSyn.push({ word: clean(d.phrase), syn: clean(alt), meaning: clean(d.meaning), group: 'dict:' + d._id });
    }
  }

  // What the site says each word means (and back): no option may be another
  // right answer
  const meansOf = new Map();
  const wordsOf = new Map();
  for (const set of sets) for (const w of set.words) { addTo(meansOf, norm(w.word), norm(w.meaning)); addTo(wordsOf, norm(w.meaning), norm(w.word)); }
  for (const p of para) {
    if (!p.meaning) continue;
    for (const x of [p.word, p.syn]) { addTo(meansOf, norm(x), norm(p.meaning)); addTo(wordsOf, norm(p.meaning), norm(x)); }
  }

  // Lulu 🤖: dictionary-checked common words + real words the site teaches
  const luluByLetter = {};
  const lulu = new Set();
  const addLulu = (w) => {
    if (lulu.has(w) || w.length < 4 || w.length > 10 || BLOCK.has(w)) return;
    lulu.add(w);
    (luluByLetter[w[0]] = luluByLetter[w[0]] || []).push(w);
  };
  for (const w of verified.lulu) if (w.length <= 8 && !blockedWord(w)) addLulu(w);
  for (const w of bank) if ((enable.has(w) || verified.lulu.has(w)) && !blockedWord(w)) addLulu(w);

  const pools = { para, dictSyn, sets, topics: sets.filter((s) => s.src === 'topics'), bank, viOf, meansOf, wordsOf, lulu, luluByLetter, antonyms, opp };
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
// all = every checked word (players' online finds too); lulu = the ones the
// bot may play (not 'player' finds); byLetter = lulu, 4–8 letters.
let chain = null;
function setChainWords(list) {
  const all = new Set();
  const lulu = new Set();
  const byLetter = {};
  for (const x of list) {
    const w = String((x && typeof x === 'object' ? x.w : x) || '').toLowerCase();
    if (!/^[a-z]+(-[a-z]+)*$/.test(w) || w.length < 3) continue;
    all.add(w);
    if ((x && x.source) === 'player' || !/^[a-z]+$/.test(w) || BLOCK.has(w)) continue;
    lulu.add(w);
    if (w.length >= 4 && w.length <= 8) (byLetter[w[0]] = byLetter[w[0]] || []).push(w);
  }
  chain = { all, lulu, byLetter };
}
function chainWords() {
  if (!chain) {
    let list = [];
    try {
      list = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'vocabBattle', 'chainWords.json'), 'utf8'));
    } catch { /* not built yet */ }
    setChainWords(list);
  }
  return chain;
}

// ── generators: (ctx) → question | null ───────────────────────────
// ctx = { pools, source, lesson (a set or null), used: Set }
function synonymItems(ctx) {
  const short = (it) => wordCount(it.word) <= 6 && wordCount(it.syn) <= 6 && norm(it.word) !== norm(it.syn);
  const list = [];
  if (['all', 'paraphrase', 'readlisten'].includes(ctx.source)) list.push(...ctx.pools.para.filter(short));
  if (['all', 'dictionary'].includes(ctx.source)) list.push(...ctx.pools.dictSyn.filter(short));
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
  // An option must not also be a paraphrase OF this word (two right answers),
  // nor overlap the answer / the prompt
  const alsoRight = list.filter((o) => norm(o.word) === norm(it.word)).map((o) => o.syn);
  const wrong = distinct([...same, ...rest], 3, [it.syn, it.word, ...alsoRight],
    (o) => !close(o, it.syn) && !close(o, it.word) && !alsoRight.some((a) => close(o, a)));
  if (wrong.length < 3) return null;
  ctx.used.add('syn:' + norm(it.word));
  return { type: 'synonym', prompt: it.word, ...mcq(it.syn, wrong), word: it.word, meaning: it.meaning, note: it.syn };
}

// Either way round: "abundant" → scarce, or "scarce" → abundant
function genAntonym(ctx) {
  const list = ctx.pools.antonyms || ANTONYMS;
  const opp = ctx.pools.opp || OPP;
  const fresh = [];
  for (const r of list) {
    if (ctx.used.has('ant:' + norm(r.w)) || ctx.used.has('ant:' + norm(r.a))) continue;
    fresh.push({ r, rev: false });
    if (wordCount(r.a) === 1) fresh.push({ r, rev: true });
  }
  if (!fresh.length) return null;
  for (let tries = 0; tries < 6; tries++) {
    const { r, rev } = pick(fresh);
    const prompt = rev ? r.a : r.w;
    const right = rev ? r.w : r.a;
    const group = list.filter((o) => o.pos === r.pos && o !== r);
    const cands = shuffle(group.flatMap((o) => [o.a, o.w]));
    const wrong = distinct(cands, 3, [right, prompt],
      (o) => !isOpposite(prompt, o, opp) && !near(o, right) && !near(o, prompt) && !close(o, right) && !close(o, prompt));
    if (wrong.length < 3) continue;
    ctx.used.add('ant:' + norm(r.w));
    ctx.used.add('ant:' + norm(r.a));
    return { type: 'antonym', prompt, ...mcq(right, wrong), word: r.w, meaning: r.vi, note: rev ? r.w : r.a };
  }
  return null;
}

function scopeSets(ctx) {
  if (ctx.lesson) return [ctx.lesson];
  const srcs = SOURCE_SETS[ctx.source];
  return srcs ? ctx.pools.sets.filter((s) => srcs.includes(s.src)) : ctx.pools.sets;
}

function scopeWords(ctx, filter) {
  const out = [];
  for (const l of scopeSets(ctx)) for (const w of l.words) if (filter(w)) out.push(w);
  return out;
}

function setOf(ctx, w) {
  return ctx.pools.sets.find((l) => l.id === w.lessonId) || ctx.lesson;
}

// A wrong English option for word `w`: not overlapping it, and not a word
// the site also gives w's meaning (that would be a second right answer)
function okWrongWord(ctx, w, o) {
  return !close(o, w.word) && !(ctx.pools.meansOf.get(norm(o))?.has(norm(w.meaning)))
    && !(w.near || []).includes(norm(o)); // a look-alike picture ("rain" for "cloud")
}
// A wrong Vietnamese option for word `w`: not overlapping its meaning, and
// not another meaning the site gives w
function okWrongMeaning(ctx, w, m) {
  return !close(m, w.meaning) && !(ctx.pools.meansOf.get(norm(w.word))?.has(norm(m)));
}

function genMeaning(ctx) {
  const fresh = scopeWords(ctx, (w) => !ctx.used.has('w:' + norm(w.word)));
  if (!fresh.length) return null;
  for (let tries = 0; tries < 6; tries++) {
    const w = pick(fresh);
    const set = setOf(ctx, w);
    const others = shuffle(set.words.filter((o) => norm(o.word) !== norm(w.word)));
    const allOthers = [];
    for (let k = 0; k < 60; k++) allOthers.push(pick(fresh));
    const toVi = Math.random() < 0.5;
    let q;
    if (toVi) {
      const wrong = distinct([...others, ...allOthers].map((o) => o.meaning), 3, [w.meaning], (m) => okWrongMeaning(ctx, w, m));
      if (wrong.length < 3) continue;
      q = { type: 'meaning', dir: 'en-vi', prompt: w.word, ...mcq(w.meaning, wrong) };
    } else {
      const wrong = distinct([...w.distractors, ...others.map((o) => o.word), ...allOthers.map((o) => o.word)], 3, [w.word],
        (o) => okWrongWord(ctx, w, o));
      if (wrong.length < 3) continue;
      q = { type: 'meaning', dir: 'vi-en', prompt: w.meaning, ...mcq(w.word, wrong) };
    }
    ctx.used.add('w:' + norm(w.word));
    return { ...q, word: w.word, meaning: w.meaning, example: w.example };
  }
  return null;
}

function genImage(ctx) {
  const fresh = scopeWords(ctx, (w) => w.imageUrl && !ctx.used.has('w:' + norm(w.word)));
  if (!fresh.length) return null;
  for (let tries = 0; tries < 6; tries++) {
    const w = pick(fresh);
    const set = setOf(ctx, w);
    const wrong = distinct([...w.distractors, ...shuffle(set.words).map((o) => o.word)], 3, [w.word], (o) => okWrongWord(ctx, w, o));
    if (wrong.length < 3) continue;
    ctx.used.add('w:' + norm(w.word));
    return { type: 'image', prompt: '', image: w.imageUrl, ...mcq(w.word, wrong), word: w.word, meaning: w.meaning };
  }
  return null;
}

function genMatch(ctx) {
  const lessons = shuffle(scopeSets(ctx));
  const { meansOf } = ctx.pools;
  for (const l of lessons) {
    const fresh = shuffle(l.words.filter((w) => !ctx.used.has('w:' + norm(w.word))));
    const chosen = [];
    for (const w of fresh) {
      // No pair may fit another row: words/meanings all clearly different
      const clash = chosen.some((x) => close(x.word, w.word) || close(x.meaning, w.meaning)
        || meansOf.get(norm(x.word))?.has(norm(w.meaning)) || meansOf.get(norm(w.word))?.has(norm(x.meaning)));
      if (clash) continue;
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
  const fresh = scopeWords(ctx, (w) => {
    if (!w.example || ctx.used.has('ex:' + norm(w.example))) return false;
    if (/[_…]/.test(w.example) || w.example === w.example.toUpperCase()) return false;
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

const hearable = (w) => wordCount(w.word) <= 3 && !PLACEHOLDER.test(w.word);

// A sentence worth a gap: the word in it, and ≥ 4 other words around the gap
// ("- Up _____." gave nothing to go on)
function listenable(w) {
  if (!w.example || !hearable(w)) return false;
  const re = new RegExp(`\\b${escapeRe(w.word)}\\b`, 'gi');
  return re.test(w.example) && wordCount(w.example.replace(re, ' ').replace(/[^A-Za-z' ]+/g, ' ')) >= 4;
}

function genListen(ctx) {
  const fresh = scopeWords(ctx, (w) => !ctx.used.has('w:' + norm(w.word)) && listenable(w));
  if (!fresh.length) return null;
  const w = pick(fresh);
  const re = new RegExp(`\\b${escapeRe(w.word)}\\b`, 'gi');
  const m = new RegExp(`\\b${escapeRe(w.word)}\\b`, 'i').exec(w.example);
  const answer = m[0];
  // Every time the word is said is a gap (else the sentence gives it away)
  const masked = w.example.replace(re, '_____').replace(/^[-–—]\s*/, '');
  ctx.used.add('w:' + norm(w.word));
  return {
    type: 'listen', prompt: masked, speak: w.example, hint: w.meaning,
    len: answer.replace(/[^A-Za-z]/g, '').length, answer, word: w.word, meaning: w.meaning, example: w.example,
  };
}

function genSpell(ctx) {
  const fresh = scopeWords(ctx, (w) => !ctx.used.has('w:' + norm(w.word)) && hearable(w)
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

// Which of `types` the source can actually feed.
function usableTypes(types, source) {
  const allowed = (SOURCES[source] || SOURCES.all).types;
  return types.filter((t) => GENERATORS[t] && allowed.includes(t) && !R.DISABLED_TYPES.includes(t));
}

// The set a room may be limited to (a lesson / topic / test of that source)
function findSet(pools, id, source) {
  const set = id ? pools.sets.find((l) => l.id === String(id)) : null;
  if (!set) return null;
  const srcs = SOURCE_SETS[source];
  return !srcs || srcs.includes(set.src) ? set : null;
}

// `count` questions mixing `types` as evenly as the bank allows.
async function buildQuestions({ types, count, source = 'all', lessonId = '' }) {
  const pools = await loadPools();
  const lesson = findSet(pools, lessonId, source);
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
const DAY = 24 * 60 * 60 * 1000;
const onlineMiss = new Map(); // word → when a dictionary said "not a word"

// A word none of our lists has: ask Wiktionary (else the Free Dictionary
// API), quickly — the player's turn is ticking. A yes is kept in ChainWord
// (source 'player': accepted from now on, never played by Lulu).
async function onlineWord(w) {
  if (process.env.NODE_ENV === 'test' || process.env.VOCAB_BATTLE_OFFLINE) return false;
  const miss = onlineMiss.get(w);
  if (miss && Date.now() - miss < DAY) return false;
  let r = await lookupWiktionary(w, 3500);
  if (!r) r = await lookupFreeDict(w, 2500);
  if (!r) return false; // dictionaries down: no verdict, ask again next time
  if (!r.ok) {
    if (onlineMiss.size > 5000) onlineMiss.clear();
    onlineMiss.set(w, Date.now());
    return false;
  }
  chainWords().all.add(w);
  ChainWord.updateOne(
    { w },
    { $setOnInsert: { w, first: w[0], len: w.length, pos: r.pos || '', def: r.def || '', source: 'player', verifiedAt: new Date() } },
    { upsert: true },
  ).catch((err) => console.error('[vocab-battle] save player word failed:', err.message));
  return true;
}

// w = lower-case letters, maybe one hyphen (well-known)
async function chainWordInfo(w) {
  const pools = await loadPools();
  const parts = w.split('-');
  if (blockedWord(w) || parts.some((p) => blockedWord(p))) return { known: false, blocked: true, bank: false, vi: '' };
  const flat = parts.join('');
  const local = (x) => englishWords().has(x) || chainWords().all.has(x) || pools.bank.has(x);
  const bank = pools.bank.has(flat);
  let known = local(w) || local(flat) || (parts.length > 1 && parts.every((p) => p.length >= 2 && local(p)));
  if (!known) known = await onlineWord(w);
  return { known, bank, vi: pools.viOf.get(flat) || '' };
}

// The word the game opens with: a verified word the site teaches, ending in an easy letter
async function chainStartWord() {
  const pools = await loadPools();
  const verified = chainWords();
  const easy = (w) => w.length >= 4 && w.length <= 8 && !/[xqzjvy]$/.test(w) && !blockedWord(w);
  const taught = [...pools.bank].filter((w) => easy(w) && verified.lulu.has(w));
  if (taught.length) return pick(taught);
  const any = [...verified.lulu].filter(easy);
  return any.length ? pick(any) : pick(['table', 'water', 'school', 'garden', 'travel', 'health']);
}

// The bot's word for Nối chữ (sync: runs inside a room update): a word the
// site teaches first (70%), else any dictionary-checked common word; null =
// it's stuck.
function botWord(letter, used) {
  const pools = poolCache ? poolCache.pools : null;
  const list = ((pools ? pools.luluByLetter : chainWords().byLetter)[letter] || []).filter((w) => !used.has(w) && !blockedWord(w));
  const bankSet = pools ? pools.bank : new Set();
  const taught = list.filter((w) => bankSet.has(w));
  if (taught.length && Math.random() < 0.7) return { w: pick(taught), bank: true };
  if (!list.length) return null;
  const w = pick(list);
  return { w, bank: bankSet.has(w) };
}

// Vietnamese meaning of a Nối chữ word, when the site teaches it
function meaningOf(w) {
  return (poolCache && w && poolCache.pools.viOf.get(String(w).replace(/-/g, ''))) || '';
}

// Every set a room can be limited to, with its source kind
async function lessonOptions() {
  const pools = await loadPools();
  return pools.sets.map((l) => ({ id: l.id, title: l.title, count: l.words.length, src: l.src }));
}

// How big the bank is, per word source (shown on the create form)
async function bankStats() {
  const pools = await loadPools();
  const sources = {};
  for (const key of Object.keys(SOURCES)) {
    const srcs = SOURCE_SETS[key];
    const words = new Set();
    for (const s of pools.sets) if (!srcs || srcs.includes(s.src)) for (const w of s.words) words.add(norm(w.word));
    if (key === 'all' || key === 'paraphrase' || key === 'readlisten') for (const p of pools.para) { words.add(norm(p.word)); words.add(norm(p.syn)); }
    if (key === 'all' || key === 'dictionary') for (const p of pools.dictSyn) words.add(norm(p.syn));
    sources[key] = words.size;
  }
  const pictures = pools.sets.reduce((n, s) => n + s.words.filter((w) => w.imageUrl).length, 0);
  return { sources, antonyms: (pools.antonyms || ANTONYMS).length, pictures, chain: { lulu: pools.lulu.size, accepted: englishWords().size + chainWords().all.size } };
}

module.exports = {
  buildQuestions, publicQuestion, grade, answerText, usableTypes, findSet,
  chainWordInfo, chainStartWord, botWord, meaningOf, lessonOptions, bankStats, loadPools, resetCache,
  _internal: { norm, normTyped, close, isOpposite, englishWords, chainWords, setChainWords, luluWords: () => (poolCache ? poolCache.pools.lulu : chainWords().lulu) },
};
