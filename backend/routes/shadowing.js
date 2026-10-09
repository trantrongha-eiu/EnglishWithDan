/**
 * backend/routes/shadowing.js
 * Shadowing / Dictation on YouTube clips (frontend/shadowing.html).
 * Same access posture as Listening dictation (routes/listening.js): the
 * picker list is open to any signed-in student, opening a lesson and
 * saving a session need full access (premium / staff / first-24h trial).
 * No requireReviewComplete — an ungraded drill that never creates a
 * pending review.
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const { userRateLimiter } = require('../middleware/rateLimit');
const shadowingController = require('../controllers/shadowing.controller');

const PREMIUM_MSG = 'Bạn cần nâng cấp lên Premium để luyện tập.';
const contentLimiter = userRateLimiter({
  max: 60,
  message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'shadowing:content',
});

router.get('/lessons', auth, contentLimiter, shadowingController.listLessons);
router.get('/lessons/:slug', auth, contentLimiter, requirePremium(PREMIUM_MSG), shadowingController.getLesson);
router.post('/lessons/:slug/attempt', auth, requirePremium(PREMIUM_MSG), shadowingController.saveAttempt);

module.exports = router;
