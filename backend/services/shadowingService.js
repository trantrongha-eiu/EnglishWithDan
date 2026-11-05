'use strict';

const mongoose = require('mongoose');
const ShadowingLesson = require('../models/ShadowingLesson');
const ShadowingAttempt = require('../models/ShadowingAttempt');
const { NotFoundError, ValidationError } = require('../errors/AppError');
const { MIN_STREAK_SENTENCES } = require('../utils/streak');
const { awardPracticeFlames, drillBonusForAccuracy } = require('./streakBonusService');

const MODES = ['dictation', 'shadowing'];

// Picker list — no segments (that's the whole lesson; segmentCount /
// playDuration are stored on the lesson for this), plus this student's
// progress per mode for the cards.
async function listLessons(userId) {
  const lessons = await ShadowingLesson.find({ isPublished: true })
    .select('slug title description youtubeId channel category level segmentCount playDuration order')
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // A lesson saved before the stats existed: fill them in once.
  const stale = lessons.filter((l) => !l.segmentCount);
  if (stale.length) {
    const full = await ShadowingLesson.find({ _id: { $in: stale.map((l) => l._id) } }).select('segments').lean();
    for (const f of full) {
      const { segmentCount, playDuration } = ShadowingLesson.withStats(f);
      Object.assign(lessons.find((l) => String(l._id) === String(f._id)), { segmentCount, playDuration });
      await ShadowingLesson.updateOne({ _id: f._id }, { $set: { segmentCount, playDuration } });
    }
  }

  const { score, answered } = await lessonProgress(userId, lessons);
  return lessons.map(({ playDuration, ...l }) => ({
    ...l,
    duration: playDuration,
    progress: score[String(l._id)] || {},   // { mode: % of the whole lesson }
    answered: answered[String(l._id)] || {}, // { mode: sentences tried }
  }));
}

// Progress per lesson + mode = the best score each sentence has ever got
// (across every saved session), averaged over ALL the lesson's sentences —
// a sentence never tried counts 0. So 5 easy sentences of a 144-sentence
// lesson show 3%, not 100%.
async function lessonProgress(userId, lessons) {
  const total = new Map(lessons.map((l) => [String(l._id), l.segmentCount]));
  const rows = await ShadowingAttempt.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(String(userId)), lessonId: { $in: lessons.map((l) => l._id) } } },
    { $unwind: '$answers' },
    { $group: { _id: { lessonId: '$lessonId', mode: '$mode', seg: '$answers.segmentIndex' }, best: { $max: '$answers.score' } } },
  ]);
  const score = {};
  const answered = {};
  for (const r of rows) {
    const key = String(r._id.lessonId);
    const n = total.get(key);
    if (!n || r._id.seg >= n) continue; // lesson re-cut since: drop stale indexes
    const { mode } = r._id;
    (score[key] = score[key] || {})[mode] = (score[key][mode] || 0) + r.best / n;
    (answered[key] = answered[key] || {})[mode] = (answered[key][mode] || 0) + 1;
  }
  for (const modes of Object.values(score)) {
    for (const mode of Object.keys(modes)) modes[mode] = Math.round(modes[mode]);
  }
  return { score, answered };
}

async function getLesson(slug) {
  const lesson = await ShadowingLesson.findOne({ slug: String(slug), isPublished: true }).lean();
  if (!lesson) throw new NotFoundError('Không tìm thấy bài luyện này');
  return lesson;
}

// Answers come from the client, so every number is re-derived/clamped here
// against the lesson's real segment list rather than trusted as sent.
async function saveAttempt(slug, { mode, answers }, userId) {
  if (!MODES.includes(mode)) throw new ValidationError('Chế độ luyện không hợp lệ');
  const lesson = await ShadowingLesson.findOne({ slug: String(slug), isPublished: true })
    .select('_id title segments').lean();
  if (!lesson) throw new NotFoundError('Không tìm thấy bài luyện này');

  const seen = new Set();
  const safeAnswers = (Array.isArray(answers) ? answers : [])
    .map(a => {
      const segmentIndex = Number(a && a.segmentIndex);
      const totalWords = Math.max(0, Math.floor(Number(a && a.totalWords) || 0));
      const matchedWords = Math.min(totalWords, Math.max(0, Math.floor(Number(a && a.matchedWords) || 0)));
      return { segmentIndex, matchedWords, totalWords,
        score: totalWords ? Math.round((matchedWords / totalWords) * 100) : 0 };
    })
    .filter(a => Number.isInteger(a.segmentIndex) && a.segmentIndex >= 0 &&
      a.segmentIndex < lesson.segments.length && a.totalWords > 0 &&
      !seen.has(a.segmentIndex) && seen.add(a.segmentIndex));
  if (!safeAnswers.length) throw new ValidationError('Chưa có câu nào được chấm');

  // avgScore covers the whole lesson (unanswered sentences count 0);
  // accuracy is over the sentences done in this session.
  const scoreSum = safeAnswers.reduce((n, a) => n + a.score, 0);
  const avgScore = Math.round(scoreSum / lesson.segments.length);
  const accuracy = Math.round(scoreSum / safeAnswers.length);
  const attempt = await ShadowingAttempt.create({
    userId,
    lessonId: lesson._id,
    lessonTitle: lesson.title,
    mode,
    answers: safeAnswers,
    totalSegments: lesson.segments.length,
    avgScore,
    accuracy,
    submittedAt: new Date(),
  });
  // Accuracy >=70% +1 🔥, >=90% +2 🔥 once at least 5 câu are scored (once
  // per lesson + mode per day; a later save of the same lesson only tops up).
  if (safeAnswers.length >= MIN_STREAK_SENTENCES) {
    await awardPracticeFlames(userId, `shadowing:${lesson._id}:${mode}`, drillBonusForAccuracy(accuracy / 100));
  }
  return { attemptId: attempt._id, avgScore, accuracy, answered: safeAnswers.length, totalSegments: lesson.segments.length };
}

module.exports = { listLessons, getLesson, saveAttempt };
