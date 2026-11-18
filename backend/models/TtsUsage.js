'use strict';

const mongoose = require('mongoose');

// Characters sent to the paid speech service, per budget window:
//   "month:2026-11"            the whole site
//   "user:<id>:2026-11-18"     one student, one day
// Only audio that had to be newly generated counts; replays come from R2.
const ttsUsageSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true },
  chars:     { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

ttsUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TtsUsage', ttsUsageSchema);
