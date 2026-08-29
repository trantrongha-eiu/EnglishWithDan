const router         = require('express').Router();
const rateLimit      = require('express-rate-limit');
const auth           = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const logger         = require('../utils/logger');
const ctrl           = require('../controllers/dictionary.controller');

const premiumOnly = requirePremium('Tính năng tra từ điển nâng cao chỉ dành cho thành viên Premium.');

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

// The single-word example fires while the student types in the add-word
// modal, so it needs more headroom than collocations; the bulk endpoint
// does up to 40 AI calls per request internally, so it gets less.
const exampleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' });
  },
  skip: req => req.user?.role === 'admin',
});

const exampleBulkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' });
  },
  skip: req => req.user?.role === 'admin',
});

router.get('/:word/collocations', auth, premiumOnly, collocationsLimiter, ctrl.getCollocations);
router.post('/examples',          auth, premiumOnly, exampleBulkLimiter, ctrl.getExamples);
router.get('/:word/example',      auth, premiumOnly, exampleLimiter,     ctrl.getExample);

module.exports = router;
