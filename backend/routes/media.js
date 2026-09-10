'use strict';

// Protected-media delivery. See controllers/media.controller.js — the
// sealed `?token=` is the credential (an <audio> element can't send an
// Authorization header), so there is no `auth` middleware here.
const express = require('express');
const router = express.Router();
const { userRateLimiter } = require('../middleware/rateLimit');
const mediaController = require('../controllers/media.controller');

// Backstop against the proxy being used as a bandwidth sink with a leaked
// token: keyed by IP here (no req.user on this route). Generous — a full
// listening test is many Range requests, and a classroom shares one NAT
// IP — but still caps an automated pull. Not the primary control; the
// token TTL is.
const mediaLimiter = userRateLimiter({
  max: 2000,
  windowMs: 15 * 60 * 1000,
  message: 'Quá nhiều yêu cầu media, vui lòng thử lại sau ít phút.',
  skipRoles: [],
  name: 'media:listening',
});

router.get('/listening', mediaLimiter, mediaController.streamListening);
router.head('/listening', mediaLimiter, mediaController.streamListening);

module.exports = router;
