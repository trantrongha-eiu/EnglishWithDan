const cron = require('node-cron');
const WritingAttempt = require('../models/WritingAttempt');
const { gradeTaskWithAI } = require('../services/writingGradingService');

// Teachers previously had to click "Chấm bài bằng AI" by hand for every
// Task 1/Task 2 submission — fine for a handful a day, but a real time sink
// once submissions pile up. This runs the exact same gradeTaskWithAI() the
// manual button uses, just automatically, so the AI suggestion is already
// waiting whenever a teacher opens a submission. It only fills in
// aiGrading.taskN (gradingStatus → 'ai_done') — identical to what "ai-grade"
// does. It deliberately does NOT touch grading/gradingStatus:'confirmed' or
// email the student: that publish step is confirm-grade's job, a teacher
// still has to review the AI's suggestion (and can edit it) before a
// student ever sees a grade or gets notified.
//
// gradingStatus alone can't tell us which TASK still needs grading — it
// flips to 'ai_done' the moment EITHER task is graded (see ai-grade route),
// so an attempt sitting at 'ai_done' with only Task 1 graded still needs
// Task 2. Filter in JS per-task instead of trusting gradingStatus alone.
function needsGrading(attempt, taskNum) {
  const answer = taskNum === 1 ? attempt.task1Answer : attempt.task2Answer;
  const already = taskNum === 1 ? attempt.aiGrading?.task1?.bandScore : attempt.aiGrading?.task2?.bandScore;
  return !!answer?.trim() && !already;
}

// Sequential with a delay between calls (not Promise.all) — same
// conservative approach used for other bulk AI-calling jobs in this
// codebase: one 45s-capable Gemini call at a time, so a burst of pending
// submissions can't hammer the API, and an overload/quota error can be
// caught and the whole run stopped cleanly rather than mid-flight.
const DELAY_MS = 3000;
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runAutoGrade() {
  try {
    // Anything already 'confirmed' has a teacher-finalized grade and is
    // never touched again. 'pending' and 'ai_done' are the only states
    // where an ungraded task could still be sitting there.
    const attempts = await WritingAttempt.find({ gradingStatus: { $in: ['pending', 'ai_done'] } })
      .select('task1Answer task2Answer wordCount1 wordCount2 task1Snapshot task2Snapshot aiGrading')
      .lean();

    const jobs = [];
    for (const attempt of attempts) {
      if (needsGrading(attempt, 1)) jobs.push({ attempt, taskNum: 1 });
      if (needsGrading(attempt, 2)) jobs.push({ attempt, taskNum: 2 });
    }

    if (!jobs.length) {
      console.log('[WritingAutoGrade] Nothing pending, skipping run');
      return;
    }

    console.log(`[WritingAutoGrade] ${jobs.length} task(s) to grade across ${attempts.length} candidate attempt(s)`);

    let graded = 0, failed = 0;
    for (let i = 0; i < jobs.length; i++) {
      const { attempt, taskNum } = jobs[i];
      const isTask1 = taskNum === 1;
      try {
        const prompt = isTask1 ? (attempt.task1Snapshot?.prompt || '') : (attempt.task2Snapshot?.prompt || '');
        const answer = isTask1 ? (attempt.task1Answer || '') : (attempt.task2Answer || '');
        const wordCount = isTask1 ? (attempt.wordCount1 || 0) : (attempt.wordCount2 || 0);
        const imageUrl = isTask1 ? (attempt.task1Snapshot?.imageUrl || '') : '';

        const gradeResult = await gradeTaskWithAI(taskNum, prompt, answer, wordCount, imageUrl);

        const field = isTask1 ? 'aiGrading.task1' : 'aiGrading.task2';
        await WritingAttempt.findByIdAndUpdate(attempt._id, {
          $set: { [field]: gradeResult, 'aiGrading.generatedAt': new Date(), gradingStatus: 'ai_done' }
        });
        graded++;
      } catch (err) {
        if (err.isOverloaded) {
          // Gemini is overloaded/out of quota right now — every remaining
          // call this run would fail the same way. Stop; the next
          // scheduled run (3h later) picks up whatever's still pending.
          console.error(`[WritingAutoGrade] STOPPED — Gemini overloaded/quota reached (${err.message}). ${jobs.length - i} task(s) left for next run.`);
          break;
        }
        failed++;
        console.error(`[WritingAutoGrade] Task ${taskNum} for attempt ${attempt._id} FAILED: ${err.message}`);
      }
      if (i < jobs.length - 1) await sleep(DELAY_MS);
    }

    console.log(`[WritingAutoGrade] Done. ${graded} graded, ${failed} failed.`);
  } catch (e) {
    console.error('[WritingAutoGrade] Error:', e.message);
  }
}

let task = null;

function start() {
  // Every 3 hours, on the hour (00:00, 03:00, 06:00, ...).
  task = cron.schedule('0 */3 * * *', runAutoGrade);
  console.log('[WritingAutoGrade] Cron scheduled (every 3 hours)');
}

function stop() {
  if (task) task.stop();
}

module.exports = { start, stop, runAutoGrade };
