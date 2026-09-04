const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const ctrl    = require('../controllers/advSentence.controller');
const logger  = require('../utils/logger');

const premiumOnly = requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.');

// /check is local grading (no external API cost) but still capped against
// runaway client loops. Keyed by user id, falling back to a normalised IP
// (ipKeyGenerator — required by express-rate-limit v8 for IPv6).
const checkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: req => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.' });
  },
  skip: req => req.user?.role === 'admin',
});

// ── catalog metadata (auth only) — a free student sees the week grid +
//    the upgrade banner, same as task2-practice's public /weeks route ──
router.get('/weeks',              auth, ctrl.listWeeks);
router.get('/groups/week/:week',  auth, ctrl.listGroupsForWeek);

// ── content + practice (auth + premium) ──────────────────────────────
router.get('/group/:groupId',     auth, premiumOnly, ctrl.getGroup);
router.post('/check',             auth, premiumOnly, checkLimiter, ctrl.checkAnswer);
router.get('/exam',               auth, premiumOnly, ctrl.getExam);
router.post('/exam/submit',       auth, premiumOnly, ctrl.submitExam);
router.post('/save-attempt',      auth, premiumOnly, ctrl.saveAttempt);
router.post('/draft',             auth, premiumOnly, ctrl.saveDraft);
router.get('/draft/:groupId',     auth, premiumOnly, ctrl.getDraft);

// ── history / drafts management (auth only) ──────────────────────────
router.get('/history',            auth, ctrl.getHistory);
router.get('/attempt/:attemptId', auth, ctrl.getAttemptDetail);
router.delete('/draft/:groupId',  auth, ctrl.deleteDraft);
router.get('/drafts',             auth, ctrl.listDrafts);

module.exports = router;
