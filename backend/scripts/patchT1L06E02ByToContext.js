// scripts/patchT1L06E02ByToContext.js
//
// T1-L06-E02 ("by hay to?") had 3 items (q3/q4/q5) where the given numbers
// don't pin down which preposition is correct without more context — e.g.
// "The population increased ____ 12 million by 2020." is genuinely
// ambiguous: 12 million could be the amount increased (BY) or the level
// reached (TO), with nothing in the sentence to tell which. q3 already
// hedged by accepting both "to" and "by"; q4/q5 didn't, so a student
// answering the other-but-equally-valid preposition was marked wrong.
//
// Fix: add the missing anchor (an explicit destination/starting value) to
// each sentence so only one preposition is grammatically sound — matching
// the exercise's own "BY = how much, TO = what level" teaching point
// instead of just widening the accepted-answers list.
//
//   node scripts/patchT1L06E02ByToContext.js --dry
//   node scripts/patchT1L06E02ByToContext.js
'use strict';

const UPDATES = {
  q3: {
    prompt: 'The population increased ____ 12 million to reach 46 million by 2020.',
    blanks: [{ accept: ['by'] }],
    explanation: 'Đích đến đã cho rõ là 46 triệu ("reach 46 million") → 12 triệu chỉ có thể là MỨC TĂNG → BY.',
  },
  q4: {
    prompt: 'There was a drop ____ 300 tonnes, from 1,500 tonnes ____ 1,200 tonnes.',
    blanks: [{ accept: ['of'] }, { accept: ['to'] }],
    explanation: 'Sau danh từ dùng OF cho mức giảm (300 tấn); điểm xuất phát 1,500 tấn đã cho rõ nên chỗ trống còn lại chỉ có thể là TO cho giá trị cuối (1,200 tấn).',
  },
  q5: {
    prompt: 'Starting at 16%, the rate climbed ____ 3 percentage points ____ 19%.',
    blanks: [{ accept: ['by'] }, { accept: ['to'] }],
    explanation: 'Điểm xuất phát 16% đã cho rõ, nên BY cho mức tăng (3 điểm %) và TO cho đích đến (19%) là hai đáp án duy nhất hợp lý.',
  },
};

async function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[patchT1L06E02ByToContext] ${dry ? 'DRY RUN' : 'LIVE'}\n`);

  require('dotenv').config();
  const mongoose = require('mongoose');
  const WT1Exercise = require('../models/WT1Exercise');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Đã kết nối MongoDB\n');

  const doc = await WT1Exercise.findOne({ code: 'T1-L06-E02' });
  if (!doc) { console.warn('  ! T1-L06-E02 không tồn tại'); await mongoose.disconnect(); return; }

  for (const it of doc.items) {
    const u = UPDATES[it.id];
    if (!u) continue;
    console.log(`  ${it.id}: "${it.prompt}" -> "${u.prompt}"`);
    if (!dry) {
      it.prompt = u.prompt;
      it.blanks = u.blanks;
      it.explanation = u.explanation;
    }
  }

  if (!dry) {
    doc.markModified('items');
    await doc.save();
    console.log('\nĐã lưu.');
  } else {
    console.log('\n(dry — không ghi gì)');
  }
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
