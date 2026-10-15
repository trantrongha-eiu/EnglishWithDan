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
    const s = await createStudent({ extra: { flameWallet: 12, flameWalletSeeded: true } });
    const res = await request(app).get('/api/shop').set(auth(s));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, wallet: 12, activePet: '' });
    expect(res.body.items.map(i => i.key)).toEqual(['hopeHammer', 'iceShield', 'cake', 'cloak', 'crown']);
    expect(res.body.pets).toHaveLength(5);
  });

  test('buy → use flow, with the error codes the page shows', async () => {
    const s = await createStudent({ extra: { flameWallet: 30, flameWalletSeeded: true } });
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
    const s = await createStudent({ extra: { flameWallet: 40, flameWalletSeeded: true } });
    let res = await request(app).post('/api/shop/buy').set(auth(s)).send({ kind: 'pet', key: 'meo' });
    expect(res.body).toMatchObject({ success: true, activePet: 'meo', wallet: 10 });
    expect((await request(app).get('/api/shop/pet').set(auth(s))).body.activePet).toBe('meo');
    res = await request(app).put('/api/shop/pet').set(auth(s)).send({ petId: '' });
    expect(res.body.activePet).toBe('');
    res = await request(app).put('/api/shop/pet').set(auth(s)).send({ petId: 'rong' });
    expect(res.body.code).toBe('not_owned');
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
