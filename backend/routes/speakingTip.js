'use strict';

const express = require('express');
const router = express.Router();
const speakingTipController = require('../controllers/speakingTip.controller');

// GET /api/speaking-tips/lessons — public, fixed strategy content
router.get('/lessons', speakingTipController.listLessons);

module.exports = router;
