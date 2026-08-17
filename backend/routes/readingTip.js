'use strict';

const express = require('express');
const router = express.Router();
const readingTipController = require('../controllers/readingTip.controller');

// GET /api/reading-tips/lessons — public, fixed strategy content
router.get('/lessons', readingTipController.listLessons);

module.exports = router;
