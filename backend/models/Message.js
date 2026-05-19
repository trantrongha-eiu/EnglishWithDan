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

module.exports = mongoose.model('Message', MessageSchema);
