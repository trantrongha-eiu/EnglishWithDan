const { createStudent } = require('../../factories/userFactory');
const User = require('../../../models/User');
const Duel = require('../../../models/Duel');
const ShopPurchase = require('../../../models/ShopPurchase');
const VocabActivity = require('../../../models/VocabActivity');
const duelService = require('../../../services/duelService');
const { getVNDay } = require('../../../utils/streak');

const DAY = 86400000;
const today = () => getVNDay(new Date());
const player = (wallet = 100) => createStudent({ extra: { flameWallet: wallet, flameWalletGranted: true } });
const wallet = async (u) => (await User.findById(u._id).lean()).flameWallet;
const earn = (userId, date, n) => VocabActivity.updateOne({ userId, date }, { $set: { streakBonusEarned: n } }, { upsert: true });

describe('⚔️ Thách đấu', () => {
  test('challenge takes the stake; decline refunds it', async () => {
    const a = await player(); const b = await player();
    const r = await duelService.challenge(a._id, String(b._id), 20);
    expect(r).toMatchObject({ status: 'ok', wallet: 80 });
    const list = await duelService.listDuels(b._id);
    expect(list.open).toHaveLength(1);
    expect(list.open[0]).toMatchObject({ status: 'pending', role: 'opponent', stake: 20, pot: 40 });

    expect((await duelService.respond(b._id, list.open[0].id, false)).status).toBe('ok');
    expect(await wallet(a)).toBe(100);
    // Answered — can't be accepted any more.
    expect((await duelService.respond(b._id, list.open[0].id, true)).status).toBe('duel_gone');
  });

  test('rules: stake range, self, enough 🔥, one open duel per pair', async () => {
    const a = await player(10); const b = await player();
    expect((await duelService.challenge(a._id, String(b._id), 2)).status).toBe('duel_stake');
    expect((await duelService.challenge(a._id, String(b._id), 101)).status).toBe('duel_stake');
    expect((await duelService.challenge(a._id, String(a._id), 5)).status).toBe('duel_self');
    expect((await duelService.challenge(a._id, String(b._id), 20)).status).toBe('not_enough');
    expect((await duelService.challenge(a._id, String(b._id), 5)).status).toBe('ok');
    expect((await duelService.challenge(b._id, String(a._id), 5)).status).toBe('duel_exists');
  });

  test('accepting needs the stake too; the more 🔥 earned takes the pot', async () => {
    const a = await player(); const b = await player(10);
    await earn(a._id, today(), 4); // earned before the duel — doesn't count
    const { duel } = await duelService.challenge(a._id, String(b._id), 30);
    expect((await duelService.respond(b._id, duel.id, true)).status).toBe('not_enough');
    await User.updateOne({ _id: b._id }, { $set: { flameWallet: 30 } });
    expect((await duelService.respond(b._id, duel.id, true))).toMatchObject({ status: 'ok', wallet: 0 });

    await earn(a._id, today(), 7);  // +3 during the duel
    await earn(b._id, today(), 5);  // +5
    const live = (await duelService.listDuels(a._id)).open[0];
    expect(live).toMatchObject({ status: 'active', myScore: 3, rivalScore: 5 });

    // Push the duel's window into the past and settle.
    const d = await Duel.findById(duel.id);
    await Duel.updateOne({ _id: d._id }, { $set: { startDay: new Date(today() - 2 * DAY), endDay: new Date(today() - DAY) } });
    await VocabActivity.updateMany({ date: today() }, { $set: { date: new Date(today() - 2 * DAY) } });
    await earn(b._id, new Date(today() - DAY), 2);
    expect(await duelService.settleDue()).toBe(1);

    const done = await Duel.findById(duel.id).lean();
    expect(done).toMatchObject({ status: 'done', scoreC: 3, scoreO: 7 });
    expect(String(done.winnerId)).toBe(String(b._id));
    expect(await wallet(b)).toBe(60);
    expect(await wallet(a)).toBe(70);
    expect(await ShopPurchase.countDocuments({ kind: 'duel' })).toBe(1);
    // Settled once only.
    expect(await duelService.settleDue()).toBe(0);
    expect(await wallet(b)).toBe(60);
    expect((await duelService.listDuels(a._id)).recent[0]).toMatchObject({ result: 'lose' });
  });

  test('a tie refunds both', async () => {
    const a = await player(); const b = await player();
    const { duel } = await duelService.challenge(a._id, String(b._id), 10);
    await duelService.respond(b._id, duel.id, true);
    await Duel.updateOne({ _id: duel.id }, { $set: { startDay: new Date(today() - 2 * DAY), endDay: new Date(today() - DAY) } });
    await duelService.settleDue();
    expect(await wallet(a)).toBe(100);
    expect(await wallet(b)).toBe(100);
    expect((await Duel.findById(duel.id).lean()).winnerId).toBeNull();
  });

  test('an unanswered challenge expires and refunds; cancel refunds too', async () => {
    const a = await player(); const b = await player(); const c = await player();
    const { duel } = await duelService.challenge(a._id, String(b._id), 15);
    await Duel.updateOne({ _id: duel.id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    await duelService.settleDue();
    expect((await Duel.findById(duel.id).lean()).status).toBe('expired');
    expect(await wallet(a)).toBe(100);

    const second = await duelService.challenge(a._id, String(c._id), 15);
    expect((await duelService.cancel(c._id, second.duel.id)).status).toBe('duel_gone'); // only the challenger cancels
    expect((await duelService.cancel(a._id, second.duel.id))).toMatchObject({ status: 'ok', wallet: 100 });
  });
});
