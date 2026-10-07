'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { userRateLimiter } = require('../middleware/rateLimit');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const multer = require('multer');
const ctrl = require('../controllers/entranceTest.controller');
const logger = require('../utils/logger');

// The Speaking submit carries the student's Part 2 recording (multipart
// `audio`). memoryStorage: the buffer goes to Cloudinary + the AI grader,
// never to disk. multer passes JSON submits straight through. A rejected
// file (too large…) is dropped rather than failing the submit — the
// transcript still gets recorded.
const audioUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const optionalAudio = (req, res, next) => {
  audioUpload.single('audio')(req, res, (err) => {
    if (err) {
      logger.warn('entrance-test', 'speaking audio upload rejected', { errorMessage: err.message });
      req.file = undefined;
    }
    next();
  });
};

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

// No-login entry from the home page: name + phone -> guest session
// (services/entranceGuestService.js). Per-IP cap — each call creates a User.
const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { limiter: 'entrance-test:guest', path: req.path, ip: req.ip });
    res.status(429).json({ success: false, message: 'Bạn đã đăng ký quá nhiều lần, vui lòng thử lại sau 1 giờ.' });
  },
});
router.post('/guest', guestLimiter, ctrl.createGuest);

// Public: just the test structure + availability (the home-page visitor sees
// it before typing their name/phone).
router.get('/', ctrl.getConfig);
router.post('/start', auth, startLimiter, ctrl.start);
router.get('/history', auth, ctrl.getHistory);
router.get('/:attemptId', auth, ctrl.getAttempt);
router.post('/:attemptId/answer', auth, answerLimiter, ctrl.saveAnswer);
router.post('/:attemptId/section/:section/submit', auth, optionalAudio, ctrl.submitSection);
router.post('/:attemptId/violation', auth, ctrl.recordViolation);
router.post('/:attemptId/heartbeat', auth, ctrl.heartbeat);
router.get('/:attemptId/result', auth, ctrl.getResult);

module.exports = router;
