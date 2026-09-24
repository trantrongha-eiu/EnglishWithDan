// Listening Tips → "Luyện tập" (Phase 1: Highlight keyword, Chiến thuật 30
// giây, Ký hiệu nhanh). Covers the access gate, that practices are built
// only from existing, audio-aligned sections, that payloads never carry an
// answer key, and that /check grades one answer server-side before
// revealing answer + explanation + the audio evidence.
const request = require('supertest');
const app = require('../../app');
const ListeningTip = require('../../models/ListeningTip');
const ListeningSection = require('../../models/ListeningSection');
const { createStudent, createPremiumStudent, signTokenFor } = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');

const TRANSCRIPT = [
  '❓ Transcript', 'Beechen Festival',
  'Woman:', 'Beechen festival office?',
  'Man:', 'Oh, hello. I want to check some details about the festival.',
  'Woman:', 'The first event is a concert on June 19th.',
  'Man:', 'Is it in the theatre like last year?',
  'Woman:', "Yes, that's right. It starts at 7 p.m.",
  'Man:', 'And the tour on June 20th?',
  'Woman:', 'The tour starts at 4.30 p.m. and you meet at the old mill.',
  'Man:', 'It costs £35 for the day, including lunch.',
  'Woman:', 'Please contact Becky Jamieson. That is J-A-M-I-E-S-O-N. (Q4)',
  'Man:', 'Make sure you bring a raincoat.',
  'Woman:', "The advantage of the tour is that it's free for children.",
].join('\n');

// start/end seconds of some of the sentences (the rest are interpolated)
const DICTATION = [
  { text: 'Oh, hello.', start: 60, end: 61 },
  { text: 'I want to check some details about the festival.', start: 61.2, end: 64 },
  { text: 'The first event is a concert on June 19th.', start: 65, end: 68 },
  { text: 'Is it in the theatre like last year?', start: 69, end: 71.5 },
  { text: "Yes, that's right.", start: 72, end: 73 },
  { text: 'The tour starts at 4.30 p.m. and you meet at the old mill.', start: 80, end: 85 },
  { text: 'It costs £35 for the day, including lunch.', start: 86, end: 89.5 },
  { text: 'Make sure you bring a raincoat.', start: 100, end: 102 },
  { text: "The advantage of the tour is that it's free for children.", start: 103, end: 107 },
];

const fill = (n, key, explanation = '') => ({ questionNumber: n, type: 'fill-blank', questionText: `Q${n}`, correctAnswer: key, explanation });
const NOTES = {
  groupType: 'note-form',
  instruction: 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
  noteConfig: {
    title: 'Beechen Festival',
    lines: ['Events:', '● Concert: in the __Q1__', '● Tour starts at __Q2__ p.m.', 'Price: £ __Q3__ for the day', 'Contact: Becky __Q4__', 'Bring a __Q5__'],
  },
  questions: [
    fill(1, 'theatre/theater', 'Vị trí: đầu hội thoại.\n\nTranscript: "Is it in the theatre like last year?" — "Yes, that\'s right."\n\nPhân tích: → theatre.'),
    fill(2, '4.30/4:30'),
    fill(3, '35'),
    fill(4, 'Jamieson', 'Transcript: "Please contact Becky Jamieson."'),
    fill(5, 'raincoat'),
  ],
};
const MCQ = {
  groupType: 'plain',
  instruction: 'Choose the correct letter, A, B or C.',
  questions: [{ questionNumber: 6, type: 'multiple-choice', questionText: 'The festival is', options: ['new', 'old', 'cancelled'], correctAnswer: 'B', explanation: 'x' }],
};

const aligned = (overrides = {}) => createListeningSection({
  title: overrides.title || 'Beechen Festival',
  questionRange: { start: 1, end: 6 },
  questionGroups: overrides.questionGroups || [NOTES, MCQ],
  isActive: overrides.isActive ?? true,
  extra: {
    audioUrl: 'https://res.cloudinary.com/demo/video/upload/beechen.mp3',
    audioDuration: 300,
    transcript: TRANSCRIPT,
    dictationSentences: overrides.dictationSentences ?? DICTATION,
  },
});

function keysOf(obj, out = new Set()) {
  if (Array.isArray(obj)) obj.forEach(v => keysOf(v, out));
  else if (obj && typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => { out.add(k); keysOf(v, out); });
  return out;
}
const NO_KEYS = ['correctAnswer', 'explanation', 'answerType', 'answer', 'meaning'];

const FOUNDATION_TIPS = ['keyword-highlighting', '30-second-strategy', 'symbols-and-paraphrase', 'full-workflow-practice',
  'predict-noun-adjective-verb', 'predict-number-date-place', 'predict-plural-countable-formula'];

let token;
beforeEach(async () => {
  await ListeningTip.create([
    ...FOUNDATION_TIPS.map((lessonKey, i) => ({ category: 'Kỹ thuật nghe nền tảng', lessonKey, title: lessonKey, orderIndex: i - 7, blocks: [] })),
    { category: 'Chiến thuật theo band điểm', lessonKey: 'band-6', title: 'Band 6.0', blocks: [] },
  ]);
  token = signTokenFor(await createPremiumStudent());
});
const get = (key, query = {}) => request(app).get(`/api/listening-tips/${key}/practice`).query(query).set('Authorization', `Bearer ${token}`);
const check = (key, body) => request(app).post(`/api/listening-tips/${key}/practice/check`).set('Authorization', `Bearer ${token}`).send(body);

describe('access', () => {
  test('requires authentication', async () => {
    expect((await request(app).get('/api/listening-tips/keyword-highlighting/practice')).status).toBe(401);
  });

  test('an expired free trial gets 403 PLAN_REQUIRED (same gate as Listening practice)', async () => {
    const expired = await createStudent({ extra: { createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
    const res = await request(app).get('/api/listening-tips/keyword-highlighting/practice').set('Authorization', `Bearer ${signTokenFor(expired)}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PLAN_REQUIRED');
  });

  test('a tip without a practice (or an unknown key) is a clean 404', async () => {
    expect((await get('band-6')).status).toBe(404);
    expect((await get('no-such-tip')).body.code).toBe('NO_PRACTICE');
  });

  test('/lessons stays public and says which tips have a practice', async () => {
    const res = await request(app).get('/api/listening-tips/lessons');
    expect(res.status).toBe(200);
    const has = Object.fromEntries(res.body.lessons.map(l => [l.lessonKey, l.hasPractice]));
    expect(has).toEqual({ ...Object.fromEntries(FOUNDATION_TIPS.map(k => [k, true])), 'band-6': false });
  });
});

describe('Highlight keyword', () => {
  test('gaps from aligned sections only, each with its keywords and audio segment — no answer key', async () => {
    const s = await aligned();
    await aligned({ title: 'Not aligned yet', dictationSentences: [] }); // audio not verified → never used
    await aligned({ title: 'Hidden', isActive: false });
    const res = await get('keyword-highlighting');
    expect(res.status).toBe(200);
    const items = res.body.practice.items;
    expect(res.body.practice.kind).toBe('keywords');
    items.forEach(it => {
      expect(it.sectionId).toBe(String(s._id));
      expect(it.audioUrl).toBe('https://res.cloudinary.com/demo/video/upload/beechen.mp3');
      expect(it.text).toContain('_____');
      expect(it.segment.end).toBeGreaterThan(it.segment.start);
    });
    // Q1–Q5 are gaps (≤2 per section); the MCQ Q6 never is
    expect(items).toHaveLength(2);
    items.forEach(it => expect([1, 2, 3, 4, 5]).toContain(it.questionNumber));
    const keys = keysOf(res.body);
    NO_KEYS.forEach(k => expect(keys.has(k)).toBe(false));
  });

  test('check grades with the bank\'s own rules, then reveals answer, type and the audio evidence', async () => {
    const s = await aligned();
    const body = { sectionId: String(s._id) };
    const q1 = (await check('keyword-highlighting', { ...body, questionNumber: 1, answer: 'THEATER', prediction: 'proper' })).body.result;
    expect(q1).toMatchObject({ isCorrect: true, correctAnswer: 'theatre/theater', answerType: 'word', predictionCorrect: false });
    expect(q1.evidence.text).toBe("Man: Is it in the theatre like last year? Woman: Yes, that's right.");
    expect(q1.evidence).toMatchObject({ start: 69, end: 73 });
    expect(q1.explanation).toMatch(/Transcript/);

    const q4 = (await check('keyword-highlighting', { ...body, questionNumber: 4, answer: 'jameson', prediction: 'proper' })).body.result;
    expect(q4).toMatchObject({ isCorrect: false, correctAnswer: 'Jamieson', answerType: 'proper', predictionCorrect: true });
    expect(q4.evidence.text).toBe('Please contact Becky Jamieson.'); // "(Q4)" marker not shown

    const types = {};
    for (const n of [2, 3, 5]) types[n] = (await check('keyword-highlighting', { ...body, questionNumber: n, answer: 'x' })).body.result.answerType;
    expect(types).toEqual({ 2: 'time', 3: 'price', 5: 'word' });

    const mcq = await check('keyword-highlighting', { ...body, questionNumber: 6, answer: 'B' });
    expect(mcq.status).toBe(400);
    expect(mcq.body.code).toBe('NOT_IN_PRACTICE');
    expect((await check('keyword-highlighting', { sectionId: 'nope', questionNumber: 1, answer: 'x' })).status).toBe(400);
    expect((await check('keyword-highlighting', { ...body, questionNumber: 1, answer: ['x'] })).status).toBe(400);
  });

  test('no aligned section → empty state, not an error; the bank is never written to', async () => {
    await aligned({ dictationSentences: [] });
    const before = await ListeningSection.find().lean();
    const res = await get('keyword-highlighting');
    expect(res.status).toBe(200);
    expect(res.body.practice).toBeNull();
    expect(await ListeningSection.find().lean()).toEqual(before);
  });
});

describe('Chiến thuật 30 giây', () => {
  test('a run of consecutive gaps from one group, played as one stretch after 30 s', async () => {
    const s = await aligned();
    const pr = (await get('30-second-strategy')).body.practice;
    expect(pr).toMatchObject({ kind: 'preview', sectionId: String(s._id), prepSeconds: 30, wordLimit: 'ONE WORD AND/OR A NUMBER' });
    expect(pr.questions.map(q => q.questionNumber)).toEqual([1, 2, 3, 4, 5]);
    expect(pr.questions[1]).toMatchObject({ text: 'Tour starts at _____ p.m.', context: 'Events', signals: ['at', 'p.m.'] });
    expect(pr.segment.start).toBeLessThan(69); // before Q1's evidence
    expect(pr.segment.end).toBeGreaterThan(100); // after Q5's
    const keys = keysOf(pr);
    NO_KEYS.forEach(k => expect(keys.has(k)).toBe(false));
  });

  test('?exclude= moves "Bài khác" to another section', async () => {
    const a = await aligned({ title: 'A' });
    const b = await aligned({ title: 'B' });
    for (let i = 0; i < 4; i++) {
      expect((await get('30-second-strategy', { exclude: String(a._id) })).body.practice.sectionId).toBe(String(b._id));
      expect((await get('30-second-strategy', { exclude: String(b._id) })).body.practice.sectionId).toBe(String(a._id));
    }
  });
});

describe('Ký hiệu nhanh', () => {
  test('symbol → meaning items plus real sentences whose meaning one symbol captures', async () => {
    const s = await aligned();
    const pr = (await get('symbols-and-paraphrase')).body.practice;
    const meaning = pr.items.filter(i => i.type === 'meaning');
    const audio = pr.items.filter(i => i.type === 'audio');
    expect(meaning).toHaveLength(4);
    meaning.forEach(m => expect(m.options).toHaveLength(4));
    // £35 → $, "Make sure" → !, "The advantage" → +, "Yes, that's right." → ✓ (one clip per symbol)
    expect(audio.length).toBe(1); // one clip per section
    expect(audio[0]).toMatchObject({ sectionId: String(s._id), audioUrl: 'https://res.cloudinary.com/demo/video/upload/beechen.mp3' });
    expect(audio[0].options).toHaveLength(4);
    const keys = keysOf(pr);
    NO_KEYS.forEach(k => expect(keys.has(k)).toBe(false));

    const clip = DICTATION[audio[0].sentenceIndex].text;
    const expected = { 'It costs £35 for the day, including lunch.': '$', 'Make sure you bring a raincoat.': '!',
      "The advantage of the tour is that it's free for children.": '+', "Yes, that's right.": '✓' }[clip];
    expect(expected).toBeDefined();
    const res = (await check('symbols-and-paraphrase', { item: 'audio', sectionId: String(s._id), sentenceIndex: audio[0].sentenceIndex, answer: expected })).body.result;
    expect(res).toMatchObject({ isCorrect: true, correctAnswer: expected, evidence: { text: clip } });
    expect(res.evidence.signal).toBeTruthy();
  });

  test('meaning items are graded server-side; a sentence without a clear symbol is not in the practice', async () => {
    const s = await aligned();
    const ok = (await check('symbols-and-paraphrase', { item: 'meaning', symbol: '→', answer: 'change / result — thay đổi, kết quả' })).body.result;
    expect(ok).toMatchObject({ isCorrect: true, symbol: '→' });
    expect((await check('symbols-and-paraphrase', { item: 'meaning', symbol: '≠', answer: 'price — giá tiền' })).body.result.isCorrect).toBe(false);
    const plain = await check('symbols-and-paraphrase', { item: 'audio', sectionId: String(s._id), sentenceIndex: 0, answer: '$' });
    expect(plain.status).toBe(400);
    expect(plain.body.code).toBe('NOT_IN_PRACTICE');
  });
});

// ── Phase 2: predict → (confirm) → listen → answer ─────────────────────
const TOUR_TRANSCRIPT = [
  '❓ Transcript', 'City tour',
  'Woman:', 'Good morning, City Tours.',
  'Man:', "Hi. I'd like to book the walking tour for my family.",
  'Woman:', 'Of course. The tour is very popular with families.',
  'Woman:', 'You must register online before you come.',
  'Man:', 'Who is the guide?',
  'Woman:', 'The guide is Mrs Patel, she knows the city well.',
  'Woman:', 'The tour starts at 9.30 a.m. on Saturday.',
  'Woman:', 'We meet outside the Grand Hotel on Castle Street.',
  'Man:', 'What should we bring?',
  'Woman:', 'Bring some comfortable shoes and two bottles of water.',
  'Woman:', 'It costs £12 per person and the ticket includes a guidebook.',
  'Woman:', 'There is also information about cycling tours on our website.',
].join('\n');
const TOUR_TIMES = [
  ['Good morning, City Tours.', 40, 42], ["Hi. I'd like to book the walking tour for my family.", 43, 47],
  ['Of course.', 48, 49], ['The tour is very popular with families.', 49.2, 52], ['You must register online before you come.', 53, 56],
  ['The guide is Mrs Patel, she knows the city well.', 60, 64], ['The tour starts at 9.30 a.m. on Saturday.', 65, 69],
  ['We meet outside the Grand Hotel on Castle Street.', 70, 74], ['Bring some comfortable shoes and two bottles of water.', 78, 83],
  ['It costs £12 per person and the ticket includes a guidebook.', 84, 90], ['There is also information about cycling tours on our website.', 91, 96],
].map(([text, start, end]) => ({ text, start, end }));
const TOUR_NOTES = {
  groupType: 'note-form',
  instruction: 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
  noteConfig: {
    title: 'City tour',
    lines: ['The tour is very __Q1__ with families.', 'Visitors must __Q2__ online.', 'Guide: Mrs __Q3__', 'Start time: __Q4__ a.m.',
      'Meeting point: outside the Grand Hotel on __Q5__ Street', 'Bring: comfortable __Q6__', 'Price: £ __Q7__ per person',
      'Ticket includes a __Q8__', 'Website: information about __Q9__ tours', 'Day of the tour: __Q10__', 'Take two bottles of __Q11__'],
  },
  questions: [fill(1, 'popular'), fill(2, 'register'), fill(3, 'Patel'), fill(4, '9.30/9:30'), fill(5, 'Castle'), fill(6, 'shoes'),
    fill(7, '12'), fill(8, 'guidebook'), fill(9, 'cycling'), fill(10, 'Saturday'), fill(11, 'water')],
};
const tour = () => createListeningSection({
  title: 'City tour',
  questionRange: { start: 1, end: 11 },
  questionGroups: [TOUR_NOTES],
  extra: { audioUrl: 'https://res.cloudinary.com/demo/video/upload/tour.mp3', audioDuration: 120, transcript: TOUR_TRANSCRIPT, dictationSentences: TOUR_TIMES },
});

// The three prediction tips are text only: read the question, predict,
// then see why — with the real answer and its sentence in the transcript.
describe('Dự đoán Noun / Adjective / Verb (text only)', () => {
  test('only gaps whose word class the question shows; no audio, no answer before the prediction', async () => {
    const s = await tour();
    const pr = (await get('predict-noun-adjective-verb')).body.practice;
    expect(pr.kind).toBe('wordclass');
    pr.items.forEach(it => expect([1, 2, 8, 11]).toContain(it.questionNumber)); // adj / verb / noun / noun
    const keys = keysOf(pr);
    [...NO_KEYS, 'category', 'reason', 'segment', 'audioUrl'].forEach(k => expect(keys.has(k)).toBe(false));

    const body = { sectionId: String(s._id), questionNumber: 1 };
    const wrong = (await check('predict-noun-adjective-verb', { ...body, prediction: 'noun' })).body.result;
    expect(wrong).toMatchObject({ isCorrect: false, prediction: 'noun', category: 'adjective', signal: 'very', correctAnswer: 'popular' });
    expect(wrong.reason).toMatch(/very/);
    expect(wrong.evidence.text).toBe('The tour is very popular with families.');
    expect((await check('predict-noun-adjective-verb', { ...body, questionNumber: 2, prediction: 'verb' })).body.result)
      .toMatchObject({ isCorrect: true, category: 'verb', correctAnswer: 'register' });
    // a gap the question doesn't give away ("comfortable ___") isn't in this practice; a prediction is required
    expect((await check('predict-noun-adjective-verb', { ...body, questionNumber: 6, prediction: 'noun' })).status).toBe(400);
    expect((await check('predict-noun-adjective-verb', { ...body, answer: 'popular' })).status).toBe(400);
  });

  test('uses sections whose audio isn\'t aligned too (only the transcript is needed)', async () => {
    const s = await createListeningSection({
      title: 'Not aligned',
      questionRange: { start: 1, end: 11 },
      questionGroups: [TOUR_NOTES],
      extra: { audioUrl: 'https://res.cloudinary.com/demo/video/upload/tour.mp3', transcript: TOUR_TRANSCRIPT, dictationSentences: [] },
    });
    const pr = (await get('predict-noun-adjective-verb')).body.practice;
    pr.items.forEach(it => expect(it.sectionId).toBe(String(s._id)));
    expect((await get('keyword-highlighting')).body.practice).toBeNull(); // audio practices still need the alignment
  });
});

describe('Dự đoán Number / Date / Time / Name / Place (text only)', () => {
  test('name vs place from the words at the gap; time, price, date from their signals', async () => {
    const s = await tour();
    const pr = (await get('predict-number-date-place')).body.practice;
    expect(pr.kind).toBe('infotype');
    const ask = async (questionNumber, prediction) => (await check('predict-number-date-place',
      { sectionId: String(s._id), questionNumber, prediction })).body.result;
    expect(await ask(3, 'place')).toMatchObject({ isCorrect: false, category: 'name', signal: 'Mrs', correctAnswer: 'Patel' });
    expect(await ask(5, 'place')).toMatchObject({ isCorrect: true, category: 'place', signal: 'Street' });
    expect(await ask(4, 'time')).toMatchObject({ isCorrect: true, signal: 'a.m.', evidence: { text: 'The tour starts at 9.30 a.m. on Saturday.' } });
    expect(await ask(7, 'price')).toMatchObject({ isCorrect: true, signal: '£' });
    expect((await ask(10, 'date')).isCorrect).toBe(true);
  });
});

describe('Số ít / nhiều, V-ing, cụm từ (text only)', () => {
  test('predict the form of the answer, then see the real answer and why', async () => {
    const s = await tour();
    const pr = (await get('predict-plural-countable-formula')).body.practice;
    expect(pr.kind).toBe('form');
    const ask = async (questionNumber, prediction) => (await check('predict-plural-countable-formula',
      { sectionId: String(s._id), questionNumber, prediction })).body.result;
    expect(await ask(6, 'singular')).toMatchObject({ isCorrect: false, category: 'plural', correctAnswer: 'shoes' });
    expect(await ask(11, 'uncountable')).toMatchObject({ isCorrect: true, category: 'uncountable', correctAnswer: 'water' });
    const cycling = await ask(9, 'ving');
    expect(cycling).toMatchObject({ isCorrect: true, category: 'ving' });
    expect(cycling.reason).toMatch(/about/);
    expect(await ask(8, 'singular')).toMatchObject({ isCorrect: true, category: 'singular', signal: 'a' });
  });
});

test('a wrong typed answer says which slip it was (limit, plural, form)', async () => {
  const s = await tour();
  const ask = async (questionNumber, answer) => (await check('keyword-highlighting', { sectionId: String(s._id), questionNumber, answer })).body.result.diagnosis;
  expect(await ask(6, 'shoe')).toMatchObject({ kind: 'plural' });
  expect(await ask(11, 'waters')).toMatchObject({ kind: 'plural' });
  expect(await ask(9, 'cycle')).toMatchObject({ kind: 'form' });
  expect(await ask(8, 'guide book please')).toMatchObject({ kind: 'limit' });
});

describe('Quy trình hoàn chỉnh', () => {
  test('a run of consecutive gaps of one section with keywords, played as one stretch — no answer key', async () => {
    const s = await tour();
    const pr = (await get('full-workflow-practice')).body.practice;
    expect(pr).toMatchObject({ kind: 'workflow', sectionId: String(s._id) });
    expect(pr.questions.map(q => q.questionNumber)).toEqual([1, 2, 3, 4, 5]);
    expect(pr.questions[0].keywords.length).toBeGreaterThan(0);
    expect(pr.segment.start).toBeLessThan(49.2);
    expect(pr.segment.end).toBeGreaterThan(74);
    const keys = keysOf(pr);
    NO_KEYS.forEach(k => expect(keys.has(k)).toBe(false));
    const r = (await check('full-workflow-practice', { sectionId: String(s._id), questionNumber: 5, answer: 'castle', prediction: 'proper' })).body.result;
    expect(r).toMatchObject({ isCorrect: true, answerType: 'proper', predictionCorrect: true });
  });
});
