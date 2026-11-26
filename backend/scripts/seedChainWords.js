'use strict';

// ⚔️ Nối chữ — build the list of words Lulu 🤖 may play, every one checked
// against an online dictionary, and save it to the database.
//
//   node scripts/seedChainWords.js                 build/verify (resumable) + write JSON
//   node scripts/seedChainWords.js --site --seed   + words from the site's own content (MONGO_URI), then upsert
//   node scripts/seedChainWords.js --seed          … upsert into ChainWord (MONGO_URI)
//   node scripts/seedChainWords.js --seed-only
//
// 1. Candidates
//    • common words: in BOTH the Google 10k web list
//      (first20hours/google-10000-english, no swears) AND the top 20k of the
//      OpenSubtitles list (hermitdave/FrequencyWords), AND in ENABLE, 3–10
//      letters — rare Scrabble words (konking, yobbo…) never make it in.
//    • --site: words of the site's IELTS content — Reading passages and
//      Listening transcripts (a word must be in ENABLE, 4–12 letters, seen
//      in lower case and in ≥ 3 different passages/transcripts, so names and
//      one-off rarities stay out) plus every single word taught in Vocab
//      Topics, Task 2 vocab, Học Paraphrase and the Listening glossaries.
//      Saved to scripts/data/chainWords/siteCandidates.txt (re-used by later
//      runs without --site).
// 2. Each candidate → Wiktionary (action API, 50 words per request: the page
//    must be in "English lemmas"/"English non-lemma forms"); words it doesn't
//    answer → Wiktionary REST / api.dictionaryapi.dev one by one.
//    Not found / not English = dropped (one-by-one lookups also keep part of
//    speech + first definition).
//    Answers are cached in scripts/data/chainWords/verified.json so a re-run
//    only asks about new words.
// 3. data/vocabBattle/chainWords.json = the verified words (runtime fallback
//    when the collection is empty) and, with --seed, the ChainWord collection.
//    Words players got accepted online during a game (source 'player') are
//    left as they are.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { BLOCK, lookup, lookupWiktionary, lookupFreeDict, wiktionaryBatch } = require('../services/wordCheck');

const DIR = path.join(__dirname, 'data', 'chainWords');
const CAND = path.join(DIR, 'candidates.txt');
const SITE_CAND = path.join(DIR, 'siteCandidates.txt');
const CACHE = path.join(DIR, 'verified.json');
const OUT = path.join(__dirname, '..', 'data', 'vocabBattle', 'chainWords.json');
const ENABLE = path.join(__dirname, '..', 'data', 'vocabBattle', 'enable1.txt.gz');
const G10K = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt';
const SUBS = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let enableSet = null;
function enable() {
  if (!enableSet) enableSet = new Set(zlib.gunzipSync(fs.readFileSync(ENABLE)).toString('utf8').split(/\r?\n/));
  return enableSet;
}

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

async function commonCandidates() {
  if (fs.existsSync(CAND)) return fs.readFileSync(CAND, 'utf8').split(/\r?\n/).filter(Boolean);
  const ok = (w) => /^[a-z]{3,10}$/.test(w) && enable().has(w) && !BLOCK.has(w);
  const web = new Set((await getText(G10K)).split(/\r?\n/).map((s) => s.trim()).filter(ok));
  const subs = (await getText(SUBS)).split(/\r?\n/).slice(0, 20000).map((l) => l.split(' ')[0]).filter(ok);
  const list = [...new Set(subs.filter((w) => web.has(w)))].sort();
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(CAND, list.join('\n') + '\n');
  return list;
}

// Words of the site's own content (needs the DB connection)
async function siteCandidates() {
  const db = require('mongoose').connection.db;
  const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const docs = [];
  for (const p of await db.collection('passages').find({ isActive: { $ne: false } }, { projection: { content: 1 } }).toArray()) docs.push(strip(p.content));
  for (const s of await db.collection('listeningsections').find({ isActive: { $ne: false } }, { projection: { transcript: 1 } }).toArray()) docs.push(strip(s.transcript));
  const seen = new Map(); // word → { docs, lower }
  for (const text of docs) {
    const inDoc = new Set();
    for (const m of text.matchAll(/[A-Za-z]+/g)) {
      const raw = m[0];
      const w = raw.toLowerCase();
      if (w.length < 4 || w.length > 12) continue;
      const e = seen.get(w) || { docs: 0, lower: false };
      if (raw === w) e.lower = true;
      if (!inDoc.has(w)) { inDoc.add(w); e.docs += 1; }
      seen.set(w, e);
    }
  }
  const ok = (w) => /^[a-z]{4,12}$/.test(w) && enable().has(w) && !BLOCK.has(w);
  const out = new Set([...seen].filter(([w, e]) => e.lower && e.docs >= 3 && ok(w)).map(([w]) => w));
  const fromContent = out.size;
  // Every single word the site teaches
  const add = (s) => {
    const w = String(s || '').toLowerCase().trim();
    if (ok(w)) out.add(w);
  };
  for (const l of await db.collection('vocabularylessons').find({ published: true }, { projection: { 'words.word': 1 } }).toArray()) for (const w of l.words || []) add(w.word);
  for (const t of await db.collection('task2topics').find({}, { projection: { 'vocabularyList.term': 1 } }).toArray()) for (const v of t.vocabularyList || []) add(v.term);
  for (const u of await db.collection('vocabunits').find({}, { projection: { 'words.word': 1, 'words.paraphrase': 1 } }).toArray()) for (const w of u.words || []) { add(w.word); add(w.paraphrase); }
  for (const s of await db.collection('listeningsections').find({}, { projection: { gapFillGlossary: 1 } }).toArray()) for (const g of s.gapFillGlossary || []) if (!g.skip) add(g.word);
  const list = [...out].sort();
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(SITE_CAND, list.join('\n') + '\n');
  console.log(`site candidates: ${list.length} (${fromContent} from ${docs.length} passages/transcripts, the rest taught on the site)`);
  return list;
}

async function verify(list) {
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  const todo = list.filter((w) => !cache[w]);
  console.log(`${list.length} candidates, ${todo.length} to look up`);
  const save = () => fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0));
  // Fast pass: Wiktionary's action API, 50 titles per request — a word is
  // English when its page is in "English lemmas" / "English non-lemma forms".
  // Missing page / no English section = not a word.
  for (let k = 0; k < todo.length; k += 50) {
    const part = todo.slice(k, k + 50);
    let pages = null;
    for (let t = 0; t < 10 && !pages; t++) {
      pages = await wiktionaryBatch(part);
      if (!pages) { console.log(`  wiktionary batch: rate-limited → wait ${Math.min(90, 20 * (t + 1))}s`); await sleep(Math.min(90000, 20000 * (t + 1))); }
    }
    if (!pages) break;
    for (const w of part) {
      const cats = pages[w];
      if (cats === undefined) continue; // not answered → per-word lookup below
      const english = cats.some((c) => /English (lemmas|non-lemma forms)/.test(c));
      cache[w] = english
        ? { ok: true, pos: '', def: '', src: 'wiktionary' } : { ok: false };
    }
    if ((k / 50) % 10 === 0) { save(); console.log(`  batch ${k + part.length}/${todo.length}`); }
    await sleep(3000);
  }
  save();

  const queue = todo.filter((w) => !cache[w]);
  let done = 0;
  // One worker per dictionary, each at its own pace: both are rate-limited,
  // so a refused word goes back in the queue and that worker backs off.
  async function worker(name, fn, gap) {
    let backoff = 0;
    while (queue.length) {
      const w = queue.shift();
      const r = await fn(w);
      if (!r) {
        queue.push(w);
        backoff = Math.min(300000, (backoff || 15000) * 2);
        console.log(`  ${name}: rate-limited → wait ${backoff / 1000}s`);
        await sleep(backoff);
        continue;
      }
      backoff = 0;
      cache[w] = r;
      done += 1;
      if (done % 100 === 0) { save(); console.log(`  ${done}/${todo.length}`); }
      await sleep(gap);
    }
  }
  await Promise.all([worker('wiktionary', lookupWiktionary, 400), worker('dictionaryapi', lookupFreeDict, 700)]);
  save();
  return cache;
}

function writeOut(list, cache) {
  const words = list.filter((w) => cache[w]?.ok).map((w) => ({ w, pos: cache[w].pos, def: cache[w].def, src: cache[w].src || 'dictionaryapi.dev' }));
  fs.writeFileSync(OUT, JSON.stringify(words) + '\n');
  const missing = list.filter((w) => !cache[w]).length;
  console.log(`✓ ${words.length} verified words → ${path.relative(process.cwd(), OUT)}`
    + ` (${list.length - words.length - missing} rejected, ${missing} not checked yet)`);
  return words;
}

async function seed(words) {
  const ChainWord = require('../models/ChainWord');
  const now = new Date();
  const ops = words.map((x) => ({
    updateOne: {
      filter: { w: x.w },
      update: { $set: { first: x.w[0], len: x.w.length, pos: x.pos, def: x.def, source: x.src || 'wiktionary', verifiedAt: now } },
      upsert: true,
    },
  }));
  for (let k = 0; k < ops.length; k += 1000) await ChainWord.bulkWrite(ops.slice(k, k + 1000), { ordered: false });
  // Words that no longer pass (list rebuilt) leave the game too — not the
  // ones players got accepted online during a game
  const gone = await ChainWord.deleteMany({ w: { $nin: words.map((x) => x.w) }, source: { $ne: 'player' } });
  console.log(`✓ ChainWord: ${words.length} upserted, ${gone.deletedCount} removed`);
}

async function main() {
  const args = process.argv.slice(2);
  const needDb = ['--seed', '--seed-only', '--site'].some((a) => args.includes(a));
  let mongoose = null;
  if (needDb) {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
  }
  try {
    let words;
    if (args.includes('--seed-only')) {
      words = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    } else {
      const common = await commonCandidates();
      let site = [];
      if (args.includes('--site')) site = await siteCandidates();
      else if (fs.existsSync(SITE_CAND)) site = fs.readFileSync(SITE_CAND, 'utf8').split(/\r?\n/).filter(Boolean);
      const list = [...new Set([...common, ...site])].sort();
      const cache = await verify(list);
      words = writeOut(list, cache);
    }
    if (args.includes('--seed') || args.includes('--seed-only')) await seed(words);
  } finally {
    if (mongoose) await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { lookup, BLOCK };
