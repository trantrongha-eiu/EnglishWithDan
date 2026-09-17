// scripts/generatePromptVi.js
//
// Generates `promptVi` — a natural Vietnamese meaning of the TARGET/answer
// sentence — for every "dịch câu" (gõ từng chữ / WBW) exercise item that
// doesn't have one yet, across:
//   1. WT1Exercise docs (type: 'sentence_transform') — covers all 4 courses
//      sharing this collection: Task 1 (T1-), Task 2 (T2-), Speaking (SPK-),
//      Noun Phrase (NP-). Target = items[].sampleAnswers[0].
//   2. Task2Topic docs, questions with type 'paraphrase' or 'short_writing'
//      (the weekly Task 2 practice page, task2-practice.html — a separate,
//      older implementation, not WT1Exercise). Target = translationAnswer.
// Genuine translation-type items already have the Vietnamese source baked
// into their prompt/questionText — never touched here.
//
// `promptVi` already exists as an established field/convention (see 5 items
// in scripts/data/writingTask1/exercises-module4-maps.json, and viRow in
// task2-practice.html's "rearrange" type) — it's the Vietnamese sentence a
// teacher would give a student to translate INTO the English target, shown
// to help students know WHAT meaning to construct without revealing the
// literal target wording (this matters more now that "Hiện tất cả" — the
// full-reveal button — has been removed from every WBW drill).
//
// Writes to the LIVE DB first (immediate effect), then best-effort syncs the
// same values into the JSON seed files under scripts/data/ (source of truth
// for a from-scratch reseed) by matching exercise `code` + item `id` — never
// touches any other field.
//
//   node scripts/generatePromptVi.js --dry        # report counts + a few samples, no AI calls, no writes
//   node scripts/generatePromptVi.js --limit=20    # process only the first N items per source (smoke test)
//   node scripts/generatePromptVi.js               # full live run
'use strict';

const fs = require('fs');
const path = require('path');

const BATCH_SIZE = 15;
const DATA_DIR = path.join(__dirname, 'data');
const COURSE_DIRS = ['writingTask1', 'writingTask2', 'speakingCourse', 'nounPhrase'];

const SYSTEM = `Bạn là giáo viên IELTS biên soạn bài tập "dịch câu" tiếng Việt sang tiếng Anh.
Với mỗi câu tiếng Anh được đánh số dưới đây, hãy viết một câu tiếng Việt TỰ NHIÊN, đúng văn phong người Việt — chính là câu mà một giáo viên sẽ đưa cho học sinh để dịch SANG câu tiếng Anh đó. Không dịch word-by-word cứng nhắc; ưu tiên cách nói tự nhiên, đúng nghĩa.
Trả lời CHỈ bằng một JSON array các chuỗi (string), đúng thứ tự, đúng số lượng câu đã cho — không kèm giải thích, không markdown.`;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// extractJson (geminiService) only matches a top-level {...} object — this
// prompt's response is a top-level [...] array, so parse that directly.
function extractJsonArray(rawText) {
  const m = rawText && rawText.match(/\[[\s\S]*\]/);
  if (!m) throw new Error('no JSON array found in response');
  return JSON.parse(m[0]);
}

async function translateBatch(sentences) {
  const { GoogleGenAI } = require('@google/genai');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY chưa được cấu hình');
  const ai = new GoogleGenAI({ apiKey });

  const prompt = sentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const result = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
    config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', temperature: 0.4 },
  });
  const rawText = result.text ?? result.candidates?.[0]?.content?.parts?.[0]?.text;
  const list = extractJsonArray(rawText);
  if (!Array.isArray(list) || list.length !== sentences.length) {
    throw new Error(`Gemini trả về ${Array.isArray(list) ? list.length : 'non-array'} câu, cần ${sentences.length}`);
  }
  return list.map(String);
}

// ── Source 1: WT1Exercise (sentence_transform, all 4 courses) ───────────
async function collectWT1Targets(WT1Exercise) {
  const exs = await WT1Exercise.find({ type: 'sentence_transform' }).select('code items');
  const targets = []; // { doc, itemIndex, english }
  for (const doc of exs) {
    (doc.items || []).forEach((it, idx) => {
      if (!it.promptVi && it.sampleAnswers && it.sampleAnswers[0]) {
        targets.push({ doc, itemIndex: idx, code: doc.code, itemId: it.id, english: it.sampleAnswers[0] });
      }
    });
  }
  return targets;
}

// ── Source 2: Task2Topic (paraphrase / short_writing) ────────────────────
async function collectTask2Targets(Task2Topic) {
  const topics = await Task2Topic.find({ 'questions.type': { $in: ['paraphrase', 'short_writing'] } });
  const targets = [];
  for (const doc of topics) {
    (doc.questions || []).forEach((q, idx) => {
      if (['paraphrase', 'short_writing'].includes(q.type) && !q.promptVi && q.translationAnswer) {
        targets.push({ doc, itemIndex: idx, questionId: q.questionId, english: q.translationAnswer });
      }
    });
  }
  return targets;
}

function syncIntoJsonFiles(wt1Results) {
  // wt1Results: Map<code, Map<itemId, promptVi>>
  let filesTouched = 0, itemsSynced = 0;
  for (const courseDir of COURSE_DIRS) {
    const dir = path.join(DATA_DIR, courseDir);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => /^exercises-.*\.json$/.test(x))) {
      const fp = path.join(dir, f);
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      let touched = false;
      for (const ex of data.exercises || []) {
        const byItem = wt1Results.get(ex.code);
        if (!byItem) continue;
        for (const it of ex.items || []) {
          const vi = byItem.get(it.id);
          if (vi && !it.promptVi) { it.promptVi = vi; touched = true; itemsSynced++; }
        }
      }
      if (touched) {
        fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
        filesTouched++;
      }
    }
  }
  return { filesTouched, itemsSynced };
}

async function main() {
  const dry = process.argv.includes('--dry');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 0;
  console.log(`[generatePromptVi] ${dry ? 'DRY RUN' : 'LIVE'}${limit ? ` (limit=${limit} per source)` : ''}\n`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  const Task2Topic = require('../models/Task2Topic');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB');

  let wt1Targets = await collectWT1Targets(WT1Exercise);
  let t2Targets = await collectTask2Targets(Task2Topic);
  if (limit) { wt1Targets = wt1Targets.slice(0, limit); t2Targets = t2Targets.slice(0, limit); }

  console.log(`WT1Exercise (sentence_transform) items missing promptVi: ${wt1Targets.length}`);
  console.log(`Task2Topic (paraphrase/short_writing) questions missing promptVi: ${t2Targets.length}`);

  if (dry) {
    console.log('\nSample targets:');
    [...wt1Targets.slice(0, 3), ...t2Targets.slice(0, 3)].forEach((t) => console.log('  -', t.english));
    console.log('\n(dry — không gọi AI, không ghi gì)');
    await mongoose.disconnect();
    return;
  }

  // ── WT1Exercise ──
  const wt1ResultsByCode = new Map(); // code -> Map<itemId, promptVi>
  let done = 0;
  for (const batch of chunk(wt1Targets, BATCH_SIZE)) {
    const vis = await translateBatch(batch.map((t) => t.english));
    for (let i = 0; i < batch.length; i++) {
      const t = batch[i];
      t.doc.items[t.itemIndex].promptVi = vis[i];
      if (!wt1ResultsByCode.has(t.code)) wt1ResultsByCode.set(t.code, new Map());
      wt1ResultsByCode.get(t.code).set(t.itemId, vis[i]);
    }
    // markModified + save per doc touched in this batch (a doc can appear
    // more than once across batches if it has many items — save is a no-op
    // safe to repeat).
    const docs = new Set(batch.map((t) => t.doc));
    for (const doc of docs) { doc.markModified('items'); await doc.save(); }
    done += batch.length;
    console.log(`  WT1Exercise: ${done}/${wt1Targets.length}`);
  }

  // ── Task2Topic ──
  done = 0;
  for (const batch of chunk(t2Targets, BATCH_SIZE)) {
    const vis = await translateBatch(batch.map((t) => t.english));
    const docs = new Set();
    for (let i = 0; i < batch.length; i++) {
      const t = batch[i];
      t.doc.questions[t.itemIndex].promptVi = vis[i];
      docs.add(t.doc);
    }
    for (const doc of docs) { doc.markModified('questions'); await doc.save(); }
    done += batch.length;
    console.log(`  Task2Topic: ${done}/${t2Targets.length}`);
  }

  const { filesTouched, itemsSynced } = syncIntoJsonFiles(wt1ResultsByCode);
  console.log(`\nĐồng bộ vào JSON seed: ${itemsSynced} items trong ${filesTouched} file.`);
  console.log('Xong.');
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
