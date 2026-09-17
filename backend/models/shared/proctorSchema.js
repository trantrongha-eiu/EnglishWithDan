// Shared "proctor" sub-schema shape, embedded (not referenced) into every
// attempt model that supports Test Simulation mode — Reading (TestAttempt,
// ReadingPracticeAttempt), Listening (ListeningAttempt,
// ListeningPracticeAttempt), Writing (WritingAttempt). Mirrors
// MockTestAttempt's own `proctor` sub-doc shape exactly (see
// backend/models/MockTestAttempt.js) so services/examSimulationService.js's
// recordViolation() can reuse the same event-log/violation-count logic and
// the frontend's exam-proctor.js can reuse the same response-shape handling
// as the existing mock-test.js proctor. Intentionally a plain schema
// definition object (not its own model) — every consumer does
// `proctor: require('./shared/proctorSchema')` inline in its own schema,
// same pattern MockTestAttempt.js uses for its embedded stepSchema.
module.exports = {
  violationCount: { type: Number, default: 0 },
  violated: { type: Boolean, default: false },
  events: {
    type: [{
      type: { type: String, enum: ['hidden', 'blur', 'unload-attempt'], required: true },
      at: { type: Date, default: Date.now }
    }],
    default: []
  },
  // Set once violationCount first exceeds examSimulationService.MAX_VIOLATIONS
  // and the attempt is voided — informational only; the actual 5-minute
  // cooldown lock lives on User.simulationCooldownUntil (global across all
  // 3 skills, not per-attempt).
  disqualifiedAt: { type: Date }
};
