'use strict';
/**
 * Task 1 Grammar — Bộ 2: +5 câu cho mỗi mục (scripts/data/task1GrammarSet2.js).
 *
 * Upserts on (module, orderIndex) — orderIndex 201–235, clear of the old bank
 * (1–109) and of seedTask1Exercises.js's startup seed. Dry run by default.
 *
 *   node backend/scripts/addTask1GrammarSet2.js          # check + dry run
 *   node backend/scripts/addTask1GrammarSet2.js --apply  # write
 */

const SET2 = require('./data/task1GrammarSet2');
const { validateSpec } = require('./setTask1ExerciseCharts');

const norm = s => String(s || '').toLowerCase().replace(/[.,;:!?"]/g, ' ').replace(/\s+/g, ' ').trim();

/** Content checks that a typo would otherwise ship as an ungradeable question. */
function checkExercise(ex) {
  const id = `${ex.skillType} #${ex.orderIndex}`;
  const errs = [];
  if (!ex.instruction) errs.push(`${id}: no instruction`);
  if (ex.chart) errs.push(...validateSpec(id, ex.chart));
  if (ex.type === 'multiple_choice' || ex.type === 'paraphrase_choose') {
    if (!Array.isArray(ex.options) || ex.options.length < 2 || ex.options.length > 4) errs.push(`${id}: needs 2–4 options`);
    if (!(ex.correctOptionIndex >= 0 && ex.correctOptionIndex < (ex.options || []).length)) errs.push(`${id}: correctOptionIndex out of range`);
    if (new Set(ex.options).size !== (ex.options || []).length) errs.push(`${id}: duplicate options`);
  }
  if (ex.type === 'fill_blank') {
    const blanks = (ex.sentenceWithBlanks.match(/___/g) || []).length;
    if (blanks !== ex.blanksCount) errs.push(`${id}: ${blanks} blanks but blanksCount ${ex.blanksCount}`);
    (ex.sampleAnswers || []).forEach(a => {
      if (a.split(',').length !== blanks) errs.push(`${id}: answer "${a}" has ${a.split(',').length} parts for ${blanks} blanks`);
    });
    if (!(ex.sampleAnswers || []).includes(ex.primaryAnswer)) errs.push(`${id}: primaryAnswer not in sampleAnswers`);
  }
  if (ex.type === 'rearrange') {
    const bank = norm(ex.baseWords.join(' ')).split(' ').sort().join(' ');
    (ex.sampleAnswers || []).forEach(a => {
      if (norm(a).split(' ').sort().join(' ') !== bank) errs.push(`${id}: "${a}" doesn't use exactly the word bank`);
    });
  }
  if (['translation', 'data_transform', 'error_correction', 'rearrange'].includes(ex.type)) {
    if (!ex.primaryAnswer || !(ex.sampleAnswers || []).includes(ex.primaryAnswer)) errs.push(`${id}: primaryAnswer missing from sampleAnswers`);
  }
  return errs;
}

async function run({ apply = false } = {}) {
  const Task1Exercise = require('../models/Task1Exercise');

  const errs = SET2.flatMap(checkExercise);
  const keys = SET2.map(e => `${e.module}-${e.orderIndex}`);
  if (new Set(keys).size !== keys.length) errs.push('duplicate (module, orderIndex) in set 2');
  if (errs.length) throw new Error('Set 2 problems:\n' + errs.join('\n'));

  // Refuse to overwrite an old-bank exercise that happens to share the slot.
  const clash = await Task1Exercise.find({
    orderIndex: { $in: SET2.map(e => e.orderIndex) }, tags: { $ne: 'set2' },
  }, { module: 1, orderIndex: 1 }).lean();
  if (clash.length) throw new Error('orderIndex already used by: ' + clash.map(c => `${c.module}-${c.orderIndex}`).join(', '));

  const perSkill = SET2.reduce((m, e) => ({ ...m, [e.skillType]: (m[e.skillType] || 0) + 1 }), {});
  console.log(`set 2: ${SET2.length} exercises —`, perSkill);
  if (!apply) { console.log('Checks passed. Dry run — pass --apply to write.'); return { written: 0 }; }

  const ops = SET2.map(ex => ({
    updateOne: {
      filter: { module: ex.module, orderIndex: ex.orderIndex },
      update: { $set: { ...ex, isActive: true } },
      upsert: true,
    },
  }));
  const res = await Task1Exercise.bulkWrite(ops, { ordered: false });
  console.log(`upserted ${res.upsertedCount}, modified ${res.modifiedCount}, matched ${res.matchedCount}`);
  return { written: res.upsertedCount + res.modifiedCount };
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => run({ apply: process.argv.includes('--apply') }))
    .then(() => mongoose.disconnect())
    .catch(async err => { console.error(err.message || err); await mongoose.disconnect(); process.exit(1); });
}

module.exports = { run, checkExercise };
