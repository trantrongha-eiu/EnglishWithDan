/**
 * backend/routes/listening.js
 * Admin quản lý đề nghe + Student làm bài
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const listeningController = require('../controllers/listening.controller');

const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  if (req.user.role === 'teacher' && req.method === 'DELETE') {
    return res.status(403).json({ success: false, message: 'Giáo viên không có quyền xóa nội dung' });
  }
  next();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file audio'));
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – CRUD Tests
// ══════════════════════════════════════════════════════════════════════════════
router.get('/admin/tests', auth, teacherOnly, listeningController.listAdminTests);
router.get('/admin/tests/:id', auth, teacherOnly, listeningController.getAdminTest);
router.post('/admin/tests', auth, teacherOnly, listeningController.createAdminTest);
router.put('/admin/tests/:id', auth, teacherOnly, listeningController.updateAdminTest);
router.delete('/admin/tests/:id', auth, teacherOnly, listeningController.hideAdminTest);
router.delete('/admin/tests/:id/permanent', auth, teacherOnly, listeningController.deleteAdminTestPermanent);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Upload Audio
// ══════════════════════════════════════════════════════════════════════════════
router.post('/admin/tests/:id/audio', auth, teacherOnly, upload.single('audio'), listeningController.uploadTestAudio);
router.post('/admin/upload-audio', auth, teacherOnly, upload.single('audio'), listeningController.uploadStandaloneAudio);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Upload Map/Diagram Image
// ══════════════════════════════════════════════════════════════════════════════
router.post('/admin/upload-map-image', auth, teacherOnly, listeningController.uploadMapImage);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Transcript (per section)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/admin/tests/:id/transcript', auth, teacherOnly, listeningController.updateTranscript);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Lịch sử tất cả học viên (cho trang admin)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/admin/attempts', auth, teacherOnly, listeningController.listAdminAttempts);
router.get('/admin/attempts/stats', auth, teacherOnly, listeningController.getAdminAttemptsStats);

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Danh sách đề (kèm lịch sử làm bài của user)
// STUDENT – Bài lẻ practice
// ══════════════════════════════════════════════════════════════════════════════
router.get('/practice/list', auth, listeningController.listPracticeSections);
router.get('/practice/by-id/:id', auth, listeningController.getPracticeSectionById);

// ── Admin CRUD cho practice sections ──────────────────────────────────────────
router.get('/admin/sections', auth, teacherOnly, listeningController.listAdminSections);
router.get('/admin/sections/:id', auth, teacherOnly, listeningController.getAdminSection);
router.post('/admin/sections', auth, teacherOnly, listeningController.createAdminSection);
router.put('/admin/sections/:id', auth, teacherOnly, listeningController.updateAdminSection);
router.delete('/admin/sections/:id', auth, teacherOnly, listeningController.hideAdminSection);
router.delete('/admin/sections/:id/permanent', auth, teacherOnly, listeningController.deleteAdminSectionPermanent);
router.post('/admin/sections/:id/audio', auth, teacherOnly, upload.single('audio'), listeningController.uploadSectionAudio);

// POST /api/listening/admin/assemble – tạo ListeningTest từ 4 ListeningSection
router.post('/admin/assemble', auth, teacherOnly, listeningController.assembleTest);

// ══════════════════════════════════════════════════════════════════════════════
router.get('/tests', auth, listeningController.listStudentTests);

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lấy full đề để làm bài (yêu cầu Premium)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/start', auth, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi này'), listeningController.startTest);

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
