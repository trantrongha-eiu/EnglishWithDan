'use strict';
// ⚔️ Đấu trường — "Từ điển mở" word bank, step 1: candidates.
//
//   node scripts/vocabBattleDict/prepare.js <viwiktionary-English.jsonl> <enwiktionary-English.jsonl>
//
// Inputs (wiktextract JSONL from kaikki.org, Wiktionary text = CC BY-SA):
//   • Vietnamese Wiktionary, English words with Vietnamese definitions
//     https://kaikki.org/viwiktionary/Tiếng Anh/kaikki.org-dictionary-TiếngAnh.jsonl (~110 MB)
//   • English Wiktionary, English words (part-of-speech order, synonyms,
//     antonyms, example sentences)
//     https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl (~3.4 GB)
// Words = the dictionary-checked common words of Nối chữ
// (data/vocabBattle/chainWords.json, not 'player' finds) that Vietnamese
// Wiktionary defines (inflected forms like "Quá khứ của …" are skipped) and
// that the site does not already teach (MONGO_URI: Vocab Topics, Task 2,
// Paraphrase, Listening glossaries — those keep the site's own meaning).
// Output: scripts/data/vocabBattleDict/candidates.json.gz — per word, the
// Vietnamese glosses in English-Wiktionary part-of-speech order, the main
// English gloss, synonym/antonym candidates and short example sentences.
// Next: pick.js (chooses the everyday meaning), then build.js.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const [VI_FILE, EN_FILE] = process.argv.slice(2);
if (!VI_FILE || !EN_FILE) { console.error('usage: prepare.js <viwiktionary.jsonl> <enwiktionary.jsonl>'); process.exit(1); }
const OUT_DIR = path.join(__dirname, '..', 'data', 'vocabBattleDict');
const OUT = path.join(OUT_DIR, 'candidates.json.gz');
const CHAIN = path.join(__dirname, '..', '..', 'data', 'vocabBattle', 'chainWords.json');

const POS = { noun: 'n', verb: 'v', adj: 'adj', adv: 'adv', prep: 'prep', conj: 'conj', pron: 'pron', intj: 'intj', det: 'det', num: 'num' };
const FORM = /^(dạng|quá khứ|phân từ|số nhiều|ngôi thứ|hiện tại phân từ|thì quá khứ|xem |cách viết|viết tắt|so sánh|biến thể)/i;
const BAD_TAG = /obsolete|archaic|form-of|alt-of|rare|dated|slang|vulgar|offensive|misspelling|derogatory|historical|nonstandard|dialectal/;

function lines(file, onLine) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
    rl.on('line', onLine);
    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

// A usable example: modern spelling, 5–14 words, has the word itself
function goodExample(text, w) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t || /[ſ\[\]{}<>|…_]/.test(t) || /[^\x20-\x7E‘’“”—–]/.test(t)) return '';
  const n = t.split(' ').length;
  if (n < 5 || n > 14 || !/^[A-Z"'‘“]/.test(t) || !/[.!?]["'’”]?$/.test(t)) return '';
  return new RegExp(`\\b${w}\\b`, 'i').test(t) ? t : '';
}

(async () => {
  const chain = new Set(JSON.parse(fs.readFileSync(CHAIN, 'utf8')).filter((x) => x.src !== 'player').map((x) => x.w));

  // Words the site already teaches (they keep the site's meaning)
  let taught = new Set();
  if (process.env.MONGO_URI && !process.argv.includes('--no-db')) {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    process.env.VOCAB_BATTLE_OFFLINE = '1';
    const { loadPools } = require('../../services/vocabBattleBank');
    const pools = await loadPools({ external: false });
    taught = new Set([...pools.bank]);
    await mongoose.disconnect();
  }
  console.log(`${chain.size} common words, ${taught.size} taught on the site`);

  // 1. Vietnamese glosses per word and POS (in file order)
  const vi = new Map();
  await lines(VI_FILE, (l) => {
    if (!l) return;
    const e = JSON.parse(l);
    const w = e.word;
    if (!chain.has(w) || taught.has(w) || !POS[e.pos]) return;
    const gl = (e.senses || []).map((s) => (s.glosses || []).join(' ').replace(/\s+/g, ' ').trim())
      .filter((g) => g && !FORM.test(g) && g.length <= 160);
    if (!gl.length) return;
    let m = vi.get(w);
    if (!m) { m = {}; vi.set(w, m); }
    (m[POS[e.pos]] = m[POS[e.pos]] || []).push(...gl);
  });
  console.log(`${vi.size} words with Vietnamese glosses`);

  // 2. English Wiktionary: POS order, main gloss, synonyms, antonyms, examples
  const en = new Map();
  let n = 0;
  await lines(EN_FILE, (l) => {
    if (++n % 200000 === 0) process.stdout.write(`  ${n} lines…\r`);
    if (l.indexOf('"lang_code": "en"') < 0) return;
    const e = JSON.parse(l);
    if (e.lang_code !== 'en' || !vi.has(e.word) || !POS[e.pos]) return;
    const senses = (e.senses || []).filter((s) => !(s.tags || []).some((t) => BAD_TAG.test(t)) && (s.glosses || []).length);
    if (!senses.length) return;
    let m = en.get(e.word);
    if (!m) { m = { order: [], gloss: {}, syn: new Set(), ant: new Set(), ex: [] }; en.set(e.word, m); }
    const p = POS[e.pos];
    if (!m.order.includes(p)) m.order.push(p);
    if (!m.gloss[p]) m.gloss[p] = senses.slice(0, 3).map((s) => s.glosses[s.glosses.length - 1]).map((g) => g.slice(0, 140));
    const one = (x) => /^[a-z]+$/.test(x) && x !== e.word && chain.has(x);
    for (const s of senses.slice(0, 3)) {
      for (const x of s.synonyms || []) if (one(x.word)) m.syn.add(x.word);
      for (const x of s.antonyms || []) if (one(x.word)) m.ant.add(x.word);
      for (const x of s.examples || []) { const t = goodExample(x.text, e.word); if (t && m.ex.length < 4) m.ex.push(t); }
    }
    for (const x of e.synonyms || []) if (one(x.word)) m.syn.add(x.word);
    for (const x of e.antonyms || []) if (one(x.word)) m.ant.add(x.word);
  });
  console.log('');

  const out = [];
  for (const [w, glosses] of vi) {
    const e = en.get(w);
    const order = [...(e ? e.order : []), ...Object.keys(glosses)].filter((p, i, a) => a.indexOf(p) === i && glosses[p]);
    out.push({
      w,
      vi: order.map((p) => ({ pos: p, gl: [...new Set(glosses[p])].slice(0, 6) })),
      en: e ? order.filter((p) => e.gloss[p]).map((p) => ({ pos: p, gl: e.gloss[p] })) : [],
      syn: e ? [...e.syn].slice(0, 6) : [],
      ant: e ? [...e.ant].slice(0, 6) : [],
      ex: e ? e.ex : [],
    });
  }
  out.sort((a, b) => a.w.localeCompare(b.w));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, zlib.gzipSync(JSON.stringify(out)));
  console.log(`${out.length} candidates → ${path.relative(process.cwd(), OUT)}`
    + ` (${out.filter((x) => x.en.length).length} in English Wiktionary, ${out.filter((x) => x.ex.length).length} with examples,`
    + ` ${out.filter((x) => x.syn.length).length} synonyms, ${out.filter((x) => x.ant.length).length} antonyms)`);
})().catch((e) => { console.error(e); process.exit(1); });
