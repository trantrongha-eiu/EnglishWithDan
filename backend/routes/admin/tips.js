'use strict';
// "Tips 4 kỹ năng": admin visibility + publish control for the Reading /
// Listening / Writing / Speaking Tips articles students read. Until now
// those four collections (ReadingTip, ListeningTip, WritingTip, SpeakingTip)
// had no admin surface at all — the only way to see or hide a tip was a
// seed script (docs/ADMIN_AUDIT_2026-09-25.md §4). Block-level editing is
// deliberately NOT here: content still comes from the seed data files; this
// covers list, preview and show/hide.

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const logger = require('../../utils/logger');
const { SKILLS, tipMarkdown } = require('../../services/tipLecturePackService');

const router = express.Router();

// GET /api/admin/tips — every tip of the 4 skills, hidden ones included
router.get('/tips', auth, teacherOnly, async (req, res) => {
  try {
    const skills = await Promise.all(Object.entries(SKILLS).map(async ([skill, s]) => {
      const tips = await s.model.aggregate([
        { $sort: { orderIndex: 1 } },
        { $project: {
          category: 1, lessonKey: 1, title: 1, icon: 1, summary: 1, orderIndex: 1, isActive: 1, updatedAt: 1,
          blockCount: { $size: { $ifNull: ['$blocks', []] } },
        } },
      ]);
      return {
        skill,
        label: s.label,
        tips: tips.map(t => ({
          ...t,
          isActive: t.isActive !== false,
          hasPractice: !!(s.practice && s.practice.hasPractice(t.lessonKey)),
        })),
      };
    }));
    res.json({ success: true, skills });
  } catch (err) {
    console.error('[Admin tips]', err);
    res.status(500).json({ success: false, message: 'Không tải được danh sách Tips' });
  }
});

function resolve(req, res) {
  const s = SKILLS[req.params.skill];
  if (!s) { res.status(400).json({ success: false, message: 'Kỹ năng không hợp lệ' }); return null; }
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ success: false, message: 'ID không hợp lệ' }); return null; }
  return s;
}

// GET /api/admin/tips/:skill/:id — preview (rendered as Markdown, the same
// renderer the printable "Tài liệu in" pack uses)
router.get('/tips/:skill/:id', auth, teacherOnly, async (req, res) => {
  try {
    const s = resolve(req, res);
    if (!s) return;
    const tip = await s.model.findById(req.params.id).lean();
    if (!tip) return res.status(404).json({ success: false, message: 'Không tìm thấy bài Tips' });
    res.json({
      success: true,
      tip: {
        _id: tip._id, category: tip.category, lessonKey: tip.lessonKey, title: tip.title, icon: tip.icon,
        summary: tip.summary, isActive: tip.isActive !== false, updatedAt: tip.updatedAt,
        markdown: tipMarkdown(tip),
      },
    });
  } catch (err) {
    console.error('[Admin tip preview]', err);
    res.status(500).json({ success: false, message: 'Không tải được bài Tips' });
  }
});

// PATCH /api/admin/tips/:skill/:id/active { isActive } — show/hide for students
router.patch('/tips/:skill/:id/active', auth, teacherOnly, async (req, res) => {
  try {
    const s = resolve(req, res);
    if (!s) return;
    const { isActive } = req.body || {};
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive phải là true/false' });
    }
    const tip = await s.model.findByIdAndUpdate(req.params.id, { isActive }, { new: true })
      .select('title isActive').lean();
    if (!tip) return res.status(404).json({ success: false, message: 'Không tìm thấy bài Tips' });
    logger.security(isActive ? 'Staff published a tip' : 'Staff hid a tip', {
      actorId: String(req.user._id), skill: req.params.skill, tipId: req.params.id,
    });
    res.json({ success: true, tip, message: isActive ? 'Đã hiện bài Tips cho học sinh' : 'Đã ẩn bài Tips khỏi học sinh' });
  } catch (err) {
    console.error('[Admin tip toggle]', err);
    res.status(500).json({ success: false, message: 'Không cập nhật được bài Tips' });
  }
});

module.exports = router;
