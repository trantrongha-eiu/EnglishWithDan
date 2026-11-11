// Speaking Part 2 · 7 câu chuyện gốc: Premium-only content, server-side
// progress, and the `speaking_part2` classroom homework type.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createPremiumStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createClassGroup, enrollStudent } = require('../factories/classFactory');
const DATA = require('../../data/speakingPart2');
const svc = require('../../services/speakingPart2Service');

const authH = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const expiredFree = () => createStudent({ extra: { trialStartedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) } });

// Every sentence key of a story's 7 frames (2 WHY variants).
function sentenceKeys(st) {
  const k = [];
  st.fixed.forEach((sec, si) => sec.s.forEach((_, j) => k.push(`f${si}.${j}`)));
  [0, 1].forEach((w) => st.why[w].s.forEach((_, j) => k.push(`w${w}.${j}`)));
  st.conclusion.forEach((_, j) => k.push(`c${j}`));
  return k;
}
const shadowAll = (keys, pct) => keys.map((k) => [k, pct]);

test('7 khung: every story has 5 FIXED frames + WHY + Kết luận; People merges appearance + personality', () => {
  for (const st of DATA.stories) {
    const fr = svc.framesOf(st);
    expect(fr).toHaveLength(7);
    expect(fr.slice(0, 5).every((f) => f.kind === 'fixed')).toBe(true);
    expect(fr[5].kind).toBe('why');
    expect(fr[6].kind).toBe('con');
  }
  const people = svc.framesOf(DATA.stories[0]);
  expect(people[1].h).toBe('Ngoại hình & tính cách');
  expect(people[1].keys).toEqual(['f1.0', 'f1.1', 'f2.0', 'f2.1']);
});

test('mastery: nhại + dịch per sentence, frames unlock in order at 70%', () => {
  const st = DATA.stories[0];
  const f0 = svc.framesOf(st)[0].keys;
  // Dịch only on frame 1 = 50% → frame 2 still locked.
  const db = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace('.', '_'), v]));
  let m = svc.masteryOf(st.id, { ok: f0, shadow: {} });
  expect(m.frames[0].pct).toBe(50);
  expect(m.frames[1].open).toBe(false);
  // + nhại >= 70 on both sentences → 100%, frame 2 opens; a 69 doesn't count.
  m = svc.masteryOf(st.id, { ok: f0, shadow: db({ [f0[0]]: 70, [f0[1]]: 90 }) });
  expect(m.frames[0].pct).toBe(100);
  expect(m.frames[1].open).toBe(true);
  expect(m.frames[2].open).toBe(false);
  m = svc.masteryOf(st.id, { ok: [], shadow: db({ [f0[0]]: 69, [f0[1]]: 69 }) });
  expect(m.frames[0].pct).toBe(0);
});

test('content: full text for Premium, story list only for an expired free account', async () => {
  const p = await createPremiumStudent();
  const full = await request(app).get('/api/speaking-part2/content').set(authH(p));
  expect(full.status).toBe(200);
  expect(full.body.locked).toBe(false);
  expect(full.body.stories).toHaveLength(7);
  expect(full.body.stories[0].fixed.length).toBeGreaterThan(0);

  const f = await expiredFree();
  const locked = await request(app).get('/api/speaking-part2/content').set(authH(f));
  expect(locked.status).toBe(200);
  expect(locked.body.locked).toBe(true);
  expect(locked.body.stories[0].title).toBe(DATA.stories[0].title);
  expect(locked.body.stories[0].fixed).toBeUndefined();
  expect(locked.body.stories[0].vocab).toBeUndefined();

  expect((await request(app).get('/api/speaking-part2/content')).status).toBe(401);
  expect((await request(app).get('/api/speaking-part2/progress').set(authH(f))).status).toBe(403);
  expect((await request(app).put('/api/speaking-part2/progress/people').set(authH(f)).send({ read: true })).status).toBe(403);
});

test('progress: merges across saves, ignores bogus keys, steps are recomputed server-side', async () => {
  const s = await createPremiumStudent();
  const st = DATA.stories[0];
  let r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s))
    .send({ read: true, ok: ['v0', 'v1', 'zzz', 'f99.0'], best: { vocab: 80, hack: 1 }, shadow: [['f0.0', 82], ['f0.1', 150], ['v0', 90], ['nope', 50], 'junk'] });
  expect(r.status).toBe(200);
  expect(r.body.progress.ok.sort()).toEqual(['v0', 'v1']);
  expect(r.body.progress.steps.read).toBe(true);
  expect(r.body.progress.steps.vocab).toBe(false);
  expect(r.body.progress.best).toEqual({ vocab: 80 });
  expect(r.body.progress.shadow).toEqual({ 'f0.0': 82, 'f0.1': 100 }); // sentences only, clamped

  // Shadow scores keep the best per sentence.
  r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ shadow: [['f0.0', 40], ['f0.1', 75]] });
  expect(r.body.progress.shadow).toEqual({ 'f0.0': 82, 'f0.1': 100 });

  // A second device sends only what it knows — nothing is lost.
  r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ ok: ['v2'], read: false });
  expect(r.body.progress.ok.sort()).toEqual(['v0', 'v1', 'v2']);
  expect(r.body.progress.read).toBe(true);

  // Claiming "speak" without the sentences doesn't complete the story.
  r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ speak: 1 });
  expect(r.body.progress.completedAt).toBeNull();
  expect(r.body.progress.masteredAt).toBeNull();

  expect((await request(app).put('/api/speaking-part2/progress/nope').set(authH(s)).send({})).status).toBe(404);
  const all = await request(app).get('/api/speaking-part2/progress').set(authH(s));
  expect(Object.keys(all.body.progress)).toEqual([st.id]);
});

test('homework speaking_part2: teacher assigns a story, it passes once the story is >= 70% learnt', async () => {
  const t = await createTeacher();
  const s = await createPremiumStudent();
  const cls = await createClassGroup({ teacher: t });
  await enrollStudent(cls, s);
  const st = DATA.stories[1]; // places

  const cat = await request(app).get('/api/classes/resources/catalog?type=speaking_part2').set(authH(t));
  expect(cat.status).toBe(200);
  expect(cat.body.items).toHaveLength(7);
  const row = cat.body.items.find((i) => i.resourceCode === st.id);
  expect(row.label).toContain(st.title);

  const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t))
    .send({ title: 'Part 2', resources: [{ kind: 'internal', resourceType: 'speaking_part2', resourceId: row._id }] });
  expect(res.status).toBe(201);
  const asgId = String(res.body.assignment._id);

  const item = async () => {
    const mine = await request(app).get('/api/assignments/mine').set(authH(s));
    return mine.body.assignments.find((a) => a._id === asgId).resources[0];
  };
  let it = await item();
  expect(it.completed).toBe(false);
  expect(it.resourceCode).toBe(st.id);

  const keys = sentenceKeys(st);
  // Every sentence translated but nothing shadowed = 50% → not passed.
  await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ read: true, ok: keys });
  it = await item();
  expect(it.completed).toBe(false);

  // + shadowing >= 70% on every sentence → 100% → passed (no ④ Nói thử needed).
  const r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ shadow: shadowAll(keys, 80) });
  expect(r.body.progress.mastery.pct).toBe(100);
  expect(r.body.progress.masteredAt).toBeTruthy();
  expect(r.body.progress.completedAt).toBeNull(); // vocab + speak not done yet
  it = await item();
  expect(it.completed).toBe(true);

  // A bogus story id is refused.
  const bad = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t))
    .send({ title: 'x', resources: [{ kind: 'internal', resourceType: 'speaking_part2', resourceId: '000000000000000000000001' }] });
  expect(bad.status).toBe(400);
});

test('story rows keep stable ids', () => {
  expect(String(svc.STORY_ROWS[0]._id)).toBe('773200000000000000000001');
  expect(svc.STORY_ROWS.map((r) => r.code)).toEqual(DATA.stories.map((s) => s.id));
});
