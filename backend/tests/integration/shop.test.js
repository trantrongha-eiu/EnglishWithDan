// Integration tests for /api/shop — thin HTTP wrapper around
// services/shopService.js (see tests/unit/services/shopService.test.js for
// the hammer/shield/cloak rules). Proves the routes are wired: auth, the
// response shapes shop.html reads, and the error codes it shows.
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

describe('/api/shop', () => {
  test('401 without a token', async () => {
    expect((await request(app).get('/api/shop')).status).toBe(401);
  });

  test('GET returns the wallet, the catalog and the pets', async () => {
    const s = await createStudent({ extra: { flameWallet: 12, flameWalletGranted: true } });
    const res = await request(app).get('/api/shop').set(auth(s));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, wallet: 12, activePet: '' });
    expect(res.body.items.map(i => i.key)).toEqual(['hopeHammer', 'iceShield', 'cake', 'towel', 'cloak', 'crown']);
    expect(res.body.pets).toHaveLength(14);
  });

  test('buy → use flow, with the error codes the page shows', async () => {
    const s = await createStudent({ extra: { flameWallet: 30, flameWalletGranted: true } });
    let res = await request(app).post('/api/shop/buy').set(auth(s)).send({ kind: 'item', key: 'crown' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('not_enough');

    res = await request(app).post('/api/shop/buy').set(auth(s)).send({ kind: 'item', key: 'cloak' });
    expect(res.body).toMatchObject({ success: true, wallet: 15, owned: 1 });

    res = await request(app).post('/api/shop/use').set(auth(s)).send({ key: 'cloak' });
    expect(res.body.success).toBe(true);
    expect(new Date(res.body.until).getTime()).toBeGreaterThan(Date.now());

    res = await request(app).post('/api/shop/use').set(auth(s)).send({ key: 'cloak' });
    expect(res.body.code).toBe('none_left');
  });

  test('pets: buy, then GET/PUT the walking one', async () => {
    const s = await createStudent({ extra: { flameWallet: 40, flameWalletGranted: true } });
    let res = await request(app).post('/api/shop/buy').set(auth(s)).send({ kind: 'pet', key: 'meo' });
    expect(res.body).toMatchObject({ success: true, activePet: 'meo', wallet: 10 });
    expect((await request(app).get('/api/shop/pet').set(auth(s))).body.activePet).toBe('meo');
    res = await request(app).put('/api/shop/pet').set(auth(s)).send({ petId: '' });
    expect(res.body.activePet).toBe('');
    res = await request(app).put('/api/shop/pet').set(auth(s)).send({ petId: 'rong' });
    expect(res.body.code).toBe('not_owned');
  });

  test('kho đồ: selling refunds half the price (rounded down)', async () => {
    const s = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true, shopItems: { cloak: 1, hopeHammer: 1 }, pets: ['vi2', 'meo'], activePet: 'vi2' } });
    let res = await request(app).post('/api/shop/sell').set(auth(s)).send({ kind: 'item', key: 'cloak' });
    expect(res.body).toMatchObject({ success: true, refund: 7, wallet: 7, owned: 0 });
    res = await request(app).post('/api/shop/sell').set(auth(s)).send({ kind: 'item', key: 'cloak' });
    expect(res.body.code).toBe('none_left');
    res = await request(app).post('/api/shop/sell').set(auth(s)).send({ kind: 'item', key: 'hopeHammer' });
    expect(res.body).toMatchObject({ refund: 12, wallet: 19 });
    // Selling the pet that's out walking sends it home.
    res = await request(app).post('/api/shop/sell').set(auth(s)).send({ kind: 'pet', key: 'vi2' });
    expect(res.body).toMatchObject({ success: true, refund: 35, wallet: 54, activePet: '' });
    const u = await User.findById(s._id).lean();
    expect(u.pets).toEqual(['meo']);
    res = await request(app).post('/api/shop/sell').set(auth(s)).send({ kind: 'pet', key: 'vi2' });
    expect(res.body.code).toBe('not_owned');
  });

  test('a purchase notifies every admin and shows up in the other students feed', async () => {
    const Message = require('../../models/Message');
    const { createAdmin } = require('../factories/userFactory');
    const admin = await createAdmin();
    const buyer = await createStudent({ extra: { firstName: 'Minh', lastName: 'Anh', flameWallet: 100, flameWalletGranted: true } });
    const other = await createStudent();
    await request(app).post('/api/shop/buy').set(auth(buyer)).send({ kind: 'pet', key: 'vi1' });

    const msg = await Message.findOne({ toId: admin._id }).lean();
    expect(msg.subject).toBe('[Cửa hàng] Minh Anh đã mua 🐾 linh thú Lửng Cát Nhất Vĩ');

    let res = await request(app).get('/api/shop/feed').set(auth(other));
    expect(res.body.feed).toEqual([expect.objectContaining({ name: 'Minh Anh', kind: 'pet', key: 'vi1', itemName: 'Lửng Cát Nhất Vĩ' })]);
    // Not shown to the buyer themselves, and `since` skips what was seen.
    expect((await request(app).get('/api/shop/feed').set(auth(buyer))).body.feed).toEqual([]);
    res = await request(app).get('/api/shop/feed').query({ since: new Date(Date.now() + 1000).toISOString() }).set(auth(other));
    expect(res.body.feed).toEqual([]);
  });

  test('a failed purchase notifies nobody', async () => {
    const Message = require('../../models/Message');
    const s = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true } });
    await request(app).post('/api/shop/buy').set(auth(s)).send({ kind: 'item', key: 'crown' });
    expect(await Message.countDocuments({ fromId: s._id })).toBe(0);
  });

  test('🔥 gifted by inbox message lands in the wallet too', async () => {
    const Message = require('../../models/Message');
    const { createAdmin } = require('../factories/userFactory');
    const admin = await createAdmin();
    const s = await createStudent({ extra: { learningStreak: 5, lastActivityDate: new Date(), flameWallet: 3, flameWalletGranted: true } });
    // (already granted: wallet 3 is what's left after shopping)
    const msg = await Message.create({ fromId: admin._id, fromName: 'Admin', toId: s._id, body: 'Quà', giftStreakDays: 100, type: 'gift' });
    const res = await request(app).post(`/api/user/messages/${msg._id}/claim`).set(auth(s));
    expect(res.status).toBe(200);
    const u = await User.findById(s._id).lean();
    expect(u.learningStreak).toBe(105);
    expect(u.flameWallet).toBe(103);
    expect((await request(app).get('/api/shop').set(auth(s))).body.wallet).toBe(103);
  });

  test('a gift claimed before the student ever opened the shop is added on top of the grant', async () => {
    const Message = require('../../models/Message');
    const { createAdmin } = require('../factories/userFactory');
    const admin = await createAdmin();
    const s = await createStudent({ extra: { learningStreak: 20, lastActivityDate: new Date() } });
    const msg = await Message.create({ fromId: admin._id, fromName: 'Admin', toId: s._id, body: 'Quà', giftStreakDays: 50, type: 'gift' });
    await request(app).post(`/api/user/messages/${msg._id}/claim`).set(auth(s));
    // grant 20 (the streak before the gift) + the 50 gifted
    expect((await request(app).get('/api/shop').set(auth(s))).body.wallet).toBe(70);
  });

  test('GET reports Búa Daniel and whether it can be used right now', async () => {
    const plain = await createStudent({ extra: { streakHammers: 2, learningStreak: 7, lastActivityDate: new Date(), flameWalletGranted: true } });
    let res = await request(app).get('/api/shop').set(auth(plain));
    expect(res.body.danielHammer).toEqual({ count: 2, canUse: false, previousStreak: 0 });
    expect(res.body.streak).toBe(7);

    const lost = await createStudent({ extra: { streakHammers: 1, learningStreak: 0, previousStreak: 30, streakLostAt: new Date(), flameWalletGranted: true } });
    res = await request(app).get('/api/shop').set(auth(lost));
    expect(res.body.danielHammer).toEqual({ count: 1, canUse: true, previousStreak: 30 });
  });

  test('staff cannot buy', async () => {
    const t = await createTeacher({ extra: { flameWallet: 100 } });
    const res = await request(app).post('/api/shop/buy').set(auth(t)).send({ kind: 'item', key: 'cake' });
    expect(res.status).toBe(403);
  });

  test('cake on a bad id is refunded, not lost', async () => {
    const s = await createStudent({ extra: { shopItems: { cake: 1 } } });
    const res = await request(app).post('/api/shop/cake').set(auth(s)).send({ targetId: 'not-an-id' });
    expect(res.body.success).toBe(false);
    expect((await User.findById(s._id).lean()).shopItems.cake).toBe(1);
  });
});
