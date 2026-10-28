const svc = require('../../../services/task2TemplateProgressService');
const Task2TemplateProgress = require('../../../models/Task2TemplateProgress');
const { createStudent } = require('../../factories/userFactory');

const DAY = 24 * 60 * 60 * 1000;

describe('task2TemplateProgressService.saveProgress', () => {
  test('rejects an invalid level or typeId', async () => {
    const s = await createStudent();
    expect(await svc.saveProgress(s._id, 'band9', 'type01', {})).toBeNull();
    expect(await svc.saveProgress(s._id, 'band6', '$where', {})).toBeNull();
  });

  test('sets a step date once and never moves it', async () => {
    const s = await createStudent();
    const t1 = new Date('2026-10-01T00:00:00Z');
    const t2 = new Date('2026-10-05T00:00:00Z');
    await svc.saveProgress(s._id, 'band6', 'type01', { steps: { warmup: true } }, t1);
    const p = await svc.saveProgress(s._id, 'band6', 'type01', { steps: { warmup: true, read: true } }, t2);
    expect(new Date(p.steps.warmup).getTime()).toBe(t1.getTime());
    expect(new Date(p.steps.read).getTime()).toBe(t2.getTime());
  });

  test('keeps the best scores and drill rounds, clamps mastery, drops bad keys', async () => {
    const s = await createStudent();
    await svc.saveProgress(s._id, 'band7', 'type02', { warmupScore: 90, drillRounds: [3, 1], mastery: { '0-0': 4 } });
    const p = await svc.saveProgress(s._id, 'band7', 'type02', {
      warmupScore: 50, drillRounds: [1, 2, 1], mastery: { '0-0': 9, '1-2': -3, 'x.y': 3, '$gt': 1 },
    });
    expect(p.warmupScore).toBe(90);
    expect(p.drillRounds).toEqual([3, 2, 1]);
    expect(p.mastery).toEqual({ '0-0': 5, '1-2': 0 });
  });

  test('levels are stored separately', async () => {
    const s = await createStudent();
    await svc.saveProgress(s._id, 'band6', 'type01', { steps: { warmup: true } });
    const b7 = await svc.getProgress(s._id, 'band7');
    const b6 = await svc.getProgress(s._id, 'band6');
    expect(b7).toHaveLength(0);
    expect(b6).toHaveLength(1);
  });

  test('schedules review after assemble, then spaces it out on a pass and resets on a fail', async () => {
    const s = await createStudent();
    const t0 = new Date('2026-10-01T00:00:00Z');
    let p = await svc.saveProgress(s._id, 'band6', 'type03', { steps: { assemble: true } }, t0);
    expect(new Date(p.nextReviewAt).getTime()).toBe(t0.getTime() + 1 * DAY);

    const t1 = new Date('2026-10-02T00:00:00Z');
    p = await svc.saveProgress(s._id, 'band6', 'type03', { reviewDone: true, reviewScore: 80 }, t1);
    expect(p.reviewStage).toBe(1);
    expect(new Date(p.nextReviewAt).getTime()).toBe(t1.getTime() + 3 * DAY);

    const t2 = new Date('2026-10-05T00:00:00Z');
    p = await svc.saveProgress(s._id, 'band6', 'type03', { reviewDone: true, reviewScore: 30 }, t2);
    expect(p.reviewStage).toBe(0);
    expect(new Date(p.nextReviewAt).getTime()).toBe(t2.getTime() + 1 * DAY);
  });

  test('ignores reviewDone before the essay has been assembled', async () => {
    const s = await createStudent();
    const p = await svc.saveProgress(s._id, 'band6', 'type04', { reviewDone: true });
    expect(p.nextReviewAt).toBeNull();
    expect(p.reviewStage).toBe(0);
  });

  test('truncates the applied essay and reset deletes the row', async () => {
    const s = await createStudent();
    const p = await svc.saveProgress(s._id, 'band6', 'type05', { applyText: ['a'.repeat(7000), 'b'] });
    expect(p.applyText[0]).toHaveLength(6000);
    await svc.saveProgress(s._id, 'band6', 'type05', { reset: true });
    expect(await Task2TemplateProgress.countDocuments({ userId: s._id })).toBe(0);
  });
});
