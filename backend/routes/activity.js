'use strict';
// Student activity heartbeat — frontend/js/shared/online-tracker.js posts the
// active seconds / tab switches / idle pauses it measured since the last beat.
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const auth = require('../middleware/auth');
const deviceSession = require('../utils/deviceSession');
const onlineTime = require('../services/onlineTimeService');

// A tab beats every 30 s plus on hide/close. Keyed per student (a whole
// class can share one Wi-Fi IP). Over-limit beats are dropped silently —
// tracking never errors a page.
const beatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(204).end(),
});

// POST /api/activity/beat
router.post('/beat', auth, beatLimiter, async (req, res) => {
  try {
    const device = (req.authSession && req.authSession.dt) || deviceSession.deviceTypeFromUA(req.get('user-agent'));
    const result = await onlineTime.recordBeat(req.user, req.body, device);
    if (!result.ok && result.reason === 'bad-sid') return res.status(400).json({ success: false, message: 'Invalid session id' });
    res.json({ success: true, tracked: result.ok });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Không lưu được hoạt động' });
  }
});

module.exports = router;
