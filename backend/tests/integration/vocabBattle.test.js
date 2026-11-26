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

    // a runs out of time with 1 life → Lulu wins, nobody gets 🔥
    await VocabBattle.updateOne({ _id: id }, { $set: { 'chain.deadline': new Date(Date.now() - 1000) } });
    res = await request(app).get(`/api/vocab-battle/${id}`).set(auth(a));
    expect(res.body.battle.status).toBe('done');
    expect(res.body.battle.winnerIds).toEqual([botId]);
    expect(await wallet(a)).toBe(0);
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
