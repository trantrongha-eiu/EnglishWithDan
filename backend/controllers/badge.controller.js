'use strict';

const badgeService = require('../services/badgeService');

exports.getBadges = async (req, res) => {
  try {
    // The student's OWN badges — uses checkAndAwardNewBadges (not plain
    // getBadges) so this is also where a badge earned passively (e.g. a
    // teacher confirming a Writing grade) surfaces as "newly unlocked" the
    // next time the student is actually on the site. See
    // routes/admin/users.js for the teacher-viewing-a-student path, which
    // deliberately stays on plain getBadges() instead.
    const result = await badgeService.checkAndAwardNewBadges(req.user._id);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Badges] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
