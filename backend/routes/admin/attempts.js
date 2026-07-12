'use strict';
// Extracted from backend/routes/admin.js — Delete Exam Attempts section.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const TestAttempt     = require('../../models/TestAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const WritingAttempt  = require('../../models/WritingAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const ReadingPracticeAttempt   = require('../../models/ReadingPracticeAttempt');
const WritingPracticeAttempt   = require('../../models/WritingPracticeAttempt');
const Task1Attempt    = require('../../models/Task1Attempt');
const Task2Attempt    = require('../../models/Task2Attempt');

const router = express.Router();

// ══════════════════════════════════════════════════
// DELETE EXAM ATTEMPTS (Admin xóa bài thi)
// ══════════════════════════════════════════════════

// DELETE /api/admin/attempts/:id  – xóa bài Reading
router.delete('/attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await TestAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    res.json({ success: true, message: 'Đã xóa bài thi Reading' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/listening-attempts/:id  – xóa bài Listening
router.delete('/listening-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await ListeningAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    res.json({ success: true, message: 'Đã xóa bài thi Listening' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-attempts/:id  – xóa bài Writing
router.delete('/writing-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await WritingAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    res.json({ success: true, message: 'Đã xóa bài nộp Writing' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/listening-practice-attempts/:id  – xóa bài lẻ Listening
router.delete('/listening-practice-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await ListeningPracticeAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài luyện' });
    res.json({ success: true, message: 'Đã xóa bài luyện Listening' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/reading-practice-attempts/:id  – xóa bài lẻ Reading
router.delete('/reading-practice-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await ReadingPracticeAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài luyện' });
    res.json({ success: true, message: 'Đã xóa bài luyện Reading' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-practice-attempts/:id
router.delete('/writing-practice-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await WritingPracticeAttempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài luyện' });
    res.json({ success: true, message: 'Đã xóa bài luyện Writing' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task1-attempts/:id
router.delete('/task1-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await Task1Attempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài Task 1' });
    res.json({ success: true, message: 'Đã xóa bài Task 1' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2-attempts/:id
router.delete('/task2-attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await Task2Attempt.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài Task 2' });
    res.json({ success: true, message: 'Đã xóa bài Task 2' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
