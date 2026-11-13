'use strict';

// Extracted from the inbox routes in routes/user.js, verbatim logic.
const mongoose = require('mongoose');
const Message = require('../models/Message');
const shopService = require('./shopService');
const User = require('../models/User');

// A student-written reply / chat line is capped: the Message body had no
// limit, so one request could drop a multi-megabyte "reply" into a
// teacher's inbox (and every list that previews it).
const MAX_STUDENT_BODY = 4000;
const validId = (id) => mongoose.isValidObjectId(id);

async function getUnreadCount(uid) {
  // Feeds the "Hộp thư" nav badge, so it needs to reflect every kind of
  // message a student can receive — teacher/admin personal + broadcast, AND
  // peer (student-to-student) chat. Peer messages were previously excluded
  // entirely here (they're deliberately excluded from listMessages(), which
  // is the teacher inbox view, but that exclusion had leaked into this count
  // too) — a student with unread peer messages saw no badge at all unless
  // they also had an unread teacher message.
  const [personal, broadcast, peer] = await Promise.all([
    Message.countDocuments({ toId: uid, isBroadcast: false, isPeer: { $ne: true }, isRead: false, deletedBy: { $ne: uid } }),
    Message.countDocuments({ isBroadcast: true, readBy: { $ne: uid }, deletedBy: { $ne: uid } }),
    Message.countDocuments({ toId: uid, isPeer: true, isRead: false, deletedBy: { $ne: uid } })
  ]);
  return personal + broadcast + peer;
}

// Unread must-read messages (class "Nhắn tin") for nav.js's popup — it keeps
// showing on every page load until the student opens each one (markRead).
async function listMustRead(uid) {
  return Message.find({ toId: uid, isBroadcast: false, mustRead: true, isRead: false, deletedBy: { $ne: uid } })
    .select('fromName subject createdAt').sort({ createdAt: -1 }).limit(20).lean();
}

function countMustRead(uid) {
  return Message.countDocuments({ toId: uid, isBroadcast: false, mustRead: true, isRead: false, deletedBy: { $ne: uid } });
}

async function listMessages(uid, page, limit) {
  // isPeer excluded — student-to-student chat (services/peerService.js)
  // lives in the same collection but has its own thread/conversation-list
  // views, kept out of the teacher "Hộp thư" inbox.
  const filter = {
    $or: [{ toId: uid, isBroadcast: false, isPeer: { $ne: true } }, { isBroadcast: true }],
    deletedBy: { $ne: uid }
  };
  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Message.countDocuments(filter)
  ]);
  const result = messages.map(m => ({
    ...m,
    isRead: m.isBroadcast
      ? (m.readBy || []).some(id => id.toString() === uid.toString())
      : m.isRead,
    giftClaimed: (m.claimedBy || []).some(id => id.toString() === uid.toString()),
    ...shopService.describeGift(m), // giftItem / giftPet (Kho đồ → 🎁 Tặng)
  }));
  return { messages: result, total };
}

// Malformed ids are "not found" (they used to throw a CastError → 500
// "Lỗi server"). Writes are single atomic updates: two tabs opening the
// same broadcast no longer race a read-modify-save of readBy.
async function markRead(id, uid) {
  if (!validId(id)) return { status: 'not_found' };
  const msg = await Message.findById(id).select('isBroadcast toId').lean();
  if (!msg) return { status: 'not_found' };

  if (msg.isBroadcast) {
    await Message.updateOne({ _id: id }, { $addToSet: { readBy: uid } });
  } else {
    if (!msg.toId || msg.toId.toString() !== uid.toString()) return { status: 'forbidden' };
    await Message.updateOne({ _id: id }, { $set: { isRead: true } });
  }
  return { status: 'ok' };
}

async function deleteMessage(id, uid) {
  if (!validId(id)) return { status: 'not_found' };
  const msg = await Message.findById(id).select('isBroadcast toId').lean();
  if (!msg) return { status: 'not_found' };
  if (!msg.isBroadcast && (!msg.toId || msg.toId.toString() !== uid.toString())) return { status: 'forbidden' };
  await Message.updateOne({ _id: id }, { $addToSet: { deletedBy: uid } });
  return { status: 'ok' };
}

// Student replies to a message they received — routes back to whoever sent
// the original (works for both a personal message and a broadcast, since
// broadcasts still carry a real fromId for the teacher/admin who sent it).
//
// A message from ANOTHER STUDENT (a Kho đồ gift, a 🎂 cake / ⚔️ duel
// notice — shopService/duelService) is answered in the peer chat instead
// (isPeer, same block check as peerService.sendPeerMessage): a plain reply
// used to land in that student's teacher inbox as a "personal" message,
// which also went straight past a block between the two.
async function replyToMessage(uid, uname, messageId, body) {
  const text = typeof body === 'string' ? body.trim() : '';
  if (!text) return { status: 'empty' };
  if (text.length > MAX_STUDENT_BODY) return { status: 'too_long', max: MAX_STUDENT_BODY };
  if (!validId(messageId)) return { status: 'not_found' };
  const original = await Message.findById(messageId);
  if (!original) return { status: 'not_found' };

  const isRecipient = original.isBroadcast || (original.toId && original.toId.toString() === uid.toString());
  if (!isRecipient) return { status: 'forbidden' };
  body = text;

  if (!original.isBroadcast) {
    const sender = await User.findById(original.fromId).select('role').lean();
    if (sender && sender.role === 'student' && String(sender._id) !== String(uid)) {
      // Required lazily — peerService pulls in userService (stats).
      const peer = require('./peerService');
      if (await peer.isBlockedEitherWay(uid, sender._id)) return { status: 'blocked' };
      const chat = await Message.create({ fromId: uid, fromName: uname, toId: sender._id, body, isPeer: true });
      return { status: 'ok', message: chat, peer: true };
    }
  }

  const reply = await Message.create({
    fromId:   uid,
    fromName: uname,
    toId:     original.fromId,
    subject:  original.subject ? `Re: ${original.subject}` : 'Re: (không tiêu đề)',
    body,
    parentId: original._id,
  });
  return { status: 'ok', message: reply };
}

// Student claims the gift attached to a message they received — admin
// búa/lửa (giftHammers/giftStreakDays) or a Kho đồ item / linh thú another
// player sent (giftItemKey/giftPetId, see shopService.giftItem). Idempotent
// per-user via claimedBy (mirrors readBy's broadcast dedupe pattern) so a
// broadcast gift can be claimed once by every recipient, and a personal gift
// can't be double-claimed by re-opening the message or retrying the request.
async function claimGift(id, uid) {
  if (!validId(id)) return { status: 'not_found' };
  const msg = await Message.findById(id).lean();
  if (!msg) return { status: 'not_found' };

  const isRecipient = msg.isBroadcast || (msg.toId && msg.toId.toString() === uid.toString());
  if (!isRecipient) return { status: 'forbidden' };

  const shopGift = !msg.isBroadcast && (msg.giftPetId || (msg.giftItemKey && msg.giftItemQty > 0));
  if (!msg.giftHammers && !msg.giftStreakDays && !shopGift) return { status: 'no_gift' };

  // Claim first with a conditional update, so two tabs / a double-click
  // can't both pass and grant the gift twice.
  const locked = await Message.updateOne({ _id: id, claimedBy: { $ne: uid } }, { $push: { claimedBy: uid } });
  if (locked.modifiedCount !== 1) return { status: 'already_claimed' };

  const result = { status: 'ok', giftHammers: msg.giftHammers || 0, giftStreakDays: msg.giftStreakDays || 0 };

  if (shopGift) {
    const landed = await shopService.landGift(uid, msg).catch(err => ({ status: 'error', err }));
    if (landed.status !== 'ok') {
      // Kho đồ full / pet already owned → the gift stays in the message.
      await Message.updateOne({ _id: id }, { $pull: { claimedBy: uid } });
      if (landed.status === 'error') throw landed.err;
      return landed;
    }
    if (landed.item) result.item = landed.item;
    if (landed.pet) { result.pet = landed.pet; result.activePet = landed.activePet; }
  }

  if (msg.giftHammers || msg.giftStreakDays) {
    // Grant the ví lửa its starting balance first (= streak before this gift),
    // so the gift below is added on top instead of being swallowed by it.
    if (msg.giftStreakDays) await shopService.seedWallet(uid).catch(() => {});
    const user = await User.findById(uid).select('learningStreak previousStreak streakLostAt lastActivityDate streakHammers flameWallet');
    if (!user) return { status: 'not_found' };
    if (msg.giftHammers) user.streakHammers += msg.giftHammers;
    if (msg.giftStreakDays) user.applyGiftStreak(msg.giftStreakDays);
    await user.save();
    result.streakHammers = user.streakHammers;
    result.streak = user.learningStreak;
  }

  return result;
}

// "Góp ý" button above the peer chat bubble (js/shared/peer-chat-widget.js):
// a bug report / feature request lands straight in every admin's inbox
// ("Đã nhận" tab + unread badge), same delivery as tuitionService's
// notifyPayment — so the teacher can ↩️ reply to the student from there.
const FEEDBACK_LABELS = { bug: '🐞 Báo lỗi', feature: '✨ Tính năng mới', other: '💬 Góp ý khác' };

async function sendFeedbackToAdmins(student, fromName, { type, message, pageUrl }) {
  const text = typeof message === 'string' ? message.trim() : '';
  if (!text) return { status: 'empty' };
  if (text.length > 2000) return { status: 'too_long' };
  const label = FEEDBACK_LABELS[type] || FEEDBACK_LABELS.other;
  const page = (typeof pageUrl === 'string' && /^https?:\/\//i.test(pageUrl)) ? pageUrl.slice(0, 500) : '';

  const admins = await User.find({ role: 'admin' }, '_id').lean();
  if (!admins.length) return { status: 'ok' };
  await Message.insertMany(admins.map(admin => ({
    fromId: student._id,
    fromName,
    toId: admin._id,
    subject: `[Góp ý] ${label} — ${fromName}`,
    body: text + (page ? `\n\n— Trang: ${page}` : ''),
    type: 'personal',
  })));
  return { status: 'ok' };
}

module.exports = { MAX_STUDENT_BODY, getUnreadCount, countMustRead, listMustRead, listMessages, markRead, deleteMessage, replyToMessage, claimGift, sendFeedbackToAdmins };
