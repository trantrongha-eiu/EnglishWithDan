'use strict';
// Extracted from backend/routes/admin.js — Writing AI Grading section
// (gradeTaskWithAI + the two routes that use it). Large on purpose: the
// IELTS band descriptor prompt text is grading-rubric content, not logic.

const express = require('express');
const rateLimit = require('express-rate-limit');
const auth    = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const { checkEssay } = require('../../services/geminiService');

const WritingAttempt = require('../../models/WritingAttempt');
const User           = require('../../models/User');
const { escapeHtml } = require('../../utils/escapeHtml');
const logger = require('../../utils/logger');

const router = express.Router();

// ai-grade calls the Gemini API with the largest prompt in the system
// (full IELTS band-descriptor rubric, maxOutputTokens: 8192) — cap runaway
// client loops without affecting normal grading workflow (teachers grade
// one task at a time by design, see comment below).
const aiGradeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: req => req.user?._id?.toString() || req.ip,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { path: req.path, userId: req.user?._id?.toString(), ip: req.ip });
    res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu chấm AI, vui lòng thử lại sau 15 phút.' });
  },
  skip: req => req.user?.role === 'admin'
});

// ══════════════════════════════════════════════════
// WRITING AI GRADING
// ══════════════════════════════════════════════════

async function gradeTaskWithAI(taskType, prompt, answer, wordCount) {
  const minWords      = taskType === 1 ? 150 : 250;
  const isUnderLength = wordCount < minWords;
  const isIncomplete  = answer.trim().length > 0 && !answer.trim().match(/[.!?]["']?\s*$/);
  const taLabel       = taskType === 1 ? 'Task Achievement' : 'Task Response';

  // ─── TASK 1: Task Achievement (IDP Academic Band Descriptors) ──────────────
  const task1TA = `TASK ACHIEVEMENT (TA) – Task 1 Academic (IDP Band Descriptors):
Band 9: Fully satisfies all requirements. Clearly presents a fully developed response.
Band 8: Covers all requirements sufficiently. Presents, highlights and illustrates key features clearly and appropriately. Data accurately described.
Band 7: Covers requirements with few omissions. Clear overview of main trends/differences/stages. Key features clearly presented and highlighted, but could be more fully extended.
Band 6: Addresses requirements. Overview attempted with information appropriately selected. Key features highlighted but details may be irrelevant, inappropriate or inaccurate.
Band 5: Generally addresses the task; format may be inappropriate in places. Recounts detail mechanically with no clear overview; may be no data to support description. Cannot clearly highlight key features.
Band 4: Attempts to address the task but does not cover all key features; tendency to focus on details. Format may be inappropriate. Only isolated, relevant key features — may be repetitive, inaccurate or irrelevant. Overview, if attempted, may be unclear.
Band 3: Does not address the task or completely misunderstood. Presents limited relevant key features only.

MANDATORY PENALTIES (enforce strictly — these override the content score):
• Under 150 words (this essay: ${wordCount} words): TA score MUST be capped at Band 5 maximum. State in Vietnamese comment: "Em chỉ viết ${wordCount} từ, dưới mức tối thiểu 150 từ — bài bị giới hạn tối đa Band 5 cho tiêu chí này."
• No overview anywhere in the essay: TA score MUST be capped at Band 5 maximum. Mention absence of overview in comment.
• Essay cut off mid-sentence (no ending .!?): TA score MUST be capped at Band 4 maximum. Mention in comment.`;

  // ─── TASK 2: Task Response (IDP Band Descriptors) ─────────────────────────
  const task2TR = `TASK RESPONSE (TR) – Task 2 (IDP Band Descriptors):
Band 9: Fully addresses all parts of the task. Fully developed position with relevant, fully extended and well-supported ideas.
Band 8: Sufficiently addresses all parts. Well-developed response with relevant, extended and supported ideas.
Band 7: Addresses all parts. Clear position throughout. Main ideas extended and supported; may over-generalise or supporting ideas may lack focus.
Band 6: Addresses all parts, though some more than others. Relevant position but conclusions may become unclear or repetitive. Main ideas relevant but some inadequately developed or unclear.
Band 5: Addresses the task only partially; format may be inappropriate. Position expressed but development not always clear; may be no conclusions drawn. Some main ideas but limited, not sufficiently developed; may be irrelevant detail.
Band 4: Responds to the task only minimally or tangentially; format may be inappropriate. Position present but unclear. Main ideas difficult to identify; may be repetitive, irrelevant or unsupported.
Band 3: Does not adequately address any part. No clear position. Few ideas, largely undeveloped or irrelevant.

MANDATORY PENALTIES (enforce strictly — these override the content score):
• Under 250 words (this essay: ${wordCount} words): IDP rules require TR score to be REDUCED. Apply: if content merits Band 6 → award Band 5; if content merits Band 5 → award Band 4; etc. (reduce by at least 1 band). You MUST include this sentence in the Vietnamese tr comment: "Em chỉ viết ${wordCount} từ, dưới mức tối thiểu 250 từ theo quy định IDP — điểm Task Response bị trừ một band."
• Essay cut off mid-sentence (no ending .!?): TR MUST be capped at Band 4 maximum. Mention in comment.
• No identifiable position or opinion anywhere in essay: TR MUST be capped at Band 4 maximum. Mention in comment.`;

  // ─── SHARED: CC / LR / GRA (IDP Band Descriptors) ────────────────────────
  const sharedDescriptors = `COHERENCE AND COHESION (CC) – IDP Band Descriptors:
Band 9: Uses cohesion in a way that attracts no attention. Skilfully manages paragraphing.
Band 8: Sequences information and ideas logically. Manages all aspects of cohesion well. Uses paragraphing sufficiently and appropriately.
Band 7: Logically organises information; clear progression throughout. Appropriate range of cohesive devices with possible minor under-/over-use. Clear central topic within each paragraph.
Band 6: Arranges information coherently with clear overall progression. Uses cohesive devices effectively but cohesion within/between sentences may be faulty or mechanical. Uses paragraphing but not always logically.
Band 5: Some organisation but lack of overall progression. Inadequate, inaccurate or over-use of cohesive devices. Paragraphing not used sufficiently or not at all.
Band 4: Information not arranged coherently; no clear progression. Some basic cohesive devices but may be inaccurate or repetitive. May not write in paragraphs.
Band 3: Does not organise ideas logically. Very limited cohesive devices; those used may not indicate logical relationships.

LEXICAL RESOURCE (LR) – IDP Band Descriptors:
Band 9: Wide range with very natural and sophisticated control. Rare minor errors only as 'slips'.
Band 8: Wide range used fluently and flexibly; precise meanings. Skilfully uses uncommon items; occasional inaccuracies in word choice/collocation. Rare errors in spelling/word formation.
Band 7: Sufficient range for flexibility and precision. Less common items used with some awareness of style/collocation. Occasional errors in word choice, spelling and/or word formation.
Band 6: Adequate range for the task. Attempts less common vocabulary but with some inaccuracy. Errors in spelling and/or word formation do not impede communication.
Band 5: Limited range, minimally adequate. Noticeable errors in spelling and/or word formation may cause some difficulty. Overuses certain lexical items.
Band 4: Only basic vocabulary, may be repetitive or inappropriate. Limited control of word formation and/or spelling; errors may cause strain for the reader.
Band 3: Very limited range with very limited control of word formation and/or spelling. Errors may severely distort the message.

GRAMMATICAL RANGE AND ACCURACY (GRA) – IDP Band Descriptors:
Band 9: Wide range of structures with full flexibility and accuracy. Rare minor errors only as 'slips'.
Band 8: Wide range of structures. Majority of sentences error-free. Only very occasional errors or inappropriacies.
Band 7: Variety of complex structures. Frequent error-free sentences. Good control of grammar and punctuation; may make a few errors.
Band 6: Mix of simple and complex sentence forms. Some errors in grammar and punctuation but they rarely reduce communication.
Band 5: Only limited range of structures. Complex sentences attempted but tend to be less accurate than simple ones. Frequent grammatical errors; punctuation may be faulty.
Band 4: Very limited range with rare subordinate clauses. Some accurate structures but errors predominate; punctuation often faulty.
Band 3: Sentence forms attempted but errors in grammar and punctuation predominate and distort meaning.

SCORE CALIBRATION (strictly enforced):
• Band 9: Near-perfect native-level control — extremely rare.
• Band 8: Only minor, infrequent errors; consistently sophisticated — uncommon in learner writing.
• Band 7: Some flexibility and range but clear gaps remain; occasional errors are acceptable but not frequent. Award ONLY when the Band 7 descriptor is clearly and consistently met.
• Band 6: Communicates adequately but with noticeable weaknesses throughout — this is the realistic ceiling for most intermediate EFL writers.
• Band 5: Limited range, frequent errors, reader must work to understand — common for developing writers.
• Band 4: Communication seriously and FREQUENTLY impeded — reserve for essays where the Band 4 descriptor is clearly met.
STRICT RULE: When in doubt between two adjacent bands, choose the LOWER one. Do not round up. A single impressive sentence does not justify a higher band. Evidence must be consistent across the whole essay. Most IELTS candidates score 5–6; a score of 7+ must be justified by concrete evidence of advanced language use.`;

  // ─── Build context string (essay injected by geminiService) ───────────────
  const wordCountLine = isUnderLength
    ? `\n⚠️ WORD COUNT ALERT: This essay has only ${wordCount} words (minimum ${minWords}). Apply mandatory penalty to ${taLabel} score as specified in the descriptors above.`
    : `\nWord count: ${wordCount} words (meets minimum ${minWords}).`;
  const incompleteLine = isIncomplete
    ? `\n⚠️ INCOMPLETE ESSAY: Essay does not end with a complete sentence (no .!? at end). Apply mandatory cap: ${taLabel} ≤ Band 4.`
    : '';

  const questionContext = `You are a strict IELTS examiner applying official IDP/British Council band descriptors. Award scores that reflect the writing as it stands — do NOT give the benefit of the doubt, do NOT assume what the writer intended, and do NOT inflate scores because the student made an effort. High scores (7+) must be earned by clear, consistent evidence across the full essay.

Grade this IELTS Academic Writing Task ${taskType}.${wordCountLine}${incompleteLine}

═══════════════════════════════════════════
BAND DESCRIPTORS – ${taLabel}:
${taskType === 1 ? task1TA : task2TR}

═══════════════════════════════════════════
BAND DESCRIPTORS – CC / LR / GRA:
${sharedDescriptors}

═══════════════════════════════════════════
TASK PROMPT: ${prompt}

═══════════════════════════════════════════
INSTRUCTIONS:

STEP 1 – SCORES (4–9 per criterion):
• Pick the band whose FULL descriptor BEST fits the writing evidence. When the essay sits between two bands, award the LOWER band unless the higher band is clearly and consistently demonstrated throughout the full essay.
• For ${taLabel}: if any mandatory penalty above applies, apply it NOW before writing the score.
• For each criterion write 1–2 sentences in Vietnamese using IDP descriptor language, addressing the student as "em". If a mandatory penalty was applied, the comment MUST state the reason (word count, no overview, incomplete essay, or no position) in plain Vietnamese.

STEP 2 – SENTENCE-BY-SENTENCE FEEDBACK (MANDATORY):
Go through EVERY single sentence in the essay in order. Do NOT skip any sentence.
• Mark as "issue" ONLY for CLEAR, OBJECTIVE problems: grammatical error, wrong word choice that impedes or distorts meaning, incoherent/illogical connection, or missing key task requirement. The criterion badge must directly match the problem.
• Mark as "ok" if the sentence is grammatically correct and fulfils its purpose — even if simple. Do NOT mark "issue" just because a fancier version exists.
• NEVER flag a sentence as CC "issue" for lacking cohesive devices if it ALREADY opens with: Furthermore, Moreover, In addition, Additionally, However, Nevertheless, Nonetheless, Therefore, Thus, As a result, Consequently, On the other hand, In contrast, In conclusion, To summarise, For example, For instance, Firstly, Secondly, Finally, Similarly, Likewise, Although, Despite, etc.
• When marking "issue": the "better" field must fix ONLY the identified problem, preserving the student's original idea and structure.

Return ONLY valid JSON (no markdown, no text outside JSON):
{"bandScore":<number>,"ta":{"score":<4-9>,"comment":"<Vietnamese>"},"cc":{"score":<4-9>,"comment":"<Vietnamese>"},"lr":{"score":<4-9>,"comment":"<Vietnamese>"},"gra":{"score":<4-9>,"comment":"<Vietnamese>"},"overallFeedback":"<Vietnamese 2-3 sentences: strengths, main weaknesses, specific advice — address student as 'em'>","sentenceFeedback":[{"type":"issue","original":"<exact sentence from essay>","criterion":"<TA|CC|LR|GRA>","issue":"<Vietnamese explanation>","better":"<corrected English sentence>"},{"type":"ok","original":"<exact sentence from essay>"}]}

CRITICAL RULES:
• bandScore in JSON is ignored — server recalculates from (ta+cc+lr+gra)/4 rounded to nearest 0.5
• sentenceFeedback MUST include EVERY sentence of the essay in original order
• All comment/issue/overallFeedback MUST be in Vietnamese; "better" MUST be in English
• Use encouraging teacher tone in Vietnamese; address student as "em"`;

  const result = await checkEssay(questionContext, answer);

  // Server-side enforcement of IDP mandatory penalties (safety net — overrides AI if ignored)
  if (result.ta) {
    if (isIncomplete && result.ta.score > 4) {
      result.ta.score = 4;
    } else if (isUnderLength && result.ta.score > 5) {
      result.ta.score = 5;
    }
  }

  // Recalculate bandScore from individual criterion scores
  const scores = [result.ta?.score, result.cc?.score, result.lr?.score, result.gra?.score]
    .map(Number).filter(s => !isNaN(s) && s > 0);
  if (scores.length === 4) {
    result.bandScore = Math.round((scores.reduce((a, b) => a + b, 0) / 4) * 2) / 2;
  }
  return result;
}

// POST /api/admin/writing-attempts/:id/ai-grade
// Body: { taskNum: 1 | 2 }  — grade only one task at a time to avoid rate limit
router.post('/writing-attempts/:id/ai-grade', auth, teacherOnly, aiGradeLimiter, async (req, res) => {
  try {
    const attempt = await WritingAttempt.findById(req.params.id).lean();
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp' });

    const taskNum = Number(req.body.taskNum);
    if (taskNum !== 1 && taskNum !== 2)
      return res.status(400).json({ success: false, message: 'taskNum phải là 1 hoặc 2' });

    const isTask1 = taskNum === 1;
    const taskPrompt = isTask1
      ? (attempt.task1Snapshot?.prompt || '')
      : (attempt.task2Snapshot?.prompt || '');
    const taskAnswer = isTask1 ? (attempt.task1Answer || '') : (attempt.task2Answer || '');
    const wordCount  = isTask1 ? (attempt.wordCount1 || 0) : (attempt.wordCount2 || 0);

    const gradeResult = await gradeTaskWithAI(taskNum, taskPrompt, taskAnswer, wordCount);

    const field = isTask1 ? 'aiGrading.task1' : 'aiGrading.task2';
    await WritingAttempt.findByIdAndUpdate(req.params.id, {
      $set: { [field]: gradeResult, 'aiGrading.generatedAt': new Date(), gradingStatus: 'ai_done' }
    });

    res.json({ success: true, taskNum, result: gradeResult });
  } catch (err) {
    const status = err.isOverloaded ? 503 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/writing-attempts/:id/confirm-grade
router.put('/writing-attempts/:id/confirm-grade', auth, teacherOnly, async (req, res) => {
  try {
    const { task1, task2, overallBand, adminNote } = req.body;
    const confirmedBy = req.user.username || req.user._id.toString();
    const confirmedAt = new Date();

    const attempt = await WritingAttempt.findByIdAndUpdate(req.params.id, {
      grading: { task1, task2, overallBand, adminNote: adminNote || '', confirmedAt, confirmedBy },
      gradingStatus: 'confirmed',
      feedbackRead: false
    }, { new: false }); // get the original to read userId + examName

    res.json({ success: true, message: 'Đã xác nhận điểm' });

    // Fire-and-forget: detached from request lifecycle via setImmediate
    // so any error here can never trigger the outer catch after headers are sent
    if (attempt && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      setImmediate(async () => {
      try {
        const student = await User.findById(attempt.userId).select('email firstName username').lean();
        if (student?.email) {
          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
          });
          const displayName = student.firstName || student.username || 'bạn';
          const bandColor = overallBand >= 7 ? '#16a34a' : overallBand >= 5.5 ? '#2563eb' : '#d97706';
          await transporter.sendMail({
            from: `"EnglishWithDan" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: `✅ Bài Writing "${attempt.examName || 'của bạn'}" đã được chấm – Band ${overallBand}`,
            html: `
<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fb;padding:32px 24px;border-radius:12px">
  <div style="text-align:center;margin-bottom:24px">
    <div style="font-size:22px;font-weight:800;letter-spacing:-.5px">
      <span style="color:#3d8bff">Daniel</span><span style="color:#e53935">Hà</span>
    </div>
  </div>
  <div style="background:#fff;border-radius:12px;padding:28px 24px;border:1px solid #e5e7eb">
    <p style="font-size:16px;font-weight:700;color:#111;margin:0 0 8px">Xin chào ${escapeHtml(displayName)}! 👋</p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6">Bài thi Writing <strong style="color:#111">"${escapeHtml(attempt.examName || '')}"</strong> của bạn đã được giáo viên chấm xong.</p>

    <div style="text-align:center;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #3b82f6;border-radius:12px;padding:20px;margin-bottom:20px">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Overall Band Score</div>
      <div style="font-size:52px;font-weight:900;color:${bandColor};line-height:1">${overallBand ?? '–'}</div>
    </div>

    ${adminNote ? `
    <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:8px;padding:12px 16px;margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;color:#059669;margin-bottom:4px">💬 Nhận xét từ giáo viên</div>
      <div style="font-size:14px;color:#065f46;line-height:1.65">${escapeHtml(adminNote)}</div>
    </div>` : ''}

    <div style="text-align:center;margin-top:8px">
      <a href="https://englishwithdan.onrender.com/writing.html"
        style="display:inline-block;background:#e53935;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:700">
        📋 Xem bài làm & Feedback chi tiết
      </a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px">EnglishWithDan · Đây là email tự động, vui lòng không trả lời.</p>
</div>`
          });
        }
      } catch (mailErr) {
        console.error('[Writing] Grade email error:', mailErr.message);
      }
      }); // end setImmediate
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
