'use strict';
// Extracted from backend/routes/admin.js — Speaking Questions, Speaking Materials (PDF), and Speaking History sections.

const express    = require('express');
const mongoose   = require('mongoose');
const auth       = require('../../middleware/auth');
const { teacherOnly, adminOnly, uploadPdf, uploadPdfBuffer } = require('./_shared');

const SpeakingQuestion = require('../../models/SpeakingQuestion');
const SpeakingMaterial = require('../../models/SpeakingMaterial');
const SpeakingAttempt  = require('../../models/SpeakingAttempt');
const User             = require('../../models/User');
const { parseSpeakingText } = require('../../services/speakingImportParser');
const { loadBankIndex, warnAboutExisting, buildImportOps } = require('../../services/speakingImportService');

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
// The cached AI sample answer + vocab hints (SpeakingQuestion.sampleAnswer /
// hints, written the first time any student opens them) belong to the
// wording they were generated for. Rewording the question, its cue card or
// its part left every student seeing the OLD question's sample answer
// forever — they're now cleared so the next view regenerates them. Edit
// payloads can't write those caches directly, and run the schema
// validators (a bad part/group used to be saved as-is).
const QUESTION_EDIT_FIELDS = ['topic', 'part', 'group', 'question', 'cueCard', 'isActive'];
router.put('/speaking/questions/:id', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    const q = await SpeakingQuestion.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    const body = req.body || {};
    for (const k of QUESTION_EDIT_FIELDS) if (k in body) q.set(k, body[k]);
    const reworded = ['question', 'cueCard', 'part'].some((k) => q.isModified(k));
    if (reworded && (q.sampleAnswer || (q.hints && q.hints.vocab && q.hints.vocab.length))) {
      q.sampleAnswer = '';
      q.set('hints.vocab', []);
    }
    await q.save();
    res.json({ success: true, question: q, ...(reworded ? { cacheCleared: true } : {}) });
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

// ── Import: paste "EnglishWithDan Speaking Format", parse + upsert ──
// Mirrors the Vocabulary Lessons import flow. Format documented in
// services/speakingImportParser.js. Nothing is saved until /import.

// POST /api/admin/speaking/questions/parse  — validate only, no writes
router.post('/speaking/questions/parse', auth, teacherOnly, async (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Thiếu nội dung' });
  }
  try {
    const parsed = await warnAboutExisting(parseSpeakingText(text));
    res.json({ success: true, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/questions/import
// Same matching as /parse (services/speakingImportService.js): merges into
// existing topics/questions despite small wording differences, revives
// soft-deleted ones, never touches cached sampleAnswer/hints.
router.post('/speaking/questions/import', auth, teacherOnly, async (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Thiếu nội dung' });
  }
  try {
    const parsed = parseSpeakingText(text);
    if (!parsed.valid) {
      return res.status(400).json({ success: false, message: `${parsed.errors.length} lỗi — chưa thể import`, errors: parsed.errors });
    }
    const ops = buildImportOps(parsed, await loadBankIndex());
    const result = await SpeakingQuestion.bulkWrite(ops, { ordered: false });
    const created = result.upsertedCount || 0;
    const matched = result.matchedCount || 0;
    res.status(201).json({
      success: true,
      message: `Đã import ${parsed.counts.topics} topic — ${created} câu mới, ${matched} câu cập nhật`,
      counts: parsed.counts,
      created,
      matched,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/speaking/questions/hide-all  (admin only)
// Soft-hide every active question, optionally scoped to one part.
router.patch('/speaking/questions/hide-all', auth, adminOnly, async (req, res) => {
  try {
    const filter = { isActive: { $ne: false } };
    const part = Number(req.query.part || req.body?.part);
    if ([1, 2, 3].includes(part)) filter.part = part;
    const r = await SpeakingQuestion.updateMany(filter, { $set: { isActive: false } });
    res.json({ success: true, message: `Đã ẩn ${r.modifiedCount} câu hỏi`, modified: r.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/speaking/questions/delete-all  (admin only, requires confirm)
// Hard-delete every question (or one part). SpeakingQuestion is
// admin-authored content re-creatable via the import / seed script — not
// per-student data — so a full wipe here is a legitimate, recoverable op.
router.post('/speaking/questions/delete-all', auth, adminOnly, async (req, res) => {
  try {
    if (req.body?.confirm !== true) {
      return res.status(400).json({ success: false, message: 'Thiếu xác nhận (confirm: true)' });
    }
    const filter = {};
    const part = Number(req.body?.part);
    if ([1, 2, 3].includes(part)) filter.part = part;
    const r = await SpeakingQuestion.deleteMany(filter);
    res.json({ success: true, message: `Đã xóa vĩnh viễn ${r.deletedCount} câu hỏi`, deleted: r.deletedCount });
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
    const { userId, part, search } = req.query;
    // Clamped: limit=0 / page=abc used to 500 (NaN skip) or report pages: Infinity.
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 40));
    const filter = {};
    if (userId) {
      if (!mongoose.isValidObjectId(userId)) return res.json({ success: true, attempts: [], total: 0, page, pages: 0 });
      filter.userId = userId;
    }
    if ([1, 2, 3].includes(Number(part))) filter.part = Number(part);
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
    const skip = (page - 1) * limit;
    const [attempts, total] = await Promise.all([
      SpeakingAttempt.find(filter)
        .populate('userId', 'username email plan')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SpeakingAttempt.countDocuments(filter)
    ]);
    res.json({ success: true, attempts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/speaking/attempts/:id — one attempt by id, for deep-linking
// straight to it (e.g. from Dashboard's "Bài nộp gần nhất" table) without
// the admin having to hunt it down in the paginated/filtered history list
// first. Same doc shape /speaking/history's rows already have, so the
// frontend's existing AttemptModal needs no changes to render it.
router.get('/speaking/attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm' });
    const attempt = await SpeakingAttempt.findById(req.params.id).populate('userId', 'username email plan');
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm' });
    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
