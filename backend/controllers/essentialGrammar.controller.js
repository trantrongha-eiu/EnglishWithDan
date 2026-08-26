'use strict';

const essentialGrammarService = require('../services/essentialGrammarService');

exports.listLessons = async (req, res) => {
  try {
    // Public (no auth on this route), fixed handbook content — safe to cache briefly.
    res.set('Cache-Control', 'public, max-age=120');
    const lessons = await essentialGrammarService.listLessons();
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── Student progress ────────────────────────────────────────────
exports.getAttempt = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const attempt = await essentialGrammarService.getAttempt(req.user._id, req.params.id);
    res.json({ success: true, attempt: attempt || null });
  } catch (err) {
    console.error('[EssentialGrammar]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const { correctCount, totalCount, timeSpent, wrongQuestions } = req.body;
    if (typeof totalCount !== 'number' || totalCount <= 0) {
      return res.status(400).json({ success: false, message: 'Thiếu totalCount' });
    }
    const attempt = await essentialGrammarService.submitAttempt(req.user._id, req.params.id, { correctCount, totalCount, timeSpent, wrongQuestions });
    res.json({ success: true, attempt });
  } catch (err) {
    console.error('[EssentialGrammar]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getMyAttemptHistory = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const history = await essentialGrammarService.getAttemptHistory(req.user._id, req.params.id, 20);
    res.json({ success: true, history });
  } catch (err) {
    console.error('[EssentialGrammar]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── Admin: CRUD ───────────────────────────────────────────────────
exports.listAdminLessons = async (req, res) => {
  try {
    const lessons = await essentialGrammarService.listAdminLessons();
    res.json({ success: true, lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminLesson = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLessonMeta = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.updateLessonMeta(req.params.id, req.body);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.deleteLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, message: 'Đã xoá bài học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setActive = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.setActive(req.params.id, req.body.isActive);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    res.json({ success: true, lesson, message: lesson.isActive ? 'Đã hiện bài học' : 'Đã ẩn bài học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Analytics (per-lesson student breakdown, per-student history,
// most-missed questions, CSV export) ──────────────────────────────
exports.getLessonStudentBreakdown = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const students = await essentialGrammarService.getLessonStudentBreakdown(req.params.id);
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentAttemptHistoryAdmin = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const history = await essentialGrammarService.getAttemptHistory(req.params.userId, req.params.id, 50);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMostMissedQuestions = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const questions = await essentialGrammarService.getMostMissedQuestions(req.params.id, 10);
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportLessonStudentsCsv = async (req, res) => {
  try {
    const lesson = await essentialGrammarService.getAdminLesson(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    const { title, csv } = await essentialGrammarService.exportLessonStudentsCsv(req.params.id);
    // Strip to a filesystem/header-safe filename — the lesson title is
    // seed-authored but treat it the same as user content for safety.
    const safeName = title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().slice(0, 60) || 'lesson';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
    res.send('﻿' + csv); // BOM so Excel opens UTF-8 (Vietnamese names) correctly
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
