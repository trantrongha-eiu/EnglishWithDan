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

module.exports = { getVNDay, effectiveStreak };
