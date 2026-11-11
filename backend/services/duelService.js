'use strict';

// ⚔️ Thách đấu — two players bet the same 🔥 from their ví lửa on who
// studies more. Rules (constants/shop.js DUEL_*):
//   • The challenger's stake leaves their wallet at once; the opponent's
//     when they accept. Both sit on the Duel until it ends.
//   • From acceptance to the end of the NEXT VN day, each side's score is
//     the 🔥 they earn from studying — the daily-capped tally every practice
//     feeds (VocabActivity.streakBonusEarned), so a Búa Hi Vọng ×2 or a gift
//     doesn't count and nobody can earn more than the daily cap.
//   • More 🔥 takes the whole pot (2 × stake); a tie refunds both.
//   • Declined / cancelled / unanswered after DUEL_PENDING_HOURS → the
//     challenger gets their stake back.
// Every state change is a conditional update on `status`, so a double
// click, two tabs or two settlers can never pay out or refund twice.
// Settling is lazy (settleDue) — run from the duel list, from every
// action here, and from the shop feed poll every page makes each minute.
const mongoose = require('mongoose');
const Duel = require('../models/Duel');
const User = require('../models/User');
const Message = require('../models/Message');
const ShopPurchase = require('../models/ShopPurchase');
const VocabActivity = require('../models/VocabActivity');
const Block = require('../models/Block');
const { getVNDay } = require('../utils/streak');
const {
  DUEL_MIN_STAKE, DUEL_MAX_STAKE, DUEL_PENDING_HOURS, DUEL_MAX_OPEN, isFlameRole,
} = require('../constants/shop');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const OPEN = ['pending', 'active'];

function displayName(u) {
  return (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username || 'Ai đó';
}

// The real instant VN day `day` (UTC midnight of that VN date) ends.
function endOfVNDay(day) {
  return new Date(new Date(day).getTime() + DAY - 7 * HOUR);
}

// 🔥 each user earned from studying over VN days [from, to] → { id: n }.
async function earnedOn(userIds, from, to) {
  const rows = await VocabActivity.find({ userId: { $in: userIds }, date: { $gte: from, $lte: to } })
    .select('userId streakBonusEarned').lean();
  const out = {};
  for (const id of userIds) out[String(id)] = 0;
  for (const r of rows) out[String(r.userId)] = (out[String(r.userId)] || 0) + (r.streakBonusEarned || 0);
  return out;
}

function credit(userId, n) {
  return User.updateOne({ _id: userId }, { $inc: { flameWallet: n } });
}

async function notify(fromId, fromName, toId, subject, body) {
  try {
    await Message.create({ fromId, fromName, toId, subject, body, type: 'personal' });
  } catch (err) {
    console.error('[duel] notify failed:', err.message);
  }
}

function openCount(userId) {
  return Duel.countDocuments({ status: { $in: OPEN }, $or: [{ challengerId: userId }, { opponentId: userId }] });
}

// ── Settling ───────────────────────────────────────────────────────
async function expireOne(d) {
  const upd = await Duel.findOneAndUpdate({ _id: d._id, status: 'pending' }, { $set: { status: 'expired', settledAt: new Date() } });
  if (!upd) return;
  await credit(d.challengerId, d.stake);
  await notify(d.opponentId, d.opponentName, d.challengerId,
    `⌛ ${d.opponentName} chưa nhận lời thách đấu`,
    `Lời thách đấu ${d.stake} 🔥 gửi ${d.opponentName} đã hết hạn sau ${DUEL_PENDING_HOURS} giờ — ${d.stake} 🔥 đã về lại ví lửa của bạn.`);
}

async function settleOne(d) {
  const earned = await earnedOn([d.challengerId, d.opponentId], d.startDay, d.endDay);
  const scoreC = Math.max(0, earned[String(d.challengerId)] - (d.baseC || 0));
  const scoreO = Math.max(0, earned[String(d.opponentId)] - (d.baseO || 0));
  const winnerId = scoreC > scoreO ? d.challengerId : scoreO > scoreC ? d.opponentId : null;
  const upd = await Duel.findOneAndUpdate(
    { _id: d._id, status: 'active' },
    { $set: { status: 'done', scoreC, scoreO, winnerId, settledAt: new Date() } }
  );
  if (!upd) return;
  const pot = d.stake * 2;
  const score = `${d.challengerName} ${scoreC} – ${scoreO} ${d.opponentName}`;
  if (!winnerId) {
    await credit(d.challengerId, d.stake);
    await credit(d.opponentId, d.stake);
    for (const [to, fromId, fromName] of [[d.challengerId, d.opponentId, d.opponentName], [d.opponentId, d.challengerId, d.challengerName]]) {
      await notify(fromId, fromName, to, '🤝 Thách đấu hòa!', `Trận thách đấu kết thúc hòa (${score} 🔥). Mỗi bạn nhận lại ${d.stake} 🔥.`);
    }
    return;
  }
  const won = String(winnerId) === String(d.challengerId);
  const winnerName = won ? d.challengerName : d.opponentName;
  const loserId = won ? d.opponentId : d.challengerId;
  const loserName = won ? d.opponentName : d.challengerName;
  await credit(winnerId, pot);
  await notify(loserId, loserName, winnerId, `🏆 Bạn thắng trận thách đấu với ${loserName}!`,
    `Kết quả: ${score} 🔥. Bạn nhận trọn ${pot} 🔥 vào ví lửa. Quá đỉnh!`);
  await notify(winnerId, winnerName, loserId, `⚔️ ${winnerName} thắng trận thách đấu`,
    `Kết quả: ${score} 🔥. ${winnerName} nhận ${pot} 🔥 — thách đấu lại để phục thù nhé!`);
  // The "X vừa …" ticker every page shows (shop-feed.js renders kind 'duel').
  try {
    await ShopPurchase.create({ userId: winnerId, name: winnerName, kind: 'duel', key: 'duel', itemName: loserName, emoji: '⚔️', price: pot });
  } catch (err) {
    console.error('[duel] ticker row failed:', err.message);
  }
}

// Expire unanswered challenges and settle duels whose last day is over.
async function settleDue() {
  const now = new Date();
  const today = getVNDay(now);
  const [stale, due] = await Promise.all([
    Duel.find({ status: 'pending', expiresAt: { $lte: now } }).lean(),
    Duel.find({ status: 'active', endDay: { $lt: today } }).lean(),
  ]);
  for (const d of stale) await expireOne(d);
  for (const d of due) await settleOne(d);
  return stale.length + due.length;
}

// ── Actions ────────────────────────────────────────────────────────
async function challenge(userId, toId, stake) {
  const n = Number(stake);
  if (!Number.isInteger(n) || n < DUEL_MIN_STAKE || n > DUEL_MAX_STAKE) {
    return { status: 'duel_stake', min: DUEL_MIN_STAKE, max: DUEL_MAX_STAKE };
  }
  const me = await User.findById(userId).select('role firstName lastName username').lean();
  if (!me || !isFlameRole(me.role)) return { status: 'forbidden' };
  if (!toId || String(toId) === String(userId)) return { status: 'duel_self' };
  if (!mongoose.isValidObjectId(toId)) return { status: 'target_not_found' };
  const rival = await User.findById(toId).select('role isBanned firstName lastName username').lean();
  if (!rival || !isFlameRole(rival.role) || rival.isBanned) return { status: 'target_not_found' };
  if (await Block.exists({ $or: [{ blockerId: userId, blockedId: toId }, { blockerId: toId, blockedId: userId }] })) {
    return { status: 'duel_blocked' };
  }
  await settleDue();
  if ((await openCount(userId)) >= DUEL_MAX_OPEN) return { status: 'duel_limit_me', max: DUEL_MAX_OPEN };
  if ((await openCount(toId)) >= DUEL_MAX_OPEN) return { status: 'duel_limit_target', max: DUEL_MAX_OPEN };
  const pair = [{ challengerId: userId, opponentId: toId }, { challengerId: toId, opponentId: userId }];
  if (await Duel.exists({ status: { $in: OPEN }, $or: pair })) return { status: 'duel_exists' };

  const paid = await User.findOneAndUpdate({ _id: userId, flameWallet: { $gte: n } }, { $inc: { flameWallet: -n } }, { new: true })
    .select('flameWallet').lean();
  if (!paid) {
    const cur = await User.findById(userId).select('flameWallet').lean();
    return { status: 'not_enough', wallet: (cur && cur.flameWallet) || 0, price: n };
  }
  let duel;
  try {
    duel = await Duel.create({
      challengerId: userId, challengerName: displayName(me),
      opponentId: toId, opponentName: displayName(rival),
      stake: n, expiresAt: new Date(Date.now() + DUEL_PENDING_HOURS * HOUR),
    });
  } catch (err) {
    console.error('[duel] create failed:', err.message);
    await credit(userId, n);
    return { status: 'duel_failed' };
  }
  await notify(userId, displayName(me), toId, `⚔️ ${displayName(me)} thách đấu bạn — cược ${n} 🔥!`,
    `${displayName(me)} vừa đặt ${n} 🔥 thách bạn một trận học. Nhận lời (cũng cược ${n} 🔥) ở Cửa hàng lửa → ⚔️ Thách đấu trong ${DUEL_PENDING_HOURS} giờ tới. `
    + `Từ lúc nhận lời đến hết ngày mai, ai kiếm được nhiều 🔥 từ bài học hơn sẽ ẵm trọn ${n * 2} 🔥!`);
  return { status: 'ok', wallet: paid.flameWallet, duel: view(duel.toObject(), userId, {}) };
}

async function respond(userId, duelId, accept) {
  if (!mongoose.isValidObjectId(duelId)) return { status: 'duel_gone' };
  await settleDue();
  const d = await Duel.findOne({ _id: duelId, opponentId: userId, status: 'pending' }).lean();
  if (!d) return { status: 'duel_gone' };

  if (!accept) {
    const upd = await Duel.findOneAndUpdate({ _id: d._id, status: 'pending' }, { $set: { status: 'declined', settledAt: new Date() } });
    if (!upd) return { status: 'duel_gone' };
    await credit(d.challengerId, d.stake);
    await notify(userId, d.opponentName, d.challengerId, `🙅 ${d.opponentName} đã từ chối thách đấu`,
      `${d.opponentName} chưa muốn đấu lần này — ${d.stake} 🔥 đã về lại ví lửa của bạn.`);
    return { status: 'ok' };
  }

  const paid = await User.findOneAndUpdate({ _id: userId, flameWallet: { $gte: d.stake } }, { $inc: { flameWallet: -d.stake } }, { new: true })
    .select('flameWallet').lean();
  if (!paid) {
    const cur = await User.findById(userId).select('flameWallet').lean();
    return { status: 'not_enough', wallet: (cur && cur.flameWallet) || 0, price: d.stake };
  }
  const today = getVNDay(new Date());
  const base = await earnedOn([d.challengerId, d.opponentId], today, today);
  const upd = await Duel.findOneAndUpdate(
    { _id: d._id, status: 'pending', expiresAt: { $gt: new Date() } },
    {
      $set: {
        status: 'active', startDay: today, endDay: new Date(today.getTime() + DAY),
        baseC: base[String(d.challengerId)], baseO: base[String(d.opponentId)],
      },
    },
    { new: true }
  ).lean();
  if (!upd) {
    await credit(userId, d.stake);
    return { status: 'duel_gone' };
  }
  await notify(userId, d.opponentName, d.challengerId, `⚔️ ${d.opponentName} đã nhận lời thách đấu!`,
    `Trận ${d.stake} 🔥 bắt đầu! Đến hết ngày mai (${endOfVNDay(upd.endDay).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}), `
    + `ai kiếm được nhiều 🔥 từ bài học hơn sẽ ẵm ${d.stake * 2} 🔥. Học ngay thôi!`);
  return { status: 'ok', wallet: paid.flameWallet };
}

async function cancel(userId, duelId) {
  if (!mongoose.isValidObjectId(duelId)) return { status: 'duel_gone' };
  const upd = await Duel.findOneAndUpdate(
    { _id: duelId, challengerId: userId, status: 'pending' },
    { $set: { status: 'cancelled', settledAt: new Date() } }
  ).lean();
  if (!upd) return { status: 'duel_gone' };
  await credit(userId, upd.stake);
  const u = await User.findById(userId).select('flameWallet').lean();
  return { status: 'ok', wallet: (u && u.flameWallet) || 0 };
}

// ── Reading ────────────────────────────────────────────────────────
// One duel from the viewer's side. `live` = today's running scores for an
// active duel ({ id: earned since startDay }).
function view(d, viewerId, live) {
  const mine = String(d.challengerId) === String(viewerId);
  let myScore = mine ? d.scoreC : d.scoreO;
  let rivalScore = mine ? d.scoreO : d.scoreC;
  if (d.status === 'active' && live) {
    const c = Math.max(0, (live[String(d.challengerId)] || 0) - (d.baseC || 0));
    const o = Math.max(0, (live[String(d.opponentId)] || 0) - (d.baseO || 0));
    myScore = mine ? c : o;
    rivalScore = mine ? o : c;
  }
  let result = null;
  if (d.status === 'done') result = !d.winnerId ? 'tie' : String(d.winnerId) === String(viewerId) ? 'win' : 'lose';
  return {
    id: String(d._id),
    status: d.status,
    role: mine ? 'challenger' : 'opponent',
    rival: { id: String(mine ? d.opponentId : d.challengerId), name: mine ? d.opponentName : d.challengerName },
    stake: d.stake,
    pot: d.stake * 2,
    myScore: myScore || 0,
    rivalScore: rivalScore || 0,
    result,
    expiresAt: d.expiresAt,
    endsAt: d.endDay ? endOfVNDay(d.endDay) : null,
    createdAt: d.createdAt,
  };
}

async function listDuels(userId) {
  await settleDue();
  const rows = await Duel.find({ $or: [{ challengerId: userId }, { opponentId: userId }] })
    .sort({ createdAt: -1 }).limit(20).lean();
  const active = rows.filter(d => d.status === 'active');
  const lives = await Promise.all(active.map(d => earnedOn([d.challengerId, d.opponentId], d.startDay, d.endDay)));
  const liveById = Object.fromEntries(active.map((d, i) => [String(d._id), lives[i]]));
  const views = rows.map(d => view(d, userId, liveById[String(d._id)]));
  return {
    open: views.filter(v => OPEN.includes(v.status)),
    recent: views.filter(v => !OPEN.includes(v.status)).slice(0, 8),
    rules: { min: DUEL_MIN_STAKE, max: DUEL_MAX_STAKE, maxOpen: DUEL_MAX_OPEN, pendingHours: DUEL_PENDING_HOURS },
  };
}

module.exports = { challenge, respond, cancel, listDuels, settleDue, endOfVNDay };
