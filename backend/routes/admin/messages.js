'use strict';
// Extracted from backend/routes/admin.js — Messages (admin sending mail to students) section.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');

const Message = require('../../models/Message');
const Report  = require('../../models/Report');

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

// GET /api/admin/messages/unread-count – số thư nhận được (từ học sinh) chưa
// đọc — dùng cho badge trên sidebar, cùng ý nghĩa "isRead" mà GET
// /messages/received đã trả về cho từng dòng, chỉ gộp lại thành 1 số.
router.get('/messages/unread-count', auth, teacherOnly, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      toId: req.user._id,
      isRead: false,
      deletedBy: { $ne: req.user._id },
    });
    res.json({ success: true, count });
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

// DELETE /api/admin/messages/received – xóa toàn bộ thư đã nhận (soft-delete
// cho người xem này — không ảnh hưởng bản ghi phía người gửi, cùng cơ chế
// deletedBy với xóa từng thư ở trên).
router.delete('/messages/received', auth, teacherOnly, async (req, res) => {
  try {
    const result = await Message.updateMany(
      { toId: req.user._id, deletedBy: { $ne: req.user._id } },
      { $addToSet: { deletedBy: req.user._id } }
    );
    res.json({ success: true, deletedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/messages  – gửi thư mới
router.post('/messages', auth, teacherOnly, async (req, res) => {
  try {
    const { toId, subject, body, isBroadcast, giftHammers, giftStreakDays } = req.body;
    if (!body?.trim()) return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
    if (!isBroadcast && !toId) return res.status(400).json({ success: false, message: 'Vui lòng chọn người nhận' });

    const hammers = Math.max(0, Math.floor(Number(giftHammers) || 0));
    const streakDays = Math.max(0, Math.floor(Number(giftStreakDays) || 0));

    const msg = new Message({
      fromId:         req.user._id,
      fromName:       req.user.username,
      toId:           isBroadcast ? null : toId,
      subject:        subject?.trim() || '',
      body:           body.trim(),
      isBroadcast:    !!isBroadcast,
      giftHammers:    hammers,
      giftStreakDays: streakDays,
      type:           isBroadcast ? 'broadcast' : (hammers > 0 || streakDays > 0) ? 'gift' : 'personal',
    });
    await msg.save();
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/messages/:id  – sửa tiêu đề/nội dung thư đã gửi (chỉ sửa lỗi
// chính tả — không cho đổi người nhận/broadcast/quà đính kèm sau khi đã gửi,
// vì quà đã có thể được nhận và đổi người nhận sau khi gửi không có ý nghĩa gì).
router.put('/messages/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!body?.trim()) return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
    const msg = await Message.findOneAndUpdate(
      { _id: req.params.id, fromId: req.user._id },
      { subject: subject?.trim() || '', body: body.trim() },
      { new: true }
    ).populate('toId', 'username');
    if (!msg) return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
    res.json({ success: true, message: msg });
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

// DELETE /api/admin/messages – xóa toàn bộ thư đã gửi (bởi chính người dùng
// này — hard-delete, cùng cơ chế với xóa từng thư ở trên; không đụng tới
// thư do admin/giáo viên khác gửi).
router.delete('/messages', auth, teacherOnly, async (req, res) => {
  try {
    const result = await Message.deleteMany({ fromId: req.user._id });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// REPORTS (học sinh báo cáo học sinh khác khi chat — xem services/peerService.js)
// ══════════════════════════════════════════════════

// GET /api/admin/reports?status=open|resolved (default: open)
router.get('/reports', auth, teacherOnly, async (req, res) => {
  try {
    const status = ['open', 'resolved'].includes(req.query.status) ? req.query.status : 'open';
    // Same silently-truncating-count class of bug already fixed for
    // /recent-attempts — the 200 cap on `reports` stayed, but `total` now
    // lets the UI show "loaded N/total" instead of presenting the loaded
    // count as if it were the true one (Messages.jsx's tab badge used to
    // render reports.length directly, so a backlog past the 200th open
    // report went permanently unnoticed with no on-screen indication).
    const [reports, total] = await Promise.all([
      Report.find({ status })
        .populate('messageId', 'body createdAt')
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
      Report.countDocuments({ status }),
    ]);
    res.json({ success: true, reports, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/reports/:id/resolve
router.patch('/reports/:id/resolve', auth, teacherOnly, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
