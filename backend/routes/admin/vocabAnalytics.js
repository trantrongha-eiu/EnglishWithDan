'use strict';
// Extracted from backend/routes/admin.js — Vocab Student Analytics section.

const express  = require('express');
const mongoose = require('mongoose');
const auth     = require('../../middleware/auth');
const { teacherOnly, escapeRegex, effectiveStreak } = require('./_shared');

const VocabBook     = require('../../models/VocabBook');
const VocabActivity = require('../../models/VocabActivity');
const User          = require('../../models/User');

const router = express.Router();

// ══════════════════════════════════════════════════
// VOCAB STUDENT ANALYTICS
// ══════════════════════════════════════════════════

/**
 * GET /api/admin/vocab-books/:userId
 * Trả về chi tiết từng sổ từ vựng của 1 học sinh (dùng trong modal).
 */
router.get('/vocab-books/:userId', auth, teacherOnly, async (req, res) => {
  try {
    const books = await VocabBook.find({ userId: req.params.userId })
      .select('name emoji color isDefault words')
      .sort({ createdAt: 1 })
      .lean();

    const result = books.map(b => ({
      _id:           b._id,
      name:          b.name,
      emoji:         b.emoji,
      color:         b.color,
      isDefault:     b.isDefault,
      totalWords:    b.words.length,
      daThucCount:   b.words.filter(w => w.status === 'da-thuoc').length,
      nhoSoSoCount:  b.words.filter(w => w.status === 'nho-so-so').length,
      chuaThuocCount:b.words.filter(w => w.status === 'chua-thuoc').length,
    }));

    res.json({ success: true, books: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/vocab-students
 * Trả về danh sách học sinh kèm tổng thống kê từ vựng.
 * Query: search (string), sort (words-desc|views-desc|recent|name)
 */
router.get('/vocab-students', auth, teacherOnly, async (req, res) => {
  try {
    const { search = '', sort = 'words-desc', page, limit } = req.query;

    // 1. Lấy tất cả user (không lọc role để admin/teacher cũng thấy – nhưng ưu tiên student)
    const re = search ? escapeRegex(search) : null;
    const searchFilter = re
      ? {
          $or: [
            { username:  { $regex: re, $options: 'i' } },
            { email:     { $regex: re, $options: 'i' } },
            { firstName: { $regex: re, $options: 'i' } },
            { lastName:  { $regex: re, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find({ role: 'student', ...searchFilter })
      .select('username email firstName lastName createdAt learningStreak lastActivityDate isBanned')
      .lean();

    const userIds = users.map(u => u._id);

    // 2 & 3. VocabBook and VocabActivity aggregates both only depend on
    // userIds (already resolved above), not on each other — run in parallel.
    const [bookStats, actStats] = await Promise.all([
    // Tổng hợp VocabBook: số sổ + số từ + phân loại trạng thái
    VocabBook.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id:          '$userId',
          totalBooks:   { $sum: 1 },
          totalWords:   { $sum: { $size: '$words' } },
          daThuoc:   { $sum: { $size: { $filter: { input: '$words', as: 'w', cond: { $eq: ['$$w.status', 'da-thuoc']   } } } } },
          nhoSoSo:   { $sum: { $size: { $filter: { input: '$words', as: 'w', cond: { $eq: ['$$w.status', 'nho-so-so'] } } } } },
          chuaThuoc: { $sum: { $size: { $filter: { input: '$words', as: 'w', cond: { $eq: ['$$w.status', 'chua-thuoc']} } } } },
        },
      },
    ]),

    // Tổng hợp VocabActivity: tổng view, từ thêm, từ ôn, ngày hoạt động cuối
    VocabActivity.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id:          '$userId',
          totalViews:   { $sum: '$viewCount'    },
          totalAdded:   { $sum: '$wordsAdded'   },
          totalStudied: { $sum: '$wordsStudied' },
          lastActivity: { $max: '$date'         },
          activeDays:   { $sum: { $cond: [{ $gt: ['$viewCount', 0] }, 1, 0] } },
        },
      },
    ])
    ]);

    // 4. Map thành object theo userId
    const bookMap = {};
    bookStats.forEach(s => { bookMap[s._id.toString()] = s; });
    const actMap  = {};
    actStats.forEach(s => { actMap[s._id.toString()] = s; });

    // 5. Ghép kết quả
    let result = users.map(u => {
      const uid = u._id.toString();
      const b   = bookMap[uid]  || {};
      const a   = actMap[uid]   || {};
      return {
        _id:          u._id,
        username:     u.username,
        email:        u.email,
        firstName:    u.firstName,
        lastName:     u.lastName,
        createdAt:    u.createdAt,
        isBanned:     u.isBanned,
        learningStreak: effectiveStreak(u.learningStreak, u.lastActivityDate),
        // Vocab book stats
        totalBooks:   b.totalBooks  || 0,
        totalWords:   b.totalWords  || 0,
        daThuoc:      b.daThuoc     || 0,
        nhoSoSo:      b.nhoSoSo     || 0,
        chuaThuoc:    b.chuaThuoc   || 0,
        // Activity stats
        totalViews:   a.totalViews  || 0,
        totalAdded:   a.totalAdded  || 0,
        totalStudied: a.totalStudied || 0,
        activeDays:   a.activeDays  || 0,
        lastVocabActivity: a.lastActivity || null,
      };
    });

    // 6. Sắp xếp
    const displayName = u => [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '';
    const sortFns = {
      'words-desc':  (a, b) => b.totalWords - a.totalWords,
      'views-desc':  (a, b) => b.totalViews - a.totalViews,
      'streak-desc': (a, b) => (b.learningStreak || 0) - (a.learningStreak || 0),
      'recent':      (a, b) => {
        const da = a.lastVocabActivity ? new Date(a.lastVocabActivity) : new Date(0);
        const db = b.lastVocabActivity ? new Date(b.lastVocabActivity) : new Date(0);
        return db - da;
      },
      // Was comparing `username` — the admin UI's "Tên A → Z" shows the
      // composed first+last name (falling back to username), so this needs
      // to match what's actually displayed.
      'name': (a, b) => displayName(a).localeCompare(displayName(b), 'vi', { numeric: true }),
    };
    result.sort(sortFns[sort] || sortFns['words-desc']);

    // Pagination is opt-in (page/limit both provided) so the existing
    // full-list caller (VocabActivity.jsx, which computes summary stat
    // cards from the whole list) is unaffected. Sliced post-sort since
    // sort keys (totalWords/totalViews) are computed after the join and
    // aren't stored fields the DB can paginate on directly.
    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    if (pageNum > 0 && limitNum > 0) {
      const total = result.length;
      const start = (pageNum - 1) * limitNum;
      const paged = result.slice(start, start + limitNum);
      return res.json({ success: true, students: paged, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) });
    }

    res.json({ success: true, students: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/vocab-activity/:userId
 * Chi tiết hoạt động từ vựng của 1 học sinh, phân theo ngày/tháng/năm.
 * Query: view=day|month|year, year=YYYY, month=MM (1-12)
 */
router.get('/vocab-activity/:userId', auth, teacherOnly, async (req, res) => {
  try {
    const { view = 'day', year, month } = req.query;
    const userId  = req.params.userId;

    const uid = new mongoose.Types.ObjectId(userId);

    let pipeline = [];
    let labels   = [];

    if (view === 'day') {
      // Hiển thị từng ngày trong tháng được chọn
      const y = parseInt(year)  || new Date().getUTCFullYear();
      const m = parseInt(month) || (new Date().getUTCMonth() + 1); // 1-12
      const from = new Date(Date.UTC(y, m - 1, 1));
      const to   = new Date(Date.UTC(y, m, 1));

      pipeline = [
        { $match: { userId: uid, date: { $gte: from, $lt: to } } },
        {
          $group: {
            _id:          { $dayOfMonth: '$date' },
            viewCount:    { $sum: '$viewCount'    },
            wordsAdded:   { $sum: '$wordsAdded'   },
            wordsStudied: { $sum: '$wordsStudied' },
          },
        },
        { $sort: { '_id': 1 } },
      ];

      // Số ngày trong tháng
      const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
      for (let d = 1; d <= daysInMonth; d++) labels.push(String(d));

    } else if (view === 'month') {
      // Hiển thị từng tháng trong năm được chọn
      const y    = parseInt(year) || new Date().getUTCFullYear();
      const from = new Date(Date.UTC(y, 0, 1));
      const to   = new Date(Date.UTC(y + 1, 0, 1));

      pipeline = [
        { $match: { userId: uid, date: { $gte: from, $lt: to } } },
        {
          $group: {
            _id:          { $month: '$date' },
            viewCount:    { $sum: '$viewCount'    },
            wordsAdded:   { $sum: '$wordsAdded'   },
            wordsStudied: { $sum: '$wordsStudied' },
          },
        },
        { $sort: { '_id': 1 } },
      ];

      labels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

    } else {
      // Hiển thị từng năm (tất cả dữ liệu)
      pipeline = [
        { $match: { userId: uid } },
        {
          $group: {
            _id:          { $year: '$date' },
            viewCount:    { $sum: '$viewCount'    },
            wordsAdded:   { $sum: '$wordsAdded'   },
            wordsStudied: { $sum: '$wordsStudied' },
          },
        },
        { $sort: { '_id': 1 } },
      ];
    }

    const raw = await VocabActivity.aggregate(pipeline);

    // Chuyển thành mảng đủ cho mọi slot (ngày/tháng/năm)
    let data;
    if (view === 'day') {
      const daysInMonth = labels.length;
      const map = {};
      raw.forEach(r => { map[r._id] = r; });
      data = labels.map((lbl, i) => {
        const r = map[i + 1] || {};
        return { label: lbl, viewCount: r.viewCount || 0, wordsAdded: r.wordsAdded || 0, wordsStudied: r.wordsStudied || 0 };
      });
    } else if (view === 'month') {
      const map = {};
      raw.forEach(r => { map[r._id] = r; });
      data = labels.map((lbl, i) => {
        const r = map[i + 1] || {};
        return { label: lbl, viewCount: r.viewCount || 0, wordsAdded: r.wordsAdded || 0, wordsStudied: r.wordsStudied || 0 };
      });
    } else {
      data = raw.map(r => ({
        label: String(r._id), viewCount: r.viewCount || 0, wordsAdded: r.wordsAdded || 0, wordsStudied: r.wordsStudied || 0,
      }));
    }

    res.json({ success: true, view, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
