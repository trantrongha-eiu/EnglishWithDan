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
