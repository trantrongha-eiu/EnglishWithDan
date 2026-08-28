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
 * The full 4-skill mock test (see mockTestService) is a sit-down exam of
 * its own and must not be blocked by an unrelated pile-up of ordinary
 * per-mistake reviews. The exemption is NOT taken on the client's word:
 * `?purpose=mocktest` is only a hint that lets us skip the DB check on
 * every normal /start call — the actual authorisation is
 * mockTestService.hasActiveMockStep(), which confirms server-side that
 * THIS user owns an in-progress MockTestAttempt currently sitting on THIS
 * skill's step. A student who just appends the query string, or replays a
 * finished run, or points at someone else's run, still gets gated.
 *
 * Dictation has its own review-gate-free route now
 * (GET /api/listening/dictation/section/:id) — it no longer rides this
 * middleware with a `?purpose=dictation` opt-out.
 */
const reviewService = require('../services/reviewService');
const mockTestService = require('../services/mockTestService');

function requireReviewComplete(skill) {
  return async (req, res, next) => {
    if (req.query.purpose === 'mocktest'
        && await mockTestService.hasActiveMockStep(req.user._id, skill)) {
      return next();
    }
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
