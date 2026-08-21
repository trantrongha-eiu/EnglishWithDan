'use strict';
// Extracted from backend/routes/admin.js — Speaking Questions, Speaking Materials (PDF), and Speaking History sections.

const express    = require('express');
const auth       = require('../../middleware/auth');
const { teacherOnly, uploadPdf, uploadPdfBuffer } = require('./_shared');

const SpeakingQuestion = require('../../models/SpeakingQuestion');
const SpeakingMaterial = require('../../models/SpeakingMaterial');
const SpeakingAttempt  = require('../../models/SpeakingAttempt');
const User             = require('../../models/User');

const router = express.Router();

// ══════════════════════════════════════════════════
// SPEAKING – QUESTIONS
// ══════════════════════════════════════════════════

// GET /api/admin/speaking/questions
router.get('/speaking/questions', auth, teacherOnly, async (req, res) => {
  try {
    // DELETE below is a soft delete (isActive: false, same as Materials) —
    // this list must exclude those or a "deleted" question just reappears
    // on the next reload/refetch (e.g. after adding a new one).
    const questions = await SpeakingQuestion.find({ isActive: { $ne: false } }).sort({ topic: 1, part: 1, createdAt: -1 });
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/questions
router.post('/speaking/questions', auth, teacherOnly, async (req, res) => {
  try {
    const q = new SpeakingQuestion(req.body);
    await q.save();
    res.status(201).json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/speaking/questions/:id
router.put('/speaking/questions/:id', auth, teacherOnly, async (req, res) => {
  try {
    const q = await SpeakingQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, question: q });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/questions/:id  (soft delete)
router.delete('/speaking/questions/:id', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingQuestion.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn câu hỏi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/questions/:id/permanent  (hard delete)
router.delete('/speaking/questions/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingQuestion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn câu hỏi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// SPEAKING – MATERIALS (PDF)
// ══════════════════════════════════════════════════

// GET /api/admin/speaking/materials
router.get('/speaking/materials', auth, teacherOnly, async (req, res) => {
  try {
    const materials = await SpeakingMaterial.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/materials/upload-pdf
// Body: multipart/form-data with field "pdf"
router.post('/speaking/materials/upload-pdf', auth, teacherOnly, uploadPdf, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Thiếu file PDF' });
    const url = await uploadPdfBuffer(req.file.buffer, 'speaking-materials');
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/materials
router.post('/speaking/materials', auth, teacherOnly, async (req, res) => {
  try {
    const m = new SpeakingMaterial(req.body);
    await m.save();
    res.status(201).json({ success: true, material: m });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/speaking/materials/:id
router.put('/speaking/materials/:id', auth, teacherOnly, async (req, res) => {
  try {
    const m = await SpeakingMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, material: m });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/materials/:id  (soft delete)
router.delete('/speaking/materials/:id', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingMaterial.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn tài liệu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/speaking/materials/:id/permanent  (hard delete)
router.delete('/speaking/materials/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await SpeakingMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn tài liệu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/speaking/history  — tất cả lượt luyện của học sinh
router.get('/speaking/history', auth, teacherOnly, async (req, res) => {
  try {
    const { page = 1, limit = 40, userId, part, search } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (part) filter.part = Number(part);
    // search used to only be applied client-side against whatever single
    // 40-row page happened to already be loaded (admin-src/src/pages/
    // Speaking.jsx) — a student whose matching attempts sat on a later
    // page looked exactly like "no history", with the total/matched
    // counters right next to each other implying otherwise. userId isn't
    // text-searchable directly, so resolve matching usernames first.
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const matchingUsers = await User.find({ username: regex }).select('_id').lean();
      filter.$or = [
        { userId: { $in: matchingUsers.map(u => u._id) } },
        { question: regex },
        { topic: regex },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [attempts, total] = await Promise.all([
      SpeakingAttempt.find(filter)
        .populate('userId', 'username email plan')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SpeakingAttempt.countDocuments(filter)
    ]);
    res.json({ success: true, attempts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
