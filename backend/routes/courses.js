const express = require('express');
const router  = express.Router();
const Course  = require('../models/Course');

// GET /api/courses  – public, no auth required
router.get('/', async (_req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
