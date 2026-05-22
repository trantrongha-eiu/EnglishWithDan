/**
 * Migration: Fix CP1258-double-encoded text in Task1Exercise & Task2Topic.
 *
 * Root cause: seed scripts' UTF-8 content was mis-read as Windows CP1258 (Vietnamese
 * Windows code page) then re-saved as UTF-8. Key indicator: byte 0xF0 (start of all
 * 4-byte emoji sequences) maps to đ (U+0111) in CP1258, producing the đŸ... garble.
 *
 * Fix strategy:
 *   1. Reverse the CP1258 mis-read: map each char back to its CP1258 byte value,
 *      then decode the byte sequence as UTF-8.
 *   2. Safety: if Buffer.from(bytes).toString('utf8') contains U+FFFD the bytes were
 *      not valid UTF-8 → keep the original string.
 *   3. topicEmoji special-case: a hardcoded lookup table covers every seed topic so
 *      that emojis whose CP1258-undefined bytes (0x8E, 0x8F, …) were previously
 *      stripped can still be recovered reliably.
 *
 * Run standalone: node backend/scripts/fixTaskEncoding.js
 * Or call via POST /api/admin/fix-encoding from the React admin.
 */
'use strict';

// CP1258 (Windows Vietnamese) reverse table: Unicode codepoint → byte value.
// Only rows where codepoint > U+00FF are needed; chars ≤ U+00FF map to their
// codepoint value as the byte (same as Latin-1).
const CP1258_REV = new Map([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
  [0x2030, 0x89], [0x2039, 0x8B], [0x0152, 0x8C],
  [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93], [0x201D, 0x94],
  [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97], [0x02DC, 0x98],
  [0x2122, 0x99], [0x203A, 0x9B], [0x0153, 0x9C], [0x0178, 0x9F],
  [0x0102, 0xC3], [0x0300, 0xCC], [0x0110, 0xD0], [0x0309, 0xD2],
  [0x01A0, 0xD5], [0x01AF, 0xDD], [0x0303, 0xDE],
  [0x0103, 0xE3], [0x0301, 0xEC], [0x0111, 0xF0], [0x0323, 0xF2],
  [0x01A1, 0xF5], [0x01B0, 0xFD], [0x20AB, 0xFE],
]);

// Correct emoji for each seeded topic (indexed by original garbled topicName so
// the lookup works even before topicName itself is fixed, and still works on a
// second run when topicName is already correct ASCII).
const TOPIC_EMOJI_FIX = {
  // English topic names (ASCII – unchanged by double-encoding)
  'Technology in Education': '🖥️',
  'Mobile Devices and Communication': '📱',
  'Influence of Social Media': '📲',
  'Online Learning and Student Motivation': '📚',
  'Academic Pressure on Teenagers': '🏫',
  'Decline in Reading Habits': '📖',
  'Dropout Rates in Higher Education': '🎓',
  'Shorter Work Week': '💼',
  'Remote Work as the Future': '🧑‍💻',
  'Job Satisfaction vs. Salary': '📈',
  'Individual vs. Government Responsibility': '🌍',
  'Car-Free Days vs. Alternative Solutions': '🚗',
  'Economic Growth vs. Environmental Protection': '⚖️',
  'Public vs. Private Healthcare': '🏥',
  'Consumerism and Society': '🛍️',
  'Government Funding for the Arts': '🎨',
  'Youth Crime and Solutions': '⚖️',
  'Prison vs. Rehabilitation': '🔒',
  // Vietnamese topic names stored garbled (CP1258 double-encoded) – keyed as-is
  // so lookup works before topicName is fixed.  Second run: topicName is correct
  // Vietnamese, misses this key, falls through to fixStr() which finds the emoji
  // already correct and returns it unchanged.
  'Dá»‹ch CĂ¢u - MĂ´i TrÆ°á»ng & KhĂ­ Háº­u': '🌿',
  'Dá»‹ch CĂ¢u - CĂ´ng Nghá»‡ & Truyá»n ThĂ´ng': '💻',
  'Dá»‹ch CĂ¢u - GiĂ¡o Dá»¥c & Thanh NiĂªn': '🎓',
  'Dá»‹ch CĂ¢u - Sá»©c Khá»e & ÄĂ´ Thá»‹ HĂ³a': '🏙️',
  'Dá»‹ch CĂ¢u - Kinh Táº¿ & ToĂ n Cáº§u HĂ³a': '🌐',
};

/**
 * Reverse CP1258 double-encoding on a single string.
 * Returns the original string unchanged if it is already correctly stored Unicode
 * (contains chars above U+00FF that are not CP1258 special chars) or if the
 * byte sequence after reversal is not valid UTF-8.
 */
function fixStr(s) {
  if (!s || typeof s !== 'string') return s;

  let hasNonAscii = false;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7F) continue;
    hasNonAscii = true;
    // A char with a high codepoint that is NOT in the CP1258 table is genuine
    // Unicode (e.g. correctly stored Vietnamese ằ, or an emoji) → leave as-is.
    if (cp > 0xFF && !CP1258_REV.has(cp)) return s;
  }
  if (!hasNonAscii) return s; // pure ASCII, nothing to fix

  // Build the original byte sequence by reversing the CP1258 mis-read.
  const bytes = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7F)          { bytes.push(cp); continue; }
    if (CP1258_REV.has(cp))  { bytes.push(CP1258_REV.get(cp)); continue; }
    if (cp <= 0xFF)          { bytes.push(cp); continue; } // Latin-1 fallback
    return s; // unreachable guard
  }

  try {
    const result = Buffer.from(bytes).toString('utf8');
    // U+FFFD means at least one byte sequence was invalid UTF-8 → don't use.
    if (result.includes('�')) return s;
    return result;
  } catch {
    return s;
  }
}

function fixArr(arr) {
  return Array.isArray(arr) ? arr.map(fixStr) : arr;
}

/**
 * Fix topicEmoji for a Task2Topic document.
 * Priority: hardcoded map → CP1258 decode → keep existing (if already correct).
 */
function fixEmoji(doc) {
  const current = doc.topicEmoji || '';

  // If the current value already contains an emoji-range char (cp > U+FFFF)
  // it is correctly stored – leave it alone.
  if ([...current].some(ch => ch.codePointAt(0) > 0xFFFF)) return current;

  // Try hardcoded map first (keyed by the original garbled topicName so this
  // works on the first run; on re-runs the topicName is already fixed and the
  // lookup misses gracefully, falling through to fixStr below).
  if (TOPIC_EMOJI_FIX[doc.topicName]) return TOPIC_EMOJI_FIX[doc.topicName];

  // Try encoding reversal.
  const fixed = fixStr(current);
  if ([...fixed].some(ch => ch.codePointAt(0) > 0xFFFF)) return fixed;

  // Could not recover – keep original (user can edit manually in admin) or default.
  return current || '📝';
}

async function runFix() {
  const Task1Exercise = require('../models/Task1Exercise');
  const Task2Topic    = require('../models/Task2Topic');
  let t1Checked = 0, t1Fixed = 0, t2Topics = 0, t2Fixed = 0, t2Qs = 0;

  // ── Task1Exercise ───────────────────────────────────────────────────────────
  const ex1docs = await Task1Exercise.find({}).lean();
  t1Checked = ex1docs.length;
  for (const doc of ex1docs) {
    const upd = {
      instruction:        fixStr(doc.instruction),
      questionVi:         fixStr(doc.questionVi),
      questionEn:         fixStr(doc.questionEn),
      sentenceWithBlanks: fixStr(doc.sentenceWithBlanks),
      sampleAnswers:      fixArr(doc.sampleAnswers),
      options:            fixArr(doc.options),
      baseWords:          fixArr(doc.baseWords),
      hints:              fixArr(doc.hints),
      primaryAnswer:      fixStr(doc.primaryAnswer),
      grammarPoint:       fixStr(doc.grammarPoint),
      explanation:        fixStr(doc.explanation),
    };
    const changed = Object.keys(upd).some(k => JSON.stringify(doc[k]) !== JSON.stringify(upd[k]));
    if (changed) { await Task1Exercise.updateOne({ _id: doc._id }, { $set: upd }); t1Fixed++; }
  }

  // ── Task2Topic ──────────────────────────────────────────────────────────────
  const t2docs = await Task2Topic.find({}).lean();
  t2Topics = t2docs.length;
  for (const doc of t2docs) {
    const topicUpd = {
      topicName:         fixStr(doc.topicName),
      prompt:            fixStr(doc.prompt),
      hintAdvantages:    fixArr(doc.hintAdvantages),
      hintDisadvantages: fixArr(doc.hintDisadvantages),
      topicEmoji:        fixEmoji(doc),
    };

    const fixedQuestions = (doc.questions || []).map(q => {
      const fq = {
        ...q,
        questionText:     fixStr(q.questionText),
        correctAnswer:    fixStr(q.correctAnswer),
        explanationVi:    fixStr(q.explanationVi),
        modelAnswer:      fixStr(q.modelAnswer),
        options:          fixArr(q.options),
        baseWords:        fixArr(q.baseWords),
        fallbackKeywords: fixArr(q.fallbackKeywords),
      };
      if (JSON.stringify(q) !== JSON.stringify(fq)) t2Qs++;
      return fq;
    });

    const changed =
      Object.keys(topicUpd).some(k => JSON.stringify(doc[k]) !== JSON.stringify(topicUpd[k])) ||
      JSON.stringify(doc.questions) !== JSON.stringify(fixedQuestions);

    if (changed) {
      await Task2Topic.updateOne({ _id: doc._id }, { $set: { ...topicUpd, questions: fixedQuestions } });
      t2Fixed++;
    }
  }

  return { t1Checked, t1Fixed, t2Topics, t2Fixed, t2Qs };
}

module.exports = { runFix };

// Standalone execution
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      const r = await runFix();
      console.log(`Task1: checked ${r.t1Checked}, fixed ${r.t1Fixed}`);
      console.log(`Task2: checked ${r.t2Topics} topics, fixed ${r.t2Fixed} topics, ${r.t2Qs} questions`);
      console.log('Done.');
    })
    .catch(e => console.error('Error:', e.message))
    .finally(() => mongoose.disconnect());
}
