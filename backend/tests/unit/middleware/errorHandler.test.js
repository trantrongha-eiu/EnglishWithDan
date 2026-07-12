// Unit tests for middleware/errorHandler.js — the global Express error
// handler. Critical security property: a plain, non-operational Error must
// never leak its real message or a stack trace to the client.
const errorHandler = require('../../../middleware/errorHandler');

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('errorHandler middleware', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('a plain Error (no statusCode/isOperational) responds 500 with the generic message, not the real one', () => {
    const err = new Error('boom - some sensitive internal detail');
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Lỗi server' });
    const body = res.json.mock.calls[0][0];
    expect(body.message).not.toBe('boom - some sensitive internal detail');
    expect(body.message).not.toMatch(/boom/);
  });

  test('an operational error with statusCode/message responds with that exact status and message', () => {
    const err = Object.assign(new Error('Not found'), { isOperational: true, statusCode: 404 });
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
  });

  test('response body never contains a stack property, for either a plain or operational error', () => {
    const plainRes = makeRes();
    errorHandler(new Error('boom'), {}, plainRes, jest.fn());
    expect(plainRes.json.mock.calls[0][0]).not.toHaveProperty('stack');

    const opRes = makeRes();
    const opErr = Object.assign(new Error('Operational failure'), { isOperational: true, statusCode: 400 });
    errorHandler(opErr, {}, opRes, jest.fn());
    expect(opRes.json.mock.calls[0][0]).not.toHaveProperty('stack');
  });

  test('a non-operational error with a statusCode set still hides the message but honors the status code', () => {
    // isOperational is falsy, so message must stay generic even though statusCode is set.
    const err = Object.assign(new Error('leaky detail'), { statusCode: 403 });
    const res = makeRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Lỗi server' });
  });

  test('logs the error server-side via console.error', () => {
    errorHandler(new Error('boom'), {}, makeRes(), jest.fn());
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
