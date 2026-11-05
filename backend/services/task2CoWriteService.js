'use strict';

// "Mời bạn viết cùng" — live co-writing groups on the Task 2 writer.
// See models/Task2CoWriteRoom.js. Each member keeps writing their OWN essay
// (saved to Task2LessonWork as before); the room only mirrors everyone's
// current text so the group can read each other's work in real time
// (clients poll GET /topic/:topicId every few seconds).
//
// Rules:
//  - one joined room per (user, topic); accepting an invite to another room
//    for the same topic leaves the old one
//  - only students can be invited; banned accounts and anyone blocked either
//    way (peer-chat Block) are refused
//  - any joined member can invite; at most MAX_MEMBERS invited + joined
const mongoose = require('mongoose');
const Task2CoWriteRoom = require('../models/Task2CoWriteRoom');
const Task2Topic = require('../models/Task2Topic');
const User = require('../models/User');
const Block = require('../models/Block');
const ClassEnrollment = require('../models/ClassEnrollment');

const MAX_MEMBERS = 8;
const ROOM_TTL_MS = 4 * 60 * 60 * 1000;      // room disappears 4h after its last activity
const ONLINE_MS = 5 * 60 * 1000;             // same "online" window as admin online-users / peer chat
const INVITE_TTL_MS = 10 * 60 * 1000;        // an unanswered invite stops popping up after 10 min
const REINVITE_GAP_MS = 30 * 1000;           // can't spam the same person faster than this
const PRESENCE_MS = 20 * 1000;               // "đang mở bài viết" if polled within this
const SEEN_WRITE_MS = 8 * 1000;              // throttle presence writes
const SECTION_KEYS = ['intro', 'body1', 'body2', 'conclusion'];
const SECTION_MAX = 6000;

const oid = (id) => new mongoose.Types.ObjectId(String(id));
const nameOf = (u) => (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username || '';
const freshExpiry = () => new Date(Date.now() + ROOM_TTL_MS);

function cleanSections(raw) {
  const out = {};
  for (const k of SECTION_KEYS) {
    const v = raw && typeof raw[k] === 'string' ? raw[k] : '';
    out[k] = v.slice(0, SECTION_MAX);
  }
  return out;
}

async function blockedIdsFor(uid) {
  const blocks = await Block.find({ $or: [{ blockerId: uid }, { blockedId: uid }] }).select('blockerId blockedId').lean();
  return new Set(blocks.map(b => (String(b.blockerId) === String(uid) ? String(b.blockedId) : String(b.blockerId))));
}

async function classmateIdsFor(uid) {
  const mine = await ClassEnrollment.find({ studentId: uid, removedAt: null }).select('classId').lean();
  if (!mine.length) return new Set();
  const all = await ClassEnrollment.find({ classId: { $in: mine.map(e => e.classId) }, removedAt: null }).select('studentId').lean();
  return new Set(all.map(e => String(e.studentId)));
}

// The room this user is currently writing in for this topic (joined only).
function findMyRoom(uid, topicId) {
  return Task2CoWriteRoom.findOne({
    topicId,
    expiresAt: { $gt: new Date() },
    members: { $elemMatch: { userId: uid, status: 'joined' } }
  });
}

function memberView(m, viewerId, now) {
  const isMe = String(m.userId) === String(viewerId);
  return {
    userId: m.userId,
    name: m.name,
    avatar: m.avatar || '',
    status: m.status,
    isMe,
    online: !!(m.seenAt && now - new Date(m.seenAt).getTime() < PRESENCE_MS),
    typing: !!(m.textAt && now - new Date(m.textAt).getTime() < 5000),
    textAt: m.textAt || null,
    // Your own text is already on your screen — don't echo it back every poll.
    sections: (!isMe && m.status === 'joined') ? cleanSections(m.sections) : undefined
  };
}

function roomView(room, viewerId) {
  const now = Date.now();
  return {
    roomId: room._id,
    topicId: room.topicId,
    hostId: room.hostId,
    rev: room.rev,
    maxMembers: MAX_MEMBERS,
    members: room.members
      .filter(m => m.status === 'joined' || (m.status === 'invited' && m.invitedAt && now - new Date(m.invitedAt).getTime() < INVITE_TTL_MS))
      .map(m => memberView(m, viewerId, now))
  };
}

// Online students the viewer may invite, classmates first. `inRoom` tells
// the picker who is already joined/invited in the viewer's room.
async function listOnline(viewer, topicId) {
  const uid = viewer._id;
  const [users, blocked, classmates, room] = await Promise.all([
    User.find({
      role: 'student', isBanned: { $ne: true }, _id: { $ne: uid },
      lastSeen: { $gte: new Date(Date.now() - ONLINE_MS) }
    }).select('firstName lastName username avatar lastSeen').limit(300).lean(),
    blockedIdsFor(uid),
    classmateIdsFor(uid),
    mongoose.isValidObjectId(topicId) ? findMyRoom(uid, topicId).lean() : null
  ]);
  const now = Date.now();
  const roomStatus = new Map();
  (room?.members || []).forEach(m => {
    if (m.status === 'joined') roomStatus.set(String(m.userId), 'joined');
    else if (m.status === 'invited' && m.invitedAt && now - new Date(m.invitedAt).getTime() < INVITE_TTL_MS) roomStatus.set(String(m.userId), 'invited');
  });
  return users
    .filter(u => !blocked.has(String(u._id)))
    .map(u => ({
      _id: u._id,
      name: nameOf(u),
      avatar: u.avatar || '',
      lastSeen: u.lastSeen,
      classmate: classmates.has(String(u._id)),
      inRoom: roomStatus.get(String(u._id)) || null
    }))
    .sort((a, b) => (b.classmate - a.classmate) || a.name.localeCompare(b.name, 'vi'));
}

async function invite(inviter, topicId, userIds) {
  if (!mongoose.isValidObjectId(topicId)) return { status: 'not_found' };
  const ids = [...new Set((Array.isArray(userIds) ? userIds : []).map(String))]
    .filter(id => mongoose.isValidObjectId(id) && id !== String(inviter._id));
  if (!ids.length) return { status: 'empty' };

  const topic = await Task2Topic.findOne({ _id: topicId, isActive: true }).select('_id').lean();
  if (!topic) return { status: 'not_found' };

  const [targets, blocked] = await Promise.all([
    User.find({ _id: { $in: ids }, role: 'student', isBanned: { $ne: true } }).select('firstName lastName username avatar').lean(),
    blockedIdsFor(inviter._id)
  ]);
  const allowed = targets.filter(u => !blocked.has(String(u._id)));
  if (!allowed.length) return { status: 'none_allowed' };

  let room = await findMyRoom(inviter._id, topicId);
  if (!room) {
    room = await Task2CoWriteRoom.create({
      topicId, hostId: inviter._id, expiresAt: freshExpiry(),
      members: [{ userId: inviter._id, name: nameOf(inviter), avatar: inviter.avatar || '', status: 'joined', joinedAt: new Date() }]
    });
  }

  const now = Date.now();
  const active = (m) => m.status === 'joined' || (m.status === 'invited' && m.invitedAt && now - new Date(m.invitedAt).getTime() < INVITE_TTL_MS);
  let slots = MAX_MEMBERS - room.members.filter(active).length;
  const invited = [];
  const skipped = [];
  for (const u of allowed) {
    const existing = room.members.find(m => String(m.userId) === String(u._id));
    if (existing && existing.status === 'joined') { skipped.push({ userId: u._id, reason: 'joined' }); continue; }
    if (existing && existing.status === 'invited' && existing.invitedAt && now - new Date(existing.invitedAt).getTime() < REINVITE_GAP_MS) {
      skipped.push({ userId: u._id, reason: 'recent' }); continue;
    }
    const alreadyCounted = existing && active(existing);
    if (!alreadyCounted && slots <= 0) { skipped.push({ userId: u._id, reason: 'full' }); continue; }
    if (existing) {
      Object.assign(existing, { status: 'invited', invitedBy: inviter._id, invitedAt: new Date(), name: nameOf(u), avatar: u.avatar || '' });
    } else {
      room.members.push({ userId: u._id, name: nameOf(u), avatar: u.avatar || '', status: 'invited', invitedBy: inviter._id, invitedAt: new Date() });
    }
    if (!alreadyCounted) slots--;
    invited.push(u._id);
  }
  if (invited.length) {
    room.rev += 1;
    room.expiresAt = freshExpiry();
    await room.save();
  }
  return { status: 'ok', invited, skipped, room: roomView(room, inviter._id) };
}

// The room this student is writing in (still open, with someone else in it
// or invited), so every page can offer "Quay lại phòng viết" after they
// closed the writer or logged out and back in (js/shared/cowrite-invites.js).
async function activeRoom(uid) {
  const room = await Task2CoWriteRoom.findOne({
    expiresAt: { $gt: new Date() },
    members: { $elemMatch: { userId: oid(uid), status: 'joined' } }
  }).sort({ updatedAt: -1 }).select('topicId members').lean();
  if (!room) return null;
  const now = Date.now();
  const others = room.members.filter(m => String(m.userId) !== String(uid) && (m.status === 'joined' ||
    (m.status === 'invited' && m.invitedAt && now - new Date(m.invitedAt).getTime() < INVITE_TTL_MS)));
  if (!others.length) return null;
  const t = await Task2Topic.findById(room.topicId).select('topicName topicEmoji week').lean();
  if (!t) return null;
  return {
    roomId: room._id,
    topicId: room.topicId,
    topicName: t.topicName || '',
    topicEmoji: t.topicEmoji || '',
    week: t.week || null,
    members: others.filter(m => m.status === 'joined').map(m => m.name)
  };
}

// Unanswered invites for the global popup (js/shared/cowrite-invites.js).
async function pendingInvites(uid) {
  const since = new Date(Date.now() - INVITE_TTL_MS);
  const rooms = await Task2CoWriteRoom.find({
    expiresAt: { $gt: new Date() },
    members: { $elemMatch: { userId: uid, status: 'invited', invitedAt: { $gte: since } } }
  }).select('topicId members').limit(10).lean();
  if (!rooms.length) return [];
  const topics = await Task2Topic.find({ _id: { $in: rooms.map(r => r.topicId) } }).select('topicName topicEmoji week').lean();
  const tById = new Map(topics.map(t => [String(t._id), t]));
  return rooms.map(r => {
    const me = r.members.find(m => String(m.userId) === String(uid));
    const from = r.members.find(m => String(m.userId) === String(me?.invitedBy));
    const t = tById.get(String(r.topicId));
    return {
      roomId: r._id,
      topicId: r.topicId,
      topicName: t?.topicName || '',
      topicEmoji: t?.topicEmoji || '',
      week: t?.week || null,
      fromName: from?.name || '',
      invitedAt: me?.invitedAt || null,
      joined: r.members.filter(m => m.status === 'joined').map(m => m.name)
    };
  }).filter(x => x.topicName);
}

async function respond(user, roomId, accept) {
  if (!mongoose.isValidObjectId(roomId)) return { status: 'not_found' };
  const room = await Task2CoWriteRoom.findOne({ _id: roomId, expiresAt: { $gt: new Date() } });
  const me = room?.members.find(m => String(m.userId) === String(user._id));
  if (!room || !me || me.status !== 'invited') return { status: 'not_found' };
  if (!accept) {
    me.status = 'declined';
    room.rev += 1;
    await room.save();
    return { status: 'ok' };
  }
  // One group per topic: step out of any other group for the same lesson.
  await Task2CoWriteRoom.updateMany(
    { _id: { $ne: room._id }, topicId: room.topicId, members: { $elemMatch: { userId: user._id, status: 'joined' } } },
    { $set: { 'members.$.status': 'left' }, $inc: { rev: 1 } }
  );
  me.status = 'joined';
  me.joinedAt = new Date();
  me.name = nameOf(user);
  me.avatar = user.avatar || '';
  room.rev += 1;
  room.expiresAt = freshExpiry();
  await room.save();
  return { status: 'ok', topicId: room.topicId, room: roomView(room, user._id) };
}

async function leave(uid, topicId) {
  if (!mongoose.isValidObjectId(topicId)) return { status: 'not_found' };
  const room = await findMyRoom(uid, topicId);
  if (!room) return { status: 'ok' };
  const me = room.members.find(m => String(m.userId) === String(uid));
  me.status = 'left';
  if (!room.members.some(m => m.status === 'joined')) {
    await room.deleteOne();
    return { status: 'ok' };
  }
  room.rev += 1;
  await room.save();
  return { status: 'ok' };
}

// Atomic positional update — several members push text at the same time.
async function pushText(uid, topicId, sections) {
  if (!mongoose.isValidObjectId(topicId)) return { status: 'not_found' };
  const now = new Date();
  const r = await Task2CoWriteRoom.updateOne(
    { topicId, expiresAt: { $gt: now }, members: { $elemMatch: { userId: oid(uid), status: 'joined' } } },
    {
      $set: { 'members.$.sections': cleanSections(sections), 'members.$.textAt': now, 'members.$.seenAt': now, expiresAt: freshExpiry() },
      $inc: { rev: 1 }
    }
  );
  return r.matchedCount ? { status: 'ok' } : { status: 'not_in_room' };
}

// The writer's poll. sinceRev = the rev the client already rendered; when
// nothing changed only presence comes back (no text).
async function getRoom(uid, topicId, sinceRev) {
  if (!mongoose.isValidObjectId(topicId)) return { status: 'not_found' };
  const room = await findMyRoom(uid, topicId).lean();
  if (!room) return { status: 'ok', room: null };
  const now = Date.now();
  const me = room.members.find(m => String(m.userId) === String(uid));
  if (!me.seenAt || now - new Date(me.seenAt).getTime() >= SEEN_WRITE_MS) {
    me.seenAt = new Date(now);
    Task2CoWriteRoom.updateOne(
      { _id: room._id, members: { $elemMatch: { userId: oid(uid), status: 'joined' } } },
      { $set: { 'members.$.seenAt': me.seenAt } }
    ).catch(() => {});
  }
  if (sinceRev && Number(sinceRev) === room.rev) {
    return {
      status: 'ok', unchanged: true, rev: room.rev,
      presence: room.members.filter(m => m.status === 'joined').map(m => {
        const v = memberView(m, uid, now);
        return { userId: v.userId, online: v.online, typing: v.typing };
      })
    };
  }
  return { status: 'ok', room: roomView(room, uid) };
}

module.exports = {
  listOnline, invite, pendingInvites, activeRoom, respond, leave, pushText, getRoom,
  MAX_MEMBERS, INVITE_TTL_MS
};
