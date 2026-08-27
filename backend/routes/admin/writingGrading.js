'use strict';
// Extracted from backend/routes/admin.js — Writing AI Grading routes.
// The actual grading logic (gradeTaskWithAI + the band-descriptor prompt)
// now lives in services/writingGradingService.js so cron/writingAutoGrade.js
// can reuse the identical grading behaviour instead of a duplicated copy.

const express = require('express');
const rateLimit = require('express-rate-limit');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const { gradeTaskWithAI } = require('../../services/writingGradingService');

const WritingAttempt = require('../../models/WritingAttempt');
const User           = require('../../models/User');
const { escapeHtml } = require('../../utils/escapeHtml');
const logger = require('../../utils/logger');

const router = express.Router();

// ai-grade calls the Gemini API with the largest prompt in the system
// (full IELTS band-descriptor rubric, maxOutputTokens: 8192) — cap runaway
// client loops without affecting normal grading workflow (teachers grade
// one task at a time by design, see comment below).
const aiGradeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu chấm AI, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

// ══════════════════════════════════════════════════
// WRITING AI GRADING
// ══════════════════════════════════════════════════

// POST /api/admin/writing-attempts/:id/ai-grade
// Body: { taskNum: 1 | 2 }  — grade only one task at a time to avoid rate limit
router.post('/writing-attempts/:id/ai-grade', auth, teacherOnly, aiGradeLimiter, async (req, res) => {
  try {
    const attempt = await WritingAttempt.findById(req.params.id).lean();
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp' });

    const taskNum = Number(req.body.taskNum);
    if (taskNum !== 1 && taskNum !== 2)
      return res.status(400).json({ success: false, message: 'taskNum phải là 1 hoặc 2' });

    const isTask1 = taskNum === 1;
    const taskPrompt = isTask1
      ? (attempt.task1Snapshot?.prompt || '')
      : (attempt.task2Snapshot?.prompt || '');
    const taskAnswer = isTask1 ? (attempt.task1Answer || '') : (attempt.task2Answer || '');
    const wordCount  = isTask1 ? (attempt.wordCount1 || 0) : (attempt.wordCount2 || 0);
    const imageUrl   = isTask1 ? (attempt.task1Snapshot?.imageUrl || '') : '';

    const gradeResult = await gradeTaskWithAI(taskNum, taskPrompt, taskAnswer, wordCount, imageUrl);

    const field = isTask1 ? 'aiGrading.task1' : 'aiGrading.task2';
    await WritingAttempt.findByIdAndUpdate(req.params.id, {
      $set: { [field]: gradeResult, 'aiGrading.generatedAt': new Date(), gradingStatus: 'ai_done' }
    });

    res.json({ success: true, taskNum, result: gradeResult });
  } catch (err) {
    const status = err.isOverloaded ? 503 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-attempts/:id/confirm-grade
router.put('/writing-attempts/:id/confirm-grade', auth, teacherOnly, async (req, res) => {
  try {
    const { task1, task2, overallBand, adminNote } = req.body;
    const confirmedBy = req.user.username || req.user._id.toString();
    const confirmedAt = new Date();

    const attempt = await WritingAttempt.findByIdAndUpdate(req.params.id, {
      grading: { task1, task2, overallBand, adminNote: adminNote || '', confirmedAt, confirmedBy },
      gradingStatus: 'confirmed',
      feedbackRead: false
    }, { new: false }); // get the original to read userId + examName

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài làm' });
    }

    res.json({ success: true, message: 'Đã xác nhận điểm' });

    // Fire-and-forget: detached from request lifecycle via setImmediate
    // so any error here can never trigger the outer catch after headers are sent
    if (attempt && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      setImmediate(async () => {
      try {
        const student = await User.findById(attempt.userId).select('email firstName username').lean();
        if (student?.email) {
          const nodemailer = require('nodemailer');
          // NEW-001: this is a student-facing link (view your graded
          // writing on the public site) and must use the frontend's own
          // production domain, not the backend API's — same FRONTEND_URL
          // env var + localhost fallback already used for OAuth/auth-
          // callback redirects in controllers/auth.controller.js.
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
          });
          const displayName = student.firstName || student.username || 'bạn';
          const bandColor = overallBand >= 7 ? '#16a34a' : overallBand >= 5.5 ? '#2563eb' : '#d97706';
          await transporter.sendMail({
            from: `"EnglishWithDan" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: `✅ Bài Writing "${attempt.examName || 'của bạn'}" đã được chấm – Band ${overallBand}`,
            html: `
<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fb;padding:32px 24px;border-radius:12px">
  <div style="text-align:center;margin-bottom:24px">
    <div style="font-size:22px;font-weight:800;letter-spacing:-.5px">
      <span style="color:#3d8bff">Daniel</span><span style="color:#e53935">Hà</span>
    </div>
  </div>
  <div style="background:#fff;border-radius:12px;padding:28px 24px;border:1px solid #e5e7eb">
    <p style="font-size:16px;font-weight:700;color:#111;margin:0 0 8px">Xin chào ${escapeHtml(displayName)}! 👋</p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6">Bài thi Writing <strong style="color:#111">"${escapeHtml(attempt.examName || '')}"</strong> của bạn đã được giáo viên chấm xong.</p>

    <div style="text-align:center;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #3b82f6;border-radius:12px;padding:20px;margin-bottom:20px">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Overall Band Score</div>
      <div style="font-size:52px;font-weight:900;color:${bandColor};line-height:1">${overallBand ?? '–'}</div>
    </div>

    ${adminNote ? `
    <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:8px;padding:12px 16px;margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:#059669;margin-bottom:4px">💬 Nhận xét từ giáo viên</div>
      <div style="font-size:14px;color:#065f46;line-height:1.65">${escapeHtml(adminNote)}</div>
    </div>` : ''}

    <div style="text-align:center;margin-top:8px">
      <a href="${frontendUrl}/writing.html"
        style="display:inline-block;background:#e53935;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:700">
        📋 Xem bài làm & Feedback chi tiết
      </a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px">EnglishWithDan · Đây là email tự động, vui lòng không trả lời.</p>
</div>`
          });
        }
      } catch (mailErr) {
        console.error('[Writing] Grade email error:', mailErr.message);
      }
      }); // end setImmediate
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
