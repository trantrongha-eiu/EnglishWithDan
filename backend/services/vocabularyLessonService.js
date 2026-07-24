'use strict';

const mongoose = require('mongoose');
const VocabularyLesson = require('../models/VocabularyLesson');
const VocabularyLessonAttempt = require('../models/VocabularyLessonAttempt');
const VocabularyLessonAttemptLog = require('../models/VocabularyLessonAttemptLog');
const VocabularyLessonImportLog = require('../models/VocabularyLessonImportLog');
const parser = require('./vocabularyLessonParser');

const MAX_WRONG_WORDS_LOGGED = 300; // matches MAX_WORDS_PER_LESSON — never more wrong words than a lesson can have

// ══════════════════════════════════════════════════════
// Student-facing reads (published lessons only)
// ══════════════════════════════════════════════════════

async function listPublicLessons() {
  return VocabularyLesson.aggregate([
    { $match: { published: true } },
    { $project: { title: 1, description: 1, difficulty: 1, order: 1, createdAt: 1, wordCount: { $size: '$words' } } },
    { $sort: { order: 1, createdAt: -1 } },
  ]);
}

async function getPublicLesson(id) {
  return VocabularyLesson.findOne({ _id: id, published: true }).select('-rawImport').lean();
}

// ══════════════════════════════════════════════════════
// Student progress — one aggregate row per (userId, lessonId), written
// only when a full quiz run is submitted (see vocabularyLessonQuizEngine
// on the frontend — there is no partial/in-progress persistence, matching
// the VocabularyLessonAttempt schema, which has no per-attempt log).
// ══════════════════════════════════════════════════════

async function getAttempt(userId, lessonId) {
  return VocabularyLessonAttempt.findOne({ userId, lessonId }).lean();
}

async function submitAttempt(userId, lessonId, { correctCount, totalCount, timeSpent, wrongWords }) {
  const total = Math.max(0, Number(totalCount) || 0);
  const correct = Math.max(0, Math.min(Number(correctCount) || 0, total));
  const wrong = total - correct;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const spent = Math.max(0, Math.round(Number(timeSpent) || 0));
  // Client-supplied, so bounded + coerced to plain strings before it ever
  // reaches an aggregation ($unwind over an attacker-controlled array of
  // arbitrary type would be an easy DoS/garbage-in vector for getMostMissedWords()).
  const safeWrongWords = Array.isArray(wrongWords)
    ? wrongWords.slice(0, MAX_WRONG_WORDS_LOGGED).map(w => String(w).slice(0, 200))
    : [];

  const existing = await VocabularyLessonAttempt.findOne({ userId, lessonId }).select('bestScore').lean();
  const bestScore = Math.max(score, existing?.bestScore || 0);

  // Two independent writes: the aggregate row (Best Score/Attempt Count —
  // read on every Results-tab load) and a new history-log row (only read
  // when a history/analytics view is explicitly opened). Neither depends on
  // the other's result, so run them concurrently rather than sequentially.
  const [attempt] = await Promise.all([
    VocabularyLessonAttempt.findOneAndUpdate(
      { userId, lessonId },
      {
        $set: { score, completed: true, bestScore, lastAttempt: new Date() },
        $inc: { attemptCount: 1, timeSpent: spent },
      },
      { upsert: true, new: true }
    ),
    VocabularyLessonAttemptLog.create({
      userId, lessonId, score, correct, wrong, total, timeSpent: spent, wrongWords: safeWrongWords,
    }),
  ]);
  return attempt;
}

// Shared by the student's own "past attempts" view and the admin's
// per-student drill-down — same shape either way, just different callers.
async function getAttemptHistory(userId, lessonId, limit = 20) {
  return VocabularyLessonAttemptLog.find({ userId, lessonId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-wrongWords -__v -userId -lessonId')
    .lean();
}

// ══════════════════════════════════════════════════════
// Import limits — protect the parser/DB from pathological pastes with
// friendly, specific errors instead of relying on MongoDB's own 16MB/
// document BSON ceiling (which fails with an opaque driver error, not a
// validation message). Word count and raw-text size are checked here, in
// the single parseText() entry point Validate/Preview/Import/Reimport all
// share, so a paste that's too big is caught during Preview — before the
// admin ever attempts to save it. Lesson-count is checked separately in
// importLesson() since it depends on how many lessons already exist.
// ══════════════════════════════════════════════════════
const MAX_LESSONS = 100;
const MAX_WORDS_PER_LESSON = 300;
const MAX_RAW_TEXT_BYTES = 200 * 1024; // 200KB

// ══════════════════════════════════════════════════════
// Parsing / validation — no DB writes. Used by the Import page's
// Validate + Preview buttons (both just call this; Preview additionally
// renders `lesson`/`words` when valid).
// ══════════════════════════════════════════════════════

function parseText(raw) {
  const bytes = Buffer.byteLength(raw || '', 'utf8');
  if (bytes > MAX_RAW_TEXT_BYTES) {
    return {
      valid: false,
      errors: [`Nội dung import quá lớn (${(bytes / 1024).toFixed(1)}KB), tối đa cho phép ${MAX_RAW_TEXT_BYTES / 1024}KB`],
      warnings: [],
      title: null,
      lesson: null,
      words: [],
    };
  }

  const result = parser.parseLessonText(raw);
  if (result.valid && result.words.length > MAX_WORDS_PER_LESSON) {
    return {
      ...result,
      valid: false,
      errors: [...result.errors, `Bài học có ${result.words.length} từ, vượt quá giới hạn tối đa ${MAX_WORDS_PER_LESSON} từ/bài`],
      lesson: null,
      words: [],
    };
  }
  return result;
}

async function logImportAttempt({ userId, rawText, result, lessonId }) {
  return VocabularyLessonImportLog.create({
    createdBy: userId,
    rawText,
    status:    result.valid ? 'success' : 'failed',
    errorMessages: result.valid ? [] : result.errors,
    title:     result.title,
    wordCount: result.valid ? result.words.length : 0,
    lessonId:  lessonId || null,
  });
}

function throwValidationError(result) {
  const err = new Error(result.errors[0] || 'Dữ liệu không hợp lệ');
  err.validationErrors = result.errors;
  throw err;
}

// ══════════════════════════════════════════════════════
// Admin reads
// ══════════════════════════════════════════════════════

async function listAdminLessons() {
  return VocabularyLesson.aggregate([
    { $project: { title: 1, description: 1, difficulty: 1, order: 1, published: 1, createdBy: 1, createdAt: 1, wordCount: { $size: '$words' } } },
    { $sort: { createdAt: -1 } },
    {
      // One lookup for every per-lesson attempt-row-derived stat
      // (completedCount/averageScore/lastActivity) instead of a separate
      // $lookup per stat — cheaper, and keeps them trivially consistent
      // with each other (same underlying row set).
      $lookup: {
        from: VocabularyLessonAttempt.collection.name,
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

// ══════════════════════════════════════════════════════
// Admin analytics — per-lesson class breakdown, per-student history, and
// "most missed words". All read-only, all derived from
// VocabularyLessonAttempt (the aggregate row) / VocabularyLessonAttemptLog
// (the per-submission history) — neither is touched by these functions.
// ══════════════════════════════════════════════════════

async function getLessonStudentBreakdown(lessonId) {
  const rows = await VocabularyLessonAttempt.find({ lessonId })
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

async function getMostMissedWords(lessonId, limit = 10) {
  return VocabularyLessonAttemptLog.aggregate([
    { $match: { lessonId: new mongoose.Types.ObjectId(lessonId) } },
    { $unwind: '$wrongWords' },
    { $group: { _id: { $toLower: '$wrongWords' }, count: { $sum: 1 }, sample: { $first: '$wrongWords' } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, word: '$sample', count: 1 } },
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
  const lesson = await VocabularyLesson.findById(lessonId).select('title').lean();
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

async function getAdminLesson(id) {
  return VocabularyLesson.findById(id).lean();
}

// ══════════════════════════════════════════════════════
// Import (create) / Re-import (replace words+metadata of an existing
// lesson by re-pasting Lesson Format text) — both log every attempt,
// success or failure, to VocabularyLessonImportLog.
// ══════════════════════════════════════════════════════

async function importLesson(userId, rawText) {
  const result = parseText(rawText);
  if (!result.valid) {
    await logImportAttempt({ userId, rawText, result });
    throwValidationError(result);
  }

  const lessonCount = await VocabularyLesson.countDocuments({});
  if (lessonCount >= MAX_LESSONS) {
    const limitResult = { ...result, valid: false, errors: [`Đã đạt giới hạn tối đa ${MAX_LESSONS} bài học, không thể tạo thêm. Hãy xoá bớt bài cũ hoặc liên hệ quản trị viên.`] };
    await logImportAttempt({ userId, rawText, result: limitResult });
    throwValidationError(limitResult);
  }

  const lesson = await VocabularyLesson.create({
    ...result.lesson,
    words: result.words,
    rawImport: rawText,
    published: false,
    createdBy: userId,
  });
  await logImportAttempt({ userId, rawText, result, lessonId: lesson._id });
  return lesson;
}

async function reimportLesson(id, userId, rawText) {
  const lesson = await VocabularyLesson.findById(id);
  if (!lesson) return null;

  const result = parseText(rawText);
  if (!result.valid) {
    await logImportAttempt({ userId, rawText, result, lessonId: id });
    throwValidationError(result);
  }

  lesson.title = result.lesson.title;
  lesson.description = result.lesson.description;
  lesson.difficulty = result.lesson.difficulty;
  lesson.order = result.lesson.order;
  lesson.words = result.words;
  lesson.rawImport = rawText;
  await lesson.save();

  await logImportAttempt({ userId, rawText, result, lessonId: lesson._id });
  return lesson;
}

// Metadata-only edit (rename / description / difficulty / order /
// published) — does not touch words or rawImport, and is NOT an "import"
// so it is not logged to VocabularyLessonImportLog.
async function updateLessonMeta(id, payload) {
  const lesson = await VocabularyLesson.findById(id);
  if (!lesson) return null;

  if (payload.title != null) {
    if (!String(payload.title).trim()) throw new Error('Thiếu "title"');
    lesson.title = String(payload.title).trim();
  }
  if (payload.description != null) lesson.description = String(payload.description).trim();
  if (payload.difficulty != null) {
    if (!parser.DIFFICULTY_LEVELS.includes(payload.difficulty)) {
      throw new Error(`Invalid difficulty "${payload.difficulty}" (chỉ chấp nhận ${parser.DIFFICULTY_LEVELS.join(', ')})`);
    }
    lesson.difficulty = payload.difficulty;
  }
  if (payload.order != null) {
    if (Number.isNaN(Number(payload.order))) throw new Error('"order" phải là số');
    lesson.order = Number(payload.order);
  }
  if (typeof payload.published === 'boolean') lesson.published = payload.published;

  await lesson.save();
  return lesson;
}

async function deleteLesson(id) {
  const lesson = await VocabularyLesson.findByIdAndDelete(id);
  if (lesson) {
    // No orphaned progress rows pointing at a lesson that no longer exists.
    // Import history is deliberately left untouched — recovering the raw
    // text of a deleted lesson is exactly what it's for.
    await Promise.all([
      VocabularyLessonAttempt.deleteMany({ lessonId: id }),
      VocabularyLessonAttemptLog.deleteMany({ lessonId: id }),
    ]);
  }
  return lesson;
}

async function setPublished(id, published) {
  return VocabularyLesson.findByIdAndUpdate(id, { published: !!published }, { new: true });
}

async function duplicateLesson(id, userId) {
  const source = await VocabularyLesson.findById(id).lean();
  if (!source) return null;
  return VocabularyLesson.create({
    title: `${source.title} (Copy)`,
    description: source.description,
    difficulty: source.difficulty,
    order: source.order,
    words: source.words,
    rawImport: source.rawImport,
    published: false,
    createdBy: userId,
  });
}

// ══════════════════════════════════════════════════════
// Import History
// ══════════════════════════════════════════════════════

async function listImportHistory(limit = 50) {
  return VocabularyLessonImportLog.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: VocabularyLesson.collection.name,
        localField: 'lessonId',
        foreignField: '_id',
        as: '_lesson',
      },
    },
    {
      $addFields: {
        // Falls back to the log's own snapshot if the lesson was renamed
        // or deleted since this import attempt.
        currentTitle: { $ifNull: [{ $arrayElemAt: ['$_lesson.title', 0] }, '$title'] },
        published:    { $ifNull: [{ $arrayElemAt: ['$_lesson.published', 0] }, false] },
        lessonExists: { $gt: [{ $size: '$_lesson' }, 0] },
      },
    },
    { $project: { _lesson: 0, rawText: 0 } }, // list view: no need for the full raw text payload
  ]);
}

async function getImportHistoryEntry(id) {
  return VocabularyLessonImportLog.findById(id).lean();
}

module.exports = {
  parseText,
  listPublicLessons,
  getPublicLesson,
  getAttempt,
  submitAttempt,
  getAttemptHistory,
  listAdminLessons,
  getAdminLesson,
  importLesson,
  reimportLesson,
  updateLessonMeta,
  deleteLesson,
  setPublished,
  duplicateLesson,
  listImportHistory,
  getImportHistoryEntry,
  getLessonStudentBreakdown,
  getMostMissedWords,
  exportLessonStudentsCsv,
};
