/**
 * backend/middleware/requireReviewComplete.js
 * Blocks starting a NEW Reading/Listening test/practice while the student
 * has an unfinished mandatory review from a previous wrong-containing
 * attempt of that same skill (see backend/services/reviewService.js).
 * Mirrors requirePremium.js's exact shape/response convention.
 * Must be used after middleware `auth` (needs req.user).
 *
 * `dictation.html` reuses the same GET /listening/practice/by-id/:id route
 * as Listening practice to fetch a section's content, but dictation is an
 * ungraded, non-attempt-tracked feature this gate must never block — its
 * fetch call passes ?purpose=dictation to opt out.
 */
const reviewService = require('../services/reviewService');

function requireReviewComplete(skill) {
  return async (req, res, next) => {
    if (skill === 'listening' && req.query.purpose === 'dictation') return next();
    const pending = await reviewService.getPendingReview(req.user._id, skill);
    if (!pending) return next();
    return res.status(403).json({
      success: false,
      code: 'REVIEW_REQUIRED',
      message: 'Bạn cần hoàn thành review bài trước đó trước khi bắt đầu bài mới.',
      reviewId: pending._id,
      attemptType: pending.attemptType,
      attemptId: pending.attemptId,
    });
  };
}

module.exports = requireReviewComplete;
