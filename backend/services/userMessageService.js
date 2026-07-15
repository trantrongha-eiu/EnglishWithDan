'use strict';

// Extracted from the inbox routes in routes/user.js, verbatim logic.
const Message = require('../models/Message');

async function getUnreadCount(uid) {
  const [personal, broadcast] = await Promise.all([
    Message.countDocuments({ toId: uid, isBroadcast: false, isRead: false, deletedBy: { $ne: uid } }),
    Message.countDocuments({ isBroadcast: true, readBy: { $ne: uid }, deletedBy: { $ne: uid } })
  ]);
  return personal + broadcast;
}

async function listMessages(uid, page, limit) {
  const filter = {
    $or: [{ toId: uid, isBroadcast: false }, { isBroadcast: true }],
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
      : m.isRead
  }));
  return { messages: result, total };
}

async function markRead(id, uid) {
  const msg = await Message.findById(id);
  if (!msg) return { status: 'not_found' };

  if (msg.isBroadcast) {
    if (!msg.readBy.some(rid => rid.toString() === uid.toString())) {
      msg.readBy.push(uid);
      await msg.save();
    }
  } else {
    if (msg.toId.toString() !== uid.toString()) return { status: 'forbidden' };
    msg.isRead = true;
    await msg.save();
  }
  return { status: 'ok' };
}

async function deleteMessage(id, uid) {
  const msg = await Message.findById(id);
  if (!msg) return { status: 'not_found' };
  if (!msg.isBroadcast && msg.toId.toString() !== uid.toString()) return { status: 'forbidden' };
  if (!msg.deletedBy.some(did => did.toString() === uid.toString())) {
    msg.deletedBy.push(uid);
    await msg.save();
  }
  return { status: 'ok' };
}

// Student replies to a message they received — routes back to whoever sent
// the original (works for both a personal message and a broadcast, since
// broadcasts still carry a real fromId for the teacher/admin who sent it).
async function replyToMessage(uid, uname, messageId, body) {
  if (!body?.trim()) return { status: 'empty' };
  const original = await Message.findById(messageId);
  if (!original) return { status: 'not_found' };

  const isRecipient = original.isBroadcast || (original.toId && original.toId.toString() === uid.toString());
  if (!isRecipient) return { status: 'forbidden' };

  const reply = await Message.create({
    fromId:   uid,
    fromName: uname,
    toId:     original.fromId,
    subject:  original.subject ? `Re: ${original.subject}` : 'Re: (không tiêu đề)',
    body:     body.trim(),
    parentId: original._id,
  });
  return { status: 'ok', message: reply };
}

module.exports = { getUnreadCount, listMessages, markRead, deleteMessage, replyToMessage };
