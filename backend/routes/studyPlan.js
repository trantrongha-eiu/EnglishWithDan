const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const studyPlanController = require('../controllers/studyPlan.controller');

const fullAccess = requirePremium();

// GET /api/study-plan/current — this week's plan, computed fresh from the
// current goal + weakness/recommendation data (nothing stored/cached, see
// studyPlanService.js).
router.get('/current', auth, fullAccess, studyPlanController.getCurrentPlan);

module.exports = router;
