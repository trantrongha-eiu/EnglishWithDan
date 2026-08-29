/**
 * backend/middleware/requireRewriteComplete.js
 * Blocks submitting a NEW Writing essay once the student has
 * MAX_PENDING_REWRITES or more graded ('confirmed') essays that still
 * haven't been rewritten by hand (see writingService.getPendingRewrites +
 * frontend screen-rewrite). Below that it's a nudge, not a hard stop.
 *
 * Same shape/convention as requireReviewComplete.js (reading/listening).
 * Must run after `auth` (needs req.user).
 *
 * The full 4-skill mock test's Writing step must never be blocked by an
 * unrelated pile-up of rewrites — exempted server-side via
 * mockTestService.hasActiveMockStep (not on the client's word).
 *
 * An admin-issued ReviewBypassCode also clears rewrites (same code the
 * reading/listening review gate uses) — see reviewService.redeemBypassCode,
 * which marks the pending rewrites `rewrite.bypassed`.
 */
const writingService = require('../services/writingService');
const mockTestService = require('../services/mockTestService');

async function requireRewriteComplete(req, res, next) {
  if (await mockTestService.hasActiveMockStep(req.user._id, 'writing')) return next();

  const { count, items } = await writingService.getPendingRewrites(req.user._id);
  if (count < writingService.MAX_PENDING_REWRITES) return next();

  return res.status(403).json({
    success: false,
    code: 'REWRITE_REQUIRED',
    message: `Bạn có ${count} bài Writing đã được chấm nhưng chưa viết lại. Hãy viết lại (rewrite) ít nhất 1 bài trước khi nộp bài mới.`,
    count,
    items,
  });
}

module.exports = requireRewriteComplete;
