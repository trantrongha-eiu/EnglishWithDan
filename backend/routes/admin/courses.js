'use strict';
// Extracted from backend/routes/admin.js — Courses section.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const Course = require('../../models/Course');

const router = express.Router();

// ══════════════════════════════════════════════════
// COURSES (Quản lý khóa học)
// ══════════════════════════════════════════════════

// GET /api/admin/courses
router.get('/courses', auth, teacherOnly, async (req, res) => {
  try {
    const courses = await Course.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/courses
router.post('/courses', auth, teacherOnly, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/courses/:id
router.put('/courses/:id', auth, teacherOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/courses/:id  (soft delete – ẩn khỏi trang public)
router.delete('/courses/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn khóa học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/courses/:id/permanent  (hard delete)
router.delete('/courses/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn khóa học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
