'use strict';

// Cửa hàng lửa — the student spends their "ví lửa" (User.flameWallet) on
// the items/linh thú in constants/shop.js. Every purchase/use is a single
// conditional update (wallet >= price, item count >= 1, …) so a
// double-click or two tabs can never overspend or double-use.
const User = require('../models/User');
const { getVNDay, coverMissedDaysWithShields } = require('../utils/streak');
const {
  ITEMS, PETS, HOPE_QUOTA, HOPE_PENALTY, WALLET_SEED_CAP,
  CAKE_HOURS, CLOAK_HOURS, CROWN_DAYS,
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

// One-time launch gift: the wallet opens at min(current streak, cap).
async function seedWallet(userId) {
  const u = await User.findOne({ _id: userId, flameWalletSeeded: { $ne: true } })
    .select('learningStreak').lean();
  if (!u) return;
  const gift = Math.min(Math.max(u.learningStreak || 0, 0), WALLET_SEED_CAP);
  await User.updateOne(
    { _id: userId, flameWalletSeeded: { $ne: true } },
    { $inc: { flameWallet: gift }, $set: { flameWalletSeeded: true } }
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
    .select('flameWallet shopItems hopeHammerDay hopeHammerBase hopeHammerLast crownUntil invisibleUntil cakedUntil cakedBy pets activePet learningStreak')
    .lean();
  if (!u) return null;
  const today = getVNDay(new Date());
  const items = u.shopItems || {};
  const hopeToday = !!(u.hopeHammerDay && new Date(u.hopeHammerDay).getTime() === today.getTime());
  return {
    wallet: u.flameWallet || 0,
    streak: u.learningStreak || 0,
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

async function buyItem(userId, key) {
  const item = ITEM_BY_KEY[key];
  if (!item) return { status: 'not_found' };
  if (!(await assertStudent(userId))) return { status: 'forbidden' };
  await seedWallet(userId);
  const field = `shopItems.${key}`;
  const filter = { _id: userId, flameWallet: { $gte: item.price } };
  if (item.maxOwned) filter[field] = { $not: { $gte: item.maxOwned } };
  const u = await User.findOneAndUpdate(filter, { $inc: { flameWallet: -item.price, [field]: 1 } }, { new: true })
    .select('flameWallet shopItems').lean();
  if (!u) {
    const cur = await User.findById(userId).select('flameWallet shopItems').lean();
    if (item.maxOwned && ((cur.shopItems || {})[key] || 0) >= item.maxOwned) return { status: 'max_owned', max: item.maxOwned };
    return { status: 'not_enough', wallet: cur.flameWallet || 0, price: item.price };
  }
  return { status: 'ok', wallet: u.flameWallet, owned: u.shopItems[key] };
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

// Bánh Kem: spend the cake first, then land it on the target; if the
// target can't be hit (gone, staff, already covered in cake) refund it.
async function throwCake(userId, targetId) {
  if (!targetId || String(targetId) === String(userId)) return { status: 'invalid_target' };
  const thrower = await User.findById(userId).select('firstName lastName username role').lean();
  if (!thrower || thrower.role !== 'student') return { status: 'forbidden' };

  const spent = await spendOne(userId, 'cake', {}, {});
  if (!spent) return { status: 'none_left' };

  let hit;
  try {
    hit = await User.findOneAndUpdate(
      {
        _id: targetId, role: 'student',
        $or: [{ cakedUntil: null }, { cakedUntil: { $lte: new Date() } }],
      },
      { $set: { cakedUntil: new Date(Date.now() + CAKE_HOURS * HOUR), cakedBy: displayName(thrower) } },
      { new: true }
    ).select('firstName lastName username').lean();
  } catch {
    hit = null; // e.g. a malformed id — refund below
  }
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
  getState, buyItem, buyPet, setActivePet, getActivePet, useItem, throwCake, sellItem, sellPet,
  settleHopeHammer, settleAllHopeHammers, seedWallet, boardDecor,
};
