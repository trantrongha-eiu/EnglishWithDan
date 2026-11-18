// "Đánh vần tên & số dài" dictation drills (models/DictationDrill.js):
// listed with the Listening sections on dictation.html, fetched by slug,
// saved as a DictationAttempt with drillId, viewable from admin history.
// Plus the transcript miner that builds them (scripts/dictationDrills).
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, signTokenFor } = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');
const DictationDrill = require('../../models/DictationDrill');
const DictationAttempt = require('../../models/DictationAttempt');
const { mineSource, lettersOf } = require('../../scripts/dictationDrills/buildDictationDrills');
const { encodeTiming } = require('../../services/transcriptTimingService');

const item = (answer, i) => ({
  kind: 'spell', answer, text: `It's ${answer}.`, audioUrl: 'https://media.example.com/a.mp3',
  start: i * 5, end: i * 5 + 3, sourceType: 'section', sourceId: 'x', sourceTitle: 'Hotel booking', partNumber: 1,
});

async function seedDrill(over = {}) {
  return DictationDrill.create({
    slug: 'spelling-1', title: 'Spelling names & words · Set 1', category: 'spelling', order: 0,
    items: ['Jamieson', 'Keogh', 'Docherty'].map(item), ...over,
  });
}

describe('dictation drills API', () => {
  test('list returns published drills next to sections, without course sections', async () => {
    const student = await createStudent();
    await seedDrill();
    await seedDrill({ slug: 'old-1', isPublished: false });
    const sent = [{ text: 'Hello there everyone today.', start: 0, end: 2 }];
    await createListeningSection({ title: 'Bài lẻ', extra: { dictationSentences: sent } });
    await createListeningSection({ title: 'Mindset clip', extra: { dictationSentences: sent, courseRef: 'MINDSET-1' } });

    const res = await request(app).get('/api/listening/dictation/list').set('Authorization', `Bearer ${signTokenFor(student)}`);
    expect(res.status).toBe(200);
    expect(res.body.sections.map((s) => s.title)).toEqual(['Bài lẻ']);
    expect(res.body.drills).toEqual([expect.objectContaining({ slug: 'spelling-1', category: 'spelling', itemCount: 3 })]);
  });

  test('a drill is fetched by slug with its clips and answers; unknown → 404', async () => {
    const student = await createStudent();
    await seedDrill();
    const auth = { Authorization: `Bearer ${signTokenFor(student)}` };
    const res = await request(app).get('/api/listening/dictation/drill/spelling-1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.drill.items[1]).toEqual(expect.objectContaining({ answer: 'Keogh', audioUrl: 'https://media.example.com/a.mp3', start: 5, end: 8 }));
    expect((await request(app).get('/api/listening/dictation/drill/nope-9').set(auth)).status).toBe(404);
  });

  test('saving a drill session stores drillId and shows in admin attempt detail', async () => {
    const student = await createStudent();
    const teacher = await createTeacher();
    const drill = await seedDrill();
    const res = await request(app)
      .post('/api/listening/dictation/save-attempt')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ drillSlug: 'spelling-1', answers: [
        { sentenceIndex: 0, isCorrect: true, matchedWords: 1, totalWords: 1 },
        { sentenceIndex: 2, isCorrect: false, matchedWords: 0, totalWords: 1 },
      ] });
    expect(res.status).toBe(200);
    expect(res.body.correctCount).toBe(1);
    const a = await DictationAttempt.findOne({ userId: student._id }).lean();
    expect(String(a.drillId)).toBe(String(drill._id));
    expect(a.sectionId).toBeUndefined();
    expect(a.sectionTitle).toBe('Spelling names & words · Set 1');

    const detail = await request(app).get(`/api/admin/attempt-detail/dictation/${a._id}`).set('Authorization', `Bearer ${signTokenFor(teacher)}`);
    expect(detail.status).toBe(200);
    expect(detail.body.detail.items.map((x) => x.prompt)).toEqual(['Jamieson — "It\'s Jamieson."', 'Docherty — "It\'s Docherty."']);
  });

  test('unknown drill slug → 404, no attempt', async () => {
    const student = await createStudent();
    const res = await request(app)
      .post('/api/listening/dictation/save-attempt')
      .set('Authorization', `Bearer ${signTokenFor(student)}`)
      .send({ drillSlug: 'missing', answers: [{ sentenceIndex: 0, isCorrect: true, matchedWords: 1, totalWords: 1 }] });
    expect(res.status).toBe(404);
    expect(await DictationAttempt.countDocuments()).toBe(0);
  });
});

describe('buildDictationDrills miner', () => {
  // one [start,end] per whitespace token, 0.5 s each
  const src = (transcript) => {
    const n = transcript.split(/\s+/).filter(Boolean).length;
    return {
      _id: 'sec1', sourceType: 'section', title: 'T', partNumber: 1, audioUrl: 'u', transcript,
      transcriptTiming: encodeTiming(Array.from({ length: n }, (_, i) => [i * 0.5, i * 0.5 + 0.4])),
    };
  };
  const { decodeTiming } = require('../../services/transcriptTimingService');

  test('letters: hyphens, "double", split tokens', () => {
    expect(lettersOf('K-I-double-P-A-X.')).toBe('KIPPAX');
    expect(lettersOf('Jamieson')).toBeNull();
  });

  test('spelled names, first + last name, a question corrected next, and phone numbers', () => {
    const items = mineSource(src(
      'MAN: Can I have your name? WOMAN: I\'m Sam Dressler. That\'s S-A-M, D-R-E-S-S-L-E-R. ' +
      'MAN: Is that L-double-E? WOMAN: No. It\'s L-E-I-G-H. ' +
      'MAN: And can I take a contact phone number? WOMAN: Sure, it\'s 07958 847 222. ' +
      'MAN: My home number\'s 951 674 3124, but ring me on 0778 962 455 instead.',
    ), decodeTiming);
    const answers = items.map((x) => x.answer);
    expect(answers).toContain('Sam Dressler');
    expect(answers).toContain('Leigh');
    expect(answers).not.toContain('Lee');           // the corrected question
    expect(answers).toContain('07958 847 222');
    expect(answers).not.toContain('951 674 3124');  // two numbers in one clip: ambiguous
    const sam = items.find((x) => x.answer === 'Sam Dressler');
    expect(sam.end).toBeGreaterThan(sam.start);
    expect(sam.text).not.toMatch(/WOMAN:/);
  });

  test('a clip covers only the item: name + spelling, number, read-back, unit', () => {
    const items = mineSource(src(
      "WOMAN: When you arrive, ask for Gerald. That's G-E-R-A-L-D. " +
      'MAN: The reference is 4471 9082 and that is all. WOMAN: 4471 9082, thanks. ' +
      'MAN: The whole project cost us £2 million in the end.',
    ), decodeTiming);
    const by = (a) => items.find((x) => x.answer === a);

    const name = by('Gerald');
    expect(name.clip.target).toBe('GERALD');
    expect(name.clip.nameTarget).toBe('GERALD');
    expect(name.clip.parts).toEqual({ name: "Gerald. That's", core: 'G-E-R-A-L-D.', repeat: null });

    const num = by('4471 9082');
    expect(num.clip.parts.core).toBe('4471 9082');
    expect(num.clip.hasRepeat).toBe(true);
    expect(num.clip.parts.repeat).toBe('and that is all. 4471 9082');

    // a scale word changes the value, so it is part of what to type
    const price = by('£2 million');
    expect(price.clip.target).toBe('2');
    expect(price.clip.parts.core).toBe('£2 million');
  });
});
