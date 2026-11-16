'use strict';

// Task 2 weekly lessons (task2-practice.html), step ③ "Dịch câu" clean-up:
//
//  1. The "Dịch câu KẾT BÀI" translation repeats the short_writing model word
//     for word. The conclusion is now written by the student from the Band 7
//     template (AI-graded), so the translation copy is deactivated.
//  2. Near-identical sentences inside one topic (same idea, same words —
//     e.g. "A high salary helps provide financial security for workers." ×2)
//     keep one copy: the one with a `dùng từ "X"` key phrase (needed for the
//     mcq / gap formats), else the earlier one.
//  3. The short_writing instruction is reworded for the new task.
//
// Deactivates (isActive:false) — never deletes; the lesson list still credits
// an answer given on a deactivated conclusion translation. Backup of every
// touched topic's questions goes to scripts/data/task2TrimBackup/.
//
//   node scripts/trimTask2Redundant.js --dry   # print the plan
//   node scripts/trimTask2Redundant.js         # apply
//   node scripts/trimTask2Redundant.js --restore <backup.json>
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Task2Topic = require('../models/Task2Topic');

const DUP_THRESHOLD = 0.44; // Jaccard on content words; every pair above it was checked by hand (2026-11-16)
const STOP = new Set('the a an of to and in is are can be for that this with on as by it from more have has their its or which will people many not at also'.split(' '));
const toks = s => new Set(String(s || '').toLowerCase().replace(/[^a-z0-9 -]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w)));
const jaccard = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / ((a.size + b.size - i) || 1); };
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const model = q => q.correctAnswer || q.modelAnswer || '';
const hasKey = q => /dùng (?:từ|cụm từ|cấu trúc)\s*["“]/i.test(q.questionText || '');

function conclusionText(prompt) {
  return 'Tự viết ĐOẠN KẾT BÀI (2–3 câu) bằng tiếng Anh cho đề sau, theo template kết bài Band 7.0:\n\n'
    + `"${prompt}"\n\n`
    + 'Gợi ý: (1) mở bằng "In conclusion," / "To sum up,"; (2) tóm tắt lại các ý đã viết ở 2 thân bài — không thêm ý mới; '
    + '(3) nêu ý kiến của bạn nếu đề hỏi; (4) cố gắng dùng một câu điều kiện loại 1 hoặc loại 2.';
}

function plan(topic) {
  const qs = (topic.questions || []).filter(q => q.isActive !== false);
  const off = new Map(); // _id → reason
  const conclModels = new Set(qs.filter(q => q.type === 'short_writing').map(q => norm(model(q))));
  qs.filter(q => q.type === 'translation' && conclModels.has(norm(model(q))))
    .forEach(q => off.set(String(q._id), 'dịch KẾT BÀI trùng đoạn kết tự viết'));
  const tr = qs.filter(q => q.type === 'translation' && !off.has(String(q._id)))
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  for (let i = 0; i < tr.length; i++) {
    for (let j = i + 1; j < tr.length; j++) {
      const a = tr[i], b = tr[j];
      if (off.has(String(a._id)) || off.has(String(b._id))) continue;
      const sim = jaccard(toks(model(a)), toks(model(b)));
      if (sim < DUP_THRESHOLD) continue;
      const drop = hasKey(b) && !hasKey(a) ? a : b;
      const keep = drop === a ? b : a;
      off.set(String(drop._id), `gần trùng (${sim.toFixed(2)}) với: ${model(keep)}`);
    }
  }
  const reword = qs.filter(q => q.type === 'short_writing' && q.questionText !== conclusionText(topic.prompt));
  return { off, reword, qs };
}

async function main() {
  const dry = process.argv.includes('--dry');
  const ri = process.argv.indexOf('--restore');
  await mongoose.connect(process.env.MONGO_URI);

  if (ri > 0) {
    const backup = JSON.parse(fs.readFileSync(process.argv[ri + 1], 'utf8'));
    for (const t of backup) {
      await Task2Topic.updateOne({ _id: t._id }, { $set: { questions: t.questions } });
      console.log('restored', t.topicName);
    }
    await mongoose.disconnect();
    return;
  }

  const topics = await Task2Topic.find({ isActive: true }).sort({ week: 1, orderIndex: 1 });
  const backup = [];
  let nOff = 0, nReword = 0;
  for (const topic of topics) {
    const { off, reword, qs } = plan(topic);
    if (!off.size && !reword.length) continue;
    console.log(`\n[W${topic.week}] ${topic.topicName}  (${qs.filter(q => ['translation', 'paraphrase', 'short_writing'].includes(q.type)).length} câu → ${qs.filter(q => ['translation', 'paraphrase', 'short_writing'].includes(q.type)).length - off.size})`);
    for (const q of qs) {
      const why = off.get(String(q._id));
      if (why) console.log(`  − ${model(q)}\n      ↳ ${why}`);
    }
    if (reword.length) console.log(`  ✎ đổi đề bài đoạn kết (${reword.length})`);
    nOff += off.size; nReword += reword.length;
    if (dry) continue;
    backup.push({ _id: String(topic._id), topicName: topic.topicName, questions: topic.toObject().questions });
    topic.questions.forEach(q => {
      if (off.has(String(q._id))) q.isActive = false;
      if (q.type === 'short_writing' && q.isActive !== false) q.questionText = conclusionText(topic.prompt);
    });
    topic.markModified('questions');
    await topic.save();
  }
  if (!dry && backup.length) {
    const dir = path.join(__dirname, 'data', 'task2TrimBackup');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `questions-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(backup, null, 1));
    console.log('\nbackup →', file);
  }
  console.log(`\n${dry ? 'DRY RUN — ' : ''}${nOff} câu tắt · ${nReword} đề đoạn kết đổi`);
  await mongoose.disconnect();
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { plan, conclusionText };
