const svc = require('../../../services/task2TemplateService');
const Task2TemplateAttempt = require('../../../models/Task2TemplateAttempt');
const { createStudent } = require('../../factories/userFactory');

describe('task2TemplateService.saveAttempt — mode field', () => {
  test('defaults to "cloze" when mode is omitted, so existing callers keep working unchanged', async () => {
    const student = await createStudent();
    await svc.saveAttempt({
      userId: student._id, templateType: 'type01', templateName: 'Type 01',
      totalItems: 5, correctItems: 4,
    });

    const saved = await Task2TemplateAttempt.findOne({ userId: student._id }).lean();
    expect(saved.mode).toBe('cloze');
  });

  test('stores the given mode when provided', async () => {
    const student = await createStudent();
    await svc.saveAttempt({
      userId: student._id, templateType: 'type01', templateName: 'Type 01',
      totalItems: 5, correctItems: 5, mode: 'translation',
    });

    const saved = await Task2TemplateAttempt.findOne({ userId: student._id }).lean();
    expect(saved.mode).toBe('translation');
  });
});

describe('task2TemplateService.getHistory — mode field', () => {
  test('includes mode in the projected fields', async () => {
    const student = await createStudent();
    await svc.saveAttempt({
      userId: student._id, templateType: 'type02', templateName: 'Type 02',
      totalItems: 3, correctItems: 2, mode: 'translation',
    });

    const history = await svc.getHistory(student._id, 10);
    expect(history).toHaveLength(1);
    expect(history[0].mode).toBe('translation');
  });
});

describe('task2TemplateService.saveAttempt — isExam/timeTakenSec fields', () => {
  test('defaults isExam to false when omitted', async () => {
    const student = await createStudent();
    await svc.saveAttempt({
      userId: student._id, templateType: 'type01', templateName: 'Type 01',
      totalItems: 5, correctItems: 4,
    });

    const saved = await Task2TemplateAttempt.findOne({ userId: student._id }).lean();
    expect(saved.isExam).toBe(false);
  });

  test('stores isExam:true and timeTakenSec when provided', async () => {
    const student = await createStudent();
    await svc.saveAttempt({
      userId: student._id, templateType: 'type01', templateName: 'Type 01',
      totalItems: 10, correctItems: 8, mode: 'translation', isExam: true, timeTakenSec: 245,
    });

    const saved = await Task2TemplateAttempt.findOne({ userId: student._id }).lean();
    expect(saved.isExam).toBe(true);
    expect(saved.timeTakenSec).toBe(245);
  });
});

describe('task2TemplateService.listAttemptsForAdmin', () => {
  test('filters by isExam and populates student info', async () => {
    const student = await createStudent();
    await svc.saveAttempt({
      userId: student._id, templateType: 'type03', templateName: 'Type 03',
      totalItems: 6, correctItems: 6, mode: 'dictation', isExam: true, timeTakenSec: 300,
    });
    await svc.saveAttempt({
      userId: student._id, templateType: 'type03', templateName: 'Type 03',
      totalItems: 6, correctItems: 3, mode: 'dictation',
    });

    const { attempts, total } = await svc.listAttemptsForAdmin({ isExam: true });
    expect(total).toBe(1);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].isExam).toBe(true);
    expect(attempts[0].userId.username).toBe(student.username);
  });
});
