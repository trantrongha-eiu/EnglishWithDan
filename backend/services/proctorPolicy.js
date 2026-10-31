'use strict';

/**
 * proctorPolicy — the rules every proctored flow shares: Test Simulation
 * (examSimulationService), the 4-skill Full Mock Test (mockTestService) and
 * the Entrance Test (entranceTestService). Each of those keeps its own
 * recordViolation() (different models, response extras, cooldown fields);
 * this module only holds what must be identical across them.
 */

// The 5th strike voids the attempt — in every proctored flow. Was 3
// (2026-10-01) until 2026-10-14: the browser's own screen-share bar
// ("Ẩn" / "Dừng chia sẻ") sits over the exam, and clicking it registers as
// leaving the page, so 3 strikes cost students attempts they didn't mean
// to throw away.
const MAX_VIOLATIONS = 5;

// 'share-stopped' = the student ended the mandatory screen share mid-test.
const PROCTOR_TYPES = ['hidden', 'blur', 'unload-attempt', 'share-stopped'];
const PROCTOR_EVENT_CAP = 200;

// One real "left the exam" moment often fires several browser events within
// a second or two (closing/reloading the tab = beforeunload + visibility
// hidden; alt-tab = blur + hidden). The client dedupes its own events, but
// 'unload-attempt' bypassed that and a reload cost two strikes. Anything
// within this window of the previous recorded event is the same absence.
const DEDUPE_WINDOW_MS = 3000;

function isDuplicateEvent(events, now = Date.now()) {
  const last = events && events.length ? events[events.length - 1] : null;
  return !!(last && last.at && now - new Date(last.at).getTime() < DEDUPE_WINDOW_MS);
}

// A voided attempt still gets the student's answers saved once (graded, but
// kept 'disqualified' — no streak, badges or review), so the teacher sees how
// far they got. The page sends them right after the disqualifying strike;
// this window only stops a much later replay.
const DQ_ANSWER_WINDOW_MS = 15 * 60 * 1000;

// Mongo filter for that one-time save. Matches the student's own attempt
// when it is either a Simulation run voided within the window, or still
// 'in-progress' (a Full Mock Test sub-attempt — the mock wrapper is what got
// voided; self-voiding your own open attempt gains nothing). Callers add
// { _id, userId } and set status 'disqualified' + proctor.answersSavedAt.
function disqualifiedAnswerFilter(now = Date.now()) {
  return {
    'proctor.answersSavedAt': null,
    $or: [
      { status: 'disqualified', mode: 'simulation', 'proctor.disqualifiedAt': { $gte: new Date(now - DQ_ANSWER_WINDOW_MS) } },
      { status: 'in-progress' },
    ],
  };
}

// Admin/teacher accounts (utils/roles.isStaff) are never proctored: the
// violation endpoints answer with this instead of recording a strike — no
// voided attempt, no cooldown. The page doesn't report them in the first
// place (shared/proctor-engine.js); this is the backstop.
const STAFF_NO_STRIKE = Object.freeze({
  violationCount: 0, violated: false, disqualified: false, cooldownSeconds: 0, staff: true,
});

// Screenshots taken (via the student's shared screen) right after a strike.
const SHOT_CAP = 30;
// A screenshot is only accepted shortly after a recorded strike — the
// upload endpoint must not become a free image host.
const SHOT_WINDOW_MS = 2 * 60 * 1000;
const SHOT_MAX_BYTES = 1.5 * 1024 * 1024;
const SHOT_DATA_URL = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/;
// Screenshots are deleted (stored image + attempt entry) this long after they were
// taken, so the image store doesn't fill up — cron/proctorShotCleanup.js.
const SHOT_RETENTION_DAYS = 30;
const SHOT_FOLDER = 'proctor-shots';

module.exports = {
  MAX_VIOLATIONS,
  PROCTOR_TYPES,
  PROCTOR_EVENT_CAP,
  DEDUPE_WINDOW_MS,
  isDuplicateEvent,
  DQ_ANSWER_WINDOW_MS,
  disqualifiedAnswerFilter,
  STAFF_NO_STRIKE,
  SHOT_CAP,
  SHOT_WINDOW_MS,
  SHOT_MAX_BYTES,
  SHOT_DATA_URL,
  SHOT_RETENTION_DAYS,
  SHOT_FOLDER,
};
