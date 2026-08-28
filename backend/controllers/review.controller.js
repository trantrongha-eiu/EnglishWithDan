'use strict';

const reviewService = require('../services/reviewService');
const { TAXONOMY, CATEGORIES_BY_TYPE } = require('../constants/errorTaxonomy');

function guard(logTag, handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(logTag || '[review]', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

function validSkill(skill) {
  return skill === 'reading' || skill === 'listening';
}

exports.getTaxonomy = guard(null, async (req, res) => {
  const { skill } = req.query;
  if (!validSkill(skill)) return res.status(400).json({ success: false, message: 'Thiếu hoặc sai tham số skill' });
  // categoriesByType lets the frontend narrow the category picker to what's
  // actually relevant for the mistake's own question type (audit finding —
  // previously every category was shown regardless of type, letting a
  // Completion question get tagged "Matching Headings").
  res.json({ success: true, taxonomy: TAXONOMY[skill], categoriesByType: CATEGORIES_BY_TYPE[skill] });
});

exports.getPending = guard(null, async (req, res) => {
  const { skill } = req.query;
  if (!validSkill(skill)) return res.status(400).json({ success: false, message: 'Thiếu hoặc sai tham số skill' });
  const { items, count } = await reviewService.getPendingReviews(req.user._id, skill);
  // `pending` (the oldest doc, or null) is kept for back-compat with
  // existing callers that only ever cared about "is there anything to
  // review" — `count`/`items`/`blocked` are additive, for the redesigned
  // "up to 2 is fine, 3+ blocks" gate.
  res.json({
    success: true,
    pending: items[0] || null,
    count,
    items,
    blocked: count >= reviewService.MAX_PENDING_REVIEWS,
  });
});

exports.getDetail = guard(null, async (req, res) => {
  const review = await reviewService.getReviewDetail(req.params.id, req.user._id);
  if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy review' });
  res.json({ success: true, review });
});

exports.getByAttempt = guard(null, async (req, res) => {
  const { attemptType, attemptId } = req.params;
  const review = await reviewService.getReviewByAttempt(attemptType, attemptId, req.user._id);
  res.json({ success: true, review: review || null });
});

exports.updateMistake = guard('[Review updateMistake]', async (req, res) => {
  const { id, mistakeId } = req.params;
  const result = await reviewService.updateMistake(id, mistakeId, req.user._id, req.body || {});
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy mục cần review' });
  if (result.status === 'invalid_taxonomy') return res.status(400).json({ success: false, message: 'Lý do sai không hợp lệ' });
  if (result.status === 'invalid_confidence') return res.status(400).json({ success: false, message: 'Mức độ tự tin không hợp lệ' });
  if (result.status === 'invalid_learning_point') return res.status(400).json({ success: false, message: 'Learning point không hợp lệ' });
  if (result.status === 'field_too_long') return res.status(400).json({ success: false, message: `Nội dung "${result.field}" quá dài (tối đa ${result.max} ký tự)` });
  res.json({ success: true, review: result.review, reviewCompleted: result.reviewCompleted, summary: result.summary });
});

exports.getHistory = guard(null, async (req, res) => {
  const { attemptType, from, to, page, limit } = req.query;
  const result = await reviewService.getReviewHistory(req.user._id, { attemptType, from, to, page, limit });
  res.json({ success: true, ...result });
});

// POST /api/review/bypass  { code } — redeem an admin bypass code to skip
// the mandatory-review gate. Marks all the student's pending reviews
// 'bypassed'.
exports.redeemBypass = guard('[Review redeemBypass]', async (req, res) => {
  const result = await reviewService.redeemBypassCode(req.user._id, (req.body || {}).code);
  if (result.status === 'not_found') {
    return res.status(404).json({ success: false, message: 'Mã không tồn tại.' });
  }
  if (result.status === 'not_redeemable') {
    return res.status(400).json({ success: false, message: 'Mã đã hết lượt dùng, hết hạn hoặc đã bị khoá.' });
  }
  if (result.status === 'already_used') {
    return res.status(400).json({ success: false, message: 'Bạn đã dùng mã này rồi.' });
  }
  if (result.status === 'nothing_pending') {
    return res.json({ success: true, cleared: 0, message: 'Bạn không có bài nào đang chờ Review.' });
  }
  res.json({ success: true, cleared: result.cleared, message: `Đã bỏ qua ${result.cleared} bài chờ Review.` });
});
