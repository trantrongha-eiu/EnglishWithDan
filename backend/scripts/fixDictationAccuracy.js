// Applies a sentence-by-sentence accuracy check of Luyện Dictation to the DB.
//
// The check itself runs outside this repo (2026-11-20): every sentence's
// exact clip [start, end] was cut from its section audio and re-transcribed
// with faster-whisper base.en; a sentence whose clip misses its first / last
// words, carries a neighbour's words (or the exam's "That is the end of
// part 3"), or doesn't contain the sentence at all was re-timed from the
// section's local ASR words (scripts/data/transcriptAsr/s_<id>.json) and
// checked again. Input (--plan <file>):
//   { retime: { "<sectionId>": [{ i, start, end }] },   // re-timed + verified
//     drop:   { "<sectionId>": [i, …] } }                // still wrong → removed
//
// On top of that every sentence's TEXT is cleaned of things nobody says:
// question markers ("Q14/15 -----", "Q6."), speaker labels ("Student 1
// (Female):", "...:") — the transcript itself is left as it is.
//
// A section left with fewer than MIN_SENTENCES is taken off the dictation
// list (dictationSentences emptied, dictationSkippedAt/Reason set).
// Every section touched is backed up to scripts/backups/ first.
//
//   node scripts/fixDictationAccuracy.js --plan D:/tmp-dictcheck/plan.json          # dry run
//   node scripts/fixDictationAccuracy.js --plan D:/tmp-dictcheck/plan.json --apply
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MIN_SENTENCES = 5;

function cleanText(t) {
  return String(t || '')
    .replace(/^(\s*\.{3}\s*:\s*)+/, '')
    .replace(/\b(?:Student|Speaker|Man|Woman|Tutor|Lecturer|Interviewer|Presenter)\s*\d*\s*(?:\((?:Male|Female|M|F)\))?\s*:\s*/g, '')
    .replace(/\((?:Male|Female|M|F)\)\s*/g, '')
    .replace(/\bQ\d{1,2}(?:\s*[/&-]\s*\d{1,2})?\.?(?=\s|$)\s*/g, '')
    .replace(/-{3,}\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function main() {
  const argv = process.argv.slice(2);
  const APPLY = argv.includes('--apply');
  const pi = argv.indexOf('--plan');
  const plan = pi >= 0 ? JSON.parse(fs.readFileSync(argv[pi + 1], 'utf8')) : { retime: {}, drop: {} };
  const ListeningSection = require('../models/ListeningSection');
  await mongoose.connect(process.env.MONGO_URI);

  const sections = await ListeningSection.find({ 'dictationSentences.0': { $exists: true } })
    .select('title dictationSentences').lean();
  const backup = [];
  const updates = [];
  const stats = { sections: 0, retimed: 0, dropped: 0, cleaned: 0, emptied: [] };
  for (const s of sections) {
    const id = String(s._id);
    const retime = new Map((plan.retime[id] || []).map((r) => [r.i, r]));
    const drop = new Set(plan.drop[id] || []);
    let changed = false;
    const next = [];
    s.dictationSentences.forEach((d, i) => {
      if (drop.has(i)) { stats.dropped++; changed = true; return; }
      const out = { text: d.text, start: d.start, end: d.end };
      const r = retime.get(i);
      if (r) { out.start = r.start; out.end = r.end; stats.retimed++; changed = true; }
      const text = cleanText(d.text);
      if (text !== d.text) { out.text = text; stats.cleaned++; changed = true; }
      if (out.text) next.push(out);
    });
    if (!changed) continue;
    stats.sections++;
    backup.push({ _id: id, title: s.title, dictationSentences: s.dictationSentences });
    const set = next.length >= MIN_SENTENCES
      ? { dictationSentences: next }
      : { dictationSentences: [], dictationSkippedAt: new Date(), dictationSkipReason: `accuracy check 2026-11-20: only ${next.length} sentence(s) left` };
    if (next.length < MIN_SENTENCES) stats.emptied.push(`${s.title} (${next.length})`);
    updates.push({ _id: s._id, set });
  }
  if (APPLY && updates.length) {
    // backup first, then write
    const dir = path.join(__dirname, 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `dictation-accuracy-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(backup));
    console.log('backup →', path.relative(process.cwd(), file));
    for (const u of updates) await ListeningSection.updateOne({ _id: u._id }, { $set: u.set });
  }
  console.log({ ...stats, emptied: stats.emptied.length }, stats.emptied);
  if (!APPLY) console.log('dry run — add --apply');
  await mongoose.disconnect();
}

if (require.main === module) main().catch((e) => { console.error('✗', e); process.exit(1); });
module.exports = { cleanText };
