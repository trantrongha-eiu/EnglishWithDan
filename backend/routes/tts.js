'use strict';

const router = require('express').Router();
const auth = require('../middleware/auth');
const { userRateLimiter } = require('../middleware/rateLimit');
const ctrl = require('../controllers/tts.controller');

// Most calls are cache hits. What actually costs money is capped separately by
// the per-student and monthly character budgets in ttsService.
const speechLimiter = userRateLimiter({ max: 200, name: 'tts' });

router.get('/voices', auth, ctrl.listVoices);
router.post('/speech', auth, speechLimiter, ctrl.getSpeech);

module.exports = router;
