// Unit tests for services/geminiService.js. The `@google/genai` SDK is
// fully mocked (jest.mock below) — no real network calls are made, no
// real API key is required. These tests exercise the internal helper
// logic (classifyGeminiError / extractJson / withTimeout) indirectly
// through the exported checkEssay / checkSpeaking / gradeT2Question
// functions, per the task instructions.

const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

const { checkEssay, checkSpeaking, gradeT2Question } = require('../../../services/geminiService');

beforeEach(() => {
  mockGenerateContent.mockReset();
  process.env.GEMINI_API_KEY = 'test-key';
});

describe('GEMINI_API_KEY missing', () => {
  test('checkEssay rejects synchronously with a Vietnamese "not configured" message when the key is unset', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(checkEssay('question', 'essay')).rejects.toThrow('GEMINI_API_KEY chưa được cấu hình');
    process.env.GEMINI_API_KEY = 'test-key';
  });

  test('checkSpeaking rejects with the same message when the key is unset', async () => {
    process.env.GEMINI_API_KEY = '';
    await expect(checkSpeaking('question', 'transcript')).rejects.toThrow('GEMINI_API_KEY chưa được cấu hình');
    process.env.GEMINI_API_KEY = 'test-key';
  });

  test('gradeT2Question rejects with its own (slightly different) unconfigured message when the key is unset', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(
      gradeT2Question({ type: 'translation', questionText: 'q', modelAnswer: '', userAnswer: 'a' })
    ).rejects.toThrow('GEMINI_API_KEY chưa cấu hình');
    process.env.GEMINI_API_KEY = 'test-key';
  });
});

describe('classifyGeminiError behavior (via checkEssay)', () => {
  test('an error with status 429 is classified as overloaded with the Vietnamese overload message', async () => {
    mockGenerateContent.mockRejectedValue(Object.assign(new Error('quota exceeded'), { status: 429 }));

    await expect(checkEssay('question', 'essay')).rejects.toMatchObject({
      isOverloaded: true,
      message: 'AI đang quá tải hoặc hết quota, vui lòng thử lại sau ít phút.',
    });
  });

  test('an error with status 503 is classified as overloaded', async () => {
    mockGenerateContent.mockRejectedValue(Object.assign(new Error('service unavailable'), { status: 503 }));

    await expect(checkEssay('question', 'essay')).rejects.toMatchObject({ isOverloaded: true });
  });

  test.each([
    'overloaded',
    'resource_exhausted',
    'quota',
    'unavailable',
    'too many requests',
    'OVERLOADED', // case-insensitive
  ])('a message containing %j (no special status) is classified as overloaded', async (fragment) => {
    mockGenerateContent.mockRejectedValue(new Error(`Something went wrong: ${fragment}`));

    await expect(checkEssay('question', 'essay')).rejects.toMatchObject({
      isOverloaded: true,
      message: 'AI đang quá tải hoặc hết quota, vui lòng thử lại sau ít phút.',
    });
  });

  test('a non-overload error passes through unchanged (isOverloaded falsy, original message preserved)', async () => {
    mockGenerateContent.mockRejectedValue(new Error('some other failure'));

    let caught;
    try {
      await checkEssay('question', 'essay');
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    expect(caught.isOverloaded).toBeFalsy();
    expect(caught.message).toBe('some other failure');
  });

  test('checkSpeaking uses its own overload message text', async () => {
    mockGenerateContent.mockRejectedValue(Object.assign(new Error('quota'), { status: 429 }));

    await expect(checkSpeaking('question', 'transcript')).rejects.toMatchObject({
      isOverloaded: true,
      message: 'AI đang quá tải, vui lòng thử lại sau ít phút.',
    });
  });

  test('gradeT2Question uses its own overload message text', async () => {
    mockGenerateContent.mockRejectedValue(Object.assign(new Error('quota'), { status: 429 }));

    await expect(
      gradeT2Question({ type: 'translation', questionText: 'q', modelAnswer: '', userAnswer: 'a' })
    ).rejects.toMatchObject({
      isOverloaded: true,
      message: 'AI đang quá tải, vui lòng thử lại.',
    });
  });
});

describe('extractJson behavior (via checkSpeaking)', () => {
  test('extracts a JSON object embedded in surrounding prose', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'Sure! Here is the JSON: {"overall_band": 6.5, "fluency": 6}',
    });

    const result = await checkSpeaking('question', 'transcript');
    expect(result).toEqual({ overall_band: 6.5, fluency: 6 });
  });

  test('retries once automatically when the first response has no parseable JSON, and succeeds on the second try', async () => {
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'not json at all' })
      .mockResolvedValueOnce({ text: '{"overall_band": 7, "fluency": 7}' });

    const result = await checkSpeaking('question', 'transcript');
    expect(result).toEqual({ overall_band: 7, fluency: 7 });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  test('rejects with the Vietnamese "invalid JSON after 2 attempts" message when both attempts fail, calling the SDK exactly twice', async () => {
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'still not json' })
      .mockResolvedValueOnce({ text: 'still not json again' });

    await expect(checkSpeaking('question', 'transcript')).rejects.toThrow(
      'Gemini không trả về JSON hợp lệ sau 2 lần thử'
    );
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  test('checkEssay also retries once and eventually succeeds', async () => {
    mockGenerateContent
      .mockResolvedValueOnce({ text: 'nope' })
      .mockResolvedValueOnce({ text: '{"overall_band": 6}' });

    const result = await checkEssay('question', 'essay');
    expect(result).toEqual({ overall_band: 6 });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });
});

describe('withTimeout behavior (via checkEssay, checkSpeaking, gradeT2Question)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('checkEssay rejects as overloaded once its 45s internal timeout fires on a hanging call', async () => {
    mockGenerateContent.mockReturnValue(new Promise(() => {})); // never resolves

    const promise = checkEssay('question', 'essay');
    // Prevent an unhandled-rejection warning from firing before we await below.
    const assertion = expect(promise).rejects.toMatchObject({
      isOverloaded: true,
      message: 'AI phản hồi quá lâu, vui lòng thử lại sau ít phút.',
    });

    await jest.advanceTimersByTimeAsync(45001);
    await assertion;
  });

  test('checkSpeaking rejects as overloaded once its 30s internal timeout fires', async () => {
    mockGenerateContent.mockReturnValue(new Promise(() => {}));

    const promise = checkSpeaking('question', 'transcript');
    const assertion = expect(promise).rejects.toMatchObject({
      isOverloaded: true,
      message: 'AI phản hồi quá lâu, vui lòng thử lại sau ít phút.',
    });

    await jest.advanceTimersByTimeAsync(30001);
    await assertion;
  });

  test('gradeT2Question rejects as overloaded once its 30s internal timeout fires', async () => {
    mockGenerateContent.mockReturnValue(new Promise(() => {}));

    const promise = gradeT2Question({ type: 'translation', questionText: 'q', modelAnswer: '', userAnswer: 'a' });
    const assertion = expect(promise).rejects.toMatchObject({
      isOverloaded: true,
      message: 'AI phản hồi quá lâu, vui lòng thử lại.',
    });

    await jest.advanceTimersByTimeAsync(30001);
    await assertion;
  });
});

describe('gradeT2Question type normalization', () => {
  test('normalizes a string "true" isCorrect to boolean true, and clamps score to a max of 100', async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"isCorrect": "true", "score": 150, "feedbackVi": "tốt"}',
    });

    const result = await gradeT2Question({
      type: 'translation',
      questionText: 'q',
      modelAnswer: '',
      userAnswer: 'a',
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(100);
  });

  test('clamps a negative score to a minimum of 0', async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"isCorrect": false, "score": -20, "feedbackVi": "sai"}',
    });

    const result = await gradeT2Question({
      type: 'translation',
      questionText: 'q',
      modelAnswer: '',
      userAnswer: 'a',
    });

    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  test('boolean true isCorrect passes through unchanged', async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"isCorrect": true, "score": 80, "feedbackVi": "ok"}',
    });

    const result = await gradeT2Question({
      type: 'error_correction',
      questionText: 'q',
      modelAnswer: 'm',
      userAnswer: 'a',
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(80);
  });
});
