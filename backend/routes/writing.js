const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const requireRewriteComplete = require('../middleware/requireRewriteComplete');
const writingController = require('../controllers/writing.controller');
const logger  = require('../utils/logger');

// Same full-access gate as Reading/Listening/Speaking/Vocab (see
// backend/utils/plan.js's hasFullAccess) — free users get every feature
// unlimited for their first 24h, then everything locks. examLimit/
// practiceLimit's old per-day quota system is gone; startExam gates the
// content-serving point (same convention as reading.js/listening.js's full-
// test gates), submitExam/submitPractice gate the point an essay would
// otherwise consume a teacher/AI grading slot for a locked-out user
// (submitExam was missing this gate — audit finding BUG-A02 — while every
// sibling submit route, reading/listening/writing-practice, already had it).
const fullAccess = requirePremium();

// A submitted essay is graded by Gemini downstream (writingAutoGrade cron /
// admin "Chấm bằng AI") — /submit triggers TWO essay grades (Task 1 + Task
// 2), /practice/submit one. Cap runaway clients / abuse the same way
// speaking.js's analyzeLimiter and reading.js's startLimiter already do:
// same 15-min window, keyed per authenticated user, admin-exempt, hard 429
// with the shared message. Thresholds are far above real student cadence
// (a human does not submit 10 full writing exams in 15 minutes) so a
// legitimate user never hits them; the essay text stays in the editor /
// autosave on a 429, so this is retry friction, never data loss.
const submitLimiter = (max) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin',
});
const examSubmitLimiter     = submitLimiter(10); // 2 Gemini grades/request — matches reading.js startLimiter
const practiceSubmitLimiter = submitLimiter(20); // 1 Gemini grade/request — matches speaking.js analyzeLimiter

// ══════════════════════════════════════════════════
// POST /api/writing/start
// Returns exam + random task1 + random task2
// ══════════════════════════════════════════════════
router.post('/start', auth, fullAccess, writingController.startExam);

// ══════════════════════════════════════════════════
// POST /api/writing/submit
// fullAccess runs before submitExam so a lapsed-trial user is rejected with
// 403 PLAN_REQUIRED before any WritingAttempt is created / streak+badge work
// runs / the attempt becomes visible to the auto-grade cron.
// examSubmitLimiter runs before the controller too — a rate-limited request
// never creates an attempt, so it never reaches Gemini grading.
// requireRewriteComplete: once 3+ graded essays sit un-rewritten, a new
// submit is blocked with 403 REWRITE_REQUIRED (mock-test Writing exempt).
// ══════════════════════════════════════════════════
router.post('/submit', auth, fullAccess, requireRewriteComplete, examSubmitLimiter, writingController.submitExam);

// ══════════════════════════════════════════════════
// PRACTICE MODE – luyện Task 1 / Task 2 lẻ
// ══════════════════════════════════════════════════
router.get('/practice/tasks', auth, fullAccess, writingController.listPracticeTasks);
router.get('/practice/task', auth, fullAccess, writingController.getPracticeTask);
router.post('/practice/submit', auth, fullAccess, requireRewriteComplete, practiceSubmitLimiter, writingController.submitPractice);
router.get('/practice/history', auth, writingController.getPracticeHistory);

// ══════════════════════════════════════════════════
// DRAFT – lưu nháp luyện viết lên server (tối đa 2 nháp mỗi taskType)
// ══════════════════════════════════════════════════
router.get('/practice/drafts', auth, writingController.getDrafts);
router.post('/practice/draft', auth, writingController.saveDraft);
router.delete('/practice/draft', auth, writingController.deleteDraft);

// ══════════════════════════════════════════════════
// GET /api/writing/unread-feedback-count
// Số bài đã được GV chấm mà học sinh chưa xem
// ══════════════════════════════════════════════════
router.get('/unread-feedback-count', auth, writingController.getUnreadFeedbackCount);

// ══════════════════════════════════════════════════
// GET /api/writing/practice/nav-counts
// Per-taskType count (unfinished drafts + unread graded feedback) for the
// nav dropdown's Task 1 / Task 2 badges
// ══════════════════════════════════════════════════
router.get('/practice/nav-counts', auth, writingController.getPracticeNavCounts);

// ══════════════════════════════════════════════════
// PATCH /api/writing/attempt/:id/mark-read
// Đánh dấu học sinh đã xem feedback
// ══════════════════════════════════════════════════
router.patch('/attempt/:id/mark-read', auth, writingController.markFeedbackRead);

// ══════════════════════════════════════════════════
// GET /api/writing/my-history
// ══════════════════════════════════════════════════
router.get('/my-history', auth, writingController.getMyHistory);

// ══════════════════════════════════════════════════
// GET /api/writing/attempt/:id
// ══════════════════════════════════════════════════
router.get('/attempt/:id', auth, writingController.getAttempt);

// ══════════════════════════════════════════════════
// "Viết lại" — the student hand-types a rewrite of a graded essay.
// GET  /api/writing/pending-rewrites   → confirmed essays still needing one
// POST /api/writing/attempt/:id/rewrite { task1, task2 }
// ══════════════════════════════════════════════════
router.get('/pending-rewrites', auth, writingController.getPendingRewrites);
router.post('/attempt/:id/rewrite', auth, fullAccess, writingController.submitRewrite);

// ══════════════════════════════════════════════════
// GET /api/writing/samples
// Students: lấy danh sách tài liệu mẫu (isActive=true)
// ══════════════════════════════════════════════════
router.get('/samples', auth, writingController.listSamples);

// ══════════════════════════════════════════════════
// GET /api/writing/sample-filters
// Trả về distinct quarters, topics, taskTypes để render filter chips
// ══════════════════════════════════════════════════
router.get('/sample-filters', auth, writingController.getSampleFilters);

module.exports = router;
