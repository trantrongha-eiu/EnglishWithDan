const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const auth    = require('../middleware/auth');
const tuitionController = require('../controllers/tuition.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận ảnh PNG/JPEG/WebP'));
  }
});

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Chỉ admin' });
  next();
};

// ────────────────────────────────────────────────
// SETTINGS (bank info, QR)
// ────────────────────────────────────────────────
router.get('/settings', auth, tuitionController.getSettings);
router.put('/settings', auth, adminOnly, tuitionController.updateSettings);
router.post('/settings/qr', auth, adminOnly, upload.single('qr'), tuitionController.uploadQr);
router.delete('/settings/qr', auth, adminOnly, tuitionController.deleteQr);

// ────────────────────────────────────────────────
// ADMIN — manage fees
// ────────────────────────────────────────────────
router.get('/', auth, adminOnly, tuitionController.listFees);
router.get('/summary', auth, adminOnly, tuitionController.getSummary);
router.get('/admin-summary', auth, adminOnly, tuitionController.getAdminSummary);
router.get('/students-list', auth, adminOnly, tuitionController.listStudents);
router.post('/', auth, adminOnly, tuitionController.createFee);
router.put('/:id', auth, adminOnly, tuitionController.updateFee);
router.delete('/:id', auth, adminOnly, tuitionController.deleteFee);
router.post('/:id/remind', auth, adminOnly, tuitionController.sendReminder);
router.post('/remind-bulk', auth, adminOnly, tuitionController.sendBulkReminders);

// ────────────────────────────────────────────────
// STUDENT — view own fees + notify payment
// ────────────────────────────────────────────────
router.get('/my/summary', auth, tuitionController.getMySummary);
router.get('/my', auth, tuitionController.getMyFees);
router.post('/:id/notify', auth, tuitionController.notifyPayment);

module.exports = router;
