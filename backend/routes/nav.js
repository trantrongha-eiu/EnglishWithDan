// GET /api/nav/summary — everything nav.js needs on a page load, in ONE
// request. nav.js used to fire ~12 separate calls on every page (inbox
// badge, writing badges, tuition, Task 2 drafts, attendance/homework
// banners, /auth/me, vocab-goal nudge); each paid its own CORS preflight,
// auth middleware User lookup and lastSeen write, and the browser→API
// round trip is the slow part for students in Vietnam.
//
// Each part runs the EXISTING controller handler in-process against a
// capturing res, so the payloads are byte-for-byte what the standalone
// endpoints return (nav.js parses them unchanged) and there is no second
// copy of their logic to drift. Parts run in parallel; a part whose handler
// fails or answers non-2xx comes back as null and nav.js falls back to that
// part's own endpoint. The standalone endpoints stay — the inbox poll and
// other pages still call them directly.
const router = require('express').Router();
const auth = require('../middleware/auth');
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');
const writingCtrl = require('../controllers/writing.controller');
const tuitionCtrl = require('../controllers/tuition.controller');
const task2Ctrl = require('../controllers/task2Practice.controller');
const attendanceCtrl = require('../controllers/classAttendance.controller');
const assignmentCtrl = require('../controllers/assignment.controller');
const vocabBookCtrl = require('../controllers/vocabBook.controller');
const vocabCtrl = require('../controllers/vocab.controller');

// key → handler. Keys are what nav.js reads (js/nav.js _navPart()).
const PARTS = {
  me:                  authCtrl.me,
  unreadMessages:      userCtrl.getUnreadMessageCount,
  writingFeedback:     writingCtrl.getUnreadFeedbackCount,
  writingNavCounts:    writingCtrl.getPracticeNavCounts,
  tuitionSummary:      tuitionCtrl.getMySummary,
  task2Drafts:         task2Ctrl.listDrafts,
  attendanceStatus:    attendanceCtrl.myAttendanceStatus,
  homeworkSummary:     assignmentCtrl.myHomeworkSummary,
  vocabDailyGoal:      vocabBookCtrl.getDailyGoal,
  paraphraseDueCount:  vocabCtrl.paraphraseDueCount,
};

// A guest (Entrance Test) token only ever had /auth/me among these.
const GUEST_PARTS = ['me'];

// A part that hasn't answered by then is dropped (null) rather than
// holding up every other badge.
const PART_TIMEOUT_MS = 8000;

// Runs an Express (req, res) handler and resolves with its JSON body, or
// null on a non-2xx status / thrown error / timeout. Only the bits of `res`
// these handlers use (status, json) are provided.
function runPart(handler, req) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), PART_TIMEOUT_MS);
    const done = (body) => { clearTimeout(timer); resolve(body); };
    let status = 200;
    const res = {
      status(code) { status = code; return res; },
      json(body) { done(status >= 200 && status < 300 ? body : null); return res; },
    };
    Promise.resolve()
      .then(() => handler(req, res, () => done(null)))
      .catch(() => done(null));
  });
}

router.get('/summary', auth, async (req, res) => {
  const keys = req.user.role === 'guest' ? GUEST_PARTS : Object.keys(PARTS);
  const bodies = await Promise.all(keys.map((k) => runPart(PARTS[k], req)));
  const out = { success: true };
  keys.forEach((k, i) => { out[k] = bodies[i]; });
  res.set('Cache-Control', 'private, no-store');
  res.json(out);
});

module.exports = router;
