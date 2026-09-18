'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { userRateLimiter } = require('../middleware/rateLimit');
const ctrl = require('../controllers/entranceTest.controller');

// No requirePremium — the Entrance Test is a placement test open to any
// logged-in account regardless of plan (confirmed product decision, unlike
// every other exam/Simulation feature in this app).
const startLimiter = userRateLimiter({
  max: 10,
  message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.',
  skipRoles: ['admin'],
  name: 'entrance-test:start',
});
const answerLimiter = userRateLimiter({
  max: 300,
  message: 'Quá nhiều yêu cầu, thử lại sau ít phút.',
  skipRoles: ['admin'],
  name: 'entrance-test:answer',
});

router.get('/', auth, ctrl.getConfig);
router.post('/start', auth, startLimiter, ctrl.start);
router.get('/history', auth, ctrl.getHistory);
router.get('/:attemptId', auth, ctrl.getAttempt);
router.post('/:attemptId/answer', auth, answerLimiter, ctrl.saveAnswer);
router.post('/:attemptId/section/:section/submit', auth, ctrl.submitSection);
router.post('/:attemptId/violation', auth, ctrl.recordViolation);
router.get('/:attemptId/result', auth, ctrl.getResult);

module.exports = router;
