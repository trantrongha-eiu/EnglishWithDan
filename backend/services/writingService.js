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

async function submitExam(userId, body) {
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
    userId, examId, examName: exam.name,
    task1Id: task1Id || undefined, task2Id: task2Id || undefined,
    task1Snapshot: buildTask1Snapshot(t1), task2Snapshot: buildTask2Snapshot(t2),
    task1Answer, task2Answer,
    wordCount1: Number(wordCount1), wordCount2: Number(wordCount2),
    timeTaken: Math.max(0, Math.floor(Number(timeTaken))),
    submittedAt: new Date(), status
  });
  await attempt.save();
  return attempt._id;
}

async function listPracticeTasks(taskType) {
  const Model = taskType === 1 ? WritingTask1 : WritingTask2;
  return Model.find({ isActive: true }).sort({ createdAt: 1 }).lean();
}

async function findPendingPracticeAttempt(userId) {
  return WritingAttempt.findOne({
    userId, submissionType: 'practice', gradingStatus: { $in: ['pending', 'ai_done'] }
  }).select('_id submittedAt').lean();
}

async function getPracticeTask(taskType) {
  const Model = taskType === 1 ? WritingTask1 : WritingTask2;
  return randomDoc(Model);
}

async function submitPractice(userId, { taskType, taskId, answer, wordCount }) {
  const tNum = taskType;
  const Model = tNum === 1 ? WritingTask1 : WritingTask2;
  const task = taskId ? await Model.findById(taskId).lean() : null;

  const attempt = new WritingAttempt({
    userId, submissionType: 'practice', examName: `Luyện Task ${tNum}`,
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
  return attempt._id;
}

async function getPracticeHistory(userId) {
  return WritingAttempt.find({ userId, submissionType: 'practice' })
    .sort({ submittedAt: -1 }).limit(20).select('-task1Answer -task2Answer').lean();
}

async function getDraft(userId) {
  return WritingDraft.findOne({ userId }).lean();
}

async function saveDraft(userId, { taskType, task, answer = '', wordCount = 0, seconds = 0 }) {
  await WritingDraft.findOneAndUpdate(
    { userId },
    { taskType, task, answer, wordCount, seconds, savedAt: new Date() },
    { upsert: true, new: true }
  );
}

async function deleteDraft(userId) {
  await WritingDraft.deleteOne({ userId });
}

async function getUnreadFeedbackCount(userId) {
  return WritingAttempt.countDocuments({ userId, gradingStatus: 'confirmed', feedbackRead: { $ne: true } });
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
  startExam, submitExam, listPracticeTasks, findPendingPracticeAttempt, getPracticeTask, submitPractice,
  getPracticeHistory, getDraft, saveDraft, deleteDraft, getUnreadFeedbackCount, markFeedbackRead,
  getMyHistory, getAttempt, listSamples, getSampleFilters,
};
