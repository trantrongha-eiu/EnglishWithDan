const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const ctrl    = require('../controllers/wt1.controller');
const logger  = require('../utils/logger');

const premiumOnly = requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.');

// /submit-writing calls Gemini (real per-call cost) for paragraph_writing /
// full_task1 — cap runaway loops. Keyed by user id, IPv6-normalised fallback.
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  keyGenerator: req => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu chấm bài, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin',
});

// ── course content + practice (auth + premium) ──────────────────────
router.get('/overview',        auth, premiumOnly, ctrl.getOverview);
router.get('/lesson/:code',    auth, premiumOnly, ctrl.getLesson);
router.post('/check',          auth, premiumOnly, ctrl.check);
router.post('/submit-writing', auth, premiumOnly, writeLimiter, ctrl.submitWriting);

// ── progress / review (auth only) ──────────────────────────────────
router.get('/progress',            auth, ctrl.getProgress);
router.get('/attempt/:attemptId',  auth, ctrl.getAttempt);

module.exports = router;
