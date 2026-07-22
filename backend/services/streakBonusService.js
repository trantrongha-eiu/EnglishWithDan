'use strict';

// Shared accuracy→streak-bonus tiering and daily cap, used by vocab
// practice, reading tests, and listening tests alike — all three feed the
// same per-user daily allowance so a student can't rack up more than +5
// "lửa" a day no matter which combination of activities they do.
const VocabActivity = require('../models/VocabActivity');

// Vietnam local day (UTC+7), stored as UTC midnight — same convention as
// User.js's own getVNDay/effectiveStreak.
function todayVNDate() {
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()));
}

// Accuracy → streak bonus tier: <80% = 0, 80-90% = 1, >=90% = 2.
function bonusForAccuracy(accuracy) {
  return accuracy >= 0.9 ? 2 : accuracy >= 0.8 ? 1 : 0;
}

// Daily streak-bonus cap (max 5/day, shared across vocab/reading/listening):
// reads how much bonus has already been granted today, then atomically
// reserves `rawBonus` more. Not fully race-proof under truly concurrent
// requests from the same user (read-then-write), but that's an accepted,
// low-stakes gap consistent with how this app already trusts client-reported
// session data elsewhere.
async function reserveDailyStreakBonus(userId, rawBonus) {
  const date = todayVNDate();
  const doc = await VocabActivity.findOneAndUpdate(
    { userId, date },
    { $setOnInsert: { userId, date } },
    { upsert: true, new: true }
  );
  const appliedBonus = Math.max(0, Math.min(rawBonus, 5 - (doc.streakBonusEarned || 0)));
  if (appliedBonus > 0) {
    await VocabActivity.updateOne({ _id: doc._id }, { $inc: { streakBonusEarned: appliedBonus } });
  }
  return appliedBonus;
}

module.exports = { todayVNDate, bonusForAccuracy, reserveDailyStreakBonus };
