'use strict';

const VocabularyLesson = require('../models/VocabularyLesson');
const VocabularyLessonAttempt = require('../models/VocabularyLessonAttempt');
const VocabularyLessonImportLog = require('../models/VocabularyLessonImportLog');
const parser = require('./vocabularyLessonParser');

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

async function submitAttempt(userId, lessonId, { correctCount, totalCount, timeSpent }) {
  const total = Math.max(0, Number(totalCount) || 0);
  const correct = Math.max(0, Math.min(Number(correctCount) || 0, total));
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const spent = Math.max(0, Math.round(Number(timeSpent) || 0));

  const existing = await VocabularyLessonAttempt.findOne({ userId, lessonId }).select('bestScore').lean();
  const bestScore = Math.max(score, existing?.bestScore || 0);

  return VocabularyLessonAttempt.findOneAndUpdate(
    { userId, lessonId },
    {
      $set: { score, completed: true, bestScore, lastAttempt: new Date() },
      $inc: { attemptCount: 1, timeSpent: spent },
    },
    { upsert: true, new: true }
  );
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
      $lookup: {
        from: VocabularyLessonAttempt.collection.name,
        let: { lessonId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$lessonId', '$$lessonId'] }, { $eq: ['$completed', true] }] } } },
          { $count: 'count' },
        ],
        as: '_completed',
      },
    },
    { $addFields: { completedCount: { $ifNull: [{ $arrayElemAt: ['$_completed.count', 0] }, 0] } } },
    { $project: { _completed: 0 } },
  ]);
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
    await VocabularyLessonAttempt.deleteMany({ lessonId: id });
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
};
