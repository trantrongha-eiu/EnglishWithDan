const router = require('express').Router();
const auth   = require('../middleware/auth');
const task2TemplateController = require('../controllers/task2Template.controller');

// POST /api/task2template/save
router.post('/save', auth, task2TemplateController.saveAttempt);

// GET /api/task2template/history
router.get('/history', auth, task2TemplateController.getHistory);

module.exports = router;
