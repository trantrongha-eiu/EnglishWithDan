const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const goalController = require('../controllers/goal.controller');

const fullAccess = requirePremium();

// GET /api/goals/estimated-performance — system-estimated per-skill band,
// kept as its own endpoint (not folded into GET /) so it's never mistaken
// for the student's self-assessed currentBand. Must stay above /:paramless
// routes below only matters if a /:id pattern existed here — it doesn't,
// so ordering is not load-bearing, kept first for readability only.
router.get('/estimated-performance', auth, fullAccess, goalController.getEstimatedPerformance);

// GET /api/goals — current goal, with all derived fields (daysRemaining,
// examUrgency, gapBands, feasibility) computed fresh, never stored.
router.get('/', auth, fullAccess, goalController.getGoal);

// PUT /api/goals — partial update; only fields present in the body are
// validated/changed.
router.put('/', auth, fullAccess, goalController.updateGoal);

module.exports = router;
