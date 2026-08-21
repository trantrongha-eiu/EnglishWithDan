const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const badgeController = require('../controllers/badge.controller');

// Not premium-gated — same as the streak/leaderboard widgets already on
// the free dashboard (routes/user.js's /stats, userService.getStreakLeaderboard):
// badges are a read of the student's OWN history, not practice content.
//
// GET /api/badges — full catalog with earned/locked + progress per badge.
// See backend/services/badgeService.js for how "earned" is computed.
router.get('/', auth, badgeController.getBadges);

module.exports = router;
