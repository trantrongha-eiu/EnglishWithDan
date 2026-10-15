const { createStudent } = require('../../factories/userFactory');
const User = require('../../../models/User');
const shopService = require('../../../services/shopService');
const userService = require('../../../services/userService');
const { applyStreakActivity, getVNDay } = require('../../../utils/streak');
const { HOPE_PENALTY, WALLET_SEED_CAP } = require('../../../constants/shop');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
const todayVN = () => getVNDay(new Date());
const yesterdayVN = () => new Date(todayVN().getTime() - 86400000);

describe('ví lửa — credited alongside the streak', () => {
  test('applyStreakActivity credits the wallet with the same amount as the streak', async () => {
    const user = await createStudent({ extra: { learningStreak: 3, lastActivityDate: daysAgo(1), flameWallet: 4 } });
    const updated = await applyStreakActivity(User, user._id, 2);
    expect(updated.learningStreak).toBe(5);
    expect(updated.flameWallet).toBe(6);
  });

  test('a same-day no-op credits nothing', async () => {
    const user = await createStudent({ extra: { learningStreak: 3, lastActivityDate: new Date(), flameWallet: 4 } });
    const updated = await applyStreakActivity(User, user._id, 1);
    expect(updated.flameWallet).toBe(4);
  });

  test('the launch gift seeds the wallet once, capped', async () => {
    const user = await createStudent({ extra: { learningStreak: 80, lastActivityDate: new Date() } });
    let state = await shopService.getState(user._id);
    expect(state.wallet).toBe(WALLET_SEED_CAP);
    state = await shopService.getState(user._id);
    expect(state.wallet).toBe(WALLET_SEED_CAP);
  });
});

describe('buying', () => {
  test('cannot buy without enough 🔥, can with', async () => {
    const user = await createStudent({ extra: { flameWallet: 5, flameWalletSeeded: true } });
    expect((await shopService.buyItem(user._id, 'crown')).status).toBe('not_enough');
    await User.updateOne({ _id: user._id }, { $set: { flameWallet: 100 } });
    const r = await shopService.buyItem(user._id, 'crown');
    expect(r).toMatchObject({ status: 'ok', wallet: 40, owned: 1 });
  });

  test('Khiên Băng is capped at 2', async () => {
    const user = await createStudent({ extra: { flameWallet: 100, flameWalletSeeded: true } });
    expect((await shopService.buyItem(user._id, 'iceShield')).status).toBe('ok');
    expect((await shopService.buyItem(user._id, 'iceShield')).status).toBe('ok');
    expect((await shopService.buyItem(user._id, 'iceShield')).status).toBe('max_owned');
    expect((await User.findById(user._id).lean()).flameWallet).toBe(60);
  });

  test('a first linh thú goes out walking; a second one does not replace it', async () => {
    const user = await createStudent({ extra: { flameWallet: 200, flameWalletSeeded: true } });
    expect(await shopService.buyPet(user._id, 'meo')).toMatchObject({ status: 'ok', activePet: 'meo' });
    expect(await shopService.buyPet(user._id, 'rong')).toMatchObject({ status: 'ok', activePet: 'meo', wallet: 70 });
    expect((await shopService.buyPet(user._id, 'meo')).status).toBe('already_owned');
    expect((await shopService.setActivePet(user._id, 'rong')).activePet).toBe('rong');
    expect((await shopService.setActivePet(user._id, 'cao')).status).toBe('not_owned');
  });
});

describe('Búa Hi Vọng', () => {
  test('doubles every 🔥 earned after it is used, and counts the base toward the quota', async () => {
    const user = await createStudent({ extra: { learningStreak: 10, lastActivityDate: daysAgo(1), shopItems: { hopeHammer: 1 } } });
    expect((await shopService.useItem(user._id, 'hopeHammer')).status).toBe('ok');
    let u = await applyStreakActivity(User, user._id, 2, { allowSameDayStack: true });
    expect(u.learningStreak).toBe(14);
    u = await applyStreakActivity(User, user._id, 1, { allowSameDayStack: true });
    expect(u.learningStreak).toBe(16);
    expect(u.hopeHammerBase).toBe(3);
  });

  test('cannot be used twice on the same day', async () => {
    const user = await createStudent({ extra: { shopItems: { hopeHammer: 2 } } });
    await shopService.useItem(user._id, 'hopeHammer');
    expect((await shopService.useItem(user._id, 'hopeHammer')).status).toBe('already_active');
  });

  test('settles as a win when the quota was reached — no penalty', async () => {
    const user = await createStudent({ extra: { learningStreak: 20, lastActivityDate: yesterdayVN(), hopeHammerDay: yesterdayVN(), hopeHammerBase: 3 } });
    expect(await shopService.settleHopeHammer(user._id)).toEqual({ success: true, penalty: 0 });
    const u = await User.findById(user._id).lean();
    expect(u.learningStreak).toBe(20);
    expect(u.hopeHammerDay).toBeNull();
    expect(u.hopeHammerLast.success).toBe(true);
  });

  test('settles as a loss when the quota was missed — streak loses the penalty, floored at 0', async () => {
    const user = await createStudent({ extra: { learningStreak: 25, lastActivityDate: yesterdayVN(), hopeHammerDay: yesterdayVN(), hopeHammerBase: 2 } });
    await shopService.settleHopeHammer(user._id);
    expect((await User.findById(user._id).lean()).learningStreak).toBe(25 - HOPE_PENALTY);

    const poor = await createStudent({ extra: { learningStreak: 4, lastActivityDate: yesterdayVN(), hopeHammerDay: yesterdayVN(), hopeHammerBase: 0 } });
    await shopService.settleAllHopeHammers();
    expect((await User.findById(poor._id).lean()).learningStreak).toBe(0);
  });

  test('today\'s bet is not settled early', async () => {
    const user = await createStudent({ extra: { learningStreak: 20, hopeHammerDay: todayVN(), hopeHammerBase: 0 } });
    expect(await shopService.settleHopeHammer(user._id)).toBeNull();
    expect((await User.findById(user._id).lean()).learningStreak).toBe(20);
  });
});

describe('Khiên Băng', () => {
  test('covers one missed day: studying today continues the streak and spends a shield', async () => {
    const user = await createStudent({ extra: { learningStreak: 12, lastActivityDate: daysAgo(2), shopItems: { iceShield: 1 } } });
    const u = await applyStreakActivity(User, user._id, 1);
    expect(u.learningStreak).toBe(13);
    expect(u.shopItems.iceShield).toBe(0);
  });

  test('cannot cover a gap longer than the shields held', async () => {
    const user = await createStudent({ extra: { learningStreak: 12, lastActivityDate: daysAgo(3), shopItems: { iceShield: 1 } } });
    const u = await applyStreakActivity(User, user._id, 1);
    expect(u.learningStreak).toBe(1);
    expect(u.shopItems.iceShield).toBe(1);
  });

  test('getStats keeps a shielded streak alive instead of resetting it', async () => {
    const user = await createStudent({ extra: { learningStreak: 9, lastActivityDate: daysAgo(2), shopItems: { iceShield: 2 } } });
    const stats = await userService.getStats(user._id);
    expect(stats.streak).toBe(9);
    expect((await User.findById(user._id).lean()).shopItems.iceShield).toBe(1);
  });
});

describe('BXH decorations', () => {
  test('Áo Tàng Hình hides the number from others but not from the wearer', async () => {
    const sneaky = await createStudent({ extra: { learningStreak: 30, lastActivityDate: new Date(), shopItems: { cloak: 1 }, activePet: 'cao' } });
    const other = await createStudent({ extra: { learningStreak: 5, lastActivityDate: new Date() } });
    await shopService.useItem(sneaky._id, 'cloak');

    const seenByOther = await userService.getStreakStanding(other._id, 10);
    const row = seenByOther.leaderboard.find(r => String(r._id) === String(sneaky._id));
    expect(row).toMatchObject({ streak: null, hidden: true, pet: 'cao' });
    expect(seenByOther.leaderboard[0]._id).toEqual(sneaky._id); // still ranked by the real number
    expect(seenByOther.me.nextStreak).toBeNull();

    const seenBySelf = await userService.getStreakStanding(sneaky._id, 10);
    expect(seenBySelf.me.streak).toBe(30);
  });

  test('a cake lands on another student once per 24h and is refunded otherwise', async () => {
    const a = await createStudent({ extra: { firstName: 'An', lastName: '', shopItems: { cake: 2 } } });
    const b = await createStudent();
    expect((await shopService.throwCake(a._id, a._id)).status).toBe('invalid_target');
    expect((await shopService.throwCake(a._id, b._id)).status).toBe('ok');
    expect((await shopService.throwCake(a._id, b._id)).status).toBe('already_caked');
    expect((await User.findById(a._id).lean()).shopItems.cake).toBe(1);
    expect((await User.findById(b._id).lean()).cakedBy).toBe('An');
  });

  test('a crown stacks its 7 days on top of a running one', async () => {
    const user = await createStudent({ extra: { shopItems: { crown: 2 } } });
    const first = await shopService.useItem(user._id, 'crown');
    const second = await shopService.useItem(user._id, 'crown');
    const days = (new Date(second.until) - new Date(first.until)) / 86400000;
    expect(Math.round(days)).toBe(7);
  });
});
