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
