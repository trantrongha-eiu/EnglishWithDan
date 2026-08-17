'use strict';

const express = require('express');
const router = express.Router();
const writingTipController = require('../controllers/writingTip.controller');

// GET /api/writing-tips/lessons — public, fixed strategy content
router.get('/lessons', writingTipController.listLessons);

module.exports = router;
