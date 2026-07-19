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

// /sample-answer also calls Gemini — its own cap, separate from /analyze's
// quota, so generating sample answers doesn't eat into a student's
// analyze budget for the same session.
const sampleAnswerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

// /improve also calls Gemini — its own cap for the same reason as
// /sample-answer above. It's opt-in (button click), so a lower ceiling than
// /analyze is fine — a student isn't expected to hit "Improve" 20x/15min.
const improveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

router.get('/topics',           auth, premiumOnly, speakCtrl.getTopics);
router.get('/random',           auth, premiumOnly, speakCtrl.getRandom);
router.get('/questions',        auth, premiumOnly, speakCtrl.getQuestions);
router.post('/analyze',         auth, premiumOnly, analyzeLimiter, speakCtrl.analyze);
router.post('/sample-answer',   auth, premiumOnly, sampleAnswerLimiter, speakCtrl.sampleAnswer);
router.post('/improve',         auth, premiumOnly, improveLimiter, speakCtrl.improveAnswer);
router.get('/history',          auth,              speakCtrl.getHistory);   // free users vẫn xem được lịch sử cũ
router.get('/materials',        auth, premiumOnly, speakCtrl.getMaterials);
router.get('/material-filters', auth, premiumOnly, speakCtrl.getMaterialFilters);

module.exports = router;
