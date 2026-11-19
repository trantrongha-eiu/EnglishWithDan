'use strict';

// Affiliate / referral program.
//
//   1. Every account gets a referral link (/?ref=CODE) in Hồ sơ → Affiliate.
//   2. frontend/js/shared/visit-tracker.js stores ?ref= in the browser; the
//      new account is tied to its referrer at sign-up (register body `ref`)
//      or on its first login (POST /api/affiliate/claim — covers Google).
//   3. Each paid order of a referred user earns the referrer a commission:
//      an approved Premium upgrade request (routes/admin/premium.js) or a
//      tuition fee marked paid (tuitionService.updateFee). Un-marking /
//      deleting the fee cancels it. The % comes from AffiliateSettings and is
//      snapshotted per commission.
//   4. Balance = earned commissions − pending/paid payouts. The referrer
//      requests a withdrawal; the admin transfers by hand and marks it paid.

const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const AffiliateSettings = require('../models/AffiliateSettings');
const AffiliateCommission = require('../models/AffiliateCommission');
const AffiliatePayout = require('../models/AffiliatePayout');
const logger = require('../utils/logger');
const mediaStore = require('./mediaStore');

// A link only ties a NEW account to its referrer
const CLAIM_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
// No 0/O/1/I/L — codes get read out loud and typed by hand
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LEN = 7;
const CODE_RE = /^[A-Z0-9]{4,16}$/;

const validId = (id) => mongoose.Types.ObjectId.isValid(String(id || ''));
const vnd = (n) => Number(n || 0).toLocaleString('vi-VN');
const fail = (status, message) => Object.assign(new Error(message), { status });

function normalizeCode(code) {
  const c = typeof code === 'string' ? code.trim().toUpperCase() : '';
  return CODE_RE.test(c) ? c : '';
}

function randomCode() {
  const bytes = crypto.randomBytes(CODE_LEN);
  let out = '';
  for (let i = 0; i < CODE_LEN; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

function displayName(u) {
  if (!u) return '(Đã xóa)';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || '(Không tên)';
}

// "Nguyễn Văn An" → "Ngu***" — the referrer sees who joined without the
// whole list being a directory of other people's names
function maskName(u) {
  const name = displayName(u);
  if (name.length <= 2) return `${name[0] || '?'}*`;
  return `${name.slice(0, 3)}***`;
}

// ── Settings ─────────────────────────────────────────────────────────────
async function getSettings() {
  return AffiliateSettings.getSingleton();
}

async function updateSettings(body = {}) {
  const doc = await getSettings();
  if (body.enabled !== undefined) doc.enabled = body.enabled === true || body.enabled === 'true';
  if (body.percent !== undefined) {
    const p = Number(body.percent);
    if (!Number.isFinite(p) || p < 0 || p > 100) throw fail(400, 'Phần trăm hoa hồng phải từ 0 đến 100');
    doc.percent = Math.round(p * 100) / 100;
  }
  if (body.minPayout !== undefined) {
    const m = Number(body.minPayout);
    if (!Number.isFinite(m) || m < 0) throw fail(400, 'Mức rút tối thiểu không hợp lệ');
    doc.minPayout = Math.round(m);
  }
  await doc.save();
  return doc;
}

const publicSettings = (s) => ({ enabled: !!s.enabled, percent: s.percent, minPayout: s.minPayout });

// ── Codes, clicks, claims ────────────────────────────────────────────────
async function ensureCode(userId) {
  const user = await User.findById(userId).select('referralCode');
  if (!user) throw fail(404, 'Không tìm thấy tài khoản');
  if (user.referralCode) return user.referralCode;
  for (let i = 0; i < 6; i++) {
    const code = randomCode();
    try {
      const res = await User.updateOne(
        { _id: userId, $or: [{ referralCode: null }, { referralCode: { $exists: false } }] },
        { $set: { referralCode: code } }
      );
      if (res.modifiedCount) return code;
      // Another request set one first — use theirs
      const fresh = await User.findById(userId).select('referralCode').lean();
      if (fresh?.referralCode) return fresh.referralCode;
    } catch (err) {
      if (err?.code !== 11000) throw err; // code taken — roll again
    }
  }
  throw fail(500, 'Không tạo được mã giới thiệu, thử lại sau');
}

async function findReferrer(code) {
  const c = normalizeCode(code);
  if (!c) return null;
  return User.findOne({ referralCode: c, isBanned: { $ne: true } }).select('_id referredBy role').lean();
}

async function recordClick(code) {
  const c = normalizeCode(code);
  if (!c) return false;
  const res = await User.updateOne({ referralCode: c }, { $inc: { referralClicks: 1 } });
  return res.matchedCount > 0;
}

// Why `user` can't be tied to `referrer` right now, or null if it can
function claimBlocker(user, referrer, settings, now = Date.now()) {
  if (!settings.enabled) return 'disabled';
  if (!referrer) return 'invalid_code';
  if (String(referrer._id) === String(user._id)) return 'self';
  if (user.referredBy) return 'already_referred';
  if ((user.role || 'student') !== 'student') return 'not_student';
  // A → B and B → A would let two friends farm each other
  if (referrer.referredBy && String(referrer.referredBy) === String(user._id)) return 'cycle';
  const created = user.createdAt ? new Date(user.createdAt).getTime() : 0;
  if (!created || now - created > CLAIM_WINDOW_MS) return 'too_old';
  return null;
}

// POST /api/affiliate/claim — first login of a new account that arrived
// through a referral link. Returns { status: 'ok' | <blocker> }.
async function claimReferral(userId, code) {
  const [user, referrer, settings] = await Promise.all([
    User.findById(userId).select('_id role referredBy createdAt').lean(),
    findReferrer(code),
    getSettings(),
  ]);
  if (!user) return { status: 'not_found' };
  const blocker = claimBlocker(user, referrer, settings);
  if (blocker) return { status: blocker };
  const res = await User.updateOne(
    { _id: user._id, referredBy: null },
    { $set: { referredBy: referrer._id, referredAt: new Date() } }
  );
  if (!res.modifiedCount) return { status: 'already_referred' };
  logger.info('affiliate', 'Referral claimed', { userId: String(user._id), referrerId: String(referrer._id) });
  return { status: 'ok' };
}

// authService.registerUser: fields to put on the new User before its first
// save, or {} when the code doesn't qualify. The account doesn't exist yet,
// so the age/self/cycle checks can't fail here.
async function referralFieldsForSignup(code) {
  if (!normalizeCode(code)) return {};
  const [referrer, settings] = await Promise.all([findReferrer(code), getSettings()]);
  if (!settings.enabled || !referrer) return {};
  return { referredBy: referrer._id, referredAt: new Date() };
}

// ── Commissions ──────────────────────────────────────────────────────────
async function notify(toId, actor, subject, body) {
  if (!actor) return;
  try {
    await Message.create({ fromId: actor._id, fromName: actor.username || 'Admin', toId, subject, body, type: 'personal' });
  } catch (err) {
    logger.error('affiliate', 'notify failed', { err: err.message });
  }
}

// Earn (or refresh) the commission for one paid order. Idempotent per
// {source, sourceId}: re-running with the same order updates the row.
async function earnCommission({ source, sourceId, buyerId, baseAmount, description }, actor) {
  const buyer = await User.findById(buyerId).select('referredBy username firstName lastName').lean();
  if (!buyer?.referredBy) return null;
  const base = Math.max(0, Math.round(Number(baseAmount) || 0));
  const existing = await AffiliateCommission.findOne({ source, sourceId });

  if (existing) {
    // Already earned on this amount — nothing to do (a re-save of the fee)
    if (existing.status === 'earned' && existing.baseAmount === base) return existing;
    if (existing.status === 'earned') {
      existing.baseAmount = base;
      existing.amount = Math.round(base * existing.percent / 100);
      existing.description = description || existing.description;
      await existing.save();
      return existing;
    }
  }

  const settings = await getSettings();
  if (!settings.enabled || base <= 0) return null;
  const referrer = await User.findById(buyer.referredBy).select('_id isBanned').lean();
  if (!referrer || referrer.isBanned) return null;

  const percent = settings.percent;
  const amount = Math.round(base * percent / 100);
  if (amount <= 0) return null;

  let doc;
  if (existing) {
    // Cancelled earlier (fee un-marked), now paid again
    Object.assign(existing, { baseAmount: base, percent, amount, status: 'earned', cancelReason: '', cancelledAt: null, description: description || existing.description });
    doc = await existing.save();
  } else {
    try {
      doc = await AffiliateCommission.create({
        referrerId: referrer._id, referredUserId: buyerId, source, sourceId,
        baseAmount: base, percent, amount, description: description || '',
      });
    } catch (err) {
      if (err?.code === 11000) return AffiliateCommission.findOne({ source, sourceId }); // concurrent earn
      throw err;
    }
  }
  await notify(referrer._id, actor,
    `🎉 Bạn nhận được ${vnd(amount)}đ hoa hồng Affiliate`,
    `Người bạn giới thiệu (${maskName(buyer)}) vừa thanh toán ${description || 'một đơn hàng'} — ${vnd(base)}đ.\n\nHoa hồng ${percent}%: +${vnd(amount)}đ đã cộng vào ví Affiliate của bạn.\n\nXem chi tiết và rút tiền ở Hồ sơ → Affiliate.`);
  return doc;
}

async function cancelCommission(source, sourceId, reason) {
  return AffiliateCommission.findOneAndUpdate(
    { source, sourceId, status: 'earned' },
    { $set: { status: 'cancelled', cancelReason: reason || '', cancelledAt: new Date() } },
    { new: true }
  );
}

const MONTH_LABEL = (m) => (m === 12 ? '1 năm' : m === 36 ? '3 năm' : `${m} tháng`);

// routes/admin/premium.js, after the request is approved and Premium granted
async function onPremiumApproved(request, actor) {
  return earnCommission({
    source: 'premium',
    sourceId: request._id,
    buyerId: request.userId?._id || request.userId,
    baseAmount: request.amount,
    description: `gói Premium ${MONTH_LABEL(request.months)}`,
  }, actor);
}

// tuitionService: after any save of a fee (paid → earn/refresh, unpaid → cancel)
async function syncTuitionFee(fee, actor) {
  if (!fee) return null;
  if (!fee.isPaid) return cancelCommission('tuition', fee._id, 'Học phí bị bỏ đánh dấu đã đóng');
  const label = fee.feeType === 'monthly' ? `học phí tháng ${fee.month}/${fee.year}` : `học phí khóa "${fee.courseName}"`;
  return earnCommission({
    source: 'tuition',
    sourceId: fee._id,
    buyerId: fee.studentId?._id || fee.studentId,
    baseAmount: fee.amount,
    description: label,
  }, actor);
}

async function onTuitionFeeDeleted(fee) {
  if (!fee) return null;
  return cancelCommission('tuition', fee._id, 'Khoản học phí đã bị xóa');
}

// Errors here must never break the payment flow that triggered them
function safely(fn) {
  return (...args) => Promise.resolve()
    .then(() => fn(...args))
    .catch((err) => { logger.error('affiliate', 'commission hook failed', { err: err.message }); return null; });
}

// ── Balance + payouts ────────────────────────────────────────────────────
async function getTotals(userId) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const [comm, pays] = await Promise.all([
    AffiliateCommission.aggregate([
      { $match: { referrerId: uid, status: 'earned' } },
      { $group: { _id: null, earned: { $sum: '$amount' }, sales: { $sum: '$baseAmount' }, orders: { $sum: 1 } } },
    ]),
    AffiliatePayout.aggregate([
      { $match: { userId: uid, status: { $in: ['pending', 'paid'] } } },
      { $group: { _id: '$status', total: { $sum: '$amount' } } },
    ]),
  ]);
  const earned = comm[0]?.earned || 0;
  const paid = pays.find((p) => p._id === 'paid')?.total || 0;
  const pending = pays.find((p) => p._id === 'pending')?.total || 0;
  return {
    earned, paid, pending,
    sales: comm[0]?.sales || 0,
    orders: comm[0]?.orders || 0,
    balance: earned - paid - pending,
  };
}

async function getMyAffiliate(userId) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const [code, settings, me, totals, referred, commissions, payouts] = await Promise.all([
    ensureCode(userId),
    getSettings(),
    User.findById(userId).select('referralClicks affiliateBank').lean(),
    getTotals(userId),
    User.find({ referredBy: uid }).select('firstName lastName username referredAt createdAt').sort({ referredAt: -1 }).limit(200).lean(),
    AffiliateCommission.find({ referrerId: uid }).sort({ createdAt: -1 }).limit(100)
      .populate('referredUserId', 'firstName lastName username').lean(),
    AffiliatePayout.find({ userId: uid }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  // Per-referred-user totals (earned only)
  const perUser = {};
  for (const c of await AffiliateCommission.aggregate([
    { $match: { referrerId: uid, status: 'earned' } },
    { $group: { _id: '$referredUserId', paid: { $sum: '$baseAmount' }, commission: { $sum: '$amount' }, orders: { $sum: 1 } } },
  ])) perUser[String(c._id)] = c;

  const referrals = referred.map((u) => {
    const t = perUser[String(u._id)] || {};
    return {
      id: String(u._id), name: maskName(u), joinedAt: u.referredAt || u.createdAt,
      orders: t.orders || 0, paid: t.paid || 0, commission: t.commission || 0,
    };
  });

  return {
    code,
    settings: publicSettings(settings),
    stats: {
      clicks: me?.referralClicks || 0,
      signups: referred.length,
      buyers: referrals.filter((r) => r.orders > 0).length,
      ...totals,
    },
    bank: {
      bankName: me?.affiliateBank?.bankName || '',
      bankAccount: me?.affiliateBank?.bankAccount || '',
      accountName: me?.affiliateBank?.accountName || '',
      qrImageUrl: me?.affiliateBank?.qrImageUrl || '',
    },
    referrals,
    commissions: commissions.map((c) => ({
      id: String(c._id), source: c.source, description: c.description, buyer: maskName(c.referredUserId),
      baseAmount: c.baseAmount, percent: c.percent, amount: c.amount, status: c.status,
      cancelReason: c.cancelReason, createdAt: c.createdAt,
    })),
    payouts: payouts.map((p) => ({
      id: String(p._id), amount: p.amount, status: p.status, bankName: p.bankName,
      bankAccount: p.bankAccount, accountName: p.accountName, qrImageUrl: p.qrImageUrl || '', adminNote: p.adminNote,
      createdAt: p.createdAt, reviewedAt: p.reviewedAt,
    })),
  };
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// ── Bank QR (scan-to-pay image the referrer uploads) ─────────────────────
const QR_TYPES = /^image\/(png|jpe?g|webp)$/;

// The old image is deleted only when no payout record still shows it
async function dropQrIfUnused(url, publicId) {
  if (!url) return;
  if (await AffiliatePayout.exists({ qrImageUrl: url })) return;
  try { await mediaStore.destroy({ url, publicId }); }
  catch (err) { logger.error('affiliate', 'QR delete failed', { err: err.message }); }
}

async function uploadBankQr(userId, file) {
  if (!file?.buffer?.length) throw fail(400, 'Chưa chọn ảnh QR');
  if (!QR_TYPES.test(file.mimetype || '')) throw fail(400, 'Chỉ nhận ảnh PNG, JPG hoặc WebP');
  const user = await User.findById(userId).select('affiliateBank');
  if (!user) throw fail(404, 'Không tìm thấy tài khoản');
  const old = { url: user.affiliateBank?.qrImageUrl, publicId: user.affiliateBank?.qrImagePublicId };
  const r = await mediaStore.uploadImage(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, 'affiliate-qr');
  await User.updateOne({ _id: userId }, { $set: { 'affiliateBank.qrImageUrl': r.url, 'affiliateBank.qrImagePublicId': r.publicId || '' } });
  await dropQrIfUnused(old.url, old.publicId);
  return r.url;
}

async function deleteBankQr(userId) {
  const user = await User.findById(userId).select('affiliateBank').lean();
  if (!user) throw fail(404, 'Không tìm thấy tài khoản');
  await User.updateOne({ _id: userId }, { $set: { 'affiliateBank.qrImageUrl': '', 'affiliateBank.qrImagePublicId': '' } });
  await dropQrIfUnused(user.affiliateBank?.qrImageUrl, user.affiliateBank?.qrImagePublicId);
}

async function requestPayout(userId, body = {}) {
  const settings = await getSettings();
  const bankName = clean(body.bankName, 80);
  const bankAccount = clean(body.bankAccount, 40);
  const accountName = clean(body.accountName, 80);
  const me = await User.findById(userId).select('affiliateBank').lean();
  const qrImageUrl = me?.affiliateBank?.qrImageUrl || '';
  // A QR is enough on its own; without one, all three typed fields are needed
  if (!qrImageUrl && (!bankName || !bankAccount || !accountName)) {
    throw fail(400, 'Vui lòng tải lên ảnh QR ngân hàng, hoặc nhập đủ ngân hàng, số tài khoản và tên chủ tài khoản');
  }
  if (bankAccount && !/^[0-9 .-]{4,40}$/.test(bankAccount)) throw fail(400, 'Số tài khoản chỉ gồm chữ số');

  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount <= 0) throw fail(400, 'Số tiền rút không hợp lệ');
  if (amount < settings.minPayout) throw fail(400, `Số tiền rút tối thiểu là ${vnd(settings.minPayout)}đ`);
  if (await AffiliatePayout.exists({ userId, status: 'pending' })) throw fail(400, 'Bạn đang có một yêu cầu rút tiền chờ xử lý');
  const { balance } = await getTotals(userId);
  if (amount > balance) throw fail(400, `Số dư khả dụng chỉ còn ${vnd(balance)}đ`);

  let payout;
  try {
    payout = await AffiliatePayout.create({ userId, amount, bankName, bankAccount, accountName, qrImageUrl, note: clean(body.note, 300) });
  } catch (err) {
    if (err?.code === 11000) throw fail(400, 'Bạn đang có một yêu cầu rút tiền chờ xử lý');
    throw err;
  }
  // Remember the typed fields for next time (dotted paths keep the QR)
  await User.updateOne({ _id: userId }, { $set: {
    'affiliateBank.bankName': bankName, 'affiliateBank.bankAccount': bankAccount, 'affiliateBank.accountName': accountName,
  } });
  return payout;
}

// ── Admin ────────────────────────────────────────────────────────────────
async function adminOverview() {
  const [settings, comm, pays, referred] = await Promise.all([
    getSettings(),
    AffiliateCommission.aggregate([{ $match: { status: 'earned' } }, { $group: { _id: null, total: { $sum: '$amount' }, sales: { $sum: '$baseAmount' }, n: { $sum: 1 } } }]),
    AffiliatePayout.aggregate([{ $group: { _id: '$status', total: { $sum: '$amount' }, n: { $sum: 1 } } }]),
    User.countDocuments({ referredBy: { $ne: null } }),
  ]);
  const byStatus = (s) => pays.find((p) => p._id === s) || { total: 0, n: 0 };
  return {
    settings: publicSettings(settings),
    stats: {
      referredUsers: referred,
      commissionTotal: comm[0]?.total || 0,
      sales: comm[0]?.sales || 0,
      orders: comm[0]?.n || 0,
      paidOut: byStatus('paid').total,
      pendingPayoutTotal: byStatus('pending').total,
      pendingPayouts: byStatus('pending').n,
      owed: (comm[0]?.total || 0) - byStatus('paid').total,
    },
  };
}

const USER_FIELDS = 'username email firstName lastName';

async function listPayouts({ status, page = 1, limit = 30 } = {}) {
  const filter = ['pending', 'paid', 'rejected'].includes(status) ? { status } : {};
  const lim = Math.min(100, Math.max(1, +limit || 30));
  const [items, total] = await Promise.all([
    AffiliatePayout.find(filter).sort({ createdAt: -1 }).skip((Math.max(1, +page || 1) - 1) * lim).limit(lim)
      .populate('userId', USER_FIELDS).populate('reviewedBy', 'username').lean(),
    AffiliatePayout.countDocuments(filter),
  ]);
  // Balance next to each pending request, so the admin sees it still covers it
  const balances = {};
  await Promise.all(items.filter((p) => p.status === 'pending' && p.userId).map(async (p) => {
    balances[String(p._id)] = await getTotals(p.userId._id);
  }));
  return { items: items.map((p) => ({ ...p, totals: balances[String(p._id)] || null })), total };
}

// "Vietcombank — 0123 (NGUYEN VAN A)", or the QR when nothing was typed
function payoutDestination(p) {
  const typed = [p.bankName, p.bankAccount].filter(Boolean).join(' — ');
  const name = p.accountName ? ` (${p.accountName})` : '';
  if (typed || name) return `${typed}${name}`.trim();
  return 'mã QR bạn đã gửi';
}

async function markPayoutPaid(id, adminNote, actor) {
  if (!validId(id)) throw fail(404, 'Không tìm thấy yêu cầu');
  const p = await AffiliatePayout.findOneAndUpdate(
    { _id: id, status: 'pending' },
    { $set: { status: 'paid', adminNote: clean(adminNote, 300), reviewedBy: actor?._id || null, reviewedAt: new Date() } },
    { new: true }
  );
  if (!p) {
    const exists = await AffiliatePayout.exists({ _id: id });
    throw fail(exists ? 400 : 404, exists ? 'Yêu cầu đã được xử lý' : 'Không tìm thấy yêu cầu');
  }
  await notify(p.userId, actor, `✅ Đã chuyển ${vnd(p.amount)}đ tiền hoa hồng Affiliate`,
    `Yêu cầu rút ${vnd(p.amount)}đ của bạn đã được chuyển khoản tới ${payoutDestination(p)}.${p.adminNote ? `\n\nGhi chú: ${p.adminNote}` : ''}\n\nCảm ơn bạn đã giới thiệu! 🙏`);
  return p;
}

async function rejectPayout(id, adminNote, actor) {
  if (!validId(id)) throw fail(404, 'Không tìm thấy yêu cầu');
  const p = await AffiliatePayout.findOneAndUpdate(
    { _id: id, status: 'pending' },
    { $set: { status: 'rejected', adminNote: clean(adminNote, 300), reviewedBy: actor?._id || null, reviewedAt: new Date() } },
    { new: true }
  );
  if (!p) {
    const exists = await AffiliatePayout.exists({ _id: id });
    throw fail(exists ? 400 : 404, exists ? 'Yêu cầu đã được xử lý' : 'Không tìm thấy yêu cầu');
  }
  await notify(p.userId, actor, 'Yêu cầu rút tiền Affiliate bị từ chối',
    `Yêu cầu rút ${vnd(p.amount)}đ chưa được duyệt.${p.adminNote ? `\nLý do: ${p.adminNote}` : ''}\n\nSố tiền đã được hoàn lại vào ví Affiliate, bạn có thể gửi lại yêu cầu.`);
  return p;
}

async function listCommissions({ status, referrerId, page = 1, limit = 30 } = {}) {
  const filter = {};
  if (['earned', 'cancelled'].includes(status)) filter.status = status;
  if (referrerId && validId(referrerId)) filter.referrerId = referrerId;
  const lim = Math.min(100, Math.max(1, +limit || 30));
  const [items, total] = await Promise.all([
    AffiliateCommission.find(filter).sort({ createdAt: -1 }).skip((Math.max(1, +page || 1) - 1) * lim).limit(lim)
      .populate('referrerId', USER_FIELDS).populate('referredUserId', USER_FIELDS).lean(),
    AffiliateCommission.countDocuments(filter),
  ]);
  return { items, total };
}

async function adminCancelCommission(id, reason) {
  if (!validId(id)) throw fail(404, 'Không tìm thấy hoa hồng');
  const c = await AffiliateCommission.findOneAndUpdate(
    { _id: id, status: 'earned' },
    { $set: { status: 'cancelled', cancelReason: clean(reason, 300) || 'Admin hủy', cancelledAt: new Date() } },
    { new: true }
  );
  if (!c) throw fail(400, 'Hoa hồng không tồn tại hoặc đã bị hủy');
  return c;
}

// Everyone who has referred at least one account, most commission first
async function listReferrers() {
  const rows = await User.aggregate([
    { $match: { referredBy: { $ne: null } } },
    { $group: { _id: '$referredBy', signups: { $sum: 1 }, lastAt: { $max: '$referredAt' } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
    { $unwind: '$u' },
    { $project: { signups: 1, lastAt: 1, username: '$u.username', email: '$u.email', firstName: '$u.firstName', lastName: '$u.lastName', referralCode: '$u.referralCode', clicks: '$u.referralClicks' } },
    { $limit: 500 },
  ]);
  const totals = await Promise.all(rows.map((r) => getTotals(r._id)));
  return rows
    .map((r, i) => ({ ...r, ...totals[i] }))
    .sort((a, b) => b.earned - a.earned || b.signups - a.signups);
}

module.exports = {
  CLAIM_WINDOW_MS,
  normalizeCode, maskName, claimBlocker,
  getSettings, updateSettings, publicSettings,
  ensureCode, recordClick, claimReferral, referralFieldsForSignup,
  earnCommission, cancelCommission,
  onPremiumApproved: safely(onPremiumApproved),
  syncTuitionFee: safely(syncTuitionFee),
  onTuitionFeeDeleted: safely(onTuitionFeeDeleted),
  getTotals, getMyAffiliate, requestPayout, uploadBankQr, deleteBankQr,
  adminOverview, listPayouts, markPayoutPaid, rejectPayout, listCommissions, adminCancelCommission, listReferrers,
};
