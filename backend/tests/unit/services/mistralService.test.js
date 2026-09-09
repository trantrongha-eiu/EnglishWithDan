// Unit tests for services/mistralService.js — the opt-in Voxtral fallback
// for Speaking grading. The live API call is not exercised here (no key in
// CI, and the exact Voxtral audio content-part shape needs a real key to
// verify — see docs/ENVIRONMENT_VARIABLES.md); these cover the pure bits.
const { checkSpeakingMistral, _voxtralFormat } = require('../../../services/mistralService');

describe('_voxtralFormat', () => {
  test('maps the mimeTypes normalizeAudioForGemini produces to Voxtral formats', () => {
    expect(_voxtralFormat('audio/ogg')).toBe('ogg');
    expect(_voxtralFormat('audio/wav')).toBe('wav');
    expect(_voxtralFormat('audio/mp3')).toBe('mp3');
    expect(_voxtralFormat('audio/mpeg')).toBe('mp3');
    expect(_voxtralFormat('audio/flac')).toBe('flac');
    expect(_voxtralFormat('video/mp4')).toBe('m4a');
    // webm / unknown → null (Voxtral can't take it → transcript-only on this tier)
    expect(_voxtralFormat('video/webm')).toBeNull();
    expect(_voxtralFormat('audio/webm')).toBeNull();
    expect(_voxtralFormat('')).toBeNull();
    expect(_voxtralFormat(null)).toBeNull();
  });
});

describe('checkSpeakingMistral', () => {
  const ORIGINAL = process.env.MISTRAL_API_KEY;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.MISTRAL_API_KEY;
    else process.env.MISTRAL_API_KEY = ORIGINAL;
  });

  test('throws (does not call out) when MISTRAL_API_KEY is unset', async () => {
    delete process.env.MISTRAL_API_KEY;
    await expect(checkSpeakingMistral('Q', 't', 1)).rejects.toThrow('MISTRAL_API_KEY chưa được cấu hình');
  });
});
