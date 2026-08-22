// One-time content fix — 4 Task 2 Writing translation exercises where the
// English correctAnswer/modelAnswer said more than the Vietnamese prompt
// asked for (an unstated extra clause tacked on, or — for w6t10_q19 — the
// target vocabulary concept absent from the Vietnamese entirely), so a
// student who correctly translated the given Vietnamese sentence was
// marked wrong. Reported by a user screenshot of w4t7_q14 specifically;
// found the other 3 via a word-count-ratio scan of all 369 translation
// questions in seedTask2Exercises.js (see that file's own now-corrected
// entries — this script applies the exact same fix directly to already-
// seeded live documents, which re-running the seed script alone would not
// touch, since it's dedup-and-skip on existing questionIds).
//
// Run: node scripts/fixTask2ExercisesViEnMismatch.js
const FIXES = [
  {
    questionId: 'w4t7_q11',
    correctAnswer: 'One of the main causes is the financial burden.',
    modelAnswer: 'One of the main causes is the financial burden.',
    fallbackKeywords: ['financial burden', 'main causes'],
    explanationVi: "'Financial burden' = gánh nặng tài chính — cụm danh từ học thuật chỉ áp lực tiền bạc. 'One of the main causes is + N' = một trong những nguyên nhân chính là.",
  },
  {
    questionId: 'w4t7_q14',
    correctAnswer: 'Some students drop out due to academic failure.',
    modelAnswer: 'Some students drop out due to academic failure.',
    fallbackKeywords: ['academic failure', 'drop out'],
    explanationVi: "'Due to + N' = do, vì — giới từ nguyên nhân (academic hơn 'because of'). 'Academic failure' = thất bại trong học tập — cụm danh từ học thuật.",
  },
  {
    questionId: 'w6t10_q19',
    questionText: 'Dịch sang tiếng Anh (dùng từ "extrinsic motivation"):\n\n"Một số người coi tiền là nguồn động lực bên ngoài chính trong công việc."',
  },
  {
    questionId: 'w7t11_q32',
    correctAnswer: 'Countries should invest more in green energy.',
    modelAnswer: 'Countries should invest more in green energy.',
    fallbackKeywords: ['green energy', 'invest', 'countries'],
    explanationVi: "'Invest in + N' = đầu tư vào. 'Green energy' = năng lượng xanh/sạch — cụm từ trọng tâm của bài.",
  },
];

async function runFix() {
  const Task2Topic = require('../models/Task2Topic');
  for (const fix of FIXES) {
    const { questionId, ...fields } = fix;
    const $set = {};
    for (const [key, val] of Object.entries(fields)) $set[`questions.$.${key}`] = val;
    const res = await Task2Topic.updateOne({ 'questions.questionId': questionId }, { $set });
    console.log(`[FixTask2ViEnMismatch] ${questionId}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
  }
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runFix();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[FixTask2ViEnMismatch] FAILED', e); process.exit(1); });
}

module.exports = { runFix, FIXES };
