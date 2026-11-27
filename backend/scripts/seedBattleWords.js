'use strict';
// ⚔️ Đấu trường — fill the BattleWord collection (models/BattleWord.js).
//
//   node scripts/seedBattleWords.js            dry run: what would change
//   node scripts/seedBattleWords.js --apply    write (MONGO_URI)
//   node scripts/seedBattleWords.js --apply --prune   + delete un-edited words no longer in the lists
//
// Sources:
//   • data/vocabBattle/pictureWords.json — "Từ có hình ảnh" (scripts/vocabBattlePictures/build.js)
//   • scripts/data/vocabBattleDict/{candidates.json.gz, picks.json} — Từ điển mở
//     (scripts/vocabBattleDict/prepare.js → pick.js): words picked ok, meaning
//     = the picked everyday meaning (replaced by verify.js's blind
//     translation, origin 'ai', when the two share no content syllable),
//     example = an English Wiktionary sentence,
//     ant = only when both words picked each other as opposites.
// Words an admin edited (edited: true) are never touched; new words are
// inserted, un-edited ones updated. Words the site starts teaching later stay
// (they'd just appear twice with two meanings) — re-run prepare.js to drop them.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const mongoose = require('mongoose');
const BattleWord = require('../models/BattleWord');

const APPLY = process.argv.includes('--apply');
const PRUNE = process.argv.includes('--prune');
const PICTURES = path.join(__dirname, '..', 'data', 'vocabBattle', 'pictureWords.json');
const DICT_DIR = path.join(__dirname, 'data', 'vocabBattleDict');
const CHUNK = 250; // Từ điển mở words per set (per part of speech, alphabetical)
const POS_TITLE = { n: 'Danh từ', v: 'Động từ', adj: 'Tính từ', adv: 'Trạng từ', other: 'Từ khác' };

// Both words picked each other as opposites, but they aren't the kind of
// pair a learner would call opposites (checked by hand 2026-11-27)
const BAD_PAIRS = new Set([
  'groove/ridge', 'lee/weather', 'niece/uncle', 'infrared/ultraviolet', 'fool/sage', 'northeast/southwest',
  'anywhere/somewhere', 'differ/match', 'cause/effect', 'landscape/portrait', 'poetry/prose', 'fixed/mobile',
  'falsely/honestly', 'normally/unusually', 'credit/debit', 'retail/wholesale',
]);

const tidy = (s) => String(s || '').normalize('NFC').trim().replace(/[.;]+$/, '').replace(/\s+/g, ' ');
// Syllables that don't carry the meaning ("sự", "việc", "cái"…)
const FILLER = new Set(['sự', 'việc', 'cái', 'con', 'người', 'có', 'của', 'làm', 'được', 'bị', 'một', 'các', 'những', 'thuộc',
  'tính', 'về', 'mặt', 'cho', 'và', 'hoặc', 'là', 'trong', 'với', 'theo', 'đã', 'đang', 'sẽ', 'rất', 'cách', 'nhà', 'nơi', 'điều']);
const syllables = (s) => tidy(s).toLowerCase().split(/[\s,/()-]+/).filter((t) => t && !FILLER.has(t));
function agree(a, b) {
  const x = new Set(syllables(a));
  return syllables(b).some((t) => x.has(t));
}

function pictureRows() {
  const data = JSON.parse(fs.readFileSync(PICTURES, 'utf8'));
  const rows = [];
  for (const s of data.sets) {
    for (const w of s.words) {
      rows.push({ kind: 'picture', word: w.word, meaning: w.meaning, pos: 'n', set: s.id, setTitle: s.title,
        imageUrl: w.imageUrl, example: '', near: w.near || [], ant: '', origin: 'fluent' });
    }
  }
  return rows;
}

function dictRows() {
  const cands = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DICT_DIR, 'candidates.json.gz'))).toString('utf8'));
  const picks = JSON.parse(fs.readFileSync(path.join(DICT_DIR, 'picks.json'), 'utf8'));
  const blindFile = path.join(DICT_DIR, 'blind.json');
  const blind = fs.existsSync(blindFile) ? JSON.parse(fs.readFileSync(blindFile, 'utf8')) : {};
  const byPos = {};
  let swapped = 0;
  for (const c of cands) {
    const p = picks[c.w];
    let vi = p && tidy(p.vi);
    if (!p || !p.ok || !vi) continue;
    let origin = p.src === 'ai' ? 'ai' : 'wiktionary';
    // verify.js: a blind translation that shares nothing with the picked
    // meaning → the pick was probably a rare sense; use the translation
    const b = tidy(blind[c.w]);
    if (b && !agree(vi, b)) { vi = b; origin = 'ai'; swapped += 1; }
    if (vi.length > 60 || vi.toLowerCase() === c.w) continue;
    const pos = POS_TITLE[p.pos] ? p.pos : 'other';
    const ant = p.ant && picks[p.ant] && picks[p.ant].ok && picks[p.ant].ant === c.w
      && !BAD_PAIRS.has([c.w, p.ant].sort().join('/')) ? p.ant : '';
    (byPos[pos] = byPos[pos] || []).push({ kind: 'dict', word: c.w, meaning: vi, pos: p.pos || '', example: c.ex[0] || '',
      near: [], ant, imageUrl: '', origin });
  }
  console.log(`${swapped} meanings replaced by the cross-check translation`);
  const rows = [];
  for (const [pos, list] of Object.entries(byPos)) {
    list.sort((a, b) => a.word.localeCompare(b.word));
    const parts = Math.ceil(list.length / CHUNK);
    const size = Math.ceil(list.length / parts);
    for (let k = 0; k < parts; k++) {
      const part = list.slice(k * size, (k + 1) * size);
      const set = `${pos}-${String(k + 1).padStart(2, '0')}`;
      const title = `Từ điển mở – ${POS_TITLE[pos]}${parts > 1 ? ` ${k + 1} (${part[0].word} … ${part[part.length - 1].word})` : ''}`;
      for (const r of part) rows.push({ ...r, set, setTitle: title });
    }
  }
  return rows;
}

(async () => {
  const rows = [...pictureRows(), ...dictRows()];
  console.log(`${rows.filter((r) => r.kind === 'picture').length} picture words, ${rows.filter((r) => r.kind === 'dict').length} dictionary words`
    + ` (${rows.filter((r) => r.origin === 'ai').length} meanings by AI, ${rows.filter((r) => r.ant).length} with an antonym, ${rows.filter((r) => r.example).length} with an example)`);
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const existing = await BattleWord.find({}).select('kind word edited origin').lean();
    const have = new Map(existing.map((d) => [`${d.kind}|${d.word}`, d]));
    const keys = new Set(rows.map((r) => `${r.kind}|${r.word}`));
    const ops = [];
    let ins = 0, upd = 0, kept = 0;
    for (const r of rows) {
      const d = have.get(`${r.kind}|${r.word}`);
      if (!d) { ops.push({ insertOne: { document: r } }); ins += 1; }
      else if (d.edited) kept += 1;
      else { ops.push({ updateOne: { filter: { _id: d._id, edited: { $ne: true } }, update: { $set: r } } }); upd += 1; }
    }
    const gone = existing.filter((d) => !d.edited && d.origin !== 'admin' && !keys.has(`${d.kind}|${d.word}`));
    if (PRUNE) for (const d of gone) ops.push({ deleteOne: { filter: { _id: d._id, edited: { $ne: true } } } });
    console.log(`insert ${ins}, update ${upd}, keep ${kept} admin-edited, ${gone.length} no longer listed${PRUNE ? ' (deleted)' : ''}`);
    if (!APPLY) { console.log('dry run — re-run with --apply.'); return; }
    for (let i = 0; i < ops.length; i += 1000) await BattleWord.bulkWrite(ops.slice(i, i + 1000), { ordered: false });
    console.log('done.');
  } finally {
    await mongoose.disconnect();
  }
})().catch((e) => { console.error(e); process.exit(1); });
