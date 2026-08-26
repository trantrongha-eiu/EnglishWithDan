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
const listeningController = require('../controllers/listening.controller');

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Danh sách đề (kèm lịch sử làm bài của user)
// STUDENT – Bài lẻ practice
// ══════════════════════════════════════════════════════════════════════════════
router.get('/practice/list', auth, listeningController.listPracticeSections);
router.get('/practice/by-id/:id', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), requireReviewComplete('listening'), listeningController.getPracticeSectionById);
router.get('/practice/answer-key/:id', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), listeningController.getSectionAnswerKey);

// STUDENT – Dictation practice (chép chính tả từng câu) — lists whichever
// sections have already been through scripts/bulkAlignListeningDictation.js;
// fetching one section's full data (audioUrl + dictationSentences) reuses
// /practice/by-id/:id above, which already returns the whole document.
router.get('/dictation/list', auth, listeningController.listDictationSections);
router.post('/dictation/save-attempt', auth, listeningController.saveDictationAttempt);

// ══════════════════════════════════════════════════════════════════════════════
router.get('/tests', auth, listeningController.listStudentTests);

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lấy full đề để làm bài (yêu cầu Premium)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/start', auth, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi này'), requireReviewComplete('listening'), listeningController.startTest);

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
router.post('/practice/save', auth, listeningController.savePractice);
router.get('/practice/history', auth, listeningController.getPracticeHistory);
router.get('/practice/history/:attemptId', auth, listeningController.getPracticeHistoryDetail);

module.exports = router;
