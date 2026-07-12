const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const auth    = require('../middleware/auth');
const task2PracticeController = require('../controllers/task2Practice.controller');
const logger  = require('../utils/logger');

// /check calls the Gemini API for AI-graded question types (real per-call
// cost) — cap abuse/runaway client loops without affecting normal practice.
const checkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu chấm bài, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

// GET /api/task2/templates  (public – cho task2-template.html)
router.get('/templates', task2PracticeController.listTemplates);

// GET /api/task2/weeks
router.get('/weeks', task2PracticeController.listWeeks);

// GET /api/task2/topics/week/:week
router.get('/topics/week/:week', task2PracticeController.listTopicsForWeek);

// GET /api/task2/questions/topic/:topicId   ?level=
router.get('/questions/topic/:topicId', auth, task2PracticeController.getTopicQuestions);

// GET /api/task2/vocabulary/:topicId
router.get('/vocabulary/:topicId', auth, task2PracticeController.getVocabulary);

// POST /api/task2/check  { topicId, questionId, userAnswer }
router.post('/check', auth, checkLimiter, task2PracticeController.checkAnswer);

// GET /api/task2/exam  ?week=&level=&count=10
router.get('/exam', auth, task2PracticeController.getExam);

// POST /api/task2/exam/submit  { answers: [{topicId, questionId, userAnswer}] }
router.post('/exam/submit', auth, task2PracticeController.submitExam);

// POST /api/task2/save-attempt  (auth required)
router.post('/save-attempt', auth, task2PracticeController.saveAttempt);

// GET /api/task2/history  (auth required)
router.get('/history', auth, task2PracticeController.getHistory);

// GET /api/task2/progress  (auth required)
router.get('/progress', auth, task2PracticeController.getProgress);

// GET /api/task2/wrong-questions/:topicId  (auth required)
router.get('/wrong-questions/:topicId', auth, task2PracticeController.getWrongQuestions);

// ══════════════════════════════════════════════════════════════════════
//  DRAFT — save / load / delete session progress
// ══════════════════════════════════════════════════════════════════════
router.post('/draft', auth, task2PracticeController.saveDraft);
router.get('/draft/:topicId', auth, task2PracticeController.getDraft);
router.delete('/draft/:topicId', auth, task2PracticeController.deleteDraft);
router.get('/drafts', auth, task2PracticeController.listDrafts);

module.exports = router;
