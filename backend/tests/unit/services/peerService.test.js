const peerService = require('../../../services/peerService');
const Message = require('../../../models/Message');
const Block = require('../../../models/Block');
const Report = require('../../../models/Report');
const { createStudent, createTeacher } = require('../../factories/userFactory');

describe('peerService.getPeerProfile', () => {
  test('returns the narrow safe field set — no email, plan, or ban info', async () => {
    const viewer = await createStudent();
    const target = await createStudent({ firstName: 'Minh', lastName: 'Trần' });

    const result = await peerService.getPeerProfile(viewer._id, target._id);

    expect(result.status).toBe('ok');
    expect(result.profile.name).toBe('Minh Trần');
    expect(result.profile).toHaveProperty('streak');
    expect(result.profile).toHaveProperty('reading');
    expect(result.profile).toHaveProperty('listening');
    expect(result.profile).toHaveProperty('speaking');
    expect(result.profile).not.toHaveProperty('email');
    expect(result.profile).not.toHaveProperty('plan');
    expect(result.profile).not.toHaveProperty('isBanned');
    expect(result.profile).not.toHaveProperty('banReason');
  });

  test('rejects viewing a non-student (teacher/admin) profile through this endpoint', async () => {
    const viewer = await createStudent();
    const teacher = await createTeacher();

    const result = await peerService.getPeerProfile(viewer._id, teacher._id);
    expect(result.status).toBe('not_found');
  });

  test('reports not_found for a nonexistent or malformed id', async () => {
    const viewer = await createStudent();
    const result = await peerService.getPeerProfile(viewer._id, 'not-an-id');
    expect(result.status).toBe('not_found');
  });
});

describe('peerService.sendPeerMessage / getThread / listConversations', () => {
  test('two students can exchange messages and see them in a shared thread', async () => {
    const a = await createStudent({ firstName: 'A', lastName: '' });
    const b = await createStudent({ firstName: 'B', lastName: '' });

    const r1 = await peerService.sendPeerMessage(a._id, 'A', b._id, 'Chào bạn!');
    expect(r1.status).toBe('ok');
    expect(r1.message.isPeer).toBe(true);

    const r2 = await peerService.sendPeerMessage(b._id, 'B', a._id, 'Chào, khỏe không?');
    expect(r2.status).toBe('ok');

    const threadForA = await peerService.getThread(a._id, b._id);
    expect(threadForA.status).toBe('ok');
    expect(threadForA.messages).toHaveLength(2);
    expect(threadForA.messages[0].body).toBe('Chào bạn!');
    expect(threadForA.messages[1].body).toBe('Chào, khỏe không?');
  });

  test('rejects sending to yourself', async () => {
    const a = await createStudent();
    const result = await peerService.sendPeerMessage(a._id, 'A', a._id, 'hi');
    expect(result.status).toBe('self');
  });

  test('rejects an empty message', async () => {
    const a = await createStudent();
    const b = await createStudent();
    const result = await peerService.sendPeerMessage(a._id, 'A', b._id, '   ');
    expect(result.status).toBe('empty');
  });

  test('rejects messaging a non-student', async () => {
    const a = await createStudent();
    const teacher = await createTeacher();
    const result = await peerService.sendPeerMessage(a._id, 'A', teacher._id, 'hi thầy');
    expect(result.status).toBe('not_found');
  });

  test('peer messages never leak into the teacher-inbox message list, but do count toward the nav unread badge', async () => {
    const a = await createStudent();
    const b = await createStudent();
    const userMessageService = require('../../../services/userMessageService');

    await peerService.sendPeerMessage(a._id, 'A', b._id, 'Chào bạn!');

    // listMessages() is the teacher/admin "Hộp thư" inbox view — peer chat
    // has its own separate conversation/thread UI, so it must stay excluded here.
    const { messages } = await userMessageService.listMessages(b._id, 1, 30);
    expect(messages.some(m => m.isPeer)).toBe(false);

    // getUnreadCount() feeds the site-wide nav badge instead, which should
    // reflect every message the student hasn't read yet, peer chat included.
    const unread = await userMessageService.getUnreadCount(b._id);
    expect(unread).toBe(1);
  });

  test('listConversations returns one row per partner with the latest message and unread count', async () => {
    const a = await createStudent();
    const b = await createStudent();
    const c = await createStudent();

    await peerService.sendPeerMessage(a._id, 'A', b._id, 'msg1 to b');
    await peerService.sendPeerMessage(a._id, 'A', b._id, 'msg2 to b');
    await peerService.sendPeerMessage(a._id, 'A', c._id, 'msg to c');

    const convosForA = await peerService.listConversations(a._id);
    expect(convosForA).toHaveLength(2);
    const withB = convosForA.find(x => x.userId.toString() === b._id.toString());
    expect(withB.lastMessage).toBe('msg2 to b');
    expect(withB.isLastFromMe).toBe(true);

    const convosForB = await peerService.listConversations(b._id);
    expect(convosForB).toHaveLength(1);
    expect(convosForB[0].unread).toBe(2);
  });

  test('opening a thread marks the other party\'s messages as read', async () => {
    const a = await createStudent();
    const b = await createStudent();
    await peerService.sendPeerMessage(a._id, 'A', b._id, 'hi');

    await peerService.getThread(b._id, a._id);

    const msgs = await Message.find({ isPeer: true, fromId: a._id, toId: b._id });
    expect(msgs[0].isRead).toBe(true);
  });
});

describe('peerService.blockUser / unblockUser', () => {
  test('blocking prevents messages in both directions', async () => {
    const a = await createStudent();
    const b = await createStudent();

    await peerService.blockUser(a._id, b._id);

    const fromBToA = await peerService.sendPeerMessage(b._id, 'B', a._id, 'hi');
    expect(fromBToA.status).toBe('blocked');

    const fromAToB = await peerService.sendPeerMessage(a._id, 'A', b._id, 'hi');
    expect(fromAToB.status).toBe('blocked');
  });

  test('blocking twice does not throw (idempotent)', async () => {
    const a = await createStudent();
    const b = await createStudent();
    await peerService.blockUser(a._id, b._id);
    const result = await peerService.blockUser(a._id, b._id);
    expect(result.status).toBe('ok');
    const count = await Block.countDocuments({ blockerId: a._id, blockedId: b._id });
    expect(count).toBe(1);
  });

  test('unblocking restores the ability to message', async () => {
    const a = await createStudent();
    const b = await createStudent();
    await peerService.blockUser(a._id, b._id);
    await peerService.unblockUser(a._id, b._id);

    const result = await peerService.sendPeerMessage(b._id, 'B', a._id, 'hi again');
    expect(result.status).toBe('ok');
  });

  test('rejects blocking yourself', async () => {
    const a = await createStudent();
    const result = await peerService.blockUser(a._id, a._id);
    expect(result.status).toBe('self');
  });
});

describe('peerService.reportUser', () => {
  test('creates a report visible to admin review', async () => {
    const a = await createStudent();
    const b = await createStudent();

    const result = await peerService.reportUser(a._id, 'A', b._id, 'Nhắn tin thô lỗ');
    expect(result.status).toBe('ok');

    const saved = await Report.findById(result.report._id);
    expect(saved.reporterId.toString()).toBe(a._id.toString());
    expect(saved.reportedId.toString()).toBe(b._id.toString());
    expect(saved.reason).toBe('Nhắn tin thô lỗ');
    expect(saved.status).toBe('open');
  });

  test('rejects an empty reason', async () => {
    const a = await createStudent();
    const b = await createStudent();
    const result = await peerService.reportUser(a._id, 'A', b._id, '   ');
    expect(result.status).toBe('empty');
  });
});
