const { createStudent } = require('../../factories/userFactory');
const User = require('../../../models/User');
const Message = require('../../../models/Message');
const VocabActivity = require('../../../models/VocabActivity');
const shopService = require('../../../services/shopService');
const userService = require('../../../services/userService');
const { getVNDay } = require('../../../utils/streak');
const { todayVNDate } = require('../../../services/streakBonusService');
const { PETS, petPower } = require('../../../constants/shop');

const HOUR = 3600 * 1000;
const earnToday = (userId, n) => VocabActivity.create({ userId, date: todayVNDate(), streakBonusEarned: n });
const player = (extra = {}) => createStudent({ extra: { flameWalletGranted: true, ...extra } });

afterEach(() => jest.restoreAllMocks());

describe('pet skills catalog', () => {
  test('every pet has a skill line and gift powers', () => {
    for (const p of PETS) {
      expect(p.skill && p.skill.name && p.skill.text).toBeTruthy();
      const pw = petPower(p.id);
      expect(pw.gift[0]).toBeGreaterThanOrEqual(1);
      expect(pw.gift[1]).toBeGreaterThanOrEqual(pw.gift[0]);
    }
    expect(petPower('')).toBeNull();
    expect(petPower('nope')).toBeNull();
  });
});

describe('🎁 Quà linh thú', () => {
  test('locked until the student earns a 🔥 today, then opens once', async () => {
    const u = await player({ pets: ['meo'], activePet: 'meo', flameWallet: 0 });
    expect((await shopService.getPetState(u._id)).gift).toBe('study');
    expect((await shopService.claimPetGift(u._id)).status).toBe('gift_study');

    await earnToday(u._id, 1);
    expect((await shopService.getPetState(u._id)).gift).toBe('ready');
    jest.spyOn(Math, 'random').mockReturnValue(0.99); // top of the range, no drop
    const r = await shopService.claimPetGift(u._id);
    expect(r).toMatchObject({ status: 'ok', flames: 4, item: null, wallet: 4, petId: 'meo' });

    expect((await shopService.claimPetGift(u._id)).status).toBe('gift_claimed');
    expect((await shopService.getPetState(u._id)).gift).toBe('claimed');
  });

  test('a lucky gift drops an item into the kho', async () => {
    const u = await player({ pets: ['vi9'], activePet: 'vi9' });
    await earnToday(u._id, 2);
    jest.spyOn(Math, 'random').mockReturnValue(0); // bottom of range, drop, first drop (cake)
    const r = await shopService.claimPetGift(u._id);
    expect(r.status).toBe('ok');
    expect(r.flames).toBe(petPower('vi9').gift[0]);
    expect(r.item).toMatchObject({ key: 'cake', qty: 1 });
    expect((await User.findById(u._id).lean()).shopItems.cake).toBe(1);
  });

  test('no pet out → no gift', async () => {
    const u = await player();
    expect((await shopService.claimPetGift(u._id)).status).toBe('no_pet');
    expect((await shopService.getPetState(u._id)).gift).toBe('none');
  });
});

describe('🛡️ Hộ Thể / ⚡ Phản Đòn', () => {
  test('a Susano blocks one cake a day, the next one lands', async () => {
    const thrower = await player({ shopItems: { cake: 2 } });
    const target = await player({ pets: ['su1'], activePet: 'su1' });
    const first = await shopService.throwCake(thrower._id, String(target._id));
    expect(first).toMatchObject({ status: 'ok', outcome: 'blocked', owned: 1 });
    expect((await User.findById(target._id).lean()).cakedUntil).toBeNull();
    expect(await Message.countDocuments({ toId: target._id })).toBe(1);

    const second = await shopService.throwCake(thrower._id, String(target._id));
    expect(second).toMatchObject({ status: 'ok', outcome: 'hit' });
    expect((await User.findById(target._id).lean()).cakedUntil).not.toBeNull();
  });

  test('a reflecting Susano lands the cake on the thrower', async () => {
    const thrower = await player({ shopItems: { cake: 1 } });
    const target = await player({ pets: ['su3'], activePet: 'su3' });
    const r = await shopService.throwCake(thrower._id, String(target._id));
    expect(r.outcome).toBe('reflected');
    const t = await User.findById(thrower._id).lean();
    expect(t.cakedUntil.getTime()).toBeGreaterThan(Date.now());
    expect(t.cakedBy).toMatch(/phản đòn/);
  });

  test('yesterday\'s blocks do not use up today\'s', async () => {
    const yesterday = new Date(getVNDay(new Date()).getTime() - 86400000);
    const thrower = await player({ shopItems: { cake: 1 } });
    const target = await player({ pets: ['su1'], activePet: 'su1', petGuardDay: yesterday, petGuardUsed: 5 });
    expect((await shopService.throwCake(thrower._id, String(target._id))).outcome).toBe('blocked');
  });

  test('Rồng Con melts a cake after 6 hours', async () => {
    const thrower = await player({ shopItems: { cake: 1 } });
    const target = await player({ pets: ['rong'], activePet: 'rong' });
    await shopService.throwCake(thrower._id, String(target._id));
    const left = (await User.findById(target._id).lean()).cakedUntil.getTime() - Date.now();
    expect(left).toBeLessThanOrEqual(6 * HOUR);
    expect(left).toBeGreaterThan(5.9 * HOUR);
  });
});

describe('perks that change item rules', () => {
  test('Cánh Cụt raises the Khiên Băng cap to 3', async () => {
    const u = await player({ flameWallet: 200, shopItems: { iceShield: 2 } });
    expect((await shopService.buyItem(u._id, 'iceShield')).status).toBe('max_owned');
    await User.updateOne({ _id: u._id }, { $set: { pets: ['cut'], activePet: 'cut' } });
    expect((await shopService.buyItem(u._id, 'iceShield'))).toMatchObject({ status: 'ok', owned: 3 });
    expect((await shopService.buyItem(u._id, 'iceShield')).status).toBe('max_owned');
    const state = await shopService.getState(u._id);
    expect(state.items.find(i => i.key === 'iceShield').maxOwned).toBe(3);
  });

  test('Shiba fixes a 2 🔥 quota when the Búa Hi Vọng is used', async () => {
    const u = await player({ pets: ['shiba'], activePet: 'shiba', shopItems: { hopeHammer: 1 } });
    const r = await shopService.useItem(u._id, 'hopeHammer');
    expect(r).toMatchObject({ status: 'ok', hope: { quota: 2 } });
    // Swapping the pet afterwards doesn't change the bet.
    await User.updateOne({ _id: u._id }, { $set: { activePet: '' } });
    expect((await shopService.getState(u._id)).effects.hope.quota).toBe(2);
  });

  test('a 2 🔥 Shiba bet is won with 2 🔥', async () => {
    const yesterday = new Date(getVNDay(new Date()).getTime() - 86400000);
    const u = await player({ learningStreak: 20, lastActivityDate: new Date(), hopeHammerDay: yesterday, hopeHammerBase: 2, hopeHammerQuota: 2 });
    expect(await shopService.settleHopeHammer(u._id)).toEqual({ success: true, penalty: 0 });
  });
});

describe('🔍 Kính Soi and 👁️ Mắt Cáo', () => {
  test('Kính Soi tears off a cloak, refuses an uncloaked target', async () => {
    const me = await player({ shopItems: { lens: 2 } });
    const hidden = await player({ invisibleUntil: new Date(Date.now() + 5 * HOUR) });
    const open = await player();
    expect((await shopService.useLens(me._id, String(open._id))).status).toBe('not_hidden');
    expect((await shopService.useLens(me._id, String(me._id))).status).toBe('invalid_lens_target');
    expect(await shopService.useLens(me._id, String(hidden._id))).toMatchObject({ status: 'ok', owned: 1 });
    expect((await User.findById(hidden._id).lean()).invisibleUntil).toBeNull();
  });

  test('Cáo Lửa sees a cloaked streak on the BXH, others see ???', async () => {
    const hidden = await player({ learningStreak: 9, lastActivityDate: new Date(), invisibleUntil: new Date(Date.now() + 5 * HOUR) });
    const plain = await player({ learningStreak: 1, lastActivityDate: new Date() });
    const fox = await player({ learningStreak: 1, lastActivityDate: new Date(), pets: ['cao'], activePet: 'cao' });
    const rowFor = (board) => board.find(r => String(r._id) === String(hidden._id));
    expect(rowFor(await userService.getStreakLeaderboard(10, plain._id)).streak).toBeNull();
    const seen = rowFor(await userService.getStreakLeaderboard(10, fox._id));
    expect(seen).toMatchObject({ streak: 9, revealed: true });
  });
});
