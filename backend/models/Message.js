const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  fromId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromName:    { type: String, required: true },
  toId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  subject:     { type: String, default: '' },
  body:        { type: String, required: true },
  isBroadcast: { type: Boolean, default: false },
  isRead:      { type: Boolean, default: false }, // cho tin nhắn cá nhân
  readBy:      [{ type: mongoose.Schema.Types.ObjectId }], // theo dõi ai đã đọc broadcast
  deletedBy:   [{ type: mongoose.Schema.Types.ObjectId }], // soft-delete theo từng user
  parentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }, // tin nhắn gốc nếu đây là phản hồi
  // Admin compensation gift attached to this message (búa Daniel / lửa streak).
  // claimedBy mirrors readBy — an array (not a bool) so the same field works
  // for both a personal message (at most 1 entry) and a broadcast gift sent
  // to everyone (each recipient claims independently).
  giftHammers:    { type: Number, default: 0 },
  giftStreakDays: { type: Number, default: 0 },
  claimedBy:      [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

// Serves GET /api/user/messages/unread-count and GET /api/user/messages (polled
// on effectively every page load for the nav badge) — previously an unindexed
// full collection scan.
MessageSchema.index({ toId: 1, isBroadcast: 1, isRead: 1 });
MessageSchema.index({ isBroadcast: 1, createdAt: -1 });
// Admin "sent messages" view filters by fromId — previously unindexed.
MessageSchema.index({ fromId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
