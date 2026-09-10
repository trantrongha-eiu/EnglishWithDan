const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const { userRateLimiter } = require('../middleware/rateLimit');
const ctrl = require('../controllers/mockTest.controller');

// Same 10/15min per-user cap the skill /start endpoints use — each start
// mints a full 4-skill mock (big payload); admin-only bypass to match
// reading/listening.
const startLimiter = userRateLimiter({
  max: 10,
  message: 'Quá nhiều yêu cầu, thử lại sau 15 phút.',
  skipRoles: ['admin'],
  name: 'mock-test:start',
});

// The full 4-skill mock test. Same premium gate as every individual skill
// exam — starting one is a paid feature; the per-skill /start endpoints it
// chains into re-check premium on their own too.
router.post('/start', auth, startLimiter, requirePremium('Bạn cần nâng cấp lên Premium để làm bài thi thử full 4 kỹ năng'), ctrl.start);

router.get('/current', auth, ctrl.current);
router.delete('/current', auth, ctrl.abandon);
router.post('/:id/advance', auth, ctrl.advance);
router.post('/:id/violation', auth, ctrl.violation);
router.get('/history', auth, ctrl.history);
router.get('/history/:id', auth, ctrl.historyDetail);

module.exports = router;
