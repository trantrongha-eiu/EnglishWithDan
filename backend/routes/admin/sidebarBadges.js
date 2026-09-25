'use strict';

// GET /api/admin/sidebar-badges
//
// One call for every count the admin Sidebar polls every 60s — it used to
// fire SIX separate requests (online-users, writing-history/counts,
// upgrade-requests, tuition admin-summary, messages/unread-count,
// mock-tests?violatedOnly) on a loop, on every admin page. This runs the
// same queries in a single Promise.all and returns them together.

const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const User = require('../../models/User');
const Message = require('../../models/Message');
const UpgradeRequest = require('../../models/UpgradeRequest');
const WritingAttempt = require('../../models/WritingAttempt');
const MockTestAttempt = require('../../models/MockTestAttempt');
const TestAttempt = require('../../models/TestAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const TuitionFee = require('../../models/TuitionFee');
const EntranceTestAttempt = require('../../models/EntranceTestAttempt');

const router = express.Router();

// Matches mockTestService's LIST_EXCLUDED_STATUSES.
const MOCK_EXCLUDED = ['abandoned', 'deleted'];

router.get('/sidebar-badges', auth, teacherOnly, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const onlineSince = new Date(Date.now() - 5 * 60 * 1000);

    // Standalone Reading/Listening/Writing "Test Simulation" mode (see
    // examSimulationService.js) — same proctor{violated} shape as
    // MockTestAttempt, but spread across 5 collections instead of one
    // (full test + "lẻ" practice, per skill). Counted the same way
    // mockViolations already is below, so a teacher gets one combined
    // signal that violated runs exist, not just for the 4-skill Mock Test.
    const simViolationFilter = { mode: 'simulation', 'proctor.violated': true };

    const [
      onlineUsers,
      writingRows,
      pendingMessages,
      mockViolations,
      simViolationCounts,
      pendingUpgrades,
      unpaidStudentIds,
      pendingEntranceReviews,
    ] = await Promise.all([
      User.find({ lastSeen: { $gte: onlineSince } }).select('username role lastSeen').lean(),
      WritingAttempt.aggregate([{ $group: { _id: '$gradingStatus', count: { $sum: 1 } } }]),
      Message.countDocuments({ toId: req.user._id, isRead: false, deletedBy: { $ne: req.user._id } }),
      MockTestAttempt.countDocuments({ status: { $nin: MOCK_EXCLUDED }, 'proctor.violated': true }),
      Promise.all([
        TestAttempt.countDocuments(simViolationFilter),
        ListeningAttempt.countDocuments(simViolationFilter),
        WritingAttempt.countDocuments(simViolationFilter),
        ReadingPracticeAttempt.countDocuments(simViolationFilter),
        ListeningPracticeAttempt.countDocuments(simViolationFilter),
      ]),
      // Admin-only surfaces — a plain teacher's individual fetches to these
      // already 403'd (and the badge stayed 0), so don't leak them here.
      isAdmin ? UpgradeRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0),
      isAdmin ? TuitionFee.distinct('studentId', { isPaid: false }) : Promise.resolve([]),
      // Entrance Test results compiled and waiting for a teacher's approval.
      EntranceTestAttempt.countDocuments({ resultStatus: 'PENDING_REVIEW' }),
    ]);

    const wc = { pending: 0, ai_done: 0 };
    writingRows.forEach(r => { if (r._id in wc) wc[r._id] = r.count; });

    res.json({
      success: true,
      onlineUsers,
      pendingGrades: wc.pending + wc.ai_done,
      pendingUpgrades,
      pendingTuition: unpaidStudentIds.length,
      pendingMessages,
      mockViolations,
      simViolations: simViolationCounts.reduce((a, b) => a + b, 0),
      pendingEntranceReviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
