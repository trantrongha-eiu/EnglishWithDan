const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const learningController = require('../controllers/learning.controller');

const fullAccess = requirePremium();

// GET /api/learning/today — "what should the student actually do right
// now?". Read-only, no persistent side effects — see learningService.js.
router.get('/today', auth, fullAccess, learningController.getTodayLearning);

module.exports = router;
