'use strict';
// Extracted from backend/routes/admin.js — Task 1 Exercises CRUD section.

const express = require('express');
const mongoose = require('mongoose');
const auth    = require('../../middleware/auth');
const { teacherOnly, escapeRegex } = require('./_shared');

const Task1Exercise = require('../../models/Task1Exercise');
const Task1Attempt = require('../../models/Task1Attempt');

const router = express.Router();

const displayName = u => [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || u.email || '';

// ══════════════════════════════════════════════════
// TASK 1 EXERCISES CRUD
// ══════════════════════════════════════════════════

// Bộ bài (task1-practice.html "Bộ bài" switch). Since the 2026-11-16 rebuild
// both sets are real tags: Bộ 1 = `set1` (scripts/rebuildTask1GrammarSet1.js),
// Bộ 2 = `set2` (scripts/addTask1GrammarSet2.js). The student page filters on
// the tag, so an exercise without one only shows under "Tất cả". The old
// exercises the rebuild switched off are untagged + inactive — listed as Bộ 1.
const SET_TAGS = ['set1', 'set2'];
function setOf(ex) {
  const t = (ex.tags || []).find(x => SET_TAGS.includes(x));
  return t || 'set1';
}

// Every create / edit leaves exactly one set tag on the exercise: the admin
// form used to save a "Bộ 1" exercise with no tag (invisible under Bộ 1 on
// the student page) and a Bộ 1 → Bộ 2 move kept both tags (shown in both).
// `set` (form field) wins; else the first set tag already in `tags`; else set1.
// A body with neither (e.g. the 🙈 Ẩn toggle) leaves the tags alone.
function normalizeSetTags(body) {
  const tags = Array.isArray(body.tags)
    ? body.tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim())
    : null;
  const wanted = SET_TAGS.includes(body.set) ? body.set : null;
  delete body.set;
  if (!tags && !wanted) return body;
  const base = tags || [];
  const set = wanted || base.find(t => SET_TAGS.includes(t)) || 'set1';
  body.tags = [set, ...base.filter(t => !SET_TAGS.includes(t))].filter((t, i, a) => a.indexOf(t) === i);
  return body;
}

// Fields the client may write (no _id / timestamps / computed list fields).
const WRITABLE = ['skillType', 'module', 'level', 'type', 'instruction', 'questionVi', 'questionEn',
  'sentenceWithBlanks', 'blanksCount', 'baseWords', 'options', 'correctOptionIndex', 'sampleAnswers',
  'primaryAnswer', 'grammarPoint', 'explanation', 'explanationEn', 'hints', 'orderIndex', 'xpReward',
  'isActive', 'tags', 'chart', 'set'];
function pickWritable(body) {
  const out = {};
  for (const k of WRITABLE) if (body && body[k] !== undefined) out[k] = body[k];
  return out;
}

// Student results per exercise over the retention window (Task1Attempt has
// a 90-day TTL): attempts, distinct students, % correct, last attempt.
async function resultsFor(ids) {
  if (!ids.length) return {};
  const rows = await Task1Attempt.aggregate([
    { $match: { exerciseId: { $in: ids } } },
    { $group: {
      _id: '$exerciseId',
      attempts: { $sum: 1 },
      correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
      users: { $addToSet: '$userId' },
      last: { $max: '$createdAt' },
    } },
  ]);
  return Object.fromEntries(rows.map(r => [String(r._id), {
    attempts: r.attempts,
    students: r.users.length,
    correctPct: r.attempts ? Math.round(r.correct / r.attempts * 100) : null,
    last: r.last,
  }]));
}

// GET /api/admin/task1/exercises
//   ?level=&skillType=&type=&module=&set=set1|set2&active=true|false&chart=yes|no&search=&sort=hard&page=&limit=
// Also returns `meta`: counts per skill × bộ (whole bank, ignores filters),
// and `results` on each listed exercise (student attempts, last 90 days).
// sort=hard: exercises students get wrong most (≥ 3 attempts) first.
router.get('/task1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const { level = 'all', skillType = 'all', type = 'all', module: mod = 'all', set = 'all', active = 'all', chart = 'all', page = 1, limit = 20, search = '', sort = '' } = req.query;
    const query = {};
    if (level !== 'all' && level) query.level = String(level);
    if (skillType !== 'all' && skillType) query.skillType = String(skillType);
    if (type !== 'all' && type) query.type = String(type);
    if (mod !== 'all' && mod && Number.isFinite(Number(mod))) query.module = Number(mod);
    if (set === 'set1') query.tags = { $ne: 'set2' };
    else if (set === 'set2') query.tags = 'set2';
    if (active === 'true') query.isActive = { $ne: false };
    if (active === 'false') query.isActive = false;
    if (chart === 'yes') query.chart = { $ne: null };   // $ne null also excludes a missing field
    if (chart === 'no') query.chart = null;             // matches missing or null
    if (search) {
      const rx = { $regex: escapeRegex(String(search).slice(0, 100)), $options: 'i' };
      query.$or = [{ instruction: rx }, { questionEn: rx }, { questionVi: rx }, { sentenceWithBlanks: rx }, { primaryAnswer: rx }, { grammarPoint: rx }];
    }

    const lim = Math.min(Math.max(Number(limit) || 20, 1), 5000);
    const pg = Math.max(Number(page) || 1, 1);
    const skip = (pg - 1) * lim;

    let exercises, total;
    let results = null;
    if (sort === 'hard') {
      // Rank the whole filtered set by student accuracy, then page it.
      const list = await Task1Exercise.find(query).sort({ skillType: 1, module: 1, orderIndex: 1 }).lean();
      results = await resultsFor(list.map(e => e._id));
      const rank = e => { const r = results[String(e._id)]; return r && r.attempts >= 3 ? r.correctPct : 101; };
      list.sort((a, b) => rank(a) - rank(b));
      total = list.length;
      exercises = list.slice(skip, skip + lim);
    } else {
      [exercises, total] = await Promise.all([
        Task1Exercise.find(query).sort({ skillType: 1, module: 1, orderIndex: 1 }).skip(skip).limit(lim).lean(),
        Task1Exercise.countDocuments(query),
      ]);
      // The bulk "Ẩn/Hiện tất cả" call fetches up to 5000 rows — no stats needed there.
      results = lim <= 200 ? await resultsFor(exercises.map(e => e._id)) : {};
    }
    const all = await Task1Exercise.find({}).select('skillType tags isActive chart').lean();
    const meta = { total: all.length, active: 0, withChart: 0, untagged: 0, bySkill: {} };
    for (const ex of all) {
      const s = setOf(ex);
      const row = meta.bySkill[ex.skillType] || (meta.bySkill[ex.skillType] = { set1: 0, set2: 0, active: 0 });
      row[s] = (row[s] || 0) + 1;
      if (ex.isActive !== false) {
        row.active++; meta.active++;
        if (!(ex.tags || []).some(t => SET_TAGS.includes(t))) meta.untagged++;
      }
      if (ex.chart) meta.withChart++;
    }
    res.json({
      success: true,
      exercises: exercises.map(ex => ({ ...ex, set: setOf(ex), hasChart: !!ex.chart, results: results[String(ex._id)] || null })),
      total, page: pg, totalPages: Math.ceil(total / lim), meta,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task1/exercises/:id/answers — the latest student answers to
// one exercise (who, what they wrote, right / wrong), newest first.
router.get('/task1/exercises/:id/answers', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    const rows = await Task1Attempt.find({ exerciseId: req.params.id })
      .sort({ createdAt: -1 }).limit(100)
      .populate('userId', 'username email firstName lastName')
      .select('userId userAnswer isCorrect score createdAt').lean();
    res.json({
      success: true,
      answers: rows.map(r => ({
        _id: r._id, userAnswer: r.userAnswer, isCorrect: !!r.isCorrect, score: r.score, createdAt: r.createdAt,
        student: r.userId ? { _id: r.userId._id, name: displayName(r.userId) } : null,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task1/exercises
router.post('/task1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const body = normalizeSetTags(pickWritable(req.body));
    if (!body.tags) body.tags = ['set1'];
    const ex = new Task1Exercise(body);
    await ex.save();
    res.status(201).json({ success: true, exercise: ex });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task1/exercises/:id
router.put('/task1/exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    const body = normalizeSetTags(pickWritable(req.body));
    const ex = await Task1Exercise.findByIdAndUpdate(req.params.id, body, { returnDocument: 'after', runValidators: true });
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    res.json({ success: true, exercise: ex });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task1/exercises/:id
router.delete('/task1/exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    const ex = await Task1Exercise.findByIdAndDelete(req.params.id);
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports._test = { normalizeSetTags };
