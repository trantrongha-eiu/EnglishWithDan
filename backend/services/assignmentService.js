'use strict';

// Assignment status derivation + the student "my homework" aggregate.
// Internal-resource completion comes from resourceCompletionService (real
// attempt history); external/image items are the student's manual ticks
// stored on AssignmentProgress. Progress is keyed by studentId so a
// student removed then re-added to a class keeps it.

const Assignment = require('../models/Assignment');
const AssignmentProgress = require('../models/AssignmentProgress');
const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const User = require('../models/User');
const rcs = require('./resourceCompletionService');
// From utils/, not classAttendanceService — that service now depends on THIS
// module (to fold homework misses into the auto status), so this can't
// depend back on it without a require cycle.
const { withPolicyDefaults } = require('../utils/classPolicy');

const DEADLINE_SOON_MS = 24 * 60 * 60 * 1000;

function itemIsInternal(r) {
  return r.kind === 'internal';
}

// derive one assignment's status for a student from its resources + progress items
function deriveAssignmentStatus(assignment, completedItemIds, now = new Date()) {
  const total = assignment.resources.length;
  const done = assignment.resources.filter((r) => completedItemIds.has(String(r._id))).length;
  const overdue = assignment.deadline && new Date(assignment.deadline).getTime() < now.getTime();
  let status;
  if (total > 0 && done >= total) status = 'completed';
  else if (overdue) status = 'overdue';
  else if (done > 0) status = 'in_progress';
  else status = 'not_started';
  return { status, done, total };
}

// ── Student: all my homework across my active classes ──────────────────
// `persist` (only from GET /api/assignments/mine, not the nav.js summary or
// the cron) writes an accurate completedCount/allCompletedAt back onto each
// AssignmentProgress — a redundant-write guard means a steady-state load
// does zero writes. This is what keeps the teacher's "X/Y hoàn thành"
// rollup honest for assignments made only of internal resources, where the
// student never ticks anything.
async function getStudentAssignments(studentId, now = new Date(), { persist = false } = {}) {
  const enrollments = await ClassEnrollment.find({ studentId, removedAt: null }).lean();
  if (!enrollments.length) return { assignments: [], homeworkWarning: null, hasClasses: false };

  const enrollByClass = new Map(enrollments.map((e) => [String(e.classId), e]));
  const classIds = enrollments.map((e) => e.classId);
  const [classes, assignments] = await Promise.all([
    ClassGroup.find({ _id: { $in: classIds } }).select('name policy teacherId').lean(),
    Assignment.find({ classId: { $in: classIds }, status: 'active' }).sort({ createdAt: -1 }).lean(),
  ]);
  const classMap = new Map(classes.map((c) => [String(c._id), c]));
  const teachers = await User.find({ _id: { $in: classes.map((c) => c.teacherId) } }).select('username firstName lastName').lean();
  const teacherMap = new Map(teachers.map((t) => [String(t._id), t]));

  // one batched completion check across every internal item of every assignment
  const allInternal = [];
  for (const a of assignments) {
    for (const r of a.resources) if (r.kind === 'internal') allInternal.push({ resourceType: r.resourceType, resourceId: r.resourceId });
  }
  // group completion by (assignment.createdAt as `since`) — simplest correct
  // approach is per-assignment, but batching by type still helps: we pass the
  // EARLIEST assignment createdAt as `since`, then filter per assignment below.
  const earliest = assignments.reduce((min, a) => (a.createdAt < min ? a.createdAt : min), now);
  const completionMap = await rcs.checkCompleted(studentId, allInternal, earliest);

  const stored = await AssignmentProgress.find({ studentId, assignmentId: { $in: assignments.map((a) => a._id) } }).lean();
  const storedMap = new Map(stored.map((p) => [String(p.assignmentId), p]));

  const rows = [];
  let incompleteCount = 0;
  let nearestDeadline = null;

  for (const a of assignments) {
    const cls = classMap.get(String(a.classId));
    const enr = enrollByClass.get(String(a.classId));
    if (!cls || !enr) continue;

    const manualCompleted = new Set(
      (storedMap.get(String(a._id))?.items || []).filter((it) => it.source === 'manual' && it.status === 'completed').map((it) => String(it.resourceItemId))
    );
    const completedItemIds = new Set(manualCompleted);
    const resourcesShaped = a.resources.map((r) => {
      let completed = false, completedAt = null, autoTracked = itemIsInternal(r);
      if (autoTracked) {
        const hit = completionMap.get(rcs.resourceKey(r.resourceType, r.resourceId));
        // only count if completed at/after THIS assignment's createdAt
        if (hit && hit.completed && new Date(hit.completedAt) >= new Date(a.createdAt)) {
          completed = true; completedAt = hit.completedAt;
        }
      } else {
        completed = manualCompleted.has(String(r._id));
      }
      if (completed) completedItemIds.add(String(r._id));
      return {
        itemId: r._id, kind: r.kind, autoTracked, completed, completedAt,
        resourceType: r.resourceType || null, resourceId: r.resourceId || null, resourceCode: r.resourceCode || '',
        label: r.label || r.title || '', url: r.url || '', description: r.description || '',
        images: r.images || [], title: r.title || '', instruction: r.instruction || '',
      };
    });

    const { status, done, total } = deriveAssignmentStatus(a, completedItemIds, now);
    if (status !== 'completed') incompleteCount += 1;
    if (a.deadline && status !== 'completed') {
      const dl = new Date(a.deadline);
      if (dl >= now && (!nearestDeadline || dl < nearestDeadline)) nearestDeadline = dl;
    }

    rows.push({
      _id: a._id, title: a.title, instruction: a.instruction,
      className: cls.name, classId: a.classId,
      teacherName: displayNameOf(teacherMap.get(String(cls.teacherId))),
      deadline: a.deadline, createdAt: a.createdAt,
      status, done, total, resources: resourcesShaped,
    });
  }

  // priority sort: (1) not-done + nearest deadline, (2) in progress, (3) overdue, (4) completed
  const rank = { in_progress: 1, not_started: 1, overdue: 3, completed: 4 };
  rows.sort((x, y) => {
    const rx = x.status === 'not_started' ? 1 : rank[x.status];
    const ry = y.status === 'not_started' ? 1 : rank[y.status];
    if (rx !== ry) return rx - ry;
    const dx = x.deadline ? new Date(x.deadline).getTime() : Infinity;
    const dy = y.deadline ? new Date(y.deadline).getTime() : Infinity;
    if (dx !== dy) return dx - dy;
    return new Date(y.createdAt) - new Date(x.createdAt);
  });

  // Write back an accurate cache (scalars only — never touch items[]).
  if (persist && rows.length) {
    const bySavedId = storedMap;
    await Promise.all(rows.map((r) => {
      const prev = bySavedId.get(String(r._id));
      const wantAllDone = r.status === 'completed';
      const sameCount = prev && prev.completedCount === r.done && prev.totalCount === r.total;
      const sameAllDone = prev && (!!prev.allCompletedAt) === wantAllDone;
      if (prev && sameCount && sameAllDone) return null; // nothing changed
      const set = {
        classId: r.classId,
        completedCount: r.done,
        totalCount: r.total,
        lastRecomputedAt: now,
      };
      if (!wantAllDone) set.allCompletedAt = null;
      else if (!prev || !prev.allCompletedAt) set.allCompletedAt = now;
      return AssignmentProgress.updateOne(
        { assignmentId: r._id, studentId },
        { $set: set, $setOnInsert: { assignmentId: r._id, studentId } },
        { upsert: true },
      ).catch(() => {});
    }));
  }

  // homework warning — threshold is per-class; use the strictest class the
  // student is over the line in (report against that class's policy).
  let homeworkWarning = null;
  const missedByClass = new Map();
  for (const r of rows) if (r.status === 'overdue') missedByClass.set(String(r.classId), (missedByClass.get(String(r.classId)) || 0) + 1);
  for (const [cid, n] of missedByClass) {
    const cls = classMap.get(cid);
    const thr = withPolicyDefaults(cls?.policy).homeworkMissThreshold;
    if (n >= thr) {
      if (!homeworkWarning || n > homeworkWarning.missedCount) {
        homeworkWarning = { classId: cid, missedCount: n, threshold: thr, className: cls?.name || '', incompleteCount, nearestDeadline };
      }
    }
  }

  return { assignments: rows, homeworkWarning, hasClasses: true };
}

// ── Live "how many assignments is this student currently behind on, in this
//    one class" — sourced from getStudentAssignments's per-assignment rows.
//    Used by classAttendanceService (refreshClass/refreshEnrollment) to fold
//    homework misses into the enrollment's warning/failed status, alongside
//    attendance. Recomputed fresh every call, same as the rest of that
//    status machinery — a teacher extending a deadline or archiving an
//    assignment lowers this number on the next refresh.
async function getOverdueCountForClass(studentId, classId, now = new Date()) {
  const { assignments } = await getStudentAssignments(studentId, now);
  return assignments.filter((a) => a.status === 'overdue' && String(a.classId) === String(classId)).length;
}

function displayNameOf(u) {
  if (!u) return '';
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return full || u.username || '';
}

// lightweight version for nav.js
async function getStudentHomeworkSummary(studentId, now = new Date()) {
  const { assignments, homeworkWarning, hasClasses } = await getStudentAssignments(studentId, now);
  const incomplete = assignments.filter((a) => a.status !== 'completed');
  const overdue = assignments.filter((a) => a.status === 'overdue');
  const next = incomplete
    .filter((a) => a.deadline && new Date(a.deadline) >= now)
    .sort((x, y) => new Date(x.deadline) - new Date(y.deadline))[0] || null;
  return {
    hasClasses,
    incompleteCount: incomplete.length,
    overdueCount: overdue.length,
    nearestDeadline: next ? next.deadline : null,
    nearestTitle: next ? next.title : null,
    warn: !!homeworkWarning,
    warning: homeworkWarning,
  };
}

// ── Student: mark an external/image item done (or undo) ────────────────
async function markManualItem(studentId, assignmentId, itemId, done) {
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) return { error: 404, message: 'Không tìm thấy bài tập' };
  const enrollment = await ClassEnrollment.findOne({ classId: assignment.classId, studentId, removedAt: null });
  if (!enrollment) return { error: 403, message: 'Bạn không thuộc lớp của bài tập này' };

  const resource = assignment.resources.find((r) => String(r._id) === String(itemId));
  if (!resource) return { error: 404, message: 'Không tìm thấy mục này trong bài tập' };
  if (resource.kind === 'internal') {
    return { error: 400, message: 'Mục này được hệ thống tự động ghi nhận, không thể tự đánh dấu.' };
  }

  let doc = await AssignmentProgress.findOne({ assignmentId, studentId });
  if (!doc) {
    doc = new AssignmentProgress({ assignmentId, classId: assignment.classId, studentId, enrollmentId: enrollment._id, totalCount: assignment.resources.length });
  }
  const idx = doc.items.findIndex((it) => String(it.resourceItemId) === String(itemId));
  if (done) {
    const entry = { resourceItemId: resource._id, status: 'completed', source: 'manual', completedAt: new Date() };
    if (idx >= 0) doc.items[idx] = entry; else doc.items.push(entry);
  } else if (idx >= 0) {
    doc.items.splice(idx, 1);
  }

  // Recount against BOTH the manual ticks and the live internal completion —
  // otherwise a fully-done assignment that mixes an internal resource with an
  // external link would cache completedCount/allCompletedAt as if only the
  // external part counted.
  const completedIds = new Set(doc.items.filter((it) => it.status === 'completed').map((it) => String(it.resourceItemId)));
  const internalItems = assignment.resources.filter((r) => r.kind === 'internal')
    .map((r) => ({ resourceType: r.resourceType, resourceId: r.resourceId }));
  if (internalItems.length) {
    const completion = await rcs.checkCompleted(studentId, internalItems, assignment.createdAt);
    for (const r of assignment.resources) {
      if (r.kind !== 'internal') continue;
      const hit = completion.get(rcs.resourceKey(r.resourceType, r.resourceId));
      if (hit && hit.completed) completedIds.add(String(r._id));
    }
  }
  doc.completedCount = assignment.resources.filter((r) => completedIds.has(String(r._id))).length;
  doc.totalCount = assignment.resources.length;
  if (doc.completedCount > 0 && !doc.firstCompletedAt) doc.firstCompletedAt = new Date();
  doc.allCompletedAt = doc.totalCount > 0 && doc.completedCount >= doc.totalCount ? (doc.allCompletedAt || new Date()) : null;
  await doc.save();
  return { ok: true, completedCount: doc.completedCount, totalCount: doc.totalCount };
}

// ── Teacher: per-student progress table for one assignment ─────────────
async function getAssignmentProgressTable(assignment, now = new Date()) {
  const enrollments = await ClassEnrollment.find({ classId: assignment.classId }).lean();
  const students = await User.find({ _id: { $in: enrollments.map((e) => e.studentId) } })
    .select('username firstName lastName').lean();
  const sMap = new Map(students.map((s) => [String(s._id), s]));

  const internalItems = assignment.resources.filter((r) => r.kind === 'internal')
    .map((r) => ({ resourceType: r.resourceType, resourceId: r.resourceId }));
  const stored = await AssignmentProgress.find({ assignmentId: assignment._id }).lean();
  const storedMap = new Map(stored.map((p) => [String(p.studentId), p]));

  const rows = await Promise.all(enrollments.map(async (e) => {
    const completion = await rcs.checkCompleted(e.studentId, internalItems, assignment.createdAt);
    const manualCompleted = new Set(
      (storedMap.get(String(e.studentId))?.items || []).filter((it) => it.source === 'manual' && it.status === 'completed').map((it) => String(it.resourceItemId))
    );
    const completedIds = new Set(manualCompleted);
    for (const r of assignment.resources) {
      if (r.kind !== 'internal') continue;
      const hit = completion.get(rcs.resourceKey(r.resourceType, r.resourceId));
      if (hit && hit.completed) completedIds.add(String(r._id));
    }
    const { status, done, total } = deriveAssignmentStatus(assignment, completedIds, now);
    return {
      enrollmentId: e._id, studentId: e.studentId, removed: !!e.removedAt,
      student: { name: displayNameOf(sMap.get(String(e.studentId))), username: sMap.get(String(e.studentId))?.username || '' },
      completed: done, total, missing: total - done, status,
      allCompletedAt: storedMap.get(String(e.studentId))?.allCompletedAt || null,
      items: assignment.resources.map((r) => ({
        itemId: r._id, kind: r.kind, label: r.label || r.title || '',
        completed: completedIds.has(String(r._id)),
      })),
    };
  }));
  rows.sort((a, b) => a.completed / (a.total || 1) - b.completed / (b.total || 1));
  return rows;
}

module.exports = {
  deriveAssignmentStatus,
  getStudentAssignments,
  getStudentHomeworkSummary,
  getOverdueCountForClass,
  markManualItem,
  getAssignmentProgressTable,
  displayNameOf,
  DEADLINE_SOON_MS,
};
