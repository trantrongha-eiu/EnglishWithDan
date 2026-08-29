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
const TuitionFee = require('../../models/TuitionFee');
const { REWRITE_CUTOFF } = require('../../services/writingService');

const router = express.Router();

// Matches mockTestService's LIST_EXCLUDED_STATUSES.
const MOCK_EXCLUDED = ['abandoned', 'deleted'];

router.get('/sidebar-badges', auth, teacherOnly, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const onlineSince = new Date(Date.now() - 5 * 60 * 1000);

    const [
      onlineUsers,
      writingRows,
      pendingMessages,
      mockViolations,
      pendingUpgrades,
      unpaidStudentIds,
    ] = await Promise.all([
      User.find({ lastSeen: { $gte: onlineSince } }).select('username role lastSeen').lean(),
      WritingAttempt.aggregate([{ $group: { _id: '$gradingStatus', count: { $sum: 1 } } }]),
      Message.countDocuments({ toId: req.user._id, isRead: false, deletedBy: { $ne: req.user._id } }),
      MockTestAttempt.countDocuments({ status: { $nin: MOCK_EXCLUDED }, 'proctor.violated': true }),
      // Admin-only surfaces — a plain teacher's individual fetches to these
      // already 403'd (and the badge stayed 0), so don't leak them here.
      isAdmin ? UpgradeRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0),
      isAdmin ? TuitionFee.distinct('studentId', { isPaid: false }) : Promise.resolve([]),
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
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
