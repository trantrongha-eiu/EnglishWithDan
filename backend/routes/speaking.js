const router     = require('express').Router();
const auth       = require('../middleware/auth');
const speakCtrl  = require('../controllers/speaking.controller');

// Chỉ premium / teacher / admin mới được dùng speaking
function premiumOnly(req, res, next) {
  if (req.user.role === 'admin' || req.user.role === 'teacher') return next();
  if (req.user.plan === 'premium') return next();
  return res.status(403).json({
    success: false,
    requiresPremium: true,
    message: 'Tính năng Speaking chỉ dành cho thành viên Premium.'
  });
}

router.get('/topics',           auth, premiumOnly, speakCtrl.getTopics);
router.get('/random',           auth, premiumOnly, speakCtrl.getRandom);
router.get('/questions',        auth, premiumOnly, speakCtrl.getQuestions);
router.post('/analyze',         auth, premiumOnly, speakCtrl.analyze);
router.get('/history',          auth, premiumOnly, speakCtrl.getHistory);
router.get('/materials',        auth, premiumOnly, speakCtrl.getMaterials);
router.get('/material-filters', auth, premiumOnly, speakCtrl.getMaterialFilters);

module.exports = router;
