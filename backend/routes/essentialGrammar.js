const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const essentialGrammarController = require('../controllers/essentialGrammar.controller');

// Cùng quy ước teacher/admin quản lý nội dung, chỉ admin được xoá — xem
// routes/vocabularyLesson.js.
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền' });
  }
  if (req.user.role === 'teacher' && req.method === 'DELETE') {
    return res.status(403).json({ success: false, message: 'Giáo viên không có quyền xóa nội dung' });
  }
  next();
};

const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: req => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

// Shared read limiter for the student lesson endpoints. `/lessons` now
// returns metadata only; `/lessons/:id` returns one lesson's blocks (the
// answer-carrying content, graded client-side) and the page fetches it
// once per lesson opened. A genuine session is ~1 list + a handful of
// detail fetches (cached in-memory after first open); this cap only bites
// a logged-in scraper looping every lesson. Runs AFTER `auth` so the key
// is always a user id. Admins/teachers exempt (content-management previews).
const lessonsReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  keyGenerator: req => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  handler: (req, res) => {
    logger.security('Essential Grammar lessons read rate limit exceeded', { userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' });
  },
  skip: req => ['admin', 'teacher'].includes(req.user?.role)
});

// Học sinh — danh sách bài học (metadata, KHÔNG kèm blocks) + chi tiết 1
// bài (kèm blocks). `auth` là đủ, KHÔNG cần premium: đây là nội dung tra
// cứu "miễn phí" trong 24h trial trở lên. `auth` + tách metadata/chi tiết
// để đáp án quiz/practice (chấm ở client) không còn bị scrape hàng loạt
// qua một request (audit 2026-09-10). Trang HTML vốn đã bị chặn bởi
// page-load guard trong frontend/js/auth.js.
router.get('/lessons', auth, lessonsReadLimiter, essentialGrammarController.listLessons);
router.get('/lessons/:id', auth, lessonsReadLimiter, essentialGrammarController.getLesson);

// ══════════════════════════════════════════════════════
// ADMIN — CRUD (chỉ metadata/hiển thị — không sửa blocks[], xem service).
// Đứng TRƯỚC "/:id/attempt*" ở dưới vì cùng độ sâu đường dẫn.
// ══════════════════════════════════════════════════════
router.get('/admin', auth, teacherOnly, essentialGrammarController.listAdminLessons);
router.get('/admin/:id', auth, teacherOnly, essentialGrammarController.getAdminLesson);
router.put('/admin/:id', auth, teacherOnly, adminWriteLimiter, essentialGrammarController.updateLessonMeta);
router.delete('/admin/:id', auth, teacherOnly, adminWriteLimiter, essentialGrammarController.deleteLesson);
router.patch('/admin/:id/active', auth, teacherOnly, adminWriteLimiter, essentialGrammarController.setActive);

// ADMIN — Analytics (đọc only, không cần rate limit như nhóm ghi ở trên).
router.get('/admin/:id/students', auth, teacherOnly, essentialGrammarController.getLessonStudentBreakdown);
router.get('/admin/:id/students/:userId/history', auth, teacherOnly, essentialGrammarController.getStudentAttemptHistoryAdmin);
router.get('/admin/:id/missed-questions', auth, teacherOnly, essentialGrammarController.getMostMissedQuestions);
router.get('/admin/:id/export.csv', auth, teacherOnly, essentialGrammarController.exportLessonStudentsCsv);

// ══════════════════════════════════════════════════════
// Học sinh — tiến độ. 2-3 segment nên không xung đột thứ tự với "/admin/*" ở trên.
// ══════════════════════════════════════════════════════
router.get('/:id/attempt', auth, essentialGrammarController.getAttempt);
router.post('/:id/attempt', auth, essentialGrammarController.submitAttempt);
router.get('/:id/attempt/history', auth, essentialGrammarController.getMyAttemptHistory);

module.exports = router;
