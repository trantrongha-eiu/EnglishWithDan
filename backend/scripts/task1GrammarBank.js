'use strict';
/**
 * Task 1 Grammar bank (Task1Exercise) — single source for seeding.
 *
 *   Bộ 1 = data/task1GrammarSet1Kept.json  (câu cũ được giữ, đã sửa theo sách)
 *        + data/task1GrammarSet1.js        (90 câu mới từ sách, orderIndex 110–199)
 *   Bộ 2 = data/task1GrammarSet2.js        (orderIndex 201–235)
 *
 * seedMissing() runs at server startup: it only INSERTS exercises whose
 * (module, orderIndex) is not in the DB yet — so a fresh DB (tests, a new
 * machine) gets the whole bank, while edits made in the admin panel and
 * exercises switched off by rebuildTask1GrammarSet1.js are never touched.
 * (Until 2026-11-16 startup ran seedTask1Exercises.js's runUpdate(), which
 * re-wrote the old bank by orderIndex alone on every boot.)
 * Content changes go through the scripts: rebuildTask1GrammarSet1.js (Bộ 1),
 * addTask1GrammarSet2.js (Bộ 2).
 */

const KEPT = require('./data/task1GrammarSet1Kept.json');
const SET1 = require('./data/task1GrammarSet1');
const SET2 = require('./data/task1GrammarSet2');

function allExercises() {
  return [...KEPT, ...SET1, ...SET2];
}

async function seedMissing() {
  const Task1Exercise = require('../models/Task1Exercise');
  const have = new Set((await Task1Exercise.find({}, { module: 1, orderIndex: 1 }).lean())
    .map(d => `${d.module}-${d.orderIndex}`));
  const toInsert = allExercises()
    .filter(e => !have.has(`${e.module}-${e.orderIndex}`))
    .map(e => ({ ...e, isActive: true }));
  if (toInsert.length) await Task1Exercise.insertMany(toInsert);
  return { inserted: toInsert.length, total: have.size + toInsert.length };
}

module.exports = { allExercises, seedMissing };
