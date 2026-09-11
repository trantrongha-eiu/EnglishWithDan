'use strict';

// Preserves routes/vocab.js's original response shapes exactly — note the
// two public routes (listUnits, getUnit) return a bare array/object with
// no {success} wrapper at all, unlike every admin route in this file;
// that's the original API contract, not an oversight.
const vocabService = require('../services/vocabService');
const paraphraseSrsService = require('../services/paraphraseSrsService');

exports.listUnits = async (req, res) => {
  try {
    // Auth-gated but not personalized (same active units for every user) —
    // cache briefly per-client.
    res.set('Cache-Control', 'private, max-age=120');
    const units = await vocabService.listUnits();
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: 'Cannot load units' });
  }
};

exports.getUnit = async (req, res) => {
  try {
    const unit = await vocabService.getUnitByNumber(Number(req.params.number));
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: 'Cannot load unit' });
  }
};

// ── Paraphrase spaced-repetition (per student) ─────────────────────────────
// Study "cards" view + a cross-unit "Ôn Paraphrase" due-review queue, using
// the same Leitner scheduler as the notebook words.

// POST /api/vocab/paraphrase/review  { unitId, word, paraphrase, meaning,
//   explanation, rating }  → updated SRS box + next review date.
exports.reviewParaphrase = async (req, res) => {
  try {
    const { unitId, word, paraphrase, meaning, explanation, rating } = req.body || {};
    const result = await paraphraseSrsService.recordReview(
      req.user._id, unitId, { word, paraphrase, meaning, explanation }, rating
    );
    if (result.status === 'bad_rating') return res.status(400).json({ success: false, message: 'Mức đánh giá không hợp lệ' });
    if (result.status === 'bad_unit') return res.status(400).json({ success: false, message: 'Unit không hợp lệ' });
    if (result.status === 'bad_item') return res.status(400).json({ success: false, message: 'Thiếu nội dung paraphrase' });
    res.json({
      success: true,
      srsBox: result.srsBox,
      nextReviewAt: result.nextReviewAt,
      itemStatus: result.itemStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vocab/paraphrase/progress/:unitId  → { map, seen, mastered }
exports.paraphraseProgress = async (req, res) => {
  try {
    const data = await paraphraseSrsService.getUnitProgress(req.user._id, req.params.unitId);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vocab/paraphrase/due-count  → { count }. Auth only (cheap, no
// content) so the daily nudge can show it for every student; the frontend
// gates the review action itself on premium.
exports.paraphraseDueCount = async (req, res) => {
  try {
    const count = await paraphraseSrsService.countDue(req.user._id);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/vocab/paraphrase/review-queue  → { items }. Premium-gated: it
// returns the paraphrase answers, same access bar as /unit/:number.
exports.paraphraseReviewQueue = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 40;
    const items = await paraphraseSrsService.getDueQueue(req.user._id, limit);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.listAdminUnits = async (req, res) => {
  try {
    const units = await vocabService.listAdminUnits();
    res.json({ success: true, units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminUnit = async (req, res) => {
  try {
    const unit = await vocabService.getAdminUnit(req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const result = await vocabService.createUnit(req.body);
    if (result.status === 'duplicate') {
      return res.status(400).json({ success: false, message: `Unit ${req.body.unitNumber} đã tồn tại` });
    }
    res.status(201).json({ success: true, unit: result.unit, message: `Đã tạo Unit ${result.unit.unitNumber}: ${result.unit.title}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const unit = await vocabService.updateUnit(req.params.id, req.body);
    if (!unit) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, unit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    await vocabService.deleteUnit(req.params.id);
    res.json({ success: true, message: 'Đã xoá unit' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reorderUnits = async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'Body phải là array' });
    await vocabService.reorderUnits(items);
    res.json({ success: true, message: 'Đã cập nhật thứ tự' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addWord = async (req, res) => {
  try {
    const result = await vocabService.addWord(req.params.id, req.body);
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });
    if (result.status === 'duplicate') return res.json({ success: false, message: `"${result.word}" đã có trong unit này` });
    res.status(201).json({ success: true, message: `Đã thêm "${result.word}"`, wordCount: result.wordCount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateWord = async (req, res) => {
  try {
    const result = await vocabService.updateWord(req.params.id, req.params.wordIndex, req.body);
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });
    if (result.status === 'bad_index') return res.status(400).json({ success: false, message: 'Index không hợp lệ' });
    res.json({ success: true, word: result.word });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteWord = async (req, res) => {
  try {
    const result = await vocabService.deleteWord(req.params.id, req.params.wordIndex);
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });
    if (result.status === 'bad_index') return res.status(400).json({ success: false, message: 'Index không hợp lệ' });
    res.json({ success: true, message: `Đã xoá "${result.removed}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkAddWords = async (req, res) => {
  try {
    const { words = [], replace = false } = req.body;
    if (!Array.isArray(words) || !words.length) {
      return res.status(400).json({ success: false, message: 'Danh sách từ trống' });
    }
    const result = await vocabService.bulkAddWords(req.params.id, words, replace);
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });
    res.json({
      success: true,
      message: `Đã import ${replace ? words.length : 'mới'} từ vào Unit ${result.unitNumber}`,
      wordCount: result.wordCount
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.splitUnit = async (req, res) => {
  try {
    const { chunkSize = 100 } = req.body;
    const result = await vocabService.splitUnit(req.params.id, chunkSize);
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy unit' });
    if (result.status === 'too_small') {
      return res.status(400).json({ success: false, message: `Unit chỉ có ${result.wordCount} từ, không cần chia` });
    }
    res.json({ success: true, message: `Đã chia "${result.baseTitle}" thành ${result.parts} phần (tối đa ${chunkSize} từ/phần)`, parts: result.parts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.splitAllUnits = async (req, res) => {
  try {
    const { chunkSize = 120 } = req.body;
    const result = await vocabService.splitAllUnits(chunkSize);
    if (result.status === 'none') {
      return res.json({ success: true, message: `Không có unit nào vượt quá ${chunkSize} từ`, parts: 0 });
    }
    res.json({
      success: true,
      message: `Đã tách ${result.unitCount} unit lớn thành ${result.unitCount + result.totalCreated} unit (mỗi phần ≤${chunkSize} từ)`,
      results: result.results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importUnits = async (req, res) => {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];
    const replace = req.query.replace === 'true';
    const { created, updated, results } = await vocabService.importUnits(data, replace);
    res.json({ success: true, message: `Import xong: ${created} tạo mới, ${updated} cập nhật`, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
