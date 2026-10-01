'use strict';

/**
 * proctorPolicy — the rules every proctored flow shares: Test Simulation
 * (examSimulationService), the 4-skill Full Mock Test (mockTestService) and
 * the Entrance Test (entranceTestService). Each of those keeps its own
 * recordViolation() (different models, response extras, cooldown fields);
 * this module only holds what must be identical across them.
 */

// The 3rd strike voids the attempt — in every proctored flow (product
// decision 2026-10-01; Simulation used to allow 5, the Mock Test 10).
const MAX_VIOLATIONS = 3;

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

// Screenshots taken (via the student's shared screen) right after a strike.
const SHOT_CAP = 30;
// A screenshot is only accepted shortly after a recorded strike — the
// upload endpoint must not become a free image host.
const SHOT_WINDOW_MS = 2 * 60 * 1000;
const SHOT_MAX_BYTES = 1.5 * 1024 * 1024;
const SHOT_DATA_URL = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/;

module.exports = {
  MAX_VIOLATIONS,
  PROCTOR_TYPES,
  PROCTOR_EVENT_CAP,
  DEDUPE_WINDOW_MS,
  isDuplicateEvent,
  SHOT_CAP,
  SHOT_WINDOW_MS,
  SHOT_MAX_BYTES,
  SHOT_DATA_URL,
};
