'use strict';
// Affiliate / referral program — student side (see services/affiliateService.js).

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const auth = require('../middleware/auth');
const affiliateService = require('../services/affiliateService');

function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err.status && err.status < 500) return res.status(err.status).json({ success: false, message: err.message });
      console.error('[Affiliate] error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

// Public beacon: one per browser per code (visit-tracker.js), dropped
// silently when over the per-IP limit — counting must never affect the page.
const clickLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(204).end(),
});

// POST /api/affiliate/click { code }
router.post('/click', clickLimiter, guard(async (req, res) => {
  await affiliateService.recordClick(req.body?.code);
  res.status(204).end();
}));

// GET /api/affiliate/info — public: the home page's "Giới thiệu bạn bè"
// block shows the current terms to visitors who are not logged in
router.get('/info', guard(async (req, res) => {
  const settings = affiliateService.publicSettings(await affiliateService.getSettings());
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ success: true, ...settings });
}));

// POST /api/affiliate/claim { code } — new account's first login via a link
router.post('/claim', auth, guard(async (req, res) => {
  const result = await affiliateService.claimReferral(req.user._id, req.body?.code);
  res.json({ success: result.status === 'ok', status: result.status });
}));

// GET /api/affiliate/me — link, stats, referrals, commissions, payouts
router.get('/me', auth, guard(async (req, res) => {
  res.json({ success: true, ...(await affiliateService.getMyAffiliate(req.user._id)) });
}));

// POST /api/affiliate/rewards/:id/choose { choice: 'cash' | 'credit' } —
// a referred student's first tuition payment: money into the wallet, or a
// discount off the referrer's own tuition
router.post('/rewards/:id/choose', auth, guard(async (req, res) => {
  const reward = await affiliateService.chooseReward(req.user._id, req.params.id, req.body?.choice);
  res.json({ success: true, reward });
}));

// Bank QR image for payouts — same limits as the tuition QR upload
const qrUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Chỉ nhận ảnh PNG, JPG hoặc WebP'), { status: 400 }));
  },
}).single('qr');

function withQrFile(req, res, next) {
  qrUpload(req, res, (err) => {
    if (!err) return next();
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    res.status(400).json({ success: false, message: tooBig ? 'Ảnh QR tối đa 5MB' : err.message });
  });
}

// POST /api/affiliate/bank-qr (multipart, field "qr")
router.post('/bank-qr', auth, withQrFile, guard(async (req, res) => {
  const qrImageUrl = await affiliateService.uploadBankQr(req.user._id, req.file);
  res.json({ success: true, qrImageUrl });
}));

// DELETE /api/affiliate/bank-qr
router.delete('/bank-qr', auth, guard(async (req, res) => {
  await affiliateService.deleteBankQr(req.user._id);
  res.json({ success: true });
}));

// POST /api/affiliate/payouts { amount, bankName?, bankAccount?, accountName?, note }
// — the saved bank QR (if any) goes with the request
router.post('/payouts', auth, guard(async (req, res) => {
  const payout = await affiliateService.requestPayout(req.user._id, req.body || {});
  res.status(201).json({ success: true, message: 'Đã gửi yêu cầu rút tiền. Admin sẽ chuyển khoản trong 1–3 ngày làm việc.', payout });
}));

module.exports = router;
