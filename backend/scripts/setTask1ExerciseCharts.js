'use strict';
/**
 * Attach illustration specs (scripts/data/task1ExerciseCharts.js) to the old
 * Task 1 Grammar bank — Task1Exercise.chart, drawn on task1-practice.html by
 * frontend/js/shared/t1-chart.js.
 *
 * Matches on (module, orderIndex) — orderIndex alone repeats across modules.
 * Dry run by default; refuses to write if a key matches 0 or >1 exercises.
 *
 *   node backend/scripts/setTask1ExerciseCharts.js          # dry run
 *   node backend/scripts/setTask1ExerciseCharts.js --apply  # write
 */

const CHARTS = require('./data/task1ExerciseCharts');
const KINDS = new Set(['bar', 'line', 'pie', 'table', 'stat', 'map', 'process', 'multi']);

/** Shape checks so a typo can't ship a chart that renders empty. */
function validateSpec(key, s) {
  const errs = [];
  if (!s || !KINDS.has(s.kind)) return [`${key}: unknown kind ${s && s.kind}`];
  if (s.kind === 'multi') {
    // Mixed-chart task: 2+ ordinary specs drawn one under the other.
    if (!Array.isArray(s.charts) || s.charts.length < 2) return [`${key}: multi needs 2+ charts`];
    return s.charts.flatMap((c, i) => c && c.kind === 'multi' ? [`${key}.${i}: nested multi`] : validateSpec(`${key}.${i}`, c));
  }
  if (s.kind === 'bar' || s.kind === 'line') {
    if (!Array.isArray(s.labels) || !s.labels.length) errs.push(`${key}: no labels`);
    (s.series || []).forEach((se, i) => {
      if (!Array.isArray(se.values) || se.values.length !== s.labels.length) errs.push(`${key}: series ${i} has ${se.values && se.values.length} values for ${s.labels.length} labels`);
      if (se.values.some(v => v != null && typeof v !== 'number')) errs.push(`${key}: series ${i} has a non-number`);
    });
    if (!(s.series || []).length) errs.push(`${key}: no series`);
  }
  if (s.kind === 'pie') {
    (s.pies || []).forEach((p, i) => {
      const sum = p.slices.reduce((a, x) => a + x.value, 0);
      if (Math.abs(sum - 100) > 0.5) errs.push(`${key}: pie ${i} sums to ${sum}`);
    });
  }
  if (s.kind === 'table' && (s.rows || []).some(r => r.length !== s.head.length)) errs.push(`${key}: table row width ≠ head`);
  return errs;
}

async function run({ apply = false } = {}) {
  const Task1Exercise = require('../models/Task1Exercise');
  const errs = Object.entries(CHARTS).flatMap(([k, s]) => validateSpec(k, s));
  if (errs.length) throw new Error('Invalid chart specs:\n' + errs.join('\n'));

  const docs = await Task1Exercise.find({}, { module: 1, orderIndex: 1, isActive: 1, chart: 1 }).lean();
  const byKey = new Map();
  docs.forEach(d => {
    const k = `${d.module}-${d.orderIndex}`;
    byKey.set(k, (byKey.get(k) || []).concat(d));
  });

  const ops = [];
  const problems = [];
  for (const [key, spec] of Object.entries(CHARTS)) {
    const hit = byKey.get(key) || [];
    if (hit.length !== 1) { problems.push(`${key}: matches ${hit.length} exercises`); continue; }
    ops.push({ updateOne: { filter: { _id: hit[0]._id }, update: { $set: { chart: spec } } } });
  }
  const without = docs.filter(d => d.isActive && !CHARTS[`${d.module}-${d.orderIndex}`]).map(d => `${d.module}-${d.orderIndex}`);

  console.log(`specs: ${Object.keys(CHARTS).length} · matched: ${ops.length} · active exercises without a chart: ${without.length} (${without.join(', ')})`);
  if (problems.length) throw new Error('Key problems:\n' + problems.join('\n'));
  if (!apply) { console.log('Dry run — pass --apply to write.'); return { matched: ops.length, written: 0 }; }

  const res = await Task1Exercise.bulkWrite(ops, { ordered: false });
  console.log(`written: ${res.modifiedCount} modified, ${res.matchedCount} matched`);
  return { matched: ops.length, written: res.modifiedCount };
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => run({ apply: process.argv.includes('--apply') }))
    .then(() => mongoose.disconnect())
    .catch(async err => { console.error(err.message || err); await mongoose.disconnect(); process.exit(1); });
}

module.exports = { run, validateSpec };
