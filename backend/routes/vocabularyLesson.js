const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const ctrl = require('../controllers/vocabularyLesson.controller');

// Cùng quy ước với routes/vocab.js: teacher/admin quản lý nội dung,
// nhưng chỉ admin mới được xoá.
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền' });
  }
  if (req.user.role === 'teacher' && req.method === 'DELETE') {
    return res.status(403).json({ success: false, message: 'Giáo viên không có quyền xóa nội dung' });
  }
  next();
};

// Cùng chiến lược rate limit đã dùng cho routes/task2Practice.js's /check
// (endpoint tốn kém, cần chặn spam/lạm dụng) — áp dụng cho các thao tác ghi
// của Vocabulary Lessons: parse (CPU-bound), import/reimport (parse + ghi
// DB), update, delete. Đặt SAU `auth` để keyGenerator đọc được req.user.
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

// ══════════════════════════════════════════════════════
// PUBLIC (học sinh – cần đăng nhập) — danh sách trước
// ══════════════════════════════════════════════════════
router.get('/', auth, ctrl.listPublicLessons);

// ══════════════════════════════════════════════════════
// ADMIN — Parse / Import (không lưu gì cho tới khi hợp lệ)
// ══════════════════════════════════════════════════════
router.post('/admin/parse', auth, teacherOnly, adminWriteLimiter, ctrl.parseText);
router.post('/admin/import', auth, teacherOnly, adminWriteLimiter, ctrl.importLesson);
router.put('/admin/:id/reimport', auth, teacherOnly, adminWriteLimiter, ctrl.reimportLesson);

// ══════════════════════════════════════════════════════
// ADMIN — Import History (đứng TRƯỚC "/admin/:id" GET vì cùng độ sâu
// đường dẫn — nếu đứng sau sẽ bị "/admin/:id" nuốt mất "import-history"
// làm giá trị :id).
// ══════════════════════════════════════════════════════
router.get('/admin/import-history', auth, teacherOnly, ctrl.listImportHistory);
router.get('/admin/import-history/:id', auth, teacherOnly, ctrl.getImportHistoryEntry);

// ══════════════════════════════════════════════════════
// ADMIN — CRUD
// ══════════════════════════════════════════════════════
router.get('/admin', auth, teacherOnly, ctrl.listAdminLessons);
router.get('/admin/:id', auth, teacherOnly, ctrl.getAdminLesson);
router.put('/admin/:id', auth, teacherOnly, adminWriteLimiter, ctrl.updateLessonMeta);
router.delete('/admin/:id', auth, teacherOnly, adminWriteLimiter, ctrl.deleteLesson);
router.patch('/admin/:id/publish', auth, teacherOnly, adminWriteLimiter, ctrl.setPublished);
router.post('/admin/:id/duplicate', auth, teacherOnly, ctrl.duplicateLesson);

// ══════════════════════════════════════════════════════
// ADMIN — Analytics (đọc only, không cần rate limit như nhóm ghi ở trên).
// Đường dẫn 2-3 segment dưới "/admin/:id/..." nên không xung đột với
// "/admin/:id" (1 segment) hay "/admin/:id/reimport|publish|duplicate"
// (segment cuối khác tên) ở trên.
// ══════════════════════════════════════════════════════
router.get('/admin/:id/students', auth, teacherOnly, ctrl.getLessonStudentBreakdown);
router.get('/admin/:id/students/:userId/history', auth, teacherOnly, ctrl.getStudentAttemptHistoryAdmin);
router.get('/admin/:id/missed-words', auth, teacherOnly, ctrl.getMostMissedWords);
router.get('/admin/:id/export.csv', auth, teacherOnly, ctrl.exportLessonStudentsCsv);

// ══════════════════════════════════════════════════════
// PUBLIC — chi tiết 1 bài học, phải đứng SAU khối /admin ở trên
// ══════════════════════════════════════════════════════
router.get('/:id', auth, ctrl.getPublicLesson);

// Tiến độ học — 2-3 segment nên không xung đột thứ tự với "/:id" hay "/admin/*" ở trên.
router.get('/:id/attempt', auth, ctrl.getAttempt);
router.post('/:id/attempt', auth, ctrl.submitAttempt);
router.get('/:id/attempt/history', auth, ctrl.getMyAttemptHistory);

module.exports = router;
