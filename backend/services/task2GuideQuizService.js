'use strict';

// Reading-check quizzes on the Task 2 Templates type guide (see
// models/Task2GuideQuiz.js). The browser builds and marks the quiz; this
// records the result, keeps the best score and the first pass date, and
// refuses a section whose previous section has not been passed yet.

const Task2GuideQuiz = require('../models/Task2GuideQuiz');

const SECTIONS = ['recognise', 'outline', 'upgrade', 'language', 'essay', 'mistakes'];
const PASS_PERCENT = 90;
const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 30;
const TYPE_ID = /^type\d{2}$/;

function toPlain(doc) {
  const o = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const sections = {};
  for (const k of SECTIONS) {
    const s = (o.sections || {})[k] || {};
    sections[k] = { best: s.best || 0, tries: s.tries || 0, passedAt: s.passedAt || null };
  }
  return { typeId: o.typeId, sections };
}

async function getAll(userId) {
  const rows = await Task2GuideQuiz.find({ userId }).lean();
  return rows.map(toPlain);
}

// → { progress } | { error }
async function saveResult(userId, typeId, body = {}, now = new Date()) {
  try {
    return await _save(userId, typeId, body, now);
  } catch (err) {
    if (err && err.code === 11000) return _save(userId, typeId, body, now);
    throw err;
  }
}

async function _save(userId, typeId, body, now) {
  const section = String(body.section || '');
  const si = SECTIONS.indexOf(section);
  const total = Math.round(Number(body.total));
  const correct = Math.round(Number(body.correct));
  if (!TYPE_ID.test(String(typeId || '')) || si < 0) return { error: 'Dữ liệu không hợp lệ' };
  if (!Number.isFinite(total) || !Number.isFinite(correct) || total < MIN_QUESTIONS || total > MAX_QUESTIONS
    || correct < 0 || correct > total) return { error: 'Dữ liệu không hợp lệ' };

  let doc = await Task2GuideQuiz.findOne({ userId, typeId });
  if (!doc) doc = new Task2GuideQuiz({ userId, typeId });
  if (si > 0 && !doc.sections[SECTIONS[si - 1]].passedAt) return { error: 'Cần đạt quiz mục trước đã' };

  const pct = Math.round((correct / total) * 100);
  const passed = correct * 100 >= total * PASS_PERCENT; // exact, not the rounded %
  const s = doc.sections[section];
  s.tries = (s.tries || 0) + 1;
  s.best = Math.max(s.best || 0, pct);
  if (passed && !s.passedAt) s.passedAt = now;
  doc.markModified(`sections.${section}`);
  await doc.save();
  return { progress: toPlain(doc), pct, passed };
}

module.exports = { getAll, saveResult, SECTIONS, PASS_PERCENT };
