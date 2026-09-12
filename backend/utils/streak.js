// Streak helpers shared between User.js's own instance methods (which write
// to the DB) and read-only call sites (admin lists, leaderboard) that need
// the same Vietnam-timezone "is this streak still alive" logic without
// touching/saving a document for every user they look at.

// Trả về ngày theo giờ Việt Nam (UTC+7), lưu dưới dạng UTC midnight —
// same convention as User.js's own getVNDay.
function getVNDay(date) {
  const d = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Tính streak hiển thị đúng dựa trên lastActivityDate (không ghi DB).
// Same logic as User.resetIfStale(), read-only.
function effectiveStreak(learningStreak, lastActivityDate) {
  if (!lastActivityDate) return learningStreak || 0;
  const today = getVNDay(new Date());
  const lastDay = getVNDay(new Date(lastActivityDate));
  const diff = Math.floor((today - lastDay) / 86400000);
  return diff >= 2 ? 0 : (learningStreak || 0);
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
function applyStreakActivity(User, userId, bonus = 1, { allowSameDayStack = false } = {}) {
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
        },
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
                { case: { $eq: ['$_diffDays', -1] }, then: bonus },
                { case: { $eq: ['$_diffDays', 0] }, then: { $add: ['$learningStreak', stackBonus] } },
                { case: { $eq: ['$_diffDays', 1] }, then: { $add: ['$learningStreak', bonus] } },
              ],
              default: bonus, // diff >= 2 — chain restarts with today's bonus
            },
          },
          lastActivityDate: todayVN,
        },
      },
      { $unset: '_diffDays' },
    ],
    { new: true, updatePipeline: true },
  );
}

module.exports = { getVNDay, effectiveStreak, applyStreakActivity };
