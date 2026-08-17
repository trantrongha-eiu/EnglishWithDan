'use strict';
const { list, steps, table, callout, summary, lesson } = require('./builder');

const CATEGORY = 'Ôn luyện & Checklist';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'emergency-kit', title: 'Emergency Kit – 20 cụm cứu bài', icon: '🧰', orderIndex: 61,
    summaryText: '20 cụm câu giờ, nêu ý kiến, thêm ý, giải thích, ví dụ, đối lập, qualification, kết luận.',
    blocks: [
      list('Khi cần suy nghĩ', ['Well, let me think...', "That's an interesting question.", "I'd say...", 'I suppose...']),
      list('Nêu ý kiến', ['Personally, I think...', 'From my perspective...', "I'd argue that..."]),
      list('Thêm ý', ['Another thing is...', 'On top of that...', "What's more,..."]),
      list('Giải thích', ['The main reason is that...', 'This is largely because...']),
      list('Ví dụ', ['For example,...', 'A good example would be...']),
      list('Đối lập', ['That said,...', 'Having said that,...', 'On the other hand,...']),
      list('Qualification', ['To some extent,...', 'It depends on...']),
      list('Kết luận', ['So, overall,...', 'On balance,...']),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: '4-week-study-plan', title: 'Lộ trình ôn thi 4 tuần', icon: '📅', orderIndex: 62,
    summaryText: 'Tuần 1: build language. Tuần 2: build answers. Tuần 3: build fluency. Tuần 4: mock test.',
    blocks: [
      steps([
        {
          title: '🟢 Tuần 1 — Build the language',
          description: 'Mỗi ngày: 15 phút vocabulary (học collocations theo topic) + 15 phút Part 1 (5–8 câu hỏi) + 15 phút pronunciation (shadowing) + 10 phút recording (ghi âm 2–3 câu trả lời).\nMục tiêu: không còn mất quá nhiều thời gian dịch trong đầu.',
        },
        {
          title: '🔵 Tuần 2 — Build the answers',
          description: 'Mỗi ngày: 5 Part 1 questions + 1 Part 2 + 3 Part 3 questions. Tập: Answer → Develop.\nRecording checklist — sau khi nghe lại, đánh dấu: Pause quá lâu? Lặp từ? Sai tense? Sai pronunciation? Câu quá ngắn? Có phát triển idea không?',
        },
        {
          title: '🟠 Tuần 3 — Build fluency',
          description: 'Tập timed speaking. Part 1: không chuẩn bị. Part 2: 1 minute preparation → 2 minutes speaking. Part 3: không viết trước câu trả lời.\nMục tiêu: Think → Speak → Continue, thay vì Think → Translate → Grammar check → Speak.',
        },
        {
          title: '🔴 Tuần 4 — Mock test',
          description: '3–4 mock tests/tuần. Mỗi mock: Part 1 → Part 2 → Part 3, không dừng recording giữa chừng.',
        },
      ]),
      table('Sau mỗi mock, đánh giá theo 4 tiêu chí', ['Tiêu chí', 'Câu hỏi tự kiểm tra'], [
        ['Fluency', 'Tôi có pause dài không?'],
        ['Vocabulary', 'Tôi có lặp từ không?'],
        ['Grammar', 'Tôi có dùng nhiều cấu trúc không?'],
        ['Pronunciation', 'Người khác có dễ hiểu không?'],
      ]),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'final-checklist-band-chart', title: 'Checklist 5 phút & Bảng chốt Band 6/7/8', icon: '✅', orderIndex: 63,
    summaryText: 'Không học thêm gì mới — chỉ nhớ công thức từng phần, cách xử lý khi bí từ/ý/sai.',
    blocks: [
      list('Checklist 5 phút trước khi thi — không học thêm vocabulary nữa, chỉ nhớ', [
        'PART 1: Answer → Why/Detail',
        'PART 2: Story → Details → Feeling → Reflection',
        'PART 3: Position → Explain → Example → Qualification',
        'Khi bí từ: PARAPHRASE',
        'Khi bí idea: WHY? → EXAMPLE? → RESULT?',
        'Khi sai: CORRECT → CONTINUE',
        "Khi cần suy nghĩ: Well... / I'd say... / It depends...",
      ]),
      table('Bảng chốt: Band 6 vs Band 7 vs Band 8+', ['Tiêu chí', '🟢 Band 6', '🔵 Band 7', '🔴 Band 8+'], [
        ['Part 1', 'Answer + why', 'Develop naturally', 'Nuanced & spontaneous'],
        ['Part 2', 'Nói đủ 2 phút', 'Story + details + reflection', 'Controlled, natural storytelling'],
        ['Part 3', 'Opinion + reason', 'Explain + example', 'Analyse + qualify + implications'],
        ['Vocabulary', 'Appropriate', 'Flexible + collocations', 'Precise + nuanced'],
        ['Grammar', 'Some complex structures', 'Variety + good control', 'Wide range + high control'],
        ['Fluency', 'Có pause nhưng vẫn nói', 'Ít pause không tự nhiên', 'Rất tự nhiên'],
        ['Pronunciation', 'Dễ hiểu', 'Stress/intonation tốt', 'Rhythm + intonation tự nhiên'],
        ['Idea', '1 ý rõ', 'Phát triển ý', 'Nhìn nhiều chiều'],
        ['Mục tiêu', 'KEEP TALKING', 'DEVELOP', 'BE FLEXIBLE'],
      ]),
      callout('⭐ Công thức cuối cùng', 'BAND 6: DON\'T STOP.\nBAND 7: DON\'T JUST ANSWER — DEVELOP.\nBAND 8: DON\'T JUST DEVELOP — QUALIFY AND RESPOND NATURALLY.'),
      summary('IELTS Speaking không phải cuộc thi xem ai nói "từ khó" nhất. Band cao đến từ khả năng biến những ý tưởng bình thường thành câu trả lời rõ ràng, tự nhiên, chính xác và linh hoạt.'),
    ],
  }),
];
