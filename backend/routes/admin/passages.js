'use strict';
// Extracted from backend/routes/admin.js — Passages + Reading Tests + Listening Tests dropdown sections.

const express    = require('express');
const auth       = require('../../middleware/auth');
const { isImageDataUri } = require('../../utils/validation');
const { teacherOnly, uploadImageDataUri } = require('./_shared');

const Passage      = require('../../models/Passage');
const ReadingTest  = require('../../models/ReadingTest');
const ListeningTest = require('../../models/ListeningTest');

const router = express.Router();

// ══════════════════════════════════════════════════
// PASSAGES
// ══════════════════════════════════════════════════

router.get('/passages', auth, teacherOnly, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = category ? { category } : {};
    const [passages, total] = await Promise.all([
      Passage.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
        { $project: {
          title: 1, category: 1, difficulty: 1, tags: 1, isActive: 1, isActualTest: 1, questionRange: 1, createdAt: 1,
          questionCount: {
            $add: [
              { $size: { $ifNull: ['$questions', []] } },
              { $sum: { $map: {
                input: { $ifNull: ['$questionGroups', []] },
                as: 'g',
                in: { $size: { $ifNull: ['$$g.questions', []] } }
              }}}
            ]
          }
        }}
      ]),
      Passage.countDocuments(filter)
    ]);
    res.json({ success: true, passages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/passages/stats – số lượng passage active theo từng category
router.get('/passages/stats', auth, teacherOnly, async (req, res) => {
  try {
    const stats = await Passage.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const result = { passage1: 0, passage2: 0, passage3: 0 };
    stats.forEach(s => { if (s._id in result) result[s._id] = s.count; });
    res.json({ success: true, stats: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/passages/upload-map-image
// Body: { imageBase64 }  → upload lên Cloudinary → trả về URL
router.post('/passages/upload-map-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu ảnh' });
    if (!isImageDataUri(imageBase64)) return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });

    const url = await uploadImageDataUri(imageBase64, 'reading-maps');
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/passages', auth, teacherOnly, async (req, res) => {
  try {
    const passage = new Passage(req.body);
    await passage.save();
    res.status(201).json({ success: true, passage });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, passage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    // Gán từng field rõ ràng để Mongoose thay hẳn arrays subdocument
    const { title, category, content, questionRange, difficulty, tags, questionGroups, questions, isActive, isActualTest } = req.body;
    if (title          !== undefined) passage.title          = title;
    if (category       !== undefined) passage.category       = category;
    if (content        !== undefined) passage.content        = content;
    if (questionRange  !== undefined) passage.questionRange  = questionRange;
    if (difficulty     !== undefined) passage.difficulty     = difficulty;
    if (tags           !== undefined) passage.tags           = tags;
    if (isActive       !== undefined) passage.isActive       = isActive;
    if (isActualTest   !== undefined) passage.isActualTest   = isActualTest;
    if (questionGroups !== undefined) passage.questionGroups = questionGroups;
    if (questions      !== undefined) passage.questions      = questions;

    const updated = await passage.save();
    res.json({ success: true, passage: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/passages/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Passage.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn bài đọc' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/passages/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    const passage = await Passage.findByIdAndDelete(req.params.id);
    if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đọc' });
    res.json({ success: true, message: 'Đã xóa vĩnh viễn bài đọc' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// READING TESTS
// ══════════════════════════════════════════════════

router.get('/tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ReadingTest.find().sort({ testNumber: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/tests', auth, teacherOnly, async (req, res) => {
  try {
    const test = new ReadingTest(req.body);
    await test.save();
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ReadingTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy bộ đề' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ReadingTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    await ReadingTest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn bộ đề' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/tests/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ReadingTest.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy bộ đề' });
    res.json({ success: true, message: 'Đã xóa vĩnh viễn bộ đề' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// LISTENING TESTS (cho dropdown key)
// ══════════════════════════════════════════════════

// GET /api/admin/listening-tests  – dropdown tạo key
router.get('/listening-tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ListeningTest.find({ isActive: true })
      .select('name testNumber seriesName')
      .sort({ testNumber: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
