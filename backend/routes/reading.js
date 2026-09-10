const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const requireReviewComplete = require('../middleware/requireReviewComplete');
const { userRateLimiter } = require('../middleware/rateLimit');
const readingController = require('../controllers/reading.controller');

// Chặn brute-force key: tối đa 10 lần start / 15 phút / user. Behavior
// unchanged from the previous inline limiter (per-user key, IP fallback,
// admin-only bypass, same 429 body) — now via the shared factory.
const startLimiter = userRateLimiter({
  max: 10,
  message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.',
  skipRoles: ['admin'],
  name: 'reading:start',
});

// Content fetch: one request per passage OPENED (the payload already
// carries every question in that passage), plus the odd reload / mobile
// retry. A keen student runs maybe 15-40 of these in 15 min; 60 leaves
// head-room while throttling a script that's walking the whole bank.
// Staff (teacher preview) bypass.
const contentLimiter = userRateLimiter({
  max: 60,
  message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'reading:content',
});

// Answer key: highest-value payload, fetched once per practice completed
// (at submit time). No human finishes 30 reading passages in 15 min, so
// this can't pinch a real student — it just halves a scraper's harvest
// rate on the answers specifically.
const answerKeyLimiter = userRateLimiter({
  max: 30,
  message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'reading:answer-key',
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
router.get('/practice/list', auth, contentLimiter, readingController.listPracticePassages);

// GET /api/reading/practice/by-id/:id
router.get('/practice/by-id/:id', auth, contentLimiter, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), requireReviewComplete('reading'), readingController.getPracticePassageById);

// GET /api/reading/practice/answer-key/:id — fetched only at submit time
router.get('/practice/answer-key/:id', auth, answerKeyLimiter, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), readingController.getPassageAnswerKey);

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
router.get('/practice/:category', auth, contentLimiter, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), requireReviewComplete('reading'), readingController.getRandomPracticePassage);

module.exports = router;
