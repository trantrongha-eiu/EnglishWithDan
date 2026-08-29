'use strict';

// Extracted from controllers/user.controller.js, verbatim logic.
const mongoose = require('mongoose');
const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const VocabActivity = require('../models/VocabActivity');
const bcrypt = require('bcryptjs');
const { signToken } = require('./authService');
const cloudinaryService = require('./cloudinaryService');
const { effectiveStreak } = require('../utils/streak');
const { todayVNDate } = require('./streakBonusService');

// targetBand/targetExamDate are the SAME underlying User fields
// goalService.js's /api/goals validates (see that file's own comment) —
// but goalService deliberately enforces a STRICTER product-scope band
// range there (4.0-7.5) than the field's own schema bound (models/User.js:
// min 4, max 9), specifically so that stricter rule wouldn't risk breaking
// this older, more permissive profile.html path or any pre-existing value.
// So this validates against the schema's own bound, not goalService's —
// reusing goalService's range here would be an unauthorized business-rule
// change to this endpoint, not a bug fix. What WAS a real gap: nothing
// enforced even the schema bound before writing (findByIdAndUpdate below
// never passed runValidators), so out-of-range/malformed values saved
// silently (audit finding BUG-003) — a crafted targetBand:15 round-tripped
// straight back on the next GET.
const MIN_TARGET_BAND = 4;
const MAX_TARGET_BAND = 9;

// Returns an array of human-readable errors — empty means valid. Only
// validates fields actually present in `input`; null/'' clear the field
// (existing, intentional behavior — see updateProfile below) and are not
// errors. Mirrors goalService.validateGoalInput's shape/conventions.
function validateProfileInput({ targetBand, targetExamDate }) {
  const errors = [];
  if (targetBand !== undefined && targetBand !== null && targetBand !== '') {
    if (typeof targetBand !== 'number' || Number.isNaN(targetBand) || targetBand < MIN_TARGET_BAND || targetBand > MAX_TARGET_BAND) {
      errors.push(`targetBand must be a number between ${MIN_TARGET_BAND} and ${MAX_TARGET_BAND}`);
    }
  }
  if (targetExamDate !== undefined && targetExamDate !== null && targetExamDate !== '') {
    const d = new Date(targetExamDate);
    if (Number.isNaN(d.getTime())) errors.push('targetExamDate is not a valid date');
    // Same "past" definition as goalService's identical examDate check —
    // the exam-date field is jointly owned by Profile and Goals, so a past
    // date must be rejected here too or a student could set one by going
    // through Profile instead of Goals.
    else if (d < todayVNDate()) errors.push('targetExamDate must not be in the past');
  }
  return errors;
}

async function getProfile(userId, currentPlan) {
  const user = await User.findById(userId).select('-password -resetOTP -resetOTPExpires').lean();
  if (!user) return null;
  // Use plan from req.user (already auto-expired by auth middleware) to avoid race with fire-and-forget updateOne
  user.plan = currentPlan;
  return user;
}

async function updateProfile(userId, { firstName, lastName, bio, studyMotto, targetBand, targetExamDate }) {
  const errors = validateProfileInput({ targetBand, targetExamDate });
  if (errors.length) return { status: 'invalid', errors };

  const update = {};
  if (firstName !== undefined) update.firstName = firstName.trim();
  if (lastName !== undefined) update.lastName = lastName.trim();
  if (bio !== undefined) update.bio = bio.trim().slice(0, 200);
  if (studyMotto !== undefined) update.studyMotto = studyMotto.trim().slice(0, 80);
  if (targetBand !== undefined) update.targetBand = targetBand === '' || targetBand === null ? null : Number(targetBand);
  if (targetExamDate !== undefined) update.targetExamDate = targetExamDate === '' || targetExamDate === null ? null : new Date(targetExamDate);

  const user = await User.findByIdAndUpdate(userId, update, { new: true })
    .select('-password -resetOTP -resetOTPExpires')
    .lean();
  return { status: 'ok', user };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  // If social account with no password
  if (!user.password && !currentPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
    // BUG-023: revoke every token issued before now (all devices), then
    // hand back a freshly-signed one so the session that just made this
    // change keeps working without an extra forced re-login — see
    // middleware/auth.js's same-second truncation for why signing the
    // fresh token right after this is safe.
    user.tokenValidAfter = new Date();
    await user.save();
    return { status: 'set', token: signToken(user._id) };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { status: 'invalid' };

  user.password = await bcrypt.hash(newPassword, 10);
  user.tokenValidAfter = new Date();
  await user.save();
  return { status: 'changed', token: signToken(user._id) };
}

async function uploadAvatar(userId, imageBase64) {
  const result = await cloudinaryService.uploadImage(imageBase64, {
    folder: 'avatars',
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: result.secure_url },
    { new: true }
  ).select('-password -resetOTP -resetOTPExpires -resetOTPAttempts');

  return { avatar: result.secure_url, user };
}

// Recent-history list size for each skill — feeds both the profile.html
// "recent activity" list and the band-trend chart, which wants more than a
// handful of points to be a meaningful trend. The average/total below are
// computed separately via aggregation over the WHOLE history, not this
// bounded list, so bumping this only affects chart resolution, never accuracy.
// Depth of the per-skill history list returned by GET /api/user/stats.
// Feeds profile.html's history tables (collapsed to the most recent few,
// "Xem thêm" reveals the rest) + its band-trend chart. Bumped 30 -> 60 so
// a moderately active student can actually scroll back through a term's
// worth of attempts from their profile; the per-skill pages still hold the
// fully-paginated history beyond this.
const STATS_HISTORY_LIMIT = 60;

async function getStats(userId) {
  const [
    readingAttempts,
    listeningAttempts,
    writingAttempts,
    speakingAttempts,
    readingAgg,
    listeningAgg,
    writingAgg,
    writingTotal,
    speakingAgg,
    user
  ] = await Promise.all([
    TestAttempt.find({ userId, status: 'completed' })
      .select('bandScore createdAt')
      .sort({ createdAt: -1 })
      .limit(STATS_HISTORY_LIMIT)
      .lean(),
    ListeningAttempt.find({ userId, status: 'completed' })
      .select('bandScore createdAt')
      .sort({ createdAt: -1 })
      .limit(STATS_HISTORY_LIMIT)
      .lean(),
    WritingAttempt.find({ userId })
      .select('wordCount1 wordCount2 timeTaken createdAt grading.overallBand')
      .sort({ createdAt: -1 })
      .limit(STATS_HISTORY_LIMIT)
      .lean(),
    SpeakingAttempt.find({ userId, status: 'analyzed' })
      .select('aiFeedback.overallBand createdAt')
      .sort({ createdAt: -1 })
      .limit(STATS_HISTORY_LIMIT)
      .lean(),
    // Average/total computed over the FULL history via aggregation, not the
    // bounded .find() above — a long-history student's average used to
    // silently only reflect their most recent 10 attempts.
    TestAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$bandScore' }, count: { $sum: 1 } } },
    ]),
    ListeningAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$bandScore' }, count: { $sum: 1 } } },
    ]),
    // Same "only teacher-confirmed bands count" rule as before, expressed as
    // a $match instead of a post-fetch .filter().
    WritingAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), 'grading.overallBand': { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$grading.overallBand' }, count: { $sum: 1 } } },
    ]),
    // Writing's total is deliberately every submission (graded or still
    // pending review) — unlike the average above, which only makes sense
    // over graded attempts. Badges like "Cây viết" (>=3 bài Writing) and the
    // peer-profile count should reflect submissions made, not just how many
    // a teacher has gotten to grading yet.
    WritingAttempt.countDocuments({ userId }),
    SpeakingAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'analyzed' } },
      { $group: { _id: null, avg: { $avg: '$aiFeedback.overallBand' }, count: { $sum: 1 } } },
    ]),
    // NOT leaned: resetIfStale()/save() below need a real Mongoose document.
    User.findById(userId).select('learningStreak previousStreak lastActivityDate totalStudyMinutes streakHammers streakLostAt')
  ]);

  // Reset streak nếu học sinh bỏ lỡ >= 2 ngày, để hiển thị đúng khi mở trang.
  //
  // This used to be a plain `user.save()` (fire-and-forget, unawaited), which
  // raced with a concurrent updateStreak() write (vocabBookService, e.g. the
  // student opens this page right as a qualifying study session finishes
  // elsewhere): whichever save landed in Mongo LAST won, and if the stale
  // reset landed after the study session's write, it silently stomped the
  // just-earned streak back to 0 — "I studied today but my streak reset"
  // reports were this. Guard the write with the exact lastActivityDate we
  // read: it only applies if nothing else has advanced it since (i.e.
  // nobody studied in between). If the guard fails, re-fetch instead of
  // trusting our now-stale in-memory reset.
  const wasReset = user.resetIfStale();
  if (wasReset) {
    const result = await User.updateOne(
      { _id: userId, lastActivityDate: user.lastActivityDate },
      { $set: { learningStreak: user.learningStreak, previousStreak: user.previousStreak, streakLostAt: user.streakLostAt } }
    );
    if (result.modifiedCount !== 1) {
      const fresh = await User.findById(userId).select('learningStreak previousStreak lastActivityDate streakHammers streakLostAt');
      if (fresh) {
        user.learningStreak = fresh.learningStreak;
        user.previousStreak = fresh.previousStreak;
        user.lastActivityDate = fresh.lastActivityDate;
        user.streakLostAt = fresh.streakLostAt;
      }
    }
  }

  // Note: "only teacher-confirmed bands count" for the writing AVERAGE
  // (grading.overallBand) — an AI-only grade (aiGrading, gradingStatus
  // 'pending'/'ai_done') isn't treated as a real score anywhere else in the
  // app either (see routes/admin/stats.js's recent-attempts: `bandScore:
  // h.grading?.overallBand ?? null`), so an attempt awaiting review is
  // excluded from the average — enforced by writingAgg's $match above
  // instead of a post-fetch .filter(). writingTotal deliberately counts
  // every submission regardless of grading status (see its query above).
  const avgReading   = readingAgg[0]   ? readingAgg[0].avg.toFixed(1)   : null;
  const avgListening = listeningAgg[0] ? listeningAgg[0].avg.toFixed(1) : null;
  const avgWriting   = writingAgg[0]   ? writingAgg[0].avg.toFixed(1)   : null;
  const avgSpeaking  = speakingAgg[0]  ? speakingAgg[0].avg.toFixed(1)  : null;

  return {
    streak: user.learningStreak || 0,
    previousStreak: user.previousStreak || 0,
    lastActivity: user.lastActivityDate,
    totalStudyMinutes: user.totalStudyMinutes || 0,
    streakHammers: user.streakHammers || 0,
    canUseHammer: user.canUseHammer(),
    reading: { total: readingAgg[0] ? readingAgg[0].count : 0, avgBand: avgReading, history: readingAttempts },
    listening: { total: listeningAgg[0] ? listeningAgg[0].count : 0, avgBand: avgListening, history: listeningAttempts },
    writing: { total: writingTotal, avgBand: avgWriting, history: writingAttempts },
    speaking: { total: speakingAgg[0] ? speakingAgg[0].count : 0, avgBand: avgSpeaking, history: speakingAttempts }
  };
}

// Daily activity counts (Reading/Listening/Writing/Speaking attempts +
// vocab practice merged) for the last `days` days — powers the streak
// heatmap on profile.html and the weekly-progress banner on dashboard.html.
async function getActivityHeatmap(userId, days = 365) {
  const uid = new mongoose.Types.ObjectId(userId);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  // timezone: '+07:00' — bucket by Vietnam calendar day, same convention as
  // effectiveStreak() in routes/admin/_shared.js. Without it, Mongo groups by
  // UTC day, so anything studied 00:00–07:00 VN time lands on the wrong date.
  const byDay = { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+07:00' } }, count: { $sum: 1 } } };
  // VocabActivity is already one pre-aggregated doc per (user, day) — count
  // real study actions (wordsStudied/wordsAdded), not viewCount, so merely
  // opening the vocab page doesn't light up the calendar (matches what
  // actually drives learningStreak — see vocabBookService.completePractice).
  const vocabByDay = {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: '+07:00' } },
      count: { $sum: { $add: ['$wordsStudied', '$wordsAdded'] } }
    }
  };

  const [reading, listening, writing, speaking, vocab] = await Promise.all([
    TestAttempt.aggregate([{ $match: { userId: uid, status: 'completed', createdAt: { $gte: since } } }, byDay]),
    ListeningAttempt.aggregate([{ $match: { userId: uid, status: 'completed', createdAt: { $gte: since } } }, byDay]),
    WritingAttempt.aggregate([{ $match: { userId: uid, createdAt: { $gte: since } } }, byDay]),
    SpeakingAttempt.aggregate([{ $match: { userId: uid, createdAt: { $gte: since } } }, byDay]),
    VocabActivity.aggregate([{ $match: { userId: uid, date: { $gte: since } } }, vocabByDay])
  ]);

  const counts = {};
  for (const arr of [reading, listening, writing, speaking, vocab]) {
    for (const { _id, count } of arr) {
      if (count > 0) counts[_id] = (counts[_id] || 0) + count;
    }
  }
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Top N students by current streak, for the student-facing leaderboard
// widget. Uses effectiveStreak() (read-only) rather than the raw
// learningStreak field — that field only gets zeroed lazily by
// resetIfStale() whenever a student happens to load /user/stats, so a
// student who lost their streak days ago but hasn't opened the app since
// would otherwise still show their old count here.
async function getStreakLeaderboard(limit = 10) {
  const candidates = await User.find({ role: 'student', learningStreak: { $gt: 0 } })
    .select('firstName lastName username avatar learningStreak lastActivityDate')
    .lean();

  return candidates
    .map(u => ({
      _id: u._id,
      name: (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username,
      avatar: u.avatar || '',
      streak: effectiveStreak(u.learningStreak, u.lastActivityDate),
    }))
    .filter(u => u.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, limit);
}

// Búa Daniel: spend 1 hammer to restore the streak lost within the last 3
// days. NOT leaned — useHammerToRestore()/save() need a real document.
async function useHammer(userId) {
  const user = await User.findById(userId).select('learningStreak previousStreak streakLostAt streakHammers');
  if (!user) return { status: 'not_eligible' };
  const restored = user.useHammerToRestore();
  if (!restored) return { status: 'not_eligible' };
  await user.save();
  return { status: 'ok', streak: user.learningStreak, streakHammers: user.streakHammers };
}

module.exports = { getProfile, updateProfile, validateProfileInput, changePassword, uploadAvatar, getStats, getActivityHeatmap, getStreakLeaderboard, useHammer };
