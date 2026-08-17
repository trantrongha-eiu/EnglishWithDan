'use strict';

const WritingTip = require('../models/WritingTip');

// Reference/strategy content, not gradeable — no attempt/progress model
// needed server-side, same rationale as readingTipService.js.
async function listLessons() {
  return WritingTip.find({ isActive: true })
    .sort({ orderIndex: 1 })
    .select('-__v')
    .lean();
}

module.exports = { listLessons };
