'use strict';
// Extracted from backend/routes/admin.js — Stats, db-status, history, recent-attempts, listening-history sections.

const express = require('express');
const mongoose = require('mongoose');
const auth    = require('../../middleware/auth');
const { teacherOnly, adminOnly } = require('./_shared');

const TestAttempt     = require('../../models/TestAttempt');
const ReadingPracticeAttempt = require('../../models/ReadingPracticeAttempt');
const ListeningAttempt = require('../../models/ListeningAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');
const WritingAttempt  = require('../../models/WritingAttempt');
const WritingPracticeAttempt = require('../../models/WritingPracticeAttempt');
const Task1Attempt    = require('../../models/Task1Attempt');
const Task2Attempt    = require('../../models/Task2Attempt');
const User            = require('../../models/User');
const Passage         = require('../../models/Passage');
const VocabUnit        = require('../../models/VocabUnit');

const router = express.Router();

// ══════════════════════════════════════════════════
// THỐNG KÊ
// ══════════════════════════════════════════════════

router.get('/stats', auth, teacherOnly, async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      bannedUsers,
      readingFullCount,
      readingPracticeCount,
      listeningFullCount,
      listeningPracticeCount,
      writingFullCount,
      writingPracticeCount,
      task1Count,
      task2Count,
      avgBandReading,
      avgBandListening,
      newUsersThisWeek,
      passageCount,
      vocabUnitCount
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['teacher', 'admin'] } }),
      User.countDocuments({ isBanned: true }),
      TestAttempt.countDocuments({ status: 'completed' }),
      ReadingPracticeAttempt.countDocuments(),
      ListeningAttempt.countDocuments({ status: 'completed' }),
      ListeningPracticeAttempt.countDocuments(),
      WritingAttempt.countDocuments(),
      WritingPracticeAttempt.countDocuments(),
      Task1Attempt.countDocuments(),
      Task2Attempt.countDocuments(),
      TestAttempt.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$bandScore' } } }
      ]),
      ListeningAttempt.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$bandScore' } } }
      ]),
      User.countDocuments({ role: 'student', createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }),
      Passage.countDocuments({ isActive: true }),
      VocabUnit.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        bannedUsers,
        newUsersThisWeek,
        totalReadingAttempts:   readingFullCount + readingPracticeCount,
        readingFullCount,
        readingPracticeCount,
        totalListeningAttempts: listeningFullCount + listeningPracticeCount,
        listeningFullCount,
        listeningPracticeCount,
        totalWritingAttempts:   writingFullCount + writingPracticeCount + task1Count + task2Count,
        writingFullCount,
        writingPracticeCount:   writingPracticeCount + task1Count + task2Count,
        avgReadingBand:   avgBandReading[0]?.avg?.toFixed(1)  || '0.0',
        avgListeningBand: avgBandListening[0]?.avg?.toFixed(1) || '0.0',
        passageCount,
        vocabUnitCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/db-status – MongoDB storage stats (Atlas M0: 512 MB limit)
router.get('/db-status', auth, adminOnly, async (req, res) => {
  try {
    const raw = await mongoose.connection.db.command({ dbStats: 1, scale: 1 });
    const FREE_LIMIT = 512 * 1024 * 1024;
    const used = (raw.storageSize || 0) + (raw.indexSize || 0);
    res.json({
      success: true,
      db: {
        usedBytes:   used,
        limitBytes:  FREE_LIMIT,
        usedMB:      +(used / 1024 / 1024).toFixed(2),
        limitMB:     512,
        usedPct:     +(used / FREE_LIMIT * 100).toFixed(1),
        dataSize:    raw.dataSize    || 0,
        storageSize: raw.storageSize || 0,
        indexSize:   raw.indexSize   || 0,
        collections: raw.collections || 0,
        objects:     raw.objects     || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/history – lịch sử Reading
router.get('/history', auth, teacherOnly, async (req, res) => {
  try {
    const history = await TestAttempt.find({ status: 'completed' })
      .populate('userId', 'username firstName lastName')
      .populate('testId', 'name testNumber')
      .sort({ endTime: -1 })
      .limit(50)
      .select('-answers -passagesUsed')
      .lean();

    const normalized = history.map(h => {
      if (h.userId && typeof h.userId === 'object') {
        const u = h.userId;
        const first = (u.firstName || '').trim();
        const last  = (u.lastName  || '').trim();
        h.userId = { ...u, displayName: (first ? (last ? `${first} ${last}` : first) : '') || u.username || '–' };
      }
      return h;
    });

    res.json({ success: true, history: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/recent-attempts – tất cả bài nộp gần nhất (Reading + Listening + Writing)
router.get('/recent-attempts', auth, teacherOnly, async (req, res) => {
  try {
    const LIMIT = Math.min(parseInt(req.query.limit) || 80, 300);
    function normUser(u) {
      if (!u || typeof u !== 'object') return { displayName: '–' };
      const first = (u.firstName || '').trim();
      const last  = (u.lastName  || '').trim();
      return { ...u, displayName: (first ? (last ? `${first} ${last}` : first) : '') || u.username || '–' };
    }

    const [reading, listening, writing, listeningPractice, readingPractice,
           wpAttempts, task1Attempts, task2Attempts] = await Promise.all([
      TestAttempt.find({ status: 'completed' })
        .populate('userId', 'username firstName lastName')
        .populate('testId', 'name testNumber')
        .sort({ endTime: -1 }).limit(LIMIT)
        .select('-answers -passagesUsed').lean(),
      ListeningAttempt.find({ status: 'completed' })
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 }).limit(LIMIT)
        .select('-answers').lean()
        .catch(() => []),
      WritingAttempt.find()
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 }).limit(LIMIT)
        .select('-task1Answer -task2Answer -task1Snapshot -task2Snapshot').lean()
        .catch(() => []),
      ListeningPracticeAttempt.find()
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 }).limit(LIMIT)
        .select('-answers').lean()
        .catch(() => []),
      ReadingPracticeAttempt.find()
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 }).limit(LIMIT)
        .select('-answers').lean()
        .catch(() => []),
      WritingPracticeAttempt.find()
        .populate('studentId', 'username firstName lastName')
        .sort({ createdAt: -1 }).limit(LIMIT)
        .select('-userAnswer').lean()
        .catch(() => []),
      Task1Attempt.find()
        .populate('userId', 'username firstName lastName')
        .sort({ createdAt: -1 }).limit(LIMIT)
        .select('-userAnswer -feedback').lean()
        .catch(() => []),
      Task2Attempt.find()
        .populate('userId', 'username firstName lastName')
        .sort({ completedAt: -1 }).limit(LIMIT)
        .select('-questionsAttempted').lean()
        .catch(() => [])
    ]);

    const rows = [
      ...reading.map(h => ({
        _id: h._id, skill: 'reading',
        testName: h.testId?.name || `Test #${h.testId?.testNumber || ''}`,
        userId: normUser(h.userId),
        date: h.endTime || h.createdAt,
        bandScore: h.bandScore,
        correctCount: h.correctCount,
        totalQuestions: h.totalQuestions,
        duration: h.duration
      })),
      ...listening.map(h => ({
        _id: h._id, skill: 'listening',
        testName: h.testName || '–',
        userId: normUser(h.userId),
        date: h.submittedAt || h.createdAt,
        bandScore: h.bandScore,
        correctCount: h.correctCount,
        totalQuestions: h.totalQuestions,
        duration: h.timeTaken
      })),
      ...writing.map(h => ({
        _id: h._id, skill: 'writing',
        testName: h.examName || h.testName || '–',
        userId: normUser(h.userId),
        date: h.submittedAt || h.createdAt,
        bandScore: h.grading?.overallBand ?? null,
        correctCount: null,
        totalQuestions: null,
        duration: h.timeTaken || null
      })),
      ...listeningPractice.map(h => ({
        _id: h._id, skill: 'listening-practice',
        testName: h.sectionTitle || '–',
        testMeta: `Part ${h.partNumber || '?'}`,
        userId: normUser(h.userId),
        date: h.submittedAt || h.createdAt,
        bandScore: null,
        correctCount: h.correctCount,
        totalQuestions: h.totalQuestions,
        duration: h.timeTaken
      })),
      ...readingPractice.map(h => ({
        _id: h._id, skill: 'reading-practice',
        testName: h.passageTitle || '–',
        testMeta: h.category || '',
        userId: normUser(h.userId),
        date: h.submittedAt || h.createdAt,
        bandScore: null,
        correctCount: h.correctCount,
        totalQuestions: h.totalQuestions,
        duration: h.timeTaken
      })),
      ...wpAttempts.map(h => ({
        _id: h._id, skill: 'writing-practice',
        testName: h.topic || '–',
        testMeta: `${h.type || ''} · Lv${h.level || '?'}`,
        userId: normUser(h.studentId),
        date: h.createdAt,
        bandScore: null,
        correctCount: null,
        totalQuestions: null,
        duration: null
      })),
      ...task1Attempts.map(h => ({
        _id: h._id, skill: 'task1-practice',
        testName: [h.skillType, h.module != null ? `M${h.module}` : ''].filter(Boolean).join(' ') || 'Task 1',
        testMeta: `${h.isCorrect ? '✓' : '✗'} · ${h.score != null ? h.score + ' pts' : ''}`.trim().replace(/·\s*$/, ''),
        userId: normUser(h.userId),
        date: h.createdAt,
        bandScore: null,
        correctCount: h.isCorrect ? 1 : 0,
        totalQuestions: 1,
        duration: null
      })),
      ...task2Attempts.map(h => ({
        _id: h._id, skill: 'task2-practice',
        testName: h.topicName || '–',
        testMeta: `Week ${h.week || '?'} · ${h.level || ''}`,
        userId: normUser(h.userId),
        date: h.completedAt || h.createdAt,
        bandScore: null,
        correctCount: h.correctCount,
        totalQuestions: h.totalQuestions,
        duration: null
      }))
    ];

    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, attempts: rows.slice(0, LIMIT * 3) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/listening-history – lịch sử Listening
router.get('/listening-history', auth, teacherOnly, async (req, res) => {
  try {
    // ListeningAttempt có thể chưa có model — wrap try/catch riêng
    let history = [];
    try {
      history = await ListeningAttempt.find({ status: 'completed' })
        .populate('userId', 'username firstName lastName')
        .sort({ submittedAt: -1 })
        .limit(100)
        .select('-answers');
    } catch {
      // Model chưa tồn tại hoặc chưa có data
    }
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
