'use strict';

// Read-only activity rollups for the admin panel: one table of every
// student practice/attempt collection (ACTIVITY_SOURCES), used by
//   - GET /api/admin/users/:id/overview  → userActivitySummary()
//   - GET /api/admin/stats/overview      → dailyActivity()
// Same collection list as GET /admin/recent-attempts (routes/admin/stats.js)
// plus AdvSentenceAttempt, which that feed was missing.
//
// Every query here matches on an indexed field (userId+date or createdAt) —
// all of these collections carry a { createdAt: 1 } TTL index.

const mongoose = require('mongoose');

const TestAttempt = require('../models/TestAttempt');
const ReadingPracticeAttempt = require('../models/ReadingPracticeAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const GapFillAttempt = require('../models/GapFillAttempt');
const DictationAttempt = require('../models/DictationAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const WritingPracticeAttempt = require('../models/WritingPracticeAttempt');
const Task1Attempt = require('../models/Task1Attempt');
const Task2Attempt = require('../models/Task2Attempt');
const Task2TemplateAttempt = require('../models/Task2TemplateAttempt');
const AdvSentenceAttempt = require('../models/AdvSentenceAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const EssentialGrammarAttemptLog = require('../models/EssentialGrammarAttemptLog');
const VocabularyLessonAttemptLog = require('../models/VocabularyLessonAttemptLog');
const WT1Submission = require('../models/WT1Submission');
const MockTestAttempt = require('../models/MockTestAttempt');

const FINISHED = { status: { $in: ['completed', 'disqualified'] } };

// group: which skill bucket the admin UI rolls this source up into.
// date:  the field that means "when the student did it" (falls back to
//        createdAt when missing on older docs).
// band:  optional aggregation expression averaged into avgBand.
// perQuestion: Task1Attempt stores ONE doc per question — count sessions.
const ACTIVITY_SOURCES = [
  { key: 'reading',            label: 'Reading (đề thi)',     group: 'reading',   model: TestAttempt,              match: FINISHED, date: 'endTime', band: '$bandScore' },
  { key: 'reading-practice',   label: 'Reading lẻ',           group: 'reading',   model: ReadingPracticeAttempt,   date: 'submittedAt' },
  { key: 'listening',          label: 'Listening (đề thi)',   group: 'listening', model: ListeningAttempt,         match: FINISHED, date: 'submittedAt', band: '$bandScore' },
  { key: 'listening-practice', label: 'Listening lẻ',         group: 'listening', model: ListeningPracticeAttempt, date: 'submittedAt' },
  { key: 'listening-gapfill',  label: 'Gap-fill',             group: 'listening', model: GapFillAttempt,           date: 'submittedAt' },
  { key: 'dictation',          label: 'Dictation',            group: 'listening', model: DictationAttempt,         date: 'submittedAt' },
  { key: 'writing',            label: 'Writing (đề thi)',     group: 'writing',   model: WritingAttempt,           date: 'submittedAt', band: '$grading.overallBand' },
  { key: 'writing-practice',   label: 'Writing lẻ',           group: 'writing',   model: WritingPracticeAttempt,   date: 'createdAt', userField: 'studentId' },
  { key: 'task1-practice',     label: 'Task 1 Grammar',       group: 'writing',   model: Task1Attempt,             date: 'createdAt', perQuestion: true },
  { key: 'task2-practice',     label: 'Task 2 Practice',      group: 'writing',   model: Task2Attempt,             date: 'completedAt' },
  { key: 'task2-template',     label: 'Task 2 Templates',     group: 'writing',   model: Task2TemplateAttempt,     date: 'createdAt' },
  { key: 'adv-sentence',       label: 'Viết câu nâng cao',    group: 'writing',   model: AdvSentenceAttempt,       date: 'completedAt' },
  { key: 'speaking',           label: 'Speaking',             group: 'speaking',  model: SpeakingAttempt,          date: 'createdAt',
    // aiFeedback.overallBand schema-defaults to 0 on pending/failed rows —
    // only analyzed, genuinely-answered attempts count toward the average.
    band: { $cond: [{ $and: [{ $eq: ['$status', 'analyzed'] }, { $ne: ['$aiFeedback.noGenuineAnswer', true] }] }, '$aiFeedback.overallBand', null] } },
  { key: 'essential-grammar',  label: 'Essential Grammar',    group: 'grammar',   model: EssentialGrammarAttemptLog, date: 'createdAt' },
  { key: 'vocabulary-lesson',  label: 'Vocabulary Lessons',   group: 'vocab',     model: VocabularyLessonAttemptLog, date: 'createdAt' },
  { key: 'wt1-course',         label: 'Khoá học (WT1/WT2/Speaking)', group: 'course', model: WT1Submission,     match: { status: { $ne: 'draft' } }, date: 'createdAt' },
  { key: 'mock-test',          label: 'Thi thử Full',         group: 'mock',      model: MockTestAttempt,          match: { status: { $nin: ['abandoned', 'deleted'] } }, date: 'createdAt' },
];

const dateExpr = (s) => (s.date === 'createdAt' ? '$createdAt' : { $ifNull: [`$${s.date}`, '$createdAt'] });

// Per-student counts / last activity / average band for every source.
async function userActivitySummary(userId) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const rows = await Promise.all(ACTIVITY_SOURCES.map(async (s) => {
    const match = { [s.userField || 'userId']: uid, ...(s.match || {}) };
    const pipeline = [{ $match: match }];
    if (s.perQuestion) {
      pipeline.push({ $group: {
        _id: { $ifNull: ['$sessionId', { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }] },
        at: { $max: '$createdAt' },
      } });
      pipeline.push({ $group: { _id: null, count: { $sum: 1 }, lastAt: { $max: '$at' } } });
    } else {
      pipeline.push({ $group: {
        _id: null,
        count: { $sum: 1 },
        lastAt: { $max: dateExpr(s) },
        ...(s.band ? { avgBand: { $avg: s.band } } : {}),
      } });
    }
    const [r] = await s.model.aggregate(pipeline).catch(() => []);
    return {
      key: s.key, label: s.label, group: s.group,
      count: r?.count || 0,
      lastAt: r?.lastAt || null,
      avgBand: r?.avgBand != null ? Math.round(r.avgBand * 10) / 10 : null,
    };
  }));
  return rows;
}

// Last `days` days (Asia/Ho_Chi_Minh calendar days): attempts per day and
// distinct active students per day, across every source.
async function dailyActivity(days = 14) {
  const TZ = 'Asia/Ho_Chi_Minh';
  const DAY = 24 * 60 * 60 * 1000;
  const start = new Date(Date.now() - days * DAY);
  const perSource = await Promise.all(ACTIVITY_SOURCES.map(async (s) => {
    const userField = `$${s.userField || 'userId'}`;
    const pipeline = [
      { $match: { createdAt: { $gte: start }, ...(s.match || {}) } },
    ];
    if (s.perQuestion) {
      pipeline.push({ $group: {
        _id: { u: userField, sess: { $ifNull: ['$sessionId', { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }] } },
        at: { $max: '$createdAt' },
      } });
      pipeline.push({ $project: { u: '$_id.u', at: 1 } });
    } else {
      pipeline.push({ $project: { u: userField, at: '$createdAt' } });
    }
    pipeline.push({ $group: {
      _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$at', timezone: TZ } }, u: '$u' },
      n: { $sum: 1 },
    } });
    return s.model.aggregate(pipeline).catch(() => []);
  }));

  const attempts = {};
  const users = {};
  for (const rows of perSource) {
    for (const r of rows) {
      const d = r._id.day;
      attempts[d] = (attempts[d] || 0) + r.n;
      (users[d] || (users[d] = new Set())).add(String(r._id.u));
    }
  }
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = fmt.format(new Date(Date.now() - i * DAY));
    out.push({ date: key, attempts: attempts[key] || 0, activeStudents: users[key] ? users[key].size : 0 });
  }
  return out;
}

module.exports = { ACTIVITY_SOURCES, userActivitySummary, dailyActivity };
