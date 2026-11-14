'use strict';
// Shadowing (Video) — admin side of shadowing.html. Lessons are built from
// YouTube captions by scripts/shadowing/* and seeded by
// scripts/seedShadowingLessons.js; until now there was no admin surface at
// all. This covers: list (with 90-day practice stats), preview the timed
// sentences, fix a sentence's text / Vietnamese / dictation answer (timing
// stays script-owned), edit the card meta, and show/hide a lesson or a whole
// category for students.

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const { teacherOnly, escapeRegex } = require('./_shared');
const ShadowingLesson = require('../../models/ShadowingLesson');
const ShadowingAttempt = require('../../models/ShadowingAttempt');

const { CATEGORIES, CATEGORY_LABELS } = ShadowingLesson;
const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];
const router = express.Router();

// GET /api/admin/shadowing/lessons?category=&level=&published=&search=
router.get('/shadowing/lessons', auth, teacherOnly, async (req, res) => {
  try {
    const { category = '', level = '', published = '', search = '' } = req.query;
    const q = {};
    if (CATEGORIES.includes(category)) q.category = category;
    if (LEVELS.includes(level)) q.level = level;
    if (published === 'true') q.isPublished = true;
    if (published === 'false') q.isPublished = false;
    if (search) {
      const rx = { $regex: escapeRegex(String(search).slice(0, 100)), $options: 'i' };
      q.$or = [{ title: rx }, { slug: rx }, { sourceTitle: rx }, { channel: rx }];
    }
    const [lessons, catCounts, stats] = await Promise.all([
      ShadowingLesson.find(q).select('-segments').sort({ category: 1, order: 1, createdAt: 1 }).lean(),
      ShadowingLesson.aggregate([{ $group: { _id: '$category', total: { $sum: 1 }, published: { $sum: { $cond: ['$isPublished', 1, 0] } } } }]),
      // Practice in the retention window (attempts expire after 90 days).
      ShadowingAttempt.aggregate([
        { $group: { _id: '$lessonId', attempts: { $sum: 1 }, users: { $addToSet: '$userId' }, avgScore: { $avg: '$avgScore' }, last: { $max: '$submittedAt' } } },
        { $project: { attempts: 1, students: { $size: '$users' }, avgScore: { $round: ['$avgScore', 0] }, last: 1 } },
      ]),
    ]);
    const byLesson = new Map(stats.map(s => [String(s._id), s]));
    const counts = new Map(catCounts.map(c => [c._id, c]));
    res.json({
      success: true,
      categories: CATEGORIES.map(key => ({
        key, label: CATEGORY_LABELS[key],
        total: counts.get(key)?.total || 0, published: counts.get(key)?.published || 0,
      })),
      lessons: lessons.map(l => {
        const s = byLesson.get(String(l._id));
        return { ...l, attempts: s?.attempts || 0, students: s?.students || 0, avgScore: s?.avgScore ?? null, lastPracticed: s?.last || null };
      }),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/shadowing/lessons/:id — full lesson incl. timed sentences
router.get('/shadowing/lessons/:id', auth, teacherOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  try {
    const lesson = await ShadowingLesson.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài' });
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/shadowing/lessons/:id — card meta + sentence wording.
// Body: { title?, description?, level?, order?, isPublished?, segments?: [{ text, vi, answer }] }
// `segments` must have the same length as the stored ones: only the wording
// changes — start/end belong to the build scripts (whisper / caption timing).
router.put('/shadowing/lessons/:id', auth, teacherOnly, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  try {
    const lesson = await ShadowingLesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài' });
    const b = req.body || {};
    if (typeof b.title === 'string') {
      if (!b.title.trim()) return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống' });
      lesson.title = b.title.trim();
    }
    if (typeof b.description === 'string') lesson.description = b.description;
    if (b.level !== undefined) {
      if (!LEVELS.includes(b.level)) return res.status(400).json({ success: false, message: 'Level không hợp lệ' });
      lesson.level = b.level;
    }
    if (b.order !== undefined && Number.isFinite(Number(b.order))) lesson.order = Number(b.order);
    if (typeof b.isPublished === 'boolean') lesson.isPublished = b.isPublished;
    if (Array.isArray(b.segments)) {
      if (b.segments.length !== lesson.segments.length) {
        return res.status(400).json({ success: false, message: 'Số câu không khớp — chỉ sửa được nội dung từng câu, không thêm/bớt câu' });
      }
      b.segments.forEach((s, i) => {
        const seg = lesson.segments[i];
        if (typeof s.text === 'string' && s.text.trim()) seg.text = s.text.trim();
        if (typeof s.vi === 'string') seg.vi = s.vi.trim();
        if (typeof s.answer === 'string') seg.answer = s.answer.trim() || undefined;
      });
      lesson.markModified('segments');
    }
    await lesson.save();
    const out = lesson.toObject();
    res.json({ success: true, lesson: out });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/shadowing/categories/:category/publish { isPublished }
router.patch('/shadowing/categories/:category/publish', auth, teacherOnly, async (req, res) => {
  const { category } = req.params;
  if (!CATEGORIES.includes(category)) return res.status(400).json({ success: false, message: 'Chủ đề không hợp lệ' });
  if (typeof req.body?.isPublished !== 'boolean') return res.status(400).json({ success: false, message: 'Thiếu isPublished' });
  try {
    const r = await ShadowingLesson.updateMany({ category }, { $set: { isPublished: req.body.isPublished } });
    res.json({ success: true, modified: r.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
