'use strict';
// Admin CRUD for ReviewBypassCode — codes a teacher hands a student to
// skip the mandatory post-test Review gate (see
// backend/services/reviewService.redeemBypassCode).

const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly, adminOnly } = require('./_shared');
const ReviewBypassCode = require('../../models/ReviewBypassCode');

const router = express.Router();

function genCode() {
  // Avoid look-alike chars (0/O, 1/I) so a code read off a screen is safe.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

function publicShape(d) {
  return {
    _id: String(d._id),
    code: d.code,
    label: d.label || '',
    maxUses: d.maxUses,
    usedCount: d.usedCount,
    remaining: d.maxUses === 0 ? null : Math.max(0, d.maxUses - d.usedCount),
    active: d.active,
    expiresAt: d.expiresAt || null,
    redemptions: (d.redemptions || []).length,
    redeemable: typeof d.isRedeemable === 'function' ? d.isRedeemable() : undefined,
    createdAt: d.createdAt,
  };
}

// GET /api/admin/review-bypass-codes
router.get('/review-bypass-codes', auth, teacherOnly, async (req, res) => {
  try {
    const docs = await ReviewBypassCode.find().sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, codes: docs.map(publicShape) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/review-bypass-codes   { label?, maxUses?, expiresAt?, code? }
router.post('/review-bypass-codes', auth, teacherOnly, async (req, res) => {
  try {
    const { label = '', maxUses, expiresAt } = req.body || {};
    let code = String(req.body.code || '').trim().toUpperCase();
    if (code && !/^[A-Z0-9]{4,16}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Mã chỉ gồm chữ và số, 4–16 ký tự.' });
    }
    // Auto-generate a unique code if none supplied.
    if (!code) {
      for (let i = 0; i < 6; i++) {
        const c = genCode();
        if (!(await ReviewBypassCode.exists({ code: c }))) { code = c; break; }
      }
      if (!code) return res.status(500).json({ success: false, message: 'Không tạo được mã, thử lại.' });
    } else if (await ReviewBypassCode.exists({ code })) {
      return res.status(409).json({ success: false, message: 'Mã này đã tồn tại.' });
    }

    const mu = maxUses === undefined || maxUses === null || maxUses === '' ? 1 : Math.max(0, parseInt(maxUses, 10) || 0);
    const doc = await ReviewBypassCode.create({
      code,
      label: String(label || '').slice(0, 120),
      maxUses: mu,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, code: publicShape(doc) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/review-bypass-codes/:id   { active?, label?, maxUses?, expiresAt? }
router.patch('/review-bypass-codes/:id', auth, teacherOnly, async (req, res) => {
  try {
    const doc = await ReviewBypassCode.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy mã.' });
    const { active, label, maxUses, expiresAt } = req.body || {};
    if (active !== undefined) doc.active = !!active;
    if (label !== undefined) doc.label = String(label || '').slice(0, 120);
    if (maxUses !== undefined) doc.maxUses = Math.max(0, parseInt(maxUses, 10) || 0);
    if (expiresAt !== undefined) doc.expiresAt = expiresAt ? new Date(expiresAt) : null;
    await doc.save();
    res.json({ success: true, code: publicShape(doc) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/review-bypass-codes/:id  (admin only — teachers deactivate instead)
router.delete('/review-bypass-codes/:id', auth, adminOnly, async (req, res) => {
  try {
    const r = await ReviewBypassCode.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Không tìm thấy mã.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
