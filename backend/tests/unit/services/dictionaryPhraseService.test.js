// Unit tests for services/dictionaryPhraseService.js — the cache-first
// wrapper behind the Writing screens' "Tra từ vựng" panel, plus
// geminiService.sanitisePhraseLookup (the AI-output cleanup it relies on).
const dictionaryPhraseService = require('../../../services/dictionaryPhraseService');
const DictionaryPhrase = require('../../../models/DictionaryPhrase');

jest.mock('../../../services/geminiService');
const geminiService = require('../../../services/geminiService');
const { sanitisePhraseLookup } = jest.requireActual('../../../services/geminiService');

const SAMPLE = {
  phrase: 'sudden drop',
  meaning: 'giảm đột ngột',
  alternatives: ['sharp decline', 'abrupt fall'],
  examples: [
    { en: 'The production of paper experienced a sudden drop in 1990.', highlight: 'sudden drop', vi: 'giảm đột ngột' },
  ],
};

describe('dictionaryPhraseService.lookup', () => {
  beforeEach(() => jest.clearAllMocks());

  test('cache miss: calls the AI, saves, and returns cached:false', async () => {
    geminiService.generatePhraseLookup.mockResolvedValue(SAMPLE);

    const result = await dictionaryPhraseService.lookup('giảm đột ngột', 'vi-en');

    expect(geminiService.generatePhraseLookup).toHaveBeenCalledWith('giảm đột ngột', 'vi-en');
    expect(result).toMatchObject({ ...SAMPLE, dir: 'vi-en', query: 'giảm đột ngột', cached: false });
    expect(await DictionaryPhrase.countDocuments({ key: 'vi-en:giảm đột ngột' })).toBe(1);
  });

  test('cache hit after normalizing case/whitespace; direction is part of the key', async () => {
    geminiService.generatePhraseLookup.mockResolvedValue(SAMPLE);

    await dictionaryPhraseService.lookup('Giảm   đột ngột ', 'vi-en');
    const second = await dictionaryPhraseService.lookup('giảm đột ngột', 'vi-en');
    expect(second.cached).toBe(true);
    expect(geminiService.generatePhraseLookup).toHaveBeenCalledTimes(1);

    await dictionaryPhraseService.lookup('giảm đột ngột', 'en-vi');
    expect(geminiService.generatePhraseLookup).toHaveBeenCalledTimes(2);
  });

  test('rejects an unknown direction without calling the AI', async () => {
    await expect(dictionaryPhraseService.lookup('x', 'fr-en')).rejects.toThrow('Chiều tra');
    expect(geminiService.generatePhraseLookup).not.toHaveBeenCalled();
  });

  test('blank query returns an empty result without calling the AI', async () => {
    const result = await dictionaryPhraseService.lookup('   ', 'en-vi');
    expect(result.phrase).toBe('');
    expect(geminiService.generatePhraseLookup).not.toHaveBeenCalled();
  });

  test('two concurrent lookups of a new phrase both succeed, one row saved', async () => {
    geminiService.generatePhraseLookup.mockResolvedValue(SAMPLE);
    const [a, b] = await Promise.all([
      dictionaryPhraseService.lookup('sudden drop', 'en-vi'),
      dictionaryPhraseService.lookup('sudden drop', 'en-vi'),
    ]);
    expect(a.phrase).toBe('sudden drop');
    expect(b.phrase).toBe('sudden drop');
    expect(await DictionaryPhrase.countDocuments({ key: 'en-vi:sudden drop' })).toBe(1);
  });

  test('propagates an AI failure and caches nothing', async () => {
    const err = new Error('AI đang quá tải, vui lòng thử lại.');
    err.isOverloaded = true;
    geminiService.generatePhraseLookup.mockRejectedValue(err);
    await expect(dictionaryPhraseService.lookup('tăng mạnh', 'vi-en')).rejects.toThrow('AI đang quá tải');
    expect(await DictionaryPhrase.countDocuments({})).toBe(0);
  });
});

describe('geminiService.sanitisePhraseLookup', () => {
  test('drops a highlight that is not in the sentence, dedupes alternatives, removes the phrase itself', () => {
    const out = sanitisePhraseLookup({
      phrase: 'sudden drop',
      meaning: 'giảm đột ngột',
      alternatives: ['Sudden drop', 'sharp decline', 'sharp decline', ''],
      examples: [
        { en: 'Sales saw a sharp decline.', highlight: 'steep fall', vi: 'x' },
        { en: '', highlight: 'a', vi: 'b' },
      ],
    });
    expect(out.alternatives).toEqual(['sharp decline']);
    expect(out.examples).toEqual([{ en: 'Sales saw a sharp decline.', highlight: '', vi: 'x' }]);
  });

  test('an empty phrase (nonsense input) empties everything', () => {
    expect(sanitisePhraseLookup({ phrase: '', meaning: 'x', alternatives: ['y'] }))
      .toEqual({ phrase: '', meaning: '', alternatives: [], examples: [] });
  });
});
