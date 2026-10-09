'use strict';

const mongoose = require('mongoose');
const ShadowingLesson = require('../models/ShadowingLesson');
const ShadowingAttempt = require('../models/ShadowingAttempt');
const { NotFoundError, ValidationError } = require('../errors/AppError');

const MODES = ['dictation', 'shadowing'];

// Picker list — no segments (that's the whole lesson), plus this student's
// best score per mode so the cards can show progress.
async function listLessons(userId) {
  const lessons = await ShadowingLesson.find({ isPublished: true })
    .select('slug title description youtubeId channel category level clipStart clipEnd segments order')
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const best = await ShadowingAttempt.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(String(userId)), lessonId: { $in: lessons.map(l => l._id) } } },
    { $group: { _id: { lessonId: '$lessonId', mode: '$mode' }, best: { $max: '$avgScore' } } },
  ]);
  const progress = {};
  for (const b of best) {
    const key = String(b._id.lessonId);
    (progress[key] = progress[key] || {})[b._id.mode] = b.best;
  }

  return lessons.map(({ segments, ...l }) => ({
    ...l,
    segmentCount: segments.length,
    duration: Math.round(l.clipEnd - l.clipStart),
    progress: progress[String(l._id)] || {},
  }));
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

  const avgScore = Math.round(safeAnswers.reduce((n, a) => n + a.score, 0) / safeAnswers.length);
  const attempt = await ShadowingAttempt.create({
    userId,
    lessonId: lesson._id,
    lessonTitle: lesson.title,
    mode,
    answers: safeAnswers,
    totalSegments: lesson.segments.length,
    avgScore,
    submittedAt: new Date(),
  });
  return { attemptId: attempt._id, avgScore, answered: safeAnswers.length };
}

module.exports = { listLessons, getLesson, saveAttempt };
