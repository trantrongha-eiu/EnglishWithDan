'use strict';

// ⚔️ Nối chữ — build the list of words Lulu 🤖 may play, every one checked
// against an online dictionary, and save it to the database.
//
//   node scripts/seedChainWords.js            build/verify (resumable) + write JSON
//   node scripts/seedChainWords.js --seed     … then upsert into ChainWord (MONGO_URI)
//   node scripts/seedChainWords.js --seed-only
//
// 1. Candidates = common words: in BOTH the Google 10k web list
//    (first20hours/google-10000-english, no swears) AND the top 20k of the
//    OpenSubtitles list (hermitdave/FrequencyWords), AND in ENABLE, 3–10
//    letters — rare Scrabble words (konking, yobbo…) never make it in.
// 2. Each candidate → Wiktionary (action API, 50 words per request: the page
//    must be in "English lemmas"/"English non-lemma forms"); words it doesn't
//    answer → Wiktionary REST / api.dictionaryapi.dev one by one.
//    Not found / not English = dropped (one-by-one lookups also keep part of
//    speech + first definition).
//    Answers are cached in scripts/data/chainWords/verified.json so a re-run
//    only asks about new words.
// 3. data/vocabBattle/chainWords.json = the verified words (runtime fallback
//    when the collection is empty) and, with --seed, the ChainWord collection.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIR = path.join(__dirname, 'data', 'chainWords');
const CAND = path.join(DIR, 'candidates.txt');
const CACHE = path.join(DIR, 'verified.json');
const OUT = path.join(__dirname, '..', 'data', 'vocabBattle', 'chainWords.json');
const ENABLE = path.join(__dirname, '..', 'data', 'vocabBattle', 'enable1.txt.gz');
const G10K = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt';
const SUBS = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt';
const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const WIKT = 'https://en.wiktionary.org/api/rest_v1/page/definition/';

// Never in a kids-friendly game, even when a dictionary has them
const BLOCK = new Set(('sex sexy sexual nude naked porn gay rape drug drugs kill killer suicide nazi '
  + 'whore slut bitch bastard damn hell crap piss dick cock pussy fuck shit ass arse boob boobs '
  + 'penis vagina nigger nigga fag faggot retard tit tits').split(' '));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

async function candidates() {
  if (fs.existsSync(CAND)) return fs.readFileSync(CAND, 'utf8').split(/\r?\n/).filter(Boolean);
  const enable = new Set(zlib.gunzipSync(fs.readFileSync(ENABLE)).toString('utf8').split(/\r?\n/));
  const ok = (w) => /^[a-z]{3,10}$/.test(w) && enable.has(w) && !BLOCK.has(w);
  const web = new Set((await getText(G10K)).split(/\r?\n/).map((s) => s.trim()).filter(ok));
  const subs = (await getText(SUBS)).split(/\r?\n/).slice(0, 20000).map((l) => l.split(' ')[0]).filter(ok);
  const list = [...new Set(subs.filter((w) => web.has(w)))].sort();
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(CAND, list.join('\n') + '\n');
  return list;
}

const UA = { 'User-Agent': 'vocab-word-game-check/1.0 (educational English word game)' };
const stripHtml = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
// Senses that don't make a word fair game on their own
const WEAK = /^(misspelling|obsolete|archaic|nonstandard|eye dialect|pronunciation spelling|abbreviation|initialism|acronym)\b/i;

// Wiktionary REST: the word needs an English section with a real sense
async function lookupWiktionary(w) {
  let res;
  try { res = await fetch(WIKT + encodeURIComponent(w), { headers: UA, signal: AbortSignal.timeout(15000) }); } catch { return null; }
  if (res.status === 404) return { ok: false };
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const en = Array.isArray(data?.en) ? data.en : [];
  for (const sec of en) {
    for (const d of sec.definitions || []) {
      const def = stripHtml(d.definition);
      if (def && !WEAK.test(def)) return { ok: true, pos: String(sec.partOfSpeech || '').toLowerCase(), def: def.slice(0, 200), src: 'wiktionary' };
    }
  }
  return { ok: false };
}

// Up to 50 words → { word: [English category titles] } (missing page → []),
// null = rate-limited / failed
async function wiktionaryBatch(words) {
  const url = 'https://en.wiktionary.org/w/api.php?action=query&format=json&formatversion=2&prop=categories&cllimit=max'
    + '&clcategories=' + encodeURIComponent('Category:English lemmas|Category:English non-lemma forms')
    + '&titles=' + encodeURIComponent(words.join('|'));
  let res;
  try { res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) }); } catch { return null; }
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.query?.pages || data.continue) return null;
  const out = {};
  for (const p of data.query.pages) out[p.title] = p.missing ? [] : (p.categories || []).map((c) => c.title);
  return out;
}

// → { ok: true, pos, def, src } | { ok: false } | null (try again later)
async function lookup(w) {
  const r = await lookupWiktionary(w);
  if (r) return r;
  return lookupFreeDict(w); // Wiktionary down → Free Dictionary API
}

// dictionaryapi.dev (also Wiktionary data; ~450 requests / 5 min)
async function lookupFreeDict(w) {
  let res;
  try { res = await fetch(API + encodeURIComponent(w), { signal: AbortSignal.timeout(15000) }); } catch { return null; }
  if (res.status === 404) return { ok: false };
  if (res.status === 429 || res.status >= 500) return null;
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || !data.length) return { ok: false };
  // The entry must be for this exact word
  const entry = data.find((e) => String(e.word || '').toLowerCase() === w);
  if (!entry) return { ok: false };
  const m = (entry.meanings || []).find((x) => (x.definitions || []).length) || {};
  const def = String(m.definitions?.[0]?.definition || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  if (!def) return { ok: false };
  return { ok: true, pos: m.partOfSpeech || '', def, src: 'dictionaryapi.dev' };
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
  // Words that no longer pass (list rebuilt) leave the game too
  const gone = await ChainWord.deleteMany({ w: { $nin: words.map((x) => x.w) } });
  console.log(`✓ ChainWord: ${words.length} upserted, ${gone.deletedCount} removed`);
}

async function main() {
  const args = process.argv.slice(2);
  let words;
  if (args.includes('--seed-only')) {
    words = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } else {
    const list = await candidates();
    const cache = await verify(list);
    words = writeOut(list, cache);
  }
  if (args.includes('--seed') || args.includes('--seed-only')) {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    try { await seed(words); } finally { await mongoose.disconnect(); }
  }
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { lookup, BLOCK };
