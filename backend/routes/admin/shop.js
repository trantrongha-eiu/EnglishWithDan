'use strict';
// BXH vocab + Cửa hàng lửa 🔥 — admin overview of vocab-leaderboard.html and
// shop.html. Read-only on purpose: 🔥 and items move only through the
// student flows (shopService), so a teacher can watch the economy here —
// who holds what, what was bought (30-day log), who is dueling — without a
// second write path that could drift from the shop's rules.

const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly, effectiveStreak } = require('./_shared');
const User = require('../../models/User');
const ShopPurchase = require('../../models/ShopPurchase');
const Duel = require('../../models/Duel');
const { ITEMS, PETS } = require('../../constants/shop');

const router = express.Router();

// GET /api/admin/shop/overview
router.get('/shop/overview', auth, teacherOnly, async (req, res) => {
  try {
    const now = new Date();
    const [players, purchases, duels] = await Promise.all([
      User.find({ role: 'student', isBanned: { $ne: true } })
        .select('firstName lastName username learningStreak lastActivityDate flameWallet streakHammers shopItems pets activePet crownUntil')
        .lean(),
      ShopPurchase.find({}).sort({ createdAt: -1 }).limit(300).lean(),
      Duel.find({}).sort({ createdAt: -1 }).limit(200).lean(),
    ]);

    const rows = players.map(u => ({
      _id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
      streak: effectiveStreak(u.learningStreak, u.lastActivityDate, u.shopItems && u.shopItems.iceShield),
      wallet: u.flameWallet || 0,
      hammers: u.streakHammers || 0,
      items: u.shopItems || {},
      pets: (u.pets || []).length,
      activePet: u.activePet || '',
      crowned: !!(u.crownUntil && new Date(u.crownUntil) > now),
    }))
      .filter(r => r.streak > 0 || r.wallet > 0 || r.pets > 0)
      .sort((a, b) => b.streak - a.streak || b.wallet - a.wallet);

    const duelCounts = {};
    for (const d of duels) duelCounts[d.status] = (duelCounts[d.status] || 0) + 1;

    res.json({
      success: true,
      catalog: {
        items: ITEMS.map(i => ({ key: i.key, name: i.name, emoji: i.emoji, price: i.price })),
        pets: PETS.map(p => ({ id: p.id, name: p.name, price: p.price, legendary: !!p.legendary })),
      },
      stats: {
        players: rows.length,
        walletTotal: rows.reduce((a, r) => a + r.wallet, 0),
        spent30d: purchases.filter(p => p.kind !== 'duel').reduce((a, p) => a + (p.price || 0), 0),
        purchases30d: purchases.filter(p => p.kind !== 'duel').length,
        duelCounts,
      },
      players: rows,
      purchases,
      duels,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
