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

test('7 khung: every story has 5 FIXED frames + WHY + Kết luận (framework v3)', () => {
  for (const st of DATA.stories) {
    const fr = svc.framesOf(st);
    expect(fr).toHaveLength(7);
    expect(fr.slice(0, 5).every((f) => f.kind === 'fixed')).toBe(true);
    expect(fr[5].kind).toBe('why');
    expect(fr[6].kind).toBe('con');
  }
  const people = svc.framesOf(DATA.stories[0]);
  expect(people[1].h).toBe('Ngoại hình & tính cách');
  expect(people[1].keys).toEqual(['f1.0', 'f1.1']); // 2 sentences, as v3 asks
  const events = svc.framesOf(DATA.stories[3]);
  expect(events[3].h).toBe('Kết quả & suy ngẫm'); // a joined section
  expect(events[3].keys).toEqual(['f3.0', 'f4.0']);
  // v3: every FIXED part is ≈ 140–160 words (a little slack for the source text).
  for (const st of DATA.stories) {
    const n = st.fixed.reduce((a, sec) => a + sec.s.reduce((b, x) => b + x[0].trim().split(/\s+/).length, 0), 0);
    expect(n).toBeGreaterThanOrEqual(135);
    expect(n).toBeLessThanOrEqual(170);
  }
});

test('mastery: nhại + dịch per sentence, frames unlock in order at 70%', () => {
  const st = DATA.stories[0];
  const [f0, f1] = svc.framesOf(st).map((f) => f.keys);
  const db = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace('.', '_'), v]));
  // Frame 1 done (dịch + nhại); frame 2 only dịch = 50% → frame 3 still locked.
  let m = svc.masteryOf(st.id, { ok: [...f0, ...f1], shadow: db({ [f0[0]]: 90 }) });
  expect(m.frames[0].pct).toBe(100);
  expect(m.frames[1]).toEqual(expect.objectContaining({ pct: 50, open: true }));
  expect(m.frames[2].open).toBe(false);
  // + nhại >= 70 on both sentences of frame 2 → 100%, frame 3 opens; a 69 doesn't count.
  m = svc.masteryOf(st.id, { ok: [...f0, ...f1], shadow: db({ [f0[0]]: 90, [f1[0]]: 70, [f1[1]]: 90 }) });
  expect(m.frames[1].pct).toBe(100);
  expect(m.frames[2].open).toBe(true);
  expect(m.frames[3].open).toBe(false);
  m = svc.masteryOf(st.id, { ok: [], shadow: db({ [f1[0]]: 69, [f1[1]]: 69 }) });
  expect(m.frames[1].pct).toBe(0);
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
    .send({ v: svc.VERSION, read: true, ok: ['v0', 'v1', 'zzz', 'f99.0'], best: { vocab: 80, hack: 1 }, shadow: [['f1.0', 82], ['f1.1', 150], ['v0', 90], ['nope', 50], 'junk'] });
  expect(r.status).toBe(200);
  expect(r.body.progress.ok.sort()).toEqual(['v0', 'v1']);
  expect(r.body.progress.steps.read).toBe(true);
  expect(r.body.progress.steps.vocab).toBe(false);
  expect(r.body.progress.best).toEqual({ vocab: 80 });
  expect(r.body.progress.shadow).toEqual({ 'f1.0': 82, 'f1.1': 100 }); // sentences only, clamped

  // Shadow scores keep the best per sentence.
  r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ v: svc.VERSION, shadow: [['f1.0', 40], ['f1.1', 75]] });
  expect(r.body.progress.shadow).toEqual({ 'f1.0': 82, 'f1.1': 100 });

  // A tab opened before a content change (no / old version) can't post FIXED
  // keys onto the new sentences; its WHY / vocab keys still count.
  r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s))
    .send({ v: 2, ok: ['f2.0', 'w0.0'], shadow: [['f3.0', 90], ['w0.1', 80]] });
  expect(r.body.progress.ok).not.toContain('f2.0');
  expect(r.body.progress.ok).toContain('w0.0');
  expect(r.body.progress.shadow).toEqual({ 'f1.0': 82, 'f1.1': 100, 'w0.1': 80 });

  // A second device sends only what it knows — nothing is lost.
  r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ ok: ['v2'], read: false });
  expect(r.body.progress.ok.sort()).toEqual(['v0', 'v1', 'v2', 'w0.0']);
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
  await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ v: svc.VERSION, read: true, ok: keys });
  it = await item();
  expect(it.completed).toBe(false);

  // + shadowing >= 70% on every sentence → 100% → passed (no ④ Nói thử needed).
  const r = await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ v: svc.VERSION, shadow: shadowAll(keys, 80) });
  expect(r.body.progress.mastery.pct).toBe(100);
  expect(r.body.progress.masteredAt).toBeTruthy();
  expect(r.body.progress.completedAt).toBeNull(); // vocab + speak not done yet
  it = await item();
  expect(it.completed).toBe(true);

  // A story finished under the old 5-step rule (completedAt, no nhại yet)
  // keeps its pass even though it is only 50% under the new rule.
  const SpeakingPart2Progress = require('../../models/SpeakingPart2Progress');
  const old = await createPremiumStudent();
  await enrollStudent(cls, old);
  await SpeakingPart2Progress.create({ userId: old._id, storyId: st.id, read: true, ok: keys, speak: 1,
    stepsAt: { read: new Date(), vocab: new Date(), fixed: new Date(), why: new Date(), speak: new Date() },
    completedAt: new Date('2026-11-10T14:29:59Z') });
  const mineOld = await request(app).get('/api/assignments/mine').set(authH(old));
  const oldIt = mineOld.body.assignments.find((a) => a._id === asgId).resources[0];
  expect(oldIt.completed).toBe(true);

  // A bogus story id is refused.
  const bad = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t))
    .send({ title: 'x', resources: [{ kind: 'internal', resourceType: 'speaking_part2', resourceId: '000000000000000000000001' }] });
  expect(bad.status).toBe(400);
});

test('v3: pre-v3 FIXED keys move onto the matching v3 sentences; a story once passed stays passed', async () => {
  const SpeakingPart2Progress = require('../../models/SpeakingPart2Progress');
  const t = await createTeacher();
  const s = await createPremiumStudent();
  const cls = await createClassGroup({ teacher: t });
  await enrollStudent(cls, s);
  const st = DATA.stories[0]; // people: old f0.0 (intro, unchanged) + f4.3 → f3.2; old f1.0 (rewritten) dropped
  await SpeakingPart2Progress.create({ userId: s._id, storyId: st.id, ok: ['v0', 'f0.0', 'f1.0', 'f4.3', 'w0.0'],
    shadow: { f0_0: 90, f1_0: 95, f4_3: 80, w0_0: 75 }, masteredAt: new Date('2026-11-11T10:00:00Z') });

  const pr = await request(app).get('/api/speaking-part2/progress').set(authH(s));
  expect(pr.body.progress[st.id].ok.sort()).toEqual(['f0.0', 'f3.2', 'v0', 'w0.0']);
  expect(pr.body.progress[st.id].shadow).toEqual({ 'f0.0': 90, 'f3.2': 80, 'w0.0': 75 });

  // Saved in the new shape on the next write — and only once (no double move).
  await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ v: svc.VERSION, ok: ['f1.0'] });
  let doc = await SpeakingPart2Progress.findOne({ userId: s._id, storyId: st.id }).lean();
  expect(doc.v).toBe(svc.VERSION);
  expect(doc.ok.sort()).toEqual(['f0.0', 'f1.0', 'f3.2', 'v0', 'w0.0']);
  await request(app).put(`/api/speaking-part2/progress/${st.id}`).set(authH(s)).send({ v: svc.VERSION });
  doc = await SpeakingPart2Progress.findOne({ userId: s._id, storyId: st.id }).lean();
  expect(doc.ok).toContain('f1.0');
  expect(doc.ok).toContain('f3.2');

  // Reached 70% once (masteredAt) → the homework stays ticked at a lower %.
  const row = svc.STORY_ROWS.find((r) => r.code === st.id);
  const res = await request(app).post(`/api/classes/${cls._id}/assignments`).set(authH(t))
    .send({ title: 'Part 2', resources: [{ kind: 'internal', resourceType: 'speaking_part2', resourceId: row._id }] });
  const mine = await request(app).get('/api/assignments/mine').set(authH(s));
  const it = mine.body.assignments.find((a) => a._id === String(res.body.assignment._id)).resources[0];
  expect(it.completed).toBe(true);
});

test('story rows keep stable ids', () => {
  expect(String(svc.STORY_ROWS[0]._id)).toBe('773200000000000000000001');
  expect(svc.STORY_ROWS.map((r) => r.code)).toEqual(DATA.stories.map((s) => s.id));
});
