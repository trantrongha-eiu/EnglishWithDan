'use strict';
// Admin monitoring for the full 4-skill mock test (MockTestAttempt).
//
// The full mock had no admin surface at all: runs, the two-sitting
// progress, the overall band, and the client-side proctoring log ("gậy" =
// tab-switch count, `proctor.violated`) were all written to the DB and
// never read back by a teacher. This exposes them read-only — every write
// (start / advance / violation) still happens on the student routes in
// backend/routes/mockTest.js.

const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const mockTestService = require('../../services/mockTestService');

const router = express.Router();

// GET /api/admin/mock-tests — every student's mock runs, newest first.
// ?userId= scopes to one student (StudentDetail deep-link), ?status=,
// ?violatedOnly=1 filter; ?page= / ?limit= paginate. `violatedTotal` is
// the unfiltered count of flagged runs, used for the sidebar badge via
// ?limit=1&violatedOnly=1.
router.get('/mock-tests', auth, teacherOnly, async (req, res) => {
  try {
    const data = await mockTestService.getAdminHistory({
      page: req.query.page,
      limit: req.query.limit,
      userId: req.query.userId || null,
      status: req.query.status || null,
      violatedOnly: req.query.violatedOnly === '1' || req.query.violatedOnly === 'true'
    });
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('[admin/mock-tests]', err);
    res.status(500).json({ success: false, message: 'Lỗi tải lịch sử thi thử' });
  }
});

// PUT /api/admin/mock-tests/:id/scores — a teacher types in / corrects a
// run's skill bands (e.g. they ran the Speaking part live, in person). Body:
//   { steps: { listening?, reading?, writing?, speaking? }, note? }
// A number pins that skill (0–9, step 0.5) and marks it manual so the lazy
// re-grade never overwrites it; null clears the override. Overall band is
// recomputed with the standard IELTS rounding. Never touches sub-attempts.
router.put('/mock-tests/:id/scores', auth, teacherOnly, async (req, res) => {
  try {
    const { steps, note } = req.body || {};
    const attempt = await mockTestService.setManualScores(req.params.id, {
      steps: steps && typeof steps === 'object' ? steps : {},
      note: typeof note === 'string' ? note : undefined,
      actorId: req.user._id,
      actorName: req.user.username || String(req.user._id)
    });
    res.json({ success: true, attempt });
  } catch (err) {
    const code = err && err.statusCode ? err.statusCode : 500;
    if (code >= 500) console.error('[admin/mock-tests/:id/scores]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi lưu điểm thi thử' });
  }
});

// DELETE /api/admin/mock-tests/:id — remove a run from the monitor (soft
// delete: status → 'deleted', recoverable in the DB; the four per-skill
// sub-attempts stay in their own histories). teacherOnly already 403s
// teachers on any DELETE, so this is admin-only in practice.
router.delete('/mock-tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const result = await mockTestService.deleteRun(req.params.id, req.user._id);
    res.json({ success: true, ...result });
  } catch (err) {
    const code = err && err.statusCode ? err.statusCode : 500;
    if (code >= 500) console.error('[admin/mock-tests DELETE]', err);
    res.status(code).json({ success: false, message: err.message || 'Lỗi xoá lượt thi thử' });
  }
});

// GET /api/admin/mock-tests/:id — one run with the full proctor event log.
router.get('/mock-tests/:id', auth, teacherOnly, async (req, res) => {
  try {
    const attempt = await mockTestService.getAdminHistoryDetail(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy lượt thi thử' });
    res.json({ success: true, attempt });
  } catch (err) {
    console.error('[admin/mock-tests/:id]', err);
    res.status(500).json({ success: false, message: 'Lỗi tải chi tiết thi thử' });
  }
});

module.exports = router;
