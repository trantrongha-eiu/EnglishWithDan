const { createStudent } = require('../../factories/userFactory');
const User = require('../../../models/User');
const shopService = require('../../../services/shopService');
const userService = require('../../../services/userService');
const { applyStreakActivity, getVNDay } = require('../../../utils/streak');
const { HOPE_PENALTY } = require('../../../constants/shop');

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

  test('the starting grant fills the wallet up to the current streak, once', async () => {
    const user = await createStudent({ extra: { learningStreak: 80, lastActivityDate: new Date() } });
    let state = await shopService.getState(user._id);
    expect(state.wallet).toBe(80);
    await User.updateOne({ _id: user._id }, { $set: { learningStreak: 90 } });
    state = await shopService.getState(user._id);
    expect(state.wallet).toBe(80);
  });

  test('an old capped launch gift is topped up to the streak; a bigger wallet is kept', async () => {
    const capped = await createStudent({ extra: { learningStreak: 1001, lastActivityDate: new Date(), flameWallet: 0, flameWalletSeeded: true } });
    expect((await shopService.getState(capped._id)).wallet).toBe(1001);
    const rich = await createStudent({ extra: { learningStreak: 10, lastActivityDate: new Date(), flameWallet: 70, flameWalletSeeded: true } });
    expect((await shopService.getState(rich._id)).wallet).toBe(70);
  });

  test('a lost streak grants nothing', async () => {
    const user = await createStudent({ extra: { learningStreak: 40, lastActivityDate: daysAgo(5) } });
    expect((await shopService.getState(user._id)).wallet).toBe(0);
  });
});

describe('buying', () => {
  test('cannot buy without enough 🔥, can with', async () => {
    const user = await createStudent({ extra: { flameWallet: 5, flameWalletGranted: true } });
    expect((await shopService.buyItem(user._id, 'crown')).status).toBe('not_enough');
    await User.updateOne({ _id: user._id }, { $set: { flameWallet: 100 } });
    const r = await shopService.buyItem(user._id, 'crown');
    expect(r).toMatchObject({ status: 'ok', wallet: 40, owned: 1 });
  });

  test('Búa Daniel goes into streakHammers (stacks with earned ones) and cannot be sold', async () => {
    const user = await createStudent({ extra: { flameWallet: 120, flameWalletGranted: true, streakHammers: 1 } });
    expect(await shopService.buyItem(user._id, 'danielHammer', 2)).toMatchObject({ status: 'ok', wallet: 20, owned: 3 });
    const u = await User.findById(user._id).lean();
    expect(u.streakHammers).toBe(3);
    expect((u.shopItems || {}).danielHammer).toBeUndefined();
    const state = await shopService.getState(user._id);
    expect(state.danielHammer.count).toBe(3);
    expect(state.items.find(i => i.key === 'danielHammer').owned).toBe(3);
    expect((await shopService.sellItem(user._id, 'danielHammer')).status).toBe('not_sellable');
    expect((await User.findById(user._id).lean()).streakHammers).toBe(3);
  });

  test('Khiên Băng is capped at 2', async () => {
    const user = await createStudent({ extra: { flameWallet: 100, flameWalletGranted: true } });
    expect((await shopService.buyItem(user._id, 'iceShield')).status).toBe('ok');
    expect((await shopService.buyItem(user._id, 'iceShield')).status).toBe('ok');
    expect((await shopService.buyItem(user._id, 'iceShield')).status).toBe('max_owned');
    expect((await User.findById(user._id).lean()).flameWallet).toBe(60);
  });

  test('buys several at once, all or nothing', async () => {
    const user = await createStudent({ extra: { flameWallet: 35, flameWalletGranted: true } });
    expect(await shopService.buyItem(user._id, 'cake', 3)).toMatchObject({ status: 'ok', wallet: 5, owned: 3, qty: 3 });
    expect((await shopService.buyItem(user._id, 'cake', 2)).status).toBe('not_enough');
    expect((await shopService.buyItem(user._id, 'cake', 0)).status).toBe('invalid_qty');
    expect((await shopService.buyItem(user._id, 'cake', 1.5)).status).toBe('invalid_qty');
    expect((await User.findById(user._id).lean()).shopItems.cake).toBe(3);
  });

  test('a multi-buy cannot push Khiên Băng past its cap', async () => {
    const user = await createStudent({ extra: { flameWallet: 100, flameWalletGranted: true } });
    expect((await shopService.buyItem(user._id, 'iceShield', 3)).status).toBe('max_owned');
    expect((await shopService.buyItem(user._id, 'iceShield', 1)).status).toBe('ok');
    expect(await shopService.buyItem(user._id, 'iceShield', 2)).toMatchObject({ status: 'max_owned', left: 1 });
    expect(await shopService.buyItem(user._id, 'iceShield', 1)).toMatchObject({ status: 'ok', owned: 2, wallet: 60 });
  });

  test('a first linh thú goes out walking;a second one does not replace it', async () => {
    const user = await createStudent({ extra: { flameWallet: 200, flameWalletGranted: true } });
    expect(await shopService.buyPet(user._id, 'meo')).toMatchObject({ status: 'ok', activePet: 'meo' });
    expect(await shopService.buyPet(user._id, 'rong')).toMatchObject({ status: 'ok', activePet: 'meo', wallet: 140 });
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

  test('is refused (and kept) once the daily 🔥 cap leaves less than the quota', async () => {
    const VocabActivity = require('../../../models/VocabActivity');
    const user = await createStudent({ extra: { shopItems: { hopeHammer: 1 } } });
    await VocabActivity.create({ userId: user._id, date: todayVN(), streakBonusEarned: 3 });
    expect(await shopService.useItem(user._id, 'hopeHammer')).toMatchObject({ status: 'hope_too_late', left: 2 });
    const u = await User.findById(user._id).lean();
    expect(u.shopItems.hopeHammer).toBe(1);
    expect(u.hopeHammerDay).toBeNull();

    await VocabActivity.updateOne({ userId: user._id, date: todayVN() }, { $set: { streakBonusEarned: 2 } });
    expect((await shopService.useItem(user._id, 'hopeHammer')).status).toBe('ok');
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

  test('a shield bought after the streak is already lost does not revive it (Búa Daniel still can)', async () => {
    const user = await createStudent({ extra: { learningStreak: 15, lastActivityDate: daysAgo(2), flameWallet: 50, flameWalletGranted: true } });
    expect((await shopService.buyItem(user._id, 'iceShield')).status).toBe('ok');
    const state = await shopService.getState(user._id);
    expect(state.streak).toBe(0);
    const u = await User.findById(user._id).lean();
    expect(u).toMatchObject({ learningStreak: 0, previousStreak: 15 });
    expect(u.shopItems.iceShield).toBe(1);
    expect(state.danielHammer.previousStreak).toBe(15);
  });

  test('buying a shield leaves a live streak (or one the held shields cover) alone', async () => {
    const alive = await createStudent({ extra: { learningStreak: 7, lastActivityDate: daysAgo(1), flameWallet: 50, flameWalletGranted: true } });
    await shopService.buyItem(alive._id, 'iceShield');
    expect((await User.findById(alive._id).lean()).learningStreak).toBe(7);

    const covered = await createStudent({ extra: { learningStreak: 7, lastActivityDate: daysAgo(2), flameWallet: 50, flameWalletGranted: true, shopItems: { iceShield: 1 } } });
    await shopService.buyItem(covered._id, 'iceShield');
    const c = await User.findById(covered._id).lean();
    expect(c.learningStreak).toBe(7);
    expect(c.shopItems.iceShield).toBe(1); // one spent on the gap, one bought
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

  test('the caked student is told who did it and can wipe it off with a Khăn Lau', async () => {
    const a = await createStudent({ extra: { firstName: 'An', lastName: '', shopItems: { cake: 2 } } });
    const b = await createStudent({ extra: { shopItems: { towel: 1 } } });
    expect((await shopService.useItem(b._id, 'towel')).status).toBe('not_caked');
    expect(await shopService.getCakeNotice(b._id)).toBeNull();
    await shopService.throwCake(a._id, b._id);
    expect(await shopService.getCakeNotice(b._id)).toMatchObject({ by: 'An', towels: 1 });
    expect(await shopService.useItem(b._id, 'towel')).toMatchObject({ status: 'ok', owned: 0 });
    expect(await shopService.getCakeNotice(b._id)).toBeNull();
    expect(shopService.boardDecor(await User.findById(b._id).lean()).cakedBy).toBe('');
    // Clean again, so a new cake can land — and with no khăn left, it stays.
    expect((await shopService.throwCake(a._id, b._id)).status).toBe('ok');
    expect((await shopService.useItem(b._id, 'towel')).status).toBe('none_left');
  });

  test('a cake at a missing / non-student target is not spent', async () => {
    const a = await createStudent({ extra: { shopItems: { cake: 1 } } });
    const admin = await User.create({ username: 'cakeadmin', email: 'cakeadmin@x.com', password: 'Passw0rd!', role: 'admin' });
    expect((await shopService.throwCake(a._id, 'not-an-id')).status).toBe('target_not_found');
    expect((await shopService.throwCake(a._id, admin._id)).status).toBe('target_not_found');
    expect((await User.findById(a._id).lean()).shopItems.cake).toBe(1);
  });

  test('vĩ thú are priced 50 → 210 in steps of 20; the old pets all cost 30', async () => {
    const { PETS } = require('../../../constants/shop');
    expect(PETS.filter(p => !p.tier).map(p => p.price)).toEqual([30, 30, 30, 30, 30]);
    expect(PETS.filter(p => p.tier === 'vi').map(p => p.price)).toEqual([50, 70, 90, 110, 130, 150, 170, 190, 210]);
    const user = await createStudent({ extra: { flameWallet: 60, flameWalletGranted: true } });
    expect((await shopService.buyPet(user._id, 'vi2')).status).toBe('not_enough');
    expect(await shopService.buyPet(user._id, 'vi1')).toMatchObject({ status: 'ok', wallet: 10, activePet: 'vi1' });
  });

  test('a crown stacks its 7 days on top of a running one', async () => {
    const user = await createStudent({ extra: { shopItems: { crown: 2 } } });
    const first = await shopService.useItem(user._id, 'crown');
    const second = await shopService.useItem(user._id, 'crown');
    const days = (new Date(second.until) - new Date(first.until)) / 86400000;
    expect(Math.round(days)).toBe(7);
  });
});
