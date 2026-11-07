'use strict';
// Online time per student: the heartbeat writer (POST /api/activity/beat,
// sent by frontend/js/shared/online-tracker.js) and the admin read views
// (routes/admin/onlineTime.js).

const mongoose = require('mongoose');
const OnlineSession = require('../models/OnlineSession');
const User = require('../models/User');
const { escapeRegex } = require('../utils/strings');

const VN_OFFSET_MS = 7 * 3600 * 1000;
const DAY_MS = 864e5;
const SID_RE = /^[A-Za-z0-9_-]{8,40}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const PAGE_RE = /^\/[\w\-./]{0,80}$/;
const MAX_BREAKS_KEPT = 200;

function vnDayKey(d) {
  return new Date(new Date(d).getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

// 'YYYY-MM-DD' shifted by n days.
function shiftDay(key, n) {
  return new Date(Date.parse(`${key}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}

function clampInt(v, min, max) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function clampDate(v, min, max, fallback) {
  const t = new Date(v).getTime();
  if (!Number.isFinite(t)) return new Date(fallback);
  return new Date(Math.min(max, Math.max(min, t)));
}

// ── Writer ───────────────────────────────────────────────────────────────

// Returns { ok: true } or { ok: false, reason }. Only students are tracked.
async function recordBeat(user, body, deviceType) {
  if (!user || user.role !== 'student') return { ok: false, reason: 'not-tracked' };
  const b = body || {};
  if (!SID_RE.test(String(b.sid || ''))) return { ok: false, reason: 'bad-sid' };

  const now = Date.now();
  const active = clampInt(b.active, 0, 1800);
  const startedAt = clampDate(b.startedAt, now - DAY_MS, now, now - active * 1000);
  const endedAt = clampDate(b.lastActiveAt, startedAt.getTime(), now, now);
  const tabSwitches = clampInt(b.tabSwitches, 0, 100);
  const idlePauses = clampInt(b.idlePauses, 0, 100);
  const breaks = (Array.isArray(b.breaks) ? b.breaks : []).slice(0, 50)
    .filter((x) => x && (x.type === 'tab' || x.type === 'idle'))
    .map((x) => ({
      type: x.type,
      at: clampDate(x.at, now - DAY_MS, now, now),
      seconds: clampInt(x.seconds, 0, 86400),
    }));
  const page = typeof b.page === 'string' && PAGE_RE.test(b.page) ? b.page : null;

  const update = {
    $setOnInsert: { day: vnDayKey(startedAt), device: deviceType || null },
    $min: { startedAt },
    $max: { endedAt },
    $inc: { activeSeconds: active, tabSwitches, idlePauses },
  };
  if (breaks.length) update.$push = { breaks: { $each: breaks, $slice: -MAX_BREAKS_KEPT } };
  if (page) update.$addToSet = { pages: page };

  const filter = { userId: user._id, sid: b.sid };
  try {
    await OnlineSession.updateOne(filter, update, { upsert: true });
  } catch (err) {
    // Two tabs inserting the same new session at once — the second upsert
    // loses the unique-index race; retrying turns it into a plain update.
    if (err && err.code === 11000) await OnlineSession.updateOne(filter, update, { upsert: true });
    else throw err;
  }
  return { ok: true };
}

// ── Admin readers ────────────────────────────────────────────────────────

const USER_FIELDS = 'username firstName lastName email avatar className lastSeen';
const DAY_SORTS = {
  minutes: (a, b) => b.activeSeconds - a.activeSeconds,
  tabs:    (a, b) => b.tabSwitches - a.tabSwitches || b.activeSeconds - a.activeSeconds,
  pauses:  (a, b) => b.idlePauses - a.idlePauses || b.activeSeconds - a.activeSeconds,
  recent:  (a, b) => new Date(b.lastEnd) - new Date(a.lastEnd),
  name:    (a, b) => String(a.user.username).localeCompare(String(b.user.username)),
};

// Everyone who was online on `day`, with that day's totals and a 7-day
// minutes trend ending on `day`.
async function listDay({ day, search, sort, page = 1, limit = 50 }) {
  const dayKey = DAY_RE.test(String(day || '')) ? day : vnDayKey(Date.now());
  const rows = await OnlineSession.aggregate([
    { $match: { day: dayKey } },
    { $group: {
      _id: '$userId',
      activeSeconds: { $sum: '$activeSeconds' },
      sessions:      { $sum: 1 },
      tabSwitches:   { $sum: '$tabSwitches' },
      idlePauses:    { $sum: '$idlePauses' },
      firstStart:    { $min: '$startedAt' },
      lastEnd:       { $max: '$endedAt' },
    } },
  ]);

  const users = await User.find({ _id: { $in: rows.map((r) => r._id) } }).select(USER_FIELDS).lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  let list = rows
    .filter((r) => byId.has(String(r._id)))
    .map((r) => ({ ...r, userId: r._id, user: byId.get(String(r._id)) }));

  const totals = {
    students: list.length,
    activeSeconds: list.reduce((s, r) => s + r.activeSeconds, 0),
    sessions: list.reduce((s, r) => s + r.sessions, 0),
    tabSwitches: list.reduce((s, r) => s + r.tabSwitches, 0),
    idlePauses: list.reduce((s, r) => s + r.idlePauses, 0),
  };

  if (search) {
    const re = new RegExp(escapeRegex(String(search).trim()), 'i');
    list = list.filter(({ user: u }) => [u.username, u.firstName, u.lastName, u.email, u.className].some((v) => v && re.test(v)));
  }
  list.sort(DAY_SORTS[sort] || DAY_SORTS.minutes);

  const total = list.length;
  const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const pg = Math.max(1, parseInt(page, 10) || 1);
  const pageRows = list.slice((pg - 1) * lim, pg * lim);

  // 7-day trend for just this page's students.
  const trendDays = Array.from({ length: 7 }, (_, i) => shiftDay(dayKey, i - 6));
  const trendRows = pageRows.length ? await OnlineSession.aggregate([
    { $match: { userId: { $in: pageRows.map((r) => r.userId) }, day: { $gte: trendDays[0], $lte: dayKey } } },
    { $group: { _id: { u: '$userId', d: '$day' }, s: { $sum: '$activeSeconds' } } },
  ]) : [];
  const trendMap = new Map(trendRows.map((t) => [`${t._id.u}|${t._id.d}`, t.s]));
  for (const r of pageRows) {
    r.trend = trendDays.map((d) => ({ day: d, activeSeconds: trendMap.get(`${r.userId}|${d}`) || 0 }));
    delete r._id;
  }

  return { day: dayKey, today: vnDayKey(Date.now()), totals, total, page: pg, limit: lim, students: pageRows };
}

// One student: per-day totals for the last `days` days + every session
// (with its breaks) on the selected day.
async function userDetail(userId, { days = 14, day } = {}) {
  if (!mongoose.isValidObjectId(userId)) return null;
  const user = await User.findById(userId).select(USER_FIELDS).lean();
  if (!user) return null;

  const today = vnDayKey(Date.now());
  const n = Math.min(90, Math.max(1, parseInt(days, 10) || 14));
  const fromDay = shiftDay(today, -(n - 1));
  const uid = new mongoose.Types.ObjectId(String(userId));

  const daily = await OnlineSession.aggregate([
    { $match: { userId: uid, day: { $gte: fromDay } } },
    { $group: {
      _id: '$day',
      activeSeconds: { $sum: '$activeSeconds' },
      sessions:      { $sum: 1 },
      tabSwitches:   { $sum: '$tabSwitches' },
      idlePauses:    { $sum: '$idlePauses' },
    } },
  ]);
  const dailyMap = new Map(daily.map((d) => [d._id, d]));
  const dayList = Array.from({ length: n }, (_, i) => {
    const key = shiftDay(today, -i);
    const d = dailyMap.get(key);
    return { day: key, activeSeconds: d ? d.activeSeconds : 0, sessions: d ? d.sessions : 0,
      tabSwitches: d ? d.tabSwitches : 0, idlePauses: d ? d.idlePauses : 0 };
  });

  // Default to the most recent day with data in the window (else today).
  const selected = DAY_RE.test(String(day || '')) ? day
    : (dayList.find((d) => d.sessions > 0) || dayList[0]).day;
  const sessions = await OnlineSession.find({ userId: uid, day: selected })
    .sort({ startedAt: 1 }).select('-userId -sid').lean();

  return { user, today, day: selected, days: dayList, sessions };
}

module.exports = { recordBeat, listDay, userDetail, vnDayKey, shiftDay };
