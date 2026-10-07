// Unit tests for geminiService.generateGapFillBlanks' quality-retry logic —
// added while auditing existing Listening Gap-fill content, which turned
// out to average ~16 blanks per section (target: 25-30) despite the prompt
// already asking for that range, and had no server-side guard against the
// AI picking a person/place name as an answer. The @google/genai SDK is
// fully mocked — no real network calls.
const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

const { generateGapFillBlanks } = require('../../../services/geminiService');

beforeEach(() => {
  mockGenerateContent.mockReset();
  process.env.GEMINI_API_KEY = 'test-key';
});

// Builds a {transcript, buildResponse} pair: `words` is the full word list,
// `blankIdx` the 0-based positions to punch into [[n]] tokens — the
// resulting template always reconstructs to the exact transcript, so only
// the quality checks (blank count / name heuristic) are ever exercised,
// never the reconstruct-mismatch retry path.
function makeCase(words) {
  const transcript = words.join(' ');
  return {
    transcript,
    respond(blankIdx) {
      let n = 1;
      const templateWords = words.map((w, i) => (blankIdx.includes(i) ? `[[${n++}]]` : w));
      const answers = blankIdx.map((i) => words[i]);
      mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify({ template: templateWords.join(' '), answers }) });
    },
  };
}

// A 320-lowercase-word filler transcript — long enough to trigger the
// "too few blanks" quality check (wordCount >= 300), and none of its words
// are Title-Case so they never trip the name heuristic.
function longFillerWords(n = 320) {
  return Array.from({ length: n }, (_, i) => `word${i + 1}`);
}

describe('generateGapFillBlanks — too-few-blanks quality retry', () => {
  test('retries once when a long transcript gets far fewer than 25 blanks, and accepts a compliant retry', async () => {
    const words = longFillerWords();
    const { transcript, respond } = makeCase(words);
    respond(Array.from({ length: 10 }, (_, i) => i));           // 1st attempt: only 10 blanks
    respond(Array.from({ length: 27 }, (_, i) => i));           // 2nd attempt: compliant 27 blanks

    const result = await generateGapFillBlanks(transcript);

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.answers).toHaveLength(27);
    expect(result.flaggedNames).toEqual([]);
  });

  test('does NOT retry for a short transcript with few blanks — the short-transcript exception applies', async () => {
    const words = 'This is a short lovely walking holiday in the countryside today'.split(' ');
    const { transcript, respond } = makeCase(words);
    respond([3]); // just 1 blank ("short") — fine, transcript is under 300 words

    const result = await generateGapFillBlanks(transcript);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.answers).toEqual(['short']);
  });
});

describe('generateGapFillBlanks — question-number annotations', () => {
  const transcript = 'They make use of waste (31) products as raw materials. Handling them is cleaner (32) than wood.';

  test('a template that moved/dropped "(31)"-style annotations still passes the fidelity check', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify({
      template: 'They make use of [[1]] products as raw (31) materials. Handling them is [[2]] than wood.',
      answers: ['waste', 'cleaner'],
    }) });
    const result = await generateGapFillBlanks(transcript);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.answers).toEqual(['waste', 'cleaner']);
  });

  test('an answer that contains an annotation is rejected (students would have to type it)', async () => {
    const bad = { text: JSON.stringify({ template: 'They make use of [[1]] products as raw materials. Handling them is cleaner (32) than wood.', answers: ['waste (31)'] }) };
    mockGenerateContent.mockResolvedValueOnce(bad).mockResolvedValueOnce(bad).mockResolvedValueOnce(bad);
    await expect(generateGapFillBlanks(transcript)).rejects.toThrow(/không giữ nguyên transcript/);
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  test('a real word change is never stored: after the retries the answers are punched into the ORIGINAL text', async () => {
    const bad = { text: JSON.stringify({ template: 'They make use of [[1]] products as raw materials. Handling them is nicer than [[2]].', answers: ['waste', 'wood'] }) };
    mockGenerateContent.mockResolvedValueOnce(bad).mockResolvedValueOnce(bad).mockResolvedValueOnce(bad);
    const result = await generateGapFillBlanks(transcript);
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    expect(result.template).toBe('They make use of [[1]] (31) products as raw materials. Handling them is cleaner (32) than [[2]].');
    expect(result.answers).toEqual(['waste', 'wood']);
  });
});

describe('generateGapFillBlanks — rebuild-from-answers fallback', () => {
  const transcript = '❓ Transcript\nManham Port\nWelcome to Manham Port, where history is brought to life.\nVisit our copper mine and see the machinery.';

  test('a template that keeps rewriting the header is rebuilt from the answers, in order, on the untouched text', async () => {
    const bad = { text: JSON.stringify({ template: 'Manham Port\nWelcome to Manham Port, where [[1]] is brought to life.\nVisit our [[2]] and see the [[3]].', answers: ['history', 'copper mine', 'machinery'] }) };
    mockGenerateContent.mockResolvedValueOnce(bad).mockResolvedValueOnce(bad).mockResolvedValueOnce(bad);
    const result = await generateGapFillBlanks(transcript);
    expect(result.template).toBe('❓ Transcript\nManham Port\nWelcome to Manham Port, where [[1]] is brought to life.\nVisit our [[2]] and see the [[3]].');
    expect(result.answers).toEqual(['history', 'copper mine', 'machinery']);
  });

  test('matches whole words only and drops answers that are not in the text; gives up when most are missing', async () => {
    const partly = { text: JSON.stringify({ template: 'x', answers: ['story', 'copper mine', 'nonexistent phrase'] }) };
    mockGenerateContent.mockResolvedValueOnce(partly).mockResolvedValueOnce(partly).mockResolvedValueOnce(partly);
    // "story" must not match inside "history"; 1 of 3 kept < half → error
    await expect(generateGapFillBlanks(transcript)).rejects.toThrow(/không giữ nguyên transcript/);
  });
});

describe('generateGapFillBlanks — person/place name quality retry', () => {
  test('retries when an answer looks like a proper name, passing it back as a "do not reuse" hint', async () => {
    const words = 'This lovely walking holiday takes place in London every single summer weekend'.split(' ');
    const londonIdx = words.indexOf('London');
    const lovelyIdx = words.indexOf('lovely');
    const holidayIdx = words.indexOf('holiday');
    const { transcript, respond } = makeCase(words);

    respond([lovelyIdx, londonIdx]);   // 1st attempt: picks the place name "London"
    respond([lovelyIdx, holidayIdx]);  // 2nd attempt: clean, no name

    const result = await generateGapFillBlanks(transcript);

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.flaggedNames).toEqual([]);
    expect(result.answers).toEqual(['lovely', 'holiday']);

    // The retry prompt must explicitly name "London" so the model can't just
    // reach for another proper noun instead.
    const retryPrompt = mockGenerateContent.mock.calls[1][0].contents;
    expect(retryPrompt).toContain('London');
  });

  test('reports a name still present after exhausting the retry budget, rather than looping forever', async () => {
    const words = 'This lovely walking holiday takes place in London every single summer weekend'.split(' ');
    const londonIdx = words.indexOf('London');
    const lovelyIdx = words.indexOf('lovely');
    const { transcript, respond } = makeCase(words);

    respond([lovelyIdx, londonIdx]);
    respond([lovelyIdx, londonIdx]);
    respond([lovelyIdx, londonIdx]);

    const result = await generateGapFillBlanks(transcript);

    // MAX_ATTEMPTS=2 → 3 calls total (attempt 0, 1, 2), then it gives up
    // retrying and returns what it has, with the name reported for review.
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    expect(result.flaggedNames).toEqual(['London']);
    expect(result.answers).toContain('London');
  });

  test('a weekday/month answer is NOT flagged as a name (common non-name capitalized words are exempt)', async () => {
    const words = 'The tour always starts early on Monday in September near the harbour'.split(' ');
    const mondayIdx = words.indexOf('Monday');
    const septemberIdx = words.indexOf('September');
    const { transcript, respond } = makeCase(words);
    respond([mondayIdx, septemberIdx]);

    const result = await generateGapFillBlanks(transcript);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result.flaggedNames).toEqual([]);
  });
});
