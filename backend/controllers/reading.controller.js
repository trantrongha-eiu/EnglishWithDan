'use strict';

// Every route in the original routes/reading.js used the exact same
// fallback (console.error + generic 500 'Lỗi server'), so — unlike
// listening.js — this one file could safely use a single shared guard.
const readingService = require('../services/readingService');

function guard(logTag, handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (logTag) console.error(logTag, err); else console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

exports.listTests = guard(null, async (req, res) => {
  res.set('Cache-Control', 'private, max-age=120');
  const tests = await readingService.listTestsForUser(req.user._id);
  res.json({ success: true, tests, userPlan: req.user.plan || 'free', planExpiresAt: req.user.planExpiresAt || null });
});

exports.startTest = guard(null, async (req, res) => {
  const { testId } = req.body;
  const result = await readingService.startTest(testId, req.user._id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy bộ đề' });
  if (result.status === 'insufficient_data') {
    return res.status(400).json({ success: false, message: 'Database chưa đủ bài đọc (cần ít nhất 1 bài ở mỗi category)' });
  }
  res.json({ success: true, attemptId: result.attemptId, testName: result.testName, passages: result.passages, duration: result.duration });
});

exports.submitTest = guard(null, async (req, res) => {
  const { attemptId, answers } = req.body;
  const result = await readingService.submitTest(attemptId, answers, req.user);
  if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi đang làm' });
  res.json({ success: true, result });
});

exports.getAttemptReview = guard(null, async (req, res) => {
  const attempt = await readingService.getAttemptReview(req.params.id, req.user._id);
  if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
  res.json({ success: true, attempt });
});

exports.getHistory = guard(null, async (req, res) => {
  const history = await readingService.getHistory(req.user._id);
  res.json({ success: true, history });
});

exports.listPracticePassages = guard(null, async (req, res) => {
  const { category } = req.query;
  if (!['passage1', 'passage2', 'passage3', 'actual-test'].includes(category)) {
    return res.status(400).json({ success: false, message: 'Category không hợp lệ' });
  }
  const { passages, doneMap } = await readingService.listPracticePassages(category, req.user._id);
  res.json({ success: true, passages, doneMap });
});

exports.getPracticePassageById = guard(null, async (req, res) => {
  const passage = await readingService.getPracticePassageById(req.params.id);
  if (!passage) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đọc' });
  res.json({ success: true, passage });
});

exports.savePractice = guard('[Reading practice save]', async (req, res) => {
  const { passageId, answers } = req.body;
  if (!passageId || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
  }
  const attemptId = await readingService.savePractice(req.body, req.user._id);
  res.json({ success: true, attemptId });
});

exports.getPracticeHistory = guard('[Reading practice history]', async (req, res) => {
  const attempts = await readingService.getPracticeHistory(req.user._id);
  res.json({ success: true, attempts });
});

exports.getPracticeHistoryDetail = guard('[Reading practice history detail]', async (req, res) => {
  const result = await readingService.getPracticeHistoryDetail(req.params.attemptId, req.user._id);
  if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, attempt: result.attempt, passage: result.passage });
});

exports.getRandomPracticePassage = guard(null, async (req, res) => {
  const { category } = req.params;
  if (!['passage1', 'passage2', 'passage3'].includes(category)) {
    return res.status(400).json({ success: false, message: 'Category không hợp lệ' });
  }
  const passage = await readingService.getRandomPracticePassage(category);
  if (!passage) return res.status(404).json({ success: false, message: 'Chưa có bài đọc cho loại này' });
  res.json({ success: true, passage });
});
