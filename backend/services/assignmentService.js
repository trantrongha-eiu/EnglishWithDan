'use strict';

// Assignment status derivation + the student "my homework" aggregate.
// Internal-resource completion comes from resourceCompletionService (real
// attempt history); external/image items are the student's manual ticks
// stored on AssignmentProgress. Progress is keyed by studentId so a
// student removed then re-added to a class keeps it.

const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const AssignmentProgress = require('../models/AssignmentProgress');
const ClassGroup = require('../models/ClassGroup');
const ClassEnrollment = require('../models/ClassEnrollment');
const User = require('../models/User');
const rcs = require('./resourceCompletionService');
const vgs = require('./vocabGoalService');
// From utils/, not classAttendanceService — that service now depends on THIS
// module (to fold homework misses into the auto status), so this can't
// depend back on it without a require cycle.
const { withPolicyDefaults } = require('../utils/classPolicy');

const DEADLINE_SOON_MS = 24 * 60 * 60 * 1000;

function itemIsInternal(r) {
  return r.kind === 'internal';
}

// Auto-tracked = completion comes from the system, never a student tick.
function itemIsAutoTracked(r) {
  return r.kind === 'internal' || r.kind === 'vocab_goal';
}

function vocabGoalKey(assignmentId, itemId) {
  return `${assignmentId}:${itemId}`;
}

// Record a reached vocab_goal as an `auto` progress item. Sticky on purpose:
// the live evaluation reads each word's LATEST practice result, so without
// this a student who passed and later misses a few words on an unrelated
// review (or deletes words from the book) would silently flip back to
// "not done". Two targeted updates instead of load+save so it can't clobber
// a concurrent manual tick on the same AssignmentProgress doc.
async function persistVocabGoalDone(studentId, assignment, resource, result, now) {
  try {
    await AssignmentProgress.updateOne(
      { assignmentId: assignment._id, studentId },
      { $setOnInsert: { assignmentId: assignment._id, studentId, classId: assignment.classId, totalCount: assignment.resources.length } },
      { upsert: true },
    );
  } catch (err) {
    if (err.code !== 11000) throw err; // lost an upsert race — the doc exists now
  }
  await AssignmentProgress.updateOne(
    { assignmentId: assignment._id, studentId, 'items.resourceItemId': { $ne: resource._id } },
    { $push: { items: {
      resourceItemId: resource._id, status: 'completed', source: 'auto', completedAt: now,
      attemptRef: result.bookId ? `vocabbook:${result.bookId}` : '',
    } } },
  );
}

// vocab_goal completion for a set of assignments of ONE student. Returns a
// Map vocabGoalKey(assignmentId, itemId) -> { completed, completedAt, ...
// vocabGoalService.evaluateBooks fields }. Already-reached goals come from
// the stored sticky item (no book load); the student's books are loaded
// once, only if some goal is still open.
async function resolveVocabGoals(studentId, assignments, storedByAssignment, now = new Date()) {
  const out = new Map();
  const pending = [];
  for (const a of assignments) {
    for (const r of a.resources) {
      if (r.kind !== 'vocab_goal') continue;
      const done = (storedByAssignment.get(String(a._id))?.items || []).find((it) =>
        String(it.resourceItemId) === String(r._id) && it.source === 'auto' && it.status === 'completed');
      if (done) out.set(vocabGoalKey(a._id, r._id), { completed: true, completedAt: done.completedAt, wordCount: r.wordCount, mode: 'reached', requiredSlot: r.bookSlot || null });
      else pending.push({ a, r });
    }
  }
  if (!pending.length) return out;

  const books = await vgs.loadBooksForGoal(studentId); // all 5 slots; narrowed per goal below
  const newlyDone = [];
  for (const { a, r } of pending) {
    const candidates = r.bookSlot ? books.filter((b) => b.slot === r.bookSlot) : books;
    const res = { ...vgs.evaluateBooks(candidates, a.createdAt, r.wordCount), requiredSlot: r.bookSlot || null };
    out.set(vocabGoalKey(a._id, r._id), { ...res, completedAt: res.completed ? now : null });
    if (res.completed) newlyDone.push({ a, r, res });
  }
  await Promise.all(newlyDone.map(({ a, r, res }) =>
    persistVocabGoalDone(studentId, a, r, res, now).catch(() => {})));
  return out;
}

// Student/teacher-facing snapshot of one vocab_goal's progress.
function shapeVocabGoal(v) {
  if (!v) return null;
  return {
    wordCount: v.wordCount, mode: v.mode, completed: !!v.completed,
    practiced: v.practiced ?? null, correct: v.correct ?? null,
    target: v.target ?? v.wordCount, needCorrect: v.needCorrect ?? 0,
    bookId: v.bookId || null, bookName: v.bookName || '', bookEmoji: v.bookEmoji || '', bookSize: v.bookSize ?? null,
    bookSlot: v.bookSlot ?? null, requiredSlot: v.requiredSlot ?? null, minSize: v.minSize ?? null,
  };
}

// derive one assignment's status for a student from its resources + progress items.
// `partial`: a not-yet-completed item already has real progress (a vocab_goal
// with words practised) — reads as in_progress even while 0 items are done.
function deriveAssignmentStatus(assignment, completedItemIds, now = new Date(), { partial = false } = {}) {
  const total = assignment.resources.length;
  const done = assignment.resources.filter((r) => completedItemIds.has(String(r._id))).length;
  const overdue = assignment.deadline && new Date(assignment.deadline).getTime() < now.getTime();
  let status;
  if (total > 0 && done >= total) status = 'completed';
  else if (overdue) status = 'overdue';
  else if (done > 0 || partial) status = 'in_progress';
  else status = 'not_started';
  return { status, done, total };
}

// An ARCHIVED assignment that was left incomplete always counts as a miss
// (toward the warn/fail thresholds), whatever its deadline — archiving means
// the teacher closed it, i.e. it is past due (user's rule). Archiving must
// never be a way to wipe a student's misses.
function archivedIsMissed(assignment, status) {
  return status !== 'completed';
}

// Is this progress row's "missed" flag (missedAt) still in force for the
// assignment as it stands now? Archived = closed, so a flag always stands.
// Otherwise it only stands while the current deadline is no later than the
// one that was missed — a teacher extending the deadline voids it.
function missFlagApplies(assignment, progress) {
  if (!progress || !progress.missedAt) return false;
  if (assignment.status === 'archived') return true;
  if (!assignment.deadline || !progress.missedDeadline) return false;
  return new Date(assignment.deadline).getTime() <= new Date(progress.missedDeadline).getTime();
}

// Every 2 assignments made up after the deadline count as 1 miss (owner's rule).
const LATE_PER_MISS = 2;
function effectiveMissCount(overdue, late) {
  return overdue + Math.floor(late / LATE_PER_MISS);
}

// An assignment given before this student joined the class was never theirs
// to do (teacher's rule: a newly added student only owes homework assigned
// from their join date on) — it is hidden from them and never counted as a
// miss, even if its deadline is still open. Measured against the CURRENT
// enrollment, so a removed-then-re-added student starts fresh too.
function assignedBeforeEnrollment(assignment, enrollment) {
  const joined = enrollment && (enrollment.enrolledAt || enrollment.createdAt);
  if (!joined || !assignment.createdAt) return false;
  return new Date(assignment.createdAt).getTime() < new Date(joined).getTime();
}

// The mirror case: the student had already left the class (soft-removed)
// before this assignment was given, so it was never theirs to do.
function leftBeforeAssigned(assignment, enrollment) {
  if (!enrollment || !enrollment.removedAt || !assignment.createdAt) return false;
  return new Date(enrollment.removedAt).getTime() <= new Date(assignment.createdAt).getTime();
}

// ── Homework lock ──────────────────────────────────────────────────────
// Owner's rule: a student who still has MORE than `homeworkLockThreshold`
// (default 2) older assignments incomplete in a class — overdue / archived
// misses included — can't start any newer assignment in that class until
// they make the old ones up. Walks each class oldest → newest, so the
// student can always work on the oldest open ones; every newer open one is
// locked. Completed assignments are never locked (work already done stays
// done). Stateless: recomputed on every read, so finishing an old one
// unlocks the next straight away. Mutates `rows`.
function applyHomeworkLocks(rows, classMap) {
  const byClass = new Map();
  for (const r of rows) {
    const k = String(r.classId);
    if (!byClass.has(k)) byClass.set(k, []);
    byClass.get(k).push(r);
  }
  const lockedRows = [];
  const mustFinish = new Map(); // _id -> row (unlocked, incomplete, blocking something)
  for (const [cid, list] of byClass) {
    const thr = withPolicyDefaults(classMap.get(cid)?.policy).homeworkLockThreshold;
    list.sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt));
    const olderOpen = [];
    for (const r of list) {
      r.locked = false;
      if (r.status === 'completed') continue;
      if (olderOpen.length > thr) {
        const blockers = olderOpen.filter((o) => !o.locked);
        r.locked = true;
        r.lockThreshold = thr;
        // how many more old ones must be finished before THIS one opens
        r.unlockNeed = olderOpen.length - thr;
        r.lockedBy = blockers.map((o) => ({ _id: o._id, title: o.title, deadline: o.deadline, status: o.status }));
        for (const o of blockers) mustFinish.set(String(o._id), o);
        lockedRows.push(r);
      }
      olderOpen.push(r);
    }
  }
  if (!lockedRows.length) return null;
  return {
    lockedCount: lockedRows.length,
    pendingOld: [...mustFinish.values()].map((o) => ({
      _id: o._id, title: o.title, className: o.className, deadline: o.deadline, status: o.status, done: o.done, total: o.total,
    })),
  };
}

// The lock state of one assignment for one student (null = not visible to
// them). Used to refuse manual ticks / the class mock on a locked one.
async function getLockState(studentId, assignmentId, now = new Date()) {
  const { assignments } = await getStudentAssignments(studentId, now);
  return assignments.find((a) => String(a._id) === String(assignmentId)) || null;
}

function lockedMessage(row) {
  const n = row.unlockNeed || 1;
  return `Bài tập này đang bị khoá: bạn còn ${row.lockedBy?.length || n} bài tập cũ chưa hoàn thành. Hãy làm xong ít nhất ${n} bài cũ để mở khoá bài này.`;
}

// ── Student: all my homework across my active classes ──────────────────
// `persist` (only from GET /api/assignments/mine, not the nav.js summary or
// the cron) writes an accurate completedCount/allCompletedAt back onto each
// AssignmentProgress — a redundant-write guard means a steady-state load
// does zero writes. This is what keeps the teacher's "X/Y hoàn thành"
// rollup honest for assignments made only of internal resources, where the
// student never ticks anything.
// `readOnly` (the parent view) skips every write, including the "nộp trễ"
// miss flags — the cron and the student's/teacher's own reads still set those.
async function getStudentAssignments(studentId, now = new Date(), { persist = false, readOnly = false } = {}) {
  const enrollments = await ClassEnrollment.find({ studentId, removedAt: null }).lean();
  if (!enrollments.length) return { assignments: [], homeworkWarning: null, homeworkLock: null, hasClasses: false };

  const enrollByClass = new Map(enrollments.map((e) => [String(e.classId), e]));
  const classIds = enrollments.map((e) => e.classId);
  const [classes, assignments] = await Promise.all([
    ClassGroup.find({ _id: { $in: classIds } }).select('name policy teacherId').lean(),
    // archived too — see archivedIsMissed; the non-missed ones are dropped below
    Assignment.find({ classId: { $in: classIds }, status: { $in: ['active', 'archived'] } }).sort({ createdAt: -1 }).lean(),
  ]);
  const classMap = new Map(classes.map((c) => [String(c._id), c]));
  const teachers = await User.find({ _id: { $in: classes.map((c) => c.teacherId) } }).select('username firstName lastName').lean();
  const teacherMap = new Map(teachers.map((t) => [String(t._id), t]));

  await rcs.refreshResourceSnapshots(assignments.flatMap((a) => a.resources));

  // one batched completion check across every internal item of every assignment
  const allInternal = [];
  for (const a of assignments) {
    for (const r of a.resources) if (r.kind === 'internal') allInternal.push(rcs.completionItem(r));
  }
  // group completion by (assignment.createdAt as `since`) — simplest correct
  // approach is per-assignment, but batching by type still helps: we pass the
  // EARLIEST assignment createdAt as `since`, then filter per assignment below.
  const earliest = assignments.reduce((min, a) => (a.createdAt < min ? a.createdAt : min), now);
  const completionMap = await rcs.checkCompleted(studentId, allInternal, earliest);

  const stored = await AssignmentProgress.find({ studentId, assignmentId: { $in: assignments.map((a) => a._id) } }).lean();
  const storedMap = new Map(stored.map((p) => [String(p.assignmentId), p]));
  const vocabMap = await resolveVocabGoals(studentId, assignments, storedMap, now);

  const rows = [];
  const missFlagWrites = [];
  let incompleteCount = 0;
  let nearestDeadline = null;

  for (const a of assignments) {
    const cls = classMap.get(String(a.classId));
    const enr = enrollByClass.get(String(a.classId));
    if (!cls || !enr) continue;
    if (assignedBeforeEnrollment(a, enr)) continue;

    const manualCompleted = new Set(
      (storedMap.get(String(a._id))?.items || []).filter((it) => it.source === 'manual' && it.status === 'completed').map((it) => String(it.resourceItemId))
    );
    const completedItemIds = new Set(manualCompleted);
    const resourcesShaped = a.resources.map((r) => {
      let completed = false, completedAt = null, vocabGoal = null, mock = null;
      const autoTracked = itemIsAutoTracked(r);
      if (r.kind === 'vocab_goal') {
        const v = vocabMap.get(vocabGoalKey(a._id, r._id));
        vocabGoal = shapeVocabGoal(v);
        if (v && v.completed) { completed = true; completedAt = v.completedAt; }
      } else if (autoTracked) {
        const hit = completionMap.get(rcs.completionKey(r));
        if (hit && hit.mock) mock = hit.mock;
        // only count if completed at/after THIS assignment's createdAt —
        // except course lessons, whose one-time completion can't be redone
        // (see resourceCompletionService.countsPriorCompletion)
        if (hit && hit.completed && (rcs.countsPriorCompletion(r.resourceType) || new Date(hit.completedAt) >= new Date(a.createdAt))) {
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
        wordCount: r.wordCount || null, bookSlot: r.bookSlot || null, vocabGoal,
        // fixed class bundle — the test names stay teacher-side only
        fixedMock: rcs.isFixedMock(r), mock,
      };
    });

    const partial = resourcesShaped.some((r) => !r.completed && r.vocabGoal && r.vocabGoal.practiced > 0);
    const derived = deriveAssignmentStatus(a, completedItemIds, now, { partial });
    const { done, total } = derived;
    let { status } = derived;
    const archived = a.status === 'archived';
    if (archived && archivedIsMissed(a, status)) status = 'overdue';

    // "Nộp trễ": flag the miss the first time it is seen, so a later make-up
    // still reads as late. Completed + flagged = completed late.
    const prog = storedMap.get(String(a._id));
    let late = false;
    if (status === 'overdue') {
      if (!missFlagApplies(a, prog)) missFlagWrites.push({ assignmentId: a._id, classId: a.classId, deadline: a.deadline || null });
    } else if (status === 'completed') {
      late = missFlagApplies(a, prog);
    }

    // Only an archived MISS (or late make-up) stays on the student's list, so
    // they can see what counts against them; everything else archived is
    // hidden exactly as before.
    if (archived && status === 'completed' && !late) continue;
    if (status !== 'completed') incompleteCount += 1;
    if (a.deadline && status !== 'completed') {
      const dl = new Date(a.deadline);
      if (dl >= now && (!nearestDeadline || dl < nearestDeadline)) nearestDeadline = dl;
    }

    rows.push({
      _id: a._id, title: a.title, instruction: a.instruction,
      className: cls.name, classId: a.classId,
      teacherName: displayNameOf(teacherMap.get(String(cls.teacherId))),
      deadline: a.deadline, createdAt: a.createdAt, archived,
      status, late, done, total, resources: resourcesShaped,
    });
  }

  if (missFlagWrites.length && !readOnly) {
    await Promise.all(missFlagWrites.map((w) => AssignmentProgress.updateOne(
      { assignmentId: w.assignmentId, studentId },
      { $set: { missedAt: now, missedDeadline: w.deadline }, $setOnInsert: { assignmentId: w.assignmentId, studentId, classId: w.classId } },
      { upsert: true },
    ).catch(() => {})));
  }

  const homeworkLock = applyHomeworkLocks(rows, classMap);

  // priority sort: (1) not-done + nearest deadline, (2) in progress,
  // (3) overdue, (4) locked (until the old ones are made up), (5) completed
  const rank = { in_progress: 1, not_started: 1, overdue: 3, completed: 5 };
  const rankOf = (r) => (r.locked ? 4 : rank[r.status]);
  rows.sort((x, y) => {
    const rx = rankOf(x);
    const ry = rankOf(y);
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
  for (const r of rows) {
    if (r.status !== 'overdue' && !r.late) continue;
    const k = String(r.classId);
    const c = missedByClass.get(k) || { overdue: 0, late: 0 };
    if (r.late) c.late += 1; else c.overdue += 1;
    missedByClass.set(k, c);
  }
  for (const [cid, c] of missedByClass) {
    const n = effectiveMissCount(c.overdue, c.late);
    const cls = classMap.get(cid);
    const thr = withPolicyDefaults(cls?.policy).homeworkMissThreshold;
    if (n >= thr) {
      if (!homeworkWarning || n > homeworkWarning.missedCount) {
        homeworkWarning = { classId: cid, missedCount: n, overdueCount: c.overdue, lateCount: c.late, threshold: thr, className: cls?.name || '', incompleteCount, nearestDeadline };
      }
    }
  }

  return { assignments: rows, homeworkWarning, homeworkLock, hasClasses: true };
}

// ── Live "how many assignments is this student currently behind on, in this
//    one class" — sourced from getStudentAssignments's per-assignment rows.
//    Used by classAttendanceService (refreshClass/refreshEnrollment) to fold
//    homework misses into the enrollment's warning/failed status, alongside
//    attendance. Recomputed fresh every call, same as the rest of that
//    status machinery — a teacher extending a deadline lowers this number on
//    the next refresh. Making the work up late turns a miss into a "late"
//    one: 2 late = 1 miss. Archiving does NOT clear anything: an archived
//    assignment left incomplete keeps counting (archivedIsMissed).
//    Returns { count, overdue, late } — count is what the thresholds see.
async function getOverdueCountForClass(studentId, classId, now = new Date()) {
  const { assignments } = await getStudentAssignments(studentId, now);
  let overdue = 0, late = 0;
  for (const a of assignments) {
    if (String(a.classId) !== String(classId)) continue;
    if (a.status === 'overdue') overdue += 1;
    else if (a.late) late += 1;
  }
  return { count: effectiveMissCount(overdue, late), overdue, late };
}

// Every missed (overdue + incomplete, archived included) and late-made-up
// assignment per class, for the student's own "Lớp học của tôi" card /
// warning popup. Map classId -> { count, missed: [...], late: [...] } where
// each entry is { _id, title, deadline, archived, done, total }.
async function getMissedAssignmentsByClass(studentId, now = new Date()) {
  const { assignments } = await getStudentAssignments(studentId, now);
  const out = new Map();
  for (const a of assignments) {
    if (a.status !== 'overdue' && !a.late) continue;
    const k = String(a.classId);
    if (!out.has(k)) out.set(k, { count: 0, missed: [], late: [] });
    const entry = { _id: a._id, title: a.title, deadline: a.deadline, archived: !!a.archived, done: a.done, total: a.total };
    (a.late ? out.get(k).late : out.get(k).missed).push(entry);
  }
  for (const v of out.values()) v.count = effectiveMissCount(v.missed.length, v.late.length);
  return out;
}

function displayNameOf(u) {
  if (!u) return '';
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return full || u.username || '';
}

// lightweight version for nav.js
async function getStudentHomeworkSummary(studentId, now = new Date()) {
  const { assignments, homeworkWarning, homeworkLock, hasClasses } = await getStudentAssignments(studentId, now);
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
    lock: homeworkLock,
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
  if (itemIsAutoTracked(resource)) {
    return { error: 400, message: 'Mục này được hệ thống tự động ghi nhận, không thể tự đánh dấu.' };
  }
  if (done) {
    const row = await getLockState(studentId, assignmentId);
    if (row && row.locked) return { error: 423, code: 'HOMEWORK_LOCKED', message: lockedMessage(row) };
  }

  // Resolve (and, if just reached, persist) vocab goals BEFORE loading the
  // doc below — its save() rewrites items[], so a sticky auto item pushed
  // after the load would be clobbered.
  const vocabGoals = assignment.resources.some((r) => r.kind === 'vocab_goal')
    ? await resolveVocabGoals(studentId, [assignment],
      new Map([[String(assignment._id), await AssignmentProgress.findOne({ assignmentId, studentId }).lean()]]))
    : new Map();

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
  const internalItems = assignment.resources.filter((r) => r.kind === 'internal').map(rcs.completionItem);
  if (internalItems.length) {
    const completion = await rcs.checkCompleted(studentId, internalItems, assignment.createdAt);
    for (const r of assignment.resources) {
      if (r.kind !== 'internal') continue;
      const hit = completion.get(rcs.completionKey(r));
      if (hit && hit.completed) completedIds.add(String(r._id));
    }
  }
  for (const r of assignment.resources) {
    if (r.kind === 'vocab_goal' && vocabGoals.get(vocabGoalKey(assignment._id, r._id))?.completed) completedIds.add(String(r._id));
  }
  doc.completedCount = assignment.resources.filter((r) => completedIds.has(String(r._id))).length;
  doc.totalCount = assignment.resources.length;
  if (doc.completedCount > 0 && !doc.firstCompletedAt) doc.firstCompletedAt = new Date();
  doc.allCompletedAt = doc.totalCount > 0 && doc.completedCount >= doc.totalCount ? (doc.allCompletedAt || new Date()) : null;
  await doc.save();
  return { ok: true, completedCount: doc.completedCount, totalCount: doc.totalCount };
}

// ── Student: start the class's fixed-bundle mock test ──────────────────
// Resolves + authorises a homework mock_test item for this student and
// returns what mockTestService.startMockTest's `assigned` option needs.
// Same visibility rules as getStudentAssignments: active enrollment, not
// assigned before they joined; an archived assignment can still be made up.
async function getAssignedMock(studentId, assignmentId, itemId) {
  if (!mongoose.isValidObjectId(assignmentId) || !mongoose.isValidObjectId(itemId)) {
    return { error: 404, message: 'Không tìm thấy bài thi thử được giao' };
  }
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment || !['active', 'archived'].includes(assignment.status)) {
    return { error: 404, message: 'Không tìm thấy bài thi thử được giao' };
  }
  const enrollment = await ClassEnrollment.findOne({ classId: assignment.classId, studentId, removedAt: null }).lean();
  if (!enrollment || assignedBeforeEnrollment(assignment, enrollment)) {
    return { error: 403, message: 'Bạn không thuộc lớp của bài tập này' };
  }
  const item = assignment.resources.find((r) => String(r._id) === String(itemId));
  if (!item || !rcs.isFixedMock(item)) return { error: 404, message: 'Không tìm thấy bài thi thử được giao' };
  const row = await getLockState(studentId, assignment._id);
  if (row && row.locked) return { error: 423, code: 'HOMEWORK_LOCKED', message: lockedMessage(row) };
  return { assignmentId: assignment._id, itemId: item._id, bundle: item.mockBundle };
}

// ── Teacher: per-student progress table for one assignment ─────────────
async function getAssignmentProgressTable(assignment, now = new Date()) {
  // Unlike the roster tab (which intentionally lists every enrollment ever,
  // removed ones included, as an audit trail), a removed-then-re-added
  // student must collapse to ONE row here: AssignmentProgress/completion are
  // keyed by studentId (not enrollmentId, deliberately — see this file's
  // header comment), so the old removed enrollment and the new active one
  // would otherwise render as two rows with byte-identical completion data.
  // Prefer the active enrollment; among two with the same active/removed
  // status (e.g. removed twice, never currently active), keep the most
  // recently created one.
  const allEnrollments = await ClassEnrollment.find({ classId: assignment.classId }).sort({ createdAt: 1 }).lean();
  const byStudent = new Map();
  for (const e of allEnrollments) {
    const prev = byStudent.get(String(e.studentId));
    if (!prev || !e.removedAt || prev.removedAt) byStudent.set(String(e.studentId), e);
  }
  // A student who had already left when this was given was never asked to do
  // it — no row at all, so they never read as "thiếu" on newer homework.
  const enrollments = [...byStudent.values()].filter((e) => !leftBeforeAssigned(assignment, e));
  const students = await User.find({ _id: { $in: enrollments.map((e) => e.studentId) } })
    .select('username firstName lastName').lean();
  const sMap = new Map(students.map((s) => [String(s._id), s]));

  const internalItems = assignment.resources.filter((r) => r.kind === 'internal').map(rcs.completionItem);
  const stored = await AssignmentProgress.find({ assignmentId: assignment._id }).lean();
  const storedMap = new Map(stored.map((p) => [String(p.studentId), p]));

  const rows = await Promise.all(enrollments.map(async (e) => {
    const completion = await rcs.checkCompleted(e.studentId, internalItems, assignment.createdAt);
    const manualCompleted = new Set(
      (storedMap.get(String(e.studentId))?.items || []).filter((it) => it.source === 'manual' && it.status === 'completed').map((it) => String(it.resourceItemId))
    );
    const completedIds = new Set(manualCompleted);
    const mockByItem = new Map();
    for (const r of assignment.resources) {
      if (r.kind !== 'internal') continue;
      const hit = completion.get(rcs.completionKey(r));
      if (hit && hit.completed) completedIds.add(String(r._id));
      if (hit && hit.mock) mockByItem.set(String(r._id), hit.mock);
    }
    const vocabGoals = await resolveVocabGoals(e.studentId, [assignment],
      new Map([[String(assignment._id), storedMap.get(String(e.studentId))]]), now);
    for (const r of assignment.resources) {
      if (r.kind === 'vocab_goal' && vocabGoals.get(vocabGoalKey(assignment._id, r._id))?.completed) completedIds.add(String(r._id));
    }
    const partial = [...vocabGoals.values()].some((v) => !v.completed && v.practiced > 0);
    const derived = deriveAssignmentStatus(assignment, completedIds, now, { partial });
    const { done, total } = derived;
    // Joined after this assignment was given — not theirs to do
    // (getStudentAssignments skips it the same way).
    const status = derived.status !== 'completed' && assignedBeforeEnrollment(assignment, e) ? 'not_applicable' : derived.status;
    return {
      enrollmentId: e._id, studentId: e.studentId, removed: !!e.removedAt,
      student: { name: displayNameOf(sMap.get(String(e.studentId))), username: sMap.get(String(e.studentId))?.username || '' },
      completed: done, total, missing: total - done, status,
      late: status === 'completed' && missFlagApplies(assignment, storedMap.get(String(e.studentId))),
      allCompletedAt: storedMap.get(String(e.studentId))?.allCompletedAt || null,
      items: assignment.resources.map((r) => ({
        itemId: r._id, kind: r.kind, label: r.label || r.title || '', bookSlot: r.bookSlot || null,
        completed: completedIds.has(String(r._id)),
        vocabGoal: r.kind === 'vocab_goal' ? shapeVocabGoal(vocabGoals.get(vocabGoalKey(assignment._id, r._id))) : undefined,
        fixedMock: rcs.isFixedMock(r) || undefined,
        mock: mockByItem.get(String(r._id)) || undefined,
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
  effectiveMissCount,
  missFlagApplies,
  getMissedAssignmentsByClass,
  archivedIsMissed,
  assignedBeforeEnrollment,
  markManualItem,
  getAssignedMock,
  applyHomeworkLocks,
  getAssignmentProgressTable,
  displayNameOf,
  DEADLINE_SOON_MS,
};
