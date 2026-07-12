'use strict';

const courseService = require('../services/courseService');

exports.listActiveCourses = async (req, res) => {
  try {
    // Public, rarely-changing list — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const courses = await courseService.listActiveCourses();
    res.json({ success: true, courses });
  } catch (err) {
    console.error('[Courses] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
