'use strict';
// Extracted from backend/routes/admin.js — Task 2 Topics CRUD section plus its two one-off maintenance endpoints.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly, adminOnly, escapeRegex } = require('./_shared');

const Task2Topic = require('../../models/Task2Topic');

const router = express.Router();

// ══════════════════════════════════════════════════
// TASK 2 TOPICS CRUD
// ══════════════════════════════════════════════════

// GET /api/admin/task2/topics
router.get('/task2/topics', auth, teacherOnly, async (req, res) => {
  try {
    const { week = 'all', essayType = 'all', search = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (week !== 'all') query.week = parseInt(week);
    if (essayType !== 'all') query.essayType = essayType;
    if (search) query.topicName = { $regex: escapeRegex(search), $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [topics, total] = await Promise.all([
      Task2Topic.find(query).sort({ week: 1, orderIndex: 1 }).skip(skip).limit(Number(limit)).lean(),
      Task2Topic.countDocuments(query)
    ]);
    res.json({ success: true, topics, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/topics/:id
router.get('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findById(req.params.id).lean();
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/topics
router.post('/task2/topics', auth, teacherOnly, async (req, res) => {
  try {
    const topic = new Task2Topic(req.body);
    await topic.save();
    res.status(201).json({ success: true, topic });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/topics/:id
router.put('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { questions, ...topicData } = req.body; // questions managed separately
    const topic = await Task2Topic.findByIdAndUpdate(req.params.id, topicData, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true, topic });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/topics/:id
router.delete('/task2/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/topics/:id/questions
router.post('/task2/topics/:id/questions', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: req.body } },
      { new: true, runValidators: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    const q = topic.questions[topic.questions.length - 1];
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/topics/:topicId/questions/:qid
router.put('/task2/topics/:topicId/questions/:qid', auth, teacherOnly, async (req, res) => {
  try {
    const update = {};
    Object.keys(req.body).forEach(k => { update[`questions.$.${k}`] = req.body[k]; });
    const topic = await Task2Topic.findOneAndUpdate(
      { _id: req.params.topicId, 'questions._id': req.params.qid },
      { $set: update },
      { new: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    const q = topic.questions.find(q => q._id.toString() === req.params.qid);
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/topics/:topicId/questions/:qid
router.delete('/task2/topics/:topicId/questions/:qid', auth, teacherOnly, async (req, res) => {
  try {
    const topic = await Task2Topic.findByIdAndUpdate(
      req.params.topicId,
      { $pull: { questions: { _id: req.params.qid } } },
      { new: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Không tìm thấy topic' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/reseed-task2-week12 — delete duplicates + re-insert fresh week-12 topics
router.post('/reseed-task2-week12', auth, adminOnly, async (req, res) => {
  try {
    const { reseedWeek12 } = require('../../scripts/seedTask2Exercises');
    await reseedWeek12();
    res.json({ success: true, message: 'Đã re-seed 5 topics tuần 12.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/fix-task1-context — add data context to ambiguous by/to questions
router.post('/fix-task1-context', auth, adminOnly, async (req, res) => {
  try {
    const { run } = require('../../scripts/updateTask1Context');
    await run();
    res.json({ success: true, message: 'Updated task1 context for Q15 and Q16.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
