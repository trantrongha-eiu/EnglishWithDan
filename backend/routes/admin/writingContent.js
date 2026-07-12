'use strict';
// Extracted from backend/routes/admin.js — Writing Tests dropdown, Writing Exams, Writing History, Writing Task 1 Pool, Writing Task 2 Pool sections.

const express    = require('express');
const auth       = require('../../middleware/auth');
const { isImageDataUri } = require('../../utils/validation');
const { teacherOnly, uploadImageDataUri } = require('./_shared');

const WritingExam    = require('../../models/WritingExam');
const WritingTask1   = require('../../models/WritingTask1');
const WritingTask2   = require('../../models/WritingTask2');
const WritingAttempt = require('../../models/WritingAttempt');

const router = express.Router();

// ══════════════════════════════════════════════════
// WRITING TESTS (dropdown key)
// ══════════════════════════════════════════════════

// GET /api/admin/writing-tests  – dropdown tạo key
router.get('/writing-tests', auth, teacherOnly, async (req, res) => {
  try {
    const exams = await WritingExam.find({ isActive: true })
      .select('name')
      .sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-exams  – quản lý đề
router.get('/writing-exams', auth, teacherOnly, async (req, res) => {
  try {
    const exams = await WritingExam.find().sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-exams/upload-image
// Body: { imageBase64 }  → upload lên Cloudinary → trả về URL
router.post('/writing-exams/upload-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh' });
    if (!isImageDataUri(imageBase64)) return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });

    const url = await uploadImageDataUri(imageBase64, 'writing-tasks');
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-exams  – tạo đề
router.post('/writing-exams', auth, teacherOnly, async (req, res) => {
  try {
    const exam = new WritingExam(req.body);
    await exam.save();
    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-exams/:id
router.put('/writing-exams/:id', auth, teacherOnly, async (req, res) => {
  try {
    const exam = await WritingExam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-exams/:id  (soft delete)
router.delete('/writing-exams/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingExam.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn đề writing' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING HISTORY (bài nộp của học sinh)
// ══════════════════════════════════════════════════

// GET /api/admin/writing-history  – danh sách tất cả bài nộp (không kèm text)
router.get('/writing-history', auth, teacherOnly, async (req, res) => {
  try {
    const attempts = await WritingAttempt.find()
      .populate('userId', 'username firstName lastName')
      .sort({ submittedAt: -1 })
      .limit(200)
      .select('-task1Answer -task2Answer -task1Snapshot -task2Snapshot');
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-attempt/:id  – chi tiết bài nộp (có text đầy đủ)
router.get('/writing-attempt/:id', auth, teacherOnly, async (req, res) => {
  try {
    const attempt = await WritingAttempt.findById(req.params.id)
      .populate('userId', 'username firstName lastName')
      .populate('examId', 'name');
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING TASK 1 POOL
// ══════════════════════════════════════════════════

// GET /api/admin/writing-task1
router.get('/writing-task1', auth, teacherOnly, async (req, res) => {
  try {
    const tasks = await WritingTask1.find().sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-task1/:id
router.get('/writing-task1/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask1.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-task1/upload-image
router.post('/writing-task1/upload-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh' });
    if (!isImageDataUri(imageBase64)) return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });
    const url = await uploadImageDataUri(imageBase64, 'writing-tasks');
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-task1
router.post('/writing-task1', auth, teacherOnly, async (req, res) => {
  try {
    const task = new WritingTask1(req.body);
    await task.save();
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-task1/:id
router.put('/writing-task1/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask1.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task1/:id  (soft delete)
router.delete('/writing-task1/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask1.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn câu hỏi Task 1' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task1/:id/permanent  (hard delete)
router.delete('/writing-task1/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask1.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn Task 1' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// WRITING TASK 2 POOL
// ══════════════════════════════════════════════════

// GET /api/admin/writing-task2
router.get('/writing-task2', auth, teacherOnly, async (req, res) => {
  try {
    const tasks = await WritingTask2.find().sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/writing-task2/:id
router.get('/writing-task2/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask2.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing-task2
router.post('/writing-task2', auth, teacherOnly, async (req, res) => {
  try {
    const task = new WritingTask2(req.body);
    await task.save();
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-task2/:id
router.put('/writing-task2/:id', auth, teacherOnly, async (req, res) => {
  try {
    const task = await WritingTask2.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task2/:id  (soft delete)
router.delete('/writing-task2/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask2.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn câu hỏi Task 2' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing-task2/:id/permanent  (hard delete)
router.delete('/writing-task2/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await WritingTask2.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn Task 2' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
