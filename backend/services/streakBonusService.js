'use strict';

// Shared accuracy→streak-bonus tiering and daily cap, used by vocab
// practice, reading tests, and listening tests alike — all three feed the
// same per-user daily allowance so a student can't rack up more than +5
// "lửa" a day no matter which combination of activities they do.
const VocabActivity = require('../models/VocabActivity');
const User = require('../models/User');

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

// Minimum words a student must engage with (added + status-updated +
// answered in practice, summed over the whole Vietnam calendar day) before
// that day counts as "đã học" for streak purposes. Added because adding a
// single throwaway word — or flipping one word's status — used to be enough
// to claim a full day's streak on its own, which several students were
// farming daily for zero real study.
//
// The target now scales with the student's self-set IELTS target band
// (User.targetBand). Anchors the product asked for: 5.0 → 35, 6.0 → 50,
// 7.0 → 70; the .5 steps are filled in between. No target band set → 35
// (VOCAB_STREAK_WORD_THRESHOLD, kept as the floor + back-compat export).
const VOCAB_STREAK_WORD_THRESHOLD = 35;

function dailyWordTargetForBand(band) {
  const b = Number(band);
  if (!b || b < 5.5) return 35;
  if (b < 6.0) return 40;   // 5.5
  if (b < 6.5) return 50;   // 6.0
  if (b < 7.0) return 60;   // 6.5
  if (b < 7.5) return 70;   // 7.0
  return 80;                // 7.5+
}

// Today's per-student word target — one small User read.
async function dailyWordTarget(userId) {
  const u = await User.findById(userId).select('targetBand').lean();
  return dailyWordTargetForBand(u && u.targetBand);
}

// How many vocab words the student has engaged with so far today (VN day),
// without incrementing anything. Used by the daily-goal reminder endpoint.
async function vocabStudiedToday(userId) {
  const doc = await VocabActivity.findOne({ userId, date: todayVNDate() })
    .select('wordsAdded wordsStudied').lean();
  return (doc && ((doc.wordsAdded || 0) + (doc.wordsStudied || 0))) || 0;
}

// Increments today's word-engagement counters and reports whether today's
// running total has reached the student's personal target — true both on
// the call that first crosses it and on every qualifying call afterward
// the same day, so callers can gate `user.updateStreak()` behind this
// without separately tracking "did we already unlock today". `wordsInc` is
// a partial $inc object using VocabActivity's own field names, e.g.
// { wordsAdded: 1 } or { wordsStudied: wordsAnswered }.
async function reachedDailyWordThreshold(userId, wordsInc) {
  const date = todayVNDate();
  const [doc, target] = await Promise.all([
    VocabActivity.findOneAndUpdate(
      { userId, date },
      { $inc: wordsInc },
      { upsert: true, new: true }
    ),
    dailyWordTarget(userId),
  ]);
  return (doc.wordsAdded || 0) + (doc.wordsStudied || 0) >= target;
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

module.exports = {
  todayVNDate, bonusForAccuracy, reserveDailyStreakBonus,
  reachedDailyWordThreshold, VOCAB_STREAK_WORD_THRESHOLD,
  dailyWordTargetForBand, dailyWordTarget, vocabStudiedToday,
};
