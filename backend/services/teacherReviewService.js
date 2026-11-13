'use strict';

// Teacher review queue — "Chấm bài khoá học & Speaking" (admin
// /submission-reviews). Every open-ended submission a student makes is
// AI-graded instantly as before; this is the human layer on top:
//
//  - kind 'writing'  = course writing (WT1Submission whose exercise is
//    sentence_writing / paragraph_writing / full_task1 — every course on the
//    WT1 stack, Mindset included). The teacher reads it next to the AI grade,
//    can re-run the AI (e.g. it was busy at submit time and the student only
//    got the rubric fallback), then confirms a band and/or writes a comment.
//  - kind 'speaking' = course speaking_response (WT1Submission, recordings
//    saved per item since this feature) + standalone Speaking practice
//    (SpeakingAttempt, minus the course mirrors tagged source:'course'). The
//    teacher listens to the recording and grades by hand.
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

function speakingQuery(status, userIds) {
  return {
    source: { $ne: 'course' }, status: { $in: ['analyzed', 'error'] },
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
    aiBand: a.aiFeedback?.overallBand || null, score: null, aiUnavailable: a.status === 'error',
    words: null, hasAudio: !!a.audioUrl,
    teacherBand: a.teacherReview?.band ?? null,
    reviewedAt: a.teacherReview?.reviewedAt || null, reviewerName: a.teacherReview?.reviewerName || '',
  }));
}

const USER_FIELDS = 'username firstName lastName';
const COURSE_LIST_FIELDS = 'userId exerciseCode lessonCode attempt createdAt score responses aiFeedback.bandEstimate localFeedback.aiUnavailable audioUrl itemResults.audioUrl teacherReview';
const SPEAKING_LIST_FIELDS = 'userId topic part question createdAt status audioUrl aiFeedback.overallBand teacherReview';

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
  const sq = speakingQuery(status, userIds);
  const upto = pg * lim;
  const [subs, attempts, totalA, totalB] = await Promise.all([
    WT1Submission.find(cq).select(COURSE_LIST_FIELDS).populate('userId', USER_FIELDS).sort({ createdAt: -1 }).limit(upto).lean(),
    SpeakingAttempt.find(sq).select(SPEAKING_LIST_FIELDS).populate('userId', USER_FIELDS).sort({ createdAt: -1 }).limit(upto).lean(),
    WT1Submission.countDocuments(cq),
    SpeakingAttempt.countDocuments(sq),
  ]);
  const merged = [...(await courseRows(subs, exByCode)), ...speakingRows(attempts)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((pg - 1) * lim, upto);
  return { rows: merged, total: totalA + totalB, page: pg, limit: lim };
}

// Pending counts per tab (+ the sidebar badge, which is their sum).
async function counts() {
  const [wEx, sEx] = await Promise.all([exercisesOfTypes(WRITING_TYPES), exercisesOfTypes(SPEAKING_TYPES)]);
  const [writing, courseSpeaking, speaking] = await Promise.all([
    WT1Submission.countDocuments(courseQuery(wEx.map((e) => e.code), 'pending', null)),
    WT1Submission.countDocuments(courseQuery(sEx.map((e) => e.code), 'pending', null)),
    SpeakingAttempt.countDocuments(speakingQuery('pending', null)),
  ]);
  return { writing, speaking: courseSpeaking + speaking };
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

function messageBody({ title, context, review, page, updated }) {
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
    sub.teacherReview = { ...review, reviewedBy: actor._id, reviewerName: displayName(actor), reviewedAt: now };
    await sub.save();
    const ctx = (await lessonContext([sub.lessonCode]))[sub.lessonCode] || {};
    await notifyStudent(actor, sub.userId, `💬 Giáo viên đã chấm: ${ex.title || ex.code}`, messageBody({
      title: ex.title || ex.code, context: [ctx.courseTitle, ctx.lessonTitle].filter(Boolean).join(' · '),
      review, page: COURSE_PAGES[ctx.courseCode] || '', updated,
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
  const { graded, ...aiFeedback } = ai; // eslint-disable-line no-unused-vars
  sub.aiFeedback = aiFeedback;
  await sub.save();
  return getDetail('course', id);
}

module.exports = { QUEUE_CUTOFF, WRITING_TYPES, list, counts, getDetail, submitReview, aiRegrade, _messageBody: messageBody, _cleanReview: cleanReview };
