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
router.post('/streak/use-hammer', auth, userCtrl.useHammer);

// ── INBOX ─────────────────────────────────────────────────────
router.get('/messages/unread-count', auth, userCtrl.getUnreadMessageCount);
router.get('/messages', auth, userCtrl.listMessages);
router.patch('/messages/:id/read', auth, userCtrl.markMessageRead);
router.delete('/messages/:id', auth, userCtrl.deleteMessage);
router.post('/messages/:id/reply', auth, userCtrl.replyMessage);
router.post('/messages/:id/claim', auth, userCtrl.claimGift);

// ── PEER (student profile view + chat + block/report) ────────────
router.get('/peer/conversations',  auth, userCtrl.listPeerConversations);
router.get('/peer/:id/profile',    auth, userCtrl.getPeerProfile);
router.get('/peer/:id/thread',     auth, userCtrl.getPeerThread);
router.post('/peer/:id/message',   auth, userCtrl.sendPeerMessage);
router.post('/peer/:id/block',     auth, userCtrl.blockPeer);
router.delete('/peer/:id/block',   auth, userCtrl.unblockPeer);
router.post('/peer/:id/report',    auth, userCtrl.reportPeer);

module.exports = router;
