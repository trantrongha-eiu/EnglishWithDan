// Integration tests for "Mời bạn viết cùng" — live co-writing groups on the
// Task 2 writer (services/task2CoWriteService.js, routes under
// /api/task2/cowrite/*, invites riding /api/user/peer/conversations).
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Block = require('../../models/Block');
const Task2CoWriteRoom = require('../../models/Task2CoWriteRoom');
const { createPremiumStudent, createStudent, signTokenFor } = require('../factories/userFactory');
const { createTask2Topic } = require('../factories/contentFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const online = (u) => User.updateOne({ _id: u._id }, { lastSeen: new Date() });

async function trio() {
  const [a, b, c] = await Promise.all([
    createPremiumStudent({ firstName: 'An' }),
    createPremiumStudent({ firstName: 'Bình' }),
    createPremiumStudent({ firstName: 'Chi' }),
  ]);
  await Promise.all([online(a), online(b), online(c)]);
  const topic = await createTask2Topic({ week: 2 });
  return { a, b, c, topic };
}

describe('Task 2 co-writing', () => {
  test('online list shows other online students, not self or blocked ones', async () => {
    const { a, b, c, topic } = await trio();
    await Block.create({ blockerId: c._id, blockedId: a._id });
    const res = await request(app).get(`/api/task2/cowrite/online/${topic._id}`).set(auth(a));
    expect(res.status).toBe(200);
    const ids = res.body.students.map(s => String(s._id));
    expect(ids).toContain(String(b._id));
    expect(ids).not.toContain(String(a._id));
    expect(ids).not.toContain(String(c._id));
  });

  test('invite → invitee sees it (also on the peer-chat poll) → accept → both see each other\'s live text', async () => {
    const { a, b, topic } = await trio();

    const inv = await request(app).post('/api/task2/cowrite/invite').set(auth(a))
      .send({ topicId: String(topic._id), userIds: [String(b._id)] });
    expect(inv.status).toBe(200);
    expect(inv.body.invited.map(String)).toEqual([String(b._id)]);
    expect(inv.body.room.members.find(m => m.isMe).status).toBe('joined');

    const pending = await request(app).get('/api/task2/cowrite/invites').set(auth(b));
    expect(pending.body.invites).toHaveLength(1);
    expect(pending.body.invites[0].topicName).toBe(topic.topicName);
    expect(pending.body.invites[0].fromName).toMatch(/An/);

    const peer = await request(app).get('/api/user/peer/conversations').set(auth(b));
    expect(peer.status).toBe(200);
    expect(peer.body.cowriteInvites).toHaveLength(1);

    const acc = await request(app).post(`/api/task2/cowrite/room/${pending.body.invites[0].roomId}/accept`).set(auth(b));
    expect(acc.status).toBe(200);
    expect(String(acc.body.topicId)).toBe(String(topic._id));
    expect((await request(app).get('/api/task2/cowrite/invites').set(auth(b))).body.invites).toHaveLength(0);

    const push = await request(app).put(`/api/task2/cowrite/topic/${topic._id}/text`).set(auth(b))
      .send({ sections: { intro: 'Some people argue that...', body1: '', hacked: 'x' } });
    expect(push.body.inRoom).toBe(true);

    const seen = await request(app).get(`/api/task2/cowrite/topic/${topic._id}`).set(auth(a));
    expect(seen.status).toBe(200);
    const bView = seen.body.room.members.find(m => String(m.userId) === String(b._id));
    expect(bView.status).toBe('joined');
    expect(bView.sections.intro).toBe('Some people argue that...');
    expect(bView.sections.hacked).toBeUndefined();
    // Your own text isn't echoed back.
    expect(seen.body.room.members.find(m => m.isMe).sections).toBeUndefined();

    // Same rev → no text, presence only.
    const again = await request(app).get(`/api/task2/cowrite/topic/${topic._id}?rev=${seen.body.room.rev}`).set(auth(a));
    expect(again.body.unchanged).toBe(true);
    expect(again.body.room).toBeUndefined();
    expect(again.body.presence.length).toBe(2);
  });

  test('someone outside the room can neither read nor write it', async () => {
    const { a, b, c, topic } = await trio();
    await request(app).post('/api/task2/cowrite/invite').set(auth(a)).send({ topicId: String(topic._id), userIds: [String(b._id)] });
    const r = await request(app).get(`/api/task2/cowrite/topic/${topic._id}`).set(auth(c));
    expect(r.body.room).toBeNull();
    const w = await request(app).put(`/api/task2/cowrite/topic/${topic._id}/text`).set(auth(c)).send({ sections: { intro: 'x' } });
    expect(w.body.inRoom).toBe(false);
    // b was only invited, not joined — can't read yet either.
    expect((await request(app).get(`/api/task2/cowrite/topic/${topic._id}`).set(auth(b))).body.room).toBeNull();
  });

  test('blocked students and non-students cannot be invited', async () => {
    const { a, b, topic } = await trio();
    await Block.create({ blockerId: b._id, blockedId: a._id });
    const res = await request(app).post('/api/task2/cowrite/invite').set(auth(a)).send({ topicId: String(topic._id), userIds: [String(b._id)] });
    expect(res.status).toBe(400);
  });

  test('decline clears the invite; leaving the last member deletes the room', async () => {
    const { a, b, topic } = await trio();
    const inv = await request(app).post('/api/task2/cowrite/invite').set(auth(a)).send({ topicId: String(topic._id), userIds: [String(b._id)] });
    const roomId = inv.body.room.roomId;
    await request(app).post(`/api/task2/cowrite/room/${roomId}/decline`).set(auth(b));
    expect((await request(app).get('/api/task2/cowrite/invites').set(auth(b))).body.invites).toHaveLength(0);
    await request(app).post(`/api/task2/cowrite/topic/${topic._id}/leave`).set(auth(a));
    expect(await Task2CoWriteRoom.findById(roomId)).toBeNull();
  });

  test('accepting a second group for the same lesson leaves the first', async () => {
    const { a, b, c, topic } = await trio();
    await request(app).post('/api/task2/cowrite/invite').set(auth(a)).send({ topicId: String(topic._id), userIds: [String(c._id)] });
    await request(app).post('/api/task2/cowrite/invite').set(auth(b)).send({ topicId: String(topic._id), userIds: [String(c._id)] });
    const invites = (await request(app).get('/api/task2/cowrite/invites').set(auth(c))).body.invites;
    expect(invites).toHaveLength(2);
    const fromA = invites.find(i => /An/.test(i.fromName));
    const fromB = invites.find(i => /Bình/.test(i.fromName));
    await request(app).post(`/api/task2/cowrite/room/${fromA.roomId}/accept`).set(auth(c));
    await request(app).post(`/api/task2/cowrite/room/${fromB.roomId}/accept`).set(auth(c));
    const roomA = await Task2CoWriteRoom.findById(fromA.roomId).lean();
    const roomB = await Task2CoWriteRoom.findById(fromB.roomId).lean();
    expect(roomA.members.find(m => String(m.userId) === String(c._id)).status).toBe('left');
    expect(roomB.members.find(m => String(m.userId) === String(c._id)).status).toBe('joined');
  });

  test('a joined member is offered "Quay lại phòng viết" on every page until the room is gone', async () => {
    const { a, b, topic } = await trio();
    const inv = await request(app).post('/api/task2/cowrite/invite').set(auth(a)).send({ topicId: String(topic._id), userIds: [String(b._id)] });
    expect(inv.status).toBe(200);
    // Host with a pending invite already has a room to return to.
    expect((await request(app).get('/api/task2/cowrite/invites').set(auth(a))).body.active.topicId).toBe(String(topic._id));
    // The invitee isn't in it yet.
    const before = await request(app).get('/api/task2/cowrite/invites').set(auth(b));
    expect(before.body.active).toBeNull();
    await request(app).post(`/api/task2/cowrite/room/${before.body.invites[0].roomId}/accept`).set(auth(b));

    // Back after a logout/login: a fresh token still sees the room.
    const peer = await request(app).get('/api/user/peer/conversations').set(auth(b));
    expect(peer.body.cowriteActive).toMatchObject({ topicId: String(topic._id), week: topic.week });
    expect(peer.body.cowriteActive.members.length).toBe(1);

    // Once the other member leaves, there's no group to go back to.
    await request(app).post(`/api/task2/cowrite/topic/${topic._id}/leave`).set(auth(a));
    expect((await request(app).get('/api/task2/cowrite/invites').set(auth(b))).body.active).toBeNull();
  });

  test('premium gate + auth on the writer endpoints', async () => {
    const topic = await createTask2Topic({ week: 2 });
    expect((await request(app).get(`/api/task2/cowrite/topic/${topic._id}`)).status).toBe(401);
    const free = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const r = await request(app).get(`/api/task2/cowrite/online/${topic._id}`).set(auth(free));
    expect(r.status).toBe(403);
  });
});
