'use strict';

// Read-only data for the parent view (routes/parent.js). Everything here is
// keyed by a studentId the caller has ALREADY checked against ParentLink —
// see controllers/parent.controller.js loadLinkedChild. Nothing in this file
// writes on the child's behalf.
//
// Scores: per the owner's decision, a parent sees scores + the teacher's
// comments only — never the child's essay text, speaking transcript or
// recording, nor the AI's line-by-line corrections.

const ParentLink = require('../models/ParentLink');
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const TuitionFee = require('../models/TuitionFee');
const TestAttempt = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const WritingAttempt = require('../models/WritingAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const MockTestAttempt = require('../models/MockTestAttempt');
const { displayName } = require('../middleware/classAccess');

const SCORE_LIMIT = 20;

// Worst-first, so one "failed" class outranks a "warning" in another.
const STATUS_RANK = { failed: 4, warning: 3, active: 2, completed: 1, dropped: 1 };

async function findLink(parentId, studentId) {
  return ParentLink.findOne({ parentId, studentId }).lean();
}

// The parent's children with a quick badge row each (status, absences,
// overdue homework, unpaid tuition) — enough for the child switcher and the
// "anything wrong?" glance, without running each child's full overview.
async function listChildren(parentId) {
  const links = await ParentLink.find({ parentId }).sort({ createdAt: 1 }).lean();
  if (!links.length) return [];
  const ids = links.map((l) => l.studentId);
  const [students, enrollments, unpaid] = await Promise.all([
    User.find({ _id: { $in: ids } }).select('username firstName lastName avatar').lean(),
    ClassEnrollment.find({ studentId: { $in: ids }, removedAt: null }).select('studentId classId status stats').lean(),
    TuitionFee.aggregate([
      { $match: { studentId: { $in: ids }, isPaid: false } },
      { $group: { _id: '$studentId', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
    ]),
  ]);
  // Only running classes count toward the badges — an archived class's old
  // absences are history, not something to act on.
  const activeClassIds = new Set((await ClassGroup.find({ _id: { $in: enrollments.map((e) => e.classId) }, status: 'active' })
    .select('_id').lean()).map((c) => String(c._id)));
  const studentMap = new Map(students.map((s) => [String(s._id), s]));
  const unpaidMap = new Map(unpaid.map((u) => [String(u._id), u]));

  return links
    .map((l) => {
      const s = studentMap.get(String(l.studentId));
      if (!s) return null;
      const mine = enrollments.filter((e) => String(e.studentId) === String(l.studentId) && activeClassIds.has(String(e.classId)));
      let status = null;
      let absentTotal = 0, lateCount = 0, homeworkMissed = 0;
      for (const e of mine) {
        if ((STATUS_RANK[e.status] || 0) > (STATUS_RANK[status] || 0)) status = e.status;
        const st = e.stats || {};
        absentTotal += (st.absentUnexcused || 0) + (st.absentExcused || 0);
        lateCount += st.lateCount || 0;
        homeworkMissed += st.homeworkMissedCount || 0;
      }
      const u = unpaidMap.get(String(l.studentId));
      return {
        _id: s._id,
        name: displayName(s),
        avatar: s.avatar || '',
        relation: l.relation,
        classCount: mine.length,
        status,
        absentTotal,
        lateCount,
        homeworkMissed,
        unpaidCount: u?.count || 0,
        unpaidAmount: u?.amount || 0,
      };
    })
    .filter(Boolean);
}

// Homework, trimmed to what a parent needs: no resource links/content.
function shapeHomework(data) {
  return {
    hasClasses: !!data.hasClasses,
    assignments: (data.assignments || []).map((a) => ({
      _id: a._id, title: a.title, className: a.className, teacherName: a.teacherName,
      deadline: a.deadline, createdAt: a.createdAt, status: a.status, done: a.done, total: a.total,
    })),
  };
}

function round1(n) { return n == null ? null : Math.round(n * 10) / 10; }

async function getScores(studentId) {
  const [mocks, reading, listening, writing, speaking] = await Promise.all([
    MockTestAttempt.find({ userId: studentId, status: { $in: ['completed', 'awaiting-grading'] } })
      .sort({ createdAt: -1 }).limit(SCORE_LIMIT)
      .select('status overallBand createdAt steps.listening.band steps.reading.band steps.writing.band steps.speaking.band adminNote')
      .lean(),
    TestAttempt.find({ userId: studentId, status: { $in: ['completed', 'timeout'] } })
      .sort({ endTime: -1 }).limit(SCORE_LIMIT)
      .select('testId correctCount totalQuestions bandScore endTime mode parts')
      .populate('testId', 'name')
      .lean(),
    ListeningAttempt.find({ userId: studentId, status: { $in: ['completed', 'timeout'] } })
      .sort({ submittedAt: -1 }).limit(SCORE_LIMIT)
      .select('testId correctCount totalQuestions bandScore submittedAt mode parts')
      .populate('testId', 'name')
      .lean(),
    // Only teacher-confirmed grades: an AI draft isn't "the teacher's
    // comment" yet and may still change.
    WritingAttempt.find({ userId: studentId, gradingStatus: 'confirmed' })
      .sort({ submittedAt: -1 }).limit(SCORE_LIMIT)
      .select('examName submissionType submittedAt grading.overallBand grading.adminNote grading.confirmedAt grading.task1.bandScore grading.task1.overallFeedback grading.task2.bandScore grading.task2.overallFeedback')
      .lean(),
    // Speaking is AI-graded (no teacher review step) — bands only.
    SpeakingAttempt.find({ userId: studentId, status: 'analyzed', 'aiFeedback.noGenuineAnswer': { $ne: true } })
      .sort({ createdAt: -1 }).limit(SCORE_LIMIT)
      .select('topic part createdAt aiFeedback.overallBand aiFeedback.fluency aiFeedback.vocabulary aiFeedback.grammar aiFeedback.pronunciation aiFeedback.provisional')
      .lean(),
  ]);

  return {
    mockTests: mocks.map((m) => ({
      _id: m._id,
      date: m.createdAt,
      status: m.status,
      overallBand: m.overallBand ?? null,
      bands: {
        listening: m.steps?.listening?.band ?? null,
        reading: m.steps?.reading?.band ?? null,
        writing: m.steps?.writing?.band ?? null,
        speaking: m.steps?.speaking?.band ?? null,
      },
      teacherNote: m.adminNote || '',
    })),
    reading: reading.map((r) => ({
      _id: r._id, date: r.endTime, name: r.testId?.name || 'Reading',
      correct: r.correctCount || 0, total: r.totalQuestions || 0,
      band: r.bandScore || null, partial: Array.isArray(r.parts) && r.parts.length > 0,
      simulation: r.mode === 'simulation',
    })),
    listening: listening.map((r) => ({
      _id: r._id, date: r.submittedAt, name: r.testId?.name || 'Listening',
      correct: r.correctCount || 0, total: r.totalQuestions || 0,
      band: r.bandScore || null, partial: Array.isArray(r.parts) && r.parts.length > 0,
      simulation: r.mode === 'simulation',
    })),
    writing: writing.map((w) => ({
      _id: w._id,
      date: w.submittedAt,
      name: w.examName || (w.submissionType === 'practice' ? 'Bài luyện Writing' : 'Writing'),
      overallBand: w.grading?.overallBand ?? null,
      task1Band: w.grading?.task1?.bandScore ?? null,
      task2Band: w.grading?.task2?.bandScore ?? null,
      teacherNote: w.grading?.adminNote || '',
      task1Comment: w.grading?.task1?.overallFeedback || '',
      task2Comment: w.grading?.task2?.overallFeedback || '',
      gradedAt: w.grading?.confirmedAt || null,
    })),
    speaking: speaking.map((s) => ({
      _id: s._id,
      date: s.createdAt,
      topic: s.topic || '',
      part: s.part,
      overallBand: round1(s.aiFeedback?.overallBand) || null,
      fluency: round1(s.aiFeedback?.fluency) || null,
      vocabulary: round1(s.aiFeedback?.vocabulary) || null,
      grammar: round1(s.aiFeedback?.grammar) || null,
      pronunciation: round1(s.aiFeedback?.pronunciation) || null,
      provisional: !!s.aiFeedback?.provisional,
    })),
  };
}

module.exports = { findLink, listChildren, shapeHomework, getScores };
