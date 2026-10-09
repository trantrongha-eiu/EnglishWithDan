'use strict';

// "Tuần thứ mấy / buổi thứ mấy" of a class, for the student class card
// (GET /classes/my/overview) and the teacher Lớp pages (GET /classes,
// GET /classes/:id). Pure function over the class doc + its sessions so it
// can be unit-tested without a DB.
//
// Day math runs on calendar-day keys ("YYYY-MM-DD"), never on raw times:
//   - session.date / startDate / endDate are stored as UTC midnight of the
//     day the teacher picked (date inputs + generateSessions' UTC day keys),
//     so their toISOString() day key IS the intended calendar day;
//   - "today" is the Vietnam calendar day (UTC+7) — the school's day — so a
//     class on Tuesday reads as "hôm nay" from 00:00 ICT, not from 07:00.
//
// Numbering: "buổi thứ N" counts only REGULAR, not-cancelled sessions in date
// order — a cancelled session doesn't use up a slot of the course and a
// makeup session (học bù) is extra, not a new numbered lesson. This can differ
// from session.sessionNumber (which keeps cancelled/makeup rows in sequence),
// so both are returned.

const VN_OFFSET_MS = 7 * 3600 * 1000;
const DAY_MS = 864e5;

function dayKey(d) {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
}

function vnTodayKey(now = new Date()) {
  return new Date(now.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

// Whole days from key a to key b (b - a).
function diffDays(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}

function weekOf(startKey, key) {
  return Math.floor(diffDays(startKey, key) / 7) + 1;
}

function shapeSession(s, ordinal, startKey, classTime) {
  const key = dayKey(s.date);
  return {
    _id: s._id,
    sessionNumber: s.sessionNumber,
    ordinal: ordinal || null,
    date: s.date,
    dayKey: key,
    week: startKey && key ? weekOf(startKey, key) : null,
    topic: s.topic || '',
    startTime: s.startTime || classTime || '',
    autoMarked: !!s.autoMarkedAt,
    type: s.type || 'regular',
    status: s.status,
  };
}

/**
 * @param {object} cls       ClassGroup (lean or doc): startDate, endDate, totalSessions
 * @param {Array}  sessions  this class's ClassSession rows (any status)
 * @param {Date}   [now]
 */
function computeClassProgress(cls, sessions = [], now = new Date()) {
  const today = vnTodayKey(now);
  const live = sessions
    .filter((s) => s && s.status !== 'cancelled' && dayKey(s.date))
    .sort((a, b) => (dayKey(a.date) < dayKey(b.date) ? -1 : dayKey(a.date) > dayKey(b.date) ? 1 : a.sessionNumber - b.sessionNumber));
  const regular = live.filter((s) => (s.type || 'regular') === 'regular');
  const ordinalOf = new Map(regular.map((s, i) => [String(s._id), i + 1]));

  const startKey = dayKey(cls.startDate) || (live[0] && dayKey(live[0].date)) || null;
  const lastSessionKey = live.length ? dayKey(live[live.length - 1].date) : null;
  let endKey = dayKey(cls.endDate) || lastSessionKey;
  if (startKey && endKey && endKey < startKey) endKey = startKey;

  const shape = (s) => shapeSession(s, ordinalOf.get(String(s._id)), startKey, cls.startTime);

  // Sessions are done once their day has started (today's counts as the
  // current one) — matches "buổi hiện tại" the way students/teachers say it.
  const reached = regular.filter((s) => dayKey(s.date) <= today);
  const currentSession = reached.length ? reached[reached.length - 1] : null;
  const todaySessions = live.filter((s) => dayKey(s.date) === today);
  const nextSession = live.find((s) => dayKey(s.date) > today) || null;

  const totalSessions = Math.max(Number(cls.totalSessions) || 0, regular.length) || 0;
  const currentOrdinal = currentSession ? ordinalOf.get(String(currentSession._id)) : 0;

  let phase = 'unscheduled';
  let currentWeek = null;
  let totalWeeks = null;
  let daysUntilStart = null;
  let daysLeft = null;
  if (startKey) {
    totalWeeks = endKey ? Math.max(1, weekOf(startKey, endKey)) : null;
    if (today < startKey) {
      phase = 'upcoming';
      daysUntilStart = diffDays(today, startKey);
    } else if (endKey && today > endKey) {
      phase = 'ended';
      currentWeek = totalWeeks;
    } else {
      phase = 'ongoing';
      currentWeek = weekOf(startKey, today);
      if (totalWeeks) currentWeek = Math.min(currentWeek, totalWeeks);
      if (endKey) daysLeft = diffDays(today, endKey);
    }
  }

  // The sessions of the course-week we're in (or the first week before the
  // start, the last week after the end) — the week strip on the cards.
  const stripWeek = phase === 'upcoming' ? 1 : currentWeek;
  const weekSessions = stripWeek && startKey
    ? live.filter((s) => weekOf(startKey, dayKey(s.date)) === stripWeek).map(shape)
    : [];

  const percent = totalSessions ? Math.min(100, Math.round((currentOrdinal / totalSessions) * 100)) : 0;

  return {
    today,
    startTime: cls.startTime || '',
    phase,
    startDate: startKey,
    endDate: endKey,
    currentWeek,
    totalWeeks,
    daysUntilStart,
    daysLeft,
    currentSession: currentSession ? shape(currentSession) : null,
    currentSessionOrdinal: currentOrdinal,
    totalSessions,
    remainingSessions: Math.max(0, totalSessions - currentOrdinal),
    percent,
    todaySession: todaySessions.length ? shape(todaySessions[0]) : null,
    nextSession: nextSession ? shape(nextSession) : null,
    weekSessions,
    // Teacher nudge: sessions whose day has passed but are still "Dự kiến"
    // (attendance never taken / never marked Đã học).
    pendingPastSessions: live.filter((s) => s.status === 'scheduled' && dayKey(s.date) < today).length,
  };
}

module.exports = { computeClassProgress, vnTodayKey, dayKey };
