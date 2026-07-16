const express = require('express');
const router = express.Router();
const essentialGrammarController = require('../controllers/essentialGrammar.controller');

// GET /api/essential-grammar/lessons  (public – cho essential-grammar.html)
router.get('/lessons', essentialGrammarController.listLessons);

module.exports = router;
