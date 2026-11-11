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
    expect(res.body.items.map(i => i.key)).toEqual(['hopeHammer', 'danielHammer', 'iceShield', 'cake', 'towel', 'cloak', 'crown', 'lens']);
    expect(res.body.pets).toHaveLength(20);
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

  test('teachers can buy; admins cannot', async () => {
    const t = await createTeacher({ extra: { flameWallet: 100, flameWalletGranted: true } });
    const ok = await request(app).post('/api/shop/buy').set(auth(t)).send({ kind: 'item', key: 'cake' });
    expect(ok.status).toBe(200);
    expect((await User.findById(t._id).lean()).shopItems.cake).toBe(1);
    const { createAdmin } = require('../factories/userFactory');
    const a = await createAdmin({ extra: { flameWallet: 100 } });
    const res = await request(app).post('/api/shop/buy').set(auth(a)).send({ kind: 'item', key: 'cake' });
    expect(res.status).toBe(403);
  });

  test('a teacher on the BXH can be hit by a cake', async () => {
    const s = await createStudent({ extra: { shopItems: { cake: 1 } } });
    const t = await createTeacher();
    const res = await request(app).post('/api/shop/cake').set(auth(s)).send({ targetId: String(t._id) });
    expect(res.status).toBe(200);
    expect((await User.findById(t._id).lean()).cakedUntil).toBeTruthy();
  });

  test('cake on a bad id is refunded, not lost', async () => {
    const s = await createStudent({ extra: { shopItems: { cake: 1 } } });
    const res = await request(app).post('/api/shop/cake').set(auth(s)).send({ targetId: 'not-an-id' });
    expect(res.body.success).toBe(false);
    expect((await User.findById(s._id).lean()).shopItems.cake).toBe(1);
  });
});

describe('/api/shop gifts (Kho đồ → 🎁 Tặng)', () => {
  const Message = require('../../models/Message');
  const Block = require('../../models/Block');
  const { createAdmin } = require('../factories/userFactory');
  const gift = (from, body) => request(app).post('/api/shop/gift').set(auth(from)).send(body);

  const claim = (who, msg) => request(app).post(`/api/user/messages/${msg._id}/claim`).set(auth(who));

  test('items go to the recipient\'s Hộp thư and land in their Kho đồ only on "Nhận quà"', async () => {
    const s = await createStudent({ firstName: 'An', lastName: 'Lê', extra: { shopItems: { cake: 3 }, streakHammers: 1 } });
    const t = await createTeacher();
    let res = await gift(s, { kind: 'item', key: 'cake', toId: String(t._id), qty: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, owned: 1, qty: 2 });
    // Not in the Kho đồ yet — it waits in the message.
    expect(((await User.findById(t._id).lean()).shopItems || {}).cake || 0).toBe(0);
    const note = await Message.findOne({ toId: t._id }).lean();
    expect(note.subject).toMatch(/An Lê đã tặng bạn 2 × 🎂/);
    expect(note).toMatchObject({ type: 'gift', giftItemKey: 'cake', giftItemQty: 2 });

    const inbox = await request(app).get('/api/user/messages').set(auth(t));
    expect(inbox.body.messages[0].giftItem).toMatchObject({ key: 'cake', qty: 2 });

    res = await claim(t, note);
    expect(res.status).toBe(200);
    expect(res.body.item).toMatchObject({ key: 'cake', qty: 2 });
    expect((await User.findById(t._id).lean()).shopItems.cake).toBe(2);
    // Only once.
    expect((await claim(t, note)).status).toBe(409);
    expect((await User.findById(t._id).lean()).shopItems.cake).toBe(2);

    // Búa Daniel lives on streakHammers, not shopItems.
    res = await gift(s, { kind: 'item', key: 'danielHammer', toId: String(t._id) });
    expect(res.status).toBe(200);
    expect((await User.findById(s._id).lean()).streakHammers).toBe(0);
    const hammerMsg = await Message.findOne({ toId: t._id, giftItemKey: 'danielHammer' }).lean();
    await claim(t, hammerMsg);
    expect((await User.findById(t._id).lean()).streakHammers).toBe(1);
  });

  test('only the recipient can claim', async () => {
    const s = await createStudent({ extra: { shopItems: { cake: 1 } } });
    const other = await createStudent();
    const stranger = await createStudent();
    await gift(s, { kind: 'item', key: 'cake', toId: String(other._id) });
    const msg = await Message.findOne({ toId: other._id }).lean();
    expect((await claim(stranger, msg)).status).toBe(403);
    expect(((await User.findById(stranger._id).lean()).shopItems || {}).cake || 0).toBe(0);
  });

  test('cannot give more than owned, to yourself, to an admin, or past maxOwned (pending gifts count)', async () => {
    const s = await createStudent({ extra: { shopItems: { cake: 1, iceShield: 2 } } });
    const other = await createStudent({ extra: { shopItems: { iceShield: 1 } } });
    const admin = await createAdmin();
    expect((await gift(s, { kind: 'item', key: 'cake', toId: String(other._id), qty: 2 })).body.code).toBe('none_left');
    expect((await gift(s, { kind: 'item', key: 'cake', toId: String(s._id) })).body.code).toBe('gift_self');
    expect((await gift(s, { kind: 'item', key: 'cake', toId: String(admin._id) })).body.code).toBe('target_not_found');
    const full = await gift(s, { kind: 'item', key: 'iceShield', toId: String(other._id), qty: 2 });
    expect(full.body).toMatchObject({ code: 'target_full', left: 1 });
    // Nothing was taken on any of the failures.
    expect((await User.findById(s._id).lean()).shopItems).toMatchObject({ cake: 1, iceShield: 2 });

    // 1 shield waiting in their Hộp thư fills the last slot.
    expect((await gift(s, { kind: 'item', key: 'iceShield', toId: String(other._id) })).status).toBe(200);
    expect((await gift(s, { kind: 'item', key: 'iceShield', toId: String(other._id) })).body).toMatchObject({ code: 'target_full', left: 0 });
  });

  test('a claim over maxOwned is refused and the gift stays in the message', async () => {
    const s = await createStudent({ extra: { shopItems: { iceShield: 1 } } });
    const other = await createStudent({ extra: { shopItems: { iceShield: 1 } } });
    await gift(s, { kind: 'item', key: 'iceShield', toId: String(other._id) });
    // They bought one more meanwhile.
    await User.updateOne({ _id: other._id }, { $set: { 'shopItems.iceShield': 2 } });
    const msg = await Message.findOne({ toId: other._id }).lean();
    let res = await claim(other, msg);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('max_owned');
    expect((await Message.findById(msg._id).lean()).claimedBy).toHaveLength(0);
    // Used a shield → can claim now.
    await User.updateOne({ _id: other._id }, { $set: { 'shopItems.iceShield': 1 } });
    res = await claim(other, msg);
    expect(res.status).toBe(200);
    expect((await User.findById(other._id).lean()).shopItems.iceShield).toBe(2);
  });

  test('blocked either way → no gift', async () => {
    const s = await createStudent({ extra: { shopItems: { cake: 1 } } });
    const other = await createStudent();
    await Block.create({ blockerId: other._id, blockedId: s._id });
    expect((await gift(s, { kind: 'item', key: 'cake', toId: String(other._id) })).body.code).toBe('gift_blocked');
    expect((await User.findById(s._id).lean()).shopItems.cake).toBe(1);
    expect(await Message.countDocuments({ toId: other._id })).toBe(0);
  });

  test('a linh thú goes via the Hộp thư; the walking one comes home; no duplicates', async () => {
    const s = await createStudent({ extra: { pets: ['meo', 'shiba'], activePet: 'meo' } });
    const other = await createStudent({ extra: { pets: ['shiba'] } });
    expect((await gift(s, { kind: 'pet', key: 'shiba', toId: String(other._id) })).body.code).toBe('target_has_pet');
    const res = await gift(s, { kind: 'pet', key: 'meo', toId: String(other._id) });
    expect(res.status).toBe(200);
    expect(res.body.activePet).toBe('');
    let [giver, recv] = await Promise.all([User.findById(s._id).lean(), User.findById(other._id).lean()]);
    expect(giver.pets).toEqual(['shiba']);
    expect(recv.pets).toEqual(['shiba']); // waiting in the Hộp thư

    // Can't buy it while it waits there.
    await User.updateOne({ _id: other._id }, { $set: { flameWallet: 500, flameWalletGranted: true } });
    expect((await request(app).post('/api/shop/buy').set(auth(other)).send({ kind: 'pet', key: 'meo' })).body.code).toBe('gift_pending');

    const msg = await Message.findOne({ toId: other._id, giftPetId: 'meo' }).lean();
    const c = await claim(other, msg);
    expect(c.status).toBe(200);
    expect(c.body.pet).toMatchObject({ id: 'meo' });
    recv = await User.findById(other._id).lean();
    expect(recv.pets).toEqual(['shiba', 'meo']);
    expect(recv.activePet).toBe('meo'); // had none out walking
  });

  test('the same linh thú can\'t be sent twice while one is still waiting', async () => {
    const a = await createStudent({ extra: { pets: ['cao'] } });
    const b = await createStudent({ extra: { pets: ['cao'] } });
    const r = await createStudent();
    expect((await gift(a, { kind: 'pet', key: 'cao', toId: String(r._id) })).status).toBe(200);
    expect((await gift(b, { kind: 'pet', key: 'cao', toId: String(r._id) })).body.code).toBe('target_has_pet');
    expect((await User.findById(b._id).lean()).pets).toEqual(['cao']);
  });

  test('recipient search: students + teachers, not self/admins/blocked/banned', async () => {
    const s = await createStudent({ firstName: 'Zed' });
    const mate = await createStudent({ firstName: 'Zoe', lastName: 'Trần' });
    const t = await createTeacher({ firstName: 'Zara' });
    await createAdmin({ firstName: 'Zack' });
    await createStudent({ firstName: 'Zoro', extra: { isBanned: true } });
    const blocked = await createStudent({ firstName: 'Zuri' });
    await Block.create({ blockerId: s._id, blockedId: blocked._id });
    const res = await request(app).get('/api/shop/gift-recipients?q=z').set(auth(s));
    expect(res.status).toBe(200);
    const ids = res.body.users.map(u => String(u._id)).sort();
    expect(ids).toEqual([String(mate._id), String(t._id)].sort());
    expect(res.body.users.find(u => String(u._id) === String(t._id)).teacher).toBe(true);
    const two = await request(app).get('/api/shop/gift-recipients?q=' + encodeURIComponent('zoe trần')).set(auth(s));
    expect(two.body.users.map(u => String(u._id))).toEqual([String(mate._id)]);
  });

  test('pet state + 🎁 gift route, with its error codes', async () => {
    const s = await createStudent({ extra: { flameWalletGranted: true, pets: ['meo'], activePet: 'meo' } });
    let res = await request(app).get('/api/shop/pet').set(auth(s));
    expect(res.body).toMatchObject({ success: true, activePet: 'meo', gift: 'study' });
    res = await request(app).post('/api/shop/pet-gift').set(auth(s));
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('gift_study');
    res = await request(app).get('/api/shop').set(auth(s));
    expect(res.body.pet).toMatchObject({ id: 'meo', gift: 'study', skill: { name: 'Thần Tài' } });
  });

  test('⚔️ duel routes: challenge → list → accept', async () => {
    const a = await createStudent({ extra: { flameWallet: 50, flameWalletGranted: true } });
    const b = await createStudent({ extra: { flameWallet: 50, flameWalletGranted: true } });
    let res = await request(app).post('/api/shop/duels').set(auth(a)).send({ toId: String(b._id), stake: 1 });
    expect(res.body.code).toBe('duel_stake');
    res = await request(app).post('/api/shop/duels').set(auth(a)).send({ toId: String(b._id), stake: 20 });
    expect(res.body).toMatchObject({ success: true, wallet: 30 });
    res = await request(app).get('/api/shop/duels').set(auth(b));
    expect(res.body.open).toHaveLength(1);
    res = await request(app).post(`/api/shop/duels/${res.body.open[0].id}/accept`).set(auth(b));
    expect(res.body).toMatchObject({ success: true, wallet: 30 });
  });
});
