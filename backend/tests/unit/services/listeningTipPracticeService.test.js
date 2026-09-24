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

test('keywordsFor: the gap\'s own words (names / numbers as one), the answer-type signal apart', () => {
  const kw = L.keywordsFor({ text: 'The Motor Show opens at _____ on 10 September', context: 'Events' }, 'The Motor Show opens at nine.');
  expect(kw.signals).toEqual(['at']);
  expect(kw.keywords).toEqual(['Motor Show', 'opens', '10 September']);
  // a bare line borrows from its heading
  expect(L.keywordsFor({ text: 'Occupation: a _____', context: 'Employer details' }, '').keywords).toEqual(['Employer', 'Occupation']);
});
