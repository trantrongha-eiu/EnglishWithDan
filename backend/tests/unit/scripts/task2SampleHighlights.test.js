// Colour-coded sentence roles on Task 2 model essays — helpers + the
// hand-written data they are applied to. No DB involved.
const {
  ROLES, splitSentences, parseSpec, highlightsFromSpec, buildParagraph,
} = require('../../../scripts/data/task2SampleHighlights');
const SAMPLES = require('../../../scripts/data/task2DanielSamples');
const SPECS = require('../../../scripts/data/task2SampleHighlightSpecs');
const GUIDES = require('../../../scripts/data/task2/typeGuides');
const WritingTask2 = require('../../../models/WritingTask2');

describe('splitSentences', () => {
  test('splits on sentence ends, keeps abbreviations and decimals together', () => {
    expect(splitSentences('First one. Second, e.g. this one? Third! 3.5 per cent rose. "Quoted." End'))
      .toEqual(['First one.', 'Second, e.g. this one?', 'Third!', '3.5 per cent rose.', '"Quoted."', 'End']);
  });
  test('collapses whitespace and handles empty input', () => {
    expect(splitSentences('  A  b.\n\nC d. ')).toEqual(['A b.', 'C d.']);
    expect(splitSentences('')).toEqual([]);
    expect(splitSentences(undefined)).toEqual([]);
  });
});

describe('parseSpec / highlightsFromSpec', () => {
  test('expands ranges and maps codes to roles', () => {
    expect(parseSpec('T0 I1 S2-3 J4 U5')).toEqual([
      { role: 'topic', idx: 0 }, { role: 'idea1', idx: 1 }, { role: 'support1', idx: 2 },
      { role: 'support1', idx: 3 }, { role: 'idea2', idx: 4 }, { role: 'support2', idx: 5 },
    ]);
    expect(parseSpec('H0')).toEqual([{ role: 'hook', idx: 0 }]);
  });
  test('rejects bad tokens and out-of-range sentences', () => {
    expect(() => parseSpec('X1')).toThrow(/bad spec token/);
    expect(() => highlightsFromSpec('Only one.', 'T0 I1')).toThrow(/out of range/);
  });
});

describe('buildParagraph', () => {
  test('joins sentences and keeps only tagged ones as highlights', () => {
    expect(buildParagraph([['T', 'Topic here.'], ['', 'Plain.'], ['I', 'Idea.']])).toEqual({
      content: 'Topic here. Plain. Idea.',
      highlights: [{ role: 'topic', text: 'Topic here.' }, { role: 'idea1', text: 'Idea.' }],
    });
  });
  test('rejects unknown codes', () => {
    expect(() => buildParagraph([['Z', 'x.']])).toThrow(/unknown role code/);
  });
});

describe('hand-written Daniel samples', () => {
  test('26 unique ids, none overlapping the highlight specs', () => {
    const ids = SAMPLES.map(s => s.id);
    expect(ids).toHaveLength(26);
    expect(new Set(ids).size).toBe(26);
    ids.forEach(id => expect(SPECS[id]).toBeUndefined());
  });

  test.each(SAMPLES.map(s => [s.id, s]))('%s follows the template structure', (_id, s) => {
    const [intro, b1, b2] = [s.intro, s.body1, s.body2].map(buildParagraph);
    expect(intro.highlights.map(h => h.role)).toEqual(['hook']);
    expect(intro.content.startsWith(intro.highlights[0].text)).toBe(true);
    for (const body of [b1, b2]) {
      const roles = body.highlights.map(h => h.role);
      // topic → idea 1 → supporting 1 → idea 2 → supporting 2, in order.
      expect(roles[0]).toBe('topic');
      ['idea1', 'support1', 'idea2', 'support2'].forEach(r => expect(roles).toContain(r));
      const order = roles.map(r => ROLES.indexOf(r));
      expect([...order].sort((a, b) => a - b)).toEqual(order);
      // every tagged sentence survives the splitter as one sentence
      const sents = splitSentences(body.content);
      body.highlights.forEach(h => expect(sents).toContain(h.text));
    }
    expect(s.conclusion.length).toBeGreaterThanOrEqual(2);
    if (s.analysis) expect(s.analysis.length).toBe(4);
  });

  test('highlights validate against the WritingTask2 schema', async () => {
    const s = SAMPLES[0];
    const doc = new WritingTask2({
      prompt: 'x',
      sampleSections: [s.intro, s.body1].map(buildParagraph).map((p, i) => ({ title: `S${i}`, ...p })),
    });
    await expect(doc.validate()).resolves.toBeUndefined();
    expect(doc.sampleSections[1].highlights[0].role).toBe('topic');
  });
});

describe('specs for pre-existing essays and type-guide model essays', () => {
  test('every spec parses', () => {
    for (const [id, specs] of Object.entries(SPECS)) {
      expect(id).toMatch(/^[0-9a-f]{24}$/);
      expect(specs).toHaveLength(2);
      specs.forEach(sp => expect(() => parseSpec(sp)).not.toThrow());
    }
  });

  test.each(GUIDES.map(g => [g.typeId, g]))('%s guide essay specs resolve to real sentences', (_t, g) => {
    const { highlightSpecs, sections } = g.modelEssay;
    expect(highlightSpecs).toHaveLength(3);
    highlightSpecs.forEach((spec, i) => {
      const hl = highlightsFromSpec(sections[i].text, spec);
      hl.forEach(h => expect(sections[i].text).toContain(h.text));
    });
  });
});
