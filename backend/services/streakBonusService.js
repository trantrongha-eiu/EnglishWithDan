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
// reads how much bonus has already been granted today, then reserves
// `rawBonus` more via an optimistic compare-and-swap — the increment only
// commits if streakBonusEarned still matches the value we just read, so two
// concurrent requests from the same user (e.g. finishing a reading test and
// a listening test within the same second) can't both read the same "4 of 5
// used" snapshot and each independently push it to 5, overshooting the cap
// to 6. A losing request simply retries against the fresh value instead.
async function reserveDailyStreakBonus(userId, rawBonus, _retries = 5) {
  if (rawBonus <= 0) return 0;
  const date = todayVNDate();

  try {
    await VocabActivity.updateOne(
      { userId, date },
      { $setOnInsert: { userId, date } },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err; // duplicate key = a concurrent upsert already created it
  }

  for (let i = 0; i < _retries; i++) {
    const doc = await VocabActivity.findOne({ userId, date }).select('streakBonusEarned').lean();
    const prevEarned = doc?.streakBonusEarned || 0;
    const appliedBonus = Math.max(0, Math.min(rawBonus, 5 - prevEarned));
    if (appliedBonus === 0) return 0;

    const result = await VocabActivity.updateOne(
      { userId, date, streakBonusEarned: prevEarned },
      { $inc: { streakBonusEarned: appliedBonus } }
    );
    if (result.modifiedCount === 1) return appliedBonus;
    // Another request updated streakBonusEarned between our read and write — retry with fresh data.
  }
  // Only reachable under sustained concurrent contention from the same user;
  // treat as "no room left" rather than risk over-granting.
  return 0;
}

module.exports = { todayVNDate, bonusForAccuracy, reserveDailyStreakBonus };
