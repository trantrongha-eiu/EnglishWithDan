'use strict';

const Task2TemplateAttempt = require('../models/Task2TemplateAttempt');

async function saveAttempt({ userId, templateType, templateName, totalItems, correctItems }) {
  await Task2TemplateAttempt.create({
    userId, templateType, templateName,
    totalItems: Number(totalItems),
    correctItems: Number(correctItems),
  });
}

async function getHistory(userId, limit) {
  return Task2TemplateAttempt.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('templateType templateName totalItems correctItems createdAt')
    .lean();
}

module.exports = { saveAttempt, getHistory };
