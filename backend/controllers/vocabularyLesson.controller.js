'use strict';

const vocabularyLessonService = require('../services/vocabularyLessonService');

// ── Student-facing ──────────────────────────────────────────────
exports.listPublicLessons = async (req, res) => {
  try {
    const lessons = await vocabularyLessonService.listPublicLessons();
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublicLesson = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getPublicLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuizLeaderboard = async (req, res) => {
  try {
    const leaderboard = await vocabularyLessonService.getQuizLeaderboard(10);
    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAttempt = async (req, res) => {
  try {
    // Progress is only meaningful for a lesson the student can actually see.
    const lesson = await vocabularyLessonService.getPublicLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const attempt = await vocabularyLessonService.getAttempt(req.user._id, req.params.id);
    res.json({ success: true, attempt: attempt || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getPublicLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const { correctCount, totalCount, timeSpent, wrongWords } = req.body;
    if (typeof totalCount !== 'number' || totalCount <= 0) {
      return res.status(400).json({ success: false, message: 'Thiếu totalCount' });
    }
    const attempt = await vocabularyLessonService.submitAttempt(req.user._id, req.params.id, { correctCount, totalCount, timeSpent, wrongWords });
    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyAttemptHistory = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getPublicLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const history = await vocabularyLessonService.getAttemptHistory(req.user._id, req.params.id, 20);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: parse / import ────────────────────────────────────────
exports.parseText = async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu nội dung lesson' });
    }
    const result = vocabularyLessonService.parseText(text);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importLesson = async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu nội dung lesson' });
    }
    const lesson = await vocabularyLessonService.importLesson(req.user._id, text);
    res.status(201).json({ success: true, lesson, message: `Đã import "${lesson.title}" (${lesson.words.length} từ)` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message, errors: err.validationErrors });
  }
};

exports.reimportLesson = async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu nội dung lesson' });
    }
    const lesson = await vocabularyLessonService.reimportLesson(req.params.id, req.user._id, text);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson, message: `Đã cập nhật "${lesson.title}" (${lesson.words.length} từ)` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message, errors: err.validationErrors });
  }
};

// ── Admin: CRUD ───────────────────────────────────────────────────
exports.listAdminLessons = async (req, res) => {
  try {
    const lessons = await vocabularyLessonService.listAdminLessons();
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminLesson = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLessonMeta = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.updateLessonMeta(req.params.id, req.body);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.deleteLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, message: 'Đã xoá bài học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setPublished = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.setPublished(req.params.id, req.body.published);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson, message: lesson.published ? 'Đã publish bài học' : 'Đã unpublish bài học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.duplicateLesson = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.duplicateLesson(req.params.id, req.user._id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.status(201).json({ success: true, lesson, message: `Đã nhân bản thành "${lesson.title}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Import History ────────────────────────────────────────
exports.listImportHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const history = await vocabularyLessonService.listImportHistory(limit);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getImportHistoryEntry = async (req, res) => {
  try {
    const entry = await vocabularyLessonService.getImportHistoryEntry(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Analytics (per-lesson class breakdown, per-student history,
// most-missed words, CSV export) ──────────────────────────────────
exports.getLessonStudentBreakdown = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const students = await vocabularyLessonService.getLessonStudentBreakdown(req.params.id);
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentAttemptHistoryAdmin = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const history = await vocabularyLessonService.getAttemptHistory(req.params.userId, req.params.id, 50);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMostMissedWords = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const words = await vocabularyLessonService.getMostMissedWords(req.params.id, 10);
    res.json({ success: true, words });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportLessonStudentsCsv = async (req, res) => {
  try {
    const lesson = await vocabularyLessonService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const { title, csv } = await vocabularyLessonService.exportLessonStudentsCsv(req.params.id);
    // Strip to a filesystem/header-safe filename — the lesson title is
    // admin-authored free text and must never flow raw into a header value.
    const safeName = title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().slice(0, 60) || 'lesson';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
    res.send('﻿' + csv); // BOM so Excel opens UTF-8 (Vietnamese names) correctly
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
