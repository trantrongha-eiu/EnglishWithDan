const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const recommendationController = require('../controllers/recommendation.controller');

// Pure read/aggregation over data already computed by weaknessService/
// vocabBookService (no AI, no new analytics) — gated the same as every
// other skill for consistency, same reasoning as weakness.js.
const fullAccess = requirePremium();

// GET /api/recommendations — "what should this student practice next?",
// ranked. See backend/services/recommendationService.js for the scoring
// design.
router.get('/', auth, fullAccess, recommendationController.getRecommendations);

module.exports = router;
