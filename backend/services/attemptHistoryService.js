'use strict';

// One combined, newest-first history per skill — Full đề AND Bài lẻ in the
// same list (they used to live in two separate modals, so a student looking
// for "which test still needs review?" had to check both, and every random
// full test showed up under the same "MockTest Đề Random" name).
//
// Every row is normalised to one shape the history table renders directly,
// with a name that actually identifies the attempt:
//   - full test  → test name + the passage titles used (random tests draw
//                  different passages every run) + a "Mock test" tag when
//                  the attempt was a step of a 4-skill MockTestAttempt
//   - Bài lẻ     → passage/section title + "Passage N"/"Section N"
// plus its mandatory-review status (reviewService.attachReviewStatus) so the
// table can flag "Chưa review".
//
// Pagination: the newest `limit` rows of the merged list are always inside
// the newest `limit` rows of each source, so fetching `limit` from each and
// merging is exact; `total` is the sum of both real counts.
const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const MockTestAttempt = require('../models/MockTestAttempt');
const reviewService = require('./reviewService');
const { REAL_ATTEMPT } = require('./attemptVisibility');
require('../models/ReadingTest');
require('../models/ListeningTest');
require('../models/Passage');

const READING_CATEGORY_LABEL = { passage1: 'Passage 1', passage2: 'Passage 2', passage3: 'Passage 3', 'actual-test': 'Actual test' };

// Which of these full-test attempts were a step of a 4-skill mock run.
async function mockAttemptIds(userId, skill, ids) {
  if (!ids.length) return new Set();
  const path = `steps.${skill}.attemptId`;
  const runs = await MockTestAttempt.find({ userId, [path]: { $in: ids } }).select(path).lean();
  return new Set(runs.map(r => String(r.steps[skill].attemptId)));
}

function sortAndSlice(rows, limit) {
  return rows.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

async function getReadingHistory(userId, limit = 50) {
  const fullFilter = { userId, status: 'completed' };
  const practiceFilter = { userId, ...REAL_ATTEMPT };
  const [full, practice, fullTotal, practiceTotal] = await Promise.all([
    TestAttempt.find(fullFilter).sort({ endTime: -1 }).limit(limit)
      .select('testId passagesUsed endTime duration totalQuestions correctCount wrongCount skippedCount bandScore status mode')
      .populate('testId', 'name').populate('passagesUsed', 'title').lean(),
    ReadingPracticeAttempt.find(practiceFilter).sort({ submittedAt: -1 }).limit(limit).select('-answers -proctor').lean(),
    TestAttempt.countDocuments(fullFilter),
    ReadingPracticeAttempt.countDocuments(practiceFilter),
  ]);

  const [fullR, practiceR, mockIds] = await Promise.all([
    reviewService.attachReviewStatus(userId, 'reading', full),
    reviewService.attachReviewStatus(userId, 'reading-practice', practice),
    mockAttemptIds(userId, 'reading', full.map(a => a._id)),
  ]);

  const rows = [
    ...fullR.map(a => ({
      _id: a._id, kind: 'full', attemptType: 'reading',
      title: (a.testId?.name || 'Đề Reading').replace(/\s+/g, ' ').trim(),
      tag: mockIds.has(String(a._id)) ? 'Mock test' : 'Full đề',
      detail: (a.passagesUsed || []).map(p => p && p.title).filter(Boolean).join(' · '),
      date: a.endTime, duration: a.duration,
      totalQuestions: a.totalQuestions, correctCount: a.correctCount, wrongCount: a.wrongCount, skippedCount: a.skippedCount,
      bandScore: a.bandScore, status: a.status, mode: a.mode,
      reviewStatus: a.reviewStatus, reviewMistakeCount: a.reviewMistakeCount, reviewedCount: a.reviewedCount,
    })),
    ...practiceR.map(a => ({
      _id: a._id, kind: 'practice', attemptType: 'reading-practice',
      title: a.passageTitle || 'Bài lẻ Reading',
      tag: 'Bài lẻ', detail: READING_CATEGORY_LABEL[a.category] || '', category: a.category,
      date: a.submittedAt, duration: a.timeTaken,
      totalQuestions: a.totalQuestions, correctCount: a.correctCount, wrongCount: a.wrongCount, skippedCount: a.skippedCount,
      bandScore: null, status: a.status, mode: a.mode,
      reviewStatus: a.reviewStatus, reviewMistakeCount: a.reviewMistakeCount, reviewedCount: a.reviewedCount,
    })),
  ];
  return { items: sortAndSlice(rows, limit), total: fullTotal + practiceTotal };
}

async function getListeningHistory(userId, limit = 50) {
  const fullFilter = { userId, status: { $ne: 'in-progress' } };
  const practiceFilter = { userId, ...REAL_ATTEMPT };
  const [full, practice, fullTotal, practiceTotal] = await Promise.all([
    ListeningAttempt.find(fullFilter).sort({ submittedAt: -1 }).limit(limit)
      .select('testName testId submittedAt timeTaken totalQuestions correctCount wrongCount skippedCount bandScore status mode')
      .populate('testId', 'name').lean(),
    ListeningPracticeAttempt.find(practiceFilter).sort({ submittedAt: -1 }).limit(limit).select('-answers -proctor').lean(),
    ListeningAttempt.countDocuments(fullFilter),
    ListeningPracticeAttempt.countDocuments(practiceFilter),
  ]);

  const [fullR, practiceR, mockIds] = await Promise.all([
    reviewService.attachReviewStatus(userId, 'listening', full),
    reviewService.attachReviewStatus(userId, 'listening-practice', practice),
    mockAttemptIds(userId, 'listening', full.map(a => a._id)),
  ]);

  const rows = [
    ...fullR.map(a => ({
      _id: a._id, kind: 'full', attemptType: 'listening',
      title: (a.testName || a.testId?.name || 'Đề Listening').replace(/\s+/g, ' ').trim(),
      tag: mockIds.has(String(a._id)) ? 'Mock test' : 'Full đề', detail: '',
      date: a.submittedAt, duration: a.timeTaken,
      totalQuestions: a.totalQuestions, correctCount: a.correctCount, wrongCount: a.wrongCount, skippedCount: a.skippedCount,
      bandScore: a.bandScore, status: a.status, mode: a.mode,
      reviewStatus: a.reviewStatus, reviewMistakeCount: a.reviewMistakeCount, reviewedCount: a.reviewedCount,
    })),
    ...practiceR.map(a => ({
      _id: a._id, kind: 'practice', attemptType: 'listening-practice',
      title: a.sectionTitle || 'Bài lẻ Listening',
      tag: 'Bài lẻ', detail: a.partNumber ? `Section ${a.partNumber}` : '', partNumber: a.partNumber,
      date: a.submittedAt, duration: a.timeTaken,
      totalQuestions: a.totalQuestions, correctCount: a.correctCount, wrongCount: a.wrongCount, skippedCount: a.skippedCount,
      bandScore: null, status: a.status, mode: a.mode,
      reviewStatus: a.reviewStatus, reviewMistakeCount: a.reviewMistakeCount, reviewedCount: a.reviewedCount,
    })),
  ];
  return { items: sortAndSlice(rows, limit), total: fullTotal + practiceTotal };
}

module.exports = { getReadingHistory, getListeningHistory };
