'use strict';

// Preserves each original route's own status-code/message choice exactly —
// this file mixes three different error-response styles inherited from
// routes/listening.js (plain err.message at 500, err.message at 400 for
// create/update, 'Upload thất bại: '+err.message for upload routes, and
// generic 'Lỗi server' + console.error for the three practice/* routes) —
// none of that was unified, since doing so would change client-visible
// error text.
const listeningService = require('../services/listeningService');
const { isImageDataUri } = require('../utils/validation');

// ── Admin – CRUD Tests ──────────────────────────────────────────────────
exports.listAdminTests = async (req, res) => {
  try {
    const tests = await listeningService.listAdminTests();
    res.json({ success: true, tests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// getAdminTest throws NotFoundError (errors/AppError.js) instead of
// returning null — err.statusCode here produces the exact same 404 +
// message the old manual null-check used to return.
exports.getAdminTest = async (req, res) => {
  try {
    const test = await listeningService.getAdminTest(req.params.id);
    res.json({ success: true, test });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

exports.createAdminTest = async (req, res) => {
  try {
    const test = await listeningService.createAdminTest(req.body);
    res.status(201).json({ success: true, test });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateAdminTest = async (req, res) => {
  try {
    const test = await listeningService.updateAdminTest(req.params.id, req.body);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.hideAdminTest = async (req, res) => {
  try {
    await listeningService.hideAdminTest(req.params.id);
    res.json({ success: true, message: 'Đã ẩn đề nghe' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// deleteAdminTestPermanent throws NotFoundError instead of returning null —
// same reasoning as getAdminTest above.
exports.deleteAdminTestPermanent = async (req, res) => {
  try {
    await listeningService.deleteAdminTestPermanent(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn đề nghe' });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

// ── Admin – Uploads ──────────────────────────────────────────────────────
exports.uploadTestAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });
    const { audioUrl, audioDuration } = await listeningService.uploadTestAudio(req.params.id, req.file);
    res.json({ success: true, message: 'Upload audio thành công', audioUrl, audioDuration });
  } catch (err) { res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message }); }
};

exports.uploadStandaloneAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });
    const result = await listeningService.uploadStandaloneAudio(req.file);
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message }); }
};

exports.uploadMapImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu imageBase64' });
    if (!isImageDataUri(imageBase64)) return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });
    const url = await listeningService.uploadMapImage(imageBase64);
    res.json({ success: true, url });
  } catch (err) { res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message }); }
};

// ── Admin – Transcript ───────────────────────────────────────────────────
exports.updateTranscript = async (req, res) => {
  try {
    const { sectionTranscripts } = req.body;
    if (!Array.isArray(sectionTranscripts)) {
      return res.status(400).json({ success: false, message: 'sectionTranscripts phải là array' });
    }
    const test = await listeningService.updateTranscript(req.params.id, sectionTranscripts);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, message: 'Đã cập nhật transcript' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Admin – Attempts history / stats ─────────────────────────────────────
exports.listAdminAttempts = async (req, res) => {
  try {
    const { testId, userId, page = 1, limit = 50 } = req.query;
    const { attempts, total } = await listeningService.listAdminAttempts({ testId, userId, page, limit });
    res.json({ success: true, attempts, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAdminAttemptsStats = async (req, res) => {
  try {
    const stats = await listeningService.getAdminAttemptsStats(req.query.testId);
    res.json({ success: true, ...stats });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Student – practice sections ──────────────────────────────────────────
exports.listPracticeSections = async (req, res) => {
  try {
    const { sections, doneMap } = await listeningService.listPracticeSections(req.query, req.user._id);
    res.json({ success: true, sections, doneMap });
  } catch (err) { res.status(err.status || 500).json({ success: false, message: err.message }); }
};

exports.getPracticeSectionById = async (req, res) => {
  try {
    const section = await listeningService.getPracticeSectionById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Không tìm thấy section' });
    res.json({ success: true, section });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Admin CRUD for practice sections ─────────────────────────────────────
exports.listAdminSections = async (req, res) => {
  try {
    const sections = await listeningService.listAdminSections();
    res.json({ success: true, sections });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAdminSection = async (req, res) => {
  try {
    const s = await listeningService.getAdminSection(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, section: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createAdminSection = async (req, res) => {
  try {
    const s = await listeningService.createAdminSection(req.body);
    res.json({ success: true, section: s });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateAdminSection = async (req, res) => {
  try {
    const s = await listeningService.updateAdminSection(req.params.id, req.body);
    res.json({ success: true, section: s });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.hideAdminSection = async (req, res) => {
  try {
    await listeningService.hideAdminSection(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// deleteAdminSectionPermanent throws NotFoundError instead of returning
// null — same reasoning as deleteAdminTestPermanent above.
exports.deleteAdminSectionPermanent = async (req, res) => {
  try {
    await listeningService.deleteAdminSectionPermanent(req.params.id);
    res.json({ success: true, message: 'Đã xóa vĩnh viễn section' });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

exports.uploadSectionAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });
    const result = await listeningService.uploadSectionAudio(req.params.id, req.file);
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Admin – Assemble test from 4 sections ────────────────────────────────
exports.assembleTest = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên đề không được để trống' });
    const test = await listeningService.assembleTest(req.body);
    res.json({ success: true, test, message: 'Đã tạo đề Listening từ bài lẻ. Upload audio tại trang Đề Listening.' });
  } catch (err) { res.status(err.status || 500).json({ success: false, message: err.message }); }
};

// ── Student – test list / start / submit ─────────────────────────────────
exports.listStudentTests = async (req, res) => {
  try {
    res.set('Cache-Control', 'private, max-age=120');
    const tests = await listeningService.listStudentTests(req.user._id || req.user.id);
    res.json({ success: true, tests, userPlan: req.user.plan || 'free', planExpiresAt: req.user.planExpiresAt || null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.startTest = async (req, res) => {
  try {
    const test = await listeningService.startTest(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });
    res.json({ success: true, test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.submitTest = async (req, res) => {
  try {
    const result = await listeningService.submitTest(req.params.id, req.body, req.user);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Student – history ─────────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const attempts = await listeningService.getHistory(req.user._id || req.user.id);
    res.json({ success: true, attempts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getHistoryDetail = async (req, res) => {
  try {
    const { status, result } = await listeningService.getHistoryDetail(req.params.attemptId, req.user._id || req.user.id);
    if (status === 'attempt_not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    if (status === 'test_not_found') return res.status(404).json({ success: false, message: 'Đề thi không tồn tại' });
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Practice attempts ──────────────────────────────────────────────────────
exports.savePractice = async (req, res) => {
  try {
    const { sectionId, sectionTitle, partNumber, answers, timeTaken } = req.body;
    if (!sectionId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }
    const result = await listeningService.savePractice({ sectionId, sectionTitle, partNumber, answers, timeTaken }, req.user._id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy section' });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Listening practice save]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getPracticeHistory = async (req, res) => {
  try {
    const attempts = await listeningService.getPracticeHistory(req.user._id);
    res.json({ success: true, attempts });
  } catch (err) {
    console.error('[Listening practice history]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getPracticeHistoryDetail = async (req, res) => {
  try {
    const result = await listeningService.getPracticeHistoryDetail(req.params.attemptId, req.user._id);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, attempt: result.attempt, section: result.section });
  } catch (err) {
    console.error('[Listening practice history detail]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
