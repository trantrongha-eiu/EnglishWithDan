'use strict';

// Cửa hàng lửa — the student spends their "ví lửa" (User.flameWallet) on
// the items/linh thú in constants/shop.js. Every purchase/use is a single
// conditional update (wallet >= price, item count >= 1, …) so a
// double-click or two tabs can never overspend or double-use.
const User = require('../models/User');
const Message = require('../models/Message');
const ShopPurchase = require('../models/ShopPurchase');
const mongoose = require('mongoose');
const { getVNDay, effectiveStreak, coverMissedDaysWithShields } = require('../utils/streak');
const { DAILY_STREAK_BONUS_CAP, streakBonusEarnedToday } = require('./streakBonusService');
const {
  ITEMS, PETS, HOPE_QUOTA, HOPE_PENALTY,
  CAKE_HOURS, CLOAK_HOURS, CROWN_DAYS, MAX_BUY_QTY,
} = require('../constants/shop');

const HOUR = 60 * 60 * 1000;
const ITEM_BY_KEY = Object.fromEntries(ITEMS.map(i => [i.key, i]));
const PET_BY_ID = Object.fromEntries(PETS.map(p => [p.id, p]));

function displayName(u) {
  return (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username || 'Ai đó';
}

function isActive(until) {
  return !!(until && new Date(until).getTime() > Date.now());
}

// Extends a timed effect from whichever is later — now or its current end —
// so using a second crown while one is running adds 7 more days instead of
// wasting the first.
function extendFrom(until, ms) {
  const base = isActive(until) ? new Date(until).getTime() : Date.now();
  return new Date(base + ms);
}

// One-time grant: the ví lửa is topped up to the student's current streak
// (keeping anything above that), then grows with every 🔥 they earn from
// studying (utils/streak.js applyStreakActivity) or are gifted by message
// (User.applyGiftStreak). Students who opened the shop before this rule got
// a capped launch gift (flameWalletSeeded) — they're topped up the same way,
// since flameWalletGranted is the flag that counts now.
async function seedWallet(userId) {
  const u = await User.findOne({ _id: userId, flameWalletGranted: { $ne: true } })
    .select('learningStreak lastActivityDate shopItems').lean();
  if (!u) return;
  const streak = effectiveStreak(u.learningStreak, u.lastActivityDate, u.shopItems && u.shopItems.iceShield);
  await User.updateOne(
    { _id: userId, flameWalletGranted: { $ne: true } },
    [{ $set: { flameWallet: { $max: [{ $ifNull: ['$flameWallet', 0] }, streak] }, flameWalletGranted: true, flameWalletSeeded: true } }],
    { updatePipeline: true }
  );
}

// Búa Hi Vọng settlement for one user: once the VN day it was used on is
// over, a student who earned >= HOPE_QUOTA base 🔥 after using it keeps
// their doubled 🔥 (already credited live by applyStreakActivity); one who
// didn't loses HOPE_PENALTY from learningStreak (floored at 0). Guarded on
// the exact hopeHammerDay read, so concurrent callers settle it once.
async function settleHopeHammer(userId) {
  const today = getVNDay(new Date());
  const u = await User.findOne({ _id: userId, hopeHammerDay: { $ne: null, $lt: today } })
    .select('hopeHammerDay hopeHammerBase').lean();
  if (!u) return null;
  return settleOne(u);
}

async function settleOne(u) {
  const success = (u.hopeHammerBase || 0) >= HOPE_QUOTA;
  const penalty = success ? 0 : HOPE_PENALTY;
  const res = await User.updateOne(
    { _id: u._id, hopeHammerDay: u.hopeHammerDay },
    [{
      $set: {
        learningStreak: { $max: [0, { $subtract: ['$learningStreak', penalty] }] },
        hopeHammerLast: { day: u.hopeHammerDay, success, base: u.hopeHammerBase || 0, penalty },
        hopeHammerDay: null,
        hopeHammerBase: 0,
      },
    }],
    { updatePipeline: true }
  );
  return res.modifiedCount === 1 ? { success, penalty } : null;
}

// Sweep every expired bet — run before ranking the BXH so a missed quota
// shows up there even for a student who hasn't opened the app since.
async function settleAllHopeHammers() {
  const today = getVNDay(new Date());
  const due = await User.find({ hopeHammerDay: { $ne: null, $lt: today } })
    .select('hopeHammerDay hopeHammerBase').lean();
  for (const u of due) await settleOne(u);
  return due.length;
}

async function getState(userId) {
  await seedWallet(userId);
  await settleHopeHammer(userId);
  await coverMissedDaysWithShields(User, userId).catch(() => 0);
  const u = await User.findById(userId)
    .select('flameWallet shopItems hopeHammerDay hopeHammerBase hopeHammerLast crownUntil invisibleUntil cakedUntil cakedBy pets activePet learningStreak lastActivityDate streakHammers previousStreak streakLostAt')
    .lean();
  if (!u) return null;
  const today = getVNDay(new Date());
  const items = u.shopItems || {};
  const hopeToday = !!(u.hopeHammerDay && new Date(u.hopeHammerDay).getTime() === today.getTime());
  return {
    wallet: u.flameWallet || 0,
    streak: effectiveStreak(u.learningStreak, u.lastActivityDate, items.iceShield),
    // Búa Daniel (not sold here — earned from Paraphrase units / admin gifts),
    // shown in the Kho đồ next to the shop items. Used via the existing
    // POST /api/user/streak/use-hammer; canUse is User.canUseHammer()'s rule.
    danielHammer: {
      count: u.streakHammers || 0,
      canUse: User.hydrate(u).canUseHammer(),
      previousStreak: u.previousStreak || 0,
    },
    items: ITEMS.map(i => ({ ...i, owned: items[i.key] || 0, sellPrice: sellPrice(i.price) })),
    pets: PETS.map(p => ({ ...p, owned: (u.pets || []).includes(p.id), sellPrice: sellPrice(p.price) })),
    activePet: u.activePet || '',
    effects: {
      hope: hopeToday ? { base: u.hopeHammerBase || 0, quota: HOPE_QUOTA, penalty: HOPE_PENALTY } : null,
      hopeLast: u.hopeHammerLast && u.hopeHammerLast.day ? u.hopeHammerLast : null,
      crownUntil: isActive(u.crownUntil) ? u.crownUntil : null,
      invisibleUntil: isActive(u.invisibleUntil) ? u.invisibleUntil : null,
      cakedUntil: isActive(u.cakedUntil) ? u.cakedUntil : null,
      cakedBy: isActive(u.cakedUntil) ? u.cakedBy : '',
    },
  };
}

// Only students shop — staff never appear on the BXH and have no streak.
async function assertStudent(userId) {
  const u = await User.findById(userId).select('role').lean();
  return !!(u && u.role === 'student');
}

// After a successful purchase: log it for the "X vừa mua Y" ticker and drop
// a note in every admin's inbox (same shape as sendFeedbackToAdmins).
// Best-effort — a failure here must never undo or fail the purchase itself.
async function recordPurchase(userId, kind, entry, qty = 1) {
  try {
    const buyer = await User.findById(userId).select('firstName lastName username').lean();
    if (!buyer) return;
    const name = displayName(buyer);
    const emoji = entry.emoji || '🐾';
    const itemName = qty > 1 ? `${qty} × ${entry.name}` : entry.name;
    const what = kind === 'pet' ? `linh thú ${itemName}` : itemName;
    const price = entry.price * qty;
    await ShopPurchase.create({ userId, name, kind, key: entry.key || entry.id, itemName, emoji, price });
    const admins = await User.find({ role: 'admin' }, '_id').lean();
    if (!admins.length) return;
    await Message.insertMany(admins.map(admin => ({
      fromId: userId,
      fromName: name,
      toId: admin._id,
      subject: `[Cửa hàng] ${name} đã mua ${emoji} ${what}`,
      body: `${name} vừa mua ${emoji} ${what} với giá ${price} 🔥 trong Cửa hàng lửa.`,
      type: 'personal',
    })));
  } catch (err) {
    console.error('[shop] recordPurchase failed:', err.message);
  }
}

// The cake currently on the viewer's avatar (null if none), for the
// "bạn đã bị úp bánh kem bởi X" popup shop-feed.js shows on every page —
// `until` doubles as the id of that cake, so each one is announced once.
async function getCakeNotice(userId) {
  const u = await User.findById(userId).select('cakedUntil cakedBy shopItems').lean();
  if (!u || !isActive(u.cakedUntil)) return null;
  return { by: u.cakedBy || 'Ai đó', until: u.cakedUntil, towels: (u.shopItems || {}).towel || 0 };
}

// Recent purchases for the ticker, newest last, never the viewer's own
// (they already got their own toast). `since` is clamped to the last hour
// so a student back after a week isn't shown a flood.
async function getFeed(viewerId, since) {
  const floor = Date.now() - HOUR;
  const t = since ? new Date(since).getTime() : NaN;
  const from = new Date(Number.isFinite(t) ? Math.max(t, floor) : floor);
  const rows = await ShopPurchase.find({ createdAt: { $gt: from }, userId: { $ne: viewerId } })
    .sort({ createdAt: -1 }).limit(5)
    .select('name kind key itemName emoji createdAt').lean();
  return rows.reverse().map(r => ({
    id: String(r._id), name: r.name, kind: r.kind, key: r.key, itemName: r.itemName, emoji: r.emoji, at: r.createdAt,
  }));
}

// A Khiên Băng only protects gaps that happen while it is held. If the
// streak is already lost when one is bought (a gap the shields already in
// the kho can't cover), the loss is finalized first — the same snapshot as
// User.resetIfStale(), so the Búa Daniel can still restore it — instead of
// the new shield quietly reviving it on the next read. (Before, that only
// happened for students who hadn't opened the dashboard yet that day.)
async function finalizeLostStreak(userId) {
  await coverMissedDaysWithShields(User, userId).catch(() => 0);
  const today = getVNDay(new Date());
  // getVNDay(lastActivityDate) <= today - 2 days, for both day-bucketed
  // and raw stored values.
  await User.updateOne(
    { _id: userId, learningStreak: { $gt: 0 }, lastActivityDate: { $lt: new Date(today.getTime() - 24 * HOUR - 7 * HOUR) } },
    [{ $set: { previousStreak: '$learningStreak', streakLostAt: today, learningStreak: 0 } }],
    { updatePipeline: true }
  );
}

// `qty` copies in one purchase (1..MAX_BUY_QTY) — all or nothing: the
// wallet must cover qty × price and a capped item must still have room for
// all of them.
async function buyItem(userId, key, qty = 1) {
  const item = ITEM_BY_KEY[key];
  if (!item) return { status: 'not_found' };
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 1 || n > MAX_BUY_QTY) return { status: 'invalid_qty', max: MAX_BUY_QTY };
  if (!(await assertStudent(userId))) return { status: 'forbidden' };
  await seedWallet(userId);
  if (key === 'iceShield') await finalizeLostStreak(userId);
  const field = `shopItems.${key}`;
  const total = item.price * n;
  const filter = { _id: userId, flameWallet: { $gte: total } };
  if (item.maxOwned) filter[field] = { $not: { $gt: item.maxOwned - n } };
  const u = await User.findOneAndUpdate(filter, { $inc: { flameWallet: -total, [field]: n } }, { new: true })
    .select('flameWallet shopItems').lean();
  if (!u) {
    const cur = await User.findById(userId).select('flameWallet shopItems').lean();
    const owned = (cur.shopItems || {})[key] || 0;
    if (item.maxOwned && owned + n > item.maxOwned) return { status: 'max_owned', max: item.maxOwned, left: Math.max(0, item.maxOwned - owned) };
    return { status: 'not_enough', wallet: cur.flameWallet || 0, price: total };
  }
  await recordPurchase(userId, 'item', item, n);
  return { status: 'ok', wallet: u.flameWallet, owned: u.shopItems[key], qty: n };
}

async function buyPet(userId, petId) {
  const pet = PET_BY_ID[petId];
  if (!pet) return { status: 'not_found' };
  if (!(await assertStudent(userId))) return { status: 'forbidden' };
  await seedWallet(userId);
  // A first pet goes straight out for a walk.
  const u = await User.findOneAndUpdate(
    { _id: userId, flameWallet: { $gte: pet.price }, pets: { $ne: petId } },
    [{
      $set: {
        flameWallet: { $subtract: ['$flameWallet', pet.price] },
        pets: { $concatArrays: [{ $ifNull: ['$pets', []] }, [petId]] },
        activePet: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$activePet', ''] } }, 0] }, '$activePet', petId] },
      },
    }],
    { new: true, updatePipeline: true }
  ).select('flameWallet activePet').lean();
  if (!u) {
    const cur = await User.findById(userId).select('flameWallet pets').lean();
    if ((cur.pets || []).includes(petId)) return { status: 'already_owned' };
    return { status: 'not_enough', wallet: cur.flameWallet || 0, price: pet.price };
  }
  await recordPurchase(userId, 'pet', pet);
  return { status: 'ok', wallet: u.flameWallet, activePet: u.activePet };
}

// '' = no linh thú out walking.
async function setActivePet(userId, petId) {
  if (petId && !PET_BY_ID[petId]) return { status: 'not_found' };
  const filter = petId ? { _id: userId, pets: petId } : { _id: userId };
  const res = await User.updateOne(filter, { $set: { activePet: petId || '' } });
  if (res.matchedCount !== 1) return { status: 'not_owned' };
  return { status: 'ok', activePet: petId || '' };
}

async function getActivePet(userId) {
  const u = await User.findById(userId).select('activePet').lean();
  return (u && u.activePet) || '';
}

// Spends one of `key` atomically; returns the updated doc or null.
function spendOne(userId, key, extraFilter, update) {
  return User.findOneAndUpdate(
    { _id: userId, [`shopItems.${key}`]: { $gte: 1 }, ...extraFilter },
    { ...update, $inc: { [`shopItems.${key}`]: -1, ...((update && update.$inc) || {}) } },
    { new: true }
  ).lean();
}

async function useItem(userId, key) {
  const item = ITEM_BY_KEY[key];
  if (!item) return { status: 'not_found' };
  if (item.usage !== 'manual') return { status: 'not_manual' };

  if (key === 'hopeHammer') {
    // Settle a previous day's bet first, so the new one starts clean.
    await settleHopeHammer(userId);
    const pre = await User.findById(userId).select('hopeHammerDay shopItems').lean();
    if (!pre) return { status: 'not_found' };
    if (pre.hopeHammerDay) return { status: 'already_active' };
    if (!((pre.shopItems || {}).hopeHammer >= 1)) return { status: 'none_left' };
    // 🔥 earned per day is capped (streakBonusService) — once less than the
    // quota is left today, the bet could only be lost, so it isn't offered.
    const left = Math.max(0, DAILY_STREAK_BONUS_CAP - await streakBonusEarnedToday(userId));
    if (left < HOPE_QUOTA) return { status: 'hope_too_late', left, quota: HOPE_QUOTA };
    const today = getVNDay(new Date());
    const u = await spendOne(userId, 'hopeHammer', { hopeHammerDay: null },
      { $set: { hopeHammerDay: today, hopeHammerBase: 0 } });
    if (!u) {
      const cur = await User.findById(userId).select('hopeHammerDay shopItems').lean();
      if (cur && cur.hopeHammerDay) return { status: 'already_active' };
      return { status: 'none_left' };
    }
    return { status: 'ok', owned: u.shopItems.hopeHammer, hope: { base: 0, quota: HOPE_QUOTA, penalty: HOPE_PENALTY } };
  }

  // Khăn Lau Diệu Kì: wipes the cake off the student's own avatar now.
  if (key === 'towel') {
    const u = await spendOne(userId, 'towel', { cakedUntil: { $gt: new Date() } },
      { $set: { cakedUntil: null, cakedBy: '' } });
    if (u) return { status: 'ok', owned: u.shopItems.towel };
    const cur = await User.findById(userId).select('cakedUntil').lean();
    return { status: cur && isActive(cur.cakedUntil) ? 'none_left' : 'not_caked' };
  }

  // Timed effects: read the current end first so a renewal stacks on top.
  const cur = await User.findById(userId).select('crownUntil invisibleUntil shopItems').lean();
  if (!cur) return { status: 'not_found' };
  const field = key === 'crown' ? 'crownUntil' : 'invisibleUntil';
  const ms = key === 'crown' ? CROWN_DAYS * 24 * HOUR : CLOAK_HOURS * HOUR;
  const until = extendFrom(cur[field], ms);
  const u = await spendOne(userId, key, {}, { $set: { [field]: until } });
  if (!u) return { status: 'none_left' };
  return { status: 'ok', owned: u.shopItems[key], until };
}

// Bánh Kem: check the target, spend the cake, then land it; if someone
// else's cake landed in between (already covered in cake) refund it.
async function throwCake(userId, targetId) {
  if (!targetId || String(targetId) === String(userId)) return { status: 'invalid_target' };
  const thrower = await User.findById(userId).select('firstName lastName username role').lean();
  if (!thrower || thrower.role !== 'student') return { status: 'forbidden' };
  const target = mongoose.isValidObjectId(targetId)
    ? await User.findById(targetId).select('role cakedUntil').lean()
    : null;
  if (!target || target.role !== 'student') return { status: 'target_not_found' };
  if (isActive(target.cakedUntil)) return { status: 'already_caked' };

  const spent = await spendOne(userId, 'cake', {}, {});
  if (!spent) return { status: 'none_left' };

  const hit = await User.findOneAndUpdate(
    {
      _id: targetId, role: 'student',
      $or: [{ cakedUntil: null }, { cakedUntil: { $lte: new Date() } }],
    },
    { $set: { cakedUntil: new Date(Date.now() + CAKE_HOURS * HOUR), cakedBy: displayName(thrower) } },
    { new: true }
  ).select('firstName lastName username').lean();
  if (!hit) {
    await User.updateOne({ _id: userId }, { $inc: { 'shopItems.cake': 1 } });
    return { status: 'already_caked' };
  }
  return { status: 'ok', owned: spent.shopItems.cake, targetName: displayName(hit) };
}

// Kho đồ (profile.html): sell one owned item / a linh thú back for half
// its price (rounded down). Selling the pet that is out walking sends it
// home (activePet → ''). A Búa Hi Vọng already in play can't be sold —
// it has left the inventory the moment it was used.
function sellPrice(price) { return Math.floor(price / 2); }

async function sellItem(userId, key) {
  const item = ITEM_BY_KEY[key];
  if (!item) return { status: 'not_found' };
  const refund = sellPrice(item.price);
  const u = await User.findOneAndUpdate(
    { _id: userId, [`shopItems.${key}`]: { $gte: 1 } },
    { $inc: { [`shopItems.${key}`]: -1, flameWallet: refund } },
    { new: true }
  ).select('flameWallet shopItems').lean();
  if (!u) return { status: 'none_left' };
  return { status: 'ok', wallet: u.flameWallet, owned: u.shopItems[key], refund };
}

async function sellPet(userId, petId) {
  const pet = PET_BY_ID[petId];
  if (!pet) return { status: 'not_found' };
  const refund = sellPrice(pet.price);
  const u = await User.findOneAndUpdate(
    { _id: userId, pets: petId },
    [{
      $set: {
        flameWallet: { $add: [{ $ifNull: ['$flameWallet', 0] }, refund] },
        pets: { $filter: { input: '$pets', cond: { $ne: ['$$this', petId] } } },
        activePet: { $cond: [{ $eq: ['$activePet', petId] }, '', '$activePet'] },
      },
    }],
    { new: true, updatePipeline: true }
  ).select('flameWallet activePet').lean();
  if (!u) return { status: 'not_owned' };
  return { status: 'ok', wallet: u.flameWallet, activePet: u.activePet || '', refund };
}

// Decorations for the BXH rows (userService.rankedStreaks): which linh
// thú sits next to the name, crown, cloak, cake.
function boardDecor(u) {
  return {
    pet: u.activePet || '',
    crown: isActive(u.crownUntil),
    hidden: isActive(u.invisibleUntil),
    cakedBy: isActive(u.cakedUntil) ? (u.cakedBy || 'Ai đó') : '',
  };
}

module.exports = {
  getState, getFeed, getCakeNotice, buyItem, buyPet, setActivePet, getActivePet, useItem, throwCake, sellItem, sellPet,
  settleHopeHammer, settleAllHopeHammers, seedWallet, boardDecor,
};
