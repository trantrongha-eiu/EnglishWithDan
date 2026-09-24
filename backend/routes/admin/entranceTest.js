'use strict';
// Admin surface for the IELTS Entrance Test: which fixed content is
// currently assigned (EntranceTestConfig), the Grammar question bank
// (EntranceGrammarQuestion), and read-only attempt monitoring
// (EntranceTestAttempt) — mirrors routes/admin/mockTests.js's shape for
// the analogous Full Mock Test monitor.

const express = require('express');
const { teacherOnly } = require('./_shared');
const auth = require('../../middleware/auth');
const entranceTestService = require('../../services/entranceTestService');

const router = express.Router();

function errStatus(err) { return err && err.statusCode ? err.statusCode : 500; }

// GET /api/admin/entrance-test/config
router.get('/entrance-test/config', auth, teacherOnly, async (req, res) => {
  try {
    const data = await entranceTestService.getAdminConfig();
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('[admin/entrance-test/config GET]', err);
    res.status(500).json({ success: false, message: 'Lỗi tải cấu hình Test đầu vào' });
  }
});

// PUT /api/admin/entrance-test/config
// body: { grammarSetKey } — Reading/Listening/Writing/Speaking are drawn at random per attempt
router.put('/entrance-test/config', auth, teacherOnly, async (req, res) => {
  try {
    const config = await entranceTestService.updateAdminConfig(req.body || {}, req.user._id);
    res.json({ success: true, config });
  } catch (err) {
    const code = errStatus(err);
    if (code >= 500) console.error('[admin/entrance-test/config PUT]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi lưu cấu hình Test đầu vào' });
  }
});

// GET /api/admin/entrance-test/grammar-questions?setKey=
router.get('/entrance-test/grammar-questions', auth, teacherOnly, async (req, res) => {
  try {
    const questions = await entranceTestService.listGrammarQuestions(req.query.setKey);
    res.json({ success: true, questions });
  } catch (err) {
    console.error('[admin/entrance-test/grammar-questions GET]', err);
    res.status(500).json({ success: false, message: 'Lỗi tải ngân hàng câu hỏi Grammar' });
  }
});

// POST /api/admin/entrance-test/grammar-questions
router.post('/entrance-test/grammar-questions', auth, teacherOnly, async (req, res) => {
  try {
    const question = await entranceTestService.createGrammarQuestion(req.body || {});
    res.status(201).json({ success: true, question });
  } catch (err) {
    const code = errStatus(err);
    if (code >= 500) console.error('[admin/entrance-test/grammar-questions POST]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi tạo câu hỏi' });
  }
});

// PUT /api/admin/entrance-test/grammar-questions/:id
router.put('/entrance-test/grammar-questions/:id', auth, teacherOnly, async (req, res) => {
  try {
    const question = await entranceTestService.updateGrammarQuestion(req.params.id, req.body || {});
    res.json({ success: true, question });
  } catch (err) {
    const code = errStatus(err);
    if (code >= 500) console.error('[admin/entrance-test/grammar-questions PUT]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi cập nhật câu hỏi' });
  }
});

// DELETE /api/admin/entrance-test/grammar-questions/:id — soft delete (isActive:false)
router.delete('/entrance-test/grammar-questions/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await entranceTestService.deleteGrammarQuestion(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const code = errStatus(err);
    if (code >= 500) console.error('[admin/entrance-test/grammar-questions DELETE]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi xoá câu hỏi' });
  }
});

// GET /api/admin/entrance-test/attempts?page=&limit=&userId=&status=&resultStatus=
router.get('/entrance-test/attempts', auth, teacherOnly, async (req, res) => {
  try {
    const data = await entranceTestService.listAdminAttempts({
      page: req.query.page,
      limit: req.query.limit,
      userId: req.query.userId || null,
      status: req.query.status || null,
      resultStatus: req.query.resultStatus || null,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('[admin/entrance-test/attempts GET]', err);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách lượt làm bài' });
  }
});

// GET /api/admin/entrance-test/attempts/:id
router.get('/entrance-test/attempts/:id', auth, teacherOnly, async (req, res) => {
  try {
    const attempt = await entranceTestService.getAdminAttemptDetail(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy lượt làm bài' });
    res.json({ success: true, attempt });
  } catch (err) {
    console.error('[admin/entrance-test/attempts/:id GET]', err);
    res.status(500).json({ success: false, message: 'Lỗi tải chi tiết lượt làm bài' });
  }
});

// POST /api/admin/entrance-test/attempts/:id/approve
// body: { writingBand, speakingBand, overallBand?, adminNote? } — publishes
// the result to the student (inbox message on the first approval).
router.post('/entrance-test/attempts/:id/approve', auth, teacherOnly, async (req, res) => {
  try {
    const attempt = await entranceTestService.approveAttempt(req.params.id, req.body || {}, req.user);
    res.json({ success: true, attempt });
  } catch (err) {
    const code = errStatus(err);
    if (code >= 500) console.error('[admin/entrance-test/attempts/:id/approve POST]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi duyệt kết quả' });
  }
});

// POST /api/admin/entrance-test/attempts/:id/regrade-speaking — re-run the
// AI Speaking suggestion from the stored recording/transcript.
router.post('/entrance-test/attempts/:id/regrade-speaking', auth, teacherOnly, async (req, res) => {
  try {
    const attempt = await entranceTestService.regradeSpeaking(req.params.id);
    res.json({ success: true, attempt });
  } catch (err) {
    const code = errStatus(err);
    if (code >= 500) console.error('[admin/entrance-test/attempts/:id/regrade-speaking POST]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi chấm lại Speaking' });
  }
});

module.exports = router;
