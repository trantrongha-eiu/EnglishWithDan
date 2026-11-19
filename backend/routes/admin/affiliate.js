'use strict';
// Admin → Tài chính → Affiliate: settings, payout queue, commissions,
// referrers (see services/affiliateService.js). Admin only — it is money.

const express = require('express');
const auth = require('../../middleware/auth');
const { adminOnly } = require('./_shared');
const affiliateService = require('../../services/affiliateService');

const router = express.Router();

function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err.status && err.status < 500) return res.status(err.status).json({ success: false, message: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

// GET /api/admin/affiliate/overview — settings + program totals
router.get('/affiliate/overview', auth, adminOnly, guard(async (req, res) => {
  res.json({ success: true, ...(await affiliateService.adminOverview()) });
}));

// PUT /api/admin/affiliate/settings { enabled, percent, minPayout }
router.put('/affiliate/settings', auth, adminOnly, guard(async (req, res) => {
  const s = await affiliateService.updateSettings(req.body || {});
  res.json({ success: true, settings: affiliateService.publicSettings(s) });
}));

// GET /api/admin/affiliate/payouts?status=pending&page=1
router.get('/affiliate/payouts', auth, adminOnly, guard(async (req, res) => {
  res.json({ success: true, ...(await affiliateService.listPayouts(req.query)) });
}));

router.put('/affiliate/payouts/:id/paid', auth, adminOnly, guard(async (req, res) => {
  await affiliateService.markPayoutPaid(req.params.id, req.body?.adminNote, req.user);
  res.json({ success: true, message: 'Đã đánh dấu đã chuyển tiền' });
}));

router.put('/affiliate/payouts/:id/reject', auth, adminOnly, guard(async (req, res) => {
  await affiliateService.rejectPayout(req.params.id, req.body?.adminNote, req.user);
  res.json({ success: true, message: 'Đã từ chối yêu cầu' });
}));

// GET /api/admin/affiliate/commissions?status=earned&referrerId=&page=1
router.get('/affiliate/commissions', auth, adminOnly, guard(async (req, res) => {
  res.json({ success: true, ...(await affiliateService.listCommissions(req.query)) });
}));

router.put('/affiliate/commissions/:id/cancel', auth, adminOnly, guard(async (req, res) => {
  await affiliateService.adminCancelCommission(req.params.id, req.body?.reason);
  res.json({ success: true, message: 'Đã hủy hoa hồng' });
}));

// GET /api/admin/affiliate/referrers
router.get('/affiliate/referrers', auth, adminOnly, guard(async (req, res) => {
  res.json({ success: true, items: await affiliateService.listReferrers() });
}));

module.exports = router;
