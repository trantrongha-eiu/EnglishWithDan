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
}, { timestamps: true });

// Serves GET /api/user/messages/unread-count and GET /api/user/messages (polled
// on effectively every page load for the nav badge) — previously an unindexed
// full collection scan.
MessageSchema.index({ toId: 1, isBroadcast: 1, isRead: 1 });
MessageSchema.index({ isBroadcast: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
