// scripts/fixWt1SampleLineBreaks.js
// Multi-part WT1 exercises (responseSlots > 1) had their "Bài mẫu" stored
// as one paragraph, so the parts ran together in the review modal and the
// student's "Xem bài mẫu". This puts each part on its own line:
//   - one sentence per part      → "1. …\n2. …" (lines up with "Phần 1, 2…")
//   - paragraph exercises        → blank line between paragraphs
//   - samples covering only part of the task → one sentence per line, no numbers
//
//   node scripts/fixWt1SampleLineBreaks.js          # JSON + DB
//   node scripts/fixWt1SampleLineBreaks.js --dry    # show changes only
//
// DB rows are only touched when they still hold the old paragraph, so edits
// made in the admin "Khoá học" pages are kept. Safe to re-run.
'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'data', 'writingTask1');
const sentences = (s) => s.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/);
const numbered = (parts) => parts.map((p, i) => `${i + 1}. ${p}`).join('\n');
const lines = (parts) => parts.join('\n');

// Exercises whose sentence count doesn't map 1:1 onto their parts.
const SPECIAL = {
  // CT4 ("Cambodia … Meanwhile, Laos …") spans two sentences.
  'T1-L03-E05': (p) => numbered([p[0], p[1], p[2], `${p[3]} ${p[4]}`, p[5], p[6], p[7]]),
  // Đoạn 1 = 2005, Đoạn 2 = 2005 → 2010.
  'T1-L06-E09': (p) => `${p.slice(0, 2).join(' ')}\n\n${p.slice(2).join(' ')}`,
  // Introduction / Overview / Body 1.
  'T1-L22-E03': (p) => `${p[0]}\n\n${p[1]}\n\n${p.slice(2).join(' ')}`,
  // Two alternative Introductions separated by " / ".
  'T1-L08-E03': (_p, s) => lines(s.split(/\s+\/\s+/)),
  // Samples that cover only some of the parts.
  'T1-L05-E07': (p) => lines(p),
  'T1-L06-E04': (p) => lines(p),
  'T1-L14-E04': (p) => lines(p),
};

function reformat(ex) {
  const s = ex.rubric && ex.rubric.sampleAnswer;
  if (!(ex.responseSlots > 1) || !s || s.includes('\n')) return null;
  const p = sentences(s);
  if (SPECIAL[ex.code]) return SPECIAL[ex.code](p, s);
  return p.length === ex.responseSlots ? numbered(p) : null;
}

async function main() {
  const dry = process.argv.includes('--dry');
  const changes = []; // { code, from, to }

  for (const f of fs.readdirSync(DIR).filter((n) => /^exercises-.*\.json$/.test(n))) {
    const file = path.join(DIR, f);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let touched = false;
    for (const ex of data.exercises) {
      const next = reformat(ex);
      if (!next || next === ex.rubric.sampleAnswer) continue;
      changes.push({ code: ex.code, from: ex.rubric.sampleAnswer, to: next });
      ex.rubric.sampleAnswer = next;
      touched = true;
    }
    if (touched && !dry) fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  }

  for (const c of changes) console.log(`\n=== ${c.code}\n${c.to}`);
  console.log(`\n${changes.length} sample(s) reformatted${dry ? ' (dry run)' : ' in JSON'}.`);
  if (dry || !changes.length) return;

  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  let updated = 0;
  for (const c of changes) {
    const r = await WT1Exercise.updateOne(
      { code: c.code, 'rubric.sampleAnswer': c.from },
      { $set: { 'rubric.sampleAnswer': c.to } }
    );
    if (r.modifiedCount) updated++;
    else console.log(`  - ${c.code}: DB không còn bản cũ (đã sửa trong admin hoặc đã chạy) — bỏ qua`);
  }
  console.log(`DB: ${updated}/${changes.length} updated.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
