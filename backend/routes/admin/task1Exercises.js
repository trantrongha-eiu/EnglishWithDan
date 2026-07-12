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

// GET /api/admin/task1/exercises
router.get('/task1/exercises', auth, teacherOnly, async (req, res) => {
  try {
    const { level = 'all', skillType = 'all', type = 'all', page = 1, limit = 20, search = '' } = req.query;
    const query = {};
    if (level !== 'all') query.level = level;
    if (skillType !== 'all') query.skillType = skillType;
    if (type !== 'all') query.type = type;
    if (search) query.instruction = { $regex: escapeRegex(search), $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [exercises, total] = await Promise.all([
      Task1Exercise.find(query).sort({ skillType: 1, orderIndex: 1 }).skip(skip).limit(Number(limit)).lean(),
      Task1Exercise.countDocuments(query)
    ]);
    res.json({ success: true, exercises, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
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
