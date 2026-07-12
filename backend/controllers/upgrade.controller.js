'use strict';

const upgradeService = require('../services/upgradeService');

// The unique partial index on {userId,status:'pending'} is the real guard
// against a race between the findOne check in the service and the save
// (see the UpgradeRequest model) — the 11000 handling below is the fallback
// for that race, not the primary check.
function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Bạn đã có yêu cầu đang chờ xử lý. Vui lòng đợi Admin xác nhận.' });
      }
      console.error('[Upgrade] error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

exports.createRequest = guard(async (req, res) => {
  const { months, note } = req.body;
  if (!upgradeService.VALID_MONTHS.includes(Number(months))) {
    return res.status(400).json({ success: false, message: 'Gói không hợp lệ.' });
  }
  const result = await upgradeService.createRequest(req.user._id, Number(months), note);
  if (result.conflict) {
    return res.status(400).json({ success: false, message: 'Bạn đã có yêu cầu đang chờ xử lý. Vui lòng đợi Admin xác nhận.', requestId: result.requestId });
  }
  res.status(201).json({ success: true, message: 'Yêu cầu nâng cấp đã được gửi. Admin sẽ xác nhận trong vòng 24 giờ.', request: result.request });
});

exports.getStatus = guard(async (req, res) => {
  const request = await upgradeService.getStatus(req.user._id);
  res.json({ success: true, request: request || null, userPlan: req.user.plan || 'free', planExpiresAt: req.user.planExpiresAt || null });
});
