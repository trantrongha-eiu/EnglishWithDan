'use strict';

// "Mời bạn viết cùng" — see services/task2CoWriteService.js.
const svc = require('../services/task2CoWriteService');

function guard(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[Task2CoWrite] error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

const NOT_FOUND = { success: false, message: 'Không tìm thấy nhóm viết' };

// GET /api/task2/cowrite/online/:topicId
exports.listOnline = guard(async (req, res) => {
  const students = await svc.listOnline(req.user, req.params.topicId);
  res.json({ success: true, students });
});

// POST /api/task2/cowrite/invite  { topicId, userIds: [] }
exports.invite = guard(async (req, res) => {
  const { topicId, userIds } = req.body || {};
  const r = await svc.invite(req.user, topicId, userIds);
  if (r.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy buổi học' });
  if (r.status === 'empty') return res.status(400).json({ success: false, message: 'Chọn ít nhất một bạn để mời' });
  if (r.status === 'none_allowed') return res.status(400).json({ success: false, message: 'Không thể mời các bạn này' });
  res.json({ success: true, invited: r.invited, skipped: r.skipped, room: r.room });
});

// GET /api/task2/cowrite/invites
exports.pendingInvites = guard(async (req, res) => {
  const [invites, active] = await Promise.all([
    svc.pendingInvites(req.user._id),
    svc.activeRoom(req.user._id).catch(() => null),
  ]);
  res.json({ success: true, invites, active });
});

// POST /api/task2/cowrite/room/:roomId/accept | /decline
exports.accept = guard(async (req, res) => {
  const r = await svc.respond(req.user, req.params.roomId, true);
  if (r.status !== 'ok') return res.status(404).json({ ...NOT_FOUND, message: 'Lời mời đã hết hạn' });
  res.json({ success: true, topicId: r.topicId, room: r.room });
});
exports.decline = guard(async (req, res) => {
  await svc.respond(req.user, req.params.roomId, false);
  res.json({ success: true });
});

// GET /api/task2/cowrite/topic/:topicId?rev=N — the writer's live poll
exports.getRoom = guard(async (req, res) => {
  const r = await svc.getRoom(req.user._id, req.params.topicId, req.query.rev);
  if (r.status === 'not_found') return res.status(404).json(NOT_FOUND);
  const body = { ...r };
  delete body.status;
  res.set('Cache-Control', 'private, no-store');
  res.json({ success: true, ...body });
});

// PUT /api/task2/cowrite/topic/:topicId/text  { sections }
exports.pushText = guard(async (req, res) => {
  const sections = (req.body || {}).sections;
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) {
    return res.status(400).json({ success: false, message: 'sections không hợp lệ' });
  }
  const r = await svc.pushText(req.user._id, req.params.topicId, sections);
  if (r.status === 'not_found') return res.status(404).json(NOT_FOUND);
  res.json({ success: true, inRoom: r.status === 'ok' });
});

// POST /api/task2/cowrite/topic/:topicId/leave
exports.leave = guard(async (req, res) => {
  const r = await svc.leave(req.user._id, req.params.topicId);
  if (r.status === 'not_found') return res.status(404).json(NOT_FOUND);
  res.json({ success: true });
});
