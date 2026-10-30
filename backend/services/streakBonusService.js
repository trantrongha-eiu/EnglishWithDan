'use strict';

// Shared accuracy→🔥 tiering and the daily cap. Every practice that earns
// 🔥 (vocab, Reading/Listening tests and bài lẻ, gap-fill, dictation,
// shadowing, grammar, writing, speaking…) feeds the same per-user daily
// allowance, so a student can't rack up more than DAILY_STREAK_BONUS_CAP
// "lửa" a day no matter which combination of activities they do.
const VocabActivity = require('../models/VocabActivity');
const User = require('../models/User');
const { applyStreakActivity } = require('../utils/streak');

// Vietnam local day (UTC+7), stored as UTC midnight — same convention as
// User.js's own getVNDay/effectiveStreak.
function todayVNDate() {
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()));
}

// 🔥 per practice session, by accuracy (0..1):
//   Vocab:              >=70% → 1, >=80% → 2, >=90% → 3
//   Reading/Listening:  >=50% → 1, >=70% → 2, >=90% → 3 (full tests + bài lẻ)
//   Other short drills: >=70% → 1, >=90% → 2 (gap-fill, dictation, shadowing,
//                       grammar, Adv Sentence, Writing Task 1/2 drills…)
function vocabBonusForAccuracy(accuracy) {
  return accuracy >= 0.9 ? 3 : accuracy >= 0.8 ? 2 : accuracy >= 0.7 ? 1 : 0;
}
function testBonusForAccuracy(accuracy) {
  return accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;
}
function drillBonusForAccuracy(accuracy) {
  return accuracy >= 0.9 ? 2 : accuracy >= 0.7 ? 1 : 0;
}

// Minimum words a student must actually STUDY (answered in a book-quiz run,
// a Vocabulary Lesson quiz, or a manual "đã thuộc" status change), summed
// over the whole Vietnam calendar day, before that day counts as "đã học"
// for the daily-goal nudge and the streak.
//
// Only `wordsStudied` counts toward this — NOT `wordsAdded`. Merely saving
// new words into a book (however many) is not studying them, so it never
// advances the daily goal or keeps the streak alive on its own. `wordsAdded`
// is still recorded on VocabActivity for admin analytics + the profile
// heatmap ("did any vocab activity happen that day"), just not here.
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

// How many vocab words the student has actually STUDIED so far today (VN
// day), without incrementing anything. Used by the daily-goal reminder
// endpoint. Saving words to a book (`wordsAdded`) is deliberately excluded —
// see the threshold comment above.
async function vocabStudiedToday(userId) {
  const doc = await VocabActivity.findOne({ userId, date: todayVNDate() })
    .select('wordsStudied').lean();
  return (doc && doc.wordsStudied) || 0;
}

// Increments today's word counters and reports whether today's studied
// total has reached the student's personal target — true both on the call
// that first crosses it and on every qualifying call afterward the same
// day, so callers can gate `user.updateStreak()` behind this without
// separately tracking "did we already unlock today". `wordsInc` is a
// partial $inc object using VocabActivity's own field names, e.g.
// { wordsAdded: 1 } or { wordsStudied: wordsAnswered } — but only
// `wordsStudied` moves the needle here (an { wordsAdded } call still
// records the count, it just can't unlock the day by itself).
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
  return (doc.wordsStudied || 0) >= target;
}

const DAILY_STREAK_BONUS_CAP = 10;

// How much of today's cap is already used — read-only. The Búa Hi Vọng
// (shopService.useItem) checks it so a student can't place a bet that the
// cap already makes impossible to win.
async function streakBonusEarnedToday(userId) {
  const doc = await VocabActivity.findOne({ userId, date: todayVNDate() }).select('streakBonusEarned').lean();
  return (doc && doc.streakBonusEarned) || 0;
}

// Daily streak-bonus cap (DAILY_STREAK_BONUS_CAP/day, shared by every activity):
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
    const appliedBonus = Math.max(0, Math.min(rawBonus, DAILY_STREAK_BONUS_CAP - prevEarned));
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

// The one entry point for "a practice just finished, credit its 🔥".
// `key` names the thing practised (e.g. 'reading-practice:<passageId>');
// within one VN day the same key only ever earns up to `target` in total —
// redoing the same passage/lesson/test can top up to a better tier, but
// can't farm the same 🔥 again. Then the daily cap applies. Always advances
// the day-chain (bonus 0 still keeps the streak alive). Students only;
// best-effort — never throws into the save that called it.
// Returns { bonusApplied, streak } (streak null when nothing was written).
async function awardPracticeFlames(userId, key, target) {
  try {
    const u = await User.findById(userId).select('role').lean();
    if (!u || u.role !== 'student') return { bonusApplied: 0, streak: null };
    const applied = await reserveItemFlames(userId, String(key || ''), Math.max(0, Math.floor(target) || 0));
    const doc = await applyStreakActivity(User, userId, applied, { allowSameDayStack: true });
    return { bonusApplied: applied, streak: doc ? doc.learningStreak : null };
  } catch (err) {
    console.error('[streak] awardPracticeFlames failed:', err.message);
    return { bonusApplied: 0, streak: null };
  }
}

// Claims (target - already granted today for `key`) on the per-item tally
// with a compare-and-swap, then reserves that from the daily cap and hands
// back whatever the cap didn't allow — so two concurrent submits of the
// same item can't both claim the same top-up.
async function reserveItemFlames(userId, key, target, _retries = 5) {
  if (target <= 0) return 0;
  if (!key) return reserveDailyStreakBonus(userId, target);
  const date = todayVNDate();
  const safeKey = key.replace(/[.$]/g, '_');
  const path = `flameItems.${safeKey}`;
  try {
    await VocabActivity.updateOne({ userId, date }, { $setOnInsert: { userId, date } }, { upsert: true });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  for (let i = 0; i < _retries; i++) {
    const doc = await VocabActivity.findOne({ userId, date }).select('flameItems').lean();
    const granted = (doc && doc.flameItems && doc.flameItems[safeKey]) || 0;
    const raw = target - granted;
    if (raw <= 0) return 0;
    const claimed = await VocabActivity.updateOne(
      { userId, date, [path]: granted ? granted : { $in: [null, 0] } },
      { $set: { [path]: target } }
    );
    if (claimed.modifiedCount !== 1) continue;
    const applied = await reserveDailyStreakBonus(userId, raw);
    if (applied < raw) {
      await VocabActivity.updateOne({ userId, date }, { $inc: { [path]: applied - raw } });
    }
    return applied;
  }
  return 0;
}

module.exports = {
  todayVNDate, reserveDailyStreakBonus, awardPracticeFlames,
  vocabBonusForAccuracy, testBonusForAccuracy, drillBonusForAccuracy,
  DAILY_STREAK_BONUS_CAP, streakBonusEarnedToday,
  reachedDailyWordThreshold, VOCAB_STREAK_WORD_THRESHOLD,
  dailyWordTargetForBand, dailyWordTarget, vocabStudiedToday,
};
