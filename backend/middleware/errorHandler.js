'use strict';

// Single global error middleware, registered last in server.js. Backward
// compatible with every error currently in flight: a plain Error (no
// .statusCode/.isOperational) still produces exactly the same response
// this handler always gave — 500 + generic "Lỗi server". AppError adoption
// (errors/AppError.js) is still opt-in rather than the norm — today it's
// only thrown by listeningService.js's getAdminTest/deleteAdminTestPermanent
// — so most errors still take the plain-Error path. Only errors deliberately
// thrown as an AppError subclass get a distinct status code and their own
// message shown to the client.
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Some upstream middleware (e.g. app.js's CORS origin check) already
  // logs its own rejection with better context before forwarding the
  // error here — skip re-logging the same event a second time.
  if (!err.alreadyLogged) {
    logger.error('unhandled', err.message || 'Unhandled error', {
      stack: err.stack,
      method: req?.method,
      path: req?.originalUrl || req?.url,
    });
  }
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Lỗi server';
  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;
