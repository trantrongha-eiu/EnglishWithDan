const router   = require('express').Router();
const auth     = require('../middleware/auth');
const speakCtrl = require('../controllers/speaking.controller');

router.get('/topics',           auth, speakCtrl.getTopics);
router.get('/random',           auth, speakCtrl.getRandom);
router.get('/questions',        auth, speakCtrl.getQuestions);
router.post('/analyze',         auth, speakCtrl.analyze);
router.get('/history',          auth, speakCtrl.getHistory);
router.get('/materials',        auth, speakCtrl.getMaterials);
router.get('/material-filters', auth, speakCtrl.getMaterialFilters);

module.exports = router;
