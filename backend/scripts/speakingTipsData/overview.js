'use strict';
const { overview, list, table, callout, example, summary, lesson } = require('./builder');

const CATEGORY = 'Tổng quan & Tiêu chí chấm điểm';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'exam-structure-criteria', title: 'Cấu trúc bài thi & 4 tiêu chí chấm điểm', icon: '📋', orderIndex: 1,
    summaryText: 'Speaking kéo dài 11–14 phút, 3 phần, chấm theo 4 tiêu chí, mỗi tiêu chí 25%.',
    blocks: [
      overview('IELTS Speaking là một cuộc phỏng vấn trực tiếp, kéo dài khoảng 11–14 phút, gồm 3 phần.'),
      table('Cấu trúc 3 phần', ['Phần', 'Thời lượng', 'Nội dung', 'Mục tiêu chính'], [
        ['Part 1', '4–5 phút', 'Chủ đề quen thuộc', 'Trả lời tự nhiên, nhanh, rõ'],
        ['Part 2', '3–4 phút', 'Nói về một chủ đề trong 2 phút', 'Phát triển một bài nói liên tục'],
        ['Part 3', '4–5 phút', 'Thảo luận vấn đề xã hội/trừu tượng', 'Phân tích, giải thích, lập luận'],
      ]),
      list('4 tiêu chí chấm điểm — mỗi tiêu chí chiếm 25%', [
        '1. Fluency & Coherence — Nói có trôi chảy không? Ý có được kết nối không?',
        '2. Lexical Resource — Từ vựng có đủ rộng, chính xác và linh hoạt không?',
        '3. Grammatical Range & Accuracy — Có sử dụng đa dạng cấu trúc và kiểm soát lỗi tốt không?',
        '4. Pronunciation — Người nghe có dễ hiểu không? Stress, rhythm, intonation có tự nhiên không?',
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'general-band-strategy', title: 'Chiến lược tổng quát theo Band', icon: '🎯', orderIndex: 2,
    summaryText: 'Band 6: KEEP TALKING. Band 7: DEVELOP YOUR IDEAS. Band 8+: BE FLEXIBLE & PRECISE.',
    blocks: [
      callout('🟢 Band 6.0 — "KEEP TALKING"', 'Mục tiêu: Trả lời rõ + giải thích được + hạn chế pause dài. Học sinh Band 6 không cần cố nói "thông minh".'),
      list('Ưu tiên Band 6', [
        'Trả lời trực tiếp câu hỏi.',
        'Nói thêm lý do.',
        'Cho detail/example khi cần.',
        'Dùng cấu trúc quen thuộc nhưng chính xác.',
        'Nếu quên từ → paraphrase.',
        'Không im lặng quá lâu để tìm từ hoàn hảo.',
      ]),
      example([{ label: 'Công thức cơ bản', lines: [{ tag: 'Band 6', text: 'ANSWER → WHY → EXAMPLE/DETAIL' }] }]),
      callout('🔵 Band 7.0 — "DEVELOP YOUR IDEAS"', 'Mục tiêu: Không chỉ trả lời → phải phát triển câu trả lời.'),
      list('Học sinh Band 7 cần', [
        'Giải thích ý rõ hơn.',
        'Dùng collocations tự nhiên.',
        'Linh hoạt cấu trúc câu.',
        'Biết so sánh/đối lập.',
        'Biết qualify ý kiến.',
        'Ít pause không cần thiết.',
        'Phát triển câu trả lời mà không lan man.',
      ]),
      example([{ label: 'Công thức', lines: [{ tag: 'Band 7', text: 'ANSWER → EXPLAIN → EXAMPLE → RESULT' }], note: 'Không nhất thiết phải dùng đủ 4 bước trong mọi câu.' }]),
      callout('🔴 Band 8.0+ — "BE FLEXIBLE & PRECISE"', 'Mục tiêu: Natural + Flexible + Precise + Spontaneous. Band 8 KHÔNG phải là "nói thật dài + dùng thật nhiều từ khó".'),
      list('Band 8 là', [
        'Ý tưởng phát triển tự nhiên.',
        'Vocabulary chính xác.',
        'Dùng collocations tốt.',
        'Biết nuance.',
        'Biết qualify.',
        'Biết nhìn vấn đề từ nhiều góc độ.',
        'Grammar đa dạng nhưng vẫn tự nhiên.',
        'Pronunciation rõ và có kiểm soát.',
        'Không nghe như đang đọc thuộc bài.',
      ]),
      example([{ label: 'Công thức tư duy', lines: [{ tag: 'Band 8+', text: 'POSITION → DEVELOPMENT → QUALIFICATION → IMPLICATION' }] }]),
      summary('Band 6 = Answer + Why.\nBand 7 = Answer + Explain + Example + Result.\nBand 8 = Position + Development + Qualification + Implication.'),
    ],
  }),
];
