'use strict';

/**
 * Wraps an async Express route handler so a thrown/rejected error is
 * caught, logged server-side, and turned into a JSON error response —
 * removes the repeated try/catch boilerplate every handler in this
 * codebase used to build by hand.
 *
 * Message shown to the client mirrors errorHandler.js's own rule: an
 * AppError/NotFoundError/etc. (errors/AppError.js, err.isOperational
 * true) was deliberately thrown with a safe, user-facing message, so
 * that message is shown as-is. Anything else — a raw Mongoose
 * CastError/ValidationError, a network failure, a genuine bug — falls
 * back to the generic "Lỗi server" instead of leaking that error's
 * `.message` to the client (site-wide error-message audit, 2026-08-26;
 * this used to always show err.message here, matching what most
 * hand-rolled catch blocks elsewhere in the codebase still do).
 *
 * Logging the error server-side here also closes a real gap: most
 * existing catch blocks silently return the message to the client
 * without ever logging it, so a failure only shows up in server logs
 * for the handful of handlers that happened to add their own
 * console.error.
 *
 * err.statusCode is honored when present (errors/AppError.js subclasses
 * set it), falling back to 500 for anything else (plain Error, Mongoose
 * errors don't set it).
 */
function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(err => {
      console.error(`[${req.method} ${req.originalUrl}]`, err);
      const message = err.isOperational ? err.message : 'Lỗi server';
      res.status(err.statusCode || 500).json({ success: false, message });
    });
  };
}

module.exports = catchAsync;
