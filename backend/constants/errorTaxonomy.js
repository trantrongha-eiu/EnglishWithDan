'use strict';

// Fixed, backend-validated "why did I get this wrong" taxonomy for the
// mandatory post-test Review System (Reading/Listening). The student always
// picks a category + reason from this list — the errorCode is resolved
// SERVER-SIDE from that pair and never accepted directly from the client,
// so a request can't claim an arbitrary/fabricated code. This is deliberate:
// the whole point of this data (see reviewService.js) is that the error
// REASON is the student's own self-assessment, not an AI guess — but the
// underlying CODE still needs to be a closed, stable set for the existing
// weaknessService.js/recommendationService.js to eventually bucket by.
//
// Shape: { [skill]: { [categoryLabel]: { [reasonLabel]: errorCode } } }
// Category/reason label strings are exactly what the frontend displays and
// sends back — they're the taxonomy's stable IDs, not just UI copy, so
// don't rename an existing label without treating it as a breaking change
// for any already-saved AttemptReview documents.

const reading = {
  'Vocabulary': {
    'Không hiểu từ vựng trong bài': 'VOCAB_UNKNOWN',
    'Không hiểu từ vựng trong câu hỏi': 'VOCAB_UNKNOWN',
    'Không nhận ra synonym/paraphrase': 'PARAPHRASE',
    'Nhầm nghĩa của từ trong ngữ cảnh': 'VOCAB_CONTEXT',
    'Không biết collocation': 'VOCAB_UNKNOWN',
  },
  'Question Understanding': {
    'Không hiểu yêu cầu câu hỏi': 'QUESTION_MISUNDERSTANDING',
    'Đọc sót keyword': 'KEYWORD_SEARCH',
    'Hiểu sai câu hỏi': 'QUESTION_MISUNDERSTANDING',
    'Không xác định được keyword': 'KEYWORD_SEARCH',
    'Không xác định được loại thông tin cần tìm': 'QUESTION_MISUNDERSTANDING',
  },
  'T/F/NG': {
    'Chưa hiểu bản chất True / False / Not Given': 'TFNG_CONCEPT',
    'Nhầm False với Not Given': 'TFNG_CONCEPT',
    'Nhầm True với Not Given': 'TFNG_CONCEPT',
    'Suy diễn ngoài thông tin bài đọc': 'TFNG_INFERENCE',
    'Không tìm được bằng chứng trực tiếp': 'TFNG_INFERENCE',
  },
  'Matching Headings': {
    'Không xác định được main idea': 'MAIN_IDEA',
    'Chọn heading dựa vào chi tiết nhỏ': 'MAIN_IDEA',
    'Không phân biệt heading gần nghĩa': 'MAIN_IDEA',
    'Không hiểu ý chính của paragraph': 'MAIN_IDEA',
  },
  'Matching Information': {
    'Không xác định được thông tin cần match': 'LOCATION',
    'Không nhận ra paraphrase': 'PARAPHRASE',
    'Match theo keyword thay vì meaning': 'KEYWORD_SEARCH',
    'Nhầm thông tin giữa các đoạn': 'LOCATION',
  },
  'Multiple Choice': {
    'Chọn đáp án vì có keyword giống bài': 'DISTRACTOR',
    'Không hiểu bản chất câu hỏi': 'QUESTION_MISUNDERSTANDING',
    'Không loại được distractor': 'DISTRACTOR',
    'Không phân biệt các đáp án gần nghĩa': 'PARAPHRASE',
    'Chọn đáp án dựa trên suy đoán': 'DISTRACTOR',
  },
  'Completion': {
    'Không xác định được từ cần điền': 'LOCATION',
    'Không kiểm tra word limit': 'WORD_LIMIT',
    'Sai chính tả': 'SPELLING',
    'Sai dạng từ': 'GRAMMAR',
    'Sai số ít/số nhiều': 'SINGULAR_PLURAL',
    'Điền từ đúng trong bài nhưng sai ngữ cảnh': 'VOCAB_CONTEXT',
  },
  'Search / Reading Strategy': {
    'Không định vị được đoạn chứa đáp án': 'LOCATION',
    'Tìm keyword quá máy móc': 'KEYWORD_SEARCH',
    'Không sử dụng paraphrase để scan': 'PARAPHRASE',
    'Đọc quá nhiều thông tin không cần thiết': 'TIME_MANAGEMENT',
    'Mất quá nhiều thời gian': 'TIME_MANAGEMENT',
  },
};

const listening = {
  'Vocabulary': {
    'Không hiểu từ vựng': 'VOCAB_UNKNOWN',
    'Không nhận ra synonym/paraphrase': 'PARAPHRASE',
    'Không nhận ra cách phát âm của từ đã biết': 'AUDIO_NOT_CAUGHT',
    'Không hiểu từ trong ngữ cảnh': 'VOCAB_UNKNOWN',
  },
  'Listening Comprehension': {
    'Không nghe được keyword': 'AUDIO_NOT_CAUGHT',
    'Không bắt được thông tin chính': 'AUDIO_NOT_CAUGHT',
    'Không theo kịp tốc độ nói': 'SPEED',
    'Mất tập trung': 'CONCENTRATION',
    'Bị mất mạch sau khi bỏ lỡ một câu': 'LOST_TRACK',
  },
  'Distractor': {
    'Chọn thông tin đầu tiên được nghe': 'DISTRACTOR',
    'Không nhận ra người nói sửa thông tin': 'CORRECTION_MISSED',
    'Không nhận ra thông tin bị phủ định': 'NEGATION_MISSED',
    'Bị distractor đánh lừa': 'DISTRACTOR',
  },
  'Spelling & Grammar': {
    'Nghe đúng nhưng viết sai chính tả': 'SPELLING',
    'Sai số ít/số nhiều': 'SINGULAR_PLURAL',
    'Sai dạng từ': 'SPELLING',
    'Sai word ending': 'SPELLING',
    'Viết vượt word limit': 'WORD_LIMIT',
  },
  'Prediction': {
    'Không dự đoán loại từ cần nghe': 'PREDICTION',
    'Không dự đoán nội dung trước khi nghe': 'PREDICTION',
    'Không đọc câu hỏi trước khi audio chạy': 'PREDICTION',
  },
  'Question Understanding': {
    'Không hiểu câu hỏi': 'QUESTION_MISUNDERSTANDING',
    'Không hiểu option': 'QUESTION_MISUNDERSTANDING',
    'Không xác định được thông tin cần nghe': 'QUESTION_MISUNDERSTANDING',
    'Không hiểu paraphrase trong câu hỏi': 'PARAPHRASE',
  },
};

const TAXONOMY = { reading, listening };

// attemptType ('reading'|'reading-practice'|'listening'|'listening-practice')
// -> which taxonomy table to use. Practice and full-mock attempts of the
// same skill share one taxonomy (the mistake categories don't depend on
// mock-vs-practice, only on Reading vs Listening).
function skillFor(attemptType) {
  return attemptType.startsWith('reading') ? 'reading' : 'listening';
}

function resolveErrorCode(skill, category, reason) {
  const code = TAXONOMY[skill]?.[category]?.[reason];
  return code || null;
}

module.exports = { TAXONOMY, skillFor, resolveErrorCode };
