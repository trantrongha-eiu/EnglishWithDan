'use strict';
const { overview, steps, list, example, callout, lesson } = require('./builder');

const CATEGORY = 'Chiến thuật theo dạng bài';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'true-false-not-given', title: 'True / False / Not Given', icon: '✅', orderIndex: 1,
    summaryText: 'Phân biệt bẫy "gần giống" và bẫy Not Given qua quy trình 4 bước.',
    blocks: [
      overview('TRUE = thông tin trong bài đúng với statement.\nFALSE = bài nói ngược lại.\nNOT GIVEN = bài không đủ thông tin để kết luận.'),
      steps([
        { title: 'Bước 1', description: 'Gạch chân keyword trong statement.' },
        { title: 'Bước 2', description: 'Tìm vị trí thông tin trong passage bằng: tên riêng, số liệu, thuật ngữ, từ/cụm từ đặc biệt.' },
        { title: 'Bước 3', description: 'Đọc kỹ câu chứa thông tin + 1–2 câu xung quanh.' },
        { title: 'Bước 4', description: 'So sánh ý nghĩa, không so từng từ.' },
      ]),
      callout('Bẫy thường gặp', 'Statement có từ giống passage ≠ TRUE.'),
      example([
        {
          label: 'Bẫy "most" vs "all"',
          passage: 'Most students prefer studying in the morning.',
          statement: 'All students prefer studying in the morning.',
          note: '→ FALSE, vì "most" ≠ "all".',
        },
        {
          label: 'Bẫy Not Given',
          passage: 'The research was conducted among university students.',
          statement: 'The research was conducted among university students in London.',
          note: '→ NOT GIVEN nếu bài không nói London. Không được tự suy luận.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'yes-no-not-given', title: 'Yes / No / Not Given', icon: '💬', orderIndex: 2,
    summaryText: 'Hỏi quan điểm của tác giả, không phải thông tin có được nhắc tới hay không.',
    blocks: [
      overview('Logic tương tự TFNG nhưng hỏi về quan điểm/claim của tác giả.'),
      list('Định nghĩa', [
        'YES — Tác giả đồng ý với statement.',
        'NO — Tác giả thể hiện quan điểm trái ngược.',
        'NOT GIVEN — Không xác định được tác giả có đồng ý hay không.',
      ]),
      callout('Mẹo quan trọng', 'Học sinh phải hỏi: "Is this what the writer thinks?" chứ không phải "Is this information mentioned?" — đây là điểm khác biệt quan trọng giữa YES/NO/NG và TRUE/FALSE/NG.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'matching-headings', title: 'Matching Headings', icon: '🧩', orderIndex: 3,
    summaryText: 'Đọc topic sentence + câu cuối, tóm tắt cả đoạn thay vì soi từng từ khoá.',
    blocks: [
      overview('Đây là dạng nhiều học sinh Band 6 mất điểm.'),
      callout('Sai lầm phổ biến', 'Đọc heading → tìm keyword giống hệt trong paragraph. Không nên.'),
      steps([
        { title: '1. Topic sentence', description: 'Thường là câu đầu.' },
        { title: '2. Câu cuối', description: 'Thường cho biết kết luận/ý chính.' },
        { title: '3. Các từ được lặp lại', description: 'Ghi nhận các từ khoá xuất hiện nhiều lần trong đoạn.' },
      ]),
      callout('Tự hỏi', 'Nếu phải tóm tắt paragraph này bằng 5–7 từ, tôi sẽ nói gì? Đó chính là heading.'),
      list('Không bị đánh lừa bởi', [
        'Một ví dụ rất nổi bật',
        'Một con số',
        'Một người',
        'Một địa điểm',
        'Một chi tiết nằm giữa paragraph',
      ]),
      callout('', 'Heading thường mô tả whole paragraph, không phải một chi tiết.'),
      callout('Advanced tip', 'Nếu có hai heading đều có vẻ đúng → chọn heading có scope rộng hơn nhưng vẫn chính xác.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'matching-information', title: 'Matching Information', icon: '🔎', orderIndex: 4,
    summaryText: 'Dạng scan, không phải đọc hiểu — nhưng phải xác nhận đúng nội dung trước khi chọn.',
    blocks: [
      overview('Ví dụ: "Which paragraph contains information about..."'),
      callout('Chiến thuật', 'Đây là dạng scan, không phải đọc hiểu toàn bài.'),
      list('Tìm', ['tên riêng', 'địa điểm', 'thời gian', 'thuật ngữ', 'ý tưởng đặc biệt']),
      callout('Cẩn thận', 'Một paragraph có thể chứa rất nhiều thông tin. Không chọn chỉ vì thấy keyword. Phải kiểm tra: "Paragraph này có thực sự chứa information được hỏi không?"'),
      callout('Advanced', 'Một paragraph có thể được dùng nhiều lần nếu đề không nói mỗi paragraph chỉ dùng một lần.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'matching-features', title: 'Matching Features', icon: '👤', orderIndex: 5,
    summaryText: 'Lập mental map theo từng tên riêng trước khi scan, thay vì đọc tuyến tính.',
    blocks: [
      overview('Ví dụ:\n"Which person..."\nA. John\nB. Mary\nC. Peter'),
      callout('Chiến thuật', 'Đừng đọc passage từ đầu đến cuối. Tạo mental map: John → ý tưởng gì? Mary → ý tưởng gì? Peter → ý tưởng gì? Sau đó scan theo tên.'),
      callout('Bẫy', 'Một người có thể xuất hiện nhiều lần và nói nhiều thứ khác nhau. → Phải đọc câu chứa thông tin + context.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'sentence-summary-note-completion', title: 'Sentence / Summary / Note Completion', icon: '✏️', orderIndex: 6,
    summaryText: 'Dạng dễ ăn điểm nhất nếu kiểm soát tốt word limit và grammar.',
    blocks: [
      overview('Đây là dạng rất có thể ăn điểm nếu biết kiểm soát grammar.'),
      steps([
        { title: 'Bước 1', description: 'Đọc câu trước khi nhìn passage. Ví dụ: "The main reason for the decline was ______." → Ta dự đoán: cần noun / noun phrase.' },
        { title: 'Bước 2', description: 'Kiểm tra giới hạn từ, ví dụ "NO MORE THAN TWO WORDS". Không được viết 3 từ.' },
        { title: 'Bước 3', description: 'Tìm location.' },
        { title: 'Bước 4', description: 'Copy đáp án chính xác từ passage.' },
        { title: 'Bước 5', description: 'Kiểm tra grammar.' },
      ]),
      example([
        {
          label: 'Giữ nguyên dạng từ trong passage',
          passage: '"...significant differences..."',
          statement: 'The researchers discovered ______.',
          note: 'Đáp án phải giữ đúng "significant differences". Không tự đổi thành "significant difference" nếu làm sai ngữ pháp/nghĩa.',
        },
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'multiple-choice', title: 'Multiple Choice', icon: '🔘', orderIndex: 7,
    summaryText: 'Từ eliminate theo keyword (Band 6) đến nhận diện paraphrase và kiểm tra "được ủng hộ bởi bài" (Band 8).',
    blocks: [
      list('Band 6', ['Dùng: Question → keyword → location → eliminate.']),
      example([
        {
          label: 'Band 7 — Paraphrase recognition',
          passage: 'Passage: "lower expenditure"',
          statement: 'Option: "reduce costs"',
          note: 'Học sinh Band 7 phải nhận ra hai cách diễn đạt này cùng nghĩa.',
        },
      ]),
      list('Band 8', [
        'Không chỉ hỏi "Which option is mentioned?" mà hỏi "Which option is supported by the passage?"',
        'Đặc biệt với câu hỏi "Which of the following is NOT mentioned?" — phải kiểm tra từng option.',
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'short-answer-questions', title: 'Short Answer Questions', icon: '📝', orderIndex: 8,
    summaryText: 'Scan + copy, nhưng phải để ý số ít/số nhiều, spelling và word limit.',
    blocks: [
      overview('Đây thường là dạng scan + copy. Tìm keyword → xác định location → lấy câu trả lời.'),
      list('Nhưng phải chú ý', ['số ít/số nhiều', 'spelling', 'word limit', 'tên riêng', 'số liệu']),
    ],
  }),
];
