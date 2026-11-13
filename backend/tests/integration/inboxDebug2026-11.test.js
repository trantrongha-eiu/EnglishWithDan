// Hộp thư debug pass (2026-11-13): student inbox (inbox.html) + admin Tin
// nhắn — malformed ids, paging, reply length / routing, recipient checks.
const request = require('supertest');
const app = require('../../app');
const Message = require('../../models/Message');
const Block = require('../../models/Block');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

describe('student inbox', () => {
  test('malformed message ids are 404, not 500', async () => {
    const s = await createStudent();
    for (const [method, path] of [['patch', '/read'], ['delete', ''], ['post', '/claim'], ['post', '/reply']]) {
      const res = await request(app)[method](`/api/user/messages/not-an-id${path}`).set(auth(s)).send({ body: 'hi' });
      expect(res.status).toBe(404);
    }
  });

  test('paging survives junk page/limit and caps the page size', async () => {
    const s = await createStudent();
    const t = await createTeacher();
    await Message.insertMany(Array.from({ length: 3 }, (_, i) => ({ fromId: t._id, fromName: 'T', toId: s._id, body: `m${i}` })));
    const res = await request(app).get('/api/user/messages?page=abc&limit=-5').set(auth(s));
    expect(res.status).toBe(200);
    expect(res.body.messages.length).toBe(1);
    expect(res.body.total).toBe(3);
    const res0 = await request(app).get('/api/user/messages?limit=0').set(auth(s));
    expect(res0.body.messages.length).toBe(3); // 0 → the default page size, not "everything"
  });

  test('marking read / deleting a broadcast twice keeps one entry', async () => {
    const s = await createStudent();
    const t = await createTeacher();
    const b = await Message.create({ fromId: t._id, fromName: 'T', body: 'all', isBroadcast: true });
    await Promise.all([1, 2].map(() => request(app).patch(`/api/user/messages/${b._id}/read`).set(auth(s))));
    await Promise.all([1, 2].map(() => request(app).delete(`/api/user/messages/${b._id}`).set(auth(s))));
    const doc = await Message.findById(b._id).lean();
    expect(doc.readBy.map(String)).toEqual([String(s._id)]);
    expect(doc.deletedBy.map(String)).toEqual([String(s._id)]);
  });

  test('a reply is length-capped and sent under the display name', async () => {
    const s = await createStudent({ extra: { firstName: 'Lan', lastName: 'Nguyen' } });
    const t = await createTeacher();
    const m = await Message.create({ fromId: t._id, fromName: 'T', toId: s._id, body: 'Nộp bài nhé' });
    const tooLong = await request(app).post(`/api/user/messages/${m._id}/reply`).set(auth(s)).send({ body: 'x'.repeat(4001) });
    expect(tooLong.status).toBe(400);
    const ok = await request(app).post(`/api/user/messages/${m._id}/reply`).set(auth(s)).send({ body: 'Dạ em nộp rồi ạ' });
    expect(ok.status).toBe(201);
    expect(ok.body.peer).toBe(false);
    const reply = await Message.findOne({ parentId: m._id }).lean();
    expect(String(reply.toId)).toBe(String(t._id));
    expect(reply.fromName).not.toBe(s.username);
    expect(reply.isPeer).toBe(false);
  });

  test("replying to another student's gift / cake notice goes to the peer chat and respects blocks", async () => {
    const a = await createStudent();
    const b = await createStudent();
    const gift = await Message.create({ fromId: a._id, fromName: 'A', toId: b._id, subject: '🎁', body: 'A tặng bạn quà', type: 'gift' });
    const res = await request(app).post(`/api/user/messages/${gift._id}/reply`).set(auth(b)).send({ body: 'Cảm ơn nha' });
    expect(res.status).toBe(201);
    expect(res.body.peer).toBe(true);
    const chat = await Message.findOne({ fromId: b._id, toId: a._id }).lean();
    expect(chat.isPeer).toBe(true);
    // Not in A's teacher inbox.
    const inboxA = await request(app).get('/api/user/messages').set(auth(a));
    expect(inboxA.body.messages.some((m) => m.body === 'Cảm ơn nha')).toBe(false);

    await Block.create({ blockerId: a._id, blockedId: b._id });
    const blocked = await request(app).post(`/api/user/messages/${gift._id}/reply`).set(auth(b)).send({ body: 'Alo?' });
    expect(blocked.status).toBe(403);
  });
});

describe('peer chat', () => {
  test('non-string / over-long bodies are refused, not 500', async () => {
    const a = await createStudent();
    const b = await createStudent();
    expect((await request(app).post(`/api/user/peer/${b._id}/message`).set(auth(a)).send({ body: { x: 1 } })).status).toBe(400);
    expect((await request(app).post(`/api/user/peer/${b._id}/message`).set(auth(a)).send({ body: 'y'.repeat(4001) })).status).toBe(400);
    expect((await request(app).delete('/api/user/peer/not-an-id/block').set(auth(a))).status).toBe(200);
  });
});

describe('admin Tin nhắn', () => {
  test('sending to a malformed or deleted account is refused', async () => {
    const admin = await createAdmin();
    let res = await request(app).post('/api/admin/messages').set(auth(admin)).send({ toId: 'abc', body: 'hi' });
    expect(res.status).toBe(400);
    res = await request(app).post('/api/admin/messages').set(auth(admin)).send({ toId: '64b000000000000000000000', body: 'hi', giftHammers: 3 });
    expect(res.status).toBe(400);
    expect(await Message.countDocuments({})).toBe(0);
  });

  test('malformed ids are 404 and junk paging is clamped', async () => {
    const admin = await createAdmin();
    expect((await request(app).put('/api/admin/messages/zzz').set(auth(admin)).send({ body: 'x' })).status).toBe(404);
    expect((await request(app).patch('/api/admin/messages/received/zzz/read').set(auth(admin))).status).toBe(404);
    expect((await request(app).patch('/api/admin/reports/zzz/resolve').set(auth(admin))).status).toBe(404);
    const res = await request(app).get('/api/admin/messages/received?page=abc&limit=-5').set(auth(admin));
    expect(res.status).toBe(200);
  });
});
