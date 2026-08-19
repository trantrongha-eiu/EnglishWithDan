// Unit tests for services/dictionaryCollocationService.js — the cache-first
// wrapper making sure a word is only ever sent to Gemini once, ever.
const dictionaryCollocationService = require('../../../services/dictionaryCollocationService');
const DictionaryCollocation = require('../../../models/DictionaryCollocation');

jest.mock('../../../services/geminiService');
const geminiService = require('../../../services/geminiService');

const SAMPLE_COLLOCATIONS = [
  { phrase: 'derive benefits from', meaning: 'thu được lợi ích từ', example: 'She derived great benefits from the course.' },
  { phrase: 'provide significant benefits', meaning: 'mang lại lợi ích đáng kể', example: 'The policy provides significant benefits.' },
];

describe('dictionaryCollocationService.getCollocations', () => {
  beforeEach(() => jest.clearAllMocks());

  test('cache miss: calls Gemini, saves the result, and returns it with cached:false', async () => {
    geminiService.generateCollocations.mockResolvedValue(SAMPLE_COLLOCATIONS);

    const result = await dictionaryCollocationService.getCollocations('benefit');

    expect(geminiService.generateCollocations).toHaveBeenCalledWith('benefit');
    expect(result.cached).toBe(false);
    expect(result.word).toBe('benefit');
    expect(result.collocations).toEqual(SAMPLE_COLLOCATIONS);

    const saved = await DictionaryCollocation.findOne({ word: 'benefit' }).lean();
    expect(saved).not.toBeNull();
    expect(saved.collocations).toEqual(SAMPLE_COLLOCATIONS);
  });

  test('cache hit: does NOT call Gemini a second time for the same word', async () => {
    await DictionaryCollocation.create({ word: 'benefit', collocations: SAMPLE_COLLOCATIONS });

    const result = await dictionaryCollocationService.getCollocations('benefit');

    expect(geminiService.generateCollocations).not.toHaveBeenCalled();
    expect(result.cached).toBe(true);
    expect(result.collocations).toEqual(SAMPLE_COLLOCATIONS);
  });

  test('normalizes the word: trims whitespace and lowercases before cache lookup/save', async () => {
    geminiService.generateCollocations.mockResolvedValue(SAMPLE_COLLOCATIONS);

    await dictionaryCollocationService.getCollocations('  BENEFIT  ');

    expect(geminiService.generateCollocations).toHaveBeenCalledWith('benefit');
    const saved = await DictionaryCollocation.findOne({ word: 'benefit' }).lean();
    expect(saved).not.toBeNull();

    // A later lookup with different casing/whitespace must hit the SAME cached row.
    const second = await dictionaryCollocationService.getCollocations('Benefit');
    expect(second.cached).toBe(true);
    expect(geminiService.generateCollocations).toHaveBeenCalledTimes(1);
  });

  test('empty/blank word returns an empty result without calling Gemini or the DB', async () => {
    const result = await dictionaryCollocationService.getCollocations('   ');
    expect(result).toEqual({ word: '', collocations: [], cached: false });
    expect(geminiService.generateCollocations).not.toHaveBeenCalled();
  });

  test('two concurrent lookups of the same brand-new word both succeed (no unhandled E11000)', async () => {
    // Both calls pass the cache-miss check before either write lands —
    // Promise.all forces genuine concurrency instead of sequential awaits,
    // exercising the service's own duplicate-key swallow branch for real
    // rather than asserting on the model layer directly.
    geminiService.generateCollocations.mockResolvedValue(SAMPLE_COLLOCATIONS);

    const [first, second] = await Promise.all([
      dictionaryCollocationService.getCollocations('concurrent'),
      dictionaryCollocationService.getCollocations('concurrent'),
    ]);

    expect(first.collocations).toEqual(SAMPLE_COLLOCATIONS);
    expect(second.collocations).toEqual(SAMPLE_COLLOCATIONS);
    // Exactly one row ever persisted for this word, regardless of the race.
    expect(await DictionaryCollocation.countDocuments({ word: 'concurrent' })).toBe(1);
  });

  test('propagates a genuine Gemini failure (not a race) instead of silently returning empty', async () => {
    const err = new Error('AI đang quá tải, vui lòng thử lại.');
    err.isOverloaded = true;
    geminiService.generateCollocations.mockRejectedValue(err);

    await expect(dictionaryCollocationService.getCollocations('newword')).rejects.toThrow('AI đang quá tải');
    expect(await DictionaryCollocation.findOne({ word: 'newword' })).toBeNull();
  });
});
