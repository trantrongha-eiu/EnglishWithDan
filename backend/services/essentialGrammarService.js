'use strict';

const mongoose = require('mongoose');
const EssentialGrammarLesson = require('../models/EssentialGrammarLesson');
const EssentialGrammarAttempt = require('../models/EssentialGrammarAttempt');
const EssentialGrammarAttemptLog = require('../models/EssentialGrammarAttemptLog');

const MAX_WRONG_QUESTIONS_LOGGED = 50; // a lesson realistically has far fewer than this many gradeable items

async function listLessons() {
  return EssentialGrammarLesson.find({ isActive: true })
    .sort({ orderIndex: 1 })
    .select('-__v')
    .lean();
}

// ══════════════════════════════════════════════════════
// Student-facing reads
// ══════════════════════════════════════════════════════

async function getLessonById(id) {
  return EssentialGrammarLesson.findOne({ _id: id, isActive: true }).select('-__v').lean();
}

// ══════════════════════════════════════════════════════
// Student progress — one aggregate row per (userId, lessonId), same
// pattern as vocabularyLessonService's getAttempt/submitAttempt.
// ══════════════════════════════════════════════════════

async function getAttempt(userId, lessonId) {
  return EssentialGrammarAttempt.findOne({ userId, lessonId }).lean();
}

async function submitAttempt(userId, lessonId, { correctCount, totalCount, timeSpent, wrongQuestions }) {
  const total = Math.max(0, Number(totalCount) || 0);
  const correct = Math.max(0, Math.min(Number(correctCount) || 0, total));
  const wrong = total - correct;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const spent = Math.max(0, Math.round(Number(timeSpent) || 0));
  // Client-supplied, so bounded + coerced to plain strings before it ever
  // reaches an aggregation ($unwind over an attacker-controlled array of
  // arbitrary type would be an easy DoS/garbage-in vector for getMostMissedQuestions()).
  const safeWrongQuestions = Array.isArray(wrongQuestions)
    ? wrongQuestions.slice(0, MAX_WRONG_QUESTIONS_LOGGED).map(q => String(q).slice(0, 200))
    : [];

  const existing = await EssentialGrammarAttempt.findOne({ userId, lessonId }).select('bestScore').lean();
  const bestScore = Math.max(score, existing?.bestScore || 0);

  const [attempt] = await Promise.all([
    EssentialGrammarAttempt.findOneAndUpdate(
      { userId, lessonId },
      {
        $set: { score, completed: true, bestScore, lastAttempt: new Date() },
        $inc: { attemptCount: 1, timeSpent: spent },
      },
      { upsert: true, new: true }
    ),
    EssentialGrammarAttemptLog.create({
      userId, lessonId, score, correct, wrong, total, timeSpent: spent, wrongQuestions: safeWrongQuestions,
    }),
  ]);
  return attempt;
}

// Shared by the student's own "past attempts" view and the admin's
// per-student drill-down — same shape either way, just different callers.
async function getAttemptHistory(userId, lessonId, limit = 20) {
  return EssentialGrammarAttemptLog.find({ userId, lessonId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-wrongQuestions -__v -userId -lessonId')
    .lean();
}

// ══════════════════════════════════════════════════════
// Admin reads
// ══════════════════════════════════════════════════════

async function listAdminLessons() {
  return EssentialGrammarLesson.aggregate([
    { $project: { category: 1, lessonKey: 1, title: 1, icon: 1, summary: 1, orderIndex: 1, isActive: 1, createdAt: 1, updatedAt: 1 } },
    { $sort: { category: 1, orderIndex: 1 } },
    {
      $lookup: {
        from: EssentialGrammarAttempt.collection.name,
        localField: '_id',
        foreignField: 'lessonId',
        as: '_attempts',
      },
    },
    {
      $addFields: {
        completedCount: { $size: { $filter: { input: '$_attempts', as: 'a', cond: { $eq: ['$$a.completed', true] } } } },
        averageScore: {
          $cond: [
            { $gt: [{ $size: '$_attempts' }, 0] },
            { $round: [{ $avg: '$_attempts.bestScore' }, 0] },
            null,
          ],
        },
        lastActivity: { $max: '$_attempts.lastAttempt' },
      },
    },
    { $project: { _attempts: 0 } },
  ]);
}

async function getAdminLesson(id) {
  // No isActive filter — admin must be able to see/manage hidden lessons.
  return EssentialGrammarLesson.findById(id).lean();
}

// Metadata-only edit — does NOT touch category/lessonKey/blocks. Those are
// the seed script's upsert-matching keys / seed-authored content; changing
// them here would silently break the next seed run's {category,lessonKey}
// matching (see seedEssentialGrammar.js).
async function updateLessonMeta(id, payload) {
  const lesson = await EssentialGrammarLesson.findById(id);
  if (!lesson) return null;

  if (payload.title != null) {
    if (!String(payload.title).trim()) throw new Error('Thiếu "title"');
    lesson.title = String(payload.title).trim();
  }
  if (payload.summary != null) lesson.summary = String(payload.summary).trim();
  if (payload.icon != null) lesson.icon = String(payload.icon).trim() || '📘';
  if (payload.orderIndex != null) {
    if (Number.isNaN(Number(payload.orderIndex))) throw new Error('"orderIndex" phải là số');
    lesson.orderIndex = Number(payload.orderIndex);
  }
  if (typeof payload.isActive === 'boolean') lesson.isActive = payload.isActive;

  await lesson.save();
  return lesson;
}

async function deleteLesson(id) {
  const lesson = await EssentialGrammarLesson.findByIdAndDelete(id);
  if (lesson) {
    await Promise.all([
      EssentialGrammarAttempt.deleteMany({ lessonId: id }),
      EssentialGrammarAttemptLog.deleteMany({ lessonId: id }),
    ]);
  }
  return lesson;
}

async function setActive(id, isActive) {
  return EssentialGrammarLesson.findByIdAndUpdate(id, { isActive: !!isActive }, { new: true });
}

// ══════════════════════════════════════════════════════
// Admin analytics — per-lesson student breakdown, per-student history, and
// "most missed questions". All read-only, derived from
// EssentialGrammarAttempt / EssentialGrammarAttemptLog only.
// ══════════════════════════════════════════════════════

async function getLessonStudentBreakdown(lessonId) {
  const rows = await EssentialGrammarAttempt.find({ lessonId })
    .populate('userId', 'username firstName lastName')
    .sort({ lastAttempt: -1 })
    .lean();
  return rows
    .filter(r => r.userId) // drop rows whose user was since deleted
    .map(r => ({
      userId:       r.userId._id,
      username:     r.userId.username,
      firstName:    r.userId.firstName,
      lastName:     r.userId.lastName,
      score:        r.score,
      bestScore:    r.bestScore,
      attemptCount: r.attemptCount,
      lastAttempt:  r.lastAttempt,
      timeSpent:    r.timeSpent,
    }));
}

async function getMostMissedQuestions(lessonId, limit = 10) {
  return EssentialGrammarAttemptLog.aggregate([
    { $match: { lessonId: new mongoose.Types.ObjectId(lessonId) } },
    { $unwind: '$wrongQuestions' },
    { $group: { _id: { $toLower: '$wrongQuestions' }, count: { $sum: 1 }, sample: { $first: '$wrongQuestions' } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, question: '$sample', count: 1 } },
  ]);
}

function csvField(v) {
  const s = String(v ?? '');
  // OWASP CSV-injection guard: a field opened by Excel/Sheets that starts
  // with =, +, -, or @ can be interpreted as a formula. Student
  // names/usernames are user-controlled (registration), so neutralize
  // before quoting.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

async function exportLessonStudentsCsv(lessonId) {
  const lesson = await EssentialGrammarLesson.findById(lessonId).select('title').lean();
  const rows = await getLessonStudentBreakdown(lessonId);
  const header = ['Student', 'Username', 'Last Score', 'Best Score', 'Attempts', 'Time Spent (s)', 'Last Attempt'].map(csvField).join(',');
  const body = rows.map(r => {
    const name = [r.firstName, r.lastName].filter(Boolean).join(' ') || r.username || '';
    return [
      csvField(name), csvField(r.username), r.score, r.bestScore, r.attemptCount, r.timeSpent,
      csvField(r.lastAttempt ? new Date(r.lastAttempt).toISOString() : ''),
    ].join(',');
  });
  return {
    title: lesson?.title || 'lesson',
    csv: [header, ...body].join('\r\n'),
  };
}

module.exports = {
  listLessons,
  getLessonById,
  getAttempt,
  submitAttempt,
  getAttemptHistory,
  listAdminLessons,
  getAdminLesson,
  updateLessonMeta,
  deleteLesson,
  setActive,
  getLessonStudentBreakdown,
  getMostMissedQuestions,
  exportLessonStudentsCsv,
};
