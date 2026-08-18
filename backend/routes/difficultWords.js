const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const difficultWordsController = require('../controllers/difficultWords.controller');

// Was entirely ungated — missed during the free-plan 24h-trial rollout that
// gated every other skill area (see backend/utils/plan.js's hasFullAccess;
// Vocab Book/vocabBook.js got the same treatment, including this exact
// "GET / stays open" carve-out). No list-stays-open exception needed here
// unlike VocabBook: the badge/modal fetch already degrades gracefully on
// any fetch failure (dashboard.js's updateDifficultBadge()/
// openDifficultWordsModal() both just no-op or show a generic retry
// message), so there's no "student's dashboard shows an error page"
// concern that carve-out exists to avoid.
const fullAccess = requirePremium();

// GET / — words with wrongCount >= 3 for current user, sorted hardest first
router.get('/', auth, fullAccess, difficultWordsController.list);

// POST /report — upsert wrong words from any practice session
router.post('/report', auth, fullAccess, difficultWordsController.report);

// PATCH /:id — edit meaning
router.patch('/:id', auth, fullAccess, difficultWordsController.update);

// DELETE /:id — remove word from list
router.delete('/:id', auth, fullAccess, difficultWordsController.remove);

module.exports = router;
