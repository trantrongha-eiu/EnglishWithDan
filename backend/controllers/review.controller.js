'use strict';

const reviewService = require('../services/reviewService');
const { TAXONOMY } = require('../constants/errorTaxonomy');

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
  res.json({ success: true, taxonomy: TAXONOMY[skill] });
});

exports.getPending = guard(null, async (req, res) => {
  const { skill } = req.query;
  if (!validSkill(skill)) return res.status(400).json({ success: false, message: 'Thiếu hoặc sai tham số skill' });
  const pending = await reviewService.getPendingReview(req.user._id, skill);
  res.json({ success: true, pending: pending || null });
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
  res.json({ success: true, review: result.review, reviewCompleted: result.reviewCompleted, summary: result.summary });
});

exports.getHistory = guard(null, async (req, res) => {
  const { attemptType, from, to, page, limit } = req.query;
  const result = await reviewService.getReviewHistory(req.user._id, { attemptType, from, to, page, limit });
  res.json({ success: true, ...result });
});
