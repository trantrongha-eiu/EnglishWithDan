'use strict';
// Extracted from backend/routes/admin.js — Speaking Questions, Speaking Materials (PDF), and Speaking History sections.

const express    = require('express');
const auth       = require('../../middleware/auth');
const { teacherOnly, adminOnly, uploadPdf, uploadPdfBuffer } = require('./_shared');

const SpeakingQuestion = require('../../models/SpeakingQuestion');
const SpeakingMaterial = require('../../models/SpeakingMaterial');
const SpeakingAttempt  = require('../../models/SpeakingAttempt');
const User             = require('../../models/User');
const { parseSpeakingText } = require('../../services/speakingImportParser');

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

// ── Import: paste "EnglishWithDan Speaking Format", parse + upsert ──
// Mirrors the Vocabulary Lessons import flow. Format documented in
// services/speakingImportParser.js. Nothing is saved until /import.

const normQ = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

// Cross-check a valid parse against what's already in the question bank and
// append non-blocking warnings: a topic name that already exists (import
// will merge into it), an identical { part, question } that already lives
// under a DIFFERENT topic (likely an accidental duplicate). Exact
// same-topic matches are covered by the topic-level warning, so they're not
// repeated per question.
async function warnAboutExisting(parsed) {
  if (!parsed.valid || !parsed.topics.length) return parsed;
  const existing = await SpeakingQuestion
    .find({ isActive: { $ne: false } })
    .select('topic part question')
    .lean();

  const topicCount = new Map();               // topicLc -> # existing questions
  const topicOriginal = new Map();            // topicLc -> original-cased name
  const qToTopics = new Map();                // "part|normQ" -> Set(topicLc)
  for (const e of existing) {
    const tLc = String(e.topic || '').trim().toLowerCase();
    topicCount.set(tLc, (topicCount.get(tLc) || 0) + 1);
    if (!topicOriginal.has(tLc)) topicOriginal.set(tLc, e.topic);
    const k = `${e.part}|${normQ(e.question)}`;
    if (!qToTopics.has(k)) qToTopics.set(k, new Set());
    qToTopics.get(k).add(tLc);
  }

  const warnings = parsed.warnings.slice();
  for (const t of parsed.topics) {
    const tLc = t.topic.trim().toLowerCase();
    const topicExists = topicCount.has(tLc);
    if (topicExists) {
      warnings.push(`Topic "${t.topic}": đã có sẵn trên web (${topicCount.get(tLc)} câu) — import sẽ cập nhật / bổ sung vào topic này`);
    }
    const parts = [
      ...t.part1.map(q => [1, q]),
      ...(t.part2 ? [[2, t.part2.question]] : []),
      ...t.part3.map(q => [3, q]),
    ];
    for (const [part, q] of parts) {
      const owners = qToTopics.get(`${part}|${normQ(q)}`);
      if (!owners) continue;
      const others = [...owners].filter(o => o !== tLc);
      if (others.length) {
        warnings.push(`Part ${part} — "${q.slice(0, 60)}${q.length > 60 ? '…' : ''}": câu hỏi này đã tồn tại ở topic khác ("${topicOriginal.get(others[0])}")`);
      } else if (!topicExists) {
        // same question, same topic name, but the topic-level warning above
        // didn't fire (shouldn't really happen) — flag it anyway.
        warnings.push(`Part ${part} — "${q.slice(0, 60)}${q.length > 60 ? '…' : ''}": đã tồn tại, import sẽ cập nhật (không tạo câu mới)`);
      }
    }
  }
  return { ...parsed, warnings };
}

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
// Upsert keyed on { topic, part, question } (same key as
// scripts/seedSpeakingQuestions.js): re-importing the same quarter updates
// cue cards and revives any question that was soft-deleted, and never
// clobbers a sampleAnswer that Gemini/a bulk script generated later.
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
    const ops = parsed.questionDocs.map(d => ({
      updateOne: {
        filter: { topic: d.topic, part: d.part, question: d.question },
        update: {
          $set: { topic: d.topic, part: d.part, question: d.question, cueCard: d.cueCard || '', isActive: true },
        },
        upsert: true,
      },
    }));
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
