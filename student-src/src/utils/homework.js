// "📚 Bài tập cần làm" helpers — port of frontend/js/dashboard-homework.js
// (GET /api/assignments/mine → backend services/assignmentService.js).
// Keep the rules / links in step with that file while both pages exist.

export const HW_STATUS = {
  not_started: { label: 'Chưa làm', cls: 'hw-pill--todo' },
  in_progress: { label: 'Đang làm', cls: 'hw-pill--progress' },
  completed: { label: 'Đã hoàn thành', cls: 'hw-pill--done' },
  overdue: { label: 'Quá hạn', cls: 'hw-pill--overdue' },
};

// Mirrors backend/services/resourceCompletionService.js (scoreGate ≥70%,
// Reading/Listening ≥50%, wordCountGate, VIEW_TYPES …).
const QUIZ_TYPES = new Set(['grammar', 'vocabulary_lesson', 'advanced_sentences']);
const PRACTICE_TYPES = new Set(['reading_test', 'listening_test', 'reading_practice', 'listening_practice', 'dictation']);
const COURSE_TYPES = new Set(['task1_lesson', 'task2_course_lesson', 'speaking_course_lesson', 'mindset_course_lesson']);
export const PRACTICE_PASS = 50;
export const GAPFILL_MIN_CORRECT = 18;
export const MIN_WORDS_T1 = 150;
export const MIN_WORDS_T2 = 250;
const WORD_MIN = { task1_practice: MIN_WORDS_T1, task2_practice: MIN_WORDS_T2 };
const VIEW_TYPES = new Set(['shadowing', 'listening_tip', 'reading_tip', 'writing_tip', 'speaking_tip', 'vocab_unit']);

const quiz = (label, title) => ({ cls: 'hw-res-tag--quiz', label, title });
const writing = (label, title) => ({ cls: 'hw-res-tag--writing', label, title });

// "How this one counts as done" tag next to an internal resource (null = none)
export function ruleTag(type) {
  if (QUIZ_TYPES.has(type)) return quiz('≥70%', 'Cần đạt từ 70% số điểm trở lên mới tính hoàn thành');
  if (PRACTICE_TYPES.has(type)) return quiz(`≥${PRACTICE_PASS}%`, `Cần đạt từ ${PRACTICE_PASS}% số điểm trở lên mới tính hoàn thành`);
  if (type === 'listening_gapfill') return quiz(`≥${GAPFILL_MIN_CORRECT} câu đúng`, `Cần điền đúng ít nhất ${GAPFILL_MIN_CORRECT} chỗ trống (bài ít hơn ${GAPFILL_MIN_CORRECT} chỗ thì phải đúng hết) mới tính hoàn thành`);
  if (type === 'task2') return writing(`Nộp bài ≥${MIN_WORDS_T2} từ`, `Phải viết xong bài luận và nộp đủ ít nhất ${MIN_WORDS_T2} từ mới tính hoàn thành (làm xong phần luyện câu thôi thì chưa tính)`);
  if (type === 'writing_exam') return writing(`≥${MIN_WORDS_T1}/${MIN_WORDS_T2} từ`, `Cần nộp đủ Task 1 ≥${MIN_WORDS_T1} từ và Task 2 ≥${MIN_WORDS_T2} từ`);
  if (VIEW_TYPES.has(type)) return { cls: '', label: 'Mở xem là xong', title: 'Chỉ cần bấm vào mở xem là tự động tính hoàn thành' };
  if (type === 'task2_template') return quiz('≥70%', 'Cần học xong cả 5 bước của lộ trình và thuộc từ 70% số câu (bước ④ Ghép cả bài hoặc Thi thử)');
  if (type === 'writing_practice' || type === 'task1_skill') return quiz('≥10 câu · ≥70%', 'Làm ít nhất 10 câu của chủ đề, đúng từ 70% trở lên');
  if (type === 'task1_grammar' || type === 'task1_grammar_set2') {
    return quiz('Làm hết · ≥70%', `Làm hết các câu ${type === 'task1_grammar' ? 'Bộ 1 + Bộ 2' : 'Bộ 2'} của kỹ năng này (link mở đúng các câu đó), đúng từ 70% trở lên`);
  }
  if (type === 'speaking_topic') return quiz('Trả lời hết các câu', 'Bấm Bắt đầu để trả lời lần lượt TẤT CẢ câu hỏi của chủ đề trong một lượt (Part 2 có kèm luôn các câu Part 3). Bỏ trống câu nào thì chưa tính hoàn thành.');
  if (type === 'speaking_part2') return quiz('≥70% câu chuyện', 'Thuộc từ 70% câu chuyện trở lên: mỗi câu của 7 khung nói cần nhại (shadowing) đạt và dịch đúng');
  if (type === 'mindset_course_lesson') return quiz('Làm hết · ≥70% · R/L ≥70%', 'Làm hết mọi bài trong buổi học; các bài trắc nghiệm / điền từ đạt trung bình từ 70% trở lên VÀ mỗi bài Reading/Listening của buổi đạt từ 70% trở lên (lấy lần làm tốt nhất — làm lại để nâng điểm)');
  if (COURSE_TYPES.has(type)) return quiz('Làm hết · ≥70%', 'Làm hết mọi bài trong buổi học; các bài trắc nghiệm / điền từ phải đạt trung bình từ 70% trở lên (làm lại để nâng điểm)');
  if (WORD_MIN[type]) return writing(`≥${WORD_MIN[type]} từ`, `Cần nộp đủ ít nhất ${WORD_MIN[type]} từ mới tính hoàn thành`);
  return null;
}

// Teacher gave only some passages / sections of a full test
const partsQs = (r) => (Array.isArray(r.parts) && r.parts.length ? `&parts=${r.parts.join(',')}` : '');

export const EXAM_MODE_LABEL = { practice: '✏️ Luyện tập', simulation: '🎯 Thi thật' };
const examQs = (r) => (EXAM_MODE_LABEL[r.examMode] ? `&exam=${r.examMode}&lock=1` : '');

// Required Luyện tập / Thi thật chip: { label, title, cls } or null
export function examChip(r) {
  const label = EXAM_MODE_LABEL[r.examMode];
  if (!label) return null;
  const name = r.examMode === 'simulation' ? 'Test Simulation (thi thật)' : 'Luyện tập';
  const t = r.examMode === 'simulation' && r.simTime && r.simTime.seconds;
  const min = t ? Math.max(1, Math.round(t / 60)) : 0;
  const time = min ? ` · ⏱ ${r.simTime.approx ? '≈ ' : ''}${min} phút` : '';
  const why = !min ? '' : String(r.resourceType).startsWith('reading') ? ' — 20 phút cho mỗi passage, hết giờ tự nộp'
    : ' — nghe audio 1 lần (không dừng, không tua) + 30 giây kiểm tra, hết giờ tự nộp';
  return {
    label: label + time,
    cls: `hw-res-mode hw-res-mode--${r.examMode}`,
    title: `Giáo viên giao ở chế độ ${name} — chỉ bài làm ở chế độ này được tính${why}`,
  };
}

export function partsChip(r) {
  if (!Array.isArray(r.parts) || !r.parts.length) return null;
  const unit = r.resourceType === 'listening_test' ? 'Section' : 'Passage';
  return { label: `${unit} ${r.parts.join(', ')}`, title: `Giáo viên giao ${unit} ${r.parts.join(', ')} — chỉ cần làm các phần này` };
}

function tipQs(code) {
  const [tip, cat] = String(code || '').split('||');
  return tip ? `&tip=${encodeURIComponent(tip)}${cat ? `&tcat=${encodeURIComponent(cat)}` : ''}` : '';
}

// internal resourceType → deep link on the static site (absolute: the app
// lives under /app/). null = nothing to open.
export function resourceHref(r) {
  const p = resourcePath(r);
  return p ? `/${p}` : null;
}

function resourcePath(r) {
  const id = r.resourceId;
  const code = r.resourceCode;
  const enc = encodeURIComponent;
  switch (r.resourceType) {
    case 'reading_test': return `reading.html?testId=${id}${partsQs(r)}${examQs(r)}`;
    case 'reading_practice': return `reading.html?passageId=${id}${examQs(r)}`;
    case 'listening_test': return `listening.html?testId=${id}${partsQs(r)}${examQs(r)}`;
    case 'listening_practice': return `listening.html?sectionId=${id}${examQs(r)}`;
    case 'listening_gapfill': return `listening.html?gapfillId=${id}`;
    case 'dictation': return `app/dictation?sectionId=${id}`;
    case 'writing_exam': return `writing.html?examId=${id}`;
    case 'task1_lesson': return code ? `writing-task1.html?lesson=${enc(code)}` : null;
    case 'task2_course_lesson': return code ? `writing-task2-course.html?lesson=${enc(code)}` : null;
    case 'speaking_course_lesson': return code ? `speaking-course.html?lesson=${enc(code)}` : null;
    case 'mindset_course_lesson': {
      const lv = /^M(\d)-/.exec(code || '');
      return lv ? `mindset-${lv[1]}.html?lesson=${enc(code)}` : null;
    }
    case 'task1_practice': return `writing.html?taskType=1&taskId=${id}`;
    case 'task2_practice': return `writing.html?taskType=2&taskId=${id}`;
    case 'task2': return code ? `task2-practice.html?week=${enc(code)}&topicId=${id}` : 'task2-practice.html';
    case 'advanced_sentences': return code ? `advanced-sentences.html?week=${enc(code)}&groupId=${id}` : 'advanced-sentences.html';
    case 'speaking': return `speaking.html?questionId=${id}`;
    case 'speaking_topic': return `speaking.html?topicSet=${id}`;
    case 'speaking_full_mock': return 'speaking.html?tab=fullmock';
    case 'grammar': return code ? `essential-grammar.html?lesson=${enc(code)}` : 'essential-grammar.html';
    case 'vocabulary_lesson': return `app/dashboard/lesson/${id}`;
    case 'mock_test': return 'mock-test.html';
    case 'shadowing': return code ? `app/shadowing?lesson=${enc(code)}` : 'app/shadowing';
    case 'listening_tip': return `listening.html?mode=tips${tipQs(code)}`;
    case 'reading_tip': return `reading.html?mode=tips${tipQs(code)}`;
    case 'writing_tip': return `writing.html?view=writing-tips${tipQs(code)}`;
    case 'speaking_tip': return `speaking.html?tab=speaking-tips${tipQs(code)}`;
    case 'vocab_unit': return code ? `app/dashboard/unit/${enc(code)}` : 'app/dashboard/topics';
    case 'task2_template': {
      const [type, level] = String(code || '').split('||');
      return type ? `task2-template.html?type=${enc(type)}&level=${enc(level || 'band7')}` : 'task2-template.html';
    }
    case 'writing_practice': return code ? `writing-practice.html?topic=${enc(code)}` : 'writing-practice.html';
    case 'task1_skill': return code ? `task1-practice.html?skill=${enc(code)}` : 'task1-practice.html';
    case 'task1_grammar': return `task1-practice.html?skill=${enc(code || 'all')}`;
    case 'task1_grammar_set2': return `task1-practice.html?skill=${enc(code || 'all')}&set=set2`;
    case 'speaking_part2': return code ? `speaking-part2.html?story=${enc(code)}` : 'speaking-part2.html';
    default: return null;
  }
}

// Mock-test skill page (shared/mock-test.js pageUrl)
const MOCK_PAGE = { listening: 'listening.html', reading: 'reading.html', writing: 'writing.html', speaking: 'speaking.html' };
export const mockPageUrl = (skill, mockId) => `/${MOCK_PAGE[skill] || 'listening.html'}?mock=${encodeURIComponent(mockId)}&skill=${skill}`;

// { text, cls } — ceiling, so 47h reads "Còn 2 ngày", never understated
export function countdown(deadline, now = Date.now()) {
  if (!deadline) return null;
  const ms = new Date(deadline) - now;
  if (ms <= 0) return { text: 'Đã quá hạn', cls: 'hw-due--over' };
  const hours = ms / 3600000;
  if (hours < 24) return { text: `Còn ${Math.ceil(hours)} giờ`, cls: 'hw-due--soon' };
  return { text: `Còn ${Math.ceil(hours / 24)} ngày`, cls: '' };
}

const pad = (n) => String(n).padStart(2, '0');
export function fmtDeadline(deadline) {
  if (!deadline) return 'Không có hạn';
  const d = new Date(deadline);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Vocab goals ("học N từ trong sổ") of assignments not finished yet — the
// in-book / in-practice progress bars (same shape as hwCollectVocabGoals).
export function collectVocabGoals(data) {
  const out = [];
  for (const a of data?.assignments || []) {
    if (a.status === 'completed') continue;
    for (const r of a.resources || []) {
      const v = r.vocabGoal;
      if (r.kind !== 'vocab_goal' || !v) continue;
      const target = v.target || v.wordCount || r.wordCount || 0;
      if (!target) continue;
      out.push({
        key: `${a._id}:${r.itemId}`,
        title: a.title || '',
        since: a.createdAt || null,
        target,
        needCorrect: v.needCorrect || Math.ceil(target * 0.7), // backend PASS_PERCENT 70
        requiredSlot: v.requiredSlot || r.bookSlot || null,
        bookId: v.bookId ? String(v.bookId) : null,
        completed: !!r.completed,
      });
    }
  }
  return out;
}

// Last /assignments/mine answer, painted at once on the next visit (marked
// "đang cập nhật"). Same key + login tag (djb2 of the auth header) as the
// static dashboard, so the two pages share it.
const CACHE_KEY = 'ews_hw_mine';
const CACHE_MAX_MS = 24 * 60 * 60 * 1000;
function cacheTag() {
  const s = `Bearer ${localStorage.getItem('token')}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h);
}
export function readHomeworkCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (c && c.tag === cacheTag() && Date.now() - c.at < CACHE_MAX_MS) return c.data;
  } catch { /* blocked / corrupt — just fetch */ }
  return null;
}
export function writeHomeworkCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ tag: cacheTag(), at: Date.now(), data })); } catch { /* quota */ }
}
