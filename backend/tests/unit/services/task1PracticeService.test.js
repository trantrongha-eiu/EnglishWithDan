const svc = require('../../../services/task1PracticeService');
const Task1Exercise = require('../../../models/Task1Exercise');

async function seedExercises() {
  await Task1Exercise.create([
    {
      skillType: 'data_description', module: 1, level: 'beginner', type: 'translation',
      instruction: 'Dịch câu sau sang tiếng Anh:', questionVi: 'Test câu dịch',
      primaryAnswer: 'Many students study online.', sampleAnswers: ['Many students study online.'],
    },
    {
      skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'error_correction',
      instruction: 'Sửa lỗi:', questionEn: 'Broken sentence', sentenceWithBlanks: 'Broken sentence',
      primaryAnswer: 'Fixed sentence here.', sampleAnswers: ['Fixed sentence here.'],
    },
    {
      skillType: 'data_description', module: 2, level: 'beginner', type: 'data_transform',
      instruction: 'Viết câu mô tả dữ liệu:', questionEn: 'Describe the data',
      primaryAnswer: 'The number of users rose sharply in 2020.', sampleAnswers: ['The number of users rose sharply in 2020.'],
    },
    {
      skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'fill_blank',
      instruction: 'Điền từ:', sentenceWithBlanks: 'The number ___ students', questionEn: 'The number ___ students',
      primaryAnswer: 'of', sampleAnswers: ['of'],
    },
    {
      skillType: 'noun_phrase', module: 1, level: 'beginner', type: 'multiple_choice',
      instruction: 'Chọn đáp án đúng:', questionEn: 'Pick one', options: ['A', 'B', 'C'], correctOptionIndex: 1,
      primaryAnswer: 'B',
    },
  ]);
}

describe('listExercises — answer-key stripping and word/letter hints', () => {
  test('never exposes primaryAnswer, sampleAnswers, or correctOptionIndex before submission', async () => {
    await seedExercises();
    const { exercises } = await svc.listExercises({});
    expect(exercises.length).toBe(5);
    for (const ex of exercises) {
      expect(ex.primaryAnswer).toBeUndefined();
      expect(ex.sampleAnswers).toBeUndefined();
      expect(ex.correctOptionIndex).toBeUndefined();
    }
  });

  test('adds a word-count + first-letter hint for translation/error_correction/data_transform', async () => {
    await seedExercises();
    const { exercises } = await svc.listExercises({});
    const translation = exercises.find(e => e.type === 'translation');
    expect(translation.answerWordCount).toBe(4);
    expect(translation.answerLetterHint).toBe('M___ s_______ s____ o_____.');

    const errorCorrection = exercises.find(e => e.type === 'error_correction');
    expect(errorCorrection.answerWordCount).toBe(3);

    const dataTransform = exercises.find(e => e.type === 'data_transform');
    expect(dataTransform.answerWordCount).toBe(8);
  });

  test('fill_blank gets a word count (needed by showFillBlankView\'s hint-chip-count logic) but never the letter pattern', async () => {
    await seedExercises();
    const { exercises } = await svc.listExercises({});
    const fillBlank = exercises.find(e => e.type === 'fill_blank');
    expect(fillBlank.answerWordCount).toBe(1); // "of"
    expect(fillBlank.answerLetterHint).toBeUndefined();
  });

  test('does not add a word count or letter hint for multiple_choice', async () => {
    await seedExercises();
    const { exercises } = await svc.listExercises({});
    const mc = exercises.find(e => e.type === 'multiple_choice');
    expect(mc.answerWordCount).toBeUndefined();
    expect(mc.answerLetterHint).toBeUndefined();
  });
});

describe('getTestQuestions — no answer-key or hints leaked, matches "no hints" exam design', () => {
  test('exam questions never carry primaryAnswer or answerWordCount/answerLetterHint', async () => {
    await seedExercises();
    const exercises = await svc.getTestQuestions({ count: 10 });
    expect(exercises.length).toBeGreaterThan(0);
    for (const ex of exercises) {
      expect(ex.primaryAnswer).toBeUndefined();
      expect(ex.sampleAnswers).toBeUndefined();
      expect(ex.correctOptionIndex).toBeUndefined();
      expect(ex.answerWordCount).toBeUndefined();
      expect(ex.answerLetterHint).toBeUndefined();
    }
  });
});
