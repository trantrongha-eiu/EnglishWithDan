'use strict';

const Task2TemplateAttempt = require('../models/Task2TemplateAttempt');

async function saveAttempt({ userId, templateType, templateName, totalItems, correctItems, mode }) {
  await Task2TemplateAttempt.create({
    userId, templateType, templateName,
    totalItems: Number(totalItems),
    correctItems: Number(correctItems),
    mode: mode || 'cloze',
  });
}

async function getHistory(userId, limit) {
  return Task2TemplateAttempt.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('templateType templateName totalItems correctItems mode createdAt')
    .lean();
}

module.exports = { saveAttempt, getHistory };
