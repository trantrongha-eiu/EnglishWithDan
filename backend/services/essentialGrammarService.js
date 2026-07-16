'use strict';

const EssentialGrammarLesson = require('../models/EssentialGrammarLesson');

async function listLessons() {
  return EssentialGrammarLesson.find({ isActive: true })
    .sort({ orderIndex: 1 })
    .select('-__v')
    .lean();
}

module.exports = { listLessons };
