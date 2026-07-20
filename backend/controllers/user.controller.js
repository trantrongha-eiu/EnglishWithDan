const { isImageDataUri } = require('../utils/validation');
const catchAsync = require('../middleware/catchAsync');
const userService = require('../services/userService');
const userMessageService = require('../services/userMessageService');

// ── GET /api/user/profile ────────────────────────────────────
exports.getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user._id, req.user.plan);
  if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, user });
});

// ── PUT /api/user/profile ────────────────────────────────────
exports.updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, bio, studyMotto, targetBand } = req.body;
  const user = await userService.updateProfile(req.user._id, { firstName, lastName, bio, studyMotto, targetBand });
  res.json({ success: true, user });
});

// ── PUT /api/user/change-password ────────────────────────────
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  const result = await userService.changePassword(req.user._id, currentPassword, newPassword);
  if (result.status === 'invalid') {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
  }
  if (result.status === 'set') {
    return res.json({ success: true, message: 'Đã đặt mật khẩu thành công' });
  }
  res.json({ success: true, message: 'Đã đổi mật khẩu thành công' });
});

// ── POST /api/user/avatar ────────────────────────────────────
exports.uploadAvatar = catchAsync(async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu ảnh' });
  if (!isImageDataUri(imageBase64)) return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });

  const { avatar, user } = await userService.uploadAvatar(req.user._id, imageBase64);
  res.json({ success: true, avatar, user });
});

// ── GET /api/user/stats ──────────────────────────────────────
exports.getStats = catchAsync(async (req, res) => {
  const stats = await userService.getStats(req.user._id);
  res.json({ success: true, stats });
});

// ── GET /api/user/activity-heatmap ───────────────────────────
exports.getActivityHeatmap = catchAsync(async (req, res) => {
  const days = Math.min(400, Math.max(1, parseInt(req.query.days, 10) || 365));
  const activity = await userService.getActivityHeatmap(req.user._id, days);
  res.json({ success: true, activity });
});

// ── GET /api/user/streak-leaderboard ─────────────────────────
exports.getStreakLeaderboard = catchAsync(async (req, res) => {
  const leaderboard = await userService.getStreakLeaderboard(10);
  res.json({ success: true, leaderboard });
});

// ── POST /api/user/streak/use-hammer ─────────────────────────
exports.useHammer = catchAsync(async (req, res) => {
  const result = await userService.useHammer(req.user._id);
  if (result.status === 'not_eligible') {
    return res.status(400).json({ success: false, message: 'Bạn chưa đủ điều kiện dùng búa Daniel.' });
  }
  res.json({ success: true, streak: result.streak, streakHammers: result.streakHammers });
});

// ── INBOX ─────────────────────────────────────────────────────
// Deliberately NOT using catchAsync here: catchAsync responds with the raw
// err.message, but these four routes always responded with the generic
// 'Lỗi server' — switching would change the client-visible error message.
function messageGuard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[User] error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

// ── GET /api/user/messages/unread-count ──────────────────────
exports.getUnreadMessageCount = messageGuard(async (req, res) => {
  const count = await userMessageService.getUnreadCount(req.user._id);
  res.json({ success: true, count });
});

// ── GET /api/user/messages ────────────────────────────────────
exports.listMessages = messageGuard(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const { messages, total } = await userMessageService.listMessages(req.user._id, +page, +limit);
  res.json({ success: true, messages, total });
});

// ── PATCH /api/user/messages/:id/read ────────────────────────
exports.markMessageRead = messageGuard(async (req, res) => {
  const result = await userMessageService.markRead(req.params.id, req.user._id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
  if (result.status === 'forbidden') return res.status(403).json({ success: false, message: 'Không có quyền' });
  res.json({ success: true });
});

// ── DELETE /api/user/messages/:id — soft delete cho user này ─
exports.deleteMessage = messageGuard(async (req, res) => {
  const result = await userMessageService.deleteMessage(req.params.id, req.user._id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
  if (result.status === 'forbidden') return res.status(403).json({ success: false, message: 'Không có quyền xóa tin nhắn này' });
  res.json({ success: true });
});

// ── POST /api/user/messages/:id/reply — học sinh phản hồi giáo viên ─
exports.replyMessage = messageGuard(async (req, res) => {
  const { body } = req.body;
  const result = await userMessageService.replyToMessage(req.user._id, req.user.username, req.params.id, body);
  if (result.status === 'empty') return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
  if (result.status === 'forbidden') return res.status(403).json({ success: false, message: 'Không có quyền phản hồi tin nhắn này' });
  res.status(201).json({ success: true, message: result.message });
});
