const express = require('express');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/vocabBattle.controller');

// ⚔️ Đấu trường từ vựng — open to every student, like the BXH / Cửa hàng
// lửa it hangs off. See services/vocabBattleService.js.
const limit = (windowMs, max) => rateLimit({
  windowMs, max,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  standardHeaders: true, legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: 'Thao tác nhanh quá, chờ chút rồi thử lại nhé.' }),
});
const createLimiter = limit(15 * 60 * 1000, 20);
// A room polls every ~2s and a player answers fast
const playLimiter = limit(60 * 1000, 150);
// Every open tab polls ~every 10 s (js/shared/battle-invites.js)
const inviteLimiter = limit(60 * 1000, 40);

// Admin settings (services/vocabBattleSettings.js) re-read every 30 s
const settings = require('../services/vocabBattleSettings');
router.use((req, res, next) => { settings.refresh().then(() => next(), () => next()); });

router.get('/', auth, ctrl.list);
router.get('/players', auth, ctrl.players);
router.get('/invites', auth, inviteLimiter, ctrl.invites);
router.get('/lessons', auth, ctrl.lessons);
router.get('/leaderboard', auth, ctrl.leaderboard);
router.post('/', auth, createLimiter, ctrl.create);
router.get('/:id', auth, playLimiter, ctrl.get);
router.get('/:id/review', auth, ctrl.review);
router.post('/:id/accept', auth, ctrl.accept);
router.post('/:id/decline', auth, ctrl.decline);
router.post('/:id/cancel', auth, ctrl.cancel);
router.post('/:id/leave', auth, ctrl.leave);
router.post('/:id/next', auth, playLimiter, ctrl.next);
router.post('/:id/answer', auth, playLimiter, ctrl.answer);
router.post('/:id/start', auth, ctrl.start);
router.post('/:id/word', auth, playLimiter, ctrl.word);

module.exports = router;
