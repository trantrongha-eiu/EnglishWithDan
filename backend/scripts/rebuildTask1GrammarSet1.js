'use strict';
/**
 * Task 1 Grammar — dựng lại Bộ 1 theo cấu trúc Bộ 2 (2026-11-16).
 *
 *  1. Câu CŨ (ngân hàng gốc, không tag set2, orderIndex < 110): theo
 *     data/task1GrammarSet1Legacy.js — KEEP thì sửa tại chỗ (giữ _id) + tag
 *     'set1' + 'chart:static|dynamic' + 'old:<module>-<orderIndex>' và bỏ
 *     dataContext; DROP thì isActive:false. Câu cũ nào không nằm trong hai
 *     danh sách → dừng (không để sót câu chưa rà).
 *  2. Câu MỚI viết từ sách (data/task1GrammarSet1.js, orderIndex 110–199):
 *     upsert theo (module, orderIndex).
 *  3. Ghi data/task1GrammarSet1Kept.json = các câu cũ được giữ, đã sửa — để
 *     DB trống (test, máy mới) vẫn seed đủ Bộ 1 (xem task1GrammarBank.js).
 *
 *   node backend/scripts/rebuildTask1GrammarSet1.js          # kiểm tra + dry run
 *   node backend/scripts/rebuildTask1GrammarSet1.js --apply  # ghi DB
 */

const fs = require('fs');
const path = require('path');
const NEW_SET1 = require('./data/task1GrammarSet1');
const { KEEP, DROP } = require('./data/task1GrammarSet1Legacy');
const { checkExercise } = require('./addTask1GrammarSet2');

const KEPT_JSON = path.join(__dirname, 'data/task1GrammarSet1Kept.json');
const SET_TAG = 'set1';
const OLD_PREFIX = 'old:';
// Fields that are DB bookkeeping, never content.
const META = ['_id', '__v', 'createdAt', 'updatedAt'];

/** "<module>-<orderIndex>" the exercise had in the original bank. */
function legacyKey(doc) {
  const t = (doc.tags || []).find(x => x.startsWith(OLD_PREFIX));
  return t ? t.slice(OLD_PREFIX.length) : `${doc.module}-${doc.orderIndex}`;
}

/** The kept exercise after applying its overrides (pure — no DB). */
function mergeLegacy(doc, key) {
  const { tag, chartTitle, $unset = [], ...set } = KEEP[key];
  const out = { ...doc, ...set };
  META.forEach(f => delete out[f]);
  ['dataContext', ...$unset].forEach(f => delete out[f]);
  if (chartTitle && out.chart) out.chart = { ...out.chart, title: chartTitle };
  const keepTags = (doc.tags || []).filter(t => !/^(set\d|chart:|old:)/.test(t));
  out.tags = [...new Set([...keepTags, SET_TAG, tag, OLD_PREFIX + key])];
  out.isActive = true;
  return out;
}

function checkNewSet() {
  const errs = NEW_SET1.flatMap(checkExercise);
  const keys = NEW_SET1.map(e => `${e.module}-${e.orderIndex}`);
  if (new Set(keys).size !== keys.length) errs.push('duplicate (module, orderIndex) in new set 1');
  NEW_SET1.forEach(e => {
    if (!(e.orderIndex >= 110 && e.orderIndex <= 199)) errs.push(`${e.skillType} #${e.orderIndex}: orderIndex outside 110–199`);
    if (!e.chart) errs.push(`${e.skillType} #${e.orderIndex}: no chart`);
    if (!e.tags.includes(SET_TAG) || !e.tags.some(t => t === 'chart:static' || t === 'chart:dynamic')) errs.push(`${e.skillType} #${e.orderIndex}: needs set1 + chart tag`);
  });
  return errs;
}

async function run({ apply = false } = {}) {
  const Task1Exercise = require('../models/Task1Exercise');

  const errs = checkNewSet();
  const both = Object.keys(KEEP).filter(k => k in DROP);
  if (both.length) errs.push('both KEEP and DROP: ' + both.join(', '));

  // Original bank = everything that is neither Bộ 2 nor one of the new 110–199 exercises.
  const newKeys = new Set(NEW_SET1.map(e => `${e.module}-${e.orderIndex}`));
  const legacy = (await Task1Exercise.find({ tags: { $ne: 'set2' } }).lean())
    .filter(d => !newKeys.has(`${d.module}-${d.orderIndex}`) || (d.tags || []).some(t => t.startsWith(OLD_PREFIX)));
  const byKey = new Map();
  legacy.forEach(d => {
    const k = legacyKey(d);
    if (byKey.has(k)) errs.push(`two exercises share legacy key ${k}`);
    byKey.set(k, d);
  });
  const unreviewed = [...byKey.keys()].filter(k => !(k in KEEP) && !(k in DROP));
  if (unreviewed.length) errs.push('old exercises not in KEEP/DROP: ' + unreviewed.join(', '));
  const missing = [...Object.keys(KEEP), ...Object.keys(DROP)].filter(k => !byKey.has(k));
  if (missing.length && byKey.size) errs.push('KEEP/DROP keys not in DB: ' + missing.join(', '));

  const kept = Object.keys(KEEP).filter(k => byKey.has(k)).map(k => ({ key: k, id: byKey.get(k)._id, ex: mergeLegacy(byKey.get(k), k) }));
  kept.forEach(({ key, ex }) => errs.push(...checkExercise(ex).map(e => `[${key}] ${e}`)));
  const keptKeys = kept.map(({ ex }) => `${ex.module}-${ex.orderIndex}`);
  if (new Set(keptKeys).size !== keptKeys.length) errs.push('kept exercises collide on (module, orderIndex)');
  keptKeys.filter(k => newKeys.has(k)).forEach(k => errs.push(`kept ${k} collides with a new exercise`));
  if (errs.length) throw new Error('Task 1 Bộ 1 problems:\n' + errs.join('\n'));

  const per = {};
  [...kept.map(k => k.ex), ...NEW_SET1].forEach(e => { per[e.skillType] = (per[e.skillType] || 0) + 1; });
  console.log(`Bộ 1: keep ${kept.length} old + ${NEW_SET1.length} new = ${kept.length + NEW_SET1.length}; drop ${Object.keys(DROP).filter(k => byKey.has(k)).length} —`, per);

  // Snapshot of the kept exercises for fresh-DB seeding (task1GrammarBank.js).
  if (kept.length) {
    const snap = kept.map(({ ex }) => ex).sort((a, b) => a.module - b.module || a.orderIndex - b.orderIndex);
    fs.writeFileSync(KEPT_JSON, JSON.stringify(snap, null, 1) + '\n');
    console.log(`wrote ${path.relative(process.cwd(), KEPT_JSON)} (${snap.length})`);
  }
  if (!apply) { console.log('Checks passed. Dry run — pass --apply to write.'); return { written: 0 }; }

  const ops = [
    ...kept.map(({ id, ex }) => ({
      updateOne: { filter: { _id: id }, update: { $set: ex, $unset: Object.fromEntries(['dataContext', ...(KEEP[legacyKey({ tags: ex.tags })].$unset || [])].map(f => [f, 1])) } },
    })),
    ...Object.keys(DROP).filter(k => byKey.has(k)).map(k => ({
      updateOne: { filter: { _id: byKey.get(k)._id }, update: { $set: { isActive: false } } },
    })),
    ...NEW_SET1.map(ex => ({
      updateOne: { filter: { module: ex.module, orderIndex: ex.orderIndex }, update: { $set: { ...ex, isActive: true } }, upsert: true },
    })),
  ];
  const res = await Task1Exercise.bulkWrite(ops, { ordered: true });
  console.log(`upserted ${res.upsertedCount}, modified ${res.modifiedCount}, matched ${res.matchedCount}`);
  return { written: res.upsertedCount + res.modifiedCount };
}

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => run({ apply: process.argv.includes('--apply') }))
    .then(() => mongoose.disconnect())
    .catch(async err => { console.error(err.message || err); await mongoose.disconnect(); process.exit(1); });
}

module.exports = { run, mergeLegacy, checkNewSet };
