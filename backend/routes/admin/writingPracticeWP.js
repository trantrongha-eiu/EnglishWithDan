'use strict';
// Extracted from backend/routes/admin.js — Writing Practice (WP) Topics, Exercises, and Attempts sections.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const WPTopic    = require('../../models/WPTopic');
const WPExercise = require('../../models/WPExercise');
const WritingPracticeAttempt = require('../../models/WritingPracticeAttempt');

const router = express.Router();

// ══════════════════════════════════════════════════
// WRITING PRACTICE (WP) – Topics
// ══════════════════════════════════════════════════
router.get('/wp-topics', auth, teacherOnly, async (req, res) => {
  try {
    const topics = await WPTopic.find({}).sort({ orderIndex: 1, createdAt: 1 }).lean();
    res.json({ success: true, topics });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/wp-topics', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await WPTopic.create(req.body);
    res.json({ success: true, topic });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/wp-topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPTopic.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/wp-topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPTopic.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════
// WRITING PRACTICE (WP) – Exercises
// ══════════════════════════════════════════════════
router.get('/wp-exercises', auth, teacherOnly, async (req, res) => {
  try {
    const { level, topic, type, active, limit = 50, skip = 0 } = req.query;
    const q = {};
    if (level && level !== 'all') q.level = level;
    if (topic && topic !== 'all') q.topicKey = topic;
    if (type  && type  !== 'all') q.type = type;
    if (active === 'true')  q.isActive = true;
    if (active === 'false') q.isActive = false;
    const [exercises, total] = await Promise.all([
      WPExercise.find(q).sort({ orderIndex: 1, createdAt: -1 }).skip(+skip).limit(+limit).lean(),
      WPExercise.countDocuments(q)
    ]);
    res.json({ success: true, exercises, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/wp-exercises', auth, teacherOnly, async (req, res) => {
  try {
    const ex = await WPExercise.create(req.body);
    res.json({ success: true, exercise: ex });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/wp-exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPExercise.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/wp-exercises/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WPExercise.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════
// WRITING PRACTICE (WP) – Attempts
// ══════════════════════════════════════════════════
router.get('/wp-attempts', auth, teacherOnly, async (req, res) => {
  try {
    const { limit = 100, skip = 0 } = req.query;
    const [attempts, total] = await Promise.all([
      WritingPracticeAttempt.find({})
        .populate('studentId', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(+skip).limit(+limit).lean(),
      WritingPracticeAttempt.countDocuments()
    ]);
    res.json({ success: true, attempts, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/wp-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingPracticeAttempt.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
