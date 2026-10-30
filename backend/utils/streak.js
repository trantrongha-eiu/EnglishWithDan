// Streak helpers shared between User.js's own instance methods (which write
// to the DB) and read-only call sites (admin lists, leaderboard) that need
// the same Vietnam-timezone "is this streak still alive" logic without
// touching/saving a document for every user they look at.

const { HOPE_MULTIPLIER } = require('../constants/shop');

// Trả về ngày theo giờ Việt Nam (UTC+7), lưu dưới dạng UTC midnight —
// same convention as User.js's own getVNDay.
function getVNDay(date) {
  const d = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Tính streak hiển thị đúng dựa trên lastActivityDate (không ghi DB).
// Same logic as User.resetIfStale(), read-only. `iceShields` (Khiên Băng,
// constants/shop.js) each cover one missed day — a streak whose gap the
// student's shields can still cover is shown alive, matching what
// coverMissedDaysWithShields() will do on their next visit/activity.
function effectiveStreak(learningStreak, lastActivityDate, iceShields = 0) {
  if (!lastActivityDate) return learningStreak || 0;
  const today = getVNDay(new Date());
  const lastDay = getVNDay(new Date(lastActivityDate));
  const diff = Math.floor((today - lastDay) / 86400000);
  return (diff >= 2 && diff - 1 > (iceShields || 0)) ? 0 : (learningStreak || 0);
}

// Khiên Băng: if the student missed N whole days (diff = N+1) and holds at
// least N shields, spend N of them and pull lastActivityDate up to
// yesterday — the streak survives, and studying today continues it as
// usual. Must run before anything that would otherwise treat the gap as a
// lost streak (applyStreakActivity below, userService.getStats's
// resetIfStale). Guarded on the exact lastActivityDate/shield count read,
// so two concurrent callers can't both spend shields for the same gap.
// Returns how many shields were used.
async function coverMissedDaysWithShields(User, userId) {
  const u = await User.findById(userId).select('learningStreak lastActivityDate shopItems').lean();
  if (!u || !u.lastActivityDate || !(u.learningStreak > 0)) return 0;
  const shields = (u.shopItems && u.shopItems.iceShield) || 0;
  if (!shields) return 0;
  const today = getVNDay(new Date());
  const missed = Math.floor((today - getVNDay(new Date(u.lastActivityDate))) / 86400000) - 1;
  if (missed < 1 || missed > shields) return 0;
  const res = await User.updateOne(
    { _id: userId, lastActivityDate: u.lastActivityDate, 'shopItems.iceShield': { $gte: missed } },
    { $set: { lastActivityDate: new Date(today.getTime() - 86400000) }, $inc: { 'shopItems.iceShield': -missed } }
  );
  return res.modifiedCount === 1 ? missed : 0;
}

// Atomic, race-safe replacement for the old "user.updateStreak(bonus, opts);
// await user.save()" pattern every activity-recording service used to call.
//
// The bug this fixes: that pattern reads the User doc once at the top of a
// request, mutates the in-memory copy, then saves it back later. Two
// qualifying activities finishing close together (e.g. a vocab session and
// a Reading test in the same minute — very normal) each load their OWN
// snapshot of the user, compute their OWN new streak fields from THAT
// snapshot, and save independently; whichever save lands in Mongo last wins
// and silently overwrites the other's update — including its advanced
// lastActivityDate. Confirmed happening in production: a student's real
// vocab activity moved lastActivityDate forward a day, but a losing
// concurrent save reverted it, so lastActivityDate was stuck 2+ VN-days
// behind the very next time resetIfStale() ran — a legitimate diff>=2 by
// the (corrupted) stored data, even though the student had genuinely
// studied every single day. Exactly the "chưa hết ngày mà đã mất streak"
// reports.
//
// Fix: do the whole read-and-conditionally-update as ONE MongoDB update
// pipeline (aggregation expressions computed server-side from whatever the
// CURRENT stored value is), so there is no read-modify-write gap at all —
// concurrent calls are simply serialized by MongoDB itself, and every one
// of them sees the true latest state. Same day/diff/bonus semantics as
// User.updateStreak() — see that method's comments for the day-chain rules.
// Default bonus is 1 (flat credit), matching User.updateStreak()'s own
// default — callers like speaking/writing/completeGoogleLogin call this
// with no bonus argument at all, relying on that default.
//
// Cửa hàng lửa: whatever this call credits to learningStreak is credited to
// flameWallet too (the separate "ví lửa" the shop spends), and while a Búa
// Hi Vọng is in play for today (hopeHammerDay === today) the credit is
// doubled and the base amount is tallied into hopeHammerBase for the
// end-of-day quota check (services/shopService.js settleHopeHammer).
async function applyStreakActivity(User, userId, bonus = 1, { allowSameDayStack = false } = {}) {
  await coverMissedDaysWithShields(User, userId).catch(() => 0);
  const todayVN = getVNDay(new Date());
  const stackBonus = (allowSameDayStack && bonus > 0) ? bonus : 0;
  // Re-bucket $lastActivityDate through the exact same "+07:00, truncate to
  // the calendar day" rule as getVNDay() — expressed with $dateFromParts so
  // the RESULT lands on the same UTC-midnight-of-the-VN-day convention
  // getVNDay() itself produces (NOT $dateTrunc's "day start AT +07:00", a
  // different, 7-hours-shifted representation that would silently break
  // every other reader of this field). Defensive the same way
  // getVNDay(new Date(this.lastActivityDate)) is in the JS version: a
  // stored value doesn't have to already be perfectly midnight-bucketed for
  // the diff to come out right.
  const vnDayOf = (dateExpr) => ({
    $dateFromParts: {
      year: { $year: { date: dateExpr, timezone: '+07:00' } },
      month: { $month: { date: dateExpr, timezone: '+07:00' } },
      day: { $dayOfMonth: { date: dateExpr, timezone: '+07:00' } },
    },
  });
  return User.findOneAndUpdate(
    { _id: userId },
    [
      {
        $set: {
          _diffDays: {
            $cond: [
              { $eq: ['$lastActivityDate', null] },
              -1, // sentinel: first-ever qualifying activity
              { $floor: { $divide: [{ $subtract: [todayVN, vnDayOf('$lastActivityDate')] }, 86400000] } },
            ],
          },
          _hopeOn: { $eq: ['$hopeHammerDay', todayVN] },
        },
      },
      {
        // Base credit for this call: a same-day repeat only adds when
        // stacking is allowed; every other case (first ever, next day,
        // restart after a gap) adds `bonus`.
        $set: { _base: { $cond: [{ $eq: ['$_diffDays', 0] }, stackBonus, bonus] } },
      },
      {
        $set: { _gain: { $multiply: ['$_base', { $cond: ['$_hopeOn', HOPE_MULTIPLIER, 1] }] } },
      },
      {
        $set: {
          // A genuine gap (>=2 VN-days) with a live streak snapshots it into
          // previousStreak/streakLostAt before restarting the chain — same
          // as updateStreak()'s else-branch. Any other case clears
          // previousStreak to 0 (ends the "just lost a streak" mascot
          // state the instant the student studies again) and leaves
          // streakLostAt untouched, matching updateStreak()'s unconditional
          // `this.previousStreak = 0` at the top of that method.
          previousStreak: {
            $cond: [{ $and: [{ $gte: ['$_diffDays', 2] }, { $gt: ['$learningStreak', 0] }] }, '$learningStreak', 0],
          },
          streakLostAt: {
            $cond: [{ $and: [{ $gte: ['$_diffDays', 2] }, { $gt: ['$learningStreak', 0] }] }, todayVN, '$streakLostAt'],
          },
          learningStreak: {
            $switch: {
              branches: [
                { case: { $eq: ['$_diffDays', -1] }, then: '$_gain' },
                { case: { $eq: ['$_diffDays', 0] }, then: { $add: ['$learningStreak', '$_gain'] } },
                { case: { $eq: ['$_diffDays', 1] }, then: { $add: ['$learningStreak', '$_gain'] } },
              ],
              default: '$_gain', // diff >= 2 — chain restarts with today's bonus
            },
          },
          lastActivityDate: todayVN,
          flameWallet: { $add: [{ $ifNull: ['$flameWallet', 0] }, '$_gain'] },
          hopeHammerBase: {
            $cond: ['$_hopeOn', { $add: [{ $ifNull: ['$hopeHammerBase', 0] }, '$_base'] }, { $ifNull: ['$hopeHammerBase', 0] }],
          },
        },
      },
      { $unset: ['_diffDays', '_hopeOn', '_base', '_gain'] },
    ],
    { new: true, updatePipeline: true },
  );
}

// Practice that earns no 🔥 of its own (most practice now earns some via
// streakBonusService.awardPracticeFlames; this covers the leftovers, e.g. a
// drill too short to score) still means the student studied today, so it
// keeps the day-chain alive (bonus 0: lastActivityDate moves to today, the
// count doesn't grow — same as a low-accuracy vocab/test session). Before this, a day
// spent only on these (often the class homework) didn't count at all, and
// the next day the streak was gone: the "có học mà vẫn mất chuỗi" reports.
// Students only; best-effort — never fails the save that called it.
// Dictation / Shadowing save per sentence count, so they only keep the
// chain alive once a save covers at least this many sentences.
const MIN_STREAK_SENTENCES = 5;

async function keepStreakAlive(userId) {
  try {
    const User = require('../models/User'); // lazy: models/User ↔ utils
    const u = await User.findById(userId).select('role').lean();
    if (!u || u.role !== 'student') return null;
    return await applyStreakActivity(User, userId, 0, { allowSameDayStack: true });
  } catch (err) {
    console.error('[streak] keepStreakAlive failed:', err.message);
    return null;
  }
}

module.exports = { getVNDay, effectiveStreak, applyStreakActivity, coverMissedDaysWithShields, keepStreakAlive, MIN_STREAK_SENTENCES };
