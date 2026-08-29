'use strict';
// Extracted from backend/routes/admin.js — Passages + Reading Tests + Listening Tests dropdown sections.

const express    = require('express');
const auth       = require('../../middleware/auth');
const { isImageDataUri } = require('../../utils/validation');
const { teacherOnly, uploadImageDataUri, escapeRegex } = require('./_shared');

const Passage      = require('../../models/Passage');
const ReadingTest  = require('../../models/ReadingTest');
const ListeningTest = require('../../models/ListeningTest');
const readingController = require('../../controllers/reading.controller');

const router = express.Router();

// ══════════════════════════════════════════════════
// PASSAGES
// ══════════════════════════════════════════════════

// Shared by GET /passages and PUT /passages/bulk-active so the "hide/show
// all matching the current filter" button acts on exactly the rows the
// admin is looking at, even the ones past the current page.
function buildPassageFilter({ category, search, difficulty }) {
  const filter = {};
  if (category)   filter.category   = category;
  if (difficulty) filter.difficulty = difficulty;
  if (search)     filter.title      = { $regex: escapeRegex(String(search)), $options: 'i' };
  return filter;
}

router.get('/passages', auth, teacherOnly, async (req, res) => {
  try {
    const { category, search, difficulty, page = 1, limit = 20 } = req.query;
    const filter = buildPassageFilter({ category, search, difficulty });
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

// PUT /api/admin/passages/bulk-active
//   { ids: [...], isActive }            — explicit id list, or
//   { filter: { category, search, difficulty }, isActive } — every passage
//   matching the same filter the list view uses (so "ẩn/hiện tất cả" covers
//   rows past the current page without the frontend shipping every id).
// One request either way, instead of N parallel PUTs. Registered before
// /passages/:id so "bulk-active" isn't captured as an :id.
router.put('/passages/bulk-active', auth, teacherOnly, async (req, res) => {
  try {
    const { ids, filter, isActive } = req.body;
    if (typeof isActive !== 'boolean')
      return res.status(400).json({ success: false, message: 'isActive phải là boolean' });

    let query;
    if (Array.isArray(ids) && ids.length) {
      query = { _id: { $in: ids } };
    } else if (filter && typeof filter === 'object') {
      // May be {} — that's the deliberate "toggle every passage" case, same
      // as the old per-id Promise.all with no filter active. It's an update
      // (reversible, admin-gated, confirmed with a count), never a delete.
      query = buildPassageFilter(filter);
    } else {
      return res.status(400).json({ success: false, message: 'Thiếu ids hoặc filter' });
    }

    const r = await Passage.updateMany(query, { isActive });
    res.json({ success: true, matched: r.matchedCount, modified: r.modifiedCount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
    // The admin list only renders name/series/number/status/date — fetch just
    // those, lean, so the whole list (and the frontend's re-fetch after every
    // ẩn/hiện toggle) isn't a full hydrated ReadingTest scan.
    const tests = await ReadingTest.find()
      .select('name seriesName testNumber isActive createdAt')
      .sort({ testNumber: -1 })
      .lean();
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/tests/bulk-active  { ids: [], isActive: bool }
// One request for "ẩn/hiện tất cả"; registered before /tests/:id.
router.put('/tests/bulk-active', auth, teacherOnly, async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ success: false, message: 'Thiếu danh sách id' });
    if (typeof isActive !== 'boolean')
      return res.status(400).json({ success: false, message: 'isActive phải là boolean' });
    const r = await ReadingTest.updateMany({ _id: { $in: ids } }, { isActive });
    res.json({ success: true, matched: r.matchedCount, modified: r.modifiedCount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
// READING TEST ATTEMPTS (Admin thống kê — mirrors Listening's
// /listening/attempts + /listening/attempts/stats in routes/admin/listening.js)
// ══════════════════════════════════════════════════

// GET /api/admin/reading-tests/attempts — paginated, filterable by testId/userId
router.get('/reading-tests/attempts', auth, teacherOnly, readingController.listAdminAttempts);
// GET /api/admin/reading-tests/attempts/stats — overview + per-test + top-students, optionally scoped to one testId
router.get('/reading-tests/attempts/stats', auth, teacherOnly, readingController.getAdminAttemptsStats);

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
