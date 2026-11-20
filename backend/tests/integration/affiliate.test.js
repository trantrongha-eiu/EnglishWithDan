// Affiliate / referral program — services/affiliateService.js, routes/affiliate.js,
// routes/admin/affiliate.js, and the commission hooks in routes/admin/premium.js
// (Premium approval) and tuitionService.updateFee/deleteFee (tuition paid).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createUpgradeRequest, createTuitionFee } = require('../factories/contentFactory');
const User = require('../../models/User');
const Message = require('../../models/Message');
const AffiliateCommission = require('../../models/AffiliateCommission');
const AffiliateSettings = require('../../models/AffiliateSettings');
const TuitionFee = require('../../models/TuitionFee');
const affiliateService = require('../../services/affiliateService');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });

async function codeOf(user) {
  const res = await request(app).get('/api/affiliate/me').set(bearer(user));
  expect(res.status).toBe(200);
  return res.body.code;
}

// referrer + a fresh student tied to them through the claim endpoint
async function referredPair() {
  const referrer = await createStudent();
  const buyer = await createStudent();
  const code = await codeOf(referrer);
  const claim = await request(app).post('/api/affiliate/claim').set(bearer(buyer)).send({ code });
  expect(claim.body.status).toBe('ok');
  return { referrer, buyer, code };
}

describe('referral link + claim', () => {
  test('GET /info shows the current terms without logging in', async () => {
    await AffiliateSettings.getSingleton();
    await AffiliateSettings.updateMany({}, { $set: { premiumPercent: 12, minPayout: 200000 } });
    const res = await request(app).get('/api/affiliate/info');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, enabled: true, premiumPercent: 12, percent: 12, tuitionCash: 200000, tuitionCredit: 300000, minPayout: 200000 });
  });

  test('GET /me creates one stable code per account', async () => {
    const u = await createStudent();
    const a = await codeOf(u);
    const b = await codeOf(u);
    expect(a).toMatch(/^[A-Z0-9]{7}$/);
    expect(b).toBe(a);
  });

  test('a new account is tied to the referrer once; later claims do not move it', async () => {
    const { referrer, buyer } = await referredPair();
    const other = await createStudent();
    const otherCode = await codeOf(other);

    const again = await request(app).post('/api/affiliate/claim').set(bearer(buyer)).send({ code: otherCode });
    expect(again.body.status).toBe('already_referred');
    const fresh = await User.findById(buyer._id);
    expect(String(fresh.referredBy)).toBe(String(referrer._id));
  });

  test('rejects own code, unknown code, old accounts and A↔B cycles', async () => {
    const a = await createStudent();
    const codeA = await codeOf(a);
    expect((await request(app).post('/api/affiliate/claim').set(bearer(a)).send({ code: codeA })).body.status).toBe('self');
    expect((await request(app).post('/api/affiliate/claim').set(bearer(a)).send({ code: 'ZZZZZZZ' })).body.status).toBe('invalid_code');

    const old = await createStudent();
    // createdAt is immutable through Mongoose — write it on the raw collection
    await User.collection.updateOne({ _id: old._id }, { $set: { createdAt: new Date(Date.now() - 30 * 86400000) } });
    expect((await request(app).post('/api/affiliate/claim').set(bearer(old)).send({ code: codeA })).body.status).toBe('too_old');

    // b joined through a; a must not then join through b
    const b = await createStudent();
    expect((await request(app).post('/api/affiliate/claim').set(bearer(b)).send({ code: codeA })).body.status).toBe('ok');
    await User.updateOne({ _id: a._id }, { $set: { referredBy: null } });
    const codeB = await codeOf(b);
    expect((await request(app).post('/api/affiliate/claim').set(bearer(a)).send({ code: codeB })).body.status).toBe('cycle');
  });

  test('click beacon counts on the referrer', async () => {
    const u = await createStudent();
    const code = await codeOf(u);
    expect((await request(app).post('/api/affiliate/click').send({ code: code.toLowerCase() })).status).toBe(204);
    expect((await User.findById(u._id)).referralClicks).toBe(1);
  });

  test('sign-up with a code fills referredBy (registerUser path)', async () => {
    const u = await createStudent();
    const code = await codeOf(u);
    const fields = await affiliateService.referralFieldsForSignup(code);
    expect(String(fields.referredBy)).toBe(String(u._id));
    expect(await affiliateService.referralFieldsForSignup('NOPE123')).toEqual({});
  });
});

describe('commissions', () => {
  test('approving a referred buyer\'s Premium request pays the referrer the set % and messages them', async () => {
    const admin = await createAdmin();
    const { referrer, buyer } = await referredPair();
    const ur = await createUpgradeRequest({ userId: buyer._id, months: 3, amount: 250000 });

    const res = await request(app).put(`/api/admin/upgrade-requests/${ur._id}/approve`).set(bearer(admin)).send({});
    expect(res.status).toBe(200);

    const c = await AffiliateCommission.findOne({ source: 'premium', sourceId: ur._id });
    expect(c.referrerId.toString()).toBe(referrer._id.toString());
    expect(c.percent).toBe(20);
    expect(c.amount).toBe(50000);
    expect(await Message.countDocuments({ toId: referrer._id })).toBe(1);

    const me = await request(app).get('/api/affiliate/me').set(bearer(referrer));
    expect(me.body.stats).toMatchObject({ signups: 1, buyers: 1, earned: 50000, balance: 50000 });
    expect(me.body.referrals[0].name).toMatch(/\*\*\*$/);
  });

  test('a non-referred buyer earns nobody anything', async () => {
    const admin = await createAdmin();
    const buyer = await createStudent();
    const ur = await createUpgradeRequest({ userId: buyer._id });
    await request(app).put(`/api/admin/upgrade-requests/${ur._id}/approve`).set(bearer(admin)).send({});
    expect(await AffiliateCommission.countDocuments({})).toBe(0);
  });

  test('admin-set % applies to new commissions only; disabled program earns nothing', async () => {
    const admin = await createAdmin();
    const { buyer } = await referredPair();
    const put = await request(app).put('/api/admin/affiliate/settings').set(bearer(admin)).send({ premiumPercent: 15, tuitionCash: 250000, tuitionCredit: 350000 });
    expect(put.body.settings).toMatchObject({ premiumPercent: 15, percent: 15, tuitionCash: 250000, tuitionCredit: 350000 });

    const ur = await createUpgradeRequest({ userId: buyer._id, months: 1, amount: 90000 });
    await request(app).put(`/api/admin/upgrade-requests/${ur._id}/approve`).set(bearer(admin)).send({});
    expect((await AffiliateCommission.findOne({ sourceId: ur._id })).amount).toBe(13500);
    // the old field name still sets the Premium rate
    expect((await request(app).put('/api/admin/affiliate/settings').set(bearer(admin)).send({ percent: 20 })).body.settings.premiumPercent).toBe(20);

    await request(app).put('/api/admin/affiliate/settings').set(bearer(admin)).send({ enabled: false });
    const ur2 = await createUpgradeRequest({ userId: buyer._id, months: 1, amount: 90000 });
    await request(app).put(`/api/admin/upgrade-requests/${ur2._id}/approve`).set(bearer(admin)).send({});
    expect(await AffiliateCommission.exists({ sourceId: ur2._id })).toBeNull();
    expect((await request(app).put('/api/admin/affiliate/settings').set(bearer(admin)).send({ percent: 150 })).status).toBe(400);
  });

  test('tuition: first paid fee = one reward waiting for a choice; later fees add nothing', async () => {
    const admin = await createAdmin();
    const { referrer, buyer } = await referredPair();
    const fee = await createTuitionFee({ studentId: buyer._id, month: 5, year: 2026, amount: 1000000 });
    const fee2 = await createTuitionFee({ studentId: buyer._id, month: 6, year: 2026, amount: 1000000 });
    const put = (f, body) => request(app).put(`/api/tuition/${f._id}`).set(bearer(admin)).send(body);
    const reward = () => AffiliateCommission.findOne({ referredUserId: buyer._id, kind: 'tuition_flat' });

    expect((await put(fee, { isPaid: true })).status).toBe(200);
    expect((await reward()).toObject()).toMatchObject({ status: 'awaiting_choice', amount: 0, cashAmount: 200000, creditAmount: 300000 });
    const msg = await Message.findOne({ toId: referrer._id, subject: /chọn phần thưởng/ });
    expect(msg.body).toContain('200.000đ');
    expect(msg.body).toContain('300.000đ');

    await put(fee2, { isPaid: true });
    expect(await AffiliateCommission.countDocuments({ referredUserId: buyer._id })).toBe(1);

    const me = (await request(app).get('/api/affiliate/me').set(bearer(referrer))).body;
    expect(me.stats).toMatchObject({ awaiting: 1, balance: 0, buyers: 1 });
    expect(me.commissions[0]).toMatchObject({ kind: 'tuition_flat', status: 'awaiting_choice', cashAmount: 200000 });

    // fee 1 un-marked: the reward moves to fee 2 (still paid); both gone → cancelled
    await put(fee, { isPaid: false });
    expect((await reward()).toObject()).toMatchObject({ status: 'awaiting_choice', sourceId: fee2._id });
    await request(app).delete(`/api/tuition/${fee2._id}`).set(bearer(admin));
    expect((await reward()).status).toBe('cancelled');
    // paid again → back, waiting for a choice
    await put(fee, { isPaid: true });
    expect((await reward()).toObject()).toMatchObject({ status: 'awaiting_choice', sourceId: fee._id });
  });

  test('tuition reward as cash: 200k into the wallet, chosen once, only by the referrer', async () => {
    const admin = await createAdmin();
    const { referrer, buyer } = await referredPair();
    const fee = await createTuitionFee({ studentId: buyer._id, month: 5, year: 2026, amount: 1000000 });
    await request(app).put(`/api/tuition/${fee._id}`).set(bearer(admin)).send({ isPaid: true });
    const id = (await AffiliateCommission.findOne({ referredUserId: buyer._id }))._id;
    const choose = (u, choice) => request(app).post(`/api/affiliate/rewards/${id}/choose`).set(bearer(u)).send({ choice });

    expect((await choose(buyer, 'cash')).status).toBe(404);
    expect((await choose(referrer, 'gold')).status).toBe(400);
    const ok = await choose(referrer, 'cash');
    expect(ok.status).toBe(200);
    expect(ok.body.reward).toMatchObject({ status: 'earned', rewardChoice: 'cash', amount: 200000 });
    expect((await choose(referrer, 'credit')).status).toBe(400);
    expect(await affiliateService.getTotals(referrer._id)).toMatchObject({ earned: 200000, balance: 200000, awaiting: 0 });
  });

  test('tuition reward as credit: 300k off the oldest unpaid fee, or the next fee created', async () => {
    const admin = await createAdmin();
    const { referrer, buyer } = await referredPair();
    const f = await createTuitionFee({ studentId: buyer._id, month: 5, year: 2026, amount: 1000000 });
    await request(app).put(`/api/tuition/${f._id}`).set(bearer(admin)).send({ isPaid: true });
    const id = (await AffiliateCommission.findOne({ referredUserId: buyer._id }))._id;

    // The referrer has no unpaid fee yet → the credit waits
    const ok = await request(app).post(`/api/affiliate/rewards/${id}/choose`).set(bearer(referrer)).send({ choice: 'credit' });
    expect(ok.body.reward).toMatchObject({ status: 'earned', rewardChoice: 'credit', amount: 0, creditFeeId: null });
    expect(await affiliateService.getTotals(referrer._id)).toMatchObject({ balance: 0, credited: 300000 });

    // Admin enters 2 months for the referrer: the first one gets the discount
    const made = await request(app).post('/api/tuition').set(bearer(admin))
      .send({ studentId: String(referrer._id), feeType: 'monthly', month: 7, year: 2026, monthCount: 2, amount: 1500000 });
    expect(made.status).toBe(201);
    expect(made.body.fees.map((x) => x.amount)).toEqual([1200000, 1500000]);
    expect(made.body.fees[0].note).toMatch(/Giảm 300\.000đ – thưởng giới thiệu/);
    expect(String((await AffiliateCommission.findById(id)).creditFeeId)).toBe(String(made.body.fees[0]._id));
    const me = (await request(app).get('/api/affiliate/me').set(bearer(referrer))).body;
    expect(me.commissions[0].creditFee).toBe('học phí tháng 7/2026');

    // That fee deleted while unpaid → the discount moves to the next one
    await request(app).delete(`/api/tuition/${made.body.fees[0]._id}`).set(bearer(admin));
    expect((await TuitionFee.findById(made.body.fees[1]._id)).amount).toBe(1200000);

    // Admin cancels the reward → the unpaid fee gets its 300k back, note cleaned
    await request(app).put(`/api/admin/affiliate/commissions/${id}/cancel`).set(bearer(admin)).send({ reason: 'test' });
    const back = await TuitionFee.findById(made.body.fees[1]._id);
    expect(back.amount).toBe(1500000);
    expect(back.note).not.toMatch(/thưởng giới thiệu/);
  });

  test('a credit choice goes straight onto an unpaid fee the referrer already has', async () => {
    const admin = await createAdmin();
    const { referrer, buyer } = await referredPair();
    const mine = await createTuitionFee({ studentId: referrer._id, feeType: 'course', courseName: 'IELTS 5.0', amount: 4000000, note: 'Khóa tháng 12' });
    const f = await createTuitionFee({ studentId: buyer._id, month: 5, year: 2026, amount: 1000000 });
    await request(app).put(`/api/tuition/${f._id}`).set(bearer(admin)).send({ isPaid: true });
    const id = (await AffiliateCommission.findOne({ referredUserId: buyer._id }))._id;
    await request(app).post(`/api/affiliate/rewards/${id}/choose`).set(bearer(referrer)).send({ choice: 'credit' });
    const after = await TuitionFee.findById(mine._id);
    expect(after.amount).toBe(3700000);
    expect(after.note).toMatch(/^Khóa tháng 12 · Giảm 300\.000đ/);
  });
});

describe('payouts', () => {
  // Premium pays 20%: a package of 5× the amount
  async function referrerWithBalance(amount) {
    const admin = await createAdmin();
    const { referrer, buyer } = await referredPair();
    const ur = await createUpgradeRequest({ userId: buyer._id, months: 12, amount: amount * 5 });
    await request(app).put(`/api/admin/upgrade-requests/${ur._id}/approve`).set(bearer(admin)).send({});
    return { admin, referrer };
  }
  const bank = { bankName: 'Vietcombank', bankAccount: '0123456789', accountName: 'NGUYEN VAN A' };

  test('min payout, balance cap, one pending at a time; paid keeps it spent, reject refunds', async () => {
    await AffiliateSettings.getSingleton();
    const { admin, referrer } = await referrerWithBalance(300000);
    const ask = (amount) => request(app).post('/api/affiliate/payouts').set(bearer(referrer)).send({ ...bank, amount });

    expect((await ask(50000)).status).toBe(400);   // below the 100k minimum
    expect((await ask(400000)).status).toBe(400);  // more than the balance
    const ok = await ask(200000);
    expect(ok.status).toBe(201);
    expect((await ask(100000)).status).toBe(400);  // one pending at a time

    let me = (await request(app).get('/api/affiliate/me').set(bearer(referrer))).body;
    expect(me.stats).toMatchObject({ earned: 300000, pending: 200000, balance: 100000 });
    expect(me.bank.bankAccount).toBe('0123456789');

    const id = ok.body.payout._id;
    expect((await request(app).put(`/api/admin/affiliate/payouts/${id}/reject`).set(bearer(admin)).send({ adminNote: 'Sai STK' })).status).toBe(200);
    me = (await request(app).get('/api/affiliate/me').set(bearer(referrer))).body;
    expect(me.stats.balance).toBe(300000);

    const again = await ask(300000);
    expect(again.status).toBe(201);
    expect((await request(app).put(`/api/admin/affiliate/payouts/${again.body.payout._id}/paid`).set(bearer(admin)).send({})).status).toBe(200);
    expect((await request(app).put(`/api/admin/affiliate/payouts/${again.body.payout._id}/paid`).set(bearer(admin)).send({})).status).toBe(400);
    me = (await request(app).get('/api/affiliate/me').set(bearer(referrer))).body;
    expect(me.stats).toMatchObject({ paid: 300000, balance: 0 });
  });

  test('bank QR: upload, payout with only a QR, replace keeps an image a payout still shows, delete', async () => {
    const mediaStore = require('../../services/mediaStore');
    let n = 0;
    const up = jest.spyOn(mediaStore, 'uploadImage').mockImplementation(async () => ({ url: `https://r2.test/qr${++n}.png`, publicId: `qr${n}` }));
    const del = jest.spyOn(mediaStore, 'destroy').mockResolvedValue();
    try {
      const { admin, referrer } = await referrerWithBalance(200000);
      const png = Buffer.from('89504e470d0a1a0a', 'hex');

      // wrong type is refused before any upload
      const bad = await request(app).post('/api/affiliate/bank-qr').set(bearer(referrer)).attach('qr', Buffer.from('x'), { filename: 'a.txt', contentType: 'text/plain' });
      expect(bad.status).toBe(400);
      expect(up).not.toHaveBeenCalled();

      // no QR and no typed bank → refused
      expect((await request(app).post('/api/affiliate/payouts').set(bearer(referrer)).send({ amount: 100000 })).status).toBe(400);

      const ok = await request(app).post('/api/affiliate/bank-qr').set(bearer(referrer)).attach('qr', png, { filename: 'qr.png', contentType: 'image/png' });
      expect(ok.status).toBe(200);
      expect(ok.body.qrImageUrl).toBe('https://r2.test/qr1.png');

      const pay = await request(app).post('/api/affiliate/payouts').set(bearer(referrer)).send({ amount: 100000 });
      expect(pay.status).toBe(201);
      expect(pay.body.payout.qrImageUrl).toBe('https://r2.test/qr1.png');

      // the payout still shows qr1 → replacing it must not delete the file
      await request(app).post('/api/affiliate/bank-qr').set(bearer(referrer)).attach('qr', png, { filename: 'qr.png', contentType: 'image/png' });
      expect(del).not.toHaveBeenCalled();
      // qr2 is used by nothing → deleting it removes the file
      expect((await request(app).delete('/api/affiliate/bank-qr').set(bearer(referrer))).status).toBe(200);
      expect(del).toHaveBeenCalledWith({ url: 'https://r2.test/qr2.png', publicId: 'qr2' });

      const me = (await request(app).get('/api/affiliate/me').set(bearer(referrer))).body;
      expect(me.bank.qrImageUrl).toBe('');
      expect(me.payouts[0].qrImageUrl).toBe('https://r2.test/qr1.png');

      const list = (await request(app).get('/api/admin/affiliate/payouts?status=pending').set(bearer(admin))).body;
      expect(list.items[0].qrImageUrl).toBe('https://r2.test/qr1.png');
      const paid = await request(app).put(`/api/admin/affiliate/payouts/${list.items[0]._id}/paid`).set(bearer(admin)).send({});
      expect(paid.status).toBe(200);
      const msg = await Message.findOne({ toId: referrer._id, subject: /Đã chuyển/ });
      expect(msg.body).toContain('mã QR');
    } finally {
      up.mockRestore();
      del.mockRestore();
    }
  });

  test('admin endpoints are admin-only', async () => {
    const s = await createStudent();
    expect((await request(app).get('/api/admin/affiliate/overview').set(bearer(s))).status).toBe(403);
  });

  test('admin overview, referrers and commission list', async () => {
    const { admin, referrer } = await referrerWithBalance(150000);
    const ov = (await request(app).get('/api/admin/affiliate/overview').set(bearer(admin))).body;
    expect(ov.stats).toMatchObject({ referredUsers: 1, commissionTotal: 150000, owed: 150000 });
    const refs = (await request(app).get('/api/admin/affiliate/referrers').set(bearer(admin))).body.items;
    expect(String(refs[0]._id)).toBe(String(referrer._id));
    const list = (await request(app).get('/api/admin/affiliate/commissions').set(bearer(admin))).body;
    expect(list.total).toBe(1);
    const cancel = await request(app).put(`/api/admin/affiliate/commissions/${list.items[0]._id}/cancel`).set(bearer(admin)).send({ reason: 'test' });
    expect(cancel.status).toBe(200);
    expect((await affiliateService.getTotals(referrer._id)).balance).toBe(0);
  });
});
