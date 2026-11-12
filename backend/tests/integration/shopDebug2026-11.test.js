// Regression tests from the 2026-11-12 debug pass over Cửa hàng lửa + BXH:
//  - two quick "Dùng" on a crown / cloak each add their full time
//  - a double-clicked ⚔️ challenge makes ONE duel and takes the stake once
//  - blocking someone stops their 🎂 too
//  - banned accounts are off the BXH and can't be 🎂 / 🔍 targets
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Duel = require('../../models/Duel');
const Block = require('../../models/Block');
const { createStudent, signTokenFor } = require('../factories/userFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const DAY = 864e5;

beforeAll(() => Duel.syncIndexes());

test('two crowns used at once stack to 14 days (one used to be wasted)', async () => {
  const s = await createStudent({ extra: { flameWalletGranted: true, shopItems: { crown: 2 } } });
  const [a, b] = await Promise.all([
    request(app).post('/api/shop/use').set(auth(s)).send({ key: 'crown' }),
    request(app).post('/api/shop/use').set(auth(s)).send({ key: 'crown' }),
  ]);
  expect(a.body.success && b.body.success).toBe(true);
  const u = await User.findById(s._id).select('crownUntil shopItems').lean();
  expect(u.shopItems.crown).toBe(0);
  const days = (new Date(u.crownUntil).getTime() - Date.now()) / DAY;
  expect(days).toBeGreaterThan(13.9);
  expect(days).toBeLessThan(14.1);
});

test('a running cloak is extended from its end, not from now', async () => {
  const end = new Date(Date.now() + 10 * 3600e3);
  const s = await createStudent({ extra: { flameWalletGranted: true, shopItems: { cloak: 1 }, invisibleUntil: end } });
  const res = await request(app).post('/api/shop/use').set(auth(s)).send({ key: 'cloak' });
  expect(res.body.success).toBe(true);
  expect(new Date(res.body.until).getTime() - end.getTime()).toBeCloseTo(24 * 3600e3, -4);
});

test('a double-clicked challenge creates one duel and charges once', async () => {
  const a = await createStudent({ extra: { flameWallet: 50, flameWalletGranted: true } });
  const b = await createStudent();
  const send = () => request(app).post('/api/shop/duels').set(auth(a)).send({ toId: String(b._id), stake: 10 });
  const res = await Promise.all([send(), send()]);
  expect(res.filter(r => r.body.success)).toHaveLength(1);
  expect(res.map(r => r.body.code).filter(Boolean)).toEqual(['duel_exists']);
  expect(await Duel.countDocuments({ challengerId: a._id })).toBe(1);
  expect((await User.findById(a._id).lean()).flameWallet).toBe(40);

  // once it's over, the same pair can duel again
  const d = await Duel.findOne({ challengerId: a._id });
  const cancel = await request(app).post(`/api/shop/duels/${d._id}/cancel`).set(auth(a));
  expect(cancel.body.success).toBe(true);
  expect((await send()).body.success).toBe(true);
});

test('a blocked player can no longer cake you', async () => {
  const a = await createStudent({ extra: { flameWalletGranted: true, shopItems: { cake: 1 } } });
  const b = await createStudent();
  await Block.create({ blockerId: b._id, blockedId: a._id });
  const res = await request(app).post('/api/shop/cake').set(auth(a)).send({ targetId: String(b._id) });
  expect(res.status).toBe(403);
  expect(res.body.code).toBe('cake_blocked');
  expect((await User.findById(a._id).lean()).shopItems.cake).toBe(1); // not spent
});

test('banned accounts are off the BXH and out of 🎂 reach', async () => {
  const viewer = await createStudent({ extra: { flameWalletGranted: true, shopItems: { cake: 1 } } });
  const banned = await createStudent({ extra: { isBanned: true, learningStreak: 50, lastActivityDate: new Date() } });
  const board = await request(app).get('/api/user/streak-leaderboard').set(auth(viewer));
  expect(board.status).toBe(200);
  expect(board.body.leaderboard.map(r => String(r._id))).not.toContain(String(banned._id));
  const res = await request(app).post('/api/shop/cake').set(auth(viewer)).send({ targetId: String(banned._id) });
  expect(res.body.code).toBe('target_not_found');
});
