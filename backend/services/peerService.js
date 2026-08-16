'use strict';

// Student-to-student profile viewing + chat + block/report. Kept separate
// from userMessageService.js (which owns the teacher/admin "Hộp thư" inbox)
// even though both read/write the Message collection — the two features
// have different audiences and different privacy rules, and Message's
// isPeer flag is what keeps their queries from crossing.
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const Block = require('../models/Block');
const Report = require('../models/Report');
const { getStats } = require('./userService');

async function isBlockedEitherWay(idA, idB) {
  const block = await Block.findOne({
    $or: [
      { blockerId: idA, blockedId: idB },
      { blockerId: idB, blockedId: idA },
    ],
  }).select('_id').lean();
  return !!block;
}

// Deliberately narrow field set — this is shown to a PEER student, not a
// teacher/admin, so it reuses getStats()'s computation but only surfaces
// the same summary profile.html already shows a student about themselves
// (streak + Reading/Listening/Speaking avg band). No email, plan, ban
// status, class, or per-attempt history — see the privacy audit that shaped
// this (admin's own student-detail view returns far more and is teacher-only
// for exactly that reason).
async function getPeerProfile(viewerId, targetId) {
  if (!mongoose.isValidObjectId(targetId)) return { status: 'not_found' };
  const target = await User.findById(targetId).select('firstName lastName username avatar role').lean();
  if (!target || target.role !== 'student') return { status: 'not_found' };

  const stats = await getStats(targetId);
  const spkBands = (stats.speaking.history || [])
    .map(h => h.aiFeedback?.overallBand)
    .filter(Boolean);
  const speakingAvgBand = spkBands.length
    ? (spkBands.reduce((a, b) => a + b, 0) / spkBands.length).toFixed(1)
    : null;

  const blockedByMe = await Block.findOne({ blockerId: viewerId, blockedId: targetId }).select('_id').lean();

  return {
    status: 'ok',
    profile: {
      _id: target._id,
      name: (`${target.firstName || ''} ${target.lastName || ''}`.trim()) || target.username,
      username: target.username,
      avatar: target.avatar || '',
      streak: stats.streak,
      reading: { avgBand: stats.reading.avgBand, total: stats.reading.total },
      listening: { avgBand: stats.listening.avgBand, total: stats.listening.total },
      speaking: { avgBand: speakingAvgBand, total: stats.speaking.total },
      isBlockedByMe: !!blockedByMe,
      isSelf: String(viewerId) === String(targetId),
    },
  };
}

async function sendPeerMessage(fromId, fromName, toId, body) {
  if (!body || !body.trim()) return { status: 'empty' };
  if (!mongoose.isValidObjectId(toId)) return { status: 'not_found' };
  if (String(fromId) === String(toId)) return { status: 'self' };

  const recipient = await User.findById(toId).select('role').lean();
  if (!recipient || recipient.role !== 'student') return { status: 'not_found' };
  if (await isBlockedEitherWay(fromId, toId)) return { status: 'blocked' };

  const message = await Message.create({
    fromId, fromName, toId,
    body: body.trim(),
    isPeer: true,
  });
  return { status: 'ok', message };
}

// Ascending (oldest first) for chat-style rendering; also marks the other
// party's messages to me as read, mirroring a real chat "opening the thread
// marks it seen" — matches markRead()'s per-message behavior in
// userMessageService.js but batched since a thread can have many messages.
async function getThread(uid, otherId, limit = 100) {
  if (!mongoose.isValidObjectId(otherId)) return { status: 'not_found' };
  const filter = {
    isPeer: true,
    $or: [{ fromId: uid, toId: otherId }, { fromId: otherId, toId: uid }],
  };
  const [messages, otherUser] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
    User.findById(otherId).select('lastSeen').lean(),
  ]);
  messages.reverse();

  await Message.updateMany(
    { isPeer: true, fromId: otherId, toId: uid, isRead: false },
    { $set: { isRead: true } }
  );

  // peerLastSeen powers the "Đang hoạt động / hoạt động X phút trước"
  // presence line in the chat header — re-fetched on every thread poll
  // (peer-chat-widget.js's 5s interval) so it stays reasonably live.
  return { status: 'ok', messages, peerLastSeen: otherUser?.lastSeen || null };
}

// One row per conversation partner: latest message + unread count. Powers
// the "Chat bạn bè" list (separate from the teacher inbox's message list).
async function listConversations(uid) {
  const uidObj = new mongoose.Types.ObjectId(uid);
  const rows = await Message.aggregate([
    { $match: { isPeer: true, $or: [{ fromId: uidObj }, { toId: uidObj }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $cond: [{ $eq: ['$fromId', uidObj] }, '$toId', '$fromId'] },
        lastMessage: { $first: '$body' },
        lastAt: { $first: '$createdAt' },
        lastFromId: { $first: '$fromId' },
        unread: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$toId', uidObj] }, { $eq: ['$isRead', false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { lastAt: -1 } },
  ]);

  if (!rows.length) return [];
  const partnerIds = rows.map(r => r._id);
  const users = await User.find({ _id: { $in: partnerIds } }).select('firstName lastName username avatar lastSeen').lean();
  const byId = new Map(users.map(u => [u._id.toString(), u]));

  return rows.map(r => {
    const u = byId.get(r._id.toString());
    return {
      userId: r._id,
      name: u ? ((`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username) : '(Đã xoá tài khoản)',
      avatar: u?.avatar || '',
      lastSeen: u?.lastSeen || null,
      lastMessage: r.lastMessage,
      lastAt: r.lastAt,
      isLastFromMe: String(r.lastFromId) === String(uid),
      unread: r.unread,
    };
  });
}

// Full active-student roster for the peer-chat widget's "start a new
// conversation" list — unlike listConversations() (existing threads only),
// this is every student a viewer COULD message: excludes themselves,
// banned accounts, and anyone blocked either direction (matches
// sendPeerMessage's own block check, so nobody appears in the list only to
// get a "blocked" error on the first message).
async function listActiveStudents(viewerId) {
  const [students, blocks] = await Promise.all([
    User.find({ role: 'student', isBanned: { $ne: true }, _id: { $ne: viewerId } })
      .select('firstName lastName username avatar lastSeen').lean(),
    Block.find({ $or: [{ blockerId: viewerId }, { blockedId: viewerId }] }).select('blockerId blockedId').lean(),
  ]);
  const blockedIds = new Set(blocks.map(b =>
    String(b.blockerId) === String(viewerId) ? String(b.blockedId) : String(b.blockerId)
  ));
  return students
    .filter(u => !blockedIds.has(String(u._id)))
    .map(u => ({
      _id: u._id,
      name: (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username,
      avatar: u.avatar || '',
      lastSeen: u.lastSeen || null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

async function blockUser(blockerId, blockedId) {
  if (!mongoose.isValidObjectId(blockedId)) return { status: 'not_found' };
  if (String(blockerId) === String(blockedId)) return { status: 'self' };
  const target = await User.findById(blockedId).select('_id').lean();
  if (!target) return { status: 'not_found' };
  await Block.updateOne(
    { blockerId, blockedId },
    { $setOnInsert: { blockerId, blockedId } },
    { upsert: true }
  );
  return { status: 'ok' };
}

async function unblockUser(blockerId, blockedId) {
  await Block.deleteOne({ blockerId, blockedId });
  return { status: 'ok' };
}

async function reportUser(reporterId, reporterName, reportedId, reason, messageId) {
  if (!reason || !reason.trim()) return { status: 'empty' };
  if (!mongoose.isValidObjectId(reportedId)) return { status: 'not_found' };
  const reported = await User.findById(reportedId).select('firstName lastName username').lean();
  if (!reported) return { status: 'not_found' };

  const report = await Report.create({
    reporterId, reporterName,
    reportedId, reportedName: (`${reported.firstName || ''} ${reported.lastName || ''}`.trim()) || reported.username,
    reason: reason.trim(),
    messageId: (messageId && mongoose.isValidObjectId(messageId)) ? messageId : null,
  });
  return { status: 'ok', report };
}

module.exports = {
  getPeerProfile, sendPeerMessage, getThread, listConversations, listActiveStudents,
  blockUser, unblockUser, reportUser, isBlockedEitherWay,
};
