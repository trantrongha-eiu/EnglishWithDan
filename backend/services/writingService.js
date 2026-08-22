'use strict';

// Extracted from routes/writing.js, verbatim logic. The anti-spam
// pending-attempt check was duplicated twice with different Mongoose
// projections (one .select()+.lean(), one full fetch) — verified that the
// full-fetch call site only ever checked truthiness and never read any
// field beyond what the slim projection already includes, so unifying to
// the slim version is a safe, output-identical simplification (unlike the
// grading-logic cases elsewhere, this was incidental over-fetching, not
// divergent business logic).
const WritingExam = require('../models/WritingExam');
const WritingTask1 = require('../models/WritingTask1');
const WritingTask2 = require('../models/WritingTask2');
const WritingAttempt = require('../models/WritingAttempt');
const WritingSample = require('../models/WritingSample');
const WritingDraft = require('../models/WritingDraft');

async function randomDoc(Model) {
  const count = await Model.countDocuments({ isActive: true });
  if (!count) return null;
  return Model.findOne({ isActive: true }).skip(Math.floor(Math.random() * count)).lean();
}

function buildTask1Snapshot(t1) {
  return t1 ? { imageUrl: t1.imageUrl || '', instructions: t1.instructions || '', prompt: t1.prompt || '' } : {};
}
function buildTask2Snapshot(t2) {
  return t2 ? { instructions: t2.instructions || '', prompt: t2.prompt || '' } : {};
}

async function startExam() {
  const [task1, task2] = await Promise.all([randomDoc(WritingTask1), randomDoc(WritingTask2)]);
  if (!task1) return { status: 'no_task1' };
  if (!task2) return { status: 'no_task2' };

  let exam = await WritingExam.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
  if (!exam) exam = await WritingExam.findOne().sort({ createdAt: -1 }).lean();
  if (!exam) exam = await WritingExam.create({ name: 'Writing Practice', duration: 60, isActive: true });

  return { status: 'ok', exam: { _id: exam._id, name: exam.name, duration: exam.duration, task1, task2 } };
}

// `user` is the full req.user Mongoose document (not just an id) — needed
// to advance the streak below, same convention as reading/listeningService.
async function submitExam(user, body) {
  const {
    examId, task1Id, task2Id, task1Answer = '', task2Answer = '',
    wordCount1 = 0, wordCount2 = 0, timeTaken = 0, status = 'completed'
  } = body;

  // exam/task1/task2 lookups are independent — run in parallel. (In the rare
  // case the exam doesn't exist, this does two now-unneeded lookups instead of
  // short-circuiting, but that's strictly an internal cost, not an observable
  // behavior change — the response is identical either way.)
  const [exam, t1, t2] = await Promise.all([
    WritingExam.findById(examId).select('name'),
    task1Id ? WritingTask1.findById(task1Id).lean() : Promise.resolve(null),
    task2Id ? WritingTask2.findById(task2Id).lean() : Promise.resolve(null)
  ]);
  if (!exam) return null;

  const attempt = new WritingAttempt({
    userId: user._id, examId, examName: exam.name,
    task1Id: task1Id || undefined, task2Id: task2Id || undefined,
    task1Snapshot: buildTask1Snapshot(t1), task2Snapshot: buildTask2Snapshot(t2),
    task1Answer, task2Answer,
    wordCount1: Number(wordCount1), wordCount2: Number(wordCount2),
    timeTaken: Math.max(0, Math.floor(Number(timeTaken))),
    submittedAt: new Date(), status
  });
  await attempt.save();

  // Writing (unlike Reading/Listening) isn't auto-graded at submission time
  // — a teacher may not score it for days — so there's no accuracy to tier
  // a bonus off yet. A flat +1 just keeps today's link in the streak chain
  // alive (matches vocabBookService's flat-bonus activities); same-day
  // resubmits are a no-op since updateStreak() defaults allowSameDayStack
  // to false. This was previously missing entirely, so a student who only
  // wrote an essay (no Reading/Listening/Vocab that day) saw the day marked
  // "done" in the activity heatmap yet had their streak quietly die anyway.
  if (user.role === 'student') {
    user.updateStreak();
    user.save().catch(() => {});
  }

  return attempt._id;
}

async function listPracticeTasks(taskType) {
  const Model = taskType === 1 ? WritingTask1 : WritingTask2;
  return Model.find({ isActive: true }).sort({ createdAt: 1 }).lean();
}

async function getPracticeTask(taskType) {
  const Model = taskType === 1 ? WritingTask1 : WritingTask2;
  return randomDoc(Model);
}

async function submitPractice(user, { taskType, taskId, answer, wordCount }) {
  const tNum = taskType;
  const Model = tNum === 1 ? WritingTask1 : WritingTask2;
  const task = taskId ? await Model.findById(taskId).lean() : null;

  const attempt = new WritingAttempt({
    userId: user._id, submissionType: 'practice', examName: `Luyện Task ${tNum}`,
    ...(tNum === 1 ? {
      task1Id: taskId || undefined,
      task1Snapshot: buildTask1Snapshot(task),
      task1Answer: answer,
      wordCount1: Math.max(0, Math.floor(Number(wordCount))),
    } : {
      task2Id: taskId || undefined,
      task2Snapshot: buildTask2Snapshot(task),
      task2Answer: answer,
      wordCount2: Math.max(0, Math.floor(Number(wordCount))),
    }),
    submittedAt: new Date(), status: 'completed'
  });
  await attempt.save();

  // See submitExam()'s comment above — same flat, once-a-day streak credit.
  if (user.role === 'student') {
    user.updateStreak();
    user.save().catch(() => {});
  }

  return attempt._id;
}

async function getPracticeHistory(userId) {
  return WritingAttempt.find({ userId, submissionType: 'practice' })
    .sort({ submittedAt: -1 }).limit(20).select('-task1Answer -task2Answer').lean();
}

async function getDrafts(userId) {
  return WritingDraft.find({ userId }).sort({ savedAt: -1 }).lean();
}

// Up to 2 drafts per {userId, taskType} — upserts by exact task, then evicts
// the oldest beyond 2 for that type so a student can have two different
// Task 1 essays (or two Task 2s) in progress at once without one silently
// overwriting the other, but can't accumulate an unbounded number.
//
// A student who opens a task and leaves without typing anything (or types
// something then deletes it all) has nothing worth resuming — saving that
// as a draft only produced a false "bài luyện tập chưa nộp" banner on their
// next visit. Skip the write entirely in that case, and delete any earlier
// draft for this exact task that's now been emptied out, instead of upserting
// blank content over it.
async function saveDraft(userId, { taskType, task, answer = '', wordCount = 0, seconds = 0 }) {
  const taskId = String(task._id);
  if (!wordCount && !answer.trim()) {
    await WritingDraft.deleteOne({ userId, taskType, taskId });
    return;
  }
  await WritingDraft.findOneAndUpdate(
    { userId, taskType, taskId },
    { taskType, taskId, task, answer, wordCount, seconds, savedAt: new Date() },
    { upsert: true, new: true }
  );

  const drafts = await WritingDraft.find({ userId, taskType }).sort({ savedAt: -1 }).select('_id').lean();
  if (drafts.length > 2) {
    const staleIds = drafts.slice(2).map(d => d._id);
    await WritingDraft.deleteMany({ _id: { $in: staleIds } });
  }
}

async function deleteDraft(userId, taskType, taskId) {
  await WritingDraft.deleteOne({ userId, taskType, taskId: String(taskId) });
}

async function getUnreadFeedbackCount(userId) {
  return WritingAttempt.countDocuments({ userId, gradingStatus: 'confirmed', feedbackRead: { $ne: true } });
}

// Per-taskType count for the nav dropdown's Task 1 / Task 2 badges: unfinished
// drafts + unread graded feedback, combined into one number per type (a
// student doesn't need to know which of the two reasons the badge is for —
// either way there's something waiting for them under that nav item).
async function getPracticeNavCounts(userId) {
  const [drafts, unreadAttempts] = await Promise.all([
    WritingDraft.find({ userId }).select('taskType').lean(),
    WritingAttempt.find({
      userId, submissionType: 'practice', gradingStatus: 'confirmed', feedbackRead: { $ne: true },
    }).select('task1Id task2Id').lean(),
  ]);
  const counts = { 1: 0, 2: 0 };
  drafts.forEach(d => { if (counts[d.taskType] != null) counts[d.taskType]++; });
  unreadAttempts.forEach(a => {
    if (a.task1Id) counts[1]++;
    if (a.task2Id) counts[2]++;
  });
  return counts;
}

async function markFeedbackRead(attemptId, userId) {
  const attempt = await WritingAttempt.findById(attemptId).select('userId gradingStatus').lean();
  if (!attempt) return { status: 'not_found' };
  if (attempt.userId.toString() !== userId.toString()) return { status: 'forbidden' };
  if (attempt.gradingStatus === 'confirmed') {
    await WritingAttempt.updateOne({ _id: attempt._id }, { $set: { feedbackRead: true } });
  }
  return { status: 'ok' };
}

async function getMyHistory(userId) {
  return WritingAttempt.find({ userId }).sort({ submittedAt: -1 }).limit(50).select('-task1Answer -task2Answer').lean();
}

async function getAttempt(attemptId, requestingUser) {
  const attempt = await WritingAttempt.findById(attemptId).lean();
  if (!attempt) return { status: 'not_found' };
  const isOwner = attempt.userId.toString() === requestingUser._id.toString();
  const isAdmin = ['teacher', 'admin'].includes(requestingUser.role);
  if (!isOwner && !isAdmin) return { status: 'forbidden' };
  return { status: 'ok', attempt };
}

async function listSamples({ quarter, topic, taskType }) {
  const filter = { isActive: true };
  if (quarter && quarter !== 'all') filter.quarter = quarter;
  if (topic && topic !== 'all') filter.topic = topic;
  if (taskType && taskType !== 'all') filter.taskType = taskType;
  return WritingSample.find(filter).sort({ createdAt: -1 }).lean();
}

async function getSampleFilters() {
  const [quarters, topics] = await Promise.all([
    WritingSample.distinct('quarter', { isActive: true }),
    WritingSample.distinct('topic', { isActive: true })
  ]);
  return { quarters: quarters.sort().reverse(), topics: topics.sort() };
}

module.exports = {
  startExam, submitExam, listPracticeTasks, getPracticeTask, submitPractice,
  getPracticeHistory, getDrafts, saveDraft, deleteDraft, getUnreadFeedbackCount, getPracticeNavCounts, markFeedbackRead,
  getMyHistory, getAttempt, listSamples, getSampleFilters,
};
