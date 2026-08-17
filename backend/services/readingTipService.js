'use strict';

const ReadingTip = require('../models/ReadingTip');

// Reference/strategy content, not gradeable — no attempt/progress model
// needed server-side (unlike Essential Grammar's quiz-backed lessons).
// "Read" tracking is client-only (localStorage), same as how Essential
// Grammar's sidebar checkmarks work before a score is ever submitted.
async function listLessons() {
  return ReadingTip.find({ isActive: true })
    .sort({ orderIndex: 1 })
    .select('-__v')
    .lean();
}

module.exports = { listLessons };
