'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const { userRateLimiter } = require('../middleware/rateLimit');
const readingTipController = require('../controllers/readingTip.controller');

// Practice content comes from the real (premium) Reading bank, so it keeps
// the same gate as /api/reading/practice/*. Limits sized like reading's
// contentLimiter / answerKeyLimiter: a student loads a practice a handful
// of times and checks ~6 answers each, far below these.
const practiceLimiter = userRateLimiter({
  max: 60,
  message: 'Bạn đang tải nội dung quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'reading-tips:practice',
});
const checkLimiter = userRateLimiter({
  max: 150,
  message: 'Bạn đang gửi đáp án quá nhanh, vui lòng chậm lại và thử lại sau ít phút.',
  name: 'reading-tips:check',
});
const premium = requirePremium('Bạn cần nâng cấp lên Premium để luyện tập.');

// GET /api/reading-tips/lessons — public, fixed strategy content
router.get('/lessons', readingTipController.listLessons);

// GET /api/reading-tips/:lessonKey/practice — loaded only when the student
// clicks "Bắt đầu luyện tập"; no answer key in the payload.
router.get('/:lessonKey/practice', auth, practiceLimiter, premium, readingTipController.getPractice);

// POST /api/reading-tips/:lessonKey/practice/check — grades one answer,
// then (and only then) reveals answer + explanation + evidence.
router.post('/:lessonKey/practice/check', auth, checkLimiter, premium, readingTipController.checkPracticeAnswer);

module.exports = router;
