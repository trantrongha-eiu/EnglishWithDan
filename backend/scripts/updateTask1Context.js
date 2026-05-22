'use strict';
/**
 * Fix ambiguous "by vs to" fill-blank questions (orderIndex 15 & 16).
 * Both questions test the same data (8,000 → 10,000 students) but the
 * context was missing, making the answer unguessable without prior knowledge.
 *
 * Run: node backend/scripts/updateTask1Context.js
 */

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      await run();
      console.log('Done.');
      await mongoose.disconnect();
    })
    .catch(err => { console.error(err); process.exit(1); });
}

async function run() {
  const Task1Exercise = require('../models/Task1Exercise');

  // ── Q15: "increased ___ 2,000" → answer "by" (difference) ───────────────
  await Task1Exercise.findOneAndUpdate(
    { orderIndex: 15 },
    {
      $set: {
        instruction: 'Điền giới từ đúng vào chỗ trống:',
        dataContext: {
          type: 'table',
          subject: 'Number of students',
          year: '2003 → 2005',
          value: '8,000 → 10,000',
          unit: 'students',
          additionalData: {
            fromValue: '8,000',
            toValue: '10,000',
            difference: '2,000',
            note: 'Mức tăng (difference) = 10,000 − 8,000 = 2,000'
          }
        },
        grammarPoint: '"by" = mức thay đổi (difference): increased by [difference]',
        explanation: '"increased by 2,000" = tăng THÊM 2,000 đơn vị. Từ 8,000 tăng thêm 2,000 → đến 10,000. "by" chỉ khoảng cách thay đổi.'
      }
    }
  );

  // ── Q16: "increased ___ 10,000" → answer "to" (final value) ─────────────
  await Task1Exercise.findOneAndUpdate(
    { orderIndex: 16 },
    {
      $set: {
        instruction: 'Điền giới từ đúng vào chỗ trống:',
        dataContext: {
          type: 'table',
          subject: 'Number of students',
          year: '2003 → 2005',
          value: '8,000 → 10,000',
          unit: 'students',
          additionalData: {
            fromValue: '8,000',
            toValue: '10,000',
            note: 'Giá trị cuối (final value) = 10,000'
          }
        },
        grammarPoint: '"to" = giá trị cuối (final value): increased to [final value]',
        explanation: '"increased to 10,000" = tăng LÊN TỚI 10,000. Khởi đầu 8,000, điểm kết thúc (final value) là 10,000. "to" chỉ điểm đến.'
      }
    }
  );

  console.log('Updated Q15 and Q16 with data context.');
}

module.exports = { run };
