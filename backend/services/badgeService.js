'use strict';

// Computes which achievement badges (constants/badges.js) a student has
// earned, live from data that already exists — no separate "awarded
// badges" collection, same approach as services/recommendationService.js.
//
// Lifetime counts vs the 90-day TTL: attempt history (TestAttempt,
// DictationAttempt, OnlineSession…) deletes itself after 3 months, which
// would make "100 bài Reading" un-earnable and progress bars shrink. So
// each count is   User.badgeTally.counts[key]   (rows already folded in)
//               + rows still in the collection created on/after tally.cut.
// syncTally moves `cut` forward to "30 days ago" (rows that old are final:
// an in-progress test won't complete a month later), folding the rows in
// between into the tally. Any badge read runs it, at most once a day per
// student; rows have 60 days of slack before the TTL takes them. Best
// bands are kept the same way (badgeTally.bands, $max).
//
// Once earned, a badge stays earned (User.earnedBadgeIds).
const mongoose = require('mongoose');
const User = require('../models/User');
const VocabBook = require('../models/VocabBook');
const TestAttempt = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const DictationAttempt = require('../models/DictationAttempt');
const GapFillAttempt = require('../models/GapFillAttempt');
const ShadowingAttempt = require('../models/ShadowingAttempt');
const MockTestAttempt = require('../models/MockTestAttempt');
const Task2Attempt = require('../models/Task2Attempt');
const Task2TemplateAttempt = require('../models/Task2TemplateAttempt');
const AdvSentenceAttempt = require('../models/AdvSentenceAttempt');
const WritingPracticeAttempt = require('../models/WritingPracticeAttempt');
const OnlineSession = require('../models/OnlineSession');
const EssentialGrammarAttempt = require('../models/EssentialGrammarAttempt');
const VocabularyLessonAttempt = require('../models/VocabularyLessonAttempt');
const { COUNTABLE_ATTEMPT } = require('./attemptVisibility');
const { LEGEND_PETS } = require('../constants/shop');
const BADGES = require('../constants/badges');

const DAY_MS = 24 * 60 * 60 * 1000;
const SETTLE_MS = 30 * DAY_MS;

// Lifetime-counted sources. Each part: model, extra match, the user field,
// the date field the TTL keys on, and what to add per row (default 1).
const SOURCES = [
  { key: 'reading', parts: [{ model: TestAttempt, match: { status: 'completed' } }] },
  { key: 'listening', parts: [{ model: ListeningAttempt, match: { status: 'completed' } }] },
  { key: 'writing', parts: [{ model: WritingAttempt, match: COUNTABLE_ATTEMPT }] },
  { key: 'speaking', parts: [{ model: SpeakingAttempt, match: { status: 'analyzed' } }] },
  { key: 'readingPractice', parts: [{ model: ReadingPracticeAttempt, match: { status: 'completed' } }] },
  { key: 'listeningPractice', parts: [{ model: ListeningPracticeAttempt, match: { status: 'completed' } }] },
  { key: 'dictation', parts: [{ model: DictationAttempt }] },
  { key: 'gapFill', parts: [{ model: GapFillAttempt }] },
  { key: 'shadowing', parts: [{ model: ShadowingAttempt }] },
  { key: 'mock', parts: [{ model: MockTestAttempt, match: { status: 'completed' } }] },
  { key: 'writingDrill', parts: [
    { model: Task2Attempt },
    { model: Task2TemplateAttempt },
    { model: AdvSentenceAttempt },
    { model: WritingPracticeAttempt, user: 'studentId' },
  ] },
  { key: 'onlineSeconds', parts: [{ model: OnlineSession, date: 'startedAt', add: '$activeSeconds' }] },
];

// Best band per skill, over the rows still present (merged with the tally).
// Writing: teacher-confirmed grades only — an AI-only grade isn't a real
// score yet (same rule as the profile page's average).
const BANDS = [
  { key: 'reading', model: TestAttempt, match: { status: 'completed' }, field: '$bandScore' },
  { key: 'listening', model: ListeningAttempt, match: { status: 'completed' }, field: '$bandScore' },
  { key: 'writing', model: WritingAttempt, match: { 'grading.overallBand': { $ne: null } }, field: '$grading.overallBand' },
  { key: 'speaking', model: SpeakingAttempt, match: { status: 'analyzed' }, field: '$aiFeedback.overallBand' },
];

// Rows of one source part, split at `cut`: { fold: before cut, live: after }.
// Only rows on/after `from` (the previous cut) are looked at.
async function countPart(part, oid, from, cut) {
  const date = part.date || 'createdAt';
  const match = { [part.user || 'userId']: oid, ...(part.match || {}) };
  if (from) match[date] = { $gte: from };
  const rows = await part.model.aggregate([
    { $match: match },
    { $group: { _id: { $lt: ['$' + date, cut] }, n: { $sum: part.add || 1 } } },
  ]);
  const out = { fold: 0, live: 0 };
  rows.forEach(r => { out[r._id ? 'fold' : 'live'] += r.n || 0; });
  return out;
}

// Lifetime totals for every SOURCES key + best bands; folds settled rows
// into User.badgeTally when the cut is a day or more behind.
async function syncTally(userId, user) {
  const oid = new mongoose.Types.ObjectId(userId);
  const tally = (user && user.badgeTally) || {};
  const oldCut = tally.cut ? new Date(tally.cut) : null;
  const target = new Date(Date.now() - SETTLE_MS);
  const advance = !oldCut || target - oldCut >= DAY_MS;
  const cut = advance ? target : oldCut;

  const [parts, bandRows] = await Promise.all([
    Promise.all(SOURCES.map(s => Promise.all(s.parts.map(p => countPart(p, oid, oldCut, cut))))),
    Promise.all(BANDS.map(b => b.model.aggregate([
      { $match: { userId: oid, ...b.match } },
      { $group: { _id: null, max: { $max: b.field } } },
    ]))),
  ]);

  const counts = {};
  const inc = {};
  SOURCES.forEach((s, i) => {
    const fold = parts[i].reduce((a, p) => a + p.fold, 0);
    const live = parts[i].reduce((a, p) => a + p.live, 0);
    const kept = (tally.counts && tally.counts[s.key]) || 0;
    counts[s.key] = kept + fold + live;
    if (fold) inc['badgeTally.counts.' + s.key] = fold;
  });
  const bands = {};
  const max = {};
  BANDS.forEach((b, i) => {
    const live = (bandRows[i][0] && bandRows[i][0].max) || 0;
    const kept = (tally.bands && tally.bands[b.key]) || 0;
    bands[b.key] = Math.max(live, kept);
    if (live > kept) max['badgeTally.bands.' + b.key] = live;
  });

  // Fold settled rows — only if nobody else moved the cut meanwhile (else
  // they'd be counted twice). This request's totals are right either way.
  if (advance) {
    const update = { $set: { 'badgeTally.cut': cut } };
    if (Object.keys(inc).length) update.$inc = inc;
    if (Object.keys(max).length) update.$max = max;
    await User.updateOne({ _id: oid, 'badgeTally.cut': oldCut }, update);
  } else if (Object.keys(max).length) {
    await User.updateOne({ _id: oid }, { $max: max });
  }
  return { counts, bands };
}

async function getUserStats(userId) {
  const oid = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(userId)
    .select('maxLearningStreak pets earnedBadgeIds badgeTally').lean();

  const [vocabAgg, grammarLessons, vocabLessons, tally] = await Promise.all([
    VocabBook.aggregate([
      { $match: { userId: oid } },
      { $unwind: '$words' },
      { $group: {
        _id: null,
        saved: { $sum: 1 },
        mastered: { $sum: { $cond: [{ $eq: ['$words.status', 'da-thuoc'] }, 1, 0] } },
      } },
    ]),
    EssentialGrammarAttempt.countDocuments({ userId: oid, completed: true }),
    VocabularyLessonAttempt.countDocuments({ userId: oid, completed: true }),
    syncTally(userId, user),
  ]);

  const c = tally.counts;
  const b = tally.bands;
  const pets = (user && user.pets) || [];
  return {
    vocabSaved: vocabAgg[0]?.saved || 0,
    vocabMastered: vocabAgg[0]?.mastered || 0,
    vocabLessons,
    grammarLessons,
    readingCount: c.reading,
    readingPractice: c.readingPractice,
    readingMaxBand: b.reading,
    listeningCount: c.listening,
    listeningPractice: c.listeningPractice,
    dictationCount: c.dictation,
    gapFillCount: c.gapFill,
    listeningMaxBand: b.listening,
    writingCount: c.writing,
    writingDrill: c.writingDrill,
    writingMaxBand: b.writing,
    speakingCount: c.speaking,
    shadowingCount: c.shadowing,
    speakingMaxBand: b.speaking,
    mockCount: c.mock,
    maxStreak: user?.maxLearningStreak || 0,
    studyHours: Math.floor(c.onlineSeconds / 3600),
    skillsTried: [c.reading, c.listening, c.writing, c.speaking].filter(n => n > 0).length,
    minSkillBand: Math.min(b.reading, b.listening, b.writing, b.speaking),
    totalTests: c.reading + c.listening + c.writing + c.speaking,
    petsOwned: pets.length,
    legendPets: pets.filter(id => LEGEND_PETS.includes(id)).length,
    earnedBadgeIds: (user && user.earnedBadgeIds) || [],
  };
}

async function getBadges(userId) {
  const stats = await getUserStats(userId);
  const known = new Set(stats.earnedBadgeIds);
  const badges = BADGES.map(b => {
    const current = stats[b.stat] || 0;
    const earned = current >= b.threshold || known.has(b.id);
    return {
      id: b.id,
      category: b.category,
      tier: b.tier,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earned,
      progress: { current: earned ? b.threshold : Math.min(current, b.threshold), target: b.threshold },
    };
  });
  const earnedCount = badges.filter(b => b.earned).length;
  return { badges, categories: BADGES.CATEGORIES, earnedCount, totalCount: badges.length };
}

// Wraps getBadges() with detection + persistence of NEWLY earned badges —
// getBadges() itself stays free of earnedBadgeIds writes (still used as-is
// by the admin "view a student's badges" route, which must never mark
// anything as "seen" on that student's behalf). Diffs the earned set
// against User.earnedBadgeIds (the "already notified" record) and
// $addToSet's any newly-crossed ids. Callers use `newlyUnlocked` to pop a
// real-time notification; everything else in the response is identical to
// getBadges().
async function checkAndAwardNewBadges(userId) {
  const result = await getBadges(userId);
  const user = await User.findById(userId).select('earnedBadgeIds').lean();
  const known = new Set(user?.earnedBadgeIds || []);
  const newlyUnlocked = result.badges.filter(b => b.earned && !known.has(b.id));
  if (newlyUnlocked.length) {
    await User.updateOne(
      { _id: userId },
      { $addToSet: { earnedBadgeIds: { $each: newlyUnlocked.map(b => b.id) } } }
    );
  }
  return { ...result, newlyUnlocked };
}

// Called from the activity heartbeat with the already-loaded user doc, so
// students who only do untracked practice (dictation, shadowing…) still get
// their history folded in before the TTL takes it. Runs the full sync at
// most once a day per student; never throws.
function syncIfDue(user) {
  try {
    const cut = user && user.badgeTally && user.badgeTally.cut;
    if (cut && Date.now() - SETTLE_MS - new Date(cut).getTime() < DAY_MS) return;
    getUserStats(user._id).catch(() => {});
  } catch (e) { /* decorative bookkeeping — never break the beat */ }
}

module.exports = { getUserStats, getBadges, checkAndAwardNewBadges, syncTally, syncIfDue, SETTLE_MS };
