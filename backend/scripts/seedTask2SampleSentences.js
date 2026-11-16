'use strict';

// Rebuilds step ③ "Dịch câu" (task2-practice.html) of the topics listed in
// scripts/data/task2/sampleSentences.js from "Bài mẫu từ Daniel" — the model
// essay of the same prompt on writing.html (WritingTask2.sampleSections):
//   • every active translation / paraphrase of the topic → isActive:false
//     (kept, never deleted — students who passed the old set keep the
//     writing steps open, see legacyPassed in task2PracticeService);
//   • Daniel's intro + body sentences are added (updated by questionId) in
//     essay order, each with its Vietnamese prompt; every `en` must still be
//     in the sample verbatim, or the topic is skipped;
//   • "Tự viết kết bài" (short_writing) moves to the end and its reference
//     model becomes Daniel's conclusion.
// Other question types (nhận diện dạng, điền từ, sắp xếp, sửa lỗi) are untouched.
//
//   node scripts/seedTask2SampleSentences.js --dry
//   node scripts/seedTask2SampleSentences.js
//   node scripts/seedTask2SampleSentences.js --restore <backup.json>
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Task2Topic = require('../models/Task2Topic');
const WritingTask2 = require('../models/WritingTask2');
const DATA = require('./data/task2/sampleSentences');

const SECTION_HEAD = { intro: 'MỞ BÀI', body1: 'THÂN BÀI 1', body2: 'THÂN BÀI 2' };
const SECTION_IDX = { intro: 0, body1: 1, body2: 2 };
const ROLE_VI = {
  hook: 'câu mở đầu — paraphrase đề', thesis: 'câu nêu hướng bài viết (thesis)',
  topic: 'câu chủ đề của đoạn', idea1: 'ý chính 1', support1: 'phát triển ý 1 (giải thích / ví dụ)',
  idea2: 'ý chính 2', support2: 'phát triển ý 2 (giải thích / kết quả / dẫn chứng)',
  restate: 'tóm tắt lại', final: 'câu chốt'
};
const ORDER_BASE = 30;       // after the other question types (1–24)
const CONCLUSION_ORDER = 99; // "Tự viết kết bài" always last

const squash = s => String(s || '').replace(/\s+/g, ' ').trim();
const normPrompt = s => (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[."'’,\s]+$/g, '').trim();

function questionText(s) {
  const head = SECTION_HEAD[s.sec];
  return s.key
    ? `${head} · Dịch câu trong bài mẫu (dùng cấu trúc "${s.key}"):\n\n"${s.vi}"`
    : `${head} · Dịch câu trong bài mẫu:\n\n"${s.vi}"`;
}

function keywords(s) {
  const kw = s.key ? [s.key.toLowerCase()] : [];
  for (const w of s.en.replace(/[.,;:]/g, '').split(/\s+/)) {
    const lw = w.toLowerCase();
    if (kw.length >= 5) break;
    if (lw.length > 6 && !kw.some(k => k.includes(lw))) kw.push(lw);
  }
  return kw;
}

// sample = WritingTask2.sampleSections → the question docs (pure; tested).
// Throws when a sentence or key phrase is not where the data file says.
function buildQuestions(entry, sample) {
  return entry.sentences.map((s, i) => {
    const sec = (sample || [])[SECTION_IDX[s.sec]];
    if (!sec || !squash(sec.content).includes(squash(s.en))) throw new Error(`not in Daniel's ${s.sec}: ${s.en}`);
    if (s.key && !s.en.includes(s.key)) throw new Error(`key "${s.key}" not in: ${s.en}`);
    const hl = (sec.highlights || []).find(h => squash(h.text) === squash(s.en));
    const role = hl && ROLE_VI[hl.role];
    return {
      questionId: `${entry.prefix}${String(i + 1).padStart(2, '0')}`,
      level: 'intermediate',
      type: 'translation',
      questionText: questionText(s),
      correctAnswer: s.en,
      modelAnswer: s.en,
      explanationVi: `Câu trong bài mẫu của Daniel · ${SECTION_HEAD[s.sec]}${role ? ` · ${role}` : ''}.`
        + (s.key ? ` Cấu trúc "${s.key}" là khung câu của template Band 7.0 — dùng lại được cho đề khác.` : ''),
      fallbackKeywords: keywords(s),
      orderIndex: ORDER_BASE + i + 1,
      isActive: true
    };
  });
}

async function sampleFor(topic) {
  if (topic.writingTask2Id) {
    const w = await WritingTask2.findById(topic.writingTask2Id).select('prompt sampleSections').lean();
    if (w) return w;
  }
  const all = await WritingTask2.find({}).select('prompt sampleSections').lean();
  return all.find(w => normPrompt(w.prompt) === normPrompt(topic.prompt)) || null;
}

async function main() {
  const dry = process.argv.includes('--dry');
  const ri = process.argv.indexOf('--restore');
  await mongoose.connect(process.env.MONGO_URI);
  if (ri > 0) {
    for (const t of JSON.parse(fs.readFileSync(process.argv[ri + 1], 'utf8'))) {
      await Task2Topic.updateOne({ _id: t._id }, { $set: { questions: t.questions } });
      console.log('restored', t.topicName);
    }
    return mongoose.disconnect();
  }
  const backup = [];
  for (const [topicId, entry] of Object.entries(DATA)) {
    const topic = await Task2Topic.findById(topicId);
    if (!topic) { console.log('✗ topic not found', entry.label); continue; }
    const wt = await sampleFor(topic);
    if (!wt) { console.log('✗ no Writing Task 2 sample for', entry.label); continue; }
    let next;
    try { next = buildQuestions(entry, wt.sampleSections); } catch (e) { console.log('✗', entry.label, '—', e.message); continue; }
    const conclusion = squash((wt.sampleSections[3] || {}).content);
    const ids = new Set(next.map(q => q.questionId));
    const off = topic.questions.filter(q => q.isActive !== false && ['translation', 'paraphrase'].includes(q.type) && !ids.has(q.questionId));
    console.log(`\n${entry.label}: tắt ${off.length} câu cũ → ${next.length} câu từ bài mẫu Daniel + tự viết kết bài`);
    next.forEach(q => console.log(`  ${q.questionId}  ${q.questionText.split('\n')[0]}\n      ${q.correctAnswer}`));
    console.log(`  kết bài mẫu: ${conclusion.slice(0, 90)}…`);
    if (dry) continue;
    backup.push({ _id: topicId, topicName: topic.topicName, questions: topic.toObject().questions });
    off.forEach(q => { q.isActive = false; });
    for (const doc of next) {
      const cur = topic.questions.find(x => x.questionId === doc.questionId);
      if (cur) Object.assign(cur, doc); else topic.questions.push(doc);
    }
    topic.questions.forEach(q => {
      if (q.type !== 'short_writing' || q.isActive === false) return;
      q.orderIndex = CONCLUSION_ORDER;
      if (conclusion) { q.modelAnswer = conclusion; q.correctAnswer = conclusion; }
    });
    if (!topic.writingTask2Id) topic.writingTask2Id = wt._id;
    topic.markModified('questions');
    await topic.save();
  }
  if (!dry && backup.length) {
    const dir = path.join(__dirname, 'data', 'task2TrimBackup');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `sample-sentences-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(file, JSON.stringify(backup, null, 1));
    console.log('\nbackup →', file);
  }
  await mongoose.disconnect();
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { buildQuestions, questionText };
