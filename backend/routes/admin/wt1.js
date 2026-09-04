'use strict';

// Admin CRUD for the WT1 course (WT1Module / WT1Lesson / WT1Exercise).
// Content is authored in backend/scripts/data/writingTask1/*.json and seeded
// via seedWritingTask1Course.js; edits here write straight to the DB and a
// re-seed would overwrite them (surfaced in the admin UI).
// teacherOnly for reads + create/update; adminOnly for delete.
const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly, adminOnly } = require('./_shared');

const WT1Module = require('../../models/WT1Module');
const WT1Lesson = require('../../models/WT1Lesson');
const WT1Exercise = require('../../models/WT1Exercise');
const { EXERCISE_TYPES } = WT1Exercise;

const router = express.Router();
const COURSE = 'IELTS-W-T1';
// The WT1 admin CRUD is course-agnostic too — same models/routes serve
// every "writing course" (currently Task 1 Writing + Task 2 Writing).
const COURSES = new Set(['IELTS-W-T1', 'IELTS-W-T2']);
function resolveCourse(code) { return COURSES.has(code) ? code : COURSE; }

// ── validation (mirrors seedWritingTask1Course.js's validate()) ───────
function validateExercise(ex) {
  const errs = [];
  if (!ex.code || !String(ex.code).trim()) errs.push('Thiếu code');
  if (!ex.lessonCode) errs.push('Thiếu lessonCode');
  if (!EXERCISE_TYPES.includes(ex.type)) errs.push(`type "${ex.type}" không hợp lệ`);
  if (ex.autoGrade && (!ex.items || !ex.items.length)) errs.push('autoGrade nhưng không có items');
  if (!ex.autoGrade && !ex.rubric && !(ex.items && ex.items.length)) errs.push('bài AI/local chấm nhưng thiếu rubric');
  if (ex.type === 'gap_fill') {
    for (const it of ex.items || []) {
      const markers = (String(it.prompt || '').match(/____/g) || []).length;
      const blanks = (it.blanks || []).length;
      if (markers !== blanks) errs.push(`${it.id}: ${markers} marker "____" nhưng ${blanks} blanks`);
    }
  }
  if (ex.type === 'mcq') {
    for (const it of ex.items || []) {
      if (!(it.options || []).some((o) => o.id === it.answer)) errs.push(`${it.id}: answer "${it.answer}" không có trong options`);
    }
  }
  if (ex.type === 'categorize') {
    const ids = new Set((ex.categories || []).map((c) => c.id));
    for (const it of ex.items || []) if (!ids.has(it.category)) errs.push(`${it.id}: category "${it.category}" chưa khai báo`);
  }
  return errs;
}

// ── tree: course + modules + lessons (with exercise counts) ──────────
router.get('/wt1/tree', auth, teacherOnly, async (req, res) => {
  try {
    const course = resolveCourse(req.query.course);
    const [modules, lessons, counts] = await Promise.all([
      WT1Module.find({ courseCode: course }).sort({ order: 1 }).lean(),
      WT1Lesson.find().sort({ order: 1 }).lean(),
      WT1Exercise.aggregate([{ $group: { _id: '$lessonCode', n: { $sum: 1 }, published: { $sum: { $cond: ['$published', 1, 0] } } } }]),
    ]);
    const cnt = Object.fromEntries(counts.map((c) => [c._id, { total: c.n, published: c.published }]));
    const byModule = {};
    for (const l of lessons) (byModule[l.moduleCode] = byModule[l.moduleCode] || []).push({ ...l, exercises: cnt[l.code] || { total: 0, published: 0 } });
    res.json({
      success: true,
      modules: modules.map((m) => ({ ...m, lessons: (byModule[m.code] || []).sort((a, b) => a.order - b.order) })),
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── module CRUD ────────────────────────────────────────────────────
router.post('/wt1/modules', auth, teacherOnly, async (req, res) => {
  try {
    const m = await WT1Module.create({ ...req.body, courseCode: resolveCourse(req.body.courseCode) });
    res.status(201).json({ success: true, module: m });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.put('/wt1/modules/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { lessons, ...body } = req.body;
    const m = await WT1Module.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy module' });
    res.json({ success: true, module: m });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.delete('/wt1/modules/:id', auth, adminOnly, async (req, res) => {
  try {
    const m = await WT1Module.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy module' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── lesson CRUD ────────────────────────────────────────────────────
router.get('/wt1/lessons/:code', auth, teacherOnly, async (req, res) => {
  try {
    const l = await WT1Lesson.findOne({ code: req.params.code }).lean();
    if (!l) return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học' });
    res.json({ success: true, lesson: l });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/wt1/lessons', auth, teacherOnly, async (req, res) => {
  try {
    const l = await WT1Lesson.create(req.body);
    res.status(201).json({ success: true, lesson: l });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.put('/wt1/lessons/:code', auth, teacherOnly, async (req, res) => {
  try {
    const { _id, code, ...body } = req.body;
    const l = await WT1Lesson.findOneAndUpdate({ code: req.params.code }, body, { new: true, runValidators: true });
    if (!l) return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học' });
    res.json({ success: true, lesson: l });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.delete('/wt1/lessons/:code', auth, adminOnly, async (req, res) => {
  try {
    const l = await WT1Lesson.findOneAndDelete({ code: req.params.code });
    if (!l) return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── exercise CRUD ─────────────────────────────────────────────────
router.get('/wt1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const q = req.query.lesson ? { lessonCode: req.query.lesson } : {};
    const rows = await WT1Exercise.find(q).sort({ lessonCode: 1, order: 1 })
      .select('code lessonCode order type title points published autoGrade needsAsset').lean();
    res.json({ success: true, exercises: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/wt1/exercises/:code', auth, teacherOnly, async (req, res) => {
  try {
    const ex = await WT1Exercise.findOne({ code: req.params.code }).lean();
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    res.json({ success: true, exercise: ex });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.post('/wt1/validate', auth, teacherOnly, (req, res) => {
  res.json({ success: true, errors: validateExercise(req.body || {}) });
});
router.post('/wt1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const errs = validateExercise(req.body);
    if (errs.length) return res.status(400).json({ success: false, message: errs.join('; ') });
    const ex = await WT1Exercise.create(req.body);
    res.status(201).json({ success: true, exercise: ex });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.put('/wt1/exercises/:code', auth, teacherOnly, async (req, res) => {
  try {
    const { _id, ...body } = req.body;
    body.code = req.params.code;
    const errs = validateExercise(body);
    if (errs.length) return res.status(400).json({ success: false, message: errs.join('; ') });
    const ex = await WT1Exercise.findOneAndReplace({ code: req.params.code }, body, { new: true, runValidators: true });
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    res.json({ success: true, exercise: ex });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.delete('/wt1/exercises/:code', auth, adminOnly, async (req, res) => {
  try {
    const ex = await WT1Exercise.findOneAndDelete({ code: req.params.code });
    if (!ex) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
