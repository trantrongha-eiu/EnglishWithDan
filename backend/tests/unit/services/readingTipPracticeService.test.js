// Pure-function coverage for the Reading Tips practice builder: turning
// the bank's inconsistent passage HTML into numbered paragraphs, locating
// the evidence a teacher's explanation quotes, and picking scan anchors.
// The shapes below are the real ones found in the production bank.
const { _internals: I } = require('../../../services/readingTipPracticeService');

describe('passageToParagraphs', () => {
  test('title and bold standfirst are not counted as paragraph 1', () => {
    const paras = I.passageToParagraphs(
      '<h2>The persistence of misinformation</h2>'
      + '<p><strong>Brian Southwell looks at how human brains verify information.</strong></p>'
      + '<p>Misinformation is not a new problem. People have lied for ever.</p>'
      + '<p>However, technology now spreads it faster.</p>');
    expect(paras.map(p => p.n)).toEqual([null, null, 1, 2]);
    expect(paras[2].text).toMatch(/^Misinformation is not a new problem/);
    expect(paras[2].leadEnd).toBe('Misinformation is not a new problem.'.length);
  });

  test('section letters on their own ("A." block) or above the text label the next paragraph', () => {
    const own = I.passageToParagraphs('<p><strong>A.</strong></p><p>First text here.</p><p><strong>B.</strong></p><p>Second text.</p>');
    expect(own.map(p => [p.label, p.n])).toEqual([['A', 1], ['B', 2]]);
    const lead = I.passageToParagraphs('<p><strong>A</strong><br>\nArtificial intelligence can already predict the future.</p>');
    expect(lead[0]).toMatchObject({ label: 'A', n: 1, text: 'Artificial intelligence can already predict the future.' });
  });

  test('handles a full <!DOCTYPE> document and entity-encoded text', () => {
    const paras = I.passageToParagraphs('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>X</title></head><body>'
      + '<p>Innovation describes the way\n    we develop new ideas &amp; products.</p></body></html>');
    expect(paras).toHaveLength(1);
    expect(paras[0].text).toBe('Innovation describes the way we develop new ideas & products.');
  });

  test('plain text with blank-line breaks and no <p> tags', () => {
    const paras = I.passageToParagraphs('It was that summer. People knew it.\n\nJune was the warmest month.');
    expect(paras.map(p => p.n)).toEqual([1, 2]);
  });

  test('bold letters opening a paragraph on the same line are labels ("<strong>A.</strong> Around…", "<b>B</b> Most…")', () => {
    const paras = I.passageToParagraphs('<p>Mark Rowe investigates elms</p><p><strong>A.</strong> Around 25 million elms died.</p><p><b>B</b> Most social scientists resist.</p>');
    expect(paras.map(p => [p.label, p.text])).toEqual([
      [null, 'Mark Rowe investigates elms'], ['A', 'Around 25 million elms died.'], ['B', 'Most social scientists resist.']]);
  });

  test('plain-text "A. …" counts as a label only when the letters run A, B, C…', () => {
    const seq = I.passageToParagraphs('<p>A. First point here.</p><p>B. Second point here.</p><p>C. Third point here.</p>');
    expect(seq.map(p => p.label)).toEqual(['A', 'B', 'C']);
    const initials = I.passageToParagraphs('<p>Some intro sentence here.</p><p>A. J. Smith argued otherwise.</p>');
    expect(initials.map(p => p.label)).toEqual([null, null]);
    expect(initials[1].text).toBe('A. J. Smith argued otherwise.');
  });
});

describe('gradePhraseSelection (Keyword → Paraphrase highlight)', () => {
  test.each([
    ['spoilt the flavor', 'spoilt the flavor', true],
    ['the method spoilt the flavor of', 'spoilt the flavor', true], // a little extra context is fine
    ['flavor', 'spoilt the flavor', false], // half the phrase
    ['crystals formed within the cells of the food and', 'spoilt the flavor', false],
    ['At least three observations', 'At least three observations', true],
  ])('%s vs %s → %s', (selected, phrase, expected) => {
    expect(I.gradePhraseSelection(selected, phrase)).toBe(expected);
  });
});

describe('evidenceSpan', () => {
  test('widens a quoted fragment to its whole sentence(s), nothing more', () => {
    const paras = I.passageToParagraphs('<p>First sentence here. In 1851, railroads put ice in cars. Last one.</p>');
    expect(I.evidenceSpan({ paragraphIndex: 0, text: 'put ice in' }, paras).text).toBe('In 1851, railroads put ice in cars.');
    expect(I.evidenceSpan({ paragraphIndex: 0, text: 'cars. Last' }, paras).text).toBe('In 1851, railroads put ice in cars. Last one.');
  });
});

describe('classifyGroup', () => {
  const q = (n, type, key, extra = {}) => ({ questionNumber: n, type, questionText: `Q${n}`, correctAnswer: key, ...extra });
  test.each([
    ['tfng', { questions: [q(1, 'true-false-ng', 'TRUE'), q(2, 'true-false-ng', 'NOT GIVEN')] }],
    ['ynng', { questions: [q(1, 'yes-no-ng', 'NO'), q(2, 'yes-no-ng', 'NOT GIVEN')] }],
    [null, { questions: [q(1, 'true-false-ng', 'YES'), q(2, 'true-false-ng', 'NO')] }], // type/keys disagree
    ['headings', { headingsConfig: { headings: [{ numeral: 'i', text: 'a' }, { numeral: 'ii', text: 'b' }, { numeral: 'iii', text: 'c' }] }, questions: [q(1, 'matching-headings', 'ii')] }],
    ['mcq', { questions: [q(1, 'multiple-choice', 'C', { options: ['a', 'b', 'c', 'd'] })] }],
    [null, { instruction: 'Choose TWO letters, A–E.', questions: [q(1, 'multiple-choice', 'C', { options: ['a', 'b', 'c', 'd', 'e'] })] }],
    [null, { groupType: 'matching-options', instruction: 'Complete each sentence with the correct ending, A–F, below.', matchingOptions: ['x x', 'y y'], questions: [q(1, 'matching-info', 'A')] }],
    [null, { instruction: 'Complete the summary using the list of words, A–J, below.', questions: [q(1, 'fill-blank', 'E')] }],
    ['matching_info', { instruction: 'Which section contains the following information?', matchingOptions: ['A', 'B', 'C'], questions: [q(1, 'matching-info', 'B')] }],
    ['matching_info', { matchingOptions: [], questions: [q(1, 'matching-info', 'D')] }],
    ['matching_features', { matchingOptions: ['Dan Macon', 'Julie Young'], questions: [q(1, 'matching-info', 'B')] }],
    [null, { instruction: 'Classify the following developments as A early, B middle or C late.', questions: [q(1, 'matching-info', 'B')] }],
    [null, { interchangeableAnswers: true, matchingOptions: ['Ben Novak', 'Beth Shapiro'], questions: [q(1, 'matching-info', 'B')] }],
    ['typed', { questions: [q(1, 'fill-blank', 'harbour'), q(2, 'sentence-completion', '1906')] }],
  ])('%s', (expected, group) => {
    expect(I.classifyGroup(group)).toBe(expected);
  });
});

describe('locateQuotes / locateEvidence', () => {
  const paras = I.passageToParagraphs('<p>Intro sentence here. There may be more than 120 tree species per acre of forest.</p>'
    + '<p>Traces of such tunnels used to mine gold can still be found at the Dolaucothi mines in Wales.</p>');

  test('finds a “Transcript:” / 📌 Trích dẫn: line and returns the exact paragraph substring', () => {
    const ev = I.locateEvidence('📌 Trích dẫn: Traces of such tunnels used to mine gold can still be found at the Dolaucothi mines in Wales. (Đoạn 4)', paras);
    expect(ev).toEqual({ paragraphIndex: 1, text: 'Traces of such tunnels used to mine gold can still be found at the Dolaucothi mines in Wales' });
  });

  test('unwraps a [bracketed answer] inside the quote instead of cutting the quote there', () => {
    const ev = I.locateEvidence('"There may be more than 120 [tree species] per acre."', paras);
    expect(ev.text).toBe('There may be more than 120 tree species per acre');
  });

  test('returns null when the explanation quotes nothing from this passage', () => {
    expect(I.locateEvidence('Như trên câu 23', paras)).toBeNull();
    expect(I.locateEvidence('', paras)).toBeNull();
  });
});

describe('extractAnchors', () => {
  const text = 'The stormwater programme in Miami Beach began in 2016. Engineers in Indonesia built dams. In 1880, meat was shipped.';
  const norm = I.normalizeForMatch(text);

  test('keeps names and numbers that occur in the passage, drops sentence-opening words', () => {
    expect(I.extractAnchors('The stormwater programme in Miami Beach installed efficient pumps', text, norm)).toEqual(['Miami Beach']);
    expect(I.extractAnchors('Engineers in Indonesia built _____ in 1880', text, norm)).toEqual(['1880', 'Indonesia']);
  });

  test('ignores anchors that are not in the passage', () => {
    expect(I.extractAnchors('Scientists in Brazil planted trees in 1999', text, norm)).toEqual([]);
  });
});

describe('answerInPassage', () => {
  const norm = I.normalizeForMatch('The two warmest summers were 1976 and 1995. Trams carried visitors.');
  test('any "/" alternative, or every part of a multi-part answer, must occur as a whole term', () => {
    expect(I.answerInPassage('tram / trams / tramline', norm)).toBe(true);
    expect(I.answerInPassage('1976 and 1995 / 1976, 1995', norm)).toBe(true);
    expect(I.answerInPassage('architect', norm)).toBe(false);
    expect(I.answerInPassage('ram', norm)).toBe(false); // not a substring match inside "trams"
  });
});
