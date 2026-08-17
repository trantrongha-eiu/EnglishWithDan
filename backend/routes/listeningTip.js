'use strict';

const express = require('express');
const router = express.Router();
const listeningTipController = require('../controllers/listeningTip.controller');

// GET /api/listening-tips/lessons — public, fixed strategy content
router.get('/lessons', listeningTipController.listLessons);

module.exports = router;
