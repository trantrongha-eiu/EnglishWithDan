'use strict';

/**
 * backend/middleware/validateObjectIdParam.js
 * Rejects a malformed :param (e.g. "not-a-valid-id") with a clean 400
 * before it ever reaches a Mongo query. Without this, an invalid ObjectId
 * string throws a raw Mongoose CastError deep inside the service layer,
 * which every generic controller catch-block here turns into a misleading
 * 500 "Lỗi server" instead of a real client-input error (audit finding
 * BUG-020). A well-formed but nonexistent ID is NOT affected by this
 * middleware — it still reaches the real query and gets whatever 404 the
 * controller already returns for "not found", preserving the
 * malformed-input(400) vs nonexistent(404) distinction.
 *
 * Same check (`mongoose.isValidObjectId`) already used ad hoc inside
 * services/peerService.js — this is the same one-liner, just usable as
 * route middleware so it can guard a whole family of :id routes in one
 * place instead of being duplicated inside every controller/service
 * function that takes one.
 */
const mongoose = require('mongoose');

function validateObjectIdParam(param) {
  return (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) {
      return res.status(400).json({ success: false, message: `${param} không hợp lệ` });
    }
    next();
  };
}

module.exports = validateObjectIdParam;
