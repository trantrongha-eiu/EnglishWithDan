'use strict';

// Admin CRUD for "Viết câu nâng cao" grammar-structure groups + their
// embedded translation sentences. Mirrors routes/admin/task2Topics.js.
// The sentence bank is edited as a whole array (PUT .../sentences) — small
// enough (5–12 per group) that per-sentence endpoints aren't worth it.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly, escapeRegex } = require('./_shared');

const SentenceStructureGroup = require('../../models/SentenceStructureGroup');

const router = express.Router();

// GET /api/admin/adv-sentence/groups
router.get('/adv-sentence/groups', auth, teacherOnly, async (req, res) => {
  try {
    const { week = 'all', search = '' } = req.query;
    const query = {};
    if (week !== 'all') query.week = parseInt(week);
    if (search) query.$or = [
      { nameVi: { $regex: escapeRegex(search), $options: 'i' } },
      { nameEn: { $regex: escapeRegex(search), $options: 'i' } },
    ];
    const groups = await SentenceStructureGroup.aggregate([
      { $match: query },
      { $sort: { week: 1, order: 1 } },
      { $project: {
        code: 1, order: 1, week: 1, slotInWeek: 1, nameVi: 1, nameEn: 1,
        emoji: 1, targetStructure: 1, isActive: 1,
        sentenceCount: { $size: { $ifNull: ['$sentences', []] } },
      } },
    ]);
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/adv-sentence/groups/:id
router.get('/adv-sentence/groups/:id', auth, teacherOnly, async (req, res) => {
  try {
    const group = await SentenceStructureGroup.findById(req.params.id).lean();
    if (!group) return res.status(404).json({ success: false, message: 'Không tìm thấy nhóm' });
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/adv-sentence/groups
router.post('/adv-sentence/groups', auth, teacherOnly, async (req, res) => {
  try {
    const group = new SentenceStructureGroup(req.body);
    await group.save();
    res.status(201).json({ success: true, group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/adv-sentence/groups/:id  — group metadata (not sentences)
router.put('/adv-sentence/groups/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { sentences, ...meta } = req.body; // sentences managed via the dedicated route
    const group = await SentenceStructureGroup.findByIdAndUpdate(req.params.id, meta, { new: true, runValidators: true });
    if (!group) return res.status(404).json({ success: false, message: 'Không tìm thấy nhóm' });
    res.json({ success: true, group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/adv-sentence/groups/:id/sentences  — replace the whole bank
router.put('/adv-sentence/groups/:id/sentences', auth, teacherOnly, async (req, res) => {
  try {
    const sentences = Array.isArray(req.body.sentences) ? req.body.sentences : [];
    const clean = sentences.map((s, i) => ({
      _id: s._id || undefined,
      order: Number.isFinite(s.order) ? s.order : i + 1,
      promptVi: String(s.promptVi || '').trim(),
      answerEn: String(s.answerEn || '').trim(),
      altAnswers: Array.isArray(s.altAnswers) ? s.altAnswers.map((x) => String(x).trim()).filter(Boolean) : [],
      hintWords: Array.isArray(s.hintWords) ? s.hintWords.map((x) => String(x).trim()).filter(Boolean) : [],
      structureNote: String(s.structureNote || '').trim(),
    })).filter((s) => s.promptVi);
    const group = await SentenceStructureGroup.findByIdAndUpdate(
      req.params.id, { $set: { sentences: clean } }, { new: true, runValidators: true },
    );
    if (!group) return res.status(404).json({ success: false, message: 'Không tìm thấy nhóm' });
    res.json({ success: true, group });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/adv-sentence/groups/:id
router.delete('/adv-sentence/groups/:id', auth, teacherOnly, async (req, res) => {
  try {
    const group = await SentenceStructureGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Không tìm thấy nhóm' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
