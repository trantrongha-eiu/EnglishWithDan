'use strict';
// Extracted from backend/routes/admin.js — Task 2 Templates CRUD section.

const express = require('express');
const SearchMatch = require('../../utils/searchMatch');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const Task2Template = require('../../models/Task2Template');
const Task2TemplateAttempt = require('../../models/Task2TemplateAttempt');
const task2TemplateService = require('../../services/task2TemplateService');

const router = express.Router();

// ══════════════════════════════════════════════════
// TASK 2 TEMPLATES CRUD
// ══════════════════════════════════════════════════

// Content = the Writing book templates (frontend/js/task2-generic-templates.js),
// copied into these rows by scripts/syncTask2TemplatesFromBook.js. The old
// pre-book sets (SEED_TEMPLATES / seedTask2TemplatesBand6.js) were deleted
// 2026-11-25. Students never read these rows — only homework points at them.

// GET /api/admin/task2/templates
router.get('/task2/templates', auth, teacherOnly, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = SearchMatch.mongoFilter(search, ['name', 'typeId']) || {};
    const templates = await Task2Template.find(query).sort({ orderIndex: 1 }).lean();
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/templates/seed  (before :id route)
// The old built-in sets are gone: templates follow the Writing book only.
// Kept so an old admin bundle gets an explanation instead of a 404.
router.post('/task2/templates/seed', auth, teacherOnly, (req, res) => {
  res.json({ success: false, message: 'Template Task 2 giờ lấy từ sách Writing (Band 6+ / 7+). Sau khi sửa js/task2-generic-templates.js, chạy: node backend/scripts/syncTask2TemplatesFromBook.js' });
});

// GET /api/admin/task2/templates/attempts  (before :id route — student results,
// including "Chế độ thi thử" runs, across Cloze/Translation/Chunks/Build/Dictation)
router.get('/task2/templates/attempts', auth, teacherOnly, async (req, res) => {
  try {
    const { limit = 100, skip = 0, mode, isExam, templateType } = req.query;
    const { attempts, total } = await task2TemplateService.listAttemptsForAdmin({
      limit: Math.min(parseInt(limit) || 100, 500), skip: parseInt(skip) || 0, mode, isExam, templateType,
    });
    res.json({ success: true, attempts, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/templates/attempts/:id
router.delete('/task2/templates/attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Task2TemplateAttempt.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/templates/:id
router.get('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const template = await Task2Template.findById(req.params.id).lean();
    if (!template) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/templates
router.post('/task2/templates', auth, teacherOnly, async (req, res) => {
  try {
    const template = new Task2Template(req.body);
    await template.save();
    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/templates/:id
router.put('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const tpl = await Task2Template.findById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    Object.keys(req.body).forEach(k => { tpl[k] = req.body[k]; });
    await tpl.save();
    res.json({ success: true, template: tpl.toObject() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/templates/:id
router.delete('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const tpl = await Task2Template.findByIdAndDelete(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
