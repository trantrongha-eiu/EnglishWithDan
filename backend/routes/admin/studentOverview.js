'use strict';

// GET /api/admin/users/:id/overview — one read-only "learning profile" for
// the admin Chi tiết học sinh page. Before this, that page could show only
// the account row + the attempt feed; goals, streak, class enrollments,
// course progress, mock/entrance results, paraphrase SRS and difficult
// words had no admin surface at all (docs/ADMIN_AUDIT_2026-09-25.md §4).
//
// Scoping: a teacher sees only enrollments in classes they run (same rule
// as middleware/classAccess.js); tuition is admin-only (same as /tuition).

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const { teacherOnly, effectiveStreak } = require('./_shared');
const { userActivitySummary } = require('../../services/adminActivityService');

const User = require('../../models/User');
const ClassEnrollment = require('../../models/ClassEnrollment');
const AssignmentProgress = require('../../models/AssignmentProgress');
const MockTestAttempt = require('../../models/MockTestAttempt');
const EntranceTestAttempt = require('../../models/EntranceTestAttempt');
const WT1Progress = require('../../models/WT1Progress');
const ParaphraseProgress = require('../../models/ParaphraseProgress');
const DifficultWord = require('../../models/DifficultWord');
const TuitionFee = require('../../models/TuitionFee');

const router = express.Router();

router.get('/users/:id/overview', auth, teacherOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID học sinh không hợp lệ' });
    }
    const uid = new mongoose.Types.ObjectId(id);
    const isAdmin = req.user.role === 'admin';

    const user = await User.findById(uid)
      .select('role targetBand currentBand currentBandSource targetExamDate weeklyStudyMinutes studyDays preferredSessionMinutes studyMotto learningStreak maxLearningStreak lastActivityDate streakHammers totalStudyMinutes trialStartedAt emailVerified authProvider')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const now = new Date();
    const [
      activity, enrollments, homework, mockTests, entrance, courseProgress,
      paraphraseTotal, paraphraseDue, difficultWords, unpaidFees,
    ] = await Promise.all([
      userActivitySummary(uid),
      ClassEnrollment.find({ studentId: uid, removedAt: null })
        .populate('classId', 'name courseName status teacherId')
        .select('classId status statusReason stats enrolledAt')
        .lean(),
      AssignmentProgress.aggregate([
        { $match: { studentId: uid } },
        { $group: { _id: null, assignments: { $sum: 1 }, done: { $sum: { $cond: [{ $and: [{ $gt: ['$totalCount', 0] }, { $gte: ['$completedCount', '$totalCount'] }] }, 1, 0] } } } },
      ]),
      MockTestAttempt.find({ userId: uid, status: { $nin: ['abandoned', 'deleted'] } })
        .sort({ createdAt: -1 }).limit(5)
        .select('status overallBand createdAt steps.listening.band steps.reading.band steps.writing.band steps.speaking.band proctor.violated')
        .lean(),
      EntranceTestAttempt.findOne({ userId: uid })
        .sort({ createdAt: -1 })
        .select('status resultStatus overallBand createdAt submittedAt')
        .lean(),
      WT1Progress.aggregate([
        { $match: { userId: uid } },
        { $group: {
          _id: '$courseCode',
          lessonsStarted: { $sum: 1 },
          lessonsCompleted: { $sum: { $cond: [{ $ifNull: ['$completedAt', false] }, 1, 0] } },
          exercisesCompleted: { $sum: { $size: { $ifNull: ['$completedExercises', []] } } },
          lastCompletedAt: { $max: '$completedAt' },
        } },
      ]),
      ParaphraseProgress.countDocuments({ userId: uid }),
      ParaphraseProgress.countDocuments({ userId: uid, nextReviewAt: { $ne: null, $lte: now } }),
      DifficultWord.countDocuments({ userId: uid }),
      isAdmin
        ? TuitionFee.aggregate([
          { $match: { studentId: uid, isPaid: false } },
          { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } },
        ])
        : Promise.resolve(null),
    ]);

    const visibleEnrollments = enrollments.filter(e =>
      e.classId && (isAdmin || String(e.classId.teacherId) === String(req.user._id)));

    res.json({
      success: true,
      overview: {
        goal: {
          targetBand: user.targetBand ?? null,
          currentBand: user.currentBand ?? null,
          currentBandSource: user.currentBandSource ?? null,
          targetExamDate: user.targetExamDate ?? null,
          weeklyStudyMinutes: user.weeklyStudyMinutes ?? null,
          studyDays: user.studyDays || [],
          preferredSessionMinutes: user.preferredSessionMinutes ?? null,
          studyMotto: user.studyMotto || '',
        },
        streak: {
          current: effectiveStreak(user.learningStreak, user.lastActivityDate),
          max: user.maxLearningStreak || 0,
          hammers: user.streakHammers || 0,
          lastActivityDate: user.lastActivityDate || null,
          totalStudyMinutes: user.totalStudyMinutes || 0,
        },
        activity,
        classes: visibleEnrollments.map(e => ({
          classId: e.classId._id,
          name: e.classId.name,
          courseName: e.classId.courseName || '',
          classStatus: e.classId.status,
          status: e.status,
          statusReason: e.statusReason || '',
          attendanceRate: e.stats?.attendanceRate ?? null,
          heldSessions: e.stats?.heldSessions ?? 0,
          attendedCount: e.stats?.attendedCount ?? 0,
          homeworkMissedCount: e.stats?.homeworkMissedCount ?? 0,
          enrolledAt: e.enrolledAt,
        })),
        homework: homework[0] ? { assignments: homework[0].assignments, completed: homework[0].done } : { assignments: 0, completed: 0 },
        mockTests: mockTests.map(m => ({
          _id: m._id, status: m.status, overallBand: m.overallBand ?? null, createdAt: m.createdAt,
          bands: {
            listening: m.steps?.listening?.band ?? null, reading: m.steps?.reading?.band ?? null,
            writing: m.steps?.writing?.band ?? null, speaking: m.steps?.speaking?.band ?? null,
          },
          violated: !!m.proctor?.violated,
        })),
        entranceTest: entrance ? {
          _id: entrance._id, status: entrance.status, resultStatus: entrance.resultStatus,
          overallBand: entrance.overallBand ?? null, date: entrance.submittedAt || entrance.createdAt,
        } : null,
        courses: courseProgress.map(c => ({
          courseCode: c._id, lessonsStarted: c.lessonsStarted, lessonsCompleted: c.lessonsCompleted,
          exercisesCompleted: c.exercisesCompleted, lastCompletedAt: c.lastCompletedAt || null,
        })),
        paraphrase: { tracked: paraphraseTotal, due: paraphraseDue },
        difficultWords,
        tuition: unpaidFees ? { unpaidCount: unpaidFees[0]?.count || 0, unpaidAmount: unpaidFees[0]?.amount || 0 } : null,
      },
    });
  } catch (err) {
    console.error('[Admin student overview]', err);
    res.status(500).json({ success: false, message: 'Không tải được hồ sơ học tập' });
  }
});

module.exports = router;
