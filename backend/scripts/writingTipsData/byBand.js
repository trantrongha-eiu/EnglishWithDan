'use strict';
const { overview, steps, list, example, summary, lesson } = require('./builder');

const CATEGORY = 'Chiến thuật theo band điểm';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'band-6', title: 'Band 6.0', icon: '6️⃣', orderIndex: 21,
    summaryText: 'Không lạc đề, viết đủ bài, ưu tiên rõ ràng hơn vocabulary "khủng".',
    blocks: [
      overview('Mục tiêu: Không lạc đề + viết đủ bài + phát triển được idea.'),
      steps([
        { title: '0–5 phút — Planning', description: 'Xác định dạng, chọn position, chọn 2 ideas, ghi keywords.' },
        { title: '5–35 phút — Writing', description: 'Không cố dùng vocabulary quá "khủng". Ưu tiên: clear → logical → accurate.' },
        { title: '35–40 phút — Check', description: 'Ưu tiên sửa: subject–verb agreement, tense, plural/singular, articles, spelling, sentence fragments.' },
      ]),
      summary('Band 6 mantra: Simple but clear.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'band-7', title: 'Band 7.0', icon: '7️⃣', orderIndex: 22,
    summaryText: 'Đừng cho thêm ideas — phát triển ideas sẵn có sâu hơn với topic sentence + explanation + example + result.',
    blocks: [
      overview('Mục tiêu: Clear position + logical development + cohesive argument.'),
      example([
        {
          label: '0–5 phút — Brainstorm IDEA → WHY → RESULT/EXAMPLE',
          lines: [
            { tag: 'Idea', text: 'Online learning is flexible' },
            { tag: '↓', text: 'students can study at convenient times' },
            { tag: '↓', text: 'particularly useful for working adults' },
          ],
        },
      ]),
      steps([
        { title: '5–33 phút — Viết', description: 'Focus vào: topic sentence, explanation, example, result, logical linking.' },
        { title: '33–40 phút — Check', description: 'Grammar + Vocabulary + Cohesion. Đặc biệt: Có đoạn nào đang lặp idea không? Có câu nào dài nhưng không rõ nghĩa không?' },
      ]),
      summary("Band 7 mantra: Don't give more ideas. Develop better ideas."),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'band-8-plus', title: 'Band 8.0+', icon: '8️⃣', orderIndex: 23,
    summaryText: 'Ít thời gian cho vocabulary brainstorming hơn — tập trung precision, logic và nuance.',
    blocks: [
      overview('Band 8 không nên dành quá nhiều thời gian cho vocabulary brainstorming.'),
      steps([
        { title: '0–5 phút', description: 'Xác định: Position → Argument → Counterargument/qualification → Evidence.' },
        { title: '5–32 phút', description: 'Tập trung vào: precision, logical progression, nuanced argument, flexible vocabulary, complex but controlled grammar.' },
      ]),
      list('32–40 phút — Check ở level cao hơn', [
        '1. Logic — Does every paragraph prove my position?',
        '2. Cohesion — Are ideas connected naturally?',
        '3. Precision — Is this word exactly what I mean?',
        '4. Grammar — Are complex sentences actually accurate?',
        '5. Repetition — Am I repeating the same words/structures?',
      ]),
      summary('Band 8 mantra: Precision > complexity.'),
    ],
  }),
];
