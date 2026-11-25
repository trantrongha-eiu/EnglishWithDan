// "🚩 Báo lỗi câu này" on Luyện Dictation (services/dictationReportService.js):
// a student reports one sentence, the admin page lists it with the sentence
// as it is now, fixes it in place (closing every open report of it + a
// thank-you message), removes a sentence (later reports re-numbered), and
// edits the config (on/off, reasons) that the student page gets with the list.
const request = require('supertest');
const app = require('../../app');
const { createStudent, createTeacher, createAdmin, signTokenFor } = require('../factories/userFactory');
const { createListeningSection } = require('../factories/contentFactory');
const DictationDrill = require('../../models/DictationDrill');
const DictationReport = require('../../models/DictationReport');
const ListeningSection = require('../../models/ListeningSection');
const Message = require('../../models/Message');

const bearer = (u) => ({ Authorization: `Bearer ${signTokenFor(u)}` });
const SENTENCES = [
  { text: 'Good morning everyone.', start: 0, end: 2 },
  { text: 'The tour starts at ten.', start: 2, end: 4.5 },
  { text: 'Please bring a hat.', start: 4.5, end: 6 },
];

async function seedSection() {
  return createListeningSection({ title: 'Museum tour', extra: { dictationSentences: SENTENCES } });
}

describe('dictation reports', () => {
  test('list carries the report config; a student reports a sentence (snapshot from the DB, not the client)', async () => {
    const student = await createStudent();
    const section = await seedSection();
    const list = await request(app).get('/api/listening/dictation/list').set(bearer(student));
    expect(list.body.reportConfig).toEqual(expect.objectContaining({ enabled: true }));
    expect(list.body.reportConfig.reasons.map((r) => r.key)).toContain('wrong_text');

    const res = await request(app).post('/api/listening/dictation/report').set(bearer(student))
      .send({ sectionId: String(section._id), sentenceIndex: 1, reason: 'wrong_text', note: 'should be "eleven"', typedText: 'The tour starts at eleven.', sentenceText: 'HACKED' });
    expect(res.status).toBe(200);
    const r = await DictationReport.findOne({}).lean();
    expect(r).toEqual(expect.objectContaining({ kind: 'section', sentenceIndex: 1, sentenceText: 'The tour starts at ten.', start: 2, end: 4.5, status: 'open', lessonTitle: 'Museum tour', reasonLabel: expect.any(String) }));

    // The same sentence again updates the open report instead of adding one
    const again = await request(app).post('/api/listening/dictation/report').set(bearer(student))
      .send({ sectionId: String(section._id), sentenceIndex: 1, reason: 'mismatch' });
    expect(again.body.updated).toBe(true);
    expect(await DictationReport.countDocuments()).toBe(1);
  });

  test('bad input is refused: unknown reason, out-of-range sentence, "other" without a note, feature off', async () => {
    const student = await createStudent();
    const teacher = await createTeacher();
    const section = await seedSection();
    const post = (body) => request(app).post('/api/listening/dictation/report').set(bearer(student)).send({ sectionId: String(section._id), ...body });
    expect((await post({ sentenceIndex: 0, reason: 'nope' })).status).toBe(400);
    expect((await post({ sentenceIndex: 9, reason: 'wrong_text' })).status).toBe(404);
    expect((await post({ sentenceIndex: 0, reason: 'other' })).status).toBe(400);

    await request(app).put('/api/admin/dictation-reports/settings').set(bearer(teacher)).send({ enabled: false });
    expect((await post({ sentenceIndex: 0, reason: 'wrong_text' })).status).toBe(403);
    const list = await request(app).get('/api/listening/dictation/list').set(bearer(student));
    expect(list.body.reportConfig.enabled).toBe(false);
  });

  test('admin lists open reports with the current sentence; fixing it closes all its reports and thanks the students', async () => {
    const [a, b] = [await createStudent(), await createStudent()];
    const teacher = await createTeacher();
    const section = await seedSection();
    for (const s of [a, b]) {
      await request(app).post('/api/listening/dictation/report').set(bearer(s)).send({ sectionId: String(section._id), sentenceIndex: 1, reason: 'cut_audio' });
    }
    expect((await request(app).get('/api/listening/dictation/list').set(bearer(a))).status).toBe(200);
    expect((await request(app).get('/api/admin/dictation-reports').set(bearer(a))).status).toBe(403);

    const list = await request(app).get('/api/admin/dictation-reports').set(bearer(teacher));
    expect(list.status).toBe(200);
    expect(list.body.counts.open).toBe(2);
    expect(list.body.reports[0]).toEqual(expect.objectContaining({ sameOpen: 2, targetId: String(section._id), current: expect.objectContaining({ text: 'The tour starts at ten.' }) }));
    expect((await request(app).get('/api/admin/sidebar-badges').set(bearer(teacher))).body.dictationReports).toBe(2);

    const one = await request(app).get(`/api/admin/dictation-reports/sentence/section/${section._id}/1`).set(bearer(teacher));
    expect(one.body).toEqual(expect.objectContaining({ total: 3, prev: expect.objectContaining({ end: 2 }), next: expect.objectContaining({ start: 4.5 }) }));

    expect((await request(app).put(`/api/admin/dictation-reports/sentence/section/${section._id}/1`).set(bearer(teacher)).send({ start: 3, end: 2 })).status).toBe(400);
    const fix = await request(app).put(`/api/admin/dictation-reports/sentence/section/${section._id}/1`).set(bearer(teacher))
      .send({ text: 'The tour starts at eleven.', start: 1.9, end: 4.8, adminNote: 'retimed' });
    expect(fix.status).toBe(200);
    expect(fix.body.closed).toBe(2);
    const saved = await ListeningSection.findById(section._id).lean();
    expect(saved.dictationSentences[1]).toEqual(expect.objectContaining({ text: 'The tour starts at eleven.', start: 1.9, end: 4.8 }));
    expect(await DictationReport.countDocuments({ status: 'fixed', adminNote: 'retimed', resolvedAt: { $ne: null } })).toBe(2);
    expect(await Message.countDocuments({ toId: { $in: [a._id, b._id] } })).toBe(2);
  });

  test('removing a sentence (admin only) closes its reports and re-numbers the later ones', async () => {
    const student = await createStudent();
    const teacher = await createAdmin();
    expect((await request(app).delete('/api/admin/dictation-reports/sentence/section/x/0').set(bearer(await createTeacher()))).status).toBe(403);
    const section = await seedSection();
    for (const i of [0, 2]) {
      await request(app).post('/api/listening/dictation/report').set(bearer(student)).send({ sectionId: String(section._id), sentenceIndex: i, reason: 'mismatch' });
    }
    const del = await request(app).delete(`/api/admin/dictation-reports/sentence/section/${section._id}/0`).set(bearer(teacher));
    expect(del.status).toBe(200);
    expect((await ListeningSection.findById(section._id).lean()).dictationSentences.map((s) => s.text)).toEqual(['The tour starts at ten.', 'Please bring a hat.']);
    const later = await DictationReport.findOne({ sentenceText: 'Please bring a hat.' }).lean();
    expect(later).toEqual(expect.objectContaining({ sentenceIndex: 1, status: 'open' }));
    const removed = await DictationReport.findOne({ sentenceText: 'Good morning everyone.' }).lean();
    expect(removed).toEqual(expect.objectContaining({ status: 'fixed', sentenceRemoved: true }));
    const list = await request(app).get('/api/admin/dictation-reports?status=all').set(bearer(teacher));
    expect(list.body.reports.find((r) => r.sentenceRemoved).current).toBeNull();
  });

  test('drill items are reported by slug; the answer can be fixed; dismissing with sameSentence closes them all', async () => {
    const student = await createStudent();
    const teacher = await createTeacher();
    const drill = await DictationDrill.create({
      slug: 'spelling-1', title: 'Spelling · Set 1', category: 'spelling',
      items: [{ answer: 'Keogh', text: "It's K-E-O-G-H.", audioUrl: 'https://media.example.com/a.mp3', start: 0, end: 3 }],
    });
    const rep = await request(app).post('/api/listening/dictation/report').set(bearer(student)).send({ drillSlug: 'spelling-1', sentenceIndex: 0, reason: 'wrong_text' });
    expect(rep.status).toBe(200);
    const r = await DictationReport.findOne({}).lean();
    expect(r).toEqual(expect.objectContaining({ kind: 'drill', answer: 'Keogh', drillSlug: 'spelling-1' }));
    expect(String(r.drillId)).toBe(String(drill._id));

    const fix = await request(app).put(`/api/admin/dictation-reports/sentence/drill/${drill._id}/0`).set(bearer(teacher)).send({ answer: 'Keough' });
    expect(fix.status).toBe(200);
    expect((await DictationDrill.findById(drill._id).lean()).items[0].answer).toBe('Keough');

    await request(app).post('/api/listening/dictation/report').set(bearer(student)).send({ drillSlug: 'spelling-1', sentenceIndex: 0, reason: 'no_audio' });
    const open = await DictationReport.findOne({ status: 'open' }).lean();
    const dis = await request(app).patch(`/api/admin/dictation-reports/${open._id}`).set(bearer(teacher)).send({ status: 'dismissed', sameSentence: true });
    expect(dis.status).toBe(200);
    expect(await DictationReport.countDocuments({ status: 'open' })).toBe(0);
  });

  test('settings: reasons are edited, new ones get a key, keys of kept ones stay', async () => {
    const teacher = await createTeacher();
    const res = await request(app).put('/api/admin/dictation-reports/settings').set(bearer(teacher))
      .send({ thankOnFix: false, reasons: [{ key: 'wrong_text', label: 'Sai chữ' }, { label: 'Thiếu từ cuối câu' }, { label: '' }] });
    expect(res.status).toBe(200);
    expect(res.body.settings).toEqual(expect.objectContaining({ thankOnFix: false }));
    expect(res.body.settings.reasons).toEqual([{ key: 'wrong_text', label: 'Sai chữ' }, { key: 'thieu_tu_cuoi_cau', label: 'Thiếu từ cuối câu' }]);
    expect((await request(app).put('/api/admin/dictation-reports/settings').set(bearer(teacher)).send({ reasons: [] })).status).toBe(400);
  });
});
