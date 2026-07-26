/**
 * backend/middleware/dailyLimit.js
 * Gates a route behind a per-day usage quota for free-plan users — premium/
 * admin/teacher bypass entirely (mirrors requirePremium's role check).
 * Must run after `auth` (needs req.user already loaded — auth.js loads the
 * full document minus password, so req.user.freeUsage is already there,
 * no extra query needed here).
 *
 * Unlike requirePremium (hard lock), this lets free users use a feature a
 * limited number of times per day, then blocks with the same
 * 403 + requiresPremium response shape so the frontend can reuse its
 * upgrade-prompt UI, just with a distinct `code` so the message can say
 * "hết lượt hôm nay" instead of "cần nâng cấp".
 *
 * Currently only used for Writing (writingExam/writingPractice) — Reading
 * and Listening practice were considered too, but turned out to already be
 * a hard premium lock at the frontend (hasPremiumAccess() pre-check before
 * ever calling the API), so a daily quota there would have relaxed access
 * rather than restricted it. Kept as a general-purpose factory in case that
 * decision changes later.
 *
 * Counts live on User.freeUsage (see models/User.js) keyed by `feature`,
 * reset whenever the stored date no longer matches "today" in Vietnam time
 * (getVNDay — same day-boundary convention as the streak system). Two
 * concurrent requests from the same user in the same instant could in
 * theory both read the pre-increment count — acceptable here (worst case a
 * free user gets one extra use), not worth a transaction for a soft quota.
 */
const User = require('../models/User');
const { getVNDay } = require('../utils/streak');

function dailyLimit(feature, limit, message) {
  return async (req, res, next) => {
    if (req.user.plan === 'premium' || ['admin', 'teacher'].includes(req.user.role)) return next();

    try {
      const today = getVNDay(new Date());
      const usage = req.user.freeUsage || {};
      const isNewDay = !usage.date || getVNDay(new Date(usage.date)).getTime() !== today.getTime();
      const currentCount = isNewDay ? 0 : (usage[feature] || 0);

      if (currentCount >= limit) {
        return res.status(403).json({
          success: false,
          message: message || `Bạn đã dùng hết ${limit} lượt miễn phí hôm nay cho tính năng này. Nâng cấp Premium để dùng không giới hạn, hoặc quay lại vào ngày mai.`,
          code: 'DAILY_LIMIT_REACHED',
          requiresPremium: true,
          limit,
          remaining: 0,
        });
      }

      const update = isNewDay
        ? { $set: { freeUsage: { date: today, [feature]: 1 } } }
        : { $set: { [`freeUsage.${feature}`]: currentCount + 1, 'freeUsage.date': today } };
      await User.updateOne({ _id: req.user._id }, update);

      next();
    } catch (err) {
      // A quota-tracking failure must never block a request that would
      // otherwise succeed — fail open, same philosophy as the catch below.
      console.error('[dailyLimit] tracking error:', err.message);
      next();
    }
  };
}

module.exports = dailyLimit;
