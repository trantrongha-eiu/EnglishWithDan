// Test-data builders for the teacher class-management feature — mirrors
// userFactory.js / contentFactory.js style. Return real saved Mongoose docs.
const ClassGroup = require('../../models/ClassGroup');
const ClassEnrollment = require('../../models/ClassEnrollment');
const ClassSession = require('../../models/ClassSession');
const AttendanceRecord = require('../../models/AttendanceRecord');
const svc = require('../../services/classAttendanceService');

let counter = 0;
function unique(prefix) {
  counter += 1;
  return `${prefix}${Date.now()}${counter}`;
}

async function createClassGroup(overrides = {}) {
  const { teacher, teacherId, policy, ...rest } = overrides;
  return ClassGroup.create({
    name: rest.name || unique('Lớp '),
    teacherId: teacherId || teacher?._id,
    createdBy: teacherId || teacher?._id,
    totalSessions: rest.totalSessions ?? 40,
    policy: policy || {},
    ...rest,
  });
}

async function enrollStudent(classGroup, student, overrides = {}) {
  const e = await ClassEnrollment.create({
    classId: classGroup._id,
    studentId: student._id,
    ...overrides,
  });
  return e;
}

// daysAgo: positive = past, negative = future.
async function createSession(classGroup, overrides = {}) {
  const { daysAgo = 1, ...rest } = overrides;
  const date = rest.date || new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  let sessionNumber = rest.sessionNumber;
  if (!sessionNumber) {
    const last = await ClassSession.findOne({ classId: classGroup._id }).sort({ sessionNumber: -1 }).lean();
    sessionNumber = (last?.sessionNumber || 0) + 1;
  }
  return ClassSession.create({
    classId: classGroup._id,
    sessionNumber,
    date,
    status: rest.status || 'held',
    type: rest.type || 'regular',
    makeupForSessionId: rest.makeupForSessionId || null,
    ...rest,
  });
}

async function markAttendance(session, enrollment, status, overrides = {}) {
  return AttendanceRecord.create({
    sessionId: session._id,
    classId: session.classId,
    enrollmentId: enrollment._id,
    studentId: enrollment.studentId,
    status,
    ...overrides,
  });
}

// Convenience: build a class + one student + N held past sessions with the
// given marks, then refresh stats. marks = array of status strings.
async function seedAttendance({ teacher, student, policy, marks = [] }) {
  const classGroup = await createClassGroup({ teacher, policy });
  const enrollment = await enrollStudent(classGroup, student);
  const sessions = [];
  for (let i = 0; i < marks.length; i++) {
    const s = await createSession(classGroup, { daysAgo: marks.length - i });
    await markAttendance(s, enrollment, marks[i]);
    sessions.push(s);
  }
  await svc.refreshClass(classGroup._id);
  return { classGroup, enrollment, sessions };
}

// ── Assignments ──────────────────────────────────────────────────────
const Assignment = require('../../models/Assignment');
const TestAttempt = require('../../models/TestAttempt');
const ListeningPracticeAttempt = require('../../models/ListeningPracticeAttempt');

async function createAssignment(classGroup, overrides = {}) {
  return Assignment.create({
    classId: classGroup._id,
    teacherId: overrides.teacherId || classGroup.teacherId,
    createdBy: overrides.createdBy || classGroup.teacherId,
    title: overrides.title || unique('Homework '),
    instruction: overrides.instruction || '',
    deadline: overrides.deadline === undefined ? new Date(Date.now() + 3 * 864e5) : overrides.deadline,
    resources: overrides.resources || [
      { kind: 'external', url: 'https://bbc.co.uk/learningenglish', title: 'BBC Listening' },
    ],
    status: overrides.status || 'active',
  });
}

// Write the attempt doc that makes an internal resource count as "completed"
// for a student. Supports the two types the integration test exercises.
async function seedInternalCompletion(type, { studentId, resourceId }) {
  if (type === 'reading_test') {
    return TestAttempt.create({ userId: studentId, testId: resourceId, status: 'completed', endTime: new Date() });
  }
  if (type === 'listening_practice') {
    return ListeningPracticeAttempt.create({ userId: studentId, sectionId: resourceId, submittedAt: new Date() });
  }
  throw new Error(`seedInternalCompletion: unsupported type ${type}`);
}

module.exports = {
  createClassGroup,
  enrollStudent,
  createSession,
  markAttendance,
  seedAttendance,
  createAssignment,
  seedInternalCompletion,
  unique,
};
