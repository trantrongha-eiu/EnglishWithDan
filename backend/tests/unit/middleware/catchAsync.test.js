// Unit tests for middleware/catchAsync.js — wraps an async Express route
// handler so a thrown/rejected error becomes a JSON response instead of an
// unhandled rejection. Mirrors errorHandler.js's message rule (2026-08-26
// error-message audit): an AppError (err.isOperational) shows its own
// message; anything else falls back to a generic "Lỗi server" rather than
// leaking a raw Mongoose/system error's .message to the client.
const catchAsync = require('../../../middleware/catchAsync');

function makeReq() {
  return { method: 'GET', originalUrl: '/test/route' };
}

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('catchAsync middleware', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('a handler that resolves normally: catchAsync does not send any response itself', async () => {
    const handler = jest.fn(async (req, res) => {
      res.status(200).json({ success: true });
    });
    const wrapped = catchAsync(handler);
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    wrapped(req, res, next);
    // Let the internal promise resolve.
    await new Promise((resolve) => setImmediate(resolve));

    expect(handler).toHaveBeenCalledWith(req, res, next);
    // The handler's own response is the only one sent - status(200) exactly once.
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('a handler that rejects with a plain (non-operational) Error -> 500 with a generic message, not err.message', async () => {
    const handler = jest.fn(async () => {
      throw new Error('E11000 duplicate key error collection: test.users index: email_1');
    });
    const wrapped = catchAsync(handler);
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    wrapped(req, res, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Lỗi server' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('a handler that rejects with an AppError (isOperational) -> shows its own message + statusCode', async () => {
    const { NotFoundError } = require('../../../errors/AppError');
    const handler = jest.fn(async () => {
      throw new NotFoundError('Không tìm thấy bài luyện tập này');
    });
    const wrapped = catchAsync(handler);
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    wrapped(req, res, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Không tìm thấy bài luyện tập này' });
  });

  test('a handler that rejects with a non-operational error carrying statusCode -> keeps that status, still hides the message', async () => {
    const handler = jest.fn(async () => {
      throw Object.assign(new Error('CastError: Cast to ObjectId failed for value "abc"'), { statusCode: 404 });
    });
    const wrapped = catchAsync(handler);
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    wrapped(req, res, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Lỗi server' });
  });

  test('does not call next() on either success or failure', async () => {
    const okHandler = catchAsync(async (req, res) => res.status(200).json({}));
    const req1 = makeReq();
    const res1 = makeRes();
    const next1 = jest.fn();
    okHandler(req1, res1, next1);
    await new Promise((resolve) => setImmediate(resolve));
    expect(next1).not.toHaveBeenCalled();

    const failHandler = catchAsync(async () => { throw new Error('fail'); });
    const req2 = makeReq();
    const res2 = makeRes();
    const next2 = jest.fn();
    failHandler(req2, res2, next2);
    await new Promise((resolve) => setImmediate(resolve));
    expect(next2).not.toHaveBeenCalled();
  });
});
