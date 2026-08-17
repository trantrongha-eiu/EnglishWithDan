'use strict';
// Reuses the exact same block-builder helpers as Reading Tips — the
// {type,data} block shape is identical (ReadingTip/ListeningTip share the
// same schema enum), so there's no reason to duplicate the builder file.
const { overview, steps, list, example, callout, lesson } = require('../readingTipsData/builder');

const CATEGORY = 'Chiến thuật theo dạng bài';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'form-note-table-completion', title: 'Form / Note / Table Completion', icon: '📋', orderIndex: 1,
    summaryText: 'Dạng dễ ăn điểm nhất — nhưng đáp án có thể bị sửa lại ngay sau khi vừa nghe.',
    blocks: [
      overview('Đây thường là dạng dễ lấy điểm.'),
      list('Trước khi nghe — Dự đoán', ['noun?', 'verb?', 'adjective?', 'number?', 'name?', 'place?']),
      example([
        { label: 'Ví dụ dự đoán loại từ', statement: 'The course starts on ______.', note: '→ dự đoán date/day.' },
      ]),
      callout('Khi nghe', 'Đừng chỉ chờ đúng keyword.'),
      example([
        {
          label: 'Golden rule — đáp án có thể bị sửa lại',
          passage: '"The course starts on Monday." ... "Actually, I should mention that it\'s been moved to Tuesday."',
          note: '→ đáp án: Tuesday. Answer may be changed/corrected after it is first mentioned.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'multiple-choice', title: 'Multiple Choice', icon: '🔘', orderIndex: 2,
    summaryText: 'Xác định trước sự khác biệt giữa các option, nghe theo meaning chứ không phải từng chữ.',
    blocks: [
      callout('', 'Đừng đọc tất cả option quá sâu.'),
      list('Trước khi nghe', ['Question → identify differences between A/B/C.']),
      example([
        {
          label: 'Ví dụ options',
          statement: 'A. expensive\nB. inconvenient\nC. unreliable',
          note: 'Bạn biết mình đang nghe về: reason for dissatisfaction.',
        },
      ]),
      callout('Khi nghe', 'Tập trung vào meaning, không phải exact word.'),
      example([
        {
          label: 'Bẫy cực phổ biến',
          passage: 'At first, I thought it was too expensive, but actually the main problem was that it was unreliable.',
          note: '→ unreliable.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'matching', title: 'Matching', icon: '🧩', orderIndex: 3,
    summaryText: 'Lập mental map theo person/topic, nghe cả đoạn thay vì cố nhớ hết.',
    blocks: [
      overview('Ví dụ: "Which activity is suitable for each person?"'),
      callout('Chiến thuật', 'Tạo bảng mental: A → ? B → ? C → ? Nghe theo person/topic, không cố nhớ cả đoạn.'),
      callout('Bẫy', 'Một option có thể được nhắc tới nhưng chỉ để loại bỏ.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'map-plan-diagram', title: 'Map / Plan / Diagram', icon: '🗺️', orderIndex: 4,
    summaryText: 'Xác định điểm bắt đầu và theo sát từng chỉ dẫn phương hướng, không chỉ nghe keyword.',
    blocks: [
      list('Bước 1 — Xác định', ['entrance', 'north', 'left/right', 'above/below', 'next to', 'opposite', 'between']),
      steps([{ title: 'Bước 2', description: 'Xác định starting point.' }]),
      example([
        { label: 'Ví dụ', passage: 'From the entrance, walk straight ahead...', note: '→ bắt đầu từ entrance.' },
      ]),
      list('Từ khóa quan trọng', ['turn left/right', 'go straight', 'opposite', 'next to', 'behind', 'in front of', 'at the end of', 'on the corner']),
      callout('Sai lầm', 'Không theo direction mà chỉ nghe keyword.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'sentence-completion', title: 'Sentence Completion', icon: '✏️', orderIndex: 5,
    summaryText: 'Tương tự Reading, nhưng Listening đòi hỏi thêm spelling, số ít/số nhiều và số liệu chính xác.',
    blocks: [
      overview('Tương tự Reading nhưng Listening có thêm:'),
      example([
        { label: 'Spelling', statement: 'accommodation', note: 'không phải: acommodation' },
        { label: 'Singular / plural', statement: 'student', note: 'vs students' },
        { label: 'Number', statement: '15', note: 'vs 50' },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'multiple-answers', title: 'Multiple Answers', icon: '☑️', orderIndex: 6,
    summaryText: 'Đọc hết toàn bộ options và xác định hai nhóm cần tìm trước khi nghe.',
    blocks: [
      overview('Ví dụ: "Choose TWO answers."'),
      steps([
        { title: 'Trước khi nghe', description: 'Đọc toàn bộ options, underline differences, xác định TWO categories cần tìm.' },
      ]),
      callout('', 'Không chọn ngay option đầu tiên nghe thấy.'),
    ],
  }),
];
