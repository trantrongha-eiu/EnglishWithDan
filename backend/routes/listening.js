/**
 * backend/routes/listening.js
 * Admin quản lý đề nghe + Student làm bài
 */
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const ListeningTest            = require('../models/ListeningTest');
const ListeningAttempt         = require('../models/ListeningAttempt');
const ListeningSection         = require('../models/ListeningSection');
const ListeningPracticeAttempt = require('../models/ListeningPracticeAttempt');
const auth                     = require('../middleware/auth');

// ── Middleware ──────────────────────────────────────────────────────────────
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  if (req.user.role === 'teacher' && req.method === 'DELETE') {
    return res.status(403).json({ success: false, message: 'Giáo viên không có quyền xóa nội dung' });
  }
  next();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file audio'));
  }
});

// ── Helper: flatten tất cả questions từ sections → groups → questions ────────
function flattenQuestions(sections) {
  return sections.flatMap(s =>
    s.questionGroups.flatMap(g => g.questions)
  );
}

// ── Helper: tính band score Listening ───────────────────────────────────────
function calcBandScore(correct) {
  const bandMap = [
    [39, 9.0], [37, 8.5], [35, 8.0], [32, 7.5], [30, 7.0],
    [26, 6.5], [23, 6.0], [18, 5.5], [16, 5.0], [13, 4.5],
    [10, 4.0], [8, 3.5], [6, 3.0], [4, 2.5]
  ];
  for (const [threshold, band] of bandMap) {
    if (correct >= threshold) return band;
  }
  return 2.0;
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – CRUD Tests
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/listening/admin/tests
router.get('/admin/tests', auth, teacherOnly, async (req, res) => {
  try {
    const tests = await ListeningTest.find()
      .select('name testNumber seriesName audioUrl audioDuration isActive sections createdAt')
      .sort({ testNumber: -1 });

    const list = tests.map(t => ({
      ...t.toObject(),
      totalQuestions: flattenQuestions(t.sections).length,
      totalParts: t.sections.length
    }));

    res.json({ success: true, tests: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listening/admin/tests/:id
router.get('/admin/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ListeningTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/listening/admin/tests
router.post('/admin/tests', auth, teacherOnly, async (req, res) => {
  try {
    const test = new ListeningTest(req.body);
    await test.save();
    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/listening/admin/tests/:id
router.put('/admin/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ListeningTest.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, test });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/listening/admin/tests/:id  (soft delete – ẩn)
router.delete('/admin/tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    await ListeningTest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Đã ẩn đề nghe' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/listening/admin/tests/:id/permanent  (hard delete – xóa vĩnh viễn)
router.delete('/admin/tests/:id/permanent', auth, teacherOnly, async (req, res) => {
  try {
    const test = await ListeningTest.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề nghe' });
    res.json({ success: true, message: 'Đã xóa vĩnh viễn đề nghe' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Upload Audio
// ══════════════════════════════════════════════════════════════════════════════
router.post('/admin/tests/:id/audio', auth, teacherOnly, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'listening',
          public_id: `listening_${req.params.id}_${Date.now()}`,
          overwrite: true
        },
        (err, result) => err ? reject(err) : resolve(result)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const test = await ListeningTest.findByIdAndUpdate(
      req.params.id,
      {
        audioUrl: uploadResult.secure_url,
        audioFileName: req.file.originalname,
        audioDuration: Math.round(uploadResult.duration || 0)
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Upload audio thành công',
      audioUrl: test.audioUrl,
      audioDuration: test.audioDuration
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message });
  }
});

// POST /api/listening/admin/upload-audio  (standalone – no test ID required)
router.post('/admin/upload-audio', auth, teacherOnly, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'listening', public_id: `listening_tmp_${Date.now()}` },
        (err, result) => err ? reject(err) : resolve(result)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    res.json({
      success: true,
      audioUrl: uploadResult.secure_url,
      audioDuration: Math.round(uploadResult.duration || 0),
      originalName: req.file.originalname,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Upload Map/Diagram Image
// ══════════════════════════════════════════════════════════════════════════════
router.post('/admin/upload-map-image', auth, teacherOnly, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu imageBase64' });

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'listening-maps',
      resource_type: 'image'
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload thất bại: ' + err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Transcript (per section)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/admin/tests/:id/transcript', auth, teacherOnly, async (req, res) => {
  try {
    const { sectionTranscripts } = req.body;
    if (!Array.isArray(sectionTranscripts)) {
      return res.status(400).json({ success: false, message: 'sectionTranscripts phải là array' });
    }

    const test = await ListeningTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    sectionTranscripts.forEach(({ partNumber, transcript }) => {
      const section = test.sections.find(s => s.partNumber === partNumber);
      if (section) section.transcript = transcript || '';
    });

    await test.save();
    res.json({ success: true, message: 'Đã cập nhật transcript' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN – Lịch sử tất cả học viên (cho trang admin)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/listening/admin/attempts
router.get('/admin/attempts', auth, teacherOnly, async (req, res) => {
  try {
    const { testId, userId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (testId) filter.testId = testId;
    if (userId) filter.userId = userId;

    const [attempts, total] = await Promise.all([
      ListeningAttempt.find(filter)
        .populate('userId', 'firstName lastName username email')
        .populate('testId', 'name testNumber')
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      ListeningAttempt.countDocuments(filter)
    ]);

    res.json({ success: true, attempts, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/listening/admin/attempts/stats
router.get('/admin/attempts/stats', auth, teacherOnly, async (req, res) => {
  try {
    const { testId } = req.query;
    const match = testId ? { testId: new (require('mongoose').Types.ObjectId)(testId) } : {};

    const [overview, byTest, topStudents] = await Promise.all([
      ListeningAttempt.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            avgBand: { $avg: '$bandScore' },
            avgCorrect: { $avg: '$correctCount' },
            maxBand: { $max: '$bandScore' },
            minBand: { $min: '$bandScore' }
          }
        }
      ]),
      ListeningAttempt.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$testId',
            testName: { $first: '$testName' },
            totalAttempts: { $sum: 1 },
            avgBand: { $avg: '$bandScore' },
            avgCorrect: { $avg: '$correctCount' }
          }
        },
        { $sort: { totalAttempts: -1 } },
        { $limit: 20 }
      ]),
      ListeningAttempt.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$userId',
            bestBand: { $max: '$bandScore' },
            avgBand: { $avg: '$bandScore' },
            attempts: { $sum: 1 }
          }
        },
        { $sort: { bestBand: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            bestBand: 1, avgBand: 1, attempts: 1,
            'user.firstName': 1, 'user.lastName': 1,
            'user.username': 1, 'user.email': 1
          }
        }
      ])
    ]);

    res.json({
      success: true,
      overview: overview[0] || { totalAttempts: 0, avgBand: 0, avgCorrect: 0, maxBand: 0, minBand: 0 },
      byTest,
      topStudents
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Danh sách đề (kèm lịch sử làm bài của user)
// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Bài lẻ practice
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/listening/practice/list?part=1|2|3|4  OR  ?actualTest=true
router.get('/practice/list', auth, async (req, res) => {
  try {
    const isActualTest = req.query.actualTest === 'true';
    let filter, sortBy;
    if (isActualTest) {
      filter  = { isActualTest: true, isActive: true };
      sortBy  = { createdAt: -1 };
    } else {
      const part = parseInt(req.query.part);
      if (![1, 2, 3, 4].includes(part))
        return res.status(400).json({ success: false, message: 'Part không hợp lệ (1–4)' });
      filter = { partNumber: part, isActive: true };
      sortBy = { createdAt: -1 };
    }
    const sections = await ListeningSection.find(filter)
      .select('_id partNumber title description audioDuration isActualTest questionRange questionGroups')
      .sort(sortBy)
      .lean();
    const safe = sections.map(s => ({
      _id:          s._id,
      partNumber:   s.partNumber,
      title:        s.title,
      description:  s.description,
      audioDuration:s.audioDuration,
      questionRange:s.questionRange,
      questionCount:(s.questionGroups || []).reduce((sum, g) => sum + (g.questions?.length || 0), 0),
      questionGroups:(s.questionGroups || []).map(g => ({
        groupType: g.groupType,
        questions: (g.questions || []).map(q => ({ questionNumber: q.questionNumber, type: q.type }))
      }))
    }));
    const sectionIds = sections.map(s => s._id);
    const attemptStats = await ListeningPracticeAttempt.aggregate([
      { $match: { userId: req.user._id, sectionId: { $in: sectionIds } } },
      { $sort: { submittedAt: 1 } },
      { $group: {
        _id:       '$sectionId',
        count:     { $sum: 1 },
        lastScore: { $last: '$correctCount' },
        lastTotal: { $last: '$totalQuestions' },
      }}
    ]);
    const doneMap = {};
    attemptStats.forEach(a => {
      doneMap[a._id.toString()] = { count: a.count, lastScore: a.lastScore, lastTotal: a.lastTotal };
    });
    res.json({ success: true, sections: safe, doneMap });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/listening/practice/by-id/:id
router.get('/practice/by-id/:id', auth, async (req, res) => {
  try {
    const section = await ListeningSection.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!section) return res.status(404).json({ success: false, message: 'Không tìm thấy section' });
    res.json({ success: true, section });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Admin CRUD cho practice sections ──────────────────────────────────────────
router.get('/admin/sections', auth, teacherOnly, async (req, res) => {
  try {
    const sections = await ListeningSection.find().sort({ partNumber: 1, createdAt: -1 });
    res.json({ success: true, sections });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/admin/sections/:id', auth, teacherOnly, async (req, res) => {
  try {
    const s = await ListeningSection.findById(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, section: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/admin/sections', auth, teacherOnly, async (req, res) => {
  try {
    const s = new ListeningSection(req.body);
    await s.save();
    res.json({ success: true, section: s });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/admin/sections/:id', auth, teacherOnly, async (req, res) => {
  try {
    const s = await ListeningSection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, section: s });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/admin/sections/:id', auth, teacherOnly, async (req, res) => {
  try {
    await ListeningSection.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/listening/admin/sections/:id/audio
router.post('/admin/sections/:id/audio', auth, teacherOnly, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'listening-sections', use_filename: true },
        (err, r) => err ? reject(err) : resolve(r)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    const s = await ListeningSection.findByIdAndUpdate(req.params.id, {
      audioUrl:      result.secure_url,
      audioFileName: req.file.originalname,
      audioDuration: Math.round(result.duration || 0)
    }, { new: true });
    res.json({ success: true, audioUrl: result.secure_url, duration: Math.round(result.duration || 0), section: s });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/listening/admin/assemble – tạo ListeningTest từ 4 ListeningSection
// Body: { name, seriesName, testNumber, sectionIds: { "1": id, "2": id, "3": id, "4": id } }
router.post('/admin/assemble', auth, teacherOnly, async (req, res) => {
  try {
    const { name, seriesName, testNumber, sectionIds } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên đề không được để trống' });

    const idMap = sectionIds || {};
    const parts = [1, 2, 3, 4];

    // Fetch tất cả sections được chọn
    const fetched = {};
    for (const part of parts) {
      const sid = idMap[String(part)];
      if (sid) {
        const s = await ListeningSection.findById(sid).lean();
        if (!s) return res.status(404).json({ success: false, message: `Không tìm thấy section Part ${part}` });
        fetched[part] = s;
      }
    }
    if (Object.keys(fetched).length === 0) {
      return res.status(400).json({ success: false, message: 'Chọn ít nhất 1 section' });
    }

    // Xây dựng sections cho ListeningTest
    const defaultRanges = { 1: { start: 1, end: 10 }, 2: { start: 11, end: 20 }, 3: { start: 21, end: 30 }, 4: { start: 31, end: 40 } };
    const builtSections = parts.map(part => {
      const src = fetched[part];
      if (!src) {
        return {
          partNumber: part,
          title: `Part ${part}`,
          description: '',
          transcript: '',
          questionRange: defaultRanges[part],
          questionGroups: [],
        };
      }
      return {
        partNumber:    src.partNumber,
        title:         src.title,
        description:   src.description || '',
        transcript:    src.transcript || '',
        questionRange: src.questionRange || defaultRanges[part],
        questionGroups: (src.questionGroups || []).map(g => {
          const { _id, ...rest } = g;
          return {
            ...rest,
            questions: (g.questions || []).map(q => {
              const { _id: _qid, ...qRest } = q;
              return qRest;
            }),
          };
        }),
      };
    });

    const test = new ListeningTest({
      name,
      seriesName: seriesName || '',
      testNumber: testNumber || 1,
      audioUrl:   '',
      sections:   builtSections,
      isActive:   true,
    });
    await test.save();
    res.json({ success: true, test, message: 'Đã tạo đề Listening từ bài lẻ. Upload audio tại trang Đề Listening.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
router.get('/tests', auth, async (req, res) => {
  try {
    // Dùng aggregation để tính totalParts/totalQuestions mà không cần load section data
    const [tests, attempts] = await Promise.all([
      ListeningTest.aggregate([
        { $match: { isActive: true } },
        { $sort: { testNumber: -1 } },
        { $addFields: {
          totalParts: { $size: { $ifNull: ['$sections', []] } },
          totalQuestions: {
            $sum: {
              $map: {
                input: { $ifNull: ['$sections', []] },
                as: 'sec',
                in: {
                  $sum: {
                    $map: {
                      input: { $ifNull: ['$$sec.questionGroups', []] },
                      as: 'grp',
                      in: { $size: { $ifNull: ['$$grp.questions', []] } }
                    }
                  }
                }
              }
            }
          }
        }},
        { $project: { name: 1, testNumber: 1, seriesName: 1, audioDuration: 1, totalParts: 1, totalQuestions: 1 } }
      ]),
      ListeningAttempt.find({
        userId: req.user._id || req.user.id,
        status: 'completed'
      }).select('testId bandScore correctCount wrongCount skippedCount submittedAt timeTaken').lean()
    ]);

    const attemptMap = {};
    attempts.forEach(a => {
      const key = a.testId.toString();
      if (!attemptMap[key] || attemptMap[key].submittedAt < a.submittedAt) {
        attemptMap[key] = a;
      }
    });

    const list = tests.map(t => ({
      _id: t._id,
      name: t.name,
      testNumber: t.testNumber,
      seriesName: t.seriesName,
      audioDuration: t.audioDuration,
      totalParts: t.totalParts,
      totalQuestions: t.totalQuestions,
      lastAttempt: attemptMap[t._id.toString()] || null
    }));

    res.json({ success: true, tests: list, userPlan: req.user.plan || 'free', planExpiresAt: req.user.planExpiresAt || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lấy full đề để làm bài (yêu cầu Premium)
// POST /api/listening/tests/:id/start
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/start', auth, async (req, res) => {
  try {
    // Kiểm tra quyền: chỉ premium và admin/teacher mới được làm bài
    const isPremium = req.user.plan === 'premium' || ['admin', 'teacher'].includes(req.user.role);
    if (!isPremium) {
      return res.status(403).json({ success: false, message: 'Bạn cần nâng cấp lên Premium để làm bài thi này', code: 'PLAN_REQUIRED' });
    }

    const test = await ListeningTest.findOne({ _id: req.params.id, isActive: true });
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    const sections = test.sections.map(s => ({
      partNumber: s.partNumber,
      title: s.title,
      description: s.description,
      questionRange: s.questionRange,
      questionGroups: s.questionGroups.map(g => ({
        _id: g._id,
        groupType: g.groupType,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        summaryConfig: g.summaryConfig,        // ← THÊM
        matchingOptions: g.matchingOptions,
        matchingReuseAllowed: g.matchingReuseAllowed,
        interchangeableAnswers: g.interchangeableAnswers,
        endingsConfig: g.endingsConfig,
        imageUrl: g.imageUrl,
        questions: g.questions.map(q => ({
          _id: q._id,
          questionNumber: q.questionNumber,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          checkboxCount: q.checkboxCount,
          wordBank: q.wordBank,
          imageUrl: q.imageUrl
          // correctAnswer intentionally omitted
        }))
      }))
    }));

    res.json({
      success: true,
      test: {
        _id: test._id,
        name: test.name,
        audioUrl: test.audioUrl,
        audioDuration: test.audioDuration,
        sections
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Nộp bài, chấm điểm & lưu attempt
// ══════════════════════════════════════════════════════════════════════════════
router.post('/tests/:id/submit', auth, async (req, res) => {
  try {
    const test = await ListeningTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Không tìm thấy đề' });

    const userAnswers = req.body.answers || {};
    const startTime = req.body.startTime ? new Date(req.body.startTime) : null;
    const now = new Date();
    // Cap at test duration so clients cannot report arbitrarily long/short times
    const maxSecs = (test.audioDuration || 40) * 60;
    const timeTaken = startTime
      ? Math.min(Math.max(0, Math.round((now - startTime) / 1000)), maxSecs)
      : 0;

    let correct = 0, wrong = 0, skipped = 0;
    const total = flattenQuestions(test.sections).length;
    const reviewed = [];

    for (const section of test.sections) {
      for (const group of section.questionGroups) {
        const qs = group.questions || [];

        // TFNG/yes-no-ng never uses pool matching — each question has its own fixed answer
        const isTFNG = qs.some(q => ['true-false-ng', 'yes-no-ng'].includes(q.type));

        if (group.interchangeableAnswers && qs.length > 0 && !isTFNG) {
          // Pool matching: mỗi đáp án trong nhóm có thể hoán đổi thứ tự cho nhau
          const correctPool = qs.map(q => (q.correctAnswer || '').trim().toLowerCase());
          const remainingPool = [...correctPool];
          for (const q of qs) {
            const num = q.questionNumber;
            const ua = userAnswers[num] !== undefined ? String(userAnswers[num]).trim() : '';
            const poolIdx = ua ? remainingPool.indexOf(ua.toLowerCase()) : -1;
            const isCorrect = poolIdx !== -1;
            if (isCorrect) remainingPool.splice(poolIdx, 1);
            if (!ua) skipped++;
            else if (isCorrect) correct++;
            else wrong++;
            reviewed.push({ questionNumber: num, userAnswer: ua, correctAnswer: q.correctAnswer.trim(), isCorrect, explanation: q.explanation, type: q.type, questionText: q.questionText, options: q.options, wordBank: q.wordBank, audioTimestamp: q.audioTimestamp });
          }
        } else {
          for (const q of qs) {
            const num = q.questionNumber;
            const ua = userAnswers[num] !== undefined ? String(userAnswers[num]).trim() : '';
            const ca = q.correctAnswer.trim();
            let isCorrect = false;
            if (q.type === 'multi-answer-group') {
              try {
                const uaArr = JSON.parse(ua || '[]').map(x => x.toUpperCase().trim());
                isCorrect = uaArr.includes(ca.toUpperCase().trim());
              } catch { isCorrect = false; }
            } else if (q.type === 'checkbox') {
              try {
                const uaArr = JSON.parse(ua || '[]').map(x => x.toLowerCase().trim()).sort();
                const caArr = JSON.parse(ca || '[]').map(x => x.toLowerCase().trim()).sort();
                isCorrect = JSON.stringify(uaArr) === JSON.stringify(caArr);
              } catch { isCorrect = false; }
            } else {
              const caVariants = ca.split('/').map(v => v.trim().toLowerCase()).filter(Boolean);
              isCorrect = caVariants.includes(ua.toLowerCase());
            }
            if (!ua) skipped++;
            else if (isCorrect) correct++;
            else wrong++;
            reviewed.push({ questionNumber: num, userAnswer: ua, correctAnswer: ca, isCorrect, explanation: q.explanation, type: q.type, questionText: q.questionText, options: q.options, wordBank: q.wordBank, audioTimestamp: q.audioTimestamp });
          }
        }
      }
    }

    const bandScore = calcBandScore(correct);

    const attempt = new ListeningAttempt({
      userId: req.user._id || req.user.id,
      testId: test._id,
      testName: test.name,
      answers: reviewed.map(r => ({
        questionNumber: r.questionNumber,
        userAnswer: r.userAnswer,
        correctAnswer: r.correctAnswer,
        isCorrect: r.isCorrect
      })),
      totalQuestions: total,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      bandScore,
      startTime: startTime || now,
      submittedAt: now,
      timeTaken,
      status: 'completed'
    });
    await attempt.save();

    // Cập nhật streak khi hoàn thành bài thi
    if (req.user.role === 'student') {
      req.user.updateStreak();
      req.user.save().catch(() => {});
    }

    const reviewMap = {};
    reviewed.forEach(r => { reviewMap[r.questionNumber] = r; });

    const reviewSections = test.sections.map(s => ({
      partNumber: s.partNumber,
      title: s.title,
      description: s.description,
      questionRange: s.questionRange,
      transcript: s.transcript || '',
      questionGroups: s.questionGroups.map(g => ({
        groupType: g.groupType,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        summaryConfig: g.summaryConfig,
        matchingOptions: g.matchingOptions,
        matchingReuseAllowed: g.matchingReuseAllowed,
        interchangeableAnswers: g.interchangeableAnswers,
        endingsConfig: g.endingsConfig,
        imageUrl: g.imageUrl,
        questions: g.questions.map(q =>
          reviewMap[q.questionNumber] || { questionNumber: q.questionNumber }
        )
      }))
    }));

    res.json({
      success: true,
      result: {
        attemptId: attempt._id,
        testName: test.name,
        totalQuestions: total,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: skipped,
        bandScore,
        timeTaken,
        questions: reviewed,
        sections: reviewSections,
        audioUrl: test.audioUrl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Lịch sử làm bài của bản thân
// ══════════════════════════════════════════════════════════════════════════════
router.get('/history', auth, async (req, res) => {
  try {
    const attempts = await ListeningAttempt.find({ userId: req.user._id || req.user.id })
      .select('testName bandScore correctCount wrongCount skippedCount totalQuestions timeTaken submittedAt status testId')
      .populate('testId', 'name testNumber')
      .sort({ submittedAt: -1 })
      .limit(50);

    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT – Chi tiết 1 attempt (xem lại bài cũ)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/history/:attemptId', auth, async (req, res) => {
  try {
    const attempt = await ListeningAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user._id || req.user.id
    });
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const test = await ListeningTest.findById(attempt.testId);
    if (!test) return res.status(404).json({ success: false, message: 'Đề thi không tồn tại' });

    const reviewMap = {};
    attempt.answers.forEach(a => { reviewMap[a.questionNumber] = a; });

    const allQuestions = flattenQuestions(test.sections);
    const reviewed = allQuestions.map(q => {
      const saved = reviewMap[q.questionNumber] || {};
      return {
        questionNumber: q.questionNumber,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        wordBank: q.wordBank,
        audioTimestamp: q.audioTimestamp,
        explanation: q.explanation,
        userAnswer: saved.userAnswer || '',
        correctAnswer: saved.correctAnswer || q.correctAnswer,
        isCorrect: saved.isCorrect || false
      };
    });

    const reviewMap2 = {};
    reviewed.forEach(r => { reviewMap2[r.questionNumber] = r; });

    const reviewSections = test.sections.map(s => ({
      partNumber: s.partNumber,
      title: s.title,
      description: s.description,
      questionRange: s.questionRange,
      transcript: s.transcript || '',
      questionGroups: s.questionGroups.map(g => ({
        groupType: g.groupType,
        instruction: g.instruction,
        tableConfig: g.tableConfig,
        noteConfig: g.noteConfig,
        bulletConfig: g.bulletConfig,
        summaryConfig: g.summaryConfig,
        matchingOptions: g.matchingOptions,
        matchingReuseAllowed: g.matchingReuseAllowed,
        interchangeableAnswers: g.interchangeableAnswers,
        endingsConfig: g.endingsConfig,
        imageUrl: g.imageUrl,
        questions: g.questions.map(q =>
          reviewMap2[q.questionNumber] || { questionNumber: q.questionNumber }
        )
      }))
    }));

    res.json({
      success: true,
      result: {
        attemptId: attempt._id,
        testName: attempt.testName,
        bandScore: attempt.bandScore,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        skippedCount: attempt.skippedCount,
        totalQuestions: attempt.totalQuestions,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
        questions: reviewed,
        sections: reviewSections,
        audioUrl: test.audioUrl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/listening/practice/save
// ─────────────────────────────────────────────────────────────────────────────
router.post('/practice/save', auth, async (req, res) => {
  try {
    const { sectionId, sectionTitle, partNumber, answers, timeTaken } = req.body;
    if (!sectionId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }

    // Server-side grading: fetch section and re-grade independently of client
    const section = await ListeningSection.findById(sectionId).lean();
    if (!section) return res.status(404).json({ success: false, message: 'Không tìm thấy section' });

    // Build userAnswer map: questionNumber → userAnswer string
    const uaMap = {};
    for (const a of answers) uaMap[a.questionNumber] = (a.userAnswer || '').trim();

    let correct = 0, wrong = 0, skipped = 0;
    const gradedAnswers = [];

    for (const group of section.questionGroups || []) {
      const qs = group.questions || [];
      // TFNG/yes-no-ng never uses pool matching — each question has its own fixed answer
      const isTFNGPr = qs.some(q => ['true-false-ng', 'yes-no-ng'].includes(q.type));
      if (group.interchangeableAnswers && qs.length > 0 && !isTFNGPr) {
        const remainingPool = qs.map(q => (q.correctAnswer || '').trim().toLowerCase());
        for (const q of qs) {
          const ua = uaMap[q.questionNumber] || '';
          const poolIdx = ua ? remainingPool.indexOf(ua.toLowerCase()) : -1;
          const isCorrect = poolIdx !== -1;
          if (isCorrect) remainingPool.splice(poolIdx, 1);
          if (!ua) skipped++; else if (isCorrect) correct++; else wrong++;
          gradedAnswers.push({ questionNumber: q.questionNumber, userAnswer: ua, correctAnswer: q.correctAnswer || '', isCorrect });
        }
      } else {
        for (const q of qs) {
          const ua = uaMap[q.questionNumber] || '';
          const ca = (q.correctAnswer || '').trim();
          let isCorrect = false;
          if (!ua) {
            skipped++;
          } else if (q.type === 'multi-answer-group') {
            try {
              const uaArr = JSON.parse(ua || '[]').map(x => x.toUpperCase().trim());
              isCorrect = uaArr.includes(ca.toUpperCase().trim());
            } catch { isCorrect = false; }
            if (isCorrect) correct++; else wrong++;
          } else if (q.type === 'checkbox') {
            try {
              const uaArr = JSON.parse(ua || '[]').map(x => x.toLowerCase().trim()).sort();
              const caArr = JSON.parse(ca || '[]').map(x => x.toLowerCase().trim()).sort();
              isCorrect = JSON.stringify(uaArr) === JSON.stringify(caArr);
            } catch { isCorrect = false; }
            if (isCorrect) correct++; else wrong++;
          } else {
            const caVariants = ca.split('/').map(v => v.trim().toLowerCase()).filter(Boolean);
            isCorrect = caVariants.includes(ua.toLowerCase());
            if (isCorrect) correct++; else wrong++;
          }
          gradedAnswers.push({ questionNumber: q.questionNumber, userAnswer: ua, correctAnswer: ca, isCorrect });
        }
      }
    }

    const attempt = await ListeningPracticeAttempt.create({
      userId:         req.user._id,
      sectionId,
      sectionTitle:   sectionTitle || section.title || '',
      partNumber:     partNumber || section.partNumber || 1,
      answers:        gradedAnswers,
      totalQuestions: gradedAnswers.length,
      correctCount:   correct,
      wrongCount:     wrong,
      skippedCount:   skipped,
      timeTaken:      timeTaken || 0,
      submittedAt:    new Date()
    });
    res.json({ success: true, attemptId: attempt._id, correctCount: correct, totalQuestions: gradedAnswers.length });
  } catch (err) {
    console.error('[Listening practice save]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/listening/practice/history
// ─────────────────────────────────────────────────────────────────────────────
router.get('/practice/history', auth, async (req, res) => {
  try {
    const attempts = await ListeningPracticeAttempt.find({ userId: req.user._id })
      .select('-answers')
      .sort({ submittedAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, attempts });
  } catch (err) {
    console.error('[Listening practice history]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/listening/practice/history/:attemptId
// Chi tiết 1 lần luyện – trả về attempt + section đầy đủ (để render review)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/practice/history/:attemptId', auth, async (req, res) => {
  try {
    const attempt = await ListeningPracticeAttempt.findOne({
      _id:    req.params.attemptId,
      userId: req.user._id
    }).lean();
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const section = await ListeningSection.findById(attempt.sectionId).lean();
    res.json({ success: true, attempt, section });
  } catch (err) {
    console.error('[Listening practice history detail]', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;