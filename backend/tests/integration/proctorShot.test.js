// POST /api/proctor/shot — the screenshot a proctored page takes of the
// student's shared screen right after a strike (services/proctorShotService.js).
jest.mock('../../services/cloudinaryService', () => ({
  uploadImage: jest.fn(async () => ({ secure_url: 'https://res.cloudinary.com/x/proctor-shots/a.jpg', public_id: 'proctor-shots/a' })),
}));

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const cloudinaryService = require('../../services/cloudinaryService');
const { createStudent, signTokenFor } = require('../factories/userFactory');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');

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
