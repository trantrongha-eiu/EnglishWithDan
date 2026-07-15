'use strict';
// Extracted from backend/routes/admin.js — Messages (admin sending mail to students) section.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const Message = require('../../models/Message');

const router = express.Router();

// ══════════════════════════════════════════════════
// MESSAGES (Admin gửi thư cho học sinh)
// ══════════════════════════════════════════════════

// GET /api/admin/messages  – danh sách thư đã gửi
router.get('/messages', auth, teacherOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [messages, total] = await Promise.all([
      Message.find({ fromId: req.user._id })
        .populate('toId', 'username')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      Message.countDocuments({ fromId: req.user._id })
    ]);
    res.json({ success: true, messages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/messages/received – thư nhận được (phản hồi từ học sinh, thông báo thanh toán...)
router.get('/messages/received', auth, teacherOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { toId: req.user._id, deletedBy: { $ne: req.user._id } };
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate('fromId', 'username')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      Message.countDocuments(filter)
    ]);
    res.json({ success: true, messages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/messages/received/:id – xóa thư đã nhận (soft-delete cho người xem này)
router.delete('/messages/received/:id', auth, teacherOnly, async (req, res) => {
  try {
    const msg = await Message.findOne({ _id: req.params.id, toId: req.user._id });
    if (!msg) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
    if (!msg.deletedBy.some(id => id.toString() === req.user._id.toString())) {
      msg.deletedBy.push(req.user._id);
      await msg.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/messages  – gửi thư mới
router.post('/messages', auth, teacherOnly, async (req, res) => {
  try {
    const { toId, subject, body, isBroadcast } = req.body;
    if (!body?.trim()) return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
    if (!isBroadcast && !toId) return res.status(400).json({ success: false, message: 'Vui lòng chọn người nhận' });

    const msg = new Message({
      fromId:      req.user._id,
      fromName:    req.user.username,
      toId:        isBroadcast ? null : toId,
      subject:     subject?.trim() || '',
      body:        body.trim(),
      isBroadcast: !!isBroadcast,
    });
    await msg.save();
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/messages/:id  – xóa thư đã gửi
router.delete('/messages/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Message.findOneAndDelete({ _id: req.params.id, fromId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
