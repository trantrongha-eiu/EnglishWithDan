// Listening Tips → practice for the question-type tips (phase 3): one
// existing section, only its questions of the tip's type (by content, not
// the hand-entered type alone), in their original order, each with its own
// stretch of audio; no answer key in the payload; one-answer-at-a-time
// grading with the bank's own rules.
const request = require('supertest');
const app = require('../../app');
const ListeningTip = require('../../models/ListeningTip');
const { createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');

const TYPE_TIPS = ['form-note-table-completion', 'multiple-choice', 'matching', 'map-plan-diagram', 'sentence-completion', 'multiple-answers'];

const LINES = [
  'Welcome to the Sunny Holiday Club.',
  'Please write your postcode, it is BS4 7JN.',
  'The trip is on the 5th of June.',
  'You need to bring a raincoat.',
  'The cost is £40 for the week.',
  'Most children enjoy the swimming lessons the most.',
  'The club was started by a local teacher.',
  'Parents can collect children at 5 pm.',
  'Anna will teach painting, which she loves.',
  'Ben will run the football games.',
  'Clara works in the kitchen.',
  'The two best things are the lake and the forest.',
  'The office is next to the main gate.',
  'The café is opposite the car park.',
  'The first-aid room is behind the hall.',
  'Children must wear a hat outside.',
  'Lunch is served in the dining room.',
  'The club closes on Friday.',
];
const TRANSCRIPT = ['❓ Transcript', 'Holiday club', ...LINES].join('\n');
const DICTATION = LINES.map((text, i) => ({ text, start: 30 + i * 10, end: 30 + i * 10 + 6 }));

const quote = (s) => `Vị trí: …\n\nTranscript: "${s}"\n\nPhân tích: …`;
const fill = (n, key, explanation = '') => ({ questionNumber: n, type: 'fill-blank', questionText: `Q${n}`, correctAnswer: key, explanation });
const mcq = (n, text, options, key, explanation) => ({ questionNumber: n, type: 'multiple-choice', questionText: text, options, correctAnswer: key, explanation });
const letter = (n, text, key, type, explanation = '') => ({ questionNumber: n, type, questionText: text, correctAnswer: key, explanation });

const FORM = {
  groupType: 'note-form', instruction: 'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.',
  noteConfig: { title: 'Booking form', lines: ['Postcode: __Q1__', 'Date of trip: __Q2__ June', 'Bring a __Q3__', 'Cost: £ __Q4__ per week'] },
  questions: [fill(1, 'BS4 7JN'), fill(2, '5th/5'), fill(3, 'raincoat'), fill(4, '40')],
};
const MCQ = {
  groupType: 'plain', instruction: 'Choose the correct letter, A, B or C.',
  questions: [
    mcq(5, 'What do children enjoy most?', ['painting', ' swimming', 'football'], 'B', quote('Most children enjoy the swimming lessons the most.')),
    mcq(6, 'Who started the club?', ['a parent', 'a teacher', 'a doctor'], 'B', quote('The club was started by a local teacher.')),
    mcq(7, 'When can parents collect children?', ['3 pm', '4 pm', '5 pm'], 'C', quote('Parents can collect children at 5 pm.')),
  ],
};
const MATCHING = {
  groupType: 'matching-options', instruction: 'What does each person do? Write the correct letter, A, B or C.',
  matchingOptions: ['teaches art', 'runs sports', 'cooks meals'], matchingOptionsTitle: 'Jobs', matchingReuseAllowed: false,
  questions: [
    letter(8, 'Anna', 'A', 'matching-info', quote('Anna will teach painting, which she loves.')),
    letter(9, 'Ben', 'B', 'matching-info', quote('Ben will run the football games.')),
    letter(10, 'Clara', 'C', 'matching-info', quote('Clara works in the kitchen.')),
  ],
};
const TWO = ['the lake', 'the forest', 'the food', 'the beach', 'the museum'];
const MULTI = {
  groupType: 'plain', instruction: 'Choose TWO letters, A-E.',
  questions: [
    { questionNumber: 11, type: 'multi-answer-group', questionText: 'Which TWO things does the speaker like best?', options: TWO, correctAnswer: 'A', explanation: quote('The two best things are the lake and the forest.') },
    { questionNumber: 12, type: 'multi-answer-group', questionText: 'Which TWO things does the speaker like best?', options: TWO, correctAnswer: 'B', explanation: '' },
  ],
};
const MAP = {
  groupType: 'map', instruction: 'Label the map below. Write the correct letter, A–F, next to Questions 13–15.',
  imageUrl: 'https://res.cloudinary.com/demo/image/upload/map.png',
  questions: [
    letter(13, 'Office ____', 'C', 'map-labelling', quote('The office is next to the main gate.')),
    letter(14, 'Café', 'E', 'map-labelling', quote('The café is opposite the car park.')),
    letter(15, 'First-aid room', 'A', 'map-labelling', quote('The first-aid room is behind the hall.')),
  ],
};
const SENTENCES = {
  groupType: 'note-form', instruction: 'Complete the sentences below. Write ONE WORD ONLY for each answer.',
  noteConfig: { title: '', lines: ['Children must wear a __Q16__ outside.', 'Lunch is served in the dining __Q17__.', 'The club closes on __Q18__.'] },
  questions: [fill(16, 'hat'), fill(17, 'room'), fill(18, 'Friday')],
};

const section = (groups, extra = {}) => createListeningSection({
  title: extra.title || 'Holiday club',
  partNumber: 1,
  questionRange: { start: 1, end: 18 },
  questionGroups: groups,
  isActive: extra.isActive ?? true,
  extra: {
    audioUrl: 'https://res.cloudinary.com/demo/video/upload/club.mp3', audioDuration: 240, transcript: TRANSCRIPT,
    dictationSentences: extra.dictation ?? DICTATION,
  },
});

function keysOf(obj, out = new Set()) {
  if (Array.isArray(obj)) obj.forEach(v => keysOf(v, out));
  else if (obj && typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => { out.add(k); keysOf(v, out); });
  return out;
}

let token;
beforeEach(async () => {
  await ListeningTip.create(TYPE_TIPS.map((lessonKey, i) => ({ category: 'Chiến thuật theo dạng bài', lessonKey, title: lessonKey, orderIndex: i + 1, blocks: [] })));
  token = signTokenFor(await createPremiumStudent());
});
const get = (key) => request(app).get(`/api/listening-tips/${key}/practice`).set('Authorization', `Bearer ${token}`);
const check = (key, body) => request(app).post(`/api/listening-tips/${key}/practice/check`).set('Authorization', `Bearer ${token}`).send(body);

describe('filtering by question type (spec cases 1–3)', () => {
  let s;
  beforeEach(async () => { s = await section([FORM, MCQ, MATCHING, MULTI, MAP, SENTENCES]); });

  test('CASE 1: Form / Note / Table → only the form gaps, in order, each with its audio stretch — no answer key', async () => {
    const res = await get('form-note-table-completion');
    expect(res.status).toBe(200);
    const pr = res.body.practice;
    expect(pr).toMatchObject({ kind: 'qtype', qtype: 'form', sectionId: String(s._id), audioUrl: 'https://res.cloudinary.com/demo/video/upload/club.mp3' });
    expect(pr.questions.map(q => q.questionNumber)).toEqual([1, 2, 3, 4]);
    expect(pr.questions[1]).toMatchObject({ input: 'text', text: 'Date of trip: _____ June', context: 'Booking form', wordLimit: 'ONE WORD AND/OR A NUMBER' });
    // Q3's stretch: from just after Q2's answer (ends 56 s) to just after
    // "You need to bring a raincoat." (60–66 s)
    expect(pr.questions[2].segment).toEqual({ start: 55, end: 67.5 });
    // only the worked example (Q1) shows its answer — see the guided cases
    const keys = keysOf({ ...res.body.practice, questions: pr.questions.slice(1) });
    ['correctAnswer', 'explanation', 'answer', 'guide'].forEach(k => expect(keys.has(k)).toBe(false));
  });

  test('CASE 2: Multiple Choice → only the MCQs, options as A/B/C', async () => {
    const pr = (await get('multiple-choice')).body.practice;
    expect(pr.questions.map(q => q.questionNumber)).toEqual([5, 6, 7]);
    expect(pr.questions[0].choices).toEqual([{ key: 'A', label: 'painting' }, { key: 'B', label: 'swimming' }, { key: 'C', label: 'football' }]);
  });

  test('CASE 3: Matching → only the matching questions, never a form gap; the option list travels with each', async () => {
    const pr = (await get('matching')).body.practice;
    expect(pr.questions.map(q => q.questionNumber)).toEqual([8, 9, 10]);
    expect(pr.questions[0]).toMatchObject({ input: 'choice', text: 'Anna', listTitle: 'Jobs', reuse: false });
    expect(pr.questions[0].choices.map(c => c.label)).toEqual(['teaches art', 'runs sports', 'cooks meals']);
  });

  test('map, sentences and "choose TWO" are told apart by what they contain', async () => {
    const map = (await get('map-plan-diagram')).body.practice;
    expect(map.questions.map(q => q.questionNumber)).toEqual([13, 14, 15]);
    expect(map.questions[0]).toMatchObject({ text: 'Office', imageUrl: 'https://res.cloudinary.com/demo/image/upload/map.png' });
    expect(map.questions[0].choices.map(c => c.key)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    const sentences = (await get('sentence-completion')).body.practice;
    expect(sentences.questions.map(q => q.questionNumber)).toEqual([16, 17, 18]);
    const multi = (await get('multiple-answers')).body.practice;
    expect(multi.questions).toHaveLength(1);
    expect(multi.questions[0]).toMatchObject({ input: 'multi', numbers: [11, 12], pick: 2 });
  });
});

describe('grading (spec cases 9–11)', () => {
  let s;
  beforeEach(async () => { s = await section([FORM, MCQ, MATCHING, MULTI, MAP, SENTENCES]); });
  const ask = (key, questionNumber, answer) => check(key, { sectionId: String(s._id), questionNumber, answer });

  test('typed gaps: alternatives, then answer + explanation + the audio evidence; slips are named', async () => {
    const ok = (await ask('form-note-table-completion', 2, '5')).body.result;
    expect(ok).toMatchObject({ isCorrect: true, correctAnswer: '5th/5' });
    expect(ok.evidence).toMatchObject({ text: 'The trip is on the 5th of June.', start: 50, end: 56 });
    const slip = (await ask('form-note-table-completion', 3, 'raincoats')).body.result;
    expect(slip).toMatchObject({ isCorrect: false, correctAnswer: 'raincoat', diagnosis: { kind: 'plural' } });
    expect((await ask('sentence-completion', 18, 'friday')).body.result.isCorrect).toBe(true);
  });

  test('letters: MCQ, matching and map', async () => {
    const wrong = (await ask('multiple-choice', 5, 'A')).body.result;
    expect(wrong).toMatchObject({ isCorrect: false, correctAnswer: 'B' });
    expect(wrong.evidence.text).toBe('Most children enjoy the swimming lessons the most.');
    expect(wrong.explanation).toMatch(/Transcript/);
    expect((await ask('matching', 9, 'b')).body.result.isCorrect).toBe(true);
    expect((await ask('map-plan-diagram', 14, 'E')).body.result.isCorrect).toBe(true);
  });

  test('"choose TWO": graded per question, in any order; more letters than asked is refused', async () => {
    const both = (await ask('multiple-answers', 11, JSON.stringify(['B', 'A']))).body.result;
    expect(both).toMatchObject({ isCorrect: true, correctCount: 2, total: 2, correctAnswer: 'A, B' });
    const half = (await ask('multiple-answers', 12, JSON.stringify(['A', 'D']))).body.result;
    expect(half).toMatchObject({ isCorrect: false, correctCount: 1, perQuestion: [{ questionNumber: 11, isCorrect: true }, { questionNumber: 12, isCorrect: false }] });
    expect((await ask('multiple-answers', 11, JSON.stringify(['A', 'B', 'C']))).status).toBe(400);
  });

  test('a question of another type is not in the practice', async () => {
    const res = await ask('multiple-choice', 1, 'A');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('NOT_IN_PRACTICE');
  });
});

describe('guided examples: Q1 I DO, Q2 WE DO, Q3+ YOU DO (spec cases 6–8)', () => {
  let s;
  beforeEach(async () => { s = await section([FORM, MCQ, MATCHING, MULTI, MAP, SENTENCES]); });

  test('CASE 6: Q1 is worked through — keywords, answer type, the line of the transcript, the answer', async () => {
    const pr = (await get('form-note-table-completion')).body.practice;
    expect(pr.questions.map(q => q.mode)).toEqual(['example', 'guided', 'solo', 'solo']);
    const { guide } = pr.questions[0];
    expect(guide).toMatchObject({ type: 'number', answer: 'BS4 7JN', traps: [], directions: [] });
    expect(guide.keywords).toContain('Postcode');
    expect(guide.evidence).toMatchObject({ text: 'Please write your postcode, it is BS4 7JN.', start: 40, end: 46 });

    const mcqGuide = (await get('multiple-choice')).body.practice.questions[0].guide;
    expect(mcqGuide).toMatchObject({ answer: 'B', where: '…', why: '…', type: null });
    expect(mcqGuide.evidence.text).toBe('Most children enjoy the swimming lessons the most.');
    const mapGuide = (await get('map-plan-diagram')).body.practice.questions[0].guide;
    expect(mapGuide).toMatchObject({ answer: 'C', directions: ['next to'] });
  });

  test('CASE 7–8: Q2 gets only keywords to compare with; Q3+ nothing — no answer before the check', async () => {
    const pr = (await get('form-note-table-completion')).body.practice;
    expect(pr.questions[1].coach).toEqual({ keywords: expect.any(Array), signals: expect.any(Array), predict: true });
    expect(pr.questions[1].coach.keywords).toContain('Date');
    pr.questions.slice(2).forEach(q => { expect(q.guide).toBeUndefined(); expect(q.coach).toBeUndefined(); });
    const keys = keysOf(pr.questions.slice(1));
    ['correctAnswer', 'explanation', 'answer', 'why', 'evidence', 'type'].forEach(k => expect(keys.has(k)).toBe(false));
    // the letter types have no answer type to predict
    expect((await get('multiple-choice')).body.practice.questions[1].coach.predict).toBe(false);
  });

  test('WE DO: the answer-type prediction is judged with the answer', async () => {
    const res = await check('form-note-table-completion', { sectionId: String(s._id), questionNumber: 2, answer: '5th', prediction: 'date' });
    expect(res.body.result).toMatchObject({ isCorrect: true, category: 'date', prediction: 'date', predictionCorrect: true });
    const off = (await check('form-note-table-completion', { sectionId: String(s._id), questionNumber: 4, answer: '40', prediction: 'word' })).body.result;
    expect(off).toMatchObject({ category: 'price', predictionCorrect: false });
    const letters = (await check('multiple-choice', { sectionId: String(s._id), questionNumber: 6, answer: 'B', prediction: 'word' })).body.result;
    expect(letters.category).toBeUndefined();
  });

  test('"choose TWO": the worked example is borrowed from another section; alone, the cluster is done together', async () => {
    const alone = (await get('multiple-answers')).body.practice;
    expect(alone.questions.map(q => q.mode)).toEqual(['guided']);
    const other = await section([MULTI], { title: 'Another club' });
    const pr = (await get('multiple-answers')).body.practice;
    expect(pr.questions).toHaveLength(2);
    const [ex, own] = pr.questions;
    expect(ex).toMatchObject({ mode: 'example', numbers: [11, 12], audioUrl: 'https://res.cloudinary.com/demo/video/upload/club.mp3' });
    expect(ex.sectionId).not.toBe(pr.sectionId);
    expect([String(s._id), String(other._id)]).toContain(ex.sectionId);
    expect(ex.guide).toMatchObject({ answer: 'A, B' });
    expect(own).toMatchObject({ mode: 'guided', numbers: [11, 12] });
  });
});

describe('choosing the section (spec cases 4–5)', () => {
  test('CASE 4: a section without the type is skipped for one that has it', async () => {
    await section([FORM], { title: 'Only a form' });
    const withMap = await section([MCQ, MAP], { title: 'Has a map' });
    for (let i = 0; i < 3; i++) expect((await get('map-plan-diagram')).body.practice.sectionId).toBe(String(withMap._id));
  });

  test('CASE 5: nothing suitable → empty state, not an error', async () => {
    await section([FORM]);
    const res = await get('multiple-choice');
    expect(res.status).toBe(200);
    expect(res.body.practice).toBeNull();
  });

  test('a map without its image, a word-box "map" and an unaligned or hidden section are never used', async () => {
    await section([{ ...MAP, imageUrl: '' }], { title: 'No image' });
    await section([{ ...MAP, dragDropConfig: { words: ['a', 'b'] } }], { title: 'Word box' });
    await section([MAP], { title: 'Not aligned', dictation: [] });
    await section([MAP], { title: 'Hidden', isActive: false });
    expect((await get('map-plan-diagram')).body.practice).toBeNull();
  });
});
