const { GoogleGenAI } = require('@google/genai');

const MODEL = 'gemini-2.5-flash';

// IELTS examiner persona — same calibration rules as the original Groq implementation
const SYSTEM_INSTRUCTION = `You are an experienced, calibrated IELTS examiner (IDP/British Council certified). \
Apply the May 2023 Band Descriptors accurately — score exactly what the evidence shows, neither inflating nor deflating. \
Remember: most non-native learners who write a complete, coherent essay score 5–6.5. \
Reserve Band 4 ONLY when the descriptor explicitly matches (serious, frequent problems). \
Enforce band caps only when the stated condition is genuinely met. \
Respond ONLY in valid JSON. \
IMPORTANT: You MUST include sentenceFeedback covering EVERY sentence of the student essay — this is mandatory.`;

/**
 * Grade an IELTS essay with Gemini.
 * @param {string} question  Full grading context: task type, band descriptors, essay prompt, instructions.
 * @param {string} essay     Raw student essay text.
 * @param {number} _attempt  Internal retry counter (do not pass externally).
 * @returns {Promise<object>} Parsed JSON grading result.
 */
async function checkEssay(question, essay, _attempt = 0) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY chưa được cấu hình');

  const ai = new GoogleGenAI({ apiKey });

  const content = `${question}\n\n**Bài làm của học sinh:**\n${essay}`;

  let rawText;
  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: content,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 8192
      }
    });
    rawText = result.text;
  } catch (err) {
    console.error('[Gemini] API error:', err.status, err.message || err);
    // Detect quota / overload errors so caller can return 503 to admin
    const msg = (err.message || '').toLowerCase();
    const isOverload =
      err.status === 503 || err.status === 429 ||
      msg.includes('overloaded') || msg.includes('resource_exhausted') ||
      msg.includes('quota') || msg.includes('unavailable') || msg.includes('too many');
    if (isOverload) {
      const oe = new Error('AI đang quá tải hoặc hết quota, vui lòng thử lại sau ít phút.');
      oe.isOverloaded = true;
      throw oe;
    }
    throw err;
  }

  // Parse JSON — retry once automatically on failure
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('no JSON object found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    if (_attempt < 1) {
      console.error('[Gemini] JSON parse failed, retrying once…', parseErr.message);
      return checkEssay(question, essay, _attempt + 1);
    }
    console.error('[Gemini] JSON parse failed after retry. Raw response:\n', rawText?.slice(0, 500));
    throw new Error('Gemini không trả về JSON hợp lệ sau 2 lần thử');
  }
}

// ── Speaking Analysis ─────────────────────────────────
const SPEAKING_SYSTEM = `You are an experienced IELTS Speaking examiner (IDP/British Council certified).
Apply the IELTS Speaking Band Descriptors accurately across all four criteria.
Most non-native speakers score Band 5–7. Be calibrated, not inflated.
Respond ONLY with valid JSON — no markdown, no extra text.`;

/**
 * Analyze an IELTS speaking transcript with Gemini.
 */
async function checkSpeaking(question, transcript, part = 1, _attempt = 0) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY chưa được cấu hình');

  const ai = new GoogleGenAI({ apiKey });

  const content = `IELTS Speaking Part ${part}

Question: "${question}"

Student's spoken response:
"${transcript}"

Return this exact JSON (no other text):
{
  "overall_band": <number 1–9, nearest 0.5>,
  "fluency": <integer 1–9>,
  "vocabulary": <integer 1–9>,
  "grammar": <integer 1–9>,
  "pronunciation": <integer 1–9>,
  "corrected": "<natural improved version of the full response>",
  "overall_feedback": "<2–3 sentences: key observations>",
  "strengths": ["<specific strength>", "<specific strength>"],
  "improvements": ["<actionable suggestion>", "<actionable suggestion>"],
  "errors": [
    {"wrong": "<original phrase>", "right": "<better version>", "tip": "<brief reason why>"}
  ]
}

Rules: max 4 errors, max 3 strengths, max 3 improvements. overall_band = rounded average of the 4 scores.`;

  let rawText;
  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: content,
      config: {
        systemInstruction: SPEAKING_SYSTEM,
        responseMimeType: 'application/json',
        temperature: 0.35,
        maxOutputTokens: 2048
      }
    });
    rawText = result.text;
  } catch (err) {
    console.error('[Gemini Speaking] API error:', err.status, err.message || err);
    const msg = (err.message || '').toLowerCase();
    const isOverload =
      err.status === 503 || err.status === 429 ||
      msg.includes('overloaded') || msg.includes('resource_exhausted') ||
      msg.includes('quota') || msg.includes('unavailable') || msg.includes('too many');
    if (isOverload) {
      const oe = new Error('AI đang quá tải, vui lòng thử lại sau ít phút.');
      oe.isOverloaded = true;
      throw oe;
    }
    throw err;
  }

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('no JSON object found');
    return JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    if (_attempt < 1) {
      console.error('[Gemini Speaking] JSON parse failed, retrying…', parseErr.message);
      return checkSpeaking(question, transcript, part, _attempt + 1);
    }
    throw new Error('Gemini không trả về JSON hợp lệ sau 2 lần thử');
  }
}

// ── Task 2 Practice — Sentence-level AI grading ───────────────────────
const T2_GRADE_SYSTEM = `Bạn là giáo viên tiếng Anh IELTS chuyên chấm bài tập câu.
Chấm CÔNG BẰNG và LINH HOẠT — chấp nhận cách diễn đạt đồng nghĩa nếu đúng ngữ pháp và đúng nghĩa.
Không yêu cầu câu học sinh phải giống y hệt đáp án mẫu.
Respond ONLY with valid JSON — no markdown, no extra text.`;

const T2_TYPE_VI = {
  translation:       'Dịch câu tiếng Việt sang tiếng Anh',
  error_correction:  'Sửa lỗi ngữ pháp trong câu tiếng Anh',
  paraphrase:        'Diễn đạt lại câu bằng cách khác (paraphrase)',
  short_writing:     'Viết câu tiếng Anh theo yêu cầu'
};

/**
 * Grade a single open-ended Task 2 practice sentence with Gemini.
 */
async function gradeT2Question({ type, questionText, modelAnswer, userAnswer }, _attempt = 0) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY chưa cấu hình');

  const ai = new GoogleGenAI({ apiKey });
  const typeLabel = T2_TYPE_VI[type] || type;
  const modelRef  = modelAnswer ? `\nĐáp án mẫu tham khảo: "${modelAnswer}"` : '';

  const prompt = `Dạng bài: ${typeLabel}
Câu hỏi/Yêu cầu: "${questionText}"${modelRef}
Câu trả lời của học sinh: "${userAnswer}"

Đánh giá theo tiêu chí:
- isCorrect: true nếu câu học sinh đúng nghĩa và ngữ pháp chấp nhận được (không cần giống hệt mẫu)
- score: 0-100 (100=hoàn toàn đúng, 75-99=đúng nhưng có lỗi nhỏ hoặc cách diễn đạt khác, 50-74=gần đúng thiếu một phần, 0-49=sai nghĩa hoặc sai ngữ pháp nghiêm trọng)
- feedbackVi: nhận xét ngắn bằng tiếng Việt, 1-2 câu, chỉ rõ điểm tốt HOẶC lỗi cụ thể và cách sửa

Trả về JSON: {"isCorrect": boolean, "score": number, "feedbackVi": string}`;

  let rawText;
  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: T2_GRADE_SYSTEM,
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 300
      }
    });
    rawText = result.text;
  } catch (err) {
    console.error('[Gemini T2Grade] API error:', err.status, err.message || err);
    const msg = (err.message || '').toLowerCase();
    const isOverload =
      err.status === 503 || err.status === 429 ||
      msg.includes('overloaded') || msg.includes('resource_exhausted') ||
      msg.includes('quota') || msg.includes('unavailable') || msg.includes('too many');
    if (isOverload) {
      const oe = new Error('AI đang quá tải, vui lòng thử lại.');
      oe.isOverloaded = true;
      throw oe;
    }
    throw err;
  }

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('no JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    // Normalise types in case Gemini returns strings
    parsed.isCorrect = parsed.isCorrect === true || parsed.isCorrect === 'true';
    parsed.score     = Math.min(100, Math.max(0, Number(parsed.score) || 0));
    return parsed;
  } catch (parseErr) {
    if (_attempt < 1) {
      console.error('[Gemini T2Grade] JSON parse failed, retrying…', parseErr.message);
      return gradeT2Question({ type, questionText, modelAnswer, userAnswer }, _attempt + 1);
    }
    throw new Error('Gemini không trả về JSON hợp lệ sau 2 lần thử');
  }
}

module.exports = { checkEssay, checkSpeaking, gradeT2Question };
