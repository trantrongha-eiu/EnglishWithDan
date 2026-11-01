// Tenses lessons: teaching video + drills merged in from tenseExtras.js.
// Pure data checks — no DB involved.
const { lessons } = require('../../../scripts/seedEssentialGrammar');
const EssentialGrammarLesson = require('../../../models/EssentialGrammarLesson');

const tenses = lessons.filter(l => l.category === 'Tenses');
const blockOf = (lesson, type) => lesson.blocks.find(b => b.type === type);

describe('Tenses lesson extras', () => {
  test('there are 12 tense lessons', () => {
    expect(tenses).toHaveLength(12);
  });

  test.each(tenses.map(l => [l.lessonKey, l]))('%s has a video, a conjugation drill and a translation drill', (_key, lesson) => {
    const video = blockOf(lesson, 'video');
    expect(video).toBeTruthy();
    expect(video.data.videos.length).toBeGreaterThan(0);
    video.data.videos.forEach(v => expect(v.youtubeId).toMatch(/^[\w-]{11}$/));

    expect(blockOf(lesson, 'conjugation_drill').data.items.length).toBeGreaterThanOrEqual(10);
    expect(blockOf(lesson, 'translation_drill').data.items.length).toBeGreaterThanOrEqual(10);
  });

  test('each lesson has its own main video', () => {
    const ids = tenses.map(l => blockOf(l, 'video').data.videos[0].youtubeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('Past Simple drills V0 → V2 and Present Perfect drills V0 → V3; no other tense has a verb drill', () => {
    const byKey = Object.fromEntries(tenses.map(l => [l.lessonKey, l]));
    expect(blockOf(byKey['past-simple'], 'verb_forms').data.target).toBe('past');
    expect(blockOf(byKey['present-perfect'], 'verb_forms').data.target).toBe('pastParticiple');
    expect(blockOf(byKey['past-simple'], 'verb_forms').data.items.length).toBeGreaterThanOrEqual(30);
    expect(blockOf(byKey['present-perfect'], 'verb_forms').data.items.length).toBeGreaterThanOrEqual(30);
    tenses
      .filter(l => !['past-simple', 'present-perfect'].includes(l.lessonKey))
      .forEach(l => expect(blockOf(l, 'verb_forms')).toBeUndefined());
  });

  test('irregular forms are right for a sample of verbs', () => {
    const items = blockOf(tenses.find(l => l.lessonKey === 'present-perfect'), 'verb_forms').data.items;
    const v = Object.fromEntries(items.map(i => [i.base, i]));
    expect(v.go.pastParticiple).toEqual(['gone']);
    expect(v.be.past).toEqual(['was', 'were']);
    expect(v.write.pastParticiple).toEqual(['written']);
    expect(v.study.pastParticiple).toEqual(['studied']);
  });

  test('every conjugation sentence has exactly one blank', () => {
    tenses.forEach(l => blockOf(l, 'conjugation_drill').data.items.forEach(item => {
      expect(item.sentence.split('___')).toHaveLength(2);
    }));
  });

  test('video block sits right after the overview; drills sit between practice and quiz', () => {
    tenses.forEach(l => {
      const types = l.blocks.map(b => b.type);
      expect(types.indexOf('video')).toBe(types.indexOf('overview') + 1);
      expect(types.indexOf('translation_drill')).toBeGreaterThan(types.indexOf('practice_exercises'));
      expect(types.indexOf('translation_drill')).toBeLessThan(types.indexOf('quiz'));
    });
  });

  test('the model accepts every block type the seed produces', () => {
    const allowed = EssentialGrammarLesson.schema.path('blocks').schema.path('type').enumValues;
    lessons.forEach(l => l.blocks.forEach(b => expect(allowed).toContain(b.type)));
  });
});
