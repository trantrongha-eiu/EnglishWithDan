const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const difficultWordsController = require('../controllers/difficultWords.controller');

// GET / — words with wrongCount >= 3 for current user, sorted hardest first
router.get('/', auth, difficultWordsController.list);

// POST /report — upsert wrong words from any practice session
router.post('/report', auth, difficultWordsController.report);

// PATCH /:id — edit meaning
router.patch('/:id', auth, difficultWordsController.update);

// DELETE /:id — remove word from list
router.delete('/:id', auth, difficultWordsController.remove);

module.exports = router;
