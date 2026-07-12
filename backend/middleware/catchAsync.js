'use strict';

/**
 * Wraps an async Express route handler so a thrown/rejected error is
 * caught, logged server-side, and turned into the same generic 500 JSON
 * response nearly every handler in this codebase already builds by hand
 * (`{ success: false, message: err.message }`) — removes the repeated
 * try/catch boilerplate without changing what the client receives.
 *
 * Deliberately does NOT delegate to Express's next(err)/the global error
 * handler in server.js — that handler returns a generic "Lỗi server"
 * message instead of err.message, which would be a client-visible
 * behavior change for every route converted to use this. Logging the
 * error server-side here also closes a real gap: most existing catch
 * blocks silently return the message to the client without ever logging
 * it, so a failure only shows up in server logs for the handful of
 * handlers that happened to add their own console.error.
 *
 * err.statusCode is honored when present (errors/AppError.js subclasses
 * set it) so newly-migrated service code can throw a NotFoundError etc.
 * and get the right HTTP status — for every error today (plain Error,
 * Mongoose errors) err.statusCode is undefined, so this falls back to
 * 500 exactly as before; no existing route's response changes.
 */
function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(err => {
      console.error(`[${req.method} ${req.originalUrl}]`, err);
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    });
  };
}

module.exports = catchAsync;
