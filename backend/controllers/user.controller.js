const { isImageDataUri, getBase64PayloadByteSize } = require('../utils/validation');

// BUG-025: the frontend's own client-side cap (profile.html's
// MAX_AVATAR_BYTES) is 20MB, but that's on the ORIGINAL file the user
// picked, before it gets compressed down to ~600px/quality 0.85 — the
// actual imageBase64 payload a real upload sends is documented there as
// "keeps under 200KB easily". A direct API call bypasses that compression
// entirely, so this needs its own real, enforceable limit on the payload
// actually received. 5MB decoded gives ~25x headroom over a legitimate
// compressed upload while staying well under app.js's global
// express.json({limit:'20mb'}) — that 20mb figure is measured on the
// base64-encoded (≈1.37x larger) request body, so a decoded-byte cap
// anywhere near 20MB would be unreachable: Express's body-parser would
// already have rejected the request with a 413 before this check ever ran.
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const catchAsync = require('../middleware/catchAsync');
const userService = require('../services/userService');
const userMessageService = require('../services/userMessageService');
const peerService = require('../services/peerService');

function displayName(user) {
  return (`${user.firstName || ''} ${user.lastName || ''}`.trim()) || user.username;
}

// ── GET /api/user/profile ────────────────────────────────────
exports.getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user._id, req.user.plan);
  if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, user });
});

// ── PUT /api/user/profile ────────────────────────────────────
exports.updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, bio, studyMotto, targetBand, targetExamDate } = req.body;
  const result = await userService.updateProfile(req.user._id, { firstName, lastName, bio, studyMotto, targetBand, targetExamDate });
  if (result.status === 'invalid') {
    return res.status(400).json({ success: false, message: result.errors[0], errors: result.errors });
  }
  res.json({ success: true, user: result.user });
});

// ── PUT /api/user/change-password ────────────────────────────
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
  }

  const result = await userService.changePassword(req.user._id, currentPassword, newPassword);
  if (result.status === 'invalid') {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
  }
  if (result.status === 'set') {
    // BUG-023: a fresh token, since changePassword() just revoked every
    // token issued before now (including the one used to make this very
    // request) — without this the caller's own session would 401 on its
    // next request.
    return res.json({ success: true, message: 'Đã đặt mật khẩu thành công', token: result.token });
  }
  res.json({ success: true, message: 'Đã đổi mật khẩu thành công', token: result.token });
});

// ── POST /api/user/avatar ────────────────────────────────────
exports.uploadAvatar = catchAsync(async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu ảnh' });
  if (!isImageDataUri(imageBase64)) return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });
  if (getBase64PayloadByteSize(imageBase64) > MAX_AVATAR_BYTES) {
    return res.status(400).json({ success: false, message: 'Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB' });
  }

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

// ── GET /api/user/notifications — bell dropdown feed (nav.js) ──
exports.getRecentNotifications = messageGuard(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
  const notifications = await userMessageService.getRecentNotifications(req.user._id, limit);
  res.json({ success: true, notifications });
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

// ── POST /api/user/messages/:id/claim — nhận quà (búa/lửa) đính kèm ─
exports.claimGift = messageGuard(async (req, res) => {
  const result = await userMessageService.claimGift(req.params.id, req.user._id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
  if (result.status === 'forbidden') return res.status(403).json({ success: false, message: 'Không có quyền nhận quà từ tin nhắn này' });
  if (result.status === 'no_gift') return res.status(400).json({ success: false, message: 'Tin nhắn này không có quà đính kèm' });
  if (result.status === 'already_claimed') return res.status(409).json({ success: false, message: 'Bạn đã nhận quà này rồi' });
  res.json({
    success: true,
    giftHammers: result.giftHammers,
    giftStreakDays: result.giftStreakDays,
    streakHammers: result.streakHammers,
    streak: result.streak,
  });
});

// ── PEER (student-to-student profile view + chat + block/report) ────
// See services/peerService.js for the privacy reasoning behind the narrow
// profile field set and the isPeer-flagged Message rows.

// ── GET /api/user/peer/:id/profile ───────────────────────────
exports.getPeerProfile = messageGuard(async (req, res) => {
  const result = await peerService.getPeerProfile(req.user._id, req.params.id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
  res.json({ success: true, profile: result.profile });
});

// ── GET /api/user/peer/conversations ─────────────────────────
exports.listPeerConversations = messageGuard(async (req, res) => {
  const conversations = await peerService.listConversations(req.user._id);
  res.json({ success: true, conversations });
});

// ── GET /api/user/peer/students ───────────────────────────────
// Full active-student roster, for starting a new conversation with someone
// not already in the conversation list — see peerService.listActiveStudents.
exports.listActiveStudents = messageGuard(async (req, res) => {
  const students = await peerService.listActiveStudents(req.user._id);
  res.json({ success: true, students });
});

// ── GET /api/user/peer/:id/thread ────────────────────────────
exports.getPeerThread = messageGuard(async (req, res) => {
  const result = await peerService.getThread(req.user._id, req.params.id);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
  res.json({ success: true, messages: result.messages, peerLastSeen: result.peerLastSeen });
});

// ── POST /api/user/peer/:id/message ──────────────────────────
exports.sendPeerMessage = messageGuard(async (req, res) => {
  const { body } = req.body;
  const result = await peerService.sendPeerMessage(req.user._id, displayName(req.user), req.params.id, body);
  if (result.status === 'empty') return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
  if (result.status === 'self') return res.status(400).json({ success: false, message: 'Không thể tự nhắn tin cho chính mình' });
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
  if (result.status === 'blocked') return res.status(403).json({ success: false, message: 'Không thể gửi tin nhắn cho người này' });
  res.status(201).json({ success: true, message: result.message });
});

// ── POST /api/user/peer/:id/block ────────────────────────────
exports.blockPeer = messageGuard(async (req, res) => {
  const result = await peerService.blockUser(req.user._id, req.params.id);
  if (result.status === 'self') return res.status(400).json({ success: false, message: 'Không thể tự chặn chính mình' });
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
  res.json({ success: true });
});

// ── DELETE /api/user/peer/:id/block ──────────────────────────
exports.unblockPeer = messageGuard(async (req, res) => {
  await peerService.unblockUser(req.user._id, req.params.id);
  res.json({ success: true });
});

// ── POST /api/user/peer/:id/report ───────────────────────────
exports.reportPeer = messageGuard(async (req, res) => {
  const { reason, messageId } = req.body;
  const result = await peerService.reportUser(req.user._id, displayName(req.user), req.params.id, reason, messageId);
  if (result.status === 'empty') return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do báo cáo' });
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
  res.status(201).json({ success: true });
});
