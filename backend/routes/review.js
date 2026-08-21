const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reviewController = require('../controllers/review.controller');

// GET /api/review/taxonomy?skill=reading|listening — category/reason
// picker options for the guided-review UI (single source of truth with the
// backend's own validation, so the frontend never hardcodes a copy that
// could drift from constants/errorTaxonomy.js).
router.get('/taxonomy', auth, reviewController.getTaxonomy);

// GET /api/review/pending?skill=reading|listening — the mandatory-review
// gate check the frontend calls proactively before showing "Bắt đầu".
router.get('/pending', auth, reviewController.getPending);

// GET /api/review/history?attemptType=&from=&to=&page=&limit= — "My Mistakes"
router.get('/history', auth, reviewController.getHistory);

// GET /api/review/by-attempt/:attemptType/:attemptId — used by the existing
// review screens to check whether the attempt they're showing has an
// associated mandatory-review doc to resume.
router.get('/by-attempt/:attemptType/:attemptId', auth, reviewController.getByAttempt);

// GET /api/review/:id
router.get('/:id', auth, reviewController.getDetail);

// PATCH /api/review/:id/mistakes/:mistakeId
router.patch('/:id/mistakes/:mistakeId', auth, reviewController.updateMistake);

module.exports = router;
