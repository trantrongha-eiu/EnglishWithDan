const router = require('express').Router();
const auth = require('../middleware/auth');
const vocabController = require('../controllers/vocab.controller');

// Middleware chỉ cho teacher/admin
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền' });
  }
  if (req.user.role === 'teacher' && req.method === 'DELETE') {
    return res.status(403).json({ success: false, message: 'Giáo viên không có quyền xóa nội dung' });
  }
  next();
};

// ══════════════════════════════════════════════════════
// PUBLIC (học sinh – cần đăng nhập)
// ══════════════════════════════════════════════════════
router.get('/units', auth, vocabController.listUnits);
router.get('/unit/:number', auth, vocabController.getUnit);

// ══════════════════════════════════════════════════════
// ADMIN – quản lý vocab units
// ══════════════════════════════════════════════════════
router.get('/admin/units', auth, teacherOnly, vocabController.listAdminUnits);
router.get('/admin/units/:id', auth, teacherOnly, vocabController.getAdminUnit);
router.post('/admin/units', auth, teacherOnly, vocabController.createUnit);
router.put('/admin/units/:id', auth, teacherOnly, vocabController.updateUnit);
router.delete('/admin/units/:id', auth, teacherOnly, vocabController.deleteUnit);
router.patch('/admin/units/reorder', auth, teacherOnly, vocabController.reorderUnits);

// ── Word management trong unit ──────────────────────────────────────────────
router.post('/admin/units/:id/words', auth, teacherOnly, vocabController.addWord);
router.put('/admin/units/:id/words/:wordIndex', auth, teacherOnly, vocabController.updateWord);
router.delete('/admin/units/:id/words/:wordIndex', auth, teacherOnly, vocabController.deleteWord);
router.post('/admin/units/:id/words/bulk', auth, teacherOnly, vocabController.bulkAddWords);

router.post('/admin/units/:id/split', auth, teacherOnly, vocabController.splitUnit);
router.post('/admin/split-all', auth, teacherOnly, vocabController.splitAllUnits);
router.post('/admin/import', auth, teacherOnly, vocabController.importUnits);

module.exports = router;
