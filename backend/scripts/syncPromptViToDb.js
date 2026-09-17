// scripts/syncPromptViToDb.js
//
// generatePromptVi.js's DB writes silently no-op'd: it loaded WT1Exercise
// docs via .select('code items'), which excludes the __v version key —
// Mongoose's .save() then issues an updateOne({_id, __v: <unset>}, ...)
// that matches zero documents, resolves without error, and writes nothing.
// The JSON seed files it wrote afterward ARE correct (293 items across 12
// files), so this just copies promptVi from JSON into the DB directly via
// a targeted per-item $set (positional array filter) — no full-document
// load, no __v involved, no AI calls needed since the text already exists.
//
//   node scripts/syncPromptViToDb.js --dry
//   node scripts/syncPromptViToDb.js
'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const COURSE_DIRS = ['writingTask1', 'writingTask2', 'speakingCourse', 'nounPhrase'];

function collectFromJson() {
  // code -> [{ itemId, promptVi }]
  const byCode = new Map();
  for (const courseDir of COURSE_DIRS) {
    const dir = path.join(DATA_DIR, courseDir);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => /^exercises-.*\.json$/.test(x))) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const ex of data.exercises || []) {
        if (ex.type !== 'sentence_transform') continue;
        for (const it of ex.items || []) {
          if (!it.promptVi) continue;
          if (!byCode.has(ex.code)) byCode.set(ex.code, []);
          byCode.get(ex.code).push({ itemId: it.id, promptVi: it.promptVi });
        }
      }
    }
  }
  return byCode;
}

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[syncPromptViToDb] ${dry ? 'DRY RUN' : 'LIVE'}\n`);

  const byCode = collectFromJson();
  let totalPairs = 0;
  for (const arr of byCode.values()) totalPairs += arr.length;
  console.log(`JSON source: ${byCode.size} exercises, ${totalPairs} items with promptVi`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB');

  let matched = 0, modified = 0, notFoundCodes = 0;
  for (const [code, items] of byCode) {
    const exists = await WT1Exercise.exists({ code });
    if (!exists) { notFoundCodes++; continue; }
    for (const { itemId, promptVi } of items) {
      matched++;
      if (dry) continue;
      const r = await WT1Exercise.updateOne(
        { code, 'items.id': itemId, 'items.promptVi': { $in: [null, undefined, ''] } },
        { $set: { 'items.$.promptVi': promptVi } }
      );
      if (r.modifiedCount) modified++;
    }
  }

  console.log(`Đối chiếu được ${matched} items (code tồn tại trong DB); code không tìm thấy: ${notFoundCodes}`);
  if (!dry) console.log(`Đã ghi (modifiedCount=1): ${modified}/${matched}`);
  else console.log('(dry — không ghi gì)');

  const remaining = await WT1Exercise.aggregate([
    { $match: { type: 'sentence_transform' } },
    { $unwind: '$items' },
    { $match: { $or: [{ 'items.promptVi': { $exists: false } }, { 'items.promptVi': '' }] } },
    { $count: 'n' },
  ]);
  console.log('Còn thiếu promptVi trong DB (sentence_transform):', remaining[0] ? remaining[0].n : 0);

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
