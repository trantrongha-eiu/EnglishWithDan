/**
 * backend/middleware/requireReviewComplete.js
 * Blocks starting a NEW Reading/Listening test/practice once the student
 * has MAX_PENDING_REVIEWS or more unfinished mandatory reviews from
 * previous wrong-containing attempts of that same skill (see
 * backend/services/reviewService.js) — below that, practicing is still
 * allowed, this is a nudge, not a hard stop, until it piles up.
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
    // The full 4-skill mock test (see mockTestService) is a sit-down exam of
    // its own — it must not be blocked by an unrelated pile-up of pending
    // per-mistake reviews from ordinary practice. Same opt-out shape as
    // dictation above; requirePremium still applies on these routes.
    if (req.query.purpose === 'mocktest') return next();
    const { items, count } = await reviewService.getPendingReviews(req.user._id, skill);
    if (count < reviewService.MAX_PENDING_REVIEWS) return next();
    return res.status(403).json({
      success: false,
      code: 'REVIEW_REQUIRED',
      message: `Bạn có ${count} bài đang chờ Review. Hãy hoàn thành ít nhất 1 bài trước khi bắt đầu bài mới.`,
      count,
      items: items.map(r => ({ _id: r._id, attemptType: r.attemptType, attemptId: r.attemptId, mistakeCount: r.mistakes.length })),
      // Back-compat for any caller still reading the old singular shape —
      // the oldest pending review, same as before.
      reviewId: items[0]._id,
      attemptType: items[0].attemptType,
      attemptId: items[0].attemptId,
    });
  };
}

module.exports = requireReviewComplete;
