'use strict';

/**
 * entranceTestService — the IELTS Entrance Test ("Test đầu vào"): a single
 * 74-minute, 5-section (Grammar 20min/25Q → Reading 20min/13Q → Listening
 * 10min/10Q → Writing 20min/1 task → Speaking 4min/1 Part 2 cue card),
 * server-timed, proctored placement assessment.
 *
 * Deliberately NOT built as a thin orchestrator over the existing
 * Reading/Listening/Writing skill pages the way mockTestService.js is for
 * the 4-skill Full Mock Test — Grammar has no existing page/engine to
 * reuse that way, and a full Reading/Listening test (3 passages/40Q, 4
 * parts/40Q) doesn't match this test's 1-passage/13Q, 1-section/10Q shape.
 * Instead this is one dedicated attempt engine (EntranceTestAttempt) that
 * reuses just the GRADING logic already proven in readingService.gradeGroups
 * / listeningService.gradeQuestionGroups, the WritingAttempt model + its
 * AI-grade cron for Writing, and speakingService.gradeSpeaking for Speaking.
 *
 * Content: every attempt draws its Reading passage, Listening section,
 * Writing Task 1 and Speaking cue card AT RANDOM from the live bank (see
 * CONTENT_POOLS), preferring items this student hasn't had in an earlier
 * attempt; Grammar uses the configured 25-question set in a shuffled order.
 *
 * Results: Grammar/Reading/Listening grade instantly; Writing and Speaking
 * get an AI suggestion in the background. Once the Writing suggestion is
 * in, the attempt sits at PENDING_REVIEW — an admin reviews the compiled
 * bands (and can adjust Writing/Speaking), then approves, which is when the
 * student first sees any score and gets an inbox message.
 *
 * Server timestamps are the only source of truth for timing — every read
 * and write first calls autoFinalizeIfExpired(), which force-grades and
 * advances past any section whose sectionExpiresAt has already passed.
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
const SpeakingQuestion = require('../models/SpeakingQuestion');
const Message = require('../models/Message');
const User = require('../models/User');
const readingService = require('./readingService');
const listeningService = require('./listeningService');
const { levenshtein } = require('../utils/textMatch');
const { entranceBand, roundIeltsHalf } = require('../utils/bandScore');
const { protectListeningAudio } = require('../utils/protectMediaUrls');
const logger = require('../utils/logger');

const SECTION_ORDER = ['grammar', 'reading', 'listening', 'writing', 'speaking'];
// Attempts started before Speaking was added have no speaking snapshot and
// end after Writing — see isLegacyAttempt().
const LEGACY_SECTION_ORDER = ['grammar', 'reading', 'listening', 'writing'];
const SECTION_DURATIONS_SEC = {
  grammar: 20 * 60,
  reading: 20 * 60,
  listening: 10 * 60,
  writing: 20 * 60,
  // Part 2 only: 1:10 prep + up to 2:00 speaking + ~50s to check/submit.
  speaking: 4 * 60,
};
// Extra server-side time past sectionExpiresAt before a section is force-
// finalized. Speaking needs it: the client auto-submits at 0:00 WITH the
// recording, and that upload must be allowed to land instead of racing an
// audio-less auto-finalize.
const SUBMIT_GRACE_SEC = { speaking: 60 };
const SPEAKING_PREP_SEC = 70;
const SPEAKING_MAX_SEC = 120;
const SPEAKING_TRANSCRIPT_MAX = 10000;

// What each section may be drawn from (product decision, 2026-09-24):
// Reading = a Passage 2 (13 questions, 20 minutes). Listening = a Part 3
// section with a known audio length that fits the 10-minute section after
// the 30s read-ahead. Hidden (isActive:false) content is never drawn.
const CONTENT_POOLS = {
  reading:   { model: Passage, match: { category: 'passage2', isActive: true } },
  listening: { model: ListeningSection, match: { partNumber: 3, isActive: true, audioUrl: { $nin: ['', null] }, audioDuration: { $gt: 0, $lte: 540 } } },
  writing:   { model: WritingTask1, match: { isActive: true, imageUrl: { $nin: ['', null] } } },
  speaking:  { model: SpeakingQuestion, match: { part: 2, isActive: true, cueCard: { $nin: ['', null] } } },
};
const GRAMMAR_QUESTION_COUNT = 25;

const PROCTOR_TYPES = ['hidden', 'blur', 'unload-attempt'];
const PROCTOR_EVENT_CAP = 200;

// Deliberately independent of mockTestService's MAX_VIOLATIONS (10, for the
// 4-skill Full Mock Test) — this matches examSimulationService's stricter
// single-skill Simulation threshold instead, per product decision for this
// feature specifically (the Full Mock Test's own threshold is untouched).
const MAX_VIOLATIONS = 5;
const COOLDOWN_SECONDS = 300;

// Background AI grading (Writing/Speaking suggestions) is fire-and-forget
// after the response; jest runs would otherwise hit the real AI APIs and
// outlive the test's DB connection.
const BACKGROUND_AI = process.env.NODE_ENV !== 'test';

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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValidBand(n) {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 9 && Number.isInteger(n * 2);
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

// Attempts started before the Speaking section existed: no cue card was
// ever drawn for them. They keep their original 4-section flow and their
// original "complete once the teacher confirms Writing" result rule.
function isLegacyAttempt(a) {
  return !(a && a.sections && a.sections.speaking && a.sections.speaking.questionSnapshot);
}

function sectionOrderFor(a) {
  return isLegacyAttempt(a) ? LEGACY_SECTION_ORDER : SECTION_ORDER;
}

// Queued side effects that must run only once the save that recorded the
// section transition has actually won (see saveAndRunHooks) — a
// VersionError'd loser never runs its copy.
function queueAfterSave(attempt, fn) {
  if (!attempt.$locals.afterSave) attempt.$locals.afterSave = [];
  attempt.$locals.afterSave.push(fn);
}

async function saveAndRunHooks(attempt) {
  await attempt.save();
  const hooks = attempt.$locals.afterSave || [];
  attempt.$locals.afterSave = [];
  hooks.forEach(fn => {
    Promise.resolve().then(fn).catch(err => logger.error('entrance-test', 'after-save task failed', {
      attemptId: String(attempt._id), errorMessage: err && err.message,
    }));
  });
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

// Writing is graded asynchronously — this creates a real WritingAttempt
// (submissionType:'exam', so it also shows in the admin WritingGrades.jsx
// queue) and records the link. EXACTLY ONE WritingAttempt per entrance
// attempt, however many requests race here: the id is claimed atomically
// on the entrance attempt first, and the WritingAttempt is created WITH
// that _id, so a second creator just hits a duplicate-key error. (Before,
// every racing submit/expiry re-sync created its own — one student's Task 1
// landed in the admin queue three times.)
async function finalizeWritingSection(attempt, userId) {
  const section = attempt.sections.writing;
  const prompt = section.promptSnapshot || {};
  const answer = section.writingAnswer || '';
  section.wordCount = countWords(answer);

  let waId = section.writingAttemptId;
  if (!waId) {
    const candidate = new mongoose.Types.ObjectId();
    const claim = await EntranceTestAttempt.updateOne(
      { _id: attempt._id, 'sections.writing.writingAttemptId': null },
      { $set: { 'sections.writing.writingAttemptId': candidate } }
    );
    if (claim.modifiedCount === 1) {
      waId = candidate;
    } else {
      const fresh = await EntranceTestAttempt.findById(attempt._id).select('sections.writing.writingAttemptId').lean();
      waId = fresh && fresh.sections && fresh.sections.writing && fresh.sections.writing.writingAttemptId;
      if (!waId) throw new AppError('Bài Writing đang được nộp, vui lòng đợi giây lát', 409);
    }
    section.writingAttemptId = waId;
  }

  const now = new Date();
  const startedAt = section.startedAt || now;
  try {
    await WritingAttempt.create({
      _id: waId,
      userId,
      submissionType: 'exam',
      examName: 'IELTS Entrance Test',
      task1Id: attempt.configSnapshot?.writingTask1Id || undefined,
      task1Snapshot: {
        imageUrl: prompt.imageUrl || '',
        instructions: prompt.instructions || '',
        prompt: prompt.prompt || '',
      },
      task1Answer: answer,
      wordCount1: section.wordCount,
      startTime: startedAt,
      submittedAt: now,
      timeTaken: Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 1000)),
      status: 'completed',
      // Informational only — the entrance test's own proctor/violation
      // flow is what actually enforces anything.
      mode: 'simulation',
    });
  } catch (e) {
    if (!e || e.code !== 11000) throw e; // already created by a racing request — that's the point
  }

  if (!isLegacyAttempt(attempt)) {
    if (!answer.trim()) {
      // Nothing written: the AI cron never grades an empty essay, so
      // without this the attempt would wait on PENDING_WRITING forever.
      section.aiBand = 0;
    } else {
      const attemptId = attempt._id;
      queueAfterSave(attempt, () => gradeWritingNow(attemptId, waId));
    }
  }
}

// Speaking: records the final transcript/duration/recording and queues the
// AI suggestion. `extras` only comes from a real submit — an expiry
// auto-finalize grades whatever transcript was autosaved.
function finalizeSpeakingSection(attempt, extras = {}) {
  const sp = attempt.sections.speaking;
  if (typeof extras.transcript === 'string') sp.transcript = extras.transcript.slice(0, SPEAKING_TRANSCRIPT_MAX);
  if (extras.durationSec != null) {
    const d = Math.round(Number(extras.durationSec));
    sp.durationSec = Number.isFinite(d) ? Math.max(0, Math.min(SPEAKING_MAX_SEC + 15, d)) : 0;
  }
  if (extras.audio && extras.audio.url) {
    sp.audioUrl = extras.audio.url;
    sp.audioPublicId = extras.audio.publicId || '';
    sp.audioMimeType = extras.audio.mimetype || '';
  }

  const hasContent = !!(String(sp.transcript || '').trim() || sp.audioUrl || extras.audioBuffer);
  if (!hasContent) {
    sp.aiStatus = 'done';
    sp.aiBand = 0;
    sp.aiFeedback = { noGenuineAnswer: true };
    return;
  }
  sp.aiStatus = 'pending';
  const attemptId = attempt._id;
  const audio = extras.audioBuffer ? { buffer: extras.audioBuffer, mimetype: extras.audio?.mimetype || '' } : null;
  queueAfterSave(attempt, () => gradeSpeakingNow(attemptId, audio));
}

// Proposed per-section + overall bands for the admin review — final bands
// (admin-approved) win over AI suggestions. overall is null until every
// section has a band.
function proposeResult(a) {
  const s = a.sections || {};
  const legacy = isLegacyAttempt(a);
  const pick = (sec) => (sec && sec.band != null ? sec.band : (sec && sec.aiBand != null ? sec.aiBand : null));
  const bands = {
    grammar: s.grammar ? s.grammar.band : null,
    reading: s.reading ? s.reading.band : null,
    listening: s.listening ? s.listening.band : null,
    writing: pick(s.writing),
  };
  if (!legacy) bands.speaking = pick(s.speaking);
  const values = Object.values(bands);
  const overall = values.every(b => b != null)
    ? roundIeltsHalf(values.reduce((sum, b) => sum + b, 0) / values.length)
    : null;
  return { bands, overall };
}

function recomputeResult(attempt) {
  if (attempt.status === 'disqualified') { attempt.resultStatus = 'DISQUALIFIED'; attempt.overallBand = null; return; }
  if (attempt.status === 'abandoned') { attempt.resultStatus = 'ABANDONED'; attempt.overallBand = null; return; }
  if (attempt.currentSection !== 'done') { attempt.resultStatus = 'IN_PROGRESS'; attempt.overallBand = null; return; }

  if (isLegacyAttempt(attempt)) {
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
    return;
  }

  // overallBand was fixed at approval time (approveAttempt) — leave it.
  if (attempt.review && attempt.review.approvedAt) { attempt.resultStatus = 'COMPLETED'; return; }
  attempt.overallBand = null;
  const w = attempt.sections.writing;
  attempt.resultStatus = (w.band == null && w.aiBand == null) ? 'PENDING_WRITING' : 'PENDING_REVIEW';
}

// Advances the cursor to the next section (stamping its startedAt /
// sectionExpiresAt — the section's CONTENT snapshot is already in place
// from startAttempt(), only the timing fields are set here) or, after the
// last section, marks the whole attempt done.
function advanceCursor(attempt) {
  const order = sectionOrderFor(attempt);
  const idx = order.indexOf(attempt.currentSection);
  const next = order[idx + 1];
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

async function gradeAndAdvance(attempt, userId, section, extras) {
  if (section === 'grammar') gradeGrammarSection(attempt);
  else if (section === 'reading') gradeReadingSection(attempt);
  else if (section === 'listening') gradeListeningSection(attempt);
  else if (section === 'writing') await finalizeWritingSection(attempt, userId);
  else if (section === 'speaking') finalizeSpeakingSection(attempt, extras);
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
    const graceMs = (SUBMIT_GRACE_SEC[attempt.currentSection] || 0) * 1000;
    if (!cur.sectionExpiresAt || cur.sectionExpiresAt.getTime() + graceMs > Date.now()) break;
    await gradeAndAdvance(attempt, attempt.userId, attempt.currentSection, {});
    changed = true;
  }
  if (changed) await saveAndRunHooks(attempt);
  return changed;
}

// Mongoose's optimistic-concurrency versionKey (__v — checked on EVERY
// save, see the model's optimisticConcurrency option) throws a VersionError
// when two requests race to .save() the same attempt doc. Retrying re-runs
// the whole load→mutate→save cycle against the freshest doc, so this is
// only safe to wrap around a function whose side effects are idempotent or
// deferred to after the save (finalizeWritingSection's claimed id,
// queueAfterSave, recordViolation's User.updateOne placement below).
async function withVersionRetry(fn, maxAttempts = 6) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e && e.name === 'VersionError' && i < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 20 + Math.floor(Math.random() * 40) * (i + 1)));
        continue;
      }
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

// ── background AI suggestions ───────────────────────────────────────────

// Pulls the linked WritingAttempt's band into sections.writing.aiBand (a
// teacher-confirmed grade beats the AI's) and moves PENDING_WRITING →
// PENDING_REVIEW. Called right after the immediate AI grade, from the
// 20-min AI cron, and lazily from the admin list / student result reads.
async function syncWritingBand(attemptId) {
  return withVersionRetry(async () => {
    const attempt = await EntranceTestAttempt.findById(attemptId);
    if (!attempt || isLegacyAttempt(attempt)) return attempt;
    const waId = attempt.sections.writing.writingAttemptId;
    if (!waId) return attempt;
    const wa = await WritingAttempt.findById(waId).select('grading.overallBand aiGrading.task1.bandScore').lean();
    const band = wa?.grading?.overallBand != null ? wa.grading.overallBand : wa?.aiGrading?.task1?.bandScore;
    if (band == null || attempt.sections.writing.aiBand === band) return attempt;
    attempt.sections.writing.aiBand = band;
    recomputeResult(attempt);
    await attempt.save();
    return attempt;
  });
}

async function syncWritingBandByWritingAttemptId(writingAttemptId) {
  const attempt = await EntranceTestAttempt.findOne({ 'sections.writing.writingAttemptId': writingAttemptId }).select('_id').lean();
  if (attempt) await syncWritingBand(attempt._id);
}

// Grades Task 1 right away instead of waiting up to 20 minutes for the
// writingAutoGrade cron (which stays the backstop if this fails — it only
// looks at aiGrading, so it picks up anything left ungraded here).
async function gradeWritingNow(attemptId, writingAttemptId) {
  if (!BACKGROUND_AI) return;
  const wa = await WritingAttempt.findById(writingAttemptId)
    .select('task1Answer wordCount1 task1Snapshot aiGrading gradingStatus').lean();
  if (wa && wa.aiGrading?.task1?.bandScore == null && String(wa.task1Answer || '').trim()) {
    const { gradeTaskWithAI } = require('./writingGradingService');
    const result = await gradeTaskWithAI(1, wa.task1Snapshot?.prompt || '', wa.task1Answer, wa.wordCount1 || 0, wa.task1Snapshot?.imageUrl || '');
    await WritingAttempt.updateOne(
      { _id: writingAttemptId, gradingStatus: { $ne: 'confirmed' } },
      { $set: { 'aiGrading.task1': result, 'aiGrading.generatedAt': new Date(), gradingStatus: 'ai_done' } }
    );
  }
  await syncWritingBand(attemptId);
}

async function fetchAudioBuffer(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`audio fetch failed (${resp.status})`);
  return Buffer.from(await resp.arrayBuffer());
}

// AI suggestion for the Speaking band (admin-only — the student never sees
// it). `audio` is the in-memory upload when called straight from the
// submit; otherwise (admin "chấm lại") the stored recording is re-fetched.
async function gradeSpeakingNow(attemptId, audio, { force = false } = {}) {
  if (!BACKGROUND_AI && !force) return;
  const speakingService = require('./speakingService');
  const a = await EntranceTestAttempt.findById(attemptId).select('sections.speaking').lean();
  const sp = a && a.sections && a.sections.speaking;
  if (!sp) return;
  const q = sp.questionSnapshot || {};
  const questionText = [q.question, q.cueCard].filter(Boolean).join('\n');
  const transcript = String(sp.transcript || '').trim();

  try {
    let audioPart = null;
    if (audio && audio.buffer && audio.buffer.length) {
      audioPart = speakingService.normalizeAudioForGemini(audio.buffer, audio.mimetype);
    } else if (sp.audioUrl) {
      try {
        audioPart = speakingService.normalizeAudioForGemini(await fetchAudioBuffer(sp.audioUrl), sp.audioMimeType || 'audio/webm');
      } catch (e) {
        logger.warn('entrance-test', 'speaking audio re-fetch failed, grading transcript-only', { attemptId: String(attemptId), errorMessage: e.message });
      }
    }
    if (!audioPart && !transcript) {
      await EntranceTestAttempt.updateOne({ _id: attemptId }, { $set: {
        'sections.speaking.aiStatus': 'done', 'sections.speaking.aiBand': 0,
        'sections.speaking.aiFeedback': { noGenuineAnswer: true }, 'sections.speaking.aiError': '',
      } });
      return;
    }

    let fb;
    try {
      fb = await speakingService.gradeSpeaking(questionText, transcript, 2, audioPart, sp.durationSec || 0);
    } catch (err) {
      // Same fallback as the practice /analyze route: if the audio part is
      // what tripped grading, retry once transcript-only.
      if (!audioPart || !transcript || err.isOverloaded) throw err;
      fb = await speakingService.gradeSpeaking(questionText, transcript, 2, null, sp.durationSec || 0);
    }
    const $set = {
      'sections.speaking.aiStatus': 'done',
      'sections.speaking.aiError': '',
      'sections.speaking.aiBand': fb.noGenuineAnswer ? 0 : (fb.overallBand || 0),
      'sections.speaking.aiFeedback': {
        overallBand: fb.overallBand || 0,
        fluency: fb.fluency || 0,
        vocabulary: fb.vocabulary || 0,
        grammar: fb.grammar || 0,
        pronunciation: fb.pronunciation || 0,
        pronunciationFromAudio: !!fb.pronunciationFromAudio,
        noGenuineAnswer: !!fb.noGenuineAnswer,
        overallFeedback: fb.overallFeedback || '',
      },
    };
    if (!transcript && typeof fb.transcript === 'string' && fb.transcript.trim()) {
      $set['sections.speaking.aiTranscript'] = fb.transcript.trim().slice(0, SPEAKING_TRANSCRIPT_MAX);
    }
    await EntranceTestAttempt.updateOne({ _id: attemptId }, { $set });
  } catch (err) {
    logger.error('entrance-test', 'speaking AI grading failed', { attemptId: String(attemptId), errorMessage: err.message });
    await EntranceTestAttempt.updateOne({ _id: attemptId }, { $set: {
      'sections.speaking.aiStatus': 'error', 'sections.speaking.aiError': String(err.message || 'AI error').slice(0, 300),
    } });
  }
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

// ── random content draw ──────────────────────────────────────────────────

// One random _id from `pool`, preferring ones not in `excludeIds` (content
// this student already had) and falling back to the whole pool once
// they've seen everything.
async function pickRandomId(pool, excludeIds) {
  const exclude = (excludeIds || []).filter(Boolean);
  if (exclude.length) {
    const [fresh] = await pool.model.aggregate([
      { $match: { ...pool.match, _id: { $nin: exclude } } },
      { $sample: { size: 1 } },
      { $project: { _id: 1 } },
    ]);
    if (fresh) return fresh._id;
  }
  const [any] = await pool.model.aggregate([{ $match: pool.match }, { $sample: { size: 1 } }, { $project: { _id: 1 } }]);
  return any ? any._id : null;
}

async function seenContentIds(userId) {
  const past = await EntranceTestAttempt.find({ userId }).select('configSnapshot').lean();
  const seen = { reading: [], listening: [], writing: [], speaking: [] };
  past.forEach(p => {
    const c = p.configSnapshot || {};
    if (c.readingPassageId) seen.reading.push(c.readingPassageId);
    if (c.listeningSectionId) seen.listening.push(c.listeningSectionId);
    if (c.writingTask1Id) seen.writing.push(c.writingTask1Id);
    if (c.speakingQuestionId) seen.speaking.push(c.speakingQuestionId);
  });
  return seen;
}

async function getPoolCounts(grammarSetKey) {
  const [reading, listening, writing, speaking, grammar] = await Promise.all([
    CONTENT_POOLS.reading.model.countDocuments(CONTENT_POOLS.reading.match),
    CONTENT_POOLS.listening.model.countDocuments(CONTENT_POOLS.listening.match),
    CONTENT_POOLS.writing.model.countDocuments(CONTENT_POOLS.writing.match),
    CONTENT_POOLS.speaking.model.countDocuments(CONTENT_POOLS.speaking.match),
    EntranceGrammarQuestion.countDocuments({ setKey: grammarSetKey || 'default', isActive: true }),
  ]);
  return { reading, listening, writing, speaking, grammar };
}

// ── public API ───────────────────────────────────────────────────────────

// Landing-page info — deliberately no answer-key-bearing content, just the
// fixed structure plus whether every content pool can supply an attempt.
async function getConfig() {
  const config = await EntranceTestConfig.findOne({ isActive: true }).lean();
  const counts = await getPoolCounts(config?.grammarSetKey);
  return {
    available: Object.values(counts).every(n => n > 0),
    totalMinutes: 74,
    sections: [
      { key: 'grammar', label: 'Grammar', minutes: 20, questionCount: 25 },
      { key: 'reading', label: 'Reading', minutes: 20, questionCount: 13 },
      { key: 'listening', label: 'Listening', minutes: 10, questionCount: 10 },
      { key: 'writing', label: 'Writing', minutes: 20, questionCount: 1 },
      { key: 'speaking', label: 'Speaking', minutes: 4, questionCount: 1 },
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
  const grammarSetKey = (config && config.grammarSetKey) || 'default';
  const seen = await seenContentIds(userId);

  const [passageId, sectionId, taskId, speakingId, grammarQuestions] = await Promise.all([
    pickRandomId(CONTENT_POOLS.reading, seen.reading),
    pickRandomId(CONTENT_POOLS.listening, seen.listening),
    pickRandomId(CONTENT_POOLS.writing, seen.writing),
    pickRandomId(CONTENT_POOLS.speaking, seen.speaking),
    EntranceGrammarQuestion.find({ setKey: grammarSetKey, isActive: true }).sort({ order: 1, createdAt: 1 }).limit(GRAMMAR_QUESTION_COUNT).lean(),
  ]);
  const [passage, listeningSection, writingTask1, speakingQ] = await Promise.all([
    passageId ? Passage.findById(passageId).lean() : null,
    sectionId ? ListeningSection.findById(sectionId).lean() : null,
    taskId ? WritingTask1.findById(taskId).lean() : null,
    speakingId ? SpeakingQuestion.findById(speakingId).select('topic question cueCard').lean() : null,
  ]);
  if (!passage || !listeningSection || !writingTask1 || !speakingQ || grammarQuestions.length < 1) {
    throw new AppError('Nội dung Test đầu vào chưa đầy đủ, vui lòng liên hệ quản trị viên', 503);
  }

  const now = new Date();
  const attempt = await EntranceTestAttempt.create({
    userId,
    status: 'in-progress',
    resultStatus: 'IN_PROGRESS',
    configSnapshot: {
      readingPassageId: passage._id,
      listeningSectionId: listeningSection._id,
      writingTask1Id: writingTask1._id,
      speakingQuestionId: speakingQ._id,
      grammarSetKey,
    },
    currentSection: 'grammar',
    startedAt: now,
    sections: {
      grammar: {
        startedAt: now,
        sectionExpiresAt: new Date(now.getTime() + SECTION_DURATIONS_SEC.grammar * 1000),
        // Same 25 questions for everyone, in a per-attempt random order.
        questionsSnapshot: shuffle(grammarQuestions),
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
      // No sample answer / vocab hints — only what a real cue card shows.
      speaking: {
        questionSnapshot: { _id: speakingQ._id, topic: speakingQ.topic || '', question: speakingQ.question || '', cueCard: speakingQ.cueCard || '' },
      },
    },
  });

  return { resumed: false, attemptId: attempt._id };
}

// Never returns an answer key, regardless of section state — getResult()
// is the only place that reveals correct answers, and only once the whole
// attempt is approved.
async function getAttemptForClient(userId, attemptId) {
  const attempt = await withVersionRetry(async () => {
    const doc = await loadOwnedAttempt(userId, attemptId);
    await autoFinalizeIfExpired(doc);
    return doc;
  });
  const a = attempt.toObject();
  const legacy = isLegacyAttempt(a);

  const payload = {
    _id: a._id,
    status: a.status,
    resultStatus: a.resultStatus,
    currentSection: a.currentSection,
    sectionOrder: legacy ? LEGACY_SECTION_ORDER : SECTION_ORDER,
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
  if (!legacy) {
    const sp = a.sections.speaking;
    const q = sp.questionSnapshot || {};
    payload.sections.speaking = {
      startedAt: sp.startedAt,
      sectionExpiresAt: sp.sectionExpiresAt,
      submittedAt: sp.submittedAt,
      question: { topic: q.topic || '', question: q.question || '', cueCard: q.cueCard || '' },
      transcript: sp.transcript || '',
      prepSec: SPEAKING_PREP_SEC,
      maxSpeakSec: SPEAKING_MAX_SEC,
    };
  }
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
    } else if (section === 'speaking') {
      attempt.sections.speaking.transcript = String(payload.transcript == null ? '' : payload.transcript).slice(0, SPEAKING_TRANSCRIPT_MAX);
    }

    await attempt.save();
    return { status: 'ok' };
  });
}

// `extras` (Speaking only): { audioFile: multer file, transcript, durationSec }.
async function submitSection(userId, attemptId, section, extras = {}) {
  if (!SECTION_ORDER.includes(section)) throw new ValidationError('Phần thi không hợp lệ');

  // The recording is uploaded BEFORE the retry loop (never re-uploaded by
  // a VersionError retry), and only while Speaking is still open.
  let uploaded = null;
  const audioFile = section === 'speaking' ? extras.audioFile : null;
  if (audioFile && audioFile.buffer && audioFile.buffer.length) {
    const pre = await loadOwnedAttempt(userId, attemptId);
    if (pre.status === 'in-progress' && pre.currentSection === 'speaking' && !pre.sections.speaking.submittedAt) {
      try {
        const cloudinaryService = require('./cloudinaryService');
        const r = await cloudinaryService.uploadBufferStream(audioFile.buffer, {
          resource_type: 'video', folder: 'entrance-speaking', public_id: `et_${attemptId}_${Date.now()}`,
        });
        uploaded = { url: r.secure_url, publicId: r.public_id, mimetype: audioFile.mimetype || '' };
      } catch (e) {
        // Keep going: the transcript still gets recorded and the AI still
        // hears the in-memory buffer — only the teacher's replay is lost.
        logger.error('entrance-test', 'speaking audio upload failed', { attemptId: String(attemptId), errorMessage: e.message });
      }
    }
  }

  let recordedAudio = false;
  const attempt = await withVersionRetry(async () => {
    const doc = await loadOwnedAttempt(userId, attemptId);
    await autoFinalizeIfExpired(doc);

    const order = sectionOrderFor(doc);
    if (doc.status !== 'in-progress') {
      // A racing double-submit of the LAST section (the other request just
      // flipped the attempt to completed) is a no-op, not an error.
      const isLast = section === order[order.length - 1];
      if (doc.status === 'completed' && isLast && doc.sections[section] && doc.sections[section].submittedAt) return doc;
      throw new AppError('Bài làm đã kết thúc', 409);
    }
    // Idempotency: a legitimate double-submit (client retry) of a section
    // that's already been recorded is a no-op that just returns current
    // state, rather than erroring. A submit for anything OTHER than the
    // current section (an attempt to go back and redo a past one) is
    // rejected.
    if (doc.sections[section] && doc.sections[section].submittedAt) {
      if (doc.currentSection === section || order.indexOf(doc.currentSection) > order.indexOf(section)) {
        return doc;
      }
    }
    if (doc.currentSection !== section) throw new AppError(`Phần hiện tại là ${doc.currentSection}, không phải ${section}`, 409);

    const sectionExtras = section === 'speaking'
      ? { transcript: extras.transcript, durationSec: extras.durationSec, audio: uploaded, audioBuffer: audioFile ? audioFile.buffer : null }
      : {};
    await gradeAndAdvance(doc, userId, section, sectionExtras);
    await saveAndRunHooks(doc);
    recordedAudio = !!uploaded;
    return doc;
  });

  if (uploaded && !recordedAudio) {
    require('./cloudinaryService').destroyAsset(uploaded.publicId);
  }
  return attempt;
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
  if (!section || !section.startedAt || !section.submittedAt) return 0;
  return Math.max(0, Math.round((new Date(section.submittedAt).getTime() - new Date(section.startedAt).getTime()) / 1000));
}

// Only callable once the attempt is no longer 'in-progress'. Scores and
// the answer key are revealed only once the result is COMPLETED (admin-
// approved); before that the student just gets "đang chờ duyệt".
async function getResult(userId, attemptId) {
  let attempt = await withVersionRetry(async () => {
    const doc = await loadOwnedAttempt(userId, attemptId);
    await autoFinalizeIfExpired(doc);
    if (doc.status === 'in-progress') throw new AppError('Bài làm chưa hoàn thành', 409);

    // Legacy attempts: poll the linked WritingAttempt for a since-confirmed
    // band (the original "complete once the teacher confirms" rule).
    const writingSection = doc.sections.writing;
    if (isLegacyAttempt(doc) && writingSection.writingAttemptId && writingSection.band == null) {
      const wa = await WritingAttempt.findById(writingSection.writingAttemptId).select('grading.overallBand').lean();
      const band = wa?.grading?.overallBand;
      if (band != null) {
        writingSection.band = band;
        recomputeResult(doc);
        await doc.save();
      }
    }
    return doc;
  });
  if (attempt.resultStatus === 'PENDING_WRITING' && !isLegacyAttempt(attempt)) {
    attempt = (await syncWritingBand(attempt._id)) || attempt;
  }

  const a = attempt.toObject();
  if (a.status === 'completed' && a.resultStatus !== 'COMPLETED') {
    return { _id: a._id, status: a.status, resultStatus: a.resultStatus, pendingReview: true, completedAt: a.completedAt };
  }
  if (a.status !== 'completed') {
    return { _id: a._id, status: a.status, resultStatus: a.resultStatus };
  }

  const grammarAnswersById = {};
  (a.sections.grammar.answers || []).forEach(x => { grammarAnswersById[x.questionId] = x; });
  const legacy = isLegacyAttempt(a);

  const payload = {
    _id: a._id,
    status: a.status,
    resultStatus: a.resultStatus,
    overallBand: a.overallBand,
    startedAt: a.startedAt,
    completedAt: a.completedAt,
    adminNote: (a.review && a.review.adminNote) || '',
    approvedAt: (a.review && a.review.approvedAt) || null,
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
  if (!legacy) {
    // Band only — no AI feedback reaches the student (product decision).
    payload.sections.speaking = {
      band: a.sections.speaking.band,
      durationSec: a.sections.speaking.durationSec || 0,
      topic: a.sections.speaking.questionSnapshot?.topic || '',
    };
    payload.timeUsedSec.speaking = sectionTimeUsedSec(a.sections.speaking);
  }
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
  const config = await EntranceTestConfig.findOne({ isActive: true }).lean();
  const grammarSetKey = config?.grammarSetKey || 'default';
  const pools = await getPoolCounts(grammarSetKey);
  return { config, grammarCount: pools.grammar, pools };
}

// Only the Grammar set is configurable now — Reading/Listening/Writing/
// Speaking are drawn at random per attempt (CONTENT_POOLS).
async function updateAdminConfig(data, actorId) {
  const { grammarSetKey } = data || {};
  const config = await EntranceTestConfig.findOneAndUpdate(
    { isActive: true },
    {
      $set: {
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

const ADMIN_LIST_EXCLUDE = '-sections.grammar.questionsSnapshot -sections.grammar.answers -sections.reading.passageSnapshot -sections.reading.answers -sections.listening.sectionSnapshot -sections.listening.answers -sections.writing.promptSnapshot -sections.writing.writingAnswer -sections.speaking.transcript -sections.speaking.aiTranscript -sections.speaking.aiFeedback';

async function listAdminAttempts({ page = 1, limit = 50, userId, status, resultStatus } = {}) {
  const filter = {};
  if (userId) filter.userId = userId;
  if (status) filter.status = status;
  if (resultStatus) filter.resultStatus = resultStatus;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(200, Math.max(1, Number(limit) || 50));

  // Pull in any Writing AI grades that landed since (moves those rows from
  // PENDING_WRITING to PENDING_REVIEW) before listing.
  const waiting = await EntranceTestAttempt.find({ ...filter, resultStatus: 'PENDING_WRITING', 'sections.speaking.questionSnapshot': { $ne: null } })
    .select('_id').limit(50).lean();
  for (const w of waiting) {
    try { await syncWritingBand(w._id); } catch (e) { logger.warn('entrance-test', 'writing band sync failed', { attemptId: String(w._id), errorMessage: e.message }); }
  }

  const [attempts, total, pendingReview] = await Promise.all([
    EntranceTestAttempt.find(filter)
      .populate('userId', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .select(ADMIN_LIST_EXCLUDE)
      .lean(),
    EntranceTestAttempt.countDocuments(filter),
    EntranceTestAttempt.countDocuments({ resultStatus: 'PENDING_REVIEW' }),
  ]);
  attempts.forEach(a => {
    a.legacy = isLegacyAttempt(a);
    a.proposed = proposeResult(a);
  });
  return { attempts, total, pendingReview };
}

async function getAdminAttemptDetail(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const exists = await EntranceTestAttempt.exists({ _id: id });
  if (!exists) return null;
  await syncWritingBand(id).catch(() => {});
  const attempt = await EntranceTestAttempt.findById(id)
    .populate('userId', 'firstName lastName username email')
    .select('-sections.grammar.questionsSnapshot -sections.reading.passageSnapshot -sections.listening.sectionSnapshot')
    .lean();
  if (!attempt) return null;
  if (attempt.sections?.writing?.writingAttemptId) {
    const wa = await WritingAttempt.findById(attempt.sections.writing.writingAttemptId)
      .select('gradingStatus grading.overallBand aiGrading.task1').lean();
    if (wa) {
      attempt.sections.writing.gradingStatus = wa.gradingStatus;
      attempt.sections.writing.aiGrading = wa.aiGrading?.task1 || null;
      if (isLegacyAttempt(attempt) && wa.grading?.overallBand != null) attempt.sections.writing.band = wa.grading.overallBand;
    }
  }
  attempt.legacy = isLegacyAttempt(attempt);
  attempt.proposed = proposeResult(attempt);
  return attempt;
}

// Admin approves the compiled result (optionally adjusting the Writing /
// Speaking bands or the overall band) — this is the moment the student
// first sees any score, and they get an inbox message about it.
async function approveAttempt(id, data, actor) {
  if (!mongoose.isValidObjectId(id)) throw new NotFoundError('Không tìm thấy lượt làm bài');
  const body = data || {};
  const toBand = (v, label, required) => {
    if (v === '' || v == null) {
      if (required) throw new ValidationError(`Thiếu band ${label}`);
      return null;
    }
    const n = Number(v);
    if (!isValidBand(n)) throw new ValidationError(`Band ${label} phải từ 0 đến 9, bước 0.5`);
    return n;
  };
  const adminNote = String(body.adminNote || '').slice(0, 2000);

  let firstApproval = false;
  const attempt = await withVersionRetry(async () => {
    const doc = await EntranceTestAttempt.findById(id);
    if (!doc) throw new NotFoundError('Không tìm thấy lượt làm bài');
    if (doc.status !== 'completed' || doc.currentSection !== 'done') {
      throw new AppError('Chỉ duyệt được lượt làm bài đã hoàn thành', 409);
    }
    const legacy = isLegacyAttempt(doc);
    doc.sections.writing.band = toBand(body.writingBand, 'Writing', true);
    if (!legacy) doc.sections.speaking.band = toBand(body.speakingBand, 'Speaking', true);

    const { overall } = proposeResult(doc);
    const override = toBand(body.overallBand, 'Overall', false);
    doc.overallBand = override != null ? override : overall;

    firstApproval = !doc.review || !doc.review.approvedAt;
    doc.review = {
      approvedAt: firstApproval ? new Date() : doc.review.approvedAt,
      approvedBy: actor && actor._id,
      approvedByName: (actor && (actor.username || actor.email)) || '',
      adminNote,
    };
    doc.resultStatus = 'COMPLETED';
    await doc.save();
    return doc;
  });

  if (firstApproval && actor) {
    const s = attempt.sections;
    const fmt = (b) => (b == null ? '—' : Number(b).toFixed(1));
    const lines = [
      `🎯 Kết quả Test đầu vào của bạn đã được giáo viên duyệt.`,
      ``,
      `• Overall (ước tính): ${fmt(attempt.overallBand)}`,
      `• Grammar: ${fmt(s.grammar.band)}`,
      `• Reading: ${fmt(s.reading.band)}`,
      `• Listening: ${fmt(s.listening.band)}`,
      `• Writing: ${fmt(s.writing.band)}`,
    ];
    if (!isLegacyAttempt(attempt)) lines.push(`• Speaking: ${fmt(s.speaking.band)}`);
    if (adminNote) lines.push('', `Nhận xét của giáo viên: ${adminNote}`);
    lines.push('', 'Xem chi tiết tại trang Test đầu vào. Kết quả chỉ dùng để xếp lớp, không phải điểm IELTS chính thức.');
    try {
      await Message.create({
        fromId: actor._id,
        fromName: actor.username || 'EnglishWithDan',
        toId: attempt.userId,
        subject: 'Kết quả Test đầu vào',
        body: lines.join('\n'),
        type: 'personal',
      });
    } catch (e) {
      logger.error('entrance-test', 'approval message failed', { attemptId: String(id), errorMessage: e.message });
    }
  }
  return getAdminAttemptDetail(id);
}

// Admin "Chấm lại AI" for a Speaking suggestion that errored (or never ran
// because the server restarted mid-grade). Awaited, so the admin sees the
// new suggestion in the response.
async function regradeSpeaking(id) {
  if (!mongoose.isValidObjectId(id)) throw new NotFoundError('Không tìm thấy lượt làm bài');
  const a = await EntranceTestAttempt.findById(id).select('status sections.speaking.questionSnapshot').lean();
  if (!a) throw new NotFoundError('Không tìm thấy lượt làm bài');
  if (isLegacyAttempt(a)) throw new AppError('Lượt làm bài này không có phần Speaking', 400);
  if (a.status !== 'completed') throw new AppError('Lượt làm bài chưa hoàn thành', 409);
  await EntranceTestAttempt.updateOne({ _id: id }, { $set: { 'sections.speaking.aiStatus': 'pending' } });
  await gradeSpeakingNow(id, null, { force: true });
  return getAdminAttemptDetail(id);
}

module.exports = {
  SECTION_ORDER,
  SECTION_DURATIONS_SEC,
  SUBMIT_GRACE_SEC,
  MAX_VIOLATIONS,
  COOLDOWN_SECONDS,
  CONTENT_POOLS,
  getConfig,
  startAttempt,
  getAttemptForClient,
  saveAnswer,
  submitSection,
  getResult,
  recordViolation,
  getHistory,
  syncWritingBandByWritingAttemptId,
  // admin
  getAdminConfig,
  updateAdminConfig,
  listGrammarQuestions,
  createGrammarQuestion,
  updateGrammarQuestion,
  deleteGrammarQuestion,
  listAdminAttempts,
  getAdminAttemptDetail,
  approveAttempt,
  regradeSpeaking,
};
