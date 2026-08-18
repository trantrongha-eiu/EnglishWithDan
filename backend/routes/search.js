const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const searchController = require('../controllers/search.controller');

// GET /api/search?q=...  – site-wide title/name search (Reading/Listening
// tests, Vocab lessons/units, Tips). No premium gate — search is navigation,
// not a "skill"; each result's destination page already enforces its own
// existing gate.
router.get('/', auth, searchController.search);

module.exports = router;
