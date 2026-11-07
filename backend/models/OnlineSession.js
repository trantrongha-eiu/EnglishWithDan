const mongoose = require('mongoose');

// One study session on the site, reported by frontend/js/shared/online-tracker.js.
// A session = continuous use of the site (any pages, any tabs) that ends after
// 30 minutes with no activity or at midnight VN time. `activeSeconds` only
// counts time the page was in front AND the student was interacting (or
// audio/video was playing) — the admin "Thời gian online" view sums it per day.
const BreakSchema = new mongoose.Schema({
  // 'tab'  = left the site (switched tab / app / minimised) for ≥5 s
  // 'idle' = page in front but no interaction for >3 min
  type:    { type: String, enum: ['tab', 'idle'], required: true },
  at:      { type: Date, required: true },  // when the break started
  seconds: { type: Number, default: 0 },
}, { _id: false });

const OnlineSessionSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sid:           { type: String, required: true },   // client-generated session id
  day:           { type: String, required: true },   // 'YYYY-MM-DD', VN time, of startedAt
  startedAt:     { type: Date, required: true },
  endedAt:       { type: Date, required: true },     // last active moment seen so far
  activeSeconds: { type: Number, default: 0 },
  tabSwitches:   { type: Number, default: 0 },
  idlePauses:    { type: Number, default: 0 },
  device:        { type: String, enum: ['desktop', 'mobile', null], default: null },
  pages:         { type: [String], default: [] },    // distinct page paths visited
  breaks:        { type: [BreakSchema], default: [] }, // newest 200 kept
}, { timestamps: false, versionKey: false });

OnlineSessionSchema.index({ userId: 1, sid: 1 }, { unique: true });
OnlineSessionSchema.index({ day: 1, userId: 1 });
OnlineSessionSchema.index({ userId: 1, day: -1 });
// Retention: practice/activity history is kept 3 months (see data-retention policy).
OnlineSessionSchema.index({ startedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('OnlineSession', OnlineSessionSchema);
