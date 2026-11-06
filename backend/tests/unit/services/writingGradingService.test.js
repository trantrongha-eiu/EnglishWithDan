// Unit tests for services/writingGradingService.js — specifically the
// bandScore recalculation from the 4 criterion scores. Site policy is to
// always round DOWN to the nearest 0.5, deliberately stricter than the
// official IELTS half-up-at-.25/.75 convention.
const { gradeTaskWithAI } = require('../../../services/writingGradingService');

jest.mock('../../../services/geminiService');
const { checkEssay } = require('../../../services/geminiService');

afterEach(() => {
  jest.clearAllMocks();
});

describe('writingGradingService.gradeTaskWithAI — bandScore rounding', () => {
  test('four matching criterion scores produce a clean band, unchanged', async () => {
    checkEssay.mockResolvedValue({
      bandScore: 9, // deliberately wrong self-report — server must ignore it
      ta: { score: 6 }, cc: { score: 6 }, lr: { score: 6 }, gra: { score: 6 },
    });
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(260) + '.', 260);
    expect(result.bandScore).toBe(6);
  });

  test('one criterion below the rest rounds the average DOWN, not up (site policy, not official IELTS rounding)', async () => {
    // avg = (6+6+6+5)/4 = 5.75 — official IELTS rounding would round this
    // UP to 6.0; this platform's stricter policy rounds it DOWN to 5.5.
    checkEssay.mockResolvedValue({
      ta: { score: 6 }, cc: { score: 6 }, lr: { score: 6 }, gra: { score: 5 },
    });
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(260) + '.', 260);
    expect(result.bandScore).toBe(5.5);
  });

  test('an average that is only barely under a whole band still rounds down to the half below', async () => {
    // avg = (7+7+7+6)/4 = 6.75 -> floor, not the official round-up-to-7.
    checkEssay.mockResolvedValue({
      ta: { score: 7 }, cc: { score: 7 }, lr: { score: 7 }, gra: { score: 6 },
    });
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(260) + '.', 260);
    expect(result.bandScore).toBe(6.5);
  });

  test('an exact .5 average is left untouched (floor and round agree here)', async () => {
    // avg = (7+7+6+6)/4 = 6.5
    checkEssay.mockResolvedValue({
      ta: { score: 7 }, cc: { score: 7 }, lr: { score: 6 }, gra: { score: 6 },
    });
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(260) + '.', 260);
    expect(result.bandScore).toBe(6.5);
  });
});

// Regression coverage for BUG-012 (2026-08-27 audit): the server-side
// under-length safety net applied Task 1's hard-cap-at-Band-5 rule to
// Task 2 as well, even though Task 2's own IDP rule is a relative
// reduction ("at least 1 band"), not an absolute cap — a strong-but-short
// Task 2 essay the AI correctly scored at 6 or 7 got force-capped to 5.
// Each test verifies the ACTUAL numeric result.ta.score, not just a 200.
describe('writingGradingService.gradeTaskWithAI — under-length penalty is task-specific (BUG-012)', () => {
  function mockAi(taScore) {
    checkEssay.mockResolvedValue({ ta: { score: taScore }, cc: { score: 6 }, lr: { score: 6 }, gra: { score: 6 } });
  }

  test('Task 1, severely under length (50/150 words), AI score 7 -> hard-capped to 5', async () => {
    mockAi(7);
    const result = await gradeTaskWithAI(1, 'prompt', 'a'.repeat(50) + '.', 50);
    expect(result.ta.score).toBe(5);
  });

  test('Task 1, severely under length, AI score already <=5 -> left unchanged (cap never raises a score)', async () => {
    mockAi(4);
    const result = await gradeTaskWithAI(1, 'prompt', 'a'.repeat(50) + '.', 50);
    expect(result.ta.score).toBe(4);
  });

  test('Task 1, normal length (200/150 words) -> no cap applied regardless of score', async () => {
    mockAi(9);
    const result = await gradeTaskWithAI(1, 'prompt', 'a'.repeat(200) + '.', 200);
    expect(result.ta.score).toBe(9);
  });

  test('Task 1, boundary: exactly the 150-word minimum -> not treated as under length', async () => {
    mockAi(8);
    const result = await gradeTaskWithAI(1, 'prompt', 'a'.repeat(150) + '.', 150);
    expect(result.ta.score).toBe(8);
  });

  test('Task 2, severely under length (100/250 words), AI score 7 -> NOT capped to 5 (the bug)', async () => {
    mockAi(7);
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(100) + '.', 100);
    expect(result.ta.score).toBe(7);
  });

  test('Task 2, severely under length, AI score 6 -> left unchanged (relative reduction is the AI\'s own responsibility per the prompt, not a server hard cap)', async () => {
    mockAi(6);
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(100) + '.', 100);
    expect(result.ta.score).toBe(6);
  });

  test('Task 2, normal length (300/250 words) -> no cap applied regardless of score', async () => {
    mockAi(9);
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(300) + '.', 300);
    expect(result.ta.score).toBe(9);
  });

  test('Task 2, boundary: exactly the 250-word minimum -> not treated as under length', async () => {
    mockAi(8);
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(250) + '.', 250);
    expect(result.ta.score).toBe(8);
  });

  test('incomplete essay penalty (cap at Band 4) still applies identically to both Task 1 and Task 2', async () => {
    mockAi(7);
    // no trailing punctuation -> isIncomplete
    const t1 = await gradeTaskWithAI(1, 'prompt', 'a'.repeat(200), 200);
    expect(t1.ta.score).toBe(4);

    mockAi(7);
    const t2 = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(300), 300);
    expect(t2.ta.score).toBe(4);
  });

  test('incomplete essay penalty never raises a score already at or below 4', async () => {
    mockAi(3);
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(300), 300);
    expect(result.ta.score).toBe(3);
  });
});

// Task 1 data checking: the model misread a small line graph (London Jan
// ~8°C read as 5°C) and capped a correct essay at TA Band 5. The prompt now
// carries teacher-entered figures as the authority plus a reading tolerance.
describe('writingGradingService.gradeTaskWithAI — Task 1 chart data', () => {
  const essay = 'a '.repeat(170) + 'end.';
  const ok = () => ({ chartReading: 'London Jan ~8', ta: { score: 6 }, cc: { score: 6 }, lr: { score: 6 }, gra: { score: 6 } });

  test('teacher figures are sent as authoritative reference data, with the tolerance rule', async () => {
    checkEssay.mockResolvedValue(ok());
    await gradeTaskWithAI(1, 'The graph shows...', essay, 171, 'https://img/c.png', 'London: Jan 8, Jul 23');
    const [prompt, , imageUrl] = checkEssay.mock.calls[0];
    expect(prompt).toContain('REFERENCE DATA');
    expect(prompt).toContain('London: Jan 8, Jul 23');
    expect(prompt).toContain('READING TOLERANCE');
    expect(prompt).toContain('"chartReading"');
    expect(imageUrl).toBe('https://img/c.png');
  });

  test('image only: tolerance rule applies, no reference-data block', async () => {
    checkEssay.mockResolvedValue(ok());
    await gradeTaskWithAI(1, 'The graph shows...', essay, 171, 'https://img/c.png');
    const [prompt] = checkEssay.mock.calls[0];
    expect(prompt).not.toContain('REFERENCE DATA');
    expect(prompt).toContain('READING TOLERANCE');
  });

  test('the model\'s chartReading scratch work is stripped from the saved result', async () => {
    checkEssay.mockResolvedValue(ok());
    const result = await gradeTaskWithAI(1, 'The graph shows...', essay, 171, 'https://img/c.png');
    expect(result.chartReading).toBeUndefined();
  });

  test('Task 2 ignores chart data entirely', async () => {
    checkEssay.mockResolvedValue(ok());
    await gradeTaskWithAI(2, 'Discuss...', 'b '.repeat(260) + 'end.', 261, '', 'London: Jan 8');
    const [prompt] = checkEssay.mock.calls[0];
    expect(prompt).not.toContain('REFERENCE DATA');
    expect(prompt).not.toContain('DATA ACCURACY');
  });
});

describe('writingGradingService.normalizeFeedback — detailed error feedback', () => {
  const { normalizeFeedback } = require('../../../services/writingGradingService');

  test('a sentence with listed errors becomes an issue with legacy criterion/issue filled in', () => {
    const r = normalizeFeedback({ sentenceFeedback: [{
      type: 'ok', original: 'The number of students have increased.',
      errors: [{ wrong: 'have increased', fix: 'has increased', criterion: 'gra', category: 'sva', why: 'Chủ ngữ số ít.' }],
      better: 'The number of students has increased.',
    }] }, 2);
    const s = r.sentenceFeedback[0];
    expect(s.type).toBe('issue');
    expect(s.criterion).toBe('GRA');
    expect(s.issue).toBe('Chủ ngữ số ít.');
    expect(s.errors).toHaveLength(1);
    expect(s.better).toBe('The number of students has increased.');
  });

  test('no-op errors are dropped and an "issue" with nothing left falls back to ok', () => {
    const r = normalizeFeedback({ sentenceFeedback: [{
      type: 'issue', original: 'This is fine.', errors: [{ wrong: 'fine', fix: 'fine' }], better: 'This is fine.',
    }] }, 2);
    expect(r.sentenceFeedback[0]).toEqual({ type: 'ok', original: 'This is fine.' });
  });

  test('unknown category becomes "other"; TA/TR criterion follows the task', () => {
    const t1 = normalizeFeedback({ sentenceFeedback: [{ original: 'A rose to 50%.',
      errors: [{ wrong: '50%', fix: '30%', criterion: 'TR', category: 'made_up' }] }] }, 1);
    expect(t1.sentenceFeedback[0].errors[0]).toMatchObject({ criterion: 'TA', category: 'other' });
    const t2 = normalizeFeedback({ sentenceFeedback: [{ original: 'X.',
      errors: [{ wrong: 'X', fix: 'Y', criterion: 'TA', category: 'spelling' }] }] }, 2);
    expect(t2.sentenceFeedback[0].errors[0]).toMatchObject({ criterion: 'TR', category: 'spelling' });
  });

  test('upgrades must quote the sentence; at most two per sentence and 12 per essay', () => {
    const sentences = Array.from({ length: 12 }, (_, i) => ({
      type: 'ok', original: `Sentence ${i} is very good.`,
      upgrades: [{ from: 'very good', to: 'excellent', why: '' }, { from: 'is', to: 'remains' }, { from: 'Sentence', to: 'Line' }],
    }));
    sentences.push({ type: 'ok', original: 'Nothing here.', upgrades: [{ from: 'not in sentence', to: 'x' }] });
    const r = normalizeFeedback({ sentenceFeedback: sentences }, 2);
    const ups = r.sentenceFeedback.map(s => (s.upgrades || []).length);
    expect(Math.max(...ups)).toBe(2);
    expect(ups.reduce((a, b) => a + b, 0)).toBe(12);
    expect(r.sentenceFeedback[12].upgrades).toBeUndefined();
  });

  test('an "issue" with no concrete error counts as correct; the rewrite is kept only as a suggestion', () => {
    const r = normalizeFeedback({ sentenceFeedback: [{
      type: 'issue', original: 'The disposal of trash in landfill fell.', criterion: 'LR',
      issue: 'Hơi thiếu tính học thuật.', better: 'Waste disposal in landfills fell.',
    }] }, 1);
    expect(r.sentenceFeedback[0]).toEqual({
      type: 'ok', original: 'The disposal of trash in landfill fell.',
      suggestion: 'Waste disposal in landfills fell.', suggestionWhy: 'Hơi thiếu tính học thuật.',
    });
  });

  test('logicFeedback and draft2Plan are cleaned and capped; missing ones become empty arrays', () => {
    const r = normalizeFeedback({
      logicFeedback: [{ paragraph: '2', criterion: 'cc', problem: 'Lặp ý.', suggestion: 'Gộp lại.' }, { paragraph: 3 }],
      draft2Plan: ['Thêm overview.', '', 'a', 'b', 'c', 'd', 'e'],
    }, 2);
    expect(r.logicFeedback).toEqual([{ paragraph: 2, criterion: 'CC', quote: '', problem: 'Lặp ý.', suggestion: 'Gộp lại.' }]);
    expect(r.draft2Plan).toEqual(['Thêm overview.', 'a', 'b', 'c', 'd']);
    expect(normalizeFeedback({}, 1)).toMatchObject({ sentenceFeedback: [], logicFeedback: [], draft2Plan: [] });
  });

  test('gradeTaskWithAI asks for the larger token/time budget and normalizes the answer', async () => {
    checkEssay.mockResolvedValue({ ta: { score: 6 }, cc: { score: 6 }, lr: { score: 6 }, gra: { score: 6 },
      sentenceFeedback: [{ type: 'issue', original: 'Ok.', errors: [] }] });
    const result = await gradeTaskWithAI(2, 'prompt', 'a'.repeat(260) + '.', 260);
    expect(checkEssay.mock.calls[0][3]).toMatchObject({ maxOutputTokens: expect.any(Number), timeoutMs: expect.any(Number) });
    expect(result.sentenceFeedback[0].type).toBe('ok');
    expect(result.logicFeedback).toEqual([]);
  });
});
