'use strict';

const Task2TemplateAttempt = require('../models/Task2TemplateAttempt');

async function saveAttempt({ userId, templateType, templateName, totalItems, correctItems, mode, isExam, timeTakenSec, level }) {
  await Task2TemplateAttempt.create({
    userId, templateType, templateName,
    totalItems: Number(totalItems),
    correctItems: Number(correctItems),
    mode: mode || 'cloze',
    isExam: !!isExam,
    timeTakenSec: timeTakenSec != null ? Number(timeTakenSec) : undefined,
    level: level === 'band6' ? 'band6' : 'band7',
  });
}

async function getHistory(userId, limit) {
  return Task2TemplateAttempt.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('templateType templateName totalItems correctItems mode isExam timeTakenSec level createdAt')
    .lean();
}

// ── Admin: list attempts across all students (optionally filtered) ──────
async function listAttemptsForAdmin({ limit = 100, skip = 0, mode, isExam, templateType } = {}) {
  const filter = {};
  if (mode) filter.mode = mode;
  if (isExam !== undefined) filter.isExam = isExam === 'true' || isExam === true;
  if (templateType) filter.templateType = templateType;

  const [attempts, total] = await Promise.all([
    Task2TemplateAttempt.find(filter)
      .populate('userId', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(+skip).limit(+limit)
      .lean(),
    Task2TemplateAttempt.countDocuments(filter),
  ]);
  return { attempts, total };
}

module.exports = { saveAttempt, getHistory, listAttemptsForAdmin };
