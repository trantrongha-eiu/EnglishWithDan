'use strict';

const ListeningTip = require('../models/ListeningTip');

// Reference/strategy content, not gradeable — no attempt/progress model
// needed server-side, same rationale as readingTipService.js.
async function listLessons() {
  return ListeningTip.find({ isActive: true })
    .sort({ orderIndex: 1 })
    .select('-__v')
    .lean();
}

module.exports = { listLessons };
