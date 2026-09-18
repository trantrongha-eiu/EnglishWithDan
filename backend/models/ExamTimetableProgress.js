'use strict';

const mongoose = require('mongoose');
const guardAgainstMassDelete = require('../utils/guardAgainstMassDelete');

// One doc per student, tracking their own progress through the static
// "7-week final exam timetable" reference plan shown on
// reading-listening-strategy.html. `checklist` keys are plan-authored
// session ids (e.g. "w1-class1", "w3-home2") — deliberately a free-form
// Map rather than an enum, since the plan content lives in the frontend
// HTML, not the DB. Self-reported, like VocabBook/DifficultWord — kept out
// of the 3-month TTL data-retention sweep on purpose (see
// data_retention_policy in project memory): a student's own curated exam
// log shouldn't vanish just because they went quiet for a season.
const TestLogSchema = new mongoose.Schema({
  skill:    { type: String, enum: ['reading', 'listening', 'writing', 'speaking', 'full'], required: true },
  label:    { type: String, default: '', trim: true, maxlength: 120 },
  week:     { type: Number, min: 1, max: 7, default: null },
  date:     { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
  mistake:  { type: String, default: '', trim: true, maxlength: 500 },
}, { timestamps: true });

const ExamTimetableProgressSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  checklist: { type: Map, of: Boolean, default: {} },
  testLogs:  { type: [TestLogSchema], default: [] },
}, { timestamps: true });

ExamTimetableProgressSchema.plugin(guardAgainstMassDelete);

module.exports = mongoose.model('ExamTimetableProgress', ExamTimetableProgressSchema);
