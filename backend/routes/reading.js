const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const requireReviewComplete = require('../middleware/requireReviewComplete');
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
router.post('/start', auth, startLimiter, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi này'), requireReviewComplete('reading'), readingController.startTest);

// POST /api/reading/submit
// requirePremium added to match Listening's equivalent route
// (/tests/:id/submit, already gated) — a lapsed-trial user could otherwise
// submit a still-open TestAttempt (created via /start, itself already
// premium-gated) at any point after their access expired (audit finding
// BUG-008). Same acceptable edge case Listening's submit already lives
// with today: a session whose access lapses in the narrow window between
// start and submit gets a 403 on submit — not new risk, just Reading
// catching up to Listening's already-proven behavior.
router.post('/submit', auth, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi này'), readingController.submitTest);

// GET /api/reading/attempt/:id/review
router.get('/attempt/:id/review', auth, readingController.getAttemptReview);

// GET /api/reading/history
router.get('/history', auth, readingController.getHistory);

// GET /api/reading/practice/list?category=passage1
router.get('/practice/list', auth, readingController.listPracticePassages);

// GET /api/reading/practice/by-id/:id
router.get('/practice/by-id/:id', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), requireReviewComplete('reading'), readingController.getPracticePassageById);

// GET /api/reading/practice/answer-key/:id — fetched only at submit time
router.get('/practice/answer-key/:id', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), readingController.getPassageAnswerKey);

// POST /api/reading/practice/save
// requirePremium added (audit finding BUG-009) — this creates a real
// ReadingPracticeAttempt (feeding history + the mandatory-review system),
// yet had no premium check at all: a lapsed-trial user could call it
// directly with any passageId, including one they never legitimately
// fetched (practice/by-id/:id, already premium-gated).
router.post('/practice/save', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), readingController.savePractice);

// GET /api/reading/practice/history
// (MUST be before /practice/:category to avoid wildcard match)
router.get('/practice/history', auth, readingController.getPracticeHistory);

// GET /api/reading/practice/history/:attemptId
// (MUST be before /practice/:category to avoid wildcard match)
router.get('/practice/history/:attemptId', auth, readingController.getPracticeHistoryDetail);

// GET /api/reading/practice/:category
// (Wildcard — must be LAST among /practice/* GET routes)
// requireReviewComplete + answer-key stripping added to match /practice/by-id/:id
// (security audit finding BUG-001: this route was missing both — it skipped
// the review gate entirely and returned raw correctAnswer/explanation for
// every question before the student had answered anything).
router.get('/practice/:category', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), requireReviewComplete('reading'), readingController.getRandomPracticePassage);

module.exports = router;
