const router   = require('express').Router();
const auth     = require('../middleware/auth');
const userCtrl = require('../controllers/user.controller');

router.get('/profile',         auth, userCtrl.getProfile);
router.put('/profile',         auth, userCtrl.updateProfile);
router.put('/change-password', auth, userCtrl.changePassword);
router.post('/avatar',         auth, userCtrl.uploadAvatar);
router.get('/stats',           auth, userCtrl.getStats);
router.get('/activity-heatmap', auth, userCtrl.getActivityHeatmap);
router.get('/streak-leaderboard', auth, userCtrl.getStreakLeaderboard);

// ── INBOX ─────────────────────────────────────────────────────
router.get('/messages/unread-count', auth, userCtrl.getUnreadMessageCount);
router.get('/messages', auth, userCtrl.listMessages);
router.patch('/messages/:id/read', auth, userCtrl.markMessageRead);
router.delete('/messages/:id', auth, userCtrl.deleteMessage);
router.post('/messages/:id/reply', auth, userCtrl.replyMessage);

module.exports = router;
