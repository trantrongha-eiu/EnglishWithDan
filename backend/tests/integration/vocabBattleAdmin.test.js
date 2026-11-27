const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const VocabBattle = require('../../models/VocabBattle');
const BattleWord = require('../../models/BattleWord');
const VocabularyLesson = require('../../models/VocabularyLesson');
const bank = require('../../services/vocabBattleBank');
const settings = require('../../services/vocabBattleSettings');
const R = require('../../constants/vocabBattle');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');

// ⚔️ Đấu trường — admin /vocab-battle (routes/admin/vocabBattle.js) and how
// its settings + word bank reach the student game.
const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const wallet = async (u) => (await User.findById(u._id).lean()).flameWallet;

const PICS = [
  ['car', 'xe ô tô', ['taxi']], ['taxi', 'xe taxi', ['car']], ['bus', 'xe buýt', []], ['bicycle', 'xe đạp', []],
  ['aeroplane', 'máy bay', []], ['ship', 'tàu thủy', []],
];
const DICT = [
  ['abundant', 'dồi dào', 'adj', 'Fresh water is abundant in this region.'],
  ['fragile', 'dễ vỡ', 'adj', 'Please be careful with the fragile glasses.'],
  ['ancient', 'cổ xưa', 'adj', 'They visited an ancient temple in the mountains.'],
  ['brave', 'dũng cảm', 'adj', 'The brave firefighter saved the little girl.'],
  ['tidy', 'gọn gàng', 'adj', 'Her room is always clean and tidy.'],
  ['noisy', 'ồn ào', 'adj', 'The street outside is very noisy at night.'],
];

async function seed() {
  const t = await createTeacher();
  await VocabularyLesson.create({
    title: 'Basics', published: true, createdBy: t._id,
    words: [['house', 'ngôi nhà'], ['school', 'trường học'], ['river', 'dòng sông'], ['market', 'chợ'], ['garden', 'khu vườn']]
      .map(([word, meaning]) => ({ word, meaning, example: `We walked to the ${word} together after lunch.` })),
  });
  await BattleWord.insertMany([
    ...PICS.map(([word, meaning, near]) => ({ kind: 'picture', word, meaning, near, set: 'transport', setTitle: 'Hình – Giao thông',
      imageUrl: `https://img.test/${word}.webp`, origin: 'fluent' })),
    ...DICT.map(([word, meaning, pos, example]) => ({ kind: 'dict', word, meaning, pos, example, set: 'adj-01', setTitle: 'Từ điển mở – Tính từ',
      origin: 'wiktionary', ant: word === 'fragile' ? 'sturdy' : '' })),
  ]);
  bank.resetCache();
}

describe('admin /api/admin/vocab-battle', () => {
  beforeEach(seed);
  afterEach(() => { settings._apply(null); bank.resetCache(); });

  test('students are kept out', async () => {
    const s = await createStudent();
    expect((await request(app).get('/api/admin/vocab-battle/overview').set(auth(s))).status).toBe(403);
  });

  test('BattleWord sets feed the game: pictures (look-alikes never offered), Từ điển mở, extra antonyms', async () => {
    const pools = await bank.loadPools();
    expect(pools.sets.find((s) => s.id === 'pictures:transport').words).toHaveLength(6);
    expect(pools.sets.find((s) => s.id === 'wikt:adj-01').src).toBe('wikt');
    expect(pools.antonyms.some((r) => r.w === 'fragile' && r.a === 'sturdy' && r.extra)).toBe(true);
    // A dictionary word's meaning shows in Nối chữ, but it earns no ⭐
    expect(pools.viOf.get('fragile')).toBe('dễ vỡ');
    expect(pools.bank.has('fragile')).toBe(false);

    for (let i = 0; i < 15; i++) {
      const qs = await bank.buildQuestions({ types: ['image'], count: 6, source: 'pictures' });
      expect(qs.length).toBe(6);
      for (const q of qs) {
        const right = q.options[q.answer];
        if (right === 'car') expect(q.options).not.toContain('taxi');
        if (right === 'taxi') expect(q.options).not.toContain('car');
      }
    }
    const qs = await bank.buildQuestions({ types: ['meaning', 'listen'], count: 6, source: 'wikt' });
    expect(qs.length).toBe(6);
  });

  test('settings: close the arena, switch kinds off, change time limits', async () => {
    const t = await createTeacher();
    const s = await createStudent({ extra: { flameWallet: 50, flameWalletGranted: true } });
    let res = await request(app).get('/api/admin/vocab-battle/settings').set(auth(t));
    expect(res.status).toBe(200);
    expect(res.body.settings.enabled).toBe(true);
    expect(res.body.defaults.limits.meaning).toBe(15);

    res = await request(app).put('/api/admin/vocab-battle/settings').set(auth(t)).send({ limits: { meaning: 999 } });
    expect(res.status).toBe(400);
    res = await request(app).put('/api/admin/vocab-battle/settings').set(auth(t))
      .send({ enabled: false, disabledTypes: ['spell'], limits: { meaning: 20 }, maxStake: 40 });
    expect(res.status).toBe(200);

    res = await request(app).get('/api/vocab-battle').set(auth(s));
    expect(res.body.rules.enabled).toBe(false);
    expect(res.body.rules.types.map((x) => x.key)).not.toContain('spell');
    expect(res.body.rules.maxStake).toBe(40);
    res = await request(app).post('/api/vocab-battle').set(auth(s)).send({ kind: 'quiz', solo: true, count: 5, types: ['meaning'] });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('closed');

    await request(app).put('/api/admin/vocab-battle/settings').set(auth(t)).send({ enabled: true });
    res = await request(app).post('/api/vocab-battle').set(auth(s)).send({ kind: 'quiz', solo: true, count: 5, source: 'topics', types: ['spell'] });
    expect(res.body.code).toBe('bad_types');
    res = await request(app).post('/api/vocab-battle').set(auth(s)).send({ kind: 'quiz', solo: true, count: 5, source: 'topics', types: ['meaning'] });
    expect(res.status).toBe(200);
    const stored = await VocabBattle.findById(res.body.battle.id).lean();
    expect(stored.questions.every((q) => q.limit === 20)).toBe(true);

    res = await request(app).post('/api/admin/vocab-battle/settings/reset').set(auth(t));
    expect(res.body.settings.limits.meaning).toBe(15);
    expect(R.QUESTION_TYPES.meaning.limit).toBe(15);
  });

  test('Kho từ: list, edit (marked edited), hide, add; only admins delete', async () => {
    const t = await createTeacher();
    const a = await createAdmin();
    let res = await request(app).get('/api/admin/vocab-battle/words?kind=dict&search=fragil').set(auth(t));
    expect(res.status).toBe(200);
    expect(res.body.words.map((w) => w.word)).toEqual(['fragile']);
    const id = res.body.words[0].id;

    res = await request(app).put(`/api/admin/vocab-battle/words/${id}`).set(auth(t)).send({ meaning: 'mỏng manh, dễ vỡ' });
    expect(res.body.word.edited).toBe(true);
    expect((await bank.loadPools()).viOf.get('fragile')).toBe('mỏng manh, dễ vỡ');

    res = await request(app).post('/api/admin/vocab-battle/words/hide').set(auth(t)).send({ ids: [id], hidden: true });
    expect(res.body.modified).toBe(1);
    expect((await bank.loadPools()).sets.find((s) => s.id === 'wikt:adj-01').words.some((w) => w.word === 'fragile')).toBe(false);

    res = await request(app).post('/api/admin/vocab-battle/words').set(auth(t)).send({ kind: 'picture', word: 'tram', meaning: 'xe điện', setTitle: 'Hình – Giao thông' });
    expect(res.status).toBe(400); // a picture word needs a picture
    res = await request(app).post('/api/admin/vocab-battle/words').set(auth(t))
      .send({ kind: 'picture', word: 'tram', meaning: 'xe điện', setTitle: 'Hình – Giao thông', imageUrl: 'https://img.test/tram.webp' });
    expect(res.status).toBe(200);
    expect(res.body.word.set).toBe('transport');
    res = await request(app).post('/api/admin/vocab-battle/words').set(auth(t))
      .send({ kind: 'picture', word: 'tram', meaning: 'xe điện', setTitle: 'Hình – Giao thông', imageUrl: 'https://img.test/tram.webp' });
    expect(res.status).toBe(400); // already there

    expect((await request(app).delete(`/api/admin/vocab-battle/words/${id}`).set(auth(t))).status).toBe(403);
    expect((await request(app).delete(`/api/admin/vocab-battle/words/${id}`).set(auth(a))).status).toBe(200);
    expect(await BattleWord.countDocuments({ word: 'fragile' })).toBe(0);

    res = await request(app).get('/api/admin/vocab-battle/bank').set(auth(t));
    expect(res.body.sources.find((x) => x.key === 'pictures').words).toBe(7);
  });

  test('stopping a room refunds every stake', async () => {
    const t = await createTeacher();
    const a = await createStudent({ extra: { flameWallet: 50, flameWalletGranted: true } });
    const b = await createStudent({ extra: { flameWallet: 50, flameWalletGranted: true } });
    let res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'quiz', opponents: [String(b._id)], stake: 10, count: 5, source: 'topics', types: ['meaning'] });
    const id = res.body.battle.id;
    await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
    expect(await wallet(a)).toBe(40);
    expect(await wallet(b)).toBe(40);

    res = await request(app).get('/api/admin/vocab-battle/battles?status=active').set(auth(t));
    expect(res.body.battles.map((x) => x.id)).toContain(id);
    res = await request(app).post(`/api/admin/vocab-battle/battles/${id}/cancel`).set(auth(t)).send({});
    expect(res.status).toBe(200);
    expect(res.body.battle.status).toBe('cancelled');
    expect(await wallet(a)).toBe(50);
    expect(await wallet(b)).toBe(50);
    expect((await request(app).post(`/api/admin/vocab-battle/battles/${id}/cancel`).set(auth(t)).send({})).status).toBe(404);

    res = await request(app).get('/api/admin/vocab-battle/overview').set(auth(t));
    expect(res.body.counts.cancelled).toBe(1);
    expect(res.body.days).toHaveLength(14);
  });

  test('Nối chữ: a blocked word is refused and never played; unblock lets it back', async () => {
    const t = await createTeacher();
    expect((await bank.chainWordInfo('market')).known).toBe(true);
    let res = await request(app).post('/api/admin/vocab-battle/chain-words/block').set(auth(t)).send({ w: 'Market' });
    expect(res.body.blocked).toEqual(['market']);
    expect((await bank.chainWordInfo('market')).blocked).toBe(true);
    expect((await bank.loadPools()).lulu.has('market')).toBe(false);
    res = await request(app).get('/api/admin/vocab-battle/chain-words').set(auth(t));
    expect(res.body.blocked).toEqual(['market']);
    res = await request(app).post('/api/admin/vocab-battle/chain-words/unblock').set(auth(t)).send({ w: 'market' });
    expect(res.body.blocked).toEqual([]);
    expect((await bank.chainWordInfo('market')).known).toBe(true);
    expect((await request(app).post('/api/admin/vocab-battle/chain-words/block').set(auth(t)).send({ w: 'two words' })).status).toBe(400);
  });
});
