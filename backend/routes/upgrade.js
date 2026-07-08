const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UpgradeRequest = require('../models/UpgradeRequest');

const PRICES = { 1: 90000, 3: 250000, 6: 500000, 12: 900000, 36: 2500000 };

// POST /api/upgrade/request — học viên gửi yêu cầu nâng cấp
router.post('/request', auth, async (req, res) => {
  try {
    const { months, note } = req.body;
    if (![1, 3, 6, 12, 36].includes(Number(months))) {
      return res.status(400).json({ success: false, message: 'Gói không hợp lệ.' });
    }
    const amount = PRICES[Number(months)];

    // Không cho tạo thêm nếu đang có request pending
    const existing = await UpgradeRequest.findOne({ userId: req.user._id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bạn đã có yêu cầu đang chờ xử lý. Vui lòng đợi Admin xác nhận.', requestId: existing._id });
    }

    const request = new UpgradeRequest({
      userId: req.user._id,
      months: Number(months),
      amount,
      note: note || ''
    });
    await request.save();
    res.status(201).json({ success: true, message: 'Yêu cầu nâng cấp đã được gửi. Admin sẽ xác nhận trong vòng 24 giờ.', request });
  } catch (err) {
    // The unique partial index on {userId,status:'pending'} is the real guard against
    // a race between the findOne check above and this save (see model for details).
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bạn đã có yêu cầu đang chờ xử lý. Vui lòng đợi Admin xác nhận.' });
    }
    console.error('[Upgrade] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/upgrade/status — lấy yêu cầu mới nhất của học viên
router.get('/status', auth, async (req, res) => {
  try {
    const request = await UpgradeRequest.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, request: request || null, userPlan: req.user.plan || 'free', planExpiresAt: req.user.planExpiresAt || null });
  } catch (err) {
    console.error('[Upgrade] error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
