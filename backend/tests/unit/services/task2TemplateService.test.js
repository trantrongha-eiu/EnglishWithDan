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
