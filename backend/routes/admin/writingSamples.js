'use strict';
// Extracted from backend/routes/admin.js — Writing Samples (PDF) section.

const express    = require('express');
const auth       = require('../../middleware/auth');
const { teacherOnly, uploadPdfMemory, uploadPdfBuffer } = require('./_shared');

const WritingSample = require('../../models/WritingSample');

const router = express.Router();

// ══════════════════════════════════════════════════
// WRITING SAMPLES (PDF)
// ══════════════════════════════════════════════════

// GET /api/admin/writing/samples
router.get('/writing/samples', auth, teacherOnly, async (req, res) => {
  try {
    const samples = await WritingSample.find().sort({ createdAt: -1 });
    res.json({ success: true, samples });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing/samples/upload-pdf
router.post('/writing/samples/upload-pdf', auth, teacherOnly, uploadPdfMemory.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Thiếu file PDF' });
    const url = await uploadPdfBuffer(req.file.buffer, 'writing-samples');
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/writing/samples
router.post('/writing/samples', auth, teacherOnly, async (req, res) => {
  try {
    const s = new WritingSample(req.body);
    await s.save();
    res.status(201).json({ success: true, sample: s });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing/samples/:id
router.put('/writing/samples/:id', auth, teacherOnly, async (req, res) => {
  try {
    const s = await WritingSample.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, sample: s });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing/samples/:id  (soft delete)
router.delete('/writing/samples/:id', auth, teacherOnly, async (req, res) => {
  try {
    await WritingSample.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn tài liệu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/writing/samples/:id/permanent  (hard delete)
router.delete('/writing/samples/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    await WritingSample.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
