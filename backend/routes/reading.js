const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const readingController = require('../controllers/reading.controller');
const logger = require('../utils/logger');

// Chặn brute-force key: tối đa 10 lần start / 15 phút / user
const startLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

// GET /api/reading/tests
router.get('/tests', auth, readingController.listTests);

// POST /api/reading/start
router.post('/start', auth, startLimiter, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi này'), readingController.startTest);

// POST /api/reading/submit
router.post('/submit', auth, readingController.submitTest);

// GET /api/reading/attempt/:id/review
router.get('/attempt/:id/review', auth, readingController.getAttemptReview);

// GET /api/reading/history
router.get('/history', auth, readingController.getHistory);

// GET /api/reading/practice/list?category=passage1
router.get('/practice/list', auth, readingController.listPracticePassages);

// GET /api/reading/practice/by-id/:id
router.get('/practice/by-id/:id', auth, readingController.getPracticePassageById);

// POST /api/reading/practice/save
router.post('/practice/save', auth, readingController.savePractice);

// GET /api/reading/practice/history
// (MUST be before /practice/:category to avoid wildcard match)
router.get('/practice/history', auth, readingController.getPracticeHistory);

// GET /api/reading/practice/history/:attemptId
// (MUST be before /practice/:category to avoid wildcard match)
router.get('/practice/history/:attemptId', auth, readingController.getPracticeHistoryDetail);

// GET /api/reading/practice/:category
// (Wildcard — must be LAST among /practice/* GET routes)
router.get('/practice/:category', auth, readingController.getRandomPracticePassage);

module.exports = router;
