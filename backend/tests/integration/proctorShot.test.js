// POST /api/proctor/shot — the screenshot a proctored page takes of the
// student's shared screen right after a strike (services/proctorShotService.js).
jest.mock('../../services/cloudinaryService', () => ({
  uploadImage: jest.fn(async () => ({ secure_url: 'https://res.cloudinary.com/x/proctor-shots/a.jpg', public_id: 'proctor-shots/a' })),
  destroyAssets: jest.fn(async (ids) => ids.length),
  listOldImages: jest.fn(async () => []),
}));

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const cloudinaryService = require('../../services/cloudinaryService');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const MockTestAttempt = require('../../models/MockTestAttempt');
const proctorShotService = require('../../services/proctorShotService');

const IMG = 'data:image/jpeg;base64,' + Buffer.from('fake-jpeg-bytes').toString('base64');

function post(user, body) {
  return request(app).post('/api/proctor/shot').set('Authorization', `Bearer ${signTokenFor(user)}`).send(body);
}

async function simAttempt(userId, events) {
  return ListeningPracticeAttempt.create({
    userId, sectionId: new mongoose.Types.ObjectId(), sectionTitle: 'S', partNumber: 1,
    status: 'in-progress', mode: 'simulation',
    proctor: { violationCount: events.length, violated: events.length > 0, events },
  });
}

describe('POST /api/proctor/shot', () => {
  beforeEach(() => cloudinaryService.uploadImage.mockClear());

  test('stores a shot on the attempt right after a strike', async () => {
    const student = await createStudent();
    const a = await simAttempt(student._id, [{ type: 'hidden', at: new Date() }]);

    const res = await post(student, { context: 'simulation', skill: 'listening', attemptType: 'practice', attemptId: a._id, type: 'hidden', image: IMG });
    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/proctor-shots/);
    expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(IMG, { folder: 'proctor-shots' });

    const fresh = await ListeningPracticeAttempt.findById(a._id).lean();
    expect(fresh.proctor.shots).toHaveLength(1);
    expect(fresh.proctor.shots[0]).toMatchObject({ type: 'hidden', skill: 'listening' });
    expect(fresh.proctor.violationCount).toBe(1); // the $push didn't clobber the strike data
  });

  test('refused without a recent strike, and at most one shot per strike', async () => {
    const student = await createStudent();
    const stale = await simAttempt(student._id, [{ type: 'blur', at: new Date(Date.now() - 10 * 60 * 1000) }]);
    const body = { context: 'simulation', skill: 'listening', attemptType: 'practice', type: 'blur', image: IMG };
    expect((await post(student, { ...body, attemptId: stale._id })).status).toBe(409);

    const fresh = await simAttempt(student._id, [{ type: 'blur', at: new Date() }]);
    expect((await post(student, { ...body, attemptId: fresh._id })).status).toBe(200);
    expect((await post(student, { ...body, attemptId: fresh._id })).status).toBe(200); // +1 slack
    expect((await post(student, { ...body, attemptId: fresh._id })).status).toBe(409);
    expect(cloudinaryService.uploadImage).toHaveBeenCalledTimes(2);
  });

  test("rejects someone else's attempt, bad images and bad contexts", async () => {
    const owner = await createStudent();
    const other = await createStudent();
    const a = await simAttempt(owner._id, [{ type: 'hidden', at: new Date() }]);
    const body = { context: 'simulation', skill: 'listening', attemptType: 'practice', attemptId: a._id, type: 'hidden', image: IMG };

    expect((await post(other, body)).status).toBe(404);
    expect((await post(owner, { ...body, image: 'data:text/html;base64,PGgxPg==' })).status).toBe(400);
    expect((await post(owner, { ...body, context: 'nope' })).status).toBe(400);
    expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
  });
});

describe('POST /api/proctor/shot — Full Mock Test (4 kỹ năng)', () => {
  test('stores the shot on the mock run, tagged with the skill page it came from', async () => {
    cloudinaryService.uploadImage.mockClear();
    const student = await createStudent();
    const mockId = new mongoose.Types.ObjectId();
    await MockTestAttempt.collection.insertOne({
      _id: mockId, userId: student._id, status: 'in-progress',
      proctor: { violationCount: 1, violated: true, events: [{ type: 'blur', skill: 'reading', at: new Date() }], shots: [] },
    });
    const res = await post(student, { context: 'mock', skill: 'reading', attemptId: mockId, type: 'blur', image: IMG });
    expect(res.status).toBe(200);
    const doc = await MockTestAttempt.collection.findOne({ _id: mockId });
    expect(doc.proctor.shots).toHaveLength(1);
    expect(doc.proctor.shots[0]).toMatchObject({ type: 'blur', skill: 'reading' });
  });
});

describe('proctorShotService.purgeOldShots — 30-day retention', () => {
  beforeEach(() => { cloudinaryService.destroyAssets.mockClear(); cloudinaryService.listOldImages.mockClear(); });

  test('deletes shots older than 30 days (Cloudinary + attempt) across Simulation and Mock Test, keeps newer ones', async () => {
    const DAY = 24 * 60 * 60 * 1000;
    const old = new Date(Date.now() - 31 * DAY);
    const fresh = new Date(Date.now() - 2 * DAY);
    const shot = (id, at) => ({ url: 'https://x/' + id + '.jpg', publicId: 'proctor-shots/' + id, type: 'hidden', at });

    const student = await createStudent();
    const sim = await simAttempt(student._id, [{ type: 'hidden', at: old }]);
    await ListeningPracticeAttempt.updateOne({ _id: sim._id }, { $set: { 'proctor.shots': [shot('s-old', old), shot('s-new', fresh)] } });
    const mockId = new mongoose.Types.ObjectId();
    await MockTestAttempt.collection.insertOne({
      _id: mockId, userId: student._id, status: 'completed',
      proctor: { violationCount: 1, violated: true, events: [], shots: [shot('m-old', old)] },
    });

    const r = await proctorShotService.purgeOldShots();

    expect(r).toMatchObject({ shots: 2, attempts: 2 });
    const destroyed = cloudinaryService.destroyAssets.mock.calls.flatMap(c => c[0]);
    expect(destroyed.sort()).toEqual(['proctor-shots/m-old', 'proctor-shots/s-old']);
    expect((await ListeningPracticeAttempt.findById(sim._id).lean()).proctor.shots.map(x => x.publicId)).toEqual(['proctor-shots/s-new']);
    expect((await MockTestAttempt.collection.findOne({ _id: mockId })).proctor.shots).toEqual([]);
    // Orphan sweep of the Cloudinary folder by upload age.
    expect(cloudinaryService.listOldImages).toHaveBeenCalledWith('proctor-shots', 31);
  });

  test('also deletes orphaned images the folder sweep finds', async () => {
    cloudinaryService.listOldImages.mockResolvedValueOnce(['proctor-shots/orphan1', 'proctor-shots/orphan2']);
    const r = await proctorShotService.purgeOldShots();
    expect(r.orphans).toBe(2);
    expect(cloudinaryService.destroyAssets).toHaveBeenCalledWith(['proctor-shots/orphan1', 'proctor-shots/orphan2']);
  });
});
