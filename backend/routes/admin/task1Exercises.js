'use strict';
// Extracted from backend/routes/admin.js — Task 1 Exercises CRUD section.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly, escapeRegex } = require('./_shared');

const Task1Exercise = require('../../models/Task1Exercise');

const router = express.Router();

// ══════════════════════════════════════════════════
// TASK 1 EXERCISES CRUD
// ══════════════════════════════════════════════════

// Bộ bài (task1-practice.html "Bộ bài" switch): Bộ 2 = tag `set2`
// (scripts/addTask1GrammarSet2.js), Bộ 1 = the original bank (no set tag).
const SET_TAGS = ['set2'];
function setOf(ex) {
  const t = (ex.tags || []).find(x => SET_TAGS.includes(x));
  return t || 'set1';
}

// GET /api/admin/task1/exercises
//   ?level=&skillType=&type=&module=&set=set1|set2&active=true|false&chart=yes|no&search=&page=&limit=
// Also returns `meta`: counts per skill × bộ (whole bank, ignores filters).
router.get('/task1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const { level = 'all', skillType = 'all', type = 'all', module: mod = 'all', set = 'all', active = 'all', chart = 'all', page = 1, limit = 20, search = '' } = req.query;
    const query = {};
    if (level !== 'all' && level) query.level = level;
    if (skillType !== 'all' && skillType) query.skillType = skillType;
    if (type !== 'all' && type) query.type = type;
    if (mod !== 'all' && mod && Number.isFinite(Number(mod))) query.module = Number(mod);
    if (set === 'set1') query.tags = { $nin: SET_TAGS };
    else if (SET_TAGS.includes(set)) query.tags = set;
    if (active === 'true') query.isActive = { $ne: false };
    if (active === 'false') query.isActive = false;
    if (chart === 'yes') query.chart = { $ne: null };   // $ne null also excludes a missing field
    if (chart === 'no') query.chart = null;             // matches missing or null
    if (search) {
      const rx = { $regex: escapeRegex(String(search).slice(0, 100)), $options: 'i' };
      query.$or = [{ instruction: rx }, { questionEn: rx }, { questionVi: rx }, { sentenceWithBlanks: rx }, { primaryAnswer: rx }, { grammarPoint: rx }];
    }

    const lim = Math.min(Math.max(Number(limit) || 20, 1), 5000);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const [exercises, total, all] = await Promise.all([
      Task1Exercise.find(query).sort({ skillType: 1, module: 1, orderIndex: 1 }).skip(skip).limit(lim).lean(),
      Task1Exercise.countDocuments(query),
      Task1Exercise.find({}).select('skillType tags isActive chart').lean(),
    ]);
    const meta = { total: all.length, active: 0, withChart: 0, bySkill: {} };
    for (const ex of all) {
      const s = setOf(ex);
      const row = meta.bySkill[ex.skillType] || (meta.bySkill[ex.skillType] = { set1: 0, set2: 0, active: 0 });
      row[s] = (row[s] || 0) + 1;
      if (ex.isActive !== false) { row.active++; meta.active++; }
      if (ex.chart) meta.withChart++;
    }
    res.json({
      success: true,
      exercises: exercises.map(ex => ({ ...ex, set: setOf(ex), hasChart: !!ex.chart })),
      total, page: Number(page) || 1, totalPages: Math.ceil(total / lim), meta,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task1/exercises
router.post('/task1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const ex = new Task1Exercise(req.body);
    await ex.save();
    res.status(201).json({ success: true, exercise: ex });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task1/exercises/:id
router.put('/task1/exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    const ex = await Task1Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    res.json({ success: true, exercise: ex });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task1/exercises/:id
router.delete('/task1/exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    const ex = await Task1Exercise.findByIdAndDelete(req.params.id);
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
