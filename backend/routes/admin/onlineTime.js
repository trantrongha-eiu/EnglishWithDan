'use strict';
// "Thời gian online" — minutes each student spent active on the site per day,
// and each session's detail (tab switches, idle pauses). Data comes from
// frontend/js/shared/online-tracker.js → POST /api/activity/beat.

const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const onlineTime = require('../../services/onlineTimeService');

const router = express.Router();

// GET /api/admin/online-time?day=YYYY-MM-DD&search=&sort=&page=&limit=
router.get('/online-time', auth, teacherOnly, async (req, res) => {
  try {
    const { day, search, sort, page, limit } = req.query;
    const data = await onlineTime.listDay({ day, search, sort, page, limit });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/online-time/:userId?days=14&day=YYYY-MM-DD
router.get('/online-time/:userId', auth, teacherOnly, async (req, res) => {
  try {
    const data = await onlineTime.userDetail(req.params.userId, { days: req.query.days, day: req.query.day });
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
