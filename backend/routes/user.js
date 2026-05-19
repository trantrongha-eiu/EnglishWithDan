const router   = require('express').Router();
const auth     = require('../middleware/auth');
const userCtrl = require('../controllers/user.controller');
const Message  = require('../models/Message');

router.get('/profile',         auth, userCtrl.getProfile);
router.put('/profile',         auth, userCtrl.updateProfile);
router.put('/change-password', auth, userCtrl.changePassword);
router.post('/avatar',         auth, userCtrl.uploadAvatar);
router.get('/stats',           auth, userCtrl.getStats);

// ── INBOX ─────────────────────────────────────────────────────

// GET /api/user/messages/unread-count
router.get('/messages/unread-count', auth, async (req, res) => {
  try {
    const uid = req.user._id;
    const [personal, broadcast] = await Promise.all([
      Message.countDocuments({ toId: uid, isBroadcast: false, isRead: false, deletedBy: { $ne: uid } }),
      Message.countDocuments({ isBroadcast: true, readBy: { $ne: uid }, deletedBy: { $ne: uid } })
    ]);
    res.json({ success: true, count: personal + broadcast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/user/messages
router.get('/messages', auth, async (req, res) => {
  try {
    const uid = req.user._id;
    const { page = 1, limit = 30 } = req.query;
    const filter = {
      $or: [
        { toId: uid, isBroadcast: false },
        { isBroadcast: true }
      ],
      deletedBy: { $ne: uid }
    };
    const [messages, total] = await Promise.all([
      Message.find(filter).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
      Message.countDocuments(filter)
    ]);
    const result = messages.map(m => ({
      ...m,
      isRead: m.isBroadcast
        ? (m.readBy || []).some(id => id.toString() === uid.toString())
        : m.isRead
    }));
    res.json({ success: true, messages: result, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/user/messages/:id/read
router.patch('/messages/:id/read', auth, async (req, res) => {
  try {
    const uid = req.user._id;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });

    if (msg.isBroadcast) {
      if (!msg.readBy.some(id => id.toString() === uid.toString())) {
        msg.readBy.push(uid);
        await msg.save();
      }
    } else {
      msg.isRead = true;
      await msg.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/user/messages/:id  – soft delete cho user này
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const uid = req.user._id;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
    if (!msg.deletedBy.some(id => id.toString() === uid.toString())) {
      msg.deletedBy.push(uid);
      await msg.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
