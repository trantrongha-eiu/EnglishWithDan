'use strict';

/**
 * entranceTestService — the IELTS Entrance Test ("Test đầu vào"): a single
 * 70-minute, 4-section (Grammar 20min/25Q → Reading 20min/13Q → Listening
 * 10min/10Q → Writing 20min/1 task), server-timed, proctored placement
 * assessment.
 *
 * Deliberately NOT built as a thin orchestrator over the existing
 * Reading/Listening/Writing skill pages the way mockTestService.js is for
 * the 4-skill Full Mock Test — Grammar has no existing page/engine to
 * reuse that way, and a full Reading/Listening test (3 passages/40Q, 4
 * parts/40Q) doesn't match this test's 1-passage/13Q, 1-section/10Q shape.
 * Instead this is one dedicated attempt engine (EntranceTestAttempt) that
 * reuses just the GRADING logic already proven in readingService.gradeGroups
 * / listeningService.gradeQuestionGroups, plus the WritingAttempt model +
 * its existing AI-grade cron / admin confirm queue for the Writing section.
 *
 * Server timestamps are the only source of truth for timing — every read
 * and write first calls autoFinalizeIfExpired(), which force-grades and
 * advances past any section whose sectionExpiresAt has already passed. This
 * is genuinely new: no other attempt flow in this codebase enforces a
 * server-side deadline (see the audit note in the design doc — existing
 * exam timers are client-countdown-only).
 */
const mongoose = require('mongoose');
const { AppError, NotFoundError, ValidationError } = require('../errors/AppError');
const EntranceTestConfig = require('../models/EntranceTestConfig');
const EntranceGrammarQuestion = require('../models/EntranceGrammarQuestion');
const EntranceTestAttempt = require('../models/EntranceTestAttempt');
const Passage = require('../models/Passage');
const ListeningSection = require('../models/ListeningSection');
const WritingTask1 = require('../models/WritingTask1');
const WritingAttempt = require('../models/WritingAttempt');
const User = require('../models/User');
const readingService = require('./readingService');
const listeningService = require('./listeningService');
const { levenshtein } = require('../utils/textMatch');
const { entranceBand, roundIeltsHalf } = require('../utils/bandScore');
const { protectListeningAudio } = require('../utils/protectMediaUrls');

const SECTION_ORDER = ['grammar', 'reading', 'listening', 'writing'];
const SECTION_DURATIONS_SEC = {
  grammar: 20 * 60,
  reading: 20 * 60,
  listening: 10 * 60,
  writing: 20 * 60,
};
const PROCTOR_TYPES = ['hidden', 'blur', 'unload-attempt'];
const PROCTOR_EVENT_CAP = 200;

// Deliberately independent of mockTestService's MAX_VIOLATIONS (10, for the
// 4-skill Full Mock Test) — this matches examSimulationService's stricter
// single-skill Simulation threshold instead, per product decision for this
// feature specifically (the Full Mock Test's own threshold is untouched).
const MAX_VIOLATIONS = 5;
const COOLDOWN_SECONDS = 300;

// ── small local helpers ─────────────────────────────────────────────────

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

// Same punctuation-stripping normalize() convention as
// advSentenceService.js / wt1GradingService.js (each grading module keeps
// its own copy deliberately — see textMatch.js's header comment on why
// these aren't unified).
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[.,!?;:'"()‘’“”–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Grades one Grammar item against a raw user answer. mcq: exact option-id
// match. gap_fill/sentence_transform/vn_to_en: normalize + exact/accept-
// array match, then a Levenshtein-ratio near-match (same 0.85+ tolerance
// wt1GradingService/advSentenceService use for free-text answers) so minor
// phrasing/punctuation differences don't fail a genuinely correct answer.
function gradeGrammarItem(item, rawUserAnswer) {
  const userAnswer = (rawUserAnswer == null ? '' : String(rawUserAnswer));
  if (item.type === 'mcq') {
    return userAnswer.trim() !== '' && userAnswer.trim() === String(item.answer || '').trim();
  }
  const u = normalize(userAnswer);
  if (!u) return false;
  const targets = (item.accept || []).map(normalize).filter(Boolean);
  if (targets.includes(u)) return true;
  let best = 0;
  for (const t of targets) {
    const ratio = 1 - levenshtein(u, t) / Math.max(u.length, t.length, 1);
    if (ratio > best) best = ratio;
  }
  return best >= 0.85;
}

function stripGrammarQuestionForClient(q) {
  const { answer, accept, explanation, ...rest } = q; // eslint-disable-line no-unused-vars
  return rest;
}

function stripPassageAnswerKey(passage) {
  if (!passage) return passage;
  const clone = JSON.parse(JSON.stringify(passage));
  const stripQ = (q) => { delete q.correctAnswer; delete q.explanation; };
  (clone.questionGroups || []).forEach(g => (g.questions || []).forEach(stripQ));
  (clone.questions || []).forEach(stripQ);
  return clone;
}

function stripListeningSectionAnswerKey(section) {
  if (!section) return section;
  const clone = JSON.parse(JSON.stringify(section));
  (clone.questionGroups || []).forEach(g => (g.questions || []).forEach(q => {
    delete q.correctAnswer;
    delete q.explanation;
  }));
  return clone;
}

// ── section grading (called from submitSection / autoFinalizeIfExpired) ──

function gradeGrammarSection(attempt) {
  const section = attempt.sections.grammar;
  const answersByQ = {};
  (section.answers || []).forEach(a => { answersByQ[a.questionId] = a.userAnswer; });
  const graded = (section.questionsSnapshot || []).map(q => {
    const qid = String(q._id);
    const userAnswer = answersByQ[qid] || '';
    return { questionId: qid, topic: q.topic || '', userAnswer, correct: gradeGrammarItem(q, userAnswer) };
  });
  section.answers = graded;
  section.correctCount = graded.filter(g => g.correct).length;
  section.totalQuestions = graded.length;
  section.band = entranceBand('grammar', section.correctCount);
}

function gradeReadingSection(attempt) {
  const section = attempt.sections.reading;
  const passage = section.passageSnapshot || {};
  const groups = passage.questionGroups?.length
    ? passage.questionGroups
    : [{ interchangeableAnswers: false, questions: passage.questions || [] }];
  const answersMap = {};
  (section.answers || []).forEach(a => { answersMap[a.questionNumber] = a.userAnswer; });
  const g = readingService.gradeGroups(groups, answersMap);
  section.answers = g.gradedAnswers;
  section.correctCount = g.correctCount;
  section.totalQuestions = g.gradedAnswers.length;
  section.band = entranceBand('reading13', g.correctCount);
}

function gradeListeningSection(attempt) {
  const section = attempt.sections.listening;
  const groups = (section.sectionSnapshot && section.sectionSnapshot.questionGroups) || [];
  const answersMap = {};
  (section.answers || []).forEach(a => { answersMap[a.questionNumber] = a.userAnswer; });
  const { correct, reviewed } = listeningService.gradeQuestionGroups(groups, num => answersMap[num] || '');
  section.answers = reviewed.map(r => ({
    questionNumber: r.questionNumber, userAnswer: r.userAnswer || '',
    correctAnswer: r.correctAnswer, isCorrect: r.isCorrect,
  }));
  section.correctCount = correct;
  section.totalQuestions = reviewed.length;
  section.band = entranceBand('listening10', correct);
}

// Writing is graded asynchronously via the existing infrastructure — this
// just creates a real WritingAttempt (submissionType:'exam', so it flows
// through the same 20-min AI-grade cron + admin WritingGrades.jsx confirm
// queue every other Writing submission does) and records the link.
// section.band stays null until getResult() polls it back.
async function finalizeWritingSection(attempt, userId) {
  const section = attempt.sections.writing;
  const prompt = section.promptSnapshot || {};
  const now = new Date();
  const startedAt = section.startedAt || now;
  const writingAttempt = await WritingAttempt.create({
    userId,
    submissionType: 'exam',
    examName: 'IELTS Entrance Test',
    task1Id: attempt.configSnapshot?.writingTask1Id || undefined,
    task1Snapshot: {
      imageUrl: prompt.imageUrl || '',
      instructions: prompt.instructions || '',
      prompt: prompt.prompt || '',
    },
    task1Answer: section.writingAnswer || '',
    wordCount1: countWords(section.writingAnswer),
    startTime: startedAt,
    submittedAt: now,
    timeTaken: Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 1000)),
    status: 'completed',
    // 'simulation' mode + proctor is already armed at the EntranceTestAttempt
    // level (this test is supervised throughout, per product requirement),
    // so this sub-record is tagged the same way rather than as plain
    // 'practice' — it's informational here (the entrance test's own
    // proctor/violation flow is what actually enforces anything).
    mode: 'simulation',
  });
  section.wordCount = countWords(section.writingAnswer);
  section.writingAttemptId = writingAttempt._id;
}

function recomputeResult(attempt) {
  if (attempt.status === 'disqualified') { attempt.resultStatus = 'DISQUALIFIED'; attempt.overallBand = null; return; }
  if (attempt.status === 'abandoned') { attempt.resultStatus = 'ABANDONED'; attempt.overallBand = null; return; }
  if (attempt.currentSection !== 'done') { attempt.resultStatus = 'IN_PROGRESS'; attempt.overallBand = null; return; }

  const bands = [
    attempt.sections.grammar.band, attempt.sections.reading.band,
    attempt.sections.listening.band, attempt.sections.writing.band,
  ];
  if (bands.some(b => b == null)) {
    attempt.resultStatus = 'PENDING_WRITING';
    attempt.overallBand = null;
    return;
  }
  attempt.overallBand = roundIeltsHalf(bands.reduce((s, b) => s + b, 0) / 4);
  attempt.resultStatus = 'COMPLETED';
}

// Advances the cursor to the next section (stamping its startedAt /
// sectionExpiresAt — the section's CONTENT snapshot is already in place
// from startAttempt(), only the timing fields are set here) or, after
// Writing, marks the whole attempt done.
function advanceCursor(attempt) {
  const idx = SECTION_ORDER.indexOf(attempt.currentSection);
  const next = SECTION_ORDER[idx + 1];
  if (next) {
    attempt.currentSection = next;
    const now = new Date();
    attempt.sections[next].startedAt = now;
    attempt.sections[next].sectionExpiresAt = new Date(now.getTime() + SECTION_DURATIONS_SEC[next] * 1000);
  } else {
    attempt.currentSection = 'done';
    attempt.status = 'completed';
    attempt.completedAt = new Date();
  }
  recomputeResult(attempt);
}

async function gradeAndAdvance(attempt, userId, section) {
  if (section === 'grammar') gradeGrammarSection(attempt);
  else if (section === 'reading') gradeReadingSection(attempt);
  else if (section === 'listening') gradeListeningSection(attempt);
  else if (section === 'writing') await finalizeWritingSection(attempt, userId);
  attempt.sections[section].submittedAt = new Date();
  advanceCursor(attempt);
}

// The sole timer-expiry enforcement point — called at the top of every
// read (getAttemptForClient/getResult) and write (saveAnswer/submitSection)
// so a refresh, a resumed tab, or simply the next request after time ran
// out all self-correct without depending on a cron job. Loops in case the
// student was away long enough for more than one section to have expired.
async function autoFinalizeIfExpired(attempt) {
  let changed = false;
  while (attempt.status === 'in-progress' && attempt.currentSection !== 'done') {
    const cur = attempt.sections[attempt.currentSection];
    if (!cur.sectionExpiresAt || cur.sectionExpiresAt.getTime() > Date.now()) break;
    await gradeAndAdvance(attempt, attempt.userId, attempt.currentSection);
    changed = true;
  }
  if (changed) await attempt.save();
  return changed;
}

// Mongoose's optimistic-concurrency versionKey (__v) throws a VersionError
// when two requests race to .save() the same attempt doc — genuinely
// reachable here: only free-text 'input' events are debounced client-side
// (entrance-test.js's wireSectionInputs), so a student clicking several
// Grammar/Reading/Listening radio or checkbox answers in quick succession
// fires one un-debounced saveAnswer POST per click, each doing its own
// load→mutate→save. Left unhandled this surfaced as a raw 500 that
// saveAnswer's own client-side .catch() silently swallows (it only handles
// 409) — an answer could be lost with no visible error. Retrying re-runs
// the whole load→mutate→save cycle against the freshest doc, so this is
// only safe to wrap around a function with no side effects beyond that
// save (see recordViolation's placement of its User.updateOne below).
async function withVersionRetry(fn, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e && e.name === 'VersionError' && i < maxAttempts - 1) continue;
      throw e;
    }
  }
}

async function loadOwnedAttempt(userId, attemptId) {
  if (!mongoose.isValidObjectId(attemptId)) throw new NotFoundError('Không tìm thấy bài làm');
  const attempt = await EntranceTestAttempt.findOne({ _id: attemptId, userId });
  if (!attempt) throw new NotFoundError('Không tìm thấy bài làm');
  return attempt;
}

// ── cooldown (mirrors examSimulationService.assertNotOnCooldown, own
// User.entranceTestCooldownUntil field so a disqualification here doesn't
// also lock out ordinary Reading/Listening/Writing Simulation practice) ──

async function assertNotOnCooldown(userId) {
  const user = await User.findById(userId).select('entranceTestCooldownUntil').lean();
  const untilMs = user && user.entranceTestCooldownUntil ? new Date(user.entranceTestCooldownUntil).getTime() : 0;
  const remainingMs = untilMs - Date.now();
  if (remainingMs <= 0) return;
  const err = new AppError(
    `Bạn vừa bị huỷ một lượt Test đầu vào do vi phạm giám sát quá ${MAX_VIOLATIONS} lần. `
    + `Vui lòng đợi ít phút rồi thử lại.`,
    429
  );
  err.cooldownSeconds = Math.ceil(remainingMs / 1000);
  throw err;
}

// ── public API ───────────────────────────────────────────────────────────

// Landing-page info — deliberately no answer-key-bearing content, just the
// fixed structure plus whether the test is currently configured at all.
async function getConfig() {
  const config = await EntranceTestConfig.findOne({ isActive: true }).lean();
  return {
    available: !!(config && config.readingPassageId && config.listeningSectionId && config.writingTask1Id),
    totalMinutes: 70,
    sections: [
      { key: 'grammar', label: 'Grammar', minutes: 20, questionCount: 25 },
      { key: 'reading', label: 'Reading', minutes: 20, questionCount: 13 },
      { key: 'listening', label: 'Listening', minutes: 10, questionCount: 10 },
      { key: 'writing', label: 'Writing', minutes: 20, questionCount: 1 },
    ],
  };
}

async function startAttempt(userId) {
  await assertNotOnCooldown(userId);

  const existing = await EntranceTestAttempt.findOne({ userId, status: 'in-progress' }).select('_id').lean();
  if (existing) return { resumed: true, attemptId: existing._id };

  // Self-serve retake: a student who already has a finished (completed/
  // disqualified/abandoned) attempt is free to start a brand new one —
  // every past attempt stays on record (getHistory) for both the student
  // and the admin attempt monitor, so nothing is lost by allowing this.
  const config = await EntranceTestConfig.findOne({ isActive: true }).lean();
  if (!config) throw new AppError('Test đầu vào chưa được cấu hình, vui lòng liên hệ quản trị viên', 503);

  const [passage, listeningSection, writingTask1, grammarQuestions] = await Promise.all([
    config.readingPassageId ? Passage.findById(config.readingPassageId).lean() : null,
    config.listeningSectionId ? ListeningSection.findById(config.listeningSectionId).lean() : null,
    config.writingTask1Id ? WritingTask1.findById(config.writingTask1Id).lean() : null,
    EntranceGrammarQuestion.find({ setKey: config.grammarSetKey || 'default', isActive: true }).sort({ order: 1, createdAt: 1 }).limit(25).lean(),
  ]);
  if (!passage || !listeningSection || !writingTask1 || grammarQuestions.length < 1) {
    throw new AppError('Nội dung Test đầu vào chưa đầy đủ, vui lòng liên hệ quản trị viên', 503);
  }

  const now = new Date();
  const attempt = await EntranceTestAttempt.create({
    userId,
    status: 'in-progress',
    resultStatus: 'IN_PROGRESS',
    configSnapshot: {
      readingPassageId: config.readingPassageId,
      listeningSectionId: config.listeningSectionId,
      writingTask1Id: config.writingTask1Id,
      grammarSetKey: config.grammarSetKey || 'default',
    },
    currentSection: 'grammar',
    startedAt: now,
    sections: {
      grammar: {
        startedAt: now,
        sectionExpiresAt: new Date(now.getTime() + SECTION_DURATIONS_SEC.grammar * 1000),
        questionsSnapshot: grammarQuestions,
      },
      // Content frozen NOW, at attempt start, even though the student won't
      // reach these sections for a while yet — guarantees a later admin
      // edit can't change this attempt's questions/answer key mid-run
      // (spec §24). Only startedAt/sectionExpiresAt are set lazily, by
      // advanceCursor(), when the student actually reaches each one.
      reading: { passageSnapshot: passage },
      listening: { sectionSnapshot: listeningSection, audioUrlSnapshot: listeningSection.audioUrl || '' },
      writing: {
        promptSnapshot: { imageUrl: writingTask1.imageUrl || '', instructions: writingTask1.instructions || '', prompt: writingTask1.prompt || '' },
      },
    },
  });

  return { resumed: false, attemptId: attempt._id };
}

// Never returns an answer key, regardless of section state — getResult()
// is the only place that reveals correct answers, and only once the whole
// attempt is terminal.
async function getAttemptForClient(userId, attemptId) {
  const attempt = await loadOwnedAttempt(userId, attemptId);
  await autoFinalizeIfExpired(attempt);
  const a = attempt.toObject();

  const payload = {
    _id: a._id,
    status: a.status,
    resultStatus: a.resultStatus,
    currentSection: a.currentSection,
    startedAt: a.startedAt,
    serverNow: new Date(),
    sections: {
      grammar: {
        startedAt: a.sections.grammar.startedAt,
        sectionExpiresAt: a.sections.grammar.sectionExpiresAt,
        submittedAt: a.sections.grammar.submittedAt,
        totalQuestions: (a.sections.grammar.questionsSnapshot || []).length,
        questions: (a.sections.grammar.questionsSnapshot || []).map(stripGrammarQuestionForClient),
        answers: (a.sections.grammar.answers || []).map(({ questionId, userAnswer }) => ({ questionId, userAnswer })),
      },
      reading: {
        startedAt: a.sections.reading.startedAt,
        sectionExpiresAt: a.sections.reading.sectionExpiresAt,
        submittedAt: a.sections.reading.submittedAt,
        passage: stripPassageAnswerKey(a.sections.reading.passageSnapshot),
        answers: (a.sections.reading.answers || []).map(({ questionNumber, userAnswer }) => ({ questionNumber, userAnswer })),
      },
      listening: {
        startedAt: a.sections.listening.startedAt,
        sectionExpiresAt: a.sections.listening.sectionExpiresAt,
        submittedAt: a.sections.listening.submittedAt,
        section: stripListeningSectionAnswerKey(a.sections.listening.sectionSnapshot),
        audioUrlSnapshot: a.sections.listening.audioUrlSnapshot,
        answers: (a.sections.listening.answers || []).map(({ questionNumber, userAnswer }) => ({ questionNumber, userAnswer })),
      },
      writing: {
        startedAt: a.sections.writing.startedAt,
        sectionExpiresAt: a.sections.writing.sectionExpiresAt,
        submittedAt: a.sections.writing.submittedAt,
        prompt: a.sections.writing.promptSnapshot,
        writingAnswer: a.sections.writing.writingAnswer,
        wordCount: a.sections.writing.wordCount,
      },
    },
  };
  return protectListeningAudio(payload, String(userId));
}

// Autosaves a single answer as a draft (ungraded — grading only happens at
// submitSection/autoFinalizeIfExpired). Only ever reads the specific named
// field(s) it expects out of `payload`; any other keys a client might send
// (correctCount/band/score/...) are simply never looked at.
async function saveAnswer(userId, attemptId, section, payload = {}) {
  if (!SECTION_ORDER.includes(section)) throw new ValidationError('Phần thi không hợp lệ');
  return withVersionRetry(async () => {
    const attempt = await loadOwnedAttempt(userId, attemptId);
    await autoFinalizeIfExpired(attempt);

    if (attempt.status !== 'in-progress') throw new AppError('Bài làm đã kết thúc', 409);
    if (attempt.currentSection !== section) throw new AppError(`Phần hiện tại là ${attempt.currentSection}, không phải ${section}`, 409);

    if (section === 'grammar') {
      const questionId = String(payload.questionId || '');
      if (!questionId) throw new ValidationError('Thiếu questionId');
      const list = attempt.sections.grammar.answers;
      const idx = list.findIndex(a => a.questionId === questionId);
      const userAnswer = payload.answer == null ? '' : String(payload.answer);
      if (idx === -1) list.push({ questionId, topic: '', userAnswer, correct: false });
      else list[idx].userAnswer = userAnswer;
    } else if (section === 'reading' || section === 'listening') {
      const questionNumber = Number(payload.questionNumber);
      if (!Number.isFinite(questionNumber)) throw new ValidationError('Thiếu questionNumber');
      const list = attempt.sections[section].answers;
      const idx = list.findIndex(a => a.questionNumber === questionNumber);
      const userAnswer = payload.answer == null ? '' : String(payload.answer);
      if (idx === -1) list.push({ questionNumber, userAnswer, correctAnswer: '', isCorrect: false });
      else list[idx].userAnswer = userAnswer;
    } else if (section === 'writing') {
      const writingAnswer = payload.writingAnswer == null ? '' : String(payload.writingAnswer);
      attempt.sections.writing.writingAnswer = writingAnswer;
      attempt.sections.writing.wordCount = countWords(writingAnswer);
    }

    await attempt.save();
    return { status: 'ok' };
  });
}

async function submitSection(userId, attemptId, section) {
  if (!SECTION_ORDER.includes(section)) throw new ValidationError('Phần thi không hợp lệ');
  return withVersionRetry(async () => {
    const attempt = await loadOwnedAttempt(userId, attemptId);
    await autoFinalizeIfExpired(attempt);

    if (attempt.status !== 'in-progress') throw new AppError('Bài làm đã kết thúc', 409);
    // Idempotency: a legitimate double-submit (client retry) of a section
    // that's already been recorded is a no-op that just returns current
    // state, rather than erroring — same shape as mockTestService.advance()'s
    // "already done" branch. A submit for anything OTHER than the current
    // section (an attempt to go back and redo a past one) is rejected.
    if (attempt.sections[section].submittedAt) {
      if (attempt.currentSection === section || SECTION_ORDER.indexOf(attempt.currentSection) > SECTION_ORDER.indexOf(section)) {
        return attempt;
      }
    }
    if (attempt.currentSection !== section) throw new AppError(`Phần hiện tại là ${attempt.currentSection}, không phải ${section}`, 409);

    await gradeAndAdvance(attempt, userId, section);
    await attempt.save();
    return attempt;
  });
}

function buildGrammarWeaknesses(answers) {
  const byTopic = {};
  (answers || []).forEach(a => {
    const t = a.topic || 'Khác';
    if (!byTopic[t]) byTopic[t] = { topic: t, correct: 0, total: 0 };
    byTopic[t].total++;
    if (a.correct) byTopic[t].correct++;
  });
  return Object.values(byTopic)
    .filter(t => t.total >= 2) // only meaningful with at least 2 questions on the topic
    .map(t => {
      const accuracy = t.total ? t.correct / t.total : 0;
      const level = accuracy < 0.6 ? 'Weak' : accuracy < 0.8 ? 'Developing' : 'Strong';
      return { topic: t.topic, correct: t.correct, total: t.total, accuracyPct: Math.round(accuracy * 100), level };
    });
}

function sectionTimeUsedSec(section) {
  if (!section.startedAt || !section.submittedAt) return 0;
  return Math.max(0, Math.round((new Date(section.submittedAt).getTime() - new Date(section.startedAt).getTime()) / 1000));
}

// Only callable once the attempt is no longer 'in-progress' — this is the
// one place correct answers/explanations are revealed to the student,
// which is safe here because every section is already locked (submitted).
async function getResult(userId, attemptId) {
  const attempt = await loadOwnedAttempt(userId, attemptId);
  await autoFinalizeIfExpired(attempt);
  if (attempt.status === 'in-progress') throw new AppError('Bài làm chưa hoàn thành', 409);

  // Poll the linked WritingAttempt for a since-appeared band (mirrors
  // mockTestService.readBand()'s lazy re-check pattern).
  const writingSection = attempt.sections.writing;
  if (writingSection.writingAttemptId && writingSection.band == null) {
    const wa = await WritingAttempt.findById(writingSection.writingAttemptId).select('grading.overallBand').lean();
    const band = wa?.grading?.overallBand;
    if (band != null) {
      writingSection.band = band;
      recomputeResult(attempt);
      await attempt.save();
    }
  }

  const a = attempt.toObject();
  const grammarAnswersById = {};
  (a.sections.grammar.answers || []).forEach(x => { grammarAnswersById[x.questionId] = x; });

  const payload = {
    _id: a._id,
    status: a.status,
    resultStatus: a.resultStatus,
    overallBand: a.overallBand,
    startedAt: a.startedAt,
    completedAt: a.completedAt,
    sections: {
      grammar: {
        correctCount: a.sections.grammar.correctCount,
        totalQuestions: a.sections.grammar.totalQuestions,
        band: a.sections.grammar.band,
        questions: (a.sections.grammar.questionsSnapshot || []).map(q => {
          const ans = grammarAnswersById[String(q._id)] || {};
          return {
            questionId: String(q._id), topic: q.topic, type: q.type, prompt: q.prompt,
            options: q.options,
            correctAnswer: q.type === 'mcq' ? q.answer : (q.accept || [])[0],
            acceptedAnswers: q.type === 'mcq' ? undefined : q.accept,
            explanation: q.explanation || '',
            userAnswer: ans.userAnswer || '', correct: !!ans.correct,
          };
        }),
      },
      reading: {
        correctCount: a.sections.reading.correctCount,
        totalQuestions: a.sections.reading.totalQuestions,
        band: a.sections.reading.band,
        passageTitle: a.sections.reading.passageSnapshot?.title || '',
        answers: a.sections.reading.answers || [],
      },
      listening: {
        correctCount: a.sections.listening.correctCount,
        totalQuestions: a.sections.listening.totalQuestions,
        band: a.sections.listening.band,
        sectionTitle: a.sections.listening.sectionSnapshot?.title || '',
        answers: a.sections.listening.answers || [],
      },
      writing: {
        wordCount: a.sections.writing.wordCount,
        band: a.sections.writing.band,
        status: a.sections.writing.band != null ? 'graded' : 'pending_review',
        writingAnswer: a.sections.writing.writingAnswer,
      },
    },
    timeUsedSec: {
      grammar: sectionTimeUsedSec(a.sections.grammar),
      reading: sectionTimeUsedSec(a.sections.reading),
      listening: sectionTimeUsedSec(a.sections.listening),
      writing: sectionTimeUsedSec(a.sections.writing),
    },
    grammarWeaknesses: buildGrammarWeaknesses(a.sections.grammar.answers),
  };
  return payload;
}

async function recordViolation(userId, attemptId, { type }) {
  if (!PROCTOR_TYPES.includes(type)) throw new ValidationError('Loại vi phạm không hợp lệ');
  const result = await withVersionRetry(async () => {
    const attempt = await loadOwnedAttempt(userId, attemptId);

    if (attempt.status !== 'in-progress') {
      const dq = attempt.status === 'disqualified';
      return {
        violationCount: attempt.proctor.violationCount || 0,
        violated: !!attempt.proctor.violated,
        disqualified: dq,
        cooldownSeconds: dq ? COOLDOWN_SECONDS : 0,
      };
    }

    attempt.proctor.violationCount = (attempt.proctor.violationCount || 0) + 1;
    attempt.proctor.violated = true;
    attempt.proctor.events.push({ type, at: new Date() });
    if (attempt.proctor.events.length > PROCTOR_EVENT_CAP) {
      attempt.proctor.events = attempt.proctor.events.slice(-PROCTOR_EVENT_CAP);
    }

    // Scoped to this attempt of the retry loop (not a shared outer variable)
    // so a VersionError'd save can't leave a stale true behind for the next
    // reload-and-retry pass to read.
    let disqualified = false;
    if (attempt.proctor.violationCount > MAX_VIOLATIONS) {
      attempt.status = 'disqualified';
      attempt.proctor.disqualifiedAt = new Date();
      disqualified = true;
      recomputeResult(attempt);
    }
    await attempt.save();

    return {
      violationCount: attempt.proctor.violationCount,
      violated: true,
      disqualified,
      cooldownSeconds: disqualified ? COOLDOWN_SECONDS : 0,
    };
  });

  if (result.disqualified) {
    await User.updateOne(
      { _id: userId },
      { $set: { entranceTestCooldownUntil: new Date(Date.now() + COOLDOWN_SECONDS * 1000) } }
    );
  }

  return result;
}

async function getHistory(userId) {
  const attempts = await EntranceTestAttempt.find({ userId })
    .sort({ createdAt: -1 })
    .select('status resultStatus overallBand startedAt completedAt createdAt')
    .lean();
  return { attempts };
}

// ── admin ────────────────────────────────────────────────────────────────

async function getAdminConfig() {
  const config = await EntranceTestConfig.findOne({ isActive: true })
    .populate('readingPassageId', 'title category isActive')
    .populate('listeningSectionId', 'title partNumber isActive')
    .populate('writingTask1Id', 'prompt isActive')
    .lean();
  const grammarSetKey = config?.grammarSetKey || 'default';
  const grammarCount = await EntranceGrammarQuestion.countDocuments({ setKey: grammarSetKey, isActive: true });
  return { config, grammarCount };
}

async function updateAdminConfig(data, actorId) {
  const { readingPassageId, listeningSectionId, writingTask1Id, grammarSetKey } = data || {};
  const config = await EntranceTestConfig.findOneAndUpdate(
    { isActive: true },
    {
      $set: {
        readingPassageId: readingPassageId || null,
        listeningSectionId: listeningSectionId || null,
        writingTask1Id: writingTask1Id || null,
        grammarSetKey: (grammarSetKey && String(grammarSetKey).trim()) || 'default',
        isActive: true,
        updatedBy: actorId,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return config;
}

function validateGrammarQuestionPayload(data) {
  const { topic, type, prompt } = data || {};
  if (!topic || !String(topic).trim()) throw new ValidationError('Thiếu chủ điểm ngữ pháp (topic)');
  if (!['mcq', 'gap_fill', 'sentence_transform', 'vn_to_en'].includes(type)) throw new ValidationError('Loại câu hỏi không hợp lệ');
  if (!prompt || !String(prompt).trim()) throw new ValidationError('Thiếu nội dung câu hỏi');
  if (type === 'mcq') {
    if (!Array.isArray(data.options) || data.options.length < 2) throw new ValidationError('Câu trắc nghiệm cần ít nhất 2 lựa chọn');
    if (!data.answer || !data.options.some(o => o.id === data.answer)) throw new ValidationError('Đáp án đúng không khớp với danh sách lựa chọn');
  } else {
    if (!Array.isArray(data.accept) || data.accept.filter(Boolean).length < 1) throw new ValidationError('Cần ít nhất một đáp án chấp nhận được');
  }
}

function sanitizeGrammarQuestionPayload(data) {
  return {
    setKey: (data.setKey && String(data.setKey).trim()) || 'default',
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
    topic: String(data.topic).trim(),
    type: data.type,
    prompt: String(data.prompt),
    options: data.type === 'mcq' ? (data.options || []).map(o => ({ id: String(o.id), text: String(o.text) })) : undefined,
    answer: data.type === 'mcq' ? String(data.answer) : undefined,
    accept: data.type === 'mcq' ? [] : (data.accept || []).map(String).filter(Boolean),
    explanation: data.explanation ? String(data.explanation) : '',
    isActive: data.isActive !== false,
  };
}

async function listGrammarQuestions(setKey) {
  return EntranceGrammarQuestion.find({ setKey: setKey || 'default' }).sort({ order: 1, createdAt: 1 }).lean();
}

async function createGrammarQuestion(data) {
  validateGrammarQuestionPayload(data);
  return EntranceGrammarQuestion.create(sanitizeGrammarQuestionPayload(data));
}

async function updateGrammarQuestion(id, data) {
  validateGrammarQuestionPayload(data);
  const q = await EntranceGrammarQuestion.findByIdAndUpdate(id, sanitizeGrammarQuestionPayload(data), { new: true });
  if (!q) throw new NotFoundError('Không tìm thấy câu hỏi');
  return q;
}

async function deleteGrammarQuestion(id) {
  const q = await EntranceGrammarQuestion.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!q) throw new NotFoundError('Không tìm thấy câu hỏi');
  return { status: 'ok' };
}

async function listAdminAttempts({ page = 1, limit = 50, userId, status } = {}) {
  const filter = {};
  if (userId) filter.userId = userId;
  if (status) filter.status = status;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(200, Math.max(1, Number(limit) || 50));
  const [attempts, total] = await Promise.all([
    EntranceTestAttempt.find(filter)
      .populate('userId', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .select('-sections.grammar.questionsSnapshot -sections.reading.passageSnapshot -sections.listening.sectionSnapshot -sections.writing.promptSnapshot')
      .lean(),
    EntranceTestAttempt.countDocuments(filter),
  ]);
  return { attempts, total };
}

async function getAdminAttemptDetail(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const attempt = await EntranceTestAttempt.findById(id)
    .populate('userId', 'firstName lastName username email')
    .select('-sections.grammar.questionsSnapshot -sections.reading.passageSnapshot -sections.listening.sectionSnapshot -sections.writing.promptSnapshot')
    .lean();
  if (!attempt) return null;
  if (attempt.sections?.writing?.writingAttemptId) {
    const wa = await WritingAttempt.findById(attempt.sections.writing.writingAttemptId).select('gradingStatus grading.overallBand').lean();
    if (wa) {
      attempt.sections.writing.gradingStatus = wa.gradingStatus;
      if (wa.grading?.overallBand != null) attempt.sections.writing.band = wa.grading.overallBand;
    }
  }
  return attempt;
}

module.exports = {
  SECTION_ORDER,
  SECTION_DURATIONS_SEC,
  MAX_VIOLATIONS,
  COOLDOWN_SECONDS,
  getConfig,
  startAttempt,
  getAttemptForClient,
  saveAnswer,
  submitSection,
  getResult,
  recordViolation,
  getHistory,
  // admin
  getAdminConfig,
  updateAdminConfig,
  listGrammarQuestions,
  createGrammarQuestion,
  updateGrammarQuestion,
  deleteGrammarQuestion,
  listAdminAttempts,
  getAdminAttemptDetail,
};
