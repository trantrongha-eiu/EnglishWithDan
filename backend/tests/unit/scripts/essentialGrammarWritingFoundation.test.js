// Writing Foundation lessons (writingFoundation*.js) — pure data checks, no DB.
const { lessons } = require('../../../scripts/seedEssentialGrammar');
const { lesson } = require('../../../scripts/essentialGrammarData/builder');

const wf = lessons.filter(l => l.category === 'Writing Foundation');
const blocksOf = (l, type) => l.blocks.filter(b => b.type === type);

describe('Writing Foundation lessons', () => {
  test('8 lessons, in order, after every other category', () => {
    expect(wf.map(l => l.lessonKey)).toEqual([
      'sb-subject-verb', 'sb-subject-be', 'sb-building-skills', 'sb-and-but-so',
      'sb-because-although-despite', 'sb-relative-clauses', 'sb-sentences-to-paragraphs', 'sb-review'
    ]);
    const maxOther = Math.max(...lessons.filter(l => l.category !== 'Writing Foundation').map(l => l.orderIndex));
    wf.forEach(l => expect(l.orderIndex).toBeGreaterThan(maxOther));
  });

  test('lessonKeys are unique across the whole handbook (they are the URL slug)', () => {
    const keys = lessons.map(l => l.lessonKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test.each(wf.map(l => [l.lessonKey, l]))('%s has named drills with items', (_key, l) => {
    const drills = [...blocksOf(l, 'conjugation_drill'), ...blocksOf(l, 'translation_drill')];
    expect(blocksOf(l, 'conjugation_drill').length).toBeGreaterThanOrEqual(1);
    expect(blocksOf(l, 'translation_drill').length).toBeGreaterThanOrEqual(1);
    drills.forEach(b => {
      expect(b.data.title).toEqual(expect.any(String));
      expect(b.data.intro).toEqual(expect.any(String));
      expect(b.data.items.length).toBeGreaterThanOrEqual(8);
    });
    blocksOf(l, 'conjugation_drill').forEach(b => b.data.items.forEach(item => {
      expect(item.sentence.split('___')).toHaveLength(2);
    }));
  });

  test('practice questions are tagged with one of the 5 learning steps', () => {
    const STEP_RE = /^\[(Hiểu nghĩa|Chọn cấu trúc|Viết câu|Mở rộng câu|Kết nối câu)\] /;
    wf.forEach(l => blocksOf(l, 'practice_exercises')[0].data.exercises.forEach(e => {
      expect(e.question).toMatch(STEP_RE);
    }));
  });

  test('multiple-choice answer keys point at a real option', () => {
    wf.forEach(l => {
      const mcs = [
        ...blocksOf(l, 'practice_exercises')[0].data.exercises.filter(e => e.type === 'multiple_choice'),
        ...blocksOf(l, 'quiz')[0].data.questions
      ];
      mcs.forEach(q => {
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(q.options.length);
      });
    });
  });

  test('review lesson turns the 4 review exercises into self-check drills', () => {
    const review = wf.find(l => l.lessonKey === 'sb-review');
    expect(blocksOf(review, 'conjugation_drill').map(b => b.data.title)).toEqual(['Exercise 1: Điền BE hoặc động từ thường']);
    expect(blocksOf(review, 'translation_drill').map(b => b.data.title)).toEqual([
      'Exercise 2: Dịch sang tiếng Anh', 'Exercise 3: Viết câu hoàn chỉnh từ từ gợi ý', 'Exercise 4: Sửa lỗi sai'
    ]);
  });
});

describe('builder: drill groups + multiple tables', () => {
  const base = () => {
    const src = wf[0];
    const pick = t => src.blocks.find(b => b.type === t).data;
    return {
      category: 'X', lessonKey: 'x', title: 'X', orderIndex: 1,
      examples: pick('examples').items, mistakes: pick('common_mistakes').items,
      exercises: pick('practice_exercises').exercises, quiz: pick('quiz').questions
    };
  };

  test('comparison may be an array — one block per table', () => {
    const l = lesson({ ...base(), comparison: [{ title: 'A', headers: [], rows: [] }, { title: 'B', headers: [], rows: [] }] });
    expect(l.blocks.filter(b => b.type === 'comparison').map(b => b.data.title)).toEqual(['A', 'B']);
  });

  test('a drill group without items, or with a blank-less sentence, fails loudly', () => {
    expect(() => lesson({ ...base(), conjugationDrills: [{ title: 'T', items: [] }] })).toThrow(/no items/);
    expect(() => lesson({ ...base(), conjugationDrills: [{ items: [{ sentence: 'no blank', answers: ['a'] }] }] })).toThrow(/___/);
    expect(() => lesson({ ...base(), translationDrills: [{ title: ' ', items: [{ vi: 'x', answers: ['y'] }] }] })).toThrow(/empty title/);
  });
});
