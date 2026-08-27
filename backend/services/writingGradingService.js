'use strict';
// Extracted from backend/routes/admin/writingGrading.js so the manual
// "Chấm bài bằng AI" route and the writingAutoGrade cron (backend/cron/)
// share the exact same grading logic/prompt — not two copies that could
// drift out of sync. Large on purpose: the IELTS band descriptor prompt
// text is grading-rubric content, not logic.

const { checkEssay } = require('./geminiService');

async function gradeTaskWithAI(taskType, prompt, answer, wordCount, imageUrl = '') {
  const minWords      = taskType === 1 ? 150 : 250;
  const isUnderLength = wordCount < minWords;
  const isIncomplete  = answer.trim().length > 0 && !answer.trim().match(/[.!?]["']?\s*$/);
  const taLabel       = taskType === 1 ? 'Task Achievement' : 'Task Response';
  const hasImage       = taskType === 1 && !!imageUrl;

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
• Essay cut off mid-sentence (no ending .!?): TA score MUST be capped at Band 4 maximum. Mention in comment.${hasImage ? `
• DATA ACCURACY (checked against the attached chart/graph/table image — this is now verifiable, not a guess): any number, trend, comparison, or ranking the student states that CONTRADICTS what the image actually shows is a factual error, not a style issue. Two or more such contradictions cap TA at Band 5 maximum; even one significant contradiction (e.g. claiming a value rose when the image shows it fell) should visibly lower the TA score. Cite the real figure from the image in the Vietnamese comment when this penalty applies.` : ''}`;

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
${hasImage ? `\nThe actual chart/graph/table image for this task is attached below as an image input — this is the real, ground-truth data source, not just a description of it. Read every axis, label, legend, and value in it before scoring.\n` : ''}
═══════════════════════════════════════════
INSTRUCTIONS:

STEP 1 – SCORES (4–9 per criterion):
• Pick the band whose FULL descriptor BEST fits the writing evidence. When the essay sits between two bands, award the LOWER band unless the higher band is clearly and consistently demonstrated throughout the full essay.
• For ${taLabel}: if any mandatory penalty above applies, apply it NOW before writing the score.${hasImage ? ' This includes the DATA ACCURACY penalty — check the essay against the attached image before scoring TA.' : ''}
• For each criterion write 1–2 sentences in Vietnamese using IDP descriptor language, addressing the student as "em". If a mandatory penalty was applied, the comment MUST state the reason (word count, no overview, incomplete essay, no position, or data inaccuracy) in plain Vietnamese.

STEP 2 – SENTENCE-BY-SENTENCE FEEDBACK (MANDATORY):
Go through EVERY single sentence in the essay in order. Do NOT skip any sentence.
• Mark as "issue" ONLY for CLEAR, OBJECTIVE problems: grammatical error, wrong word choice that impedes or distorts meaning, incoherent/illogical connection, or missing key task requirement.${hasImage ? ' For Task 1, a sentence stating a number, trend, or comparison that does NOT match the attached image is also an "issue" (criterion: TA) — quote the correct figure from the image in the "issue" field.' : ''} The criterion badge must directly match the problem.
• Mark as "ok" if the sentence is grammatically correct and fulfils its purpose — even if simple. Do NOT mark "issue" just because a fancier version exists.
• NEVER flag a sentence as CC "issue" for lacking cohesive devices if it ALREADY opens with: Furthermore, Moreover, In addition, Additionally, However, Nevertheless, Nonetheless, Therefore, Thus, As a result, Consequently, On the other hand, In contrast, In conclusion, To summarise, For example, For instance, Firstly, Secondly, Finally, Similarly, Likewise, Although, Despite, etc.
• When marking "issue": the "better" field must fix ONLY the identified problem, preserving the student's original idea and structure.

Return ONLY valid JSON (no markdown, no text outside JSON):
{"bandScore":<number>,"ta":{"score":<4-9>,"comment":"<Vietnamese>"},"cc":{"score":<4-9>,"comment":"<Vietnamese>"},"lr":{"score":<4-9>,"comment":"<Vietnamese>"},"gra":{"score":<4-9>,"comment":"<Vietnamese>"},"overallFeedback":"<Vietnamese 2-3 sentences: strengths, main weaknesses, specific advice — address student as 'em'>","sentenceFeedback":[{"type":"issue","original":"<exact sentence from essay>","criterion":"<TA|CC|LR|GRA>","issue":"<Vietnamese explanation>","better":"<corrected English sentence>"},{"type":"ok","original":"<exact sentence from essay>"}]}

CRITICAL RULES:
• bandScore in JSON is ignored — server recalculates from (ta+cc+lr+gra)/4 rounded DOWN to the nearest 0.5
• sentenceFeedback MUST include EVERY sentence of the essay in original order
• All comment/issue/overallFeedback MUST be in Vietnamese; "better" MUST be in English
• Use encouraging teacher tone in Vietnamese; address student as "em"`;

  const result = await checkEssay(questionContext, answer, hasImage ? imageUrl : '');

  // Server-side enforcement of IDP mandatory penalties (safety net — overrides AI if ignored)
  if (result.ta) {
    if (isIncomplete && result.ta.score > 4) {
      result.ta.score = 4;
    } else if (isUnderLength && result.ta.score > 5) {
      result.ta.score = 5;
    }
  }

  // Recalculate bandScore from individual criterion scores. Site policy is
  // to always round DOWN to the nearest 0.5 — deliberately stricter than
  // the official IELTS half-up-at-.25/.75 convention (which would round a
  // 5.75 average, e.g. three 6.0 criteria + one 5.0, UP to 6.0) — a student
  // should never see a band their criteria scores didn't actually average
  // to. Only four 6.0s average to a clean 6.0; anything under that, even by
  // 0.25, is reported as the band below.
  const scores = [result.ta?.score, result.cc?.score, result.lr?.score, result.gra?.score]
    .map(Number).filter(s => !isNaN(s) && s > 0);
  if (scores.length === 4) {
    result.bandScore = Math.floor((scores.reduce((a, b) => a + b, 0) / 4) * 2) / 2;
  }
  return result;
}

module.exports = { gradeTaskWithAI };
