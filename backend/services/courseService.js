'use strict';

const Course = require('../models/Course');

async function listActiveCourses() {
  return Course.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
}

module.exports = { listActiveCourses };
