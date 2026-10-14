const router   = require('express').Router();
const auth     = require('../middleware/auth');
const userCtrl = require('../controllers/user.controller');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const logger   = require('../utils/logger');

// "Góp ý" is free text that lands in the admin inbox — cap it so a stuck
// client or a bored student can't flood the queue.
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: req => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Bạn đã gửi nhiều góp ý, vui lòng thử lại sau ít phút.' });
  },
});

router.get('/profile',         auth, userCtrl.getProfile);
router.put('/profile',         auth, userCtrl.updateProfile);
router.put('/change-password', auth, userCtrl.changePassword);
router.post('/avatar',         auth, userCtrl.uploadAvatar);
router.get('/stats',           auth, userCtrl.getStats);
router.get('/activity-heatmap', auth, userCtrl.getActivityHeatmap);
router.get('/streak-leaderboard', auth, userCtrl.getStreakLeaderboard);
router.post('/streak/use-hammer', auth, userCtrl.useHammer);

// ── INBOX ─────────────────────────────────────────────────────
router.get('/messages/unread-count', auth, userCtrl.getUnreadMessageCount);
router.get('/messages/must-read', auth, userCtrl.listMustReadMessages);
router.get('/messages', auth, userCtrl.listMessages);
router.patch('/messages/:id/read', auth, userCtrl.markMessageRead);
router.delete('/messages/:id', auth, userCtrl.deleteMessage);
router.post('/messages/:id/reply', auth, userCtrl.replyMessage);
router.post('/messages/:id/claim', auth, userCtrl.claimGift);

// ── PEER (student profile view + chat + block/report) ────────────
router.get('/peer/conversations',  auth, userCtrl.listPeerConversations);
router.get('/peer/students',       auth, userCtrl.listActiveStudents);
router.get('/peer/:id/profile',    auth, userCtrl.getPeerProfile);
router.get('/peer/:id/thread',     auth, userCtrl.getPeerThread);
router.post('/peer/:id/message',   auth, userCtrl.sendPeerMessage);
router.post('/peer/:id/block',     auth, userCtrl.blockPeer);
router.delete('/peer/:id/block',   auth, userCtrl.unblockPeer);
router.post('/peer/:id/report',    auth, userCtrl.reportPeer);

// ── FEEDBACK (bug reports / feature requests → straight to admin inbox) ──
router.post('/feedback', auth, feedbackLimiter, userCtrl.submitFeedback);

module.exports = router;
