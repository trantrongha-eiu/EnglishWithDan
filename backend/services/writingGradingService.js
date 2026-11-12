'use strict';
// Extracted from backend/routes/admin/writingGrading.js so the manual
// "Chấm bài bằng AI" route and the writingAutoGrade cron (backend/cron/)
// share the exact same grading logic/prompt — not two copies that could
// drift out of sync. Large on purpose: the IELTS band descriptor prompt
// text is grading-rubric content, not logic.

const { checkEssay } = require('./geminiService');
const WritingTask1 = require('../models/WritingTask1');
const WritingAttempt = require('../models/WritingAttempt');

// Teacher-entered exact figures for a Task 1 chart (WritingTask1.chartData).
// Read live from the task, not from the attempt snapshot, so adding or
// correcting the figures also fixes re-grades of older submissions. Falls
// back to matching by image URL for attempts with no task1Id.
// Stores an AI grade for one task. Moves gradingStatus forward only from
// 'pending' — never back from 'confirmed': re-running "Chấm AI" on a
// confirmed essay (to compare), or the auto-grade cron finishing a task
// after the teacher confirmed mid-run, used to set 'ai_done' over it and
// hide the student's official grade again.
async function saveAiGrade(attemptId, taskNum, gradeResult) {
  const field = taskNum === 1 ? 'aiGrading.task1' : 'aiGrading.task2';
  await WritingAttempt.updateOne({ _id: attemptId }, { $set: { [field]: gradeResult, 'aiGrading.generatedAt': new Date() } });
  await WritingAttempt.updateOne({ _id: attemptId, gradingStatus: 'pending' }, { $set: { gradingStatus: 'ai_done' } });
}

async function findTask1ChartData(attempt) {
  try {
    const snap = (attempt && attempt.task1Snapshot) || {};
    let t = attempt && attempt.task1Id
      ? await WritingTask1.findById(attempt.task1Id).select('+chartData').lean()
      : null;
    if ((!t || !t.chartData) && snap.imageUrl) {
      t = await WritingTask1.findOne({ imageUrl: snap.imageUrl, chartData: { $nin: ['', null] } })
        .select('+chartData').lean();
    }
    return (t && t.chartData ? String(t.chartData) : '').trim();
  } catch {
    return ''; // missing figures only make grading less precise, never block it
  }
}

// Error types the grader may use. Keys go in the prompt; the Vietnamese
// labels are what students see (frontend/js/writing.js keeps the same map
// for display). Anything else the model invents is filed under 'other'.
const ERROR_CATEGORIES = {
  tense:              'Thì động từ',
  sva:                'Hòa hợp chủ ngữ – động từ',
  article:            'Mạo từ (a/an/the)',
  noun_number:        'Số ít / số nhiều, danh từ đếm được',
  preposition:        'Giới từ',
  word_form:          'Từ loại (word form)',
  verb_form:          'Dạng động từ (to V / V-ing / bị động)',
  sentence_structure: 'Cấu trúc câu (thiếu thành phần, câu chạy, câu cụt)',
  relative_clause:    'Mệnh đề quan hệ',
  pronoun:            'Đại từ / từ hạn định',
  comparison:         'So sánh',
  punctuation:        'Dấu câu',
  spelling:           'Chính tả',
  word_choice:        'Dùng từ sai nghĩa',
  collocation:        'Kết hợp từ (collocation)',
  register:           'Văn phong không trang trọng',
  linking:            'Từ nối / liên kết câu',
  data:               'Sai số liệu',
  other:              'Lỗi khác',
};
const ERROR_CATEGORY_KEYS = Object.keys(ERROR_CATEGORIES);

const str = v => (v == null ? '' : String(v)).trim();

// Clean up the model's feedback so the frontend can trust its shape:
// every sentence has errors[]/upgrades[] arrays, empty or no-op entries are
// dropped, a sentence is 'issue' only if it really lists an error, and the
// old single-issue fields (criterion/issue) are filled in for older
// screens and the .txt export. Mutates and returns `result`.
function normalizeFeedback(result, taskType) {
  if (!result || typeof result !== 'object') return result;
  const taCode = taskType === 1 ? 'TA' : 'TR';
  const normCrit = c => {
    const u = str(c).toUpperCase();
    if (u === 'TA' || u === 'TR') return taCode;
    return ['GRA', 'LR', 'CC'].includes(u) ? u : '';
  };
  let upgradesLeft = 12;

  const sf = Array.isArray(result.sentenceFeedback) ? result.sentenceFeedback : [];
  result.sentenceFeedback = sf.filter(s => s && typeof s === 'object' && str(s.original)).map(s => {
    const original = str(s.original);
    const errors = (Array.isArray(s.errors) ? s.errors : []).map(e => ({
      wrong:     str(e && e.wrong),
      fix:       str(e && e.fix),
      criterion: normCrit(e && e.criterion),
      category:  ERROR_CATEGORIES[str(e && e.category)] ? str(e.category) : 'other',
      why:       str(e && e.why),
    })).filter(e => (e.wrong || e.fix) && e.wrong !== e.fix);

    const upgrades = (Array.isArray(s.upgrades) ? s.upgrades : []).map(u => ({
      from: str(u && u.from), to: str(u && u.to), why: str(u && u.why),
    })).filter(u => u.from && u.to && u.from.toLowerCase() !== u.to.toLowerCase()
      && original.toLowerCase().includes(u.from.toLowerCase()))
      .slice(0, 2);
    const keptUpgrades = upgradesLeft > 0 ? upgrades : [];
    upgradesLeft -= keptUpgrades.length;

    const better = str(s.better);
    const out = { type: 'ok', original };
    if (errors.length) {
      out.type = 'issue';
      out.errors = errors;
      if (better && better !== original) out.better = better;
      out.criterion = errors[0].criterion || normCrit(s.criterion);
      out.issue = errors.map(e => e.why).filter(Boolean).join(' ');
    } else if (s.type === 'issue' && better && better !== original) {
      // Marked wrong but no concrete error named — that's acceptable wording
      // the model would phrase differently. Count it correct and keep the
      // rewrite only as a suggestion (no marks lost).
      out.suggestion = better;
      if (str(s.issue)) out.suggestionWhy = str(s.issue);
    }
    if (keptUpgrades.length) out.upgrades = keptUpgrades;
    return out;
  });

  result.logicFeedback = (Array.isArray(result.logicFeedback) ? result.logicFeedback : [])
    .map(l => ({
      paragraph:  Math.max(0, parseInt(l && l.paragraph, 10) || 0),
      criterion:  normCrit(l && l.criterion) || taCode,
      quote:      str(l && l.quote),
      problem:    str(l && l.problem),
      suggestion: str(l && l.suggestion),
    }))
    .filter(l => l.problem)
    .slice(0, 8);

  result.draft2Plan = (Array.isArray(result.draft2Plan) ? result.draft2Plan : [])
    .map(str).filter(Boolean).slice(0, 5);

  return result;
}

async function gradeTaskWithAI(taskType, prompt, answer, wordCount, imageUrl = '', chartData = '') {
  const minWords      = taskType === 1 ? 150 : 250;
  const isUnderLength = wordCount < minWords;
  const isIncomplete  = answer.trim().length > 0 && !answer.trim().match(/[.!?]["']?\s*$/);
  const taLabel       = taskType === 1 ? 'Task Achievement' : 'Task Response';
  const hasImage       = taskType === 1 && !!imageUrl;
  const refData        = taskType === 1 ? String(chartData || '').trim() : '';
  const canCheckData   = hasImage || !!refData;

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
• Essay cut off mid-sentence (no ending .!?): TA score MUST be capped at Band 4 maximum. Mention in comment.${canCheckData ? `
• DATA ACCURACY: any number, trend, comparison, or ranking the student states that CLEARLY contradicts the data is a factual error, not a style issue. Two or more CLEAR contradictions cap TA at Band 5 maximum; one significant contradiction (e.g. claiming a value rose when it fell, or naming the wrong highest/lowest item) should lower the TA score. Cite the correct figure in the Vietnamese comment when this penalty applies.
• READING TOLERANCE (mandatory): values read off a chart are approximate. A student's figure is ACCEPTABLE, not an error, if it is within about one gridline interval (roughly 10% of the axis range) of the real value, or is hedged ("around", "about", "approximately", "just under/over"). Only flag a figure that is clearly wrong beyond that tolerance, or a wrong trend direction, ranking, peak/lowest point, or category. If you are not certain the student is wrong, do NOT flag it and do NOT count it toward the Band 5 cap.` : ''}`;

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
${refData ? `\nREFERENCE DATA (exact figures entered by the teacher; AUTHORITATIVE: wherever your own reading of the image differs, these figures win):\n${refData}\n` : ''}${hasImage ? `\nThe chart/graph/table image for this task is attached below as an image input. Read it carefully before checking any figure: match each line/bar to its legend colour, then read each value against the axis labels and gridlines (note where 0 is and the gap between gridlines). Write what you read into "chartReading" FIRST, then check the essay against it.\n` : ''}
═══════════════════════════════════════════
INSTRUCTIONS:

STEP 1 – SCORES (4–9 per criterion):
• Pick the band whose FULL descriptor BEST fits the writing evidence. When the essay sits between two bands, award the LOWER band unless the higher band is clearly and consistently demonstrated throughout the full essay.
• For ${taLabel}: if any mandatory penalty above applies, apply it NOW before writing the score.${canCheckData ? ' This includes the DATA ACCURACY penalty (with the READING TOLERANCE rule): check the essay against the data before scoring TA.' : ''}
• For each criterion write 1–2 sentences in Vietnamese using IDP descriptor language, addressing the student as "em". If a mandatory penalty was applied, the comment MUST state the reason (word count, no overview, incomplete essay, no position, or data inaccuracy) in plain Vietnamese.

STEP 2 – SENTENCE-BY-SENTENCE ERROR DIAGNOSIS (MANDATORY):
Go through EVERY single sentence in the essay in order. Do NOT skip any sentence. Paragraphs are separated by line breaks; number them from 1.
• List EVERY objective error in the sentence SEPARATELY in "errors" (a sentence with 3 mistakes gets 3 entries). Each entry:
  – "wrong": the SHORTEST exact span copied character-for-character from the sentence that contains the error (a word or short phrase, not the whole sentence). For a missing word, quote the words around the gap (e.g. missing article: wrong "has huge impact", fix "has a huge impact").
  – "fix": the corrected replacement for exactly that span.
  – "criterion": GRA | LR | CC | ${taskType === 1 ? 'TA' : 'TR'}.
  – "category": exactly one of: ${ERROR_CATEGORY_KEYS.join(', ')}.
  – "why": Vietnamese, 1–2 sentences: name the rule and explain WHY the original is wrong (e.g. "Chủ ngữ 'the number of students' là số ít nên động từ phải là 'has', không phải 'have'."), not just "sai ngữ pháp".
• Only CLEAR, OBJECTIVE errors go in "errors": grammar, wrong word/collocation that a native examiner would mark wrong, spelling, punctuation that breaks the sentence, clearly conversational register (contractions, slang such as "kids", "stuff", "a bunch of", "gonna"), a faulty linking word.${canCheckData ? ' For Task 1, a number, trend or comparison that CLEARLY contradicts the data (beyond the READING TOLERANCE) is an error with category "data" and criterion TA: give the correct figure in "fix"/"why". A figure within tolerance is NOT an error.' : ''} Do NOT list something as an error just because a fancier version exists.
• ACCEPTABLE = CORRECT (mandatory): before listing anything as an error, ask "Would a trained IELTS examiner accept this as correct English?" If it is grammatical, its meaning is clear and it is not clearly conversational, it is ACCEPTABLE — even if it is plain, slightly less academic, less precise, a little wordy, or not how you would phrase it (e.g. "disposal of trash", "thrown into landfill", "went up", "a lot of", "in more detail", British or American spelling, an optional comma). An acceptable sentence is "ok": it gets NO entry in "errors", costs NO marks, and any better wording goes in "upgrades" as a suggestion. If you are not sure something is wrong, it is NOT an error. (The strictness rule at the top is about choosing the band, NOT about marking acceptable language wrong.)
• IGNORE the student's own notes/labels inside the essay, such as "(câu topic)", "(topic sentence)", "(overview)", "(mở bài)", "(body 1)" — they are not part of the writing: never list them as errors, never mention them, do not let them affect any score, and leave them out of "better".
• "type" is "issue" ONLY if the sentence has at least one entry in "errors", otherwise "ok". NEVER return an "issue" sentence with an empty "errors" list.
• "better": for an "issue" sentence, the full sentence with ONLY those errors fixed (keep the student's idea, words and structure). Omit for "ok" sentences.
• "upgrades" (optional, any sentence, including "ok" ones): SUGGESTIONS that are NOT errors and do NOT lower any score — a more precise, natural, academic or topic-specific word/collocation an IELTS Band 7–8 writer would use instead of acceptable-but-plain wording. Each: {"from":"<exact span from the sentence>","to":"<upgrade>","why":"<Vietnamese: why it is better / when to use it; make clear the original is still acceptable>"}. Natural academic English only — no rare, pretentious or wrongly-formal words. At most 2 per sentence and about 10 for the whole essay; only where the gain is clear.
• NEVER flag a sentence as CC error for lacking cohesive devices if it ALREADY opens with: Furthermore, Moreover, In addition, Additionally, However, Nevertheless, Nonetheless, Therefore, Thus, As a result, Consequently, On the other hand, In contrast, In conclusion, To summarise, For example, For instance, Firstly, Secondly, Finally, Similarly, Likewise, Although, Despite, etc.

STEP 3 – ${taskType === 1 ? 'TASK & COHERENCE CHECK' : 'LOGIC, ARGUMENT & RELEVANCE CHECK'} (paragraph level, in "logicFeedback"):
${taskType === 1
  ? `Look at the response as a whole: missing or unclear overview, key features left out, irrelevant detail or opinion, wrong grouping/comparison, data listed mechanically without comparison, poor paragraph organisation, a misleading summary of the main trend.`
  : `Look at the argument as a whole: going off topic or answering a different question, a part of the question left unanswered, an unclear or changing position, claims with no explanation or example, an example that does not support the point, illogical cause–effect, over-generalisation ("everyone", "always"), repeated ideas, a conclusion that adds new ideas or contradicts the body, a paragraph with no clear central idea.`}
${taskType === 1 ? 'Check the overview and each body paragraph in turn.' : 'Check EACH body paragraph in turn: is there a clear topic sentence → an explanation of WHY/HOW → a relevant, specific example? Flag every missing or weak link (e.g. a personal anecdote used as the only evidence, a claim stated with no reason, an example that proves something else, a sentence that drifts away from the paragraph point).'} Do NOT report word count here (already handled in the ${taLabel} comment) and do NOT repeat sentence-level grammar/vocabulary errors.
Report EVERY such problem you find, even small ones — but only real ones (empty array if the essay has none). Each: {"paragraph":<number or 0 for the whole essay>,"criterion":"${taskType === 1 ? 'TA' : 'TR'}|CC","quote":"<short exact quote from the essay, or empty>","problem":"<Vietnamese: what is wrong and why it costs marks>","suggestion":"<Vietnamese: exactly how to fix it in the rewrite, with a short English example if useful>"}. At most 8 items.

STEP 4 – DRAFT 2 PLAN ("draft2Plan"): 3–5 short Vietnamese action items, most important first, telling the student what to change when they rewrite this essay (e.g. "Thêm câu overview nêu xu hướng chính ngay sau mở bài.", "Ôn lại hòa hợp chủ ngữ – động từ: em sai 3 lần với 'the number of …'."). Be specific to THIS essay.

Return ONLY valid JSON (no markdown, no text outside JSON):
{${hasImage ? '"chartReading":"<English: the key values you read for each series/category, e.g. London Jan ~8, Jul ~23, Dec ~9>",' : ''}"bandScore":<number>,"ta":{"score":<4-9>,"comment":"<Vietnamese>"},"cc":{"score":<4-9>,"comment":"<Vietnamese>"},"lr":{"score":<4-9>,"comment":"<Vietnamese>"},"gra":{"score":<4-9>,"comment":"<Vietnamese>"},"overallFeedback":"<Vietnamese 2-3 sentences: strengths, main weaknesses, specific advice — address student as 'em'>","sentenceFeedback":[{"type":"issue","original":"<exact sentence from essay>","errors":[{"wrong":"<exact span>","fix":"<replacement>","criterion":"<GRA|LR|CC|${taskType === 1 ? 'TA' : 'TR'}>","category":"<category key>","why":"<Vietnamese>"}],"better":"<corrected English sentence>","upgrades":[{"from":"<exact span>","to":"<upgrade>","why":"<Vietnamese>"}]},{"type":"ok","original":"<exact sentence from essay>","upgrades":[]}],"logicFeedback":[{"paragraph":<n>,"criterion":"<${taskType === 1 ? 'TA' : 'TR'}|CC>","quote":"<exact quote or empty>","problem":"<Vietnamese>","suggestion":"<Vietnamese>"}],"draft2Plan":["<Vietnamese>"]}

CRITICAL RULES:
• bandScore in JSON is ignored — server recalculates from (ta+cc+lr+gra)/4 rounded DOWN to the nearest 0.5
• sentenceFeedback MUST include EVERY sentence of the essay in original order; "original" and every "wrong"/"from"/"quote" must be copied exactly from the essay
• The criterion scores must agree with the errors you listed (many GRA errors → GRA cannot be high). Only entries in "errors" count against a score; "upgrades" (suggestions) and acceptable wording NEVER lower LR, GRA or CC
• All comment/why/problem/suggestion/overallFeedback/draft2Plan MUST be in Vietnamese; "fix", "better", "to" MUST be in English
• Use encouraging teacher tone in Vietnamese; address student as "em"`;

  // Listing every error with an explanation is a long answer (and 2.5-flash
  // spends part of the budget thinking) — more tokens and time than the
  // 8192 / 45s defaults.
  const result = await checkEssay(questionContext, answer, hasImage ? imageUrl : '',
    { maxOutputTokens: 24576, timeoutMs: 100000 });
  delete result.chartReading; // the model's scratch work, not shown to anyone
  normalizeFeedback(result, taskType);

  // Server-side enforcement of IDP mandatory penalties (safety net — overrides AI if ignored).
  // result.ta carries Task 1's TA score AND Task 2's TR score under the
  // same JSON key (see the shared response schema below) — the incomplete-
  // essay penalty is identical for both tasks (cap at Band 4, see both
  // task1TA/task2TR prompt blocks above), but the under-length penalty is
  // NOT: Task 1's rule is a hard cap at Band 5, while Task 2's IDP rule is
  // a RELATIVE reduction ("reduce by at least 1 band" — see task2TR above),
  // which has no independent server-side baseline to enforce against once
  // the AI has already applied it. This safety net previously applied
  // Task 1's hard cap to Task 2 as well (audit finding BUG-012), silently
  // over-penalizing a strong-but-short Task 2 essay (e.g. AI-judged Band
  // 7→6 per its own instructed reduction, then force-capped down to 5
  // anyway). Task 2 under-length is left to the prompt instruction alone,
  // same trust model already applied to every other qualitative rule here
  // (LR/CC/GRA, "no clear position" cap, etc.) that has no numeric baseline
  // to independently re-verify either.
  if (result.ta) {
    if (isIncomplete && result.ta.score > 4) {
      result.ta.score = 4;
    } else if (isUnderLength && taskType === 1 && result.ta.score > 5) {
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

module.exports = { gradeTaskWithAI, findTask1ChartData, saveAiGrade, normalizeFeedback, ERROR_CATEGORIES };
