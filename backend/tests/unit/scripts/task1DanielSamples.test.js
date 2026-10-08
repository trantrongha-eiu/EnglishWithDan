// Task 1 "Model answers from Daniel" data + its colour-coded sentence
// roles (scripts/data/task1DanielSamples.js). No DB involved.
const {
  TASK1_ROLES, splitSentences, parseSpec, buildParagraph,
} = require('../../../scripts/data/task2SampleHighlights');
const { SAMPLES, ANALYSES, TEXT_FIXES, SPECS } = require('../../../scripts/data/task1DanielSamples');
const WritingTask1 = require('../../../models/WritingTask1');

const PARTS = ['intro', 'overview', 'body1', 'body2'];
const words = s => s.trim().split(/\s+/).filter(Boolean).length;

describe('Task 1 samples', () => {
  test('unique ids, none also in SPECS', () => {
    const ids = SAMPLES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach(id => expect(SPECS[id]).toBeUndefined());
  });

  test.each(SAMPLES.map(s => [s.id, s]))('%s: every sentence tagged with the right part’s role', (_id, s) => {
    const paras = PARTS.map(k => buildParagraph(s[k]));
    paras.forEach((p, i) => {
      // one tag per sentence, each tag exactly one sentence
      expect(p.highlights).toHaveLength(s[PARTS[i]].length);
      expect(splitSentences(p.content)).toEqual(p.highlights.map(h => h.text));
      p.highlights.forEach(h => expect(TASK1_ROLES).toContain(h.role));
    });
    expect(paras[0].highlights.every(h => h.role === 'paraphrase')).toBe(true);
    expect(paras[1].highlights.every(h => h.role === 'overview')).toBe(true);
    [paras[2], paras[3]].forEach(b => b.highlights.forEach(h => expect(['topic', 'detail', 'compare']).toContain(h.role)));
    const total = paras.reduce((n, p) => n + words(p.content), 0);
    expect(total).toBeGreaterThanOrEqual(150);
  });

  test('highlights validate against the WritingTask1 schema', async () => {
    const s = SAMPLES[0];
    const doc = new WritingTask1({
      prompt: 'x',
      sampleSections: PARTS.map(k => buildParagraph(s[k])).map((p, i) => ({ title: `S${i}`, ...p })),
    });
    await expect(doc.validate()).resolves.toBeUndefined();
    expect(doc.sampleSections[1].highlights[0].role).toBe('overview');
  });
});

describe('Task 1 specs, analyses, fixes', () => {
  test('specs are [intro, overview, body1, body2] with Task 1 codes only', () => {
    for (const [id, specs] of Object.entries(SPECS)) {
      expect(id).toMatch(/^[0-9a-f]{24}$/);
      expect(specs).toHaveLength(4);
      expect(specs[0]).toMatch(/^[Q0-9 -]+$/);
      expect(specs[1]).toMatch(/^[O0-9 -]+$/);
      expect(specs[2]).toMatch(/^[TDC0-9 -]+$/);
      expect(specs[3]).toMatch(/^[TDC0-9 -]+$/);
      specs.forEach(sp => parseSpec(sp).forEach(({ role }) => expect(TASK1_ROLES).toContain(role)));
    }
  });

  test('analyses follow the 4-section "Phân tích nhanh" format', () => {
    for (const a of ANALYSES) {
      expect(a.id).toMatch(/^[0-9a-f]{24}$/);
      expect(a.sections).toHaveLength(4);
      expect(a.sections[0].title).toBe('1. Phân tích nhanh đề này');
      expect(a.sections[1].title).toMatch(/^2\. Body 1 – /);
      expect(a.sections[2].title).toMatch(/^3\. Body 2 – /);
      expect(a.sections[3].title).toMatch(/^4\. Công thức áp dụng cho dạng /);
      a.sections.forEach(s => expect(s.content.trim().length).toBeGreaterThan(100));
    }
  });

  test('text fixes are well-formed', () => {
    for (const f of TEXT_FIXES) {
      expect(['prompt', 'sampleSections', 'analysisSections']).toContain(f.field);
      if (f.field !== 'prompt') expect(Number.isInteger(f.index)).toBe(true);
      expect(f.from).not.toBe(f.to);
    }
  });

  test('rewrites name the old Body 1 they replace', () => {
    for (const s of SAMPLES.filter(x => 'replaces' in x)) {
      expect(typeof s.replaces).toBe('string');
      expect(s.replaces.length).toBeGreaterThan(20);
      // the new essay must not itself start with the text it replaces
      expect(buildParagraph(s.body1).content.startsWith(s.replaces)).toBe(false);
    }
  });
});
