const router         = require('express').Router();
const rateLimit      = require('express-rate-limit');
const auth           = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const speakCtrl      = require('../controllers/speaking.controller');
const logger         = require('../utils/logger');

// Chỉ premium / teacher / admin mới được dùng speaking
const premiumOnly = requirePremium('Tính năng Speaking chỉ dành cho thành viên Premium.');

// /analyze calls the Gemini API (real per-call cost) — cap abuse/runaway
// client loops without affecting normal practice usage.
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu phân tích, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

router.get('/topics',           auth, premiumOnly, speakCtrl.getTopics);
router.get('/random',           auth, premiumOnly, speakCtrl.getRandom);
router.get('/questions',        auth, premiumOnly, speakCtrl.getQuestions);
router.post('/analyze',         auth, premiumOnly, analyzeLimiter, speakCtrl.analyze);
router.get('/history',          auth,              speakCtrl.getHistory);   // free users vẫn xem được lịch sử cũ
router.get('/materials',        auth, premiumOnly, speakCtrl.getMaterials);
router.get('/material-filters', auth, premiumOnly, speakCtrl.getMaterialFilters);

module.exports = router;
