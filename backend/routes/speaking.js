const router     = require('express').Router();
const rateLimit  = require('express-rate-limit');
const auth       = require('../middleware/auth');
const speakCtrl  = require('../controllers/speaking.controller');

const verifyKeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.' }),
  skip: req => req.user?.role === 'admin'
});

router.post('/verify-key',      auth, verifyKeyLimiter, speakCtrl.verifyKey);
router.get('/topics',           auth, speakCtrl.getTopics);
router.get('/random',           auth, speakCtrl.getRandom);
router.get('/questions',        auth, speakCtrl.getQuestions);
router.post('/analyze',         auth, speakCtrl.analyze);
router.get('/history',          auth, speakCtrl.getHistory);
router.get('/materials',        auth, speakCtrl.getMaterials);
router.get('/material-filters', auth, speakCtrl.getMaterialFilters);

module.exports = router;
