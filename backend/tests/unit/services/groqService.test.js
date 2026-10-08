// Unit tests for services/groqService.js — global fetch is mocked, no real
// network calls, no real GROQ_API_KEY needed. Focus: the Task 2 essay
// generator added for the offline seed script.

const groq = require('../../../services/groqService');

function mockGroqJson(obj) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(obj) } }] }),
  });
}

beforeEach(() => { process.env.GROQ_API_KEY = 'test-key'; });
afterEach(() => { delete global.fetch; });

const GOOD = {
  sampleSections: [
    { title: 'a', content: 'Intro.' }, { title: 'b', content: 'Body one.' },
    { title: 'c', content: 'Body two.' }, { title: 'd', content: 'Conclusion.' },
  ],
  analysisSections: [
    { title: '1', content: 'x' }, { title: '2', content: 'y' },
    { title: '3', content: 'z' }, { title: '4', content: 'w' },
  ],
};

describe('generateTask2EssayGroq', () => {
  test('returns 4 canonically-titled sample sections + analysis', async () => {
    mockGroqJson(GOOD);
    const out = await groq.generateTask2EssayGroq('prompt', 'Agree / Disagree', 'SKELETON');
    expect(out.sampleSections.map(s => s.title)).toEqual(['Introduction', 'Body 1', 'Body 2', 'Conclusion']);
    expect(out.sampleSections[2].content).toBe('Body two.');
    expect(out.analysisSections).toHaveLength(4);
  });

  test('retries once on a malformed shape, then throws', async () => {
    mockGroqJson({ sampleSections: [{ title: 'a', content: 'one' }], analysisSections: [] });
    await expect(groq.generateTask2EssayGroq('p', 'Agree / Disagree', 's'))
      .rejects.toThrow('Groq không trả về JSON hợp lệ sau 2 lần thử');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('rejects when GROQ_API_KEY is unset', async () => {
    delete process.env.GROQ_API_KEY;
    await expect(groq.generateTask2EssayGroq('p', 'Agree / Disagree', 's'))
      .rejects.toThrow('GROQ_API_KEY chưa được cấu hình');
  });
});

describe('gradeTask2BandGroq', () => {
  test('parses the band number', async () => {
    mockGroqJson({ band: 7.5 });
    expect(await groq.gradeTask2BandGroq('p', 'essay')).toBe(7.5);
  });

  test('returns null (never throws) on an API error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'err' });
    expect(await groq.gradeTask2BandGroq('p', 'essay')).toBeNull();
  });
});

describe('transcribeSpeechGroq', () => {
  test('uploads the recording to Whisper with an extension matching its mimetype and returns the text', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ text: '  I like jogging.  ' }) });
    const text = await groq.transcribeSpeechGroq({ data: Buffer.from('abc').toString('base64'), mimeType: 'video/webm' });
    expect(text).toBe('I like jogging.');
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toMatch(/audio\/transcriptions$/);
    expect(init.body.get('file').name).toBe('answer.webm');
    expect(init.body.get('model')).toBe('whisper-large-v3');
    expect(init.body.get('language')).toBe('en');
  });

  test('maps audio/mp3 to .mp3 and unknown types to .webm', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ text: 'x' }) });
    await groq.transcribeSpeechGroq({ data: 'eA==', mimeType: 'audio/mp3' });
    await groq.transcribeSpeechGroq({ data: 'eA==', mimeType: 'weird/thing' });
    expect(global.fetch.mock.calls[0][1].body.get('file').name).toBe('answer.mp3');
    expect(global.fetch.mock.calls[1][1].body.get('file').name).toBe('answer.webm');
  });

  test('throws on an API error, a missing key, or no audio', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'rate_limit_exceeded' });
    await expect(groq.transcribeSpeechGroq({ data: 'eA==', mimeType: 'video/webm' })).rejects.toThrow('Groq transcription lỗi (429)');
    await expect(groq.transcribeSpeechGroq(null)).rejects.toThrow('Không có bản ghi âm');
    delete process.env.GROQ_API_KEY;
    await expect(groq.transcribeSpeechGroq({ data: 'eA==' })).rejects.toThrow('GROQ_API_KEY');
  });
});
