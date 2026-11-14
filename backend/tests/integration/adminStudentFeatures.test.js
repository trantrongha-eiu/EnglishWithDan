// Admin surfaces added for student features that had none (2026-11-14):
// Shadowing (Video), Part 2 · 7 câu chuyện gốc, BXH vocab + Cửa hàng lửa.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const ShadowingLesson = require('../../models/ShadowingLesson');
const ShadowingAttempt = require('../../models/ShadowingAttempt');
const SpeakingPart2Progress = require('../../models/SpeakingPart2Progress');
const ShopPurchase = require('../../models/ShopPurchase');
const User = require('../../models/User');

const authH = u => ({ Authorization: `Bearer ${signTokenFor(u)}` });

function lesson(over = {}) {
  return ShadowingLesson.create({
    slug: over.slug || `l-${Math.random().toString(36).slice(2, 8)}`,
    title: over.title || 'Lesson', youtubeId: 'abc123', category: over.category || 'ielts-part1',
    clipStart: 0, clipEnd: 20, isPublished: over.isPublished ?? true,
    segments: [{ start: 0, end: 5, text: 'Hello there.', vi: 'Xin chào.' }, { start: 5, end: 9, text: 'How are you?' }],
  });
}

describe('admin Shadowing', () => {
  test('student is blocked', async () => {
    const s = await createStudent();
    const res = await request(app).get('/api/admin/shadowing/lessons').set(authH(s));
    expect(res.status).toBe(403);
  });

  test('lists lessons with category counts + practice stats, filters by category / published', async () => {
    const t = await createTeacher();
    const s = await createStudent();
    const a = await lesson({ title: 'Part one', category: 'ielts-part1' });
    await lesson({ title: 'Hidden fun', category: 'fun-shorts', isPublished: false });
    await ShadowingAttempt.create({ userId: s._id, lessonId: a._id, mode: 'dictation', avgScore: 80 });
    await ShadowingAttempt.create({ userId: s._id, lessonId: a._id, mode: 'shadowing', avgScore: 60 });

    const res = await request(app).get('/api/admin/shadowing/lessons').set(authH(t));
    expect(res.status).toBe(200);
    expect(res.body.lessons).toHaveLength(2);
    expect(res.body.lessons[0].segments).toBeUndefined();
    const row = res.body.lessons.find(l => l.title === 'Part one');
    expect(row).toMatchObject({ attempts: 2, students: 1, avgScore: 70 });
    const fun = res.body.categories.find(c => c.key === 'fun-shorts');
    expect(fun).toMatchObject({ total: 1, published: 0, label: 'Video ngắn vui' });

    const hidden = await request(app).get('/api/admin/shadowing/lessons?published=false').set(authH(t));
    expect(hidden.body.lessons.map(l => l.title)).toEqual(['Hidden fun']);
    const byCat = await request(app).get('/api/admin/shadowing/lessons?category=ielts-part1').set(authH(t));
    expect(byCat.body.lessons.map(l => l.title)).toEqual(['Part one']);
  });

  test('edits sentence wording (not timing / count) and toggles publish', async () => {
    const t = await createTeacher();
    const l = await lesson();
    const bad = await request(app).put(`/api/admin/shadowing/lessons/${l._id}`).set(authH(t))
      .send({ segments: [{ text: 'only one' }] });
    expect(bad.status).toBe(400);

    const ok = await request(app).put(`/api/admin/shadowing/lessons/${l._id}`).set(authH(t))
      .send({ isPublished: false, level: 'B2', segments: [{ text: 'Hi there.', vi: 'Chào.', start: 99 }, { answer: 'how are you' }] });
    expect(ok.status).toBe(200);
    const saved = await ShadowingLesson.findById(l._id).lean();
    expect(saved.isPublished).toBe(false);
    expect(saved.level).toBe('B2');
    expect(saved.segments[0]).toMatchObject({ text: 'Hi there.', vi: 'Chào.', start: 0 });
    expect(saved.segments[1]).toMatchObject({ text: 'How are you?', answer: 'how are you' });
  });

  test('publishes / hides a whole category', async () => {
    const t = await createTeacher();
    await lesson({ category: 'comedy' });
    await lesson({ category: 'comedy' });
    await lesson({ category: 'grammar' });
    const res = await request(app).patch('/api/admin/shadowing/categories/comedy/publish').set(authH(t)).send({ isPublished: false });
    expect(res.body.modified).toBe(2);
    expect(await ShadowingLesson.countDocuments({ isPublished: false })).toBe(2);
    const bad = await request(app).patch('/api/admin/shadowing/categories/nope/publish').set(authH(t)).send({ isPublished: false });
    expect(bad.status).toBe(400);
  });
});

describe('admin Speaking Part 2 overview', () => {
  test('per-story counts + per-student rows (students only)', async () => {
    const t = await createTeacher();
    const s = await createStudent({ firstName: 'Lan', lastName: 'Tran' });
    await SpeakingPart2Progress.create({ userId: s._id, storyId: 'people', read: true, masteredAt: new Date() });
    await SpeakingPart2Progress.create({ userId: t._id, storyId: 'people', read: true });
    const res = await request(app).get('/api/admin/speaking-part2/overview').set(authH(t));
    expect(res.status).toBe(200);
    expect(res.body.stories).toHaveLength(7);
    expect(res.body.stories.find(x => x.id === 'people')).toMatchObject({ students: 1, mastered: 1 });
    expect(res.body.rows).toHaveLength(1);
    expect(res.body.rows[0]).toMatchObject({ storyId: 'people', name: 'Lan Tran' });
    expect(res.body.rows[0].steps.read).toBe(true);
  });
});

describe('admin Shop overview', () => {
  test('players, purchases and catalog', async () => {
    const t = await createTeacher();
    const s = await createStudent({ firstName: 'Minh' });
    await User.updateOne({ _id: s._id }, { $set: { flameWallet: 42, pets: ['meo'] } });
    await ShopPurchase.create({ userId: s._id, name: 'Minh', kind: 'item', key: 'cake', itemName: 'Bánh kem', price: 10 });
    const res = await request(app).get('/api/admin/shop/overview').set(authH(t));
    expect(res.status).toBe(200);
    expect(res.body.players.find(p => String(p._id) === String(s._id))).toMatchObject({ wallet: 42, pets: 1 });
    expect(res.body.stats.spent30d).toBe(10);
    expect(res.body.purchases).toHaveLength(1);
    expect(res.body.catalog.items.length).toBeGreaterThan(0);
  });

  test('student is blocked', async () => {
    const s = await createStudent();
    const res = await request(app).get('/api/admin/shop/overview').set(authH(s));
    expect(res.status).toBe(403);
  });
});
