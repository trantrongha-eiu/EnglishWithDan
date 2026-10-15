// GET /api/listening/dictation/section/:id/translations — Vietnamese meaning
// per dictation sentence, generated once per section and cached by text.
const request = require('supertest');
const app = require('../../app');
const geminiService = require('../../services/geminiService');
const ListeningSection = require('../../models/ListeningSection');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');

const SENTENCES = [
  { text: 'Welcome to Bankside Recruitment Agency.', start: 0, end: 2 },
  { text: 'And you’ll pick up office skills really quickly on the job.', start: 2, end: 5 },
];

function get(id, token) {
  return request(app).get(`/api/listening/dictation/section/${id}/translations`).set('Authorization', `Bearer ${token}`);
}

afterEach(() => jest.restoreAllMocks());

describe('GET /api/listening/dictation/section/:id/translations', () => {
  test('translates once, stores by text, then serves from the DB', async () => {
    const token = signTokenFor(await createStudent());
    const section = await createListeningSection({ extra: { dictationSentences: SENTENCES } });
    const spy = jest.spyOn(geminiService, 'translateDictationSentences')
      .mockResolvedValue(['Chào mừng đến Bankside.', 'Bạn sẽ học kỹ năng văn phòng rất nhanh.']);

    const first = await get(section._id, token);
    expect(first.status).toBe(200);
    expect(first.body.translations).toEqual(['Chào mừng đến Bankside.', 'Bạn sẽ học kỹ năng văn phòng rất nhanh.']);
    expect(spy).toHaveBeenCalledTimes(1);

    const stored = await ListeningSection.findById(section._id).select('dictationVi').lean();
    expect(stored.dictationVi.map(d => d.text)).toEqual(SENTENCES.map(s => s.text));

    const second = await get(section._id, token);
    expect(second.body.translations).toEqual(first.body.translations);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('only re-translates sentences whose text changed', async () => {
    const token = signTokenFor(await createStudent());
    const section = await createListeningSection({
      extra: { dictationSentences: SENTENCES, dictationVi: [{ text: SENTENCES[0].text, vi: 'Đã có sẵn.' }] },
    });
    const spy = jest.spyOn(geminiService, 'translateDictationSentences').mockResolvedValue(['Câu mới.']);

    const res = await get(section._id, token);
    expect(spy).toHaveBeenCalledWith([SENTENCES[1].text]);
    expect(res.body.translations).toEqual(['Đã có sẵn.', 'Câu mới.']);
  });

  test('an AI failure still answers, with empty meanings', async () => {
    const token = signTokenFor(await createStudent());
    const section = await createListeningSection({ extra: { dictationSentences: SENTENCES } });
    jest.spyOn(geminiService, 'translateDictationSentences').mockRejectedValue(new Error('quota'));

    const res = await get(section._id, token);
    expect(res.status).toBe(200);
    expect(res.body.translations).toEqual(['', '']);
  });

  test('404 for a bad id or a section without dictation', async () => {
    const token = signTokenFor(await createStudent());
    expect((await get('not-an-id', token)).status).toBe(404);
    const plain = await createListeningSection();
    expect((await get(plain._id, token)).status).toBe(404);
  });
});
