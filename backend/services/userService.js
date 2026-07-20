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
const cloudinaryService = require('./cloudinaryService');
const { effectiveStreak } = require('../utils/streak');

async function getProfile(userId, currentPlan) {
  const user = await User.findById(userId).select('-password -resetOTP -resetOTPExpires').lean();
  if (!user) return null;
  // Use plan from req.user (already auto-expired by auth middleware) to avoid race with fire-and-forget updateOne
  user.plan = currentPlan;
  return user;
}

async function updateProfile(userId, { firstName, lastName, bio, studyMotto, targetBand }) {
  const update = {};
  if (firstName !== undefined) update.firstName = firstName.trim();
  if (lastName !== undefined) update.lastName = lastName.trim();
  if (bio !== undefined) update.bio = bio.trim().slice(0, 200);
  if (studyMotto !== undefined) update.studyMotto = studyMotto.trim().slice(0, 80);
  if (targetBand !== undefined) update.targetBand = targetBand === '' || targetBand === null ? null : Number(targetBand);

  return User.findByIdAndUpdate(userId, update, { new: true })
    .select('-password -resetOTP -resetOTPExpires')
    .lean();
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  // If social account with no password
  if (!user.password && !currentPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { status: 'set' };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { status: 'invalid' };

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { status: 'changed' };
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

async function getStats(userId) {
  const [
    readingAttempts,
    listeningAttempts,
    writingAttempts,
    speakingAttempts,
    user
  ] = await Promise.all([
    TestAttempt.find({ userId, status: 'completed' })
      .select('bandScore createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    ListeningAttempt.find({ userId, status: 'completed' })
      .select('bandScore createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    WritingAttempt.find({ userId })
      .select('wordCount1 wordCount2 timeTaken createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    SpeakingAttempt.find({ userId })
      .select('aiFeedback.overallBand createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    // NOT leaned: resetIfStale()/save() below need a real Mongoose document.
    User.findById(userId).select('learningStreak previousStreak lastActivityDate totalStudyMinutes streakHammers streakLostAt')
  ]);

  // Reset streak nếu học sinh bỏ lỡ >= 2 ngày, để hiển thị đúng khi mở trang
  const wasReset = user.resetIfStale();
  if (wasReset) user.save().catch(() => {});

  const avgReading = readingAttempts.length
    ? (readingAttempts.reduce((s, a) => s + a.bandScore, 0) / readingAttempts.length).toFixed(1)
    : null;
  const avgListening = listeningAttempts.length
    ? (listeningAttempts.reduce((s, a) => s + a.bandScore, 0) / listeningAttempts.length).toFixed(1)
    : null;

  return {
    streak: user.learningStreak || 0,
    previousStreak: user.previousStreak || 0,
    lastActivity: user.lastActivityDate,
    totalStudyMinutes: user.totalStudyMinutes || 0,
    streakHammers: user.streakHammers || 0,
    canUseHammer: user.canUseHammer(),
    reading: { total: readingAttempts.length, avgBand: avgReading, history: readingAttempts },
    listening: { total: listeningAttempts.length, avgBand: avgListening, history: listeningAttempts },
    writing: { total: writingAttempts.length, history: writingAttempts },
    speaking: { total: speakingAttempts.length, history: speakingAttempts }
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

module.exports = { getProfile, updateProfile, changePassword, uploadAvatar, getStats, getActivityHeatmap, getStreakLeaderboard, useHammer };
