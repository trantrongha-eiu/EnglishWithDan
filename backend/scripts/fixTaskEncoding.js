/**
 * Migration: Fix double-encoded Vietnamese text in Task1Exercise & Task2Topic collections.
 *
 * Root cause: seed scripts saved UTF-8 content that was misread as Latin-1 then
 * re-saved as UTF-8. Each Vietnamese char became 2–3 Latin-1 characters.
 *
 * Fix: convert each char back to its Latin-1 byte value, re-decode as UTF-8.
 *
 * Run standalone: node backend/scripts/fixTaskEncoding.js
 * Or call via POST /api/admin/fix-encoding from the React admin.
 */
'use strict';

function fixStr(s) {
  if (!s || typeof s !== 'string') return s;
  for (const ch of s) {
    if (ch.codePointAt(0) > 255) return s; // already correct Unicode
  }
  if (!/[\x80-\x9F\xC0-\xFF]{2,}/.test(s) && !/[\x80-\x9F]/.test(s)) return s;
  try {
    return Buffer.from(s, 'latin1').toString('utf8');
  } catch {
    return s;
  }
}

function fixArr(arr) {
  return Array.isArray(arr) ? arr.map(fixStr) : arr;
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
      // Strip C1 controls from emoji field (emoji can't be reliably recovered)
      topicEmoji: (doc.topicEmoji || '').replace(/[\x00-\x1F\x80-\x9F]/gu, '').trim() || '📝',
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
