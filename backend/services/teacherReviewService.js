'use strict';

// Teacher review queue — "Chấm bài khoá học & Speaking" (admin
// /submission-reviews). Every open-ended submission a student makes is
// AI-graded on submit; what happens next depends on the kind:
//
//  - kind 'writing'  = course writing (WT1Submission whose exercise is
//    sentence_writing / paragraph_writing / full_task1 — every course on the
//    WT1 stack, Mindset included). Since 2026-11-14 the AI/rubric grade is
//    HELD (WT1Submission.awaitingTeacher): the student only sees "chờ giáo
//    viên xác nhận" until the teacher, who sees the AI band here, confirms
//    or corrects it (can also re-run the AI). Confirming releases the
//    teacher's band + note AND the AI feedback to the student. These are
//    the "chờ chấm" rows (sidebar badge).
//  - kind 'speaking' = course speaking_response + standalone Speaking
//    practice (SpeakingAttempt, minus the course mirrors tagged
//    source:'course'). The AI grade goes straight to the student, so an
//    AI-graded answer never counts as "chờ chấm" (the teacher can still
//    listen and add a grade/comment from the tab). The only speaking rows
//    that wait on the teacher are the ones the AI could NOT grade — status
//    'error', or still 'pending' after STUCK_PENDING_MS (mock test with no
//    transcript, crashed grade): the student got nothing, and a mock run
//    waits on that band. Course speaking never ends up there (an AI failure
//    503s and stores nothing).
//
// Confirming writes `teacherReview` on the row (models/shared/
// teacherReviewSchema.js) and sends the student an inbox message; the
// student also sees the comment in that attempt's Lịch sử view.
//
// The IELTS Writing tests (WritingAttempt) keep their own grading page
// (admin "Chấm bài Writing", routes/admin/writingGrading.js).
//
// Only rows created on/after QUEUE_CUTOFF are queued, so the ~3 months of
// history from before this feature existed doesn't flood the queue.

const mongoose = require('mongoose');
const WT1Submission = require('../models/WT1Submission');
const WT1Exercise = require('../models/WT1Exercise');
const WT1Lesson = require('../models/WT1Lesson');
const WT1Module = require('../models/WT1Module');
const WT1Course = require('../models/WT1Course');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const User = require('../models/User');
const Message = require('../models/Message');
const wt1Service = require('./wt1Service');
const grading = require('./wt1GradingService');
const geminiService = require('./geminiService');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError, AppError } = require('../errors/AppError');

const QUEUE_CUTOFF = new Date('2026-11-12T00:00:00+07:00');
const WRITING_TYPES = ['sentence_writing', 'paragraph_writing', 'full_task1'];
const SPEAKING_TYPES = ['speaking_response'];
const SOURCES = new Set(['course', 'speaking']);
const KINDS = new Set(['writing', 'speaking']);

const SCORE_KEYS = {
  writing: ['taskAchievement', 'coherence', 'lexical', 'grammar'],
  speaking: ['fluency', 'vocabulary', 'grammar', 'pronunciation'],
};
const SCORE_LABELS = {
  taskAchievement: 'Task Achievement', coherence: 'Coherence & Cohesion', lexical: 'Lexical Resource',
  grammar: 'Grammar', fluency: 'Fluency & Coherence', vocabulary: 'Lexical Resource', pronunciation: 'Pronunciation',
};

// Student-facing course page, for the "xem lại ở đâu" line of the message.
const COURSE_PAGES = {
  'IELTS-W-T1': 'writing-task1.html', 'IELTS-W-T2': 'writing-task2-course.html',
  'IELTS-SPEAKING': 'speaking-course.html', 'MINDSET-0': 'mindset-0.html', 'MINDSET-1': 'mindset-1.html', 'MINDSET-2': 'mindset-2.html',
};

const NOTE_MAX = 4000;

function displayName(u) {
  if (!u) return '–';
  return [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || '–';
}

function reviewedFilter(status) {
  if (status === 'pending') return { 'teacherReview.reviewedAt': null };
  if (status === 'done') return { 'teacherReview.reviewedAt': { $ne: null } };
  return {};
}

async function exercisesOfTypes(types) {
  return WT1Exercise.find({ type: { $in: types } }).select('code title type lessonCode').lean();
}

async function studentIdsMatching(search) {
  const s = String(search || '').trim();
  if (!s) return null;
  const re = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({ $or: [{ username: re }, { firstName: re }, { lastName: re }, { email: re }] })
    .select('_id').limit(500).lean();
  return users.map((u) => u._id);
}

function courseQuery(codes, status, userIds) {
  return {
    exerciseCode: { $in: codes }, status: { $ne: 'draft' }, createdAt: { $gte: QUEUE_CUTOFF },
    ...reviewedFilter(status),
    ...(userIds ? { userId: { $in: userIds } } : {}),
  };
}

// An attempt still 'pending' this long after it was made never got an AI
// grade — the mock test's Speaking step saved with no transcript/recording,
// or the server restarted mid-grade. It used to be left out of the queue
// for good, so nobody ever graded it (and the mock run waited forever).
const STUCK_PENDING_MS = 10 * 60 * 1000;

function speakingQuery(status, userIds) {
  const noAiGrade = [
    { status: 'error' },
    { status: 'pending', createdAt: { $lt: new Date(Date.now() - STUCK_PENDING_MS) } },
  ];
  return {
    source: { $ne: 'course' },
    // "pending" = only the answers the AI couldn't grade (see top).
    $or: status === 'pending' ? noAiGrade : [{ status: 'analyzed' }, ...noAiGrade],
    'aiFeedback.noGenuineAnswer': { $ne: true }, createdAt: { $gte: QUEUE_CUTOFF },
    ...reviewedFilter(status),
    ...(userIds ? { userId: { $in: userIds } } : {}),
  };
}

// lessonCode → { lessonTitle, courseCode, courseTitle }
async function lessonContext(lessonCodes) {
  const codes = [...new Set(lessonCodes.filter(Boolean))];
  if (!codes.length) return {};
  const lessons = await WT1Lesson.find({ code: { $in: codes } }).select('code title moduleCode').lean();
  const mods = await WT1Module.find({ code: { $in: [...new Set(lessons.map((l) => l.moduleCode))] } }).select('code courseCode').lean();
  const courseOfMod = Object.fromEntries(mods.map((m) => [m.code, m.courseCode]));
  const courses = await WT1Course.find({ code: { $in: [...new Set(mods.map((m) => m.courseCode))] } }).select('code title').lean();
  const courseTitle = Object.fromEntries(courses.map((c) => [c.code, c.title]));
  return Object.fromEntries(lessons.map((l) => {
    const cc = courseOfMod[l.moduleCode] || '';
    return [l.code, { lessonTitle: l.title || l.code, courseCode: cc, courseTitle: courseTitle[cc] || cc }];
  }));
}

const wordCount = (arr) => (arr || []).join(' ').split(/\s+/).filter(Boolean).length;

async function courseRows(subs, exByCode) {
  const ctx = await lessonContext(subs.map((s) => s.lessonCode));
  return subs.map((s) => {
    const ex = exByCode[s.exerciseCode] || {};
    const c = ctx[s.lessonCode] || {};
    const items = s.itemResults || [];
    return {
      source: 'course', id: s._id, createdAt: s.createdAt,
      student: { id: s.userId?._id, name: displayName(s.userId), username: s.userId?.username || '' },
      title: ex.title || s.exerciseCode,
      context: [c.courseTitle, c.lessonTitle].filter(Boolean).join(' · '),
      exerciseType: ex.type || '', attempt: s.attempt,
      aiBand: s.aiFeedback?.bandEstimate ?? null,
      score: s.aiFeedback ? null : (s.score ?? null),
      aiUnavailable: !!(s.localFeedback && s.localFeedback.aiUnavailable),
      // The student hasn't seen any grade yet — waiting on this confirm.
      held: !!s.awaitingTeacher && !s.teacherReview?.reviewedAt,
      words: ex.type === 'speaking_response' ? null : wordCount(s.responses),
      hasAudio: !!(s.audioUrl || items.some((r) => r.audioUrl)),
      teacherBand: s.teacherReview?.band ?? null,
      reviewedAt: s.teacherReview?.reviewedAt || null, reviewerName: s.teacherReview?.reviewerName || '',
    };
  });
}

function speakingRows(attempts) {
  return attempts.map((a) => ({
    source: 'speaking', id: a._id, createdAt: a.createdAt,
    student: { id: a.userId?._id, name: displayName(a.userId), username: a.userId?.username || '' },
    title: a.question || a.topic || 'Speaking',
    context: a.topic === 'Full Mock Test' ? 'Luyện Speaking · Mock Test' : `Luyện Speaking · Part ${a.part}${a.topic ? ` · ${a.topic}` : ''}`,
    exerciseType: 'speaking', attempt: null,
    aiBand: a.aiFeedback?.overallBand || null, score: null, aiUnavailable: a.status !== 'analyzed',
    words: null, hasAudio: !!(a.audioUrl || (a.audioClips || []).length),
    teacherBand: a.teacherReview?.band ?? null,
    reviewedAt: a.teacherReview?.reviewedAt || null, reviewerName: a.teacherReview?.reviewerName || '',
  }));
}

const USER_FIELDS = 'username firstName lastName';
const COURSE_LIST_FIELDS = 'userId exerciseCode lessonCode attempt createdAt score responses aiFeedback.bandEstimate localFeedback.aiUnavailable audioUrl itemResults.audioUrl teacherReview awaitingTeacher';
const SPEAKING_LIST_FIELDS = 'userId topic part question createdAt status audioUrl audioClips.url aiFeedback.overallBand teacherReview';

async function list({ kind = 'writing', status = 'pending', search, page = 1, limit = 30 } = {}) {
  if (!KINDS.has(kind)) throw new ValidationError('kind phải là writing hoặc speaking');
  const pg = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
  const userIds = await studentIdsMatching(search);
  const exs = await exercisesOfTypes(kind === 'writing' ? WRITING_TYPES : SPEAKING_TYPES);
  const exByCode = Object.fromEntries(exs.map((e) => [e.code, e]));
  const cq = courseQuery(Object.keys(exByCode), status, userIds);

  if (kind === 'writing') {
    const [subs, total] = await Promise.all([
      WT1Submission.find(cq).select(COURSE_LIST_FIELDS).populate('userId', USER_FIELDS)
        .sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      WT1Submission.countDocuments(cq),
    ]);
    return { rows: await courseRows(subs, exByCode), total, page: pg, limit: lim };
  }

  // Speaking spans two collections: take the newest (page × limit) of each,
  // merge by date and cut the requested page out of the merged list.
  // Course speaking always has its AI grade (a failed grade stores
  // nothing), so it's never in the "pending" (AI couldn't grade) list.
  const sq = speakingQuery(status, userIds);
  const upto = pg * lim;
  const withCourse = status !== 'pending';
  const [subs, attempts, totalA, totalB] = await Promise.all([
    withCourse ? WT1Submission.find(cq).select(COURSE_LIST_FIELDS).populate('userId', USER_FIELDS).sort({ createdAt: -1 }).limit(upto).lean() : [],
    SpeakingAttempt.find(sq).select(SPEAKING_LIST_FIELDS).populate('userId', USER_FIELDS).sort({ createdAt: -1 }).limit(upto).lean(),
    withCourse ? WT1Submission.countDocuments(cq) : 0,
    SpeakingAttempt.countDocuments(sq),
  ]);
  const merged = [...(await courseRows(subs, exByCode)), ...speakingRows(attempts)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((pg - 1) * lim, upto);
  return { rows: merged, total: totalA + totalB, page: pg, limit: lim };
}

// Pending counts per tab (+ the sidebar badge, which is their sum):
// course writing held for the teacher + speaking the AI couldn't grade.
async function counts() {
  const wEx = await exercisesOfTypes(WRITING_TYPES);
  const [writing, speaking] = await Promise.all([
    WT1Submission.countDocuments(courseQuery(wEx.map((e) => e.code), 'pending', null)),
    SpeakingAttempt.countDocuments(speakingQuery('pending', null)),
  ]);
  return { writing, speaking };
}

function assertSource(source, id) {
  if (!SOURCES.has(source)) throw new ValidationError('Nguồn bài không hợp lệ');
  if (!mongoose.isValidObjectId(id)) throw new NotFoundError('Không tìm thấy bài làm');
}

// Everything the grading modal needs for one submission.
async function getDetail(source, id) {
  assertSource(source, id);
  if (source === 'course') {
    const data = await wt1Service.getSubmissionReview(id);
    if (!data || !data.ex || data.review.kind === 'objective') throw new NotFoundError('Không tìm thấy bài làm (lịch sử chỉ lưu 3 tháng)');
    const ctx = (await lessonContext([data.sub.lessonCode]))[data.sub.lessonCode] || {};
    const rubric = data.ex.rubric || {};
    return {
      source, kind: data.review.kind,
      student: { id: data.sub.userId?._id, name: displayName(data.sub.userId), username: data.sub.userId?.username || '' },
      context: [ctx.courseTitle, ctx.lessonTitle].filter(Boolean).join(' · '),
      review: data.review,
      rubric: { minWords: rubric.minWords || null, maxWords: rubric.maxWords || null, targetStructures: rubric.targetStructures || [] },
      teacherReview: data.sub.teacherReview?.reviewedAt ? data.sub.teacherReview : null,
      held: wt1Service.heldForTeacher(data.sub),
      scoreKeys: SCORE_KEYS[data.review.kind === 'speaking' ? 'speaking' : 'writing'],
    };
  }
  const a = await SpeakingAttempt.findById(id).populate('userId', `${USER_FIELDS} email`).lean();
  if (!a) throw new NotFoundError('Không tìm thấy bài làm (lịch sử chỉ lưu 3 tháng)');
  return {
    source, kind: 'speaking',
    student: { id: a.userId?._id, name: displayName(a.userId), username: a.userId?.username || '' },
    context: a.topic === 'Full Mock Test' ? 'Luyện Speaking · Mock Test' : `Luyện Speaking · Part ${a.part}${a.topic ? ` · ${a.topic}` : ''}`,
    attempt: { ...a, userId: undefined },
    teacherReview: a.teacherReview?.reviewedAt ? a.teacherReview : null,
    scoreKeys: SCORE_KEYS.speaking,
  };
}

function cleanBand(v, label) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 9 || Math.round(n * 2) !== n * 2) {
    throw new ValidationError(`${label}: band phải từ 0 đến 9, bước 0.5`);
  }
  return n;
}

function cleanReview(kind, body) {
  const b = body || {};
  const band = cleanBand(b.band, 'Band tổng');
  let scores;
  if (b.scores && typeof b.scores === 'object') {
    scores = {};
    for (const k of SCORE_KEYS[kind]) {
      const v = cleanBand(b.scores[k], SCORE_LABELS[k] || k);
      if (v != null) scores[k] = v;
    }
    if (!Object.keys(scores).length) scores = undefined;
  }
  const note = String(b.note == null ? '' : b.note).trim();
  if (note.length > NOTE_MAX) throw new ValidationError(`Nhận xét tối đa ${NOTE_MAX} ký tự`);
  if (band == null && !note) throw new ValidationError('Hãy cho band hoặc viết nhận xét trước khi gửi');
  return { band, scores, note };
}

const fmtBand = (n) => (n == null ? '–' : Number(n).toFixed(1));

function messageBody({ title, context, review, page, updated, released }) {
  const lines = [
    updated
      ? `💬 Giáo viên đã cập nhật nhận xét cho bài "${title}".`
      : `💬 Giáo viên đã chấm bài "${title}" của bạn.`,
  ];
  if (context) lines.push(`(${context})`);
  lines.push('');
  if (review.band != null) lines.push(`• Band giáo viên chấm: ${fmtBand(review.band)}`);
  const sc = review.scores || {};
  const scoreLine = Object.keys(sc).map((k) => `${SCORE_LABELS[k] || k}: ${fmtBand(sc[k])}`).join(' · ');
  if (scoreLine) lines.push(`• ${scoreLine}`);
  if (review.note) lines.push('', 'Nhận xét của giáo viên:', review.note);
  if (released) lines.push('', 'Nhận xét chi tiết (lỗi cần sửa, cấu trúc đã dùng) cũng đã mở trong bài làm.');
  lines.push('', page
    ? `Xem lại bài làm: mở ${page} → nút "Lịch sử" của bài này.`
    : 'Xem lại bài làm ở tab "Lịch sử" trang Luyện Speaking.');
  return lines.join('\n');
}

async function notifyStudent(actor, toId, subject, body) {
  try {
    await Message.create({ fromId: actor._id, fromName: displayName(actor) === '–' ? 'EnglishWithDan' : displayName(actor), toId, subject, body, type: 'personal' });
  } catch (err) {
    logger.error('teacher-review', 'notify failed', { toId: String(toId), errorMessage: err.message });
  }
}

// Save the teacher's grade/comment and message the student. Re-saving an
// already-reviewed row updates it (and tells the student it was updated).
async function submitReview(source, id, body, actor) {
  assertSource(source, id);
  const now = new Date();
  if (source === 'course') {
    const sub = await WT1Submission.findOne({ _id: id, status: { $ne: 'draft' } });
    if (!sub) throw new NotFoundError('Không tìm thấy bài làm (lịch sử chỉ lưu 3 tháng)');
    const ex = await WT1Exercise.findOne({ code: sub.exerciseCode }).select('code title type').lean();
    if (!ex || grading.OBJECTIVE_TYPES.has(ex.type)) throw new ValidationError('Bài này chấm tự động, không cần giáo viên chấm');
    const kind = ex.type === 'speaking_response' ? 'speaking' : 'writing';
    const review = cleanReview(kind, body);
    const updated = !!sub.teacherReview?.reviewedAt;
    // First confirm of a held course-writing grade: the AI/rubric feedback
    // opens for the student together with the teacher's grade.
    const released = !updated && !!sub.awaitingTeacher && !!(sub.aiFeedback || sub.localFeedback);
    sub.teacherReview = { ...review, reviewedBy: actor._id, reviewerName: displayName(actor), reviewedAt: now };
    await sub.save();
    const ctx = (await lessonContext([sub.lessonCode]))[sub.lessonCode] || {};
    await notifyStudent(actor, sub.userId, `💬 Giáo viên đã chấm: ${ex.title || ex.code}`, messageBody({
      title: ex.title || ex.code, context: [ctx.courseTitle, ctx.lessonTitle].filter(Boolean).join(' · '),
      review, page: COURSE_PAGES[ctx.courseCode] || '', updated, released,
    }));
    return { teacherReview: sub.teacherReview.toObject ? sub.teacherReview.toObject() : sub.teacherReview };
  }
  const a = await SpeakingAttempt.findById(id);
  if (!a) throw new NotFoundError('Không tìm thấy bài làm (lịch sử chỉ lưu 3 tháng)');
  const review = cleanReview('speaking', body);
  const updated = !!a.teacherReview?.reviewedAt;
  a.teacherReview = { ...review, reviewedBy: actor._id, reviewerName: displayName(actor), reviewedAt: now };
  await a.save();
  const title = a.topic === 'Full Mock Test' ? 'Speaking Mock Test' : (a.question || a.topic || 'Speaking');
  await notifyStudent(actor, a.userId, `💬 Giáo viên đã chấm bài Speaking`, messageBody({
    title, context: a.topic && a.topic !== 'Full Mock Test' ? `Part ${a.part} · ${a.topic}` : '', review, page: '', updated,
  }));
  return { teacherReview: a.teacherReview.toObject ? a.teacherReview.toObject() : a.teacherReview };
}

// Store a fresh AI grade on a course writing row. Clears the "AI bận lúc
// nộp" flag (the queue's "AI lỗi/bận" tag) and the auto-retry bookkeeping.
async function saveAiFeedback(sub, ai) {
  const { graded, ...aiFeedback } = ai; // eslint-disable-line no-unused-vars
  sub.aiFeedback = aiFeedback;
  if (sub.localFeedback && sub.localFeedback.aiUnavailable) {
    sub.localFeedback = { ...sub.localFeedback, aiUnavailable: false, aiRegradedAt: new Date() };
  }
  sub.aiRetry = undefined;
  await sub.save();
}

// Re-run the AI grader on a course writing submission (e.g. Gemini was busy
// at submit time and the student only got the rubric fallback, or the
// exercise is sentence_writing which is never AI-graded on submit). Replaces
// aiFeedback on that row; the lesson gate isn't touched (it already counted
// the submission when it was made).
async function aiRegrade(id) {
  assertSource('course', id);
  const sub = await WT1Submission.findOne({ _id: id, status: { $ne: 'draft' } });
  if (!sub) throw new NotFoundError('Không tìm thấy bài làm (lịch sử chỉ lưu 3 tháng)');
  const ex = await WT1Exercise.findOne({ code: sub.exerciseCode }).lean();
  if (!ex || !WRITING_TYPES.includes(ex.type)) throw new ValidationError('Chỉ chấm lại AI được cho bài viết');
  if (!(sub.responses || []).some((r) => String(r || '').trim())) throw new ValidationError('Bài viết trống');
  let ai;
  try {
    ai = await grading.gradeWritingAI(ex, sub.responses);
  } catch (err) {
    throw new AppError(err.isOverloaded ? 'AI đang quá tải, thử lại sau ít phút.' : `AI chấm lỗi: ${err.message}`, 503);
  }
  await saveAiFeedback(sub, ai);
  return getDetail('course', id);
}

// ── Auto re-grade (cron/courseWritingAutoGrade.js, every 10 minutes) ──────
// Course paragraph_writing / full_task1 rows still without an AI band —
// Gemini was busy at submit time, so the student only got the rubric
// fallback ("AI lỗi/bận" in the queue). Same idea as the IELTS Writing
// tests' cron/writingAutoGrade.js: a few per tick, one at a time, stop on
// an overload (it'll be there next tick). A row that keeps failing for a
// non-overload reason is given up on after AUTO_MAX_TRIES ticks (the
// teacher's "Chấm bằng AI" / external-AI paste still work).
const AI_WRITING_TYPES = ['paragraph_writing', 'full_task1'];
const AUTO_BATCH = 5;
const AUTO_MAX_TRIES = 6;
const AUTO_DELAY_MS = 3000;
let autoRunning = false;
let systemSenderCache = null;

async function systemSender() {
  if (systemSenderCache) return systemSenderCache;
  const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).select('_id').lean();
  if (admin) systemSenderCache = { _id: admin._id, firstName: 'EnglishWithDan' };
  return systemSenderCache;
}

async function notifyAiGraded(sub, ex) {
  const sender = await systemSender();
  if (!sender) return;
  const ctx = (await lessonContext([sub.lessonCode]))[sub.lessonCode] || {};
  const page = COURSE_PAGES[ctx.courseCode] || '';
  const band = sub.aiFeedback?.bandEstimate;
  const title = ex.title || ex.code;
  const body = [
    `🤖 AI đã chấm xong bài "${title}".`,
    ...([ctx.courseTitle, ctx.lessonTitle].filter(Boolean).length ? [`(${[ctx.courseTitle, ctx.lessonTitle].filter(Boolean).join(' · ')})`] : []),
    '',
    `• Band AI: ${fmtBand(band)}`,
    '',
    'Lúc bạn nộp AI đang bận nên bạn mới nhận điểm sơ bộ theo rubric — giờ đã có nhận xét chi tiết và lỗi cần sửa.',
    page ? `Xem lại: mở ${page} → nút "Lịch sử" của bài này.` : 'Xem lại ở nút "Lịch sử" của bài này.',
  ].join('\n');
  await notifyStudent(sender, sub.userId, `🤖 AI đã chấm: ${title} — Band ${fmtBand(band)}`, body);
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function autoRegradePending({ limit = AUTO_BATCH, delayMs = AUTO_DELAY_MS } = {}) {
  if (autoRunning) return { skipped: true };
  autoRunning = true;
  let graded = 0, failed = 0, overloaded = false;
  try {
    const exs = await WT1Exercise.find({ type: { $in: AI_WRITING_TYPES } }).lean();
    const exByCode = Object.fromEntries(exs.map((e) => [e.code, e]));
    if (!exs.length) return { graded, failed, overloaded };
    const subs = await WT1Submission.find({
      exerciseCode: { $in: Object.keys(exByCode) }, status: { $ne: 'draft' }, createdAt: { $gte: QUEUE_CUTOFF },
      'aiFeedback.bandEstimate': null, 'teacherReview.reviewedAt': null,
      'aiRetry.tries': { $not: { $gte: AUTO_MAX_TRIES } },
    }).sort({ createdAt: 1 }).limit(limit);

    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      const ex = exByCode[sub.exerciseCode];
      if (!(sub.responses || []).some((r) => String(r || '').trim())) {
        sub.aiRetry = { tries: AUTO_MAX_TRIES, lastError: 'empty', lastAt: new Date() };
        await sub.save();
        continue;
      }
      try {
        const ai = await grading.gradeWritingAI(ex, sub.responses);
        const wasBusy = !!(sub.localFeedback && sub.localFeedback.aiUnavailable);
        await saveAiFeedback(sub, ai);
        graded++;
        // A held grade (awaitingTeacher) goes to the teacher, not the
        // student — they hear about it when the teacher confirms. Only rows
        // from before the hold (student already saw the rubric fallback)
        // still get the "AI đã chấm xong" message.
        if (wasBusy && !sub.awaitingTeacher) await notifyAiGraded(sub, ex);
      } catch (err) {
        if (err.isOverloaded) { overloaded = true; break; } // next tick
        failed++;
        sub.aiRetry = { tries: ((sub.aiRetry && sub.aiRetry.tries) || 0) + 1, lastError: String(err.message || 'error').slice(0, 300), lastAt: new Date() };
        await sub.save().catch(() => {});
        logger.error('teacher-review', 'auto AI re-grade failed', { id: String(sub._id), errorMessage: err.message });
      }
      if (i < subs.length - 1 && delayMs) await sleep(delayMs);
    }
  } finally {
    autoRunning = false;
  }
  if (graded || failed || overloaded) logger.info('teacher-review', 'auto AI re-grade run', { graded, failed, overloaded });
  return { graded, failed, overloaded };
}

// ── "📋 Copy prompt" — grade with an outside AI (ChatGPT, Claude…) ─────────
// The full grading prompt + question + the student's answer as one text the
// teacher pastes into another AI; its reply is pasted back into the modal
// (parsed client-side into the teacher's band/criteria/comment).
function speakingExternalPrompt(question, transcript, part, durationSec) {
  const body = geminiService.buildSpeakingGradingPrompt(question, transcript, part, false, durationSec, { compact: true }) || '';
  return [geminiService.SPEAKING_SYSTEM || '', body, '\nWrite every feedback/comment string in Vietnamese.'].filter(Boolean).join('\n\n');
}

async function externalPrompt(source, id) {
  assertSource(source, id);
  if (source === 'course') {
    const sub = await WT1Submission.findOne({ _id: id, status: { $ne: 'draft' } }).lean();
    if (!sub) throw new NotFoundError('Không tìm thấy bài làm (lịch sử chỉ lưu 3 tháng)');
    const ex = await WT1Exercise.findOne({ code: sub.exerciseCode }).lean();
    if (!ex || grading.OBJECTIVE_TYPES.has(ex.type)) throw new ValidationError('Bài này chấm tự động, không cần AI ngoài');
    if (ex.type !== 'speaking_response') {
      return { kind: 'writing', prompt: grading.buildExternalPrompt(ex, sub.responses || []) };
    }
    const prompts = (ex.items || []).map((it) => it.prompt).filter(Boolean);
    const part = ex.speakingPart || 1;
    const items = (sub.itemResults || []).filter((r) => String(r.transcript || '').trim());
    let question, transcript;
    if (items.length > 1) {
      question = [ex.instruction, ...items.map((r, i) => `Q${i + 1}: ${r.prompt || prompts[r.itemIndex ?? i] || ''}`)].filter(Boolean).join('\n');
      transcript = items.map((r, i) => `Q${i + 1} (Part ${part}): ${r.prompt || prompts[r.itemIndex ?? i] || ''}\nA${i + 1}: ${r.transcript}`).join('\n\n');
    } else {
      question = [ex.instruction, ...prompts].filter(Boolean).join('\n');
      transcript = items.length ? items[0].transcript : (sub.responses || []).join('\n');
    }
    return { kind: 'speaking', prompt: speakingExternalPrompt(question, transcript, part, sub.timeSpentSeconds || 0) };
  }
  const a = await SpeakingAttempt.findById(id).select('question topic part transcript duration').lean();
  if (!a) throw new NotFoundError('Không tìm thấy bài làm (lịch sử chỉ lưu 3 tháng)');
  return { kind: 'speaking', prompt: speakingExternalPrompt(a.question || a.topic || '', a.transcript || '', a.part || 1, a.duration || 0) };
}

module.exports = {
  QUEUE_CUTOFF, WRITING_TYPES, AUTO_MAX_TRIES, list, counts, getDetail, submitReview, aiRegrade, autoRegradePending, externalPrompt,
  _messageBody: messageBody, _cleanReview: cleanReview,
};
