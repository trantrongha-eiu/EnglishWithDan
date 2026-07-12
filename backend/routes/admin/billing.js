'use strict';
// Extracted from backend/routes/admin.js — Plan Management and Upgrade Requests sections.

const express = require('express');
const auth    = require('../../middleware/auth');
const { adminOnly } = require('./_shared');
const { computePlanExpiry } = require('../../utils/plan');

const User           = require('../../models/User');
const UpgradeRequest = require('../../models/UpgradeRequest');

const router = express.Router();

// ══════════════════════════════════════════════════════════════════════════════
// PLAN MANAGEMENT (admin only)
// ══════════════════════════════════════════════════════════════════════════════

// PUT /api/admin/users/:id/plan — nâng/hạ plan của user
router.put('/users/:id/plan', auth, adminOnly, async (req, res) => {
  try {
    const { plan, months } = req.body;
    if (!['free', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Plan không hợp lệ' });
    }
    const update = { plan };
    if (plan === 'premium' && months) {
      const existing = await User.findById(req.params.id).select('planExpiresAt');
      update.planExpiresAt = computePlanExpiry(existing?.planExpiresAt, months);
      update.planStartedAt = new Date();
    } else if (plan === 'free') {
      update.planExpiresAt = null;
      update.planStartedAt = null;
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('username email plan planExpiresAt role');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// UPGRADE REQUESTS (admin only)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/upgrade-requests
router.get('/upgrade-requests', auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const [requests, total] = await Promise.all([
      UpgradeRequest.find(filter)
        .populate('userId', 'username email firstName lastName plan planExpiresAt')
        .populate('reviewedBy', 'username')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      UpgradeRequest.countDocuments(filter)
    ]);
    res.json({ success: true, requests, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/upgrade-requests/:id/approve
router.put('/upgrade-requests/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const { adminNote } = req.body;
    // Only username/planExpiresAt are used below — field-limit the populate so
    // it doesn't pull the full User document (password hash, resetOTP, etc.)
    const request = await UpgradeRequest.findById(req.params.id).populate('userId', 'username planExpiresAt');
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý' });
    }
    // Tính ngày hết hạn plan (cộng thêm từ hiện tại hoặc từ ngày hết hạn cũ nếu còn hạn)
    const user = request.userId;
    const newExpiry = computePlanExpiry(user.planExpiresAt, request.months);

    await User.findByIdAndUpdate(user._id, { plan: 'premium', planExpiresAt: newExpiry, planStartedAt: new Date() });
    request.status = 'approved';
    request.adminNote = adminNote || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ success: true, message: `Đã nâng cấp Premium cho ${user.username} đến ${newExpiry.toLocaleDateString('vi-VN')}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/upgrade-requests/:id/reject
router.put('/upgrade-requests/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const request = await UpgradeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý' });
    }
    request.status = 'rejected';
    request.adminNote = adminNote || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();
    res.json({ success: true, message: 'Đã từ chối yêu cầu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
