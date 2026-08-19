const router         = require('express').Router();
const rateLimit      = require('express-rate-limit');
const auth           = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const logger         = require('../utils/logger');
const ctrl           = require('../controllers/dictionary.controller');

const premiumOnly = requirePremium('Tính năng tra collocations chỉ dành cho thành viên Premium.');

// Rate-limited like every other Gemini-backed route (speaking.js's
// analyzeLimiter/sampleAnswerLimiter) — most requests are cache hits (a
// plain DB read, effectively free), but the limiter guards the cache-MISS
// path, which is a real per-call Gemini cost.
const collocationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' });
  },
  skip: req => req.user?.role === 'admin',
});

router.get('/:word/collocations', auth, premiumOnly, collocationsLimiter, ctrl.getCollocations);

module.exports = router;
