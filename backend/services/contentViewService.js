'use strict';

// Records "the student opened this" for homework items that only ask the
// student to view something (resourceCompletionService.VIEW_TYPES).
const mongoose = require('mongoose');
const ContentView = require('../models/ContentView');
const rcs = require('./resourceCompletionService');

// One row per resource per half hour is plenty — the homework check only
// needs "any view since the assignment was given".
const DEDUPE_MS = 30 * 60 * 1000;

async function recordView(userId, resourceType, resourceId) {
  if (!rcs.VIEW_TYPES.includes(resourceType) || !mongoose.isValidObjectId(resourceId)) return false;
  const recent = await ContentView.exists({
    userId, resourceType, resourceId, createdAt: { $gte: new Date(Date.now() - DEDUPE_MS) },
  });
  if (recent) return true;
  await ContentView.create({ userId, resourceType, resourceId });
  return true;
}

// Client beacon path: the id must be a real, live resource of that type.
async function recordViewChecked(userId, resourceType, resourceId) {
  if (!rcs.VIEW_TYPES.includes(resourceType)) return { error: 400, message: 'Loại nội dung không hợp lệ' };
  if (!(await rcs.resourceExists(resourceType, resourceId))) return { error: 404, message: 'Không tìm thấy nội dung' };
  await recordView(userId, resourceType, resourceId);
  return { ok: true };
}

module.exports = { recordView, recordViewChecked };
