const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const writingController = require('../controllers/writing.controller');

// ══════════════════════════════════════════════════
// POST /api/writing/start
// Không cần mã truy cập — writing là tính năng miễn phí
// Returns exam + random task1 + random task2
// ══════════════════════════════════════════════════
router.post('/start', auth, writingController.startExam);

// ══════════════════════════════════════════════════
// POST /api/writing/submit
// ══════════════════════════════════════════════════
router.post('/submit', auth, writingController.submitExam);

// ══════════════════════════════════════════════════
// PRACTICE MODE – luyện Task 1 / Task 2 lẻ
// ══════════════════════════════════════════════════
router.get('/practice/tasks', auth, writingController.listPracticeTasks);
router.get('/practice/task', auth, writingController.getPracticeTask);
router.post('/practice/submit', auth, writingController.submitPractice);
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
