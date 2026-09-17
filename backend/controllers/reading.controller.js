'use strict';

// Every route in the original routes/reading.js used the exact same
// fallback (console.error + generic 500 'Lỗi server'), so — unlike
// listening.js — this one file could safely use a single shared guard.
const readingService = require('../services/readingService');
const { hasFullAccess } = require('../utils/plan');
const { stripReviewAnswerKey } = require('../utils/reviewAnswerKey');

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

exports.startTest = async (req, res) => {
  try {
    const { testId, mode } = req.body;
    const result = await readingService.startTest(testId, req.user._id, mode);
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy bộ đề' });
    if (result.status === 'insufficient_data') {
      return res.status(400).json({ success: false, message: 'Database chưa đủ bài đọc (cần ít nhất 1 bài ở mỗi category)' });
    }
    res.json({
      success: true, attemptId: result.attemptId, testName: result.testName,
      passages: result.passages, duration: result.duration, mode: result.mode
    });
  } catch (e) {
    // Test Simulation cooldown after a 5-strike disqualification — surface
    // a machine-readable code + remaining seconds, same convention
    // mockTest.controller.js's own cooldown handling uses.
    if (e && e.statusCode === 429 && e.cooldownSeconds != null) {
      return res.status(429).json({ success: false, code: 'SIMULATION_COOLDOWN', cooldownSeconds: e.cooldownSeconds, message: e.message });
    }
    console.error(e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.submitTest = guard(null, async (req, res) => {
  const { attemptId, answers } = req.body;
  const result = await readingService.submitTest(attemptId, answers, req.user);
  if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi đang làm' });
  res.json({ success: true, result });
});

exports.getAttemptReview = guard(null, async (req, res) => {
  // Same fix as listening's getHistoryDetail: a teacher/admin opens this
  // route from the mock-test monitor's "Xem lại" deep link as THEMSELVES,
  // not the student, so scoping strictly by userId always 404'd for them.
  const isStaff = ['teacher', 'admin'].includes(req.user.role);
  const attempt = await readingService.getAttemptReview(req.params.id, isStaff ? null : req.user._id);
  if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
  // auth-only route (review your own past result). Withhold the answer key
  // (correctAnswer + explanation) from a user without full access so this
  // can't be used to harvest answer keys after premium/trial lapses —
  // scores / band / right-wrong flags are still returned.
  const full = hasFullAccess(req.user);
  if (!full) stripReviewAnswerKey(attempt);
  res.json({ success: true, attempt, answerKeyWithheld: !full });
});

exports.getHistory = guard(null, async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
  const { history, total } = await readingService.getHistory(req.user._id, limit);
  res.json({ success: true, history, total, hasMore: history.length < total });
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

// Answer key only — called at submit time, not on opening the passage.
// See readingService.getPassageAnswerKey's own comment for why this exists
// as a separate endpoint instead of just being part of the fetch above.
exports.getPassageAnswerKey = guard(null, async (req, res) => {
  const answerKey = await readingService.getPassageAnswerKey(req.params.id);
  if (!answerKey) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đọc' });
  res.json({ success: true, answerKey });
});

exports.savePractice = guard('[Reading practice save]', async (req, res) => {
  const { passageId, answers } = req.body;
  if (!passageId || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
  }
  const attemptId = await readingService.savePractice(req.body, req.user._id);
  // null only happens on the Test Simulation update path (see
  // readingService.savePractice) when the attempt was disqualified (or
  // already submitted) before this request landed.
  if (req.body.attemptId && !attemptId) {
    return res.status(409).json({ success: false, message: 'Bài làm này đã bị huỷ hoặc đã nộp trước đó.' });
  }
  res.json({ success: true, attemptId });
});

// POST /api/reading/practice/start-simulation   body: { passageId, passageTitle, category }
exports.startPracticeSimulation = async (req, res) => {
  try {
    const { passageId, passageTitle, category } = req.body;
    if (!passageId) return res.status(400).json({ success: false, message: 'Thiếu passageId' });
    const result = await readingService.startPracticeSimulation(passageId, passageTitle, category, req.user._id);
    if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy bài đọc' });
    res.status(201).json({ success: true, attemptId: result.attemptId, duration: result.duration });
  } catch (e) {
    if (e && e.statusCode === 429 && e.cooldownSeconds != null) {
      return res.status(429).json({ success: false, code: 'SIMULATION_COOLDOWN', cooldownSeconds: e.cooldownSeconds, message: e.message });
    }
    console.error('[Reading practice start-simulation]', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getPracticeHistory = guard('[Reading practice history]', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
  const { attempts, total } = await readingService.getPracticeHistory(req.user._id, limit);
  res.json({ success: true, attempts, total, hasMore: attempts.length < total });
});

exports.getPracticeHistoryDetail = guard('[Reading practice history detail]', async (req, res) => {
  const result = await readingService.getPracticeHistoryDetail(req.params.attemptId, req.user._id);
  if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  // The passage backing this attempt was permanently deleted since — the
  // service already auto-resolved any pending review for it (it can never
  // load again); tell the client explicitly so it stops treating this as a
  // generic transient failure (previously silently returned
  // success:true/passage:null, which the frontend only surfaced as a dead-
  // end "Không tải được bài" toast with no path forward).
  if (!result.passage) {
    return res.status(410).json({ success: false, code: 'CONTENT_REMOVED', message: 'Bài đọc này đã bị gỡ khỏi hệ thống nên không thể xem lại.' });
  }
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

// ── Admin – Attempts history / stats ─────────────────────────────────────
exports.listAdminAttempts = guard(null, async (req, res) => {
  const { testId, userId, page = 1, limit = 50 } = req.query;
  const { attempts, total } = await readingService.listAdminAttempts({ testId, userId, page, limit });
  res.json({ success: true, attempts, total, page: Number(page), limit: Number(limit) });
});

exports.getAdminAttemptsStats = guard(null, async (req, res) => {
  const stats = await readingService.getAdminAttemptsStats(req.query.testId);
  res.json({ success: true, ...stats });
});
