'use strict';
// Báo lỗi Dictation — admin side of the "🚩 Báo lỗi câu này" button on
// Luyện Dictation (/app/dictation). Lists student reports, opens the
// reported sentence (with its neighbours) to fix its text / timing / drill
// answer or take it out of the lesson, closes reports, and edits the
// feature's config (on/off, reasons, thank-you message).
// Logic: services/dictationReportService.js.

const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const svc = require('../../services/dictationReportService');

const router = express.Router();

function send(res, r, extra = {}) {
  if (r.status === 'ok') return res.json({ success: true, ...r, ...extra });
  const code = r.status === 'not_found' ? 404 : 400;
  const message = r.message || (r.status === 'not_found' ? 'Không tìm thấy' : r.status === 'no_reasons' ? 'Cần ít nhất 1 lý do' : 'Dữ liệu không hợp lệ');
  return res.status(code).json({ success: false, message });
}

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/admin/dictation-reports?status=open|fixed|dismissed|all&kind=&reason=&search=&page=&limit=
router.get('/dictation-reports', auth, teacherOnly, wrap(async (req, res) => {
  const [data, settings] = await Promise.all([svc.listReports(req.query), svc.getSettings()]);
  res.json({ success: true, ...data, settings });
}));

// GET / PUT /api/admin/dictation-reports/settings — { enabled, thankOnFix, reasons:[{key,label}] }
router.get('/dictation-reports/settings', auth, teacherOnly, wrap(async (req, res) => {
  res.json({ success: true, settings: await svc.getSettings() });
}));
router.put('/dictation-reports/settings', auth, teacherOnly, wrap(async (req, res) => {
  send(res, await svc.updateSettings(req.body || {}));
}));

// GET /api/admin/dictation-reports/sentence/:kind/:targetId/:index — the sentence now + neighbours
router.get('/dictation-reports/sentence/:kind/:targetId/:index', auth, teacherOnly, wrap(async (req, res) => {
  const data = await svc.getSentence(req.params.kind, req.params.targetId, req.params.index);
  if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy câu này' });
  res.json({ success: true, ...data });
}));

// PUT /api/admin/dictation-reports/sentence/:kind/:targetId/:index — { text, start, end, answer?, adminNote? }
router.put('/dictation-reports/sentence/:kind/:targetId/:index', auth, teacherOnly, wrap(async (req, res) => {
  send(res, await svc.updateSentence(req.params.kind, req.params.targetId, req.params.index, req.body || {}, req.user));
}));

// DELETE /api/admin/dictation-reports/sentence/:kind/:targetId/:index?note= — take the sentence out
router.delete('/dictation-reports/sentence/:kind/:targetId/:index', auth, teacherOnly, wrap(async (req, res) => {
  send(res, await svc.deleteSentence(req.params.kind, req.params.targetId, req.params.index, req.user, String(req.query.note || '')));
}));

// PATCH /api/admin/dictation-reports/:id — { status, adminNote?, sameSentence? }
router.patch('/dictation-reports/:id', auth, teacherOnly, wrap(async (req, res) => {
  send(res, await svc.setStatus(req.params.id, req.body || {}, req.user));
}));

// DELETE /api/admin/dictation-reports/:id
router.delete('/dictation-reports/:id', auth, teacherOnly, wrap(async (req, res) => {
  send(res, await svc.deleteReport(req.params.id));
}));

module.exports = router;
