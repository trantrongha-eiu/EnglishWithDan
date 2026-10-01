// Shared "proctor" sub-schema shape, embedded (not referenced) into every
// attempt model that supports Test Simulation mode — Reading (TestAttempt,
// ReadingPracticeAttempt), Listening (ListeningAttempt,
// ListeningPracticeAttempt), Writing (WritingAttempt) — and the Entrance
// Test (EntranceTestAttempt). MockTestAttempt keeps its own copy of this
// shape (its events also carry `skill`). Intentionally a plain schema
// definition object (not its own model) — every consumer does
// `proctor: require('./shared/proctorSchema')` inline in its own schema.
const { PROCTOR_TYPES } = require('../../services/proctorPolicy');

// A screenshot of the student's shared screen, taken ~1s after a strike so
// the teacher can see what they switched to. `type` is the strike it
// belongs to.
const shotDefinition = {
  type: [{
    url: { type: String, required: true },
    publicId: { type: String },
    type: { type: String, enum: PROCTOR_TYPES },
    skill: { type: String },
    at: { type: Date, default: Date.now }
  }],
  default: []
};

module.exports = {
  violationCount: { type: Number, default: 0 },
  violated: { type: Boolean, default: false },
  events: {
    type: [{
      type: { type: String, enum: PROCTOR_TYPES, required: true },
      // 'screen' = a screen share was live, so a screenshot should follow;
      // 'unsupported' = the device can't share its screen (phones/tablets).
      capture: { type: String, enum: ['screen', 'unsupported', 'none'] },
      at: { type: Date, default: Date.now }
    }],
    default: []
  },
  shots: shotDefinition,
  // Set once violationCount reaches proctorPolicy.MAX_VIOLATIONS and the
  // attempt is voided — informational only; the cooldown lock lives on the
  // User document.
  disqualifiedAt: { type: Date }
};
