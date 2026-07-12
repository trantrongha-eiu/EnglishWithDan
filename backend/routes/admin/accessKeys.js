'use strict';
// Extracted from backend/routes/admin.js — Access Keys section.

const express = require('express');
const crypto  = require('crypto');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const AccessKey    = require('../../models/AccessKey');
const ListeningTest = require('../../models/ListeningTest');
const WritingExam   = require('../../models/WritingExam');
const ReadingTest   = require('../../models/ReadingTest');

const router = express.Router();

// ══════════════════════════════════════════════════
// ACCESS KEYS
// ══════════════════════════════════════════════════

// GET  /api/admin/keys
router.get('/keys', auth, teacherOnly, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const keys = await AccessKey.find(filter)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    // Populate thủ công vì refPath cần virtual (mongoose không tự resolve virtual refPath).
    // Batch-fetch per model (one query per test type) instead of one findById per key.
    const idsByType = { listening: new Set(), writing: new Set(), reading: new Set() };
    keys.forEach(k => {
      if (!k.testId) return;
      const bucket = k.testType === 'listening' ? 'listening' : k.testType === 'writing' ? 'writing' : 'reading';
      idsByType[bucket].add(k.testId.toString());
    });

    const [listeningTests, writingExams, readingTests] = await Promise.all([
      idsByType.listening.size ? ListeningTest.find({ _id: { $in: [...idsByType.listening] } }).select('name') : [],
      idsByType.writing.size ? WritingExam.find({ _id: { $in: [...idsByType.writing] } }).select('name') : [],
      idsByType.reading.size ? ReadingTest.find({ _id: { $in: [...idsByType.reading] } }).select('name') : [],
    ]);
    const testMap = {};
    [...listeningTests, ...writingExams, ...readingTests].forEach(t => { testMap[t._id.toString()] = t; });

    const populated = keys.map(k => {
      const obj = k.toObject({ virtuals: true });
      if (k.testId) {
        const test = testMap[k.testId.toString()];
        obj.testId = test ? { _id: test._id, name: test.name } : null;
      }
      return obj;
    });

    res.json({ success: true, keys: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/keys/generate
// Body: { count, testId, testType, expiryDays, maxUses }
router.post('/keys/generate', auth, teacherOnly, async (req, res) => {
  try {
    const {
      count     = 1,
      testId    = null,
      testType  = null,   // 'reading' | 'listening' | null
      expiryDays = null,
      maxUses   = 1
    } = req.body;

    if (count < 1 || count > 100) {
      return res.status(400).json({ success: false, message: 'count phải từ 1 đến 100' });
    }

    // Validate testType
    const validTypes = ['reading', 'listening', 'writing', null];
    if (!validTypes.includes(testType)) {
      return res.status(400).json({ success: false, message: 'testType không hợp lệ' });
    }

    const createdKeys = [];

    for (let i = 0; i < count; i++) {
      const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
      const key = `${raw.slice(0, 4)}-${raw.slice(4)}`;

      const accessKey = new AccessKey({
        key,
        testId:   testId   || null,
        testType: testType  || null,
        createdBy: req.user._id,
        expiresAt: expiryDays
          ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
          : null,
        maxUses: Number(maxUses)
      });
      await accessKey.save();
      createdKeys.push(key);
    }

    res.status(201).json({ success: true, keys: createdKeys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/keys/:id/deactivate – vô hiệu hoá (teacher chỉ được key của mình)
// Deliberately NOT using the shared `teacherOnly` middleware: teacherOnly blocks
// every DELETE for role 'teacher', but here a teacher IS allowed to delete/deactivate
// a key they created (enforced below by the createdBy check) — only admins may
// touch keys they didn't create.
router.patch('/keys/:id/deactivate', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    const key = await AccessKey.findById(req.params.id);
    if (!key) return res.status(404).json({ success: false, message: 'Không tìm thấy key' });
    if (req.user.role === 'teacher' && key.createdBy?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Chỉ có thể vô hiệu hoá key do bạn tạo' });
    await AccessKey.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã vô hiệu hoá key' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/keys/:id – xóa vĩnh viễn (admin xóa bất kỳ, teacher xóa key của mình)
// Same intentional deviation from `teacherOnly` as the deactivate route above.
router.delete('/keys/:id', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role))
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    const key = await AccessKey.findById(req.params.id);
    if (!key) return res.status(404).json({ success: false, message: 'Không tìm thấy key' });
    if (req.user.role === 'teacher' && key.createdBy?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Chỉ có thể xóa key do bạn tạo' });
    await AccessKey.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa key' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
