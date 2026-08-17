'use strict';

const SpeakingTip = require('../models/SpeakingTip');

// Reference/strategy content, not gradeable — no attempt/progress model
// needed server-side, same rationale as readingTipService.js.
async function listLessons() {
  return SpeakingTip.find({ isActive: true })
    .sort({ orderIndex: 1 })
    .select('-__v')
    .lean();
}

module.exports = { listLessons };
