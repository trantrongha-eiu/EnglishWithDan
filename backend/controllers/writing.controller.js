'use strict';

// Preserves routes/writing.js's original error-response shapes exactly,
// including two real inconsistencies worth flagging (not silently fixed
// here, since that would be an API-behavior change outside this pass's
// scope): most routes leak the raw err.message to the client (every other
// migrated file in this phase uses a generic message), and two routes
// (getUnreadFeedbackCount, markFeedbackRead) return a shape that omits
// `message` entirely on error.
const writingService = require('../services/writingService');

function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

exports.startExam = guard(async (req, res) => {
  const result = await writingService.startExam();
  if (result.status === 'no_task1') return res.status(404).json({ success: false, message: 'Chưa có câu hỏi Task 1 nào. Vui lòng liên hệ giáo viên.' });
  if (result.status === 'no_task2') return res.status(404).json({ success: false, message: 'Chưa có câu hỏi Task 2 nào. Vui lòng liên hệ giáo viên.' });
  res.json({ success: true, exam: result.exam });
});

exports.submitExam = guard(async (req, res) => {
  const { examId } = req.body;
  if (!examId) return res.status(400).json({ success: false, message: 'Thiếu examId' });
  const attemptId = await writingService.submitExam(req.user._id, req.body);
  if (!attemptId) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });
  res.status(201).json({ success: true, attemptId });
});

exports.listPracticeTasks = guard(async (req, res) => {
  const taskType = parseInt(req.query.taskType);
  if (taskType !== 1 && taskType !== 2) return res.status(400).json({ success: false, message: 'taskType phải là 1 hoặc 2' });
  const tasks = await writingService.listPracticeTasks(taskType);
  res.json({ success: true, tasks, taskType });
});

exports.getPracticeTask = guard(async (req, res) => {
  const taskType = parseInt(req.query.taskType);
  if (taskType !== 1 && taskType !== 2) return res.status(400).json({ success: false, message: 'taskType phải là 1 hoặc 2' });

  const pending = await writingService.findPendingPracticeAttempt(req.user._id);
  if (pending) {
    return res.status(429).json({ success: false, pendingId: pending._id, message: 'Bạn còn bài đang chờ chấm. Vui lòng đợi giáo viên chấm xong trước khi nộp bài mới.' });
  }

  const task = await writingService.getPracticeTask(taskType);
  if (!task) return res.status(404).json({ success: false, message: 'Chưa có đề bài. Vui lòng liên hệ giáo viên.' });
  res.json({ success: true, task, taskType });
});

exports.submitPractice = guard(async (req, res) => {
  const { taskType, taskId, answer = '', wordCount = 0 } = req.body;
  const tNum = parseInt(taskType);
  if (tNum !== 1 && tNum !== 2) return res.status(400).json({ success: false, message: 'taskType phải là 1 hoặc 2' });
  if (!answer.trim()) return res.status(400).json({ success: false, message: 'Bài làm không được để trống' });

  const pending = await writingService.findPendingPracticeAttempt(req.user._id);
  if (pending) return res.status(429).json({ success: false, message: 'Bạn còn bài đang chờ chấm.' });

  const attemptId = await writingService.submitPractice(req.user._id, { taskType: tNum, taskId, answer, wordCount });
  res.status(201).json({ success: true, attemptId });
});

exports.getPracticeHistory = guard(async (req, res) => {
  const attempts = await writingService.getPracticeHistory(req.user._id);
  res.json({ success: true, attempts });
});

exports.getDraft = guard(async (req, res) => {
  const draft = await writingService.getDraft(req.user._id);
  res.json({ success: true, draft: draft || null });
});

exports.saveDraft = guard(async (req, res) => {
  const { taskType, task } = req.body;
  if (!task || !taskType) return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
  await writingService.saveDraft(req.user._id, req.body);
  res.json({ success: true });
});

exports.deleteDraft = guard(async (req, res) => {
  await writingService.deleteDraft(req.user._id);
  res.json({ success: true });
});

exports.getUnreadFeedbackCount = async (req, res) => {
  try {
    const count = await writingService.getUnreadFeedbackCount(req.user._id);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, count: 0 });
  }
};

exports.markFeedbackRead = async (req, res) => {
  try {
    const result = await writingService.markFeedbackRead(req.params.id, req.user._id);
    if (result.status === 'not_found') return res.status(404).json({ success: false });
    if (result.status === 'forbidden') return res.status(403).json({ success: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getMyHistory = guard(async (req, res) => {
  const attempts = await writingService.getMyHistory(req.user._id);
  res.json({ success: true, attempts });
});

exports.getAttempt = guard(async (req, res) => {
  const result = await writingService.getAttempt(req.params.id, req.user);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  if (result.status === 'forbidden') return res.status(403).json({ success: false, message: 'Không có quyền' });
  res.json({ success: true, attempt: result.attempt });
});

exports.listSamples = guard(async (req, res) => {
  const samples = await writingService.listSamples(req.query);
  res.json({ success: true, samples });
});

exports.getSampleFilters = guard(async (req, res) => {
  const { quarters, topics } = await writingService.getSampleFilters();
  res.json({ success: true, quarters, topics });
});
