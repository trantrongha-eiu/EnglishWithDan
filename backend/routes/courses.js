const express = require('express');
const router  = express.Router();
const courseController = require('../controllers/course.controller');

// GET /api/courses  – public, no auth required
router.get('/', courseController.listActiveCourses);

module.exports = router;
