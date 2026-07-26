const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const dailyLimit = require('../middleware/dailyLimit');
const writingController = require('../controllers/writing.controller');

// Free-plan quotas — writing used to be entirely unlimited (see prior
// comment below); still no access-code requirement, just a daily cap for
// free users.
// examLimit gates /start (content-serving point, same convention as
// reading.js/listening.js's full-test gates).
// practiceLimit gates /practice/submit instead of /practice/task: the
// frontend (writing.js) never actually calls GET /practice/task — it
// fetches the whole task list once via /practice/tasks and picks a task
// client-side, so gating /practice/task would never trigger. The real
// per-attempt cost is a submitted practice essay consuming a teacher
// grading slot, so that's the point that matters to cap.
const examLimit = dailyLimit('writingExam', 2, 'Bạn đã dùng hết 2 lượt thi Writing miễn phí hôm nay. Nâng cấp Premium để làm bài không giới hạn, hoặc quay lại vào ngày mai.');
const practiceLimit = dailyLimit('writingPractice', 3, 'Bạn đã dùng hết 3 lượt nộp bài luyện Writing miễn phí hôm nay. Nâng cấp Premium để nộp bài không giới hạn, hoặc quay lại vào ngày mai.');

// ══════════════════════════════════════════════════
// POST /api/writing/start
// Không cần mã truy cập — writing là tính năng miễn phí
// Returns exam + random task1 + random task2
// ══════════════════════════════════════════════════
router.post('/start', auth, examLimit, writingController.startExam);

// ══════════════════════════════════════════════════
// POST /api/writing/submit
// ══════════════════════════════════════════════════
router.post('/submit', auth, writingController.submitExam);

// ══════════════════════════════════════════════════
// PRACTICE MODE – luyện Task 1 / Task 2 lẻ
// ══════════════════════════════════════════════════
router.get('/practice/tasks', auth, writingController.listPracticeTasks);
router.get('/practice/task', auth, writingController.getPracticeTask);
router.post('/practice/submit', auth, practiceLimit, writingController.submitPractice);
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
