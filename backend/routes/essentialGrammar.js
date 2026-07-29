const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
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
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

// PUBLIC — nội dung tra cứu, không cần đăng nhập (giữ nguyên hành vi cũ).
router.get('/lessons', essentialGrammarController.listLessons);

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
