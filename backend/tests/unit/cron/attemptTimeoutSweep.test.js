// Regression coverage for the audit finding "an abandoned Reading/Listening
// attempt stays status:'in-progress' forever" — sweepStaleAttempts() should
// flip only attempts that are BOTH in-progress AND older than the stale
// window, leaving recent in-progress and already-completed attempts alone.
const { sweepStaleAttempts } = require('../../../cron/attemptTimeoutSweep');
const TestAttempt = require('../../../models/TestAttempt');
const ListeningAttempt = require('../../../models/ListeningAttempt');
const { createStudent } = require('../../factories/userFactory');
const { createReadingTest, createListeningTest } = require('../../factories/contentFactory');

const THREE_HOURS_AGO = new Date(Date.now() - 3 * 60 * 60 * 1000);

describe('attemptTimeoutSweep.sweepStaleAttempts', () => {
  test('marks a stale in-progress Reading attempt as timeout, leaves recent/completed ones alone', async () => {
    const student = await createStudent();
    const test = await createReadingTest();

    const stale = await TestAttempt.create({
      userId: student._id, testId: test._id, passagesUsed: [], status: 'in-progress', startTime: THREE_HOURS_AGO,
    });
    const recent = await TestAttempt.create({
      userId: student._id, testId: test._id, passagesUsed: [], status: 'in-progress', startTime: new Date(),
    });
    const completed = await TestAttempt.create({
      userId: student._id, testId: test._id, passagesUsed: [], status: 'completed', startTime: THREE_HOURS_AGO, endTime: new Date(),
    });

    await sweepStaleAttempts();

    expect((await TestAttempt.findById(stale._id)).status).toBe('timeout');
    expect((await TestAttempt.findById(recent._id)).status).toBe('in-progress');
    expect((await TestAttempt.findById(completed._id)).status).toBe('completed');
  });

  test('marks a stale in-progress Listening attempt as timeout, leaves recent/completed ones alone', async () => {
    const student = await createStudent();
    const test = await createListeningTest();

    const stale = await ListeningAttempt.create({
      userId: student._id, testId: test._id, status: 'in-progress', startTime: THREE_HOURS_AGO,
    });
    const recent = await ListeningAttempt.create({
      userId: student._id, testId: test._id, status: 'in-progress', startTime: new Date(),
    });
    const completed = await ListeningAttempt.create({
      userId: student._id, testId: test._id, status: 'completed', startTime: THREE_HOURS_AGO,
    });

    await sweepStaleAttempts();

    expect((await ListeningAttempt.findById(stale._id)).status).toBe('timeout');
    expect((await ListeningAttempt.findById(recent._id)).status).toBe('in-progress');
    expect((await ListeningAttempt.findById(completed._id)).status).toBe('completed');
  });
});
