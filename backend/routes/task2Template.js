const router = require('express').Router();
const auth   = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const task2TemplateController = require('../controllers/task2Template.controller');

// POST /api/task2template/save
router.post('/save', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), task2TemplateController.saveAttempt);

// Practice-path progress (task2-template.html) — one row per level × type.
// GET /api/task2template/progress?level=band6|band7
router.get('/progress', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), task2TemplateController.getProgress);
// PUT /api/task2template/progress/:typeId  { level, steps, drillRounds, mastery, ... }
router.put('/progress/:typeId', auth, requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.'), task2TemplateController.saveProgress);

// GET /api/task2template/history
router.get('/history', auth, task2TemplateController.getHistory);

module.exports = router;
