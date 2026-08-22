'use strict';
// Extracted from backend/routes/admin.js — User Management and Online Users sections.

const express = require('express');
const bcrypt  = require('bcryptjs');
const auth    = require('../../middleware/auth');
const { teacherOnly, adminOnly, escapeRegex } = require('./_shared');
const logger  = require('../../utils/logger');
const { isImageDataUri } = require('../../utils/validation');
const cloudinaryService = require('../../services/cloudinaryService');
const badgeService = require('../../services/badgeService');

const User = require('../../models/User');
const Message = require('../../models/Message');

const router = express.Router();

// ══════════════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════════════

// GET /api/admin/users – danh sách user (có search, phân trang)
router.get('/users', auth, teacherOnly, async (req, res) => {
  try {
    const { search, role, isBanned, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (search) {
      const re = escapeRegex(search);
      filter.$or = [
        { username:  { $regex: re, $options: 'i' } },
        { email:     { $regex: re, $options: 'i' } },
        { firstName: { $regex: re, $options: 'i' } },
        { lastName:  { $regex: re, $options: 'i' } }
      ];
    }
    if (role)     filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users/:id – lấy thông tin chi tiết 1 user
router.get('/users/:id', auth, teacherOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users/:id/badges – huy hiệu thành tích của 1 học sinh, cho
// StudentDetail.jsx (PLATFORM_AUDIT_2026-08-22 "làm ngay" #4). Trước đây
// GET /api/badges chỉ đọc req.user._id (chỉ học sinh tự xem được huy hiệu
// của chính mình) — badgeService.getBadges() đã nhận userId bất kỳ sẵn, chỉ
// thiếu 1 route admin gọi tới nó với req.params.id.
router.get('/users/:id/badges', auth, teacherOnly, async (req, res) => {
  try {
    const result = await badgeService.getBadges(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users – tạo tài khoản mới (chỉ admin)
router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const { username, email, password, role = 'student', firstName = '', lastName = '', className = '' } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ username, email và mật khẩu.' });
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ success: false, message: 'Username hoặc email đã tồn tại.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role, firstName, lastName, className });
    logger.security('Admin created a user account', { actorId: String(req.user._id), targetId: String(user._id), role });
    const safe = user.toObject();
    delete safe.password;
    res.json({ success: true, user: safe, message: 'Đã tạo tài khoản thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id – sửa thông tin user (chỉ admin)
router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { username, email, firstName, lastName, role, isBanned, newPassword, className } = req.body;
    const update = { username, email, firstName, lastName, role };
    if (className !== undefined) update.className = className;
    if (isBanned !== undefined) update.isBanned = isBanned;
    if (newPassword) {
      update.password = await bcrypt.hash(newPassword, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    // Role changes are a privilege-escalation-relevant event — no audit
    // trail existed for this before (production-readiness audit finding).
    if (role !== undefined) {
      logger.security('Admin changed a user role', { actorId: String(req.user._id), targetId: String(user._id), newRole: role });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users/:id/avatar – admin đặt/thay avatar cho user (chỉ admin)
router.post('/users/:id/avatar', auth, adminOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu ảnh' });
    if (!isImageDataUri(imageBase64)) return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });

    const result = await cloudinaryService.uploadImage(imageBase64, {
      folder: 'avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    });
    const user = await User.findByIdAndUpdate(req.params.id, { avatar: result.secure_url }, { new: true })
      .select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    logger.security('Admin changed a user avatar', { actorId: String(req.user._id), targetId: String(user._id) });
    res.json({ success: true, user, message: 'Đã cập nhật avatar' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id/avatar – xóa avatar của user, về mặc định (chỉ admin)
router.delete('/users/:id/avatar', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { avatar: '' }, { new: true })
      .select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    logger.security('Admin removed a user avatar', { actorId: String(req.user._id), targetId: String(user._id) });
    res.json({ success: true, user, message: 'Đã xóa avatar' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/ban – cấm / bỏ cấm user (chỉ admin)
router.put('/users/:id/ban', auth, adminOnly, async (req, res) => {
  try {
    const { isBanned, banReason = '' } = req.body;
    const update = { isBanned };
    if (isBanned) update.banReason = banReason;
    else          update.banReason = '';

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    logger.security(isBanned ? 'Admin banned a user' : 'Admin unbanned a user', { actorId: String(req.user._id), targetId: String(user._id) });
    res.json({ success: true, user, message: isBanned ? 'Đã cấm tài khoản' : 'Đã mở khóa tài khoản' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users/:id/remind – nhắc nhở học tập (vocab/bài tập thiếu),
// gửi qua hộp thư + cộng dồn studyReminderCount cho cảnh báo nổi ở nav.js.
// This is the ONE tracked reminder endpoint in the app — every "nudge a
// student" admin button (Users.jsx, VocabActivity.jsx) should route through
// here (with its own subject/body preset) rather than hitting the generic
// POST /admin/messages directly, so studyReminderCount/the escalation
// banner stay accurate regardless of which page sent the reminder.
router.post('/users/:id/remind', auth, teacherOnly, async (req, res) => {
  try {
    const { message, subject } = req.body;
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });

    student.studyReminderCount = (student.studyReminderCount || 0) + 1;
    await student.save();

    const body = message?.trim() ||
      'Thầy/Cô nhận thấy bạn chưa hoàn thành đủ bài tập từ vựng/bài tập gần đây. Hãy dành thời gian ôn tập và làm bài đầy đủ để không bị tụt lại nhé!';
    await Message.create({
      fromId:   req.user._id,
      fromName: req.user.username,
      toId:     student._id,
      subject:  subject?.trim() || '⚠️ Nhắc nhở học tập',
      body,
      type: 'reminder',
    });

    res.json({ success: true, studyReminderCount: student.studyReminderCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users/:id/reset-reminders – xóa cảnh báo nhắc nhở tích lũy
// (dùng khi học sinh đã bắt kịp bài, tắt banner cảnh báo trên mọi trang)
router.post('/users/:id/reset-reminders', auth, teacherOnly, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, { studyReminderCount: 0 }, { new: true })
      .select('-password -savedVocab -resetOTP -resetOTPExpires -resetOTPAttempts');
    if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    res.json({ success: true, user: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id – xóa vĩnh viễn user (chỉ admin)
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    // Không cho phép tự xóa chính mình
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính mình' });
    }
    await User.findByIdAndDelete(req.params.id);
    logger.security('Admin deleted a user account', { actorId: String(req.user._id), targetId: req.params.id });
    res.json({ success: true, message: 'Đã xóa tài khoản' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════
// ONLINE USERS
// ══════════════════════════════════════════════════

// GET /api/admin/online-users  – ai đang online (lastSeen trong 5 phút gần nhất)
router.get('/online-users', auth, teacherOnly, async (req, res) => {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const users = await User.find({ lastSeen: { $gte: since } })
      .select('username role lastSeen')
      .lean();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
