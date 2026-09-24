// Pure helpers of the Listening Tips practice builder, on the shapes the
// real bank holds (HTML pasted into note lines, "(Q5)" markers in
// transcripts, prices that look like clock times…).
const { _internals: L } = require('../../../services/listeningTipPracticeService');

const section = (transcript, dictationSentences = [], audioDuration = 200) => ({ transcript, dictationSentences, audioDuration });

describe('gapText — the gap as it reads on the paper', () => {
  test('note line: bullets dropped, other gaps as …, the heading above as context', () => {
    const g = { groupType: 'note-form', noteConfig: { title: 'Festival', lines: ['Events:', '● Concert: in the __Q1__', '○ Tour at __Q2__ p.m. (meet at … __Q3__)'] } };
    expect(L.gapText(g, { questionNumber: 2 })).toEqual({ text: 'Tour at _____ p.m. (meet at … …)', context: 'Events' });
  });

  test('HTML pasted into a note line is read as text lines', () => {
    const g = { groupType: 'note-form', noteConfig: { lines: ['<!DOCTYPE html><html><head><style>body{margin:5px}</style></head><body>'
      + '<h3 style="x">Patient form</h3><p><span style="width:180px">Suburb:</span> __Q2__</p><p>Phone: __Q3__</p></body></html>'] } };
    expect(L.gapText(g, { questionNumber: 2 })).toEqual({ text: 'Suburb: _____', context: 'Patient form' });
  });

  test('table cell under its column header, the row\'s first cell as context', () => {
    const g = { groupType: 'table', tableConfig: { headers: ['Date', 'Time', 'Place'], rows: [['June 20th', '__Q2__ p.m.<br>Late entry', 'meet at the __Q3__']] } };
    expect(L.gapText(g, { questionNumber: 2 })).toEqual({ text: 'Time: _____ p.m.', context: 'June 20th' });
  });
});

describe('answerType — from the key and the words around the gap', () => {
  const tl = L.timelineOf(section('Man:\nIt is run by Mrs Keogh on Mondays.\nWoman:\nThe cost is £67.50 and the class starts at 11.15.'));
  const type = (key, text, context = '') => L.answerType({ correctAnswer: key }, { text, context }, tl);
  test.each([
    ['67.50/sixty-seven fifty', 'Cost: £ _____', 'price'],     // not a 67:50 clock time
    ['9.75', 'Starting salary _____ per hour', 'price'],        // a price word next to it
    ['9.75', 'Distance: _____ km', 'number'],                   // 9:75 is no clock time
    ['11:15/11.15', 'Classes end by _____ p.m.', 'time'],
    ['7', 'Starts at _____ p.m.', 'time'],
    ['15', 'a total of _____ hours', 'number'],
    ['26th September', 'Date: _____', 'date'],
    ['Tuesday', 'Lawyer available on _____', 'date'],
    ['keogh', 'Teacher: Mrs _____', 'proper'],                  // stored lower-case, capitalised when heard
    ['raincoat', 'Bring a _____', 'word'],
    ['susan@post.com', 'Email: _____', null],                   // not one of the types taught
  ])('%s in "%s" → %s', (key, text, expected) => {
    expect(type(key, text)).toBe(expected);
  });

  test('a phrase is a name only when every word is capitalised, wherever it is heard', () => {
    const t = L.timelineOf(section('One piece of advice: Get good shoes before you start.\nThey met at the King Room, as usual.'));
    expect(L.answerType({ correctAnswer: 'get good shoes' }, { text: 'Tip: _____' }, t)).toBe('word');
    expect(L.answerType({ correctAnswer: 'King Room' }, { text: 'Venue: the _____' }, t)).toBe('proper');
  });
});

describe('transcript ↔ audio time', () => {
  const s = section([
    '❓ Transcript', 'Title line',
    'Woman:', 'First sentence here.', 'Man:', 'A dropped sentence in between. Another one.', 'Woman:', 'Last aligned sentence.',
  ].join('\n'), [
    { text: 'First sentence here.', start: 10, end: 12 },
    { text: 'Last aligned sentence.', start: 20, end: 22 },
  ]);
  const tl = L.timelineOf(s);

  test('speaker lines are attributes, not text; a line is split into sentences', () => {
    expect(tl.lines.map(l => [l.speaker, l.text])).toEqual([
      ['', 'Title line'], ['Woman', 'First sentence here.'], ['Man', 'A dropped sentence in between. Another one.'], ['Woman', 'Last aligned sentence.'],
    ]);
    expect(tl.sentences.map(x => x.text)).toContain('Another one.');
  });

  test('exact inside an aligned sentence, interpolated in the gap between two', () => {
    const at = (text) => tl.full.indexOf(text);
    expect(L.timeAt(tl, at('first sentence'))).toBe(10);
    const mid = L.timeAt(tl, at('a dropped'));
    expect(mid).toBeGreaterThan(12);
    expect(mid).toBeLessThan(20);
    const ev = L.evidenceOf(tl, { from: at('another one'), to: at('another one') + 5 });
    expect(ev.text).toBe('Another one.');
    expect(ev.speaker).toBe('Man');
    expect(ev.start).toBeGreaterThan(12);
    expect(ev.end).toBeLessThanOrEqual(20);
  });

  test('an exchange quoted across speakers ("… — …") is found as one stretch, speakers named', () => {
    const r = L.quoteRange(tl, 'Transcript: "First sentence here." — "A dropped sentence in between."', 0);
    expect(L.evidenceOf(tl, r).text).toBe('Woman: First sentence here. Man: A dropped sentence in between.');
  });
});

describe('symbols', () => {
  test.each([
    ['It costs £35 for the day, including lunch.', '$'],
    ['Each room holds four to eight people.', '#'],
    ['But now people are much more aware of that.', '→'],
    ['The advantage of this layout is that it saves space.', '+'],
    ['The downside was wearing formal clothes.', '–'],
    ["I'm not sure about the winter months.", '?'],
    ["Yes, that's right. Twenty past nine.", '✓'],
    ['So make sure your boots are waterproof.', '!'],
    ['Food markets, on the other hand, are great.', '≠'],
    ['He will make sure you understand everything.', null],   // a promise, not a "remember this"
    ["We'll definitely need one.", null],                     // not a confirmation
    ['The fee has gone up to £40 for 20 people.', null],      // $ and # at once → ambiguous, unused
  ])('%s → %s', (text, expected) => {
    expect(L.symbolOf(text)).toBe(expected);
  });
});

// Phase 2 classifiers: only what the question itself shows, and only when
// the real key agrees.
const gapItem = (text, key, type = 'word', limit = 'ONE WORD ONLY', context = '') => ({ type, q: { correctAnswer: key }, gap: { text, context }, limit });

describe('wordClassOf — noun / adjective / verb from the signals the tip teaches', () => {
  test.each([
    ['the _____ of the course', 'cost', 'noun', /the ___ of/],
    ['Students need to bring a _____.', 'passport', 'noun', /“a”/],
    ['Information about _____', 'transport', 'noun', /giới từ “about”/],
    ['The rooms are extremely _____.', 'spacious', 'adjective', /“extremely”/],
    ['The accommodation seems _____', 'comfortable', 'adjective', /“seems”/],
    ['a _____ folder for maps', 'plastic', 'adjective', /folder/],
    ['Students must _____ the form.', 'submit', 'verb', /“must”/],
    ['it is very difficult to _____ rubber', 'recycle', 'verb', /difficult to/],
  ])('"%s" → %s', (text, key, expected, reason) => {
    const c = L.wordClassOf(gapItem(text, key));
    expect(c.value).toBe(expected);
    expect(c.reason).toMatch(reason);
  });

  test.each([
    ['try to give more _____', 'examples'],      // more + noun, not an adjective
    ['Bring: comfortable _____', 'shoes'],       // no signal at all
    ['The problem is _____.', 'noise'],          // be + noun: the question can't tell
  ])('"%s" → left out', (text, key) => {
    expect(L.wordClassOf(gapItem(text, key))).toBeNull();
  });
});

describe('infoTypeOf — the question names the kind of information', () => {
  test.each([
    ['Second group - Mrs. _____', 'Keogh', 'proper', 'name'],
    ['Name of supervisor: _____', 'Kaeden', 'proper', 'name'],
    ['Address: 707, _____ Street', 'KIPPAX', 'proper', 'place'],
    ['The teacher trained in _____.', 'India', 'proper', 'place'],     // "in" beats the "teacher" label
    ['Suburb: _____', 'Walkley', 'proper', 'place'],
    ['Classes end by _____ p.m.', '11.15', 'time', 'time'],
    ['Cost: £ _____', '67.50', 'price', 'price'],
    ['Date of first payment: _____', '15 October', 'date', 'date'],
    ['a total of _____ hours', '15', 'number', 'number'],
    ['Phone number: _____', '07958847222', 'number', 'number'],
  ])('"%s" → %s', (text, key, type, expected) => {
    expect(L.infoTypeOf(gapItem(text, key, type)).value).toBe(expected);
  });

  test('a nationality / language or an organisation name is neither a name nor a place', () => {
    expect(L.infoTypeOf(gapItem('must have a qualification in _____', 'English', 'proper'))).toBeNull();
    expect(L.infoTypeOf(gapItem('Name of ferry company: _____ Ferries', 'Northern', 'proper'))).toBeNull();
  });
});

describe('formOf — what to check when writing the answer down', () => {
  test.each([
    ['There are two _____.', 'classrooms', 'plural', /“two”/],
    ['Also advisable to hire _____ for warmth', 'boots', 'plural', /đuôi -s/],   // no signal: listen for it
    ['Bring some _____', 'equipment', 'uncountable', /không đếm được/],
    ['improve their English by _____ with others', 'communicating', 'ving', /“by”/],
    ['Wear a _____ to the interview', 'suit', 'singular', /“a”/],
    ['Title: _____', 'Towns and cities', 'phrase', /cụm 3 từ/],
  ])('"%s" → %s', (text, key, expected, reason) => {
    const f = L.formOf(gapItem(text, key, 'word', 'NO MORE THAN THREE WORDS'));
    expect(f.value).toBe(expected);
    expect(f.reason).toMatch(reason);
  });
});

test('formOf: alternatives of different lengths have no single form to predict', () => {
  expect(L.formOf(gapItem('Main reason: a _____', 'family outing / families'))).toBeNull();
  expect(L.formOf(gapItem('Bring a _____', 'raincoat/rain coat'))).toBeNull();
});

describe('qtypeOf — the question-type practice a question belongs to, by content', () => {
  const g = (groupType, instruction, extra = {}) => ({ groupType, instruction, ...extra });
  const q = (type, extra = {}) => ({ type, correctAnswer: 'B', options: ['a', 'b', 'c'], ...extra });
  test.each([
    ['map with its image', g('map', 'Label the map below.', { imageUrl: 'x.png' }), q('map-labelling'), 'map'],
    ['map without an image', g('map', 'Label the map below.'), q('map-labelling'), null],
    ['word-box flow-chart stored as a map', g('map', 'Complete the flow-chart.', { imageUrl: 'x.png', dragDropConfig: { words: ['a'] } }), q('map-labelling'), null],
    ['matching with its option list', g('matching-options', '', { matchingOptions: ['x', 'y', 'z'] }), q('matching-info'), 'matching'],
    ['MCQ', g('plain', 'Choose the correct letter, A, B or C.'), q('multiple-choice'), 'mcq'],
    ['"choose TWO" typed as an MCQ', g('plain', 'Choose TWO letters, A-E.'), q('multiple-choice'), null],
    ['choose TWO', g('plain', 'Choose TWO letters, A-E.'), q('multi-answer-group', { options: ['a', 'b', 'c', 'd', 'e'] }), 'multi'],
    ['sentence completion', g('note-form', 'Complete the sentences below.'), q('fill-blank', { correctAnswer: 'hat' }), 'sentence'],
    ['form completion', g('note-form', 'Complete the form below.'), q('fill-blank', { correctAnswer: 'hat' }), 'form'],
    ['a table', g('table', 'Complete the table below.'), q('fill-blank', { correctAnswer: 'hat' }), 'form'],
    ['a word-bank summary', g('summary-completion', 'Complete the summary.'), q('fill-blank', { correctAnswer: 'hat' }), null],
  ])('%s → %s', (_name, group, question, expected) => {
    expect(L.qtypeOf(group, question)).toBe(expected);
  });

  test('mapLetters: from the instruction, else up to the highest key', () => {
    expect(L.mapLetters({ instruction: 'Write the correct letter, A–F, next to questions 1–3.', questions: [] })).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(L.mapLetters({ instruction: 'White the correct letter, A -I, next to questions 15-20.', questions: [] })).toHaveLength(9);
    expect(L.mapLetters({ instruction: 'Label the plan.', questions: [{ correctAnswer: 'J' }] }).pop()).toBe('J');
  });
});

describe('diagnose — the classic slips in a wrong answer', () => {
  test.each([
    ['classroom', 'classrooms', 'ONE WORD ONLY', 'plural'],
    ['equipments', 'equipment', 'ONE WORD ONLY', 'plural'],
    ['communicate', 'communicating', 'ONE WORD ONLY', 'form'],
    ['information', 'information desk', 'NO MORE THAN TWO WORDS', 'missing'],
    ['accomodation', 'accommodation', 'ONE WORD ONLY', 'spelling'],
    ['the big information desk', 'information desk', 'NO MORE THAN TWO WORDS', 'limit'],
  ])('%s vs %s → %s', (answer, key, limit, kind) => {
    expect(L.diagnose(answer, key, limit).kind).toBe(kind);
  });

  test('numbers don\'t count towards "AND/OR A NUMBER"; an unrelated answer gets no diagnosis', () => {
    expect(L.diagnose('2 large rooms', 'rooms', 'ONE WORD AND/OR A NUMBER').kind).toBe('limit');
    expect(L.diagnose('2 rooms', 'rooms', 'ONE WORD AND/OR A NUMBER')).toBeNull();
    expect(L.diagnose('xyz', 'theatre/theater', 'ONE WORD ONLY')).toBeNull();
  });
});

test('keywordsFor: the gap\'s own words (names / numbers as one), the answer-type signal apart', () => {
  const kw = L.keywordsFor({ text: 'The Motor Show opens at _____ on 10 September', context: 'Events' }, 'The Motor Show opens at nine.');
  expect(kw.signals).toEqual(['at']);
  expect(kw.keywords).toEqual(['Motor Show', 'opens', '10 September']);
  // a bare line borrows from its heading
  expect(L.keywordsFor({ text: 'Occupation: a _____', context: 'Employer details' }, '').keywords).toEqual(['Employer', 'Occupation']);
});

describe('guided examples (phase 4)', () => {
  test('modeAt: Q1 worked example, Q2 together, the rest alone', () => {
    expect([0, 1, 2, 5].map(L.modeAt)).toEqual(['example', 'guided', 'solo', 'solo']);
  });

  test('explanationParts: "Vị trí / Transcript / Phân tích" → where + the reasoning; otherwise the text without the quote', () => {
    const full = 'Vị trí: Đầu bài.\n\nTranscript: "It can take about 2,000 people."\n\nPhân tích: Phà chở khoảng 2.000 người → đáp án C.';
    expect(L.explanationParts(full)).toEqual({ where: 'Đầu bài.', why: 'Phà chở khoảng 2.000 người → đáp án C.' });
    expect(L.explanationParts('Transcript: "x"\nBecause the speaker corrects herself.')).toEqual({ where: '', why: 'Because the speaker corrects herself.' });
    expect(L.explanationParts('')).toEqual({ where: '', why: '' });
  });

  test('trapLetters: options the speaker also mentions (numbers compared without commas)', () => {
    const ev = 'As well as the crew of 160, it can accommodate about 2,000 people and 600 cars.';
    expect(L.trapLetters(['160', '600', '2000'], ['C'], ev)).toEqual(['A', 'B']);
    // words like "the" don't count; the answer is never a trap
    expect(L.trapLetters(['the lake', 'the forest', 'the food'], ['A', 'B'], 'The two best things are the lake and the forest.')).toEqual([]);
  });
});
