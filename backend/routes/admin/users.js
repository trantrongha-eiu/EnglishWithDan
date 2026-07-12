'use strict';
// Extracted from backend/routes/admin.js — User Management and Online Users sections.

const express = require('express');
const bcrypt  = require('bcryptjs');
const auth    = require('../../middleware/auth');
const { teacherOnly, adminOnly, escapeRegex } = require('./_shared');
const logger  = require('../../utils/logger');

const User = require('../../models/User');

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

// POST /api/admin/users – tạo tài khoản mới (chỉ admin)
router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const { username, email, password, role = 'student', firstName = '', lastName = '' } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ username, email và mật khẩu.' });
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ success: false, message: 'Username hoặc email đã tồn tại.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role, firstName, lastName });
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
    const { username, email, firstName, lastName, role, isBanned, newPassword } = req.body;
    const update = { username, email, firstName, lastName, role };
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
