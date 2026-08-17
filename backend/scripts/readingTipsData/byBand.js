'use strict';
const { overview, list, table, callout, example, lesson } = require('./builder');

const CATEGORY = 'Chiến thuật theo band điểm';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'band-6', title: 'Band 6.0', icon: '6️⃣', orderIndex: 11,
    summaryText: 'Tối đa hoá số câu chắc chắn, ưu tiên dạng dễ ăn điểm, tránh sa lầy ở câu khó.',
    blocks: [
      overview('Mục tiêu không phải "hiểu hết passage". Mục tiêu là: tối đa hóa số câu chắc chắn.'),
      list('Ưu tiên', [
        'Completion',
        'Short answer',
        'TFNG/YNNG',
        'Matching information',
        'Multiple choice',
        'Matching headings',
      ]),
      list('Chiến thuật', [
        'Scan keyword.',
        'Không dịch từng câu.',
        'Không dành quá nhiều thời gian cho một câu.',
        'Câu khó → đánh dấu → đi tiếp.',
        'Ưu tiên câu có location rõ.',
      ]),
      table('Time management', ['Passage', 'Thời gian gợi ý'], [
        ['Passage 1', '~15–17 phút'],
        ['Passage 2', '~20 phút'],
        ['Passage 3', '~23–25 phút'],
      ]),
      callout('', 'Band 6 cần đặc biệt tránh: 10 phút chết ở một câu khó.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'band-7', title: 'Band 7.0', icon: '7️⃣', orderIndex: 12,
    summaryText: 'Nhận diện paraphrase, phân biệt fact với inference, và xử lý distractor.',
    blocks: [
      overview("Ở Band 7, vấn đề không còn đơn giản là vocabulary. Học sinh phải nâng khả năng:"),
      example([
        {
          label: '1. Paraphrase recognition',
          passage: 'Passage: "The number of elderly people increased significantly."',
          statement: 'Question: "There was a substantial rise in the proportion of older adults."',
          note: '→ nhận ra cùng meaning.',
        },
      ]),
      list('2. Distinguish fact vs inference', ['Không tự suy luận quá mức.']),
      list('3. Xử lý distractors', [
        'Một đáp án có thể đúng một phần.',
        'Có keyword giống passage.',
        'Nhưng không trả lời chính xác câu hỏi.',
      ]),
      list('4. Tăng tốc', [
        'Mục tiêu: không đọc toàn bài theo kiểu linear reading.',
        'Đọc có mục đích.',
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'band-8-plus', title: 'Band 8.0+', icon: '8️⃣', orderIndex: 13,
    summaryText: 'Selective attention, xử lý ambiguity, conceptual paraphrase và quản lý thời gian thực tế.',
    blocks: [
      overview('Band 8 không đơn giản là "làm nhiều câu hơn". Học sinh cần:'),
      list('1. Đọc nhanh nhưng có selective attention', [
        'Biết phần nào cần đọc kỹ.',
        'Phần nào chỉ cần scan.',
      ]),
      list('2. Xử lý ambiguity', [
        "Khi hai đáp án đều có vẻ đúng → phân tích scope + precision + writer's meaning.",
      ]),
      example([
        {
          label: '3. Không phụ thuộc keyword — conceptual paraphrase',
          passage: '"technological advances"',
          statement: '"developments in modern technology"',
          note: 'Band 8 phải nhận ra conceptual paraphrase — nhưng đáp án cũng có thể xuất hiện hoàn toàn khác về mặt từ vựng.',
        },
      ]),
      table('4. Kiểm soát thời gian — mục tiêu thực tế', ['Passage', 'Thời gian gợi ý'], [
        ['Passage 1', '15 phút'],
        ['Passage 2', '18–20 phút'],
        ['Passage 3', '25–27 phút'],
      ]),
      callout('', 'Dành nhiều thời gian hơn cho passage 3 vì độ khó thường cao hơn.'),
    ],
  }),
];
