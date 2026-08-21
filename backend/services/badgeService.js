'use strict';

// Computes which achievement badges (constants/badges.js) a student has
// earned, live from data that already exists (VocabBook word status,
// attempt counts/bands, User.maxLearningStreak) — no separate "awarded
// badges" collection to keep in sync, same approach as
// services/recommendationService.js. A badge is earned whenever the
// student's current stat crosses its threshold; there is no earnedAt
// timestamp since nothing is persisted.
const mongoose = require('mongoose');
const User = require('../models/User');
const VocabBook = require('../models/VocabBook');
const TestAttempt = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const BADGES = require('../constants/badges');

async function getUserStats(userId) {
  const oid = new mongoose.Types.ObjectId(userId);

  const [
    vocabAgg, readingAgg, listeningAgg, writingAgg, speakingAgg, user,
  ] = await Promise.all([
    VocabBook.aggregate([
      { $match: { userId: oid } },
      { $unwind: '$words' },
      { $match: { 'words.status': 'da-thuoc' } },
      { $count: 'count' },
    ]),
    TestAttempt.aggregate([
      { $match: { userId: oid, status: 'completed' } },
      { $group: { _id: null, maxBand: { $max: '$bandScore' }, count: { $sum: 1 } } },
    ]),
    ListeningAttempt.aggregate([
      { $match: { userId: oid, status: 'completed' } },
      { $group: { _id: null, maxBand: { $max: '$bandScore' }, count: { $sum: 1 } } },
    ]),
    // Count = every submission (matches userService.getStats' writingTotal);
    // max band only over teacher-confirmed grades — same rule as the
    // profile page's average, an AI-only grade isn't a real score yet.
    Promise.all([
      WritingAttempt.countDocuments({ userId: oid }),
      WritingAttempt.aggregate([
        { $match: { userId: oid, 'grading.overallBand': { $ne: null } } },
        { $group: { _id: null, maxBand: { $max: '$grading.overallBand' } } },
      ]),
    ]),
    SpeakingAttempt.aggregate([
      { $match: { userId: oid, status: 'analyzed' } },
      { $group: { _id: null, maxBand: { $max: '$aiFeedback.overallBand' }, count: { $sum: 1 } } },
    ]),
    User.findById(userId).select('maxLearningStreak').lean(),
  ]);

  const [writingCount, writingBandAgg] = writingAgg;

  return {
    vocabMastered: vocabAgg[0]?.count || 0,
    readingCount: readingAgg[0]?.count || 0,
    readingMaxBand: readingAgg[0]?.maxBand || 0,
    listeningCount: listeningAgg[0]?.count || 0,
    listeningMaxBand: listeningAgg[0]?.maxBand || 0,
    writingCount,
    writingMaxBand: writingBandAgg[0]?.maxBand || 0,
    speakingCount: speakingAgg[0]?.count || 0,
    speakingMaxBand: speakingAgg[0]?.maxBand || 0,
    maxStreak: user?.maxLearningStreak || 0,
  };
}

async function getBadges(userId) {
  const stats = await getUserStats(userId);
  const badges = BADGES.map(b => {
    const current = stats[b.stat] || 0;
    return {
      id: b.id,
      category: b.category,
      tier: b.tier,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earned: current >= b.threshold,
      progress: { current: Math.min(current, b.threshold), target: b.threshold },
    };
  });
  const earnedCount = badges.filter(b => b.earned).length;
  return { badges, earnedCount, totalCount: badges.length };
}

module.exports = { getUserStats, getBadges };
