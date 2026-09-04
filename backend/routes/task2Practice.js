const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const task2PracticeController = require('../controllers/task2Practice.controller');
const logger  = require('../utils/logger');

const premiumOnly = requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.');

// /check calls the Gemini API for AI-graded question types (real per-call
// cost) — cap abuse/runaway client loops without affecting normal practice.
// Previously this hard-blocked with a 429 once the limit was hit, which cut
// a student off from practicing entirely — worse than just being "AI quá
// tải", since even the keyword-fallback path never got a chance to run.
// Instead, mark the request and let it through: the controller/service skip
// the Gemini call and grade with the same keyword-match-against-model-answer
// fallback already used when Gemini itself errors out, so hitting this limit
// degrades grading quality instead of blocking practice.
const checkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: req => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  handler: (req, res, next) => {
    logger.security('AI check rate limit hit — falling back to keyword grading', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    req.skipAIGrading = true;
    next();
  },
  skip: req => req.user?.role === 'admin'
});

// GET /api/task2/templates  — this IS the actual practice content
// (task2-template.html's only content source), not just a browsable list,
// so it needs auth + premium like every other practice endpoint here.
router.get('/templates', auth, premiumOnly, task2PracticeController.listTemplates);

// GET /api/task2/type-guides — per-type reference material shown on the
// Templates page (recognise / outline / 6+→7+ table / useful language /
// model essay / mistakes). Same gate as /templates.
router.get('/type-guides', auth, premiumOnly, task2PracticeController.listTypeGuides);

// GET /api/task2/weeks
router.get('/weeks', task2PracticeController.listWeeks);

// GET /api/task2/topics/week/:week
router.get('/topics/week/:week', task2PracticeController.listTopicsForWeek);

// GET /api/task2/questions/topic/:topicId   ?level=
router.get('/questions/topic/:topicId', auth, premiumOnly, task2PracticeController.getTopicQuestions);

// GET /api/task2/vocabulary/:topicId
router.get('/vocabulary/:topicId', auth, premiumOnly, task2PracticeController.getVocabulary);

// POST /api/task2/check  { topicId, questionId, userAnswer }
router.post('/check', auth, premiumOnly, checkLimiter, task2PracticeController.checkAnswer);

// GET /api/task2/exam  ?week=&level=&count=10
router.get('/exam', auth, premiumOnly, task2PracticeController.getExam);

// POST /api/task2/exam/submit  { answers: [{topicId, questionId, userAnswer}] }
router.post('/exam/submit', auth, premiumOnly, task2PracticeController.submitExam);

// POST /api/task2/save-attempt  (auth required)
router.post('/save-attempt', auth, premiumOnly, task2PracticeController.saveAttempt);

// GET /api/task2/history  (auth required)
router.get('/history', auth, task2PracticeController.getHistory);

// GET /api/task2/attempt/:attemptId  — one saved attempt with every
// answered question expanded for review (auth required, own attempts only)
router.get('/attempt/:attemptId', auth, task2PracticeController.getAttemptDetail);

// GET /api/task2/progress  (auth required)
router.get('/progress', auth, task2PracticeController.getProgress);

// GET /api/task2/wrong-questions/:topicId  (auth required)
router.get('/wrong-questions/:topicId', auth, task2PracticeController.getWrongQuestions);

// GET /api/task2/topic-stats/:topicId  — this user's practice record for one
// topic (practised? best score?), used to gate "Viết bài ngay".
router.get('/topic-stats/:topicId', auth, task2PracticeController.getTopicStats);

// ══════════════════════════════════════════════════════════════════════
//  DRAFT — save / load / delete session progress
// ══════════════════════════════════════════════════════════════════════
router.post('/draft', auth, premiumOnly, task2PracticeController.saveDraft);
router.get('/draft/:topicId', auth, premiumOnly, task2PracticeController.getDraft);
router.delete('/draft/:topicId', auth, task2PracticeController.deleteDraft);
router.get('/drafts', auth, task2PracticeController.listDrafts);

module.exports = router;
