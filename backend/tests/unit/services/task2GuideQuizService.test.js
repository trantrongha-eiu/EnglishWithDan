const svc = require('../../../services/task2GuideQuizService');
const { createStudent } = require('../../factories/userFactory');

describe('task2GuideQuizService', () => {
  test('rejects a bad type, section or score', async () => {
    const s = await createStudent();
    expect((await svc.saveResult(s._id, '$where', { section: 'recognise', correct: 9, total: 10 })).error).toBeTruthy();
    expect((await svc.saveResult(s._id, 'type01', { section: 'nope', correct: 9, total: 10 })).error).toBeTruthy();
    expect((await svc.saveResult(s._id, 'type01', { section: 'recognise', correct: 11, total: 10 })).error).toBeTruthy();
    expect((await svc.saveResult(s._id, 'type01', { section: 'recognise', correct: 2, total: 2 })).error).toBeTruthy();
  });

  test('a section needs the one before it passed', async () => {
    const s = await createStudent();
    expect((await svc.saveResult(s._id, 'type01', { section: 'outline', correct: 10, total: 10 })).error).toBeTruthy();
    await svc.saveResult(s._id, 'type01', { section: 'recognise', correct: 10, total: 10 });
    const out = await svc.saveResult(s._id, 'type01', { section: 'outline', correct: 10, total: 10 });
    expect(out.passed).toBe(true);
  });

  test('passes at 90% exactly, keeps the best score and the first pass date', async () => {
    const s = await createStudent();
    const t1 = new Date('2026-11-01T00:00:00Z');
    let out = await svc.saveResult(s._id, 'type02', { section: 'recognise', correct: 8, total: 10 }, t1);
    expect(out.passed).toBe(false);
    expect(out.progress.sections.recognise.passedAt).toBeNull();
    out = await svc.saveResult(s._id, 'type02', { section: 'recognise', correct: 9, total: 10 }, t1);
    expect(out.passed).toBe(true);
    out = await svc.saveResult(s._id, 'type02', { section: 'recognise', correct: 5, total: 10 }, new Date('2026-11-05T00:00:00Z'));
    const r = out.progress.sections.recognise;
    expect(r.best).toBe(90);
    expect(r.tries).toBe(3);
    expect(new Date(r.passedAt).getTime()).toBe(t1.getTime());
    // 26/29 rounds to 90% but is below the bar
    const s2 = await createStudent();
    expect((await svc.saveResult(s2._id, 'type02', { section: 'recognise', correct: 26, total: 29 })).passed).toBe(false);
  });

  test('getAll lists one row per type', async () => {
    const s = await createStudent();
    await svc.saveResult(s._id, 'type01', { section: 'recognise', correct: 10, total: 10 });
    await svc.saveResult(s._id, 'type03', { section: 'recognise', correct: 4, total: 10 });
    const rows = await svc.getAll(s._id);
    expect(rows.map((r) => r.typeId).sort()).toEqual(['type01', 'type03']);
    expect(rows.find((r) => r.typeId === 'type01').sections.recognise.passedAt).toBeTruthy();
  });
});
