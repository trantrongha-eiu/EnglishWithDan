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
