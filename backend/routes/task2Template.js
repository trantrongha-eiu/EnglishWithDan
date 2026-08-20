const router = require('express').Router();
const auth   = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const task2TemplateController = require('../controllers/task2Template.controller');

// POST /api/task2template/save
router.post('/save', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), task2TemplateController.saveAttempt);

// GET /api/task2template/history
router.get('/history', auth, task2TemplateController.getHistory);

module.exports = router;
