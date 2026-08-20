// Coverage for the two behavior changes to the auto-grade cron: interval
// dropped from 3h to 20min (start() only, not exercised here — it's just a
// cron.schedule() call), and an overload/quota error now schedules a 5-minute
// retry instead of silently waiting for the next tick. Also guards against
// overlapping runs, which matters more now that ticks are far more frequent.
//
// Uses a real test-DB round trip (like the rest of this suite), so a poll
// loop is used instead of asserting immediately after awaiting a promise —
// the mocked gradeTaskWithAI call happens after a real (if fast) Mongo query
// resolves, not on the next microtask.
const { runAutoGrade, stop } = require('../../../cron/writingAutoGrade');
const { createStudent } = require('../../factories/userFactory');
const { createWritingAttempt } = require('../../factories/contentFactory');
const writingGradingService = require('../../../services/writingGradingService');

jest.mock('../../../services/writingGradingService');

async function waitFor(conditionFn, timeoutMs = 2000) {
  const start = Date.now();
  while (!conditionFn()) {
    if (Date.now() - start > timeoutMs) throw new Error('waitFor: condition never became true');
    await new Promise(r => setTimeout(r, 5));
  }
}

afterEach(() => {
  stop(); // clears any pending retry timer between tests
  jest.restoreAllMocks();
  jest.clearAllMocks(); // restoreAllMocks doesn't reset an automock's call history
});

describe('writingAutoGrade.runAutoGrade — overlap guard', () => {
  test('a second concurrent call is skipped while a run is in flight', async () => {
    const student = await createStudent();
    await createWritingAttempt({ userId: student._id, extra: { gradingStatus: 'pending', task1Answer: 'Some answer here', wordCount1: 50, task1Snapshot: { prompt: 'p' } } });

    let resolveGrade;
    writingGradingService.gradeTaskWithAI.mockImplementation(() => new Promise(r => { resolveGrade = r; }));

    const first = runAutoGrade();
    const second = runAutoGrade(); // should return immediately, isRunning guard
    await second;

    await waitFor(() => writingGradingService.gradeTaskWithAI.mock.calls.length > 0);
    expect(writingGradingService.gradeTaskWithAI).toHaveBeenCalledTimes(1);

    resolveGrade({ bandScore: 6, feedback: 'ok' });
    await first;
  });
});

describe('writingAutoGrade.runAutoGrade — overload retry', () => {
  test('schedules a retry 5 minutes after an overload error, not the full 20-minute interval', async () => {
    const student = await createStudent();
    await createWritingAttempt({ userId: student._id, extra: { gradingStatus: 'pending', task1Answer: 'Some answer here', wordCount1: 50, task1Snapshot: { prompt: 'p' } } });

    const overloadErr = new Error('quota exceeded');
    overloadErr.isOverloaded = true;
    writingGradingService.gradeTaskWithAI.mockRejectedValue(overloadErr);

    // Intercept only the 5-minute retry timer (recording it without actually
    // scheduling it) so the test can fire it deterministically instead of
    // leaving a real 5-minute Node timer running past the test — every other
    // delay (the real DB query, this suite's own waitFor polling) still goes
    // through the real setTimeout.
    const original = global.setTimeout;
    let capturedRetryFn = null;
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay, ...rest) => {
      if (delay === 5 * 60 * 1000) { capturedRetryFn = fn; return 0; }
      return original(fn, delay, ...rest);
    });

    await runAutoGrade();
    expect(writingGradingService.gradeTaskWithAI).toHaveBeenCalledTimes(1);
    expect(capturedRetryFn).toBeInstanceOf(Function);

    // Firing the captured callback should re-invoke runAutoGrade — verified
    // by the mock being called again (still overloaded, so it stops after
    // one attempt, same as the first run).
    writingGradingService.gradeTaskWithAI.mockClear();
    capturedRetryFn();
    await waitFor(() => writingGradingService.gradeTaskWithAI.mock.calls.length > 0);
    expect(writingGradingService.gradeTaskWithAI).toHaveBeenCalledTimes(1);

    setTimeoutSpy.mockRestore();
  });
});
