'use strict';
// Extracted from backend/routes/admin.js — Plan Management and Upgrade Requests sections.
// Named billing.js until 2026-07-25 (admin panel audit finding #8) — renamed
// because it handles zero actual payment/invoice records despite the name;
// this file only ever mutates User.plan/planExpiresAt (premium subscription
// status) and the UpgradeRequest queue. Real tuition/fee billing is a
// completely separate, unrelated system: TuitionFee/TuitionSettings models,
// backend/routes/tuition.js, backend/services/tuitionService.js.

const express = require('express');
const auth    = require('../../middleware/auth');
const { adminOnly } = require('./_shared');
const { computePlanExpiry } = require('../../utils/plan');

const User           = require('../../models/User');
const UpgradeRequest = require('../../models/UpgradeRequest');

const router = express.Router();

// Applies `months` of premium to a user, stacking on remaining time if their
// plan hasn't expired yet (via computePlanExpiry). Shared by the direct
// admin-grant route below and the upgrade-request approval route further
// down — previously each hand-rolled its own findByIdAndUpdate with the
// same {plan, planExpiresAt, planStartedAt} shape, which could drift.
async function grantPremium(userId, months) {
  const existing = await User.findById(userId).select('planExpiresAt');
  if (!existing) return null;
  const planExpiresAt = computePlanExpiry(existing.planExpiresAt, months);
  return User.findByIdAndUpdate(
    userId,
    { plan: 'premium', planExpiresAt, planStartedAt: new Date() },
    { new: true }
  ).select('username email plan planExpiresAt role');
}

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

    let user;
    if (plan === 'premium' && months) {
      user = await grantPremium(req.params.id, months);
    } else {
      const update = plan === 'free' ? { plan, planExpiresAt: null, planStartedAt: null } : { plan };
      user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
        .select('username email plan planExpiresAt role');
    }
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
    // Atomically claim the request — status:'pending' in the FILTER means
    // only the first of two concurrent approve calls (a double-click, or
    // two admin sessions racing) actually flips it to 'approved' here; the
    // loser gets null back and never reaches grantPremium() below, closing
    // a race that could otherwise grant `months` of premium twice for one
    // paid request (the old findById-then-save-later shape had no such
    // guard). Only username is used below — field-limit the populate so it
    // doesn't pull the full User document (password hash, resetOTP, etc.)
    const request = await UpgradeRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'approved', adminNote: adminNote || '', reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('userId', 'username');
    if (!request) {
      const exists = await UpgradeRequest.exists({ _id: req.params.id });
      return res.status(exists ? 400 : 404).json({
        success: false,
        message: exists ? 'Yêu cầu đã được xử lý' : 'Không tìm thấy yêu cầu'
      });
    }

    let updatedUser;
    try {
      updatedUser = await grantPremium(request.userId._id, request.months);
      if (!updatedUser) throw new Error('Không tìm thấy tài khoản học sinh');
    } catch (grantErr) {
      // Grant failed after the request was already claimed as 'approved' —
      // roll it back to 'pending' so it isn't stuck approved with no
      // premium actually applied, and the admin can just retry.
      await UpgradeRequest.findByIdAndUpdate(request._id, { status: 'pending', reviewedBy: null, reviewedAt: null });
      throw grantErr;
    }

    res.json({ success: true, message: `Đã nâng cấp Premium cho ${updatedUser.username} đến ${updatedUser.planExpiresAt.toLocaleDateString('vi-VN')}` });
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
