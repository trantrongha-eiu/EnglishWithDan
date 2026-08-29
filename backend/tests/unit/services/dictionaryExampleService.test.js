// Unit tests for services/dictionaryExampleService.js — the cache-first
// wrapper making sure a word is only ever sent to the AI once, ever, plus
// the bulk path used by "Nhập hàng loạt".
const svc = require('../../../services/dictionaryExampleService');
const DictionaryExample = require('../../../models/DictionaryExample');

jest.mock('../../../services/geminiService');
const geminiService = require('../../../services/geminiService');

describe('dictionaryExampleService.getExample', () => {
  beforeEach(() => jest.clearAllMocks());

  test('cache miss: calls the AI, saves the sentence, returns cached:false', async () => {
    geminiService.generateExampleSentence.mockResolvedValue('The fire forced them to abandon the building.');

    const r = await svc.getExample('abandon');

    expect(geminiService.generateExampleSentence).toHaveBeenCalledWith('abandon');
    expect(r).toEqual({ word: 'abandon', example: 'The fire forced them to abandon the building.', cached: false });
    const saved = await DictionaryExample.findOne({ word: 'abandon' }).lean();
    expect(saved.example).toBe('The fire forced them to abandon the building.');
  });

  test('cache hit: does not call the AI again for the same word', async () => {
    await DictionaryExample.create({ word: 'abandon', example: 'cached one' });

    const r = await svc.getExample('  ABANDON ');

    expect(geminiService.generateExampleSentence).not.toHaveBeenCalled();
    expect(r).toEqual({ word: 'abandon', example: 'cached one', cached: true });
  });

  test('caches a negative result ("" for a non-word) so it is not re-sent', async () => {
    geminiService.generateExampleSentence.mockResolvedValue('');

    const first = await svc.getExample('asdfqwer');
    expect(first.example).toBe('');
    const second = await svc.getExample('asdfqwer');
    expect(second.cached).toBe(true);
    expect(geminiService.generateExampleSentence).toHaveBeenCalledTimes(1);
  });

  test('blank word: no AI call, no DB write', async () => {
    const r = await svc.getExample('   ');
    expect(r).toEqual({ word: '', example: '', cached: false });
    expect(geminiService.generateExampleSentence).not.toHaveBeenCalled();
  });

  test('two concurrent lookups of the same new word: exactly one row persisted', async () => {
    geminiService.generateExampleSentence.mockResolvedValue('a sentence');
    const [a, b] = await Promise.all([svc.getExample('racy'), svc.getExample('racy')]);
    expect(a.example).toBe('a sentence');
    expect(b.example).toBe('a sentence');
    expect(await DictionaryExample.countDocuments({ word: 'racy' })).toBe(1);
  });

  test('propagates a genuine AI failure instead of caching it', async () => {
    const err = new Error('AI đang quá tải, vui lòng thử lại.');
    err.isOverloaded = true;
    geminiService.generateExampleSentence.mockRejectedValue(err);
    await expect(svc.getExample('boom')).rejects.toThrow('AI đang quá tải');
    expect(await DictionaryExample.findOne({ word: 'boom' })).toBeNull();
  });
});

describe('dictionaryExampleService.getExamplesBulk', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns cached rows as-is and only generates the misses', async () => {
    await DictionaryExample.create({ word: 'apple', example: 'cached apple' });
    geminiService.generateExampleSentence.mockImplementation(async (w) => `made for ${w}`);

    const { examples, generated } = await svc.getExamplesBulk(['apple', 'Banana', 'banana', ' cherry ']);

    expect(examples).toEqual({
      apple: 'cached apple',
      banana: 'made for banana',
      cherry: 'made for cherry',
    });
    expect(generated).toBe(2); // banana + cherry, deduped/normalized
    expect(geminiService.generateExampleSentence).toHaveBeenCalledTimes(2);
  });

  test('one word failing does not fail the batch — that word comes back ""', async () => {
    geminiService.generateExampleSentence.mockImplementation(async (w) => {
      if (w === 'bad') throw new Error('overloaded');
      return `ok ${w}`;
    });

    const { examples } = await svc.getExamplesBulk(['good', 'bad']);
    expect(examples.good).toBe('ok good');
    expect(examples.bad).toBe('');
  });

  test('words past the per-request generate cap come back "" (not sent to the AI)', async () => {
    geminiService.generateExampleSentence.mockImplementation(async (w) => `x ${w}`);
    const words = Array.from({ length: svc.MAX_GENERATE_PER_REQUEST + 5 }, (_, i) => `w${i}`);

    const { examples, generated } = await svc.getExamplesBulk(words);

    expect(generated).toBe(svc.MAX_GENERATE_PER_REQUEST);
    expect(geminiService.generateExampleSentence).toHaveBeenCalledTimes(svc.MAX_GENERATE_PER_REQUEST);
    expect(examples.w0).toBe('x w0');
    expect(examples[`w${svc.MAX_GENERATE_PER_REQUEST + 4}`]).toBe('');
  });

  test('empty list: no AI call', async () => {
    const { examples, generated } = await svc.getExamplesBulk([]);
    expect(examples).toEqual({});
    expect(generated).toBe(0);
    expect(geminiService.generateExampleSentence).not.toHaveBeenCalled();
  });
});
