/**
 * backend/routes/listening.js
 * Student làm bài — admin CRUD routes moved to routes/admin/listening.js
 * (2026-07-25, admin panel audit finding #7: this file used to mix admin
 * and student routes under /api/listening, so the admin ones were reachable
 * at the inconsistent /api/listening/admin/* shape instead of /api/admin/*
 * like every other content type's admin routes).
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const requireReviewComplete = require('../middleware/requireReviewComplete');
const { userRateLimiter } = require('../middleware/rateLimit');
const listeningController = require('../controllers/listening.controller');

// Mirrors routes/reading.js. See middleware/rateLimit.js — per-user key,
// IP fallback, staff bypass, 429 { success:false, message }. These are a
// scraping speed bump layered on top of the existing auth / requirePremium
// / requireReviewComplete gates, not a replacement for any of them.
//   - content   60/15min : one fetch per section OPENED (+ reloads/retries)
//   - answerKey  30/15min : one fetch per practice completed; no human does 30/15min
//   - start      10/15min : full-test payload; matches reading's /start (admin-only bypass)
const contentLimiter = userRateLimiter({
  max: 60,
  message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'listening:content',
});
const answerKeyLimiter = userRateLimiter({
  max: 30,
  message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'listening:answer-key',
});
const startLimiter = userRateLimiter({
  max: 10,
  message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.',
  skipRoles: ['admin'],
  name: 'listening:start',
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Danh sách đề (kèm lịch sử làm bài của user)
// STUDENT – Bài lẻ practice
// ══════════════════════════════════════════════════════════════════════════════
router.get('/practice/list', auth, contentLimiter, listeningController.listPracticeSections);
router.get('/practice/by-id/:id', auth, contentLimiter, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), requireReviewComplete('listening'), listeningController.getPracticeSectionById);
router.get('/practice/answer-key/:id', auth, answerKeyLimiter, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), listeningController.getSectionAnswerKey);

// STUDENT – Dictation practice (chép chính tả từng câu) — lists whichever
// sections have already been through scripts/bulkAlignListeningDictation.js.
router.get('/dictation/list', auth, contentLimiter, listeningController.listDictationSections);
// Fetch one section's full data (audioUrl + dictationSentences + transcript)
// for the dictation player. Dedicated route — same content + premium gate as
// /practice/by-id/:id, but WITHOUT requireReviewComplete: dictation is an
// ungraded transcription drill that never creates a pending review, so the
// mandatory-review pile-up gate must not apply. Previously this was
// /practice/by-id/:id?purpose=dictation, i.e. a client-supplied query param
// switching off the gate — replaced so nothing turns the gate off from the
// request side (audit finding BUG-A01).
router.get('/dictation/section/:id', auth, contentLimiter, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), listeningController.getPracticeSectionById);
// requirePremium added (audit finding BUG-A11) — this creates a real
// DictationAttempt (feeds admin's "Lịch sử làm bài" + dictation stats), yet
// was the one practice-save route with no plan gate. Same posture as
// reading/listening /practice/save (BUG-009) and the section-fetch route
// just above: full access for a free account's first 24h, then locked.
router.post('/dictation/save-attempt', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), listeningController.saveDictationAttempt);

// ══════════════════════════════════════════════════════════════════════════════
router.get('/tests', auth, listeningController.listStudentTests);

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lấy full đề để làm bài (yêu cầu Premium)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/start', auth, startLimiter, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi này'), requireReviewComplete('listening'), listeningController.startTest);

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Nộp bài, chấm điểm & lưu attempt
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/submit', auth, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi này'), listeningController.submitTest);

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lịch sử làm bài của bản thân
// ══════════════════════════════════════════════════════════════════════════════
router.get('/history', auth, listeningController.getHistory);

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Chi tiết 1 attempt (xem lại bài cũ)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/history/:attemptId', auth, listeningController.getHistoryDetail);

// ─────────────────────────────────────────────────────────────────────────────
// requirePremium added (audit finding BUG-009) — this creates a real
// ListeningPracticeAttempt (feeding history + the mandatory-review system),
// yet had no premium check at all: a lapsed-trial user could call it
// directly with any sectionId, including one they never legitimately
// fetched (practice/by-id/:id, already premium-gated).
router.post('/practice/save', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), listeningController.savePractice);
router.get('/practice/history', auth, listeningController.getPracticeHistory);
router.get('/practice/history/:attemptId', auth, listeningController.getPracticeHistoryDetail);

module.exports = router;
