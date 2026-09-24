'use strict';
// "Tài liệu in (Tips)": per-tip Markdown pack (AI prompt + tip content +
// fixed practice with its answer key) a teacher gives another AI to write a
// printable class handout — see services/tipLecturePackService.js.

const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const tipLecturePackService = require('../../services/tipLecturePackService');

const router = express.Router();

// GET /api/admin/tip-packs — every active tip of the four skills
router.get('/tip-packs', auth, teacherOnly, async (req, res) => {
  try {
    res.json({ success: true, skills: await tipLecturePackService.listTips() });
  } catch (err) {
    console.error('[Admin tip packs]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/admin/tip-packs/:skill/:lessonKey — { filename, prompt, markdown }
// (the markdown carries answer keys: teacher/admin only, never cached)
router.get('/tip-packs/:skill/:lessonKey', auth, teacherOnly, async (req, res) => {
  try {
    const pack = await tipLecturePackService.buildPack(req.params.skill, req.params.lessonKey);
    if (!pack) return res.status(404).json({ success: false, message: 'Không tìm thấy bài Tips này.' });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, ...pack });
  } catch (err) {
    console.error('[Admin tip pack]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
