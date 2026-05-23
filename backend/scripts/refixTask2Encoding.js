/**
 * refixTask2Encoding.js
 * Re-apply encoding fix using the CORRECT Windows-1252 decoding.
 * The seed file was created by reading UTF-8 Vietnamese text as Windows-1252
 * and saving it back as UTF-8 — so each char's Windows-1252 byte is the
 * original UTF-8 byte we need to recover.
 *
 * This script reads vocab + questions directly from the seed file (original
 * mojibake), converts with the correct algorithm, and writes to MongoDB.
 * Run: node backend/scripts/refixTask2Encoding.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Windows-1252 → Unicode mapping for the 0x80–0x9F range
// (Latin-1 and Win1252 are identical outside this range)
const W1252 = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
  0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D,
  0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C, 0x94: 0x201D,
  0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02DC,
  0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
  0x9E: 0x017E, 0x9F: 0x0178,
};
// Reverse map: Unicode → Windows-1252 byte
const REV = {};
for (const [b, u] of Object.entries(W1252)) REV[u] = parseInt(b);
// Byte 0xC3 was decoded as ISO-8859-2 (→ U+0102 Ă) instead of Latin-1 (→ U+00C3 Ã)
REV[0x0102] = 0xC3;

function fix(str) {
  if (!str || typeof str !== 'string') return str;
  const bytes = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7F) {
      bytes.push(cp);
    } else if (REV[cp] !== undefined) {
      // This char came from a Windows-1252 special byte (0x80–0x9F)
      bytes.push(REV[cp]);
    } else if (cp <= 0xFF) {
      // Regular Latin-1 byte (same as Win1252 for 0xA0–0xFF)
      bytes.push(cp);
    } else {
      // Already valid Unicode (added by us in previous patches or in English)
      const buf = Buffer.from(ch);
      for (const b of buf) bytes.push(b);
    }
  }
  try {
    const result = Buffer.from(bytes).toString('utf8');
    // Sanity: if result has replacement chars, fall back to original
    return result.includes('�') ? str : result;
  } catch {
    return str;
  }
}

function fixArr(arr) {
  return Array.isArray(arr) ? arr.map(fix) : arr;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Task2Topic = require('../models/Task2Topic');

  // Re-read original seed data (still has original mojibake)
  const seedTopics = require('./seedTask2Exercises').topics ||
                     (() => { try { return require('./seedTask2Exercises'); } catch { return []; } })();

  // Build lookup by week+orderIndex
  const seedMap = {};
  (Array.isArray(seedTopics) ? seedTopics : []).forEach(t => {
    seedMap[`${t.week}_${t.orderIndex}`] = t;
  });

  const docs = await Task2Topic.find({});
  let count = 0;

  for (const doc of docs) {
    const seed = seedMap[`${doc.week}_${doc.orderIndex}`];

    if (seed) {
      // Fix topicName and prompt from seed (guaranteed original mojibake)
      doc.topicName = fix(seed.topicName);
      doc.prompt    = fix(seed.prompt);

      // Rebuild vocab from seed (original mojibake → correct UTF-8)
      const seedVocab = (seed.vocabularyList || []).map(v => ({
        term:         v.term,       // English terms – no encoding issue
        definitionVi: fix(v.definitionVi),
        example:      v.example,    // English examples – no encoding issue
      }));

      // Keep any extra vocab that was added by our patch scripts (vocab that
      // has no mojibake – written directly as correct UTF-8)
      const seedTerms = new Set(seedVocab.map(v => v.term.toLowerCase()));
      const extraVocab = (doc.vocabularyList || [])
        .filter(v => !seedTerms.has(v.term.toLowerCase()))
        .map(v => ({
          term:         v.term,
          definitionVi: v.definitionVi, // already correct UTF-8 (added by us)
          example:      v.example,
        }));

      doc.vocabularyList = [...seedVocab, ...extraVocab];

      // Fix questions from seed
      doc.questions = (seed.questions || []).map(q => ({
        ...q,
        questionText:    fix(q.questionText),
        explanationVi:   fix(q.explanationVi),
        correctAnswer:   fix(q.correctAnswer),
        modelAnswer:     fix(q.modelAnswer),
        options:         fixArr(q.options),
        fallbackKeywords: fixArr(q.fallbackKeywords),
      }));
    } else {
      // No seed found – apply fix to current data as best effort
      doc.vocabularyList = (doc.vocabularyList || []).map(v => ({
        term:         v.term,
        definitionVi: fix(v.definitionVi),
        example:      v.example,
      }));
    }

    doc.markModified('topicName');
    doc.markModified('prompt');
    doc.markModified('vocabularyList');
    doc.markModified('questions');
    await doc.save();
    count++;
    console.log(`[${count}] ${doc.topicName} — vocab: ${doc.vocabularyList.length}`);
  }

  console.log(`\nDone. Re-fixed ${count} topics.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
