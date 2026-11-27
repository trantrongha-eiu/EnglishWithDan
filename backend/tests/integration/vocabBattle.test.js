const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Message = require('../../models/Message');
const VocabBattle = require('../../models/VocabBattle');
const VocabUnit = require('../../models/VocabUnit');
const VocabularyLesson = require('../../models/VocabularyLesson');
const bank = require('../../services/vocabBattleBank');
const lb = require('../../services/vocabBattleLeaderboard');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');

const auth = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const wallet = async (u) => (await User.findById(u._id).lean()).flameWallet;

const WORDS = [
  ['environment', 'môi trường', 'We must protect the environment for our children.'],
  ['pollution', 'sự ô nhiễm', 'Air pollution is a serious problem in big cities.'],
  ['recycle', 'tái chế', 'Many people recycle plastic bottles every week.'],
  ['renewable energy', 'năng lượng tái tạo', 'The country invests heavily in renewable energy today.'],
  ['deforestation', 'nạn phá rừng', 'Deforestation destroys the homes of many animals.'],
  ['climate change', 'biến đổi khí hậu', 'Climate change affects farmers all over the world.'],
  ['endangered', 'bị đe dọa tuyệt chủng', 'Tigers are an endangered species in Asia.'],
  ['sustainable', 'bền vững', 'We need a sustainable plan for the future.'],
  ['habitat', 'môi trường sống', 'The forest is a natural habitat for birds.'],
  ['emission', 'khí thải', 'Every car produces some emission when it runs.'],
  ['conservation', 'sự bảo tồn', 'Wildlife conservation needs money and time.'],
  ['drought', 'hạn hán', 'The long drought killed most of the crops.'],
];

async function seedContent() {
  const t = await createTeacher();
  await VocabularyLesson.create({
    title: 'Environment', published: true, createdBy: t._id,
    words: WORDS.map(([word, meaning, example], i) => ({ word, meaning, example, imageUrl: `https://img.test/${i}.webp` })),
  });
  await VocabUnit.create({
    unitNumber: 901, title: 'Paraphrase 1',
    words: [
      ['reluctant to trust', 'unwilling to trust'], ['basic premise', 'main idea'], ['ingrained in culture', 'deeply rooted'],
      ['a canteen for troops', 'a canteen for soldiers'], ['widely available', 'easy to find'], ['trees close in age', 'similar growth stage'],
      ['rapid growth', 'fast expansion'],
    ].map(([word, paraphrase]) => ({ type: 'paraphrase', word, paraphrase, meaning: 'nghĩa' })),
  });
  bank.resetCache();
}

// The body a right answer is sent as, read from the stored question
function rightAnswer(q) {
  if (q.options) return q.answer;
  if (q.type === 'match') return q.answer;
  if (q.type === 'order') {
    const used = new Set();
    return q.answerText.split(' ').map((tok) => {
      const i = q.tokens.findIndex((t, k) => t === tok && !used.has(k));
      used.add(i);
      return i;
    });
  }
  return q.answer;
}
function wrongAnswer(q) {
  if (q.options) return (q.answer + 1) % q.options.length;
  if (q.type === 'match') return q.answer.map(() => -1);
  if (q.type === 'order') return [];
  return 'zzz';
}

async function playAll(user, id, right) {
  for (;;) {
    const n = await request(app).post(`/api/vocab-battle/${id}/next`).set(auth(user));
    if (n.body.code === 'finished') return;
    expect(n.status).toBe(200);
    // Never the answer on the wire
    expect(n.body.question).not.toHaveProperty('answer');
    expect(n.body.question).not.toHaveProperty('answerText');
    const b = await VocabBattle.findById(id).lean();
    const q = b.questions[n.body.question.i];
    const res = await request(app).post(`/api/vocab-battle/${id}/answer`).set(auth(user))
      .send({ answer: right ? rightAnswer(q) : wrongAnswer(q), idx: n.body.question.i });
    expect(res.status).toBe(200);
    expect(res.body.frac).toBe(right ? 1 : 0);
    if (res.body.done) return;
  }
}

describe('/api/vocab-battle', () => {
  beforeEach(async () => { lb.resetCache(); await seedContent(); });

  test('401 without a token', async () => {
    expect((await request(app).get('/api/vocab-battle')).status).toBe(401);
  });

  test('quiz with a stake: every kind of question, the winner takes the pot', async () => {
    const a = await createStudent({ extra: { firstName: 'An', flameWallet: 50, flameWalletGranted: true } });
    const b = await createStudent({ extra: { firstName: 'Bình', flameWallet: 50, flameWalletGranted: true } });
    const types = ['synonym', 'antonym', 'meaning', 'image', 'match', 'order', 'listen', 'spell'];
    let res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'quiz', opponents: [String(b._id)], stake: 10, count: 10, source: 'all', types });
    expect(res.status).toBe(200);
    const id = res.body.battle.id;
    expect(res.body.wallet).toBe(40);
    const stored = await VocabBattle.findById(id).lean();
    expect(stored.questions).toHaveLength(10);
    expect(new Set(stored.questions.map((q) => q.type)).size).toBe(8);
    expect(await Message.countDocuments({ toId: b._id })).toBe(1);

    // The host can play before the invitee answers (async)
    await playAll(a, id, true);
    res = await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
    expect(res.body.battle.status).toBe('open');

    res = await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
    expect(res.status).toBe(200);
    expect(await wallet(b)).toBe(40);
    await playAll(b, id, false);

    const done = await VocabBattle.findById(id).lean();
    expect(done.status).toBe('done');
    expect(done.winnerIds.map(String)).toEqual([String(a._id)]);
    expect(await wallet(a)).toBe(60);
    expect(await wallet(b)).toBe(40);

    res = await request(app).get(`/api/vocab-battle/${id}/review`).set(auth(b));
    expect(res.body.items).toHaveLength(10);
    expect(res.body.items.every((it) => it.frac === 0 && it.correct)).toBe(true);
  });

  test('a late answer scores nothing; a reload serves the same question', async () => {
    const a = await createStudent();
    const b = await createStudent();
    const res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'quiz', opponents: [String(b._id)], stake: 0, count: 5, source: 'all', types: ['antonym'] });
    const id = res.body.battle.id;
    const n1 = await request(app).post(`/api/vocab-battle/${id}/next`).set(auth(a));
    const n2 = await request(app).post(`/api/vocab-battle/${id}/next`).set(auth(a));
    expect(n2.body.question.prompt).toBe(n1.body.question.prompt);
    await VocabBattle.updateOne({ _id: id }, { $set: { 'players.0.qAt': new Date(Date.now() - 19000) } });
    const q = (await VocabBattle.findById(id).lean()).questions[0];
    const ans = await request(app).post(`/api/vocab-battle/${id}/answer`).set(auth(a)).send({ answer: q.answer, idx: 0 });
    expect(ans.body).toMatchObject({ frac: 0, pts: 0, late: true });
  });

  test('friendly wins pay a little 🔥, at most 3 times a day', async () => {
    const a = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true } });
    const b = await createStudent();
    for (let i = 0; i < 4; i++) {
      const res = await request(app).post('/api/vocab-battle').set(auth(a))
        .send({ kind: 'quiz', opponents: [String(b._id)], stake: 0, count: 5, source: 'all', types: ['antonym'] });
      const id = res.body.battle.id;
      await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
      await playAll(a, id, true);
      await playAll(b, id, false);
      expect((await VocabBattle.findById(id).lean()).status).toBe('done');
    }
    expect(await wallet(a)).toBe(9);
  });

  test('an unanswered invite expires and refunds the host', async () => {
    const a = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const b = await createStudent();
    const res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'quiz', opponents: [String(b._id)], stake: 20, count: 5, source: 'all', types: ['antonym'] });
    expect(await wallet(a)).toBe(0);
    await VocabBattle.updateOne({ _id: res.body.battle.id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    const list = await request(app).get('/api/vocab-battle').set(auth(a));
    expect(list.body.battles[0].status).toBe('cancelled');
    expect(await wallet(a)).toBe(20);
  });

  test('Nối chữ lobby cancels itself after LOBBY_MINUTES (old 24 h lobbies too) and refunds', async () => {
    const a = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const b = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', opponents: [String(b._id)], stake: 10, count: 10, lives: 1, turnSeconds: 15 });
    const id = res.body.battle.id;
    const left = new Date(res.body.battle.expiresAt) - Date.now();
    expect(left).toBeGreaterThan(4 * 60000);
    expect(left).toBeLessThanOrEqual(5 * 60000);
    await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
    expect(await wallet(b)).toBe(10);
    // a lobby made before the rule (24 h expiresAt) is capped by its age
    await VocabBattle.collection.updateOne({ _id: new (require('mongoose').Types.ObjectId)(id) },
      { $set: { createdAt: new Date(Date.now() - 6 * 60000), expiresAt: new Date(Date.now() + 20 * 3600000) } });
    expect((await request(app).get('/api/vocab-battle/invites').set(auth(b))).body.invites || []).toEqual([]);
    const list = await request(app).get('/api/vocab-battle').set(auth(a));
    expect(list.body.battles.find((x) => x.id === id).status).toBe('cancelled');
    expect(await wallet(a)).toBe(20);
    expect(await wallet(b)).toBe(20);
  });

  test('debug pass: a poll with nothing due writes nothing; Bắt đầu on an expired lobby refunds; turned-down rooms leave the list', async () => {
    const a = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const b = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const id = (await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', opponents: [String(b._id)], stake: 10, count: 10, lives: 1, turnSeconds: 15 })).body.battle.id;
    await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
    const r1 = (await request(app).get(`/api/vocab-battle/${id}`).set(auth(a))).body.battle;
    const r2 = (await request(app).get(`/api/vocab-battle/${id}`).set(auth(a))).body.battle;
    expect(typeof r1.rev).toBe('number');
    expect(r2.rev).toBe(r1.rev); // seenAt fresh, nothing due → no write
    // the 5 minutes ran out before the host pressed Bắt đầu
    await VocabBattle.collection.updateOne({ _id: new (require('mongoose').Types.ObjectId)(id) }, { $set: { createdAt: new Date(Date.now() - 6 * 60000) } });
    const st = await request(app).post(`/api/vocab-battle/${id}/start`).set(auth(a));
    expect(st.body.code).toBe('expired');
    expect(st.body.battle.status).toBe('cancelled');
    expect(st.body.battle.endNote).toMatch(/tự hủy/);
    expect(await wallet(a)).toBe(20);
    expect(await wallet(b)).toBe(20);
    // a quiz b turns down is not in b's list (no "Thua" in Lịch sử)
    const q = (await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'quiz', opponents: [String(b._id)], stake: 0, count: 5, source: 'all', types: ['antonym'] })).body.battle.id;
    await request(app).post(`/api/vocab-battle/${q}/decline`).set(auth(b));
    const list = (await request(app).get('/api/vocab-battle').set(auth(b))).body.battles;
    expect(list.some((x) => x.id === q)).toBe(false);
  });

  test('going into another room drops a player out of their Nối chữ lobbies, and the others see it', async () => {
    const a = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const b = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const c = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const d = await createStudent({ extra: { flameWallet: 20, flameWalletGranted: true } });
    const lobby = (await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', opponents: [String(b._id), String(c._id)], stake: 5, count: 10, lives: 1, turnSeconds: 15 })).body.battle.id;
    await request(app).post(`/api/vocab-battle/${lobby}/accept`).set(auth(b));
    expect(await wallet(b)).toBe(15);
    // b (joined) and c (invited) each start something else
    await request(app).post('/api/vocab-battle').set(auth(b)).send({ kind: 'chain', solo: true, count: 10, lives: 1, turnSeconds: 15 });
    await request(app).post('/api/vocab-battle').set(auth(c))
      .send({ kind: 'quiz', opponents: [String(d._id)], stake: 0, count: 5, source: 'all', types: ['antonym'] });
    let v = (await request(app).get(`/api/vocab-battle/${lobby}`).set(auth(a))).body.battle;
    expect(v.status).toBe('open');
    const pb = v.players.find((p) => p.id === String(b._id));
    const pc = v.players.find((p) => p.id === String(c._id));
    expect([pb.state, pb.note]).toEqual(['left', 'moved']);
    expect([pc.state, pc.note]).toEqual(['declined', 'moved']);
    expect(await wallet(b)).toBe(20);
    // now the host goes elsewhere → the lobby is cancelled, stake back
    const lobby2 = (await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', opponents: [String(d._id)], stake: 5, count: 10, lives: 1, turnSeconds: 15 })).body.battle.id;
    v = (await request(app).get(`/api/vocab-battle/${lobby}`).set(auth(a))).body.battle;
    expect(v.status).toBe('cancelled');
    expect(await wallet(a)).toBe(15); // 20 − lobby2's stake
    // d accepting c's quiz invite moves d out of lobby2 (an invite there)
    const quiz = (await request(app).get('/api/vocab-battle').set(auth(d))).body.battles.find((x) => x.kind === 'quiz');
    await request(app).post(`/api/vocab-battle/${quiz.id}/accept`).set(auth(d));
    v = (await request(app).get(`/api/vocab-battle/${lobby2}`).set(auth(a))).body.battle;
    expect(v.players.find((p) => p.id === String(d._id)).note).toBe('moved');
  });

  test('refuses self, unknown and too many opponents, bad stakes, not enough 🔥', async () => {
    const a = await createStudent({ extra: { flameWallet: 3, flameWalletGranted: true } });
    const others = await Promise.all([1, 2, 3, 4].map(() => createStudent()));
    const post = (body) => request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'quiz', count: 5, source: 'all', types: ['antonym'], stake: 0, ...body });
    expect((await post({ opponents: [String(a._id)] })).body.code).toBe('self');
    expect((await post({ opponents: others.map((o) => String(o._id)) })).body.code).toBe('too_many');
    expect((await post({ opponents: [String(others[0]._id)], stake: 2 })).body.code).toBe('bad_stake');
    expect((await post({ opponents: [String(others[0]._id)], stake: 5 })).body.code).toBe('not_enough');
    expect((await post({ opponents: [String(others[0]._id)], source: 'paraphrase', types: ['listen'] })).body.code).toBe('bad_types');
  });

  test('Nối chữ: a word already played never comes back, not even as its plural or without its hyphen', async () => {
    const W = (...a) => a.map((w) => ({ w }));
    expect(bank.chainUsedAs(W('horse'), 'horses')).toBe('horse');
    expect(bank.chainUsedAs(W('cities'), 'city')).toBe('cities');
    expect(bank.chainUsedAs(W('box'), 'boxes')).toBe('box');
    expect(bank.chainUsedAs(W('well-known'), 'wellknown')).toBe('well-known');
    expect(bank.chainUsedAs(W('glass', 'status'), 'statue')).toBeNull();
    expect(bank.chainUsedAs(W('tea'), 'eat')).toBeNull();

    const a = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true } });
    const b = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true } });
    let res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', opponents: [String(b._id)], stake: 0, count: 10, lives: 2, turnSeconds: 15 });
    const id = res.body.battle.id;
    await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
    await request(app).post(`/api/vocab-battle/${id}/start`).set(auth(a));
    await VocabBattle.updateOne({ _id: id }, { $set: { 'chain.words': [{ w: 'stars', by: null, pts: 0, start: true, at: new Date() }], 'chain.letter': 's' } });
    for (const w of ['stars', 'star']) {
      res = await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(a)).send({ word: w });
      expect(res.body.code).toBe('chain_used');
      expect(res.body.message).toContain('stars');
    }
    // Lulu skips them too
    for (let i = 0; i < 30; i++) expect(['stars', 'star']).not.toContain(bank.botWord('s', new Set(['stars']))?.w);
  });

  test('Nối chữ: turns, word checks, a timeout knocks the last life out', async () => {
    const a = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true } });
    const b = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true } });
    let res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', opponents: [String(b._id)], stake: 0, count: 10, lives: 1, turnSeconds: 15 });
    const id = res.body.battle.id;
    expect((await request(app).post(`/api/vocab-battle/${id}/start`).set(auth(a))).body.code).toBe('need_players');
    await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
    expect((await request(app).post(`/api/vocab-battle/${id}/start`).set(auth(b))).body.code).toBe('forbidden');
    res = await request(app).post(`/api/vocab-battle/${id}/start`).set(auth(a));
    const letter = res.body.battle.chain.letter;
    expect(res.body.battle.chain.turnId).toBe(String(a._id));

    expect((await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(b)).send({ word: 'apple' })).body.code).toBe('not_your_turn');
    const wrongLetter = letter === 'b' ? 'cat' : 'bat';
    expect((await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(a)).send({ word: wrongLetter })).body.code).toBe('chain_letter');
    expect((await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(a)).send({ word: `${letter}qzxq` })).body.code).toBe('chain_unknown');

    const words = [...bank._internal.englishWords()].filter((w) => w[0] === letter && w.length >= 5);
    res = await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(a)).send({ word: words[0] });
    expect(res.status).toBe(200);
    expect(res.body.battle.chain.turnId).toBe(String(b._id));
    expect(res.body.battle.chain.letter).toBe(words[0].slice(-1));

    const l2 = res.body.battle.chain.letter;
    const w2 = [...bank._internal.englishWords()].find((w) => w[0] === l2 && w.length >= 4 && w !== words[0]);
    res = await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(b)).send({ word: w2 });
    expect(res.status).toBe(200);
    expect((await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(b)).send({ word: w2 })).body.code).toBe('not_your_turn');

    // a lets the clock run out — 1 life, so b is the last one standing
    await VocabBattle.updateOne({ _id: id }, { $set: { 'chain.deadline': new Date(Date.now() - 1000) } });
    res = await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
    expect(res.body.battle.status).toBe('done');
    expect(res.body.battle.winnerIds).toEqual([String(b._id)]);
    expect(await wallet(b)).toBe(3);
    expect(await wallet(a)).toBe(0);
  });

  test('chơi một mình (quiz): no opponents, no 🔥, the score becomes a personal best', async () => {
    const a = await createStudent({ extra: { flameWallet: 7, flameWalletGranted: true } });
    let res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'quiz', solo: true, stake: 50, count: 5, source: 'all', types: ['antonym'] });
    expect(res.status).toBe(200);
    expect(res.body.battle).toMatchObject({ solo: true, stake: 0, status: 'open' });
    const id = res.body.battle.id;
    await playAll(a, id, true);
    res = await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
    expect(res.body.battle.status).toBe('done');
    expect(res.body.best).toBe(0); // first run: no earlier best
    expect(await wallet(a)).toBe(7);
    expect(await Message.countDocuments({ toId: a._id })).toBe(0);
    const list = await request(app).get('/api/vocab-battle').set(auth(a));
    expect(list.body.bests.antonym).toBe(res.body.battle.players[0].score);
    expect(list.body.bests.antonym).toBeGreaterThan(400);
  });

  test('chơi một mình (Nối chữ): vs Lulu 🤖, who answers on its own turn', async () => {
    const a = await createStudent({ extra: { flameWallet: 0, flameWalletGranted: true } });
    let res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', solo: true, count: 20, lives: 1, turnSeconds: 15 });
    expect(res.body.battle).toMatchObject({ solo: true, status: 'playing' });
    expect(res.body.battle.players.map((p) => p.bot)).toEqual([false, true]);
    const id = res.body.battle.id;
    const letter = res.body.battle.chain.letter;
    const w1 = [...bank._internal.englishWords()].find((w) => w[0] === letter && w.length >= 5);
    res = await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(a)).send({ word: w1 });
    const botId = res.body.battle.players[1].id;
    expect(res.body.battle.chain.turnId).toBe(botId);

    // Lulu's thinking time is over → its word (or a miss) on the next poll
    await VocabBattle.updateOne({ _id: id }, { $set: { 'chain.deadline': new Date(Date.now() + 15000 - 2000) } });
    res = await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
    const last = res.body.battle.chain.words.at(-1);
    expect(last.by).toBe(botId);
    expect(res.body.battle.chain.turnId).toBe(String(a._id));
    if (last.w) expect(last.w[0]).toBe(w1.slice(-1));
    if (last.w) expect(bank._internal.luluWords().has(last.w)).toBe(true);

    // a runs out of time with 1 life → Lulu wins, nobody gets 🔥
    await VocabBattle.updateOne({ _id: id }, { $set: { 'chain.deadline': new Date(Date.now() - 1000) } });
    res = await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
    expect(res.body.battle.status).toBe('done');
    expect(res.body.battle.winnerIds).toEqual([botId]);
    expect(await wallet(a)).toBe(0);
  });

  test('Lulu 🤖 + the opening word only use dictionary-checked common words', async () => {
    const verified = bank._internal.chainWords().all;
    expect(verified.size).toBeGreaterThan(3000);
    for (const rare of ['konking', 'yobbo', 'qoph', 'zyzzyva']) expect(verified.has(rare)).toBe(false);
    for (const w of ['table', 'orange', 'think', 'water']) expect(verified.has(w)).toBe(true);
    for (let k = 0; k < 15; k++) expect(verified.has(await bank.chainStartWord())).toBe(true);
    // Lulu: checked common words + real (ENABLE) words the site teaches
    const lulu = bank._internal.luluWords();
    for (const rare of ['konking', 'yobbo']) expect(lulu.has(rare)).toBe(false);
    expect(lulu.has('pollution')).toBe(true); // taught in Vocab Topics
    const enable = bank._internal.englishWords();
    for (const letter of 'abcdefghijklmnoprstuwy') {
      for (let k = 0; k < 20; k++) {
        const got = bank.botWord(letter, new Set());
        expect(got && lulu.has(got.w) && got.w[0] === letter).toBe(true);
        expect(verified.has(got.w) || enable.has(got.w)).toBe(true);
      }
    }
    // players may still use any ENABLE word, a hyphenated one, never a swear word
    expect((await bank.chainWordInfo('yobbo')).known).toBe(true);
    expect((await bank.chainWordInfo('well-known')).known).toBe(true);
    expect((await bank.chainWordInfo('shit')).blocked).toBe(true);
    // a word the site teaches carries its meaning
    expect((await bank.chainWordInfo('pollution')).vi).toBe('sự ô nhiễm');
  });

  test('Nối chữ refuses swear words', async () => {
    const a = await createStudent();
    const res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', solo: true, count: 10, lives: 2, turnSeconds: 15 });
    const id = res.body.battle.id;
    await VocabBattle.updateOne({ _id: id }, { $set: { 'chain.letter': 's' } });
    const r = await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(a)).send({ word: 'shit' });
    expect(r.body.code).toBe('chain_blocked');
    const ok = await request(app).post(`/api/vocab-battle/${id}/word`).set(auth(a)).send({ word: 'school' });
    expect(ok.status).toBe(200);
  });

  test('Trái nghĩa: both ways round, never a second right answer', async () => {
    for (let k = 0; k < 25; k++) {
      const qs = await bank.buildQuestions({ types: ['antonym'], count: 30, source: 'all' });
      expect(qs.length).toBe(30);
      for (const q of qs) {
        expect(new Set(q.options).size).toBe(4);
        q.options.forEach((o, i) => { if (i !== q.answer) expect(bank._internal.isOpposite(q.prompt, o)).toBe(false); });
      }
    }
    // the known traps: build → destroy (demolish is right too), advantage → disadvantage (drawback too)
    expect(bank._internal.isOpposite('build', 'demolish')).toBe(true);
    expect(bank._internal.isOpposite('advantage', 'drawback')).toBe(true);
    expect(bank._internal.isOpposite('scarce', 'abundant')).toBe(true);
  });

  test('every word source of the web feeds its question kinds, options never overlap the answer', async () => {
    const t = await createTeacher();
    const Task2Topic = require('../../models/Task2Topic');
    const ListeningSection = require('../../models/ListeningSection');
    const VocabBook = require('../../models/VocabBook');
    const DictionaryCollocation = require('../../models/DictionaryCollocation');
    const vocab = [
      ['consumer goods', 'hàng hóa tiêu dùng', 'The demand for consumer goods has surged in recent decades.'],
      ['consumerism', 'chủ nghĩa tiêu dùng', 'Consumerism drives economic growth in many countries.'],
      ['disposable income', 'thu nhập khả dụng', 'Rising disposable income has fuelled consumer spending.'],
      ['hobby', 'sở thích', 'Reading is my favourite hobby at the weekend.'],
      ['cooking as a hobby', 'nấu ăn như một thú vui', 'Many people take up cooking as a hobby these days.'],
      ['while', 'trong khi', 'She listened to music while she was cooking dinner.'],
      ['meanwhile', 'cùng lúc đó', 'Prices rose sharply; meanwhile, wages stayed the same.'],
    ];
    await Task2Topic.create({
      week: 1, block: 'A', topicName: 'Consumerism', essayType: 'agree_disagree', prompt: 'p',
      vocabularyList: vocab.map(([term, definitionVi, example]) => ({ term, definitionVi, example })),
    });
    await ListeningSection.create({
      partNumber: 1, title: 'BEECHEN FESTIVAL', audioUrl: 'https://a.test/x.mp3', transcript: 't', isActive: true,
      dictationSentences: [{ text: 'I know tickets are running out fast at the festival.', start: 1, end: 2 }],
      gapFillGlossary: [
        { word: 'tickets', meaning: 'vé' }, { word: 'festival', meaning: 'lễ hội' }, { word: 'concert', meaning: 'buổi hòa nhạc' },
        { word: 'musicians', meaning: 'nhạc sĩ' }, { word: 'Beechen', meaning: '', skip: true },
      ],
    });
    const s = await createStudent();
    await VocabBook.create({
      userId: s._id, name: 'Sổ', words: [
        { word: 'heirloom', meaning: 'vật gia truyền', source: 'reading' },
        { word: 'STATION', meaning: 'GA TÀU', source: 'listening' },
        { word: 'propor', meaning: 'tỷ lệ', source: 'reading' }, // a typo: not a word
        { word: 'epidemic', meaning: 'bệnh dịch', source: 'reading' },
        { word: 'helmet', meaning: 'mũ bảo hiểm', source: 'listening' },
      ],
    });
    await DictionaryCollocation.create({
      word: 'sodium', collocations: [
        { phrase: 'sodium intake', meaning: 'lượng natri nạp vào', example: 'Reducing your sodium intake can help your heart.' },
        { phrase: 'high in sodium', meaning: 'chứa nhiều natri', example: 'Processed foods are often high in sodium these days.' },
        { phrase: 'low in sodium', meaning: 'ít natri', example: 'Choose snacks that are low in sodium for your health.' },
        { phrase: 'sodium chloride', meaning: 'muối ăn', example: 'Table salt is mostly sodium chloride in its pure form.' },
      ],
    });
    bank.resetCache();
    const pools = await bank.loadPools();
    const bySrc = (src) => pools.sets.filter((x) => x.src === src).flatMap((x) => x.words.map((w) => w.word));
    expect(bySrc('writing')).toContain('consumerism');
    expect(bySrc('listening')).toEqual(expect.arrayContaining(['tickets', 'festival']));
    expect(bySrc('listening')).not.toContain('Beechen');
    expect(pools.sets.find((x) => x.src === 'listening').words.find((w) => w.word === 'tickets').example).toMatch(/tickets are running/);
    expect(bySrc('saved')).toEqual(expect.arrayContaining(['heirloom', 'station', 'epidemic']));
    expect(bySrc('saved')).not.toContain('propor');
    expect(pools.sets.flatMap((x) => x.words).find((w) => w.word === 'station').meaning).toBe('ga tàu');
    expect(bySrc('dictionary')).toContain('sodium intake');
    expect(pools.bank.has('heirloom')).toBe(true);

    for (const [source, types] of [['writing', ['meaning', 'match', 'order', 'listen', 'spell']], ['readlisten', ['meaning', 'match', 'synonym']], ['dictionary', ['meaning', 'match', 'order']]]) {
      for (const type of types) {
        const qs = await bank.buildQuestions({ types: [type], count: 5, source });
        expect(qs.length).toBeGreaterThan(0);
      }
    }
    // "hobby" never offered beside "cooking as a hobby", "while" never beside "meanwhile"
    for (let k = 0; k < 40; k++) {
      for (const q of await bank.buildQuestions({ types: ['meaning'], count: 7, source: 'writing' })) {
        const answer = q.options[q.answer];
        q.options.forEach((o, i) => { if (i !== q.answer) expect(bank._internal.close(o, answer)).toBe(false); });
      }
    }
    // the create form lists each source's sets + how many words it has
    const res = await request(app).get('/api/vocab-battle/lessons').set(auth(s));
    expect(res.body.lessons.map((l) => l.src)).toEqual(expect.arrayContaining(['topics', 'writing', 'listening', 'saved', 'dictionary']));
    expect(res.body.stats.sources.all).toBeGreaterThan(res.body.stats.sources.writing);
    // a room limited to one Task 2 topic
    const set = res.body.lessons.find((l) => l.src === 'writing');
    const room = await request(app).post('/api/vocab-battle').set(auth(s))
      .send({ kind: 'quiz', solo: true, count: 5, source: 'writing', lessonId: set.id, types: ['meaning'] });
    expect(room.status).toBe(200);
    expect(room.body.battle.config.lessonTitle).toBe('Task 2 – Consumerism');
  });

  test('a Nối chữ game left mid-way is closed by the sweep', async () => {
    const a = await createStudent();
    const res = await request(app).post('/api/vocab-battle').set(auth(a))
      .send({ kind: 'chain', solo: true, count: 10, lives: 1, turnSeconds: 10 });
    const id = res.body.battle.id;
    await VocabBattle.updateOne({ _id: id }, { $set: { 'chain.deadline': new Date(Date.now() - 1000) } });
    await request(app).get('/api/vocab-battle').set(auth(a));
    expect((await VocabBattle.findById(id).lean()).status).toBe('done');
  });

  test('players list hides the viewer and blocked students', async () => {
    const Block = require('../../models/Block');
    const a = await createStudent({ extra: { className: 'K1', firstName: 'An' } });
    const mate = await createStudent({ extra: { className: 'K1', firstName: 'Chi' } });
    const blocked = await createStudent({ extra: { className: 'K1', firstName: 'Dũng' } });
    await Block.create({ blockerId: blocked._id, blockedId: a._id });
    const res = await request(app).get('/api/vocab-battle/players').set(auth(a));
    const ids = res.body.players.map((p) => p.id);
    expect(ids).toContain(String(mate._id));
    expect(ids).not.toContain(String(a._id));
    expect(ids).not.toContain(String(blocked._id));
    expect(res.body.players.find((p) => p.id === String(mate._id)).classmate).toBe(true);
  });

  describe('📨 invite popup + "đang làm đề" (js/shared/battle-invites.js)', () => {
    const presence = require('../../services/presenceService');
    beforeEach(() => presence._reset());
    const quiz = (host, rival, extra = {}) => request(app).post('/api/vocab-battle').set(auth(host))
      .send({ kind: 'quiz', opponents: [String(rival._id)], stake: 0, count: 10, source: 'all', types: ['meaning'], ...extra });

    test('the invitee polls their pending invites; answered ones drop out', async () => {
      const a = await createStudent({ extra: { firstName: 'An' } });
      const b = await createStudent({ extra: { firstName: 'Bình' } });
      const created = await quiz(a, b);
      expect(created.status).toBe(200);
      const id = created.body.battle.id;

      let res = await request(app).get('/api/vocab-battle/invites').set(auth(b));
      expect(res.status).toBe(200);
      expect(res.body.invites).toHaveLength(1);
      expect(res.body.invites[0]).toMatchObject({ id, kind: 'quiz', stake: 0, fromName: expect.stringContaining('An') });
      expect(res.body.invites[0].game).toMatch(/10 câu/);
      // The host has nothing to answer
      expect((await request(app).get('/api/vocab-battle/invites').set(auth(a))).body.invites).toHaveLength(0);

      await request(app).post(`/api/vocab-battle/${id}/decline`).set(auth(b));
      res = await request(app).get('/api/vocab-battle/invites').set(auth(b));
      expect(res.body.invites).toHaveLength(0);
    });

    test('mid-test: the players list tags them and inviting asks for a confirm first', async () => {
      const a = await createStudent({ extra: { className: 'K2', firstName: 'An' } });
      const b = await createStudent({ extra: { className: 'K2', firstName: 'Bình' } });
      await request(app).get('/api/vocab-battle/invites?act=reading&mode=simulation').set(auth(b));

      const list = await request(app).get('/api/vocab-battle/players').set(auth(a));
      expect(list.body.players.find((p) => p.id === String(b._id)).busy)
        .toMatchObject({ skill: 'reading', mode: 'simulation', label: 'đề Reading (chế độ thi)' });

      let res = await quiz(a, b);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('opponent_busy');
      expect(res.body.busy).toEqual([expect.objectContaining({ id: String(b._id), activity: expect.objectContaining({ mode: 'simulation' }) })]);
      expect(await VocabBattle.countDocuments({ hostId: a._id })).toBe(0);

      res = await quiz(a, b, { confirmBusy: true });
      expect(res.status).toBe(200);

      // A poll without act (another tab) keeps it; act=none clears it
      await request(app).get('/api/vocab-battle/invites').set(auth(b));
      expect(presence.get(b._id)).toMatchObject({ skill: 'reading' });
      await request(app).get('/api/vocab-battle/invites?act=none').set(auth(b));
      expect(presence.get(b._id)).toBeNull();
      const c = await createStudent();
      expect((await quiz(c, b)).status).toBe(200);
    });

    test('a stale report expires', () => {
      presence.set('u1', { skill: 'listening', mode: 'practice' }, 1000);
      expect(presence.get('u1', 1000 + presence.TTL_MS - 1)).toMatchObject({ label: 'đề Listening (luyện tập)' });
      expect(presence.get('u1', 1000 + presence.TTL_MS + 1)).toBeNull();
      expect(presence.parse({ act: 'writing' })).toBeNull();
    });
  });

  describe('🏆 BXH Đấu trường', () => {
    const board = (u, qs = '') => request(app).get(`/api/vocab-battle/leaderboard?${qs}`).set(auth(u));
    async function friendly(a, b) {
      const res = await request(app).post('/api/vocab-battle').set(auth(a))
        .send({ kind: 'quiz', opponents: [String(b._id)], stake: 0, count: 5, source: 'all', types: ['antonym'] });
      const id = res.body.battle.id;
      await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
      await playAll(a, id, true);
      await playAll(b, id, false);
      return id;
    }

    test('wins count, at most 3 a day vs the same rival; head-to-head; class scope; hero stats', async () => {
      const a = await createStudent({ extra: { firstName: 'An', className: 'K1' } });
      const b = await createStudent({ extra: { firstName: 'Bình', className: 'K2' } });
      for (let i = 0; i < 4; i++) await friendly(a, b);
      const done = await VocabBattle.find({ hostId: a._id }).lean();
      expect(done.every((d) => d.status === 'done' && d.rated)).toBe(true);

      let res = await board(a, 'board=pvp&period=week');
      expect(res.status).toBe(200);
      expect(res.body.rows.map((r) => [r.name.split(' ')[0], r.rank, r.wins])).toEqual([['An', 1, 3], ['Bình', 2, 0]]);
      expect(res.body.rows[0]).toMatchObject({ me: true, played: 3, winRate: 100, streak: 3 });
      expect(res.body.rows[1]).toMatchObject({ losses: 4, played: 4 });

      res = await board(b, 'board=pvp');
      expect(res.body.me).toMatchObject({ rank: 2, wins: 0 });
      expect(res.body.rivals).toEqual([expect.objectContaining({ id: String(a._id), w: 0, l: 4, t: 0 })]);

      res = await board(a, 'board=pvp&scope=class');
      expect(res.body.className).toBe('K1');
      expect(res.body.rows.map((r) => r.id)).toEqual([String(a._id)]);

      const list = await request(app).get('/api/vocab-battle').set(auth(a));
      expect(list.body.stats).toMatchObject({ wins: 3, rank: 1, streak: 3 });
    });

    test('a room where someone did not really play is not rated', async () => {
      const a = await createStudent();
      const b = await createStudent();
      const res = await request(app).post('/api/vocab-battle').set(auth(a))
        .send({ kind: 'quiz', opponents: [String(b._id)], stake: 0, count: 5, source: 'all', types: ['antonym'] });
      const id = res.body.battle.id;
      await request(app).post(`/api/vocab-battle/${id}/accept`).set(auth(b));
      await playAll(a, id, true);
      await VocabBattle.updateOne({ _id: id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
      await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
      const stored = await VocabBattle.findById(id).lean();
      expect(stored.status).toBe('done');
      expect(stored.rated).toBe(false);
      expect((await board(a, 'board=pvp')).body.rows).toEqual([]);
    });

    test('solo records per game; the room page gets the rules', async () => {
      const a = await createStudent({ extra: { firstName: 'An' } });
      const res = await request(app).post('/api/vocab-battle').set(auth(a))
        .send({ kind: 'quiz', solo: true, count: 5, source: 'all', types: ['antonym'] });
      const id = res.body.battle.id;
      await playAll(a, id, true);
      const room = await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
      expect(room.body.rules.types.length).toBe(8);
      const score = room.body.battle.players[0].score;

      let r = await board(a, 'board=solo&game=antonym');
      expect(r.body.rows).toEqual([expect.objectContaining({ id: String(a._id), rank: 1, best: score, plays: 1, me: true })]);
      r = await board(a, 'board=solo&game=mix');
      expect(r.body.rows).toEqual([]);
      // solo runs never reach the thách đấu board
      expect((await board(a, 'board=pvp')).body.rows).toEqual([]);
    });
  });
});
