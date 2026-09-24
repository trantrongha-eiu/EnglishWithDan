'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const { userRateLimiter } = require('../middleware/rateLimit');
const listeningTipController = require('../controllers/listeningTip.controller');

// Practice content comes from the real (premium) Listening bank, so it keeps
// the same gate as /api/listening/practice/*. Sized like the Reading Tips
// practice limits: a student loads a practice a handful of times and checks
// ~5 answers each, far below these.
const practiceLimiter = userRateLimiter({
  max: 60,
  message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'listening-tips:practice',
});
const checkLimiter = userRateLimiter({
  max: 150,
  message: 'Bạn đang gửi đáp án quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'listening-tips:check',
});
const premium = requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.');

// GET /api/listening-tips/lessons — public, fixed strategy content
router.get('/lessons', listeningTipController.listLessons);

// GET /api/listening-tips/:lessonKey/practice — loaded only when the student
// clicks "Bắt đầu luyện tập"; no answer key in the payload.
router.get('/:lessonKey/practice', auth, practiceLimiter, premium, listeningTipController.getPractice);

// POST /api/listening-tips/:lessonKey/practice/check — grades one answer,
// then (and only then) reveals answer + explanation + audio evidence.
router.post('/:lessonKey/practice/check', auth, checkLimiter, premium, listeningTipController.checkPracticeAnswer);

module.exports = router;
